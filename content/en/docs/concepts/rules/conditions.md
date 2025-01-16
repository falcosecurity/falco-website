---
title: Condition Syntax
description: Learn how to write conditions for a Falco Rule
linktitle: Condition Syntax
weight: 40
aliases:
- ../../rules/conditions
---

A Falco rule’s condition defines the filter that determines which events are {{< glossary_tooltip text="detected" term_id="detection" >}} by the rule. This condition is a boolean expression that evaluates to _true_ or _false_ for each event. If it evaluates to _true_, the rule triggers and generates an {{< glossary_tooltip text="alert" term_id="alerts" >}}.

A condition can be viewed as a sequence of comparisons, each joined by [logical operators](#logical-operators). Parentheses can be used to define precedence. Each comparison uses a [comparison operator](#comparison-operators) between a field (on the left side), extracted from the input event, and a static or computed value (on the right side). You can also apply [transformers](#transformers) to the field to modify its extracted values before comparison.

The set of {{< glossary_tooltip text="fields" term_id="fields" >}} available depends on the data source. For simplicity, this page focuses on {{< glossary_tooltip text="syscalls" term_id="syscalls" >}}, as they are among the most common.

For example, the following condition triggers for each execution of `cat` or `grep`:

```
evt.type = execve and evt.dir = < and (proc.name = cat or proc.name = grep)
```

## Operators

You can use the below operators in Falco rule conditions.

### Logical operators

Operators | Description
:---------|:-----------
`and` | Logical AND operator to connect two or more comparisons (ie. `evt.type = open and fd.typechar='f'`).
`or` | Logical OR operator to connect two or more comparisons (ie. `proc.name = bash or proc.name = zsh`).
`not` | Logical NOT operator to negate a comparison (ie. `not proc.name = bash`).

### Comparison operators

Operators | Description
:---------|:-----------
`=`, `!=` | Equality and inequality operators.
`<=`, `<`, `>=`, `>` | Comparison operators for numeric values.
`contains`, `bcontains`, `icontains` | Strings are evaluated to be true if a string contains another. For flags, `contains` evaluates to true if the specified flag is set. For example: `proc.cmdline contains "-jar"`, `evt.arg.flags contains O_TRUNC`. The `icontains` variant works similarly but is case-insensitive. The `bcontains` variant allows byte matching against a raw string of bytes, taking a hexadecimal string as input. For example: `evt.buffer bcontains CAFEBABE`
`endswith` | Checks if a string start with a given suffix.
`exists` | Checks whether a field is set. Example: `k8s.pod.name exists`.
`glob` | Evaluates standard glob patterns. Example: `fd.name glob "/home/*/.ssh/*"`.
`in` | Evaluates whether the first set is completely contained in the second set. Example: `(b,c,d) in (a,b,c)` is `FALSE` because `d` is not found in `(a,b,c)`.
`intersects` | Evaluates whether the first set has at least one element in common with the second set. Example: `(b,c,d) intersects (a,b,c)` is `TRUE` because both sets contain `b` and `c`.
`pmatch` | Compares a file path against a set of file or directory prefixes. Example: `fd.name pmatch (/tmp/hello)` evaluates to true for `/tmp/hello`, `/tmp/hello/world` but not `/tmp/hello_world`.
`regex` | Checks whether a string field matches a [Google RE2](https://github.com/google/re2/wiki/Syntax)-compatible regular expression. Note that `regex` can be considerably slower than simpler string operations. Example: `fd.name regex '[a-z]*/proc/[0-9]+/cmdline'`.
`startswith` | Checks if a string ends with a given prefix. The `bstartswith` variant allows byte matching against a raw string of bytes, taking a hexadecimal string as input. For example: `evt.buffer bstartswith 012AB3CC`.

## Transformers

Falco supports basic transformations on fields within rule conditions. For instance, if you want to check for a case-insensitive process name, you can use:

```
tolower(proc.name) = bash
```

The following transform operators are supported:

Transformer | Description
:--------|:-----------
`tolower(<field>)` | Converts the input field to lowercase.
`toupper(<field>)` | Converts the input field to uppercase.
`b64(<field>)` | Decodes the input field from [Base64](https://en.wikipedia.org/wiki/Base64).
`basename(<field>)` | Extracts the filename without its directory path from the input field. Unlike the Unix `basename` program, `basename()` in Falco returns `""` if no filename is present. For example, `basename(proc.exepath)` is `"cat"` for `/usr/bin/cat` but `""` for `/usr/bin/`.
`len(<field>)` | Returns the length of the field: for LIST fields, the number of elements; for CHARBUF fields, the number of characters; and for BYTEBUF fields, the number of bytes.

### Field evaluation (for right-hand side of comparisons)

Falco also lets you compare field values with other field values by using the `val()` special transformer on the right-hand side of a comparison. For instance, to detect processes that have the same name as their parent:

```
proc.name = val(proc.pname)
```

Similarly, using transformations on both sides is supported:

```
tolower(proc.name) = tolower(proc.pname)
```

## Syscall event types, direction, and args

Every syscall event includes the [`evt` field class](/docs/reference/rules/supported-fields/#field-class-evt). Each condition you write for these events typically begins with an `evt.type` expression or macro. This is practical because security rules often focus on one syscall type at a time. For instance, you might consider `open` or `openat` to detect suspicious activity when files are opened, or `execve` to inspect newly spawned processes. You do not have to guess the syscall name—simply refer to the complete [list of supported system call events](/docs/reference/rules/supported-fields/) for an overview of what you can use.

Each syscall has an entry event and an exit event, tracked by the `evt.dir` field, also referred to as the "direction" of the system call. A value of `>` indicates entry (when the syscall is invoked), while `<` marks exit (when the call has returned). By looking at the supported system call list, you will see that events have both entry and exit forms. For example:

```
> setuid(UID uid)
< setuid(ERRNO res)
```

In many cases, it is most useful to filter on exit events, because you want to know the outcome of the syscall once it has completed. For example, consider the file-opening events:

```
> open()
< open(FD fd, FSPATH name, FLAGS32 flags, UINT32 mode, UINT32 dev)
> openat()
< openat(FD fd, FD dirfd, FSRELPATH name, FLAGS32 flags, UINT32 mode, UINT32 dev)
```

Each event has a list of arguments that you can access through `evt.arg.<argname>`. For instance, if you want to detect a process opening a file to overwrite it, check if the list of flags contains `O_TRUNC`:

```
evt.type in (open, openat) and evt.dir = < and evt.arg.flags contains O_TRUNC
```

Note that arguments do not necessarily match the raw parameters used in the Linux kernel; Falco may parse them in ways that make rule-writing more straightforward. By using the [`evt` fields](/docs/rules/supported-fields/#field-class-evt), you can inspect many other aspects common across different events.

## Syscall event context and metadata

While the `evt` fields allow you to write expressive conditions, arguments and common fields alone are often insufficient for complete security rules. You might also need to consider the process context in which the event occurred, whether or not it happened inside a container, or how it correlates with Kubernetes metadata. To enable this, Falco enriches many events with [additional field classes](/docs/rules/supported-fields). Not all field classes are available for all events, and the list grows over time. Each field class’s documentation clarifies when those fields are expected to be present, but some are so common that rules often rely on them.

The [`proc` field class](/docs/rules/supported-fields/#field-class-process) gives you context about the process and thread generating a specific syscall. This information is frequently very important. For example, you can use `proc.name` and `proc.pid`, or even traverse the process hierarchy with `proc.aname[<n>]` and `proc.apid[<n>]`. You can also see which user performed the action with the `user` field class.

An example rule that detects whenever `bash` is executed inside a container could look like this:

```
evt.type = execve and evt.dir = < and container.id != host and proc.name = bash
```

Notice that you do not need to check the `execve` arguments. Once `execve` has returned, Falco updates the process context, so all `proc.` fields refer to the new process that was just spawned, including command line, executable path, arguments, and so on.
