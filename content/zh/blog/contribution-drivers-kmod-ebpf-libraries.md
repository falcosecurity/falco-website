---
标题: 驱动程序和库的贡献
日期: 2021-02-23
作者: Leonardo Di Donato, Leonardo Grasso
slug: contribution-drivers-kmod-ebpf-libraries
---

![驱动程序和库对CNCF的贡献!](/img/falco-contributes-libraries-cncf-featured.png)

我们很高兴地宣布Sysdig Inc.对**内核模块**、**eBPF**探测器和**库**的贡献，这些组件的源代码已移到Falco组织中。您已经可以在[falcosecurity/libs]（https：//github.com/falcosecurity/libs）存储库中找到它。

这一贡献是[提案]中概述的更广泛进程的一个初步但基本的部分(https://github.com/falcosecurity/falco/blob/master/proposals/20210119-libraries-contribution.md)Falco的作者在过去几个月里与Falco社区进行了介绍和讨论。

大家都知道，Falco主要在一个数据源上运行：系统调用。该数据源使用内核模块或eBPF探测器（我们称之为驱动程序）收集。这两个驱动程序在功能上是等效的。在性能方面，内核模块的效率稍高一些，而eBPF方法更安全、更现代。在被Falco使用之前，需要对收集的数据进行充实（例如，需要将文件描述符编号转换为文件名或IP地址）。扩展由两个库完成：“libsinsp”和“libscap”。

![带有驱动程序和库的完整Falco体系结构!](/img/falco-diagram-blog-contribution.png)

## 未来的计划

在接下来的几个月里，我们计划让这些组件变得更棒，更适合社区使用。

- 通过使CMake文件现代化来改进构建机制
- 定义SemVer 2.0版本控制机制
- 实现一个健壮的测试套件
- 通过我们美丽的[Falco Prow Infra]设置持续集成工作(https://prow.falco.org/)
- 将这些库作为主要发行版的软件包分发到[download.falco.org]上(https://download.falco.org/)
- 记录API

正如你所看到的，有很多事情要做！捐款的新机会😄

## 如何迁移现有的拉取请求

如果您有正在进行的拉取请求 [draios/sysdig](https://github.com/draios/sysdig/pulls)
关于这些组件，我们提供了以下说明来将它们移动到[FalcoSecurity/libs]（https：//github.com/falcosecurity/libs）存储库。


假设您的GitHub句柄下已经有一个https：//github.com/falcosecurity/libs分支和一个https：//github.com/draios/sysdig分支，并假设它们与各自的上游同步：

在本地克隆“falcosecurity/libs”分支：
```console
git clone https://github.com/<your_handle>/libs
cd libs
```

为您的“draios/sysdig”分支添加远程:
```console
git remote add sysdig-fork https://github.com/<username>/sysdig.git
git fetch --all
```

签出拉取请求的分支:
```console
git checkout --no-track -b <branch> sysdig-fork/<branch>
```

将其重新置于“master”分支之上:
```console
git rebase -i --exec 'git commit --amend --no-edit -n -s -S' master
```

然后，将其推送到`<your_handle>/libs`存储库：:
```console
git push -u origin <branch>
```

你现在可以像往常一样在https：//github.com/falcosecurity/libs.上打开一个PR，你可以从GitHub用户界面手动操作。

## 结论

这些出色软件的贡献不仅将帮助Falco，还将帮助其他项目拥有更安全的云原生环境。关于这一贡献的更多信息见Loris Degioanni的[CNCF博客文章]（https：//www.cncf.io/blog/2021/02/24/sysdig-contributes-falcos-kernel-module-ebpf-probe-and-libraries-to-the-cncf/）。

除了Falco之外，[sysdig CLI-tool]（https：//github.com/draios/sysdig）也被重构以使用这些库。从现在开始，其他项目也可以从中受益！我们很激动地看到人们将在这些图书馆的基础上建立什么！

如果你想了解更多关于Falco的信息:

- 查看[GitHub中的Falco项目](https://github.com/falcosecurity/falco)
- 加入[Falco社区](https://falco.org/community/)
- 在[#falco channel（Kubernetes Slack）]上与维护人员会面(https://kubernetes.slack.com/?redir=%2Fmessages%2Ffalco)
- 在Twitter上关注[@Falco_org]（https：//twitter.com/falco_org）
