---
title: Falco 0.36.0
date: 2023-09-26
author: Luca Guerra, Andrea Terzolo, Rohith Raju
slug: falco-0-36-0
tags: ["Falco","Release"]
---

Dear Falco Community, today we are happy to announce the release of Falco 0.36.0!

This releases comes as usual with many new features and improvements. Thanks to everyone that worked on all the features, bugfixes and improvements! To read a detailed account of the release, see [v0.36.0 in the changelog](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0360).

During this release cycle, we merged more than 100 PRs on Falco and more than 150 PRs for libs and drivers, version 0.13.1 and version 6.0.1 respectively. Thank you to our maintainers and contributors, as this would not happen without your support and dedication!

This release comes with many **brand new features**, some long awaited **UX improvements and configuration** and also beware of some **breaking changes**! Don't worry, everything is explained below!


## What's new? TL;DR

In release v0.36.0, we focused on the following features:
- Brand new Falco [rule framework](#new-falco-rules-framework) and ruleset
- More robust executable [file path detection, symlink resolution and ancestors detection](#process-executable-and-lineage)
- Falco is [no longer limited to one rule](#multiple-rules-can-be-matched-on-each-event) firing per event!
- Signatures are now [automatically verified in Falcoctl](#falcoctl-cosign) for plugins and rules
- [Upgrade](#container-image-changes) of the default Falco images

We have also some massive experimental upgrades that the community has spent incredible amounts of effort on:
- [WASM support](#falco-wasm)
- [Kernel driver testing](#falco-kernel-testing-framework) *at scale*!
- Falco now has an experimental [distroless container image](#container-image-changes) based on Wolfi


## Breaking changes ⚠️

We have seen many requests from the community in the form of questions and issues. Those are the ones that shape the evolution of Falco, so we can hopefully make the user experience better at every release. Sometimes, in order to do this we need to implement changes that may impact some workflows. In this release we have important breaking changes you should be aware of:

- The default rules file that is shipped in the Falco image and/or can be downloaded via falcoctl as `falco-rules` is now a _stable_ rule file. This file **contains a much smaller number of rules** that are less noisy and have been vetted by the community. This serves as a much requested "starter" Falco rule set that covers many common use case. The rest of that file has been expanded and split into `falco-incubating-rules` and `falco-sandbox-rules`. Read more [below](#new-falco-rules-framework) to learn about the difference.
- The main `falcosecurity/falco` container image and its `falco-driver-loader` counterpart have been upgraded. Now they are able to compile the kernel module or classic eBPF probe for relatively newer version of the kernel (5.x and above) while we no longer ship toolchains to compile the kernel module for older versions in the default images. Downloading of prebuilt drivers and the modern eBPF will work exactly like before. The older image, meant for compatibility with older kernels (4.x and below), is currently retained as `falcosecurity/falco-driver-loader-legacy`.
- The Falco HTTP output no longer logs to stdout by default for performance reasons. You can set stdout logging preferences and restore the previous behavior with the configuration option `http_output.echo` in `falco.yaml`.
- The `--list-syscall-events` command line option has been replaced by `--list-events` which prints all supported system events (syscall, tracepoints, metaevents, internal plugin events) in addition to extra information about flags.
- The semantics of `proc.exepath` have changed. Now that field contains the executable path on disk even if the binary was launched from a symbolic link.
- The `-d` daemonize option has been removed.
- The `-p` option is now changed:
    - when only `-pc` is set Falco will print `container_id=%container.id container_image=%container.image.repository container_image_tag=%container.image.tag container_name=%container.name`
    - when `-pk` is set it will print as above, but with `k8s_ns=%k8s.ns.name k8s_pod_name=%k8s.pod.name` appended
- Command line options `s` and `stats-interval` have been removed in favor of `metrics` config in `falco.yaml`.

## Major features and improvements

### New Falco rules framework 🛡️

This project is the result of a discussions that started a long time ago and required a massive amount of work from the community. Following this [proposal](https://github.com/falcosecurity/rules/blob/main/proposals/20230605-rules-adoption-management-maturity-framework.md) we have decided to split the rules that the Falco community maintains into three main groups, described in the [maturity levels](https://github.com/falcosecurity/rules/blob/main/CONTRIBUTING.md#maturity-levels) section of the contributing guide:
- [Stable](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml) Falco rules. Those are the only ones that are bundled in the Falco by default. It is very important to have a set of stable rules vetted by the community. To learn more about the criterias that are required for a rule to become stable, see the [contributing guide](https://github.com/falcosecurity/rules/blob/main/CONTRIBUTING.md)
- [Incubating](https://github.com/falcosecurity/rules/blob/main/rules/falco-incubating_rules.yaml) rules, which provide a certain level of robustness guarantee but have been identified by experts as catering to more specific use cases, which may or may not be relevant for each adopter.
- [Sandbox](https://github.com/falcosecurity/rules/blob/main/rules/falco-sandbox_rules.yaml) rules, which are more experimental.

It is important to keep in mind that **the stable ruleset is significantly changed since the last release**! Not only the rules are a much smaller subset but they have been refined and they may have been renamed according to the style guide.

Thanks to Melissa Kilby for driving this effort 🚀!

The list of [releases](https://github.com/falcosecurity/rules/releases) for each type of rule is present in the repository, where you can download each file. They can also be downloaded from the [download page](https://download.falco.org/?prefix=rules/) and are also available as signed OCI artifacts for download via falcoctl!

Want to contribute to the rules? You can find more information in the [contribution guide](https://github.com/falcosecurity/rules/blob/main/CONTRIBUTING.md) and the [style guide](https://falco.org/docs/rules/style-guide/).


### Process executable and lineage 🪪

We have achieved a higher level of accuracy and data quality regarding the existing `proc.exepath` field and the process tree reconstruction in general. This step forward reinforces our commitment to refining Falco and providing you with an even better user experience.

In more detail:
- The `proc.exepath` process executable path field now contains a resolved version of the executable path, meaning that even if an executable was launched from a symlink, the field will show the original location of the binary. In the past, we resolved the exe argument in userspace by utilizing the process's cwd when the path was not absolute. Conversely, if exe was absolute, the `exepath` was equivalent to `exe`. The new implementation ensures the extraction of the authentic and accurate disk path of the executable when it resides on the disk.
- As it turns out, it's not that simple to reconstruct the complete process tree in a Linux system. The Linux kernel presents intriguing edge case behaviors, where the direct parent process might genuinely have already exited. In the past, Falco encountered difficulties in continuing to reconstruct the parent process lineage in such situations. To address this, we've enhanced Falco's logging capabilities. Now, even in scenarios where the parent process has exited, Falco can continue reconstructing the process tree.


### Container image changes 📦 

We have two big changes to our default container images:
- The **falco-driver-loader** image is now based on Debian Bookworm with a more modern version of compilers, meaning that it will be much easier to build on contemporary systems but you might see compilation issues for older kernels (4.x and below). For that, the **falco-driver-loader-legacy** image is provided! Also, this means that vulnerability scanners will not report so many false positive vulnerabilities in the new version of the image since it does not contain legacy versions of compilers.
- We have a **falco-distroless** image based on [Wolfi](https://github.com/wolfi-dev), thanks to contributions from [Adrian Mouat](https://github.com/amouat) and the Falco Supply Chain Security WG! This is for all of you that are fans of minimal images! You can try it out by replacing `falco-no-driver` with `falco-distroless`.

### Falcoctl ❤️ cosign

Since Falco 0.35.0 we started providing signed official container images signed with cosign in keyless mode. But how about our other OCI artifacts, which are **rules** and **plugins**? Starting from Falcoctl 0.6.1, shipped with this release, all of the official rules and plugins are signed and automatically verified at installation time thanks to the magic of [cosign](https://github.com/sigstore/cosign) in keyless mode!

Thanks to Massimiliano Giovagnoli for his help along with the Falco Supply Chain Security WG! Stay tuned for an in-depth explanation of the security architecture of this feature.

### Multiple rules can be matched on each event

Pro Falco users know that we could only match _one_ rule for each event. This is not true anymore, and since this version we have a `rule_matching` option in the configuration file. `rule_matching: all` will remove this limitation and match everything. See [the documentation in falco.yaml](https://github.com/falcosecurity/falco/blob/16a37e5c2e2797c5f3e0fecb3cfa41a0aadb4be8/falco.yaml#L304) for more information!

## Big experimental contributions

Last but not least, we have several big projects that we have started with the community and are very proud of.

### Falco Kernel Testing Framework

Falco supports a large number of Linux kernels. And the truth is, in order to test this kind of functionality you have to start an (ideally) equally large number of live Linux systems and load the driver there. This is absolutely not easy to do and just taking a look at the [task list](https://github.com/falcosecurity/libs/issues/1191) for such an endeavor gives you an idea of the complexity required. The results are awesome: you can find a matrix of kernels that are continuously tested for [x86_64](https://falcosecurity.github.io/libs/matrix_X64/) and [ARM](https://falcosecurity.github.io/libs/matrix_ARM64/) as well! See the [in-depth blog post](https://falco.org/blog/falco-kernel-testing/) to learn much more about this!

### Falco WASM

Flaco is excited to introduce its latest addition: the WebAssembly target. This new target has been developed exclusively for the Falco Playground using [Emscripten](https://emscripten.org/docs/tools_reference/emcc.html), where it brings essential core functionalities to the forefront. These functionalities include a rule compiler and the ability to reproduce events from capture files.
It’s worth noting that certain features, such as kernel modules and Kubernetes support, have been intentionally omitted from this wasm target. This omission is due to the inherent limitations of running these features within a web browser environment. falco.wasm can be found as a [github artifact](https://github.com/falcosecurity/falco/actions/workflows/ci.yml) in the latest workflow.

### Falco Playground

[Falco playground](https://falcosecurity.github.io/falco-playground/) is simple web application where you can create, edit and validate [falco rules](https://github.com/falcosecurity/rules). This is a quick solution for users wanting to easily check the accuracy of their custom rules. This application is completely client side and doesn’t make calls to any backend server. It leverages the power of [WebAssembly](https://webassembly.org/) to test your rules. You can [try it live](https://falcosecurity.github.io/falco-playground/) and find the code in the [falco-playground](https://github.com/falcosecurity/falco-playground) repository!

## Additional UX improvements

With each release, Falco gets more quality-of-life improvements, such as:
- Environment variables resolution in configuration files
- A new [outputs_queue](https://github.com/falcosecurity/falco/blob/16a37e5c2e2797c5f3e0fecb3cfa41a0aadb4be8/falco.yaml#L325) configuration option to better fine tune Falco's output performance

## Deprecated features

It's sad to see features go, but sometimes we need to remove something in order to focus on what matters for our adopters. This is what maintainers are proposing for deprecation in this release and removal in the next Falco version 0.37.0:

- The optional rate-limiter mechanism, since it seems to be no longer used and it also can discard events including potentially critical alerts
- The `--userspace` option, since the corresponding feature and the associated projects in the Falco organization have not been maintained for years
- The `falco-driver-loader` bash script. The driver loading functionality is going to be implemented in `falcoctl` to improve Falco's driver loading capabilities and make it easier to maintain and contribute to.

## Try it out

It’s time to try out the new release! Here are some pointers for getting started with Falco:

* [Container Images](/docs/getting-started/running/#docker)
  * `falco` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco))
  * `falco-no-driver` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-no-driver), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-no-driver))
  * `falco-driver-loader` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-driver-loader), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-driver-loader))
* [CentOS/Amazon Linux](/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](/docs/getting-started/installation/#debian)
* [openSUSE](/docs/getting-started/installation/#suse)
* [Linux binary package](/docs/getting-started/installation/#linux-binary)

## What next? 🔮

The community is active on many topics and we hope to deliver great features and many stability fixes once again during the next release cycle!

- The old `falco-driver-loader` script is showing its age and it's time to work on a more maintainable solution. `falcoctl` is a great candidate to host everything driver related, implement new features and make our lives easier when we need to install Falco drivers on a new machine.
- Lately we have expanded the syscall coverage that Falco can provide. We wish to improve these efforts across all drivers with even more 32 bit syscalls.
- Our rule framework is brand new and we forsee many improvements and active development work on it.
- The latest Falco versions brought many improvements to the plugin framework; we wish to use those to create a more scalable Kubernetes client plugin that will be able to withstand much heavier loads and will be easier to maintain.

And many, many, more enhancements!

## Stay tuned 🤗

**Join us** in our communication channels and in our weekly community calls! It’s always great to have new members in the community, and we’re looking forward to having your feedback and hearing your ideas.

You can find all the most up to date information at https://falco.org/community/.

See you for the next release!  

Enjoy,

_Luca, Andrea, Rohith_
