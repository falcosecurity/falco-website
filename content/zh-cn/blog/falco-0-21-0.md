---
title: Falco 0.21.0 is out!
date: 2020-03-18
author: Leonardo Di Donato
slug: falco-0-21-0
---

尽管封锁了，Falco 0.21.0还是决定出去!真是个坏家伙!(https://github.com/falcosecurity/falco/releases/tag/0.21.0)

值得注意的是，这是第一个采用新的构建和发布流程的版本。 🚀

新的发布流程!

如果您只需要 Falco 0.21.0，您可以在以下存储库中找到它的包：

- https://bintray.com/falcosecurity/rpm/falco/0.21.0
- https://bintray.com/falcosecurity/deb/falco/0.21.0
- https://bintray.com/falcosecurity/bin/falco/0.21.0

安装使用它们的说明已经在Falco网站上更新:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel-amazon-linux)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian-ubuntu)

相反，对于喜欢docker镜像的人来说…… 🐳

```bash
docker pull falcosecurity/falco:0.21.0
docker pull falcosecurity/falco:0.21.0-minimal
docker pull falcosecurity/falco:0.21.0-slim
```

##显著的变化

Falco的第100版带有一些显着的变化。

###新的发布流程到位

在过去的几周里，我与 Lorenzo 一起为 Falco 建立了一个全新的自动化发布流程。(https://github.com/fntlnz) 

PR 1059的大部分工作都是我们做的。(https://github.com/falcosecurity/falco/pull/1059).


这个过程发生在两种情况下：

1. 一个推送请求被合并到master中，这导致Falco的开发版本的发布
2. master上的提交会收到一个git标签，这导致了Falco的稳定版本的发布


当以下两种情况之一发生时:

1. 它将Falco打包成签名(GPG公钥)包:DEB、RPM和TAR.GZ(https://falco.org/repo/falcosecurity-packages.asc)
2. 它将这些包推到它们新的开放存储库中
    i. Deb-dev, rpm-dev, bin-dev用于开发版本
	  ii. deb, rpm, bin 用于稳定版本
3. 它从这些包构建docker映像
4. 它将docker镜像推送到docker hub(https://hub.docker.com/r/falcosecurity/falco)
   1. `falcosecurity/falco:master`, `falcosecurity/falco:master-slim`, `falcosecurity/falco:master-minimal` for _development_ versions
   2. `falcosecurity/falco:latest`, `falcosecurity/falco:latest-slim`, `falcosecurity/falco:latest-minimal` for _stable_ versions

**March 2021 update**: 所有软件包现在都发布到download.falco.org。(https://download.falco.org/?prefix=packages/).

### FALCO_BPF_PROBE

由于Lorenzo的贡献(PR 1050)，要使Falco使用eBPF探针作为驱动程序，您需要指定一个名为FALCO_BPF_PROBE的环境变量，而不是SYSDIG_BPF_PROBE。(https://github.com/falcosecurity/falco/pull/1050)),

```bash
FALCO_BPF_PROBE="" ./build/release/userspace/falco/falco -r ...
```

请更新您的systemd脚本或Kubernetes部署。

###Falco版本现在是SemVer 2.0兼容的

在pr 1086中，我完成了从git索引创建Falco版本为SemVer 2.0兼容版本字符串的过程。(https://github.com/falcosecurity/falco/pull/1086)

此PR将预发布部分引入Falco版本。

现在的Falco版本是0.21.0-3+c5674c9，其中3是自Falco最新稳定版本(0.21.0)以来的提交次数，而c5674c9是当前开发版本的提交哈希值。

请注意，Falco gRPC版本API也已经包含了这个版本部分。

###默认情况下禁用“检测到普通矿机池端口的出站连接”规则

感谢海泽在PR 1061中的工作，用户将不会受到大量关于假想采矿工具的乏味警告的影响。

从现在开始，该规则默认禁用。

另外，如果您启用了它，它将忽略本地主机和RFC1918地址。

##其他的变化

你可以在这里阅读完整的更新日志!(https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md)!

##一些统计数据

合并了19个PR，其中12个包含针对最终用户的更改。

自上一个版本以来，在17天内提交了64次。

##即将到来的事情

请继续关注即将到来的驱动构建网格，它使用driverkit(我和Lorenzo的一个隔离项目)预构建并发布(也是公开的!)Falco内核模块和Falco eBPF探测一组预定义的目标系统和内核发行版。(https://github.com/falcosecurity/test-infra/tree/master/driverkit)

预构建的Falco内核模块和Falco eBPF探测器即将公开!

