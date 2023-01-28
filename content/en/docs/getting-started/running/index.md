---
title: Running
description: Operating and Managing Falco
weight: 4
---

## Falco packages

If you installed the Falco packages using the `dialog` all your services should be already up and running, while if you chose the `Manual configuration` or if you used the `FALCO_FRONTEND=noninteractive` env variable you have to configure services by your hand. Here we show a simple example with the `eBPF probe`.

Let's imagine we want to start the `falco-bpf.service`.

1. Type `systemctl list-units | grep falco` to check that no unit is running.

2. Now you have to decide if you want the Falcoctl service running together with the Falco one or not. If yes you don't have to do anything, if no you have to mask the Falcoctl service with `systemctl mask falcoctl-artifact-follow.service`. As said [in this section](../installation.md#rule-update) the Falcoctl service is strictly related to the Falco one so if you don't mask it, it will be started together with the Falco service.

3. Type `falco-driver-loader bpf` to download/compile the BPF probe.

4. Now running `systemctl start falco-bpf.service` and typing `systemctl list-units | grep falco` you should see something like that (supposing we didn't mask the Falcoctl service):

    ```text
    falco-bpf.service                                 loaded active running   Falco: Container Native Runtime Security with ebpf
    falcoctl-artifact-follow.service                  loaded active running   Falcoctl Artifact Follow: automatic artifacts update service
    ```

5. If you want to stop both services in one shot

    ```bash
    systemctl stop falco-bpf.service
    ```

### Custom run

You may have noticed a Falco unit called `falco-custom.service`. You should use it when you want to run Falco with a custom configuration like a plugin or Gvisor. Please note that in this case you have to modify this template according to how you want to run Falco, the unit cannot be used as it is!

## Falco binary

Here you can find some examples of how to run Falco after having [installed](../installation.md#falco-binary) it using the binary package


```bash
# Kernel module (default driver)
falco
# eBPF probe
FALCO_BPF_PROBE="" falco
# modern eBPF probe
falco --modern-bpf
# For more info see all available options
falco --help
```

{{% pageinfo color="warning" %}}

If you are using the eBPF probe, in order to ensure that performance is not degraded, make sure that

* Your kernel has `CONFIG_BPF_JIT` enabled
* `net.core.bpf_jit_enable` is set to 1 (enable the BPF JIT Compiler)
* This can be verified via `sysctl -n net.core.bpf_jit_enable`

{{% /pageinfo %}}


## Docker {#docker}

{{% pageinfo color="primary" %}}

Even using container images, Falco needs kernel headers installed on the host as prerequisite to correctly build the driver (the [kernel module](/docs/event-sources/drivers/#kernel-module) or the [eBPF probe](/docs/event-sources/drivers/#ebpf-probe)) on the fly. This step is not needed when a prebuilt driver is already available.

You can find instructions on how to install the kernel headers for your system under the [Install section](/docs/getting-started/installation).

{{% /pageinfo %}}

Falco ships a set of official [docker images](/docs/getting-started/download#images).
The images can be used in two ways as follows:

- [Least privileged (recommended)](#docker-least-privileged)
- [Fully privileged](#docker-privileged)

### Least privileged (recommended) {#docker-least-privileged}

This is how the Falco userspace process can be ran in a container.

Once the kernel module has been installed directly on the host system, it can be used from within a container.

1. Install the kernel module:

    - You can use an official [installation method](/docs/getting-started/installation) directly on the host
    - Alternatively, you can temporarily use a privileged container to install the driver on the host:

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
        falcosecurity/falco-driver-loader:latest
    ```

The `falcosecurity/falco-driver-loader` image just wraps the `falco-driver-loader` script.
You can find more about its usage [here](/docs/getting-started/installation#install-driver)

2. Run Falco in a container using Docker with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege):

    ```shell
    docker pull falcosecurity/falco-no-driver:latest
    docker run --rm -i -t \
        -e HOST_ROOT=/ \
        --cap-add SYS_PTRACE --pid=host $(ls /dev/falco* | xargs -I {} echo --device {}) \
        -v /var/run/docker.sock:/var/run/docker.sock \
        falcosecurity/falco-no-driver:latest
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

Note that `ls /dev/falco* | xargs -I {} echo --device {}` outputs a `--device /dev/falcoX` option per CPU (ie. just the devices created by the Falco's kernel module). Also, `-e HOST_ROOT=/` is necessary since with `--device` there is no way to remap devices to `/host/dev/`.

{{% /pageinfo %}}

To run Falco in least privileged mode with the eBPF driver, we list all the required capabilities:

- on kernels <5.8, Falco requires `CAP_SYS_ADMIN`, `CAP_SYS_RESOURCE` and `CAP_SYS_PTRACE`
- on kernels >=5.8, `CAP_BPF` and `CAP_PERFMON` were separated out of `CAP_SYS_ADMIN`, so the required capabilities are `CAP_BPF`, `CAP_PERFMON`, `CAP_SYS_RESOURCE`, `CAP_SYS_PTRACE`. Unfortunately, Docker does not yet support adding the two newly introduced capabilities with the `--cap-add` option. For this reason, we continue using `CAP_SYS_ADMIN`, given that it still allows performing the same operations granted by `CAP_BPF` and `CAP_PERFMON`. In the near future, Docker will support adding these two capabilities and we will be able to replace `CAP_SYS_ADMIN`.

1. Install the eBPF probe

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
        falcosecurity/falco-driver-loader:latest bpf
    ```

2. Then, run Falco

    ```shell
    docker pull falcosecurity/falco-no-driver:latest
    docker run --rm -i -t \
        --cap-drop all \
        --cap-add sys_admin \
        --cap-add sys_resource \
        --cap-add sys_ptrace \
        -v /var/run/docker.sock:/host/var/run/docker.sock \
        -e FALCO_BPF_PROBE="" \
        -v /root/.falco:/root/.falco \
        -v /etc:/host/etc \
        -v /proc:/host/proc:ro \
        falcosecurity/falco-no-driver:latest
    ```

{{% pageinfo color="warning" %}}

Again, you will need to add `--security-opt apparmor:unconfined` to the last command if your system has the AppArmor LSM enabled.

{{% /pageinfo %}}

### Fully privileged {#docker-privileged}

To run Falco in a container using Docker with full privileges use the following commands.

If you want to use Falco with the Kernel module driver:

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
    falcosecurity/falco:latest
```

Alternatively, you can use the eBPF probe driver:

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -e FALCO_BPF_PROBE="" \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest
```

It is also possible to use `falco-no-driver` and `falco-driver-loader` images in fully privileged mode.
This may be desirable in environments which do not allow the full Falco image due to space, resource, security or policy constraints.
You can load the eBPF probe or kernel module in its own temporary container as below:

```shell
docker pull falcosecurity/falco-driver-loader:latest
docker run --rm -i -t \
    --privileged \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco-driver-loader:latest
```

Once this has been done, or if you have installed the driver on the host permanently via the `falco-driver-loader` script instead of the Docker image, then you can simply load up the `falco-no-driver` image in privileged mode:

```shell
docker pull falcosecurity/falco-no-driver:latest
docker run --rm -i -t \
    --privileged \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    falcosecurity/falco-no-driver:latest
```

To use `falco-no-driver` and `falco-driver-loader` with the eBPF probe you have to remove the `-v /dev:/host/dev` (which is only required by the Kernel Module) and add:

```shell
    -e FALCO_BPF_PROBE="" -v /root/.falco:/root/.falco \
```

Other configurable options:

- `DRIVER_REPO` - See the [Installing the driver](https://falco.org/docs/getting-started/installation/#install-driver) section.
- `SKIP_DRIVER_LOADER` - Set this environment variable to avoid running `falco-driver-loader` when the `falcosecurity/falco` image starts. Useful when the driver has been already installed on the host by other means.

## Rules validation

It's possible to validate Falco rules without installation by using the Docker image.

```bash
export RULES_PATH=<PATH_TO_YOUR_RULES_HERE>
docker run --rm \
    -v ${RULES_PATH}:/etc/falco/my-rules \
    falcosecurity/falco:latest /usr/bin/falco \
    -r /etc/falco/falco_rules.yaml \
    -r /etc/falco/my-rules \
    -L
```

## Hot Reload

This will reload the Falco configuration and restart the engine without killing the pid. This is useful to propagate new config changes without killing the daemon.

```bash
kill -1 $(cat /var/run/falco.pid)
```

Moreover, since Falco 0.32.0, `watch_config_files` config option drives the automatic reload of Falco when either the config or the ruleset change.
