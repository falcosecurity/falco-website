---
title: Falco 0.25.0 a.k.a. "the summer release"
date: 2020-08-25
author: Lorenzo Fontana, Leonardo Grasso
slug: falco-0-25-0
---


今天我们宣布发布 Falco 0.25 🥳


这是一个小版本，但非常重要！

你可以在这里看看这些变化:

- [0.25.0](https://github.com/falcosecurity/falco/releases/tag/0.25.0)

如果您只想试用稳定版Falco 0.25，您可以按照文档中概述的常规过程安装其软件包：

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)

你更喜欢使用docker镜像吗？没问题！

你可以在文档中阅读更多关于使用Docker运行Falco的内容。(https://falco.org/docs/getting-started/running/#docker).

##有什么新鲜事吗?

###驱动程序更改

该驱动程序现在支持 renameat2 系统调用并适用于新的内核稳定版 5.8 版本！

###安装经验

以前，用户必须在他们的系统中安装libyaml，现在不再需要了。

###贡献者的经验
我们通过重写逐步说明以在本地运行集成测试来改善贡献体验，说明可以在这里找到。(https://github.com/falcosecurity/falco/tree/master/tests).

此外，由于许多用户报告了不同操作系统上的构建问题，构建体验得到了改善，我们借此机会对构建进行了一些调整，使其更易于使用。

谢谢@leodido (https://github.com/leodido)!

###输出插件开发者经验

输出插件的开发者和维护者必须知道gRPC已经更新到1.31.1。请您花时间测试并报告问题，谢谢!

###规则

一如既往，我们的规则设置在不断改进，以适应不断变化的世界。非常感谢@Kaizhe、@nvanheuverzwijn、@admiral0 和@leogr。



##接下来是什么?
我们刚刚创建了将于2020年9月15日到期的0.26.0里程碑(https://github.com/falcosecurity/falco/milestone/12) 。一如既往，您有机会通过加入我们的社区呼吁成为这个发布的一部分!(https://github.com/falcosecurity/community)!

再见!

Lore和Leo Grasso

