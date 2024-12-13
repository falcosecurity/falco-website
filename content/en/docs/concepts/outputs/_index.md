---
title: Falco Outputs
description: Work with Falco Outputs and send Falco Alerts in your desired platform
linktitle: Outputs
aliases:
- ../alerts
- ../outputs
weight: 20
---

Falco can send alerts to one or more output channels:

* Standard Output
* A file
* Syslog
* A spawned program
* An HTTP/HTTPS endpoint
* A client via the gRPC API

The channels are configured via the Falco configuration file `falco.yaml`. See the [Falco Configuration](/docs/reference/daemon/config-options/) page for more details.

Find further information about how to configure each of those channels under [Output Channels](/docs/outputs/channels/).

## Integration with third parties

Falco alerts can easily be forwarded to third-party systems like off-host SIEM, databases, or Faas. While many tools can natively connect to the generic outputs channels that Falco provides such as files and standrd output, a forwarder proxy, [Falcosidekick](/docs/outputs/forwarding), was created to facilitate integration with more than 50 different systems.
