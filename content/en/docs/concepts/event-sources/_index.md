---
title: Event Sources
description: Leverage multiple Event Sources to increase the power of Falco
linktitle: Event Sources
weight: 10
aliases:
- ../event-sources
- ../event-sources/enable-event-sources
---
## Overview

Falco evaluates streams of events against security rules to detect abnormal behavior. Events are consumed through various event sources, which define the origin, nature, and format of the streamed events.

Falco natively supports the `syscall` event source, which is enabled by default, consuming events from the Linux Kernel via drivers. The [plugin system](/docs/event-sources/plugins/) allows Falco to extend its capabilities with new event sources.

### How It Works

Each event source operates in an isolated thread, where events are generated, consumed, and evaluated by Falco’s rule engine. Rules are partitioned by event source, meaning each rule applies to a specific source and is triggered exclusively by events from that source. Falco does not support correlating events from different sources.

By default, Falco enables event collection from all known sources, including `syscall` and other data sources added through plugins. The behavior can be customized using Falco's configuration.

## Configuring Event Sources

Before enabling or disabling specific event sources, you must configure the Falco engine and/or plugins as required by your use case:

- **Engine:** For [drivers](/docs/concepts/event-sources/kernel/), [gVisor](/docs/concepts/event-sources/gvisor/) or capture files. 
- **Plugins:** Ensure plugins are loaded properly by following the [plugin usage guide](https://falco.org/docs/plugins/usage/#loading-plugins-in-falco).

## Managing Event Sources

Falco provides flexibility in enabling or disabling event sources to suit different use cases. This can be controlled using the `--enable-source` and `--disable-source` CLI options.

By default, Falco enables all configured event sources, including the built-in `syscall` source. To customize this behavior, use the `--enable-source` option to enable specific sources, or the `--disable-source` option to disable unwanted ones, including `syscall`. For plugin-based deployments, disable `syscall` explicitly or enable only the desired plugin-based sources. This flexibility allows you to tailor Falco's event monitoring to your needs efficiently.

### Using `--enable-source`

Enables specific event sources, overriding the default behavior of enabling all sources.

- Use this option multiple times to enable multiple sources.
- Any source not explicitly listed is disabled.

**Example:**

```bash
falco --enable-source=syscall --enable-source=k8s_audit
```

This example enables only the `syscall` and `k8s_audit` sources. The `syscall` source is built into Falco and always enabled by default. In contrast, the `k8s_audit` source is provided by the `k8saudit` plugin, which must be properly configured in Falco beforehand. Before using this command, ensure that the `k8saudit` plugin has been properly configured in Falco.

### Using `--disable-source`

Disables specific event sources while keeping others active. This is useful if you want to prevent Falco from consuming events from certain sources.

- Use this option multiple times to disable multiple sources.
- Attempting to disable unknown sources or all sources results in an error.

**Example:**

```bash
falco --disable-source=syscall --disable-source=k8s_audit
```

This example demonstrates how to disable the `syscall` and `k8s_audit` sources. The `syscall` source is built into Falco and enabled by default, while the `k8s_audit` source is provided by the `k8saudit` plugin. Before using this command, ensure that the `k8saudit` plugin has been properly configured in Falco. Disabling sources can help tailor event monitoring to specific needs.

Similarly, to enable specific event sources and override the default behavior of enabling all sources, use the `--enable-source` option. For example, enabling only `syscall` and `k8s_audit` can be done as shown below:

**Example:**

```bash
falco --enable-source=syscall --enable-source=k8s_audit
```

This enables only the `syscall` and `k8s_audit` sources.

### Using Plugins for the `syscall` Source

Plugins can produce system events similar to [Falco Drivers](/docs/concepts/event-sources/kernel/).

By default, Falco uses a configured driver for the syscall source unless explicitly instructed otherwise. To use a plugin for the `syscall` source instead of a driver:

1. Load the plugin via Falco’s configuration.
2. Use the `-o engine.kind=nodriver` option.
