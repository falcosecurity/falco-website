---
title: Specific Environments
description: Environment-specific considerations for deploying Falco in production
aliases:
- ../getting-started/third-party/production
weight: 90
---

## GKE {#gke}

Google Kubernetes Engine (GKE) uses Container-Optimized OS (COS) as the default operating system for its worker node pools. COS is a security-enhanced operating system that limits access to certain parts of the underlying OS. Because of this security constraint, Falco cannot insert its {{< glossary_tooltip text="Kernel Module" term_id="kernel-module-driver" >}} to process events for system calls. However, COS provides the ability to leverage eBPF (extended Berkeley Packet Filter) to supply the stream of system calls to the Falco engine.

To use Falco on GKE, you need to [deploy](/docs/setup/kubernetes/) using the {{< glossary_tooltip text="Modern eBPF" term_id="modern-ebpf-probe" >}}. The Modern eBPF is the default driver for Falco 0.38.0 and later, so no further action is required in this case.
