---
title: Falco 0.27.0 a.k.a. "The happy 2021 release"
date: 2021-01-18
author: Lorenzo Fontana
---

Today we announce the release of Falco 0.27.0 🥳

This is the first release of 2021!

You can take a look at the set of changes here:

- [0.27.0](https://github.com/falcosecurity/falco/releases/tag/0.27.0)

As usual, in case you just want to try out the stable Falco 0.27.0, you can install its packages following the process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the docker images? No problem!

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

**Important** Falco 0.27.0 is the first release that has the container images released also [on **Amazon ECR**](https://gallery.ecr.aws/falcosecurity/falco).
This is not [officially supported](https://github.com/falcosecurity/evolution#official-support) yet and we are only releasing the `falcosecurity/falco` image there right now.
Thanks to [@leodido](https://github.com/leodido) and [@jonahjon](https://github.com/jonahjon)!
## What's new?

This is not a complete list, for a complete list visit [the changelog](https://github.com/falcosecurity/falco/releases/tag/0.27.0).

### Breaking changes
Before we dive into anything it's important to notice that this Falco release introduces one **BREAKING CHANGE**.
If you rely on running Falco without any configuration file you can't do that anymore.
All the official installation methods ships with a default configuration file with them.

### Performance notes

The mechanism that handles Falco outputs has been completely rewritten in C++ (Thanks [@leogr](https://github.com/leogr)).
Before this release, Falco relied on a mix of Lua and C++ API calls that led to a lot of crosstalk between the engine and the outputs mechanisms. Having a single C++ implementation helps a lot in reducing the crosstalk issue.

Since Lua is gone for the outputs now, the only reason that prevented us from having multi-threaded outputs is also gone. Outputs in Falco 0.27.0 are able to use multiple threads and also have a mechanism to detect when an output is too slow.

An output is "too slow" when it does not allow to deliver an alert within a given deadline, Falco will give an alert
from the "internal" data source complaining about that. The default timeout is 200 milliseconds. It can be configured using the `output_timeout` configuration in `falco.yaml`.

### Everything else!

**New website**
As you can notice, we have a new website! [Raji](https://github.com/Rajakavitha1) and [Lore](https://github.com/fntlnz)
are the two behind this new restyle with the help of [@leogr](https://github.com/leogr) and [@leodido](https://github.com/leodido). This new website features a new design, a search bar and a nice dropdown you can use to navigate old Falco releases (Falco 0.26 and 0.27 are the only ones available now).

**gRPC changes**
The Falco gRPC version service now also exposes the Falco engine version.

**Rules changes**

We have 15 rules changes in this release!
As always, our community values the quality of the rules as their top priority. Keeping a sane set of
default rules for everyone to benefit is very important for us!

## What's next?

We have a scheduled [0.28.0](https://github.com/falcosecurity/falco/milestone/15) release on March 18th 2021!

As always, we are going to have bug fixes and improvements.

A feature that is announced to go to 0.28.0 will be the support for structured rules exceptions, a way
to define conditions to exclude certain alerts from happening when the exception happens.

You can read [@mstemm](https://github.com/mstemm)'s proposal [here](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md).

Moreover, we are very close to releasing ARM (armv7 and aarch64 builds) of Falco within the next releases.
[Lore](https://github.com/fntlnz) worked on [PR#1442](https://github.com/falcosecurity/falco/pull/1442) to port Falco to those architectures and [Jonahjon](https://github.com/jonahjon) is working [to make our infrastructure support](falcosecurity/test-infra/pull/284) for building, testing and releasing for those as well.

## Let's meet!

As always, we meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

 - Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
 - [Join the Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)


Thanks to all the amazing contributors! Keep up the good vibes!

Bye!

Lore

