---
title: Falco Alerts
description: Integrate Falco and send Falco Alerts in your desired platform
linktitle: Falco Alerts
weight: 80
---

Falco can send alerts to one or more channels:

* Standard Output
* A file
* Syslog
* A spawned program
* A HTTP/HTTPS endpoint
* A client via the gRPC API

The channels are configured via the falco configuration file `falco.yaml`. See the [Falco Configuration](../configuration) page for more details. 

Find further information about how to configure each of those channels under [Alert Channels](/docs/alerts/channels/).