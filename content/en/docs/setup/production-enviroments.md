---
title: Production Environments
description: Integrations built on the Falco core in a production environment
aliases:
- ../../getting-started/third-party/production
weight: 90
---

## GKE {#gke}

Google Kubernetes Engine (GKE) uses Container-Optimized OS (COS) as the default operating system for its worker node pools. COS is a security-enhanced operating system that limits access to certain parts of the underlying OS. Because of this security constraint, Falco cannot insert its kernel module to process events for system calls. However, COS provides the ability to leverage eBPF (extended Berkeley Packet Filter) to supply the stream of system calls to the Falco engine.

Falco can use eBPF with minimal configuration changes. To do so, set the `engine.kind` configuration key to `ebpf` in the Falco config file.

eBPF is currently supported only on GKE and COS, however here we provide installation details for a wider set of platforms

{{% pageinfo color="primary" %}}
 If you want to specify an alternative path for the probe file, you can also set `engine.kind.probe` to the path of an existing eBPF probe.
{{% /pageinfo %}}

When using the official container images, setting this environment variable will trigger the `falcoctl driver` tool to download the kernel headers for the appropriate version of COS, and then compile the appropriate eBPF probe. In all the other environments you can call the `falcoctl driver` tool yourself to obtain it in this way:

```bash
sudo falcoctl driver install --type ebpf
```

To execute the script above successfully, you will need `clang` and `llvm` installed.

If you are installing Falco from packages, you can start and enable `falco-bpf.service` systemd unit,
that takes care of forcing the eBPF driver for you.  

If you are [installing Falco with Helm](/docs/setup/kubernetes/), you will need to set the `driver.kind` option to `ebpf`:

```
helm install falco falcosecurity/falco --set driver.kind=ebpf
```

## K3s {#k3s}

[K3s](https://k3s.io/) is a lightweight, CNCF certified Kubernetes distribution. It has embedded components like etcd (datastore), CoreDNS, traefik ingress controller and etc. to simplify Kubernetes installation or upgrade.

If you are using K3s with containerd, you should set the CRI settings because the socket path is different from the default setting configured in Falco.

- If you install Falco on host machine
  - Append the parameter ```--cri /run/k3s/containerd/containerd.sock``` when starting the Falco binary.
- If you install Falco inside K3s with Helm
  - Append below options when install with Helm:

  ```shell
  --set collectors.containerd.enabled=true --set collectors.containerd.socket=/run/k3s/containerd/containerd.sock
  ```
