---
title: Introducing Falco 0.38.1
date: 2024-06-19
author: Federico Di Pierro
slug: falco-0-38-1
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.38.1** 🦅!

## Fixes

Falco's 0.38.1 is a patch release aimed at addressing a few important bugs. It includes the following:

* **A Falco crash while running with plugins and metrics enabled has been solved** (https://github.com/falcosecurity/falco/issues/3229)
* Falco `-p` output format option can be passed to plugin events while `-pc` and `-pk` can only be used for syscall sources (https://github.com/falcosecurity/falco/pull/3239)
* Fixed an issue that could prevent the integer compare operators `<`, `<=`, `>`, `>=` in rules from working properly (https://github.com/falcosecurity/falco/issues/3245)
* Ignore NSS user and group entries while loading users and groups (https://github.com/falcosecurity/libs/pull/1909)
* Issues related to the new metric-related plugins API (https://github.com/falcosecurity/libs/pull/1885). Plugin API was also bumped to 3.6.0.
* Plugin metrics are now enabled in Falco (https://github.com/falcosecurity/falco/pull/3228). Note that plugin must make use of the new metrics-related API to expose metrics.
* Libs were updated to [0.17.2](https://github.com/falcosecurity/libs/releases/tag/0.17.2)

Thanks to everyone in the community for helping us in spotting these annoying bugs 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.38.1**, you can install its packages following the process outlined in the docs:

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

Cheers 🎊

_Federico_
