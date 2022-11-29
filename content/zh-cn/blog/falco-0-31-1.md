---
title: Falco 0.31.1
date: 2022-03-11
author: Luca Guerra
slug: falco-0-31-1
---

今天我们宣布发布Falco 0.31.1!

## 新事物

让我们回顾一下新[版本](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0311)的一些亮点。

### 新功能

这个版本允许你使用多个'——cri '命令行选项([#1893](https://github.com/falcosecurity/falco/pull/1893))来指定多个cri套接字路径。注意，Falco将只连接到第一个成功连接的对象!

说到命令行选项，为了改进在线帮助，并使贡献者更容易添加和修改选项([#1886](https://github.com/falcosecurity/falco/pull/1886) [#1903](https://github.com/falcosecurity/falco/pull/1903) [#1915](https://github.com/falcosecurity/falco/pull/1915)，在底层发生了各种变化。

对[drivers](https://github.com/falcosecurity/libs/tree/master/driver)版本[b7eb0dd](https://github.com/falcosecurity/libs/tree/b7eb0dd65226a8dc254d228c8d950d07bf3521d2)的更新带来了许多[改进](https://github.com/falcosecurity/libs/compare/319368f1ad778691164d33d59945e00c5752cd27...b7eb0dd65226a8dc254d228c8d950d07bf3521d2)，包括正确检测[execveat](https://github.com/falcosecurity/libs/pull/204)，podman的[bugfixes](https://github.com/falcosecurity/libs/pull/236)和对[clone3](https://github.com/falcosecurity/libs/pull/129)和[copy_file_range](https://github.com/falcosecurity/libs/pull/143)系统调用的支持。此外，还添加了必要的[输入系统调用的额外参数](https://github.com/falcosecurity/libs/pull/235)，以提高Falco事件解析的安全性，如下所述。

### 安全内容

Falco现在对tocou类型的攻击更有弹性，可能导致规则绕过(CVE-2022-26316)。有关更多信息，请阅读[安全建议](https://github.com/falcosecurity/falco/security/advisories/GHSA-6v9j-2vm2-ghf7)。感谢郭小飞和曾俊元的报道!

### 默认的规则更新

这个版本还包括对默认规则集的修改，包括一个全新的规则来检测CVE-2021-4034 (Polkit本地特权升级)和假阳性修复(#1825，#1832)!

---

## 试试看!

像往常一样，如果您只想试用稳定的 Falco 0.31.1，您可以按照文档中概述的过程安装其软件包：

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

您更喜欢使用容器镜像吗？ 一点问题都没有！

您可以在[docs](https://falco.org/docs/getting-started/running/#docker)中阅读更多关于使用Docker运行Falco的信息。
您还可以在公共 AWS ECR 库中找到 Falcosecurity 容器镜像：
- [falco](https://gallery.ecr.aws/falcosecurity/falco)
- [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
- [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## 下一步是什么

Falco 0.32.0预计将在2022年5月发布!

和往常一样，最终发布日期将在[Falco社区会议](https://github.com/falcosecurity/community)中讨论。

## 让我们见面吧

和往常一样，我们每周都在我们的[社区电话](https://github.com/falcosecurity/community)上见面，

如果你有任何问题

- Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
- Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

感谢所有了不起的贡献者!

Enjoy! 

Luca

