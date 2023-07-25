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

Falco can also be installed in Kubernetes manually. In this case, you are in charge of providing the DaemonSet object YAML definition and deploying it in your cluster. For further details, [you can find an example here](https://github.com/falcosecurity/deploy-kubernetes/tree/main/kubernetes/falco/templates).

### Docker Deprecation in Kubernetes

Since version 1.20, **Kubernetes started deprecating the Docker runtime** in favor of runtimes that use the Container Runtime Interface (CRI). You can find further details on [kubernetes.io](https://kubernetes.io/blog/2020/12/02/dont-panic-kubernetes-and-docker/). In the versions of Kubernetes where Docker has been deprecated, Falco will not be able to obtain container information from the Docker socket anymore. 

Starting from [version 0.15.0](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0150), Falco supports CRI-compatible runtimes such as containerd or CRI-O. A custom container runtime socket path can be specified by using `--cri` command line argument of Falco, or by setting the `containerd.socket` parameter in the official Helm chart. By default, Falco tries to use the containerd socket at `/run/containerd/containerd.sock`.

Falco attempts to use all the supported container runtimes it finds on the system, and queries all of them in cascade when trying to resolve container information. If Falco somehow fails to retrieve the required information, it will keep running as usual but some container-related fields might be shown as _not available_ (`<NA>`). For example, in a scenario where Kubernetes uses containerd but dockerd is also running on the same machine, Falco will first query dockerd, and will eventually fallback to containerd if the required information is not found.

Accordingly, **if you run a recent version of Falco you should not be affected by the Docker deprecation**. If you use a CRI runtime and notice that container-related fields are shown as `<NA>` in Falco alerts, make sure that the `--cri` argument is properly set. If you run a version of Falco prior to v0.15.0, and wish to use it with a CRI-compatible runtime, you might consider updating Falco to a newer version.

As many Falco use cases are out of the scope of Kubernetes, **Falco will keep supporting Docker as a container runtime**. Generally, Falco will keep looking for the Docker socket to obtain container information. If not available, it will automatically attempt using the other supported container runtimes, which include the CRI-compatible ones.

