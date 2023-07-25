---
title: Controlling Rules
description: Disable default rules or use tags to load Falco Rules selectively
linktitle: Controlling Rules
weight: 80
---

## Disable Default Rules

Even though Falco provides a quite powerful default ruleset, you sometimes need to disable some of these default {{< glossary_tooltip text="rules" term_id="rules" >}} since they do not work properly in your environment. Luckily Falco offers you multiple possibilities to do so.

### Via existing Macros {#macros}

Most of the default rules offer some kind of `user_*` {{< glossary_tooltip text="macros" term_id="macros" >}} which are already part of the rule conditions. These `user_*` macros are usually set to `(never_true)` or `(always_true)` which basically enables or disables the regarding rule. Now if you want to disable a default rule (e.g. `Read sensitive file trusted after startup`), you just have to override the rule's `user_*` macro (`user_known_read_sensitive_files_activities` in this case) inside your custom Falco configuration.

Example for your custom Falco configuration (note the `(always_true)` condition):
```yaml
- macro: user_known_read_sensitive_files_activities
  condition: (always_true)
```

Please note again that the order of the specified configuration file matters! The last defined macro with the same name wins.

### Via Falco Parameters

Falco offers the following parameters to limit which default rules should be enabled/used and which not:
```
-D <substring>      Disable any rules with names having the substring <substring>. 
                    Can be specified multiple times.

-T <tag>            Disable any rules with a tag=<tag>.
                    Can be specified multiple times.
                    Can not be specified with -t.

-t <tag>            Only run those rules with a tag=<tag>. 
                    Can be specified multiple times.
                    Can not be specified with -T/-D.
```

These parameters can also be specified as Helm chart value (`extraArgs`) if you are deploying Falco via the official Helm chart.

### Via Custom Rule Definition

Last but not the least, you can just disable a rule that is enabled by default using the `enabled: false` rule property.
This is especially useful for rules which do not provide a `user_*` macro in the default condition.

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

As of 0.6.0, rules have an optional set of {{< glossary_tooltip text="tags" term_id="tags" >}} that are used to categorize the ruleset into groups of related rules. Here's an example:

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

{{% alert title="Ignored system calls" color="primary" %}}

For performance reasons, some system calls are currently discarded before Falco processes them.\
You can see the complete list by running falco with `-i`.

If you'd like to run Falco against all events, including system calls in the above list,\
you can run Falco with the `-A` flag.

For more information, see [supported events](/docs/rules/supported-events).
{{% /alert %}}
