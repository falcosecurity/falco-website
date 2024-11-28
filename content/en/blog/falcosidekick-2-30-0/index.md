---
title: Falcosidekick 2.30.0
linktitle: Falcosidekick 2.30.0
author: Thomas Labarussias
date: 2024-12-04
slug: falcosidekick-2-30-0
images:
  - /blog/falcosidekick-2-30-0/images/falcosidekick-featured.png
tags: ["Falcosidekick","Release"]
---

A few days after a new release of [Falco Talon](https://falco.org/blog/falco-talon-v0-2-0/), our response engine, it's time for our favorite proxy forwarder to do the same. 

## New outputs

A new release means new integrations. Thanks to our contributors for their helps.

### Webex

Notify your team on Webex with the integration developed by [@k0rventen](https://github.com/k0rventen).

### OTLP Metrics

The adoption of Open Telemetry is bigger and bigger in the Cloud Native ecosystem, [@ekoops](https://github.com/ekoops) introduced the OTLP Metrics in Falcosidekick.

### Datalog Logs

The Falco alerts can be forwarded to `Datadog` as events for a while in Falcosidekick, you can now use their Logs service thanks to [@yohboy](https://github.com/yohboy).

## New features

Here's a non exhaustive list of the great features and enhancements which come with this new release:

### x3 throughput

[@alekmaus](https://github.com/aleksmaus) spotted a bottleneck with the http client used to forward the events to the outputs. His fix increases up to 300% the throughput!!!

### Better integration with Elasticsearch

[@alekmaus](https://github.com/aleksmaus) worked hard to improve the integration with `Elasticsearch`. In addition improvments for the clients, new settings have been introduced, like the possibility to specify an `ingest pipeline` or an `api key`, to enable `batching` and `compression`. See the [docs](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/elasticsearch.md) to know them all.

### Better consistency for the Prometheus metrics

Falco recently integrated a direct endpoint to expose metrics in the Prometheus format. After a lot of discussions between the maintainers and the community, a convention has been chosen for the names of the metrics. This release adapts the metrics exposed by Falcosidekick to follow this convention and have a consistency accross the different components of the ecosystem.

{{% pageinfo color="warning" %}}
Breaking changes: The renaming of the metrics might impact the   queries for your alerts and dashboards.
{{% /pageinfo %}}

### Multi hosts for AlertManager

You can now specify a list of servers for the `AlertManager` output, which is a requirement when it's deployed in HA mode.

## Fixes

The contributors fixed several bugs, here's a non exhaustive list of the more important ones:
- Fix `PolicyReports` created in the same namespace than the previous event ([PR#978](https://github.com/falcosecurity/falcosidekick/pull/978))
- Fix the missing `customFields/extraFields` in the `Elasticsearch` payload ([PR#1033](https://github.com/falcosecurity/falcosidekick/pull/1033))
- Fix the incorrect key name for `CloudEvent` spec attribute ([PR#1051](https://github.com/falcosecurity/falcosidekick/pull/1051))

## Conclusion

You can find the full changelog [here](https://github.com/falcosecurity/falcosidekick/releases/tag/2.30.0).

The respective Helm charts are already updated and allow you to test by yourself all these great new features. Just issue the `helm repo update; helm upgrade --reuse-values -n falco` command to do so.

Once again, thanks to all the adopters and contributors who helped and contributed to this project all these years. We would never have reached this success without you.

---
* Get started in [Falco.org](http://falco.org/)
* Check out the [Falcosidekick project on GitHub](https://github.com/falcosecurity/falcosidekick).
* Check out the [Falco Talon project docs](https://docs.falco-talon.org).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).
