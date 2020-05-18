---
title: Install
description: Setting up Falco on a Linux system
weight: 3
---

Falco is a Linux security tool that uses system calls to secure and monitor a system. 

{{< info >}}

The Falco Project does not suggest running Falco on top of Kubernetes but rather on its nodes directly.

If you would like to run Falco in Kubernetes with a tool like Kind, Minikube, or Helm please see the [third party integrations](../third-party)

{{< /info >}}


If Falco is installed using the package manager artifacts below, you will have the following in place:

 - Falco userspace program scheduled and watched via `systemd`
 - Falco driver installed via package manager (either kernel module or eBPF depending on host)
 - Sane and default configuration file installed in `/etc/falco`

Alternatively, it is also possible to use a binary package as [explained below](#linux-binary).

## Installing

### Debian/Ubuntu {#debian}

1. Trust the falcosecurity GPG key, configure the apt repository, and update the package list:

    ```shell
    curl -s https://falco.org/repo/falcosecurity-3672BA8F.asc | apt-key add -
    echo "deb https://dl.bintray.com/falcosecurity/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
    apt-get update -y
    ```

2. Install kernel headers:

    ```shell
    apt-get -y install linux-headers-$(uname -r)
    ```

3. Install Falco:

    ```shell
    apt-get install -y falco
    ```
   
    Falco, the kernel module driver, and a default configuration are now installed. 
    Falco is being ran as a systemd unit.   

    See [running](../running) for information on how to manage, run, and debug with Falco. 
       

4. Uninstall Falco:

    ```shell
    apt-get remove falco
    ```

### CentOS/RHEL/Fedora/Amazon Linux 2 {#centos-rhel}

1. Trust the falcosecurity GPG key and configure the yum repository:

    ```shell
    rpm --import https://falco.org/repo/falcosecurity-3672BA8F.asc
    curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```
   
    > **Note** — The following command is required only if DKMS is not available in the distribution. You can verify if DKMS is available using `yum list dkms`. If necessary install it using: `yum install epel-release`

2. Install kernel headers:

    ```shell
    yum -y install kernel-devel-$(uname -r)
    ```

3. Install Falco:

    ```shell
    yum -y install falco
    ```
    Falco, the kernel module driver, and a default configuration are now installed. 
    Falco is being ran as a systemd unit.   
    
    See [running](../running) for information on how to manage, run, and debug with Falco. 


4. Uninstall Falco:

    ```shell
    yum erase falco
    ```

### Linux generic (binary package) {#linux-binary}

1. Download the latest binary:

    ```shell
    curl -L -O https://dl.bintray.com/falcosecurity/bin/x86_64/falco-{{< latest >}}-x86_64.tar.gz
    ```

2. Install Falco:

    ```shell
    tar -xvf falco-{{< latest >}}-x86_64.tar.gz
    cp -R falco-{{< latest >}}-x86_64/* /
    ```
3. Install the following dependencies:
    - `libyaml`
    - kernel headers for your distribution

4. Install the driver as explained [below](#install-driver).

Once the driver has been installed, you can manually run `falco`.

### Installing the driver {#install-driver}

The easiest way to install the driver is using the `falco-driver-loader` script.

By default, it first tries to locally build the kernel module with `dkms`. If not possible, then it tries to download a prebuilt one into `~/.falco/`. If a kernel module is found, then it gets inserted.

In case you want to install the eBPF probe driver, run `falco-driver-loader bpf`.
It first tries to build the eBPF probe locally, otherwise to download a prebuilt into into `~/.falco/`. 

Configurable options:

- `DRIVERS_REPO` - Set this environment variable to override the default repository URL for prebuilt kernel modules and eBPF probes, without the trailing slash. 

    Ie., `https://myhost.mydomain.com` or if the server has a subdirectories structure `https://myhost.mydomain.com/drivers`.

    The drivers will need to be hosted with the following structure:
    `/${driver_version}/falco_${target}_${kernelrelease}_${kernelversion}.[ko|o]` where `ko` and `o` stands for Kernel module and `eBPF` probe respectively.

    Eg., `/a259b4bf49c3330d9ad6c3eed9eb1a31954259a6/falco_amazonlinux2_4.14.128-112.105.amzn2.x86_64_1.ko`. 

    The `falco-driver-loader` script fetches the drivers using the above format.
