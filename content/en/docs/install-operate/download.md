---
title: Download
description: Officially supported Falco artifacts
weight: 2
---

The Falco Project community only supports two ways for downloading and running Falco:

 - Running Falco directly on a Linux host
 - Running the Falco userspace program in a container, with a driver installed on the underlying host.

Below you can find artifacts for both.


### Download for Linux {#packages}

|        | development                                                                                                                 | stable                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| rpm    | [![rpm-dev](https://img.shields.io/badge/dynamic/xml?color=%2300aec7&style=flat-square&label=Falco&query=substring-before%28substring-after%28%28%2F%2A%5Bname%28%29%3D%27ListBucketResult%27%5D%2F%2A%5Bname%28%29%3D%27Contents%27%5D%29%5Blast%28%29%5D%2F%2A%5Bname%28%29%3D%27Key%27%5D%2C%22falco-%22%29%2C%22.asc%22%29&url=https%3A%2F%2Ffalco-distribution.s3-eu-west-1.amazonaws.com%2F%3Fprefix%3Dpackages%2Frpm-dev%2Ffalco-)][1] | [![rpm](https://img.shields.io/badge/dynamic/xml?color=%2300aec7&style=flat-square&label=Falco&query=substring-before%28substring-after%28%28%2F%2A%5Bname%28%29%3D%27ListBucketResult%27%5D%2F%2A%5Bname%28%29%3D%27Contents%27%5D%29%5Blast%28%29%5D%2F%2A%5Bname%28%29%3D%27Key%27%5D%2C%22falco-%22%29%2C%22.asc%22%29&url=https%3A%2F%2Ffalco-distribution.s3-eu-west-1.amazonaws.com%2F%3Fprefix%3Dpackages%2Frpm%2Ffalco-)][2] |
| deb    | [![deb-dev](https://img.shields.io/badge/dynamic/xml?color=%2300aec7&style=flat-square&label=Falco&query=substring-before%28substring-after%28%28%2F%2A%5Bname%28%29%3D%27ListBucketResult%27%5D%2F%2A%5Bname%28%29%3D%27Contents%27%5D%29%5Blast%28%29%5D%2F%2A%5Bname%28%29%3D%27Key%27%5D%2C%22falco-%22%29%2C%22.asc%22%29&url=https%3A%2F%2Ffalco-distribution.s3-eu-west-1.amazonaws.com%2F%3Fprefix%3Dpackages%2Fdeb-dev%2Fstable%2Ffalco-)][3] | [![deb](https://img.shields.io/badge/dynamic/xml?color=%2300aec7&style=flat-square&label=Falco&query=substring-before%28substring-after%28%28%2F%2A%5Bname%28%29%3D%27ListBucketResult%27%5D%2F%2A%5Bname%28%29%3D%27Contents%27%5D%29%5Blast%28%29%5D%2F%2A%5Bname%28%29%3D%27Key%27%5D%2C%22falco-%22%29%2C%22.asc%22%29&url=https%3A%2F%2Ffalco-distribution.s3-eu-west-1.amazonaws.com%2F%3Fprefix%3Dpackages%2Fdeb%2Fstable%2Ffalco-)][4] |
| binary | [![bin-dev](https://img.shields.io/badge/dynamic/xml?color=%2300aec7&style=flat-square&label=Falco&query=substring-after%28%28%2F%2A%5Bname%28%29%3D%27ListBucketResult%27%5D%2F%2A%5Bname%28%29%3D%27Contents%27%5D%29%5Blast%28%29%5D%2F%2A%5Bname%28%29%3D%27Key%27%5D%2C%20%22falco-%22%29&url=https%3A%2F%2Ffalco-distribution.s3-eu-west-1.amazonaws.com%2F%3Fprefix%3Dpackages%2Fbin-dev%2Fx86_64%2Ffalco-)][5] | [![bin](https://img.shields.io/badge/dynamic/xml?color=%2300aec7&style=flat-square&label=Falco&query=substring-after%28%28%2F%2A%5Bname%28%29%3D%27ListBucketResult%27%5D%2F%2A%5Bname%28%29%3D%27Contents%27%5D%29%5Blast%28%29%5D%2F%2A%5Bname%28%29%3D%27Key%27%5D%2C%20%22falco-%22%29&url=https%3A%2F%2Ffalco-distribution.s3-eu-west-1.amazonaws.com%2F%3Fprefix%3Dpackages%2Fbin%2Fx86_64%2Ffalco-)][6] |

The list of all available artifacts can be found [here](https://download.falco.org/?prefix=packages/).

---

### Download container images {#images}

{{% pageinfo color="primary" %}}
Falco depends on having a driver installed on the host system to get information about the running system calls.

The preferred installation method is to install the driver using the native artifacts defined above or
temporarily run the `falcosecurity/falco-driver-loader` image as privileged, then using the `falcosecurity/falco-no-driver`.

For more details, see the [Run within Docker section](/docs/getting-started/running#docker).

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

[1]: https://download.falco.org/?prefix=packages/rpm-dev/
[2]: https://download.falco.org/?prefix=packages/rpm/
[3]: https://download.falco.org/?prefix=packages/deb-dev/stable/
[4]: https://download.falco.org/?prefix=packages/deb/stable/
[5]: https://download.falco.org/?prefix=packages/bin-dev/x86_64/
[6]: https://download.falco.org/?prefix=packages/bin/x86_64/
