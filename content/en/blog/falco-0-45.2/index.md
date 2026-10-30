---
title: "Falco 0.45.2: security updates and a look back at 0.45.1"
date: 2026-10-30
author: Leonardo Grasso
slug: falco-0-45-2
tags: ["Falco", "Release"]
---

Hey Falco community,

**Falco 0.45.2 is available!** This patch brings certificate trust updates and newer security dependencies, alongside the reliability fixes delivered in 0.45.1. Since we did not publish a separate announcement for 0.45.1, let's catch up on both releases here.

If you are running 0.45.0 or 0.45.1, we recommend upgrading to **0.45.2**. And if you are heading to KubeCon in Salt Lake City, we would love to meet you there!

The main focus of 0.45.2 is the response to the [eMudhra intermediate CA compromise](https://emudhra.we-have-a-problem.com/). Clients that still trust the affected certificate chains can accept certificates used to impersonate HTTPS services. Updating the trust stores used by those clients is part of addressing that risk.

We refreshed the CA trust stores in both the default Wolfi and Debian Falco images, along with the driver-loader images. The **Buster driver loader remains available**, with its trust store corrected as well. The release also bundles **Falcoctl 0.14.3** and the **container plugin 0.7.6**, incorporating upstream Go security updates. See the [packaging changes](https://github.com/falcosecurity/falco/pull/4051) for details.

For installations using DEB or RPM packages, please apply your distribution's CA certificate updates too. If your deployment supplies a custom CA bundle, make sure that bundle is updated as well.

We also updated the bundled **OpenSSL to 3.5.9 LTS**. There is a compatibility change to keep in mind: its default TLS security level is now **2**. RSA, DSA, and DH keys must be at least 2048 bits, and elliptic-curve keys at least 224 bits. Check legacy HTTPS endpoints before upgrading, since weaker keys or parameters can cause TLS connections to fail. The [OpenSSL update](https://github.com/falcosecurity/falco/pull/4053) includes the details.

**The fixes from 0.45.1 are included too.** They address several problems that can interrupt a running Falco deployment or make upgrades harder:

- **Prometheus metrics:** fixed a race that could crash Falco when a metrics scrape overlapped with event processing. [Details](https://github.com/falcosecurity/falco/pull/4022).
- **File output:** with `keep_alive: true`, Falco now reports a failed write and attempts to reopen the file on the next alert. This allows later alerts to be written once a problem such as a full filesystem is resolved. The failed alert is not replayed. [Details](https://github.com/falcosecurity/falco/pull/4036).
- **Configuration and rules reloads:** files disappearing from watched directories during watch setup no longer cause Falco to exit. [Details](https://github.com/falcosecurity/falco/pull/4018).
- **Package installation:** DEB and RPM packages no longer remain half-configured when the host cannot run modern eBPF, for example on Ubuntu 20.04 with kernel 5.4. Such hosts still need a compatible engine, such as the kernel module. [Details](https://github.com/falcosecurity/falco/pull/4037).

Falco 0.45.1 also introduced **libs 0.26.1** and **driver 11.0.1+driver**, which remain in 0.45.2. These include corrections to `evt.deltatime` in JSON output and `proc.ppid.duration`, plus modern eBPF compatibility and task-scan fixes. The full changes are in the [library release notes](https://github.com/falcosecurity/libs/releases/tag/0.26.1) and [driver release notes](https://github.com/falcosecurity/libs/releases/tag/11.0.1%2Bdriver).

The container plugin received fixes across both patches as well. Version [0.7.5](https://github.com/falcosecurity/plugins/releases/tag/plugins/container/v0.7.5) corrected listener shutdown during reloads. Version [0.7.6](https://github.com/falcosecurity/plugins/releases/tag/plugins/container/v0.7.6) also applies the configured `engine_timeout` to container metadata lookups after startup.

If you use **Falcosidekick**, please update that deployment to [2.35.1](https://github.com/falcosecurity/falcosidekick/releases/tag/2.35.1) too. It has its own certificate trust and Go security updates, and upgrading Falco alone does not update a separately deployed Falcosidekick.

For Kubernetes users, [**Falco Helm chart 9.2.2**](https://github.com/falcosecurity/charts/releases/tag/falco-9.2.2) is also available. It defaults to **Falco 0.45.2**, **Falcoctl 0.14.3**, and the **container plugin 0.7.6**. The optional Falcosidekick deployment uses **2.35.1** when enabled and remains disabled by default. Review any explicit image or plugin version overrides in your values when upgrading.

You can find packages and image tags on the [Falco 0.45.2 release page](https://github.com/falcosecurity/falco/releases/tag/0.45.2). The [installation documentation](https://falco.org/docs/setup/) covers the available deployment options. If you pin Falcoctl or plugins independently, remember to update those pins alongside Falco.

**Come meet us at KubeCon!** [KubeCon + CloudNativeCon North America 2026](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/) takes place **November 9-12 in Salt Lake City**. Whether you already run Falco, are trying it for the first time, or are curious about contributing, come say hello.

Join **Leonardo Grasso and Alessandro Cannarella** for our Falco Maintainer Track session, [**Falco Never Flies Alone: Runtime Security as an Ecosystem**](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1289719), on **Thursday, November 12, from 2:40 to 3:10 PM MST (UTC-7)**, at the **Salt Palace, Level 2, room 251 D-F**. We will talk about Falco's recent developments, the ecosystem around it, and where the project is heading.

You can also find us at the **Falco kiosk P-11A**, in the **Project Pavilion, Solutions Showcase, Level 1, Hall 5, Cosmic Canyon zone** of the Salt Palace. Falco has morning slots on **Tuesday, November 10; Wednesday, November 11; and Thursday, November 12**. The [official kiosk directory](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/features-add-ons/project-engagement/#project-pavilion-kiosk-directory) has the current hours.

Bring your questions, tell us how you use Falco, or let us know what would make it work better for you. If you have been thinking about your first contribution, we would be happy to help you find a place to start.

Thanks to everyone who reported issues, tested fixes, and contributed to these releases. See you in Salt Lake City! 🙏
