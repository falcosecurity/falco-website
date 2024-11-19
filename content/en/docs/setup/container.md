---
title: Deploy as a container
description: Learn how to run and manage Falco as a container
slug: container
aliases:
- ../install-operate/running
- ../getting-started/running
weight: 20
---

{{% pageinfo color="primary" %}}
Falco consumes streams of events and evaluates them against a set of security {{< glossary_tooltip text="rules" term_id="rules" >}} to detect abnormal behavior. By default, Falco is preconfigured to consume events from the Linux Kernel. This scenario requires Falco to be privileged, and depending on the kernel version installed on the node, a {{< glossary_tooltip text="driver" term_id="drivers" >}} will be installed on the node. Since orchestration systems like Kubernetes are out of scope for this section, it's up to the user to manage the container lifecycle and deployment across the nodes.

For other installation scenarios, such as consuming cloud events or other data sources using plugins, please refer to the [Plugins](docs/plugins/) section.
{{% /pageinfo %}}

## Install

This section describes how to run the Falco userspace process in a container using one of the released [container images](/docs/download#images).

By default, Falco is preconfigured to consume events from the Linux Kernel. For this default installation scenario, Falco can be run in two ways:

- [Fully Privileged](#docker-privileged)
- [Least Privileged (Recommended)](#docker-least-privileged)

Different instructions apply to each method depending on the driver used. Note that the **{{< glossary_tooltip text="Modern eBPF" term_id="modern-ebpf-probe" >}} does not require driver installation**.

### Fully Privileged {#docker-privileged}

To run Falco in a container using Docker with full privileges, use the following commands:

#### Modern eBPF {#docker-privileged-modern-ebpf}

The {{< glossary_tooltip text="Modern eBPF" term_id="modern-ebpf-probe" >}} is bundled into the Falco binary. This allows you to run Falco without dependencies by using the following command:

```shell
docker pull falcosecurity/falco:latest
docker run --rm -it \
           --privileged \
           -v /var/run/docker.sock:/host/var/run/docker.sock \
           -v /proc:/host/proc:ro \
           -v /etc:/host/etc:ro \
           falcosecurity/falco:latest
```

#### Kernel Module {#docker-privileged-kernel-module}

For the {{< glossary_tooltip text="Kernel Module" term_id="kernel-module-driver" >}} driver, Falco requires the driver to be installed on the host system first.

1. Install the driver on the host system using the `falcosecurity/falco-driver-loader` image, as described in the [Driver Installation](#driver-installation-kernel-module) section.

2. Run Falco:

    ```shell
    docker pull falcosecurity/falco:latest
    docker run --rm -it \
        --privileged \
        -v /var/run/docker.sock:/host/var/run/docker.sock \
        -v /dev:/host/dev \
        -v /proc:/host/proc:ro \
        -v /etc:/host/etc:ro \
        falcosecurity/falco:latest falco -o engine.kind=kmod
    ```


#### eBPF Probe {#docker-privileged-ebpf}

For the {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}} driver, Falco requires the probe to be prepared and stored on the host system first (under `/root/.falco`).

1. Install the driver on the host system using the `falcosecurity/falco-driver-loader` image, as described in the [Driver Installation](#driver-installation-ebpf-probe) section.

2. Run Falco:

    ```shell
    docker pull falcosecurity/falco:latest
    docker run --rm -it \
        --privileged \
        -v /var/run/docker.sock:/host/var/run/docker.sock \
        -v /root/.falco:/root/.falco \
        -v /proc:/host/proc:ro \
        -v /etc:/host/etc:ro \
        falcosecurity/falco:latest falco -o engine.kind=ebpf

    # If running a kernel version < 4.14, add '-v /sys/kernel/debug:/sys/kernel/debug:ro \' to the above docker command.
    ```

### Least Privileged (Recommended) {#docker-least-privileged}

To run Falco in a container using Docker with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), you can use the following commands depending on the driver you want to use.

#### Modern eBPF {#docker-least-privileged-modern-ebpf}

```shell
docker pull falcosecurity/falco:latest
docker run --rm -it \
           --cap-drop all \
           --cap-add sys_admin \
           --cap-add sys_resource \
           --cap-add sys_ptrace \
           -v /var/run/docker.sock:/host/var/run/docker.sock \
           -v /proc:/host/proc:ro \
           -v /etc:/host/etc:ro \
           falcosecurity/falco:latest
```

{{% pageinfo color="primary" %}}

The minimum set of capabilities to run Falco with the {{< glossary_tooltip text="Modern eBPF" term_id="modern-ebpf-probe" >}} driver are:

- `CAP_SYS_PTRACE`
- `CAP_SYS_RESOURCE`
- `CAP_BPF`
- `CAP_PERFMON`

However, in the command above, we use `CAP_SYS_ADMIN` because [Docker does not yet support](https://github.com/moby/moby/pull/41563) `CAP_BPF` and `CAP_PERFMON`.

{{% /pageinfo %}}

#### Kernel Module {#docker-least-privileged-kernel-module}

For the {{< glossary_tooltip text="Kernel Module" term_id="kernel-module-driver" >}} driver, Falco requires the driver to be installed on the host system first. This step requires full privileges, while the Falco container can then run with the least privileges.

1. Install the driver on the host system using the `falcosecurity/falco-driver-loader` image, as described in the [Driver Installation](#driver-installation-kernel-module) section.

2. Run Falco using the `falcosecurity/falco` image with the least privileges:

    ```shell
    docker pull falcosecurity/falco:latest
    docker run --rm -it \
        -e HOST_ROOT=/ \
        --cap-add SYS_PTRACE --pid=host $(ls /dev/falco* | xargs -I {} echo --device {}) \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v /etc:/host/etc:ro \
        falcosecurity/falco:latest falco -o engine.kind=kmod
    ```

{{% pageinfo color="primary" %}}

Note that `ls /dev/falco* | xargs -I {} echo --device {}` outputs a `--device /dev/falcoX` option per CPU (i.e., just the devices created by the Falco's kernel module). Also, `-e HOST_ROOT=/` is necessary since with `--device` there is no way to remap devices to `/host/dev/`.
{{% /pageinfo %}}

{{% pageinfo color="warning" %}}
If you are running Falco on a system with the AppArmor LSM enabled (e.g., Ubuntu), you must also pass `--security-opt apparmor:unconfined` to the `docker run` command above.

You can verify if you have AppArmor enabled using the command below:

```shell
docker info | grep -i apparmor
```
{{% /pageinfo %}}

#### eBPF Probe {#docker-least-privileged-ebpf-probe}

For the {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}} driver, Falco requires the probe to be prepared and stored on the host system first (under `/root/.falco`). This step requires full privileges, after which the Falco container can run with the least privileges.

1. Install the driver on the host system using the `falcosecurity/falco-driver-loader` image, as described in the [Driver Installation](#driver-installation-ebpf-probe) section.

2. Run Falco using the `falcosecurity/falco` image with the least privileges:

    ```shell
    docker pull falcosecurity/falco:latest
    docker run --rm -it \
        --cap-drop all \
        --cap-add sys_admin \
        --cap-add sys_resource \
        --cap-add sys_ptrace \
        -v /var/run/docker.sock:/host/var/run/docker.sock \
        -v /root/.falco:/root/.falco \
        -v /etc:/host/etc \
        -v /proc:/host/proc:ro \
        falcosecurity/falco:latest falco -o engine.kind=ebpf

    # If running a kernel version < 4.14, add '-v /sys/kernel/debug:/sys/kernel/debug:ro \' to the above Docker command.
    ```

{{% pageinfo color="warning" %}}

If you are running Falco on a system with the AppArmor LSM enabled (e.g., Ubuntu), you must also pass `--security-opt apparmor:unconfined` to
the `docker run` command above.

To verify if AppArmor is enabled, use the command below:

```shell
docker info | grep -i apparmor
```

{{% /pageinfo %}}

{{% pageinfo color="primary" %}}

To run Falco with the least privileges using the eBPF probe, the following capabilities are required:

- On kernels <5.8, Falco requires `CAP_SYS_ADMIN`, `CAP_SYS_RESOURCE`, and `CAP_SYS_PTRACE`.
- On kernels >=5.8, `CAP_BPF` and `CAP_PERFMON` were separated from `CAP_SYS_ADMIN`, so the required capabilities are `CAP_BPF`, `CAP_PERFMON`, `CAP_SYS_RESOURCE`, `CAP_SYS_PTRACE`. Unfortunately, Docker does not yet support adding the two newly introduced capabilities with the `--cap-add` option. For this reason, we continue using `CAP_SYS_ADMIN`, which still allows performing the same operations granted by `CAP_BPF` and `CAP_PERFMON`. In the near future, Docker will support adding these two capabilities, and we will be able to replace `CAP_SYS_ADMIN`.

{{% /pageinfo %}}

## Driver Installation {#driver-installation}

This section provides instructions for installing the driver on the host system using the `falcosecurity/falco-driver-loader` image. This approach is helpful if you prefer to install the driver on the host first and then run Falco in a container later.

Driver installation on the host is only required for the {{< glossary_tooltip text="Kernel Module" term_id="kernel-module-driver" >}} and {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}} drivers. 

You can **skip this section** if you plan to use the {{< glossary_tooltip text="Modern eBPF" term_id="modern-ebpf-probe" >}}.

{{% pageinfo color="primary" %}}
When using the eBPF probe or kernel module drivers, the driver loader attempts to either download a prebuilt driver or build it on the fly as a fallback. Starting with Falco 0.38, the driver loader has improved functionality to automatically retrieve the required kernel headers for distributions supported by [driverkit](https://github.com/falcosecurity/driverkit). This enhancement ensures that the necessary kernel headers are available to dynamically build the appropriate driver—whether it is the {{< glossary_tooltip text="Kernel Module" term_id="kernel-module-driver" >}} or the {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}}.

However, if the driver loader cannot automatically fetch the required kernel headers, you may need to install them manually on the host as a prerequisite. For detailed instructions on manual installation, refer to the [Installation section](/docs/getting-started/installation).
{{% /pageinfo %}}

{{% pageinfo color="primary" %}}
The `falcosecurity/falco-driver-loader:latest` is based on a recent Debian image. For ancient kernel versions, this might not work. The alternative `falcosecurity/falco-driver-loader:latest-buster` (based on an older Debian image) may work in such a case.
{{% /pageinfo %}}

### Kernel Module {#driver-installation-kernel-module}

To install the kernel module driver on the host system, you can use the following command:

```shell
docker pull falcosecurity/falco-driver-loader:latest
docker run --rm -it \
    --privileged \
    -v /root/.falco:/root/.falco \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco-driver-loader:latest kmod
```

### eBPF Probe {#driver-installation-ebpf-probe}

To install the eBPF probe driver on the host system, you can use the following command:

```shell
docker pull falcosecurity/falco-driver-loader:latest
docker run --rm -it \
    --privileged \
    -v /root/.falco:/root/.falco \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco-driver-loader:latest ebpf
```

## Verify Image Signing

All official container images for Falco, starting from version 0.35.0, are signed with [cosign](https://github.com/sigstore/cosign). To verify the signature, you can run the following command:

```shell
cosign verify docker.io/falcosecurity/falco:{{< latest >}} \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  --certificate-identity-regexp=https://github.com/falcosecurity/falco/ \
  --certificate-github-workflow-ref=refs/tags/{{< latest >}}
```

Replace `docker.io/falcosecurity/falco` with any official Falco image (`falco`, `falco-driver-loader`) from any official container registry to verify other images.

If you have your own container registry and wish to retain the signature while copying Falco images, you can simply use the cosign copy command:

```shell
cosign copy docker.io/falcosecurity/falco:{{< latest >}} your-registry/falco:{{< latest >}}
```

And you'll be able to easily verify that the image in your registry was not tampered with!

## Configuration

You can configure Falco by either:

- Passing the `-o` command line flag to the Docker run command
- Or by mounting a custom configuration file into the container (e.g., `-v /path/to/falco.yaml:/etc/falco/falco.yaml`)

Further configurable options via environment variables include (to be passed with `-e` with Docker):

- `FALCOCTL_DRIVER_REPOS` - See the [Installing the Driver](https://falco.org/docs/getting-started/installation/#install-driver) section.
- `SKIP_DRIVER_LOADER` - Set this environment variable to avoid running `falcoctl driver` tool when the `falcosecurity/falco` image starts. Useful when the driver has already been installed on the host by other means.