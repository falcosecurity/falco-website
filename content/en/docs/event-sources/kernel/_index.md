---
title: Kernel Events
description: Events related to the Kernel tells us most of what happens above.
linktitle: Kernel Events
weight: 20
aliases:
- drivers
---

Falco uses different instrumentations to analyze the system workload and pass security events to {{< glossary_tooltip text="userspace" term_id="user-space" >}}. We usually refer to these instrumentations as {{< glossary_tooltip text="drivers" term_id="drivers" >}} since a driver runs in {{< glossary_tooltip text="kernelspace" term_id="kernel-space" >}}. The driver provides the **syscall event source** since the monitored events are strictly related to the {{< glossary_tooltip text="syscall" term_id="syscalls" >}} context.

There are several supported drivers:

- Kernel module *(default)*
- Modern eBPF probe
- Classic eBPF probe

|             | Kernel module | Classic eBPF probe | Modern eBPF probe                                                    |
| ----------- | ------------- | ------------------ | -------------------------------------------------------------------- |
| **x86_64**  | >= 2.6        | >= 4.14            | [Minimal set of features](/docs/event-sources/kernel/#requirements) |
| **aarch64** | >= 3.4        | >= 4.17            | [Minimal set of features](/docs/event-sources/kernel/#requirements) |

## Kernel module

By default, the {{< glossary_tooltip text="kernel module" term_id="kernel-module" >}} will be installed when installing the Falco [debian/rpm](/docs/getting-started/installation) package, when running the `falcoctl driver` tool shipped within the [binary package](/docs/getting-started/installation#linux-binary), or when running the `falcosecurity/falco-driver-loader` docker image (that just wraps the aforementioned tool).

To install the kernel module, please refer to the [installation](/docs/getting-started/installation/#install-driver) page.

### Least privileged mode

The kernel module requires full privileges and cannot run with Linux capabilities

## Modern eBPF probe

The {{< glossary_tooltip text="modern probe" term_id="modern-ebpf-probe" >}} is an alternative driver for Falco. The main advantage it brings to the table is that it is embedded into Falco, which means that you don't have to download or build anything, if your kernel is recent enough Falco will automatically inject it!

### What's new

The new probe is highly customizable, you are not obliged to use one buffer [for each CPU](https://github.com/falcosecurity/falco/blob/660da98e4c37f4d4f79ec4bebf4379d9b90b0892/falco.yaml#L292) you can also use just one huge buffer for all your CPUs! And obviously, also the [buffer size](https://github.com/falcosecurity/falco/blob/660da98e4c37f4d4f79ec4bebf4379d9b90b0892/falco.yaml#L226) is customizable! All this is possible thanks to new outstanding features like [the CO-RE paradigm](https://nakryiko.com/posts/bpf-portability-and-co-re/), [the BPF ring buffer](https://nakryiko.com/posts/bpf-ringbuf/) and many others, if you are curious you can read more about them in this [blog post](/blog/falco-modern-bpf#what-s-new).

### Requirements

The modern BPF probe doesn't require a specific kernel version. Usually, all versions `>=5.8` are enough but there are cases in which the required features could also be backported into older kernels, so it wouldn't be completely fair to define `5.8` as the first supported version. The 2 main required features are:

1. [BPF ring buffer](https://www.kernel.org/doc/html/next/bpf/ringbuf.html) support.
2. A kernel that exposes [BTF](https://docs.kernel.org/bpf/btf.html).

Falco can automatically detect if these features are available on the running machine and can notify you if something is missing. As an alternative, you could always use `bpftool`, you just need to type the following commands:

```bash
sudo bpftool feature probe kernel | grep -q "map_type ringbuf is available" && echo "true" || echo "false" 
sudo bpftool feature probe kernel | grep -q "program_type tracing is available" && echo "true" || echo "false" 
```

### How to run it

To enable the modern eBPF support in Falco, just set the `engine.kind` configuration key to `modern_ebpf`. Nothing else will be needed since no external artifact is required for it to work.

It is supported in all the installation methods of other drivers:

* [Falco packages](/docs/getting-started/installation/#installation-with-dialog)
* [Falco binary](/docs/getting-started/running/#falco-binary)
* [Docker](/docs/getting-started/running/#modern-ebpf)
* [Helm chart](https://github.com/falcosecurity/charts/tree/master/charts/falco#daemonset)


### Useful resources

* [Modern BPF blog post](/blog/falco-modern-bpf/)
* [Modern BPF proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20220329-modern-bpf-probe.md)
* [eBPF day presentation](https://youtu.be/BxoKztfHnYY)

### Least privileged mode

The minimal set of capabilities required by Falco to run the modern eBPF probe is the following:

- `CAP_SYS_BPF`
- `CAP_SYS_PERFMON`
- `CAP_SYS_RESOURCE`
- `CAP_SYS_PTRACE`

The mentioned capabilities require no further explanation since they were already discussed in detail in the classic eBPF probe section. This set of capabilities should always work since here there are no issues with `kernel.perf_event_paranoid`.

> **Please note**: we will try to do our best to keep this as the minimum required set but due to [some issues with CO-RE relocations](https://lore.kernel.org/bpf/CAGQdkDvYU_e=_NX+6DRkL_-TeH3p+QtsdZwHkmH0w3Fuzw0C4w@mail.gmail.com/T/#u) it is possible that this changes in the future.

## Classic eBPF probe

The classic {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}} is an alternative source to the ones described above, leveraging greater compatibility than the modern BPF one, since it requires older kernel versions.

To install the eBPF probe, please refer to the [installation](/docs/getting-started/installation/#install-driver) page.

To enable the eBPF support in Falco set the `engine.kind` configuration key to `ebpf` and eventually customize `engine.ebpf.probe`  to the path where the eBPF probe resides; the default path is the location used by `falcoctl driver` tool to install the eBPF probe.

### Least privileged mode

The minimal set of capabilities required by Falco to run the classic eBPF probe is the following:

- `CAP_SYS_ADMIN`
- `CAP_SYS_RESOURCE`
- `CAP_SYS_PTRACE`

Let's see them in detail:

- **CAP_SYS_RESOURCE**: Falco needs this capability to be able to call the `setrlimit` syscall. The `setrlimit` syscall is used together with the `RLIMIT_MEMLOCK` flag to change the amount of memory that can be _mlocked_ into RAM. The default value for this memory limit is very low, so even a very simple eBPF program would fail. The workaround is to increase the default value to something acceptable so eBPF maps can be correctly _mlocked_ in memory.
- **CAP_SYS_PTRACE**: Falco needs this capability because it accesses paths like `/proc/<pid>/environ`. From the userspace standpoint, the permission to do so is mapped to the `CAP_SYS_PTRACE` capability. For the curious reader, see [environ_open](https://elixir.bootlin.com/linux/latest/source/fs/proc/base.c#L937) implementation in the kernel.
- **CAP_SYS_ADMIN**: Falco needs this capability to load eBPF programs and maps, and to interact with the system using the `bpf` syscall.

This set of capabilities should work most of the time but under some conditions, it is possible to replace the `CAP_SYS_ADMIN` with two more granular capabilities: `CAP_SYS_BPF` and `CAP_SYS_PERFMON`.

The conditions to satisfy are the following:

1. A kernel version that supports these capabilities. The Linux Kernel version `5.8` is the first one that officially supports them but they could have been backported on older versions on some distributions.

2. An acceptable value of `kernel.perf_event_paranoid` config. Reading the [manual](https://linuxsecurity.expert/kb/sysctl/kernel_perf_event_paranoid/) it says that `perf_event_paranoid` influences only the behavior of unprivileged users, but under the hood, some distributions like Debian or Ubuntu introduce additional `perf_event_paranoid` levels. Consider [`Ubuntu`](https://kernel.ubuntu.com/git/ubuntu-stable/ubuntu-stable-jammy.git/tree/kernel/events/core.c#n11991) as an example:

	```c
	if (perf_paranoid_any() && !capable(CAP_SYS_ADMIN))
		return -EACCES;

	// where perf_paranoid_any is defined as:
	static inline bool perf_paranoid_any(void) {
		return sysctl_perf_event_paranoid > 2;
	}
	```

 	As you can notice, when your `kernel.perf_event_paranoid` is `>2` the capability `CAP_PERFMON` won't suffice, you would still need `CAP_SYS_ADMIN`.
 	So before disabling `CAP_SYS_ADMIN` check your `perf_event_paranoid` value with `sysctl kernel.perf_event_paranoid` and make sure their values are compatible with your distribution enforcement.
