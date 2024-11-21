---
title: Introducing Falco 0.39.2
date: 2024-11-21
author: Federico Di Pierro
slug: falco-0-39-2
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.39.2** 🦅!

## Fixes

Falco's 0.39.2 is a small patch release that includes some important bugfixes for modern eBPF driver:

* check `cred` field is not NULL before the access; this enables Falco back with modern eBPF driver to work on GKE
* address verifier issues on kernel versions `>=6.11.4`: there was a kernel-breaking change in the tail call ebpf API merged into the 6.11.4 to fix a [CVE](https://access.redhat.com/security/cve/cve-2024-50063). Adapt our code to work again on these new versions.

Thanks to everyone in the community for helping us spot these annoying bugs and improving Falco every day 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.39.2**, you can install its packages following the process outlined in the docs:

* [CentOS/Amazon Linux](https://falco.org/docs/setup/packages/#install-with-yum)
* [Debian/Ubuntu](https://falco.org/docs/setup/packages/#install-with-apt)
* [openSUSE](https://falco.org/docs/setup/packages/#install-with-zypper)
* [Linux binary package](https://falco.org/docs/setup/tarball/)

Prefer to use a container image? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/setup/container/).

You can also find the Falcosecurity container images on the public AWS ECR gallery:

* [falco](https://gallery.ecr.aws/falcosecurity/falco)
* [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
* [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## Let's meet 🤝

We meet every Wednesday in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest, you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Enjoy 😎,

_Federico_
