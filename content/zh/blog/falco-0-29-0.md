---
title: Falco 0.29.0
date: 2021-06-21
author: Massimiliano Giovagnoli
slug: falco-0-29-0

---

今天我们宣布发布Falco 0.29.0 的夏季版本 🌱

这个版本修复了部分问题并新增了一些功能！

## 新事物 🆕

现在让我们回顾一下Falco 0.29.0带来的一些新东西。

### 新的仓库!

根据[本提案](https://github.com/falcosecurity/falco/blob/master/proposals/20210119-libraries-contribution.md) - 大多数人可能已经知道 - 仓库 [falcosecurity/libs](https://github.com/falcosecurity/libs)是 [`libscap`](https://github.com/falcosecurity/libs/tree/master/userspace/libscap), [`libsinsp`](https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp), 以及 Falco [drivers](https://github.com/falcosecurity/libs/tree/master/driver)的新家.

有了这个版本，libs贡献的最后一个缺失部分也完成了：构建系统现在更新为指向[新位置](https://download.falco.org/?prefix=driver/17f5df52a7d9ed6bb12d3b1768460def8439936d/)，[驱动程序版本](https://download.falco.org/?prefix=driver/17f5df52a7d9ed6bb12d3b1768460def8439936d/)也更新了。

### 新的libs版本!

更新至 [驱动](https://github.com/falcosecurity/libs/tree/master/driver) 版本 [17f5d](https://github.com/falcosecurity/libs) 带来以下功能/修复:

- [支持](https://github.com/falcosecurity/libs/pull/50) 追踪[userfaultd](https://www.kernel.org/doc/html/latest/admin-guide/mm/userfaultfd.html) 的系统调用
- [改进了](https://github.com/falcosecurity/libs/pull/32)  [`libsinsp`](https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp) 如何从容器运行时收集 Kubernetes pod 资源限制和 pod IP 
- libsinsp对大型集群场景的POD元数据和命名空间检索进行了[改进](https://github.com/falcosecurity/libs/pull/15) ，直接从容器标签获取它们，效率更高，并使用K8S API服务器作为后备。
- [修复](https://github.com/falcosecurity/libs/pull/22) 修复了许多用户在Falco上报告的问题，即在使用Clang>=10.0.0进行编译时，无法使用有效的BPF
- [修复](https://github.com/falcosecurity/libs/pull/42) 了在加载EBPF探测器时从BPF二进制文件中正确读取许可证，而不是始终从libscap加载器中读取许可证的问题

### 构建系统优化

最后，它介绍了必要的调整和改进，以使Falco构建系统与最近在 [libs](https://github.com/falcosecurity/libs) `CMakefile`中引入的更改（特别是PRs [#23](https://github.com/falcosecurity/libs/pull/23) 和 [#30](https://github.com/falcosecurity/libs/pull/30)）一起工作。　　　

### 更新rules

与往常一样，我们保持更新现有的rule并添加新的rule，比如在检测non-sudo和non-rootsetuid调用时 [消除误报](https://github.com/falcosecurity/falco/pull/1665) 。

通过在监视在`kube-system` 命名空间中创建的服务帐户时 [忽略](https://github.com/falcosecurity/falco/pull/1659) 其他已知的Kubernetes服务帐户，其他误报已被删除。

通过添加要检测的 [附加域](https://github.com/falcosecurity/falco/pull/1676) ，还对anti-miner 检测进行了改进。

完整列表请查看 [changelog](https://github.com/falcosecurity/falco/releases/tag/0.29.0)。

### 未来

现在， [libscap](https://github.com/falcosecurity/libs/tree/master/userspace/libscap), [libsinsp](https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp),和两个Falco [驱动程序](https://github.com/falcosecurity/libs/tree/master/driver) 已经贡献给了CNCF，我们正在朝着使人们能够通过在他们的OSS项目中直接使用这些库而受益的方向前进，就像Falco现在所做的那样。

出于这个原因，我们引入了一个关于libs的版本控制和发布过程的 [提案](https://github.com/falcosecurity/libs/pull/44)（感谢 [@leodido](https://github.com/leodido)）。


---

## 体验一下!

像往常一样，如果你只是想尝试稳定的Falco 0.29.0，你可以按照文档中概述的过程安装软件包：

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

你更喜欢使用容器镜像吗？一点问题都没有！🐳

您可以在[文档](https://falco.org/docs/getting-started/running/#docker)中阅读有关使用Docker运行Falco的更多信息。

**Notice** ：感谢Jonah, 他是[Falco Open Infra](https://github.com/falcosecurity/test-infra)维护者之一, 您还可以在公共AWS ECR gallery上找到FalcoSecurity容器镜像：

- [falco](https://gallery.ecr.aws/falcosecurity/falco)
- [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
- [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

This makes part of an effort to publish Falco container images on other registries that began while cooking up Falco 0.27.0.

这是在其他注册中心发布Falco容器镜像的努力的一部分，这些注册中心是在创建Falco 0.27.0时开始的


## 我们见面吧 🤝

像往常一样，我们每周都会在[社区电话](https://github.com/falcosecurity/community)中见面，

如果你想知道最新最好的，你应该加入我们！

如果你有任何问题

- 在 [Kubernetes Slack](https://slack.k8s.io)加入 [#falco channel](https://kubernetes.slack.com/messages/falco) 
- 加入 [Falco 邮箱列表](https://lists.cncf.io/g/cncf-falco-dev)

感谢所有了不起的贡献者！Falco达到了100个贡献者，而且所有其他Falco项目每天都收到大量的贡献。

Keep up the good work!

Ciao!

Max
