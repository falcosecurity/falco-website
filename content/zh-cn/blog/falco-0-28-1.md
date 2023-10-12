---
exclude_search: true
title: Falco 0.28.1
date: 2021-05-07
author: Carlos Panato
slug: falco-0-28-1
---

今天我们宣布 Falco 0.28.1 的春季版本 🌱

这是我们的Falco 0.28的第一个补丁版本，解决了一些发现的问题。

这次发布发布了一些安全建议(https://github.com/falcosecurity/falco/security/advisories)

你可以在这里看看这些变化:

- [0.28.1](https://github.com/falcosecurity/falco/releases/tag/0.28.1)

像往常一样，如果你只是想尝试稳定版Falco 0.28.1，你可以按照文档中列出的过程安装它的包:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

您是否更喜欢使用容器映像?没问题! 🐳

62/5000 
你可以在文档中阅读更多关于使用Docker运行Falco的内容。(https://falco.org/docs/getting-started/running/#docker).

**请注意** 从这个版本开始，感谢我们的Falco Infra维护者之一Jonah，您还可以在AWS ECR图库中找到Falco -no-driver容器图片。falco-driver-loader容器映像也是如此(链接)。这是在编写Falco 0.27.0时开始在其他注册表上发布Falco容器映像的努力的一部分。

##新鲜事 🆕

现在让我们回顾一下Falco 0.28.1带来的一些新功能。

要获得完整的列表，请访问更新日志。(https://github.com/falcosecurity/falco/releases/tag/0.28.1).

强调一些：

- 新标志 --support 它包含有关 Falco 引擎版本的信息。
- 新增配置字段syscall_event_timeout。max_continuations来配置Falco必须发出警报的连续超时次数。
- bug修复:当一些无效数据到达时，不停止Kubernetes审计日志的web服务器。


##安全警告

你可以在页面中查看所有的安全建议，但是对于这个版本来说重要的是(https://github.com/falcosecurity/falco/security/advisories)
- 内核模块未检测到的崩溃禁用了Falco(https://github.com/falcosecurity/falco/security/advisories/GHSA-c7mr-v692-9p4g)
- 可以通过不同的技术绕过默认规则(https://github.com/falcosecurity/falco/security/advisories/GHSA-rfgw-vmxp-hp5g)
- 安全标志没有强制我的CMake-files(https://github.com/falcosecurity/falco/security/advisories/GHSA-qfjf-hpq4-6m37)

##咱们见面吧 🤝

一如既往，我们每周在我们的社区电话中见面，如果你想知道最新的和最好的你应该加入我们那里!(https://github.com/falcosecurity/community)

如果你有任何问题

- 加入Kubernetes Slack的#falco频道(https://kubernetes.slack.com/messages/falco)(https://slack.k8s.io)
- 加入Falco邮件列表(https://lists.cncf.io/g/cncf-falco-dev)

感谢所有了不起的贡献者!Falco已经有100个贡献者了，而且所有其他的Falco项目每天都收到大量的贡献者。

再接再厉!

Ciao!

Carlos

