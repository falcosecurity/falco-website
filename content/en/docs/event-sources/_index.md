---
title: Event Sources
weight: 5
---

Falco can consume events from a variety of different sources and apply rules to these events to detect abnormal behavior.

Currently, Falco supports the following built-in event sources:

* System Calls (syscall) via the [drivers](./drivers)
* [Kubernetes Audit Events](./kubernetes-audit) (k8s_audit)

Falco also supports the following event sources via officially supported [plugins](../plugins):

* [AWS Cloudtrail](./cloudtrail)
* [Okta](./okta)

In addition to these event sources, others have written third-party [plugins](https://github.com/falcosecurity/plugins#readme) that support additional event sources.
