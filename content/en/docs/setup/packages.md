---
title: Install on a host (DEB, RPM)
description: Learn how to set up Falco using a .deb or a .rpm package on your host
aliases:
- ../installation
- ../getting-started/installation
- ../install-operate/installation
weight: 30
---

There are two main methods to install Falco on your host using the [released Falco packages](/docs/download):

1. **RPM or DEB package (include Systemd setup):** This method is detailed on this page.
2. **Tarball archive:** For instructions, refer to the [Install on a host (tarball)](/docs/setup/tarball) page.


## Install {#install}


This installation method is for Linux distribution with a package manager that supports DEB (Debian, Ubuntu) or RPM (CentOS, RHEL, Fedora, Amazon Linux) packages. 

In interactive installations, the Falco installation package uses the `dialog` binary for configuration prompts. The dialog allows the user to complete the Systemd setup which include:
- The driver selection (kmod, ebpf, modern_ebpf) or automatic selection
- The Falcoctl service setup

In non-interative installations (eg. `dialog` is not available, or if the user disable it by setting the `FALCO_FRONTEND=noninteractive` when installing Falco using the package manager), the automatic driver selection is enabled by default and for other options, the user needs to manually configure the Systemd services.

### Environment variables {#environment-variables}

The following environment variables can be used to customize the installation process:

- `FALCO_FRONTEND`: Set to `noninteractive` to disable the dialog prompts. The default is `dialog`.
- `FALCO_DRIVER_CHOICE`: Set to `kmod`, `ebpf`, or `modern_ebpf` to choose a driver. If selected, the dialog will be skipped too. The default (empty) is automatic selection.
- `FALCOCTL_ENABLED`: Set to any value to enable the `falcoctl` ruleset. The default is disabled.

These enviroment variables can be used in conjunction with the package manager (as described in the following sections) to customize the installation process as needed.

Examples:

- No dialog, no driver:
  ```bash
  FALCO_DRIVER_CHOICE=none apt-get install -y falco
  ```

- Install with `kmod` driver:
  ```bash
  FALCO_DRIVER_CHOICE=kmod apt-get install -y falco
  ```

- No dialog, automatic selection:
  ```bash
  FALCO_FRONTEND=noninteractive apt-get install -y falco
  ```



### Install with `apt` (Debian/Ubuntu) {#install-with-apt}

The following steps are for Debian and Debian-based distribution, such as Ubuntu, which use the `apt` package manager.

1. Trust the `falcosecurity` GPG key

    ```bash
    curl -fsSL https://falco.org/repo/falcosecurity-packages.asc | \
    sudo gpg --dearmor -o /usr/share/keyrings/falco-archive-keyring.gpg
    ```

2. Configure the apt repository

    ```bash
    echo "deb [signed-by=/usr/share/keyrings/falco-archive-keyring.gpg] https://download.falco.org/packages/deb stable main" | \
    sudo tee -a /etc/apt/sources.list.d/falcosecurity.list
    ```

{{% pageinfo color="info" %}}

In older releases of Debian (Debian 9 and older ones), you might need to additionally install the package `apt-transport-https` to allow access to the Falco repository using the `https` protocol.

The following command with install that package in your system:

```bash
sudo apt-get install apt-transport-https
```

{{% /pageinfo %}}
    
3. Update the package list

    ```bash
    sudo apt-get update -y
    ```
    
4. Install some required dependencies that are needed to build the kernel module and the eBPF probe

    ```bash
    sudo apt install -y dkms make linux-headers-$(uname -r)
    # If you use falcoctl driver loader to build the eBPF probe locally you need also clang toolchain
    sudo apt install -y clang llvm
    # You can install also the dialog package if you want it
    sudo apt install -y dialog
    ```

    > _Note_: You don't need to install these deps if you want to the modern eBPF probe

5. Install the Falco package

    ```bash
    sudo apt-get install -y falco
    ```


### Install with `yum` (CentOS/RHEL/Fedora/Amazon Linux) {#install-with-yum}

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

4. Install some required dependencies that are needed to build the kernel module and the eBPF probe

    ```bash
    # If necessary install it using: `yum install epel-release` (or `amazon-linux-extras install epel` in case of amzn2), then `yum install make dkms`.
    yum install -y dkms make
    # If the package was not found by the below command, you might need to run `yum distro-sync` in order to fix it. Rebooting the system may be required.
    yum install -y kernel-devel-$(uname -r)
    # If you use falcoctl driver loader to build the eBPF probe locally you need also clang toolchain
    yum install -y clang llvm
    # You can install also the dialog package if you want it
    yum install -y dialog
    ```

    > _Note_: You don't need to install these deps if you want to use the modern eBPF probe

5. Install the Falco package

    ```bash
    yum install -y falco
    ```

6. Uninstall Falco:

    ```bash
    yum erase -y falco
    ```
 > You might need to validate the driver signature if your system has UEFI SecureBoot enabled.\
> Follow these steps to do so:
>
 >         1. Import the DKMS Machine Owner Key
 >         $ sudo mokutil --import /var/lib/dkms/mok.pub
 >
 >         2. Restart the system and wait for the MOK key enrollment prompt
 >
 >         3. Choose the option:  Enroll MOK
 >
 >         4. Load the Falco driver
 >         $ insmod /var/lib/dkms/falco/4.0.0+driver/$(uname -r)/x86_64/module/falco.ko.xz     

### Install with `zypper` (openSUSE) {#install-with-zypper}

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

4. Install some required dependencies that are needed to build the kernel module and the eBPF probe

    ```bash
    zypper -n install dkms make
    # If the package was not found by the below command, you might need to run `zypper -n dist-upgrade` in order to fix it. Rebooting the system may be required.
    zypper -n install kernel-default-devel-$(uname -r | sed s/\-default//g)
    # If you use falcoctl driver loader to build the eBPF probe locally you need also clang toolchain
    zypper -n install clang llvm
    # You can install also the dialog package if you want it
    zypper -n install dialog
    ```

    > _Note_: You don't need to install these deps if you want to use the modern eBPF probe

5. Install Falco:

    ```shell
    zypper -n install falco
    ```

6. Uninstall Falco:

    ```shell
    zypper rm falco
    ```

## Systemd setup

#### Setup with dialog {#systemd-setup-with-dialog}

By default, if you have the `dialog` binary installed on your system, you will be prompted with this:

![](/docs/getting-started/images/dialog-1.png)

From here you can choose one of our 3 drivers `Kmod`, `eBPF`, `Modern eBPF`, a [`Manual configuration`](#manual-system-setup) or the `Automatic selection` (reccomended) to trigger the automatic logic to select the best driver for you. When you choose a driver from the dialog, the `systemd` service is always enabled by default so it will start at every system reboot. If you want to disable this behavior type `systemctl disable falco-kmod.service` (if you are using the kernel module like in this example).

After the first dialog, you should see a second one:

![](/docs/getting-started/images/dialog-2.png)


#### Manual system setup {#manual-systemd-setup}

You may need to complete the setup configuration, if you are in one of the following cases:
- you disabled the interactive installation (eg. using the `FALCO_FRONTEND=noninteractive` env variable)
- you don't have the `dialog` binary installed on your system
- you chose the `Manual configuration` from the dialog


Verify the avialable services:

```plain
$ sudo systemctl list-unit-files "falco*"

UNIT FILE                        STATE    VENDOR PRESET
falco-bpf.service                disabled enabled
falco-custom.service             disabled enabled
falco-kmod-inject.service        static   enabled
falco-kmod.service               disabled enabled
falco-modern-bpf.service         disabled enabled
falcoctl-artifact-follow.service disabled enabled
```

Using the `systemctl` command, you can now enable the desired unit to start at boot time.

Let's say you want to enable the modern eBPF probe:

```plain
$ sudo systemctl enable falco-modern-bpf.service
Created symlink /etc/systemd/system/multi-user.target.wants/falco-modern-bpf.service → /lib/systemd/system/falco-modern-bpf.service.

$ sudo systemctl list-unit-files "falco*"

UNIT FILE                        STATE    VENDOR PRESET
falco-bpf.service                disabled enabled
falco-custom.service             disabled enabled
falco-kmod-inject.service        static   enabled
falco-kmod.service               disabled enabled
falco-modern-bpf.service         enabled  enabled
falcoctl-artifact-follow.service disabled enabled
```

Or you'd like to switch to using the kernel module:

```plain
$ sudo systemctl disable falco-modern-bpf.service
Removed /etc/systemd/system/multi-user.target.wants/falco-modern-bpf.service.

$ sudo systemctl enable falco-kmod.service
Created symlink /etc/systemd/system/falco.service → /lib/systemd/system/falco-kmod.service.
Created symlink /etc/systemd/system/multi-user.target.wants/falco-kmod.service → /lib/systemd/system/falco-kmod.service.

$ sudo systemctl list-unit-files "falco*"

UNIT FILE                        STATE    VENDOR PRESET
falco-bpf.service                disabled enabled
falco-custom.service             disabled enabled
falco-kmod-inject.service        static   enabled
falco-kmod.service               enabled  enabled
falco-modern-bpf.service         disabled enabled
falco.service                    enabled  enabled
falcoctl-artifact-follow.service disabled enabled

7 unit files listed.
```

{{% pageinfo color=info %}}

Be aware that enabling the `falco-kmod.service` also creates a new alias/service called `falco.service` for compatibility reasons.

{{% /pageinfo %}}

As a side note, if you preferred not to use the `falcoctl` tool to automatically update your rules, you can mask it as follows. Otherwise, as explained [here](/docs/install-operate/installation/#rule-update), Falco will enable it too.

```
$ sudo systemctl mask falcoctl-artifact-follow.service
Created symlink /etc/systemd/system/falcoctl-artifact-follow.service → /dev/null.
```


#### About the Falcoctl service (automatic rules update) {#falcoctl-service}

If this service is enabled (as default), typing `systemctl list-units | grep falco` you should see something similar to this:

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

In case the **Falcoctl service is not enabled**, the Falco package will only start the `falco-kmod.service`. Typing `systemctl list-units | grep falco` you should see something similar to this:

```text
falco-kmod-inject.service                         loaded active exited    Falco: Container Native Runtime Security with kmod, inject.
falco-kmod.service                                loaded active running   Falco: Container Native Runtime Security with kmod
```

In this mode, the Falcoctl service is masked by default so if you want to enable it in a second step you need to type `systemctl unmask falcoctl-artifact-follow.service`.


## Configuration {#configuration}

Since Falco 0.38.0, a new config key, `config_files`, allows the user to load additional configuration files to override main config entries; it allows user to keep local customization between Falco upgrades. Its default value points to a new folder, `/etc/falco/config.d/` that gets installed by Falco and will be processed to look for local configuration files.

## Upgrade {#upgrade}

### Upgrade with `apt` (Debian/Ubuntu) {#upgrade-with-apt}

{{% pageinfo color="warning" %}}

If you configured the `apt` repository by having followed the instructions for Falco 0.27.0 or older, you may need to update the repository URL, otherwise, **fell free to ignore this message**

```shell
sed -i 's,https://dl.bintray.com/falcosecurity/deb,https://download.falco.org/packages/deb,' /etc/apt/sources.list.d/falcosecurity.list
apt-get clean
apt-get -y update
```

Check in the `apt-get update` log that `https://download.falco.org/packages/deb` is present.

{{% /pageinfo %}}

If you installed Falco by following the [provided instructions](/docs/install-operate/installation/#installation-details):

```shell
apt-get --only-upgrade install falco
```

### Upgrade with `yum` (CentOS/RHEL/Fedora/Amazon Linux) {#upgrade-with-yum}

{{% pageinfo color="warning" %}}
If you configured the `yum` repository by having followed the instructions for Falco 0.27.0 or older, you may need to update the repository URL, otherwise, **fell free to ignore this message**

```shell
sed -i 's,https://dl.bintray.com/falcosecurity/rpm,https://download.falco.org/packages/rpm,' /etc/yum.repos.d/falcosecurity.repo
yum clean all
```

Then check that the `falcosecurity-rpm` repository is pointing to `https://download.falco.org/packages/rpm/`:

```shell
yum repolist -v falcosecurity-rpm
```

{{% /pageinfo %}}

If you installed Falco by following the [provided instructions](/docs/install-operate/installation/#centos-rhel):

1. Check for updates:

    ```shell
    yum check-update
    ```

2. If a newer Falco version is available:

    ```shell
    yum update falco
    ```

### Upgrade with `zypper` (openSUSE) {#upgrade-with-zypper}

{{% pageinfo color="warning" %}}
If you configured the `zypper` repository by having followed the instructions for Falco 0.27.0 or older, you may need to update the repository URL, otherwise, **fell free to ignore this message**

```shell
sed -i 's,https://dl.bintray.com/falcosecurity/rpm,https://download.falco.org/packages/rpm,' /etc/zypp/repos.d/falcosecurity.repo
zypper refresh
```

Then check that the `falcosecurity-rpm` repository is pointing to `https://download.falco.org/packages/rpm/`:

```shell
zypper lr falcosecurity-rpm
```

{{% /pageinfo %}}

If you installed Falco by following the [provided instructions](/docs/install-operate/installation/#suse):

```shell
zypper update falco
```

## Kernel Upgrades {#kernel-upgrades}

When performing kernel upgrades on your host, a reboot is required. When using a Kernel Module or a eBPF probe, the Falco driver loader (ie. `falcoctl driver`) should be able to automatically find a pre-built driver (or build it on the fly) corresponding to the updated kernel release (`uname -r`), making it easy to handle kernel upgrades. The Falco Project features a kernel crawler and automated CI, ensuring you can always obtain the necessary pre-built driver artifact, even for the latest kernel releases we support.


## Uninstall

### Uninstall with `apt` (Debian/Ubuntu) {#install-with-apt}

```shell
apt-get --purge autoremove falco
```

### Uninstall with `yum` (CentOS/RHEL/Fedora/Amazon Linux) {#install-with-yum}

```shell
yum autoremove falco
```

### Uninstall with `zypper` (openSUSE) {#install-with-zypper}

```shell
zypper remove falco
```

## Package signing {#package-signing}

{{% pageinfo color="warning" %}}
On January 18th, 2023 the GPG key used to sign Falco packages has been rotated. Check out [the related blog post](/blog/falco-packages-gpg-key-rotated/) and make sure you're using the most up-to-date key available at [falco.org/repo/falcosecurity-packages.asc](https://falco.org/repo/falcosecurity-packages.asc).
{{% /pageinfo %}}

Most Falco packages available at [download.falco.org](https://download.falco.org/?prefix=packages/) are provided with a detached signature that can be used to verify that the package information downloaded from the remote repository can be trusted.

The **latest trusted public GPG key** used for packages signing can be downloaded from [falco.org/repo/falcosecurity-packages.asc](https://falco.org/repo/falcosecurity-packages.asc). The following table lists all the keys employed by the organization currently and in the past, including the revoked ones. We recommend updating the revoked keys to download their revocation certificate, and eventually removing them from your package verification system due to the signature made with them not being trustable anymore.

| **Fingerprint**                            | **Expiration** | **Usage**              | **Status** | **Download**                                                   |
| ------------------------------------------ | -------------- | ---------------------- | ---------- | -------------------------------------------------------------- |
| `2005399002D5E8FF59F28CE64021833E14CB7A8D` | 2026-01-17     | Signing Falco Packages | Trusted    | [falcosecurity-14CB7A8D.asc](/repo/falcosecurity-14CB7A8D.asc) |
| `15ED05F191E40D74BA47109F9F76B25B3672BA8F` | 2023-02-24     | Signing Falco Packages | Revoked    | [falcosecurity-3672BA8F.asc](/repo/falcosecurity-3672BA8F.asc) |

## Troubleshooting

This section aims to offer further guidance when something doesn't go as expected in the installation of Falco.

### Driver issues

* `ERROR failed: unable to find a prebuilt driver`

This error message appears when the falcoctl driver loader tool, which looks for the Falco driver and loads it in memory, is not able to find a pre-built driver, neither as an eBPF probe nor as a kernel module, at the [Falco driver repository] (https://download.falco.org).

{{% pageinfo color=info %}}

You can easily browse and search the supported targets at [download.falco.org/driver/site](https://download.falco.org/driver/site/index.html).

{{% /pageinfo %}}

This means that there's no prebuilt driver available for the kernel running on the machine where Falco is going to be installed.

However, you can add your kernel release version to the [build grid](https://github.com/falcosecurity/test-infra/tree/master/driverkit/config) the pipeline refers to building the drivers. Follow [this tutorial](/docs/tutorials/add-prebuilt-driver-config/) to contribute the required configuration.

{{% pageinfo color=warning %}}
 
There are a limited set of Linux distributions whose kernels are supported by the current prebuilt driver distribution pipeline.

[driverkit](https://github.com/falcosecurity/driverkit) is the tool used to build those drivers. Hence, it needs to support the specific Linux distribution. Find whether your Linux distribution is supported [here](https://github.com/falcosecurity/driverkit/tree/master/pkg/driverbuilder/builder).

{{% /pageinfo %}}


