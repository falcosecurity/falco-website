---
title: Falco Drivers
weight: 1
---

Falco depends on a driver that taps into the stream of system calls on a machine and passes those system calls to user space.

The kernel module called `falco` is the default driver. Alternatively, an eBPF probe can be used. 

# Using the kernel module


By default, the kernel module will be installed when installing the Falco [debian/rpm](../installation) package, when running the `falco-driver-loader` script shipped within the [binary pagacke](../installation#linux-binary), or when running the `falcosecurity/falco-driver-loader` docker image (that just wraps the aforementioned script). 

To install the kernel module, please refer to the [installation](/docs/installation/#installing-the-driver) page.

Falco tries to use the kernel module driver by default.

# Using the eBPF probe

The eBPF probe is an alternative to the one described above. Note that eBPF is a feature supported only by recent kernels.

To install the eBPF probe, please refer to the [installation](/docs/installation/#installing-the-driver) page.

To enable the eBPF support in Falco set the `FALCO_BPF_PROBE` environment variable to an empty value (ie. `FALCO_BPF_PROBE=""`) or otherwise explicitly set it to the path where the eBPF probe resides.
