---
title: Falco Weekly 3 - 2024
date: 2024-01-19
author: Aldo Lacuku, Andrea Terzolo, Federico Di Pierro
slug: falco-w-3-2024-weekly-recap
aliases:
  - falco-w-3-2024
tags: ["Falco"]
---

## What happened in Falco this week?

Let's go through the major changes that happened in various repositories under the falcosecurity organization.  

### Libs

Libs tag 0.14.1 is out! [Try it!](https://github.com/falcosecurity/libs/releases/tag/0.14.1)

It fixes the following things:

* fix(gvisor): gVisor engine crashes with non-hex container IDs: <https://github.com/falcosecurity/libs/issues/1602>
* fix(gvisor): handle arbitrary sandbox IDs: <https://github.com/falcosecurity/libs/pull/1612>
* fix(libsinsp): modify switch case: <https://github.com/falcosecurity/libs/pull/1620>
* fix(libsinsp): Add new cgroup layout for podman: <https://github.com/falcosecurity/libs/pull/1613>
* fix(libsinsp): consistent thread info filtering while dumping: <https://github.com/falcosecurity/libs/pull/1606>
* fix(libsinsp): do not suppress zero ptids: <https://github.com/falcosecurity/libs/pull/1598>
* fix(libsinsp): fix resolved PT_FSPATH and PT_FSRELPATH evt params: <https://github.com/falcosecurity/libs/pull/1597>

You can find a detailed summary on the [release page](https://github.com/falcosecurity/libs/releases/tag/0.14.1).

### Falco

Falco tag 0.37.0-rc1 is out! [Try it!](https://github.com/falcosecurity/falco/releases/tag/0.37.0-rc1)

Some final cleanup before the final tag:

* cleanup(falco.yaml): rename `none` in `nodriver`: <https://github.com/falcosecurity/falco/pull/3012>
* update(config): graduate `outputs_queue` to stable: <https://github.com/falcosecurity/falco/pull/3016>

We are in the testing phase so any feedback would be appreciated!
Moreover, we crafted a dedicated helm chart to test the new [`k8smeta`](https://github.com/falcosecurity/plugins/tree/master/plugins/k8smeta) plugin and the [`k8s-metacollector`](https://github.com/falcosecurity/k8s-metacollector), you can read more about it [here](https://github.com/falcosecurity/falco/issues/2973). Please note these 2 new components will be officially released with Falco 0.37.0 as **EXPERIMENTAL** features.

As a final reminder, please take a look at [our polls](https://github.com/falcosecurity/falco/discussions) if you have some spare seconds.

### Falcoctl

Falcoctl 0.7.0 is out! [Try it!](https://github.com/falcosecurity/falcoctl/releases/tag/v0.7.0)

These are some of the most relevant changes:

* update(output): complete rework of the output system: <https://github.com/falcosecurity/falcoctl/pull/335>
* update(cmd): remove redundant configuration for error handling: <https://github.com/falcosecurity/falcoctl/pull/337>
* new(cmd): add artifact config command: <https://github.com/falcosecurity/falcoctl/pull/340>
* feat(artifact/config): fetch config layer for a specific platform: <https://github.com/falcosecurity/falcoctl/pull/349>
* new(artifact/manifest): add manifest command: <https://github.com/falcosecurity/falcoctl/pull/351>
* new: driver command: <https://github.com/falcosecurity/falcoctl/pull/343>
* new(pkg/driver): fixed some kernel version related issues: <https://github.com/falcosecurity/falcoctl/pull/364>
* cleanup(cmd,internal,pkg): move driver config options to be common to all driver commands: <https://github.com/falcosecurity/falcoctl/pull/365>
* fix(pkg/driver): do not call FixupKernel when building drivers: <https://github.com/falcosecurity/falcoctl/pull/373>
* new: introduce asset artifact type: <https://github.com/falcosecurity/falcoctl/pull/309>

You can find a detailed summary on the [release page](https://github.com/falcosecurity/falcoctl/releases/tag/v0.7.0).

## Join relevant discussions

* Our new discussion section: <https://github.com/falcosecurity/falco/discussions>
* Breaking changes in Falco 0.37.0: <https://github.com/falcosecurity/falco/issues/2763>
* Breaking changes in Falco 0.38.0: <https://github.com/falcosecurity/falco/issues/2840>

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)
* Open a discussion in our [discussion section](https://github.com/falcosecurity/falco/discussions)

Thanks to all the amazing contributors!

Cheers 🎊

Aldo, Andrea, Federico
