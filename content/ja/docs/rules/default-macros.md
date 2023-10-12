---
exclude_search: true
title: デフォルトマクロ
weight: 2
---

デフォルトのFalcoルールセットは、ルールの記述を開始しやすくするいくつかのマクロを定義します。これらのマクロは、多くの一般的なシナリオのショートカットを提供し、ユーザー定義のルールセットで使用できます。Falcoは、ユーザーの環境に固有の設定を提供するためにユーザーがオーバーライドする必要があるマクロも提供します。提供されたマクロは、ローカルルールファイルに追加することもできます。

### 書き込み用に開かれたファイル

```yaml
- macro: open_write
  condition: (evt.type=open or evt.type=openat) and evt.is_open_write=true and fd.typechar='f' and fd.num>=0
```

### 読み取り用に開かれたファイル

```yaml
- macro: open_read
  condition: (evt.type=open or evt.type=openat) and evt.is_open_read=true and fd.typechar='f' and fd.num>=0
```

### 決してTrueでない

```yaml
- macro: never_true
  condition: (evt.num=0)
```

### 常にTrue

```yaml
- macro: always_true
  condition: (evt.num=>0)
```

### Proc Nameがセット

```yaml
- macro: proc_name_exists
  condition: (proc.name!="<NA>")
```

### ファイルシステムオブジェクトが名前変更

```yaml
- macro: rename
  condition: evt.type in (rename, renameat)
```

### 新規ディレクトリーが作成された

```yaml
- macro: mkdir
  condition: evt.type = mkdir
```

### ファイルシステムオブジェクトが削除された

```yaml
- macro: remove
  condition: evt.type in (rmdir, unlink, unlinkat)
```

### ファイルシステムオブジェクトが変更された

```yaml
- macro: modify
  condition: rename or remove
```

### 新規プロセスが生成された

```yaml
- macro: spawned_process
  condition: evt.type = execve and evt.dir=<
```

### バイナリの共通ディレクトリ

```yaml
- macro: bin_dir
  condition: fd.directory in (/bin, /sbin, /usr/bin, /usr/sbin)
```

### シェルが開始されました

```yaml
- macro: shell_procs
  condition: (proc.name in (shell_binaries))
```

### 既知の機密ファイル

```yaml
- macro: sensitive_files
  condition: >
    fd.name startswith /etc and
    (fd.name in (sensitive_file_names)
     or fd.directory in (/etc/sudoers.d, /etc/pam.d))
```

### 新しく作成されたプロセス

```yaml
- macro: proc_is_new
  condition: proc.duration <= 5000000000
```

### インバウンドネットワーク接続

```yaml
- macro: inbound
  condition: >
    (((evt.type in (accept,listen) and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### アウトバウンドネットワーク接続

```yaml
- macro: outbound
  condition: >
    (((evt.type = connect and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### インバウンドかアウトバウンドネットワーク接続

```yaml
- macro: inbound_outbound
  condition: >
    (((evt.type in (accept,listen,connect) and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### オブジェクトはコンテナです

```yaml
- macro: container
  condition: container.id != host
```

### 生成された対話型プロセス

```yaml
- macro: interactive
  condition: >
    ((proc.aname=sshd and proc.name != sshd) or
    proc.name=systemd-logind or proc.name=login)
```

## マクロにオーバーライドする

以下のマクロには、ユーザーの特定の環境でオーバーライドできる値が含まれています。

### 共通SSHポート

このマクロをオーバーライドして、SSHサービスを提供する環境内のポートを反映します。

```yaml
- macro: ssh_port
  condition: fd.sport=22
```

### 許可されたSSHホスト

このマクロをオーバーライドして、既知のSSHポート(要塞またはジャンプボックス)に接続できるホストを反映します。

```yaml
- macro: allowed_ssh_hosts
  condition: ssh_port
```

### ユーザーのホワイトリストコンテナ

特権モードでの実行が許可されているコンテナをホワイトリストに登録します。

```yaml
- macro: user_trusted_containers
  condition: (container.image startswith sysdig/agent)
```

### シェルを生成できるコンテナ

シェルの生成を許可されているコンテナをホワイトリストに登録します。これは、コンテナがCI/CDパイプラインで使用されている場合に必要になることがあります。

```yaml
- macro: user_shell_container_exclusions
  condition: (never_true)
```

### EC2メタデータサービスとの通信を許可されたコンテナ

EC2メタデータサービスとの通信が許可されているコンテナをホワイトリストに登録します。 デフォルト：任意のコンテナ。

```yaml
- macro: ec2_metadata_containers
  condition: container
```

### Kubernetes API Server

ここにKubernetes API ServiceのIPを設定します。

```yaml
- macro: k8s_api_server
  condition: (fd.sip="1.2.3.4" and fd.sport=8080)
```

### Kubernetes APIとの通信を許可されたコンテナ

Kubernetes APIサービスとの通信が許可されているコンテナをホワイトリストに登録します。k8s_api_serverを設定する必要があります。

```yaml
- macro: k8s_containers
  condition: >
    (container.image startswith gcr.io/google_containers/hyperkube-amd64 or
    container.image startswith gcr.io/google_containers/kube2sky or
    container.image startswith sysdig/agent or
    container.image startswith sysdig/falco or
    container.image startswith sysdig/sysdig)
```

### Kubernetes Service NodePortsとの通信を許可されたコンテナ

```yaml
- macro: nodeport_containers
  condition: container
```
