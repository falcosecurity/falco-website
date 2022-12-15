---
title: Falco Plugins
linktitle: Falco Plugins
description: Extend Falco functionality using Plugins for Falco libraries/Falco daemon
weight: 50
---

The Falco libraries and Falco itself can be extended by using *Plugins*. Plugins are shared libraries that conform to a documented API and allow for:

- Adding new event sources that can be evaluated using filtering expressions/Falco rules.
- Adding the ability to define new fields that can extract information from events.

This section describes how plugins fit into the existing event processing pipeline and how to enable/configure plugins in Falco.

{{% alert color=primary %}}
If you're interested in how this feature came about, you can view the [original proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20210501-plugin-system.md) for the plugin system.
{{% /alert %}}
