---
exclude_search: true
title: Falco 0.31.0 a.k.a. "the Gyrfalcon"
date: 2022-01-31
author: Jason Dellaluce, Leonardo Grasso
slug: falco-0-31-0
tags: ["Falco","Release"]
---

今天我们宣布发布Falco 0.31.0，又名Gyrfalcon 🦅!

Gyrfalcons are the largest of the falcon species, just like this version of Falco has **the biggest changelog** ever released. To give you some metrics, since the last release, the [falco](https://github.com/falcosecurity/falco) and [libs](https://github.com/falcosecurity/libs) Gyrfalcons是最大的猎鹰物种，就像这个版本的Falco有有史以来最大的更新日志一样。为了给你一些指标，自上一个版本以来，[falco](https://github.com/falcosecurity/falco) 和[libs](https://github.com/falcosecurity/libs)  存储库统计了 30+ 个人贡献者、130+ 拉取请求和 360+ 提交 🤯. 事实证明，Falco社区比以往任何时候都更加活跃，我们想向所有相关人员说声谢谢🙏 💖 。

## 亮点

更改太多，无法一一列举，因此我们仅尝试涵盖核心功能和主题的亮点。如果您想深入了解，这里是完整的[Falco's changelog](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0310) and the [list of changes in libs](https://github.com/falcosecurity/libs/compare/3aa7a83bf7b9e6229a3824e3fd1f4452d1e95cb4...319368f1ad778691164d33d59945e00c5752cd27).


### 插件系统

**Falco 0.31.0** 终于附带了 **new plugin system** 🎉 ! 自[initial proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20210501-plugin-system.md)以来, 许多事情都发生了变化，该功能最终稳定并可用于生产。

Falco 历来监控内核中的系统事件，试图检测 Linux 节点上的恶意行为。随着时间的推移，它升级为处理K8S审计日志，以检测K8S集群中的可疑活动。现在， **Falco发展的下一步**是一个插件框架，它标准化了如何将其他事件源附加到引擎以及如何从这些事件中提取更多信息。

插件几乎可以用您喜欢的任何语言编写。如果您想了解有关其工作原理的更多信息，请查看 [official documentation](https://falco.org/docs/plugins/)  📖. 或多或少，这就是Falco现在的建筑的样子。

![New architecture of Falco](/img/falco-architectural-overview-plugins.png)

为了获得荣誉，此版本的Falco附带了 [**AWS Cloudtrail** plugin](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail) 和已打包在**a new ad-hoc ruleset**📦 ! 有了这些，Falco 可以从您的基础设施接收 Cloudtrail 日志，并在发生可疑活动时发送警报，例如当 S3 存储桶的权限意外更改或有人在没有 MFA 的情况下登录时。这是更好地将Falco集成到您的基础设施中的良好开端，我们期待更多这样的扩展!

当然，您可能想知道为您的用例开发 Falco 扩展有多难。不用担心，因为开发体验是我们的首要任务之一，我们准备了两个SDK用于在Go和C++中编写Falco插件：

- **Plugin SDK Go** 👉 https://github.com/falcosecurity/plugin-sdk-go
- **Plugin SDK C++** 👉 https://github.com/falcosecurity/plugin-sdk-cpp

DK是轻量级的，允许您使用几行代码开发Falco插件！我们特别关注 Go SDK，因为 Go 是云原生社区中广受赞赏的语言。查看 [some examples](https://github.com/falcosecurity/plugin-sdk-go/tree/main/examples) 并在几分钟内开始 ⌚!

Falco社区还维护着一个 [**official registry**](https://github.com/falcosecurity/plugins#plugin-registry) 📒，用于跟踪整个社区中确认和认可的所有插件。这既可以使社区更容易访问插件生态系统，也可以用于技术细节，例如[reserving a specific plugin ID](https://falco.org/docs/plugins/#plugin-event-ids).

我们希望插件能够改变**game-changer**，有可能使Falco发展到一个新的水平，并成为**cloud runtime security**的多合一工具。


### 驱动程序和库改进 

驱动程序中引入了相关的**performance optimization**以直接在内核级别删除所有未监视的事件，从而减少环形缓冲区争用并 **decreases the drop** rate 👉 [libs#115](https://github.com/falcosecurity/libs/pull/115).

驱动程序增加了对一些**new security-critical syscalls**: [`openat2`](https://github.com/falcosecurity/libs/pull/80), [`execveat`](https://github.com/falcosecurity/libs/pull/141), [`mprotect`](https://github.com/falcosecurity/libs/pull/174)! Also, the [`is_exe_writable`](https://github.com/falcosecurity/libs/pull/97) 标志已添加到 `execve` 系统调用系列中。

The **eBPF probe** 收到了许多关于以下方面的改进 **stability and support** 对于某些编译器和内核版本 (e.g., with clang5, amznlinux2) 👉 [libs#109](https://github.com/falcosecurity/libs/pull/109), [libs#140](https://github.com/falcosecurity/libs/pull/140), [libs#126](https://github.com/falcosecurity/libs/pull/126), [libs#96](https://github.com/falcosecurity/libs/pull/96), [libs#81](https://github.com/falcosecurity/libs/pull/81), [libs#179](https://github.com/falcosecurity/libs/pull/179), [libs#185](https://github.com/falcosecurity/libs/pull/185).

通过引入新的**huge container metadata**解决了处理**LARGE block type**时出现的问题，该类型大大增加了支持的最大块大小👉 [libs#102](https://github.com/falcosecurity/libs/pull/102).

最后，在**upgrading**关键依赖项和支持**more architectures and platforms**👉 [libs#91](https://github.com/falcosecurity/libs/pull/91), [libs#164](https://github.com/falcosecurity/libs/pull/164).

### falco的其他新奇事物

除了插件之外，Falco还收到了其他一些 **other significant updates**:
发送 HTTP 输出时能够设置 User-Agent HTTP 标头 👉 [falco#1850](https://github.com/falcosecurity/falco/pull/1850).
支持 YAML 配置中的任意深度嵌套值 👉 [falco#1792](https://github.com/falcosecurity/falco/pull/1792).
用于加载/编译规则的 **Lua files**  现在 **bundled** 到 Falco 可执行文件中 👉 [falco#1843](https://github.com/falcosecurity/falco/pull/1843).
Linux 软件包现在使用 SHA256 进行签名 👉 [falco#1758](https://github.com/falcosecurity/falco/pull/1758).
引擎的规则解析器**fixes in the rule parser** 👉 [falco#1777](https://github.com/falcosecurity/falco/pull/1777), [falco#1775](https://github.com/falcosecurity/falco/pull/1775).
最后，我们将 Falco 的完全静态链接构建移至另一个包，并且通常的“二进制”包切换回常规构建（这是允许动态加载插件所必需的）。 您可以在我们的网站中找到这两种口味的包装 [download repository](https://download.falco.org/?prefix=packages/bin/).


### 规则更新

默认规则 🛡️ 包含很少相关 **new rules** 👇
 - [Create Hardlink Over Sensitive Files](https://github.com/falcosecurity/falco/pull/1810)
 - [Launch Remote File Copy Tools in Container](https://github.com/falcosecurity/falco/pull/1771)

现有的规则、宏和列表也得到了**some updates**，特别是关于**possible bypasses**  👇
- [Sudo Potential Privilege Escalation](https://github.com/falcosecurity/falco/pull/1810)
- [Detect crypto miners using the Stratum protocol](https://github.com/falcosecurity/falco/pull/1810)
- [spawned_process](https://github.com/falcosecurity/falco/pull/1868), [sensitive_mount](https://github.com/falcosecurity/falco/pull/1815)
- [falco_hostnetwork_images](https://github.com/falcosecurity/falco/pull/1681), [deb_binaries](https://github.com/falcosecurity/falco/pull/1860), [known_sa_list](https://github.com/falcosecurity/falco/pull/1760), [falco_sensitive_mount_images](https://github.com/falcosecurity/falco/pull/1817)


## 下一步是什么?

为了提高 Falco 的质量和稳定性，我们已经做出了许多努力。 两个**关于库的重要建议** ([versioning and release process](https://github.com/falcosecurity/libs/blob/master/proposals/20210524-versioning-and-release-of-the-libs-artifacts.md) and [API versioning for user/kernel boundary](https://github.com/falcosecurity/libs/blob/master/proposals/20210818-driver-semver.md)) 
正在制作中。 与此同时，社区已经在考虑 **next-generation eBPF probe** 🐝。 可能，**many new plugins** 很快就会推出🚀 !

此外，我们认为是时候进行翻新了🧹。 例如，代码库的许多部分需要重新设计或重构：K8S审计日志应该重写为插件，规则语言解析器/编译器的各种问题，ARM兼容性应该得到正式支持等等。

所以，请继续关注。 **next release**可能会让您大吃一惊 😉 !


## 咱们见面吧!


一如既往，我们每周都会在我们的 [community calls](https://github.com/falcosecurity/community). 如果您想了解最新和最好的内容，您应该加入我们!



如果您想了解更多有关falco的信息 👇

* Get involved in the [Falco community](https://falco.org/community/).
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/messages/falco).
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).

干杯 🥳 👋 !

Jason & Leonardo
