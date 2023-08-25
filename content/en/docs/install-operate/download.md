---
title: Download
description: Officially supported Falco artifacts
aliases: [/docs/download/,/docs/getting-started/download]
weight: 20
---

The Falco Project supports two ways for downloading and running Falco:

 - Running Falco directly on a Linux host.
 - Running Falco in a container.

Below, we are sharing the download links for the Falco artifacts. The Falco [release](https://github.com/falcosecurity/falco/blob/master/RELEASE.md) document provides more details about the artifacts and their versioning. Additionally, we have a dedicated [Deployment](/docs/install-operate/deployment/) guide that explains a Kubernetes scenario using the option of running Falco in a container.

### Download for Linux {#packages}

The tables below provides quick links for the artifacts from our [packages](https://download.falco.org/?prefix=packages/) store. The `.tar.gz` directory includes subfolders for both `x86_64` and `aarch64` architectures, whereas the `rpm` and `deb` packages are all located in the same folder for each architecture.

| Packages | Download for **x86_64** |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rpm              | [![rpm](https://img.shields.io/badge/Falco-{{< latest >}}--x86_64.rpm-%2300aec7?style=flat-square)](https://download.falco.org/packages/rpm/falco-{{< latest >}}-x86_64.rpm)        |
| deb              | [![deb](https://img.shields.io/badge/Falco-{{< latest >}}--x86_64.deb-%2300aec7?style=flat-square)](https://download.falco.org/packages/deb/stable/falco-{{< latest >}}-x86_64.deb) |
| binary           | [![tgz](https://img.shields.io/badge/Falco-{{< latest >}}--x86_64.tar.gz-%2300aec7?style=flat-square)](https://download.falco.org/packages/bin/x86_64/falco-{{< latest >}}-x86_64.tar.gz) |


| Packages | Download for **aarch64** |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rpm              | [![rpm](https://img.shields.io/badge/Falco-{{< latest >}}--aarch64.rpm-%2300aec7?style=flat-square)](https://download.falco.org/packages/rpm/falco-{{< latest >}}-aarch64.rpm)        |
| deb              | [![deb](https://img.shields.io/badge/Falco-{{< latest >}}--aarch64.deb-%2300aec7?style=flat-square)](https://download.falco.org/packages/deb/stable/falco-{{< latest >}}-aarch64.deb) |
| binary           | [![tgz](https://img.shields.io/badge/Falco-{{< latest >}}--aarch64.tar.gz-%2300aec7?style=flat-square)](https://download.falco.org/packages/bin/aarch64/falco-{{< latest >}}-aarch64.tar.gz) |

If you use Falco for non-syscall events, such as some plugins, only download the Falco artifact and skip the next instruction.

When using Falco for syscall monitoring, the Falco binary relies on having Falco's kernel driver available, which can fit into two paradigms based on its type:

1. Falco with modern BPF driver: Download the Falco binary artifact; the driver is already included in the binary, made possible by the CO-RE "Compile Once - Run Everywhere" feature, so no further action is needed.
2. Falco with kernel module or traditional BPF driver: Also, download the Falco binary artifact, and additionally, download the kernel artifact corresponding to your kernel release (`uname -r`) for either `.ko` (kernel module) or `.o` (BPF driver) from the [driver](https://download.falco.org/?prefix=driver/) store. Navigate to the driver versions' directory that is compatible with the Falco binary (check with `falco --version`). To make this easier, Falco has a `falco-driver-loader` component that automates the driver download or tries to build it. The [Install](/docs/install-operate/installation/) guide will explain this more and the text blob below also has more information.

Falco also relies on both a [configuration](https://github.com/falcosecurity/falco/blob/master/falco.yaml) file and at least one Falco [rules](https://github.com/falcosecurity/rules) file. The default versions of these files come with the packages and the [Install](/docs/install-operate/installation/) covers additional tips and tricks for utilizing `falcoctl` in managing rules.

---

### Download container images {#images}

{{% pageinfo color="primary" %}}
Falco depends on having a {{< glossary_tooltip text="driver" term_id="drivers" >}} installed on the host system to get information about the running system calls.

The preferred installation method is to install the driver using the native artifacts defined above or
temporarily run the `falcosecurity/falco-driver-loader` image as privileged, then using the `falcosecurity/falco-no-driver`.

For more details, see the [Run within Docker section](/docs/install-operate/running/#docker).

For Kubernetes deployments, see the [Deployment section](/docs/install-operate/deployment/#kubernetes).

{{% /pageinfo %}}

|tag | pull command | description |
|----|----------|-----------------|
|[latest](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:latest` | The most recent version |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:<version>` | A specific version of Falco such as `{{< latest >}}` |
|[latest](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:latest` | The most recent version of `falco-driver-loader` with the building toolchain |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:<version>` | A specific version of `falco-driver-loader` such as `{{< latest >}}` with the building toolchain |
|[latest](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:latest` | The most recent version with the `falco-driver-loader` included |
|[*version*](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:<version>` | A specific version of Falco such as `{{< latest >}}` with `falco-driver-loader` included |

The list of all available images can be found [here](https://github.com/falcosecurity/falco/tree/master/docker).
