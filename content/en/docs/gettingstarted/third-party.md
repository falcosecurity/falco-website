---
title: Third-Party Integrations
description: Community driven integrations built on the Falco core
weight: 5
---

## Scripted install {#scripted}

To install Falco on Linux, you can download a shell script that takes care of the necessary steps:

```shell
curl -o install_falco -s https://falco.org/script/install
```

Then verify the [SHA256](https://en.wikipedia.org/wiki/SHA-2) checksum of the script using the `sha256sum` tool (or something analogous):

```shell
sha256sum install_falco
```

It should be `{{< sha256sum >}}`.

Then run the script either as root or with sudo:

```shell
sudo bash install_falco
```

## Minikube

The easiest way to use Falco on Kubernetes in a local environment is on [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/). Both the Kubernetes YAML manifests and the Helm chart are regularly tested with Minikube.

When running `minikube` with the default `--driver` arguments, Minikube creates a VM that runs the various Kubernetes services and a container framework to run Pods, etc. Generally, it's not possible to build the Falco kernel module directly on the Minikube VM, as the VM doesn't include the kernel headers for the running kernel.

To address this, starting with Falco 0.13.1 we pre-build kernel modules for the last 10 Minikube versions and make them available at https://s3.amazonaws.com/download.draios.com. This allows the download fallback step to succeed with a loadable kernel module.

Going forward, we'll continue to support 10 most recent versions of Minikube with each new Falco release. We currently retain previously-built kernel modules for download, so we will continue to provide limited historical support as well.

Also see [this blog post](https://falco.org/blog/minikube-falco-kernel-module/) on how to set up Falco with Minikube

## Kind

The easiest way to run Falco on a [Kind](https://github.com/kubernetes-sigs/kind) cluster is as follows:

1. Create a configuration file. For example: `kind-config.yaml`

2. Add the following to the file:
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraMounts:
  - hostPath: /dev
    containerPath: /dev
```

3. Create the cluster by specifying the configuration file:
```
kind create cluster --config=./kind-config.yaml
```

4. [Install](../installation) Falco in your Kubernetes cluster with kind.


## Helm

Helm is a way to install Falco in Kubernetes. The Falco community supports a helm chart and documentation on how to use it can [be found here](https://github.com/falcosecurity/charts/tree/master/falco).

## Puppet

A [Puppet](https://puppet.com/) module for Falco, `sysdig-falco`, is available on [Puppet Forge](https://forge.puppet.com/sysdig/falco/readme).

## Ansible

[@juju4](https://github.com/juju4/) has helpfully written an [Ansible](https://ansible.com) role for Falco, `juju4.falco`. It's available on [GitHub](https://github.com/juju4/ansible-falco/) and [Ansible Galaxy](https://galaxy.ansible.com/juju4/falco/). The latest version of Ansible Galaxy (v0.7) doesn't work with Falco 0.9, but the version on GitHub does.

## CoreOS

The recommended way to run Falco on CoreOS is inside of its own Docker container using the install commands in the [Docker section](/docs/gettingstarted/running#docker). This method allows full visibility into all containers on the host OS.

This method is automatically updated, includes some nice features such as automatic setup and bash completion, and is a generic approach that can be used on other distributions outside CoreOS as well.

However, some users may prefer to run Falco in the CoreOS toolbox. While not the recommended method, this can be achieved by installing Falco inside the toolbox using the normal installation method, and then manually running the `falco-driver-loader` script:

```shell
toolbox --bind=/dev --bind=/var/run/docker.sock
curl -s https://falco.org/script/install | bash
falco-driver-loader
```


## GKE

Google Kubernetes Engine (GKE) uses Container-Optimized OS (COS) as the default operating system for its worker node pools. COS is a security-enhanced operating system that limits access to certain parts of the underlying OS. Because of this security constraint, Falco cannot insert its kernel module to process events for system calls. However, COS provides the ability to leverage eBPF (extended Berkeley Packet Filter) to supply the stream of system calls to the Falco engine.

Falco can use eBPF with minimal configuration changes. To do so, set the `FALCO_BPF_PROBE` environment variable to an empty value: `FALCO_BPF_PROBE=""`.

eBPF is currently supported only on GKE and COS, however here we provide installation details for a wider set of platforms

{{< info >}}

 If you want to specify an alternative path for the probe file, you can also set `FALCO_BPF_PROBE` to the path of an existing eBPF probe.

{{< /info >}}

When using the official container images, setting this environment variable will trigger the `falco-driver-loader` script to download the kernel headers for the appropriate version of COS, and then compile the appropriate eBPF probe. In all the other environments you can call the `falco-driver-loader` script yourself to obtain it in this way:

```bash
sudo FALCO_VERSION="{{< latest >}}" FALCO_BPF_PROBE="" falco-driver-loader
```

To execute the script above successfully, you will need `clang` and `llvm` installed.

If you are installing Falco from packages, you will need to edit the `falco` systemd unit.

You can do that by executing the following command:

```bash
systemctl edit falco
```

It will open your editor, at this point you can set the environment variable for the unit by adding this content
to the file:

```
[Service]
Environment='FALCO_BPF_PROBE=""'
```

If you are [installing Falco with Helm](https://falco.org/docs/third-party/#helm), you will need to set the `ebpf.enabled` option to `true`:

```
helm install falco falcosecurity/falco --set ebpf.enabled=true
```