---
title: Falco 0.30.0
date: 2021-10-01
author: Frederico Araujo
slug: falco-0-30-0
tags: ["Falco","Release"]
---

今天我们宣布秋季发布 Falco 0.30.0

此版本包括新功能、重要修复和令人兴奋的 libs 插件系统建议！
https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0300

新奇
让我们回顾一下 新版本的一些亮点.

新功能和修复
此版本引入了一个新的 --k8s-node 命令行选项 （ #1671 ），允许在向 K8s API 服务器请求 Pod 元数据时按节点名称进行过滤。通常，它应该设置为运行Falco的节点。如果为空，则不设置筛选器，这可能会对大型群集造成性能损失。这一新功能代表了 Falco 的重大性能改进，并关闭了期待已久的修复程序，该问题已由生产规模的 Kubernetes 集群上的许多 Falco 部署所确认。
https://github.com/falcosecurity/falco/pull/1671
https://github.com/falcosecurity/libs/issues/43
https://github.com/falcosecurity/libs/pull/40
https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp
https://github.com/falcosecurity/falco/pull/1667

对驱动程序版本 3aa7a83 的更新完成了从容器业务流程协调程序收集元数据的性能增强，并包括对 libsinsp 公共 API 的改进，允许使用者修改确定从 Kubernetes 或 Mesos 等业务流程协调程序收集元数据的行为的关键参数。这些参数现在在 Falco 中作为可自定义设置公开，使用户能够根据其部署调整元数据获取行为。默认值为：
https://github.com/falcosecurity/libs/tree/master/driver
https://github.com/falcosecurity/libs/tree/3aa7a83bf7b9e6229a3824e3fd1f4452d1e95cb4

metadata_download:
  max_mb: 100
  chunk_wait_us: 1000
  watch_freq_sec: 1
此版本还添加了在 gRPC 和 JSON 输出中导出规则标记和事件源的功能！可以配置此行为，并使 Falco 事件使用者（如 Falco Sidekick）能够充分利用 Falco 的事件标记功能。快乐标记:)
https://github.com/falcosecurity/falco/pull/1714
https://github.com/falcosecurity/falco/pull/1733

库插件系统提案
关于libs插件系统的提案已被接受，我们非常兴奋！可能性是无限的！
https://github.com/falcosecurity/falco/blob/master/proposals/20210501-plugin-system.md
https://github.com/falcosecurity/plugins

插件将允许用户轻松扩展库的功能，从而扩展 Falco 和基于库的任何其他工具的功能。这个提案特别关注两种类型的插件：源插件和提取器插件。源插件实现一个新的 sinsp/scap 事件源（例如，“k8s_audit”），而提取器插件专注于从其他插件或核心库生成的事件中提取字段。

插件是动态库（Unix 中的 .so 文件，.dll 窗口中的文件），它们导出库将识别的最小函数集。它们可以用任何语言编写，只要它们导出所需的函数即可。然而，Go 是编写插件的首选语言，其次是 C/C++。为了方便插件的开发，我们开发了一个 golang SDK。
https://github.com/falcosecurity/plugin-sdk-go

实验插件系统和SDK现在都在Falco组织中孵化项目，并包括一组初始示例。我们邀请社区试用它们，贡献新的插件，并共同努力共同构建云原生运行时安全的基础！
https://github.com/falcosecurity/plugins
https://github.com/falcosecurity/plugin-sdk-go
https://github.com/falcosecurity/falco/blob/master/proposals/20210501-plugin-system.md#examples

新的法尔科发布时间表
最后，在与社区讨论后，已经批准了Falco的新发布时间表。新版本现在每年发布三次：1 月底、5 月底和 9 月底。我们将继续在主要版本之间发布热修复程序和次要补丁。与往常一样，欢迎反馈、错误报告和贡献！
https://github.com/falcosecurity/falco/pull/1711

尝试一下!
像往常一样，如果您只想试用稳定的 Falco 0.30.0，您可以按照文档中概述的过程安装其软件包：

CentOS/Amazon Linux CentOS/Amazon Linux
https://falco.org/docs/getting-started/installation/#centos-rhel
Debian/Ubuntu
https://falco.org/docs/getting-started/installation/#debian
openSUSE
https://falco.org/docs/getting-started/installation/#suse
Linux二进制包
https://falco.org/docs/getting-started/installation/#linux-binary
你更喜欢使用容器映像吗？完全没有问题！

您可以在文档中阅读有关使用 Docker 运行 Falco 的更多信息。
https://falco.org/docs/getting-started/running/#docker

您还可以在公有 AWS ECR 库上找到 Falcosecurity 容器映像：

falco
https://gallery.ecr.aws/falcosecurity/falco
falco-no-driver
https://gallery.ecr.aws/falcosecurity/falco-no-driver
falco-driver-loader 
https://gallery.ecr.aws/falcosecurity/falco-driver-loader
crystal_ball下一步是什么 
Falco 0.31.0预计将于2022年1月发布！


像往常一样，最终发布日期将在Falco社区电话会议期间讨论。
https://github.com/falcosecurity/community

让我们认识
与往常一样，我们每周都会在社区电话中见面，如果您想了解最新和最伟大的，您应该加入我们！
https://github.com/falcosecurity/community

如果您有任何问题

加入Kubernetes Slack 上的#falco频道
加入falco邮件列表
https://kubernetes.slack.com/?redir=%2Fmessages%2Ffalco
https://communityinviter.com/apps/kubernetes/community
https://lists.cncf.io/g/cncf-falco-dev

感谢所有出色的贡献者！Falco达到了100个贡献者，所有其他Falco项目每天都会收到大量贡献。

特别感谢Falco Sidekick，它刚刚在docker hub上突破了150万个docker pull的大关！
https://github.com/falcosecurity/falcosidekick

继续努力！

Bye!

Fred

