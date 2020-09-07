---
title: The Falco Project
description: Cloud Native Runtime Security
weight: 1
---

## What is Falco?

The Falco Project is an open source runtime security tool originally built by [Sysdig, Inc](https://sysdig.com). Falco was [donated to the CNCF and is now a CNCF incubating project](https://www.cncf.io/blog/2020/01/08/toc-votes-to-move-falco-into-cncf-incubator/).

## What does Falco do?

Falco parses Linux system calls from the kernel at runtime, and asserts the stream against a powerful rules engine. 
If a rule is violated a Falco alert is triggered. Read more about Falco [rules](rules)

 - Parse
 - Assert
 - Alert

## What does Falco look for?

By default Falco ships with a mature set of rules that will check the kernel for unusual behavior such as

 - Privilege escalation using privileged containers 
 - Namespace changes using tools like `setns` 
 - Read/Writes to well-known directories such as `/etc`, `/usr/bin`, `/usr/sbin`, etc
 - Creating symlinks 
 - Ownership and Mode changes 
 - Unexpected network connections or socket mutations
 - Spawned processes using `execve`
 - Executing shell binaries such as `sh`, `bash`, `csh`, `zsh`, etc
 - Executing SSH binaries such as `ssh`, `scp`, `sftp`, etc
 - Mutating Linux `coreutils` executables
 - Mutating login binaries 
 - Mutating `shadowutil` or `passwd` executables 
    - `shadowconfig`
    - `pwck`
    - `chpasswd`
    - `getpasswd`
    - `change`
    - `useradd`
    - etc

...and many more. 

## What are Falco rules?

These are the items that Falco will assert against. They are defined in the Falco configuration, and represent the things you will be looking for on your system.

See the section on [rules](rules) for more information on writing, managing, and deploying Falco rules.

## What are Falco alerts?

These are configurable downstream actions that can be as simple as logging to `STDOUT` or as complex as delivering a gRPC call to a client. 

See the section on [alerts](alerts) for more information on configuring, understanding, and developing Falco alerts.


## Falco Components 

Falco is composed of 3 main components

 - Userspace program
 - [Driver](/docs/event-sources/drivers/)
 - [Configuration](configuration)

### Falco userspace program

This is the CLI tool `falco`. This is the program a user interacts with. The userspace program is responsible for handling signals, parsing information from a Falco driver, and alerting.

### Falco drivers

This is a piece of software that adheres to the Falco driver spec and can send a stream of system call information.

Falco cannot run without a driver installed.

Currently the Falco project has support for the following drivers

 - (Default) Kernel module built on `libscap` and `libsinsp` C++ libraries
 - BPF probe built from the same modules
 - Userspace instrumentation

 Please read more about the drivers [here](/docs/event-sources/drivers/).
 
### Falco configuration 

This defines how Falco is run, what rules to assert, and how to perform alerts. See the section on [configuration](configuration) for more information on how to configure Falco. 
