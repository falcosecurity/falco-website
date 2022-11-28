---
title: Falco 0.28.0 a.k.a. Falco 2021.04
date: 2021-04-09
author: Leonardo Di Donato
slug: falco-0-28-0
---

今天我们宣布春季发布Falco 0.28.0

这是Falco在2021年的第二次发布！

您可以在此处查看一组更改：

- 0.28.0 https://github.com/falcosecurity/falco/releases/tag/0.28.0

像往常一样，如果您只想试用稳定的 Falco 0.28.0，您可以按照文档中概述的过程安装其软件包：

- CentOS/Amazon Linux https://falco.org/docs/getting-started/installation/#centos-rhel
- Debian/Ubuntu https://falco.org/docs/getting-started/installation/#debian
- openSUSE https://falco.org/docs/getting-started/installation/#suse
- Linux binary package https://falco.org/docs/getting-started/installation/#linux-binary

您更喜欢使用容器镜像吗？ 一点问题都没有！

您可以在文档中阅读有关使用 Docker 运行 Falco 的更多信息。docs https://falco.org/docs/getting-started/running/#docker.

请注意，从此版本开始，感谢我们的 Falco Infra 维护者之一 Jonah，您还可以在 AWS ECR 库上找到 falco-no-driver 容器镜像https://gallery.ecr.aws/falcosecurity/falco-no-driver。 falco-driver-loader 容器镜像也是如此https://gallery.ecr.aws/falcosecurity/falco-driver-loader。 这是在其他注册中心上发布 Falco 容器镜像的一部分，这些镜像是在制作 Falco 0.27.0 时开始的。


## 新鲜事

现在让我们回顾一下 Falco 0.28.0 带来的一些新东西。

如需完整列表，请访问更新日志。https://github.com/falcosecurity/falco/releases/tag/0.28.0

### 重大变化

在我们深入研究之前，重要的是要注意此版本引入了一些重大更改。
由于 bintray 正在停止 city_sunrise，所有官方支持的发行版的 Falco 软件包将从现在开始在 https://download.falco.org 上发布。

我们已经移动了包存储库和以前的 Falco 版本（包括从 Falco 0.26.1 开始的开发版本和从 Falco 0.20.0 开始的所有稳定版本）。

所以你现在就可以开始使用新的包存储库了！这是升级 Falco 存储库设置的分步指南。 

请不要再使用Falco Bintray存储库。

另请注意，DEB和RPM包现在使用systemd black_circlearrow_backward代替以前的init.d服务单元。

另一个值得一提的变化是我们明确删除了 Falco 容器映像使用的 SKIP_MODULE_LOAD 环境变量以跳过驱动程序加载。 Falco 0.24.0 已弃用它。如果您仍在使用，请切换到使用名为 SKIP_DRIVER_LOADER 的新环境变量。

### 异常

正如声明的那样，结构化规则异常的支持已经被合并了。

它是一种定义附加条件的机制，当匹配时，会导致Falco引擎不发出相对Falco警报。

您可以在建议此功能的文档中阅读更多有关此功能的信息。

请注意，缺省的Falco规则集目前没有使用异常，但是如果这个特性适合您的需要，您肯定可以使用它编写自己的Falco规则。

### healthz

多亏了Carlos, Falco Kubernetes web服务器现在公开了一个/healthz端点。

它可以用于检查Falco是否启动并运行。这是Falco Helm海图用户要求改进的功能。

### Falco驱动加载器

Falco驱动程序加载器是一组bash在Falco容器启动时做神奇的事情，它首先会尝试为当前主机检测和下载预构建的Falco驱动程序(当前的预构建驱动程序列表在这里可用)，然后才会尝试编译一个正在运行的Falco驱动程序。

我们决定反转这种逻辑，因为我们有4K+的预构建驱动程序，以及一有新发行版和新内核诞生就更新它们的机制。

这样，在大多数情况下，Falco容器的引导时间应该会大大提高，如果我们已经为您构建了一个Falco驱动程序，就可以避免为您的主机编译一个Falco驱动程序。

### 可调

falco.yaml 中的 syscall_event_drops 配置项获得了一个新子项（阈值），您可以使用它来调整 drop 的噪音。

它代表一个百分比，因此您可以为其提供一个介于 0 和 1 之间的值。 默认为 0.1，如果需要，请随意尝试。

## 其他的一切

### 引擎修复

Falco引擎中的一个bug，准确地说，在Falco规则语言中，阻止数字被正确解析，最终被修复。

另外，另一个关于如何在多值字段中处理缺失值(NA)的错误。)现在是固定的，不再存在。

### 规则

和往常一样，我们的社区在改进Falco规则方面做得很好!

这个版本对各种宏、列表和规则进行了大量改进。查看变更日志(规则部分)以获得关于它们的详细信息。

三个新的规则，Debugfs在特权容器中启动，Mount在特权容器中启动，Sudo潜在特权升级(非常有用，可以及时提醒你CVE-2021-3156)也已经引入。

## 接下来是什么

我们计划在2021年5月4日发布0.28.1 !

和往常一样，最终发布日期将在Falco社区会议期间讨论。

和往常一样，我们将进行bug修复和改进。

## 让我们见面

和往常一样，我们每周都会在我们的社区电话中见面，如果你想知道最新的和最好的，你应该在那里加入我们!

如果你有任何问题

- 加入Kubernetes Slack上的#falco频道 https://kubernetes.slack.com/messages/falco https://slack.k8s.io
- 加入Falco邮件列表 https://lists.cncf.io/g/cncf-falco-dev

感谢所有了不起的贡献者!Falco有100名贡献者，而且Falco的所有其他项目每天都在接受至关重要的贡献。

再接再厉!

Bye!

Leo

