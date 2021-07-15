---
title: Install
description: Setting up Falco on a Linux system
weight: 3
---

Falco is a Linux security tool that uses system calls to secure and monitor a system.

{{% pageinfo color="primary" %}}
Falco can be used for Kubernetes runtime security.
The most secure way to run Falco is to install Falco directly on the host system so that Falco is isolated from Kubernetes in the case of compromise.
Then the Falco alerts can be consumed through read-only agents running in Kubernetes.

You can also run Falco directly in Kubernetes as a daemonset using Helm, see the [third party integrations](../third-party)
{{% /pageinfo %}}


If Falco is installed using the package manager artifacts below, you will have the following in place:

 - Falco userspace program scheduled and watched via `systemd`
 - Falco driver installed via the package manager (either kernel module or eBPF depending on the host)
 - Sane and default configuration file installed in `/etc/falco`

Alternatively, it is also possible to use a binary package as [explained below](#linux-binary).

## Installing

### Debian/Ubuntu {#debian}

1. Trust the falcosecurity GPG key, configure the apt repository, and update the package list:

    ```shell
    curl -s https://falco.org/repo/falcosecurity-3672BA8F.asc | apt-key add -
    echo "deb https://download.falco.org/packages/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
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

4. Reload systemd manager configuration
   ```shell
   systemctl daemon-reload
   ```

    Falco, the kernel module driver, and a default configuration are now installed.
    Falco is being ran as a systemd unit.

    See [running](../running) for information on how to manage, run, and debug with Falco.

5. Uninstall Falco:

    ```shell
    apt-get remove falco
    ```

### CentOS/RHEL/Fedora/Amazon Linux {#centos-rhel}

1. Trust the falcosecurity GPG key and configure the yum repository:

    ```shell
    rpm --import https://falco.org/repo/falcosecurity-3672BA8F.asc
    curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```

    > **Note** — The following command is required only if DKMS and `make` are not available in the distribution. You can verify if DKMS is available using `yum list make dkms`. If necessary install it using: `yum install epel-release`, then `yum install make dkms`.

2. Install kernel headers:

    ```shell
    yum -y install kernel-devel-$(uname -r)
    ```

    > **Note** — If the package was not found by the above command, you might need to run `yum distro-sync` in order to fix it. Rebooting the system may be required.

3. Install Falco:

    ```shell
    yum -y install falco
    ```
    
4. Reload systemd manager configuration
   ```shell
   systemctl daemon-reload
   ```
   
    Falco, the kernel module driver, and a default configuration are now installed.
    Falco is being ran as a systemd unit.

    See [running](../running) for information on how to manage, run, and debug with Falco.



5. Uninstall Falco:

    ```shell
    yum erase falco
    ```

### openSUSE {#suse}

1. Trust the falcosecurity GPG key and configure the zypper repository:

    ```shell
    rpm --import https://falco.org/repo/falcosecurity-3672BA8F.asc
    curl -s -o /etc/zypp/repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```

2. Install kernel headers:

    ```shell
    zypper -n install kernel-default-devel
    ```

3. Install Falco:

    ```shell
    zypper -n install falco
    ```

4. Reload systemd manager configuration
   ```shell
   systemctl daemon-reload
   ```
    Falco, the kernel module driver, and a default configuration are now installed.
    Falco is being ran as a systemd unit.

    See [running](../running) for information on how to manage, run, and debug with Falco.


5. Uninstall Falco:

    ```shell
    zypper rm falco
    ```

### Linux generic (binary package) {#linux-binary}

1. Download the latest binary:

    ```shell
    curl -L -O https://download.falco.org/packages/bin/x86_64/falco-{{< latest >}}-x86_64.tar.gz
    ```

2. Install Falco:

    ```shell
    tar -xvf falco-{{< latest >}}-x86_64.tar.gz
    cp -R falco-{{< latest >}}-x86_64/* /
    ```

3. Install the following dependencies:
    - kernel headers for your distribution

4. Install the driver as explained [below](#install-driver).

Once the driver has been installed, you can manually run `falco`.

### Installing the driver {#install-driver}

The easiest way to install the driver is using the `falco-driver-loader` script.

By default, it first tries to locally build the kernel module with `dkms`. If not possible, then it tries to download a prebuilt one into `~/.falco/`. If a kernel module is found, then it gets inserted.

In case you want to install the eBPF probe driver, run `falco-driver-loader bpf`.
It first tries to build the eBPF probe locally, otherwise to download a prebuilt into `~/.falco/`.

Configurable options:

- `DRIVERS_REPO` - Set this environment variable to override the default repository URL for prebuilt kernel modules and eBPF probes, without the trailing slash.

    Ie., `https://myhost.mydomain.com` or if the server has a subdirectories structure `https://myhost.mydomain.com/drivers`.

    The drivers will need to be hosted with the following structure:
    `/${driver_version}/falco_${target}_${kernelrelease}_${kernelversion}.[ko|o]` where `ko` and `o` stands for Kernel module and `eBPF` probe respectively.

    Eg., `/a259b4bf49c3330d9ad6c3eed9eb1a31954259a6/falco_amazonlinux2_4.14.128-112.105.amzn2.x86_64_1.ko`.

    The `falco-driver-loader` script fetches the drivers using the above format.
