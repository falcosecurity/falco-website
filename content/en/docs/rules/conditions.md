---
title: Condition Syntax
weight: 3
---

A condition is a boolean expression related to a single event that has been detected by Falco. You can use fields related to every supported event, but we'll focus on syscalls as they're currently the most common. The language supports boolean operators and parentheses as you'd expect. For example a condition like:

```
evt.type = execve and evt.dir = < and (proc.name = cat or proc.name = grep)
```

Will trigger for each execution of `cat` or `grep`. We'll now take a closer look at what is the meaning of those fields such as `evt.dir`, how to discover the types of events there are available and which fields go with which event type.

# Syscall event types, direction and args

Every syscall event will present the [`evt` field class](/docs/rules/supported-fields/#field-class-evt). Each condition that we write for those events will normally starts with a `evt.type` expression or macro; this makes a lot of sense since security rules normally consider one syscall type at a time. For instance, we may want to consider `open` or `openat` to catch suspicious activity when opening files, `execve` to inspect spawned processes and so forth. We don't have to guess the syscall name, as we can look at the complete [list of supported system calls events](/docs/rules/supported-events) or to understand which ones we can use.

Every syscall has an entry event and an exit event which is shown in the `evt.dir` field, also known as the "direction" of the system call. A value of `>` indicates entry, which fires when the syscall is invoked, while `<` marks exit, meaning that the call has returned. In fact, by looking at the supported system call list we can see that our events have both entries. For example:

```
> setuid(UID uid)
< setuid(ERRNO res)
```

Most of the times the engine will tell us a lot more information about exit events as we want to understand what happened after the event execution is complete as we can see with events concerning opening files.

```
> open()
< open(FD fd, FSPATH name, FLAGS32 flags, UINT32 mode, UINT32 dev)
> openat()
< openat(FD fd, FD dirfd, FSRELPATH name, FLAGS32 flags, UINT32 mode, UINT32 dev)
```

As we can see, each event has a list of arguments associated with it that we can access by using `evt.arg.<argname>`. For example, if we want to identify when a process opens a file to overwrite it we need to check if the list of flags contains `O_TRUNC` we will use the `evt.arg.flags` field of the `open` and `openat` exit events shown above and our rule will then look like:

```
evt.type in (open, openat) and evt.dir = < and evt.arg.flags contains O_TRUNC
```

Note that the arguments do not necessarily match the raw parameters that are used in the Linux kernel, but are parsed by Falco to make it easier to write rules. By using the [`evt` fields](/docs/rules/supported-fields/#field-class-evt) we can inspect many more aspects that are common across events.

# Syscall event context and metadata

While the `evt` fields allow us to write pretty expressive conditions, arguments and common fields are usually not enough to write full security rules. Many times we want to add conditions based on the process context the event happens in, or whether or not something is happening inside a container or even correlate each event with the relevant Kubernetes metadata for our cluster, pods, and more. For this reason Falco enriches many events with [other field classes](/docs/rules/supported-fields). Not all classes are available for all events and the list can grow. The documentation for each clarifies when those are expected to be available, but some are so common that we often rely on them.

The [`proc` field class](/docs/rules/supported-fields/#field-class-process) gives us context about the process and thread that is generating a specific syscall. This is usually very important. The most basic piece of information we can get out of it is `proc.name` and `proc.pid`, but we can even traverse the process hierarchy by using `proc.aname[<n>]` and `proc.apid[<n>]`. Likewise, we may be interested in which user performs a specific action via the `user` field class.

By going through the documentation we can see for example how to catch executions of `bash` within containers:

```
if evt.type = execve and evt.dir = < and container.id != host and proc.name = bash
```

Note that we didn't even have to look at the `execve` args. That is because once `execve` has returned the process context recorded by Falco is updated, meaning that the `proc.` fields will already refer to all information, including the commandline, executable, arguments, related to the new process that was just spawned.

# Operators

We can use the following operators in Falco conditions: `=`, `!=`, `<=`, `<`, `>=`, `>`, `contains`, `icontains`, `startswith`, `endswith`, `glob`, `in`, `intersects`, `pmatch`, `exists`.

