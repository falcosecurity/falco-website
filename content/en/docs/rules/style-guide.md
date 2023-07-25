---
title: Style Guide of Falco Rules
description: Adopt best practices when writing and contributing Falco rules
linktitle: Style Guide of Falco Rules
weight: 95
---

## Style Guide

Before diving in, read the sections on Falco rules [basics](/docs/rules/basic-elements/) and [condition syntax](/docs/rules/conditions/). Also, check out existing [upstream rules](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml) for best practices in writing rules.

In addition, the resources under [references/rules](/docs/reference/rules/) provide complementary information. We highly recommend regularly revisiting each guide to stay up-to-date with the latest advancements of Falco.

The order of keys should be:

```yaml
- rule: 
  desc:
  condition:
  output:
  priority:
  tags:

 ... other keys if applicable in no particular order

```

### Naming

Choose a concise title that summarizes the essence of the rule's purpose.

### Description

Aligning with Falco's rules maturity and adoption [framework](https://github.com/falcosecurity/rules/blob/main/proposals/20230605-rules-adoption-management-maturity-framework.md#rules-maturity-framework), it is encouraged to not just include a longer description of what the rule detects but also to give advice on how to tune this rule and reduce possible noise. If applicable, elaborate on how to correlate the rule with other rules or data sources for incident response. However, keep them concise.

### Condition Syntax

These recommendations prioritize performance impact while maintaining a consistent style for better understanding and easier customization. This approach ensures more manageable maintenance of the rules in the long run.

We explain the high level principles using example rules or snippets.

- Each upstream Falco rule must include an `evt.type` filter; otherwise, you will get a warning.

```
Rule no_evttype: warning (no-evttype):
proc.name=foo
     did not contain any evt.type restriction, meaning that it will run for all event types.
     This has a significant performance penalty. Consider adding an evt.type restriction if possible.
```

- Prioritize the `evt.type` filter first; otherwise, you will get a warning. Falco buckets filters per `evt.type` for efficient rules matching through applying the rule's Abstract Syntax Tree (AST) to relevant event types only. A nice side effect is better readability as well.

```
Rule evttype_not_equals: warning (trailing-evttype):
evt.type!=execve
     does not have all evt.type restrictions at the beginning of the condition,
     or uses a negative match (i.e. "not"/"!=") for some evt.type restriction.
     This has a performance penalty, as the rule can not be limited to specific event types.
     Consider moving all evt.type restrictions to the beginning of the rule and/or
     replacing negative matches with positive matches if possible.
```

- To maintain performance, avoid mixing unrelated event types in one rule. Typically, only variants should be mixed together, for example: `evt.type in (open, openat, openat2)`.
- The best practice and requirement for upstream rules are to only define positive `evt.type` expressions. Using `evt.type!=open`, for example, would imply each of the [supported syscalls](https://github.com/falcosecurity/libs/blob/master/driver/report.md), resulting in a significant performance penalty. For more information, read the [Adaptive Syscalls Selection in Falco](https://falco.org/blog/adaptive-syscalls-selection/) blog post.


- After the `evt.type` filter, place your mainly positive filters to efficiently eliminate the most events step by step. An exception to this rule is the `container` macro, which can quickly eliminate many events. Therefore, the guiding principle of "divide and conquer" commonly used in database query recommendations, also applies to Falco's filter statements.

```yaml
- macro: open_write
  condition: (evt.type in (open,openat,openat2) and evt.is_open_write=true and fd.typechar=`f` and fd.num>=0)
 ...

- macro: container
  condition: (container.id != host)
 ...

- rule: Detect release_agent File Container Escapes
 ...
  condition: >
    open_write and container and fd.name endswith release_agent and (user.uid=0 or thread.cap_effective contains CAP_DAC_OVERRIDE) and thread.cap_effective contains CAP_SYS_ADMIN
 ...
```

- Effective Falco rules should now already be in a good state. Additionally, use exclusionary statements mostly to filter out common anti-patterns and noise. Often, these statements are based on profiling. You will notice that many upstream rules provide an empty template macro for this purpose, which you can customize.

```yaml
- macro: spawned_process
  condition: (evt.type in (execve, execveat) and evt.dir=<)
 ...

- list: known_drop_and_execute_containers
  items: []

- rule: Drop and execute new binary in container
 ...
  condition: >
    spawned_process
    and container
    and proc.is_exe_upper_layer=true 
    and not container.image.repository in (known_drop_and_execute_containers)
 ...
```

- Use existing macros for reusability purposes, if applicable (e.g. `spawned_process` macro).
- Exercise caution when dealing with complicated nested statements in Falco rules, and ensure you use parentheses consistently to achieve the desired correct behavior. Remember, using too many parentheses does not cause any harm.
- To avoid grammatical syntax errors or sub-optimal performance, refrain from combining `or` statements with negation. Instead, use `or` statements only for positive filters.

```yaml

- macro: minerpool_https
  condition: (fd.sport="443" and fd.sip.name in (https_miner_domains))
 ...

condition:  ... and ((minerpool_http) or (minerpool_https) or (minerpool_other))
```

- Furthermore, it is preferred to use `and not` to consistently negate a positive sub-expression.
- Avoid double-negation.

```yaml
condition:  ... and not fd.snet in (rfc_1918_addresses)
```

- For operations involving string comparison, `startswith` or `endswith` should be preferred over `contains` whenever possible, as they are more efficient.
- Whenever possible, try to avoid making a rule expression too long.

{{% alert color="warning" %}}
High-volume syscalls can increase CPU usage and cause kernel side event drops in production systems. When deploying Falco, consider trade-offs and experiments, particularly with I/O related syscalls, as it depends on your unique environment. The upstream rules do not include rules enabled by default regarding I/O syscalls.
{{% /alert %}}

### Output Fields

For the output fields, expect that each Falco release typically exposes new [supported output fields](/docs/reference/rules/supported-fields/) that can help you write more expressive rules and/or add more context to a rule for incident response.

Building upon the guide around writing rules with respect to [output](/docs/rules/basic-elements/#output), when considering upstreaming your rule, core output fields relevant for this rule should be included. At the same time, we try to keep them to a minimum, and adopters can add more output fields as they see fit.

When writing a rule for container workloads, you should include the fields we automatically fetch from the container runtime:

```yaml
output: container_id=%container.id image=%container.image.repository namespace=%k8s.ns.name pod_name=%k8s.pod.name
```

And as a general guidance, fields like `%evt.type`, `%proc.name`, `%proc.tty`, `%proc.cmdline` and fields related to process lineage such as `proc.aexepath[2]`, or fields around user information `%user.uid`, `%user.loginuid` are often of generic relevance to many rules. For specialized use cases, generic fields such as `%container.ip` or `%container.cni.json` can be further helpful for incident response, especially concerning non-network syscall related alerts in Kubernetes. These fields can be correlated, for example, with network proxy logs. 

### Priority

Please refer to the relevant [reference/rules](/docs/reference/rules/rule-fields/) section and the [basic rules guide](/docs/rules/basic-elements/#priority) for more information.

### Tags

Tags include various categories to convey relevant information about the rule. 

According to the Falco [rules maturity](https://github.com/falcosecurity/rules/blob/main/proposals/20230605-rules-adoption-management-maturity-framework.md#rules-maturity-framework) framework, the first tag in the tags list always indicates the maturity of the rule. The [rules repo](https://github.com/falcosecurity/rules) contains concrete guidance on how to categorize a rule when considering upstreaming the rule to The Falco Project.

```yaml
maturity_stable
maturity_incubating
maturity_sandbox
maturity_deprecated
```

Next, the tags should indicate for what workloads this rule is relevant. Add `host` and `container` if the rule works for any event. You can include additional tags to specify the rule's type, such as `process`, `network`, `k8s`, `aws`, etc. 

When considering upstreaming your rule, we expect the [Mitre Attack](https://attack.mitre.org/techniques/enterprise/) phase followed by the best Tactic or Technique, whichever is the best fit. This information is used to create an [overview document](https://github.com/falcosecurity/rules/blob/main/rules_inventory/rules_overview.md) of Falco's predefined rules and also help the Falco adoption process.

Lastly, if the rule is relevant for a compliance use case, please add the corresponding `PCI_DSS_*` or `NIST_*` tag, referring to the [Validating NIST Requirements with Falco](https://falco.org/blog/falco-nist-controls/) and [PCI/DSS Controls with Falco](https://falco.org/blog/falco-pci-controls/) blog posts and rules contributing criteria outlined in the [rules repo](https://github.com/falcosecurity/rules).

```yaml
tags: [maturity_incubating, host, container, filesystem, mitre_defense_evasion, NIST_800-53_AU-10]
```

## Additional Information

### Rule Types and Robustness

Some rules are more specific signatures, while others focus on behavior-based detection. When testing rules, it's essential to consider not only if the rule catches the intended attack or how much noise it could generate but also its robustness. Robustness refers to how easily an attacker can bypass the detection by making minor changes to their payload or approach. Exploring different approaches to catch an attack can help identify the most effective detection method.

### Rules Loading

Refer to the up-to-date description in the [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml) file for `rules_file` to understand in which order rules are loaded. Keep in mind that Falco applies rules per event type on a "first match wins" basis.

### Contributing Your Falco Rules

Refer to the [Contributing](/docs/contribute/) page and the [How to Share Your Falco Rules](/docs/contribute/share-rules/) guide.
