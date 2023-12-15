---
title: Falco Weekly 47
date: 2023-11-24
author: Federico Di Pierro
slug: falco-w-47-2023-weekly-recap
aliases:
  - falco-w-47
tags: ["Falco"]
images:
  - /blog/falco-week-47/images/falco-reading-featured.png
---

Another week, another load of improvements everywhere in the falcosecurity!

## What happened in Falco this week?

Let's go through the major changes that happened in various repositories under the falcosecurity organization.  

### [Libs](https://github.com/falcosecurity/libs)

The anticipated 0.14.0 libs tag (and its driver counterpart) are a bit late, unfortunately.  

Anyway, spring cleaning went on this week!
* removed `stopwatch` implementation, now unused: https://github.com/falcosecurity/libs/pull/1493
* removed unused `sinsp_test.cpp` file: https://github.com/falcosecurity/libs/pull/1499
* removed `jq` dep: https://github.com/falcosecurity/libs/pull/1500

Moreover, some fixes on the recently introduced async event queue class happened: https://github.com/falcosecurity/libs/pull/1490, https://github.com/falcosecurity/libs/pull/1504.
Finally, some fixes around the stats code: https://github.com/falcosecurity/libs/pull/1505, https://github.com/falcosecurity/libs/pull/1506.

Rumors have it coming next week:
* New big cleanup: deprecation of tracers: https://github.com/falcosecurity/libs/pull/1503
* `ppc64le` support for bpf and kmod + CI build jobs: https://github.com/falcosecurity/libs/pull/1497
* remove old metaevents implementation: https://github.com/falcosecurity/libs/pull/1495
* Small fix on top of ia32 work: https://github.com/falcosecurity/libs/pull/1501

**Second part of an effort by Luca Guerra to clean up libsinsp from potential undefined behavior**: https://github.com/falcosecurity/libs/pull/1502.  
This is so important that deserved to be left alone :) 

### [Falco](https://github.com/falcosecurity/falco)

We have a new official adopter! Welcome to `Thought Machine`: https://github.com/falcosecurity/falco/pull/2919
Small cleanup to avoid Falco configuratiom to be inited twice: https://github.com/falcosecurity/falco/pull/2917

### [Falcoctl](https://github.com/falcosecurity/falcoctl)

The new `driver` command was merged! https://github.com/falcosecurity/falcoctl/pull/343
We are now in the process of [adding tests](https://github.com/falcosecurity/falcoctl/pull/355) and eventually fixing spotted bugs :)
Also, the new `asset` artifact type PR is being reviewed: https://github.com/falcosecurity/falcoctl/pull/309.

### Others

[Driverkit](https://github.com/falcosecurity/driverkit) [v0.16.0](https://github.com/falcosecurity/driverkit/releases/tag/v0.16.0) was just released, and contains [some fixes](https://github.com/falcosecurity/driverkit/pull/305), a new [`local` build processor](https://github.com/falcosecurity/driverkit/pull/306) and preliminary [SLES support](https://github.com/falcosecurity/driverkit/pull/304).

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

Federico
