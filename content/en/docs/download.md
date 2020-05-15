---
title: Download
description: Officially supported Falco artifacts
weight: 2
---

## Downloading

The Falco Project community only supports two ways for downloading and running Falco:

 - Running Falco directly on a Linux host
 - Running the Falco userspace program in a container, with a kernel driver installed on the underlying host.
 
Below you can find artifacts for both. 


### Download for Linux

|        | development                                                                                                                 | stable                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| rpm    | [![rpm-dev](https://img.shields.io/bintray/v/falcosecurity/rpm-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][1] | [![rpm](https://img.shields.io/bintray/v/falcosecurity/rpm/falco?label=Falco&color=%23005763&style=flat-square)][2] |
| deb    | [![deb-dev](https://img.shields.io/bintray/v/falcosecurity/deb-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][3] | [![deb](https://img.shields.io/bintray/v/falcosecurity/deb/falco?label=Falco&color=%23005763&style=flat-square)][4] |
| binary | [![bin-dev](https://img.shields.io/bintray/v/falcosecurity/bin-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][5] | [![bin](https://img.shields.io/bintray/v/falcosecurity/bin/falco?label=Falco&color=%23005763&style=flat-square)][6] |

The list of all available artifacts can be found [here](https://bintray.com/falcosecurity).

---

### Download container images

{{< info >}}

Falco depends on having a driver installed on the host system to parse system calls
The preferred installation method is to install the driver using the native artifacts defined above or 
temporarily run the `falcosecurity/falco-driver-loader` image as privileged, finally using the `falcosecurity/falco-no-driver` that does not require to be privileged.

{{< /info >}}

|tag | pull command | description |
|----|----------|-----------------|
|[latest](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco-no-driver:latest` | The most recent version pushed to the registry |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:<version>` | A specific version of Falco such as `{{< latest >}}` |

The list of all available images can be found [here](https://github.com/falcosecurity/falco/tree/master/docker).

[1]: https://dl.bintray.com/falcosecurity/rpm-dev
[2]: https://dl.bintray.com/falcosecurity/rpm
[3]: https://dl.bintray.com/falcosecurity/deb-dev/stable
[4]: https://dl.bintray.com/falcosecurity/deb/stable
[5]: https://dl.bintray.com/falcosecurity/bin-dev/x86_64
[6]: https://dl.bintray.com/falcosecurity/bin/x86_64