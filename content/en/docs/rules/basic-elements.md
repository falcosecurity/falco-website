---
title: Basic Elements of Falco Rules
description: Understand Falco Rules, Lists and Macros
linktitle: Basics of Falco Rules
weight: 10
---
## Rules

A rule is a YAML object, part of the rules file, whose definition contains at least the following fields:

```yaml
- rule: shell_in_container
  desc: notice shell activity within a container
  condition: >
    evt.type = execve and 
    evt.dir = < and 
    container.id != host and 
    (proc.name = bash or
     proc.name = ksh)
  output: >
    shell in a container
    (user=%user.name container_id=%container.id container_name=%container.name 
    shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```

### Conditions

The key part of a rule is the _condition_ field. A condition is a Boolean predicate expressed using the [condition syntax](/docs/rules/conditions). It is possible to express conditions on [all supported events](/docs/rules/supported-events) using their respective [supported fields](/docs/rules/supported-fields).

Here's an example of a condition that alerts whenever a bash shell is run inside a container:

```
container.id != host and proc.name = bash
```

The first clause checks that the event happened in a container (where `container.id` is equal to `"host"` if the event happened on a regular host). The second clause checks that the process name is `bash`. 

{{% alert color="warning" %}}
Since this condition does not include a clause with a system call it will only check event metadata.\
Because of that, if a bash shell does start up in a container, Falco outputs events for every syscall that is performed by that shell.
{{% /alert %}}

If you want to be alerted only for each successful spawn of a shell in a container, add the appropriate event type and direction to the condition:

```
evt.type = execve and evt.dir = < and container.id != host and proc.name = bash
```

Therefore, a complete rule using the above condition might be:

```yaml
- rule: shell_in_container
  desc: notice shell activity within a container
  condition: >
    evt.type = execve and 
    evt.dir = < and 
    container.id != host and 
    proc.name = bash
  output: >
    shell in a container 
    (user=%user.name container_id=%container.id container_name=%container.name 
    shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```
{{% alert color="primary" %}}
Conditions allow you to check for many aspects of each supported event.\
To learn more, see the [condition language](/docs/rules/conditions).
{{% /alert %}}

### Output

A rule output is a string that can use the same [fields](/docs/rules/supported-fields) that conditions can use prepended by `%` to perform interpolation, akin to `printf`. For example:

```
Disallowed SSH Connection 
  (command=%proc.cmdline connection=%fd.name 
   user=%user.name user_loginuid=%user.loginuid container_id=%container.id 
   image=%container.image.repository)
```

could output:

```
Disallowed SSH Connection 
  (command=sshd connection=127.0.0.1:34705->10.0.0.120:22 
   user=root user_loginuid=-1 container_id=host 
   image=<NA>)
```

> Outputs are usually written in a single line.\
> Modifying this output we try to present it to you in a more human-readable way.

Note that it's not necessary that all fields are set in the specific event. As you can see in the example above if the connection happens outside a container the field `%container.image.repository` would not be set and `<NA>` is displayed instead.

### Priority

{{% alert color="warning" %}}
Don't let the **`priority`** field name mislead you.\
In a Falco Rule, it has nothing to do with overriding another rule or choosing the order in which rules will be triggered. The way to control the latter is achieved by changing the order the rules are defined and therefore loaded.
{{% /alert %}}

Every Falco rule has a priority which indicates how serious a violation of the rule is. This is similar to what we know as the **severity** of a syslog message. The priority is included in the message/JSON output/etc. 

Here are the available priorities:

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
* If a rule is related to an unauthorized read of state (i.e. reading sensitive files, etc.), its priority is `WARNING`.
* If a rule is related to unexpected behavior (spawning an unexpected shell in a container, opening an unexpected network connection, etc.), its priority is `NOTICE`.
* If a rule is related to behaving against good practices (unexpected privileged containers, containers with sensitive mounts, running interactive commands as root), its priority is `INFO`.

{{% alert color="warning" %}}
One exception is that the rule "Run shell untrusted", which is fairly FP-prone, has a priority of `DEBUG`.
{{% /alert %}}

### Advanced Rule Syntax

A Falco *rule* can contain several of the following keys:

Key | Required | Description | Default
:---|:---------|:------------|:-------
`rule` | yes | A short, unique name for the rule. |
`condition` | yes | A filtering expression that is applied against events to check whether they match the rule. |
`desc` | yes | A longer description of what the rule detects. |
`output` | yes | Specifies the message that should be output if a matching event occurs. See [output](/docs/rules/basic-elements/#output). |
`priority` | yes | A case-insensitive representation of the severity of the event. Should be one of the following: `emergency`, `alert`, `critical`, `error`, `warning`, `notice`, `informational`, `debug`. |
`exceptions` | no | A set of [exceptions](/docs/rules/exceptions) that cause the rule to not generate an alert. |
`enabled` | no | If set to `false`, a rule is neither loaded nor matched against any events. | `true`
`tags` | no | A list of tags applied to the rule (more on this [here](/docs/rules/controlling-rules/#tags)). |
`warn_evttypes` | no | If set to `false`, Falco suppresses warnings related to a rule not having an event type (more on this [here](/docs/rules/conditions/#rule-condition-best-practices)). | `true`
`skip-if-unknown-filter` | no | If set to `true`, if a rule conditions contains a filtercheck, e.g. `fd.some_new_field`, that is not known to this version of Falco, Falco silently accepts the rule but does not execute it; if set to `false`, Falco repots an error and exists when finding an unknown filtercheck. | `false`
`source` | no | The event source for which this rule should be evaluated. Typical values are `syscall`, `k8s_audit`, or the source advertised by a source [plugin](../plugins). | `syscall`

## Macros

Macros provide a way to define common sub-portions of rules in a reusable way. 

By looking at the condition above it looks like both `evt.type = execve and evt.dir = <` and `container.id != host` would be used many by other rules, so to make our job easier we can easily define macros for both:

```yaml
- macro: container
  condition: container.id != host
```

```yaml
- macro: spawned_process
  condition: evt.type = execve and evt.dir = <
```

With these macros defined, we can then rewrite the above rule's condition as `spawned_process and container and proc.name = bash`.

```yaml
- rule: shell_in_container
  desc: notice shell activity within a container
  condition: >
    spawned_process and 
    container and 
    proc.name = bash
  output: >
    shell in a container
    (user=%user.name container_id=%container.id container_name=%container.name 
    shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```

For more examples of rules and macros, take a look the documentation on [default macros](/docs/reference/rules/default-macros) and the `rules/falco_rules.yaml` file. In fact, both the macros above are part of the default list!


{{% alert color="primary" %}}
Macros *can* contain other macros that had been **previously** defined.
{{% /alert %}}

## Lists

*Lists* are named collections of items that you can include in rules, macros, or even other lists. 

{{% alert color="warning" %}}
Please note that lists *cannot* be parsed as filtering expressions.
{{% /alert %}}

Each list node has the following keys:

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

{{% alert color="primary" %}}
Lists *can* contain other lists that had been **previously** defined.
{{% /alert %}}

Referring to a list inserts the list items in the macro, rule, or list. Therefore, our rule could become more general replacing `proc.name = bash` with `proc.name in (shell_binaries)`, or even better, using the already included macro `shell_procs`:

```yaml
- list: shell_binaries
  items: [bash, csh, ksh, sh, tcsh, zsh, dash]

- macro: shell_procs
  condition: proc.name in (shell_binaries)

- rule: shell_in_container
  desc: notice shell activity within a container
  condition: >
    spawned_process and 
    container and 
    shell_procs
  output: >
    shell in a container
    (user=%user.name container_id=%container.id container_name=%container.name 
    shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```

## Visibility

As mentioned above, [lists](#lists) can reference other lists, and [macros](#macros) can reference other macros. The only requirement is that to reference an object of the same kind (a list including another list, or a macro including another macro) they must have been defined previously.

However, if a [macro](#macros) included a [list](#lists), this list might have been defined earlier or be defined at a later stage in the rules files. The same happens with a [rule](#rules) referencing a [macro](#macros). This one doesn't need to be previously defined.

In other words, visibility is defined in cascade and is quite important:

- A list can only reference lists defined before it.
- A macro can only reference macros defined before it.
- A macro can reference any list.
- A rule can reference any macro.
