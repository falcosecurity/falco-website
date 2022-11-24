---
title: Falco 0.33.1
date: 2022-11-24
author: Luca Guerra
slug: falco-0-33-1
---

Today we announce the release of **Falco 0.33.1** 🦅!

## Novelties 🆕 and Fixes 🐛

Here's a tiny patch release! It only fixes two bugs reported by the community:
* CrashLoopBackOff in some cases when the gVisor integration is enabled on Kubernetes (reported on Minikube and some versions of GKE)
* Crash when the eBPF probe is used and one or more CPUs are switched off. Thanks [FedeDP](https://github.com/FedeDP)!

Thanks to everyone who reported and worked on issues!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.33.1**, you can install its packages following the process outlined in the docs:

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

So many great things are happening in the Falco community right now. After meeting our friends at KubeCon NA, we're back at work with new features for the upcoming 0.34.0 release coming early 2023 with an unbelievable amount of work being done in the new eBPF probe, enhancements to [falcoctl](https://github.com/falcosecurity/falcoctl) to make management of rules and plugins easier and much more!

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Enjoy 🎉

Luca
