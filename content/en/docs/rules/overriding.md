---
title: Overriding Rules
description: Overriding Falco rules
linktitle: Overriding Rules
weight: 50
---
## Overview
There may be cases where you need to adjust the behavior of the Falco-supplied {{< glossary_tooltip text="list" term_id="lists" >}}, {{< glossary_tooltip text="macro" term_id="macros" >}}, and  {{< glossary_tooltip text="rule" term_id="rules" >}}.

To enable this Falco allows you to define multiple rules files. The additional rules files can be used to add new lists, macros and rules or to override (modify) existing ones.

{{% alert color="warning" %}}
Note that when overriding existing lists, macro, or rule the order of the rule configuration files matters. For example if you append to an existing default rule, you must ensure your custom rules file (e.g. `/etc/falco/rules.d/custom-rules.yaml`) is loaded **after** the default rules file (`/etc/falco/falco_rules.yaml`).

The load order can be configured from the command line using multiple `-r` parameters in the right order, directly inside the falco configuration file (`falco.yaml`) via  the `rules_file` section or through the official Helm chart, using the `falco.rulesFile` value. 
{{% /alert %}}

To facilitate modifying existing lists, macros and rules Falco provides an `override` section that can be added to your custom rules file. Within the `override` section you can specify whether you want to `append` or `replace` information for the given rule, list or macro. 

`append` allows you to add additional values to a list, macro, or rule key

`replace` allows you to replace the value of an list, macro or macro key

{{% alert color="warning" %}}
`append` and `replace` cannot be used together. Trying to apply both `append` and `replace` to a key will result in an error. 
{{% /alert %}}

The keys that can be overridden vary by rules component and action being taken:

* Lists (`append` or `replace`): `{"items"}`
* Macros (`append` or `replace`): `{"condition"}`
* Rules (`append`): `{"condition", "output", "desc", "tags", "exceptions"}`
* Rules (`replace`):  `{"condition", "output", "desc", "priority", "tags", "exceptions", "enabled", "warn_evttypes", "skip-if-unknown-filter"}`

## Examples of using the `ovverride` section

The following examples illustrate how you can use the override section to modify existing lists, macros, and rules. 

In all of the examples below, it's assumed one is running Falco via `falco -r /etc/falco/falco_rules.yaml -r /etc/falco/falco_rules.local.yaml`, or has the default entries for `rules_file` in falco.yaml, which has `/etc/falco/falco.yaml` first and `/etc/falco/falco_rules.local.yaml` second.

### Append an item to a list

##### `/etc/falco/falco_rules.yaml`

```yaml
- list: my_programs
  items: [ls, cat, pwd]

- rule: my_programs_opened_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (my_programs) and (evt.type=open or evt.type=openat)
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

##### `/etc/falco/falco_rules.local.yaml`

```yaml
- list: my_programs
  items: cp
  override:
    items: append
```

The rule `my_programs_opened_file` would trigger whenever any of `ls`, `cat`, `pwd`, or `cp` opened a file.

### Replace items in a list

##### `/etc/falco/falco_rules.yaml`

```yaml
- list: my_programs
  items: [ls, cat, pwd]

- rule: my_programs_opened_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (my_programs) and (evt.type=open or evt.type=openat)
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

##### `/etc/falco/falco_rules.local.yaml`

```yaml
- list: my_programs
  items: vi, vim, nano 
  override:
    items: replace
```
The rule `my_programs_opened_file` would trigger whenever any of `vi`, `vim`, or `nano` opened a file.

### Append an item to a macro

##### `/etc/falco/falco_rules.yaml`

```yaml
- macro: access_file
  condition: evt.type=open

- rule: program_accesses_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (cat, ls) and (access_file)
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

##### `/etc/falco/falco_rules.local.yaml`
```yaml
- macro: access_file
  condition: or evt.type=openat
  override:
    condition: append

```

The rule `program_accesses_file` would trigger when `ls`/`cat` either used `open`/`openat` on a file.

### Append and replace items in a rule

##### `/etc/falco/falco_rules.yaml`
```yaml
- rule: program_accesses_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (cat, ls) and evt.type=open
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

##### `/etc/falco/falco_rules.local.yaml`

```yaml
- rule: program_accesses_file
  condition: and not user.name=root
  output: A file (user=%user.name command=%proc.cmdline file=%fd.name) was opened by a monitored program
  override: 
    condition: append
    output: replace
```
The rule `program_accesses_file` would trigger when `ls`/`cat` either used `open` on a file, but not if the user was root.

The new output message would be `A file (user=%user.name command=%proc.cmdline file=%fd.name) was opened by a monitored program`

## Appending to existing rules using `append:true` (deprecated)

{{% alert color="warning" %}}
This method has been depreciated and will be removed in Falco 1.0.0 
{{% /alert %}}

If you use multiple Falco {{< glossary_tooltip text="rules files" term_id="rules-file" >}}, you might want to append new items to an existing lists, macros or rules. To do that, define an item with the same name as an existing item and add an `append: true` attribute to the YAML object. 

{{% alert color="warning" %}}
When appending to lists, items are automatically added to the **end** of the _list_.\
When appending to rules or macros, the additional content is appended to the {{< glossary_tooltip text="condition" term_id="conditions" >}} field of the referred object.
{{% /alert %}}

Note that when appending to lists, rules or macros, the order of the rule configuration files matters! For example if you append to an existing default rule (e.g. `Terminal shell in container`), you must ensure your custom configuration file (e.g. `/etc/falco/rules.d/custom-rules.yaml`) is loaded **after** the default configuration file (`/etc/falco/falco_rules.yaml`).

This can be configured with multiple `-r` parameters in the right order, directly inside the falco configuration file (`falco.yaml`) via `rules_file` or if you use the official Helm chart, via the `falco.rulesFile` value.

## Redefining Rules

On the contrary, if `append` is set to `false` (default value), the whole object will be redefined. This can be used to empty a list, [apply user-specific settings to a macro](/docs/reference/rules/macros-override/) or even change a rule completely.

Take into account that when redefining a rule, it will entirely replace the previous rule, so if the new object defines fewer fields than required, Falco could return an error. 

The only exceptions to this are the `enabled` field, that when defined as a single accompanying field, it simply enables or disables a previously-defined rule. And obviously, the `append` field, that when set to `true` for either macros or rules, it just appends the condition/exceptions field.

## Examples of Appending to Rules

In all of the examples below, it's assumed one is running Falco via `falco -r /etc/falco/falco_rules.yaml -r /etc/falco/falco_rules.local.yaml`, or has the default entries for `rules_file` in falco.yaml, which has `/etc/falco/falco.yaml` first and `/etc/falco/falco_rules.local.yaml` second.

### Appending to Lists

Here's an example of appending to lists:

##### `/etc/falco/falco_rules.yaml`

```yaml
- list: my_programs
  items: [ls, cat, pwd]

- rule: my_programs_opened_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (my_programs) and (evt.type=open or evt.type=openat)
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

##### `/etc/falco/falco_rules.local.yaml`

```yaml
- list: my_programs
  append: true
  items: [cp]
```

The rule `my_programs_opened_file` would trigger whenever any of `ls`, `cat`, `pwd`, or `cp` opened a file.

### Appending to Macros

Here's an example of appending to macros:

##### `/etc/falco/falco_rules.yaml`

```yaml
- macro: access_file
  condition: evt.type=open

- rule: program_accesses_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (cat, ls) and (access_file)
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

##### `/etc/falco/falco_rules.local.yaml`
```yaml
- macro: access_file
  append: true
  condition: or evt.type=openat
```

The rule `program_accesses_file` would trigger when `ls`/`cat` either used `open`/`openat` on a file.

### Appending to Rules

Here's an example of appending to rules:

##### `/etc/falco/falco_rules.yaml`
```yaml
- rule: program_accesses_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (cat, ls) and evt.type=open
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

##### `/etc/falco/falco_rules.local.yaml`

```yaml
- rule: program_accesses_file
  append: true
  condition: and not user.name=root
```
The rule `program_accesses_file` would trigger when `ls`/`cat` either used `open` on a file, but not if the user was root.

{{% alert title="Append Exceptions to Rules" color="primary" %}}
It is also possible to append exceptions to rules.\
[Here](/docs/rules/exceptions/#appending-exception-values) you can find further information.
{{% /alert %}}

## Precedence of logical operators when appending

Remember that when appending rules and macros, the content of the referring rule or macro is simply added to the condition of the referred one. 
This can result in unintended results if the original rule/macro has potentially ambiguous logical operators. 

Here's an example:

```yaml
- rule: my_rule
  desc: ...
  condition: evt.type=open and proc.name=apache
  output: ...

- rule: my_rule
  append: true
  condition: or proc.name=nginx
```

Should `proc.name=nginx` be interpreted as relative to the `and proc.name=apache`, that is to allow either apache/nginx to open files, or relative to the `evt.type=open`, that is to allow apache to open files or to allow nginx to do anything?

In cases like this, be sure to scope the logical operators of the original condition with parentheses when possible, or avoid appending conditions when not possible.

