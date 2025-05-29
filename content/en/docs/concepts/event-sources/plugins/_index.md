---
title: Plugin Events
description: 'Events related to the Plugin system.'
linktitle: Plugin Events
weight: 20
aliases:
- ../../event-sources/plugins
---

Since the introduction of the [Plugin System](/docs/plugins), additional event sources can serve as input for Falco. Those event sources are provided by plugins implementing the [event sourcing capability](/docs/reference/plugins/plugin-api-reference/#event-sourcing-capability-api). 

Examples of event source defined by officially-supported plugins are:

* [Kubernetes Audit Events](/docs/concepts/event-sources/plugins/kubernetes-audit)
* [AWS CloudTrail](/docs/concepts/event-sources/plugins/cloudtrail)
* [Okta](/docs/concepts/event-sources/plugins/okta)

In addition to these plugins hosted by the Falcosecurity organization, others have written third-party [plugins](https://github.com/falcosecurity/plugins#readme) that support additional event sources. Please refer to the [official Plugin Registry](https://github.com/falcosecurity/plugins/blob/master/registry.yaml) for the most up-to-date information regarding the Falco plugins acknowledged by the community.

At the implementation level, the plugin system sends events to Falco using the same protocol that is used for syscalls, but the encoding and decoding of the payload is performed by the plugin itself according to its own data format representation. Every plugin exposes the necessary functionality to seamlessly integrate its events with Falco.
