---
title: Kernel Events Architecture
description: 'Architecture overview for kernel events.'
linktitle: Kernel Events Architecture Overview
weight: 20
---

This document describes the overall architecture that allows events from kernel sources to be ingested by Falco, how to use the libraries to inspect the data collection flow and how Falco manages the boundary between the kernel and userspace. In order to make Falco compatible with a very large number of Linux Kernel versions, the internal APIs and low level communication mechanisms that are employed to cross the kernel and userspace boundary vary greatly between driver types and may be different between driver versions or kernel versions. However, they all implement the same event collection interface as described below.

## How Falco interacts with kernel components

The component of the [Falco libraries](https://github.com/falcosecurity/libs) that gathers data from the syscalls and interacts with the kernel is called `libscap`. Internally, it implements all functionality required to use the drivers to collect kernel events.

When using the kernel module or legacy eBPF probe, the driver will need to be installed and deployed separately as a kernel object or probe, while the modern eBPF probe can be installed directly by libscap.

Upon connection to its kernel counterpart, libscap will need to negotiate the API Version and Schema Version that the driver recognizes. These versions are expressed with a [semver](https://semver.org/) subset and are [documented in the libs repository](https://github.com/falcosecurity/libs/blob/master/driver/README.VERSION.md).
* The [API version](https://github.com/falcosecurity/libs/blob/master/driver/README.VERSION.md#api-version-number) refers to the communication mechanism between the kernel and userspace. Every driver has a different communication mechanism which changes between versions. The kernel module may use `ioctl`s and a ring buffer, while the eBPF probes can use maps and different APIs depending on the kernel version and eBPF probe edition. Since some drivers can be deployed separately from Falco, at startup libscap will verify if the driver it's connecting to is compatible.
* The [Schema version](https://github.com/falcosecurity/libs/blob/master/driver/README.VERSION.md#api-version-number) refers to the type of events that the specific driver supports. The [Syscall Events](/docs/reference/rules/supported-events/) documentation page shows the list of fields that are supported for each version of Falco. Every time that list changes the version number is updated as well.

<div>
  <img style="width: 60%; margin: auto" 
       alt="Initializing kernel source data collection" 
       src="/docs/images/kernel_source_start_capture.png" >
</div>

When running Falco it is possible to verify the currently compatible version numbers with `falco --version`. For instance, this is the output for Falco 0.35.1:

```
# falco --version
2023-07-01T16:23:43+0000: Falco version: 0.35.1 (x86_64)
2023-07-01T16:23:43+0000: Falco initialized with configuration file: /etc/falco/falco.yaml
Falco version: 0.35.1
Libs version:  0.11.3
Plugin API:    3.0.0
Engine:        17
Driver:
  API version:    4.0.0
  Schema version: 2.0.0
  Default driver: 5.0.1+driver
```

Once Falco is running, a stream of events is returned directly from the kernel. libscap's API allow the data to flow with a consistent format from the kernel to userspace.

The main interface that governs this is the scap event format. Once the chosen driver is loaded and initialized in the kernel, the events are encoded with a specific header and a payload:

```Cpp=
struct ppm_evt_hdr {
	uint64_t ts; /* timestamp, in nanoseconds from epoch */
	uint64_t tid; /* the tid of the thread that generated this event */
	uint32_t len; /* the event len, including the header */
	uint16_t type; /* the event type */
	uint32_t nparams; /* the number of parameters of the event */
};
```

The payload contains an array of lengths of each parameter followed by the content of the parameters themselves. The parameter type is a numeric identifer that maps with each event documented in the reference.

For example, the `dup3` event is defined in the reference as:

**dup3**(FD res, FD oldfd, FD newfd, FLAGS32 flags: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*) 

Meaning that its encoding will be composed of an header containing the timestamp and tid, `nparams` will be 4 and the complete encoding will be:

```
[header] [uint16(8)] [uint16(8)] [uint16(8)] [uint16(32)] [res] [oldfd] [newfd] [flags]
```

<div>
  <img style="width: 60%; margin: auto" 
       alt="Retrieving kernel events" 
       src="/docs/images/kernel_source_capture.png" >
</div>

## Use scap-open to inspect kernel data collection

Contributors and expert users can find a tool called [scap-open](https://github.com/falcosecurity/libs/tree/master/userspace/libscap/examples/01-open) in the libs repo. This tool allows to dump raw events from a variety of drivers. Building and usage instructions are included in the repository.
