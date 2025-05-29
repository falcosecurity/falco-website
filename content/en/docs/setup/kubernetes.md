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
Falco consumes streams of events and evaluates them against a set of security {{< glossary_tooltip text="rules" term_id="rules" >}} to detect abnormal behavior. By default, Falco is pre-configured to consume events from the Linux Kernel. This default installation scenario will add Falco to all nodes in your cluster using a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/). This scenario requires Falco to be privileged, and depending on the kernel version installed on the node, a {{< glossary_tooltip text="driver" term_id="drivers" >}} will be installed on the node.

For other installation scenarios, such as consuming cloud events or other data sources using plugins, please refer to the [Plugins](/docs/concepts/plugins/) section.
{{% /pageinfo %}}

The recommended way to deploy Falco on a Kubernetes cluster is to use the provided Helm chart. The official Falco charts repository is hosted at:

- [https://falcosecurity.github.io/charts](https://falcosecurity.github.io/charts)

If needed, you can consult the [Installing Helm](https://helm.sh/docs/intro/install/) guide for information about how to download and install Helm. Before deploying Falco on Kubernetes, ensure you can access the targeted cluster running with Linux nodes, either x86_64 or ARM64. Also, you will need to have [kubectl](https://kubernetes.io/docs/tasks/tools/) and [helm](https://helm.sh/docs/intro/install/) installed and configured.

Alternatively, Falco can be installed in Kubernetes without Helm by providing manifest files and deploying them to your cluster. For details, see the [example here](https://github.com/falcosecurity/deploy-kubernetes/tree/main/kubernetes/falco/templates).

## Install

First, add the Helm repository:

```shell
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
```

Then install Falco:

```shell
helm install --replace falco --namespace falco --create-namespace --set tty=true falcosecurity/falco
```

And check that the Falco pods are running:

```shell
kubectl get pods -n falco
```

Falco pod(s) might need a few seconds to start. Wait until they are ready:

```shell
kubectl wait pods --for=condition=Ready --all -n falco
```

## Configuration

When deploying Falco via Helm, you will use Helm values to pass the Falco configuration. For further details, see the [Falco Helm Chart documentation](https://github.com/falcosecurity/charts/tree/master/charts/falco#configuration).

## Upgrade

If you wish to upgrade Falco to a new version, you need to find the corresponding version in the [Falco Helm Chart repository](https://github.com/falcosecurity/charts/blob/master/charts/falco) (e.g., `4.8.1` is for Falco `0.38.2`) then run:

```shell
helm upgrade falco -n falco --version 4.8.1
```

{{% pageinfo color="warning" %}}
To avoid any possible disruption, before upgrading to a new version, consult the [Falco Helm chart Breaking Changes page](https://github.com/falcosecurity/charts/blob/master/charts/falco/BREAKING-CHANGES.md).
{{% /pageinfo %}}

## Uninstall

If you wish to remove Falco from your cluster, you can simply run:

```shell
helm uninstall falco -n falco
```