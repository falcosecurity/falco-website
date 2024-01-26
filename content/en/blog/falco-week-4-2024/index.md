---
title: Falco Weekly 4 - 2024
date: 2024-01-26
author: Aldo Lacuku, Andrea Terzolo, Federico Di Pierro
slug: falco-w-4-2024-weekly-recap
aliases:
  - falco-w-4-2024
tags: ["Falco"]
---

## What happened in Falco this week?

Let's go through the major changes that happened in various repositories under the falcosecurity organization.  

### Libs

Libs will need a 0.14.2 tag for the Falco 0.37.0 release, with the revert of https://github.com/falcosecurity/libs/pull/1533 PR.  
During our release process, we found out that the new `std::filesystem` based implementaton was up to 8x time slower than the old ones; that's because it supports much more cases and does many more checks.  
Therefore, in https://github.com/falcosecurity/libs/pull/1645, we revert to the old sorcery implementation, plus some minor improvements and added tests.

Moreover, many more changes landed in libs, **that won't be part of the upcoming Falco 0.37.0 release**:

* Modernized C++ struct/enum/union declarations: <https://github.com/falcosecurity/libs/pull/1588>
* Added support for `newfstatat` syscall: <https://github.com/falcosecurity/libs/pull/1628>
* Fixed a potential deadlock for kmod: <https://github.com/falcosecurity/libs/pull/1629>
* Big effort by our hero, Jason, to cleanup some stale macros: <https://github.com/falcosecurity/libs/pull/1633,https://github.com/falcosecurity/libs/pull/1634,https://github.com/falcosecurity/libs/pull/1635,https://github.com/falcosecurity/libs/pull/1637,https://github.com/falcosecurity/libs/pull/1638>
* A small fix for old ebpf driver to support some GKE envs: <https://github.com/falcosecurity/libs/pull/1642>
* Solved a data race and segfault in logger: <https://github.com/falcosecurity/libs/pull/1643>
* Allow to selectively disable bpf and kmod engines from cmake: <https://github.com/falcosecurity/libs/pull/1644>

### Falco

Falco tag 0.37.0-rc2 is out! [Try it!](https://github.com/falcosecurity/falco/releases/tag/0.37.0-rc2)

Moreover:

* `syscall_event_drops` was soft-deprecated to get ready for Falco 0.38.0 upcoming cleanups: <https://github.com/falcosecurity/falco/pull/3015>
* Avoid storing escaped strings in engine: <https://github.com/falcosecurity/falco/pull/3028>
* Bumped falcoctl to v0.7.1 and rules to 3.0.0: <https://github.com/falcosecurity/falco/pull/3030,https://github.com/falcosecurity/falco/pull/3034>
* Fixed nlohmann_json library include paths when using system one: <https://github.com/falcosecurity/falco/pull/3032>
* Fixes to new libsinsp state metrics handling: <https://github.com/falcosecurity/falco/pull/3033>

We are in the testing phase so any feedback would be appreciated!
Moreover, we crafted a dedicated helm chart to test the new [`k8smeta`](https://github.com/falcosecurity/plugins/tree/master/plugins/k8smeta) plugin and the [`k8s-metacollector`](https://github.com/falcosecurity/k8s-metacollector), you can read more about it [here](https://github.com/falcosecurity/falco/issues/2973). Please note these 2 new components will be officially released with Falco 0.37.0 as **EXPERIMENTAL** features.

As a final reminder, please take a look at [our polls](https://github.com/falcosecurity/falco/discussions) if you have some spare seconds.

### Falcoctl

Falcoctl 0.7.1 is out! [Try it!](https://github.com/falcosecurity/falcoctl/releases/tag/v0.7.1) and contains a small fix for the driver-loader on COS.  

Moreover, we added dependabot configs, that then bumped lots of deps to their latest compatible versions: <https://github.com/falcosecurity/falcoctl/pull/385>.

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
