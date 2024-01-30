---
title: The Falco Project
description: Cloud Native Runtime Security
weight: 10
aliases:
- docs/psp-support
---

## What is Falco?

Falco is a cloud native runtime security tool for Linux operating systems. It is designed to detect and alert on abnormal behavior and potential security threats in real-time.

At its core, Falco is a kernel monitoring and detection agent that observes events, such as syscalls, based on custom rules. Falco can enhance these events by integrating metadata from the container runtime and Kubernetes. The collected events can be analyzed off-host in SIEM or data lake systems.

Falco, originally created by [Sysdig](https://sysdig.com), is now a [Cloud Native Computing Foundation](https://cncf.io) (CNCF) project used in production by various [organisations](https://github.com/falcosecurity/falco/blob/master/ADOPTERS.md).


## What does Falco do?

Falco uses syscalls to monitor a system's activity, by:

 - Parsing the Linux syscalls from the kernel at runtime
 - Asserting the stream against a powerful rules engine
 - Alerting when a rule is violated

For more information, see Falco [Rules](rules).

Falco's monitoring capabilities are not limited to syscalls as it can be extended via [plugins](plugins) to ingest data from many more types of sources.

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

Rules are the conditions under which an alert should be generated. A rule is accompanied by a descriptive output string sent with the alert. They are defined using YAML files and loaded by the Falco configuration file. For more information about writing, managing, and deploying rules, see Falco [Rules](rules).

## What are Falco alerts?

Alerts are configurable downstream actions that can be as simple as logging to `stdout` or as complex as delivering a {{< glossary_tooltip text="gRPC" term_id="grpc" >}} call to a client. For more information about configuring, understanding, and developing alerts, see [Falco Alerts](alerts). Falco can send alerts to:

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

 - Driver - is a software that adheres to the Falco driver specification and sends a stream of kernel events. Currently, Falco supports the following drivers:

    - (Default) Kernel module
    - Modern eBPF probe (CO-RE paradigm and more)
    - Legacy eBPF probe built

    For more information, see [Falco Drivers](event-sources/drivers).

 - Plugins - allow to extend the functionality of Falco by adding new event sources and new fields that can extract information from events. For more information, see [Plugins](plugins).

 - [Falcoctl](https://github.com/falcosecurity/falcoctl) - allows to easily install rules and plugins and perform administrative tasks with Falco. It is bundled together with Falco.

## What are the ecosystem projects that can interact with Falco?

Apart from the [Falco core projects](https://github.com/falcosecurity/evolution#core), the Falco organization also maintains and distributes ecosystem projects that help adopters get the most out of Falco. To learn more, visit the [Falco Evolution repositories](https://github.com/falcosecurity/evolution/#repositories) list. For example, the [falcosidekick](https://github.com/falcosecurity/falcosidekick) project makes it easier to output Falco events to many applications and channels, [falcoctl](https://github.com/falcosecurity/falcoctl) makes it easier to perform a number of administrative tasks for Falco, including installing and updating rules and plugins, while the [falco-exporter](https://github.com/falcosecurity/falco-exporter) tool is used to integrate Falco with Prometheus.
