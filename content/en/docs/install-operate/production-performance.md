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

Here is a brief glossary of the currently supported metrics. The snippet was retrieved from a more or less idle test `x86_64` Linux machine. Therefore, counters and event rates are very low, and note that `aarch64` will have slightly different kernel tracepoints.

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.source": "syscall",
    "evt.time": 1705904606607267464,
    # falco.* prefix refers to any userspace metrics; it doesn't always mean it has something to do with Falco.
    "falco.container_memory_used": 0, # Only relevant for Kubernetes daemonset deployments, similar to container_memory_working_set_bytes
    "falco.cpu_usage_perc": 1.9, # CPU usage (percentage of one CPU) of the Falco process
    "falco.cpu_usage_perc_total_host": 3.0, # Overall CPU usage of the underlying host
    "falco.duration_sec": 574,
    "falco.evts_rate_sec": 7619.1, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1705377771000000000,
    "falco.host_num_cpus": 20,
    "falco.hostname": "test",
    "falco.kernel_release": "6.6.7-200.fc39.x86_64",
    "falco.memory_pss": 145, # Memory usage of the Falco process
    "falco.memory_rss": 147, # Memory usage of the Falco process
    "falco.memory_used_host": 13686, # Overall memory usage of the underlying host
    "falco.memory_vsz": 1123, # Memory usage of the Falco process
    "falco.n_added_fds": 116413,
    # Internally, Falco is granular and talks about `threads`, not processes.
    "falco.n_added_threads": 3476,
    "falco.n_cached_fd_lookups": 3210037,
    "falco.n_cached_thread_lookups": 3143917,
    "falco.n_containers": 0, # Number of containers stored by Falco at a given time (current snapshot, not monotonic)
    "falco.n_drops_full_threadtable": 0,
    "falco.n_failed_fd_lookups": 221641,
    "falco.n_failed_thread_lookups": 7006,
    "falco.n_missing_container_images": 0, # Number of containers stored by Falco without a container image at a given time (current snapshot, not monotonic)
    "falco.n_noncached_fd_lookups": 582631,
    "falco.n_noncached_thread_lookups": 1112885,
    "falco.n_removed_fds": 111744,
    "falco.n_removed_threads": 2030,
    "falco.n_retrieve_evts_drops": 24511,
    "falco.n_retrieved_evts": 295843,
    "falco.n_store_evts_drops": 0,
    "falco.n_stored_evts": 334931,
    "falco.num_evts": 4055038,
    "falco.num_evts_prev": 4047419,
    "falco.open_fds_host": 19240, # Overall currently open fds of the underlying host
    "falco.outputs_queue_num_drops": 0,
    "falco.procs_running_host": X, # `procs_running` value obtained from /host/proc/stat of the underlying host, showing a lower number than currently alive procs.
    "falco.start_ts": 1705904032605099533,
    "falco.version": "XXX",
    # scap kernel-side counters
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0, # Taken between 2 metrics snapshots
    "scap.evts_rate_sec": 7689.1, # Taken between 2 metrics snapshots
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
    "scap.n_evts": 4101942,
    "scap.n_evts_prev": 4094253,
    # libbpf stats -> all-time kernel tracepoints invocations stats for a x86_64 machine
    # Note: no equivalent stats for kmod driver available
    "scap.page_fault_kern.avg_time_ns": 0, # Disabled by default
    "scap.page_fault_kern.run_cnt": 0,
    "scap.page_fault_kern.run_time_ns": 0,
    "scap.page_fault_user.avg_time_ns": 0, # Disabled by default
    "scap.page_fault_user.run_cnt": 0,
    "scap.page_fault_user.run_time_ns": 0,
    "scap.sched_process_e.avg_time_ns": 5095, # scheduler process exit tracepoint, used to purge procs from process cache
    "scap.sched_process_e.run_cnt": 2061,
    "scap.sched_process_e.run_time_ns": 10502349,
    "scap.sched_switch.avg_time_ns": 0, # Disabled by default
    "scap.sched_switch.run_cnt": 0,
    "scap.sched_switch.run_time_ns": 0,
    "scap.signal_deliver.avg_time_ns": 0, # Disabled by default
    "scap.signal_deliver.run_cnt": 0,
    "scap.signal_deliver.run_time_ns": 0,
    "scap.sys_enter.avg_time_ns": 783, # syscall enter (raw) tracepoint
    "scap.sys_enter.run_cnt": 8874333,
    "scap.sys_enter.run_time_ns": 6951614412,
    "scap.sys_exit.avg_time_ns": 863, # syscall exit (raw) tracepoint
    "scap.sys_exit.run_cnt": 8874737,
    "scap.sys_exit.run_time_ns": 7664523950
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-01-22T06:23:26.607267464Z"
}
```