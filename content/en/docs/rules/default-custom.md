---
title: Default and Local Rules Files
description: Falco provides default rules, but you can add your own
linktitle: Default and Local Rules
weight: 20
---

Falco comes with a default yaml rules file that is loaded if no specific configuration is provided, but that can be completely customized in several ways, depending on how Falco is installed. There are several ways in which you can specify the location of your custom rules and also download them and keep them up to date.

## The configuration file

The default configuration file, [`/etc/falco/falco.yaml`](https://github.com/falcosecurity/falco/blob/master/falco.yaml) makes Falco load rules from the `/etc/falco/falco_rules.yaml` file followed by any custom rules located in the `/etc/falco/rules.d` directory. This configuration is governed by the `rules_file` key:

```
rules_file:
  - /etc/falco/falco_rules.yaml
  - /etc/falco/falco_rules.local.yaml
  - /etc/falco/rules.d
```

Changing these configuration entries will affect the location and the order of the files that are downloaded.

## The command line

If you are running Falco directly from the command line, you can use the `-r` switch to add as many rules files as needed. e.g.:

```
# falco -r /path/to/my/rules1.yaml -r /path/to/my/rules2.yaml
```

## Falcoctl

The [falcoctl](https://github.com/falcosecurity/falcoctl) tool provides functionality to download and update rules files when distributed as OCI artifacts to directories that can be specified by the user. The `install` command of the [falcoctl](https://github.com/falcosecurity/falcoctl) tool will download rulesfile OCI packages to a configurable directory (by default, that is `/etc/falco`). For instance, in order to install a specific version of the default rules file in `/etc/falco` you can run

```
# falcoctl index add falcosecurity https://github.io/falcosecurity/index.yaml
# falcoctl artifact install falco-rules:1.0.0
```

Falcoctl is available as a standalone tool, included in the Falco image, packaged as a systemd unit and installed via the Helm chart.

## Rules installed via the Helm chart

If you install the [Helm chart](https://github.com/falcosecurity/charts), at least version 3.0.0 with:

```
helm install falco
```

Falco, by default, will **load the latest rules file** that is compatible with your Falco version and **keep it up to date automatically** via falcoctl. These are published [on GitHub Packages](https://github.com/falcosecurity/rules/pkgs/container/rules%2Ffalco-rules).

### Use the rules embedded in the Falco image

The Falco image ships with a snapshot of the latest version of the official Falco org rules. If you wish to use that without downloading anything at runtime you can install Falco with:

```
helm install falco \
    --set falcoctl.artifact.install.enabled=false \
    --set falcoctl.artifact.follow.enabled=false
```

### Add custom rules with a configmap

You can always add the `customRules` value to add your own custom rules in a configmap. For instance, if we create a file as [described in the documentation](https://github.com/falcosecurity/charts/tree/master/falco#loading-custom-rules) and then add it to our one of the above command lines with:

```
-f custom_rules.yaml
```

It will be loaded and configured in our Falco instance.

## Only use rules supplied via configmap

If you only want to use the rules that you add via configmap, discarding all automated updates and default rules shipping in the image you have to remove the `falco_rules.yaml` entry from the Falco configuration. Assuming you have your custom rules in `custom_rules.yaml`:

```
helm install falco -f ./custom_rules.yaml \
    --set "falco.rules_file={/etc/falco/falco_rules.local.yaml,/etc/falco/rules.d}" \
    --set falcoctl.artifact.install.enabled=false \
    --set falcoctl.artifact.follow.enabled=false
```
