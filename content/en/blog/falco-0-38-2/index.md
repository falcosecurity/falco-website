---
title: Introducing Falco 0.38.2
date: 2024-08-19
author: Luca Guerra
slug: falco-0-38-2
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.38.2** 🦅!

## Fixes

Falco's 0.38.2 is a patch release that includes the most important bugfixes addressed this summer ☀️:

* Fixed a crash when using transformer operators (e.g. `tolower()`) with a parameter that evaluates to an empty string
* Fixed a bug and a regression that could result in incorrect comparison between ipv4 addresses and ipv6 subnets and vice versa
* Fixed an [issue](https://github.com/falcosecurity/falco/issues/3286) that could result in missing exe_upper_layer flag
* Fixed kernel module build for Linux 6.10
* Fixed a [bug](https://github.com/falcosecurity/falco/issues/3276) that may result in kernel module crashes on recent versions of RHEL 9
* Added additional logging to better troubleshoot hard to reproduce issues like "could not parse param ... for event ... of type ...: expected length X, found Y"

This patch also introduces a small change with the format of the new experimental Prometheus metrics to make them easier to use. Metrics are now distinguished by the `file_name` or `rule_name` labels, in line with Prometheus best practices and supporting groupBy queries.

Thanks to everyone in the community for helping us with spotting these annoying bugs and improving Falco every day 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.38.2**, you can install its packages following the process outlined in the docs:

* [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
* [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
* [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Prefer to use a container image? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

You can also find the Falcosecurity container images on the public AWS ECR gallery:

* [falco](https://gallery.ecr.aws/falcosecurity/falco)
* [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
* [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## Let's meet 🤝

We meet every Wednesday in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Enjoy 😎,

_Luca_
