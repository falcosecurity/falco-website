---
title: gRPC API
linktitle: gRPC API
description: Enable and configure the gRPC capabilities of Falco
weight: 70
---

Starting from version [0.18.0](https://github.com/falcosecurity/falco/releases/tag/0.18.0), Falco has its own {{< glossary_tooltip text="gRPC" term_id="grpc" >}} server which provides a set of gRPC APIs.

The current APIs are:

- [schema definition](outputs): get or subscribe to Falco output events.
- [schema definition](version): retrieve the Falco version.

In order to interact with these APIs, the falcosecurity organization provides some clients/SDKs:

- [client-go](./client-go)
- [client-py](./client-py)
- [client-rs](https://github.com/falcosecurity/client-rs)
