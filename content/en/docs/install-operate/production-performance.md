---
title: Falco Performance in Production 
description: Adopt best practices when checking Falco performance in production
linktitle: Falco Performance in Production
weight: 45
---

First and foremost, if something goes seriously wrong during Falco deployment, it's usually noticeable immediately. On a longer time scale, continuous performance monitoring and quality assurance, driven by the right metrics, ensure Falco functions as expected 24/7.

As a security tool, Falco requires checking for a healthy deployment on multiple dimensions:

- Resource utilization and system impact: Strive to minimize compute overhead while ensuring the desired monitoring scope is achieved.
- Disruption/upgrades: Ensure minimal downtime and avoid interruptions to the service, minimizing restarts.
- Data quality assurance: Verify that Falco outputs contain the desired quality with little to no missing data.
- End-to-end data pipeline testing: Ensure alerts reach their end destination as quickly as possible.
- Security monitoring capabilities: Adopting the right Falco rules and resilience to bypasses by attackers.

The Falco Project provides guidance on some of these aspects, and there are ongoing long-term efforts, including a [partnership](https://github.com/falcosecurity/cncf-green-review-testing/tree/main) with the CNCF TAG Environmental Sustainability, aimed at enhancing Falco's performance and assessing its impact on the system. These efforts are intended to make it easier for adopters to assess the actual impact on their systems, enabling them to make informed decisions about the cost-security monitoring tradeoffs.

## Resource Utilization and System Impact

The Falco Project provides native support for measuring resource utilization and statistics, including event drop counters, kernel tracepoint invocation counters, timeouts, and internal state handling. More detailed information is given [below](#falco-internal-metrics-system).

### CPU and Memory Utilization

On top of the mind for SREs or system admins is how much CPU and memory Falco will utilize on their hosts. They need to assess whether the cost is justified. To maintain excellent relationships with infrastructure teams, setting resource limits for your Falco deployment is crucial. This can be done through systemd or [daemonset](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) limits in a Kubernetes environment. 

This is an essential consideration because running a kernel tool always comes with specific challenges and considerations. For example, it could slow down the kernel or the request rates of applications.

Top metrics:

- CPU usage: Typically measured as a percentage of one CPU, it can be compared with the number of available CPUs on the host. Falco's hot path is single-threaded, so it should not be able to exceed the capacity of one full CPU. 
- Memory RSS: Resident Set Size is the portion of memory held in RAM by a process.
- Memory VSZ: Virtual Memory Size is the total memory allocated to a process, including both RAM and swap space.
- [container_memory_working_set_bytes](https://mohamedmsaeed.medium.com/memory-working-set-vs-memory-rss-in-kubernetes-which-one-you-should-monitor-8ef77bf0acee) in Kubernetes settings: This is almost equivalent to the cgroups container `memory_used` metric natively exposed in Falco metrics.

Beyond monitoring the tool's utilization, check if your applications perform as before. This evaluation could include overall network, I/O, or general contention metrics.

Read [Falco Internal Metrics System](#falco-internal-metrics-system) next.

### Server Load and Falco Event Drops

A common misconception is to think that Falco has constant resource utilization. However, that is not accurate. Falco's utilization is directly dependent on the current workload on the host. The more system calls the applications make, the more work Falco has to handle. You can read our [Kernel Testing Framework Proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20230530-driver-kernel-testing-framework.md#why-does-kernel-testing-matter) for more insights into this topic.

Read [Help, Falco Is Dropping Syscalls Events!](../help/dropping/) next.

Top metrics:

- Kernel side and userspace event counts.
- Kernel side and userspace event drop counts.
- Kernel tracepoint invocation counts to deduce the overall server load.
- Userspace timeouts.
- Falco internal state counters.

## Falco Internal Metrics System

To explore this functionality, refer to the [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config file and read the advanced Falco logging, alerting, and metrics sections, specifically focusing on software functioning (e.g. `metrics`). We do not duplicate the explanations of the metrics config here; instead, we only list the possible field values.

{{% pageinfo color=info %}}
Direct syscalls counters to pinpoint high-volume culprits are planned for Falco, as well as a Prometheus exporter. Stay tuned!
{{% /pageinfo %}}

```yaml
metrics:
  enabled: true
  interval: 15m
  output_rule: true
  resource_utilization_enabled: true
  state_counters_enabled: true
  kernel_event_counters_enabled: true
  libbpf_stats_enabled: true
  convert_memory_to_mb: true
  include_empty_values: true
```

Here is a brief glossary of the currently supported metrics:

<details>
  <summary> Show Base Fields
  
  `enabled: true`
  </summary>

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.source": "syscall",
    "evt.time": 1706043847488647460,
    "falco.duration_sec": 19,
    "falco.evts_rate_sec": 8326.2, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1705377771000000000,
    "falco.host_num_cpus": 20,
    "falco.hostname": "test",
    "falco.kernel_release": "6.6.7-200.fc39.x86_64",
    "falco.num_evts": 137676,
    "falco.num_evts_prev": 129349,
    "falco.outputs_queue_num_drops": 0,
    "falco.start_ts": 1706043828486423408,
    "falco.version": "0.37.0",
    "scap.engine_name": "bpf"
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-01-23T21:04:07.488647460Z"
}
```
  
</details>

<details>
  <summary> Show Base Fields + Resource Utilization Fields
  
  `resource_utilization_enabled: true`
  </summary>

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.source": "syscall",
    "evt.time": 1706043953457954271,
    "falco.container_memory_used": 0, # Memory usage of the Falco process, only relevant for Kubernetes daemonset deployments, similar to container_memory_working_set_bytes
    "falco.cpu_usage_perc": 3.2, # CPU usage (percentage of one CPU) of the Falco process, equivalent to `ps` output
    "falco.cpu_usage_perc_total_host": 3.0, # Overall CPU usage of the underlying host
    "falco.duration_sec": 32,
    "falco.evts_rate_sec": 7146.3, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1705377771000000000,
    "falco.host_num_cpus": 20,
    "falco.hostname": "test",
    "falco.kernel_release": "6.6.7-200.fc39.x86_64",
    "falco.memory_pss": 57, # Memory usage of the Falco process
    "falco.memory_rss": 60, # Memory usage of the Falco process
    "falco.memory_used_host": 17264, # Overall memory usage of the underlying host
    "falco.memory_vsz": 1127, # Memory usage of the Falco process
    "falco.num_evts": 223960,
    "falco.num_evts_prev": 216814,
    "falco.open_fds_host": 21640, # Overall currently open fds of the underlying host
    "falco.outputs_queue_num_drops": 0,
    "falco.procs_running_host": 2, # `procs_running` value obtained from ${HOST_ROOT}/proc/stat of the underlying host, showing a lower number than currently alive procs
    "falco.start_ts": 1706043921455239905,
    "falco.version": "0.37.0",
    "scap.engine_name": "bpf"
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-01-23T21:05:53.457954271Z"
}
```
  
</details>

<details>
  <summary> Show Base Fields + Internal State Handling Fields
  
  `state_counters_enabled: true`
  </summary>

Most counters are monotonic/all-time counts, with some exceptions indicated below where the current snapshot is measured.

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.source": "syscall",
    "evt.time": 1706055905641977144,
    "falco.duration_sec": 26,
    "falco.evts_rate_sec": 8595.5, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1705377771000000000,
    "falco.host_num_cpus": 20,
    "falco.hostname": "test",
    "falco.kernel_release": "6.6.7-200.fc39.x86_64",
    # Internally, Falco is granular and talks about `threads`, not processes
    "falco.n_added_fds": 13377,
    "falco.n_added_threads": 1921,
    "falco.n_cached_fd_lookups": 174721,
    "falco.n_cached_thread_lookups": 176428,
    "falco.n_containers": 0, # Number of containers stored by Falco at a given time (current snapshot, not monotonic)
    "falco.n_drops_full_threadtable": 0, # Drops due to a full process cache table, internally called threadtable
    "falco.n_failed_fd_lookups": 13374,
    "falco.n_failed_thread_lookups": 4413,
    "falco.n_fds": 131522, # Number of fds stored in threadtable (current snapshot, not monotonic)
    "falco.n_missing_container_images": 0, # Number of containers stored by Falco without a container image at a given time (current snapshot, not monotonic)
    "falco.n_noncached_fd_lookups": 33356,
    "falco.n_noncached_thread_lookups": 74493,
    "falco.n_removed_fds": 5940,
    "falco.n_removed_threads": 123,
    "falco.n_retrieve_evts_drops": 1258,
    "falco.n_retrieved_evts": 15112,
    "falco.n_store_evts_drops": 0,
    "falco.n_stored_evts": 17340,
    "falco.n_threads": 1798, # Number of threads stored in threadtable (current snapshot, not monotonic)
    "falco.num_evts": 221862,
    "falco.num_evts_prev": 213266,
    "falco.outputs_queue_num_drops": 0,
    "falco.start_ts": 1706055879639303895,
    "falco.version": "0.37.0",
    "scap.engine_name": "bpf"
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-01-24T00:25:05.641977144Z"
}
```
  
</details>

<details>
  <summary> Show Base Fields + Kernel-Side Event Drop + Event Counters Fields
  
  `kernel_event_counters_enabled: true`
  </summary>

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.source": "syscall",
    "evt.time": 1706044368930973591,
    "falco.duration_sec": 34,
    "falco.evts_rate_sec": 7157.8, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1705377771000000000,
    "falco.host_num_cpus": 20,
    "falco.hostname": "test",
    "falco.kernel_release": "6.6.7-200.fc39.x86_64",
    "falco.num_evts": 244419,
    "falco.num_evts_prev": 237261,
    "falco.outputs_queue_num_drops": 0,
    "falco.start_ts": 1706044334928318624,
    "falco.version": "0.37.0",
    # scap -> capture / kernel-side counters
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0, # Taken between 2 metrics snapshots
    "scap.evts_rate_sec": 7061.8, # Taken between 2 metrics snapshots
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
    "scap.n_drops_perc": 0.0, # Taken between 2 metrics snapshots (percentage drops)
    "scap.n_drops_prev": 0,
    "scap.n_drops_scratch_map": 0,
    "scap.n_evts": 252887,
    "scap.n_evts_prev": 245825
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-01-23T21:12:48.930973591Z"
}
```

</details>

<details>
  <summary> Show Base Fields + libbpf Kernel Tracepoints Invocation Stats

  `libbpf_stats_enabled: true`
  </summary>

Applies only for `ebpf` and `modern_ebpf`, requires `sysctl kernel.bpf_stats_enabled=1` kernel setting as precondition. Compare to `bpftool prog show` capabilities.

Here is a snippet with respect to the kernel tracepoints for an `x86_64` machine:

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.source": "syscall",
    "evt.time": 1706044504680365101,
    "falco.duration_sec": 38,
    "falco.evts_rate_sec": 7412.0,
    "falco.host_boot_ts": 1705377771000000000,
    "falco.host_num_cpus": 20,
    "falco.hostname": "test",
    "falco.kernel_release": "6.6.7-200.fc39.x86_64",
    "falco.num_evts": 374721,
    "falco.num_evts_prev": 367309,
    "falco.outputs_queue_num_drops": 0,
    "falco.start_ts": 1706044466678892863,
    "falco.version": "0.37.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0,
    # libbpf stats -> all-time kernel tracepoints invocations stats for an `x86_64` machine
    # Note: no equivalent stats for kmod driver available
    "scap.page_fault_kern.avg_time_ns": 0, # Disabled by default
    "scap.page_fault_kern.run_cnt": 0,
    "scap.page_fault_kern.run_time_ns": 0,
    "scap.page_fault_user.avg_time_ns": 0, # Disabled by default
    "scap.page_fault_user.run_cnt": 0,
    "scap.page_fault_user.run_time_ns": 0,
    "scap.sched_process_e.avg_time_ns": 4281, # scheduler process exit tracepoint, used to purge procs from process cache
    "scap.sched_process_e.run_cnt": 343,
    "scap.sched_process_e.run_time_ns": 1468454,
    "scap.sched_switch.avg_time_ns": 0, # Disabled by default
    "scap.sched_switch.run_cnt": 0,
    "scap.sched_switch.run_time_ns": 0,
    "scap.signal_deliver.avg_time_ns": 0, # Disabled by default
    "scap.signal_deliver.run_cnt": 0,
    "scap.signal_deliver.run_time_ns": 0,
    "scap.sys_enter.avg_time_ns": 492, # syscall enter (raw) tracepoint
    "scap.sys_enter.run_cnt": 967880,
    "scap.sys_enter.run_time_ns": 476207280,
    "scap.sys_exit.avg_time_ns": 534, # syscall exit (raw) tracepoint
    "scap.sys_exit.run_cnt": 967860,
    "scap.sys_exit.run_time_ns": 517146471
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-01-23T21:15:04.680365101Z"
}
```

Here is a snippet with respect to the kernel tracepoints for an `aarch64` machine:

```yaml
{
  "hostname": "lima-falco-fedora",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.source": "syscall",
    "falco.host_num_cpus": 8,
    "falco.hostname": "lima-falco-fedora",
    "falco.kernel_release": "6.5.6-300.fc39.aarch64",
    # libbpf stats -> all-time kernel tracepoints invocations stats for an `aarch64` machine
    # Note: no equivalent stats for kmod driver available
    "scap.sched_p_exec.avg_time_ns": 12948, # to address certain architecture differences or limitations, need to tap into the scheduler instead of the raw tracepoint concerning the clone/fork/execve* syscalls
    "scap.sched_p_exec.run_cnt": 17,
    "scap.sched_p_exec.run_time_ns": 220124,
    "scap.sched_p_fork.avg_time_ns": 18931, # to address certain architecture differences or limitations, need to tap into the scheduler instead of the raw tracepoint concerning the clone/fork/execve* syscalls
    "scap.sched_p_fork.run_cnt": 17,
    "scap.sched_p_fork.run_time_ns": 321833,
    "scap.sched_proc_exit.avg_time_ns": 2595, # scheduler process exit tracepoint, used to purge procs from process cache
    "scap.sched_proc_exit.run_cnt": 17,
    "scap.sched_proc_exit.run_time_ns": 44124,
    "scap.sys_enter.avg_time_ns": 54, # syscall enter (raw) tracepoint
    "scap.sys_enter.run_cnt": 54209,
    "scap.sys_enter.run_time_ns": 2963165,
    "scap.sys_exit.avg_time_ns": 103, # syscall exit (raw) tracepoint
    "scap.sys_exit.run_cnt": 54192,
    "scap.sys_exit.run_time_ns": 5619856
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-01-23T18:48:42.834888156Z"
}
```
</details>

<details>
  <summary> Show All Fields
  </summary>

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.source": "syscall",
    "evt.time": 1706056354914990455,
    "falco.container_memory_used": 0,
    "falco.cpu_usage_perc": 3.0,
    "falco.cpu_usage_perc_total_host": 3.3,
    "falco.duration_sec": 415,
    "falco.evts_rate_sec": 17926.1,
    "falco.host_boot_ts": 1705377771000000000,
    "falco.host_num_cpus": 20,
    "falco.hostname": "test",
    "falco.kernel_release": "6.6.7-200.fc39.x86_64",
    "falco.memory_pss": 169,
    "falco.memory_rss": 170,
    "falco.memory_used_host": 14259,
    "falco.memory_vsz": 1127,
    "falco.n_added_fds": 99134,
    "falco.n_added_threads": 3405,
    "falco.n_cached_fd_lookups": 3960903,
    "falco.n_cached_thread_lookups": 4017248,
    "falco.n_containers": 0,
    "falco.n_drops_full_threadtable": 0,
    "falco.n_failed_fd_lookups": 389051,
    "falco.n_failed_thread_lookups": 6243,
    "falco.n_fds": 133014,
    "falco.n_missing_container_images": 0,
    "falco.n_noncached_fd_lookups": 712176,
    "falco.n_noncached_thread_lookups": 1338273,
    "falco.n_removed_fds": 91240,
    "falco.n_removed_threads": 1589,
    "falco.n_retrieve_evts_drops": 155908,
    "falco.n_retrieved_evts": 342296,
    "falco.n_store_evts_drops": 0,
    "falco.n_stored_evts": 398285,
    "falco.n_threads": 1812,
    "falco.num_evts": 5043045,
    "falco.num_evts_prev": 5025657,
    "falco.open_fds_host": 21040,
    "falco.outputs_queue_num_drops": 0,
    "falco.procs_running_host": 1,
    "falco.start_ts": 1706055939912506103,
    "falco.version": "0.37.0",
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0,
    "scap.evts_rate_sec": 17629.2,
    "scap.n_drops": 0,
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
    "scap.n_drops_perc": 0.0,
    "scap.n_drops_prev": 0,
    "scap.n_drops_scratch_map": 0,
    "scap.n_evts": 5174139,
    "scap.n_evts_prev": 5157039,
    "scap.page_fault_kern.avg_time_ns": 0,
    "scap.page_fault_kern.run_cnt": 0,
    "scap.page_fault_kern.run_time_ns": 0,
    "scap.page_fault_user.avg_time_ns": 0,
    "scap.page_fault_user.run_cnt": 0,
    "scap.page_fault_user.run_time_ns": 0,
    "scap.sched_process_e.avg_time_ns": 4517,
    "scap.sched_process_e.run_cnt": 1640,
    "scap.sched_process_e.run_time_ns": 7408617,
    "scap.sched_switch.avg_time_ns": 0,
    "scap.sched_switch.run_cnt": 0,
    "scap.sched_switch.run_time_ns": 0,
    "scap.signal_deliver.avg_time_ns": 0,
    "scap.signal_deliver.run_cnt": 0,
    "scap.signal_deliver.run_time_ns": 0,
    "scap.sys_enter.avg_time_ns": 542,
    "scap.sys_enter.run_cnt": 12630785,
    "scap.sys_enter.run_time_ns": 6854340428,
    "scap.sys_exit.avg_time_ns": 604,
    "scap.sys_exit.run_cnt": 12631003,
    "scap.sys_exit.run_time_ns": 7631523695
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-01-24T00:32:34.914990455Z"
}
```
  
</details>
