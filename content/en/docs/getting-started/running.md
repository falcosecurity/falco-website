---
title: Running
description: Operating and Managing Falco
weight: 4
---


## Run Falco as a service

If you installed Falco by using [the DEB or the RPM](/docs/getting-started/installation) package, you can start the service by running:


```console
systemctl enable falco
```

```console
systemctl start falco
```

You can also view the Falco logs using `journalctl`.

```console
journalctl -fu falco
```

## Run Falco manually

If you'd like to run Falco by hand, you can find the full usage description for Falco by typing:

```console
falco --help
```

{{% pageinfo color="primary" %}}

Are you looking for userpace instrumentation? Please see [this page](/docs/event-sources/drivers/).

{{% /pageinfo %}}


## Run within Docker {#docker}


{{% pageinfo color="primary" %}}

Even using container images, Falco needs kernel headers installed on the host as prerequisite to correctly build the driver (the [kernel module](/docs/event-sources/drivers/#kernel-module) or the [eBPF probe](/docs/event-sources/drivers/#ebpf-probe)) on the fly. This step is not needed when a prebuilt driver is already available.

You can find instructions on how to install the kernel headers for your system under the [Install section](/docs/getting-started/installation).

{{% /pageinfo %}}

Falco ships a set of official [docker images](/docs/getting-started/download#images).
The images can be used in two ways as follows:
- [Least privileged (recommended)](#docker-least-privileged)
- [Fully privileged](#docker-privileged)

### Least privileged (recommended) {#docker-least-privileged}



{{% pageinfo color="primary" %}}

You cannot use the Least privileged mode with the eBPF probe driver unless you have at least Kernel 5.8,
this is because `--privileged` is needed to do the `bpf` syscall.
If you are running Kernel >= 5.8 you can pass `--cap-add BPF` to the docker run command in the step 2
and ignore the Install the kernel module section completely.

You can read more details about this [here](https://github.com/falcosecurity/falco/issues/1299#issuecomment-653448207)

{{% /pageinfo %}}

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
        -v /lib/modules:/host/lib/modules:ro \
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
    -v /var/run/docker.sock:/host/var/run/docker.sock \
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

## Hot Reload

This will reload the Falco configuration and restart the engine without killing the pid. This is useful to propagate new config changes without killing the daemon.

```bash
kill -1 $(cat /var/run/falco.pid)
```
