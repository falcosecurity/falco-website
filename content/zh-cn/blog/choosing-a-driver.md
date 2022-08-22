---
title: Choosing a Falco driver
description: Understanding which Falco driver is right for you
date: 2020-09-23
author: Kris Nóva
slug: choosing-a-driver
---

Falco的工作原理是在运行时获取Linux系统调用信息，并在内存中重建内核的状态。
Falco引擎依赖于一个驱动程序来使用原始的系统调用信息流。
目前，Falco项目支持3种不同的驱动程序，其中引擎可以使用这些信息。

 - 内核模块
 - eBPF探头
 - 用户空间程序  
 
本博客将重点介绍每个实现的细微差别，并解释它们存在的原因。
希望此资源将为您了解适合您的用例驱动程序提供一个起点。

*Updated: Falco 0.26.0*

---

## 内核模块

Falco内核模块是从内核获取所需数据流的传统方式。

_Source_: [github.com/draios/sysdig/driver](https://github.com/draios/sysdig/tree/dev/driver)

必须加载内核模块才能启动Falco。
内核模块依赖于'linux headers'包进行编译。 [More information
](https://falco.org/docs/source/).

_Note_: A convenience script found [here](https://github.com/falcosecurity/falco/blob/master/scripts/falco-driver-loader)

#### 使用内核模块
 
```bash
cd ~
git clone git@github.com/falcosecurity/falco
cd falco
mkdir build
cd build
cmake ../ \
      -DBUILD_BPF=OFF \
      -DBUILD_WARNINGS_AS_ERRORS="OFF" \
      -DCMAKE_BUILD_TYPE="Release" \
      -DCMAKE_INSTALL_PREFIX="/usr" \
      -DFALCO_ETC_DIR="/etc/falco" \
      -DUSE_BUNDLED_DEPS=ON
make driver
sudo insmod driver/falco.ko
sudo falco
```

#### 优点

内核模块是Falco最常用的驱动程序，可以在任何可以信任和可以加载内核模块的环境中使用。

 - 该模块可以构建、托管，并直接安装到托管系统上。
 - The Falco community offers [limited support](https://falco.org/docs/getting-started/installation/) for pre-building kernel modules.
 - 无论内核版本如何，都能正常工作（与eBPF相比）

#### 缺点

 - 与主机内核以及不断变化的内核版本、体系结构、操作系统紧密结合，可能会带来复杂性。
 - 出现故障的内核模块可能会导致Linux内核死机或崩溃。
 - 在某些环境中，加载内核模块并不总是受信任或允许的。
 
#### 概要 

内核模块是运行Falco最快、最常见的方式。在任何信任访问主机内核的环境中，它们都是一个可行的解决方案。

 - Kubernetes 
 - AWS EC2 (kops, eks, kubeadm) 允许在任何地方访问主机
 - Azure 
 - IBM Cloud
 
 ---
 
## eBPF探头

在内核模块不受信任或不允许环境中，Falco eBPF探测器是一种可行的选择。
这种环境最常见的示例是GKE。在GKE中运行Falco是创建eBPF探针的最初用例。

_Source_: [github.com/draios/sysdig/driver/bpf](https://github.com/draios/sysdig/tree/dev/driver/bpf)

为了启动Falco，必须加载eBPF探针，它将提供与内核模块相同的流量度量指标。
Falco应该使用这种方法无缝地工作。

#### 使用eBPF探头

_Note_: Notice the `-DBUILD_BPF=ON` flag
_Note_: A convenience script found [here](https://github.com/falcosecurity/falco/blob/master/scripts/falco-driver-loader)

```bash
cd ~
git clone git@github.com/falcosecurity/falco
cd falco
mkdir build
cd build
cmake ../ \
      -DBUILD_BPF=ON \
      -DBUILD_WARNINGS_AS_ERRORS="OFF" \
      -DCMAKE_BUILD_TYPE="Release" \
      -DCMAKE_INSTALL_PREFIX="/usr" \
      -DFALCO_ETC_DIR="/etc/falco" \
      -DUSE_BUNDLED_DEPS=ON
make bpf
cp driver/bpf/falco.o ${HOME}/.falco/probe.o
sudo falco
```

#### 优点

 - eBPF 探针可以在 GKE 等无法加载内核模块的环境中运行。
 - eBPF被认为更安全，并且不能使内核崩溃或崩溃。eBPF代码已经编译到Linux内核中，只需使用eBPF程序即可启用。
 - eBPF探测器可以在运行时动态加载到内核中，不需要使用诸如“dkms”、“modprobe”或“insmod”之类的工具来加载程序。

#### 缺点

 - eBPF 探针不适用于每个系统。
 - 您至少需要 Linux 内核版本 4.14，但 Falco 项目建议使用 4.14/4.19 或更高版本的 LTS 内核。

#### 概要 

当加载内核模块不可用时，应该使用 eBPF 探针。
不加载内核模块的原因可能会改变，在这种情况下，eBPF 探针是默认的。

 - Kubernetes
 - GKE
 - 不信任或不支持加载内核模块的环境
 
 ---
 
## pdig

当内核模块和eBPF探测都不适用时，' pdig '二进制文件是最新的、最可行的出路。
这种环境最常见的例子是带有Fargate的AWS ECS。

“pdig”工具是基于“ptrace（2）”构建的。它需要为容器运行时启用“CAP_SYS_PTRACE”。 
“pdig”工具支持一种新的方法，在流程级别使用关于给定应用程序的指标。

_Note_: The eBPF probe and kernel module work at a global host level, whereas `pdig` works at a process level. A clever invocation of `pdig` against a system can simulate a broader scope of system parsing. PID 1 is sometimes of interest.

_Source_: [github.com/falcosecurity/pdig](https://github.com/falcosecurity/pdig)

#### 优点

 - 轻量级、安全且特定于流程
 - 仅在用户空间中运行
 - 在内核模块和eBPF探测器不可用的情况下启用Falco
 
#### 缺点

 - 对' ptrace(2) '的依赖周期很久。
 - 需要使用'pdig'二进制文件执行Falco来植入驱动程序。
 
#### 概要

“pdig”工具是所有驱动程序中最独特的，它可以实现其他方式无法实现的功能。

 - Kubernetes
 - AWS ECS/Fargate 
 - AWS EKS/Fargate
 - 不支持内核模块和eBPF的环境
 
--- 

## 建议的云提供商实施

| Solution             | Suggested Driver            | More Resources                                                                                         |
|----------------------|-----------------------------|--------------------------------------------------------------------------------------------------------|
| Baremetal Kubernetes | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| Kubeadm Kubernetes   | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| Kubernetes Kind      | Kernel Module               | [Kind Documentation](https://falco.org/docs/third-party/#kind)                                         |
| Minikube             | Kernel Module               | [Minikube Documentation](https://falco.org/docs/third-party/#minikube)                                 |
| AWS EKS              | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| Azure                | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| GKE                  | eBPF Probe                  | [Falco on GKE](https://falco.org/docs/third-party/#gke)                                                |
| IBM Cloud            | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| OpenShift            | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| AWS ECS              | pdig                        | [pdig](https://github.com/falcosecurity/pdig) [falco-trace](https://github.com/kris-nova/falco-trace)  |
| AWS EKS (Fargate)    | pdig                        | [pdig](https://github.com/falcosecurity/pdig) [falco-inject](https://github.com/fntlnz/falco-inject)  |
| ARM/Raspberry PI     | eBPF Probe *Kernel specific |                                                                                                        |


