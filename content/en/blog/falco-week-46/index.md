---
title: Falco Weekly 46
date: 2023-11-17
author: Aldo Lacuku, Andrea Terzolo, Federico Di Pierro
slug: falco-w-46-2023-weekly-recap
aliases:
  - falco-w-46
tags: ["Falco"]
images:
  - /blog/falco-week-46/images/falco-reading-featured.png
---

This is the first of a series of weekly blog post whose aim is to give a quick overview about the development of Falco and its related projects.  

## What happened in Falco this week?

Let's go through the major changes that happened in various repositories under the falcosecurity organization.  

### [Libs](https://github.com/falcosecurity/libs)

Lots of cleanups happened in the libs repo; the most outstanding ones being:  
* `udig` engine removal (https://github.com/falcosecurity/libs/pull/1485)
* dropped legacy metadata clients for `k8s` and `mesos` (https://github.com/falcosecurity/libs/pull/1478)
* cleaned up `proc` callback handling code (https://github.com/falcosecurity/libs/pull/1471)

Please, note that the removal of the legacy `k8s` client is part of a bigger effort to entirely rewrite it as a plugin, with a more future proof architecture and language.  
See the tracking issue: https://github.com/falcosecurity/libs/issues/987.

All of these cleanups account for ~26k loc removed!! :rocket:

Moreover, some fixes landed:
* removed some more Undefined Behavior warnings from integer copies (https://github.com/falcosecurity/libs/pull/1481)
* solved win32 linking issues with zlib (https://github.com/falcosecurity/libs/pull/1484)
* prevent `libbpf` stats from being collected with no bpf stats (https://github.com/falcosecurity/libs/pull/1487)

Finally, some new features were merged:
* libraries will now be properly installed under `CMAKE_INSTALL_LIBDIR` (https://github.com/falcosecurity/libs/pull/1101)
* added **ppc64le** _experimental_ support for modern bpf driver (https://github.com/falcosecurity/libs/pull/1475)
* upgraded openssl to 3.1.4 (https://github.com/falcosecurity/libs/pull/1488)

Also, we now have a target release date and a tracking issue for libs 0.14 and next driver release: https://github.com/falcosecurity/libs/issues/1482.

### [Falco](https://github.com/falcosecurity/falco)

Now Falco builds and runs on win32 and osx too! https://github.com/falcosecurity/falco/pull/2889
While Falco won't ship for these platforms, we will now have proper CI for them.  

Following the huge round of cleanups in libs, k8s and mesos related configs and options were removed: https://github.com/falcosecurity/falco/pull/2914.
Also, another small cleanup relative to the legacy `k8saudit` implementantion (not the plugin one!) was merged: https://github.com/falcosecurity/falco/pull/2913.

### [Falcoctl](https://github.com/falcosecurity/falcoctl)

While the code for the new `driver-loader` feature for `falcoctl` is being reviewed (part of the effort to drop `falco-driver-loader` script (https://github.com/falcosecurity/falcoctl/issues/327 and https://github.com/falcosecurity/falco/issues/2675), some features landed too:  
* fetch config layer for a specific platform (https://github.com/falcosecurity/falcoctl/pull/349)
* added a new `artifact manifest` command (https://github.com/falcosecurity/falcoctl/pull/351)

### Others

A new repo, [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector), was donated to the falcosecurity.  
It is a self-contained module that fetched metadata from kubernetes API server and dispatches them to Falco instances via gRPC.  
A new plugin is being developed to receive those metadata from gRPC, and will be shipped with Falco 0.37.

[Driverkit](https://github.com/falcosecurity/driverkit) gained support for SUSE Linux Enterprise: https://github.com/falcosecurity/driverkit/pull/304.

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

Aldo, Andrea, Federico
