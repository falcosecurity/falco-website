---
exclude_search: true
title: Falco 0.23.0 a.k.a. "the artifacts scope release"
date: 2020-05-18
author: Leonardo Grasso, Lorenzo Fontana
slug: falco-0-23-0
---

又一个月过去了，Falco继续成长！

今天我们宣布发布 Falco 0.23 🥳

想知道为什么这个版本被称为“The Artifacts Scope”版本吗？ 请在此处阅读更多内容。(https://github.com/falcosecurity/falco/blob/master/proposals/20200506-artifacts-scope-part-2.md).

你可以在这里看到全部的变化:

- [0.23.0](https://github.com/falcosecurity/falco/releases/tag/0.23.0)

如果你只是想尝试稳定的Falco 0.23，你可以按照文档中列出的通常过程安装它的包:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)

你更喜欢使用docker镜像吗？ 没问题！

```bash
docker pull falcosecurity/falco-no-driver:latest # The most recent version
docker pull falcosecurity/falco-no-driver:0.23.0 # A specific version of Falco such as 0.23.0
docker pull falcosecurity/falco-driver-loader:latest # The most recent version of falco-driver-loader with the building toolchain
docker pull falcosecurity/falco-driver-loader:0.23.0 # A specific version of falco-driver-loader such as 0.23.0 with the building toolchain
docker pull falcosecurity/falco:latest # The most recent version with the falco-driver-loader included
docker pull falcosecurity/falco:0.23.0 # A specific version of Falco such as 0.23.0 with falco-driver-loader included
```

请注意:我们现在建议不要直接使用falcosecurity/falco:latest，而是先使用falcosecurity/falco-driver-loader映像，然后使用falcosecurity/falco-no-driver:latest。falcosecurity/falco:latest没有任何用途，我们只是想提供一种方法来做同样的事情，但分成两个独立的进程，以降低正在运行的falco容器的攻击面。点击这里阅读更多关于镜像重组的信息。(https://github.com/falcosecurity/falco/blob/master/proposals/20200506-artifacts-scope-part-2.md#images).

##重大变化

- 现在，在包和 falco-driver-loader脚本中，内核模块和 eBPF探测器在 falco-probe.ko 和 falco-probe.o 之前分别被引用为falco.ko和falco.o。 在使用内核模块安装Falco的情况下，由于名称不同，这可能会导致加载重复的模块。确保您没有重复的模块 
- 用于使用自定义存储库下载驱动程序的 falco-driver-loader 脚本环境变量现在使用 DRIVERS_REPO 环境变量而不是 DRIVER_LOOKUP_URL。 此变量必须包含包含以下目录结构 `/$driver_version$/falco_$target$_$kernelrelease$_$kernelversion$.[ko|o]`.

##规则更新(耶耶!我们总是改进默认的规则集!!)

- 规则(重定向STDOUT/STDIN到容器中的网络连接):根据规则命名约定正确的规则名称
- 规则（将标准输出/标准输入重定向到容器中的网络连接）：检测将标准输出/标准输入重定向到容器中的网络连接的新规则
- 规则(K8s秘码创建):跟踪Kubernetes秘密创建的新规则(不包括kube系统和服务账户秘码)
- 规则(K8s秘码删除):跟踪Kubernetes秘密删除的新规则(不包括kube系统和服务账户秘码)

##一些统计数据

合并了 35 个拉取请求，其中 18 个包含直接针对我们最终用户的更改。

自上次发布以来，有 72 次提交，那是一个月前。

##即将发生的事情

我们将在Falco gRPC API中合并对unix套接字的支持和#1217，更重要的是，在这个发布周期中，(https://github.com/falcosecurity/falco/pull/1217)，社区决定采用pdig(https://github.com/falcosecurity/pdig)，作为存储库(这里了解这意味着什么)。(https://github.com/falcosecurity/falco/blob/master/proposals/20200506-artifacts-scope-part-1.md#falco-project-evolution)，pdig将允许Falco完全运行在用户空间中。当Falco部署在无法加载内核模块或eBPF探针的环境中时，这非常有用。我们的社区成员已经创建了两个项目，用于部署Falco和pdig作为驱动程序，Falco -trace(https://github.com/kris-nova/falco-trace)和Falco -inject(https://github.com/fntlnz/falco-inject).。我们期待着通过这些方案或作出不同的决定。


下个月见，还有更多精彩的事情！

