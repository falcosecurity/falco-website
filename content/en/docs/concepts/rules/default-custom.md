---
title: Default and Local Rules Files
description: Falco provides default rules, but you can add your own
linktitle: Default and Local Rules
weight: 20
aliases:
- ../../rules/default-custom
---

Falco comes with a default rules file that is loaded if no specific configuration is provided. However, that can be completely customized in several ways, depending on how Falco is installed. There are several ways to specify the location of your custom rules, download them, and keep them up to date.

## The configuration file

The default configuration file, [`/etc/falco/falco.yaml`](https://github.com/falcosecurity/falco/blob/master/falco.yaml) makes Falco load rules from the `/etc/falco/falco_rules.yaml` file, followed by any custom rules located in the `/etc/falco/falco_rules.local.yaml` file, followed by any custom rules located in the `/etc/falco/rules.d` directory. This configuration is governed by the `rules_files` key:

```
rules_files:
  - /etc/falco/falco_rules.yaml
  - /etc/falco/falco_rules.local.yaml
  - /etc/falco/rules.d
```

Changing these configuration entries will affect the location and loading order of the rules files.

> You can find the details of the available default rules in this [page](/docs/reference/rules/default-rules/) or in the Falco rules auto-generated [**documentation**](https://falcosecurity.github.io/rules/).

If you are running Falco directly from the command line, you can use the `-r` switch to load as many rules files as needed. Is it possible to provide `-r` with the path of a single file or directory (in this latter case, all the rules files in the directory will be loaded). The switch can be specified multiple times; if is specified at least once, the `rules_files` key in the configuration file is ignored.
e.g.:

```
# falco -r /path/to/my/rules1.yaml -r /path/to/my/rules2.yaml
```

## Falcoctl

The [falcoctl](https://github.com/falcosecurity/falcoctl) tool provides functionality to download and update rules files distributed as OCI artifacts. The `install` command of the [falcoctl](https://github.com/falcosecurity/falcoctl) tool will download rules files to a configurable directory (by default, that is `/etc/falco`). For instance, to install a specific version of the default rules file in `/etc/falco` you can run the following commands:

```
# falcoctl index add falcosecurity https://falcosecurity.github.io/falcoctl/index.yaml
# falcoctl artifact install falco-rules:3.2.0
```

Falcoctl is available as a standalone tool, included in Falco packages and container images, automatically installed as a systemd unit or deployed as an init container via the Helm chart.

## Rules installed via the Helm chart

If you install the [Helm chart](https://github.com/falcosecurity/charts), at least version 3.0.0 with:

```
helm install falco
```

Falco, by default, will **load the latest rules file** that is compatible with your Falco version and **keep it up to date automatically** via falcoctl. These are published [on GitHub Packages](https://github.com/falcosecurity/rules/pkgs/container/rules%2Ffalco-rules).

### Use the rules embedded in the Falco image

The Falco image ships with a snapshot of the latest version of the official Falco rules. If you wish to use that without downloading anything at runtime, you can install Falco with:

```
helm install falco \
    --set falcoctl.artifact.install.enabled=false \
    --set falcoctl.artifact.follow.enabled=false
```

### Add custom rules with a configmap

You can always use the `customRules` value to add your own custom rules in a configmap. For instance, if we create a file as [described in the documentation](https://github.com/falcosecurity/charts/tree/master/charts/falco#loading-custom-rules), and then add it to our install command above as follows:

```
helm install falco \
    --set falcoctl.artifact.install.enabled=false \
    --set falcoctl.artifact.follow.enabled=false \
    -f custom_rules.yaml
```
or if you have already installed falco, you can use the `helm upgrade -i`

```
helm upgrade -i falco \
    --set falcoctl.artifact.install.enabled=false \
    --set falcoctl.artifact.follow.enabled=false \
    -f custom_rules.yaml
```

it will be loaded and configured in our Falco instance and you can verify by checking the falco daemonset container logs with the command below:

```
kubectl logs -n falco daemonsets/falco
```

> Notice: the new rule files described in `customRules` will be placed in the `/etc/falco/rules.d` directory, and will be loaded following the order specified in the configuration file: in the default configuration, this means that will be loaded after `/etc/falco/falco.yaml` and `/etc/falco/falco_rules.local.yaml` rules files.

## Only use rules supplied via configmap

If you only want to use the rules that you add via configmap, discarding all automated updates and default rules shipped in the image, you have to remove the `falco_rules.yaml` and `falco_rules.local.yaml` entries from the Falco configuration. Assuming you have your custom rules in `custom_rules.yaml`:

```
helm install falco -f ./custom_rules.yaml \
    --set "falco.rules_files={/etc/falco/rules.d}" \
    --set falcoctl.artifact.install.enabled=false \
    --set falcoctl.artifact.follow.enabled=false
```
