---
title: Actions For Dropped System Call Events
weight: 3
---
# Introduction

For more info on this feature, please read our blog post on [CVE-2019-8339](https://sysdig.com/blog/cve-2019-8339-falco-vulnerability/).

A new feature in 0.15.0 allows Falco to take actions when it detects dropped system call events. When system call events are dropped, Falco may have problems building its internal view of the processes, files, containers, and orchestrator metadata in use, which in turn may affect rules that depend on that metadata. These actions make it easier to detect when dropped system calls are occurring.

## Implementation

Every second, Falco reads system call event counts that are populated by the kernel module/ebpf program. These include counts of the number of system calls processed, and most importantly, the number of times the kernel tried to write system call information to the shared buffer between kernel and userspace but found the buffer to be full. These are considered *dropped* system call events.

When at least one dropped event is detected, Falco can take any of the following actions:

* "ignore": do nothing. If an empty list is provided, ignore is assumed.
* "log": log a CRITICAL message noting that the buffer was full.
* "alert": emit a falco alert noting that the buffer was full.
* "exit": exit falco with a non-zero rc.

Here's an sample log message, alert, and exit message:

```
Wed Mar 27 15:28:22 2019: Falco initialized with configuration file /etc/falco/falco.yaml
Wed Mar 27 15:28:22 2019: Loading rules from file /etc/falco/falco_rules.yaml:
Wed Mar 27 15:28:24 2019: Falco internal: syscall event drop. 1 system calls dropped in last second.
15:28:24.000207862: Critical Falco internal: syscall event drop. 1 system calls dropped in last second.(n_drops=1 n_evts=1181)
Wed Mar 27 15:28:24 2019: Falco internal: syscall event drop. 1 system calls dropped in last second.
Wed Mar 27 15:28:24 2019: Exiting.
```

## Actions Rate Throttling

To reduce the likelihood of a flood of log messages/alerts, actions are governed by a token bucket. The default parameters of the token bucket are a rate of one alert per 30 seconds with an allowed burst of up to 10 messages.

## Configuration

The actions to take on a dropped syscall event and the throttling parameters for the token bucket are configurable in `falco.yaml` and described [here](/docs/configuration/#syscall_event_drops).