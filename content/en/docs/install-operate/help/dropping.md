---
title: Help, Falco Is Dropping Syscalls Events!
description: Follow this guide to determine if there is a possibility of addressing the issue on busy servers where Falco may be dropping events or if the server load is simply too high to resolve the issue
weight: 20
---

## Action Items (TL;DR)

- Adjust the [buf_size_preset](https://github.com/falcosecurity/falco/blob/master/falco.yaml) in the falco.yaml config.
- Utilize [base_syscalls](https://github.com/falcosecurity/falco/blob/master/falco.yaml) to limit the syscalls under monitoring.
- Audit and optimize Falco rules to prevent unnecessary backpressure on the kernel, considering that Falco's main event stream is single-threaded.
- Try running Falco without any plugins.

## Background

Falco monitors each syscall based on deployed Falco rules. Additionally, Falco requires a few more syscalls to function properly, see [Adaptive Syscalls Selection](https://falco.org/blog/adaptive-syscalls-selection/):

- The default configuration is conservative; consequently, there is an opportunity that you could optimize and even eliminate Falco dropping events, depending on the scope of monitoring you are seeking.
- Utilize the [base_syscalls](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config for precise override control alongside a resource-friendly suggestion of the absolute minimum additional syscalls needed to ensure proper functioning of Falco (set `repair: true`).

Falco monitors syscalls by hooking into kernel tracepoints. To transfer events from the kernel to userspace, it uses buffers. For each CPU, Falco allocates separate buffers. If you're using the `modern_ebpf` driver, you can choose to have fewer, larger buffers shared among multiple CPUs  (contention, according to kernel experts, should not be a problem). The buffer size is fixed but can be adjusted in the `buf_size_preset` config. Increasing the size helps, but keep in mind that the benefits may not increase proportionally. Also, remember that a larger buffer means more preallocated memory.

- [buf_size_preset](https://github.com/falcosecurity/falco/blob/master/falco.yaml) of `5` or `6` could be a valid option for large machines assuming you use the kmod or ebpf drivers.
- For the `modern_ebpf` driver try a `modern_ebpf.buf_size_preset` of `6` or `7`, along with a `modern_ebpf.cpus_for_each_buffer` of `4` or `6`. Feel free to experiment and adjust these values as needed.

Lastly, while it may sound appealing to push all filtering into the kernel, it is not that straightforward. In the kernel, you are in the application context, and yes, you can slow down both the kernel and the application (for example, apps may then experience lower request rates). Checkout the [Driver Kernel Testing Framework](https://github.com/falcosecurity/libs/blob/master/proposals/20230530-driver-kernel-testing-framework.md) for more information. Additionally, in the kernel, you only have raw syscall arguments and can't easily correlate them with other events. All this being said, we are actively looking into ways to improve this and make the kernel logic smarter without sacrificing performance.

## Kernel-side Syscalls Drops Metrics

Falco's [metrics](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config ([Falco Internal Metrics System](../../production-performance/#falco-internal-metrics-system)) enables you to measure Falco's kernel-side syscall drops and provides a range of useful metrics related to software functioning. Key settings include:

- `kernel_event_counters_enabled: true`
- `libbpf_stats_enabled: true` (for `ebpf` or `modern_ebpf` drivers, enable `/proc/sys/kernel/bpf_stats_enabled`)

Here is an example metrics log snippet highlighting the fields crucial for this analysis. Pay close attention to `falco.evts_rate_sec` and `scap.evts_rate_sec`, as well as the monotonic drop counters categorizing syscalls into coarse-grained (non-comprehensive) categories. For more details, refer to the dedicated metrics section in the [Falco Performance in Production](../../production-performance/) guide for a more detailed explanation.

```yaml
{
  "output_fields": {
    "evt.source": "syscall",
    "falco.host_num_cpus": 96, # Divide *rate_sec by CPUs
    "falco.evts_rate_sec": 93345.1, # Taken between 2 metrics snapshots
    "falco.num_evts": 44381403800,
    "falco.num_evts_prev": 44045361392,
    # scap kernel-side counters
    "scap.evts_drop_rate_sec": 0.0, # Taken between 2 metrics snapshots
    "scap.evts_rate_sec": 93546.8, # Taken between 2 metrics snapshots
    "scap.n_drops": 0, # Monotonic counter all-time kernel side drops
    # Coarse-grained (non-comprehensive) categories for more granular insights
    "scap.n_drops_buffer_clone_fork_enter": 0,
    "scap.n_drops_buffer_clone_fork_exit": 0,
    "scap.n_drops_buffer_close_exit": 0,
    "scap.n_drops_buffer_connect_enter": 0,
    "scap.n_drops_buffer_connect_exit": 0,
    "scap.n_drops_buffer_dir_file_enter": 0,
    "scap.n_drops_buffer_dir_file_exit": 0,
    "scap.n_drops_buffer_execve_enter": 0,
    "scap.n_drops_buffer_execve_exit": 0,
    "scap.n_drops_buffer_open_enter": 0,
    "scap.n_drops_buffer_open_exit": 0,
    "scap.n_drops_buffer_other_interest_enter": 0,
    "scap.n_drops_buffer_other_interest_exit": 0,
    "scap.n_drops_buffer_proc_exit": 0,
    "scap.n_drops_buffer_total": 0,
    "scap.n_drops_bug": 0,
    "scap.n_drops_page_faults": 0,
    "scap.n_drops_perc": 0.0, # Taken between 2 metrics snapshots
    "scap.n_drops_prev": 0,
    "scap.n_drops_scratch_map": 0,
    "scap.n_evts": 48528636923,
    "scap.n_evts_prev": 48191868502,
    # libbpf stats -> all-time kernel tracepoints invocations stats for a x86_64 machine
    "scap.sched_process_e.avg_time_ns": 2041, # scheduler process exit tracepoint
    "scap.sched_process_e.run_cnt": 151463770,
    "scap.sched_process_e.run_time_ns": 181866667867268,
    "scap.sys_enter.avg_time_ns": 194, # syscall enter (raw) tracepoint
    "scap.sys_enter.run_cnt": 933995602769,
    "scap.sys_enter.run_time_ns": 181866667867268,
    "scap.sys_exit.avg_time_ns": 205, # syscall exit (raw) tracepoint
    "scap.sys_exit.run_cnt": 934000454069,
    "scap.sys_exit.run_time_ns": 192201218598457
  },
  "rule": "Falco internal: metrics snapshot"
}
```

## Precise Control Over Monitored Syscalls

Since Falco 0.35.0, you have precise control over the syscalls Falco monitors. Refer to the [Adaptive Syscalls Selection](https://falco.org/blog/adaptive-syscalls-selection/) blog post and carefully read the [base_syscalls](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config description for detailed information.

### Run Tests for Data-Driven Insights

{{% pageinfo color=info %}}
Falco's current metrics system lacks direct syscalls counters to pinpoint high-volume culprits. In the meantime, deriving insights step by step is necessary until syscall counters become available in Falco's metrics system.
{{% /pageinfo %}}

Generate a dummy rule designed not to trigger any alerts:

```yaml
- macro: spawned_process
  condition: (evt.type in (execve, execveat) and evt.dir=<)

- rule: TEST Simple Spawned Process
  desc: "Test base_syscalls config option"
  enabled: true
  condition: spawned_process and proc.name=iShouldNeverAlert
  output: "%evt.type"
  priority: WARNING
```

Now, run Falco with the dummy rule and the specified test cases (edit [base_syscalls](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config). If you're open to it, consider sharing anonymized logs for further assessment by Falco maintainers or the community to explore potential solutions.

For each test, run Falco in dry-run debug mode initially to print the final set of syscalls.

```bash
sudo /usr/bin/falco -c /etc/falco/falco.yaml -r falco_rules_dummy.yaml -o "log_level=debug" -o "log_stderr=true" --dry-run

# Example Output for Test 2
XXX: (2) syscalls in rules: execve, execveat
XXX: +(16) syscalls (Falco's state engine set of syscalls): capset, chdir, chroot, clone, clone3, fchdir, fork, prctl, procexit, setgid, setpgid, setresgid, setresuid, setsid, setuid, vfork
XXX: (18) syscalls selected in total (final set): capset, chdir, chroot, clone, clone3, execve, execveat, fchdir, fork, prctl, procexit, setgid, setpgid, setresgid, setresuid, setsid, setuid, vfork
```

Subsequently, run Falco normally.

```bash
sudo /usr/bin/falco -c /etc/falco/falco.yaml -r falco_rules_dummy.yaml
```

Test 1: spawned_process only

```yaml
base_syscalls:
  custom_set: [clone, clone3, fork, vfork, execve, execveat, procexit]
  repair: false
```

{{% pageinfo color=info %}}
If Test 1 already fails, and you see drops even after adjusting the `buf_size_preset` and other parameters, Falco may be less usable on this particular system, unfortunately.
{{% /pageinfo %}}

Test 2: spawned_process + minimum syscalls needed for Falco state (internal process cache table)

```yaml
base_syscalls:
  custom_set: []
  repair: true
```

Test 3: network accept*

```yaml
base_syscalls:
  custom_set: [clone, clone3, fork, vfork, execve, execveat, getsockopt, socket, bind, accept, accept4, close]
  repair: false
```

Test 4: network connect

```yaml
base_syscalls:
  custom_set: [clone, clone3, fork, vfork, execve, execveat, getsockopt, socket, connect, close]
  repair: false
```

Test 5: open* syscalls

```yaml
base_syscalls:
  custom_set: [clone, clone3, fork, vfork, execve, execveat, open, openat, openat2, close]
  repair: false
```

Test n

Continue custom testing to ensure effective monitoring of all desired syscalls on your servers without experiencing event drops or with minimal acceptable drops.

### At What Kernel Event Rates Do Problems Generally Start?

This question presents a challenge as it's not solely about the pure "kernel event rate". In less realistic benchmarking tests, you could artificially drive the rates very high without dropping events. Therefore, we believe it is more complex in real-life production, involving not just event rates but also the actual nature of the events, and possibly bursts of events in very short periods of time.

Additionally, we believe it's best to normalize the event rates by the number of CPUs (e.g. `scap.evts_rate_sec` / `falco.host_num_cpus`). Busier servers with 96, 128, or more CPUs naturally have higher event rates than VMs with 12 CPUs, for instance.

Nevertheless, here are some numbers we have heard from various adopters. Please take them with a grain of salt:
- Less than ~1K kernel events per second per one CPU usually is not a problem, but it depends.
- Less than ~1.5K kernel events per second per one CPU should not be a problem, but it depends.
- More than 3K kernel events per second per one CPU likely could be more difficult to keep up, but it depends.
- Consider 1-2% of all events dropped on a smaller subset of servers in your fleet (your busy servers/clusters) as acceptable.
- More than 164K kernel events per second per CPU have been observed on a 128-CPU machine. Currently under exploration is how to solve this.

### References and Community Discussions
- [Introduce conditional kernel-side event filtering](https://github.com/falcosecurity/libs/issues/1557)
- [New base_syscalls.exclude_enter_exit_set config](https://github.com/falcosecurity/falco/issues/2960)
- [Improve falco benchmarking, performance, and regression tooling to better track system resources impact](https://github.com/falcosecurity/falco/issues/2296)
- [[UMBRELLA] Dropped events](https://github.com/falcosecurity/falco/issues/1403)
- [Adaptive Syscalls Selection](https://falco.org/blog/adaptive-syscalls-selection/)