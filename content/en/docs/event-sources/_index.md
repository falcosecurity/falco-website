---
title: Event Sources
weight: 60
---

Falco can consume events from a variety of different sources and apply rules to these events to detect abnormal behavior.

Falco natively supports the System Call event source (`syscall`) via the [drivers](./drivers). Since [Falco 0.31](../../blog/falco-0-31-0.md), Falco also supports additional event sources through the [Plugin System](../plugins):

* [Kubernetes Audit Events](./kubernetes-audit)
* [AWS CloudTrail](./cloudtrail)
* [Okta](./okta)

In addition to these plugins hosted by the Falcosecurity organization, others have written third-party [plugins](https://github.com/falcosecurity/plugins#readme) that support additional event sources. Please refer to the [official Plugin Registry](https://github.com/falcosecurity/plugins/blob/master/registry.yaml) for the most up-to-date information regarding the Falco plugins acknowledged by the community.
