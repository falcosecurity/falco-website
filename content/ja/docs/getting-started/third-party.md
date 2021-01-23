---
title: サードパーティ統合
description: Falcoコア上に構築されたコミュニティ主導の統合
weight: 5
---

## スクリプトインストール {#scripted}

LinuxにFalcoをインストールするには、必要な手順を実行するシェルスクリプトをダウンロードできます:

```shell
curl -o install_falco -s https://falco.org/script/install
```

次に、`sha256sum`ツール（または類似のツール）を使用して、スクリプトの [SHA256](https://en.wikipedia.org/wiki/SHA-2) チェックサムを確認します。

```shell
sha256sum install_falco
```

`{{< sha256sum >}}`である必要があります。

次に、スクリプトをrootまたはsudoで実行します:

```shell
sudo bash install_falco
```

## Minikube 

ローカル環境のKubernetesでFalcoを使用する最も簡単な方法は、 [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/)にあります。 Kubernetes YAMLマニフェストとHelmチャートの両方がMinikubeで定期的にテストされています。

デフォルトの `--driver`引数で `minikube`を実行すると、MinikubeはさまざまなKubernetesサービスを実行するVMを作成し、ポッドなどを実行するコンテナフレームワークを作成します。通常、VMには実行中のカーネルのカーネルヘッダーが含まれていないためMinikube上にFalcoカーネルモジュールを直接ビルドすることはできません。

これに対処するために、Falco 0.13.1以降、最新から10のMinikubeバージョン用のカーネルモジュールを事前にビルドし、https://s3.amazonaws.com/download.draios.comで利用できるようにしています。 これにより、ダウンロード可能なフォールバックステップがロード可能なカーネルモジュールで成功します。

今後も、Falcoの新しいリリースごとに、Minikubeの最新10バージョンを引き続きサポートします。 現在、ダウンロード用に以前にビルドされたカーネルモジュールを保持しているため、限られた履歴サポートも引き続き提供します。

MinikubeでFalcoを設定する方法については、 [このブログ投稿](https://falco.org/blog/minikube-falco-kernel-module/) も参照してください。

## Kind

 [Kind](https://github.com/kubernetes-sigs/kind)クラスターでFalcoを実行する最も簡単な方法は次のとおりです:

1. 設定ファイルを作成します。 例えば: `kind-config.yaml`

2. 以下をファイルに追加します:
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraMounts:
  - hostPath: /dev
    containerPath: /dev
```

3. 設定ファイルを指定してクラスターを作成します:
```
kind create cluster --config=./kind-config.yaml
```

4. kindにおけるKubernetesクラスターにFalcoを[インストール](../installation)します。


## Helm

Helmは、KubernetesにFalcoをインストールする方法です。 Falcoコミュニティは、Helm chartとそれを使用する方法に関するドキュメントをサポートしています[ここにあります](https://github.com/falcosecurity/charts/tree/master/falco)。

## Puppet

Falco用の [Puppet](https://puppet.com/)モジュール、 `sysdig-falco`は[Puppet Forge](https://forge.puppet.com/sysdig/falco/readme)で入手できます。

## Ansible

[@juju4](https://github.com/juju4/)は、Falcoの`juju4.falco`の[Ansible](https://ansible.com)ロールを作成してくれました。[GitHub](https://github.com/juju4/ansible-falco/)および[Ansible Galaxy](https://galaxy.ansible.com/juju4/falco/)から入手できます。Ansible Galaxy（v0.7）の最新バージョンはFalco 0.9では動作しませんが、GitHubのバージョンでは動作します。

## CoreOS

CoreOSでFalcoを実行するための推奨される方法は、[Dockerセクション](/docs/getting-started/running#docker)のインストールコマンドを使用して、自身のDockerコンテナ内で行うことです。 この方法では、ホストOS上のすべてのコンテナを完全に可視化できます。

この方法は自動的に更新され、自動セットアップやbash completionなどの優れた機能が含まれています。また、CoreOS以外の他のディストリビューションでも使用できる一般的な方法です。

ただし、CoreOSツールボックスでFalcoを実行することを好むユーザーもいます。推奨される方法ではありませんが、これは通常のインストール方法を使用してツールボックス内にFalcoをインストールし、次に手動で `falco-driver-loader`スクリプトを実行することで実現できます:

```shell
toolbox --bind=/dev --bind=/var/run/docker.sock
curl -s https://falco.org/script/install | bash
falco-driver-loader
```


## GKE

Google Kubernetes Engine（GKE）は、ワーカーノードプールのデフォルトのオペレーティングシステムとしてContainer-Optimized OS（COS）を使用します。 COSは、基盤となるOSの特定の部分へのアクセスを制限する、セキュリティが強化されたオペレーティングシステムです。このセキュリティ制約のため、Falcoはシステムコールのイベントを処理するためにカーネルモジュールを挿入できません。ただし、COSはeBPF（拡張されたBerkeley Packet Filter）を利用して、システムコールのストリームをFalcoエンジンに提供する機能を提供します。

Falcoは最小限の設定変更でeBPFを使用できます。 これを行うには、`FALCO_BPF_PROBE`環境変数を空の値に設定します：`FALCO_BPF_PROBE=""`。

eBPFは現在、GKEとCOSでのみサポートされていますが、ここでは幅広いプラットフォームセットのインストールの詳細を提供します

{{% pageinfo color="primary" %}} 
 プローブファイルの代替パスを指定する場合は、`FALCO_BPF_PROBE`を既存のeBPFプローブのパスに設定することもできます。

{{% /pageinfo %}}

公式のコンテナイメージを使用する場合、この環境変数を設定すると、`falco-driver-loader`スクリプトがトリガーされ、適切なバージョンのCOSのカーネルヘッダーがダウンロードされ、適切なeBPFプローブがコンパイルされます。他のすべての環境では、`falco-driver-loader`スクリプトを自分で呼び出して、次の方法で取得できます:

```bash
sudo FALCO_VERSION="{{< latest >}}" FALCO_BPF_PROBE="" falco-driver-loader
```

上記のスクリプトを正常に実行するには、`clang`と`llvm`をインストールする必要があります。

パッケージからFalcoをインストールする場合は、`falco` systemdユニットを編集する必要があります。

これは、次のコマンドを実行して実行できます:

```bash
systemctl edit falco
```

エディターが開きます。この時点で、このコンテンツをファイルに追加して、ユニットの環境変数を設定できます:

```
[Service]
Environment='FALCO_BPF_PROBE=""'
```

[Falco with Helm](https://falco.org/docs/third-party/#helm)をインストールする場合は、`ebpf.enabled`オプションを` true`に設定する必要があります：

```
helm install falco falcosecurity/falco --set ebpf.enabled=true
```
