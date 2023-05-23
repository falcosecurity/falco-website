---
title: Falco 0.26.2 a.k.a. "the download.falco.org release"
date: 2020-11-10
author: Leonardo Di Donato, Lorenzo Fontana
slug: falco-0-26-2
---

今天我们宣布发布 Falco 0.26.2 🥳

这是10月1日发布的Falco 0.26.1的修补程序版本。

你可以在这里看看这些变化:

- [0.26.2](https://github.com/falcosecurity/falco/releases/tag/0.26.2)

像往常一样，如果您只想试用稳定版Falco 0.26.2，您可以按照文档中概述的过程安装其软件包：

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

你更喜欢使用docker镜像吗？没问题！

你可以在文档中阅读更多关于使用Docker运行Falco的内容。(https://falco.org/docs/getting-started/running/#docker).

##为什么要发布这个版本？

当您安装Falco时，您将使用内核模块、eBPF探测或文档中描述的用户空间检测驱动程序。(https://falco.org/docs/event-sources/drivers/).

As a service to our community, the Falco Infrastructure WG publishes pre-built drivers for all the current driver versions using the driverkit build grid.
154/5000 
作为对我们社区的一项服务，Falco基础设施工作组使用driverkit构建网格发布了所有当前驱动版本的预构建驱动。(https://lists.cncf.io/g/cncf-falco-dev/message/137)(https://github.com/falcosecurity/test-infra/tree/master/driverkit).

由于 2020 年 10 月的采用率激增，我们不得不想出一个更好的策略来分发我们的预构建驱动程序。

![Spike in Falco drivers adoption](https://raw.githubusercontent.com/falcosecurity/falco/662c82b82a1f8cbc65505f8240c1f21872c1669d/proposals/20201025-drivers-storage-s3_downloads.png)

为了实现这个目标，我们决定从现在开始只将驱动发布到download.falco.org/driver，而不是dl.bintray.com/falcosecurity/driver。旧的驱动程序将保留在那里，以避免当前工作负载的中断，但我们将不再向旧的桶发布新版本。让这一切发生的公关可以在这里找到。

我们还讨论并批准了一项提案，以便进行此更改，您可以找到它(https://github.com/falcosecurity/falco/blob/662c82b82a1f8cbc65505f8240c1f21872c1669d/proposals/20201025-drivers-storage-s3.md)

##我应该怎么办？

如果你使用docker镜像安装Falco并依赖于我们的预构建驱动程序，你有两个选择:

**建议**: *更新到0.26.2*

使用docker运行标志-e -将其作为环境变量传递，例如:

**On bash:**

```console
export DRIVERS_REPO=https://download.falco.org/driver
falco-driver-loader
```

**Docker**

Pass it as environment variable using the docker run flag -e - for example:

```console
docker run -e DRIVERS_REPO=https://download.falco.org/driver
```

**Kubernetes**

```yaml
spec:
  containers:
  - env:
    - name: DRIVERS_REPO
      value: https://download.falco.org/driver
```


##接下来做什么?

我们计划在12月1日发布0.27.0 !(https://github.com/falcosecurity/falco/milestone/13)

它将包含许多令人兴奋的特性和性能改进!请继续关注 🤙


##让我们见面吧!

与往常一样，我们每周都会在社区电话会议上见面，如果您想了解最新和最伟大的信息，您应该加入我们！(https://github.com/falcosecurity/community)

如有任何问题

 - Join the #falco channel on the [Kubernetes Slack](https://slack.k8s.io)
 - [Join the Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)


再见！

Leo和Lore

