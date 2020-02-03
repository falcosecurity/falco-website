---
title: Documentation Home
description: An overview of the Falco container security system
weight: 1
---

## About Falco

Falco is a behavioral activity monitor designed to detect anomalous activity in your applications. Using powerful [system call capture](https://sysdig.com/blog/fascinating-world-linux-system-calls/) technology originally built by Sysdig. Falco lets you continuously monitor and detect container, application, host, and network activity, all in one place, from one source of data, with one set of [rules](rules).

### What kind of behaviors can Falco detect?

Falco can detect and alert on any behavior that involves making [Linux system calls](http://man7.org/linux/man-pages/man2/syscalls.2.html). Falco alerts can be triggered by the use of specific system calls, their arguments, and by properties of the calling process. For example, you can easily detect when:

* A shell is run inside a container
* A server process spawns a child process of an unexpected type
* A sensitive file, like `/etc/shadow`, is unexpectedly read
* A non-device file is written to `/dev`
* A standard system binary (like `ls`) makes an outbound network connection

## How Falco compares to other tools

People often ask how Falco differs from [SELinux](https://en.wikipedia.org/wiki/Security-Enhanced_Linux), [AppArmor](https://wiki.ubuntu.com/AppArmor), [Auditd](https://linux.die.net/man/8/auditd), and other tools related to Linux security policy. We wrote a [blog post](https://sysdig.com/blog/selinux-seccomp-falco-technical-discussion/) on the [Sysdig blog](https://sysdig.com/blog) comparing Falco to other tools.

## How to use Falco

Falco is deployed as a long-running daemon. You can install it as a [Debian](installation#debian)/[rpm](installation#rhel) package on a regular host or container host, you can deploy it as a [container](installation#docker), or you can build it [from source](source).

Falco is configured via (1) a [rules file](rules) that defines which behaviors and events to watch for and (2) a [general configuration file](configuration). Rules are expressed in a high-level, human-readable language. We've provided a sample rules file [`./rules/falco_rules.yaml`](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml) as a starting point—you can (and will likely want!) to adapt it to your environment.

When developing rules, one helpful feature is Falco's ability to read trace files saved by the `scap` format. This allows you to "record" the offending behavior once and replay it with Falco as many times as needed while tweaking your rules.

Once deployed, Falco uses the kernel modules and eBPF probes to bring events to userspace. Falco watches for any events matching one of the conditions defined in the rule file. If a matching event occurs, a notification is written to the the configured output(s).

## Falco alerts

When Falco detects suspicious behavior, it sends [alerts](alerts) via one or more channels:

* Writing to standard error
* Writing to a file
* Writing to syslog
* Pipe to a spawned program. A common use of this output type would be to send an email for every Falco notification.
