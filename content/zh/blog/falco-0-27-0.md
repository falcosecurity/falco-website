---
title: Falco 0.27.0 a.k.a. "The happy 2021 release"
date: 2021-01-18
author: Lorenzo Fontana
---

今天我们宣布发布Falco 0.27.0������

这是2021年的第一个版本！

你可以在这里看看这些变化:

- [0.27.0](https://github.com/falcosecurity/falco/releases/tag/0.27.0)

像往常一样，如果你只是想尝试稳定版Falco 0.27.0，你可以按照文档中列出的过程安装它的包:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

你更喜欢使用docker镜像吗？没问题！

你可以在文档中阅读更多关于使用Docker运行Falco的内容。(https://falco.org/docs/getting-started/running/#docker).

**重要** Falco 0.27.0是第一个在Amazon ECR上发布容器镜像的版本。这还没有得到官方的支持，我们现在只发布了falcosecurity/falco的图片。感谢@leodido和@jonahjon!

##有什么新鲜事吗?

这不是一个完整的列表，要获得一个完整的列表，请访问变更日志。(https://github.com/falcosecurity/falco/releases/tag/0.27.0).

###重大变化
在我们深入研究任何事情之前，有必要注意到Falco的这次发布引入了一个重大变化。如果你依赖于运行没有任何配置文件的Falco，你不能再这样做了。所有官方安装方法都附带一个默认配置文件。

###性能说明

处理Falco输出的机制已经完全用c++重写了(感谢@leogr)。在这个版本发布之前，Falco依赖于Lua和c++ API调用的混合，这导致了引擎和输出机制之间的大量交互。使用单一的c++实现可以极大地减少串扰问题。

由于Lua不再用于输出，阻止我们拥有多线程输出的唯一原因也消失了。Falco 0.27.0的输出能够使用多个线程，也有一种机制来检测输出是否太慢。

当它不允许在给定的最后期限内交付警报时，输出“太慢”，Falco将从“内部”数据源发出警报，抱怨这一点。默认超时时间为200毫秒。可以使用falco.yaml中的output_timeout配置来配置它。

###其他一切！

**新网站**
如你所见，我们有一个新的网站!在@leogr和@leodido的帮助下，Raji和Lore是这个新造型的幕后推手。这个新网站有一个新的设计，一个搜索栏和一个漂亮的下拉框，你可以用它来导航旧的Falco版本(现在只有Falco 0.26和0.27可用)。

**gRPC变化**
Falco gRPC版本服务现在也公开了Falco引擎版本。

**规则变化**

我们在这次发布中有15个规则变化!一如既往，我们的社区将规则的质量视为他们的首要任务。保持一套合理的默认规则，让每个人都受益，这对我们非常重要!

##下一步是什么？

我们计划于2021年3月18日发布 0.28.0！

与往常一样，我们将进行错误修复和改进。

0.28.0宣布将支持结构化规则异常，这是一种定义条件以在异常发生时排除某些警报的方法。

你可以在这里阅读@mstemm 的提议。(https://github.com/mstemm)(https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md).

此外，我们很快就会在下一个版本中发布Falco的ARM版本(armv7和aarch64版本)。Lore致力于PR#1442，将Falco移植到这些架构上，Jonahjon也致力于为这些架构的构建、测试和发布提供基础设施支持。(https://github.com/falcosecurity/falco/pull/1442)(https://github.com/jonahjon)

##咱们见面吧！

一如既往，我们每周在我们的社区电话中见面，如果你想知道最新的和最好的你应该加入我们那里!(https://github.com/falcosecurity/community),

如果你有任何问题

 - 加入 Kubernetes Slack 上的#falco 频道(https://slack.k8s.io)
 - 加入 Falco 邮件列表(https://lists.cncf.io/g/cncf-falco-dev)


感谢所有了不起的贡献者!保持良好的氛围!

再见!

Lore


