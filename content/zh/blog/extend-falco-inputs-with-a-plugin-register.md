---
标题: 通过创建插件扩展Falco输入：Register the plugin
日期: 2022-03-02
作者: Thomas Labarussias
slug: extend-falco-inputs-with-a-plugin-register
---

> 这篇文章是“如何开发Falco插件”系列文章的一部分。这是写给任何想了解插件是如何编写的并想做出贡献的人的。
> 请参阅其他文章:
> * [通过创建插件扩展Falco输入：基础知识]({{< ref "/blog/extend-falco-inputs-with-a-plugin-the-basics" >}})

- [介绍](#introduction)
- [注册表](#the-registry)
- [您的插件的详细信息](#details-of-your-plugin)
  - [执照](#license)
  - [ID](#id)
  - [名字](#name)
  - [字段](#fields)
- [提出你的插件](#propose-your-plugin)
- [与社区分享](#share-with-the-community)
- [结论](#conclusion)

# 介绍

在上一篇[post]({{< ref "/blog/extend-falco-inputs-with-a-plugin-the-basics" >}})文章中，我们介绍了开发插件的所有基础知识。在本文中，我们将重点介绍注册并允许社区使用它的步骤。

> “source”插件的注册是强制性的，“extractor”插件的注册是可选的（但仍然推荐）。本博客将讨论“source”插件的注册。

# 注册表

目前，我们称之为“Plugin Registry”的是一个git存储库，它通过一个[`yaml` file]文件来集中所有可用的插件(https://github.com/falcosecurity/plugins/blob/master/registry.yaml).

[自述文件]中的表格(https://github.com/falcosecurity/plugins#registered-plugins）由上述注册表自动生成:

| ID  | 名字                                                                                       | 事件源            | 描述                                                                                                                                                                                                                   | 信息                                                                                |
| --- | ----------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2   | [cloudtrail](https://github.com/~~falcosecurity~~/plugins/tree/master/plugins/cloudtrail) | `aws_cloudtrail` | 从文件/S3读取CloudTrail JSON日志并作为事件注入                                                                                                                                                               | 作者: [The Falco Authors](https://falco.org/community) <br/> 许可证: Apache-2.0 |
| 3   | [dummy](https://github.com/falcosecurity/plugins/tree/master/plugins/dummy)               | `dummy`          | 用于文档界面的参考插件                                                                                                                                                                                | 作者: [The Falco Authors](https://falco.org/community) <br/> 许可证: Apache-2.0 |
| 4   | [dummy_c](https://github.com/falcosecurity/plugins/tree/master/plugins/dummy_c)           | `dummy_c`        | 与Dummy类似，但用C++编写                                                                                                                                                                                                | 作者: [The Falco Authors](https://falco.org/community) <br/> 许可证: Apache-2.0 |
| 999 | test                                                                                      | `test`           | 此ID保留用于源插件开发，任何插件作者都可以使用此ID，但作者可以期待其他开发人员使用此ID的事件。开发完成后，作者需要一个真实的ID | 作者: N/A <br/> 许可证: N/A                                                     |

# 插件的详细信息

在本节中，我们将介绍允许插件注册的关键元素。

注册需要你为你的插件创建一个很好的自述文件，还要完成[注册表.yaml]中“插件”部分的所有字段(https://github.com/falcosecurity/plugins/blob/master/registry.yaml)，比如：

```yaml
plugins:
    source:
      - id: 2
        source: aws_cloudtrail
        name: cloudtrail
        description: Reads Cloudtrail JSON logs from files/S3 and injects as events
        authors: The Falco Authors
        contact: https://falco.org/community
        url: https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail
        license: Apache-2.0
```

## 许可证

你可以自由选择你想要的开源许可证，你可以查看[https://choosealicense.com/](https://choosealicense.com/)寻求帮助。目前大多数插件都在Apache许可证2.0下。

## ID

每个源插件都需要自己独特的插件事件'ID'，才能与'Falco'和其他插件进行互操作。此“ID”的使用方式如下：

* 它存储在内存中的事件对象中，用于标识注入事件的关联插件。
* 它存储在捕获文件中，用于在读取捕获文件时重新创建内存中的事件对象。

它必须是唯一的，以确保给定插件编写的事件将与该插件（及其事件源，见下文）正确关联。

## 名字

注册表中的每个插件必须有自己的“名称”，并且可以不同于“事件源”，可以在不同的插件之间共享（例如，对于k8s审计日志，我们可能有不同的插件，但只有一种类型的“事件源”）。

“name”应与此正则表达式匹配 `^[a-z]+[a-z0-9_]*$`.

## Fields

“fields”用于规则中的条件，您必须在自述文件中描述插件的可用字段。

例如:

| 名字                      | 类型   | 描述                            |
| ------------------------ | ------ | ------------------------------ |
| `docker.status`          | string | 事件的状态                       |
| `docker.id`              | string | 事件的ID                        |
| `docker.from`            | string | 事件的来源（已弃用）              |
| `docker.type`            | string | 事件的类型                       |
| `docker.action`          | string | 事件的部分                       |
| `docker.stack.namespace` | string | 堆栈命名空间                     |

# 推荐你的插件

一旦你准备好了，你就可以提交你的插件进行注册。:
* fork https://github.com/falcosecurity/plugins
* update [falcosecurity/plugins/edit/master/registry.yaml](https://github.com/falcosecurity/plugins/edit/master/registry.yaml) for adding your plugin in the `plugins` section
* submit your PR to [falcosecurity/plugins](https://github.com/falcosecurity/plugins)

> 遵循我们的[`contribution`指南](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md)你的承诺必须被签署。

你可以找到更多信息 [here](https://github.com/falcosecurity/plugins#registering-a-new-plugin).

# 与社区分享

通过与社区分享您的想法和代码，您将获得直接反馈。在提交你的公关之前，不要犹豫在Slack kubernetes#falco分享你的作品！

# 结论

你现在应该能够向社区推荐你的插件，并获得反馈。下面的帖子将描述更高级的用例，比如来自云服务的事件。敬请期待！
---

你可以在[猎鹰社区]找到我们(https://github.com/falcosecurity/community)。如有任何问题、建议，请随时联系我们，甚至进行友好交谈！

如果你想了解更多关于Falco的信息:

* 开始吧 [Falco.org](http://falco.org/)
* [插件文档](https://falco.org/docs/plugins/)
* [插件开发者指南](https://falco.org/docs/plugins/developers-guide/)
* [插件注册表](https://github.com/falcosecurity/plugins) 
* 查看 [Falco GitHub中的项目](https://github.com/falcosecurity/falco)
* 参与 [Falco 社区](https://falco.org/community/)
* 与现场的维护人员会面 [Falco Slack](https://kubernetes.slack.com/messages/falco)
* Follow [@falco_org 在 Twitter](https://twitter.com/falco_org)
