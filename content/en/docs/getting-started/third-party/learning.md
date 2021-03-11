---
title: Learning Environment
description: Integrations built on the Falco core in a learning environment
weight: 2
---

## minikube

The easiest way to use Falco on Kubernetes in a local environment is on [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/).

When running `minikube` with the default `--driver` arguments, Minikube creates a VM that runs the various Kubernetes services and a container framework to run Pods, etc. Generally, it's not possible to build the Falco kernel module directly on the minikube VM, as the VM doesn't include the kernel headers for the running kernel.

To address this, starting with Falco 0.13.1 a pre-build kernel modules for the last 10 minikube versions are available at https://s3.amazonaws.com/download.draios.com. This allows the download fallback step to succeed with a loadable kernel module. Falco now supports 10 most recent versions of minikube with each new Falco release. Falco currently retains previously-built kernel modules for download and continues to provide limited historical support as well.

You can follow the official
[Get Started!](https://minikube.sigs.k8s.io/docs/start/) guide to install.

<a class="btn btn-primary" href="https://minikube.sigs.k8s.io/docs/start/" role="button" aria-label="View minikube Get Started! Guide">View minikube Get Started! Guide</a>

**Note**: Ensure that you have [installed kubectl](/docs/getting-started/third-party/install-tools/#kubectl).

To set up Falco with minikube:

1. Create the cluster with Minikube using a VM driver, in this case Virtualbox:

    ```shell
    minikube start --driver=virtualbox
    ```

2. Check that all pods are running:

    ```shell
    kubectl get pods --all-namespaces
    ```

3. Add the stable chart to Helm repository:

    ```shell
    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update
    ```

4. Install Falco using Helm:

    ```shell
    helm install falco falcosecurity/falco
    ```

    The output is similar to:

```
NAME: falco
LAST DEPLOYED: Wed Jan 20 18:24:08 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Falco agents are spinning up on each node in your cluster. After a few
seconds, they are going to start monitoring your containers looking for
security issues.


No further action should be required.


Tip:
You can easily forward Falco events to Slack, Kafka, AWS Lambda and more with falcosidekick.
Full list of outputs: https://github.com/falcosecurity/charts/falcosidekick.
You can enable its deployment with `--set falcosidekick.enabled=true` or in your values.yaml.
See: https://github.com/falcosecurity/charts/blob/master/falcosidekick/values.yaml for configuration values.
```

5. Check the logs to ensure that Falco is running:

    ```shell
    kubectl logs -l app=falco -f
    ```

    The output is similar to:

```
* Trying to dkms install falco module with GCC /usr/bin/gcc-5
DIRECTIVE: MAKE="'/tmp/falco-dkms-make'"
* Running dkms build failed, couldn't find /var/lib/dkms/falco/5c0b863ddade7a45568c0ac97d037422c9efb750/build/make.log (with GCC /usr/bin/gcc-5)
* Trying to load a system falco driver, if present
* Success: falco module found and loaded with modprobe
Wed Jan 20 12:55:47 2021: Falco version 0.27.0 (driver version 5c0b863ddade7a45568c0ac97d037422c9efb750)
Wed Jan 20 12:55:47 2021: Falco initialized with configuration file /etc/falco/falco.yaml
Wed Jan 20 12:55:47 2021: Loading rules from file /etc/falco/falco_rules.yaml:
Wed Jan 20 12:55:48 2021: Loading rules from file /etc/falco/falco_rules.local.yaml:
Wed Jan 20 12:55:49 2021: Starting internal webserver, listening on port 8765
```

## kind

[`kind`](https://kind.sigs.k8s.io/docs/) lets you run Kubernetes on
your local computer. This tool requires that you have
[Docker](https://docs.docker.com/get-docker/) installed and configured. 
*Currently not working directly on Mac with Linuxkit, but these directions work on Linux guest OS running kind

The kind [Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/) page
shows you what you need to do to get up and running with kind.

<a class="btn btn-primary" href="https://kind.sigs.k8s.io/docs/user/quick-start/" role="button" aria-label="View kind Quick Start Guide">View kind Quick Start Guide</a>

To run Falco on a `kind` cluster is as follows:

1. Create a configuration file. For example: `kind-config.yaml`

2. Add the following to the file:

    ```yaml
    kind: Cluster
    apiVersion: kind.x-k8s.io/v1alpha4
    nodes:
    - role: control-plane
      extraMounts:
        # allow Falco to use devices provided by the kernel module
      - hostPath: /dev
        containerPath: /dev
        # allow Falco to use the Docker unix socket
      - hostPath: /var/run/docker.sock
        containerPath: /var/run/docker.sock
    ```

3. Create the cluster by specifying the configuration file:

    ```shell
    kind create cluster --config=./kind-config.yaml
    ```

4. [Install](/docs/getting-started/installation) Falco on a node in the kind cluster. To install Falco as a daemonset on a Kubernetes cluster use Helm. For more information about the configuration of Falco charts, see https://github.com/falcosecurity/charts/tree/master/falco.

## MicroK8s

MicroK8s is the smallest, fastest multi-node Kubernetes. Single-package fully conformant lightweight Kubernetes that works on Linux, Windows and Mac. Perfect for: Developer workstations, IoT, Edge, CI/CD.

You can follow the official
[Getting Started](https://microk8s.io/docs) guide to install.

<a class="btn btn-primary" href="https://microk8s.io/docs" role="button" aria-label="View MicroK8s Getting Started Guide">View MicroK8s Getting Started Guide</a>

To run Falco on MicroK8s:

1. [Install](/docs/getting-started/installation) Falco on a node in the MicroK8s cluster. To install Falco as a daemonset on a Kubernetes cluster use Helm. For more information about the configuration of Falco charts, see https://github.com/falcosecurity/charts/tree/master/falco.
