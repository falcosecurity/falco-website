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
    - Linuxホストで直接実行されているアプリケーション（つまり、コンテナ化されていないワークロード）を監視するため。

## Kubernetes

KubernetesでFalcoを実行するデフォルトの方法は、DaemonSetを使用することです。 Falcoは、選択したデプロイメント方法と基盤となるKubernetesバージョンに応じて、さまざまなインストール方法をサポートしています。デフォルトのインストールには、カーネルモジュールを介したシステムコールイベントのサポートが含まれているため、ワーカーノードの基盤となるオペレーティングシステムに依存しています。ワーカーノードに適切なカーネルヘッダーをインストールすると、Falcoはポッドの起動時にカーネルモジュールを動的に構築（および「insmod」）できます。Falcoはまた、一般的なディストリビューションとカーネル用にいくつかのビルド済みモジュールを提供します。Falcoは、モジュールのコンパイルが失敗した場合、事前に構築されたモジュールを自動的にダウンロードしようとします。

基盤となるカーネルへのアクセスが制限されているGoogleのContainer Optimized OS＆GKEなどのプラットフォームについては、以下の[GKEセクション]（＃gke）を参照してください。

### HTTP経由のカーネルモジュールのダウンロード

HTTPを使用してカーネルモジュールを事前に構築し、Falcoポッドに提供します。カーネルモジュールを構築する最も簡単な方法は次のとおりです：

1. 必要なカーネルヘッダーを持つノードにFalcoをデプロイします。
2. Falcoで `falco-probe-loader`スクリプトを使用して、カーネルモジュールをビルドします。
3. カーネルモジュールをポッドまたはコンテナから移動します。
    デフォルトでは、カーネルモジュールは `/root/.sysdig/`にコピーされます。

`SYSDIG_PROBE_URL`-Falcoポッドにこの環境変数を設定して、事前に構築されたカーネルモジュールのデフォルトホストをオーバーライドします。これは、末尾のスラッシュなしのURLのホスト部分のみである必要があります。つまり、「https://myhost.mydomain.com」です。 カーネルモジュールを `/stable/sysdig-probe-binaries/`ディレクトリにコピーし、次のように名前を付けます：
`falco-probe-${falco_version}-$(uname -i)-$(uname -r)-{md5sum of kernel config}.ko`

`falco-probe-loader`スクリプトは、デフォルトでこの形式でモジュールに名前を付けます。

### Helm

Helmは、FalcoをKubernetesにインストールするための推奨される方法の1つです。 [Falco Helm chart]（https://github.com/helm/charts/tree/master/stable/falco）は、[設定値]（https://github.com/helm/charts/treeの広範なセットを提供します /master/stable/falco＃configuration）異なる構成でFalcoを起動できます。

Helmがデプロイされているクラスターにデフォルト構成でFalcoをデプロイするには、次を実行します。

```shell
helm install --name falco stable/falco
```

To remove Falco from your cluster run:
```
helm delete falco
```

#### Kubernetes レスポンスエンジン

Falco Helmチャートを使用することは、[Falco Kubernetes Response Engine（KRE）]（https://github.com/falcosecurity/kubernetes-response-engine）をデプロイする最も簡単な方法です。KREは、NATS、AWS SNS、Google Pub/SubなどのメッセージングサービスにFalcoアラートを送信する機能を提供します。これにより、各メッセージングサービスのサブスクライバーがFalcoアラートを処理できます。 この統合を有効にするには、Helmチャートの `integrations ** [構成オプション]（https://github.com/helm/charts/tree/master/stable/falco#configuration）を参照してください。

KREを使用すると、Falcoルールに違反した場合にアクションを実行できるセキュリティプレイブックを（サーバーレス機能を介して）デプロイすることもできます。付属のプレイブックをデプロイする方法については、[Response Engine documentation]（https://github.com/falcosecurity/kubernetes-response-engine/tree/master/playbooks）を参照してください。

### DaemonSet マニフェスト
FalcoをKubernetes [DaemonSet]（https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/）として実行するには、以下の手順に従ってください。 これらはKubernetesの「一般的な」手順です。 プラットフォーム固有の手順については、それぞれのセクションを参照してください。

1. [Falcoリポジトリ]（https://github.com/falcosecurity/falco/）のクローンを作成し、マニフェストのあるディレクトリに移動します。
```shell
git clone https://github.com/falcosecurity/falco/
cd falco/integrations/k8s-using-daemonset
```
2. サービスアカウントを作成し、必要なRBAC権限を付与します。Falcoはこのサービスアカウントを使用してKubernetes APIサーバーに接続し、リソースメタデータを取得します。
```shell
kubectl apply -f k8s-with-rbac/falco-account.yaml
```
3. Falcoポッド用のサービスを作成します。これにより、Falcoは[Kubernetes Audit Log Events]（event-sources / kubernetes-audit）を受信できるようになります。この機能を使用する予定がない場合は、この手順をスキップできます。
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

5. Add the custom rules for your environment to the `falco_rules.local.yaml` file and they will be picked up by Falco at start time. You can also modify the `falco.yaml` file to change any [configuration options](configuration/) required for your deployment. Create the configMap as follows:
```shell
kubectl create configmap falco-config --from-file=k8s-with-rbac/falco-config
```

6. With the dependencies of the configMap created, you can now create the DaemonSet.
```shell
kubectl apply -f k8s-with-rbac/falco-daemonset-configmap.yaml
```

7. Verify Falco started correctly. To do so, check the status of the Falco pods in the corresponding log files.
```shell
kubectl logs -l app=falco-example
```

### Minikube

The easiest way to use Falco on Kubernetes in a local environment is on [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/). Both the Kubernetes YAML manifests and the Helm chart are regularly tested with Minikube.

#### Minikube Kernel Module

When running `minikube` with the default `--driver` arguments, Minikube creates a VM that runs the various Kubernetes services and a container framework to run Pods, etc. Generally, it's not possible to build the Falco kernel module directly on the Minikube VM, as the VM doesn't include the kernel headers for the running kernel.

To address this, starting with falco 0.13.1 we pre-build kernel modules for the last 10 Minikube versions and make them available at https://s3.amazonaws.com/download.draios.com. This allows the download fallback step to succeed with a loadable kernel module.

Going forward, we'll continue to support 10 most recent versions of Minikube with each new Falco release. We currently retain previously-built kernel modules for download, so we will continue to provide limited historical support as well.

### GKE

Google Kubernetes Engine (GKE) uses Container-Optimized OS (COS) as the default operating system for its worker node pools. COS is a security-enhanced operating system that limits access to certain parts of the underlying OS. Because of this security constraint, Falco cannot insert its kernel module to process events for system calls. However, COS provides the ability to leverage eBPF (extended Berkeley Packet Filter) to supply the stream of system calls to the Falco engine.


## Enabling eBPF Support

Falco can use eBPF with minimal configuration changes. To do so, set the `FALCO_BPF_PROBE` environment variable to an empty value: `FALCO_BPF_PROBE=""`.

eBPF is currently supported only on GKE and COS, however here we provide installation details for a wider set of platforms

**IMPORTANT**: If you want to specify an alternative path for the probe file, you can also set `FALCO_BPF_PROBE` to the path of an existing eBPF probe.

### Obtaining the probe

When using the official container images, setting this environment variable will trigger the `falco-probe-loader` script to download the kernel headers for the appropriate version of COS, and then compile the appropriate eBPF probe. In all the other environments you can call the `falco-probe-loader` script yourself to obtain it in this way:

```bash
sudo FALCO_VERSION="{{< latest >}}" FALCO_BPF_PROBE="" falco-probe-loader
```

To execute the script above succesfully, you will need `clang` and `llvm` installed.

### In Kubernetes using Helm
If using Helm, you can enable eBPF by setting the `ebpf.enable` configuration option.

```shell
helm install --name falco stable/falco --set ebpf.enabled=true
```

### In Kubernetes using yaml files

If you are using the provided DaemonSet manifests, uncomment the following lines in the corresponding YAML file.

```yaml
          env:
          - name: FALCO_BPF_PROBE
            value: ""
```

### Locally from packages

If you are installing Falco from packages, you will need to edit the `falco` systemd unit.

You can do that by executing the following command:

```bash
systemctl edit falco
```

It will open your editor, at this point you can set the environment variable for the unit by adding this content
to the file:

```
[Service]
Environment='FALCO_BPF_PROBE=""'
```

### Locally using the Falco binary

If you are using the Falco binary directly you can enable the BPF probe by:

```bash
sudo FALCO_BPF_PROBE="" falco
```

## Linux

Install Falco directly on Linux via a scripted install, package managers, or configuration management tools like Ansible. Installing Falco directly on the host provides:

- The ability to monitor a Linux host for abnormalities. While many use cases for Falco focus on running containerized workloads, Falco can monitor any Linux host for abnormal activity, containers (and Kubernetes) being optional.
- Separation from the container scheduler (Kubernetes) and container runtime. Falco running on the host removes the container scheduler from the management of the Falco configuration and Falco daemon. This can be useful to prevent Falco from being tampered with if your container scheduler gets compromised by a malicious actor.

### Scripted install {#scripted}

To install Falco on Linux, you can download a shell script that takes care of the necessary steps:

```shell
curl -o install_falco -s https://falco.org/script/install
```

Then verify the [SHA256](https://en.wikipedia.org/wiki/SHA-2) checksum of the script using the `sha256sum` tool (or something analogous):

```shell
sha256sum install_falco
```

It should be `{{< sha256sum >}}`.

Then run the script either as root or with sudo:

```shell
sudo bash install_falco
```

### Package install {#package}

#### CentOS/RHEL/Amazon Linux

1. Trust the falcosecurity GPG key and configure the yum repository:

    ```shell
    rpm --import https://falco.org/repo/falcosecurity-3672BA8F.asc
    curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```

    > **Note** - In case you want to use a Falco package from the current master use the [falcosecurity-rpm-dev](https://falco.org/repo/falcosecurity-rpm-dev.repo) file.

2. Install the EPEL repository:

    > **Note** — The following command is required only if DKMS is not available in the distribution. You can verify if DKMS is available using `yum list dkms`. If necessary, install it using:

    ```shell
    yum install epel-release
    ```

3. Install kernel headers:

    > **Warning** — The following command might not work with any kernel. Make sure to customize the name of the package properly.

    ```shell
    yum -y install kernel-devel-$(uname -r)
    ```

4. Install Falco:

    ```shell
    yum -y install falco
    ```

    To uninstall, run `yum erase falco`.

#### Debian/Ubuntu

1. Trust the falcosecurity GPG key, configure the apt repository, and update the package list:

    ```shell
    curl -s https://falco.org/repo/falcosecurity-3672BA8F.asc | apt-key add -
    echo "deb https://dl.bintray.com/falcosecurity/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
    apt-get update -y
    ```

    > **Note** - In case you want to use a Falco package from the current master echo the https://dl.bintray.com/falcosecurity/deb-dev URL into the falcosecurity.list file.

2. Install kernel headers:

    > **Warning** — The following command might not work with any kernel. Make sure to customize the name of the package properly.

    ```shell
    apt-get -y install linux-headers-$(uname -r)
    ```

3. Install Falco:

    ```shell
    apt-get install -y falco
    ```

    To uninstall, run `apt-get remove falco`.

### Config Management Systems

You can also install Falco using configuration management systems like [Puppet](#puppet) and [Ansible](#ansible).

#### Puppet

A [Puppet](https://puppet.com/) module for Falco, `sysdig-falco`, is available on [Puppet Forge](https://forge.puppet.com/sysdig/falco/readme).

#### Ansible

[@juju4](https://github.com/juju4/) has helpfully written an [Ansible](https://ansible.com) role for Falco, `juju4.falco`. It's available on [GitHub](https://github.com/juju4/ansible-falco/) and [Ansible Galaxy](https://galaxy.ansible.com/juju4/falco/). The latest version of Ansible Galaxy (v0.7) doesn't work with Falco 0.9, but the version on GitHub does.

### Docker

**Note:** These instructions are for running a Falco container directly on a Linux host. For instructions for running a Falco container on Kubernetes, see the [Kubernetes specific docs](#kubernetes).

If you have full control of your host operating system, then installing Falco using the normal installation method is the recommended best practice. This method allows full visibility into all containers on the host OS. No changes to the standard automatic/manual installation procedures are required.

Falco can also, however, run inside a [Docker](https://docker.com) container. To guarantee a smooth deployment, the kernel headers must be installed in the host operating system before running Falco.

This can usually be done on Debian-like distributions using `apt-get`:

```shell
apt-get -y install linux-headers-$(uname -r)
```

On RHEL-like distributions:

```shell
yum -y install kernel-devel-$(uname -r)
```

Falco can then be running using Docker:

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

To see it in action, also run the [event generator](../event-sources/sample-events) to perform actions that trigger Falco's ruleset:

```shell
docker pull sysdig/falco-event-generator
docker run -it --name falco-event-generator sysdig/falco-event-generator
```

#### Using custom rules with the Docker container

The Falco image has a built-in set of rules located at `/etc/falco/falco_rules.yaml` which is suitable for most purposes. However, you may want to provide your own rules file and still use the Falco image. In that case, you should add a volume mapping to map the external rules file to `/etc/falco/falco_rules.yaml` within the container by adding `-v path-to-falco-rules.yaml:/etc/falco/falco_rules.yaml` to your `docker run` command. This will overwrite the default rules with the user provided version.

In order to use custom rules in addition to the default `falco_rules.yaml`, you can place your custom rules in a local directory. Then mount this directory by adding `-v path-to-custom-rules/:/etc/falco/rules.d` to your `docker run` command.

### CoreOS

The recommended way to run Falco on CoreOS is inside of its own Docker container using the install commands in the [Docker section](#docker) above. This method allows full visibility into all containers on the host OS.

This method is automatically updated, includes some nice features such as automatic setup and bash completion, and is a generic approach that can be used on other distributions outside CoreOS as well.

However, some users may prefer to run Falco in the CoreOS toolbox. While not the recommended method, this can be achieved by installing Falco inside the toolbox using the normal installation method, and then manually running the `falco-probe-loader` script:

```shell
toolbox --bind=/dev --bind=/var/run/docker.sock
curl -s https://falco.org/script/install | bash
falco-probe-loader
```
