---
title: Falco 0.33.0 a.k.a. "the pumpkin release 🎃"
date: 2022-10-19
author: Jason Dellaluce, Jacque Salinas
slug: falco-0-33-0
tags: ["Falco","Release"]
---

Dear community, today we are happy to announce the release of Falco 0.33.0 🎉!

A big thank you to the community for helping get the latest release over the finish line. The Falco community rallied behind this release and we wanted to share some of the latest novelties you’ll find in this most recent launch. To read a more detailed account of the release, check out [v0.33.0 in the changelog](https://github.com/falcosecurity/falco/releases/tag/0.33.0).

## What’s New? 🗞️

In this release we saw **more than 160 pull requests** across the repos of Falco and the libraries. We had a total of **20+ individual contributors**. We’d like to give a special shout-out to [Andrea Terzolo](https://github.com/Andreagit97) and [Melissa Kilby](https://github.com/incertum) for standing out as two of the most high-impact contributors for this release.

The project really seems to be more alive than ever! Thank you to our maintainers and contributors, as this would not happen without your support.

## Updates - TLDR; 🚀

In release *v0.33.0* the community focused on addressing the following updates & changes: 
- Libs now allow individual selection of which syscalls to collect during live captures, which helps Falco improve performance and reduce dropped events
- Introduced the [Kernel Crawler](https://github.com/falcosecurity/kernel-crawler), a new tool that automatically identifies the most up to date kernel versions supported by popular distros
- Syscall kernel ring-buffer size is now customizable for your environment needs
- Mitigations for libsinsp’s Kubernetes metadata client to address recent issues that caused Falco to crash
- Support for multiple simultaneous event sources, which means that you can now run multiple event sources in the same Falco instance
- Added minikube as a supported platform in the driver loader and included it in our driver build matrix
- Rule alert rate limiter is now optional and disabled at default
- Support for two new syscalls and many improvements to the default Falco security ruleset

### Selecting Interesting Syscalls ⚙️

A historical challenge when using Falco with a large system was to keep up with large amounts of kernel events. In the past, this was mitigated by what used to be called “*simple consumer mode*”, through which Falco discarded kernel events that were not useful for runtime security purposes. However, we lacked support for individually selecting which syscalls had to be collected and which to discard. This feature has been requested by the community for a while, as it is a great bonus point for both Falco and all other projects based on top of the Falco libraries. In this release, we refactored the whole system and introduced new *libsinsp* APIs that allow to individually **select which syscalls and tracepoint events** need to be instrumented for collection in the kernel. Now, Falco has higher control over collected security events, and is able to improve performance and reduce the amount of dropped events. At the same time, other projects can easily **consume only the events they need** without any additional instrumentation overhead.

### Kernel Crawler 🔍

When deploying Falco, one of the biggest challenges has been to compile its drivers (kernel module or eBPF probe) for the specific kernel versions and customization you wish to instrument. To help our community, the Falco project has created prebuilt kernel modules and eBPF probes for widely-adopted distros and kernel versions. We have also provided a "*driver loader*" script that takes care of downloading and installing them before attempting local compilation. The build matrix has so far been constructed manually depending on the community demand and contributions, which makes it very hard to keep up with the most recent kernel versions.

Recently, the [Kernel Crawler](https://github.com/falcosecurity/kernel-crawler) joined the Falco ecosystem as a tool that automatically searches for the **most up to date kernels** supported by multiple Linux distros (huge thanks to [Federico Di Pierro](https://github.com/FedeDP) for leading the effort). This helped us to dramatically expand our driver build matrix, and keeps it up to date with the latest kernel versions supported by the most popular distros without the need of manual intervention. This is a major step forward for Falco’s adoption, which we now expect to grow even further. Moreover, the Kernel Crawler populates [**an open database**](https://falcosecurity.github.io/kernel-crawler) with all the information it collects. This is both a **reference of the kernel versions** and the distros supported by Falco, and a useful source of information for communities working in the space of kernel instrumentation like we couldn’t find on the internet so far.

### Customizing the Syscall Kernel Ring-Buffer Size 💍

The ring-buffer is the shared piece of memory between Falco and the drivers in which all kernel events are pushed upon collection for Falco to consume them. When Falco is not able to keep up with the high throughput of events pushed, the buffer becomes full and some events are inevitably dropped.

Thanks to the great effort driven by Andrea Terzolo and Melissa Kilby, the syscall kernel ring-buffer **size is now variable and configurable**. In some cases, tuning this size may lead to **better performance** and **less event drops** on certain machines and environments. If you’re interested, check out the discussion at [falcosecurity/libs#584](https://github.com/falcosecurity/libs/pull/584). 

### Mitigations for Kubernetes Metadata Client ☸️

Starting from June’s Falco release, we included minor fixes for the Kubernetes client bundled inside *libsinsp*. This is the piece of code responsible for downloading metadata from your API server and populating fields in your security rules such as `k8s.deployment.name`, `k8s.rc.name`, etc. However, this causes Falco to receive too much data in certain situations, and to eventually crash. You can find more details in the following issue: [falcosecurity/falco#1909](https://github.com/falcosecurity/falco/issues/1909).

Finding a stable and permanent solution is still being researched, as the problem of data overload has some intrinsic complexity. In this release, we introduced some short term solutions that prevent Falco from crashing in those scenarios by discarding useless information and handling errors gracefully. However, the big problem identified is that the Kubernetes cluster provides too much data, and we will keep looking for optimal solutions to this challenge in the future.

### Running Multiple Simultaneous Event Sources 🚴

Wouldn’t it be nice if Falco could multi-task? Well, now it sorta can! We are delighted to announce that in this release Falco can now **run multiple event sources in parallel**. What does this mean? Well, it means that you can run plugins *and* syscall collections on the same Falco instance.

Historically, Falco supported consuming events from one source only. The only exception was the legacy support of the Kubernetes Audit Events, which allowed receiving those events and kernel events simultaneously. However, it was non-standard and has been substituted in favor of a plugin-based solution starting from Falco 0.32.0. Up until now, this meant that to consume events from more than one event source, users needed to deploy many instances of Falco, each configured with a different source.

This is a huge improvement and also **brings back support for running syscall and k8s audit logs** in the same Falco instance, for all the folks who were interested in doing so. For insights about the principles and rationale behind this release, follow the discussion at [falcosecurity/falco#2074](https://github.com/falcosecurity/falco/issues/2074).

Please note that this feature introduces **few user-facing changes** to be aware of when updating. The primary one is that the syscall event sources will always be enabled by default if not explicitly disabled. So, please make sure you pass `--disable-source=syscall` to the Falco CLI if you’re interested in a plugin-only deployment! You can find more details in [the documentation](/docs/event-sources/#configuring-event-sources).

### Supporting minikube in the Driver Loader 📥

We now offer new prebuilt drivers for the three most recent major version releases of minikube, which is a **newly-supported platform** for the Falco driver loader.

In general, it’s not possible to compile the Falco drivers locally when deploying on minikube, so in the past we needed to wait for a new minikube release to bundle the most recent Falco drivers. Thanks to the new Kernel Crawler, and great work carried out by [Aldo Lacuku](https://github.com/alacuku), our driver build grid now supports and auto-discovers the driver configurations for minikube and provides users with pre-built drivers to download with the driver loader. This **reduces release delays** to the bare minimum, and running Falco on minikube has never been easier!

### Disabling Alert Rate Limiter at Default ❗

Falco provides a throttling mechanism for reducing the number of rule alerts, with the purpose of reducing noise in some environments. However, some users found concerns in this approach, as in the discussion at [falcosecurity/falco#1333](https://github.com/falcosecurity/falco/issues/1333).

Falco v0.33.0 makes the **rate limiter optional**, and disables it in the default configuration, so that there is never a risk of discarding important alerts. At the same time, the feature is still present and configurable for everyone who needs to reduce Falco’s noise in their environment.

### Updates on Syscall Coverage and Security Rules 🛡️

Call and you shall receive! Okay, that’s not exactly how that saying goes, but we acknowledged the importance of instrumentation coverage and critical updates to syscalls. After all, the power of Falco’s runtime security lies in the visibility it has over the system it gets deployed into. With this new release, Falco supports the collection of two new syscalls to ensure we keep those pesky hackers away: `fsconfig` and `mlock2`.

On top of that, there have been **major updates** to the default set of security rules bundled in Falco.

Since the last release, three new security rules have been added. Special thanks go to [hi120ki](https://github.com/hi120ki) for having been very active in maintaining the security rules over the past few months, and much of his work will be part of the next Falco releases as well. For v0.33.0, the new rules are:

- **Directory traversal monitored file read**: detects attacks based on directory traversal
- **Modify Container Entrypoint**: detects attacks based on [CVE-2019-5736](https://github.com/advisories/GHSA-gxmr-w5mj-v8hh)
- **Read environment variable from /proc files**: detects attempts to read process environment variables

Additionally, existing rules have been updated to become **less noisy** and **more optimized**. Huge thanks to Melissa Kilby for taking the initiative to clean up the ruleset by disabling by default all the rules that were proved to never be triggered by Falco. This is a great step forward helping Falco be more performant by having fewer rules to evaluate at runtime.

## What's Next? 🔮

It’s time to try out the new release! Here are some pointers for getting started with Falco:

* [Container Images](/docs/getting-started/running/#docker)
  * `falco` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco))
  * `falco-no-driver` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-no-driver), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-no-driver))
  * `falco-driver-loader` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-driver-loader), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-driver-loader))
* [CentOS/Amazon Linux](/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](/docs/getting-started/installation/#debian)
* [openSUSE](/docs/getting-started/installation/#suse)
* [Linux binary package](/docs/getting-started/installation/#linux-binary)

But the party is far from being over! The community is preparing **lots of exciting updates** for the near future. Special mention goes to [the modern eBPF probe work](https://github.com/falcosecurity/libs/blob/master/proposals/20220329-modern-bpf-probe.md) led by Andrea Terzolo, which is under active development and should be rolled out by the next Falco release! Moreover, there has been plenty of work on [falcoctl](https://github.com/falcosecurity/falcoctl), and we can expect a new release of the tool to come soon and bring plenty of exciting novelties in the ecosystem! 

## Stay Tuned 🤗

**Join us** in our communication channels and in our weekly community calls! It’s always great to have new members in the community and we’re looking forward to having your feedback and hearing your ideas.

You can find all the most up to date information at https://falco.org/community/.

See ya! 👋

*Jason and Jacque*
