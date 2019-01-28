---
title: Installing Falco
short: Install
description: Get up and running on Linux
weight: 1
---

Falco can be installed on three platforms:

* [Linux](#linux)

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
