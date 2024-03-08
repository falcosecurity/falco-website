---
title: Falco Weekly 10 - 2024
date: 2024-03-08
author: Federico Di Pierro
slug: falco-w-10-2024-weekly-recap
aliases:
  - falco-w-10-2024
tags: ["Falco"]
---

## What happened in Falco this week?

First of all, you probably already heard it, **Falco is now graduated**!  
If you missed this important news, go ahead and give our [graduation blog post](https://falco.org/blog/falco-graduation/) a read!  

Let's go through the major changes that happened in various repositories under the falcosecurity organization during the last week.  

### [Libs](https://github.com/falcosecurity/libs)

We are approaching the [0.15.0](https://github.com/falcosecurity/libs/milestone/32) tag, therefore mostly bugfixes were merged, plus a great new feature and some refactors:

* The so-called "kmod configure system" was finally merged: https://github.com/falcosecurity/libs/pull/1452. This helps us to ensure that our kernel module builds even when some features get backported from more recent kernels (ie: when checking for kernel release version in the code is not enough). Kudos to Angelo Puglisi for shipping such a feature! Also, keep an eye for the very same thing for bpf too: https://github.com/falcosecurity/libs/pull/1729!
Thanks to the kmod configure system, our [kernel-testing matrix](https://falcosecurity.github.io/libs/matrix_X64/) is now fully green for kmod!
* A big CRI API refactor finally landed: https://github.com/falcosecurity/libs/pull/1600
* Proceeding with the journey around compiler sanitizers, we now have proper cmake options to enable `ASAN` and `UBSAN`: https://github.com/falcosecurity/libs/pull/1721
* Fixed a crash when reading proclist from scap: https://github.com/falcosecurity/libs/pull/1726
* Fixed some `socketpair` fds problems: https://github.com/falcosecurity/libs/pull/1733
* Fixed and added some more tests: https://github.com/falcosecurity/libs/pull/1736, https://github.com/falcosecurity/libs/pull/1727

### [Falco](https://github.com/falcosecurity/falco)

Some small changes happened too, in Falco main repository:
* The proposal about features adoption and deprecation was merged: https://github.com/falcosecurity/falco/pull/2986! 
* Added a new configuration key `falco_libs.thread_table_size` to customize max thread table size in libsinsp: https://github.com/falcosecurity/falco/pull/3071
* Throw an error when an invalid macro/list name is used: https://github.com/falcosecurity/falco/pull/3116
* Fixed up directory iteration options while iterating over rule folder: https://github.com/falcosecurity/falco/pull/3127

## Join relevant discussions

* Our new discussion section: <https://github.com/falcosecurity/falco/discussions>
* Breaking changes in Falco 0.38.0: <https://github.com/falcosecurity/falco/issues/2840>
* Breaking changes in Falco 0.39.0: <https://github.com/falcosecurity/falco/issues/3045>

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)
* Open a discussion in our [discussion section](https://github.com/falcosecurity/falco/discussions)

Thanks to all the amazing contributors!

Cheers 🎊

Federico
