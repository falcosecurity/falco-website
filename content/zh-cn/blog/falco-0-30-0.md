---
title: Falco 0.30.0
date: 2021-10-01
author: Frederico Araujo
slug: falco-0-30-0

---

今天，我们宣布发布Falco 0.30.0秋季版本🌱

## 新功能 🆕

让我们回顾一下 [新版本](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0300)的一些亮点。

### 新功能和修复

此版本引入了一个新的 `--k8s-node`命令行选项([#1671](https://github.com/falcosecurity/falco/pull/1671))，它允许在向k8s API服务器请求pod元数据时按节点名称进行过滤。通常，应将其设置为运行Falco的节点。如果为空，则不设置筛选器，这可能会导致大型群集的性能下降。这一新功能为Falco带来了显著的性能改进，并 [关闭](https://github.com/falcosecurity/libs/issues/43) 了等待已久的 [问题](https://github.com/falcosecurity/falco/issues/778) 修复，该问题已在生产规模的Kubernetes集群上的许多Falco部署中得到证实。

[驱动程序](https://github.com/falcosecurity/libs/tree/master/driver) 版本[3aa7a83](https://github.com/falcosecurity/libs/tree/3aa7a83bf7b9e6229a3824e3fd1f4452d1e95cb4) 的更新完成了从容器编排器收集元数据的性能增强，并包括对 [libsinsp](https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp) 公共API的改进 [改进](https://github.com/falcosecurity/libs/pull/40)，允许使用者修改决定编排器（如Kubernetes或Mesos）收集元数据的行为的关键参数。这些参数现在在Falco中公开为可 [自定义的设置](https://github.com/falcosecurity/falco/pull/1667)，使用户能够根据其部署调整获取元数据行为。默认值为：

```yaml
metadata_download:
  max_mb: 100
  chunk_wait_us: 1000
  watch_freq_sec: 1
```

此版本还添加了在gRPC和JSON输出中导出规则标记和事件源的功能。此行为可以[配置](https://github.com/falcosecurity/falco/pull/1733)，并使Falco事件消费者（如Falco Sidekick）能够充分利用Falco的事件标记功能。Happy tagging :)

### Libs插件系统方案

libs[插件系统](https://github.com/falcosecurity/plugins) 的[提议](https://github.com/falcosecurity/falco/blob/master/proposals/20210501-plugin-system.md)已经被接受了，我们再兴奋不过了！无限可能！🎉

插件将允许用户轻松地扩展库的功能，并因此扩展Falco和任何其他基于库的工具的功能。该建议特别关注两种类型的插件：源插件和提取器插件。源插件实现了新的sinsp/scap事件源（例如，"k8s\_audit"），而提取器插件则专注于从其他插件或核心库生成的事件中提取字段。

插件是动态库（Unix中的.so文件，Windows中的.DLL文件），可导出库可识别的最小函数集。它们可以用任何语言编写，只要导出所需的函数即可。然而，Go是编写插件的首选语言，其次是C/C++。为了方便插件的开发，我们开发了 [golang SDK](https://github.com/falcosecurity/plugin-sdk-go) 。

实验[插件系统](https://github.com/falcosecurity/plugins)和[SDK](https://github.com/falcosecurity/plugin-sdk-go) 现在都在Falco组织中孵化项目，并包括一组初始[示例](https://github.com/falcosecurity/falco/blob/master/proposals/20210501-plugin-system.md#examples)。我们邀请社区试用，贡献新的插件，并共同努力构建云原生运行时安全的基础。🚀

### 新的Falco发布时间表

最后，在与社区讨论后，批准了Falco的[新发布计划](https://github.com/falcosecurity/falco/pull/1711)。新版本现在每年发布三次：1月底、5月底和9月底。我们将继续在主要版本间隙发布热修复程序和次要修补程序。一如既往，反馈，错误报告和贡献是受欢迎的！:)

---

## 体验一下!

像往常一样，如果你只是想尝试稳定的Falco 0.30.0，你可以按照文档中概述的过程安装它的软件包：

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

你更喜欢使用容器镜像吗？一点问题都没有！🐳

您可以在[文档](https://falco.org/docs/getting-started/running/#docker)中阅读有关使用Docker运行Falco的更多信息。

您还可以在公共 AWS ECR gallery上找到FalcoSecurity容器镜像：

- [falco](https://gallery.ecr.aws/falcosecurity/falco)
- [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
- [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## 下一步计划 🔮

Falco 0.31.0 is anticipated to be released in January 2022!

Falco 0.31.0预计将于2022年1月发布。

像往常一样，最终发布日期将在Falco[社区电话会议](https://github.com/falcosecurity/community)期间讨论。

## 我们见面吧 🤝

像往常一样，我们每周都会在[社区电话](https://github.com/falcosecurity/community)中见面，

如果你想知道最新最好的，你应该加入我们！

如果你有任何问题

- 在 [Kubernetes Slack](https://slack.k8s.io)加入 [#falco channel](https://kubernetes.slack.com/messages/falco) 
- 加入 [Falco 邮箱列表](https://lists.cncf.io/g/cncf-falco-dev)

感谢所有了不起的贡献者！Falco达到了100个贡献者，而且所有其他Falco项目每天都收到大量的贡献。

特别感谢 [Falco Sidekick](https://github.com/falcosecurity/falcosidekick)

Keep up the good work!

Bye!

Fred
