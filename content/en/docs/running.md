---
title: Running 
description: Operating and Managing Falco
weight: 4
---


## Run Falco as a service

If you installed Falco by using [the deb or the rpm](../installation) package, you can start the service:

```bash
service falco start
```

Or, for `systemd`:
```bash
systemctl start falco
```
It works because `systemd-sysv-generator` wraps `init.d` scripts into `systemd` units.

You can also view the Falco logs using `journalctl`.

```bash 
journalctl -fu falco
```

## Run Falco manually

If you'd like to run Falco by hand, you can find the full usage description for Falco by typing:

```
falco --help
```

## Run within Docker {#docker}

This is how the Falco userspace process can be ran in a container. 

Once the kernel module has been installed directly on the host system, it can be used from within a container.

1. Install the kernel module:

    - You can use an official [installation method](/docs/installation) directly on the host
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

2. Run Falco in a container using Docker with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege):

    ```shell
    docker pull falcosecurity/falco-no-driver:latest
    docker run --rm -i -t \
        --cap-add SYS_PTRACE --pid=host $(ls /dev/falco* | xargs -I {} echo --device {}) \
        -v /var/run/docker.sock:/var/run/docker.sock \
        falcosecurity/falco-no-driver:latest
    ```


## Hot Reload

This will reload the Falco configuration and restart the engine without killing the pid. This is useful to propagate new config changes without killing the daemon.

```bash
kill -1 $(cat /var/run/falco.pid)
```