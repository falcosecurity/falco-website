---
title: Falco 0.29.0
date: 2021-06-21
author: Massimiliano Giovagnoli
slug: falco-0-29-0
---

Today we announce the summer release of Falco 0.29.0 🌱

This is a minor version which brings new features and fixes!

## Novelties 🆕

Let's now review some of the new things Falco 0.29.0 brings.

### New libraries repository!

As per [this proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20210119-libraries-contribution.md) - and as many of you probably already know - the repo [falcosecurity/libs](https://github.com/falcosecurity/libs) is the new home for [`libscap`](https://github.com/falcosecurity/libs/tree/master/userspace/libscap), [`libsinsp`](https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp), and the Falco [drivers](https://github.com/falcosecurity/libs/tree/master/driver).

With this release, also the last missing piece of the libs contribution is done: the building system is now updated to point to the [new location](https://download.falco.org/?prefix=driver/17f5df52a7d9ed6bb12d3b1768460def8439936d/) and also the [driver version](https://download.falco.org/?prefix=driver/17f5df52a7d9ed6bb12d3b1768460def8439936d/) is updated.

### New libs version!

The update to the [drivers](https://github.com/falcosecurity/libs/tree/master/driver) version [17f5d](https://github.com/falcosecurity/libs) brings new features/fixes:
- [support](https://github.com/falcosecurity/libs/pull/50) to trace the [userfaultd](https://www.kernel.org/doc/html/latest/admin-guide/mm/userfaultfd.html) system call
- [improvement](https://github.com/falcosecurity/libs/pull/32) in [`libsinsp`](https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp) on the way how pod resources limits and pod IP are gathered from container runtime
- [improvement](https://github.com/falcosecurity/libs/pull/15) in [`libsinsp`](https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp) on pod metadata and namespace retrievial for large cluster scenarios, by getting them directly from container labels and bypassing the API server

### Improvements on building system

Finally, it introduces necessary adaptations and improvements to make the Falco building system work with changes recently introduced in [libs](https://github.com/falcosecurity/libs) `CMakefile`s (in particular by PRs [#23](https://github.com/falcosecurity/libs/pull/23) and [#30](https://github.com/falcosecurity/libs/pull/30)).

### Updated rules

As usual, we keep improving the existing rules and we added new ones, like [removing false positives](https://github.com/falcosecurity/falco/pull/1665) when detecting non-sudo and non-root setuid calls.

Other false positives has been removed by [ignoring](https://github.com/falcosecurity/falco/pull/1659) additional known Kubernetes service account when watching for service accounts creted in `kube-system` namespace.

Improvements have been made also for anti-miner detection, by [adding additional domains](https://github.com/falcosecurity/falco/pull/1676) to be detected.


For a complete list please visit [the changelog](https://github.com/falcosecurity/falco/releases/tag/0.29.0).

---

## Try it!

As usual, in case you just want to try out the stable Falco 0.29.0, you can install its packages following the process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the container images? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

**Notice** that thanks to Jonah, one of our [Falco Open Infra](https://github.com/falcosecurity/test-infra) maintainers, you can find also the Falcosecurity container images on the public AWS ECR gallery:
- [falco](https://gallery.ecr.aws/falcosecurity/falco)
- [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
- [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

This makes part of an effort to publish Falco container images on other registries that began while cooking up Falco 0.27.0.


## Let's meet 🤝

As always, we meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

- Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
- Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors! Falco reached 100 contributors, but also all the other Falco projects are receiving a vital amount of contributions every day.

Keep up the good work!

Ciao!

Max
