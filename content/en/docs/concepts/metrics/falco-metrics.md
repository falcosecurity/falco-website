---
title: Falco Metrics 
description: Leverage continuous metrics for valuable insights into Falco's performance
linktitle: Falco Metrics
weight: 10
aliases:
- ../../metrics/falco-metrics
---

Falco's optional native metrics framework helps you verify that Falco is running smoothly in production. It lets you check if Falco is working as expected, track the progress and stability of rollouts, and review internal metrics for potential configuration improvements. This way, you can confirm Falco's performance and make adjustments as needed for optimal operation.

To explore the metrics functionality in more detail, refer to the [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config file and read the advanced Falco logging, alerting, and metrics sections (e.g. `metrics`).

Read [Prometheus Support](/docs/metrics/falco-metrics/#prometheus-support) to learn how to consume metrics via Prometheus.

Falco metrics are not enabled by default. The following are all the metrics config options available in the [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config file:

```yaml
metrics:
  enabled: true
  interval: 15m
  # Typically, in production, you only use `output_rule` or `output_file`, but not both. 
  # However, if you have a very unique use case, you can use both together.
  # Set `webserver.prometheus_metrics_enabled` for Prometheus output. This can be used alongside 
  # or as an alternative to `output_rule` or `output_file`.
  output_rule: true
  # Set a non-empty `output_file` to enable this option.
  # output_file: /tmp/falco_stats.jsonl
  rules_counters_enabled: true
  resource_utilization_enabled: true
  state_counters_enabled: true
  kernel_event_counters_enabled: true
  # Enabling `kernel_event_counters_per_cpu_enabled` automatically enables `kernel_event_counters_enabled`
  kernel_event_counters_per_cpu_enabled: false
  libbpf_stats_enabled: true
  plugins_metrics_enabled: true
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
    "evt.time": 1726240940545718604,
    "falco.duration_sec": 84,
    "falco.evts_rate_sec": 5598.8,
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.num_evts": 537963,
    "falco.num_evts_prev": 531854,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco_yaml": "5c9689ea597fc708cddbd26fc8204dd8fbeda689865cbe2a03c9b41bb64fd0cc",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726240856432519187,
    "falco.version": "0.39.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T15:22:20.545718604Z"
}
```
  
Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.39.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.8.11-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="5c9689ea597fc708cddbd26fc8204dd8fbeda689865cbe2a03c9b41bb64fd0cc"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1726240856432519187
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1726122734000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 21
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
    "evt.time": 1726241129530149989,
    "falco.duration_sec": 105,
    "falco.evts_rate_sec": 1136.0,
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.num_evts": 239707,
    "falco.num_evts_prev": 238571,
    "falco.outputs_queue_num_drops": 0,
    "falco.rules.Clear_Log_Activities": 0,
    "falco.rules.Contact_K8S_API_Server_From_Container": 0,
    "falco.rules.Create_Hardlink_Over_Sensitive_Files": 0,
    "falco.rules.Create_Symlink_Over_Sensitive_Files": 0,
    "falco.rules.Debugfs_Launched_in_Privileged_Container": 0,
    "falco.rules.Detect_release_agent_File_Container_Escapes": 0,
    "falco.rules.Directory_traversal_monitored_file_read": 0,
    "falco.rules.Disallowed_SSH_Connection_Non_Standard_Port": 0,
    "falco.rules.Drop_and_execute_new_binary_in_container": 0,
    "falco.rules.Execution_from_dev_shm": 0,
    "falco.rules.Fileless_execution_via_memfd_create": 0,
    "falco.rules.Find_AWS_Credentials": 0,
    "falco.rules.Linux_Kernel_Module_Injection_Detected": 0,
    "falco.rules.Netcat_Remote_Code_Execution_in_Container": 0,
    "falco.rules.PTRACE_anti_debug_attempt": 0,
    "falco.rules.PTRACE_attached_to_process": 0,
    "falco.rules.Packet_socket_created_in_container": 0,
    "falco.rules.Read_sensitive_file_trusted_after_startup": 0,
    "falco.rules.Read_sensitive_file_untrusted": 11,
    "falco.rules.Redirect_STDOUT_STDIN_to_Network_Connection_in_Container": 0,
    "falco.rules.Remove_Bulk_Data_from_Disk": 0,
    "falco.rules.Run_shell_untrusted": 0,
    "falco.rules.Search_Private_Keys_or_Passwords": 0,
    "falco.rules.System_user_interactive": 0,
    "falco.rules.Terminal_shell_in_container": 0,
    "falco.rules.matches_total": 11,
    "falco.sha256_config_file.falco_yaml": "7e1151264c1c809027adb5995eb127156734fdc19bca47a97a04fe47ce388e03",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726241024448034870,
    "falco.version": "0.39.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T15:25:29.530149989Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.39.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.8.11-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="7e1151264c1c809027adb5995eb127156734fdc19bca47a97a04fe47ce388e03"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1726241024448034870
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1726122734000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 81
# HELP falcosecurity_falco_rules_matches_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_rules_matches_total counter
falcosecurity_falco_rules_matches_total{priority="4",rule_name="Read sensitive file untrusted",source="syscall",tags="T1555, container, filesystem, host, maturity_stable, mitre_credential_access"} 11
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
    "evt.time": 1726241283922074152,
    "falco.container_memory_used_mb": 0.0, # Memory usage of the Falco process, only relevant for Kubernetes daemonset deployments, similar to container_memory_working_set_bytes
    "falco.cpu_usage_perc": 2.8, # CPU usage (percentage of one CPU) of the Falco process, equivalent to `ps` output
    "falco.duration_sec": 66,
    "falco.evts_rate_sec": 1978.1, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_cpu_usage_perc": 10.1, # Overall CPU usage of all running processes on the underlying host (percentage of all CPUs)
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_memory_used_mb": 6140.0, # Overall memory usage of all running processes on the underlying host, unit indicated via the suffix
    "falco.host_num_cpus": 20,
    "falco.host_open_fds": 18832,
    "falco.host_procs_running": 2, # `procs_running` value obtained from ${HOST_ROOT}/proc/stat of the underlying host, showing a lower number than currently alive procs
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.memory_pss_mb": 44.1, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.memory_rss_mb": 48.0, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.memory_vsz_mb": 1187.1, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.num_evts": 110342,
    "falco.num_evts_prev": 108424,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco_yaml": "787e7cca8afd80c1f1a309a50c7f0c0339bac9db3a2a525567689a53aa249aef",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726241217901083392,
    "falco.version": "0.39.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T15:28:03.922074152Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.39.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.8.11-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="787e7cca8afd80c1f1a309a50c7f0c0339bac9db3a2a525567689a53aa249aef"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1726241217901083392
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1726122734000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 64
# HELP falcosecurity_falco_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_cpu_usage_ratio gauge
falcosecurity_falco_cpu_usage_ratio 0.027000
# HELP falcosecurity_falco_memory_rss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_rss_bytes gauge
falcosecurity_falco_memory_rss_bytes 49807360.000000
# HELP falcosecurity_falco_memory_vsz_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_vsz_bytes gauge
falcosecurity_falco_memory_vsz_bytes 1244815360.000000
# HELP falcosecurity_falco_memory_pss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_pss_bytes gauge
falcosecurity_falco_memory_pss_bytes 45848576.000000
# HELP falcosecurity_falco_container_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_container_memory_used_bytes gauge
falcosecurity_falco_container_memory_used_bytes 0.000000
# HELP falcosecurity_falco_host_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_cpu_usage_ratio gauge
falcosecurity_falco_host_cpu_usage_ratio 0.101000
# HELP falcosecurity_falco_host_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_memory_used_bytes gauge
falcosecurity_falco_host_memory_used_bytes 6435979264.000000
# HELP falcosecurity_falco_host_procs_running_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_procs_running_total gauge
falcosecurity_falco_host_procs_running_total 2
# HELP falcosecurity_falco_host_open_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_open_fds_total gauge
falcosecurity_falco_host_open_fds_total 18792
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
    "evt.time": 1726241506935093148,
    "falco.duration_sec": 33,
    "falco.evts_rate_sec": 1908.5, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.n_added_fds": 32774,
    "falco.n_added_threads": 1810, # Internally, Falco is granular and talks about `threads`, not processes
    "falco.n_cached_fd_lookups": 31741,
    "falco.n_cached_thread_lookups": 45804,
    "falco.n_containers": 0, # Number of containers stored by Falco at a given time (current snapshot, not monotonic)
    "falco.n_drops_full_threadtable": 0, # Drops due to a full process cache table, internally called threadtable
    "falco.n_failed_fd_lookups": 4065,
    "falco.n_failed_thread_lookups": 3426,
    "falco.n_fds": 110992, # Number of fds stored in threadtable (current snapshot, not monotonic)
    "falco.n_missing_container_images": 0, # Number of containers stored by Falco without a container image at a given time (current snapshot, not monotonic)
    "falco.n_noncached_fd_lookups": 14955,
    "falco.n_noncached_thread_lookups": 30606,
    "falco.n_removed_fds": 5859,
    "falco.n_removed_threads": 149,
    "falco.n_retrieve_evts_drops": 1270,
    "falco.n_retrieved_evts": 8921,
    "falco.n_store_evts_drops": 0,
    "falco.n_stored_evts": 9187,
    "falco.n_threads": 1661, # Number of threads stored in threadtable (current snapshot, not monotonic)
    "falco.num_evts": 51151,
    "falco.num_evts_prev": 49243,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco_yaml": "33d96e7e998516ec0e1823f7e78a28fa6263c87aad53c3eb485df404b2b8ed4b",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726241473913453797,
    "falco.version": "0.39.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T15:31:46.935093148Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.39.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.8.11-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="33d96e7e998516ec0e1823f7e78a28fa6263c87aad53c3eb485df404b2b8ed4b"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1726241473913453797
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1726122734000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 31
# HELP falcosecurity_scap_n_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_threads_total gauge
falcosecurity_scap_n_threads_total 1661
# HELP falcosecurity_scap_n_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_fds_total gauge
falcosecurity_scap_n_fds_total 111182
# HELP falcosecurity_scap_n_noncached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_fd_lookups_total counter
falcosecurity_scap_n_noncached_fd_lookups_total 13161
# HELP falcosecurity_scap_n_cached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_fd_lookups_total counter
falcosecurity_scap_n_cached_fd_lookups_total 28627
# HELP falcosecurity_scap_n_failed_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_fd_lookups_total counter
falcosecurity_scap_n_failed_fd_lookups_total 3945
# HELP falcosecurity_scap_n_added_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_fds_total counter
falcosecurity_scap_n_added_fds_total 30647
# HELP falcosecurity_scap_n_removed_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_fds_total counter
falcosecurity_scap_n_removed_fds_total 5143
# HELP falcosecurity_scap_n_stored_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_stored_evts_total counter
falcosecurity_scap_n_stored_evts_total 8272
# HELP falcosecurity_scap_n_store_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_store_evts_drops_total counter
falcosecurity_scap_n_store_evts_drops_total 0
# HELP falcosecurity_scap_n_retrieved_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieved_evts_total counter
falcosecurity_scap_n_retrieved_evts_total 8039
# HELP falcosecurity_scap_n_retrieve_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieve_evts_drops_total counter
falcosecurity_scap_n_retrieve_evts_drops_total 1148
# HELP falcosecurity_scap_n_noncached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_thread_lookups_total counter
falcosecurity_scap_n_noncached_thread_lookups_total 29001
# HELP falcosecurity_scap_n_cached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_thread_lookups_total counter
falcosecurity_scap_n_cached_thread_lookups_total 41070
# HELP falcosecurity_scap_n_failed_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_thread_lookups_total counter
falcosecurity_scap_n_failed_thread_lookups_total 3401
# HELP falcosecurity_scap_n_added_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_threads_total counter
falcosecurity_scap_n_added_threads_total 1785
# HELP falcosecurity_scap_n_removed_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_threads_total counter
falcosecurity_scap_n_removed_threads_total 124
# HELP falcosecurity_scap_n_drops_full_threadtable_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_full_threadtable_total counter
falcosecurity_scap_n_drops_full_threadtable_total 0
# HELP falcosecurity_scap_n_missing_container_images_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_missing_container_images_total gauge
falcosecurity_scap_n_missing_container_images_total 0
# HELP falcosecurity_scap_n_containers_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_containers_total gauge
falcosecurity_scap_n_containers_total 0
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
    "evt.time": 1726241717793389378,
    "falco.duration_sec": 29,
    "falco.evts_rate_sec": 1997.4, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.num_evts": 96160,
    "falco.num_evts_prev": 94344,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco_yaml": "137aaefd14be68ef12e12220b8a92a6a4ad50c327b489090a9b643972e1df0ba",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726241688741960283,
    "falco.version": "0.39.0",
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0, # Taken between 2 metrics snapshots
    "scap.evts_rate_sec": 1195.6, # Taken between 2 metrics snapshots
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
    "scap.n_evts": 106361,
    "scap.n_evts_prev": 105274
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T15:35:17.793389378Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.39.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.8.11-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="137aaefd14be68ef12e12220b8a92a6a4ad50c327b489090a9b643972e1df0ba"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1726241688741960283
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1726122734000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 21
# HELP falcosecurity_scap_n_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_total counter
falcosecurity_scap_n_evts_total 91439
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="clone_fork"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="clone_fork"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="execve"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="execve"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="connect"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="connect"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="open"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="open"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="dir_file"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="dir_file"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="other_interest"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="other_interest"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="close"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="proc"} 0
# HELP falcosecurity_scap_n_drops_scratch_map_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_scratch_map_total counter
falcosecurity_scap_n_drops_scratch_map_total 0
# HELP falcosecurity_scap_n_drops_page_faults_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_page_faults_total counter
falcosecurity_scap_n_drops_page_faults_total 0
# HELP falcosecurity_scap_n_drops_bug_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_bug_total counter
falcosecurity_scap_n_drops_bug_total 0
# HELP falcosecurity_scap_n_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_total counter
falcosecurity_scap_n_drops_total 0
```

</details>

<details>
  <summary> Show Base / Wrapper Fields + Kernel-Side Event Drop + Event Counters Fields + Per CPU Counters
  
  `kernel_event_counters_per_cpu_enabled: true`
  </summary>

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1726242132379598376,
    "falco.duration_sec": 26,
    "falco.evts_rate_sec": 3112.9,
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.num_evts": 52223,
    "falco.num_evts_prev": 49110,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco_yaml": "9aede0613a3a55a98934d9ef9688659a3b83edcee759d26c7a13a4b5f3315e9d",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726242106357560485,
    "falco.version": "0.39.0",
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0,
    "scap.evts_rate_sec": 3886.9,
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
    "scap.n_drops_cpu_0": 0,
    "scap.n_drops_cpu_1": 0,
    "scap.n_drops_cpu_10": 0,
    "scap.n_drops_cpu_11": 0,
    "scap.n_drops_cpu_12": 0,
    "scap.n_drops_cpu_13": 0,
    "scap.n_drops_cpu_14": 0,
    "scap.n_drops_cpu_15": 0,
    "scap.n_drops_cpu_16": 0,
    "scap.n_drops_cpu_17": 0,
    "scap.n_drops_cpu_18": 0,
    "scap.n_drops_cpu_19": 0,
    "scap.n_drops_cpu_2": 0,
    "scap.n_drops_cpu_3": 0,
    "scap.n_drops_cpu_4": 0,
    "scap.n_drops_cpu_5": 0,
    "scap.n_drops_cpu_6": 0,
    "scap.n_drops_cpu_7": 0,
    "scap.n_drops_cpu_8": 0,
    "scap.n_drops_cpu_9": 0,
    "scap.n_drops_page_faults": 0,
    "scap.n_drops_perc": 0.0,
    "scap.n_drops_prev": 0,
    "scap.n_drops_scratch_map": 0,
    "scap.n_evts": 54755,
    "scap.n_evts_cpu_0": 4883,
    "scap.n_evts_cpu_1": 274,
    "scap.n_evts_cpu_10": 4256,
    "scap.n_evts_cpu_11": 2,
    "scap.n_evts_cpu_12": 2331,
    "scap.n_evts_cpu_13": 1281,
    "scap.n_evts_cpu_14": 1745,
    "scap.n_evts_cpu_15": 1581,
    "scap.n_evts_cpu_16": 770,
    "scap.n_evts_cpu_17": 638,
    "scap.n_evts_cpu_18": 711,
    "scap.n_evts_cpu_19": 721,
    "scap.n_evts_cpu_2": 3359,
    "scap.n_evts_cpu_3": 126,
    "scap.n_evts_cpu_4": 11921,
    "scap.n_evts_cpu_5": 190,
    "scap.n_evts_cpu_6": 10653,
    "scap.n_evts_cpu_7": 132,
    "scap.n_evts_cpu_8": 6757,
    "scap.n_evts_cpu_9": 2424,
    "scap.n_evts_prev": 50868
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T15:42:12.379598376Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.39.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.8.11-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="9aede0613a3a55a98934d9ef9688659a3b83edcee759d26c7a13a4b5f3315e9d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1726242106357560485
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1726122734000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 20
# HELP falcosecurity_scap_n_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_total counter
falcosecurity_scap_n_evts_total 41937
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="clone_fork"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="clone_fork"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="execve"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="execve"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="connect"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="connect"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="open"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="open"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="dir_file"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="dir_file"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="other_interest"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="other_interest"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="close"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="proc"} 0
# HELP falcosecurity_scap_n_drops_scratch_map_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_scratch_map_total counter
falcosecurity_scap_n_drops_scratch_map_total 0
# HELP falcosecurity_scap_n_drops_page_faults_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_page_faults_total counter
falcosecurity_scap_n_drops_page_faults_total 0
# HELP falcosecurity_scap_n_drops_bug_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_bug_total counter
falcosecurity_scap_n_drops_bug_total 0
# HELP falcosecurity_scap_n_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_total counter
falcosecurity_scap_n_drops_total 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="0"} 3745
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="0"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="1"} 40
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="1"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="2"} 2764
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="2"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="3"} 93
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="3"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="4"} 8723
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="4"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="5"} 170
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="5"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="6"} 8730
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="6"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="7"} 114
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="7"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="8"} 5732
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="8"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="9"} 1562
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="9"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="10"} 3222
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="10"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="11"} 0
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="11"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="12"} 1504
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="12"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="13"} 1121
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="13"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="14"} 932
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="14"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="15"} 1181
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="15"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="16"} 615
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="16"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="17"} 524
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="17"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="18"} 488
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="18"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="19"} 677
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="19"} 0
```

</details>

<details>
  <summary> Show Base / Wrapper Fields + libbpf Kernel Tracepoints Invocation Stats

  `libbpf_stats_enabled: true`
  </summary>

Applies only for `ebpf` and `modern_ebpf`, requires `sysctl kernel.bpf_stats_enabled=1` kernel setting as precondition. Compare to `bpftool prog show` capabilities.

Here is a snippet with respect to the kernel tracepoints for an `x86_64` machine using the traditional eBPF driver `engine.kind=ebpf`:

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1726242272613790976,
    "falco.duration_sec": 25,
    "falco.evts_rate_sec": 1733.2,
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.num_evts": 146294,
    "falco.num_evts_prev": 144561,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco_yaml": "2964ca63bcfe76bfcca5a07cb282a367f559188f1dc224c43aad1886607fdaf5",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726242247592463600,
    "falco.version": "0.39.0",
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
    "scap.sched_process_e.avg_time_ns": 4398, # scheduler process exit tracepoint, used to purge procs from process cache
    "scap.sched_process_e.run_cnt": 92,
    "scap.sched_process_e.run_time_ns": 404679,
    "scap.sched_switch.avg_time_ns": 0, # Disabled by default
    "scap.sched_switch.run_cnt": 0,
    "scap.sched_switch.run_time_ns": 0,
    "scap.signal_deliver.avg_time_ns": 0, # Disabled by default
    "scap.signal_deliver.run_cnt": 0,
    "scap.signal_deliver.run_time_ns": 0,
    "scap.sys_enter.avg_time_ns": 599, # syscall enter (raw) tracepoint
    "scap.sys_enter.run_cnt": 317515,
    "scap.sys_enter.run_time_ns": 190404592,
    "scap.sys_exit.avg_time_ns": 675, # syscall exit (raw) tracepoint
    "scap.sys_exit.run_cnt": 317517,
    "scap.sys_exit.run_time_ns": 214464597
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T15:44:32.613790976Z"
}
```

Here is a snippet with respect to the kernel tracepoints for an `x86_64` machine using the modern eBPF driver `engine.kind=modern_ebpf`:

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1726243288443730726,
    "falco.duration_sec": 21,
    "falco.evts_rate_sec": 1433.8,
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_num_cpus": 20,
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.num_evts": 28096,
    "falco.num_evts_prev": 26946,
    "falco.outputs_queue_num_drops": 0,
    "falco.sha256_config_file.falco_yaml": "6eea2f7e7ef3f014dea18a23dc9f80b3e6b20b8ebbea1ec0d221e4165f474742",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726243267421382631,
    "falco.version": "0.39.0",
    "scap.engine_name": "modern_bpf",
    "scap.n_drops_perc": 0.0,
    "scap.pf_kernel.avg_time_ns": 0,
    "scap.pf_kernel.run_cnt": 0,
    "scap.pf_kernel.run_time_ns": 0,
    "scap.pf_user.avg_time_ns": 0,
    "scap.pf_user.run_cnt": 0,
    "scap.pf_user.run_time_ns": 0,
    "scap.sched_proc_exit.avg_time_ns": 3339,
    "scap.sched_proc_exit.run_cnt": 75,
    "scap.sched_proc_exit.run_time_ns": 250481,
    "scap.sched_switch.avg_time_ns": 0,
    "scap.sched_switch.run_cnt": 0,
    "scap.sched_switch.run_time_ns": 0,
    "scap.signal_deliver.avg_time_ns": 0,
    "scap.signal_deliver.run_cnt": 0,
    "scap.signal_deliver.run_time_ns": 0,
    "scap.sys_enter.avg_time_ns": 509,
    "scap.sys_enter.run_cnt": 68875,
    "scap.sys_enter.run_time_ns": 35063552,
    "scap.sys_exit.avg_time_ns": 677,
    "scap.sys_exit.run_cnt": 68875,
    "scap.sys_exit.run_time_ns": 46648146
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T16:01:28.443730726Z"
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
falcosecurity_scap_engine_name_info{engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.39.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.8.11-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="2964ca63bcfe76bfcca5a07cb282a367f559188f1dc224c43aad1886607fdaf5"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1726242247592463600
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1726122734000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 24
# HELP falcosecurity_scap_sys_enter_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_cnt_total counter
falcosecurity_scap_sys_enter_run_cnt_total 315892
# HELP falcosecurity_scap_sys_enter_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_time_nanoseconds_total counter
falcosecurity_scap_sys_enter_run_time_nanoseconds_total 189922714
# HELP falcosecurity_scap_sys_enter_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_avg_time_nanoseconds gauge
falcosecurity_scap_sys_enter_avg_time_nanoseconds 601
# HELP falcosecurity_scap_sys_exit_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_cnt_total counter
falcosecurity_scap_sys_exit_run_cnt_total 315892
# HELP falcosecurity_scap_sys_exit_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_time_nanoseconds_total counter
falcosecurity_scap_sys_exit_run_time_nanoseconds_total 213757143
# HELP falcosecurity_scap_sys_exit_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_avg_time_nanoseconds gauge
falcosecurity_scap_sys_exit_avg_time_nanoseconds 676
# HELP falcosecurity_scap_sched_process_e_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_cnt_total counter
falcosecurity_scap_sched_process_e_run_cnt_total 86
# HELP falcosecurity_scap_sched_process_e_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_time_nanoseconds_total counter
falcosecurity_scap_sched_process_e_run_time_nanoseconds_total 373677
# HELP falcosecurity_scap_sched_process_e_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_avg_time_nanoseconds gauge
falcosecurity_scap_sched_process_e_avg_time_nanoseconds 4345
# HELP falcosecurity_scap_sched_switch_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_run_cnt_total counter
falcosecurity_scap_sched_switch_run_cnt_total 0
# HELP falcosecurity_scap_sched_switch_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_run_time_nanoseconds_total counter
falcosecurity_scap_sched_switch_run_time_nanoseconds_total 0
# HELP falcosecurity_scap_sched_switch_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_avg_time_nanoseconds gauge
falcosecurity_scap_sched_switch_avg_time_nanoseconds 0
# HELP falcosecurity_scap_page_fault_user_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_run_cnt_total counter
falcosecurity_scap_page_fault_user_run_cnt_total 0
# HELP falcosecurity_scap_page_fault_user_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_run_time_nanoseconds_total counter
falcosecurity_scap_page_fault_user_run_time_nanoseconds_total 0
# HELP falcosecurity_scap_page_fault_user_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_avg_time_nanoseconds gauge
falcosecurity_scap_page_fault_user_avg_time_nanoseconds 0
# HELP falcosecurity_scap_page_fault_kern_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_run_cnt_total counter
falcosecurity_scap_page_fault_kern_run_cnt_total 0
# HELP falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total counter
falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total 0
# HELP falcosecurity_scap_page_fault_kern_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_avg_time_nanoseconds gauge
falcosecurity_scap_page_fault_kern_avg_time_nanoseconds 0
# HELP falcosecurity_scap_signal_deliver_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_run_cnt_total counter
falcosecurity_scap_signal_deliver_run_cnt_total 0
# HELP falcosecurity_scap_signal_deliver_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_run_time_nanoseconds_total counter
falcosecurity_scap_signal_deliver_run_time_nanoseconds_total 0
# HELP falcosecurity_scap_signal_deliver_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_avg_time_nanoseconds gauge
falcosecurity_scap_signal_deliver_avg_time_nanoseconds 0
```

</details>

<details>
  <summary> Show All Fields
  </summary>

We’re listing all the fields here. For additional details on specific metrics, see the dedicated sections above.

`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1726242616416408809,
    "falco.container_memory_used_mb": 0.0,
    "falco.cpu_usage_perc": 5.0,
    "falco.duration_sec": 87,
    "falco.evts_rate_sec": 2139.2,
    "falco.host_boot_ts": 1726122734000000000,
    "falco.host_cpu_usage_perc": 9.3,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv4.addresses": "192.168.4.57",
    "falco.host_netinfo.interfaces.wlp0s20f3.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:8eac:d1c:4721:58f1,fd3c:bd4b:d641:1b4c:495f:af96:a80c:b0f9,fe80:0:0:0:9ac2:aaa4:22b3:f753",
    "falco.host_memory_used_mb": 6263.9,
    "falco.host_num_cpus": 20,
    "falco.host_open_fds": 18872,
    "falco.host_procs_running": 1,
    "falco.kernel_release": "6.8.11-200.fc39.x86_64",
    "falco.memory_pss_mb": 83.1,
    "falco.memory_rss_mb": 86.3,
    "falco.memory_vsz_mb": 1187.1,
    "falco.n_added_fds": 82355,
    "falco.n_added_threads": 2129,
    "falco.n_cached_fd_lookups": 520331,
    "falco.n_cached_thread_lookups": 571389,
    "falco.n_containers": 0,
    "falco.n_drops_full_threadtable": 0,
    "falco.n_failed_fd_lookups": 34543,
    "falco.n_failed_thread_lookups": 3839,
    "falco.n_fds": 115933,
    "falco.n_missing_container_images": 0,
    "falco.n_noncached_fd_lookups": 139740,
    "falco.n_noncached_thread_lookups": 207304,
    "falco.n_removed_fds": 20072,
    "falco.n_removed_threads": 437,
    "falco.n_retrieve_evts_drops": 4981,
    "falco.n_retrieved_evts": 51936,
    "falco.n_store_evts_drops": 0,
    "falco.n_stored_evts": 53887,
    "falco.n_threads": 1692,
    "falco.num_evts": 681165,
    "falco.num_evts_prev": 679285,
    "falco.outputs_queue_num_drops": 0,
    "falco.rules.Clear_Log_Activities": 0,
    "falco.rules.Contact_K8S_API_Server_From_Container": 0,
    "falco.rules.Create_Hardlink_Over_Sensitive_Files": 0,
    "falco.rules.Create_Symlink_Over_Sensitive_Files": 0,
    "falco.rules.Debugfs_Launched_in_Privileged_Container": 0,
    "falco.rules.Detect_release_agent_File_Container_Escapes": 0,
    "falco.rules.Directory_traversal_monitored_file_read": 0,
    "falco.rules.Disallowed_SSH_Connection_Non_Standard_Port": 0,
    "falco.rules.Drop_and_execute_new_binary_in_container": 0,
    "falco.rules.Execution_from_dev_shm": 0,
    "falco.rules.Fileless_execution_via_memfd_create": 0,
    "falco.rules.Find_AWS_Credentials": 0,
    "falco.rules.Linux_Kernel_Module_Injection_Detected": 0,
    "falco.rules.Netcat_Remote_Code_Execution_in_Container": 0,
    "falco.rules.PTRACE_anti_debug_attempt": 0,
    "falco.rules.PTRACE_attached_to_process": 0,
    "falco.rules.Packet_socket_created_in_container": 0,
    "falco.rules.Read_sensitive_file_trusted_after_startup": 0,
    "falco.rules.Read_sensitive_file_untrusted": 0,
    "falco.rules.Redirect_STDOUT_STDIN_to_Network_Connection_in_Container": 0,
    "falco.rules.Remove_Bulk_Data_from_Disk": 0,
    "falco.rules.Run_shell_untrusted": 0,
    "falco.rules.Search_Private_Keys_or_Passwords": 0,
    "falco.rules.System_user_interactive": 0,
    "falco.rules.Terminal_shell_in_container": 0,
    "falco.rules.matches_total": 0,
    "falco.sha256_config_file.falco_yaml": "dda540600846785baaa2d2c8fc631528fff49fb10a3b75c4cdca668b28ae693d",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1726242529394244000,
    "falco.version": "0.39.0",
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0,
    "scap.evts_rate_sec": 2209.7,
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
    "scap.n_drops_cpu_0": 0,
    "scap.n_drops_cpu_1": 0,
    "scap.n_drops_cpu_10": 0,
    "scap.n_drops_cpu_11": 0,
    "scap.n_drops_cpu_12": 0,
    "scap.n_drops_cpu_13": 0,
    "scap.n_drops_cpu_14": 0,
    "scap.n_drops_cpu_15": 0,
    "scap.n_drops_cpu_16": 0,
    "scap.n_drops_cpu_17": 0,
    "scap.n_drops_cpu_18": 0,
    "scap.n_drops_cpu_19": 0,
    "scap.n_drops_cpu_2": 0,
    "scap.n_drops_cpu_3": 0,
    "scap.n_drops_cpu_4": 0,
    "scap.n_drops_cpu_5": 0,
    "scap.n_drops_cpu_6": 0,
    "scap.n_drops_cpu_7": 0,
    "scap.n_drops_cpu_8": 0,
    "scap.n_drops_cpu_9": 0,
    "scap.n_drops_page_faults": 0,
    "scap.n_drops_perc": 0.0,
    "scap.n_drops_prev": 0,
    "scap.n_drops_scratch_map": 0,
    "scap.n_evts": 725241,
    "scap.n_evts_cpu_0": 49154,
    "scap.n_evts_cpu_1": 7493,
    "scap.n_evts_cpu_10": 74419,
    "scap.n_evts_cpu_11": 2578,
    "scap.n_evts_cpu_12": 57337,
    "scap.n_evts_cpu_13": 51082,
    "scap.n_evts_cpu_14": 42528,
    "scap.n_evts_cpu_15": 29702,
    "scap.n_evts_cpu_16": 18458,
    "scap.n_evts_cpu_17": 17784,
    "scap.n_evts_cpu_18": 15214,
    "scap.n_evts_cpu_19": 14313,
    "scap.n_evts_cpu_2": 52958,
    "scap.n_evts_cpu_3": 1672,
    "scap.n_evts_cpu_4": 83891,
    "scap.n_evts_cpu_5": 3687,
    "scap.n_evts_cpu_6": 102885,
    "scap.n_evts_cpu_7": 5276,
    "scap.n_evts_cpu_8": 81200,
    "scap.n_evts_cpu_9": 13610,
    "scap.n_evts_prev": 723299,
    "scap.page_fault_kern.avg_time_ns": 0,
    "scap.page_fault_kern.run_cnt": 0,
    "scap.page_fault_kern.run_time_ns": 0,
    "scap.page_fault_user.avg_time_ns": 0,
    "scap.page_fault_user.run_cnt": 0,
    "scap.page_fault_user.run_time_ns": 0,
    "scap.sched_process_e.avg_time_ns": 2882,
    "scap.sched_process_e.run_cnt": 526,
    "scap.sched_process_e.run_time_ns": 1516279,
    "scap.sched_switch.avg_time_ns": 0,
    "scap.sched_switch.run_cnt": 0,
    "scap.sched_switch.run_time_ns": 0,
    "scap.signal_deliver.avg_time_ns": 0,
    "scap.signal_deliver.run_cnt": 0,
    "scap.signal_deliver.run_time_ns": 0,
    "scap.sys_enter.avg_time_ns": 523,
    "scap.sys_enter.run_cnt": 1445654,
    "scap.sys_enter.run_time_ns": 757373628,
    "scap.sys_exit.avg_time_ns": 567,
    "scap.sys_exit.run_cnt": 1445722,
    "scap.sys_exit.run_time_ns": 820508642
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2024-09-13T15:50:16.416408809Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf"} 1
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.39.0"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.8.11-200.fc39.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="dda540600846785baaa2d2c8fc631528fff49fb10a3b75c4cdca668b28ae693d"} 1
# HELP falcosecurity_falco_evt_source_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_evt_source_info gauge
falcosecurity_falco_evt_source_info{evt_source="syscall"} 1
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1726242529394244000
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1726122734000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 20
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 85
# HELP falcosecurity_scap_n_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_total counter
falcosecurity_scap_n_evts_total 720910
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="clone_fork"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="clone_fork"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="execve"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="execve"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="connect"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="connect"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="open"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="open"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="dir_file"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="dir_file"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="enter",drop="other_interest"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="other_interest"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="close"} 0
# HELP falcosecurity_scap_n_drops_buffer_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_buffer_total counter
falcosecurity_scap_n_drops_buffer_total{dir="exit",drop="proc"} 0
# HELP falcosecurity_scap_n_drops_scratch_map_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_scratch_map_total counter
falcosecurity_scap_n_drops_scratch_map_total 0
# HELP falcosecurity_scap_n_drops_page_faults_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_page_faults_total counter
falcosecurity_scap_n_drops_page_faults_total 0
# HELP falcosecurity_scap_n_drops_bug_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_bug_total counter
falcosecurity_scap_n_drops_bug_total 0
# HELP falcosecurity_scap_n_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_total counter
falcosecurity_scap_n_drops_total 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="0"} 48959
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="0"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="1"} 7493
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="1"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="2"} 52810
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="2"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="3"} 1672
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="3"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="4"} 83684
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="4"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="5"} 3681
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="5"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="6"} 101532
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="6"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="7"} 5268
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="7"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="8"} 80346
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="8"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="9"} 13610
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="9"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="10"} 74096
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="10"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="11"} 2578
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="11"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="12"} 57161
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="12"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="13"} 50917
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="13"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="14"} 42276
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="14"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="15"} 29562
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="15"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="16"} 18272
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="16"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="17"} 17694
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="17"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="18"} 15064
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="18"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="19"} 14235
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="19"} 0
# HELP falcosecurity_scap_sys_enter_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_cnt_total counter
falcosecurity_scap_sys_enter_run_cnt_total 1434428
# HELP falcosecurity_scap_sys_enter_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_time_nanoseconds_total counter
falcosecurity_scap_sys_enter_run_time_nanoseconds_total 751290983
# HELP falcosecurity_scap_sys_enter_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_avg_time_nanoseconds gauge
falcosecurity_scap_sys_enter_avg_time_nanoseconds 523
# HELP falcosecurity_scap_sys_exit_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_cnt_total counter
falcosecurity_scap_sys_exit_run_cnt_total 1434496
# HELP falcosecurity_scap_sys_exit_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_time_nanoseconds_total counter
falcosecurity_scap_sys_exit_run_time_nanoseconds_total 813158553
# HELP falcosecurity_scap_sys_exit_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_avg_time_nanoseconds gauge
falcosecurity_scap_sys_exit_avg_time_nanoseconds 566
# HELP falcosecurity_scap_sched_process_e_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_cnt_total counter
falcosecurity_scap_sched_process_e_run_cnt_total 503
# HELP falcosecurity_scap_sched_process_e_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_time_nanoseconds_total counter
falcosecurity_scap_sched_process_e_run_time_nanoseconds_total 1469881
# HELP falcosecurity_scap_sched_process_e_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_avg_time_nanoseconds gauge
falcosecurity_scap_sched_process_e_avg_time_nanoseconds 2922
# HELP falcosecurity_scap_sched_switch_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_run_cnt_total counter
falcosecurity_scap_sched_switch_run_cnt_total 0
# HELP falcosecurity_scap_sched_switch_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_run_time_nanoseconds_total counter
falcosecurity_scap_sched_switch_run_time_nanoseconds_total 0
# HELP falcosecurity_scap_sched_switch_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_switch_avg_time_nanoseconds gauge
falcosecurity_scap_sched_switch_avg_time_nanoseconds 0
# HELP falcosecurity_scap_page_fault_user_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_run_cnt_total counter
falcosecurity_scap_page_fault_user_run_cnt_total 0
# HELP falcosecurity_scap_page_fault_user_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_run_time_nanoseconds_total counter
falcosecurity_scap_page_fault_user_run_time_nanoseconds_total 0
# HELP falcosecurity_scap_page_fault_user_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_user_avg_time_nanoseconds gauge
falcosecurity_scap_page_fault_user_avg_time_nanoseconds 0
# HELP falcosecurity_scap_page_fault_kern_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_run_cnt_total counter
falcosecurity_scap_page_fault_kern_run_cnt_total 0
# HELP falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total counter
falcosecurity_scap_page_fault_kern_run_time_nanoseconds_total 0
# HELP falcosecurity_scap_page_fault_kern_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_page_fault_kern_avg_time_nanoseconds gauge
falcosecurity_scap_page_fault_kern_avg_time_nanoseconds 0
# HELP falcosecurity_scap_signal_deliver_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_run_cnt_total counter
falcosecurity_scap_signal_deliver_run_cnt_total 0
# HELP falcosecurity_scap_signal_deliver_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_run_time_nanoseconds_total counter
falcosecurity_scap_signal_deliver_run_time_nanoseconds_total 0
# HELP falcosecurity_scap_signal_deliver_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_signal_deliver_avg_time_nanoseconds gauge
falcosecurity_scap_signal_deliver_avg_time_nanoseconds 0
# HELP falcosecurity_falco_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_cpu_usage_ratio gauge
falcosecurity_falco_cpu_usage_ratio 0.050000
# HELP falcosecurity_falco_memory_rss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_rss_bytes gauge
falcosecurity_falco_memory_rss_bytes 89948160.000000
# HELP falcosecurity_falco_memory_vsz_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_vsz_bytes gauge
falcosecurity_falco_memory_vsz_bytes 1244749824.000000
# HELP falcosecurity_falco_memory_pss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_pss_bytes gauge
falcosecurity_falco_memory_pss_bytes 86641664.000000
# HELP falcosecurity_falco_container_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_container_memory_used_bytes gauge
falcosecurity_falco_container_memory_used_bytes 0.000000
# HELP falcosecurity_falco_host_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_cpu_usage_ratio gauge
falcosecurity_falco_host_cpu_usage_ratio 0.093000
# HELP falcosecurity_falco_host_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_memory_used_bytes gauge
falcosecurity_falco_host_memory_used_bytes 6578089984.000000
# HELP falcosecurity_falco_host_procs_running_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_procs_running_total gauge
falcosecurity_falco_host_procs_running_total 2
# HELP falcosecurity_falco_host_open_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_open_fds_total gauge
falcosecurity_falco_host_open_fds_total 18912
# HELP falcosecurity_scap_n_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_threads_total gauge
falcosecurity_scap_n_threads_total 1693
# HELP falcosecurity_scap_n_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_fds_total gauge
falcosecurity_scap_n_fds_total 115969
# HELP falcosecurity_scap_n_noncached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_fd_lookups_total counter
falcosecurity_scap_n_noncached_fd_lookups_total 138325
# HELP falcosecurity_scap_n_cached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_fd_lookups_total counter
falcosecurity_scap_n_cached_fd_lookups_total 517660
# HELP falcosecurity_scap_n_failed_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_fd_lookups_total counter
falcosecurity_scap_n_failed_fd_lookups_total 34507
# HELP falcosecurity_scap_n_added_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_fds_total counter
falcosecurity_scap_n_added_fds_total 80866
# HELP falcosecurity_scap_n_removed_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_fds_total counter
falcosecurity_scap_n_removed_fds_total 19530
# HELP falcosecurity_scap_n_stored_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_stored_evts_total counter
falcosecurity_scap_n_stored_evts_total 53178
# HELP falcosecurity_scap_n_store_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_store_evts_drops_total counter
falcosecurity_scap_n_store_evts_drops_total 0
# HELP falcosecurity_scap_n_retrieved_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieved_evts_total counter
falcosecurity_scap_n_retrieved_evts_total 51250
# HELP falcosecurity_scap_n_retrieve_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieve_evts_drops_total counter
falcosecurity_scap_n_retrieve_evts_drops_total 4933
# HELP falcosecurity_scap_n_noncached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_thread_lookups_total counter
falcosecurity_scap_n_noncached_thread_lookups_total 206305
# HELP falcosecurity_scap_n_cached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_thread_lookups_total counter
falcosecurity_scap_n_cached_thread_lookups_total 567495
# HELP falcosecurity_scap_n_failed_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_thread_lookups_total counter
falcosecurity_scap_n_failed_thread_lookups_total 3817
# HELP falcosecurity_scap_n_added_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_threads_total counter
falcosecurity_scap_n_added_threads_total 2107
# HELP falcosecurity_scap_n_removed_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_threads_total counter
falcosecurity_scap_n_removed_threads_total 414
# HELP falcosecurity_scap_n_drops_full_threadtable_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_full_threadtable_total counter
falcosecurity_scap_n_drops_full_threadtable_total 0
# HELP falcosecurity_scap_n_missing_container_images_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_missing_container_images_total gauge
falcosecurity_scap_n_missing_container_images_total 0
# HELP falcosecurity_scap_n_containers_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_containers_total gauge
falcosecurity_scap_n_containers_total 0
```
  
</details>

## Prometheus Support

Since version 0.39.0, you can also use Falco's web server to expose Falco's metrics. A new `/metrics` endpoint has been added which provides metrics information that can be collected by [Prometheus][2].

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
The `num_evts` and `host_netinfo` wrapper / base field are currently not available for Prometheus metrics; otherwise, there is 1:1 support across all output channels.

However, following the Prometheus recommendations, there might be some slight differences with regard to some metrics fields. Typically calculated fields will not be returned as Prometheus provides the facilities to compute them as part of their queries (e.g. event or drop rates can be calculated in Prometheus).

Starting with Falco 0.39.0, several sub-metrics now use [labels](https://prometheus.io/docs/practices/naming/#labels) to align with Prometheus best practices and support groupBy queries.
{{% /pageinfo %}}

[1]: https://github.com/falcosecurity/falco/blob/master/falco.yaml
[2]: https://prometheus.io
[3]: https://prometheus.io/docs/instrumenting/exposition_formats/
[4]: https://github.com/OpenObservability/OpenMetrics/blob/main/specification/OpenMetrics.md

## Plugins Metrics

Since version 0.38.1, Falco allows plugins to provide their own set of [custom metrics](/docs/reference/plugins/plugin-api-reference/#get-metrics).

In order to enable plugins metrics, the following configuration elements must be set in the [falco.yaml][1]:

```yaml
metrics:
  enabled: true
  ...
  plugins_metrics_enabled: true
  ...
```

Please note that this doesn't provide default metrics about the plugin itself, and it will show metrics only if the plugin is providing them.

Currently, none of the officially maintained plugins provides any metric, but this will change in the future. 

Please keep in mind that many of the metrics categories are specific to the syscalls source, such as `libbpf_stats_enabled`, `kernel_event_counters_enabled`, `kernel_event_counters_per_cpu_enabled`, or `state_counters_enabled`.

## Breaking Changes

{{% pageinfo color=info %}}
Several metric output field names have changed in Falco 0.39.0 compared to earlier versions. This is a global breaking change, so please refer to the updated documentation for the current metric names, especially for Prometheus metrics.
{{% /pageinfo %}}
