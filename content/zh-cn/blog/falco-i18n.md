---
title: "Internationalize Falco Website"
date: 2021-06-11
author: Radhika Puthiyetath
slug: i18n-falco-website
---

多样性和包容性是CNCF生态系统的核心价值。作为其孵化项目，Falco与这些原则的充分表达相一致，并发挥着作用。由于我们认识到国际化是通过打破语言障碍促进开放和参与的有力工具，Falco鼓励并支持国际化（i18n）工作。随着三个i18n项目即将完成和一个正在进行的项目，Falco正在引领潮流。

i18n的目标是使Falco对尽可能多的人来说更容易使用。为了让大家更顺利地进入Falco i18n工作流程，我们整理了这个页面。它为您提供了Falco社区在实现Falco网站国际化过程中所遵循的i18n流程的大致情况。

## 初始化新的语言贡献

在你开始之前，确保没有其他人在进行你的语言翻译。如果有，请加入他们。如果你是第一个开始这个项目的人，请查看一般的[贡献指南](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md)。

### 标识区域设置代码

作为第一步，确定与你所选择的语言相关的地区代码。你可以在拉动请求（PR）注释中手动分配语言标签。

例如，当作为评论留在一个问题或PR上时，命令`/kind translation`分配了标签`kind/translation`。

### 查找文件和目录

与Falco本地化相关的文件和目录是：

* [i18n](https://github.com/falcosecurity/falco-website/tree/master/i18n)目录：它包含Falco网站的翻译主页，每个地区都有一个对应于主页的文件，你应该创建一个与你的语言相对应的文件。
* [content](https://github.com/falcosecurity/falco-website/tree/master/content)目录：博客、文档、社区和视频的翻译内容都在[content](https://github.com/falcosecurity/falco-website/tree/master/content)目录下。
* [配置文件](https://github.com/falcosecurity/falco-website/blob/master/config.toml)：它位于根目录中，TOML文件包含静态网站生成器hugo的配置，它包含了语言、格式化、缓存等方面的设置，请确保你创建了一个与你的语言相对应的语言子项。
* OWNERS文件。Falco网站有一个[OWNERS](https://github.com/falcosecurity/falco-website/blob/master/OWNERS)文件，列出项目的审核者和批准者。同样地，为你的语言项目创建一个OWNERS文件。请参阅马拉雅拉姆语的[OWNERS](https://github.com/falcosecurity/falco-website/blob/master/content/ml/OWNERS)文件，以作参考。

### 选择i18n工具

选择你喜欢的语言键盘，确保它能与标记编辑器一起工作，如果不能，就简单地使用谷歌文档及其语言选项，然后将内容复制到标记编辑器中。

## 为Falco I18N做出贡献

本节帮助你从头开始为Falco进行i18n工作。


1. Fork [Falco Website](https://github.com/falcosecurity/falco-website) 资源库。

2. 为您的翻译项目创建分支。
    例如: `git checkout -b new/language-<lang code>`

    用你选择的语言和区域代码替换`语言-<区域代码>`。

3. 在[i18n](https://github.com/falcosecurity/falco-website/tree/master/i18n)目录下创建`<lang code>.yaml`文件。
    在这个文件中，你主要包括主页的翻译内容。


4. 在[config.toml](https://github.com/falcosecurity/falco-website/blob/master/config.toml)文件中再增加一个`[语言]`子节。

   例如，对于韩国人来说：

    ```[languages.ko]
    title = "Falco"
    description = "런타임 보안"
    languageName = "한국어 Korean"
    weight = 3
    contentDir = "content/ko"
    languagedirection = "ltr"

    [languages.ko.params]
    time_format_blog = "2006.01.02"
    language_alternatives = ["en"]

    ```

5. 在[content](https://github.com/falcosecurity/falco-website/tree/master/content)目录下创建一个目录，命名为`<lang code>`，与你的语言相对应。

   例如，`content/ml`是对应于马拉雅拉姆语言的目录。

6. 导航到你刚刚创建的语言目录。

   `cd content/<lang code>`

   用你的地区标识替换`<lang code>`。

7. 在该目录下创建一个`_index.md`文件。

   例如，请看对应于英语的[_index.md](https://github.com/falcosecurity/falco-website/blob/master/content/en/_index.md)文件。

8. 将内容翻译成你的语言。

9. 创建一个`content/<lang code>/docs`目录，并在其中创建一个相应的`_index.md`文件。

   同样，确保为`content/<lang code>`目录下的每个目录和子目录创建一个`_index.md`文件。

10. 从 "入门 "部分开始，复制 "入门 "目录及其文件结构。

11. 将 "入门 "目录中的内容翻译成你的语言。

    例如，请看[英文](https://github.com/falcosecurity/falco-website/tree/master/content/en/docs/getting-started)版本的入门目录。

12. 确保你用`git commit -s -m "message"`签署你的提交。

13. 一旦准备好，就针对主文件创建PR，确保你把工作分成小的单元。


## 成为一名维护者

Falco i18n成员可以审查和批准自己的PR。例如，英语的审查和批准权限可以在 [falco-website](https://github.com/falcosecurity/falco-website) 资源库根目录下的 [OWNERS](https://github.com/falcosecurity/falco-website/blob/master/OWNERS) 文件中找到。更多信息见[GOVERNANCE](https://github.com/falcosecurity/.github/blob/master/GOVERNANCE.md)。

作为贡献者，请确保你在`content/<lang code>`目录下创建一个OWNERS文件，以便成为该本地化的维护者。
