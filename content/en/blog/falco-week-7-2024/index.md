---
title: Falco Weekly 7 - 2024
date: 2024-02-16
author: Federico Di Pierro
slug: falco-w-7-2024-weekly-recap
aliases:
  - falco-w-7-2024
tags: ["Falco"]
---

## What happened in Falco this week?

Let's go through the major changes that happened in various repositories under the falcosecurity organization.  

### [Libs](https://github.com/falcosecurity/libs)

Multiple fixes and some cleanups happened in the libs repo:
* `newfstatat` syscall is now configured with `UF_ALWAYS_DROP`: https://github.com/falcosecurity/libs/pull/1683
* Fixed null destination address in `sendto` and `sendmsg` in modern bpf: https://github.com/falcosecurity/libs/pull/1687
* Added a `CT_UNKNOWN` container type zero value and properly initialize uninitialized value: https://github.com/falcosecurity/libs/pull/1688
* Fix in chisels: don't fail if a chisel directory does not exist: https://github.com/falcosecurity/libs/pull/1689
* Cleaned up more memory reads/writes in filterchecks to avoid UBs: https://github.com/falcosecurity/libs/pull/1690
* Properly initialize `m_exe...` fields in threadinfo: https://github.com/falcosecurity/libs/pull/1691
* Fixed a small source of memleak in scap platform: https://github.com/falcosecurity/libs/pull/1692
* Properly enforce the static CRT on Windows by default: https://github.com/falcosecurity/libs/pull/1695

### [Falco](https://github.com/falcosecurity/falco)

Falco has seens quite a bit of C++ improvements, thanks to Samuel Gaist! Keep up the great job!  
* C++ cleanups: https://github.com/falcosecurity/falco/pull/3069, https://github.com/falcosecurity/falco/pull/3074, https://github.com/falcosecurity/falco/pull/3083, https://github.com/falcosecurity/falco/pull/3085
* Consolidated Faclo engine and rule loader tests: https://github.com/falcosecurity/falco/pull/3066
* Added `http-headers` option to Falco driver-loader images: https://github.com/falcosecurity/falco/pull/3075
* Cleaned up an unused builder Dockerfile: https://github.com/falcosecurity/falco/pull/3088
* Fixed some compiler warnings: https://github.com/falcosecurity/falco/pull/3089
* Cleaned up falco_engine deps and include paths: https://github.com/falcosecurity/falco/pull/3090

### [Falcoctl](https://github.com/falcosecurity/falcoctl)

Falcoctl has seen a small yet important fix:
* Correctly report artifact type: https://github.com/falcosecurity/falcoctl/pull/442

### [Kernel-testing](https://github.com/falcosecurity/kernel-testing)

Even if the effort was part of last week, and since we skipped last "Weekly Recap", it is important to mention that the kernel-testing framework recently got a big update:
* All images build is now tested in PR CI when they are modified
* Images are now build and published on `ghcr.io/falcosecurity/kernel-testing` repo
* They are published under `main` tag and under `latest|$tag` for releases
* The image name is built as: `$distro-{kernel,image}:$kernelrelease-$arch-$imagetag`, eg: `amazonlinux2-kernel:5.10-x86_64-v0.3.2`
* Ubuntu-6.3 images were bumped to 6.5 kernel
* A new arch-6.7 image was added to the test matrix
* A [composite](https://github.com/falcosecurity/kernel-testing/blob/main/action.yml) action was added and is now used by libs CI

As always, you can find detailed kernel-testing outputs against our drivers under https://falcosecurity.github.io/libs/matrix/.

### [Charts](https://github.com/falcosecurity/charts)

Thanks to Aldo's continuous effort, we now have much better documentation all around the repo: 
* Updated docs for Falco exporter: https://github.com/falcosecurity/charts/pull/623, 
* Process all charts for changes in values.yaml: https://github.com/falcosecurity/charts/pull/624
* Updated contributing section: https://github.com/falcosecurity/charts/pull/625
* Fixed typos, formatting and dead links in Falco chart docs: https://github.com/falcosecurity/charts/pull/627
* Fixed dead links for Falco exporter: https://github.com/falcosecurity/charts/pull/628
* Fixed link tags in readme: https://github.com/falcosecurity/charts/pull/629

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
