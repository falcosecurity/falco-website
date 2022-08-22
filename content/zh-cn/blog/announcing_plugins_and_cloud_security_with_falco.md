---
title: "通过Falco发布插件和云安全"
linktitle: "通过Falco发布插件和云安全"
date: 2022-02-09
author: Loris Degioanni
slug: falco-announcing-plugins
---

刚刚发布的Falco v0.31.0是几个月努力工作的结果，包括许多令人兴奋的新特性。然而，其中之一对于Falco作为一个项目来说尤其具有战略意义：插件框架的普遍可用性，我想用这篇博文来解释为什么插件令人兴奋，以及它们对Falco的未来意味着什么，让我们先解释一下这项新技术是什么。

### 什么是插件？
插件是可由Falco加载以扩展其功能的共享库。插件有两种风格：

-源插件为Falco添加了新的数据源。它们从本地机器或远程来源生成Falco能够理解的输入事件。
-提取器插件解析来自源插件的数据，并公开可用于Falco规则的新字段。

源插件和提取器插件的结合使用户可以将任意数据输入Falco，以有用的方式解析数据，并从中创建规则和策略。让我举个例子：Cloudtrail插件扩展了Falco以理解Cloudtrail日志（本地或存储在S3上），并允许您编写如下规则：

```yaml
- rule: Console Login Without MFA
  desc: Detect a console login without MFA.
  condition: ct.name="ConsoleLogin" and ct.error=""
    and ct.user.identitytype!="AssumedRole" and json.value[/responseElements/ConsoleLogin]="Success"
    and json.value[/additionalEventData/MFAUsed]="No"
  output: Detected a console login without MFA (requesting user=%ct.user, requesting IP=%ct.srcip, AWS region=%ct.region)
  priority: CRITICAL
  source: aws_cloudtrail
```

类似上面的规则由你的out-of-the-box Falco验证和评估。但是有了插件，规则现在可以应用于几乎任何数据源，在那里你可以为它编写插件，你甚至不需要重建Falco就可以添加新的数据源。

### 为什么是插件？

Falco的“运行时安全”理念基于一些关键概念：
- 以流式方式解析数据以实时检测威胁
- 在轻量级运行且易于部署的引擎上实现检测
- 提供一种紧凑的规则语言，可以快速学习，但灵活且富有表现力

这种理念对系统调用非常有效，这也是Falco作为容器运行时安全解决方案蓬勃发展的原因。

插件将这一理念的适用性扩展到无数新领域。其中一个领域是云安全。

### 运行时安全：在云中检测威胁的更好选择

云安全是一个肥沃且不断发展的空间。在实施云安全时，您可以在许多不同的选项中进行选择。然而，在架构上，大多数选项属于以下类别之一：

1. 查询云API或监视云数据存储以检测错误配置或漏洞的工具
2. 将云日志流式传输到后端、索引它们并允许您查询它们的工具

要检测基于云的软件中的威胁，类别1不是很有用。轮询在发现差距和验证合规性方面非常有用，但缺乏检测威胁和快速响应所需的实时性。Category 2功能强大，但也非常昂贵（尤其是在公共云这样的环境中，大量日志都是在公共云中生成的），而且部署和使用起来也不友好。

我认为Falco运行时安全方法是理想的方法。Falco消耗的资源很少，最重要的是，它以流式方式分析数据。无需执行昂贵的拷贝，无需等待数据被索引。Falco实时查看您的数据，并在几秒钟内通知您。

Falco的启动和运行只需几分钟，云日志和系统调用都采用了Falco，这就为威胁检测提供了一种统一的方法。

### Falco的未来是什么？

V0.31.0附带了一个插件Cloudtrail，但预计未来还会有更多插件。我们的愿景是让Falco成为所有方面的运行时策略引擎。我们希望支持所有的云，并包括来自每个云的更多服务。

请继续关注近期发布的消息，同时，请告诉我们您是否希望在未来看到Falco的行动。此外，[编写自己的插件很容易](https://falco.org/docs/plugins/)作为一个社区，我们很乐意考虑你们的创造性贡献。

你可以在[Falca社区]找到我们(https://github.com/falcosecurity/community)。如有任何问题、建议，请随时联系我们，甚至进行友好交谈！

如果你想了解更多关于Falco的信息：

* 从[Falco.org]开始(http://falco.org/)
* 查看[Falco在GitHub的项目](https://github.com/falcosecurity/falco).
* 参与[Falco社区](https://falco.org/community/).
* 与[Falco Slack]上的维修人员会面(https://kubernetes.slack.com/messages/falco).
* 关注[@falco_org on Twitter](https://twitter.com/falco_org).
