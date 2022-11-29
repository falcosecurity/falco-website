---
title: Falco 0.28.0 a.k.a. Falco 2021.04
date: 2021-04-09
author: Leonardo Di Donato
slug: falco-0-28-0
---

今天我们宣布Falco 0.28.0的春季发布



这是Falco在2021年的第二个版本!



您可以在这里查看更改集:



- [0.28.0](https://github.com/falcosecurity/falco/releases/tag/0.28.0)



和往常一样，如果你只是想尝试稳定的Falco 0.28.0，你可以按照文档中列出的过程安装它的包:



- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)

- [Debian/Ubuntu] (https://falco.org/docs/getting-started/installation/ Debian)

- [openSUSE] (https://falco.org/docs/getting-started/installation/ suse)

- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)



您是否更喜欢使用容器镜像?完全没问题!



您可以在[docs](https://falco.org/docs/getting-started/running/#docker)中阅读更多关于使用Docker运行Falco的信息。



注意从这个版本开始，感谢Jonah，我们的Falco Infra维护者之一，你也可以在[AWS ECR gallery](https://gallery.ecr.aws/falcosecurity/falco-no-driver)上找到Falco -no-driver容器镜像。falco-driver-loader容器镜像([link](https://gallery.ecr.aws/falcosecurity/falco-driver-loader))也是如此。这是在制作Falco 0.27.0时开始在其他注册表上发布Falco容器镜像的努力的一部分。



##新奇



现在让我们回顾一下Falco 0.28.0带来的一些新东西。



完整列表请访问[the changelog](https://github.com/falcosecurity/falco/releases/tag/0.28.0)。



###突破性更改



在我们深入讨论之前，有一点很重要:这个版本引入了一些突破性的变化。



由于[bintray is sunsetting](https://jfrog.com/blog/into-the-sunset-bintray-jcenter-gocenter-and-chartcenter)，所有Falco包，所有官方支持的发行版，将从现在起在https://download.falco.org发布。



我们已经移动了包存储库和之前的Falco版本(都是从Falco 0.26.1开始的开发版本，以及从Falco 0.20.0开始的所有稳定版本)。



所以您现在就可以开始使用新的包存储库了!这里有一个[step-by-step guide to upgrade](https://falco.org/docs/getting-started/upgrade)您的Falco存储库设置。



请不要再使用[Falco Bintray repositories](https://dl.bintray.com/falcosecurity)了。



还要注意DEB和RPM包现在使用systemd来代替以前的init.d服务单元。



另一个值得一提的变化是，我们确实删除了Falco容器映像用来跳过驱动程序加载的' SKIP_MODULE_LOAD '环境变量。在Falco 0.24.0版本中已弃用。如果你仍然在使用，请切换到使用名为“SKIP_DRIVER_LOADER”的新环境变量。



###例外



正如声明的那样，结构化规则异常的支持已经被合并了。



它是一种定义附加条件的机制，当匹配时，会导致Falco引擎不发出相对Falco警报。



您可以在[document proposing it](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md)中阅读更多关于该功能的信息。



请注意，缺省的Falco规则集目前没有使用异常，但是如果这个特性适合您的需要，您肯定可以使用它编写自己的Falco规则。

### Healthz



多亏了Carlos, Falco Kubernetes web服务器现在公开了一个' /healthz '端点。



它可以用于检查Falco是否启动并运行。这是Falco Helm图表用户要求改进的功能。



### Falco驱动加载器



Falco驱动程序加载器是一组bash在Falco容器启动时做神奇的事情，它首先会尝试为当前主机检测和下载预构建的Falco驱动程序(当前预构建驱动程序列表[here](https://download.falco.org/?prefix=driver/)可用)，然后才会尝试编译一个正在运行的Falco驱动程序。



我们决定反转这种逻辑，因为我们有4K+的预构建驱动程序，以及一有新发行版和新内核诞生就更新它们的机制。



这样，在大多数情况下，Falco容器的引导时间应该会大大提高，如果我们已经为您构建了一个Falco驱动程序，就可以避免为您的主机编译一个Falco驱动程序。



###可调



falco.中的“syscall_event_drops”配置项。Yaml’获得一个新的子元素(“`threshold”)，您可以使用它进行调优

以降低干扰。



它表示一个百分比，因此您可以为它提供0到1之间的值。默认情况下，它是0.1，如果需要，请随意试验它。



##其他一切



引擎修复



Falco引擎中的一个bug，准确地说，在Falco规则语言中，阻止数字被正确解析，最终被修复。



另外，关于如何在多值字段中处理缺失值(' NA ')的另一个错误。)现在是固定的，不再存在。



###规则



和往常一样，我们的社区在改进Falco规则方面做得很好!



这个版本对各种宏、列表和规则进行了大量改进。查看[changelog (rules section)](https://github.com/falcosecurity/falco/releases/tag/0.28.0)了解有关它们的详细信息。



三个规则，' Debugfs启动在特权容器'，' Mount启动在特权容器'，和' Sudo潜在特权升级'(非常有用的及时提醒您关于[CVE-2021-3156](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-3156))也被引入。



##接下来是什么



我们计划在2021年5月4日发布[0.28.1](https://github.com/falcosecurity/falco/milestone/18) !



和往常一样，最终发布日期将在[Falco Community Calls](https://github.com/falcosecurity/community)中讨论。



和往常一样，我们将进行bug修复和改进。



##让我们见面



和往常一样，我们每周都在我们的[社区电话](https://github.com/falcosecurity/community)上见面，

如果你想知道最新的和最好的，你应该加入我们那里!



如果你有任何问题



-在[Kubernetes Slack](https://slack.k8s.io)上加入[#falco channe](https://kubernetes.slack.com/messages/falco)

-[Join the Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)



感谢所有了不起的贡献者!Falco有100名贡献者，而且Falco的所有其他项目每天都在接受至关重要的贡献。



再接再厉!

Bye!

Leo



