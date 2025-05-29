---
title: Install on a host (tarball)
description: Learn how to set up Falco using the .tar.gz archive on your host
weight: 40
---

{{% pageinfo color="primary" %}}
Falco consumes streams of events and evaluates them against a set of security {{< glossary_tooltip text="rules" term_id="rules" >}} to detect abnormal behavior. By default, Falco is pre-configured to consume events from the Linux Kernel. This scenario requires Falco to be privileged, and depending on the kernel version installed on the host, a {{< glossary_tooltip text="driver" term_id="drivers" >}} needs to be installed.

For other installation scenarios, such as consuming cloud events or other data sources using plugins, please refer to the [Plugins](/docs/concepts/plugins/) section.
{{% /pageinfo %}}

There are two main methods to install Falco on your host using the [released Falco packages](/docs/download):

1. **RPM or DEB package (includes Systemd setup):** For instructions, refer to the [Install on a host (DEB, RPM)](/docs/setup/packages) page.
2. **Tarball archive:** This method is detailed on this page.

## Install

In these steps, we are targeting a Debian-like system on `x86_64` architecture. You can easily extrapolate similar steps for other distros or architectures.

1. Download the latest binary:

    ```shell
    curl -L -O https://download.falco.org/packages/bin/x86_64/falco-{{< latest >}}-x86_64.tar.gz
    ```

2. Install Falco:

    ```shell
    tar -xvf falco-{{< latest >}}-x86_64.tar.gz
    cp -R falco-{{< latest >}}-x86_64/* /
    ```

3. Install some required dependencies that are needed to build the kernel module and the eBPF probe. If you want to use other sources like the modern eBPF probe or plugins, you can skip this step.

    ```shell
    apt update -y
    apt install -y dkms make linux-headers-$(uname -r)
    # If you use falcoctl driver loader to build the eBPF probe locally you need also clang toolchain
    apt install -y clang llvm
    ```

4. Use the `falcoctl driver` tool to configure Falco and install the kernel module or the eBPF probe. If you want to use other sources like the modern eBPF probe or plugins, you can skip this step.

   {{% pageinfo color="info" %}}

   To install the driver, write and execute permissions on the `/tmp` directory are required, since `falcoctl` will try to create and execute a script from there.
    
   {{% /pageinfo %}}

   ```shell
   # If you want to use the kernel module, configure Falco for it
   falcoctl driver config --type kmod
   # If you want to use the eBPF probe, configure Falco for it
   falcoctl driver config --type ebpf
   # Install the chosen driver
   falcoctl driver install
   ```

   By default, the `falcoctl driver install` command tries to download a prebuilt driver from [the official Falco download s3 bucket](https://download.falco.org/?prefix=driver/). If a driver is found, it is inserted into `${HOME}/.falco/`. Otherwise, the script tries to compile the driver locally; for this reason, you need the dependencies in step [3].

   You can use the environment variable `FALCOCTL_DRIVER_REPOS` to override the default repository URL for prebuilt drivers. The URL must not have a trailing slash, i.e., `https://myhost.mydomain.com` or, if the server has a subdirectory structure, `https://myhost.mydomain.com/drivers`. The drivers must be hosted with the following structure:

   ```shell
   /${driver_version}/${arch}/falco_${target}_${kernelrelease}_${kernelversion}.[ko|o]
   ```

   where `ko` and `o` stand for Kernel module and `eBPF` probe, respectively. This is an example:

   ```text
   /7.0.0+driver/x86_64/falco_amazonlinux2022_5.10.75-82.359.amzn2022.x86_64_1.ko
   ```
    
> If you wish to print some debug info, you can use:

   ```shell
   # If you want to use the kernel module, configure Falco for it
   falcoctl driver printenv
   ```

## Manual Systemd setup

The Falco `.tar.gz` archive doesn't include the Systemd setup. If you want to enable Falco to start automatically at boot time, you can still download `systemd` files from the [Falco repo](https://github.com/falcosecurity/falco/tree/master/scripts/systemd) and place them in the `/lib/systemd/system` directory. Finally, you can follow the same instructions for [enabling Systemd manually](/docs/setup/packages#enable-falco-on-systemd-manually) under the _Install on a host (DEB, RPM)_ section.

## Configuration

The Falco configuration file is located at `/etc/falco/falco.yaml`. You can edit it to customize Falco's behavior.

Since Falco 0.38.0, a new config key, `config_files`, allows the user to load additional configuration files to override main config entries; it allows users to keep local customization between Falco upgrades. Its default value points to a new folder, `/etc/falco/config.d/`, that gets installed by Falco and will be processed to look for local configuration files.

You can also override the default configuration by passing options to the `falco` binary. For example, to force the eBPF probe or the kernel module:

```shell
# Force eBPF probe
falco -o engine.kind=ebpf
# Force kernel module
falco -o engine.kind=kmod
```

### Hot Reload

By default, with the `watch_config_files` configuration option enabled, Falco automatically monitors changes to configuration and rule files. When these files are modified, Falco will automatically reload the updated configuration without requiring a restart. 

If this option is disabled, you can manually reload the configuration by sending a `SIGHUP` signal to the Falco process. To do this, use the following command:

```shell
kill -1 $(pidof falco)
```

## Upgrade

If you are using the {{< glossary_tooltip text="Kernel Module" term_id="kernel-module" >}} driver, please remove it with root privileges before upgrading Falco to avoid issues during the upgrade.

```shell
rmmod falco
```

When utilizing the {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}} driver, although not strictly required, you can remove the corresponding previous object files:

```shell
rm /root/.falco/*.o
```

With {{< glossary_tooltip text="Modern eBPF" term_id="modern-ebpf-probe" >}}, there is no requirement when updating Falco, as the driver is bundled within the Falco binary.

Once the driver is removed, ensure the `falco` daemon is not running, then you can follow the same steps as the [Install](#install) section.

## Uninstall

For the Falco binary, we don't provide specific update paths; you just have to remove files installed by the old `tar.gz`.