---
title: Upgrade
description: Upgrading Falco on a Linux system
weight: 3
---

This section provides upgrading paths for Falco if previously installed following the [Install](../installation/) section. 

## Upgrading

### Debian/Ubuntu {#debian}

{{% pageinfo color="warning" %}}
If you configured the `apt` repository by having followed the instructions for Falco 0.27.0 or older, 
you may need to update the repository URL:

```shell
sed -i 's,https://dl.bintray.com/falcosecurity/deb,https://download.falco.org/packages/deb,' /etc/apt/sources.list.d/falcosecurity.list
apt-get clean
apt-get -y update
```

Check in the `apt-get update` log that `https://download.falco.org/packages/deb` is present.

{{% /pageinfo %}}

If you installed Falco by following the [provided instructions](../installation/#debian):

```shell
apt-get --only-upgrade install falco
```

### CentOS/RHEL/Fedora/Amazon Linux {#centos-rhel}

{{% pageinfo color="warning" %}}
If you configured the `yum` repository by having followed the instructions for Falco 0.27.0 or older, 
you may need to update the repository URL:

```shell
sed -i 's,https://dl.bintray.com/falcosecurity/rpm,https://download.falco.org/packages/rpm,' /etc/yum.repos.d/falcosecurity.repo
yum clean all
```

Then check that the `falcosecurity-rpm` repository is pointing to `https://download.falco.org/packages/rpm/`:

```shell
yum repolist -v falcosecurity-rpm
```
{{% /pageinfo %}}

If you installed Falco by following the [provided instructions](../installation/#centos-rhel):

1. Check for updates:
    ```shell
    yum check-update
    ```

2. If a newer Falco version is available:
    ```shell
    yum update falco
    ```

### openSUSE {#suse}

{{% pageinfo color="warning" %}}
If you configured the `zypper` repository by having followed the instructions for Falco 0.27.0 or older,
you may need to update the repository URL:

```shell
sed -i 's,https://dl.bintray.com/falcosecurity/rpm,https://download.falco.org/packages/rpm,' /etc/zypp/repos.d/falcosecurity.repo
zypper refresh
```

Then check that the `falcosecurity-rpm` repository is pointing to `https://download.falco.org/packages/rpm/`:

```shell
zypper lr falcosecurity-rpm
```
{{% /pageinfo %}}

If you installed Falco by following the [provided instructions](../installation/#suse):

```shell
zypper update falco
```
