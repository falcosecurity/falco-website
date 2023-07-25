---
title: Getting Started
description: Getting started with Falco
weight: 10
---

## What is Falco
 
 Falco, a CNCF incubating project, provides near real-time threat detection for cloud, container, and Kubernetes workloads by leveraging runtime insights. Falco is able to monitor events from a variety of sources including the Linux kernel, Kubernete API server, container runtime, and more. 
 
 Once Falco has received these events it compares them to a set of rules to determine if the actions being taken need further investigation. If they do Falco can forward the output to multiple different endpoints either natively (syslog, stdout, HTTPS and gRPC endpoints) or with the help of Falco Sidekick, and companion tool that offers integrations to several different applications and services. 

## Falco Architecture

  Falco operates in both kernel and user space. In kernel space Linux system calls (syscalls) are interpreted by either the Falco kernel module or Falco eBPF probe. Next, syscalls are placed in a ring buffer from which they are moved into user space for processing. The events are filtered using a rules engine which includes a set of Falco rules. Falco ships with a default set of rules, but operators have the option to modify or disable those rules as well as add their own. If Falco detects any suspcious  events those are forwarded to various endpoints. 

![Falco Architecture](/docs/images/falco_architecture.png)

## Next Steps   

A great next step would be to try Falco yourself. The quickstart below walks through how to get Falco running on a Linux host, create an suspicious event, and then check the Falco output. 