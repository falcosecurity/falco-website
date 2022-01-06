---
title: Rules
weight: 3
---

A Falco *rules file* is a [YAML](http://www.yaml.org) file containing three types of elements:

Element | Description
:-------|:-----------
[Rules](#rules) | *Conditions* under which an alert should be generated. A rule is accompanied by a descriptive *output string* that is sent with the alert.
[Macros](#macros) | Rule condition snippets that can be re-used inside rules and even other macros. Macros provide a way to name common patterns and factor out redundancies in rules.
[Lists](#lists) | Collections of items that can be included in rules, macros, or other lists. Unlike rules and macros, lists cannot be parsed as filtering expressions.

## Versioning

From time to time, we make changes to the rules file format that are not backwards-compatible with older versions of Falco. Similarly, libsinsp and libscap may define new filtercheck fields, operators, etc. We want to denote that a given set of rules depends on the fields/operators from those libraries.

{{% pageinfo color="primary" %}}
As of Falco version **0.14.0**, the Falco rules support explicit versioning of both the Falco engine and the Falco rules file.
{{% /pageinfo %}}

### Falco Engine Versioning

The `falco` executable and the `falco_engine` C++ object now support returning a version number. The initial version is 2 (implying that prior versions were 1). We will increment this version any time we make an incompatible change to the rules file format or add new filtercheck fields/operators to Falco.

### Falco Rules File Versioning

The Falco rules files included with Falco include a new top-level object, `required_engine_version: N`, that specifies the minimum engine version required to read this rules file. If not included, no version check is performed when reading the rules file.

If a rules file has an `engine_version` greater than the Falco engine version, the rules file is loaded and an error is returned.

## Rules

A Falco *rule* is a node containing the following keys:

Key | Required | Description | Default
:---|:---------|:------------|:-------
`rule` | yes | A short, unique name for the rule. |
`condition` | yes | A filtering expression that is applied against events to check whether they match the rule. |
`desc` | yes | A longer description of what the rule detects. |
`output` | yes | Specifies the message that should be output if a matching event occurs. See [output](#output). |
`priority` | yes | A case-insensitive representation of the severity of the event. Should be one of the following: `emergency`, `alert`, `critical`, `error`, `warning`, `notice`, `informational`, `debug`. |
`exceptions` | no | A set of [exceptions](/docs/rules/exceptions) that cause the rule to not generate an alert. |
`enabled` | no | If set to `false`, a rule is neither loaded nor matched against any events. | `true`
`tags` | no | A list of tags applied to the rule (more on this [below](#tags)). |
`warn_evttypes` | no | If set to `false`, Falco suppresses warnings related to a rule not having an event type (more on this [below](#rule-condition-best-practices)). | `true`
`skip-if-unknown-filter` | no | If set to `true`, if a rule conditions contains a filtercheck, e.g. `fd.some_new_field`, that is not known to this version of Falco, Falco silently accepts the rule but does not execute it; if set to `false`, Falco repots an error and exists when finding an unknown filtercheck. | `false`

## Conditions

The key part of a rule is the _condition_ field. A condition is a Boolean predicate expressed using the [condition syntax](/docs/rules/conditions). It is possible to express conditions on [all supported events](/docs/rules/supported-events) using their respective [supported fields](/docs/rules/supported-fields).

Here's an example of a condition that alerts whenever a bash shell is run inside a container:

```
container.id != host and proc.name = bash
```

The first clause checks that the event happened in a container (where `container.id` is equal to `"host"` if the event happened on a regular host). The second clause checks that the process name is `bash`. Since this condition does not include a clause with a system call it will only check event metadata. Because of that, if a bash shell does start up in a container, Falco outputs events for every syscall that is performed by that shell.


If you want to be alerted only for each successful spawn of a shell in a container, add the appropriate event type and direction to the condition:

```
evt.type = execve and evt.dir=< and container.id != host and proc.name = bash
```

Therefore, a complete rule using the above condition might be:

```yaml
- rule: shell_in_container
  desc: notice shell activity within a container
  condition: evt.type = execve and evt.dir=< and container.id != host and proc.name = bash
  output: shell in a container (user=%user.name container_id=%container.id container_name=%container.name shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```

Conditions allow you to check for many aspects of each supported event. To learn more, see the [condition language](/docs/rules/conditions).

## Macros

As noted above, macros provide a way to define common sub-portions of rules in a reusable way. By looking at the condition above it looks like both `evt.type = execve and evt.dir=<` and `container.id != host` would be used many by other rules, so to make our job easier we can easily define macros for both:

```yaml
- macro: container
  condition: container.id != host
```

```yaml
- macro: spawned_process
  condition: evt.type = execve and evt.dir=<
```

With this macro defined, we can then rewrite the above rule's condition as `spawned_process and container and proc.name = bash`.

For many more examples of rules and macros, take a look the documentation on [default macros](./default-macros) and the `rules/falco_rules.yaml` file. In fact, both the macros above are part of the default list!

## Lists

*Lists* are named collections of items that you can include in rules, macros, or even other lists. Please note that lists *cannot* be parsed as filtering expressions. Each list node has the following keys:

Key | Description
:---|:-----------
`list` | The unique name for the list (as a slug)
`items` | The list of values

Here are some example lists as well as a macro that uses them:

```yaml
- list: shell_binaries
  items: [bash, csh, ksh, sh, tcsh, zsh, dash]

- list: userexec_binaries
  items: [sudo, su]

- list: known_binaries
  items: [shell_binaries, userexec_binaries]

- macro: safe_procs
  condition: proc.name in (known_binaries)
```

Referring to a list inserts the list items in the macro, rule, or list.

Lists *can* contain other lists.


## Appending to Lists, Rules, and Macros

If you use multiple Falco rules files, you might want to append new items to an existing list, rule, or macro. To do that, define an item with the same name as an existing item and add an `append: true` attribute to the list. When appending lists, items are added to the **end** of the list. When appending rules/macros, the additional text is appended to the condition: field of the rule/macro.

Note that when appending to lists, rules or macros, the order of the rule configuration files matters! For example if you append to an existing default rule (e.g. `Terminal shell in container`), you must ensure your custom configuration file (e.g. `/etc/falco/rules.d/custom-rules.yaml`) is loaded **after** the default configuration file (`/etc/falco/falco_rules.yaml`). This can be configured with multiple `-r` parameters in the right order, directly inside the falco configuration file (`falco.yaml`) via `rules_file` or if you use the official Helm chart, via the `falco.rulesFile` value.

### Examples

In all of the examples below, it's assumed one is running Falco via `falco -r /etc/falco/falco_rules.yaml -r /etc/falco/falco_rules.local.yaml`, or has the default entries for `rules_file` in falco.yaml, which has `/etc/falco/falco.yaml` first and `/etc/falco/falco_rules.local.yaml` second.

#### Appending to lists

Here's an example of appending to lists:

**/etc/falco/falco_rules.yaml**

```yaml
- list: my_programs
  items: [ls, cat, pwd]

- rule: my_programs_opened_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (my_programs) and (evt.type=open or evt.type=openat)
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

**/etc/falco/falco_rules.local.yaml**

```yaml
- list: my_programs
  append: true
  items: [cp]
```

The rule `my_programs_opened_file` would trigger whenever any of `ls`, `cat`, `pwd`, or `cp` opened a file.

#### Appending to Macros

Here's an example of appending to macros:

**/etc/falco/falco_rules.yaml**

```yaml
- macro: access_file
  condition: evt.type=open

- rule: program_accesses_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (cat, ls) and (access_file)
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

**/etc/falco/falco_rules.local.yaml**
```yaml
- macro: access_file
  append: true
  condition: or evt.type=openat
```

The rule `program_accesses_file` would trigger when `ls`/`cat` either used `open`/`openat` on a file.

#### Appending to Rules

Here's an example of appending to rules:

**/etc/falco/falco_rules.yaml**
```yaml
- rule: program_accesses_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (cat, ls) and evt.type=open
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

**/etc/falco/falco_rules.local.yaml**

```yaml
- rule: program_accesses_file
  append: true
  condition: and not user.name=root
```
The rule `program_accesses_file` would trigger when `ls`/`cat` either used `open` on a file, but not if the user was root.

### Gotchas with rule/macro append and logical operators

Remember that when appending rules and macros, the text of the second rule/macro is simply added to the condition of the first rule/macro. This can result in unintended results if the original rule/macro has potentially ambiguous logical operators. Here's an example:

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

## Disable Default Rules

Even though Falco provides a quite powerful default ruleset, you sometimes need to disable some of these default rules since they do not work properly in your environment. Luckily Falco offers you multiple possibilities to do so.

### Via existing Macros

Most of the default rules offer some kind of `consider_*` macros which are already part of the rule conditions. These `consider_*` macros are usually set to `(never_true)` or `(always_true)` which basically enables or disabled the regarding rule. Now if you want to enable a by default disabled rule (e.g. `Unexpected outbound connection destination`), you just have to override the rule's `consider_*` macro (`consider_all_outbound_conns` in this case) inside your custom Falco configuration.

Example for your custom Falco configuration (note the `(always_true)` condition):
```yaml
- macro: consider_all_outbound_conns
  condition: (always_true)
```

Please note again that the order of the specified configuration file matters! The last defined macro with the same name wins.

### Via Falco Parameters

Falco offers the following parameters to limit which default rules should be enabled/used and which not:
```bash
-D <substring>                Disable any rules with names having the substring <substring>. Can be specified multiple times.

-T <tag>                      Disable any rules with a tag=<tag>. Can be specified multiple times.
                               Can not be specified with -t.

-t <tag>                      Only run those rules with a tag=<tag>. Can be specified multiple times.
                               Can not be specified with -T/-D.
```

These parameters can also be specified as Helm chart value (`extraArgs`) if you are deploying Falco via the official Helm chart.

### Via Custom Rule Definition

Last but not the least, you can just disable a rule that is enabled by default using a combination of the `append: true` and `enabled: false` rule properties.
This is especially useful for rules which do not provide a `consider_*` macro in the default condition.

Ensure that the custom configuration file loads after the default configuration file. You can configure the right order using multiple `-r` parameters, directly inside the falco configuration file `falco.yaml` through `rules_file`. If you are using the official Helm chart, then configure the order with the `falco.rulesFile` value.

For example to disable the `User mgmt binaries` default rule in `/etc/falco/falco_rules.yaml` define a custom rule in `/etc/falco/rules.d/custom-rules.yaml`:

```yaml
- rule: User mgmt binaries
  append: true
  enabled: false
```


 {{% pageinfo color="warning" %}}
 There appears to be a bug with this feature that we are looking into. If `enabled: false` doesn't work, you can use the following workaround as an alternative:
 ```yaml
 - rule: User mgmt binaries
   condition: and (never_true)
   append: true
 ```
 {{% /pageinfo %}}


## Output

A rule output is a string that can use the same [fields](/docs/rules/supported-fields) that conditions can use prepended by `%` to perform interpolation, akin to `printf`. For example:

```
Disallowed SSH Connection (command=%proc.cmdline connection=%fd.name user=%user.name user_loginuid=%user.loginuid container_id=%container.id image=%container.image.repository)
```

could output:

```
Disallowed SSH Connection (command=sshd connection=127.0.0.1:34705->10.0.0.120:22 user=root user_loginuid=-1 container_id=host image=<NA>)
```

Note that it's not necessary that all fields are set in the specific event. As you can see in the example above if the connection happens outside a container the field `%container.image.repository` would not be set and `<NA>` is displayed instead.

## Rule Priorities

Every Falco rule has a priority which indicates how serious a violation of the rule is. The priority is included in the message/JSON output/etc. Here are the available priorities:

* `EMERGENCY`
* `ALERT`
* `CRITICAL`
* `ERROR`
* `WARNING`
* `NOTICE`
* `INFORMATIONAL`
* `DEBUG`

The general guidelines used to assign priorities to rules are the following:

* If a rule is related to writing state (i.e. filesystem, etc.), its priority is `ERROR`.
* If a rule is related to an unauthorized read of state (i.e. reading sensitive filees, etc.), its priority is `WARNING`.
* If a rule is related to unexpected behavior (spawning an unexpected shell in a container, opening an unexpected network connection, etc.), its priority is `NOTICE`.
* If a rule is related to behaving against good practices (unexpected privileged containers, containers with sensitive mounts, running interactive commands as root), its priority is `INFO`.

One exception is that the rule "Run shell untrusted", which is fairly FP-prone, has a priority of `DEBUG`.

## Rule Tags {#tags}

As of 0.6.0, rules have an optional set of _tags_ that are used to categorize the ruleset into groups of related rules. Here's an example:

```yaml
- rule: File Open by Privileged Container
  desc: Any open by a privileged container. Exceptions are made for known trusted images.
  condition: (open_read or open_write) and container and container.privileged=true and not trusted_containers
  output: File opened for read/write by privileged container (user=%user.name command=%proc.cmdline %container.info file=%fd.name)
  priority: WARNING
  tags: [container, cis]
```

In this case, the rule "File Open by Privileged Container" has been given the tags "container" and "cis". If the tags key is not present for a given rule or the list is empty, a rule has no tags.

Here's how you can use tags:

* You can use the `-T <tag>` argument to disable rules having a given tag. `-T` can be specified multiple times. For example, to skip all rules with the "filesystem" and "cis" tags you would run falco with `falco -T filesystem -T cis ...`. `-T` can not be specified with `-t`.
* You can use the `-t <tag>` argument to *only* run those rules having a given tag. `-t` can be specified multiple times. For example, to only run those rules with the "filesystem" and "cis" tags, you would run falco with `falco -t filesystem -t cis ...`. `-t` can not be specified with `-T` or `-D <pattern>` (disable rules by rule name regex).

### Tags for Current Falco Ruleset

We've also gone through the default ruleset and tagged all the rules with an initial set of tags. Here are the tags we've used:

Tag | Description
:---|:-----------
`filesystem` | The rule relates to reading/writing files
`software_mgmt` | The rule relates to any software/package management tool like rpm, dpkg, etc.
`process` | The rule relates to starting a new process or changing the state of a current process
`database` | The rule relates to databases
`host` | The rule *only* works outside of containers
`shell` | The rule specifically relates to starting shells
`container` | The rule *only* works inside containers
`cis` | The rule is related to the CIS Docker benchmark
`users` | The rule relates to management of users or changing the identity of a running process
`network` |The rule relates to network activity

Rules can have multiple tags if they relate to multiple of the above. Every rule in the falco ruleset currently has at least one tag.

## Rule Condition Best Practices

To allow for grouping rules by event type, which improves performance, Falco prefers rule conditions that have at least one `evt.type=` operator, at the beginning of the condition, before any negative operators (i.e. `not` or `!=`). If a condition does not have any `evt.type=` operator, Falco logs a warning like:

```
Rule no_evttype: warning (no-evttype):
proc.name=foo
     did not contain any evt.type restriction, meaning that it will run for all event types.
     This has a significant performance penalty. Consider adding an evt.type restriction if possible.
```

If a rule has an `evt.type` operator in the latter portion of the condition, Falco logs a warning like this:

```
Rule evttype_not_equals: warning (trailing-evttype):
evt.type!=execve
     does not have all evt.type restrictions at the beginning of the condition,
     or uses a negative match (i.e. "not"/"!=") for some evt.type restriction.
     This has a performance penalty, as the rule can not be limited to specific event types.
     Consider moving all evt.type restrictions to the beginning of the rule and/or
     replacing negative matches with positive matches if possible.
```

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

## Ignored system calls

For performance reasons, some system calls are currently discarded before Falco processes them. You can see the complete list by running falco with `-i`. If you'd like to run Falco against all events, including system calls in the above list, you can run Falco with the `-A` flag. For more information, see [supported events](/docs/rules/supported-events).
