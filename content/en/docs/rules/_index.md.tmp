---
title: Falco Rules
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

## Escaping Special Characters

In some cases, rules may need to contain special characters like `(`, spaces, etc. For example, you may need to look for a `proc.name` of `(systemd)`, including the surrounding parentheses.

You can use `"` to capture these special characters. Here's an example:

```yaml
- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name="(systemd)" or proc.name=systemd
  output: "File opened by systemd (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```

When including items in lists, ensure that the double quotes are not interpreted from your YAML file by surrounding the quoted string with single quotes. Here's an example:

```yaml
- list: systemd_procs
  items: [systemd, '"(systemd)"']

- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name in (systemd_procs)
  output: "File opened by systemd (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```