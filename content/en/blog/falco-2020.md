---
title: Falco in 2020
description: Reviewing the progress of Falco and its community during the pandemic year
date: 2021-01-03
author: Leonardo Di Donato
slug: falco-2020
---

The scope of this post is to review the progress of Falco and its community during the pandemic year. A year will never forget.

I will try to keep it compact, but Falco, and its community, grown so much this year that I feel like this could be a blog posts series.

2020 was the year we completely and finally put the **Falco release process in the open**! 📖

When [Lorenzo](https://github.com/fntlnz) and [I](https://github.com/leodido) joined [Sysdig](https://sysdig.com) in 2019 it was not.

This was a mandatory requirement that came out from the process to [move Falco into the CNCF incubation level](https://www.cncf.io/blog/2020/01/08/toc-votes-to-move-falco-into-cncf-incubator).

So yes, 2020 is also the year Falco got accepted as an **incubation-level hosted project** by the [Cloud Native Computing Foundation](http://cncf.io)!

The [Falco release process](https://github.com/falcosecurity/falco/blob/master/RELEASE.md) is now open, some Falco maintainers propose themselves during our [Community Calls](https://github.com/falcosecurity/community), and they lead the next Falco release, which happens every 2 months. 🔄

While moving the release process in the open, we also took the chance to:

- give Falco a clearer and coherent SemVer 2.0 versioning scheme
- separate the Falco drivers version from the Falco version
- rename the drivers in a more coherent way
- reorganize its artifacts
- every merge on the master branch and every new release create Falco packages automatically now and push them to package repositories (tarball, DEB, and RPM) on [Bintray](https://bintray.com/falcosecurity) 📦
- reorganize its container images
- every merge on the master branch and every new release, automatically build and publish container images on the [DockerHub](https://hub.docker.com/u/falcosecurity) 🐳
- soon on the [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco), too ([1512](https://github.com/falcosecurity/falco/pull/1512) soon to be merged in!)
- set-up a [process to evolve and incubate new Falco projects and community resources](https://github.com/falcosecurity/evolution) in the falcosecurity GitHub organization ↗

In case you wanna know more on these topics [this](https://falco.org/blog/falco-0-21-0) and [this](https://falco.org/blog/falco-0-23-0) are the Falco blog posts you need to read.

In the meantime, we built [driverkit](https://github.com/falcosecurity/driverkit) 🗜 to let our users manually prebuild the Falco drivers for their hosts. And we created a [Drivers Build Grid](https://github.com/falcosecurity/test-infra/tree/master/driverkit) using this tool, making it able to run initially on CircleCI, now on our [Falco Infra](https://github.com/falcosecurity/test-infra) backed by **Prow** and **Kubernetes** on **AWS**.

We finally re-organized the way we store the prebuilt Falco drivers. Take a look at [download.falco.org](https://download.falco.org).

Would you rather take a look at the **Falco Infra** that I mentioned? 🛠

Take a look at [prow.falco.org](https://prow.falco.org). What an awesome outcome!

In case this topic really got you, well you can read all the details in 🔗 [this blog post](http://bit.ly/falco-prow-aws) I co-authored with Jonah on the AWS Open Source blog.

I want to publicly thank all the Falco Infra WG participants (Spencer, Massimiliano, Lorenzo, Grasso, Umang), especially [Jonah](https://github.com/jonahjon/) from Amazon for all the help he gave and continues to give us as a new maintainer!

Another area that had a huge role in the Falco adoption is the [Falco Helm chart](https://github.com/falcosecurity/charts). 📋

We internalized, fixed, and constantly improved them.
Our community loves them so much that external contributors - like [Spencer](https://github.com/nibalizer) - help us keep the charts healthy daily.

To not mention [falcosidekick](https://github.com/falcosecurity/falcosidekick). 🔫

What [Thomas](https://github.com/issif) did here to enhance Falco output alerts is just awesome. Listing here all the tools he integrated with the Falco outputs alerts would make this post even longer.

So, please go read [this blog post](https://www.cncf.io/blog/2020/08/17/falco-update-whats-new-in-falco-0-25) (part #4 🔗) by POP to know more about them.

Since I just mentioned him, and in case you still don't know: [POP](https://github.com/danpopsd), my big ItaloAmericano friend, [joined us with the intent to help the Falco community and ecosystem shine to unprecedented levels](https://www.cncf.io/blog/2020/12/14/join-pop-falco-org). Make no mistake: he's a great addition to the Falco community.

I presume it's clear now that 2020 was the year the Falco community took off definitely! Innit?

Look how many maintainers we have now by taking a look at this **beautiful** [maintainers.yaml](https://github.com/falcosecurity/.github/blob/master/maintainers.yaml) I instructed our Falco Infra to generate. 👥

We took on board a lot of new external contributors from different companies (IBM, Amazon, Mercari, Hetzner Cloud, DeltaTre, etc.) and they made the difference.

This is the Open Source power, this is what happens when people come together. 🤗

From a technical point of view, the toughest and most important (IMHO) contribution to Falco was the fix of the Falco eBPF driver back in March developed by Lorenzo and me. 🔬

In fact, as I said, the real issue was in the eBPF VM: it would have impacted many other eBPF programs potentially leading to tedious and dangerous situations.

Anyway, a lot has been done over the past year to improve the Falco core tech too.

The top things (in no particular order) that I can recall right now are (forgive me in case I forget something):

- Fixing the presence of `<NA>` values in the Falco alerts ([1133](https://github.com/falcosecurity/falco/pull/1133), [1138](https://github.com/falcosecurity/falco/pull/1138), [1140](https://github.com/falcosecurity/falco/pull/1140), [1492](https://github.com/falcosecurity/falco/pull/1492)) 🩺
- Playing with valgrind to fix various memory leaks 🔩
- Improving the performances of the gRPC Falco Outputs API and making it bi-directional ([1241](https://github.com/falcosecurity/falco/pull/1241)) 👉👈
- The port of the Falco outputs mechanism from Lua to C++ (thanks [Grasso](https://github.com/leogr) for [1412](https://github.com/falcosecurity/falco/pull/1412)) 🔧
- Adding other gRPC APIs to the Falco core
  - Version API
  - Stream the drop alerts too with the gRPC Falco Outputs API
- Investigating the drops
- 100% statically-linked version of Falco (thanks [Lorenzo](https://github.com/fntlnz)!) ⛓
- Build Falco on aarch64 (many thanks to Lorenzo again: [1442](https://github.com/falcosecurity/falco/pull/1442)) ⚙
- Userspace instrumentation, making Falco able to run without the kernel module or the eBPF probe
  - And the first userspace Falco driver - ie., [pdig](https://github.com/falcosecurity/pdig) - thanks to Loris and Grzegorz

I'm 100% sure I forgot something important. But, given the quantity of Panettone I have eaten today 🍞, I consider what I remembered and written here a damn good result for my brain.

## A glimpse of 2021

Stay tuned, because 2021 is the year we plan to make Falco programmable by our users. 📻

We're writing a real Falco rules language - ie., with a compiler and everything. ⚗

We're prepping a set of cool C APIs (libhawk maybe?) to let you interact with Falco (starting with its rulesets) while it runs. 🧪

We're revamping the Falco website (watch [falco-website#324](https://github.com/falcosecurity/falco-website/pull/324)).

Get ready to also read a cool new developer's documentation (watch [1513](https://github.com/falcosecurity/falco/pull/1513)) website and contribute to the Falco core! 📔
