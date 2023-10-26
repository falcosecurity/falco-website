---
title: Introducing Falco 0.36.2
date: 2023-10-27
author: Federico Di Pierro
slug: falco-0-36-2
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.36.2** 🦅!

## Fixes

Falco's 0.36.2 release is a small patch addressing a few bugs. It includes the following:

* Fixed a possible segfault caused by uninitialized variable in libsinsp::next() method call. (https://github.com/falcosecurity/falco/issues/2878)
* Improved supported program type detection for modern BPF; this ensures we can actually be sure that our BPF program type is unsupported when returning an error to the user. (https://github.com/falcosecurity/libs/pull/1404)
* Fixed a subtle bug in `rawarg` filtercheck for non-string types. (https://github.com/falcosecurity/libs/pull/1428)
* Fixed an uninitialized variable in the libscap bpf engine that lead to `stdin` getting closed while Falco soft restarted. (https://github.com/falcosecurity/libs/issues/1448)

Thanks to everyone in the community for helping us in spotting these annoying bugs 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.36.2**, you can install its packages following the process outlined in the docs:

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

## What next? 🔮

The community is active on many topics and we hope to deliver great features and many stability fixes once again during the next release cycle!

- The old `falco-driver-loader` script is showing its age and it's time to work on a more maintainable solution. `falcoctl` is a great candidate to host everything driver related, implement new features and make our lives easier when we need to install Falco drivers on a new machine.
- Our rule framework is brand new and we forsee many improvements and active development work on it.
- The latest Falco versions brought many improvements to the plugin framework; we wish to use those to create a more scalable Kubernetes client plugin that will be able to withstand much heavier loads and will be easier to maintain.

And many, many, more enhancements!

To get a weekly reminder of all the great stuff happening in the Falco lands, make sure to join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)!

## Let's meet 🤝

We meet every Wednesday in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions:

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

_Federico_
