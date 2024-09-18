---
title: Specific Environments
description: Environment-specific considerations for deploying Falco in production
aliases:
- ../getting-started/third-party/production
weight: 90
---

## GKE {#gke}

Google Kubernetes Engine (GKE) uses Container-Optimized OS (COS) as the default operating system for its worker node pools. COS is a security-enhanced operating system that limits access to certain parts of the underlying OS. Because of this security constraint, Falco cannot insert its {{< glossary_tooltip text="Kernel Module" term_id="kernel-module-driver" >}} to process events for system calls. However, COS provides the ability to leverage eBPF (extended Berkeley Packet Filter) to supply the stream of system calls to the Falco engine.

To use Falco on GKE, you need to [deploy](/docs/setup/kubernetes/) using one of the two available eBPF drivers. The {{< glossary_tooltip text="Modern eBPF" term_id="modern-ebpf-probe" >}} is the default driver for Falco 0.38.0 and later, so no further action is required in this case. If your system does not support the modern eBPF driver, you can use the legacy {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}} driver.

## K3s {#k3s}

[K3s](https://k3s.io/) is a lightweight, CNCF certified Kubernetes distribution. It has embedded components like etcd (datastore), CoreDNS, traefik ingress controller, etc., to simplify Kubernetes installation or upgrade.

If you are using K3s with containerd, you should set the CRI settings because the socket path is different from the default setting configured in Falco.

- If you install Falco on the host machine:
  - Append the parameter `--cri /run/k3s/containerd/containerd.sock` when starting the Falco binary.
- If you install Falco inside K3s with Helm:
  - Append the options below when installing with Helm:

  ```shell
  --set collectors.containerd.enabled=true --set collectors.containerd.socket=/run/k3s/containerd/containerd.sock
  ```