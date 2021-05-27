---
title: Falco 0.28.2
date: 2021-05-07
author: Massimiliano Giovagnoli
slug: falco-0-28-2
---

Today we announce the spring release of Falco 0.28.2 🌱

This is our second patch release of Falco 0.28 that pulls libraries and drivers from the new [libs repository](https://github.com/falcosecurity/libs).

## Novelties 🆕

Let's now review some of the new things Falco 0.28.2 brings.

As per [this proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20210119-libraries-contribution.md), the repo [falcosecurity/libs](https://github.com/falcosecurity/libs) is the new home for [`libscap`](https://github.com/falcosecurity/libs/tree/master/userspace/libscap), [`libsinsp`](https://github.com/falcosecurity/libs/tree/master/userspace/libsinsp), and the Falco [drivers](https://github.com/falcosecurity/libs/tree/master/driver).

With this release the building system is updated to point to the [new location](https://download.falco.org/?prefix=driver/13ec67ebd23417273275296813066e07cb85bc91/) and also the [driver version](https://download.falco.org/?prefix=driver/13ec67ebd23417273275296813066e07cb85bc91/) is updated.

Finally, it introduces necessary adaptations and improvements to make the Falco building system work with changes recently introduced in [libs](https://github.com/falcosecurity/libs) `CMakefile`s (in particular by PRs [#23](https://github.com/falcosecurity/libs/pull/23) and [#30](https://github.com/falcosecurity/libs/pull/30)).

For a complete list please visit [the changelog](https://github.com/falcosecurity/falco/releases/tag/0.28.2).

## Try it!

As usual, in case you just want to try out the stable Falco 0.28.2, you can install its packages following the process outlined in the docs:

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
