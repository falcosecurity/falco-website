---
title: Falco 0.31.1
date: 2022-03-11
author: Luca Guerra
slug: falco-0-31-1
---

今天我们宣布发布Falco 0.31.1!

## 新事物

让我们回顾一下新版本的一些亮点https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0311.

### 新功能

此版本允许您使用多个 --cri 命令行选项 (#1893) 来指定多个 CRI 套接字路径。 请注意，Falco 只会连接到第一个才能成功连接！

说到命令行选项，为了改进在线帮助并让贡献者更容易添加和修改选项（#1886 #1903 #1915），内部正在发生各种变化。

对驱动程序版本 b7eb0dd 的更新带来了许多改进，包括正确检测 execveat、podman 的错误修复以及对 clone3 和 copy_file_range 系统调用的支持。 此外，还为入口系统调用添加了必要的额外参数，以提高 Falco 事件解析的安全性，如下所述。

### 安全内容

Falco现在对tocou类型的攻击更有弹性，可能导致规则绕过(CVE-2022-26316)。有关更多信息，请阅读安全建议。感谢郭小飞和曾俊元的报道!

### 默认的规则更新

此版本还包括对默认规则集的修改，包括检测 CVE-2021-4034（Polkit 本地权限升级）和误报修复（#1825、#1832）的全新规则

---

## 试试看!

像往常一样，如果您只想试用稳定的 Falco 0.31.1，您可以按照文档中概述的过程安装其软件包：

- CentOS/Amazon Linux https://falco.org/docs/getting-started/installation/#centos-rhel
- Debian/Ubuntu https://falco.org/docs/getting-started/installation/#debian
- openSUSE https://falco.org/docs/getting-started/installation/#suse
- Linux binary package https://falco.org/docs/getting-started/installation/#linux-binary

您更喜欢使用容器镜像吗？ 一点问题都没有！

您可以在文档中阅读有关使用 Docker 运行 Falco 的更多信息。
您还可以在公共 AWS ECR 库中找到 Falcosecurity 容器镜像：
- falco https://gallery.ecr.aws/falcosecurity/falco
- falco-no-driver https://gallery.ecr.aws/falcosecurity/falco-no-driver
- falco-driver-loader https://gallery.ecr.aws/falcosecurity/falco-driver-loader

## 下一步是什么

Falco 0.32.0预计将在2022年5月发布!

和往常一样，最终发布日期将在Falco社区会议期间讨论。

## 让我们见面吧

和往常一样，我们每周都会在我们的社区电话中见面，如果你想知道最新的和最好的，你应该在那里加入我们！

如果你有任何问题

- 加入Kubernetes Slack上的#falco频道
- 加入Falco邮件列表

感谢所有了不起的贡献者!

Enjoy! 

Luca

