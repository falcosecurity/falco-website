---
title: Deployment
description: Installing Falco on a Cluster
weight: 4
---

## Kubernetes

Falco can be deployed in Kubernetes as a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) to monitor the system events in each node of your cluster.

### Helm

One of the easiest ways to install Falco in Kubernetes is by using [Helm](https://v3.helm.sh/docs/intro/install/). The Falco community supports an official helm chart, and documentation on how to use it can [be found here](https://github.com/falcosecurity/charts/tree/master/falco). The chart [can be easily configured](https://github.com/falcosecurity/charts/tree/master/falco#configuration) to fit the most common installation requirements.

### DaemonSet

Falco can also be installed in Kubernetes manually. In this case, you are in charge of providing the DaemonSet object YAML definition and deploying it in your cluster. For further details, [you can find an example here](https://github.com/falcosecurity/evolution/tree/master/deploy/kubernetes/falco/templates).

