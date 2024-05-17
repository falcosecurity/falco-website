---
title: Condition Syntax
description: Learn how to write conditions for a Falco Rule
linktitle: Condition Syntax
weight: 40
---

A condition is a boolean expression related to a single event that has been {{< glossary_tooltip text="detected" term_id="detection" >}} by Falco. You can use {{< glossary_tooltip text="fields" term_id="fields" >}} related to every supported event, but this document focuses on {{< glossary_tooltip text="syscalls" term_id="syscalls" >}} as they're currently the most common. The language supports boolean operators and parentheses as you'd expect. For example a condition like:

```
evt.type = execve and evt.dir = < and (proc.name = cat or proc.name = grep)
```

This will trigger for each execution of `cat` or `grep`. Below you can take a closer look at what is the meaning of those fields such as `evt.dir`, how to discover the types of events available, and which fields are present with which event type.

## Syscall event types, direction and args

Every syscall event will present the [`evt` field class](/docs/rules/supported-fields/#field-class-evt). Each condition that you write for those events will normally start with a `evt.type` expression or macro; this makes a lot of sense since security rules normally consider one syscall type at a time. For instance, you may want to consider `open` or `openat` to catch suspicious activity when opening files, `execve` to inspect spawned processes, and so forth. You don't have to guess the syscall name, as you can see the complete [list of supported system calls events](/docs/rules/supported-events) and understand which ones you can use.

Every syscall has an entry event and an exit event which is shown in the `evt.dir` field, also known as the "direction" of the system call. A value of `>` indicates entry, which fires when the syscall is invoked, while `<` marks exit, meaning that the call has returned. In fact, by looking at the supported system call list you can see that our events have both entries. For example:

```
> setuid(UID uid)
< setuid(ERRNO res)
```

Most of the time the engine informs you about exit events as you want to understand what happened after the event execution is complete. You can see by using the events associated with opening files.

```
> open()
< open(FD fd, FSPATH name, FLAGS32 flags, UINT32 mode, UINT32 dev)
> openat()
< openat(FD fd, FD dirfd, FSRELPATH name, FLAGS32 flags, UINT32 mode, UINT32 dev)
```

As you can see, each event has a list of arguments associated with it that you can access by using `evt.arg.<argname>`. For example, to identify when a process opens a file to overwrite it, you need to check if the list of flags contains `O_TRUNC`. You can use the `evt.arg.flags` field of the `open` and `openat` exit events shown above and the rule will then look like this:

```
evt.type in (open, openat) and evt.dir = < and evt.arg.flags contains O_TRUNC
```

Note that the arguments do not necessarily match the raw parameters that are used in the Linux kernel, but are parsed by Falco to make it easier to write rules. By using the [`evt` fields](/docs/rules/supported-fields/#field-class-evt) we can inspect many more aspects that are common across events.

## Syscall event context and metadata

While the `evt` fields allow you to write pretty expressive conditions, arguments and common fields are usually not enough to write full security rules. Many times you want to add conditions based on the process context the event happens in, or whether or not something is happening inside a container or even correlate each event with the relevant Kubernetes metadata for the cluster, pods, and more. For this reason, Falco enriches many events with [other field classes](/docs/rules/supported-fields). Not all the classes are available for all the events and the list can grow. The documentation for each clarifies when those are expected to be available, but some are so common that you often rely on them.

The [`proc` field class](/docs/rules/supported-fields/#field-class-process) gives you the context about the process and thread that is generating a specific syscall. This information is usually very important. The most basic piece of information you can get out of it is `proc.name` and `proc.pid`, but you can even traverse the process hierarchy by using `proc.aname[<n>]` and `proc.apid[<n>]`. Likewise, you may be interested in which user performs a specific action via the `user` field class.

The documentation gives you an example of how to catch executions of `bash` within containers:

```
evt.type = execve and evt.dir = < and container.id != host and proc.name = bash
```

Note that you don't even have to look at the `execve` args. That is because once `execve` has returned the process context recorded by Falco is updated, meaning that the `proc.` fields will already refer to all information, including the command line, executable, arguments, related to the new process that was just spawned.

## Transform operators

Since Falco 0.38.0 you can perform basic transformation on fields in your rule condition. For instance, if you wish to check for a case insensitive process name you can write

```
tolower(proc.name) = bash
```

The following transform operators are supported:

Operator | Description
:--------|:-----------
`tolower(<field>)` | Converts the input field to lower case
`toupper(<field>)` | Converts the input field to upper case
`b64(<field>)` | Decodes the input field from [Base64](https://en.wikipedia.org/wiki/Base64)

## Field evaluation operator

Since Falco 0.38.0 you can also compare field values with other field values by using the `val()` operator on the right hand side of the expression. For instance, in order to write a condition that checks for processes that have the same name as their parent you can write

```
proc.name = val(proc.pname)
```

Alternatively, using transformes on both sides of the comparison operator is also supported:

```
tolower(proc.name) = tolower(proc.pname)
```

## Operators

You can use the following operators in conditions:

Operators | Description
:---------|:-----------
`=`, `!=` | Equality and inequality operators.
`<=`, `<`, `>=`, `>` | Comparison operators for numeric values.
`contains`, `icontains` | For strings will evaluate to true if a string contains another, and `icontains` is the case insensitive version. For flags it will evaluate to true if the flag is set. Examples: `proc.cmdline contains "-jar"`, `evt.arg.flags contains O_TRUNC`.
`startswith`, `endswith` | Check prefix or suffix of strings.
`glob` | Evaluate standard glob patterns. Example: `fd.name glob "/home/*/.ssh/*"`.
`in` | Evaluate if the provided set (could have just one element) is completely contained in another set. Example: `(b,c,d) in (a,b,c)` will evaluate `FALSE` since `d` is not contained in the compared set `(a,b,c)`.
`intersects` | Evaluate if the provided set (could have just one element) has at least one element in common with another set. Example: `(b,c,d) intersects (a,b,c)` will evaluate `TRUE` since both sets contain `b` and `c`.
`pmatch` | Compare a file path against a set of file or directory prefixes. Example: `fd.name pmatch (/tmp/hello)` will evaluate to true against `/tmp/hello`, `/tmp/hello/world` but not `/tmp/hello_world`.
`exists` | Check if a field is set. Example: `k8s.pod.name exists`.
`bcontains`, `bstartswith` | These operators work similarly to `contains` and `startswith` and allow performing byte matching against a raw string of bytes, accepting as input a hexadecimal string. Examples: `evt.buffer bcontains CAFEBABE`, `evt.buffer bstartswith 012AB3CC`.
