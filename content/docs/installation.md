---
title: Installing Falco
description: Get up and running on Linux and a variety of container platforms
weight: 2
---

Falco can be installed on several platforms:

* [Linux](#linux)
* [Docker](#docker)
* [CoreOS](#coreos)
* [Kubernetes](#kubernetes)

## Linux

### Scripted install {#scripted}

To install Falco on Linux, you can download a shell script that takes care of the necessary steps:

```shell
curl -o install-falco.sh -s https://s3.amazonaws.com/download.draios.com/stable/install-falco
```

Then verify the [MD5](https://en.wikipedia.org/wiki/MD5) checksum of the script using the `md5sum` tool (or something analogous):

```shell
md5sum install-falco.sh
```

It should be `3632bde02be5aeaef522138919cfece2`.

Then run the script either as root or with sudo:

```shell
sudo bash install-falco.sh
```

### Package install {#package}

#### RHEL

1. Trust the Draios GPG key and configure the yum repository:

    ```shell
    rpm --import https://s3.amazonaws.com/download.draios.com/DRAIOS-GPG-KEY.public
    curl -s -o /etc/yum.repos.d/draios.repo https://s3.amazonaws.com/download.draios.com/stable/rpm/draios.repo
    ```

1. Install the EPEL repository:

    > **Note** — The following command is required only if DKMS is not available in the distribution. You can verify if DKMS is available using `yum list dkms`. If necessary, install it using:

    ```shell
    rpm -i https://mirror.us.leaseweb.net/epel/6/i386/epel-release-6-8.noarch.rpm
    ```

1. Install kernel headers:

    > **Warning** — The following command might not work with any kernel. Make sure to customize the name of the package properly.

    ```shell
    yum -y install kernel-devel-$(uname -r)
    ```

1. Install Falco:

    ```shell
    yum -y install falco
    ```

    To uninstall, run `yum erase falco`.

#### Debian

1. Trust the Draios GPG key, configure the apt repository, and update the package list:

    ```shell
    curl -s https://s3.amazonaws.com/download.draios.com/DRAIOS-GPG-KEY.public | apt-key add -
    curl -s -o /etc/apt/sources.list.d/draios.list https://s3.amazonaws.com/download.draios.com/stable/deb/draios.list
    apt-get update
    ```

1. Install kernel headers:

    > **Warning** — The following command might not work with any kernel. Make sure to customize the name of the package properly.

    ```shell
    apt-get -y install linux-headers-$(uname -r)
    ```

1. Install Falco:

    ```shell
    apt-get install -y falco
    ```

    To uninstall, run `apt-get remove falco`.

## Package Management Systems

You can also install Falco using package management systems like [Puppet](#puppet) and [Ansible](#ansible).

### Puppet

A [Puppet](https://puppet.com/) module for Falco, `sysdig-falco`, is available on [Puppet Forge](https://forge.puppet.com/sysdig/falco/readme).

### Ansible

[@juju4](https://github.com/juju4/) has helpfully written an [Ansible](https://ansible.com) role for Falco, `juju4.falco`. It's available on [GitHub](https://github.com/juju4/ansible-falco/) and [Ansible Galaxy](https://galaxy.ansible.com/juju4/falco/). The latest version of Ansible Galaxy (v0.7) doesn't work with Falco 0.9, but the version on GitHub does.

## Docker

If you have full control of your host operating system, then installing Falco using the normal installation method is the recommended best practice. This method allows full visibility into all containers on the host OS. No changes to the standard automatic/manual installation procedures are required.

Falco can also, however, run inside a [Docker](https://docker.com) container. To guarantee a smooth deployment, the kernel headers must be installed in the host operating system before running Falco.

This can usually be done on Debian-like distributions using `apt-get`:

```shell
apt-get -y install linux-headers-$(uname -r)
```

On RHEL-like distributions:

```shell
yum -y install kernel-devel-$(uname -r)
```

Falco can then be running using Docker:

```shell
docker pull falcosecurity/falco
docker run -i -t \
    --name falco \
    --privileged \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    falcosecurity/falco
```

To see it in action, also run the [event generator](../event-sources/sample-events) to perform actions that trigger Falco's ruleset:

```shell
docker pull sysdig/falco-event-generator
docker run -it --name falco-event-generator sysdig/falco-event-generator
```

### Using custom rules with the Docker container

The Falco image has a built-in set of rules located at `/etc/falco/falco_rules.yaml` which is suitable for most purposes. However, you may want to provide your own rules file and still use the Falco image. In that case, you should add a volume mapping to map the external rules file to `/etc/falco/falco_rules.yaml` within the container by adding `-v path-to-falco-rules.yaml:/etc/falco/falco_rules.yaml` to your `docker run` command.

## CoreOS

The recommended way to run Falco on CoreOS is inside of its own Docker container using the install commands in the [Docker section](#docker) above. This method allows full visibility into all containers on the host OS.

This method is automatically updated, includes some nice features such as automatic setup and bash completion, and is a generic approach that can be used on other distributions outside CoreOS as well.

However, some users may prefer to run Falco in the CoreOS toolbox. While not the recommended method, this can be achieved by installing Falco inside the toolbox using the normal installation method, and then manually running the `falco-probe-loader` script:

```shell
toolbox --bind=/dev --bind=/var/run/docker.sock
curl -s https://s3.amazonaws.com/download.draios.com/stable/install-falco | bash
falco-probe-loader
```

## Kubernetes

To run Falco as a Kubernetes [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/), we have instructions and some sample YAML files [here](https://github.com/falcosecurity/falco/tree/dev/integrations/k8s-using-daemonset).

The easiest way to use Falco on Kubernetes in a local environment is on [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/).

### Notes on kernel modules

A part of Falco's installation involves compiling a kernel module that allows it to see the stream of system calls on the machine on which Falco runs. The kernel module is built using DKMS and relies on the kernel headers being installed for the running kernel. If the DKMS step fails, as a fallback the installation script will try to download pre-built kernel modules from https://s3.amazonaws.com/download.draios.com.

When running minikube with the default `--driver` arguments, Minikube creates a VM that runs the various Kubernetes services and a container framework to run Pods, etc. Generally, it's not possible to build kernel modules directly on the Minikube VM, as the VM doesn't include the kernel headers for the running kernel.

To address this, starting with falco 0.13.1 we pre-build kernel modules for the last 10 Minikube versions and make them available at https://s3.amazonaws.com/download.draios.com. This allows the fallback step to succeed with a loadable kernel module.

Going forward, we'll continue to support the most recent 10 Minikube versions with each new Falco release. We also keep previously built kernel modules around for download, so we will continue to have limited historical support as well.
