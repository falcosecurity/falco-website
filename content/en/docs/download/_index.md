---
title: Download
description: Officially supported Falco artifacts
aliases:
- ../install-operate/download
- ../getting-started/download
weight: 20
---

Falco and its ecosystem components are available as downloadable files and OCI (Open Container Initiative) artifacts. This page provides the official URLs for accessing these artifacts.

For a comprehensive overview of the available artifacts and their versioning, refer to the [Falco release documentation](https://github.com/falcosecurity/falco/blob/master/RELEASE.md).

### Packages {#packages}

The tables below provides quick links for Falco packages hosted at [download.falco.org](https://download.falco.org/?prefix=packages/).

| Packages | Download for Linux **x86_64** |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rpm              | [![rpm](https://img.shields.io/badge/Falco-{{< latest >}}--x86_64.rpm-%2300aec7?style=flat-square)](https://download.falco.org/packages/rpm/falco-{{< latest >}}-x86_64.rpm)        |
| deb              | [![deb](https://img.shields.io/badge/Falco-{{< latest >}}--x86_64.deb-%2300aec7?style=flat-square)](https://download.falco.org/packages/deb/stable/falco-{{< latest >}}-x86_64.deb) |
| binary           | [![tgz](https://img.shields.io/badge/Falco-{{< latest >}}--x86_64.tar.gz-%2300aec7?style=flat-square)](https://download.falco.org/packages/bin/x86_64/falco-{{< latest >}}-x86_64.tar.gz) |


| Packages | Download for Linux **aarch64** |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rpm              | [![rpm](https://img.shields.io/badge/Falco-{{< latest >}}--aarch64.rpm-%2300aec7?style=flat-square)](https://download.falco.org/packages/rpm/falco-{{< latest >}}-aarch64.rpm)        |
| deb              | [![deb](https://img.shields.io/badge/Falco-{{< latest >}}--aarch64.deb-%2300aec7?style=flat-square)](https://download.falco.org/packages/deb/stable/falco-{{< latest >}}-aarch64.deb) |
| binary           | [![tgz](https://img.shields.io/badge/Falco-{{< latest >}}--aarch64.tar.gz-%2300aec7?style=flat-square)](https://download.falco.org/packages/bin/aarch64/falco-{{< latest >}}-aarch64.tar.gz) |


### Container images {#images}

{{% pageinfo color="primary" %}}
When using Falco for [Kernel Events](/docs/event-sources/kernel/) (i.e. with the `syscall` data source enabled), the Falco binary relies on having a {{< glossary_tooltip text="driver" term_id="drivers" >}} available on the host system.

Starting from Falco 0.38.0, the default driver is the [modern eBPF driver](/docs/event-sources/kernel/#modern-ebpf-probe), which is included in the Falco binary and built using the [CO-RE "Compile Once - Run Everywhere"](https://en.wikipedia.org/wiki/EBPF#eBPF_CO-RE_(Compile_Once_-_Run_Everywhere)) technology. If your system statisfies the modern eBPF driver requirements, you don't need to use a `*-driver-loader` nor an image with the building toolchain included.

In brief, you can just use the `falcosecurity/falco-no-driver` image if you are either:
 - using the [modern eBPF driver](/docs/event-sources/kernel/#modern-ebpf-probe) (default option) 
 - or if you are using only [plugin data sources](/docs/event-sources/plugins/).
{{% /pageinfo %}}


The preferred installation method is to install the driver using the native artifacts defined above or
temporarily run the `falcosecurity/falco-driver-loader` image as privileged, then using the `falcosecurity/falco-no-driver`.

For more details, see the [Run within Docker section](/docs/install-operate/running/#docker).

For Kubernetes deployments, see the [Deployment section](/docs/install-operate/deployment/#kubernetes).

The tables below provides quick pull commands for Falco container images hosted at [Docker Hub](https://hub.docker.com/r/falcosecurity).

|tag | pull command | description |
|----|----------|-----------------|
|[latest](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:latest` | The most recent version |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:<version>` | A specific version of Falco such as `{{< latest >}}` |
|[latest](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:latest` | The most recent version of `falco-driver-loader` with the building toolchain |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:<version>` | A specific version of `falco-driver-loader` such as `{{< latest >}}` with the building toolchain |
|[latest](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:latest` | The most recent version with the `falcoctl driver` tool included |
|[*version*](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:<version>` | A specific version of Falco such as `{{< latest >}}` with `falcoctl driver` tool included |

### Rules {#rules}

The Falco packages and container images come with a built-in ruleset file (including only rules with [maturity stable level](https://github.com/falcosecurity/rules/blob/main/CONTRIBUTING.md#maturity-levels)). Those rules and others with different maturity levels are available as downloadable files at [download.falco.org](https://download.falco.org/?prefix=rules/) and are also available as OCI artifacts (refer to [falcoctl](#falcoctl) documentation for donwloading and installing OCI artifacts).

### Plugins {#plugins}

[Plugins](https://github.com/falcosecurity/plugins) hosted by The Falco Project are available as downloadable packages at [download.falco.org](https://download.falco.org/?prefix=plugins/) and are also available as OCI artifacts (refer to [falcoctl](#falcoctl) documentation for donwloading and installing OCI artifacts).

### Drivers {#drivers}

{{% pageinfo color="primary" %}}

When using Falco for [Kernel Events](/docs/event-sources/kernel/) (i.e. with the `syscall` data source enabled), the Falco binary relies on having a {{< glossary_tooltip text="driver" term_id="drivers" >}} available on the host system.

Starting from Falco 0.38.0, the default driver is the [modern eBPF driver](/docs/event-sources/kernel/#modern-ebpf-probe), which is included in the Falco binary and built using the [CO-RE "Compile Once - Run Everywhere"](https://en.wikipedia.org/wiki/EBPF#eBPF_CO-RE_(Compile_Once_-_Run_Everywhere)) technology. If your system statisfies the modern eBPF driver requirements, no further action is needed. Otherwise, you need use the [legacy eBPF driver](/docs/event-sources/kernel/#legacy-ebpf-probe) or the [kernel module driver](/docs/event-sources/kernel/#kernel-module-driver), which provides wider compatibility.

In brief, you don't need to install a driver if you are either:
 - using the [modern eBPF driver](/docs/event-sources/kernel/#modern-ebpf-probe) (default option) 
 - or if you are using only [plugin data sources](/docs/event-sources/plugins/).

{{% /pageinfo %}}

Pre-built Falco driver for a vast variety of Linux Kernel releases are distribujited at [download.falco.org](https://download.falco.org/?prefix=driver/).

To download a pre-built driver, navigate to the driver versions' directory that is compatible with the Falco binary you're currently using (check with `falco --version`), then download the kernel artifact corresponding to your kernel release (`uname -r`) for either `.ko` (kernel module) or `.o` (legacy eBPF driver). To make this easier, Falco comes with the [falcoctl](https://github.com/falcosecurity/falcoctl) tool that automates the driver download (or tries to build it on the fly). The [Install](/docs/install-operate/installation/) guide will explain this more and the text blob below also has more information.
.

### Tools {#tools}

#### Falcoctl {#falcoctl}

#### Helm Charts {#helm-charts}