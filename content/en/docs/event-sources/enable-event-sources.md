---
title: Enabling Event Sources
description: Control the input of Falco enabling and disabling Event Sources
linktitle: Enabling Event Sources
weight: 10
---

Historically, Falco supported consuming events coming from one event source only. This means that to consume events from more than one event source, users needed to deploy many instances of Falco, each configured with a different source. 

The only exception was the legacy implementation of the [Kubernetes Audit Events](./kubernetes-audit), which allowed receiving events from the `k8s_audit` event sources in parallel with the `syscall` one. However, it wasn't standardized and has been substituted in favor of a [plugin-based porting](https://github.com/falcosecurity/plugins/blob/master/plugins/k8saudit/README.md) starting from [Falco 0.32.0](/blog/falco-0-32-0.md). 

Since [version 0.33.0](/blog/falco-0-33-0.md), Falco introduced a standard **support for consuming events from multiple event sources** running in parallel within the same Falco instance. You can check this feature's design principles and rationale at [falcosecurity/falco/issues/2074](https://github.com/falcosecurity/falco/issues/2074).

The default behavior of Falco is to enable event collection from all the event sources it knows. The set of known event sources includes the `syscall` one by default, plus any other sources defined by [plugins with event sourcing capability](/docs/plugins/plugin-api-reference/#event-sourcing-capability-api) loaded through [Falco's configuration](/docs/reference/daemon/config-options/). 

Each of the enabled event sources causes Falco to start a new ad-hoc isolated thread through which events for a single source are generated, consumed, and evaluated through security rules. In each isolated thread, events are still processed sequentially one-by-one.

Falco guarantees feature parity between running multiple event sources in the same Falco instance, and running the same set of event sources each in a separate single-source instance of Falco. As such, when running more than one event source Falco **does not allow any correlation logic** between events coming from different event sources. 

In fact, the set of security rules loaded in Falco is entirely partitioned by event source. From the perspective of the Falco rule engine, each security rule is defined for one and only event source and can uniquely be triggered by events coming from it.

The set of enabled event sources can be changed through the `--enable-source` and `--disable-source` [CLI options](/docs/reference/daemon/cli-arguments/).\
The two can't be mixed together and follow this logic:

* **`--disable-source`**

  Disables one single event source among the set of enabled ones. This assumes Falco's default behavior of enabling every loaded event source. Can be passed multiple times to disable multiple event sources.

  For example, passing `--disable-source=syscall --disable-source=k8s_saudit` as Falco CLI argument will disable live event consumption for the `syscall` and the `k8s_audit` event sources. Disabling unknown event sources, or disabling all the loaded ones, results in an error.

* **`--enable-source`**

  Enables one single event source among the set of loaded ones. This disables Falco's default behavior, and makes it consider every loaded source as disabled by default in order to enable each of them selectively. Can be passed multiple times to enable multiple event sources.

  For example, passing `--enable-source=syscall --enable-source=k8s_saudit` as Falco CLI argument will enable live event consumption for the `syscall` and the `k8s_audit` event sources only, even if others are loaded. Enabling unknown event sources results in an error.

{{% alert color="warning" %}}
The `syscall` event source requires a little extra attention. 

Since Falco will always load `syscall` implicitly, single event-source deployments using a plugin (e.g. a Falco instance configured to consume **AWS CloudTrail** events only) will require specifying `--disable-source=syscall`, unless the option `--enable-source=<plugin_source_name>` had been passed explicitly.

Likewise, this also means that passing `--enable-source=syscall` won't have an effect on Falco unless a plugin with event source capability had been already enabled.
{{% /alert %}}

{{% alert title="Offline Captures" color="primary" %}}
Offline captures based on trace files are not affected by this logic. In that case, Falco is capable of processing events coming from different event sources out of the box with no additional configuration.
{{% /alert %}}

### Plugins Implementing the `syscall` Source

Since [version 3.0.0 of the plugin API](/docs/plugins/plugin-api-reference/#plugin-api-versioning), released starting from Falco [0.35.0](/blog/falco-0-35-0/), plugins with event sourcing capability have the possibility of producing system events just like the [Falco Drivers](/docs/event-sources/drivers/). Falco runs plugins of this kind as regular [plugins with event sourcing capability](/docs/plugins/plugin-api-reference/#event-sourcing-capability-api) loaded through [Falco's configuration](/docs/reference/daemon/config-options/), and would interpret their supported event source as `syscall`.

When the `syscall` source is enabled, by default Falco always opens its event stream by leveraging one of the configured Falco Drivers. When a plugin implementing the `syscall` event source is loaded through the Falco configuration, users can specify the `--nodriver` option to instruct Falco about opening the `syscall` event stream by using the plugin instead of the drivers. The `--nodriver` option is used in mutual exclusion with the other driver selection options (e.g. `-g`, `moder-bpf`, etc...).
