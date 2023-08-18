---
title: Event Sources
linktitle: Event Sources
description: Leverage multiple Event Sources to increase the power of Falco
weight: 60
---

Falco is able to consume streams of events and evaluate them against a set of security rules to detect abnormal behavior. Events are consumed through different event sources, which define the origin, nature, and format of the streamed events.

Falco natively supports the `syscall` event source, through which it is able to consume events coming from the Linux Kernel by instrumenting it with the [drivers](/docs/event-sources/drivers). 

Since [Falco 0.31](/blog/falco-0-31-0/) events can also come through the [plugin system](/docs/event-sources/plugins/) which allows adopters and contributors to extend Falco's capabilities with new events.
