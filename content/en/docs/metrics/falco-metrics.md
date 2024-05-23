---
title: Falco Metrics 
description: Leverage continuous production metrics for valuable insights
linktitle: Falco Metrics
weight: 10
---

{{% pageinfo color=info %}}
Several metric output field names will be changed for Falco 0.38.0 (anticipated end of May 2024).

To ensure long-term consistency and validity, we have renamed the following metric output fields. The unit suffix depends on whether you use `convert_memory_to_mb: true` or not:

- `falco.hostname` -> `evt.hostname` to be consistent with the newer `evt.hostname` filter field
- `cpu_usage_perc_total_host` -> `host_cpu_usage_perc`
- `memory_used_host` -> `host_memory_used_kb` (or `host_memory_used_mb`)
- `procs_running_hos`t -> `host_procs_running`
- `open_fds_host` -> `host_open_fds`
- `memory_rss` -> `memory_rss_kb` (or `memory_rss_mb`)
- `memory_pss` -> `memory_pss_kb` (or `memory_pss_mb`)
- `memory_vsz` -> `memory_vsz_kb` (or `memory_vsz_mb`)
- `container_memory_used` -> `container_memory_used_bytes` (or `container_memory_used_mb`)
{{% /pageinfo %}}

To explore this functionality, refer to the [falco.yaml][1] config file and read the advanced Falco logging, alerting, and metrics sections, specifically focusing on software functioning (e.g. `metrics`). We do not duplicate the explanations of the metrics config here; instead, we only list the possible field values.

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

## Prometheus Support

Since version 0.38.0, you can also use Falco's web server to expose Falco's metrics. A new `/metrics` endpoint has been added which provides metrics information that can be collected by [Prometheus][2].

In order to activate this endpoint, three configuration elements must be set in the [falco.yaml][1]:

- Metrics must be enabled, along with the specific metrics sub-categories you wish to consume (see above).

```yaml
metrics:
  enabled: true
  ...
```

- The web server must be enabled
- The Prometheus metrics endpoint must be enabled

```yaml
webserver:
  enabled: true
  prometheus_metrics_enabled: true
```

This endpoint will allow observation of the internal state of Falco providing the same data as configured for the metrics outputs. It will be served on the same port as the health endpoint.

{{% pageinfo color=info %}}
Following the Prometheus recommendations, there might be some slight differences with regard to the other outputs. Typically calculated fields will not be returned as Prometheus provides the facilities to compute them as part of their queries.

The Prometheus text format documentation can be found [here][3].

The OpenMetrics specification can be found [here][4].
{{% /pageinfo %}}

[1]: https://github.com/falcosecurity/falco/blob/master/falco.yaml
[2]: https://prometheus.io
[3]: https://prometheus.io/docs/instrumenting/exposition_formats/
[4]: https://github.com/OpenObservability/OpenMetrics/blob/main/specification/OpenMetrics.md
