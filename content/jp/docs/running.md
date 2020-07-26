---
title: 実行する
description: Falcoの運用と管理
weight: 4
---


## サービスとしてのFalcoを実行

[deb もしくは rpm](../installation)パッケージを使用してFalcoをインストールした場合は、サービスを開始することができます：

```bash
service falco start
```

あるいは、`systemd` の場合:
```bash
systemctl start falco
```
これは `systemd-sysv-generator` が `init.d` スクリプトを `systemd` ユニットにラップしているからです。

また、`journalctl`を使ってFalcoのログを見ることもできます。

```bash 
journalctl -fu falco
```

## 手動でFalcoを実行する

手作業でFalcoを実行したい場合は、入力することでFalcoの完全な使用法の説明を見つけることができます：

```
falco --help
```

{{< info >}}

ユーザースペースのインストルメントをお探しですか？[このページ](/docs/event-sources/drivers/)をご覧ください。

{{< /info >}}

## Dockerでの実行 {#docker}

ファルコは公式の[docker images](/docs/download#images)のセットを提供しています。
イメージは以下の2つの方法で使用できます：
- [最少特権（推奨）](#docker-least-privileged)
- [完全特権](#docker-privileged)

### 最少特権（推奨） {#docker-least-privileged}


{{< info >}}

少なくともKernel 5.8以上でないと、eBPFプローブドライバでLeast privilegedモードを使用することはできません。
これは `--privileged` が `bpf` のシステムコールを行うために必要だからです。
Kernel >= 5.8 を実行している場合は、ステップ 2 の docker run コマンドに `--cap-add SYS_BPF` を渡すことができます。
そして、カーネルモジュールのインストールセクションは完全に無視してください。

詳しくはこちらをご覧ください[こちら](https://github.com/falcosecurity/falco/issues/1299#issuecomment-653448207)
{{< /info >}}

このようにして、Falco ユーザスペースプロセスをコンテナ内で実行することができます。

カーネルモジュールがホストシステムに直接インストールされると、コンテナ内から使用することができます。

1. カーネルモジュールのインストール:

    - 公式の[インストール方法](/docs/installation)をホスト上で直接使用することができます。
    - あるいは、特権コンテナを一時的に使用してホストにドライバをインストールすることもできます：

    ```shell
    docker pull falcosecurity/falco-driver-loader:latest
    docker run --rm -i -t \
        --privileged \
        -v /root/.falco:/root/.falco \
        -v /proc:/host/proc:ro \
        -v /boot:/host/boot:ro \
        -v /lib/modules:/host/lib/modules:ro \
        -v /usr:/host/usr:ro \
        -v /etc:/host/etc:ro \
        falcosecurity/falco-driver-loader:latest
    ``` 


`falcosecurity/falco-driver-loader` イメージは単に `falco-driver-loader` スクリプトをラップしているだけです。
その使用法についての詳細は[こちらをご覧ください](./install#install-driver)


2. Dockerを使ってコンテナ内のFalcoを[最小特権の原則]で実行する(https://en.wikipedia.org/wiki/Principle_of_least_privilege):

    ```shell
    docker pull falcosecurity/falco-no-driver:latest
    docker run --rm -i -t \
        --cap-add SYS_PTRACE --pid=host $(ls /dev/falco* | xargs -I {} echo --device {}) \
        -v /var/run/docker.sock:/var/run/docker.sock \
        falcosecurity/falco-no-driver:latest
    ```

{{< warning >}}

AppArmor LSMを有効にしたシステム（例：Ubuntu）でFalcoを実行している場合、`--security-opt apparmor:unconfined`を次のように渡す必要があります。
上記の `docker run` コマンドを実行します。

AppArmorが有効になっているかどうかは、以下のコマンドを使用して確認できます：

```bash
docker info | grep -i apparmor
```

{{< /warning >}}

{{< info >}}

`ls /dev/falco* | xargs -I {} echo --device {}` は CPU ごとに `--dev/dev/falcoX` オプションを出力することに注意してください (つまり、Falco のカーネルモジュールによって作成されたデバイスだけです)。

{{< /info >}}

### 完全特権 {#docker-privileged}

Dockerを使ってコンテナでFalcoをフル権限で実行するには：

カーネルモジュールドライバでFalcoを使用する場合

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest
```

あるいは、eBPFプローブドライバを使用することもできます：

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -e FALCO_BPF_PROBE="" \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest
```

その他の設定可能なオプション:

- DRIVER_REPO` - [ドライバのインストール](https://falco.org/docs/installation/#install-driver) を参照してください。
- `SKIP_DRIVER_LOADER` - この環境変数を設定することで、`falcosecurity/falco` イメージの起動時に `falco-driver-loader` を実行しないようにします。ドライバが既に他の方法でホストにインストールされている場合に便利です。

## ホットリロード

これは、PIDを殺さずにFalcoの設定を再ロードし、エンジンを再起動します。これは、デーモンを殺さずに新しい設定変更を伝播させるのに便利です。

```bash
kill -1 $(cat /var/run/falco.pid)
```
