---
title: Falco 0.28.0 a.k.a. Falco 2021.04
date: 2021-04-09
author: Leonardo Di Donato
slug: falco-0-28-0
tags: ["Falco","Release"]
---

Today we announce the spring release of Falco 0.28.0 🌱

This is the second release of Falco during 2021!

You can take a look at the set of changes here:

- [0.28.0](https://github.com/falcosecurity/falco/releases/tag/0.28.0)

As usual, in case you just want to try out the stable Falco 0.28.0, you can install its packages following the process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the container images? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

**Notice** that from this release onward, thanks to Jonah, one of our Falco Infra maintainers, you can find also the **falco-no-driver** container images on the [AWS ECR gallery](https://gallery.ecr.aws/falcosecurity/falco-no-driver). Same for the the **falco-driver-loader** container images ([link](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)). This makes part of an effort to publish Falco container images on other registries that began while cooking up Falco 0.27.0.

## Novelties 🆕

Let's now review some of the new things Falco 0.28.0 brings.

For a complete list please visit [the changelog](https://github.com/falcosecurity/falco/releases/tag/0.28.0).

### Breaking changes

Before we dive into anything it's important to notice that this release introduces some **breaking changes**.

Since [bintray is sunsetting](https://jfrog.com/blog/into-the-sunset-bintray-jcenter-gocenter-and-chartcenter) 🌇, all the **Falco packages**, for all the officially supported distros, will be published at https://download.falco.org from now on.

We **already moved** the package repositories and **the previous Falco versions** (both development, starting from Falco 0.26.1 onward, and all the stable versions, starting with Falco 0.20.0).

So you can start using the new package repositories just now! Here's a [step-by-step guide to upgrade](https://falco.org/docs/setup/packages/#upgrade) your Falco repository settings. 📄

Do not use the [Falco Bintray repositories](https://dl.bintray.com/falcosecurity) anymore, please. ⚠️

Notice also that the DEB and RPM packages use now **systemd** ⚫◀️ in place of the previous init.d service units.

Another change worth mentioning is that we definitely removed the `SKIP_MODULE_LOAD` environment variable used by the Falco container image to skip the driver loading. It was deprecated with Falco 0.24.0. If you're still using is please switch to use the new environment variable named `SKIP_DRIVER_LOADER`. ⏭️

### Exceptions

As announced, the support for structured rules exceptions has been merged in. ✔️

It's a mechanism to define additional conditions that when matched cause the Falco engine to do **not** emit the relative Falco alert.

You can read more about such a feature in the [document proposing it](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md).

Notice that the default Falco rulesets are not using the exceptions at the moment, but you can surely write your own Falco rules using this feature if it suits your needs.

### Healthz

Thanks to Carlos, the Falco Kubernetes web server exposes now a `/healthz` endpoint.

It can be used to check whether Falco is up and running. It's a feature requested by the users of Falco Helm charts to improve them.

### Falco driver loader

The Falco driver loader, a bunch of bash doing magic things when a Falco container starts, will first try to detect and download a prebuilt Falco driver for the current host (current list of prebuild drivers is available [here](https://download.falco.org/?prefix=driver/)), and only then it will try to compile a working Falco driver on the fly.

We decided to invert such logic because we have 4K+ prebuilt drivers and a mechanism to update them as soon new distro and new kernels born.

This way, the boot time of Falco containers should improve by a lot in the majority of cases, avoiding compiling a Falco driver for your host if we already built one for you.

### Tunable drops

The `syscall_event_drops` configuration item inside `falco.yaml` gains a new child (`threshold`) that you can use to tune
the noisiness of the drops.

It represents a percentage, thus you might provide a value between 0 and 1 for it. By default it's 0.1, feel free to experiment with it in case you need to.

## Everything else

### Engine fixes

A bug in the Falco engine, and precisely in the Falco rules language, preventing numbers to be parsed properly has been finally fixed.

Also, another bug regarding how the missing values (`NA`) were handled in multi-value fields (eg., lists) is now fixed and no more present.

### Rules

As usual, our community is awesome at improving the Falco rules!

This release brings a bunch of improvements to various macros, lists, and rules. Take a look at the [changelog (rules section)](https://github.com/falcosecurity/falco/releases/tag/0.28.0) for details about them.

Three 3️⃣ new rules, `Debugfs Launched in Privileged Container`, and `Mount Launched in Privileged Container`, and `Sudo Potential Privilege Escalation` (very useful to promptly alert you about [CVE-2021-3156](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-3156)) have also been introduced.

## What's next 🔮

We have a scheduled [0.28.1](https://github.com/falcosecurity/falco/milestone/18) release on May 4th 2021!

As usual, the final release date will be discussed during the [Falco Community Calls](https://github.com/falcosecurity/community).

As always, we are going to have bug fixes and improvements.

## Let's meet 🤝

As always, we meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

- Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
- [Join the Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors! Falco reached 100 contributors, but also all the other Falco projects are receiving a vital amount of contributions every day.

Keep up the good work!

Bye!

Leo
