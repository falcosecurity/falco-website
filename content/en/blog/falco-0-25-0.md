---
title: Falco 0.25.0 a.k.a. "the summer release"
date: 2020-08-25
author: Lorenzo Fontana, Leonardo Grasso
slug: falco-0-25-0
---


Today we announce the release of Falco 0.25 🥳


This one is a small release but a very important one!!

You can take a look at the set of changes here:

- [0.25.0](https://github.com/falcosecurity/falco/releases/tag/0.25.0)

In case you just want to try out the stable Falco 0.25, you can install its packages following the usual process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)

Do you rather prefer using the docker images? No problem!

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

## What's new?

### Driver changes

The driver now supports the `renameat2` syscall and works with new kernel stable 5.8 releases!

### Installation experience

Before, users had to install `libyaml` in their systems, it's not needed anymore.

### Contributor experience
We have improved the contribution experience by rewriting the step by step instructions to run integration
tests locally, the instructions can be found [here](https://github.com/falcosecurity/falco/tree/master/tests).

Moreover, the build experience was improved as many users were reporting build problems on different operating systems, we took a chance to restructure our builds a bit and make them easier to work with.

Thanks to [@leodido](https://github.com/leodido)!

### Outputs plugin developer experience

Outputs plugin developers and maintainers must be aware that gRPC was updated
to 1.31.1. Please take your time to test and report issues, thank you!

### Rules

As always, our rules set is constantly improving and adapting to the constantly changing world.
Many thanks to [@Kaizhe](https://github.com/Kaizhe),  [@nvanheuverzwijn](https://github.com/nvanheuverzwijn), [@admiral0](https://github.com/admiral0) and [@leogr](https://github.com/leogr). 



## What's next?
We just created the milestone for [0.26.0](https://github.com/falcosecurity/falco/milestone/12)  due by September 15, 2020.
As always, you have a chance to be part of this release by joining our [community calls](https://github.com/falcosecurity/community)!

See you soon!

Lore and Leo Grasso
