---
title: インストール
description: LinuxシステムでのFalcoのセットアップ
weight: 3
---

Falcoは、システムコールを使用してシステムを保護および監視するLinuxセキュリティツールです。

{{% pageinfo color="primary" %}}
FalcoはKubernetesランタイムセキュリティに使用できます。
Falcoを実行する最も安全な方法は、ホストシステムにFalcoを直接インストールすることです。これにより、侵害された場合にFalcoがKubernetesから分離されます。
その後、Falcoアラートは、Kubernetesで実行されている読み取り専用エージェントを介して使用できます。

分離が問題にならない場合は、FalcoをKubernetesで直接実行することもできます。
Kind、Minikube、Helmなどのツールを使用してKubernetesで直接Falcoを実行する場合は、[サードパーティ統合](../third-party)をご覧ください。
{{% /pageinfo %}}


以下のパッケージマネージャーアーティファクトを使用してFalcoがインストールされている場合は、次のものが用意されています:

 - Falcoがユーザースペースプログラムでスケジュールされ、`systemd`を介してウォッチされる
 - パッケージマネージャーを介してインストールされたFalcoドライバー（ホストに応じてカーネルモジュールまたはeBPFのいずれか）
 - `/etc/falco`にインストールされた健全でデフォルトの設定ファイル

あるいは、[以下で説明する](#linux-binary)のように、バイナリパッケージを使用することもできます。

## インストール

### Debian/Ubuntu {#debian}

1. falcosecurity GPGキーを信頼し、aptリポジトリを構成して、パッケージリストを更新します:

    ```shell
    curl -s https://falco.org/repo/falcosecurity-packages.asc | apt-key add -
    echo "deb https://download.falco.org/packages/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
    apt-get update -y
    ```

2. カーネルヘッダのインストール:

    ```shell
    apt-get -y install linux-headers-$(uname -r)
    ```

3. Falcoのインストール:

    ```shell
    apt-get install -y falco
    ```

    カーネルモジュールドライバのFalcoとデフォルト設定がインストールされました。
    Falco は systemd ユニットとして実行されています。

    Falcoでの管理、実行、デバッグの方法については、[running](../running)を参照してください。

4. Falcoのアンインストール:

    ```shell
    apt-get remove falco
    ```

### CentOS/RHEL/Fedora/Amazon Linux {#centos-rhel}

1. falcosecurityのGPGキーを信頼してyumリポジトリを設定する:

    ```shell
    rpm --import https://falco.org/repo/falcosecurity-packages.asc
    curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```

    > **注** - 以下のコマンドは、DKMS と `make` がディストリビューションで利用できない場合にのみ必要です。DKMSが利用可能かどうかは、`yum list make dkms`を使って確認できます。必要であれば、以下のようにしてインストールしてください。必要であれば、`yum install epel-release`、`yum install make dkms`を使ってインストールしてください。

2. カーネルヘッダのインストール:

    ```shell
    yum -y install kernel-devel-$(uname -r)
    ```

    > **注意** - 上記のコマンドでパッケージが見つからなかった場合、パッケージを修正するために `yum distro-sync` を実行する必要があるかもしれません。システムの再起動が必要になるかもしれません。

3. Falcoのインストール:

    ```shell
    yum -y install falco
    ```
    カーネルモジュールドライバのFalcoとデフォルト設定がインストールされました。
    Falco は systemd ユニットとして実行されています。

    Falcoでの管理、実行、デバッグの方法については、[running](../running)を参照してください。


4. Falcoのアンインストール:

    ```shell
    yum erase falco
    ```

### Linux generic (バイナリーパッケージ) {#linux-binary}

1. 最新のバイナリをダウンロード:

    ```shell
    curl -L -O https://download.falco.org/packages/bin/x86_64/falco-{{< latest >}}-x86_64.tar.gz
    ```

2. Falcoのインストール:

    ```shell
    tar -xvf falco-{{< latest >}}-x86_64.tar.gz
    cp -R falco-{{< latest >}}-x86_64/* /
    ```
3. 以下の依存関係をインストールします:
    - `libyaml`
    - kernel headers for your distribution

4. [下記](#install-driver)のようにドライバをインストールしてください。

ドライバがインストールされたら、手動で `falco` を実行することができます。

### ドライバのインストール {#install-driver}

ドライバをインストールする最も簡単な方法は、`falco-driver-loader` スクリプトを使うことです。

デフォルトでは、まず `dkms` でカーネルモジュールをローカルに構築しようとします。それが不可能な場合は、ビルド済みのものを `~/.falco/` にダウンロードしようとします。カーネルモジュールが見つかれば、それを挿入します。

eBPFプローブドライバをインストールしたい場合は、`falco-driver-loader bpf`を実行します。
最初にeBPFプローブをローカルにビルドしようとしますが、そうでない場合は `~/.falco/` にビルド済みのものをダウンロードします。

設定可能なオプション:

- `DRIVERS_REPO` - この環境変数を設定して、ビルド済みカーネルモジュールと eBPF プローブのデフォルトのリポジトリ URL をオーバーライドします。

    例えば、`https://myhost.mydomain.com` や、サーバが `https://myhost.mydomain.com/drivers` のようなサブディレクトリ構造を持っている場合には、`https://myhost.mydomain.com/drivers` となります。

    ドライバは以下のような構造でホストされる必要があります:
     `/${driver_version}/falco_${target}_${kernelrelease}_${kernelversion}. [ko|o]` ここで、`ko` と `o` はそれぞれカーネルモジュール、`eBPF` プローブを表します。

    例、 `/a259b4bf49c3330d9ad6c3eed9eb1a31954259a6/falco_amazonlinux2_4.14.128-112.105.amzn2.x86_64_1.ko`.

    `falco-driver-loader` スクリプトは、上記のフォーマットを用いてドライバをフェッチします。
