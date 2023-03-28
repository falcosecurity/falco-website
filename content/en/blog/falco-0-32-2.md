---
title: Falco 0.32.2
date: 2022-08-09
author: Andrea Terzolo
slug: falco-0-32-2
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.32.2** 🦅!

## Novelties 🆕

This release is really small, like a little 🐦, it only fixes the URL to download the falco BPF probe from [Falco download page](https://download.falco.org/). A big thank you goes to [eric-engberg](https://github.com/eric-engberg), who proposed the [fix](https://github.com/falcosecurity/falco/pull/2142), and as usual to everyone in the community for helping us in spotting these annoying bugs 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

### Fixes 🐛

This release fixes just one bothersome bug:

* The url from which Falco tryes to download the BPF probe was wrong, [eric-engberg](https://github.com/eric-engberg) proposed the solution in this [PR](https://github.com/falcosecurity/falco/pull/2142). Thank you again! 🙏

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.32.2**, you can install its packages following the process outlined in the docs:

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

It's an exciting time for Falco as we see so many great improvements and features. What's more exciting is the fact that there are many great ideas and awesome work going on to make the next big things happen.

Recently, there has been a lot of interest on [the shiny new eBPF probe](https://github.com/falcosecurity/libs/pull/268), making use of modern eBPF features like CO-RE, ringbuffer API and new tracing program.

In addition, many people in the community are interested in using Falco to read syscall events and plugin events simultaneously. If you are, I would suggest to take a look at the [in-depth design](https://github.com/falcosecurity/falco/issues/2074) for this new feature!

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

Andrea
