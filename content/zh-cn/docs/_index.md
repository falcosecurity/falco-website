---
title: Falco 中文文档
description: Falco 容器安全系统概览
weight: 1
aliases: [/zh/docs/]
---

## 关于 Falco

Falco 是一款旨在检测应用中反常活动的行为监视器，由[Sysdig](https://github.com/draios/sysdig)的[系统调用捕获](https://sysdig.com/blog/fascinating-world-linux-system-calls/)基础设施驱动。您仅需为 Falco 撰写[一套规则](/docs/rules)，即可在一处持续监测并监控容器、应用、主机及网络的异常活动。

### Falco 可检测哪些行为？

Falco 可以监测调用 [Linux 系统调用](http://man7.org/linux/man-pages/man2/syscalls.2.html)的行为，并根据其不同的调用、参数及调用进程的属性发出警告。例如，Falco 可轻松检测：

* 容器内运行的 Shell
* 服务器进程产生意外类型的子进程
* 敏感文件读取（如 `/etc/shadow`）
* 非设备文件写入至 `/dev`
* 系统的标准二进制文件（如 `ls`）产生出站流量

## 与其他工具的对比

我们常常会被问到 Falco 与 [SELinux](https://en.wikipedia.org/wiki/Security-Enhanced_Linux)、[AppArmor](https://wiki.ubuntu.com/AppArmor)、[Auditd](https://linux.die.net/man/8/auditd) 或其他 Linux 安全策略工具有何不同。为此，我们在 [Sysdig 博客](https://sysdig.com/blog)上撰写了[一篇博文](https://sysdig.com/blog/selinux-seccomp-falco-technical-discussion/)，并详细对比了多款工具。

## 如何使用 Falco

Falco 应作为守护程序部署。您可将其作为一款 [deb](/docs/getting-started/installation#debian)/[rpm](/docs/getting-started/installation#centos-rhel) 软件包安装在主机或容器宿主上，亦或可以作为[容器](/docs/getting-started/running#docker)部署。当然，您也可以下载[源代码](/docs/getting-started/source)并自己动手编译安装。

您可通过[规则文件](/docs/rules)或[通用配置文件](/docs/configuration)定义 Falco 应监视的行为及事件。我们提供了一份示例规则文件 [`./rules/falco_rules.yaml`](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml)，您可随意修改规则来适配您的工作环境。

当您撰写规则时，Falco 可读取由 Sysdig 产生的回溯文件。这一特性可让您在调整规则时“录制”有害行为，并无限次数地回放。

部署后，Falco 将利用 Sysdig 内核模块及用户空间函数库来监控规则文件定义中的任意事件。若异常事件发生，Falco 会将通知信息写入您所配置的输出中。

## Falco 行为报警

当 Falco 检测到可疑行为时，[报警信息](/docs/alerts)可通过下列渠道输出：

* 写入标准错误
* 写入文件
* 写入系统日志
* 管道至特定程序（如发送电子邮件）
