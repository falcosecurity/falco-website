---
title: Getting Started
description: Getting started with Falco
weight: 10
---
 
Falco is a cloud-native security tool. It provides near real-time threat detection for cloud, container, and Kubernetes workloads by leveraging runtime insights. Falco can monitor events from various sources, including the Linux kernel, and enrich them with metadata from the Kubernetes API server, container runtime, and more.

Once Falco has received these events, it compares them to a set of {{< glossary_tooltip text="rules" term_id="rules" >}} to determine if the actions being performed need further investigation. If they do, Falco can forward the {{< glossary_tooltip text="output" term_id="outputs" >}} to multiple different endpoints either natively (syslog, stdout, HTTPS, and gRPC endpoints) or with the help of [Falcosidekick](https://github.com/falcosecurity/falcosidekick), a companion tool that offers integrations to several different applications and services. 

## Falco Architecture

  Falco operates in both kernel and user space. In kernel space, Linux system calls ({{< glossary_tooltip text="syscalls" term_id="syscalls" >}}) are collected by a {{< glossary_tooltip text="driver" term_id="drivers" >}}, for example, the Falco kernel module or Falco eBPF probe. Next, syscalls are placed in a {{< glossary_tooltip text="ring buffer" term_id="ring-buffer" >}} from which they are moved into user space for processing. The events are filtered using a rules engine with a Falco rule set. Falco ships with a default set of rules, but operators can modify or turn off those rules and add their own. If Falco detects any suspicious events those are forwarded to various endpoints.

![Falco Architecture](images/falco-architecture-v2.png)

## Next Steps   

A great next step would be to try Falco yourself. The quickstart below walks through how to get Falco running on a Linux host, create a suspicious event, and then check the Falco output. 

