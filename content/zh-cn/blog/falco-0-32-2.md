---
title: Falco 0.32.2
date: 2022-08-09
author: Andrea Terzolo
slug: falco-0-32-2
---

今天我们宣布发布 **Falco 0.32.2** 🦅!

## 新产品 🆕

这个版本真的很小，有点像 🐦, 它只修复了下载Falco BPF probe的URL [Falco下载页面](https://download.falco.org/). 非常感谢 [eric-engberg](https://github.com/eric-engberg), who proposed the [fix](https://github.com/falcosecurity/falco/pull/2142), and as usual to everyone in the community for helping us in spotting these annoying bugs 🐛! You make Falco successful 🦅!

一如既往地感谢Falco维护人员在整个发布过程中的支持和努力。

### 修复 🐛

此版本只修复了一个令人烦恼的错误:

* Falco尝试下载BPF probe的URL错误, [eric-engberg](https://github.com/eric-engberg) 在此提出了解决方案 [PR](https://github.com/falcosecurity/falco/pull/2142). Thank you again! 🙏

## 尝试一下! 🏎️

像往常一样，如果你只是想尝试一下稳定的 **Falco 0.32.2**, 您可以按照文档中概述的过程安装其软件包:

* [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
* [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
* [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

你更喜欢使用容器镜像吗？完全没有问题! 🐳

您可以从中阅读更多有关使用docker运行Falco的信息 [文件](https://falco.org/docs/getting-started/running/#docker).

你也可以在公共的AWS ECR图库中找到Falcosecurity的容器图像:

* [falco](https://gallery.ecr.aws/falcosecurity/falco)
* [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
* [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## 下一步是什么 🔮

对于Falco来说，这是一个令人兴奋的时刻，因为我们看到了许多伟大的改进和功能。更令人兴奋的是，有许多伟大的想法和令人敬畏的工作正在进行，以使下一个大事件发生。

最近，有很多人对 [the shiny new eBPF probe](https://github.com/falcosecurity/libs/pull/268), 利用现代eBPF功能，如CO-RE、环形缓冲器API和新的跟踪程序。

此外，社区中许多人对使用Falco同时读取系统调用事件和插件事件感兴趣。如果你是，我建议你看一下 [in-depth design](https://github.com/falcosecurity/falco/issues/2074) for this new feature!

## 我们见面吧 🤝

我们每周都会在我们的 [社区电话](https://github.com/falcosecurity/community),
如果你想知道最新的和最伟大的，你应该加入我们！

如果你有任何问题

* 参加 [#falco channel](https://kubernetes.slack.com/messages/falco) 在 [Kubernetes Slack](https://slack.k8s.io)
* 参加 [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

感谢所有了不起的贡献者！

干杯 🎊

Andrea
