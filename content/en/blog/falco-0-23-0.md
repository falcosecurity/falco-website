---
title: Falco 0.23.0 a.k.a. "the artifacts scope release"
date: 2020-05-18
author: Leonardo Grasso, Lorenzo Fontana
slug: falco-0-23-0
tags: ["Falco","Release"]
---

Another month has passed and Falco continues to grow!

Today we announce the release of Falco 0.23 🥳

Wondering why this release is called "The Artifacts Scope" release? Please read more [here](https://github.com/falcosecurity/falco/blob/master/proposals/20200506-artifacts-scope-part-2.md).

You can take a look at the whole set of changes here:

- [0.23.0](https://github.com/falcosecurity/falco/releases/tag/0.23.0)

In case you just want to try out the stable Falco 0.23, you can install its packages following the usual process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)

Do you rather prefer using the docker images? No problem!

```bash
docker pull falcosecurity/falco-no-driver:latest # The most recent version
docker pull falcosecurity/falco-no-driver:0.23.0 # A specific version of Falco such as 0.23.0
docker pull falcosecurity/falco-driver-loader:latest # The most recent version of falco-driver-loader with the building toolchain
docker pull falcosecurity/falco-driver-loader:0.23.0 # A specific version of falco-driver-loader such as 0.23.0 with the building toolchain
docker pull falcosecurity/falco:latest # The most recent version with the falco-driver-loader included
docker pull falcosecurity/falco:0.23.0 # A specific version of Falco such as 0.23.0 with falco-driver-loader included
```

**Please be aware that**: we now recommend that instead of using `falcosecurity/falco:latest` directly, you use the `falcosecurity/falco-driver-loader` image first, then
use the `falcosecurity/falco-no-driver:latest`. The `falcosecurity/falco:latest` is going nowhere, we just want to provide a way to do the same thing but splitted into two separate processes
to lower the attack surface of the running Falco container. Read more about the images reorganization [here](https://github.com/falcosecurity/falco/blob/master/proposals/20200506-artifacts-scope-part-2.md#images).

## Breaking Changes

- Both in the packages and in the  `falco-driver-loader` script now the kernel module and eBPF probe are referenced as `falco.ko` and `falco.o` respectively, before they were `falco-probe.ko` and `falco-probe.o`. In the case of Falco installed using the kernel module this can lead to a duplicated module loaded given that the names are different. Make sure you don't have a duplicated module by 
- The falco-driver-loader script environment variable to use a custom repository to download drivers now uses the DRIVERS_REPO environment variable instead of DRIVER_LOOKUP_URL. This variable must contain the parent URI containing the following directory structure `/$driver_version$/falco_$target$_$kernelrelease$_$kernelversion$.[ko|o]`.

## Rules update (yay yay! We always improve the default ruleset!!)

- rule(Redirect STDOUT/STDIN to Network Connection in Container): correct rule name as per rules naming convention
- rule(Redirect STDOUT/STDIN to Network Connection in Container): new rule to detect Redirect stdout/stdin to network connection in container
- rule(K8s Secret Created): new rule to track the creation of Kubernetes secrets (excluding kube-system and service account secrets)
- rule(K8s Secret Deleted): new rule to track the deletion of Kubernetes secrets (excluding kube-system and service account secrets)

## Some statistics

35 pull requests merged in, 18 of which containing changes directly targeting our end-users.

72 commits since past release, that was a month ago.

## Upcoming things

We are about to merge support for unix sockets in the Falco gRPC API with [#1217](https://github.com/falcosecurity/falco/pull/1217),
more importantly during this release cycle the community [made a decision](https://github.com/falcosecurity/contrib/issues/13) about adopting [pdig](https://github.com/falcosecurity/pdig)
as a repository (learn [here](https://github.com/falcosecurity/falco/blob/master/proposals/20200506-artifacts-scope-part-1.md#falco-project-evolution) what this means). pdig will allow Falco
to run completely in userspace. This is very useful when Falco is deployed in environments where it's not possible to load a kernel module or an eBPF probe. Our community members,
already created two projects that can be used to deploy Falco with pdig as a driver, [falco-trace](https://github.com/kris-nova/falco-trace) and [falco-inject](https://github.com/fntlnz/falco-inject). We will look forward to adopting them or making different decisions.

See you next month with many more fabulous things!
