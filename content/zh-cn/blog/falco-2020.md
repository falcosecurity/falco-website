---
exclude_search: true
title: Falco in 2020
description: Reviewing the progress of Falco and its community during the pandemic year
date: 2021-01-03
author: Leonardo Di Donato
slug: falco-2020
---

这个帖子的范围是回顾Falco及其社区在大流行年的进展，这一年将永远不会忘记。

我会尽量保持紧凑，但Falco和它的社区今年成长了很多，我觉得这可能是一个博客文章系列。

2020年是我们完全和最终把 **公开的Falco释放过程**! 📖

当 [Lorenzo](https://github.com/fntlnz) 和 [I](https://github.com/leodido) 在2019年加入 [Sysdig](https://sysdig.com) 的时候，情况并非如此。

这是从流程中产生的强制性要求[将Falco移至CNCF孵化级别](https://www.cncf.io/blog/2020/01/08/toc-votes-to-move-falco-into-cncf-incubator).

所以，是的，2020年也是Falco被[原生云计算基金会]（http：//cncf.io）接受为**孵化级托管项目**的一年！

[Falco发布流程]（https：//github.com/falcosecurity/falco/blob/master/release.md）现已开放，一些Falco维护者在我们的[社区电话]（https：//github.com/falcosecurity/community）中提出自己的建议，他们领导每2个月进行一次的下一次Falco发布。🔄

在将发布过程公开的同时，我们还抓住机会去做:

- 为Falco提供更清晰、连贯的SEMVER 2.0版本化方案
- 将Falco驱动程序版本与Falco版本分开
- 以更一致的方式重命名驱动程序
- 重新组织其工件
- 现在，主分支上的每个合并和每个新版本都会自动创建Falco包，并将它们推送到包存储库（tarball、DEB and RPM） [download.falco.org](https://download.falco.org/?prefix=packages) 📦
- 重新组织其容器映像
- 主分支上的每个合并和每个新版本，都会自动在 [DockerHub](https://hub.docker.com/u/falcosecurity) 🐳
- 很快也会在[AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco)上出现([1512](https://github.com/falcosecurity/falco/pull/1512)很快就会被合并进来！)
- 在falcosecurity GitHub组织中建立一个[发展和孵化新的Falco项目和社区资源的过程](https://github.com/falcosecurity/evolution) ↗

如果你想了解这些主题的更多信息，[this](https://falco.org/blog/falco-0-21-0)和[this](https://falco.org/blog/falco-0-23-0)是你需要阅读的Falco博客文章。

同时，我们建立了[driverkit](https://github.com/falcosecurity/driverkit) 🗜，让我们的用户为他们的主机手动预编译Falco驱动程序。我们使用这个工具创建了一个[Drivers Build Grid](https://github.com/falcosecurity/test-infra/tree/master/driverkit)，使其最初能在CircleCI上运行，现在由**AWS**的**Prow**和**Kubernetes**支持的[Falco Infra](https://github.com/falcosecurity/test-infra)上使用。

我们最终重新组织了存储预置Falco驱动程序的方式。看一看 [download.falco.org](https://download.falco.org).

你想看看我提到的 **Falco Infra** 吗? 🛠

看一看[prow.falco.org](https://prow.falco.org)。多么了不起的成果啊!

如果这个话题真的吸引了你，那么你可以在我和Jonah在AWS开源博客上共同撰写的🔗[这篇博文]（http://bit.ly/falco-prow-aws）中阅读所有细节。

我要公开感谢所有Falco Infra工作组的参与者（Spencer、Massimiliano、Lorenzo、Grasso、Umang），特别是来自亚马逊的[Jonah](https://github.com/jonahjon/)，感谢他作为新的维护者给予我们的所有帮助，并将继续给予我们帮助！

另一个对法尔考的采用有巨大作用的领域是[Falco Helm chart](https://github.com/falcosecurity/charts)。📋

我们对它们进行了内化、修复和不断改进。
我们的社区非常喜欢它们，以至于外部贡献者--如[Spencer](https://github.com/nibalizer)--每天帮助我们保持图表的健康。

不提[falcosidekick](https://github.com/falcosecurity/falcosidekick)。🔫

[Thomas](https://github.com/issif)在这里为加强Falco输出警报所做的工作实在是太棒了。在这里列出他与Falco输出警报整合的所有工具，会让这篇文章变得更长。

所以，请大家去读一下[这篇博文](https://www.cncf.io/blog/2020/08/17/falco-update-whats-new-in-falco-0-25)(第四部分🔗)，由POP来了解他们。

既然我刚刚提到了他，如果你还不知道的话。[POP](https://github.com/danpopsd)，我的意大利裔美国人大朋友，[加入我们的目的是帮助Falco社区和生态系统闪耀到前所未有的水平](https://www.cncf.io/blog/2020/12/14/join-pop-falco-org)。毫无疑问：他是Falco社区的一个伟大的补充。

我想现在已经很清楚了，2020年是Falco社区起飞的一年。是吗？

看看我们现在有多少维护者，看看我指示我们的Falco Infra生成的这个**美丽的**[maintainers.yaml](https://github.com/falcosecurity/.github/blob/master/maintainers.yaml)。👥

我们吸收了很多来自不同公司的新的外部贡献者（IBM、Amazon、Mercari、Hetzner Cloud、DeltaTre等），他们使情况发生了变化。

这就是开源的力量，这就是人们走到一起时发生的事情。🤗

从技术角度来看，对Falco最艰难和最重要（IMHO）的贡献是在3月份由Lorenzo和我开发的Falco eBPF驱动的修复。🔬

事实上，正如我所说，真正的问题是在eBPF虚拟机中：它会影响到许多其他eBPF程序，可能会导致乏味和危险的情况。

总之，在过去的一年里，为了改进Falco的核心技术，我们也做了很多工作。

我现在能想起的最重要的事情（没有特别的顺序）是（原谅我，如果我忘记了什么）:

- 修正Falco警报中存在的`<NA>`值([1133](https://github.com/falcosecurity/falco/pull/1133), [1138](https://github.com/falcosecurity/falco/pull/1138), [1140](https://github.com/falcosecurity/falco/pull/1140), [1492](https://github.com/falcosecurity/falco/pull/1492) 🩺
- 使用valgrind来修复各种内存泄漏 🔩
- 改进gRPC Falco Outputs API的性能，并使其成为双向的([1241](https://github.com/falcosecurity/falco/pull/1241)) 👉👈
- 将Falco输出机制从Lua移植到C++（感谢[Grasso](https://github.com/leogr)的[1412](https://github.com/falcosecurity/falco/pull/1412)） 🔧
- 在Falco核心中添加其他gRPC APIs
  - 版本API
  - 使用gRPC Falco Outputs API也可以流式传输下降警报
- 调查drops
- 100%静态链接的Falco版本（感谢[Lorenzo](https://github.com/fntlnz)！） ⛓
- 在aarch64上构建Falco（再次感谢Lorenzo。[1442](https://github.com/falcosecurity/falco/pull/1442)） ⚙
- 用户空间仪器化，使Falco能够在没有内核模块或eBPF探针的情况下运行
  - 以及第一个用户空间的Falco驱动--即[pdig](https://github.com/falcosecurity/pdig)--感谢Loris和Grzegorz。

我100%肯定我忘了一些重要的东西。但是，考虑到我今天吃的Panettone的数量🍞，我认为我记住并写在这里的东西对我的大脑来说是非常好的结果。

## 2021年掠影

请继续关注，因为2021年是我们计划让用户对Falco进行编程的一年。 📻

我们正在编写一个真正的Falco规则语言--即，有一个编译器和一切。⚗

我们正在准备一套很酷的C语言API（可能是libhawk），让你在Falco运行时与它互动（从它的规则集开始）。🧪

我们正在改造Falco网站（请看[falco-website#324](https://github.com/falcosecurity/falco-website/pull/324)）。

准备同时阅读一个很酷的新的开发者文档（观看[1513](https://github.com/falcosecurity/falco/pull/1513)）网站，并为Falco核心做出贡献! 📔
