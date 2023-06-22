---
title: Capabilities
description: Capabilities required to run Falco
weight: 20
---

To analyze kernel events we have [3 possible sources](/docs/event-sources/kernel/): kernel module, eBPF probe, modern eBPF probe.

The kernel module can run only in privileged mode while the 2 eBPF probes could also use capabilities to run with fewer privileges.

## eBPF probe

The minimal set of capabilities required by Falco to run the eBPF probe is the following:

- `CAP_SYS_ADMIN`
- `CAP_SYS_RESOURCE`
- `CAP_SYS_PTRACE`

### Explanation

- **CAP_SYS_RESOURCE**: Falco needs this to call the `setrlimit` syscall. This syscall is used together with `RLIMIT_MEMLOCK` flag to change the amount of memory that can be mlocked into RAM. The default memory limit value is very low, so even a very simple eBPF program will fail. The workaround is to increase the default value to something acceptable so that eBPF maps can be correctly mlocked in memory.
- **CAP_SYS_PTRACE**: Falco needs this capability because it accesses fields like environ in the proc file system. From the userspace standpoint, the permission to do so is mapped to the `CAP_SYS_PTRACE` capability. For the curious reader, see [environ_open](https://elixir.bootlin.com/linux/latest/source/fs/proc/base.c#L937) implementation in the kernel.
- **CAP_SYS_ADMIN**: Falco needs this capability to load eBPF programs, maps and interact with the system using the `bpf` syscall.

This set of capabilities should always work but under some conditions is possible to replace the `CAP_SYS_ADMIN` with 2 less intrusive capabilities: `CAP_SYS_BPF` and `CAP_SYS_PERFMON`.

The conditions to satisfy are the following:

1. A kernel version that supports these capabilities. `5.8` is the first kernel version that officially supports them but as always they could be also backported on older versions.

2. An acceptable value of `kernel.perf_event_paranoid` config. Reading the [manual](https://linuxsecurity.expert/kb/sysctl/kernel_perf_event_paranoid/) it seems that `perf_event_paranoid` influences only the behavior of unprivileged users, but under the hood, some distros like Debian and Ubuntu introduce other `perf_event_paranoid` levels. Consider [`Ubuntu`](https://kernel.ubuntu.com/git/ubuntu-stable/ubuntu-stable-jammy.git/tree/kernel/events/core.c#n11991) as an example:

	```c
	if (perf_paranoid_any() && !capable(CAP_SYS_ADMIN))
	return -EACCES;

	// where perf_paranoid_any is:
	static inline bool perf_paranoid_any(void) {
	return sysctl_perf_event_paranoid > 2;
	}
	```

 	As you can easily notice if your `kernel.perf_event_paranoid` is `>2` `CAP_PERFMON` will be not enough, you will need `CAP_SYS_ADMIN`!
 	So before disabling `CAP_SYS_ADMIN` check your `perf_event_paranoid` value with `sysctl kernel.perf_event_paranoid` and ensure this is compatible with your distro enforcement.

## Modern eBPF probe

The minimal set of capabilities required by Falco to run the modern eBPF probe is the following:

- `CAP_SYS_BPF`
- `CAP_SYS_PERFMON`
- `CAP_SYS_RESOURCE`
- `CAP_SYS_PTRACE`

### Explanation

No particular explanation is needed the capabilities are the same explained in the previous section. Here there are no issues with `kernel.perf_event_paranoid` so this set of capabilities should always work.

> **Please note**: we will try to do our best to keep this as the minimum required set but due to [some issues with CO-RE relocations](https://lore.kernel.org/bpf/CAGQdkDvYU_e=_NX+6DRkL_-TeH3p+QtsdZwHkmH0w3Fuzw0C4w@mail.gmail.com/T/#u) is possible that in the future this could change
