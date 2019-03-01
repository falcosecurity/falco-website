---
title: Documentation
description: An overview of the Falco container security system
short: Docs home
weight: 1
---

## About Falco

Falco is a behavioral activity monitor designed to detect anomalous activity in your applications. Powered by sysdig’s system call capture infrastructure, Falco lets you continuously monitor and detect container, application, host, and network activity... all in one place, from one source of data, with one set of rules.

### What kind of behaviors can Falco detect?

Falco can detect and alert on any behavior that involves making Linux system calls. Falco alerts can be triggered by the use of specific system calls, their arguments, and by properties of the calling process. For example, you can easily detect things like:

* A shell is run inside a container
* A server process spawns a child process of an unexpected type
* Unexpected read of a sensitive file (like `/etc/shadow`)
* A non-device file is written to `/dev`
* A standard system binary (like `ls`) makes an outbound network connection

## How Falco Compares to Other Security Tools like SELinux, Auditd, etc.

One of the questions we often get when we talk about Falco is “How does it compare to other tools like SELinux, AppArmor, Auditd, etc. that also have security policies?”. We wrote a [blog post](https://sysdig.com/blog/selinux-seccomp-falco-technical-discussion/) comparing Falco to other tools.

## How you use it

Falco is deployed as a long-running daemon. You can install it as a debian/rpm package on a regular host or container host, or you can deploy it as a container.

Falco is configured via a rules file defining the behaviors and events to watch for, and a general configuration file. Rules are expressed in a high-level, human-readable language. We've provided a sample rule file `./rules/falco_rules.yaml` as a starting point - you can (and will likely want!) to adapt it to your environment.

When developing rules, one helpful feature is falco's ability to read trace files saved by sysdig. This allows you to "record" the offending behavior once, and replay it with falco as many times as needed while tweaking your rules.

Once deployed, Falco uses the Sysdig kernel module and userspace libraries to watch for any events matching one of the conditions defined in the rule file. If a matching event occurs, a notification is written to the the configured output(s).

## Falco alerts

When Falco detects suspicious behavior, it sends alerts via one or more of the following channels:

* Writing to standard error
* Writing to a file
* Writing to syslog
* Pipe to a spawned program. A common use of this output type would be to send an email for every falco notification.

More details on these alerts are described [here](alerts).
