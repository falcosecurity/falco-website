---
title: Custom Ruleset
description: Start writing your first custom Falco rules
weight: 85
---

To write a custom rule for Falco from scratch, it is essential to understand the conditions that need to be met for Falco to trigger an alert. However, this task is complex as it requires considering the potential false positives and negatives arising from the rule.

## Rules Placement

When adding a new rule to Falco, the first step is determining its placement. When loading the rules, Falco groups them per system call (`evt.type`) for faster matching and processes them later in sequential order, ensuring that two rules are not triggered simultaneously for the same `evt.type` field value. Consequently, more general rules should be positioned at the end of the rule set, while more specific rules should be placed at the beginning. This arrangement prevents general rules from capturing events that more specific rules should handle.

It's worth noting that Falco loads a set of predefined rules by default, followed by any custom rules located in the `/etc/falco/rules.d` directory. This configuration is specified in the [`/etc/falco/falco.yaml`](https://github.com/falcosecurity/falco/blob/master/falco.yaml) file, under the `rules_file:` key, as follows:

```
rules_file:
  - /etc/falco/falco_rules.yaml
  - /etc/falco/falco_rules.local.yaml
  - /etc/falco/rules.d
```

It can nevertheless be adjusted to prioritize the rules in the `rules.d` directory, include different rule files or even add new directories. The customization options are flexible.

Considering this, it's important to remember that the default rules file includes reusable lists and macros that may help to create new rules. Therefore, you should carefully decide whether you want to delay the processing of those files or turn off a general rule that captures events intended for your custom rule. Alternatively, you can customize an existing rule within the `rules.d` directory by either rewriting the entire rule or using the "append" key to modify it.

If you are deploying Falco on a Kubernetes cluster, you will likely use [Helm](https://helm.sh) for the installation. In this scenario, instead of placing custom rules files directly in the `/etc/falco/rules.d` directory, you can add them to the `values.yaml` file provided to the `helm` command.

Locate the line `customRules: {}` in the [`values.yaml`](https://github.com/falcosecurity/charts/blob/master/falco/values.yaml) file and replace it with a configuration similar to the following:

```
customRules:
  custom-rules.yaml: |-
    - rule: Example rule
      desc: ...
      ...
    - rule: Example rule 2
      ...
  more-custom-rules.yaml: |-
    - rule: ...
      ...
```

That will instruct `helm` to create as many rules files as you define here accessible inside the Falco Pods, under the directory `/etc/falco/rules.d`.

Finally, remember that keeping any previous ruleset and extending it, although sometimes recommended, is not enforced. It's acceptable to create a new ruleset by reorganizing the upstream rules, reordering and rewriting them, mixing in custom rules, splitting them into different sets and files, etc. Default Falco rules should be considered more of a guidance than a requirement to adopt.

## Rules Structure

Rules in Falco are defined using YAML syntax. Each rule is represented as an object in a YAML list, denoted by using a hyphen (`-`) before the first key in the rule. When creating a new rule, several essential keys should be included:

```
- rule:
  desc:
  condition:
  output:
  priority:
  tags:
```

- The `rule` key will indicate this is a rule to consider when processing the full set of rules. Without this key, Falco will ignore that entry. It has to be unique to create a new rule. Otherwise, it will overwrite any previously defined rule with the same value.

- The `desc` key provides a detailed description of the rule's purpose, behavior, or the events it aims to detect. It helps with understanding the rule's intent and assists in documentation. Missing this key in the rule will make Falco show the error message:

  ```
  LOAD_ERR_YAML_VALIDATE (Error validating internal structure of YAML file): Item has no mapping for key 'desc'
  ```
- The `priority` key represents the severity of the alert triggered by Falco and corresponds with the well-known Syslog severities: emergency, alert, critical, error, warning, notice, informational, and debug. Missing this key in the rule will make Falco show the error message:

  ```
  LOAD_ERR_YAML_VALIDATE (Error validating internal structure of YAML file): Item has no mapping for key 'priority'
  ```
- The `condition` key defines the conditions that must be satisfied for the rule to trigger an alert. It consists of one or more expressions or statements that evaluate to true when the desired event occurs. Missing this key in the rule will make Falco show the error message:

  ```
  LOAD_ERR_YAML_VALIDATE (Error validating internal structure of YAML file): Item has no mapping for key 'condition'
  ```
- The `output` key determines the output format of the alert generated by the rule. It specifies how the alert should be formatted and what information should be included. Missing this key in the rule will make Falco show the error message:

  ```
  LOAD_ERR_YAML_VALIDATE (Error validating internal structure of YAML file): Item has no mapping for key 'output'
  ```

- The `tags` key categorizes the ruleset into groups of related rules. Although not mandatory when starting to write a rule, its use is highly recommended at a later stage for management purposes. For further information, refer to the [Tags section of the Style Guide of Falco Rules][/docs/rules/style-guide/#tags)

To enhance your Falco rules further, refer to the [Advanced Rule Syntax](/docs/rules/basic-elements/#advanced-rule-syntax) documentation. The [Style Guide of Falco Rules](/docs/rules/style-guide) is also a highly recommended document to ensure your rules are easier to maintain and share with the community. These resources will provide you with valuable information about additional keys that can be used to augment and customize your Falco rules. Exploring these advanced options will allow you to expand the capabilities and effectiveness of your rules.

## Building up the Condition

A condition in Falco acts as a checklist of requirements that an event must meet in order for Falco to evaluate the condition as true. To comprehend this evaluation process, it is essential to have a grasp of [Boolean algebra](https://en.wikipedia.org/wiki/Boolean_algebra). Ultimately, the condition will either evaluate to true, triggering the associated alert and bypassing the remaining rules, or evaluate to false, causing the next rule to be evaluated.

To achieve the desired effect, it is necessary to consider the Boolean operators: `and`, `or`, and `not`. These operators enable the condition to evaluate one or more situations and produce the desired outcome.

Each item on the checklist corresponds to a comparison involving the information in the syscall invocation and any relevant metadata that provides additional context. These comparisons employ operators such as `=`, `!=`, `in`, `contains`, and others. Refer to the [section operators](/docs/rules/conditions/#operators) in the documentation for a more extensive list of available operators.

Before proceeding, it's recommended to refer to the [condition syntax](/docs/rules/conditions/) documentation, which provides detailed guidance on writing conditions. This resource will offer valuable information to ensure accurate and effective condition creation.

When constructing comparisons within conditions, an extensive set of fields is available for use. To simplify the process, you can consult [this list](/docs/reference/rules/supported-fields/), a handy cheat sheet for writing new rules.

## Leveraging Macros and Lists

Additionally, the benefits of using [macros](/docs/rules/basic-elements/#macros) and [lists](/docs/rules/basic-elements/#lists) when writing rules are worth noting: leveraging these features allows for more straightforward and more concise rule creation while promoting the reuse of conditions that have been thoroughly tested. This approach enhances maintainability and efficiency in rule development.

Observe the following rule that detects when a `bash` shell is spawned inside a container:

```
- rule: Example Rule
  condition: container.id != host and proc.name = bash and evt.type = execve and evt.dir=< and proc.pname exists and not proc.pname in (bash, docker)
```

could be rewritten as:

```
- rule: Example Rule
  condition: container and proc.name = bash and spawned_process and proc.pname exists and not proc.pname in (bash, docker)
```

where `container` and `spawned_process` are macros already included in the default falco ruleset.

We can even go one step beyond adding a list of our own:

```
- list: allowed_binaries
  items: [bash, docker]
```

Allowing us to rewrite the rule as:

```
- rule: Example Rule
  condition: container and proc.name = bash and spawned_process and proc.pname exists and not proc.pname in allowed_binaries
```

## Evaluation Priorities

When using the boolean operator `or`, it is crucial to include evaluation priorities by utilizing parentheses `(` and `)`. These parentheses can be nested, and it is recommended to incorporate them within macros as they become part of larger conditions. Neglecting to use parentheses appropriately may lead to unexpected results that differ from the intended outcome.

Consider the following example to demonstrate the appropriate use of parentheses for setting evaluation priorities. Please note that the rule is quite extensive, indicated by the `>` symbol in YAML syntax, which signifies that it spans across multiple lines:

```
- rule: Example Rule
  desc: An illustrative rule demonstrating evaluation priority with parentheses
  condition: >
    (syscall.type = execve and proc.name = "/bin/bash") or
    (syscall.type = open and (fd.name contains "/etc/passwd" or fd.name contains "/etc/shadow"))
  output: Log the relevant event.
  priority: debug
```

In this example, the condition is structured to prioritize specific evaluations through the use of parentheses. It ensures that the rule triggers an alert when either the `execve` syscall type is matched and the process name is `/bin/bash`, or when the `open` syscall type is matched and the file descriptor name contains either `/etc/passwd` or `/etc/shadow`.

The proper placement of parentheses allows for accurate evaluation and ensures that the rule behaves as intended.

## False Positives and Negatives

As previously explained, the `condition` key includes all the necessary checks an event must satisfy to trigger a specific rule. If there are too few checks in the condition, the rule might become too general and trigger frequently, potentially resulting in many false positives. These broad conditions can be useful for initial testing to ensure the rule is being reached and triggered. If the rule is never triggered, it suggests that a previous rule may be capturing the event before it reaches the intended rule.

An example of a rule that is too general is provided below:

```
- rule: Too General Rule
  desc: An example of a rule that is an overly broad
  condition: >
    proc.name != "systemd" and evt.type = execve
  output: Log the relevant event.
  priority: debug
```

Another example would be a rule designed to monitor all activity generated by a specific process, like:

```
- rule: Monitor only a process named malicious
  desc: Another example of an overly broad rule
  condition: proc.name = malicious
  output: The process %proc.name has used the syscall %evt.type
  priority: debug
```

While these examples are useful for initial testing and gathering samples from certain commands, it's important to note that they are too general to yield reliable alerts. Instead, these broad examples are more likely to generate many false positives.

On the contrary, if a condition becomes overly specific or contradictory, it may fail to trigger when necessary, resulting in what is known as false negatives. To illustrate this point, consider the following example:

```
- rule: Example of a too-specific rule
  ...
  condition: evt.type = execve and proc.name = malicious and proc.pid = 1
  output: The process %proc.name has used the syscall %evt.type
```

The previous rule would seldom trigger because it relies on a specific PID (Process ID) for the process, which may only occur if executed within a container. While this example represents an extreme case, it highlights the consequences of being excessively specific when defining a condition. It emphasizes that overly specific conditions can lead to infrequent triggering or potentially not triggering in real-world scenarios.

## Tuning a Rule by adding Exceptions to it

Adding exceptions to an existing Falco rule is a useful approach when you want to exclude specific scenarios from triggering that rule. Instead of using the `and not` operators in the condition, which can make the condition more complex and harder to understand, Falco provides a recommended method for handling exceptions.

To add exceptions to a rule, you can utilize the `exceptions` key within the rule definition. Specifying one or more conditions under the `exceptions` key allows you to define scenarios where the rule should not be triggered, even if the main condition is satisfied. This approach enhances the readability and maintainability of the rule by explicitly stating the exceptions separately.

Considering the following simplified rule:

```
- rule: Launch Privileged Container
  desc: Detect the start of a privileged container.
  condition: >
    container_started and container
    and container.privileged=true
  output: Privileged container
```

One way of adding exceptions would be using the `and not` combination explained above:

```
- list: trusted_images
  items: [docker.io/user/image1, quay.io/user/image2]

- rule: Launch Privileged Container
  desc: Detect the start of a privileged container. Exceptions are made for known trusted images.
  condition: >
    container_started and container
    and container.privileged=true
    and not ( container.image.repository in (trusted_images) or
              container.image.repository startswith registry.local/ )
  output: Privileged container
  priority: debug
```

The same example using the `exceptions` key:

```
- rule: Launch Privileged Container
  desc: Detect the start of a privileged container.
  condition: >
    container_started and container
    and container.privileged=true
  output: Privileged container
  priority: debug
  exceptions:
    - name: trusted_images
      fields: [container.image.repository]
      comps: [in]
      values:
        - [(trusted_images)]
    - name: local_images
      fields: [container.image.repository]
      comps: [startswith]
      values:
        - [registry.local/]
```

While this may seem exaggerated for the provided exceptions, it highlights the true strength of the exceptions key when dealing with a larger number of variables. To demonstrate this, let's explore another example:

```
- rule: Launch Privileged Container
  desc: Detect the start of a privileged container. Exceptions are made for known trusted images.
  condition: >
    container_started and container
    and container.privileged=true
    and not ((container.image.repository = registry.local/user/java-app and proc.name = /usr/bin/java ) or
             (container.image.repository = docker.io/user/httpd and proc.name = /usr/bin/httpd ) or
             (container.image.repository = quay.io/user/mysql and proc.name = /usr/bin/mysqld ))
  output: Privileged container
  priority: debug
```

Using the `exceptions` key it would now look like:

```
- rule: Launch Privileged Container
  desc: Detect the start of a privileged container.
  condition: >
    container_started and container
    and container.privileged=true
  output: Privileged container
  priority: debug
  exceptions:
    - name: trusted_images
      fields: [container.image.repository, proc.name]
      comps: [=,=]
      values:
        - [ registry.local/user/java-app, /usr/bin/java ]
        - [ docker.io/user/httpd, /usr/bin/httpd ]
        - [ quay.io/user/mysql, /usr/bin/mysqld ]
```

In the last rule provided, you can observe the inclusion of three exceptions, each containing two conditions. When the rules parser processes these conditions, it expands them into a format the rules engine can comprehend and utilize for evaluation. The values of the `comps` key may differ depending on the complexity of our conditions, and in some cases, multiple exception groups might be required to accommodate the rule's requirements.

Although this example remains relatively straightforward, it effectively demonstrates the capability and versatility of the exceptions key in handling various conditions and exceptions. This feature empowers you to create more sophisticated and specific rules while maintaining clarity and simplicity in the rule definition.

## Selecting the System Call to monitor

The kernel provides many system calls that enable processes and libraries to interact with various system resources. These system calls cover a wide range of tasks, from starting new processes to opening files or network sockets, allowing us to gain insights into the actions attempted by processes.

To illustrate this, let's consider a fictional example. When given appropriate permissions, the following code can elevate privileges for a user executing it.

```
#define _GNU_SOURCE
#include <unistd.h>
#include <stdlib.h>
#include <sys/wait.h>

int main(int argc, char* argv[])
{
    setresuid(0, 0, 0);
    int pid = fork();

    if (pid == 0) {
        system("/bin/bash");
    } else {
        wait(&pid);
    }

    return 0;
}
```

To compile it, use your favorite Linux C compiler and set the SUID bit on the binary. We are doing a static compilation here to simplify our example here.

```
# cc -static -o /tmp/malicious malicious.c
# chmod u+s /tmp/malicious
# ls -l /tmp/malicious
-rwsr-xr-x 1 root root 16888 Jan  11:30 /tmp/malicious
```

Executed as a regular user, it should grant them a root shell:

```
$ /tmp/malicious
#
```

To observe what this program does once executed, we'll use `strace`:

```
$ strace /tmp/malicious
execve("/tmp/malicious", ["/tmp/malicious"], 0x7ffeaaf27690 /* 24 vars */) = 0
access("/etc/suid-debug", F_OK)         = -1 ENOENT (No such file or directory)
arch_prctl(0x3001 /* ARCH_??? */, 0x7ffd8b18f0c0) = -1 EINVAL (Invalid argument)
brk(NULL)                               = 0x1f09000
brk(0x1f0a1c0)                          = 0x1f0a1c0
arch_prctl(ARCH_SET_FS, 0x1f09880)      = 0
uname({sysname="Linux", nodename="vagrant", ...}) = 0
readlink("/proc/self/exe", "/tmp/malicious", 4096) = 14
brk(0x1f2b1c0)                          = 0x1f2b1c0
brk(0x1f2c000)                          = 0x1f2c000
mprotect(0x4bf000, 12288, PROT_READ)    = 0
fcntl(0, F_GETFD)                       = 0
fcntl(1, F_GETFD)                       = 0
fcntl(2, F_GETFD)                       = 0
setresuid(0, 0, 0)                      = -1 EPERM (Operation not permitted)
clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x1f09b50) = 18104
wait4(-1,
```

Pay attention to the `Operation not permitted` message when trying to run the command:

```
setresuid(0, 0, 0)                      = -1 EPERM (Operation not permitted)
```

The reason is that the command `strace` doesn't have enough permissions to let `/tmp/malicious` escalate privileges. But that doesn't mean we can't use that information to detect when a program tries it.

Let's now build a rule to detect that behavior.

```
- rule: Detect privilege escalation in /tmp
  desc: Detect privilege escalationof binaries executed in /tmp
  condition: >
    evt.type = setresuid and evt.dir=> and
    proc.exepath startswith /tmp/
  output: "The binary %proc.name has tried to escalate privileges: %evt.args"
  priority: debug
  ```

This rule is designed to trigger when the syscall `setresuid` is invoked. When a syscall is made, it follows two distinct flows, each with its own direction. The first flow represents the request from the process to the kernel and is symbolized as `>`. The second flow symbolizes the answer from the kernel to the process and is represented as `<`. To specifically filter for the request flow, we have included the `evt.dir=>` condition. This ensures we receive alerts only when the syscall is requested, avoiding redundant alerts for the answer flow.

It's essential to consider the specific syscall and the data exchanged in both the request and the response to determine which direction to observe and monitor. This decision will depend on the monitoring objectives and the information necessary for detecting relevant events in the system.

When we execute our binary once more, the triggered rule should produce an output similar to the following:

```
Debug The binary malicious has tried to escalate privileges: ruid=0(root) euid=0(root) suid=0(root)
```

This rule may appear overly simplistic, potentially leading to numerous false positives or negatives. However, it illustrates how gaining a comprehensive understanding of binaries, their behaviors, and the associated threats can significantly improve the quality of our rule writing. By delving deeper into these aspects, we can craft more effective and accurate rules to enhance the detection capabilities of Falco.
