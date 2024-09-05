---
title: Deploy as a container
description: Learn how to run and manage Falco as a container
slug: container
weight: 20
---

Falco consumes streams of events and evaluates them against a set of security rules to detect abnormal behavior. By default, Falco is preconfigured to consume events from the Linux Kernel. This scenario requires Falco to be privileged, and depending on the kernel version installed on the node, a [driver](/docs/event-sources/kernel/) will be installed on the node. Since orchestration systems like Kubernetes are out of scope for this section, it's up to the user to manage the container lifecycle and the deployment across the nodes.


{{% pageinfo color="primary" %}}
Please refer to the TBD section for other installation scenarios, such as consuming cloud events or other data sources using plugins.
{{% /pageinfo %}}


## Install

This is how the Falco userspace process can be run in a container using one of the official [container images](/docs/download#images).

By default, Falco is preconfigured to consume events from the Linux Kernel. For this default installation scenario, Falco can be run in two ways:

- [Fully privileged](#docker-privileged)
- [Least privileged (recommended)](#docker-least-privileged)

Different instructions apply to each method depending on the driver used. Note that the **modern eBPF does not need a driver installation**.


### Driver installation {#driver-installation}

This section provides instructions for installing the driver on the host system using the `falcosecurity/falco-driver-loader` image. This approach is helpful if you prefer to install the driver on the host first and then run Falco in a container later.

Driver installation on the host is only required for the [eBPF probe](/docs/event-sources/drivers/#ebpf-probe) and [kernel module](/docs/event-sources/drivers/#kernel-module) drivers when these drivers are installed in separate stages.

You can **skip this section** if you plan to use:
- The [modern eBPF](/docs/event-sources/drivers/#modern-ebpf-probe) driver; or
- The fully privileged method with the `falcosecurity/falco` image.

{{% pageinfo color="primary" %}}
When using the eBPF probe or kernel module drivers, the driver loader attempts to either download a prebuilt driver or build it on the fly as a fallback.

Starting with Falco 0.38, the driver loader has improved functionality to automatically retrieve the required kernel headers for distributions supported by [driverkit](https://github.com/falcosecurity/driverkit). This enhancement ensures that the necessary kernel headers are available to dynamically build the appropriate driver—whether it is the [kernel module](/docs/event-sources/drivers/#kernel-module) or the [eBPF probe](/docs/event-sources/drivers/#ebpf-probe).

However, if the driver loader cannot automatically fetch the required kernel headers, you may need to install them manually on the host as a prerequisite. For detailed instructions on manual installation, refer to the [Installation section](/docs/getting-started/installation).
{{% /pageinfo %}}

#### eBPF probe {#driver-installation-ebpf-probe}

To install the eBPF probe driver on the host system, you can use the following command:

```shell
docker pull falcosecurity/falco-driver-loader:latest
docker run --rm -i -t \
    --privileged \
    -v /root/.falco:/root/.falco \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco-driver-loader:latest ebpf
```

#### Kernel module {#driver-installation-kernel-module}

To install the the kernel module driver on the host system, you can use the following command:

```shell
docker pull falcosecurity/falco-driver-loader:latest
docker run --rm -i -t \
    --privileged \
    -v /root/.falco:/root/.falco \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco-driver-loader:latest kmod
```

### Fully privileged {#fully-privileged}

To run Falco in a container using Docker with full privileges use the following commands.

#### Modern eBPF {#fully-privileged-modern-ebpf}

The modern eBPF is bundled into Falco. Therefore, the `falco-no-driver` image is enough to run Falco. This allows you to run Falco without dependencies, just the following command:

```bash
docker pull falcosecurity/falco-no-driver:latest
docker run --rm -i -t \
           --privileged \
           -v /var/run/docker.sock:/host/var/run/docker.sock \
           -v /proc:/host/proc:ro \
           -v /etc:/host/etc:ro \
           falcosecurity/falco-no-driver:latest
```

#### eBPF probe {#fully-privileged-ebpf}

To use Falco with the eBPF probe driver:

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -e FALCO_DRIVER_LOADER_OPTIONS="ebpf" \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest falco -o engine.kind=ebpf

# Please remember to add '-v /sys/kernel/debug:/sys/kernel/debug:ro \' to the above docker command
# if you are running a kernel version < 4.14
```

{{% pageinfo color="primary" %}}
Alternativelly, you can install the driver on the host system first, then run Falco in a separate container. In such case:
1. Install the driver on the host system using the `falcosecurity/falco-driver-loader` image, as described in the [Driver installation](#driver-installation-ebpf-probe) section.
2. Replace `falcosecurity/falco:latest` with `falcosecurity/falco-no-driver:latest` in the above command.
{{% /pageinfo %}}


#### Kernel module {#fully-privileged-kernel-module}

To use Falco with the Kernel module driver:

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest falco -o engine.kind=kmod
```

{{% pageinfo color="primary" %}}
Alternativelly, you can install the driver on the host system first, then run Falco in a separate container. In such case:
1. Install the driver on the host system using the `falcosecurity/falco-driver-loader` image, as described in the [Driver installation](#kernel-module-driver-installation-kernel-module) section.
2. Replace `falcosecurity/falco:latest` with `falcosecurity/falco-no-driver:latest` in the above command.
{{% /pageinfo %}}

### Least privileged (recommended) {#least-privileged}

To run Falco in a container using Docker with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), you can use the following commands depending on the driver you want to use.

#### Modern eBPF {#least-privileged-modern-ebpf}

```bash
docker run --rm -i -t \
           --cap-drop all \
           --cap-add sys_admin \
           --cap-add sys_resource \
           --cap-add sys_ptrace \
           -v /var/run/docker.sock:/host/var/run/docker.sock \
           -v /proc:/host/proc:ro \
           -v /etc:/host/etc:ro \
           falcosecurity/falco-no-driver:latest
```

{{% pageinfo color="primary" %}}

The minimun set of capabilities to run Falco with the Modern eBPF driver are:

- `CAP_SYS_PTRACE`
- `CAP_SYS_RESOURCE`
- `CAP_BPF`
- `CAP_PERFMON`

However, in the command we use `CAP_SYS_ADMIN` because [docker doesn't support](https://github.com/moby/moby/pull/41563) `CAP_BPF` and `CAP_PERFMON` yet.

{{% /pageinfo %}}

#### eBPF probe {#least-privileged-ebpf-probe}

In the case of the eBPF probe driver, Falco needs the probe to be prepared and stored on the host system first. This first step requires full privileges and stores the probe under `/root/.falco`, while the Falco container can be run with the least privileges.

1. Install the driver on the host system using the `falcosecurity/falco-driver-loader` image, as described in the [Driver installation](#driver-installation-ebpf-probe) section.

2. Run Falco using the `falcosecurity/falco-no-driver` image with the least privileges:

    ```shell
    docker pull falcosecurity/falco-no-driver:latest
    docker run --rm -i -t \
        --cap-drop all \
        --cap-add sys_admin \
        --cap-add sys_resource \
        --cap-add sys_ptrace \
        -v /var/run/docker.sock:/host/var/run/docker.sock \
        -v /root/.falco:/root/.falco \
        -v /etc:/host/etc \
        -v /proc:/host/proc:ro \
        falcosecurity/falco-no-driver:latest falco -o engine.kind=ebpf

    # Please remember to add '-v /sys/kernel/debug:/sys/kernel/debug:ro \' to the above docker command
    # if you are running a kernel version < 4.14
    ```

{{% pageinfo color="warning" %}}

If you are running Falco on a system with the AppArmor LSM enabled (e.g Ubuntu), you will also need to pass `--security-opt apparmor:unconfined` to
the `docker run` command above.

You can verify if you have AppArmor enabled using the command below:

```bash
docker info | grep -i apparmor
```

{{% /pageinfo %}}

{{% pageinfo color="primary" %}}

To run Falco in the least privileged with the eBPF probe, the following capabilities are required:

- on kernels <5.8, Falco requires `CAP_SYS_ADMIN`, `CAP_SYS_RESOURCE` and `CAP_SYS_PTRACE`
- on kernels >=5.8, `CAP_BPF` and `CAP_PERFMON` were separated out of `CAP_SYS_ADMIN`, so the required capabilities are `CAP_BPF`, `CAP_PERFMON`, `CAP_SYS_RESOURCE`, `CAP_SYS_PTRACE`. Unfortunately, Docker does not yet support adding the two newly introduced capabilities with the `--cap-add` option. For this reason, we continue using `CAP_SYS_ADMIN`, given that it still allows performing the same operations granted by `CAP_BPF` and `CAP_PERFMON`. In the near future, Docker will support adding these two capabilities and we will be able to replace `CAP_SYS_ADMIN`.

{{% /pageinfo %}}

#### Kernel module {#least-privileged-kernel-module}

In the case of the kernel module driver, Falco needs the driver to be installed on the host system first. This first step requires full privileges, while the Falco container can be run with the least privileges.

1. Install the driver on the host system using the `falcosecurity/falco-driver-loader` image, as described in the [Driver installation](#kernel-module-driver-installation-kernel-module) section.

2. Run Falco using the `falcosecurity/falco-no-driver` image with the least privileges:

    ```shell
    docker pull falcosecurity/falco-no-driver:latest
    docker run --rm -i -t \
        -e HOST_ROOT=/ \
        --cap-add SYS_PTRACE --pid=host $(ls /dev/falco* | xargs -I {} echo --device {}) \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v /etc:/host/etc:ro \
        falcosecurity/falco-no-driver:latest falco -o engine.kind=kmod
    ```

{{% pageinfo color="primary" %}}

Note that `ls /dev/falco* | xargs -I {} echo --device {}` outputs a `--device /dev/falcoX` option per CPU (ie. just the devices created by the Falco's kernel module). Also, `-e HOST_ROOT=/` is necessary since with `--device` there is no way to remap devices to `/host/dev/`.

{{% /pageinfo %}}

{{% pageinfo color="warning" %}}

If you are running Falco on a system with the AppArmor LSM enabled (e.g Ubuntu), you will also need to pass `--security-opt apparmor:unconfined` to
the `docker run` command above.

You can verify if you have AppArmor enabled using the command below:

```bash
docker info | grep -i apparmor
```

{{% /pageinfo %}}


## Configuration

You can configure Falco by either:

- Passing the `-o` command line flag to the docker run command
- Or by mounting a custom configuration file into the container (e.g. `-v /path/to/falco.yaml:/etc/falco/falco.yaml`)

Further, other configurable options via environment variables include (to be passed with `-e` with docker):

- `FALCOCTL_DRIVER_REPOS` - See the [Installing the driver](https://falco.org/docs/getting-started/installation/#install-driver) section.
- `SKIP_DRIVER_LOADER` - Set this environment variable to avoid running `falcoctl driver` tool when the `falcosecurity/falco` image starts. Useful when the driver has been already installed on the host by other means.