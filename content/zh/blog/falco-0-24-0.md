---
title: Falco 0.24.0 a.k.a. "the huge release"
date: 2020-07-16
author: Leonardo Di Donato, Leonardo Grasso
slug: falco-0-24-0
---

在漫长的两个月之后，看看谁回来了!

今天我们宣布Falco 0.24的发布 🥳

你可以在这里看看这些巨大的变化:

- [0.24.0](https://github.com/falcosecurity/falco/releases/tag/0.24.0)

如果您只想试用稳定版Falco 0.24，您可以按照文档中概述的常规过程安装其软件包：

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)

你更喜欢使用docker镜像吗？没问题！

您可以在文档中阅读有关使用 Docker 运行 Falco 的更多信息。(https://falco.org/docs/getting-started/running/#docker).

##重大变化

如果你想要获取关于你正在运行的Falco实例的统计信息，请注意这个[PR](https://github.com/falcosecurity/falco/pull/1308)修复和改变了你需要启用这样的功能的CLI标志的名称。标志现在是'——stats-interval '，最后，它也适用于大于999毫秒的值。

由于Falco gRPC输出API的性能问题，我们几乎完全重新设计了gRPC服务器和输出rpc。

长话短说:gRPC的输出方法现在是falco.outputs。Service /get ' and **not** ' falco.outputs;服务/订阅了。

此外，我们引入了“falco.outputs”。service/sub的gRPC方法的行为与旧方法的行为相同，只是它比旧方法快得多。

##臭名昭著的gRPC修复和功能

几个月前，一个用户报告说，在Falco 0.21中使用Falco gRPC输出API时，CPU占用非常高。

分析代码，我们发现 gRPC 线程使 CPU 非常忙碌。

falco 0.21高CPU使用率

深入研究gRPC代码和gRPC核心后，Leo和Lore很快意识到，要解决这个问题，需要重写Falco gRPC代码的重要部分。

因此，我们引入了一个双向API (Falco .output .service/sub)来通过gRPC监视Falco警报，并改变了服务器流gRPC输出方法(Falco .output .service/get)，以消耗更少的内存和CPU资源。

经过几天的微调和连续测试(在10秒内向gRPC服务器发送4MLN请求)，我们已经能够将gRPC输出方法的cpu占用率从将近90%降低到20%以下。 🚀

Falco 0.24低CPU使用率

在该PR中，您可以找到所有的故事、所有的代码更改，以及使用grpcurl快速尝试新的Falco gRPC输出方法的说明。

所以，结果很好:用户现在很高兴，我们也很高兴!🤗

Falco用户报告

最后，现在Falco的gRPC输出更好了，我们想向社区宣传Falco 0.24发布的另外两个重要的与gRPC相关的特性:

你现在可以让Falco自动配置它的gRPC服务器的threadiness: 0到Falco配置(Falco #1271)

你瞧，你现在可以通过Unix套接字(Falco #1217)连接到Falco gRPC服务器了

我们已经更新了Falco Go客户端。

因此，我们邀请所有Falco社区和用户尝试这些新功能和gRPC的改进!

##支持eBPF驱动在CentOS 8上回来了!

自4月以来，我们社区的一些朋友报告了在CentOS 8 (Falco #1129)上构建Falco eBPF驱动程序的问题。

经过一些密集的调试，Lorenzo和Leo发现了原因:CentOS 8将进程类型功能(和关联结构)从Linux内核4.19移植到4.18，导致驱动程序检查无效。

你想看看一些 eBPF吗？ 看看这个PR！

Falco驱动程序版本85c8895包含修复程序，因此你们都可以再次在CentOS 8机器上运行我们心爱的工具。 📦

##无缓冲输出😆

Leonardo Grasso最终发现了一个棘手的错误，导致buffered_output: false配置选项不按预期工作。

感谢他的修复，从现在开始，当该选项被禁用时，Falco将及时输出stdout警告。

同时，我们也欢迎Grasso加入法尔科维护者的大家庭!

##规则更新

我们非常感谢[Khaize](https://github.com/Kaizhe)这个巨大的[PR](https://github.com/falcosecurity/falco/pull/1294)，它引入了一堆占位符宏。

由于他的努力，用户现在可以更容易地定制自己的Falco规则集!

##一些统计数据

合并了38个pull请求，其中29个包含直接针对最终用户的更改。

自上一个版本以来，这是两个月前的105次提交。

##请注意:用户空间工具化即将到来……

在这个版本中，Falco引入了用户空间级的检测契约。

T可以通过在启动 Falco 时传递 -u 标志或使用其长版本（即 --userspace）来启用此功能。

为了利用这个契约，还需要实现用户空间实现。

Falco社区目前正在开发一个名为pdig的实现，它是围绕ptrace(2)和seccomp构建的。我们非常兴奋地看到pdig在未来达到生产支持。

更多信息请访问Falco网站。

八月见，还有更多精彩！

