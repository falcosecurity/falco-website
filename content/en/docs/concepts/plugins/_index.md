---
title: Falco Plugins
linktitle: Plugins
description: Extend Falco functionality using Plugins
weight: 40
aliases:
- ../plugins
---

The Falco libraries and Falco itself can be extended by using *Plugins*. Plugins are shared libraries that conform to a documented API, hooking into the core functionalities of Falco to allow things such as:

- Adding new event sources that can be evaluated using filtering expressions/Falco rules.
- Adding the ability to define new fields that can extract information from events.
- Parsing the content of all the events captured in a data stream.
- Injecting events asynchronously in a given data stream.

This section describes how plugins fit into the existing event processing pipeline and how to enable/configure plugins in Falco.
