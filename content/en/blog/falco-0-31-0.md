---
title: Falco 0.31.0 a.k.a. "the Gyrfalcon"
date: 2022-01-31
author: Jason Dellaluce, Leonardo Grasso
slug: falco-0-31-0
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.31.0**, a.k.a the **Gyrfalcon** 🦅!

Gyrfalcons are the largest of the falcon species, just like this version of Falco has **the biggest changelog** ever released. To give you some metrics, since the last release, the [falco](https://github.com/falcosecurity/falco) and [libs](https://github.com/falcosecurity/libs) repositories counted **30+** individual contributors, **130+** pull requests, and **360+** commits 🤯. The Falco community proved to be more active than ever, and we wanted to say a huge **THANK YOU** 🙏 💖 to everyone involved.

## The highlights

The changes are too many to list them all, so we'll just try to cover the highlights of the core features and topics. In case you want to go deep, here's the full [Falco's changelog](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0310) and the [list of changes in libs](https://github.com/falcosecurity/libs/compare/3aa7a83bf7b9e6229a3824e3fd1f4452d1e95cb4...319368f1ad778691164d33d59945e00c5752cd27).


### Plugin system

**Falco 0.31.0** finally ships with the brand **new plugin system** 🎉 ! Many things have changed since the [initial proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20210501-plugin-system.md), and the feature is finally stable and production-ready. 

Falco historically monitored system events from the kernel trying to detect malicious behavior on Linux nodes. In time, it got upgraded to also process K8S Audit Logs to detect suspicious activity in K8S clusters too. Now, **the next step in the evolution of Falco** is a plugin framework that standardizes how additional event sources can be attached to the engine and how more information can be extracted from those events. 

Plugins can be written in almost any language of your preference. If you want to know more about how this works, take a look at the [official documentation](https://falco.org/docs/plugins/) 📖. More or less, this is what the architecture of Falco looks like right now.

![New architecture of Falco](/img/falco-architectural-overview-plugins.png)

To do the honors, this release of Falco comes with the [**AWS Cloudtrail** plugin](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail) and **a new ad-hoc ruleset** already packaged-in 📦 ! With these, **Falco receives Cloudtrail logs** from your infrastructure and sends alerts when suspicious activity happens, such as when the permissions of an S3 bucket  are changed unexpectedly or when someone logs in without MFA. This is a great start to **better integrating Falco into your infrastructure**, and we expect more extensions like this to come!

Of course, you may wonder how hard it is to develop a Falco extension for your use cases. No worries, because the development experience was one of our top priorities, and we prepared two **SDKs** for writing Falco plugins in **Go** and **C++**:

- **Plugin SDK Go** 👉 https://github.com/falcosecurity/plugin-sdk-go
- **Plugin SDK C++** 👉 https://github.com/falcosecurity/plugin-sdk-cpp

The SDKs are lightweight and allow you to develop Falco plugins with **few lines of code**! We put special attention to the **Go SDK** since Go is a well-appreciated language in the cloud-native community. Check out [some examples](https://github.com/falcosecurity/plugin-sdk-go/tree/main/examples) and get started in a few minutes ⌚!

The Falco Community also maintains an [**official registry**](https://github.com/falcosecurity/plugins#plugin-registry) 📒 that keeps track of all the plugins acknowledged and recognized across the community. This serves both to make the **plugin ecosystem more accessible** to the community and for technical details such as [reserving a specific plugin ID](https://falco.org/docs/plugins/#plugin-event-ids).

We expect plugins to be a **game-changer**, with the potential of making Falco evolve to the next level and become an all-in-one tool for **cloud runtime security**.


### Drivers and libs improvements 

Relevant **performance optimization** has been introduced in the drivers to drop all the non-monitored events right at the kernel level, which reduces ring buffer contention and **decreases the drop** rate 👉 [libs#115](https://github.com/falcosecurity/libs/pull/115).

The drivers added support to some **new security-critical syscalls**: [`openat2`](https://github.com/falcosecurity/libs/pull/80), [`execveat`](https://github.com/falcosecurity/libs/pull/141), [`mprotect`](https://github.com/falcosecurity/libs/pull/174)! Also, the [`is_exe_writable`](https://github.com/falcosecurity/libs/pull/97) flag was added to the `execve` syscalls family.

The **eBPF probe** received many improvements regarding **stability and support** for some compiler and kernel versions (e.g., with clang5, amznlinux2) 👉 [libs#109](https://github.com/falcosecurity/libs/pull/109), [libs#140](https://github.com/falcosecurity/libs/pull/140), [libs#126](https://github.com/falcosecurity/libs/pull/126), [libs#96](https://github.com/falcosecurity/libs/pull/96), [libs#81](https://github.com/falcosecurity/libs/pull/81), [libs#179](https://github.com/falcosecurity/libs/pull/179), [libs#185](https://github.com/falcosecurity/libs/pull/185).

Issues arising when processing **huge container metadata** have been solved by introducing a new **LARGE block type**, which dramatically increases the maximum block size supported 👉 [libs#102](https://github.com/falcosecurity/libs/pull/102).

Finally, a lot of effort has been put into **upgrading** critical dependencies and supporting **more architectures and platforms** 👉 [libs#91](https://github.com/falcosecurity/libs/pull/91), [libs#164](https://github.com/falcosecurity/libs/pull/164).

### Other Falco novelties

Plugins apart, Falco received a few **other significant updates**:
- Ability to set User-Agent HTTP header when sending HTTP output 👉 [falco#1850](https://github.com/falcosecurity/falco/pull/1850).
- Support to arbitrary-depth nested values in YAML configuration 👉 [falco#1792](https://github.com/falcosecurity/falco/pull/1792).
- **Lua files** used to load/compile rules are now **bundled** into the Falco executable 👉 [falco#1843](https://github.com/falcosecurity/falco/pull/1843).
- Linux packages are now signed with SHA256 👉 [falco#1758](https://github.com/falcosecurity/falco/pull/1758).
- Some **fixes in the rule parser** of the Falco engine 👉 [falco#1777](https://github.com/falcosecurity/falco/pull/1777), [falco#1775](https://github.com/falcosecurity/falco/pull/1775).
- Finally, we moved the fully statically-linked build of Falco to another package, and the usual *binary* package switched back to a regular build (that was needed to allow plugins to be dynamically loaded). You can find both package flavors in our [download repository](https://download.falco.org/?prefix=packages/bin/).


### Rule updates

The default ruleset 🛡️ includes few relevant **new rules** 👇
 - [Create Hardlink Over Sensitive Files](https://github.com/falcosecurity/falco/pull/1810)
 - [Launch Remote File Copy Tools in Container](https://github.com/falcosecurity/falco/pull/1771)

Existing rules, macros, and lists received **some updates** too, in particular with regards to **possible bypasses** 👇
- [Sudo Potential Privilege Escalation](https://github.com/falcosecurity/falco/pull/1810)
- [Detect crypto miners using the Stratum protocol](https://github.com/falcosecurity/falco/pull/1810)
- [spawned_process](https://github.com/falcosecurity/falco/pull/1868), [sensitive_mount](https://github.com/falcosecurity/falco/pull/1815)
- [falco_hostnetwork_images](https://github.com/falcosecurity/falco/pull/1681), [deb_binaries](https://github.com/falcosecurity/falco/pull/1860), [known_sa_list](https://github.com/falcosecurity/falco/pull/1760), [falco_sensitive_mount_images](https://github.com/falcosecurity/falco/pull/1817)


## What's next?

Many efforts are already ongoing to improve Falco's quality and stability. Two **important proposals for libs** ([versioning and release process](https://github.com/falcosecurity/libs/blob/master/proposals/20210524-versioning-and-release-of-the-libs-artifacts.md) and [API versioning for user/kernel boundary](https://github.com/falcosecurity/libs/blob/master/proposals/20210818-driver-semver.md)) are in the making. Meanwhile, the community is already thinking about a **next-generation eBPF probe** 🐝. Likely, **many new plugins** will come out soon 🚀 !

Furthermore, we believe it's time to renovate 🧹. For example, many parts of the codebase need to be re-designed or refactored: K8S Audit log should be rewritten as a plugin, various issues with the rule language parser/compiler, ARM compatibility should become officially supported, and much more.

So, stay tuned. The **next release** may surprise you 😉 !


## Let's meet!


As always, we meet every week in our [community calls](https://github.com/falcosecurity/community). If you want to know the latest and the greatest you should join us there!



If you would like to find out more about Falco 👇

* Get involved in the [Falco community](https://falco.org/community/).
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/messages/falco).
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).

Cheers 🥳 👋 !

Jason & Leonardo
