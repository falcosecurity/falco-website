---
title: Documentation Home
description: An overview of the Falco container security system
weight: 1
---

## About Falco

**Falco** is a runtime security tool designed for [OCI]-compliant containers. It uses powerful [system call capture][sys_call_capture] technology, originally built by [Sysdig], to monitor the [behavior](#behaviors) of applications—including container, application, host, and network activity—all in one place and from one source of data. You can specify which behavior you consider anomalous using Falco [rules].

### Which behaviors can Falco detect? {#behaviors}

Falco can detect and alert on any system behavior that involves [Linux system calls][sys_calls]. You can instruct Falco to trigger alerts not only the basis of which system calls are made but also of arguments to those calls and properties of the calling process. Here are some example anomalous behaviors that can trigger Falco alerts:

* A shell is run inside a container
* A server process spawns a child process of an unexpected type
* A sensitive file, like `/etc/shadow`, is unexpectedly read
* A non-device file is written to `/dev`
* A standard system binary (like `ls`) makes an outbound network connection

## How Falco compares to other tools

People often ask how Falco differs from [SELinux], [AppArmor], [Auditd], and other tools related to Linux security policy. We wrote a [blog post](https://sysdig.com/blog/selinux-seccomp-falco-technical-discussion/) on the [Sysdig blog](https://sysdig.com/blog) comparing Falco to other tools.

## How to use Falco

Falco is deployed as a long-running daemon. There are several ways to run Falco:

* Install it as a [Debian](installation#debian)/[rpm](installation#rhel) package on a regular host or container host
* Deploy it as a [container](installation#docker)
* Build it [from source](source)

Falco configuration comes from two sources:

1. A [rules file](rules) that defines which behaviors and events to watch for. Rules are expressed in a high-level, human-readable language. We've provided a sample rules file [`./rules/falco_rules.yaml`][falco_rules] as a starting point; you can—and will likely want to!—adapt it to your environment.
1. A [general configuration file](configuration) that specifies things like logging behavior and time formats.

When you're developing rules, we recommend making use of Falco's ability to read trace files saved by the [`scap`][scap] format. This allows you to "record" the offending behavior once and replay it with Falco as many times as needed while tweaking your rules.

Once deployed, Falco uses kernel modules and [eBPF] probes to bring events to userspace. Falco watches for any events matching one of the conditions defined in the rule file. If a matching event occurs, a notification is written to the the configured output(s).

## Falco alerts

When Falco detects suspicious behavior, it can send [alerts](alerts) via one or more channels:

* Writing to standard error
* Writing to a file
* Writing to syslog
* Piping to a spawned program. A common use of this output type would be to send an email for every Falco notification.

[apparmor]: https://wiki.ubuntu.com/AppArmor
[auditd]: https://linux.die.net/man/8/auditd
[ebpf]: https://en.wikipedia.org/wiki/Berkeley_Packet_Filter
[falco_rules]: https://github.com/falcosecurity/falco/blob/dev/rules/falco_rules.yaml
[oci]: https://www.opencontainers.org
[rules]: rules
[scap]: https://en.wikipedia.org/wiki/Security_Content_Automation_Protocol
[selinux]: https://en.wikipedia.org/wiki/Security-Enhanced_Linux
[sys_call_capture]: https://sysdig.com/blog/fascinating-world-linux-system-calls
[sys_calls]: http://man7.org/linux/man-pages/man2/syscalls.2.html
[sysdig]: https://sysdig.com
