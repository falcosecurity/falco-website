---
title: Falco 0.29.0
date: 2021-06-21
author: Massimiliano Giovagnoli
slug: falco-0-29-0
tags: ["Falco","Release"]
---

今天我们宣布夏季发布 Falco 0.29.0

这个版本带来了许多新功能和修复！

新奇
现在让我们回顾一下Falco 0.29.0带来的一些新东西。

新的库存储库！
根据这个提议 - 你们中的许多人可能已经知道 - 仓库falcosecurity/libs是libscap ， libsinsp和Falco驱动程序的新家。
https://github.com/falcosecurity/falco/blob/master/proposals/20210119-libraries-contribution.md
https://github.com/falcosecurity/libs
https://github.com/falcosecurity/libs/tree/master/driver

在此版本中，还完成了libs贡献中最后一个缺失的部分：构建系统现在更新为指向新位置，驱动程序版本也已更新。

新的库版本！
驱动程序版本17f5d的更新带来了新功能/修复：
https://github.com/falcosecurity/libs/tree/master/driver
https://github.com/falcosecurity/libs

支持跟踪用户故障系统调用
https://github.com/falcosecurity/libs/pull/50
https://www.kernel.org/doc/html/latest/admin-guide/mm/userfaultfd.html
改进了libsinsp如何从容器运行时收集Kubernetes Pod资源限制和 Pod IP
https://github.com/falcosecurity/libs/pull/32
https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp
改进了大型集群场景的 Pod 元数据和命名空间检索的 libsinsp ，直接从容器标签获取它们，效率更高，并使用 K8s API 服务器作为后备
https://github.com/falcosecurity/libs/pull/32
https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp
修复了许多用户在 Falco 上报告的问题，即使用 Clang >= 10.0.0 进行编译时无法使用有效的 BPF 探测器
https://github.com/falcosecurity/libs/pull/22
修复了在加载 eBPF 探测器时正确读取 BPF 二进制文件许可证的问题，而不是始终从 libscap 加载器读取许可证的问题
https://github.com/falcosecurity/libs/pull/42

建筑系统的改进
最后，它引入了必要的调整和改进，使Falco建筑系统能够与最近在libs CMakefile s中引入的更改（特别是PR #23 和 #30 ）一起使用。
https://github.com/falcosecurity/libs
https://github.com/falcosecurity/libs/pull/23
https://github.com/falcosecurity/libs/pull/30

更新规则
像往常一样，我们不断改进现有规则并添加新规则，例如在检测非 sudo 和非根 setuid 调用时删除误报。
https://github.com/falcosecurity/falco/pull/1665

在监视在 kube-system 命名空间中创建的服务帐户时，通过忽略其他已知的Kubernetes服务帐户，消除了其他误报。
https://github.com/falcosecurity/falco/pull/1659

通过添加要检测的其他域，还改进了反矿工检测。
https://github.com/falcosecurity/falco/pull/1676

有关完整列表，请访问 更新日志 。
https://github.com/falcosecurity/falco/releases/tag/0.29.0

关于未来
现在libscap，libsinsp和两个Falco驱动程序已经贡献给CNCF，我们正朝着使人们能够通过直接在他们的OSS项目中使用它们来使人们从中受益的方向发展，就像现在由Falco所做的那样。
https://github.com/falcosecurity/libs/tree/master/userspace/libscap
https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp
https://github.com/falcosecurity/libs/tree/master/driver

出于这个原因，我们引入了一个关于库工件的版本控制和发布过程的建议（感谢 @leodido ）。
https://github.com/falcosecurity/libs/pull/44-

尝试一下!
像往常一样，如果您只想试用稳定的 Falco 0.29.0，您可以按照文档中概述的过程安装其软件包：

CentOS/Amazon Linux CentOS/Amazon Linux
https://falco.org/docs/getting-started/installation/#centos-rhel
Debian/Ubuntu
https://falco.org/docs/getting-started/installation/#debian
openSUSE
https://falco.org/docs/getting-started/installation/#suse
Linux二进制包
你更喜欢使用容器映像吗？完全没有问题！

您可以在文档中阅读有关使用 Docker 运行 Falco 的更多信息。
https://falco.org/docs/getting-started/running/#docker

请注意，感谢我们的 Falco Open Infra 维护者之一 Jonah，您还可以在公共 AWS ECR 库上找到 Falcosecurity 容器映像：
https://github.com/falcosecurity/test-infra

falco
falco-no-driver
falco-driver-loader 
这是在其他注册表上发布 Falco 容器映像的努力的一部分，这些映像始于制作 Falco 0.27.0。

让我们认识handshake
与往常一样，我们每周都会在社区电话中见面，如果您想了解最新和最伟大的，您应该加入我们！
https://github.com/falcosecurity/community

如果您有任何问题

加入 Kubernetes Slack 上的#falco频道
https://kubernetes.slack.com/?redir=%2Fmessages%2Ffalco
加入falco邮件列表
https://communityinviter.com/apps/kubernetes/community
感谢所有出色的贡献者！Falco达到了100个贡献者，但所有其他Falco项目每天都会收到大量贡献。
https://lists.cncf.io/g/cncf-falco-dev

继续努力！

Ciao!

Max

