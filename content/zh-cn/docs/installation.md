---
title: 安装Falco
description: 在Linux系统和各种容器平台上运行
weight: 2
---

可以使用以下任意一种方法安装Falco。您特定基础设施的需求决定了选择哪种安装方法。

- 在一个Kubernetes集群中安装Falco。为此，需要部署一个DaemonSet到Kubernetes集群。安装Falco到Kubernetes集群上，可以监控整个集群、其工作节点以及运行容器的异常行为。
- 在Linux主机上安装Falco。这样做的原因有很多：
    - 监控运行在Kubernetes内的容器实例。直接安装在工作节点的操作系统上，为运行在Kubernetes中的应用程序和使用Kubernetes API的用户提供了额外的隔离级别。
    - 监控直接运行在Linux主机上的容器实例或者其他平台，比如Cloud Foundry或Mesosphere DC/OS。
    - 监控直接运行在Linux主机上的应用程序（比如非容器化的工作负载）。

## Kubernetes

在Kubernetes上运行Falco的默认方法是使用DaemonSet模式。Falco支持多种安装方法，具体取决于您选择的部署方法和底层Kubernetes版本。默认安装包括通过内核模块支持系统调用事件，因此依赖工作节点的底层操作系统。在工作节点上安装合适的内核头文件后，可以允许Falco在pod启动时，动态构建（和`insmod`）内核模块。Falco还为通用发行版和内核提供了许多预构建模块。如果模块编译失败，Falco将自动尝试下载预构建的模块。

对于像谷歌针对容器优化操作系统和GKE这样的平台，对底层内核的访问是有限的，具体请查看下文的[GKE章节](#gke)。

### 通过HTTPs下载内核模块

使用HTTPs预构建并向Falco pod提供内核模块。构建内核模块的最简单方法如下：

1. 在具有所需内核头的节点上部署Falco。
2. 使用Falco提供的`falco-driver-loader`脚本构建内核模块。
3. 将内核模块从pod或容器实例中移出。
    默认情况下, 内核模块会被复制到`/root/.falco/`。

`PROBE_URL` - 为Falco pod设置此环境变量，以覆盖预构建内核模块的默认主机。这应该只是URL的host部分，不带结尾的斜杠 - 比如`https://myhost.mydomain.com`。复制内核模块到`/stable/sysdig-probe-binaries/`目录，并命名为如下名称：`falco-probe-${falco_version}-$(uname -i)-$(uname -r)-{md5sum of kernel config}.ko`。

`falco-driver-loader` 脚本将默认以这种格式命名模块。

### Helm

Helm是在Kubernetes上安装Falco的首选方法之一。[Falco Helm chart](https://github.com/falcosecurity/charts)提供了丰富的[可配值](https://github.com/falcosecurity/charts/tree/master/charts/falco#configuration)，以使用不同的配置启动Falco。

在部署Helm的集群上，以默认配置部署Falco，请运行：

```shell
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
helm install falco falcosecurity/falco
```

从集群中删除Falco，请运行：
```
helm delete falco
```

#### Kubernetes Response Engine

使用Falco Helm chart是部署[Falco Kubernetes Response Engine (KRE)](https://github.com/falcosecurity/kubernetes-response-engine)最简单方法。KRE提供向NATS, AWS SNS, or Google Pub/Sub诸如此类的消息传递服务发送Falco警报的功能。这允许每个消息服务的订阅者处理Falco警报。请参考Helm chart中`integrations.*`这个[配置选项](https://github.com/helm/charts/tree/master/stable/falco#configuration)，以开启这个集成功能。

KRE还允许您部署安全剧本(通过无服务器的函数)，这样，当违反Falco规则时可以采取行动。有关如何部署所包含剧本的信息，请参阅[Response Engine documentation](https://github.com/falcosecurity/kubernetes-response-engine/tree/master/playbooks)。

### DaemonSet清单

要将Falco作为Kubernetes [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)来运行，请遵循以下说明。这些是Kubernetes的`generic`指令。有关其他特定平台的说明，请参阅相关部分。

1. 克隆[Falco仓库](https://github.com/falcosecurity/falco/)并切换有清单的目录。
```shell
git clone https://github.com/falcosecurity/falco/
cd falco/integrations/k8s-using-daemonset
```
2. 创建一个Kubernetes service account并提供必要的RBAC权限。Falco使用这个service account连接到Kubernetes API服务器并获取资源元数据。
```shell
kubectl apply -f k8s-with-rbac/falco-account.yaml
```
3. 为Falco pods创建一个Kubernetes service。这可以允许Falco接收Kubernetes审计日志事件。如果您不打算使用此功能，可以跳过此步骤。
```shell
kubectl apply -f k8s-with-rbac/falco-service.yaml
```

4. 部署DaemonSet还依赖Kubernetes ConfigMap来存储Falco配置，并使Falco pod可以使用该配置。这允许您管理自定义配置，而无需重新构建和重新部署底层的pod。为了创建ConfigMap：

  1. 创建`k8s-with-rbac/falco-config`文件目录。
  2. 将所需的配置从这个GitHub仓库复制到`k8s-with-rbac/falco-config/`目录中。

不要修改原始文件。使用您复制的文件进行任何配置更改。

```shell
mkdir -p k8s-with-rbac/falco-config
k8s-using-daemonset$ cp ../../falco.yaml k8s-with-rbac/falco-config/
k8s-using-daemonset$ cp ../../rules/falco_rules.* k8s-with-rbac/falco-config/
k8s-using-daemonset$ cp ../../rules/k8s_audit_rules.yaml k8s-with-rbac/falco-config/
```

5. 将您环境需要的自定义规则添加到`falco_rules.local.yaml`，它们将被Falco启动时候读取。您也可以修改`falco.yaml`，以更改部署所需的任何配置选项。按照以下方式创建configMap：
```shell
kubectl create configmap falco-config --from-file=k8s-with-rbac/falco-config
```

6. 创建完configMap依赖项之后，您现在就可以创建DaemonSet了。
```shell
kubectl apply -f k8s-with-rbac/falco-daemonset-configmap.yaml
```

7. 验证Falco正确启动。为此，请检查相应日志文件中Falco pod的状态。
```shell
kubectl logs -l app=falco-example
```

### Minikube

在本地环境中，在Kubernetes上使用Falco的最简单方法就是使用[Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/)。Kubernetes YAML清单和Helm chart都是定期使用Minikube进行测试过的。

#### Minikube内核模块

当使用默认的`--driver`参数运行`minikube`时，minikube创建一个VM来运行各种Kubernetes services，并创建一个容器框架来运行Pods等等。通常，不可能直接在Minikube VM上构建Falco内核模块，因为这个VM不包含运行内核的内核头文件。

为了解决这个问题，我们从falco 0.13.1开始，为最新的10个Minikube版本预先构建内核模块，并在[https://s3.amazonaws.com/download.draios.com](https://s3.amazonaws.com/download.draios.com)提供这些模块。这允许在下载回退步骤后，成功地加载内核模块。

展望未来，我们将继续为每个新的Falco版本支持10个最新版本的Minikube。目前我们保留了以前构建的内核模块供下载，因此我们也将继续提供有限的历史版本支持。

### GKE

谷歌Kubernetes引擎(GKE)使用针对容器优化的OS(COS)作为其工作节点池的默认操作系统。COS是一个安全增强的操作系统，它限制对底层操作系统的某些部分的访问。由于这个安全约束，Falco不能插入它的内核模块来处理系统调用的事件。但是，COS提供了利用eBPF(extended Berkeley Packet Filter)向Falco引擎提供系统调用流的能力。

## 开启eBPF支持

Falco只需要进行最小的配置更改，就可以使用eBPF。为此，将环境变量`FALCO_BPF_PROBE`设置为空值:`FALCO_BPF_PROBE=""`。

eBPF目前只被GKE和COS支持，但是我们这里提供了更广泛平台的安装细节。

**重要**：如果您想为探测文件指定一个替代路径，您还可以将`FALCO_BPF_PROBE`设置为已存在的eBPF探测路径。

### 获取探测器

在使用官方容器镜像时，设置这个环境变量将触发`falco-driver-loader`脚本，下载相应版本COS的内核头文件，然后编译合适的eBPF探测器。在所有其他环境中，您可以自己调用`falco-driver-loader` 脚本，通过以下方式实现：

```bash
sudo FALCO_VERSION="{{< latest >}}" FALCO_BPF_PROBE="" falco-driver-loader
```

要成功执行上述脚本，需要先安装`clang`和`llvm`。

### 在Kubernetes中使用Helm
如果使用Helm，您可以通过设置`ebpf.enable`这个配置项来启用eBPF。

```shell
helm install --name falco stable/falco --set ebpf.enabled=true
```

### 在Kubernetes中使用yaml文件

如果您正在使用提供的DaemonSet清单，请取消注释相应YAML文件中的以下行。

```yaml
          env:
          - name: FALCO_BPF_PROBE
            value: ""
```

### 本地通过安装包

如果您正在通过包安装Falco，您将需要编辑`falco`systemd单元。

您可以通过执行以下命令来实现：

```bash
systemctl edit falco
```

它将打开您的编辑器，此时您可以通过将此内容添加到文件中来设置单元的环境变量

```
[Service]
Environment='FALCO_BPF_PROBE=""'
```

### 本地使用Falco二进制文件

如果直接使用Falco二进制文件，可以启用BPF探测：

```bash
sudo FALCO_BPF_PROBE="" falco
```

## Linux

通过脚本安装、包管理器或配置管理工具(如Ansible)在Linux上直接安装Falco。直接在主机上安装Falco提供：

- 监控Linux主机异常的能力。虽然Falco的许使用场景是关注于运行容器化的工作负载，但Falco可以监视任何Linux主机的异常活动，容器(和Kubernetes)是可选的。
- 与容器调度器(Kubernetes)和容器运行时分离。在主机上运行的Falco，将从Falco配置和Falco守护进程的管理中移除容器调度器。如果容器调度程序被恶意的参与者破坏，这对于防止Falco被篡改非常有用。

### 脚本化安装 {#scripted}

要在Linux上安装Falco，可以下载一个负责必要步骤的shell脚本：

```shell
curl -o install_falco -s https://falco.org/script/install
```

然后使用`sha256sum`工具(或类似的工具)验证脚本的[SHA256](https://en.wikipedia.org/wiki/SHA-2)校验和。

```shell
sha256sum install_falco
```

它应该是`{{< sha256sum >}}`。

然后以root身份或使用sudo运行脚本：

```shell
sudo bash install_falco
```

### 包管理器安装 {#package}

#### CentOS/RHEL/Amazon Linux {#centos-rhel}

1. 信任falcosecurity GPG密钥并配置yum仓库：

   ```shell
   rpm --import https://falco.org/repo/falcosecurity-packages.asc
   curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
   ```

   > **注意** - 如果您希望使用当前主服务器的Falco包，请使用[falcosecurity-rpm-dev](https://falco.org/repo/falcosecurity-rpm-dev.repo)文件。

2. 安装EPEL仓库：

   > **注意** - 仅当发行版中没有DKMS时，才需要以下命令。您可以使用`yum list dkms`来验证DKMS是否可用。如果需要，安装它使用以下命令：

   ```shell
   yum install epel-release
   ```

3. 安装内核头：

   > **警告** - 下面的命令可能不适用于任何内核。确保正确地自定义包的名称。

   ```shell
   yum -y install kernel-devel-$(uname -r)
   ```

4. 安装Falco：

   ```shell
    yum -y install falco
   ```

   要卸载，运行`yum erase falco`。

#### Debian/Ubuntu {#debian}

1. 信任falcosecurity GPG密钥并配置apt仓库，然后更新包列表:

   ```shell
    curl -s https://falco.org/repo/falcosecurity-packages.asc | apt-key add -
    echo "deb https://download.falco.org/packages/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
    apt-get update -y
    ```

    > **注意** - 如果您希望使用来自当前主服务器的Falco包将https://download.falco.org/packages/deb-dev地址输入到falcosecurity.list文件中。

2. 安装内核头：

   > **警告** - 下面的命令可能不适用于任何内核。确保正确地自定义包的名称。

   ```shell
   apt-get -y install linux-headers-$(uname -r)
   ```

3. 安装Falco：
   ```shell
   apt-get install -y falco
   ```

   要卸载，运行`apt-get remove falco`。

### Docker

**注意:** 这些说明用于直接在Linux主机上运行Falco容器。有关在Kubernetes上运行Falco容器的说明，请参阅[Kubernetes章节](#kubernetes)。

如果您可以完全控制您的主机操作系统，那么建议使用常规安装方法安装Falco。此方法允许对主机OS上的所有容器进行完全的可见性。不需要改变标准的自动/手动安装流程。

然而，Falco也可以在[Docker](https://docker.com)容器中运行。为了保证顺利部署，必须在运行Falco之前在主机操作系统中安装内核头文件。

这通常可以在类似debian的发行版使用`apt-get`完成。

```shell
apt-get -y install linux-headers-$(uname -r)
```

在类似RHEL发行版上：

```shell
yum -y install kernel-devel-$(uname -r)
```

Falco可以使用Docker运行：

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

要查看它的运行情况，还需要运行事件生成器来执行触发Falco的规则集的操作：

```shell
docker pull sysdig/falco-event-generator
docker run -it --name falco-event-generator sysdig/falco-event-generator
```

#### 对Docker容器使用自定义规则

Falco镜像在`/etc/falco/falco_rules.yaml`文件中有一组内置的规则，适合于大多数场景。但是，您可能希望提供自己的规则文件并仍然使用Falco镜像。在这种情况下，您应该添加一个卷映射，通过添加`-v path-to-falco-rules.yaml:/etc/falco/falco_rules.yaml`到您的`docker run`命令，将外部规则文件映射到容器内的`/etc/falco/falco_rules.yaml`。这将使用用户提供的版本覆盖默认规则。

为了使用自定义规则，除了默认的`falco_rules.yaml`。您可以将自定义规则放在本地目录中。然后通过添加`-v path-to-custom-rules/:/etc/falco/rules.d`到您的`docker run`命令，以挂载这个目录。


### CoreOS

在CoreOS上运行Falco的推荐方法是使用上面的[Docker章节](#docker)中的安装命令，在自己的Docker容器中运行。此方法允许对主机操作系统上的所有容器进行完全的可见性。

这个方法是自动更新的，包括一些不错的特性，比如自动安装和bash自动补全，并且是一种通用的方法，可以在CoreOS之外的其他发行版上使用。

但是，有些用户可能更喜欢在CoreOS工具箱中运行Falco。虽然不是推荐的方法，但这可以通过使用常规安装方法在工具箱中安装Falco，然后手动运行`falco-driver-loader`脚本来实现：

```shell
toolbox --bind=/dev --bind=/var/run/docker.sock
curl -s https://falco.org/script/install | bash
falco-driver-loader
```
