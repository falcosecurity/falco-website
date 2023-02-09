---
title: Rules basics for the Falco 3.0.0 Helm chart
date: 2023-02-09
author: Luca Guerra
slug: rules-helm-chart-3-0-0
---

# Rules basics for the Falco 3.0.0 Helm chart

The new Falco Helm chart 3.0.0 ([full documentation](https://github.com/falcosecurity/charts/blob/master/falco/README.md), [upgrade information](https://github.com/falcosecurity/charts/blob/master/falco/BREAKING-CHANGES.md#300)) comes with a new way to automatically update the Falco rules that are currently loaded. Of course, you can enable, disable and configure this functionality to your liking. Below, we list a number of common basic use cases and how to easily configure Falco for those:

## Automatically update rules from the Falco organization

If you install the new helm chart with:

```
helm install falco
```

Falco, by default, will **load the latest ruleset** that is compatible with your Falco version and **keep it up to date automatically**. In Falco 0.34.0 this is the `0.x.x` line of rules published by the Falco organization, following the tag `0` published [on GitHub Packages](https://github.com/falcosecurity/rules/pkgs/container/rules%2Ffalco-rules).

## Use the rules embedded in the Falco image

The Falco image ships with a snapshot of the latest version of the official Falco org rules. If you wish to use that without downloading anything at runtime you can install Falco with:

```
helm install falco \
    --set falcoctl.artifact.install.enabled=false \
    --set falcoctl.artifact.follow.enabled=false
```

## Add custom rules with a configmap

On top of any scenario above you can add the `customRules` value to add your own custom rules in a configmap. For instance, if we create a file as [described in the documentation](https://github.com/falcosecurity/charts/tree/master/falco#loading-custom-rules) and then add it to our one of the above command lines with:

```
-f custom_rules.yaml
```

It will be loaded and configured in our Falco instance.

## Only use rules supplied via configmap

If you only want to use the rules that you add via configmap, discarding all automated updates and default rules shipping in the image you have to remove the `falco_rules.yaml` entry from the Falco configuration. Assuming you have your custom rules in `custom_rules.yaml`:

```
helm install falco -f ./custom-rules.yaml \
    --set "falco.rules_file={/etc/falco/falco_rules.local.yaml,/etc/falco/rules.d}" \
    --set falcoctl.artifact.install.enabled=false \
    --set falcoctl.artifact.follow.enabled=false
```
