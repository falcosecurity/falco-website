---
title: Falco Weekly 48
date: 2023-12-01
author: Aldo Lacuku, Federico Di Pierro
slug: falco-w-48-2023-weekly-recap
aliases:
  - falco-w-48
tags: ["Falco"]
images:
  - /blog/falco-week-48/images/falco-reading-featured.png
---

## What happened in Falco this week?

Let's go through the major changes that happened in various repositories under the falcosecurity organization.  

### [Libs](https://github.com/falcosecurity/libs)

The anticipated 0.14.0 libs tag (and its driver counterpart) are still a bit late, unfortunately.  

Anyway, spring cleaning went on once again this week!
* cleaned up `dup3` flags param: https://github.com/falcosecurity/libs/pull/1469
* cleaned up other params inconsistencies in the drivers: https://github.com/falcosecurity/libs/pull/1512
* dropped `b64` dep: https://github.com/falcosecurity/libs/pull/1518
* dropped `tinydir` dep: https://github.com/falcosecurity/libs/pull/1516
* removed some warning suppressions: https://github.com/falcosecurity/libs/pull/1519
* cleaned up big unused function `sinsp_evt::get_param_as_json`: https://github.com/falcosecurity/libs/pull/1523

The big [safer parameter handling PR](https://github.com/falcosecurity/libs/pull/1502) was merged, making libs much more robust!
Moreover, `ppc64le` support [was extended](https://github.com/falcosecurity/libs/pull/1497) to kmod and legacy ebpf probe, and we added CI jobs to test the build of drivers on it! Thanks to Afsan Hossain for his big contribution!

Finally, some more fixes:
* build on `s390x` was fixed: https://github.com/falcosecurity/libs/pull/1522
* some recently introduced regressions were fixed: https://github.com/falcosecurity/libs/pull/1524
* fixed a memleak in `sinsp_dns_manager`: https://github.com/falcosecurity/libs/pull/1526

Rumors have it coming next week:
* More fixes: https://github.com/falcosecurity/libs/pull/1530, https://github.com/falcosecurity/libs/pull/1528

### [Falco](https://github.com/falcosecurity/falco)

We bumped libs and driver to latest master: https://github.com/falcosecurity/falco/pull/2929.  
Moreover, Falco will now print system info during startup: https://github.com/falcosecurity/falco/pull/2927.  
Falco does now expose a new config option to enable libsinsp state metrics: https://github.com/falcosecurity/falco/pull/2883
Finally, the new [`driver selection mechanism` PR](https://github.com/falcosecurity/falco/pull/2413) was merged!

### [Falcoctl](https://github.com/falcosecurity/falcoctl)

Some fixes on top of the new driver-loader happened:
* fixed up naming for the new Falco driver selection in config: https://github.com/falcosecurity/falcoctl/pull/357
* small fix for host-root driver-loader configuration: https://github.com/falcosecurity/falcoctl/pull/358
* do not fail when `/sys/kernel/debug` fails to be mounted: https://github.com/falcosecurity/falcoctl/pull/361

## Join relevant discussions!

* Breaking change in Falco 0.37.0: https://github.com/falcosecurity/falco/issues/2763
* Breaking change in Falco 0.38.0: https://github.com/falcosecurity/falco/issues/2840
* Falco metrics exposed to final users: https://github.com/falcosecurity/falco/issues/2928
* Create a more coherent stats model for libs: https://github.com/falcosecurity/libs/issues/1463
* Allow loading tracepoints other than the ones needed by Falco: https://github.com/falcosecurity/libs/issues/1376

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

Aldo, Federico
