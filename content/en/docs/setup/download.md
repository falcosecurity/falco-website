---
title: Download
description: Officially supported Falco artifacts
aliases:
- ../download
- ../install-operate/download
- ../getting-started/download
weight: 99
---

Falco and its ecosystem components are available as downloadable files and OCI (Open Container Initiative) artifacts. This page provides the official URLs for accessing these artifacts.

For a comprehensive overview of the available artifacts and their versioning, refer to the [Falco release documentation](https://github.com/falcosecurity/falco/blob/master/RELEASE.md).

### Packages {#packages}

{{% pageinfo color="primary" %}}
For installation instructions, refer to the [Install on a host (DEB, RPM)](/docs/setup/packages/) or the [Install on a host (tarball)](/docs/setup/tarball/) pages.
{{% /pageinfo %}}

The tables below provide quick links for Falco packages hosted at [download.falco.org](https://download.falco.org/?prefix=packages/). 

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
For deployment instructions, refer to the [Deploy as a container](/docs/setup/containers/) or the [Deploy on Kubernetes](/docs/setup/kubernetes/) pages.
{{% /pageinfo %}}

The tables below provide quick pull commands for Falco container images hosted at [Docker Hub](https://hub.docker.com/r/falcosecurity).

|tag | pull command | description |
|----|----------|-----------------|
|[latest](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:latest` | Distroless image with the latest released of Falco. No tools are included in the image. |
|[*version*](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:<version>` | Distroless image with a specific version of Falco such as `{{< latest >}}`. No tools are included in the image. |
|[latest-debian](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:latest-debian` | Debian-based image with the latest released of Falco. Available since Falco 0.40. |
|[*version*-debian](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:<version>-debian` | Debian-based image with a specific version of Falco such as `{{< latest >}}`. Available since Falco 0.40. |
|[latest](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:latest` | Debian-based image with the most recent Falco driver loader and the building toolchain. |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:<version>` | Debian-based image with specific version of `falco-driver-loader` such as `{{< latest >}}` and the building toolchain. |
|[latest-buster](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:latest` | Same as `falco-driver-loader:latest` but based on Debian `buster`. Available since Falco 0.40. |
|[*version*-buster](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:<version>` | Same as `falco-driver-loader:<version>` but based on Debian `buster`. Available since Falco 0.40. |

### Rules {#rules}

The Falco packages and container images come with a built-in ruleset file (including only rules with [maturity stable level](https://github.com/falcosecurity/rules/blob/main/CONTRIBUTING.md#maturity-levels)). Those rules and others with different maturity levels are available as downloadable files at [download.falco.org](https://download.falco.org/?prefix=rules/) and are also available as OCI artifacts (refer to [falcoctl](#falcoctl) documentation for downloading and installing OCI artifacts).

### Plugins {#plugins}

[Plugins](https://github.com/falcosecurity/plugins) hosted by The Falco Project are available as downloadable packages at [download.falco.org](https://download.falco.org/?prefix=plugins/) and are also available as OCI artifacts (refer to [falcoctl](#falcoctl) documentation for downloading and installing OCI artifacts).

### Drivers {#drivers}

{{% pageinfo color="primary" %}}

When using Falco for [Kernel Events](/docs/event-sources/kernel/) (i.e., with the `syscall` data source enabled), the Falco binary relies on having a {{< glossary_tooltip text="driver" term_id="drivers" >}} available on the host system.

Starting from Falco 0.38.0, the default driver is the {{< glossary_tooltip text="Modern eBPF" term_id="modern-ebpf-probe" >}} driver, which is included in the Falco binary and built using the [CO-RE "Compile Once - Run Everywhere"](https://en.wikipedia.org/wiki/EBPF#eBPF_CO-RE_(Compile_Once_-_Run_Everywhere)) technology. If your system satisfies the modern eBPF driver requirements, no further action is needed. Otherwise, you need to use the {{< glossary_tooltip text="Kernel Module" term_id="kernel-module-driver" >}}, which provides wider compatibility.

In brief, you don't need to install a driver if you are either:
 - using the [modern eBPF driver](/docs/event-sources/kernel/#modern-ebpf-probe) (default option) 
 - or if you are using only [plugin data sources](/docs/event-sources/plugins/).

{{% /pageinfo %}}

Pre-built Falco drivers for a vast variety of Linux Kernel releases are distributed at [download.falco.org](https://download.falco.org/?prefix=driver/).

To download a pre-built driver, navigate to the driver versions' directory that is compatible with the Falco binary you're currently using (check with `falco --version`), then download the kernel artifact corresponding to your kernel release (`uname -r`) for either `.ko` (kernel module) or `.o` (legacy eBPF driver, deprecated). To make this easier, Falco comes with the [falcoctl](https://github.com/falcosecurity/falcoctl) tool that automates the driver download (or tries to build it on the fly). The [Install](/docs/install-operate/installation/) guide will explain this more, and the text blob below also has more information.

### Tools {#tools}

#### Falcoctl {#falcoctl}

[falcoctl](https://github.com/falcosecurity/falcoctl) is a command-line tool that helps you manage Falco and its ecosystem components. It is included in the Falco distribution and can be used to download and install Falco drivers, rules, plugins, and other artifacts.

You can also manually download `falcoctl` from [GitHub releases](https://github.com/falcosecurity/falcoctl/releases).

#### Helm Charts {#helm-charts}

{{% pageinfo color="primary" %}}
For deployment instructions using Helm, please refer to the [Deploy on Kubernetes](/docs/setup/kubernetes/) page.
{{% /pageinfo %}}

The Falco Project provides various Helm charts and documentation for Falco and its ecosystem tools.

For detailed information about these charts, refer to the [Falco Helm Charts repository](https://github.com/falcosecurity/charts?tab=readme-ov-file#falco-helm-charts).
 
For information about how to download and install Helm, see the official Helm installation guide.

<a class="btn btn-primary" href="https://helm.sh/docs/intro/install/" role="button" aria-label="View Installing Helm Guide">View Installing Helm Guide</a>
