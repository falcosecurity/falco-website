---
title: Falco 0.28.1
date: 2021-05-07
author: Carlos Panato
slug: falco-0-28-1
---

Today we announce the spring release of Falco 0.28.1 🌱

This is our first patch release of Falco 0.28 that address some issues found.

And this release address some [security advisories](https://github.com/falcosecurity/falco/security/advisories)

You can take a look at the set of changes here:

- [0.28.1](https://github.com/falcosecurity/falco/releases/tag/0.28.1)

As usual, in case you just want to try out the stable Falco 0.28.1, you can install its packages following the process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the container images? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

**Notice** that from this release onward, thanks to Jonah, one of our Falco Infra maintainers, you can find also the **falco-no-driver** container images on the [AWS ECR gallery](https://gallery.ecr.aws/falcosecurity/falco-no-driver). Same for the the **falco-driver-loader** container images ([link](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)). This makes part of an effort to publish Falco container images on other registries that began while cooking up Falco 0.27.0.

## Novelties 🆕

Let's now review some of the new things Falco 0.28.1 brings.

For a complete list please visit [the changelog](https://github.com/falcosecurity/falco/releases/tag/0.28.1).

To highlitght some:

- new flag `--support` it includes information about the Falco engine version.
- new configuration field `syscall_event_timeouts.max_consecutive` to configure after how many consecutive timeouts without an event Falco must alert.
- bug fix: don't stop the webserver for Kubernetes audit logs when some invalid data arrived.


## Security Advisories

You can check all the [security advisories](https://github.com/falcosecurity/falco/security/advisories) in the page, but the ones important for this release are:

- [Undetected crash of the kernel module disables Falco](https://github.com/falcosecurity/falco/security/advisories/GHSA-c7mr-v692-9p4g)
- [Default rules can be bypassed with different techniques](https://github.com/falcosecurity/falco/security/advisories/GHSA-rfgw-vmxp-hp5g)
- [Security flags not enforced my CMake-files](https://github.com/falcosecurity/falco/security/advisories/GHSA-qfjf-hpq4-6m37)

## Let's meet 🤝

As always, we meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

- Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
- [Join the Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors! Falco reached 100 contributors, but also all the other Falco projects are receiving a vital amount of contributions every day.

Keep up the good work!

Ciao!

Carlos
