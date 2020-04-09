---
title: Falcoをインストールする
description: Linuxおよび、さまざまなコンテナプラットフォームで起動して実行する
weight: 2
---

次のいずれかの方法を使用して、Falcoをインストールします。 特定のインフラストラクチャ要件によって、選択するインストール方法が決まります。

- FalcoをKubernetesクラスターにインストールします。そのためには、DaemonSetをKubernetesクラスターにデプロイします。 KubernetesにFalcoをインストールすると、クラスター、そのワーカーノード、および実行中のコンテナーで異常なビヘイビアが監視されます。
- FalcoをLinuxホストに直接インストールします。 これにはさまざまな理由があります。
    - Kubernetes内で実行されているコンテナを監視するため。ワーカーノードOSに直接インストールすると、Kubernetesで実行されているアプリケーションやKubernetes APIのユーザーからの分離レベルがさらに高まります。
    - Linuxホストで直接実行されているコンテナ、またはCloud FoundryやMesosphere DC/OSなどの別のプラットフォームで実行されているコンテナを監視するため。
    - Linuxホストで直接実行されているアプリケーション(つまり、コンテナ化されていないワークロード)を監視するため。

## Kubernetes

KubernetesでFalcoを実行するデフォルトの方法は、DaemonSetを使用することです。 Falcoは、選択したデプロイメント方法と基盤となるKubernetesバージョンに応じて、さまざまなインストール方法をサポートしています。デフォルトのインストールには、カーネルモジュールを介したシステムコールイベントのサポートが含まれているため、ワーカーノードの基盤となるオペレーティングシステムに依存しています。ワーカーノードに適切なカーネルヘッダーをインストールすると、Falcoはポッドの起動時にカーネルモジュールを動的に構築(および「insmod」)できます。Falcoはまた、一般的なディストリビューションとカーネル用にいくつかのビルド済みモジュールを提供します。Falcoは、モジュールのコンパイルが失敗した場合、事前に構築されたモジュールを自動的にダウンロードしようとします。

基盤となるカーネルへのアクセスが制限されているGoogleのContainer Optimized OS＆GKEなどのプラットフォームについては、以下の[GKEセクション](#gke)を参照してください。

### HTTP経由のカーネルモジュールのダウンロード

HTTPを使用してカーネルモジュールを事前に構築し、Falcoポッドに提供します。カーネルモジュールを構築する最も簡単な方法は次のとおりです：

1. 必要なカーネルヘッダーを持つノードにFalcoをデプロイします。
2. Falcoで `falco-driver-loader`スクリプトを使用して、カーネルモジュールをビルドします。
3. カーネルモジュールをポッドまたはコンテナから移動します。
    デフォルトでは、カーネルモジュールは `/root/.falco/`にコピーされます。

`PROBE_URL`-Falcoポッドにこの環境変数を設定して、事前に構築されたカーネルモジュールのデフォルトホストをオーバーライドします。これは、末尾のスラッシュなしのURLのホスト部分のみである必要があります。つまり、「https://myhost.mydomain.com」です。 カーネルモジュールを `/stable/sysdig-probe-binaries/`ディレクトリにコピーし、次のように名前を付けます：
`falco-probe-${falco_version}-$(uname -i)-$(uname -r)-{md5sum of kernel config}.ko`

`falco-driver-loader`スクリプトは、デフォルトでこの形式でモジュールに名前を付けます。

### Helm

Helmは、FalcoをKubernetesにインストールするための推奨される方法の1つです。 [Falco Helm chart](https://github.com/helm/charts/tree/master/stable/falco)は、広範なセットである[設定値](https://github.com/helm/charts/tree/master/stable/falco#configuration)を提供し、異なる構成でFalcoを起動できます。

Helmがデプロイされているクラスターにデフォルト構成でFalcoをデプロイするには、次を実行します。

```shell
helm install --name falco stable/falco
```

クラスターからFalcoを削除するには、次を実行します：
```
helm delete falco
```

#### Kubernetes レスポンスエンジン

Falco Helmチャートを使用することは、[Falco Kubernetes Response Engine(KRE)](https://github.com/falcosecurity/kubernetes-response-engine)をデプロイする最も簡単な方法です。KREは、NATS、AWS SNS、Google Pub/SubなどのメッセージングサービスにFalcoアラートを送信する機能を提供します。これにより、各メッセージングサービスのサブスクライバーがFalcoアラートを処理できます。 この統合を有効にするには、Helmチャートの `integrations ** [構成オプション](https://github.com/helm/charts/tree/master/stable/falco#configuration)を参照してください。

KREを使用すると、Falcoルールに違反した場合にアクションを実行できるセキュリティプレイブックを(サーバーレス機能を介して)デプロイすることもできます。付属のプレイブックをデプロイする方法については、[Response Engine documentation](https://github.com/falcosecurity/kubernetes-response-engine/tree/master/playbooks)を参照してください。

### DaemonSet マニフェスト
FalcoをKubernetes [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)として実行するには、以下の手順に従ってください。 これらはKubernetesの「一般的な」手順です。 プラットフォーム固有の手順については、それぞれのセクションを参照してください。

1. [Falcoリポジトリ](https://github.com/falcosecurity/falco/)のクローンを作成し、マニフェストのあるディレクトリに移動します。
```shell
git clone https://github.com/falcosecurity/falco/
cd falco/integrations/k8s-using-daemonset
```
2. サービスアカウントを作成し、必要なRBAC権限を付与します。Falcoはこのサービスアカウントを使用してKubernetes APIサーバーに接続し、リソースメタデータを取得します。
```shell
kubectl apply -f k8s-with-rbac/falco-account.yaml
```
3. Falcoポッド用のサービスを作成します。これにより、Falcoは[Kubernetes Audit Log Events](event-sources / kubernetes-audit)を受信できるようになります。この機能を使用する予定がない場合は、この手順をスキップできます。
```shell
kubectl apply -f k8s-with-rbac/falco-service.yaml
```

4. DaemonSetはKubernetes ConfigMapにFalcoの設定を保存し、設定をFalcoポッドで使用できるようにします。 これにより、基になるPodを再ビルドおよび再デプロイすることなく、カスタム構成を管理できます。 ConfigMapを作成するには：

  1. `k8s-with-rbac/falco-config`ディレクトリを作成します。
  2. このGitHubリポジトリから必要な設定を `k8s-with-rbac/falco-config/`ディレクトリにコピーします。

元のファイルを変更しないでください。 コピーしたファイルを使用して、設定を変更します。

```shell
mkdir -p k8s-with-rbac/falco-config
k8s-using-daemonset$ cp ../../falco.yaml k8s-with-rbac/falco-config/
k8s-using-daemonset$ cp ../../rules/falco_rules.* k8s-with-rbac/falco-config/
k8s-using-daemonset$ cp ../../rules/k8s_audit_rules.yaml k8s-with-rbac/falco-config/
```

5. 環境のカスタムルールを `falco_rules.local.yaml`ファイルに追加すると、開始時にFalcoによって読み込まれます。`falco.yaml`ファイルを変更して、デプロイメントに必要な[設定オプション](configuration /)を変更することもできます。次のようにconfigMapを作成します：
```shell
kubectl create configmap falco-config --from-file=k8s-with-rbac/falco-config
```

6. configMapの依存関係を作成したら、DaemonSetを作成できます。
```shell
kubectl apply -f k8s-with-rbac/falco-daemonset-configmap.yaml
```

7. Falcoが正しく起動したことを確認します。これを行うには、対応するログファイルでFalcoポッドのステータスを確認します。
```shell
kubectl logs -l app=falco-example
```

### Minikube

ローカル環境のKubernetesでFalcoを使用する最も簡単な方法は、[Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/)です。Kubernetes YAMLマニフェストとHelmチャートの両方が、Minikubeで定期的にテストされています。

#### Minikube カーネルモジュール

デフォルトの `--driver`引数で` minikube`を実行すると、MinikubeはさまざまなKubernetesサービスを実行するVMとPodなどを実行するコンテナフレームワークを作成します。一般に、FalcoカーネルモジュールをMinikube VMで直接ビルドすることはできません。実行中のカーネルのカーネルヘッダーがVMに含まれていないためです。

これに対処するためfalco 0.13.1から、最新のMinikube 10バージョンのカーネルモジュールを事前にビルドし、https://s3.amazonaws.com/download.draios.comで利用できるようにしています。これにより、ロード可能なカーネルモジュールでダウンロードフォールバックステップを成功させることができます。

今後、Falcoの新しいリリースごとに、Minikubeの最新バージョンを10バージョンをサポートします。 現在、ダウンロード用にプレビルドしたカーネルモジュールを保持しているため、引き続き限定的に履歴サポートを提供します。

### GKE

Google Kubernetes Engine(GKE)は、ワーカーノードプールのデフォルトのオペレーティングシステムとしてContainer-Optimized OS(COS)を使用します。COSは、基盤となるOSの特定の部分へのアクセスを制限するセキュリティが強化されたオペレーティングシステムです。このセキュリティ上の制約のため、Falcoはカーネルモジュールを挿入してシステムコールのイベントを処理できません。ただし、COSは、eBPF(extended Berkeley Packet Filter)を活用して、システムコールのストリームをFalcoエンジンに提供する機能を提供します。


## eBPFサポートの有効化

Falcoは、最小限の構成変更でeBPFを使用できます。それには、 `FALCO_BPF_PROBE`環境変数を空の値に設定します：` FALCO_BPF_PROBE = "" `。

eBPFは現在GKEとCOSでのみサポートされていますが、ここでは幅広いプラットフォームのインストールの詳細を提供します

**重要**: プローブファイルの代替パスを指定する場合、`FALCO_BPF_PROBE`を既存のeBPFプローブのパスに設定することもできます。

### プローブの入手

公式のコンテナイメージを使用する場合、この環境変数を設定すると、`falco-driver-loader`スクリプトがトリガーされ、適切なバージョンのCOSのカーネルヘッダーがダウンロードされ、適切なeBPFプローブがコンパイルされます。他のすべての環境では、 `falco-driver-loader`スクリプトを自分で呼び出してこの方法で取得できます：

```bash
sudo FALCO_VERSION="{{< latest >}}" FALCO_BPF_PROBE="" falco-driver-loader
```

上記のスクリプトを正常に実行するには、`clang`と` llvm`がインストールされている必要があります。

### KubernetesにおけるHelmの使用
Helmを使用している場合、`ebpf.enable`設定オプションを設定することでeBPFを有効にできます。

```shell
helm install --name falco stable/falco --set ebpf.enabled=true
```

### Kubernetesにおけるyamlファイルの使用

提供されているDaemonSetマニフェストを使用している場合は、対応するYAMLファイルの次の行のコメントを解除します。

```yaml
          env:
          - name: FALCO_BPF_PROBE
            value: ""
```

### パッケージからローカル

パッケージからFalcoをインストールする場合、 `falco` systemdユニットを編集する必要があります。

それには、次のコマンドを実行します：

```bash
systemctl edit falco
```

エディターが開きます。この時点で、このコンテンツをファイルに追加することでユニットの環境変数を設定できます：

```
[Service]
Environment='FALCO_BPF_PROBE=""'
```

### Falcoバイナリをローカルで使用する

Falcoバイナリを直接使用している場合、次の方法でBPFプローブを有効にできます：

```bash
sudo FALCO_BPF_PROBE="" falco
```

## Linux

スクリプト化されたインストール、パッケージマネージャー、またはAnsibleなどの構成管理ツールを使用して、LinuxにFalcoを直接インストールします。Falcoをホストに直接インストールすると、以下が提供されます：

- Linuxホストの異常を監視する機能。 Falcoの多くのユースケースはコンテナ化されたワークロードの実行に焦点を合わせていますが、Falcoは任意のLinuxホストで異常なアクティビティを監視できます。コンテナ(およびKubernetes)はオプションです。
- コンテナスケジューラ(Kubernetes)およびコンテナランタイムからの分離。ホストで実行されているFalcoは、Falco構成およびFalcoデーモンの管理からコンテナスケジューラを削除します。これは、コンテナスケジューラが悪意のある攻撃者によって侵害された場合に、Falcoが改ざんされるのを防ぐのに役立ちます。

### スクリプトインストール{#scripted}

LinuxにFalcoをインストールするには、必要な手順を実行するシェルスクリプトをダウンロードできます：

```shell
curl -o install_falco -s https://falco.org/script/install
```

次に、 `sha256sum`ツール(または類似のもの)を使用して、スクリプトの[SHA256](https://en.wikipedia.org/wiki/SHA-2)チェックサムを確認します：

```shell
sha256sum install_falco
```

`{{<sha256sum>}}`でなければなりません。

次に、ルートとして、またはsudoを使用してスクリプトを実行します：

```shell
sudo bash install_falco
```

### パッケージインストール {#package}

#### CentOS/RHEL/Amazon Linux {#centos-rhel}

1. falcosecurity GPGキーを信頼し、yumリポジトリを設定します:

    ```shell
    rpm --import https://falco.org/repo/falcosecurity-3672BA8F.asc
    curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```

    > **ノート** - 現在のマスターのFalcoパッケージを使用する場合は、[falcosecurity-rpm-dev](https://falco.org/repo/falcosecurity-rpm-dev.repo)ファイルを使用します。

2. EPELリポジトリをインストールする:

    > **ノート** — 次のコマンドは、DKMSがディストリビューションで利用できない場合にのみ必要です。「yum list dkms」を使用して、DKMSが利用可能かどうかを確認できます。 必要に応じて、次を使用してインストールします:

    ```shell
    yum install epel-release
    ```

3. カーネルヘッダーをインストールする:

    > **注意** — 次のコマンドは、どのカーネルでも機能しない可能性があります。 パッケージの名前を適切にカスタマイズしてください。

    ```shell
    yum -y install kernel-devel-$(uname -r)
    ```

4. Falcoをインストールする:

    ```shell
    yum -y install falco
    ```

    アンインストールするには、'yum erase falco'を実行します。

#### Debian/Ubuntu {#debian}

1. falcosecurity GPGキーを信頼し、aptリポジトリーを構成し、パッケージリストを更新します:

    ```shell
    curl -s https://falco.org/repo/falcosecurity-3672BA8F.asc | apt-key add -
    echo "deb https://dl.bintray.com/falcosecurity/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
    apt-get update -y
    ```

    > **ノート** - 現在のマスターからFalcoパッケージを使用する場合は、https://dl.bintray.com/falcosecurity/deb-dev URLをfalcosecurity.listファイルにエコーします。

2. カーネルヘッダーをインストールする:

    > **注意** — 次のコマンドは、どのカーネルでも機能しない可能性があります。 パッケージの名前を適切にカスタマイズしてください。

    ```shell
    apt-get -y install linux-headers-$(uname -r)
    ```

3. Falcoをインストールする:

    ```shell
    apt-get install -y falco
    ```

    アンインストールするには、'apt-get remove falco'を実行します。

### 構成管理システム

[Puppet](#puppet)や[Ansible](#ansible)などの構成管理システムを使用してFalcoをインストールすることもできます。

#### Puppet

Falco用の[Puppet](https://puppet.com/)モジュールである `sysdig-falco`は、[Puppet Forge](https://forge.puppet.com/sysdig/falco/readme)で入手できます。

#### Ansible

[@ juju4](https://github.com/juju4/)は、Falcoの[Ansible](https://ansible.com)の役割である `juju4.falco`を有益に書いています。 [GitHub](https://github.com/juju4/ansible-falco/)および[Ansible Galaxy](https://galaxy.ansible.com/juju4/falco/)で入手できます。Ansible Galaxy(v0.7)の最新バージョンはFalco 0.9では動作しませんが、GitHubのバージョンは動作します。

### Docker

**ノート:** これらの手順は、LinuxホストでFalcoコンテナーを直接実行するためのものです。KubernetesでFalcoコンテナーを実行する手順については、[Kubernetes固有のドキュメント](#kubernetes)を参照してください。

ホストオペレーティングシステムを完全に制御できる場合は、通常のインストール方法を使用してFalcoをインストールすることをお勧めします。 この方法により、ホストOS上のすべてのコンテナーを完全に可視化できます。 標準の自動/手動インストール手順を変更する必要はありません。

ただし、Falcoは[Docker](https://docker.com)コンテナー内で実行することもできます。 スムーズなデプロイメントを確実にするには、Falcoを実行する前にカーネルヘッダーをホストオペレーティングシステムにインストールする必要があります。

これは通常、`apt-get`を使用してDebianのようなディストリビューションで実行できます：

```shell
apt-get -y install linux-headers-$(uname -r)
```

RHELのようなディストリビューションの場合：

```shell
yum -y install kernel-devel-$(uname -r)
```

その後、FalcoはDockerを使用して実行できます：

```shell
docker pull falcosecurity/falco
docker run -i -t \
    --name falco \
    --privileged \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    falcosecurity/falco
```

動作を確認するには、[イベントジェネレータ](../ event-sources/sample-events)を実行して、Falcoのルールセットをトリガーするアクションを実行します：

```shell
docker pull sysdig/falco-event-generator
docker run -it --name falco-event-generator sysdig/falco-event-generator
```

#### Dockerコンテナでカスタムルールを使用する

Falcoイメージには、 `/etc/falco/falco_rules.yaml`にある組み込みのルールセットがあり、ほとんどの目的に適しています。ただし、独自のルールファイルを提供し、Falcoイメージを引き続き使用することもできます。その場合、 `-v path-to-falco-rules.yaml:/etc/falco/を追加して、コンテナ内の` /etc/falco/falco_rules.yaml`に外部ルールファイルをマッピングするボリュームマッピングを追加する必要があります。 falco_rules.yaml`を `docker run`コマンドに追加します。 これにより、ユーザーが指定したバージョンでデフォルトのルールが上書きされます

デフォルトの `falco_rules.yaml`に加えてカスタムルールを使用するには、ローカルディレクトリにカスタムルールを配置できます。 次に、 `-v path-to-custom-rules/:/etc/falco/rules.d`を` docker run`コマンドに追加して、このディレクトリをマウントします。

### CoreOS

CoreOSでFalcoを実行する推奨方法は、上記の[Dockerセクション](#docker)のインストールコマンドを使用して、独自のDockerコンテナー内で実行することです。この方法により、ホストOS上のすべてのコンテナーを完全に可視化できます。

この方法は自動的に更新され、自動セットアップやbash補完などの優れた機能が含まれています。また、CoreOS以外の他のディストリビューションでも使用できる一般的なアプローチです。

ただし、一部のユーザーはCoreOSツールボックスでFalcoを実行することを好む場合があります。推奨される方法ではありませんが、これは通常のインストール方法を使用してツールボックス内にFalcoをインストールしてから、手動で `falco-driver-loader`スクリプトを実行することで実現できます：

```shell
toolbox --bind=/dev --bind=/var/run/docker.sock
curl -s https://falco.org/script/install | bash
falco-driver-loader
```
