---
title: Cloud Native Security Hub
date: 2019-11-18
author: Kris Nova
slug: cloud-native-security-hub

---

# Falco rule 管理

Falco社区非常高兴地宣布，我们将优化我们管理和安装Falco引擎的安全规则的方式。

我们已经发布了一个通用安全规则的 [开源仓库](https://github.com/falcosecurity/cloud-native-security-hub/tree/master/resources/falco)，可以与Falco配合使用。你可以检查在[securityhub.dev](https://securityhub.dev/).上动态呈现的规则。

# 安装一个rule

在这个快速示例中，我们将为CVE-2019-11246添加运行时检测。

#### 理解rule

注意[仓库](https://github.com/falcosecurity/cloud-native-security-hub/blob/master/resources/falco/cve/2019-11246.yaml#L10-L19)中发现的元信息与[CVE-2019-11246的安全中心页面](https://github.com/falcosecurity/cloud-native-security-hub/blob/master/resources/falco/cve/2019-11246.yaml#L10-L19)上的数据是如何匹配的

目前，我们支持两种安装方式安装rule：`helm upgrade`和使用原始YAML安装

#### 使用Helm安装

如果你使用`helm`安装和管理Falco，你可以使用友好的`helm`指令来修改配置。在本例中，我们使用`-f`将仓库中的rule附加到`falco`安装中。

```
helm upgrade falco -f https://api.securityhub.dev/resources/cve-2019-11246/custom-rules.yaml stable/falco
```

#### 使用原始YAML安装

您可以单击仓库网站中的`yaml`按钮，以查看rule的原始YAML：

```
- macro: safe_kubectl_version
  condition: (jevt.value[/userAgent] startswith "kubectl/v1.19" or
              jevt.value[/userAgent] startswith "kubectl/v1.18" or
              jevt.value[/userAgent] startswith "kubectl/v1.17" or
              jevt.value[/userAgent] startswith "kubectl/v1.16" or
              jevt.value[/userAgent] startswith "kubectl/v1.15" or
              jevt.value[/userAgent] startswith "kubectl/v1.14.3" or
              jevt.value[/userAgent] startswith "kubectl/v1.14.2" or
              jevt.value[/userAgent] startswith "kubectl/v1.13.7" or
              jevt.value[/userAgent] startswith "kubectl/v1.13.6" or
              jevt.value[/userAgent] startswith "kubectl/v1.12.9")

# CVE-2019-11246
# Run kubectl version --client and if it does not say client version 1.12.9, 1.13.6, or 1.14.2 or newer,  you are running a vulnerable version.
- rule: K8s Vulnerable Kubectl Copy
  desc: Detect any attempt vulnerable kubectl copy in pod
  condition: kevt_started and pod_subresource and kcreate and
             ka.target.subresource = "exec" and ka.uri.param[command] = "tar" and
             not safe_kubectl_version
  output: Vulnerable kubectl copy detected (user=%ka.user.name pod=%ka.target.name ns=%ka.target.namespace action=%ka.target.subresource command=%ka.uri.param[command] userAgent=%jevt.value[/userAgent])
  priority: WARNING
  source: k8s_audit
  tags: [k8s]
```

然后，您可以使用[官方文档](https://falco.org/docs/rules/#appending-to-lists-rules-and-macros)中定义的Falco术语进行安装。

我们计划开发一个CLI工具`falcoctl`，该工具当前处于alpha 状态。我们希望构建的一些基本功能：

- CLI风格界面，用于管理`falco` rule，包括安装、获取、升级和移除
- 使用哈希和仓库中的已知密钥验证rule
- 关于如何构建自己的仓库的文档
- Gitops风格的工作流程

继续阅读，了解更多关于如何参与和贡献的信息，特别是如果你有想法的话。我们很想听听。

# 参与其中

该项目最初由Sysdig启动，但维护仓库和构建rule现在将由CNCF和Falco社区管理。

如果您有兴趣参与编写rules，或围绕新中心构建工具，请联系[The official CNCF Falco Mailing List](https://lists.cncf.io/g/cncf-falco-dev) 或加入 [Falco slack channel](https://slack.sysdig.com)。

### 参与Falcoctl集成

我们目前正处于构建命令行工具falcoctl阶段，该工具用于管理安全中心规则。

如果您编写Go，并有兴趣加入为用户构建管理体验的工作，我们很乐意与您合作！请使用上面的链接联系我们。

我们已经提议对Falcoctl代码库进行一些[更改](https://github.com/falcosecurity/falcoctl/issues/44)，以开始使用Falcoctl来管理rule。

如果阅读这篇文章让你感到兴奋，并且你对合作感兴趣，我们很乐意进行更多的讨论。

### 呼叫维护者

此外，如果您有兴趣直接参与 CNCF 开源，并希望成为维护者，请使用上面的链接联系。您将有机会直接与 Falco 团队和 Falco 社区合作。以及拥有尖端安全工具的所有权。

### 贡献rule

安全中心的Falco rule剖析如下：

```
apiVersion: v1
kind: FalcoRules
name: CVE-2020-12345
shortDescription: What does this rule do? Why is it useful?
version: 1.0.0
description: |
  # Here is valid markdown
  
  Add *anything* you want and it will be rendered on the security hub!

keywords:
  - falco, rule, awesome
icon: https://cve.mitre.org/images/cvebanner.png
maintainers:
  - name: Kris Nova
    link: https://github.com/kris-nova
rules:
  - raw: |
  # Here is a valid Lua rule for Falco
```

请使用上面定义的语法创建一个新的rule，并提交PR到[安全中心存储库](https://github.com/falcosecurity/cloud-native-security-hub)。
