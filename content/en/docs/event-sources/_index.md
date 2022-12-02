---
title: Event Sources
linktitle: Event Sources
description: Leverage multiple Event Sources to increase the power of Falco
weight: 60
---

Falco is able to consume streams of events and evaluate them against a set of security rules to detect abnormal behavior. Events are consumed through different event sources, which define the origin, nature, and format of the streamed events.

Falco natively supports the `syscall` event source, through which it is able to consume events coming from the Linux Kernel by instrumenting it with the [drivers](./drivers). 

Since [Falco 0.31](/blog/falco-0-31-0.md) and the introduction of the [Plugin System](/docs/plugins), additional event sources can serve as input for Falco. Those event sources are provided by plugins implementing the [event sourcing capability](/docs/plugins#event-sourcing-capability). 

Examples of event source defined by offically-supported plugins are:

* [Kubernetes Audit Events](/docs/event-sources/kubernetes-audit/)
* [AWS CloudTrail](/docs/event-sources/cloudtrail/)
* [Okta](/docs/event-sources/okta/)

In addition to these plugins hosted by the Falcosecurity organization, others have written third-party [plugins](https://github.com/falcosecurity/plugins#readme) that support additional event sources. Please refer to the [official Plugin Registry](https://github.com/falcosecurity/plugins/blob/master/registry.yaml) for the most up-to-date information regarding the Falco plugins acknowledged by the community.