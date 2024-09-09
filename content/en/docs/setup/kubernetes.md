---
title: Deploy on Kubernetes
description: Learn how to deploy Falco on Kubernetes with Helm
slug: kubernetes
aliases:
- ../deployment
- ../install-operate/deployment
- ../getting-started/deployment
weight: 10
---

{{% pageinfo color="primary" %}}
Falco consumes streams of events and evaluates them against a set of security rules to detect abnormal behavior. By default, Falco is preconfigured to consume events from the Linux Kernel. This default installation scenario will add Falco to all nodes in your cluster using a [DeamonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) and comes with a [pre-installed set of rules](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml). This scenario requires Falco to be privileged, and depending on the kernel version installed on the node, a [driver](/docs/event-sources/kernel/) will be installed on the node.

For other installation scenarios, such as consuming cloud events or other data sources using plugins, please refer to the TBD section.
{{% /pageinfo %}}

The recommended way to deploy Falco on a Kubernetes cluster is to use the Helm chart. The official charts repository is hosted at [https://falcosecurity.github.io/charts](https://falcosecurity.github.io/charts). Before deploying Falco on Kubernetes, ensure you can access the targetted cluster running with Linux nodes, either x86_64 or ARM64. Also, you will need to have [kubectl](https://kubernetes.io/docs/tasks/tools/) and [helm](https://helm.sh/docs/intro/install/) installed and configured.

Alternativelly, Falco can be installed in Kubernetes without Helm by providing manifest files and deploying them to your cluster. For details, see the [example here](https://github.com/falcosecurity/deploy-kubernetes/tree/main/kubernetes/falco/templates).

## Install

First, add the helm repository:

```sh
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
```

Then install Falco:

```sh
helm install --replace falco --namespace falco --create-namespace --set tty=true falcosecurity/falco
```

And check that the Falco pods are running:

```sh
kubectl get pods -n falco
```

Falco pod(s) might need a few seconds to start. Wait until they are ready:

```sh
kubectl wait pods --for=condition=Ready --all -n falco
```

## Configuration

When deploying Falco via Helm, you will use Helm values to pass the Falco configuration. For further details, see the [Falco Helm Chart documentation](https://github.com/falcosecurity/charts/tree/master/charts/falco#configuration).

## Upgrade


If you wish to upgrade Falco to a new version, you need to find the corresponding version in the [Falco Helm Chart repository](https://github.com/falcosecurity/charts/blob/master/charts/falco) (e.g. `4.8.1` is for Falco `0.38.2` ) then run:

```sh
helm upgrade falco -n falco --version 4.8.1
```

{{% pageinfo color="warning" %}}
To avoid any possible disruption, before upgrading to a new version, consult the [Falco Helm chart Breaking Changes page](https://github.com/falcosecurity/charts/blob/master/charts/falco/BREAKING-CHANGES.md).
{{% /pageinfo %}}


## Uninstall

If you wish to remove Falco from your cluster you can simply run:

```sh
helm uninstall falco -n falco
```
