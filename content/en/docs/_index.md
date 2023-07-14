---
title: The Falco Project
description: Cloud Native Runtime Security
weight: 10
---

## What is Falco?

The Falco Project is an open source runtime security tool originally built by [Sysdig, Inc](https://sysdig.com). Falco was [donated to the CNCF and is now a CNCF incubating project](https://www.cncf.io/blog/2020/01/08/toc-votes-to-move-falco-into-cncf-incubator/).

## What does Falco do?

Falco uses system calls to monitor system's activity, by:

 - Parsing the Linux system calls from the kernel at runtime
 - Asserting the stream against a powerful rules engine
 - Alerting when a rule is violated

For more information, see Falco [Rules](rules).

Falco's monitoring capabilities are not limited to system calls as it can be extended via [plugins](plugins) to ingest data from many more types of sources.

## What does Falco check for?

Falco ships with a default set of rules that check the kernel for unusual behavior such as:

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
 - Mutating `shadowutil` or `passwd` executables such as `shadowconfig`, `pwck`, `chpasswd`, `getpasswd`, `change`, `useradd`, `etc`, and others.


## What are Falco rules?

Rules are the items that Falco asserts against. They are defined in the Falco configuration file, and represent the events you can check on the system. For more information about writing, managing, and deploying rules, see Falco [Rules](rules).

## What are Falco alerts?

Alerts are configurable downstream actions that can be as simple as logging to `STDOUT` or as complex as delivering a gRPC call to a client. For more information about configuring, understanding, and developing alerts, see [Falco Alerts](alerts). Falco can send alerts to :

- Standard Output
- A file
- Syslog
- A spawned program
- A HTTP[s] end point
- A client through the gRPC API


## What are the Components of Falco?

Falco is composed of several main components:

 - Userspace program - is the CLI tool `falco` that you can use to interact with Falco. The userspace program handles signals, parses information from a Falco driver, and sends alerts.

 - Configuration - defines how Falco is run, what rules to assert, and how to perform alerts. For more information, see [Configuration](configuration).

 - Driver - is a software that adheres to the Falco driver specification and sends a stream of system call information. You cannot run Falco without installing a driver.
Currently, Falco supports the following drivers:

    - (Default) Kernel module built on `libscap` and `libsinsp` C++ libraries
    - BPF probe built from the same modules
    - Userspace instrumentation

    For more information, see [Falco Drivers](/docs/event-sources/drivers/).

 - Plugins - allow users to extend the functionality of falco libraries/falco executable by adding new event sources and new fields that can extract information from events. For more information, see [Plugins](plugins).

## What are the ecosystem projects that can interact with Falco?

Apart from the Falco core projects, the Falco organization also maintains and distributes ecosystem projects that help adopters get the most out of Falco. To learn more, visit the [Falco Evolution repositories](https://github.com/falcosecurity/evolution/#repositories) list. For example, the [falcosidekick](https://github.com/falcosecurity/falcosidekick) project makes it easier to output Falco events to many applications and channels, while the [falco-exporter](https://github.com/falcosecurity/falco-exporter) tool is used to integrate Falco with Prometheus.
