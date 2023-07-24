---
title: Falco Rules
linktitle: Falco Rules
description: Write and customize Falco Rules to secure your environment
weight: 30
---

A Falco *rules file* is a [YAML](https://www.yaml.org/) file containing mainly three types of elements:

Element | Description
:-------|:-----------
[Rules](/docs/rules/basic-elements/#rules) | *Conditions* under which an alert should be generated. A rule is accompanied by a descriptive *output string* that is sent with the alert.
[Macros](/docs/rules/basic-elements/#macros) | Rule condition snippets that can be re-used inside rules and even other macros. Macros provide a way to name common patterns and factor out redundancies in rules.
[Lists](/docs/rules/basic-elements/#lists) | Collections of items that can be included in rules, macros, or other lists. Unlike rules and macros, lists cannot be parsed as filtering expressions.

Falco rules files can also contain two optional elements related to [versioning](/docs/rules/versioning):

Element | Description
:-------|:-----------
`required_engine_version` | Used to track compatibility between rules content and the falco [engine version](/docs/rules/versioning/#falco-engine-versioning).
`required_plugin_versions` | Used to track compatibility between rules content and [plugin versions](/docs/plugins#plugin-versions-and-falco-rules).

The Falco organization maintains a [rules repository](https://github.com/falcosecurity/rules) that provides both easy to install rules and examples for rule writers. You can learn more about the [default and custom rulesets](/docs/rules/default-custom) in the documentation.
