---
title: Falco 0.26.1 a.k.a. "the static release"
date: 2020-10-01
author: Leonardo Di Donato, Lorenzo Fontana
slug: falco-0-26-1
---

今天我们宣布Falco 0.26.1的发布 🥳

这是上周发布的 Falco 0.26.0 的修补程序版本！

你可以在这里看看这些变化:

- [0.26.1](https://github.com/falcosecurity/falco/releases/tag/0.26.1)
- [0.26.0](https://github.com/falcosecurity/falco/releases/tag/0.26.0)

像往常一样，如果您只想试用稳定版的Falco 0.26.1，您可以按照文档中概述的过程安装其软件包：

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)

你更喜欢使用docker 镜像吗？没问题！

您可以在文档中阅读有关使用 Docker 运行 Falco 的更多信息。(https://falco.org/docs/getting-started/running/#docker).

##有什么新鲜事吗?

从这个Falco版本开始，如果你使用tarball发行版(二进制)或falcosecurity/ Falco -no-driver容器映像下载Falco，你将得到一个100%静态链接的Falco版本! ⛓

这样做的用例是，您现在可以下载tarball并将Falco二进制文件(和配置文件)复制到任何目标机器或容器中，而不需要依赖底层系统库，包括libc。

用户空间工作组已经在试验中使用这个技术，将Falco引入AWS Fargate等新领域。🕶

###规则

与往常一样，我们的规则集不断改进并适应不断变化的世界。 非常感谢@ldegio(https://github.com/ldegio)、@mstemm(https://github.com/mstemm)、@csschwe(https://github.com/csschwe) 和@leogr(https://github.com/leogr)。

##下一步是什么？

一如既往，你有机会加入我们的(https://github.com/falcosecurity/community)!

在上一次Falco电话会议中，社区选择从现在开始每2个月发布一次 Falco。⏰

因此，我们刚刚创建了 0.27.0 的里程碑，截止日期为2020年12月1日。(https://github.com/falcosecurity/falco/milestone/13)

冬天见!

Leo和Lore

