---
title: Escaping Special Characters
description: Escape special characters in your Falco Rules
linktitle: Escaping Special Characters
weight: 90
aliases:
- ../../rules/special-characters
---

In some cases, rules may need to contain special characters like `(`, spaces, etc. For example, you may need to look for a `proc.name` of `(systemd)`, including the surrounding parentheses.

You can use `"` to capture these special characters. Here's an example:

```yaml
- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name="(systemd)" or proc.name=systemd
  output: "File opened by systemd | user=%user.name command=%proc.cmdline file=%fd.name
  priority: WARNING
```

When including items in {{< glossary_tooltip text="lists" term_id="lists" >}}, ensure that the double quotes are not interpreted from your YAML file by surrounding the quoted string with single quotes. Here's an example:

```yaml
- list: systemd_procs
  items: [systemd, '"(systemd)"']

- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name in (systemd_procs)
  output: "File opened by systemd | user=%user.name command=%proc.cmdline file=%fd.name"
  priority: WARNING
```
