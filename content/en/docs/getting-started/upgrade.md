---
title: Upgrade
description: Upgrading Falco on a Linux system
weight: 3
---

## Upgrading

### Debian/Ubuntu {#debian}

*TODO*

### CentOS/RHEL/Fedora/Amazon Linux {#centos-rhel}

{{% pageinfo color="warning" %}}
If you configured the yum repository by having followed the instructions for Falco 0.27.0 or older, 
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