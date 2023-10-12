---
exclude_search: true
title: Falco 0.22 a.k.a. "the hard fixes release"
date: 2020-04-17
author: Leonardo Di Donato, Lorenzo Fontana
slug: falco-0-22-x
---

又一个月过去了，Falco 继续成长！

今天我们宣布发布 Falco 0.22🥳

您可以在此处查看整个更改集：

- 0.22.0 - 感谢Leonardo Grasso首次发布！
- 0.22.1 - 我和Lorenzo Fontana的修补程序

如果您只想试用稳定的 Falco 0.22，您可以按照文档中概述的常规过程安装其软件包：

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel-amazon-linux)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian-ubuntu)

你更喜欢使用docker镜像吗？没问题！

```bash
docker pull falcosecurity/falco:0.22.1
docker pull falcosecurity/falco:0.22.1-minimal
docker pull falcosecurity/falco:0.22.1-slim
```

## 值得注意的变化

此版本包含许多针对长期存在的棘手错误的修复！

但也有一些新功能 😊

如果您自己管理 Falco 驱动程序，请确保将它们更新到版本 a259b4bf49c3330d9ad6c3eed9eb1a31954259a6（参考此处）。(https://github.com/falcosecurity/falco/blob/9f6833e1dbd95b10f7d672d457cec70b5e19e5c1/cmake/modules/sysdig.cmake#L29)).

###eBPF驱动程序

一些用户报告了让eBPF驱动程序在GKE上工作的问题。

这个版本最终引入了一个修复它。

###值

一些用户报告他们在警报中获得了 docker 和 Kubernetes 元数据的 <NA> 值。

使用以下拉取请求 falco#1133、falco#1138和falco#1140，问题现在应该得到明确的修复，正如测试包含修复的Falco开发版本的用户所报告的那样。

###Falco版本和驱动程序版本现在不同了！

经过对Falco进行更好的模块化的过程，现在Falco版本和它的驱动程序版本最终是两个截然不同的东西！

显然，为了获得这一点，packagin 系统和 falco-driver-loader 脚本中都需要一些 PRsstd_out_tongue_closed_eyes。

- [falco#1111](https://github.com/falcosecurity/falco/pull/1111)
- [falco#1148](https://github.com/falcosecurity/falco/pull/1148)

### 规则，规则无处不在！

此版本也有很多规则更改。
此版本也有很多规则更改。 最值得注意的是vicenteherrera创建了许多新规则：

- 完整的 K8s 管理权限
- 没有创建 TLS 证书的入口对象
- 不受信任的节点成功加入集群
- 不信任节点尝试加入集群失败
- 本地子网之外的网络连接
- 出站或入站流量未到授权服务器进程和端口

谢谢Vicente! 🙌🏻

### 同步CRI元数据获取

感谢 PR falco#1099，用户现在可以禁用 CRI 元数据的异步获取，强制它同步。

为此，只需将 --disable-cri-async 标志传递给Falco。

虽然这会减慢 Falco 事件处理并导致丢弃率提高，但它有助于减少容器元数据的空值。

在使用此标志之前，请试用此版本，因为它包含针对此主题的其他修复！

##一些统计数据

23合并了 23 个拉取请求，其中 18 个包含直接针对我们最终用户的更改。

49自上次发布以来，在 30 天内提交了 49 次。

##即将发生的事情

驱动程序构建网格已基本准备就绪。

只是缺少一些改进，然后Falco将在安装过程中再次下载一组预构建的驱动程序（内核模块和eBPF探测器）！

