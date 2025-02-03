---
title: Falcosidekick 2.31.0
linktitle: Falcosidekick 2.31.0
author: Thomas Labarussias
date: 2025-02-04
slug: falcosidekick-2-31-0
images:
  - /blog/falcosidekick-2-31-0/images/falcosidekick-featured.png
tags: ["Falcosidekick","Release"]
---

The year 2025 is well started now. We saw a few days ago [the first release of Falco for the year](/blog/falco-0-40-0/). It's to let fly out a new version of Falcosidekick, the 2.31.0.

## New output

This release comes with a new output only, the last pillar of the observability with [OpenTelemetry].(https://opentelemetry.io/) that missing in Falcosidekick.

### OTLP Metrics

You can now forward the Falco Events to the OpenTelemetery collector or any received understanding the protocol.

## New features

Here's a non exhaustive list of the great features and enhancements which come with this new release:

### Better logger

It was a ToDo for a while (even years), but it's now completed. The log system used by Falcosidekick has been replaced, without any breaking change for the users, but opening the door to more enhancements in the future.

### More default labels for Loki

The log lines forwarded to `Loki` contain now by default the source namespace and pod name, if present in the alert. It will allow to filter more easily the events you want to display in your dashboards. Thanks to [@afreyermuth98](https://github.com/afreyermuth98).

### Payload format for Loki

Some users asked for the possibility to forward the Falco alerts in their JSON format to `Loki`. You can now use the setting `loki.format` for.

### NATS/STAN subject

The template for the subject where to push the messages for `NATS`/`STAN` was hardcoded, it can now be overridden with `nats/stan.subjecttemplate`. See the [example config file](https://github.com/falcosecurity/falcosidekick/blob/5af88e588a263d3b4ca20f8f13650369111cb249/config_example.yaml#L167). 

## Fixes

- Fix the missing templated fields as labels in `Loki` payload ([PR#1091](https://github.com/falcosecurity/falcosidekick/pull/1091))
- Fix the creation error of a `ClusterPolicyReport` ([PR#1100](https://github.com/falcosecurity/falcosidekick/pull/100))
- Fix the missing custom headers for HTTP requests for `Loki` ([PR#1107](https://github.com/falcosecurity/falcosidekick/pull/1107) thanks to [@lsroe](https://github.com/lsroe))
- Fix the wrong key format of custom fields for `Prometheus` ([PR#1110](https://github.com/falcosecurity/falcosidekick/pull/1110) thanks to [@rubensf](https://github.com/rubensf))

## Conclusion

You can find the full changelog [here](https://github.com/falcosecurity/falcosidekick/releases/tag/2.31.0).

The respective Helm charts are already updated and allow you to test by yourself all these great new features. Just issue the `helm repo update; helm upgrade --reuse-values -n falco` command to do so.

Once again, thanks to all the adopters and contributors who helped and contributed to this project all these years. We would never have reached this success without you.

---
* Get started in [Falco.org](http://falco.org/)
* Check out the [Falcosidekick project on GitHub](https://github.com/falcosecurity/falcosidekick).
* Check out the [Falco Talon project docs](https://docs.falco-talon.org).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).
