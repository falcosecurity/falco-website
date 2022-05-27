---
title: Contribution of the drivers and the libraries
date: 2021-02-23
author: Leonardo Di Donato, Leonardo Grasso
slug: contribution-drivers-kmod-ebpf-libraries
---

![驱动程序和库对CNCF的贡献！](/img/falco-contributes-libraries-cncf-featured.png)

我们很高兴地宣布您的组件Sysdig Inc.已经在内核中**** eBPF 、**和**源**库**的贡献，可以对这些**库**的代码进行组织。 /libs]（https：//github.com/falcosecurity/libs）存储库中找到它。

这是[提案]中概述的更广泛的活动的一个//github贡献的部分。在过去不久里与Falco进行了介绍和讨论。

每个人都在上运行一个数据源调用。使用源内核模块或BPF程序在系统自动运行这个程序。在方法方面，核心的效率更高一些，而BPF的现代方式。 。扩展由两个库完成：“libsinsp”和“libscap”。

![带有驱动程序和库的完整 Falco 架构！](/img/falco-diagram-blog-contribution.png)

## 未来的计划

在接下来的社区里，我们计划让组件更棒，更适合使用。

-通过使CMake文件现代化来改​​进制造机制
-定义SemVer 2.0版本控制机制
-实现一个健壮的测试套件
-通过我们美丽的[Falco Prow Infra]设置日常集成工作(https://prow.falco.org/)
-将这些作为主要发行版的库分发到[download.falco.org/](https://download.falco.org/)
-记录API

正如你所看到的，有很多人所用的新机会😄

# 如何迁移现有的拉取请求

如果你有你的拉取请求（draios/sysdig/pulls）
关于这些组件，我们提供了说明来将它们移动到[FalcoSecurity/libs]（https://github.com/falcosecurity/libs）库。


你的 GitHub 句柄下已经有一个 https：/github.com/falcosecurity/libs 分支和他们部署一个 https：///////draios/sysdig 分支，并假设与每个分支的顺序：

在本地长“fal cosecurity/libs”分支：
```控制台
git clone https://github.com/<your_handle>/libs
cd libs
```

为您的“draios/sysdig”添加远程分支：
```控制台
git remote add sysdig-fork https://github.com/<username>/sysdig.git
git fetch --all
```

签出拉取请求的分支：
```控制台
git checkout --no-track -b <branch> sysdig-fork/<branch>
```

将其额外“master”分支：
```控制台
git rebase -i --exec 'git commit --amend --no-edit -n -s -S' master
```

然后，将其拖到<your_handle>/libs存储库：
```控制台
git push -u origin <branch>
```

你现在可以像往常一样在https://github.com/falcosecurity/libs 上打开一个PR，你可以从GitHub用户界面手动操作。

## 结局

这些软件文章的贡献具有安全性将帮助 Falco。关于这个出色的其他项目更有更多的云朵环境。贡献的信息见 Loris Degioanni 的[CNCF 博客]（https://cf.io） /blog/2021/02/24/sysdig-contributes-falcos-kernel-module-ebpf-probe-and-libraries-to-the-cncf/）。

除了Falco，[sysdig cli-tool]（https：//github/digios/sysdig）也可以从现在开始使用库。将在这些图书馆的基础上建立什么！

如果你想了解更多关于 Falco 的信息：

- 查看[ GitHub中的Falco项目](https://github.com/falcosecurity/falco)
- 加入[ Falco社区](https://falco.org/community/)
- 在[#falco channel（Kubernetes Slack）]上与维护人员会面(https://kubernetes.slack.com/?redir=%2Fmessages%2Ffalco)
- 在Twitter上关注[ @Falco_org ]（https：//twitter.com/falco_org）
