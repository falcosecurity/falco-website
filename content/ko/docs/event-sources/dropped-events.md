---
title: Actions For Dropped System Call Events
weight: 3
---
# Introduction

With the enhancements introduced in v0.15.0, Falco can now intelligently detect dropped system call events and take remedial actions, such as alerting or even exiting Falco entirely. When system call events are dropped, Falco might encounter problems building its internal view of the processes, files, containers, and orchestrator metadata in use, which in turn might affect the rules that depend on that metadata. The explicit signals that Falco now provides make it easier to detect dropped system calls.

For more information on this feature, see our blog post on [CVE-2019-8339](https://sysdig.com/blog/cve-2019-8339-falco-vulnerability/).


## Implementation

Every second, Falco reads system call event counts that are populated by the kernel module/eBPF program. The reading includes the number of system calls processed, and most importantly, the number of times the kernel tried to write system call information to the shared buffer between the kernel and user space, but found the buffer was full. These failed write attempts are considered *dropped* system call events.

When at least one dropped event is detected, Falco takes one of the following actions:

* `ignore`: no action is taken. If an empty list is provided, ignore is assumed.
* `log`: log a CRITICAL message noting that the buffer was full.
* `alert`: emit a Falco alert stating that the buffer was full.
* `exit`: exit Falco with a non-zero rc.

Given below are a sample log message, an alert, and an exit message:

```
Wed Mar 27 15:28:22 2019: Falco initialized with configuration file /etc/falco/falco.yaml
Wed Mar 27 15:28:22 2019: Loading rules from file /etc/falco/falco_rules.yaml:
Wed Mar 27 15:28:24 2019: Falco internal: syscall event drop. 1 system calls dropped in last second.
15:28:24.000207862: Critical Falco internal: syscall event drop. 1 system calls dropped in last second.(n_drops=1 n_evts=1181)
Wed Mar 27 15:28:24 2019: Falco internal: syscall event drop. 1 system calls dropped in last second.
Wed Mar 27 15:28:24 2019: Exiting.
```

## Actions Rate Throttling

To reduce the likelihood of a flood of log messages/alerts, a token bucket is provided to govern the actions. The default parameter of the token bucket is the rate of one alert per 30 seconds with an allowed burst of up to 10 messages.

## Configuration

The actions to take on a dropped system call event and the throttling parameters for the token bucket are configurable in `falco.yaml` and are described in [syscall_event_drops](../../configuration).
