---
title: Event Sources
weight: 60
---

Falco is able to consume streams of events and evaluate them agains a set of security rules to detect abnormal behavior. Events can be consumed by various event sources, which defined the origin, nature, and format of the streamed events.

Falco natively supports the `syscall` event source, through which is able to consume events coming from the Linux Kernel by instrumenting it with the [drivers](./drivers). Since [Falco 0.31](/blog/falco-0-31-0.md) and the introduction of the [Plugin System](/docs/plugins), Falco can be configured to support additional event sources defined by plugins implementing [the event sourcing capability](/docs/plugins#event-sourcing-capability). Examples of event source defined by offically-supported are:

* [Kubernetes Audit Events](./kubernetes-audit)
* [AWS CloudTrail](./cloudtrail)
* [Okta](./okta)

In addition to these plugins hosted by the Falcosecurity organization, others have written third-party [plugins](https://github.com/falcosecurity/plugins#readme) that support additional event sources. Please refer to the [official Plugin Registry](https://github.com/falcosecurity/plugins/blob/master/registry.yaml) for the most up-to-date information regarding the Falco plugins acknowledged by the community.

## Configuring Event Sources

Historically, Falco supported consuming events coming from one event source only. This means that in order to consume events from more than one event source users needed to deploy many distinct instances of Falco, each one configured with a different source. The only exception was the legacy implementation of the [Kubernetes Audit Events](./kubernetes-audit) which allowed receiving events from the `k8s_audit` event sources in parallel with the `syscall` one, however it was non-standardized and substituted in favor of a [plugin-based porting](https://github.com/falcosecurity/plugins/blob/master/plugins/k8saudit/README.md) starting from [Falco 0.32.0](/blog/falco-0-32-0.md). Since [version 0.33.0](/blog/falco-0-33-0.md), Falco introduced a standard **support for consuming events from multiple event sources** running in parallel within the same Falco instance. You can check the design principles and rationale of this feature at [falcosecurity/falco/issues/2074](https://github.com/falcosecurity/falco/issues/2074).

The default behavior of Falco is to enable event collection from all the event sources it knows. The set of known event sources  includes the `syscall` one by default, plus all other source defined by [plugins with event sourcing capability](/docs/plugins#event-sourcing-capability) loaded through [Falco's configuration](/docs/configuration/). Each of the enabled event sources causes Falco to start a new ad-hoc isolated thread through which events for a single source are generated, consumed, and evaluated through security rules. In each isolated thread, events are still processed sequentially one-by-one.

Falco guarantees feature parity between running multiple event sources in the same Falco instance, and running the same set of event sources each in a separate single-source instance of Falco. As such, when running more than one event source Falco **does not allow any correlation logic** between events coming from different event sources. In fact, the set of security rules loaded in Falco is entirely partitioned by event source. From the perspective of the Falco rule engine, each security rule is defined for one and only event source and can uniquely be triggered by events coming from it.

The set of enabled event sources can be changed through the `--enable-source` and `--disable-source` [CLI options](/docs/getting-started/running/arguments/). The two can't be mixed together, and follow this logic:

* `--disable-source`: Disables one single event source among the set of enabled ones. This assumes Falco's default behavior of enabling every loaded event source. Can be passed multiple times to disable multiple event sources. For example, passing `--disable-source=syscall --disable-source=k8s_saudit` as Falco CLI argument will disable live event consumption for the `syscall` and the `k8s_audit` event sources. Disabling unknown event sources, or disabling all the loaded ones, results in an error.
* `--enables-source`: Enables one single event source among the set of loaded ones. This disables Falco's default behavior, and makes it consider every loaded source as disabled by default in order to enable each of them selectively. Can be passed multiple times to enable multiple event sources. For example, passing `--enable-source=syscall --enable-source=k8s_saudit` as Falco CLI argument will enable live event consumption for the `syscall` and the `k8s_audit` event sources only, even if others are loaded. Enabling unknown event sources results in an error.

**Note**: Dealing with the `syscall` event source requires extra attention. Since `syscall` is always loaded by Falco out of the box, single-plugin-only deployments (e.g. a Falco instance configured for consuming only [AWS CloudTrail](./cloudtrail) events) require specifying `--disable-source=syscall` (or alternatively `--enable-source=<plugin_soure_name>`). On the other hand, this also means that passing `--enable-source=syscall` has no effect if Falco is not configured with any plugin with event sourcing capability.

Offline captures based on trace files are not affected by this logic. In that case, Falco is capable of processing events coming from different event sources out of the box with no additional configuration.