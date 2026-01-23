---
title: gRPC API
linktitle: gRPC API
description: Enable and configure the gRPC capabilities of Falco
aliases:
- ../grpc
weight: 70
---

{{% pageinfo color=warning %}}

The gRPC Output as well as the embedded gRPC server have been deprecated in Falco `0.43.0` and will be removed in a
future release. Until removal and since Falco `0.43.0`, using any of them will result in a warning informing the user
about the deprecation. Users are encouraged to leverage another output and/or Falcosidekick, as the usage will result
in an error after the removal.

{{% /pageinfo %}}

Starting from version [0.18.0](https://github.com/falcosecurity/falco/releases/tag/0.18.0), Falco has its own {{< glossary_tooltip text="gRPC" term_id="grpc" >}} server which provides a set of gRPC APIs.

The current APIs are:

- [schema definition](/docs/developer-guide/grpc/outputs): get or subscribe to Falco output events.
- [schema definition](/docs/developer-guide/grpc/version): retrieve the Falco version.

In order to interact with these APIs, the The Falco Project provides a [Golang SDK](/docs/developer-guide/grpc/client-go/).
