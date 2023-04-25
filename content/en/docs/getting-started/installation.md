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

You can also run Falco directly in Kubernetes as a Daemonset using Helm, see the [third-party integrations](../third-party)
{{% /pageinfo %}}

There are 2 main ways to install Falco on your host:

1. Falco packages (`.deb`, `.rpm`)
2. Falco binary (`.tar.gz`)

## Falco packages

{{% pageinfo color="secondary" %}}

The Falco packages shipped with `Falco 0.34` support for the first time other drivers besides the kernel module. The new systemd units' names are:

* `falco-bpf.service`
* `falco-kmod-inject.service`
* `falco-kmod.service`
* `falco-modern-bpf.service`
* `falco-custom.service`
* `falcoctl-artifact-follow.service` (related to [Falcoctl](https://github.com/falcosecurity/falcoctl) tool, see next sections)

This is still an experimental solution so our suggestion is to avoid relying on Falco systemd unit names since they could change between releases. The final idea would be to have a single `falco.service` configurable through usual systemd logic, but due to how Falco works today this solution is not viable.

Even if different units are available, you shouldn't run multiple Falco in parallel! Our units are not meant to be run in parallel!

{{% /pageinfo %}}

{{% pageinfo color="warning" %}}

On January 18th, 2023 the GPG key used to sign Falco packages has been rotated. Check out [the related blog post](/blog/falco-packages-gpg-key-rotated/) and make sure you're using the most up-to-date key available at [falco.org/repo/falcosecurity-packages.asc](https://falco.org/repo/falcosecurity-packages.asc), and that you read the [section below about package signing](#package-signing).

{{% /pageinfo %}}

### Installation details

Before looking at the installation on different distros, let's focus on what we should expect when we install the package.
The Falco package will look into your system for the `dialog` binary, if the binary is there, the package will prompt a simple configuration dialog, otherwise, it will install the unit files without starting any `systemd` service.

> _Note_:  If you don't have the `dialog` binary installed on your system a manual configuration is always required to start Falco services.

Even if you have the `dialog` binary installed, you can disable the interactive prompt by using the `FALCO_FRONTEND` env variable, you should simply set its value to `noninteractive` when installing the package.

```bash
FALCO_FRONTEND=noninteractive apt-get install -y falco
```

Let's see an example of how to install the package in a Debian-like system, for example, `Ubuntu`.

1. Trust the `falcosecurity` GPG key

    ```bash
    curl -s https://falco.org/repo/falcosecurity-packages.asc | apt-key add -
    ```

2. Configure the apt repository

    ```bash
    echo "deb https://download.falco.org/packages/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
    ```

3. Update the package list

    ```bash
    apt-get update -y
    ```

4. Install some required dependencies that are needed to build the kernel module and the BPF probe

    ```bash
    apt install -y dkms make linux-headers-$(uname -r)
    # If you use the falco-driver-loader to build the BPF probe locally you need also clang toolchain
    apt install -y clang llvm
    # You can install also the dialog package if you want it
    apt install -y dialog
    ```

    > _Note_: You don't need to install these deps if you want to the modern BPF probe

5. Install the Falco package

    ```bash
    apt-get install -y falco
    ```

#### Installation with dialog

If you have the `dialog` binary installed on your system, you will be prompted with this:

![](/docs/getting-started/images/systemd_dialog_1.png)

From here you can choose one of our 3 drivers `Kmod`, `eBPF`, `Modern eBPF` or a [`Manual configuration`](#installation-without-dialog-manual-configuration).

Here we select the `Kmod` case as an example. After the first dialog, you should see a second one:

![](/docs/getting-started/images/systemd_dialog_2.png)

[Falcoctl](https://github.com/falcosecurity/falcoctl) is a tool revamped with `Falco 0.34` that offers shiny new features! One of the most important is the [automatic rulesets update](https://github.com/falcosecurity/falcoctl#falcoctl-artifact-follow),
our suggestion is to enable it by default, in this way you will always have your Falco instance running with the most updated rules.

##### Rule update

If you set the rule update as default, typing `systemctl list-units | grep falco` you should see something similar to this:

```text
falco-kmod-inject.service                         loaded active exited    Falco: Container Native Runtime Security with kmod, inject.
falco-kmod.service                                loaded active running   Falco: Container Native Runtime Security with kmod
falcoctl-artifact-follow.service                  loaded active running   Falcoctl Artifact Follow: automatic artifacts update service
```

* `falco-kmod-inject.service` injects the kernel module and exits. This unit remains after exit to detach the kernel module when the `falco-kmod.service` will be stopped.
* `falco-kmod.service` instance of Falco running the kernel module. Since the kernel module is the default Falco driver, you can also use the `falco` alias to start/stop it once enabled.
* `falcoctl-artifact-follow.service` instance of Falcoctl that searches for new rulesets. This unit will be stopped when `falco-kmod.service` terminates.

The Falcoctl service is strictly related to the Falco one:

* when the Falco service starts it searches for a unit called `falcoctl-artifact-follow.service` and if present it starts it. Please note that following this pattern, if you enable the Falco service and you reboot your system, Falcoctl will start again with Falco even if you don't enable it through `systemd enable`! You can disable this behavior by stopping the Falcoctl service and masking it `systemctl mask falcoctl-artifact-follow.service`.
* when the Falco service stops also the Falcoctl service is stopped.

##### No Rule update

In this case, the Falco package will only start the `falco-kmod.service`. Typing `systemctl list-units | grep falco` you should see something similar to this:

```text
falco-kmod-inject.service                         loaded active exited    Falco: Container Native Runtime Security with kmod, inject.
falco-kmod.service                                loaded active running   Falco: Container Native Runtime Security with kmod
```

In this mode, the Falcoctl service is masked by default so if you want to enable it in a second step you need to type `systemctl unmask falcoctl-artifact-follow.service`.

##### Final remarks on the dialog

When you choose a driver from the dialog (in our case `Kmod`), the `systemd` service is always enabled by default so it will start at every system reboot. If you want to disable this behavior type `systemctl disable falco-kmod.service` (if you are using the kernel module like in this example). If enabled, the Falcoctl service will follow the same behavior as Falco so it is enough to disable the Falco service.

#### Installation without dialog (Manual configuration)

If you remember well, in the dialog we also had the `Manual configuration`. This option installs only the Falco units into the system without starting any service, this is the equivalent of not having the `dialog` binary installed on the system.

Since no service is started, you have to manually configure services after the installation phase. You can see an example of how to configure the `falco-bpf` service in the [Running section](../running#falco-packages)

### Installation on different Distros

We have already seen [the installation steps](#installation-details) on a Debian-like system, let's see some other Distros.

#### CentOS/RHEL/Fedora/Amazon Linux {#centos-rhel}

1. Trust the `falcosecurity` GPG key

    ```bash
    rpm --import https://falco.org/repo/falcosecurity-packages.asc
    ```

2. Configure the yum repository

    ```bash
    curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```

3. Update the package list

    ```bash
    yum update -y
    ```

4. Install some required dependencies that are needed to build the kernel module and the BPF probe

    ```bash
    # If necessary install it using: `yum install epel-release` (or `amazon-linux-extras install epel` in case of amzn2), then `yum install make dkms`.
    yum install -y dkms make
    # If the package was not found by the below command, you might need to run `yum distro-sync` in order to fix it. Rebooting the system may be required.
    yum install -y kernel-devel-$(uname -r)
    # If you use the falco-driver-loader to build the BPF probe locally you need also clang toolchain
    yum install -y clang llvm
    # You can install also the dialog package if you want it
    yum install -y dialog
    ```

    > _Note_: You don't need to install these deps if you want to use the modern BPF probe

5. Install the Falco package

    ```bash
    yum install -y falco
    ```

6. Uninstall Falco:

    ```bash
    yum erase -y falco
    ```
 > _Note_: If you are using UEFI enabled systems please run:
 >         sudo mokutil --import /var/lib/dkms/mok.pub
 >         Restart the system (A MOK key enrollment will prompt)
 >         Enroll MOK
 >         4. Load the Falco driver
 >         $ insmod /var/lib/dkms/falco/4.0.0+driver/$(uname -r)/x86_64/module/falco.ko.xz     

#### openSUSE {#suse}

1. Trust the `falcosecurity` GPG key

    ```bash
    rpm --import https://falco.org/repo/falcosecurity-packages.asc
    ```

2. Configure the zypper repository

    ```bash
    curl -s -o /etc/zypp/repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```

3. Update the package list

    ```bash
    zypper -n update
    ```

4. Install some required dependencies that are needed to build the kernel module and the BPF probe

    ```bash
    zypper -n install dkms make
    # If the package was not found by the below command, you might need to run `zypper -n dist-upgrade` in order to fix it. Rebooting the system may be required.
    zypper -n install kernel-default-devel-$(uname -r | sed s/\-default//g)
    # If you use the falco-driver-loader to build the BPF probe locally you need also clang toolchain
    zypper -n install clang llvm
    # You can install also the dialog package if you want it
    zypper -n install dialog
    ```

    > _Note_: You don't need to install these deps if you want to use the modern BPF probe

5. Install Falco:

    ```shell
    zypper -n install falco
    ```

6. Uninstall Falco:

    ```shell
    zypper rm falco
    ```

## Falco binary

In these steps, we are targeting a Debian-like system on `x86_64` architecture. You can easily extrapolate similar steps for other distros or architectures

1. Download the latest binary:

    ```bash
    curl -L -O https://download.falco.org/packages/bin/x86_64/falco-{{< latest >}}-x86_64.tar.gz
    ```

2. Install Falco:

    ```bash
    tar -xvf falco-{{< latest >}}-x86_64.tar.gz
    cp -R falco-{{< latest >}}-x86_64/* /
    ```

3. Install some required dependencies that are needed to build the kernel module and the BPF probe. If you want to use other sources like the modern BPF probe or plugins you can skip this step.

    ```bash
    apt update -y
    apt install -y dkms make linux-headers-$(uname -r)
    # If you use the falco-driver-loader to build the BPF probe locally you need also clang toolchain
    apt install -y clang llvm
    ```

4. Run `falco-driver-loader` binary to install the kernel module or the BPF probe. If you want to use other sources like the modern BPF probe or plugins you can skip this step.

    ```bash
    # If you want to install the kernel module
    falco-driver-loader module
    # If you want to install the eBPF probe
    falco-driver-loader bpf
    ```

    By default, the `falco-driver-loader` script tries to download a prebuilt driver from [the official Falco download s3 bucket](https://download.falco.org/?prefix=driver/). If a driver is found then it is inserted into `${HOME}/.falco/`. Otherwise, the script tries to compile the driver locally, for this reason, you need the dependencies at step [3].

    You can use the env variable `DRIVERS_REPO` to override the default repository URL for prebuilt drivers. The URL must not have the trailing slash, i.e. `https://myhost.mydomain.com` or if the server has a subdirectories structure `https://myhost.mydomain.com/drivers`. The drivers must be hosted with the following structure:

    ```bash
    /${driver_version}/falco_${target}_${kernelrelease}_${kernelversion}.[ko|o]
    ```

    where `ko` and `o` stand for Kernel module and `eBPF` probe respectively. This is an example:

    ```text
    /a259b4bf49c3330d9ad6c3eed9eb1a31954259a6/falco_amazonlinux2_4.14.128-112.105.amzn2.x86_64_1.ko
    ```

You are finally ready to [run the Falco binary](../running#falco-binary)!

## Package signing

Most Falco packages available at [download.falco.org](https://download.falco.org/?prefix=packages/) are provided with a detached signature that can be used to verify that the package information downloaded from the remote repository can be trusted.

The **latest trusted public GPG key** used for packages signing can be downloaded from [falco.org/repo/falcosecurity-packages.asc](https://falco.org/repo/falcosecurity-packages.asc). The following table lists all the keys employed by the organization currently and in the past, including the revoked ones. We recommend updating the revoked keys to download their revocation certificate, and eventually removing them from your package verification system due to the signature made with them not being trustable anymore.

| **Fingerprint**                            | **Expiration** | **Usage**              | **Status** | **Download**                                                   |
| ------------------------------------------ | -------------- | ---------------------- | ---------- | -------------------------------------------------------------- |
| `2005399002D5E8FF59F28CE64021833E14CB7A8D` | 2026-01-17     | Signing Falco Packages | Trusted    | [falcosecurity-14CB7A8D.asc](/repo/falcosecurity-14CB7A8D.asc) |
| `15ED05F191E40D74BA47109F9F76B25B3672BA8F` | 2023-02-24     | Signing Falco Packages | Revoked    | [falcosecurity-3672BA8F.asc](/repo/falcosecurity-3672BA8F.asc) |
