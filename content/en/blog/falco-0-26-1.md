---
title: Falco 0.26.1 a.k.a. "the static release"
date: 2020-10-01
author: Leonardo Di Donato, Lorenzo Fontana
---

Today we announce the release of Falco 0.26.1 🥳

This one is a hotfix release for the Falco 0.26.0 released last week!

You can take a look at the set of changes here:

- [0.26.1](https://github.com/falcosecurity/falco/releases/tag/0.26.1)
- [0.26.0](https://github.com/falcosecurity/falco/releases/tag/0.26.0)

As usual, in case you just want to try out the stable Falco 0.26.1, you can install its packages following the process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/installation/#debian)
- [openSUSE](https://falco.org/docs/installation/#suse)

Do you rather prefer using the docker images? No problem!

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/running/#docker).

## What's new?

From this Falco version onwards, if you download Falco using the tarball distribution (binary) or the `falcosecurity/falco-no-driver` container image, you will get a 100% statically-linked version of Falco! ⛓

The use case for this is that you can now download the tarball and copy the Falco binary (and configuration files) to any target machine or container without depending on the underlying system libraries, included `libc`.

The userspace working group is already using this in the experiments to bring Falco to new endeavors like AWS Fargate. 🕶

### Rules

As always, our rules set is constantly improving and adapting to the constantly changing world.
Many thanks to [@ldegio](https://github.com/ldegio),  [@mstemm](https://github.com/mstemm), [@csschwe](https://github.com/csschwe) and [@leogr](https://github.com/leogr).

## What's next?

As always, you have a chance to be part of this release by joining our [community calls](https://github.com/falcosecurity/community)!

In the last Falco call the community chose to release Falco every 2 months, from now on. ⏰

So, we just created the milestone for [0.27.0](https://github.com/falcosecurity/falco/milestone/13) due by December 1st, 2020.

See you in winter!

Leo & Lore
