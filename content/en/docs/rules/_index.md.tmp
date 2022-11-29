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

Last but not the least, you can just disable a rule that is enabled by default using the `enabled: false` rule property.
This is especially useful for rules which do not provide a `consider_*` macro in the default condition.

Ensure that the custom configuration file loads after the default configuration file. You can configure the right order using multiple `-r` parameters, directly inside the falco configuration file `falco.yaml` through `rules_file`. If you are using the official Helm chart, then configure the order with the `falco.rulesFile` value.

For example to disable the `User mgmt binaries` default rule in `/etc/falco/falco_rules.yaml` define a custom rule in `/etc/falco/rules.d/custom-rules.yaml`:

```yaml
- rule: User mgmt binaries
  enabled: false
```

At the same time, disabled rules can be re-enabled by using the `enabled: true` rule property. For instance, the `Change thread namespace` rule in `/etc/falco/falco_rules.yaml` that is disabled by default, can be manually enabled with:

```yaml
- rule: Change thread namespace
  enabled: true
```

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
