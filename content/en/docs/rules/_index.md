---
title: Rules
weight: 2
---

A Falco *rules file* is a [YAML](http://www.yaml.org/start.html) file containing three types of elements:

Element | Description
:-------|:-----------
[Rules](#rules) | *Conditions* under which an alert should be generated. A rule is accompanied by a descriptive *output string* that is sent with the alert.
[Macros](#macros) | Rule condition snippets that can be re-used inside rules and even other macros. Macros provide a way to name common patterns and factor out redundancies in rules.
[Lists](#lists) | Collections of items that can be included in rules, macros, or other lists. Unlike rules and macros, lists cannot be parsed as filtering expressions.

## Versioning

From time to time, we make changes to the rules file format that are not backwards-compatible with older versions of Falco. Similarly, the Sysdig libraries incorporated into Falco may define new filtercheck fields, operators, etc. We want to denote that a given set of rules depends on the fields/operators from those Sysdig libraries.

> As of Falco version **0.14.0**, the Falco rules support explicit versioning of both the Falco engine and the Falco rules file.

### Falco Engine Versioning

The `falco` executable and the `falco_engine` C++ object now support returning a version number. The initial version will be 2 (implying that prior versions were 1). Any time we make an incompatible change to the rules file format or add new filtercheck fields/operators to Falco, we will increment this version.

### Falco Rules File Versioning

The Falco rules files included with Falco include a new top-level object, `required_engine_version: N`, that specifies the minimum engine version required to read this rules file. If not included, no version check is performed when reading the rules file.

If a rules file has an `engine_version` greater than the Falco engine version, the rules file is be loaded and an error is returned.

## Rules

A Falco *rule* is a node containing the following keys:

Key | Required | Description | Default
:---|:---------|:------------|:-------
`rule` | yes | A short, unique name for the rule. |
`condition` | yes | A filtering expression that is applied against events to check whether they match the rule. |
`desc` | yes | A longer description of what the rule detects. |
`output` | yes | Specifies the message that should be output if a matching event occurs, following the Sysdig [output format syntax](http://www.sysdig.org/wiki/sysdig-user-guide/#output-formatting). |
`priority` | yes | A case-insensitive representation of the severity of the event. Should be one of the following: `emergency`, `alert`, `critical`, `error`, `warning`, `notice`, `informational`, `debug`. |
`enabled` | no | If set to `false`, a rule is neither loaded nor matched against any events. | `true`
`tags` | no | A list of tags applied to the rule (more on this [below](#tags)). |
`warn_evttypes` | no | If set to `false`, Falco suppresses warnings related to a rule not having an event type (more on this [below](#rule-condition-best-practices)). | `true`
`skip-if-unknown-filter` | no | If set to `true`, if a rule conditions contains a filtercheck, e.g. `fd.some_new_field`, that is not known to this version of Falco, Falco silently accepts the rule but does not execute it; if set to `false`, Falco repots an error and exists when finding an unknown filtercheck. | `false`

## Conditions

The key part of a rule is the _condition_ field. A condition is simply a Boolean predicate on Sysdig events expressed using the Sysdig [filter syntax](http://www.sysdig.org/wiki/sysdig-user-guide/#filtering). Any Sysdig filter is a valid Falco condition (with the exception of certain excluded system calls, discussed below). In addition, Falco conditions can contain macro terms (this capability is not present in Sysdig syntax).

Here's an example of a condition that alerts whenever a bash shell is run inside a container:

`container.id != host and proc.name = bash`

The first clause checks that the event happened in a container (Sysdig events have a `container` field that is equal to `"host"` if the event happened on a regular host). The second clause checks that the process name is `bash`. Note that this condition does not even include a clause with a system call! It only checks event metadata. Because of that, if a bash shell does start up in a container, Falco outputs events for every syscall that is performed by that shell.

> **Tip**: If you're new to Sysdig and unsure which fields are available, run `sysdig -l` to see the list of supported fields.

A complete rule using the above condition might be:

```yaml
- rule: shell_in_container
  desc: notice shell activity within a container
  condition: container.id != host and proc.name = bash
  output: shell in a container (user=%user.name container_id=%container.id container_name=%container.name shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```

## Macros

As noted above, macros provide a way to define common sub-portions of rules in a reusable way. As a very simple example, if we had many rules for events happening in containers, we might to define an `in_container` macro:

```yaml
- macro: in_container
  condition: container.id != host
```

With this macro defined, we can then rewrite the above rule's condition as `in_container and proc.name = bash`.

For many more examples of rules and macros, take a look the documentation on [default macros](./default-macros) or the `rules/falco_rules.yaml` file.

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

> **Note**: Lists *can* contain other lists.

## Appending to Lists, Rules, and Macros

If you use multiple Falco rules files, you might want to append new items to an existing list, rule, or macro. To do that, define an item with the same name as an existing item and add an `append: true` attribute to the list. When appending lists, items are added to the **end** of the list. When appending rules/macros, the additional text is appended to the condition: field of the rule/macro.

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
  condition: proc.name in (my_programs) and evt.type=open
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

## Rule Priorities

Every falco rule has a priority which indicates how serious a violation of the rule is. The priority will be included in the message/json output/etc. The possible set of priorities are:

* `EMERGENCY`
* `ALERT`
* `CRITICAL`
* `ERROR`
* `WARNING`
* `NOTICE`
* `INFORMATIONAL`
* `DEBUG`

The general guidelines used to assign priorities to rules are the following:

* If a rule is related to a write of state (i.e. filesystem, etc.), its priority is ERROR.
* If a rule is related to an unauthorized read of state (i.e. reading sensitive filees, etc.), its priority is WARNING.
* If a rule is related to unexpected behavior (spawning an unexpected shell in a container, opening an unexpected network connection, etc.), its priority is NOTICE.
* If a rule is related to behaving against good practices (unexpected privileged containers, containers with sensitive mounts, running interactive commands as root), its priority is INFO.

One exception is that the rule "Run shell untrusted", which is fairly FP-prone, has a priority of DEBUG.

## Rule Tags {#tags}

As of 0.6.0, rules have an optional set of _tags_ that are used to categorize the ruleset into groups of related rules. Here's an example:

``` 
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

* filesystem: the rule relates to reading/writing files
* sofware_mgmt: the rule relates to any software/package management tool like rpm, dpkg, etc.
* process: the rule relates to starting a new process or changing the state of a current process.
* database: the rule relates to databases
* host: the rule *only* works outside of containers
* shell: the rule specifically relates to starting shells
* container: the rule *only* works inside containers
* cis: the rule is related to the CIS Docker benchmark.
* users: the rule relates to management of users or changing the identity of a running process.
* network: the rule relates to network activity

Rules can have multiple tags if they relate to multiple of the above. Every rule in the falco ruleset currently has at least one tag.

## Rule Condition Best Practices

To allow for grouping of rules by event type, which improves performance, falco prefers rule conditions that have at least one `evt.type=` operator, at the beginning of the condition, before any negative operators (i.e. `not` or `!=`). If a condition does not have any `evt.type=` operator, falco will log a warning like:

```
Rule no_evttype: warning (no-evttype):
proc.name=foo
     did not contain any evt.type restriction, meaning it will run for all event types.
     This has a significant performance penalty. Consider adding an evt.type restriction if possible.
```

If a rule has a `evt.type` operator in the later portion of the condition, falco will log a warning like:

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

In some cases, rules may need to contain special characters like '(', spaces, etc. For example, you may need to look for a `proc.name` of `(systemd)`, including the surrounding parentheses.

Falco, like sysdig, supports quoting using `"` to capture these special characters. Here's an example:

```yaml
- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name="(systemd)" or proc.name=systemd
  output: "File opened by systemd (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```

When including items in lists, you also need to ensure the double quotes are not interpreted at the yaml document level, so you should surround the quoted string with single quotes. Here's an example:

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

For performance reasons, some system calls are currently discarded before falco processing. The current list is:

```
accept access alarm brk capget clock_getres clock_gettime clock_nanosleep clock_settime clone close container cpu_hotplug drop epoll_create epoll_create1 epoll_ctl epoll_pwait epoll_wait eventfd eventfd2 execve exit_group fcntl fcntl64 fdatasync fgetxattr flistxattr fork fstat fstat64 fstatat64 fstatfs fstatfs64 fsync futex get_robust_list get_thread_area getcpu getcwd getdents getdents64 getegid geteuid getgid getgroups getitimer getpeername getpgid getpgrp getpid getppid getpriority getresgid getresuid getrlimit getrusage getsid getsockname getsockopt gettid gettimeofday getuid getxattr infra io_cancel io_destroy io_getevents io_setup io_submit ioctl ioprio_get ioprio_set k8s lgetxattr listxattr llistxattr llseek lseek lstat lstat64 madvise mesos mincore mlock mlockall mmap mmap2 mprotect mq_getsetattr mq_notify mq_timedreceive mq_timedsend mremap msgget msgrcv msgsnd munlock munlockall munmap nanosleep newfstatat newselect notification olduname page_fault pause poll ppoll pread pread64 preadv procexit procinfo pselect6 pwrite pwrite64 pwritev read readv recv recvmmsg remap_file_pages rt_sigaction rt_sigpending rt_sigprocmask rt_sigsuspend rt_sigtimedwait sched_get_priority_max sched_get_priority_min sched_getaffinity sched_getparam sched_getscheduler sched_yield select semctl semget semop send sendfile sendfile64 sendmmsg setitimer setresgid setrlimit settimeofday sgetmask shutdown signaldeliver signalfd signalfd4 sigpending sigprocmask sigreturn splice stat stat64 statfs statfs64 switch sysdigevent tee time timer_create timer_delete timer_getoverrun timer_gettime timer_settime timerfd_create timerfd_gettime timerfd_settime times ugetrlimit umask uname unlink unlinkat ustat vfork vmsplice wait4 waitid waitpid write writev
```

When run with `-i`, falco will print the set of events/syscalls ignored and exit. If you'd like to run falco against all events, including system calls in the above list, you can run falco with the `-A` flag.


