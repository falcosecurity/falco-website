---
title: Falco Metrics 
description: Leverage continuous metrics for valuable insights into Falco's performance
linktitle: Falco Metrics
weight: 10
---

To explore the metrics functionality, refer to the [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config file and read the advanced Falco logging, alerting, and metrics sections (e.g. `metrics`).

Read [Prometheus Support](/docs/metrics/falco-metrics/#prometheus-support) to learn how to consume metrics via Prometheus.

The following are all the metrics config options available in the [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config file:

```yaml
metrics:
  enabled: true
  interval: 15m
  output_rule: true
  rules_counters_enabled: true
  resource_utilization_enabled: true
  state_counters_enabled: true
  kernel_event_counters_enabled: true
  libbpf_stats_enabled: true
  convert_memory_to_mb: true
  include_empty_values: true
```

Here is a brief glossary of the currently supported metrics for both the `json` rule format and [Prometheus](/docs/metrics/falco-metrics/#prometheus-support):

<details>
  <summary> Show Base / Wrapper Fields
  
  `enabled: true`
  </summary>

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1716133484148617968,
    "falco.duration_sec": 26,
    "falco.evts_rate_sec": 1946.2, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1715113297000000000,
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.7.9-200.fc39.x86_64",
    "falco.num_evts": 138649,
    "falco.num_evts_prev": 136762,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco": "c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d",
    "falco.sha256_rules_file.falco_rules": "f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d",
    "falco.start_ts": 1716133458145889366,
    "falco.version": "0.38.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-05-19T15:44:44.148617968Z"
}
```
  
Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{raw_name="engine_name",engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{raw_name="version",version="0.38.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{raw_name="kernel_release",kernel_release="6.7.9-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{raw_name="hostname",hostname="test"} 1
# HELP falcosecurity_falco_falco_sha256_rules_file_falco_rules_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_rules_file_falco_rules_info gauge
falcosecurity_falco_falco_sha256_rules_file_falco_rules_info{raw_name="falco_sha256_rules_file_falco_rules",falco_sha256_rules_file_falco_rules="f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d"} 1
# HELP falcosecurity_falco_falco_sha256_config_file_falco_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_config_file_falco_info gauge
falcosecurity_falco_falco_sha256_config_file_falco_info{raw_name="falco_sha256_config_file_falco",falco_sha256_config_file_falco="c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{raw_name="evt_source",evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds{raw_name="start_ts"} 1716133458145889366
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds{raw_name="host_boot_ts"} 1715113297000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total{raw_name="host_num_cpus"} 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total{raw_name="outputs_queue_num_drops"} 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total{raw_name="duration_sec"} 14
```

</details>

<details>
  <summary> Show Base / Wrapper Fields + Rules Counters Fields
  
  `rules_counters_enabled: true`
  </summary>

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1716133976523893076,
    "falco.duration_sec": 26,
    "falco.evts_rate_sec": 19304.4, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1715113297000000000,
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.7.9-200.fc39.x86_64",
    "falco.num_evts": 211543,
    "falco.num_evts_prev": 192239,
    "falco.outputs_queue_num_drops": 0,
    "falco.rules.matches_total": 2,
    "falco.rules.Test_rule": 2,
    "falco.sha256_config_file.falco": "c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d",
    "falco.sha256_rules_file.falco_rules": "f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d",
    "falco.start_ts": 1716133950520541198,
    "falco.version": "0.38.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-05-19T15:52:56.523893076Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{raw_name="engine_name",engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{raw_name="version",version="0.38.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{raw_name="kernel_release",kernel_release="6.7.9-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{raw_name="hostname",hostname="test"} 1
# HELP falcosecurity_falco_falco_sha256_rules_file_falco_rules_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_rules_file_falco_rules_info gauge
falcosecurity_falco_falco_sha256_rules_file_falco_rules_info{raw_name="falco_sha256_rules_file_falco_rules",falco_sha256_rules_file_falco_rules="f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d"} 1
# HELP falcosecurity_falco_falco_sha256_config_file_falco_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_config_file_falco_info gauge
falcosecurity_falco_falco_sha256_config_file_falco_info{raw_name="falco_sha256_config_file_falco",falco_sha256_config_file_falco="c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{raw_name="evt_source",evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds{raw_name="start_ts"} 1716133950520541198
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds{raw_name="host_boot_ts"} 1715113297000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total{raw_name="host_num_cpus"} 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total{raw_name="outputs_queue_num_drops"} 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total{raw_name="duration_sec"} 12
# HELP falcosecurity_falco_rules_matches_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_rules_matches_total counter
falcosecurity_falco_rules_matches_total{raw_name="rules.matches_total"} 2
# HELP falcosecurity_falco_rules_Test_rule_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_rules_Test_rule_total counter
falcosecurity_falco_rules_Test_rule_total{raw_name="rules.Test_rule",priority="5",rule="Test rule",source="syscall",tags="container, host, maturity_stable"} 2
```
  
</details>

<details>
  <summary> Show Base / Wrapper Fields + Resource Utilization Fields
  
  `resource_utilization_enabled: true`
  </summary>

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1716133670287243881,
    "falco.container_memory_used_mb": 0.0, # Memory usage of the Falco process, only relevant for Kubernetes daemonset deployments, similar to container_memory_working_set_bytes
    "falco.cpu_usage_perc": 4.3, # CPU usage (percentage of one CPU) of the Falco process, equivalent to `ps` output
    "falco.duration_sec": 33,
    "falco.evts_rate_sec": 9629.4, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1715113297000000000,
    "falco.host_cpu_usage_perc": 8.6, # Overall CPU usage of all running processes on the underlying host (percentage of all CPUs)
    "falco.host_memory_used_mb": 6538.4, # Overall memory usage of all running processes on the underlying host, unit indicated via the suffix
    "falco.host_num_cpus": 20,
    "falco.host_open_fds": 18712,
    "falco.host_procs_running": 1, # `procs_running` value obtained from ${HOST_ROOT}/proc/stat of the underlying host, showing a lower number than currently alive procs
    "falco.kernel_release": "6.7.9-200.fc39.x86_64",
    "falco.memory_pss_mb": 45.5, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.memory_rss_mb": 48.3, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.memory_vsz_mb": 1312.2, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.num_evts": 182124,
    "falco.num_evts_prev": 172786,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco": "c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d",
    "falco.sha256_rules_file.falco_rules": "f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d",
    "falco.start_ts": 1716133637282607692,
    "falco.version": "0.38.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-05-19T15:47:50.287243881Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{raw_name="engine_name",engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{raw_name="version",version="0.38.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{raw_name="kernel_release",kernel_release="6.7.9-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{raw_name="hostname",hostname="test"} 1
# HELP falcosecurity_falco_falco_sha256_rules_file_falco_rules_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_rules_file_falco_rules_info gauge
falcosecurity_falco_falco_sha256_rules_file_falco_rules_info{raw_name="falco_sha256_rules_file_falco_rules",falco_sha256_rules_file_falco_rules="f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d"} 1
# HELP falcosecurity_falco_falco_sha256_config_file_falco_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_config_file_falco_info gauge
falcosecurity_falco_falco_sha256_config_file_falco_info{raw_name="falco_sha256_config_file_falco",falco_sha256_config_file_falco="c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{raw_name="evt_source",evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds{raw_name="start_ts"} 1716133637282607692
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds{raw_name="host_boot_ts"} 1715113297000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total{raw_name="host_num_cpus"} 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total{raw_name="outputs_queue_num_drops"} 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total{raw_name="duration_sec"} 28
# HELP falcosecurity_falco_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_cpu_usage_ratio gauge
falcosecurity_falco_cpu_usage_ratio{raw_name="cpu_usage_ratio"} 0.044000
# HELP falcosecurity_falco_memory_rss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_rss_bytes gauge
falcosecurity_falco_memory_rss_bytes{raw_name="memory_rss_bytes"} 47185920.000000
# HELP falcosecurity_falco_memory_vsz_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_vsz_bytes gauge
falcosecurity_falco_memory_vsz_bytes{raw_name="memory_vsz_bytes"} 1375928320.000000
# HELP falcosecurity_falco_memory_pss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_pss_bytes gauge
falcosecurity_falco_memory_pss_bytes{raw_name="memory_pss_bytes"} 44344320.000000
# HELP falcosecurity_falco_container_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_container_memory_used_bytes gauge
falcosecurity_falco_container_memory_used_bytes{raw_name="container_memory_used_bytes"} 0.000000
# HELP falcosecurity_falco_host_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_cpu_usage_ratio gauge
falcosecurity_falco_host_cpu_usage_ratio{raw_name="host_cpu_usage_ratio"} 0.086000
# HELP falcosecurity_falco_host_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_memory_used_bytes gauge
falcosecurity_falco_host_memory_used_bytes{raw_name="host_memory_used_bytes"} 6891933696.000000
# HELP falcosecurity_falco_host_procs_running_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_procs_running_total gauge
falcosecurity_falco_host_procs_running_total{raw_name="host_procs_running"} 1
# HELP falcosecurity_falco_host_open_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_open_fds_total gauge
falcosecurity_falco_host_open_fds_total{raw_name="host_open_fds"} 18672
```

</details>

<details>
  <summary> Show Base / Wrapper Fields + Internal State Handling Fields
  
  `state_counters_enabled: true`
  </summary>

Most counters are monotonic/all-time counts, with some exceptions indicated below where the current snapshot is measured.

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1716133744577486948,
    "falco.duration_sec": 18,
    "falco.evts_rate_sec": 3519.8, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1715113297000000000,
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.7.9-200.fc39.x86_64",
    "falco.n_added_fds": 20042,
    "falco.n_added_threads": 1569, # Internally, Falco is granular and talks about `threads`, not processes
    "falco.n_cached_fd_lookups": 49470,
    "falco.n_cached_thread_lookups": 59404,
    "falco.n_containers": 0, # Number of containers stored by Falco at a given time (current snapshot, not monotonic)
    "falco.n_drops_full_threadtable": 0, # Drops due to a full process cache table, internally called threadtable
    "falco.n_failed_fd_lookups": 4785,
    "falco.n_failed_thread_lookups": 3465,
    "falco.n_fds": 102689, # Number of fds stored in threadtable (current snapshot, not monotonic)
    "falco.n_missing_container_images": 0, # Number of containers stored by Falco without a container image at a given time (current snapshot, not monotonic)
    "falco.n_noncached_fd_lookups": 17115,
    "falco.n_noncached_thread_lookups": 31190,
    "falco.n_removed_fds": 3223,
    "falco.n_removed_threads": 57,
    "falco.n_retrieve_evts_drops": 693,
    "falco.n_retrieved_evts": 9252,
    "falco.n_store_evts_drops": 0,
    "falco.n_stored_evts": 10005,
    "falco.n_threads": 1512, # Number of threads stored in threadtable (current snapshot, not monotonic)
    "falco.num_evts": 72539,
    "falco.num_evts_prev": 69019,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco": "c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d",
    "falco.sha256_rules_file.falco_rules": "f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d",
    "falco.start_ts": 1716133726573387703,
    "falco.version": "0.38.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-05-19T15:49:04.577486948Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{raw_name="engine_name",engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{raw_name="version",version="0.38.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{raw_name="kernel_release",kernel_release="6.7.9-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{raw_name="hostname",hostname="test"} 1
# HELP falcosecurity_falco_falco_sha256_rules_file_falco_rules_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_rules_file_falco_rules_info gauge
falcosecurity_falco_falco_sha256_rules_file_falco_rules_info{raw_name="falco_sha256_rules_file_falco_rules",falco_sha256_rules_file_falco_rules="f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d"} 1
# HELP falcosecurity_falco_falco_sha256_config_file_falco_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_config_file_falco_info gauge
falcosecurity_falco_falco_sha256_config_file_falco_info{raw_name="falco_sha256_config_file_falco",falco_sha256_config_file_falco="c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{raw_name="evt_source",evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds{raw_name="start_ts"} 1716133726573387703
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds{raw_name="host_boot_ts"} 1715113297000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total{raw_name="host_num_cpus"} 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total{raw_name="outputs_queue_num_drops"} 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total{raw_name="duration_sec"} 10
# HELP falcosecurity_scap_n_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_threads_total gauge
falcosecurity_scap_n_threads_total{raw_name="n_threads"} 1508
# HELP falcosecurity_scap_n_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_fds_total gauge
falcosecurity_scap_n_fds_total{raw_name="n_fds"} 103115
# HELP falcosecurity_scap_n_noncached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_fd_lookups_total counter
falcosecurity_scap_n_noncached_fd_lookups_total{raw_name="n_noncached_fd_lookups"} 6701
# HELP falcosecurity_scap_n_cached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_fd_lookups_total counter
falcosecurity_scap_n_cached_fd_lookups_total{raw_name="n_cached_fd_lookups"} 16538
# HELP falcosecurity_scap_n_failed_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_fd_lookups_total counter
falcosecurity_scap_n_failed_fd_lookups_total{raw_name="n_failed_fd_lookups"} 597
# HELP falcosecurity_scap_n_added_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_fds_total counter
falcosecurity_scap_n_added_fds_total{raw_name="n_added_fds"} 13167
# HELP falcosecurity_scap_n_removed_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_fds_total counter
falcosecurity_scap_n_removed_fds_total{raw_name="n_removed_fds"} 1724
# HELP falcosecurity_scap_n_stored_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_stored_evts_total counter
falcosecurity_scap_n_stored_evts_total{raw_name="n_stored_evts"} 3960
# HELP falcosecurity_scap_n_store_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_store_evts_drops_total counter
falcosecurity_scap_n_store_evts_drops_total{raw_name="n_store_evts_drops"} 0
# HELP falcosecurity_scap_n_retrieved_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieved_evts_total counter
falcosecurity_scap_n_retrieved_evts_total{raw_name="n_retrieved_evts"} 3790
# HELP falcosecurity_scap_n_retrieve_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieve_evts_drops_total counter
falcosecurity_scap_n_retrieve_evts_drops_total{raw_name="n_retrieve_evts_drops"} 380
# HELP falcosecurity_scap_n_noncached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_thread_lookups_total counter
falcosecurity_scap_n_noncached_thread_lookups_total{raw_name="n_noncached_thread_lookups"} 18234
# HELP falcosecurity_scap_n_cached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_thread_lookups_total counter
falcosecurity_scap_n_cached_thread_lookups_total{raw_name="n_cached_thread_lookups"} 19459
# HELP falcosecurity_scap_n_failed_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_thread_lookups_total counter
falcosecurity_scap_n_failed_thread_lookups_total{raw_name="n_failed_thread_lookups"} 3432
# HELP falcosecurity_scap_n_added_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_threads_total counter
falcosecurity_scap_n_added_threads_total{raw_name="n_added_threads"} 1536
# HELP falcosecurity_scap_n_removed_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_threads_total counter
falcosecurity_scap_n_removed_threads_total{raw_name="n_removed_threads"} 28
# HELP falcosecurity_scap_n_drops_full_threadtable_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_full_threadtable_total counter
falcosecurity_scap_n_drops_full_threadtable_total{raw_name="n_drops_full_threadtable"} 0
# HELP falcosecurity_scap_n_missing_container_images_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_missing_container_images_total gauge
falcosecurity_scap_n_missing_container_images_total{raw_name="n_missing_container_images"} 0
# HELP falcosecurity_scap_n_containers_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_containers_total gauge
falcosecurity_scap_n_containers_total{raw_name="n_containers"} 0
```
  
</details>

<details>
  <summary> Show Base / Wrapper Fields + Kernel-Side Event Drop + Event Counters Fields
  
  `kernel_event_counters_enabled: true`
  </summary>

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1716133814152518524,
    "falco.duration_sec": 22,
    "falco.evts_rate_sec": 2827.6, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1715113297000000000,
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.7.9-200.fc39.x86_64",
    "falco.num_evts": 74076,
    "falco.num_evts_prev": 71248,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco": "c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d",
    "falco.sha256_rules_file.falco_rules": "f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d",
    "falco.start_ts": 1716133792148691117,
    "falco.version": "0.38.0",
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0, # Taken between 2 metrics snapshots
    "scap.evts_rate_sec": 4058.4, # Taken between 2 metrics snapshots
    "scap.n_drops": 0, # Monotonic counter all-time kernel side drops
     # Below coarse-grained (non-comprehensive) categories for more granular insights into kernel-side drops
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
    "scap.n_evts": 76739,
    "scap.n_evts_prev": 72680
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-05-19T15:50:14.152518524Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{raw_name="engine_name",engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{raw_name="version",version="0.38.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{raw_name="kernel_release",kernel_release="6.7.9-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{raw_name="hostname",hostname="test"} 1
# HELP falcosecurity_falco_falco_sha256_rules_file_falco_rules_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_rules_file_falco_rules_info gauge
falcosecurity_falco_falco_sha256_rules_file_falco_rules_info{raw_name="falco_sha256_rules_file_falco_rules",falco_sha256_rules_file_falco_rules="f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d"} 1
# HELP falcosecurity_falco_falco_sha256_config_file_falco_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_config_file_falco_info gauge
falcosecurity_falco_falco_sha256_config_file_falco_info{raw_name="falco_sha256_config_file_falco",falco_sha256_config_file_falco="c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{raw_name="evt_source",evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds{raw_name="start_ts"} 1716133792148691117
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds{raw_name="host_boot_ts"} 1715113297000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total{raw_name="host_num_cpus"} 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total{raw_name="outputs_queue_num_drops"} 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total{raw_name="duration_sec"} 13
# HELP falcosecurity_falco_n_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_evts_total counter
falcosecurity_falco_n_evts_total{raw_name="n_evts"} 31452
# HELP falcosecurity_falco_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_total counter
falcosecurity_falco_n_drops_buffer_total{raw_name="n_drops_buffer_total"} 0
# HELP falcosecurity_falco_n_drops_buffer_clone_fork_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_clone_fork_enter_total counter
falcosecurity_falco_n_drops_buffer_clone_fork_enter_total{raw_name="n_drops_buffer_clone_fork_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_clone_fork_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_clone_fork_exit_total counter
falcosecurity_falco_n_drops_buffer_clone_fork_exit_total{raw_name="n_drops_buffer_clone_fork_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_execve_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_execve_enter_total counter
falcosecurity_falco_n_drops_buffer_execve_enter_total{raw_name="n_drops_buffer_execve_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_execve_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_execve_exit_total counter
falcosecurity_falco_n_drops_buffer_execve_exit_total{raw_name="n_drops_buffer_execve_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_connect_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_connect_enter_total counter
falcosecurity_falco_n_drops_buffer_connect_enter_total{raw_name="n_drops_buffer_connect_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_connect_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_connect_exit_total counter
falcosecurity_falco_n_drops_buffer_connect_exit_total{raw_name="n_drops_buffer_connect_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_open_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_open_enter_total counter
falcosecurity_falco_n_drops_buffer_open_enter_total{raw_name="n_drops_buffer_open_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_open_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_open_exit_total counter
falcosecurity_falco_n_drops_buffer_open_exit_total{raw_name="n_drops_buffer_open_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_dir_file_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_dir_file_enter_total counter
falcosecurity_falco_n_drops_buffer_dir_file_enter_total{raw_name="n_drops_buffer_dir_file_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_dir_file_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_dir_file_exit_total counter
falcosecurity_falco_n_drops_buffer_dir_file_exit_total{raw_name="n_drops_buffer_dir_file_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_other_interest_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_other_interest_enter_total counter
falcosecurity_falco_n_drops_buffer_other_interest_enter_total{raw_name="n_drops_buffer_other_interest_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_other_interest_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_other_interest_exit_total counter
falcosecurity_falco_n_drops_buffer_other_interest_exit_total{raw_name="n_drops_buffer_other_interest_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_close_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_close_exit_total counter
falcosecurity_falco_n_drops_buffer_close_exit_total{raw_name="n_drops_buffer_close_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_proc_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_proc_exit_total counter
falcosecurity_falco_n_drops_buffer_proc_exit_total{raw_name="n_drops_buffer_proc_exit"} 0
# HELP falcosecurity_falco_n_drops_scratch_map_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_scratch_map_total counter
falcosecurity_falco_n_drops_scratch_map_total{raw_name="n_drops_scratch_map"} 0
# HELP falcosecurity_falco_n_drops_page_faults_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_page_faults_total counter
falcosecurity_falco_n_drops_page_faults_total{raw_name="n_drops_page_faults"} 0
# HELP falcosecurity_falco_n_drops_bug_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_bug_total counter
falcosecurity_falco_n_drops_bug_total{raw_name="n_drops_bug"} 0
# HELP falcosecurity_falco_n_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_total counter
falcosecurity_falco_n_drops_total{raw_name="n_drops"} 0
```

</details>

<details>
  <summary> Show Base / Wrapper Fields + libbpf Kernel Tracepoints Invocation Stats

  `libbpf_stats_enabled: true`
  </summary>

Applies only for `ebpf` and `modern_ebpf`, requires `sysctl kernel.bpf_stats_enabled=1` kernel setting as precondition. Compare to `bpftool prog show` capabilities.

Here is a snippet with respect to the kernel tracepoints for an `x86_64` machine:

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1716133900848339430,
    "falco.duration_sec": 32,
    "falco.evts_rate_sec": 4941.6, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1715113297000000000,
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.7.9-200.fc39.x86_64",
    "falco.num_evts": 120023,
    "falco.num_evts_prev": 115083,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco": "c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d",
    "falco.sha256_rules_file.falco_rules": "f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d",
    "falco.start_ts": 1716133868845122937,
    "falco.version": "0.38.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0, # Taken between 2 metrics snapshots
    # libbpf stats -> all-time kernel tracepoints invocations stats for an `x86_64` machine
    # Note: no equivalent stats for kmod driver available
    "scap.page_fault_kern.avg_time_ns": 0, # Disabled by default
    "scap.page_fault_kern.run_cnt": 0,
    "scap.page_fault_kern.run_time_ns": 0,
    "scap.page_fault_user.avg_time_ns": 0, # Disabled by default
    "scap.page_fault_user.run_cnt": 0,
    "scap.page_fault_user.run_time_ns": 0,
    "scap.sched_process_e.avg_time_ns": 4599, # scheduler process exit tracepoint, used to purge procs from process cache
    "scap.sched_process_e.run_cnt": 99,
    "scap.sched_process_e.run_time_ns": 455377,
    "scap.sched_switch.avg_time_ns": 0, # Disabled by default
    "scap.sched_switch.run_cnt": 0,
    "scap.sched_switch.run_time_ns": 0,
    "scap.signal_deliver.avg_time_ns": 0, # Disabled by default
    "scap.signal_deliver.run_cnt": 0,
    "scap.signal_deliver.run_time_ns": 0,
    "scap.sys_enter.avg_time_ns": 458, # syscall enter (raw) tracepoint
    "scap.sys_enter.run_cnt": 342334,
    "scap.sys_enter.run_time_ns": 157102813,
    "scap.sys_exit.avg_time_ns": 539, # syscall exit (raw) tracepoint
    "scap.sys_exit.run_cnt": 342340,
    "scap.sys_exit.run_time_ns": 184588268
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-05-19T15:51:40.848339430Z"
}
```

Here is a snippet with respect to the kernel tracepoints for an `aarch64` machine:

```yaml
{
  "hostname": "lima-falco-fedora",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "lima-falco-fedora",
    "evt.source": "syscall",
    "falco.kernel_release": "6.5.6-300.fc39.aarch64",
    # libbpf stats -> all-time kernel tracepoints invocations stats for an `aarch64` machine
    # Note: no equivalent stats for kmod driver available
    "scap.sched_p_exec.avg_time_ns": 12948, # to address certain architecture differences or limitations, tap into the scheduler instead of the raw tracepoint concerning the clone/fork/execve* syscalls
    "scap.sched_p_exec.run_cnt": 17,
    "scap.sched_p_exec.run_time_ns": 220124,
    "scap.sched_p_fork.avg_time_ns": 18931, # to address certain architecture differences or limitations, tap into the scheduler instead of the raw tracepoint concerning the clone/fork/execve* syscalls
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
  "time": "2024-05-19T15:51:40.848339430Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{raw_name="engine_name",engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{raw_name="version",version="0.38.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{raw_name="kernel_release",kernel_release="6.7.9-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{raw_name="hostname",hostname="test"} 1
# HELP falcosecurity_falco_falco_sha256_rules_file_falco_rules_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_rules_file_falco_rules_info gauge
falcosecurity_falco_falco_sha256_rules_file_falco_rules_info{raw_name="falco_sha256_rules_file_falco_rules",falco_sha256_rules_file_falco_rules="f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d"} 1
# HELP falcosecurity_falco_falco_sha256_config_file_falco_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_config_file_falco_info gauge
falcosecurity_falco_falco_sha256_config_file_falco_info{raw_name="falco_sha256_config_file_falco",falco_sha256_config_file_falco="c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{raw_name="evt_source",evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds{raw_name="start_ts"} 1716133868845122937
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds{raw_name="host_boot_ts"} 1715113297000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total{raw_name="host_num_cpus"} 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total{raw_name="outputs_queue_num_drops"} 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total{raw_name="duration_sec"} 14
# HELP falcosecurity_scap_sys_enter_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_cnt_total counter
falcosecurity_scap_sys_enter_run_cnt_total{raw_name="sys_enter.run_cnt"} 125775
# HELP falcosecurity_scap_sys_enter_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_time_nanoseconds_total counter
falcosecurity_scap_sys_enter_run_time_nanoseconds_total{raw_name="sys_enter.run_time_ns"} 63247460
# HELP falcosecurity_scap_sys_enter_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_avg_time_nanoseconds gauge
falcosecurity_scap_sys_enter_avg_time_nanoseconds{raw_name="sys_enter.avg_time_ns"} 502
# HELP falcosecurity_scap_sys_exit_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_cnt_total counter
falcosecurity_scap_sys_exit_run_cnt_total{raw_name="sys_exit.run_cnt"} 125776
# HELP falcosecurity_scap_sys_exit_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_time_nanoseconds_total counter
falcosecurity_scap_sys_exit_run_time_nanoseconds_total{raw_name="sys_exit.run_time_ns"} 73464633
# HELP falcosecurity_scap_sys_exit_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_avg_time_nanoseconds gauge
falcosecurity_scap_sys_exit_avg_time_nanoseconds{raw_name="sys_exit.avg_time_ns"} 584
# HELP falcosecurity_scap_sched_process_e_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_cnt_total counter
falcosecurity_scap_sched_process_e_run_cnt_total{raw_name="sched_process_e.run_cnt"} 37
# HELP falcosecurity_scap_sched_process_e_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_time_nanoseconds_total counter
falcosecurity_scap_sched_process_e_run_time_nanoseconds_total{raw_name="sched_process_e.run_time_ns"} 160909
# HELP falcosecurity_scap_sched_process_e_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_avg_time_nanoseconds gauge
falcosecurity_scap_sched_process_e_avg_time_nanoseconds{raw_name="sched_process_e.avg_time_ns"} 4348
# HELP falcosecurity_scap_sched_switch_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_run_cnt_total counter
falcosecurity_scap_sched_switch_run_cnt_total{raw_name="sched_switch.run_cnt"} 0
# HELP falcosecurity_scap_sched_switch_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_run_time_nanoseconds_total counter
falcosecurity_scap_sched_switch_run_time_nanoseconds_total{raw_name="sched_switch.run_time_ns"} 0
# HELP falcosecurity_scap_sched_switch_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_avg_time_nanoseconds gauge
falcosecurity_scap_sched_switch_avg_time_nanoseconds{raw_name="sched_switch.avg_time_ns"} 0
# HELP falcosecurity_scap_page_fault_user_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_run_cnt_total counter
falcosecurity_scap_page_fault_user_run_cnt_total{raw_name="page_fault_user.run_cnt"} 0
# HELP falcosecurity_scap_page_fault_user_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_run_time_nanoseconds_total counter
falcosecurity_scap_page_fault_user_run_time_nanoseconds_total{raw_name="page_fault_user.run_time_ns"} 0
# HELP falcosecurity_scap_page_fault_user_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_avg_time_nanoseconds gauge
falcosecurity_scap_page_fault_user_avg_time_nanoseconds{raw_name="page_fault_user.avg_time_ns"} 0
# HELP falcosecurity_scap_page_fault_kern_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_run_cnt_total counter
falcosecurity_scap_page_fault_kern_run_cnt_total{raw_name="page_fault_kern.run_cnt"} 0
# HELP falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total counter
falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total{raw_name="page_fault_kern.run_time_ns"} 0
# HELP falcosecurity_scap_page_fault_kern_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_avg_time_nanoseconds gauge
falcosecurity_scap_page_fault_kern_avg_time_nanoseconds{raw_name="page_fault_kern.avg_time_ns"} 0
# HELP falcosecurity_scap_signal_deliver_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_run_cnt_total counter
falcosecurity_scap_signal_deliver_run_cnt_total{raw_name="signal_deliver.run_cnt"} 0
# HELP falcosecurity_scap_signal_deliver_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_run_time_nanoseconds_total counter
falcosecurity_scap_signal_deliver_run_time_nanoseconds_total{raw_name="signal_deliver.run_time_ns"} 0
# HELP falcosecurity_scap_signal_deliver_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_avg_time_nanoseconds gauge
falcosecurity_scap_signal_deliver_avg_time_nanoseconds{raw_name="signal_deliver.avg_time_ns"} 0
```

</details>

<details>
  <summary> Show All Fields
  </summary>

`json`

```yaml

{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1716134075886389623,
    "falco.container_memory_used_mb": 0.0,
    "falco.cpu_usage_perc": 6.6,
    "falco.duration_sec": 16,
    "falco.evts_rate_sec": 9968.6,
    "falco.host_boot_ts": 1715113297000000000,
    "falco.host_cpu_usage_perc": 8.6,
    "falco.host_memory_used_mb": 6608.4,
    "falco.host_num_cpus": 20,
    "falco.host_open_fds": 18712,
    "falco.host_procs_running": 3,
    "falco.kernel_release": "6.7.9-200.fc39.x86_64",
    "falco.memory_pss_mb": 41.6,
    "falco.memory_rss_mb": 44.5,
    "falco.memory_vsz_mb": 1312.2,
    "falco.n_added_fds": 17878,
    "falco.n_added_threads": 1565,
    "falco.n_cached_fd_lookups": 109636,
    "falco.n_cached_thread_lookups": 107636,
    "falco.n_containers": 0,
    "falco.n_drops_full_threadtable": 0,
    "falco.n_failed_fd_lookups": 10381,
    "falco.n_failed_thread_lookups": 3459,
    "falco.n_fds": 104702,
    "falco.n_missing_container_images": 0,
    "falco.n_noncached_fd_lookups": 24420,
    "falco.n_noncached_thread_lookups": 55211,
    "falco.n_removed_fds": 2935,
    "falco.n_removed_threads": 42,
    "falco.n_retrieve_evts_drops": 609,
    "falco.n_retrieved_evts": 11938,
    "falco.n_store_evts_drops": 0,
    "falco.n_stored_evts": 13602,
    "falco.n_threads": 1523,
    "falco.num_evts": 144600,
    "falco.num_evts_prev": 134632,
    "falco.outputs_queue_num_drops": 0,
    "falco.rules.matches_total": 0,
    "falco.rules.Test_rule": 0,
    "falco.sha256_config_file.falco": "c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d",
    "falco.sha256_rules_file.falco_rules": "f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d",
    "falco.start_ts": 1716134059882838651,
    "falco.version": "0.38.0",
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0,
    "scap.evts_rate_sec": 10954.6,
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
    "scap.n_evts": 148858,
    "scap.n_evts_prev": 137904,
    "scap.page_fault_kern.avg_time_ns": 0,
    "scap.page_fault_kern.run_cnt": 0,
    "scap.page_fault_kern.run_time_ns": 0,
    "scap.page_fault_user.avg_time_ns": 0,
    "scap.page_fault_user.run_cnt": 0,
    "scap.page_fault_user.run_time_ns": 0,
    "scap.sched_process_e.avg_time_ns": 4248,
    "scap.sched_process_e.run_cnt": 43,
    "scap.sched_process_e.run_time_ns": 182687,
    "scap.sched_switch.avg_time_ns": 0,
    "scap.sched_switch.run_cnt": 0,
    "scap.sched_switch.run_time_ns": 0,
    "scap.signal_deliver.avg_time_ns": 0,
    "scap.signal_deliver.run_cnt": 0,
    "scap.signal_deliver.run_time_ns": 0,
    "scap.sys_enter.avg_time_ns": 536,
    "scap.sys_enter.run_cnt": 351193,
    "scap.sys_enter.run_time_ns": 188365869,
    "scap.sys_exit.avg_time_ns": 602,
    "scap.sys_exit.run_cnt": 351122,
    "scap.sys_exit.run_time_ns": 211709898
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-05-19T15:54:35.886389623Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{raw_name="engine_name",engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{raw_name="version",version="0.38.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{raw_name="kernel_release",kernel_release="6.7.9-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{raw_name="hostname",hostname="test"} 1
# HELP falcosecurity_falco_falco_sha256_rules_file_falco_rules_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_rules_file_falco_rules_info gauge
falcosecurity_falco_falco_sha256_rules_file_falco_rules_info{raw_name="falco_sha256_rules_file_falco_rules",falco_sha256_rules_file_falco_rules="f176455ad6a1f39cf32065af14d33042e092b30489d255cbb1eff0dc03e67c5d"} 1
# HELP falcosecurity_falco_falco_sha256_config_file_falco_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_falco_sha256_config_file_falco_info gauge
falcosecurity_falco_falco_sha256_config_file_falco_info{raw_name="falco_sha256_config_file_falco",falco_sha256_config_file_falco="c78b5de8e841917eb2c7a8257f37995e1c9594cffb71ea1e7aefa932172cac3d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{raw_name="evt_source",evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds{raw_name="start_ts"} 1716134059882838651
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds{raw_name="host_boot_ts"} 1715113297000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total{raw_name="host_num_cpus"} 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total{raw_name="outputs_queue_num_drops"} 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total{raw_name="duration_sec"} 13
# HELP falcosecurity_falco_rules_matches_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_rules_matches_total counter
falcosecurity_falco_rules_matches_total{raw_name="rules.matches_total"} 0
# HELP falcosecurity_falco_rules_Test_rule_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_rules_Test_rule_total counter
falcosecurity_falco_rules_Test_rule_total{raw_name="rules.Test_rule",priority="5",rule="Test rule",source="syscall",tags="container, host, maturity_stable"} 0
# HELP falcosecurity_falco_n_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_evts_total counter
falcosecurity_falco_n_evts_total{raw_name="n_evts"} 115266
# HELP falcosecurity_falco_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_total counter
falcosecurity_falco_n_drops_buffer_total{raw_name="n_drops_buffer_total"} 0
# HELP falcosecurity_falco_n_drops_buffer_clone_fork_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_clone_fork_enter_total counter
falcosecurity_falco_n_drops_buffer_clone_fork_enter_total{raw_name="n_drops_buffer_clone_fork_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_clone_fork_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_clone_fork_exit_total counter
falcosecurity_falco_n_drops_buffer_clone_fork_exit_total{raw_name="n_drops_buffer_clone_fork_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_execve_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_execve_enter_total counter
falcosecurity_falco_n_drops_buffer_execve_enter_total{raw_name="n_drops_buffer_execve_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_execve_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_execve_exit_total counter
falcosecurity_falco_n_drops_buffer_execve_exit_total{raw_name="n_drops_buffer_execve_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_connect_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_connect_enter_total counter
falcosecurity_falco_n_drops_buffer_connect_enter_total{raw_name="n_drops_buffer_connect_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_connect_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_connect_exit_total counter
falcosecurity_falco_n_drops_buffer_connect_exit_total{raw_name="n_drops_buffer_connect_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_open_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_open_enter_total counter
falcosecurity_falco_n_drops_buffer_open_enter_total{raw_name="n_drops_buffer_open_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_open_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_open_exit_total counter
falcosecurity_falco_n_drops_buffer_open_exit_total{raw_name="n_drops_buffer_open_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_dir_file_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_dir_file_enter_total counter
falcosecurity_falco_n_drops_buffer_dir_file_enter_total{raw_name="n_drops_buffer_dir_file_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_dir_file_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_dir_file_exit_total counter
falcosecurity_falco_n_drops_buffer_dir_file_exit_total{raw_name="n_drops_buffer_dir_file_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_other_interest_enter_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_other_interest_enter_total counter
falcosecurity_falco_n_drops_buffer_other_interest_enter_total{raw_name="n_drops_buffer_other_interest_enter"} 0
# HELP falcosecurity_falco_n_drops_buffer_other_interest_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_other_interest_exit_total counter
falcosecurity_falco_n_drops_buffer_other_interest_exit_total{raw_name="n_drops_buffer_other_interest_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_close_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_close_exit_total counter
falcosecurity_falco_n_drops_buffer_close_exit_total{raw_name="n_drops_buffer_close_exit"} 0
# HELP falcosecurity_falco_n_drops_buffer_proc_exit_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_buffer_proc_exit_total counter
falcosecurity_falco_n_drops_buffer_proc_exit_total{raw_name="n_drops_buffer_proc_exit"} 0
# HELP falcosecurity_falco_n_drops_scratch_map_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_scratch_map_total counter
falcosecurity_falco_n_drops_scratch_map_total{raw_name="n_drops_scratch_map"} 0
# HELP falcosecurity_falco_n_drops_page_faults_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_page_faults_total counter
falcosecurity_falco_n_drops_page_faults_total{raw_name="n_drops_page_faults"} 0
# HELP falcosecurity_falco_n_drops_bug_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_bug_total counter
falcosecurity_falco_n_drops_bug_total{raw_name="n_drops_bug"} 0
# HELP falcosecurity_falco_n_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_n_drops_total counter
falcosecurity_falco_n_drops_total{raw_name="n_drops"} 0
# HELP falcosecurity_scap_sys_enter_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_cnt_total counter
falcosecurity_scap_sys_enter_run_cnt_total{raw_name="sys_enter.run_cnt"} 268297
# HELP falcosecurity_scap_sys_enter_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_time_nanoseconds_total counter
falcosecurity_scap_sys_enter_run_time_nanoseconds_total{raw_name="sys_enter.run_time_ns"} 143901562
# HELP falcosecurity_scap_sys_enter_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_avg_time_nanoseconds gauge
falcosecurity_scap_sys_enter_avg_time_nanoseconds{raw_name="sys_enter.avg_time_ns"} 536
# HELP falcosecurity_scap_sys_exit_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_cnt_total counter
falcosecurity_scap_sys_exit_run_cnt_total{raw_name="sys_exit.run_cnt"} 268227
# HELP falcosecurity_scap_sys_exit_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_time_nanoseconds_total counter
falcosecurity_scap_sys_exit_run_time_nanoseconds_total{raw_name="sys_exit.run_time_ns"} 160399772
# HELP falcosecurity_scap_sys_exit_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_avg_time_nanoseconds gauge
falcosecurity_scap_sys_exit_avg_time_nanoseconds{raw_name="sys_exit.avg_time_ns"} 598
# HELP falcosecurity_scap_sched_process_e_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_cnt_total counter
falcosecurity_scap_sched_process_e_run_cnt_total{raw_name="sched_process_e.run_cnt"} 35
# HELP falcosecurity_scap_sched_process_e_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_time_nanoseconds_total counter
falcosecurity_scap_sched_process_e_run_time_nanoseconds_total{raw_name="sched_process_e.run_time_ns"} 148463
# HELP falcosecurity_scap_sched_process_e_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_avg_time_nanoseconds gauge
falcosecurity_scap_sched_process_e_avg_time_nanoseconds{raw_name="sched_process_e.avg_time_ns"} 4241
# HELP falcosecurity_scap_sched_switch_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_run_cnt_total counter
falcosecurity_scap_sched_switch_run_cnt_total{raw_name="sched_switch.run_cnt"} 0
# HELP falcosecurity_scap_sched_switch_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_run_time_nanoseconds_total counter
falcosecurity_scap_sched_switch_run_time_nanoseconds_total{raw_name="sched_switch.run_time_ns"} 0
# HELP falcosecurity_scap_sched_switch_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_avg_time_nanoseconds gauge
falcosecurity_scap_sched_switch_avg_time_nanoseconds{raw_name="sched_switch.avg_time_ns"} 0
# HELP falcosecurity_scap_page_fault_user_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_run_cnt_total counter
falcosecurity_scap_page_fault_user_run_cnt_total{raw_name="page_fault_user.run_cnt"} 0
# HELP falcosecurity_scap_page_fault_user_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_run_time_nanoseconds_total counter
falcosecurity_scap_page_fault_user_run_time_nanoseconds_total{raw_name="page_fault_user.run_time_ns"} 0
# HELP falcosecurity_scap_page_fault_user_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_avg_time_nanoseconds gauge
falcosecurity_scap_page_fault_user_avg_time_nanoseconds{raw_name="page_fault_user.avg_time_ns"} 0
# HELP falcosecurity_scap_page_fault_kern_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_run_cnt_total counter
falcosecurity_scap_page_fault_kern_run_cnt_total{raw_name="page_fault_kern.run_cnt"} 0
# HELP falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total counter
falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total{raw_name="page_fault_kern.run_time_ns"} 0
# HELP falcosecurity_scap_page_fault_kern_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_avg_time_nanoseconds gauge
falcosecurity_scap_page_fault_kern_avg_time_nanoseconds{raw_name="page_fault_kern.avg_time_ns"} 0
# HELP falcosecurity_scap_signal_deliver_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_run_cnt_total counter
falcosecurity_scap_signal_deliver_run_cnt_total{raw_name="signal_deliver.run_cnt"} 0
# HELP falcosecurity_scap_signal_deliver_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_run_time_nanoseconds_total counter
falcosecurity_scap_signal_deliver_run_time_nanoseconds_total{raw_name="signal_deliver.run_time_ns"} 0
# HELP falcosecurity_scap_signal_deliver_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_avg_time_nanoseconds gauge
falcosecurity_scap_signal_deliver_avg_time_nanoseconds{raw_name="signal_deliver.avg_time_ns"} 0
# HELP falcosecurity_falco_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_cpu_usage_ratio gauge
falcosecurity_falco_cpu_usage_ratio{raw_name="cpu_usage_ratio"} 0.072000
# HELP falcosecurity_falco_memory_rss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_rss_bytes gauge
falcosecurity_falco_memory_rss_bytes{raw_name="memory_rss_bytes"} 44236800.000000
# HELP falcosecurity_falco_memory_vsz_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_vsz_bytes gauge
falcosecurity_falco_memory_vsz_bytes{raw_name="memory_vsz_bytes"} 1308819456.000000
# HELP falcosecurity_falco_memory_pss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_pss_bytes gauge
falcosecurity_falco_memory_pss_bytes{raw_name="memory_pss_bytes"} 41051136.000000
# HELP falcosecurity_falco_container_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_container_memory_used_bytes gauge
falcosecurity_falco_container_memory_used_bytes{raw_name="container_memory_used_bytes"} 0.000000
# HELP falcosecurity_falco_host_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_cpu_usage_ratio gauge
falcosecurity_falco_host_cpu_usage_ratio{raw_name="host_cpu_usage_ratio"} 0.086000
# HELP falcosecurity_falco_host_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_memory_used_bytes gauge
falcosecurity_falco_host_memory_used_bytes{raw_name="host_memory_used_bytes"} 6925217792.000000
# HELP falcosecurity_falco_host_procs_running_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_procs_running_total gauge
falcosecurity_falco_host_procs_running_total{raw_name="host_procs_running"} 3
# HELP falcosecurity_falco_host_open_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_open_fds_total gauge
falcosecurity_falco_host_open_fds_total{raw_name="host_open_fds"} 18712
# HELP falcosecurity_scap_n_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_threads_total gauge
falcosecurity_scap_n_threads_total{raw_name="n_threads"} 1523
# HELP falcosecurity_scap_n_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_fds_total gauge
falcosecurity_scap_n_fds_total{raw_name="n_fds"} 104533
# HELP falcosecurity_scap_n_noncached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_fd_lookups_total counter
falcosecurity_scap_n_noncached_fd_lookups_total{raw_name="n_noncached_fd_lookups"} 18286
# HELP falcosecurity_scap_n_cached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_fd_lookups_total counter
falcosecurity_scap_n_cached_fd_lookups_total{raw_name="n_cached_fd_lookups"} 86296
# HELP falcosecurity_scap_n_failed_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_fd_lookups_total counter
falcosecurity_scap_n_failed_fd_lookups_total{raw_name="n_failed_fd_lookups"} 7364
# HELP falcosecurity_scap_n_added_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_fds_total counter
falcosecurity_scap_n_added_fds_total{raw_name="n_added_fds"} 15859
# HELP falcosecurity_scap_n_removed_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_fds_total counter
falcosecurity_scap_n_removed_fds_total{raw_name="n_removed_fds"} 2320
# HELP falcosecurity_scap_n_stored_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_stored_evts_total counter
falcosecurity_scap_n_stored_evts_total{raw_name="n_stored_evts"} 10196
# HELP falcosecurity_scap_n_store_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_store_evts_drops_total counter
falcosecurity_scap_n_store_evts_drops_total{raw_name="n_store_evts_drops"} 0
# HELP falcosecurity_scap_n_retrieved_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieved_evts_total counter
falcosecurity_scap_n_retrieved_evts_total{raw_name="n_retrieved_evts"} 8989
# HELP falcosecurity_scap_n_retrieve_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieve_evts_drops_total counter
falcosecurity_scap_n_retrieve_evts_drops_total{raw_name="n_retrieve_evts_drops"} 501
# HELP falcosecurity_scap_n_noncached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_thread_lookups_total counter
falcosecurity_scap_n_noncached_thread_lookups_total{raw_name="n_noncached_thread_lookups"} 44586
# HELP falcosecurity_scap_n_cached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_thread_lookups_total counter
falcosecurity_scap_n_cached_thread_lookups_total{raw_name="n_cached_thread_lookups"} 84566
# HELP falcosecurity_scap_n_failed_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_thread_lookups_total counter
falcosecurity_scap_n_failed_thread_lookups_total{raw_name="n_failed_thread_lookups"} 3444
# HELP falcosecurity_scap_n_added_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_threads_total counter
falcosecurity_scap_n_added_threads_total{raw_name="n_added_threads"} 1558
# HELP falcosecurity_scap_n_removed_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_threads_total counter
falcosecurity_scap_n_removed_threads_total{raw_name="n_removed_threads"} 35
# HELP falcosecurity_scap_n_drops_full_threadtable_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_full_threadtable_total counter
falcosecurity_scap_n_drops_full_threadtable_total{raw_name="n_drops_full_threadtable"} 0
# HELP falcosecurity_scap_n_missing_container_images_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_missing_container_images_total gauge
falcosecurity_scap_n_missing_container_images_total{raw_name="n_missing_container_images"} 0
# HELP falcosecurity_scap_n_containers_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_containers_total gauge
falcosecurity_scap_n_containers_total{raw_name="n_containers"} 0
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

### Limitations and Additional Information

Expand the example outputs dropdowns above (for both JSON and Prometheus formats) to explore all supported metrics fields, including their naming conventions and units.

The Prometheus text format documentation can be found [here][3].

The OpenMetrics specification can be found [here][4].
{{% pageinfo color=info %}}
The `num_evts` wrapper / base field is currently not available for Prometheus metrics; otherwise, there is 1:1 support across all output channels. 

However, following the Prometheus recommendations, there might be some slight differences with regard to some metrics fields. Typically calculated fields will not be returned as Prometheus provides the facilities to compute them as part of their queries (e.g. event or drop rates can be calculated in Prometheus).
{{% /pageinfo %}}

[1]: https://github.com/falcosecurity/falco/blob/master/falco.yaml
[2]: https://prometheus.io
[3]: https://prometheus.io/docs/instrumenting/exposition_formats/
[4]: https://github.com/OpenObservability/OpenMetrics/blob/main/specification/OpenMetrics.md

## Plugin Metrics

The ability to add custom plugin metrics is currently under development (targeting Falco 0.39.0). However, plugin metrics can also include regular metrics when running Falco with either just a plugin source or both the primary syscalls event source and a plugin. This section will inform you about a few current limitations:

- When running Falco with a plugin only on macOS or Windows, there is currently no metrics support.
- Most of the available metrics are only relevant for the primary syscalls event source (e.g., `state_counters_enabled`, `kernel_event_counters_enabled`, and `libbpf_stats_enabled`), not for a plugin with a non-syscalls event source.
- When running Falco with a plugin only on Linux (without using the syscalls event source), it currently doesn't work well due to some issues in Falco's capture initialization phase. We are working on resolving remaining issues by Falco 0.39.0 (see this [issue](https://github.com/falcosecurity/falco/issues/3194#issuecomment-2111009270)). Therefore, the following fields are not available when running Falco with a plugin only on Linux:
  - `falcosecurity_falco_kernel_release_info`
  - `falcosecurity_evt_hostname_info`
  - `falcosecurity_falco_start_timestamp_nanoseconds`
  - `falcosecurity_falco_host_boot_timestamp_nanoseconds`
  - `falcosecurity_falco_host_num_cpus_total`
  - `falcosecurity_falco_duration_seconds_total`
  - `falcosecurity_falco_cpu_usage_ratio` (broken given we don't initialize some of the above info)

## Breaking Changes

{{% pageinfo color=info %}}
Several metric output field names have changed in Falco 0.38.0 compared to previous releases when using the `output_rule` or `output_file` metrics options.

To ensure long-term consistency and validity, we have renamed the following metric output fields. The unit suffix depends on whether you use `convert_memory_to_mb: true` or not:

- `falco.hostname` -> `evt.hostname` to be consistent with the newer `evt.hostname` filter field
- `cpu_usage_perc_total_host` -> `host_cpu_usage_perc`
- `memory_used_host` -> `host_memory_used_kb` (or `host_memory_used_mb`)
- `procs_running_host` -> `host_procs_running`
- `open_fds_host` -> `host_open_fds`
- `memory_rss` -> `memory_rss_kb` (or `memory_rss_mb`)
- `memory_pss` -> `memory_pss_kb` (or `memory_pss_mb`)
- `memory_vsz` -> `memory_vsz_kb` (or `memory_vsz_mb`)
- `container_memory_used` -> `container_memory_used_bytes` (or `container_memory_used_mb`)
{{% /pageinfo %}}

Near-term improvements are tracked in the following [issue](https://github.com/falcosecurity/falco/issues/3194#issuecomment-2111009270).
