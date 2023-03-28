---
title: Falco 0.22 a.k.a. "the hard fixes release"
date: 2020-04-17
author: Leonardo Di Donato, Lorenzo Fontana
slug: falco-0-22-x
tags: ["Falco","Release"]
---

Another month has passed and Falco continues to grow!

Today we announce the release of Falco 0.22 🥳

You can take a look at the whole set of changes here:

- [0.22.0](https://github.com/falcosecurity/falco/releases/tag/0.22.0) - thanks to [Leonardo Grasso](https://github.com/leogr) for his first ever release!
- [0.22.1](https://github.com/falcosecurity/falco/releases/tag/0.22.1) - hotfix by [me](https://github.com/leodido) and [Lorenzo Fontana](https://github.com/fntlnz)

In case you just want to try out the stable Falco 0.22, you can install its packages following the usual process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel-amazon-linux)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian-ubuntu)

Do you rather prefer using the docker images? No problem!

```bash
docker pull falcosecurity/falco:0.22.1
docker pull falcosecurity/falco:0.22.1-minimal
docker pull falcosecurity/falco:0.22.1-slim
```

## Notable Changes

This release comes with a lot of fixes for longstanding tough bugs!

But also with some new features 😊

In case you are managing the Falco drivers yourself please make sure to update them to version `a259b4bf49c3330d9ad6c3eed9eb1a31954259a6` (reference [here](https://github.com/falcosecurity/falco/blob/9f6833e1dbd95b10f7d672d457cec70b5e19e5c1/cmake/modules/sysdig.cmake#L29)).

### eBPF driver

Some users reported a problem in getting the eBPF driver to work on GKE.

This release finally introduces a fix for it.

### <NA> values

Some users reported they were getting `<NA>` values for docker and Kubernetes metadata in the alerts.

With the following pull requests, [falco#1133](https://github.com/falcosecurity/falco/pull/1133), [falco#1138](https://github.com/falcosecurity/falco/pull/1138), and [falco#1140](https://github.com/falcosecurity/falco/pull/1140),
the problem should now be definitely fixed, as reported by the users testing the development release of Falco containing the fixes.

### Falco version and driver version are now distinct!

Going through the process of a better modularization for Falco, now the Falco version and the version of its drivers are two distinct things finally!

Clearly, in order to obtain this some PRs were needed 😝 both in the packagin system and in the `falco-driver-loader` script.

- [falco#1111](https://github.com/falcosecurity/falco/pull/1111)
- [falco#1148](https://github.com/falcosecurity/falco/pull/1148)

### Rules, rules everywhere!

This release also had a lot of rule changes.
Most notably [vicenteherrera](https://github.com/vicenteherrera) created many new rules:

- Full K8s Administrative Access
- Ingress Object without TLS Certificate Created
- Untrusted Node Successfully Joined the Cluster
- Untrusted Node Unsuccessfully Tried to Join the Cluster
- Network Connection outside Local Subnet
- Outbound or Inbound Traffic not to Authorized Server Process and Port

Thanks Vicente! 🙌🏻

### Synchronous CRI metadata fetch

Thanks to PR [falco#1099](https://github.com/falcosecurity/falco/pull/1099) users can now disable the asynchronous fetching of CRI metadata forcing it to be synchronous.

To do it, just pass the `--disable-cri-async` flag to Falco.

While this can slow down Falco event processing and can cause drop rate to raise, it helps in getting less null values for containers metadata.

Before using this flag, please try out this release since it contains other fixes for this topic!

## Some statistics

23 pull requests merged in, 18 of which containing changes directly targeting our end-users.

49 commits since past release, in 30 days.

## Upcoming things

The [drivers build grid](https://github.com/falcosecurity/test-infra/tree/master/driverkit) is almost ready.

Just some missing refinements and then Falco will have again a set of prebuilt drivers (both kernel modules and eBPF probes) to be downloaded during the installation!
