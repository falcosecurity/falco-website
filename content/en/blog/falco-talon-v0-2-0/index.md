---
title: Falco Talon v0.2.0
date: 2024-11-27
author: Igor Eulalio
slug: falco-talon-v0-2-0
images:
  - /blog/falco-talon-v0-2-0/images/falco-talon-featured.png
tags: ["Talon", "Release"]
---

Today we announce the release of **Falco Talon 0.2.0** 🦅!

Falco Talon 0.2.0 is a minor release that includes new actionners and outputs, add parameters to existing actionners, along one small fix on the check and print commands.

## Features

* Add `gcp:function` actionner:
  - Now users can call GCP function to automate GCP tasks, with authentication and authorization out of the box.
![gcp-function](/blog/falco-talon-v0-2-0/images/falco-talon-v0-2-0-1.png)
* Add `gcp:gcs` output
  - Now users can send output directly to GCP Google Cloud Storage, same way as s3 and minio existing outputs.
![gcp-gcs](/blog/falco-talon-v0-2-0/images/falco-talon-v0-2-0-2.png)
* Add `ignore_standalone_pods` parameter for `kubernetes:terminate` actionner
* Allow to wait until the completion of `kubernetes:drain` by configuring `max_wait_period` and `wait_period_excluded_namespaces`
* Use smaller image for the `kubernetes:tcpdump` actionner

## Fixes

* Allow to `check` and `print` commands to work without specifying a `config.yaml`

## Try it! 🏎️

In case you just want to try out the **Falco Talon 0.2.0**, you can install the helm chart following the instructions on the [`documentation`](https://docs.falco-talon.org/docs/installation_usage/helm/)

## Let's meet 🤝

We meet every Wednesday in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest, you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Enjoy 😎,

_Igor_
