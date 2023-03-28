---
title: Falco 0.34.1
date: 2023-02-20
author: Aldo Lacuku
slug: falco-0-34-1
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.34.1** 🦅!

## Novelties 🆕 and Fixes

Here's a minor update! This patch release addresses small but persistent issues that have been causing inconvenience for users:

* **http_output** [not working](https://github.com/falcosecurity/falco/issues/2274) as expected when the remote endpoint was using the HTTPS protocol;
* **FALCO_ENGINE_VERSION** was bumped since in **Falco 0.34.0** new event fields were added for the **process** events;
* cleanups and fixes related to memory management were introduced in **libs**;
* avoid file descriptor leakage when checking for online CPUs in **libpman**.


Thanks to everyone in the community for helping us in spotting these annoying bugs 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.34.1**, you can install its packages following the process outlined in the docs:

* [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
* [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
* [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the container images? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

You can also find the Falcosecurity container images on the public AWS ECR gallery:

* [falco](https://gallery.ecr.aws/falcosecurity/falco)
* [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
* [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## What's next 🔮

It's an exciting time for Falco as we see so many great improvements and features. What's more exciting is the fact that many great ideas and awesome work are going on to make the next big things happen.

The upcoming release will include complete syscall support in the modern BPF probe (feature parity with kernel module and current BPF probe) and introduce **adaptive** syscall selection for the Falco ruleset.

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

Aldo
