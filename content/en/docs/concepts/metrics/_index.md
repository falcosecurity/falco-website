---
title: Metrics
description: Leverage continuous metrics for valuable insights into Falco's performance.
weight: 50
aliases:
- ../metrics
- ../metrics/falco-metrics
---

## Overview

Falco’s native metrics framework provides real-time insights into your deployment’s performance. With these metrics, you can:

- **Monitor Health:** Verify that Falco is running smoothly in production.
- **Track Performance:** Observe event rates, resource usage, and more.
- **Troubleshoot Issues:** Identify potential configuration improvements based on detailed internal metrics.
- **Detections Metrics:** Get insights into rules matching abnormal behavior, potential security threats, and compliance violations.

{{% pageinfo color="info" %}}
As a real-world example of the potential these metrics can offer, we invite you to examine the Grafana dashboards of live Falco deployments for our testing infrastructure at [monitoring.prow.falco.org](https://monitoring.prow.falco.org/).
{{% /pageinfo %}}

{{% pageinfo color="info" %}}
For performance-related guidance, take a look at our [troubleshooting section](/docs/troubleshooting/performance).
{{% /pageinfo %}}

## Configuration {#configuration}

Falco metrics are disabled by default. To start using them, you must enable the `metrics` option in your configuration (defined in the [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml). Further options allow you to customize the metrics functionality to meet your monitoring needs.

```yaml
metrics:
  enabled: false
  interval: 1h
  # Typically, in production, you only use `output_rule` or `output_file`, but not both. 
  # However, if you have a very unique use case, you can use both together.
  # Set `webserver.prometheus_metrics_enabled` for Prometheus output.
  output_rule: true
  # output_file: /tmp/falco_stats.jsonl
  rules_counters_enabled: true
  resource_utilization_enabled: true
  state_counters_enabled: true
  kernel_event_counters_enabled: true
  # Enabling `kernel_event_counters_per_cpu_enabled` automatically enables `kernel_event_counters_enabled`
  kernel_event_counters_per_cpu_enabled: false
  libbpf_stats_enabled: true
  plugins_metrics_enabled: true
  jemalloc_stats_enabled: false
  convert_memory_to_mb: true
  include_empty_values: false
```

### Plugins Metrics {#plugins-metrics}

Falco allows plugins to provide their own set of [custom metrics](/docs/reference/plugins/plugin-api-reference/#get-metrics).

In order to enable plugins metrics, the following configuration elements must be set in the `falco.yaml`:

```yaml
metrics:
  enabled: true
  ...
  plugins_metrics_enabled: true
  ...
```

Please note that this doesn't provide default metrics about the plugin itself, and it will show metrics only if the plugin is providing them.

_Note that only the container plugin supports plugin metrics at this time._


### Prometheus Support {#prometheus-support}

You can expose Falco metrics to Prometheus to:

- **Visualize Metrics:** Graph and alert on key performance indicators.
- **Integrate with Dashboards:** Seamlessly connect with Grafana or other visualization tools.


To enable Prometheus support, the following configuration elements must be set in the `falco.yaml`:

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

Once configured, the `/metrics` endpoint will be served on the same port as the health endpoint.

## Examples {#examples}

The following sections provide example outputs of Falco metrics in both JSON and Prometheus formats. Click on each section to view detailed examples.

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
    "evt.time": 1748557198960296886,
    "falco.duration_sec": 80,
    "falco.evts_rate_sec": 1846.4,
    "falco.host_boot_ts": 1748555738000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv4.addresses": "192.168.4.221",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:2c07:2831:bc9a:da8e,fe80:0:0:0:37a5:f3c9:ffeb:64df",
    "falco.host_num_cpus": 8,
    "falco.kernel_release": "6.14.6-300.fc42.x86_64",
    "falco.num_evts": 276408,
    "falco.num_evts_prev": 239647,
    "falco.outputs_queue_num_drops": 0,
    "falco.reload_ts": 1748557118882077336,
    "falco.sha256_config_file.falco_yaml": "e17c73f7d4d26fb710883e3968f1d40eb87d56c14adb006334770e95dd0a4a93",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1748557118881742916,
    "falco.version": "0.41.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2025-05-29T22:19:58.960296886Z"
}
```
  
Prometheus

```yaml
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.41.0"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="e17c73f7d4d26fb710883e3968f1d40eb87d56c14adb006334770e95dd0a4a93"} 1
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf",evt_source="syscall"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.14.6-300.fc42.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_reload_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_reload_timestamp_nanoseconds gauge
falcosecurity_falco_reload_timestamp_nanoseconds 1748557118882077336
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1748557118881742916
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 91
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1748555738000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 8
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
    "evt.time": 1748557398341035770,
    "falco.duration_sec": 100,
    "falco.evts_rate_sec": 567.4,
    "falco.host_boot_ts": 1748555738000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv4.addresses": "192.168.4.222",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:2c07:2831:bc9a:da8e,fe80:0:0:0:37a5:f3c9:ffeb:64df",
    "falco.host_num_cpus": 8,
    "falco.kernel_release": "6.14.6-300.fc42.x86_64",
    "falco.num_evts": 277177,
    "falco.num_evts_prev": 265708,
    "falco.outputs_queue_num_drops": 0,
    "falco.reload_ts": 1748557298111008272,
    "falco.rules.Clear_Log_Activities": 0,
    "falco.rules.Contact_K8S_API_Server_From_Container": 0,
    "falco.rules.Create_Hardlink_Over_Sensitive_Files": 0,
    "falco.rules.Create_Symlink_Over_Sensitive_Files": 0,
    "falco.rules.Debugfs_Launched_in_Privileged_Container": 0,
    "falco.rules.Detect_release_agent_File_Container_Escapes": 0,
    "falco.rules.Directory_traversal_monitored_file_read": 9,
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
    "falco.rules.Read_sensitive_file_untrusted": 18,
    "falco.rules.Redirect_STDOUT_STDIN_to_Network_Connection_in_Container": 0,
    "falco.rules.Remove_Bulk_Data_from_Disk": 0,
    "falco.rules.Run_shell_untrusted": 0,
    "falco.rules.Search_Private_Keys_or_Passwords": 0,
    "falco.rules.System_user_interactive": 0,
    "falco.rules.Terminal_shell_in_container": 0,
    "falco.rules.matches_total": 27,
    "falco.sha256_config_file.falco_yaml": "d2df83779b9d4871dc74877a4845ca5cac04ff734f2848b9ad48c07429453abc",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1748557298110180210,
    "falco.version": "0.41.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2025-05-29T22:23:18.341035770Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.41.0"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="d2df83779b9d4871dc74877a4845ca5cac04ff734f2848b9ad48c07429453abc"} 1
# HELP falcosecurity_falco_rules_matches_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_rules_matches_total counter
falcosecurity_falco_rules_matches_total{priority="4",rule_name="Directory traversal monitored file read",source="syscall",tag_T1555="true",tag_container="true",tag_filesystem="true",tag_host="true",tag_maturity_stable="true",tag_mitre_credential_access="true"} 9
# HELP falcosecurity_falco_rules_matches_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_rules_matches_total counter
falcosecurity_falco_rules_matches_total{priority="4",rule_name="Read sensitive file untrusted",source="syscall",tag_T1555="true",tag_container="true",tag_filesystem="true",tag_host="true",tag_maturity_stable="true",tag_mitre_credential_access="true"} 18
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf",evt_source="syscall"} 1
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.14.6-300.fc42.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_reload_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_reload_timestamp_nanoseconds gauge
falcosecurity_falco_reload_timestamp_nanoseconds 1748557298111008272
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1748557298110180210
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 131
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1748555738000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 8
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
    "evt.time": 1748557667114246384,
    "falco.container_memory_used_mb": 0.0, # Memory usage of the Falco process, only relevant for Kubernetes daemonset deployments, similar to container_memory_working_set_bytes
    "falco.cpu_usage_perc": 1.4, # CPU usage (percentage of one CPU) of the Falco process, equivalent to `ps` output
    "falco.duration_sec": 120,
    "falco.evts_rate_sec": 2964.2, # Taken between 2 metrics snapshots
    "falco.host_boot_ts": 1748555738000000000,
    "falco.host_cpu_usage_perc": 10.8, # Overall CPU usage of all running processes on the underlying host (percentage of all CPUs)
    "falco.host_memory_used_mb": 8156.1, # Overall memory usage of all running processes on the underlying host, unit indicated via the suffix
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv4.addresses": "192.168.4.222",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:2c07:2831:bc9a:da8e,fe80:0:0:0:37a5:f3c9:ffeb:64df",
    "falco.host_num_cpus": 8,
    "falco.host_open_fds": 17664,
    "falco.host_procs_running": 1, # `procs_running` value obtained from ${HOST_ROOT}/proc/stat of the underlying host, showing a lower number than currently alive procs
    "falco.kernel_release": "6.14.6-300.fc42.x86_64",
    "falco.memory_pss_mb": 40.8, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.memory_rss_mb": 76.5, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.memory_vsz_mb": 2576.0, # Memory usage of the Falco process, unit indicated via the suffix
    "falco.num_evts": 392949,
    "falco.num_evts_prev": 333483,
    "falco.outputs_queue_num_drops": 0,
    "falco.reload_ts": 1748557546944395042,
    "falco.sha256_config_file.falco_yaml": "99609846d5cd73accb30cceb68b68a31d4e8b13b39a49cc1034477d27fd04e07",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1748557546942952817,
    "falco.version": "0.41.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2025-05-29T22:27:47.114246384Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.41.0"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="99609846d5cd73accb30cceb68b68a31d4e8b13b39a49cc1034477d27fd04e07"} 1
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf",evt_source="syscall"} 1
# HELP falcosecurity_falco_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_cpu_usage_ratio gauge
falcosecurity_falco_cpu_usage_ratio 0.014000
# HELP falcosecurity_falco_memory_rss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_rss_bytes gauge
falcosecurity_falco_memory_rss_bytes 80384000.000000
# HELP falcosecurity_falco_memory_vsz_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_vsz_bytes gauge
falcosecurity_falco_memory_vsz_bytes 2768265216.000000
# HELP falcosecurity_falco_memory_pss_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_memory_pss_bytes gauge
falcosecurity_falco_memory_pss_bytes 42818560.000000
# HELP falcosecurity_falco_container_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_container_memory_used_bytes gauge
falcosecurity_falco_container_memory_used_bytes 0.000000
# HELP falcosecurity_falco_host_cpu_usage_ratio https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_cpu_usage_ratio gauge
falcosecurity_falco_host_cpu_usage_ratio 0.108000
# HELP falcosecurity_falco_host_memory_used_bytes https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_memory_used_bytes gauge
falcosecurity_falco_host_memory_used_bytes 8553668608.000000
# HELP falcosecurity_falco_host_procs_running_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_procs_running_total gauge
falcosecurity_falco_host_procs_running_total 3
# HELP falcosecurity_falco_host_open_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_open_fds_total gauge
falcosecurity_falco_host_open_fds_total 17760
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.14.6-300.fc42.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_reload_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_reload_timestamp_nanoseconds gauge
falcosecurity_falco_reload_timestamp_nanoseconds 1748557546944395042
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1748557546942952817
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 131
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1748555738000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 8
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
    "evt.time": 1748557971055558492,
    "falco.duration_sec": 200,
    "falco.evts_rate_sec": 4102.9,
    "falco.host_boot_ts": 1748555738000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv4.addresses": "192.168.4.222",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:2c07:2831:bc9a:da8e,fe80:0:0:0:37a5:f3c9:ffeb:64df",
    "falco.host_num_cpus": 8,
    "falco.kernel_release": "6.14.6-300.fc42.x86_64",
    "falco.n_added_fds": 41903,
    "falco.n_added_threads": 3611, # Internally, Falco is granular and talks about `threads`, not processes
    "falco.n_cached_fd_lookups": 883674,
    "falco.n_cached_thread_lookups": 943112,
    "falco.n_drops_full_threadtable": 0, # Drops due to a full process cache table, internally called threadtable
    "falco.n_failed_fd_lookups": 394697,
    "falco.n_failed_thread_lookups": 1706,
    "falco.n_fds": 121374, # Number of fds stored in threadtable (current snapshot, not monotonic)
    "falco.n_noncached_fd_lookups": 221210,
    "falco.n_noncached_thread_lookups": 493758,
    "falco.n_removed_fds": 19285,
    "falco.n_removed_threads": 1973,
    "falco.n_retrieve_evts_drops": 5308,
    "falco.n_retrieved_evts": 74289,
    "falco.n_store_evts_drops": 0,
    "falco.n_stored_evts": 101658,
    "falco.n_threads": 1638, # Number of threads stored in threadtable (current snapshot, not monotonic)
    "falco.num_evts": 1386678,
    "falco.num_evts_prev": 1306851,
    "falco.outputs_queue_num_drops": 0,
    "falco.reload_ts": 1748557770999880385,
    "falco.sha256_config_file.falco_yaml": "71d2d93d35b5d56acd798ff4affbb1b0b3b5360f2dec74060f4b3fc9efe9fc0c",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1748557770999696404,
    "falco.version": "0.41.0",
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2025-05-29T22:32:51.055558492Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.41.0"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="71d2d93d35b5d56acd798ff4affbb1b0b3b5360f2dec74060f4b3fc9efe9fc0c"} 1
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf",evt_source="syscall"} 1
# HELP falcosecurity_scap_n_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_threads_total gauge
falcosecurity_scap_n_threads_total 1644
# HELP falcosecurity_scap_n_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_fds_total gauge
falcosecurity_scap_n_fds_total 122195
# HELP falcosecurity_scap_n_noncached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_fd_lookups_total counter
falcosecurity_scap_n_noncached_fd_lookups_total 233257
# HELP falcosecurity_scap_n_cached_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_fd_lookups_total counter
falcosecurity_scap_n_cached_fd_lookups_total 919728
# HELP falcosecurity_scap_n_failed_fd_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_fd_lookups_total counter
falcosecurity_scap_n_failed_fd_lookups_total 418047
# HELP falcosecurity_scap_n_added_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_fds_total counter
falcosecurity_scap_n_added_fds_total 45181
# HELP falcosecurity_scap_n_removed_fds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_fds_total counter
falcosecurity_scap_n_removed_fds_total 21347
# HELP falcosecurity_scap_n_stored_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_stored_evts_total counter
falcosecurity_scap_n_stored_evts_total 109228
# HELP falcosecurity_scap_n_store_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_store_evts_drops_total counter
falcosecurity_scap_n_store_evts_drops_total 0
# HELP falcosecurity_scap_n_retrieved_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieved_evts_total counter
falcosecurity_scap_n_retrieved_evts_total 80999
# HELP falcosecurity_scap_n_retrieve_evts_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_retrieve_evts_drops_total counter
falcosecurity_scap_n_retrieve_evts_drops_total 5705
# HELP falcosecurity_scap_n_noncached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_noncached_thread_lookups_total counter
falcosecurity_scap_n_noncached_thread_lookups_total 511004
# HELP falcosecurity_scap_n_cached_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_cached_thread_lookups_total counter
falcosecurity_scap_n_cached_thread_lookups_total 994381
# HELP falcosecurity_scap_n_failed_thread_lookups_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_failed_thread_lookups_total counter
falcosecurity_scap_n_failed_thread_lookups_total 1849
# HELP falcosecurity_scap_n_added_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_added_threads_total counter
falcosecurity_scap_n_added_threads_total 3775
# HELP falcosecurity_scap_n_removed_threads_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_removed_threads_total counter
falcosecurity_scap_n_removed_threads_total 2131
# HELP falcosecurity_scap_n_drops_full_threadtable_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_full_threadtable_total counter
falcosecurity_scap_n_drops_full_threadtable_total 0
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.14.6-300.fc42.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_reload_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_reload_timestamp_nanoseconds gauge
falcosecurity_falco_reload_timestamp_nanoseconds 1748557770999880385
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1748557770999696404
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 216
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1748555738000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 8
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
    "evt.time": 1748558560280502756,
    "falco.duration_sec": 0,
    "falco.host_boot_ts": 1748555738000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv4.addresses": "192.168.4.222",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:2c07:2831:bc9a:da8e,fe80:0:0:0:37a5:f3c9:ffeb:64df",
    "falco.host_num_cpus": 8,
    "falco.kernel_release": "6.14.6-300.fc42.x86_64",
    "falco.num_evts": 0,
    "falco.num_evts_prev": 0,
    "falco.outputs_queue_num_drops": 0,
    "falco.reload_ts": 1748558559692220062,
    "falco.sha256_config_file.falco_yaml": "7bf23313c8247a8b6522e8a5f49e609bdf50c2e5607826a6b9ff65f08745d87f",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1748558559691326952,
    "falco.version": "0.41.0",
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0, # Taken between 2 metrics snapshots
    "scap.evts_rate_sec": 0.0, # Taken between 2 metrics snapshots
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
    "scap.n_evts": 2,
    "scap.n_evts_prev": 0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2025-05-29T22:42:40.280502756Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.41.0"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="7bf23313c8247a8b6522e8a5f49e609bdf50c2e5607826a6b9ff65f08745d87f"} 1
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf",evt_source="syscall"} 1
# HELP falcosecurity_scap_n_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_total counter
falcosecurity_scap_n_evts_total 17613
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
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.14.6-300.fc42.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_reload_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_reload_timestamp_nanoseconds gauge
falcosecurity_falco_reload_timestamp_nanoseconds 1748558475712822408
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1748558475711424160
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 5
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1748555738000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 8
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
    "evt.time": 1748558754466702647,
    "falco.duration_sec": 20,
    "falco.host_boot_ts": 1748555738000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv4.addresses": "192.168.4.222",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:2c07:2831:bc9a:da8e,fe80:0:0:0:37a5:f3c9:ffeb:64df",
    "falco.host_num_cpus": 8,
    "falco.kernel_release": "6.14.6-300.fc42.x86_64",
    "falco.num_evts": 49536,
    "falco.num_evts_prev": 0,
    "falco.outputs_queue_num_drops": 0,
    "falco.reload_ts": 1748558734323362988,
    "falco.sha256_config_file.falco_yaml": "6e03f0e80239b757c0a2327062c7b5a3d0cc6b7b5ced8fc55ae6dd127623e0e1",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1748558734322045370,
    "falco.version": "0.41.0",
    "scap.engine_name": "bpf",
    "scap.evts_drop_rate_sec": 0.0,
    "scap.evts_rate_sec": 2548.6,
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
    "scap.n_drops_cpu_2": 0,
    "scap.n_drops_cpu_3": 0,
    "scap.n_drops_cpu_4": 0,
    "scap.n_drops_cpu_5": 0,
    "scap.n_drops_cpu_6": 0,
    "scap.n_drops_cpu_7": 0,
    "scap.n_drops_page_faults": 0,
    "scap.n_drops_perc": 0,
    "scap.n_drops_prev": 0,
    "scap.n_drops_scratch_map": 0,
    "scap.n_evts": 49761,
    "scap.n_evts_cpu_0": 7667,
    "scap.n_evts_cpu_1": 6219,
    "scap.n_evts_cpu_2": 7258,
    "scap.n_evts_cpu_3": 5667,
    "scap.n_evts_cpu_4": 10348,
    "scap.n_evts_cpu_5": 6478,
    "scap.n_evts_cpu_6": 3925,
    "scap.n_evts_cpu_7": 2199,
    "scap.n_evts_prev": 2
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2025-05-29T22:45:54.466702647Z"
}

```

Prometheus

```yaml
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.41.0"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="6e03f0e80239b757c0a2327062c7b5a3d0cc6b7b5ced8fc55ae6dd127623e0e1"} 1
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf",evt_source="syscall"} 1
# HELP falcosecurity_scap_n_evts_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_total counter
falcosecurity_scap_n_evts_total 145680
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
falcosecurity_scap_n_evts_cpu_total{cpu="0"} 22673
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="0"} 37
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="1"} 28454
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="1"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="2"} 0
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="2"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="3"} 0
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="3"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="4"} 0
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="4"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="5"} 0
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="5"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="6"} 0
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="6"} 0
# HELP falcosecurity_scap_n_evts_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_evts_cpu_total counter
falcosecurity_scap_n_evts_cpu_total{cpu="7"} 0
# HELP falcosecurity_scap_n_drops_cpu_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_n_drops_cpu_total counter
falcosecurity_scap_n_drops_cpu_total{cpu="7"} 0
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.14.6-300.fc42.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_reload_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_reload_timestamp_nanoseconds gauge
falcosecurity_falco_reload_timestamp_nanoseconds 1748558734323362988
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1748558734322045370
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 33
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1748555738000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 8
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
    "evt.time": 1748559260010429172,
    "falco.duration_sec": 160,
    "falco.evts_rate_sec": 19097.2,
    "falco.host_boot_ts": 1748555738000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv4.addresses": "192.168.4.222",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:2c07:2831:bc9a:da8e,fe80:0:0:0:37a5:f3c9:ffeb:64df",
    "falco.host_num_cpus": 8,
    "falco.kernel_release": "6.14.6-300.fc42.x86_64",
    "falco.num_evts": 1901309,
    "falco.num_evts_prev": 1519365,
    "falco.outputs_queue_num_drops": 0,
    "falco.reload_ts": 1748559099987386014,
    "falco.sha256_config_file.falco_yaml": "0632e93f4858878af24d0d442bd06c7d0f6311d0317fb9ebc20ec6c512395cc3",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1748559099986267926,
    "falco.version": "0.41.0",
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
  "time": "2025-05-29T22:54:20.010429172Z"
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
    "falco.reload_ts": 1748559099987386014,
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
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.41.0"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="0632e93f4858878af24d0d442bd06c7d0f6311d0317fb9ebc20ec6c512395cc3"} 1
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf",evt_source="syscall"} 1
# HELP falcosecurity_scap_sys_enter_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_cnt_total counter
falcosecurity_scap_sys_enter_run_cnt_total 1575528
# HELP falcosecurity_scap_sys_enter_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_run_time_nanoseconds_total counter
falcosecurity_scap_sys_enter_run_time_nanoseconds_total 447505622
# HELP falcosecurity_scap_sys_enter_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_enter_avg_time_nanoseconds gauge
falcosecurity_scap_sys_enter_avg_time_nanoseconds 284
# HELP falcosecurity_scap_sys_exit_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_cnt_total counter
falcosecurity_scap_sys_exit_run_cnt_total 1576385
# HELP falcosecurity_scap_sys_exit_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_run_time_nanoseconds_total counter
falcosecurity_scap_sys_exit_run_time_nanoseconds_total 483095222
# HELP falcosecurity_scap_sys_exit_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sys_exit_avg_time_nanoseconds gauge
falcosecurity_scap_sys_exit_avg_time_nanoseconds 306
# HELP falcosecurity_scap_sched_process_e_run_cnt_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_cnt_total counter
falcosecurity_scap_sched_process_e_run_cnt_total 995
# HELP falcosecurity_scap_sched_process_e_run_time_nanoseconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_run_time_nanoseconds_total counter
falcosecurity_scap_sched_process_e_run_time_nanoseconds_total 2055411
# HELP falcosecurity_scap_sched_process_e_avg_time_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_sched_process_e_avg_time_nanoseconds gauge
falcosecurity_scap_sched_process_e_avg_time_nanoseconds 2065
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
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.14.6-300.fc42.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_reload_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_reload_timestamp_nanoseconds gauge
falcosecurity_falco_reload_timestamp_nanoseconds 1748559099987386014
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1748559099986267926
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 96
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1748555738000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 8
```

</details>


<details>
  <summary> Show Base / Wrapper Fields + Plugin Metrics
  
  `plugins_metrics_enabled: true`
  </summary>


`json`

```yaml
{
  "hostname": "test",
  "output": "Falco metrics snapshot",
  "output_fields": {
    "evt.hostname": "test",
    "evt.source": "syscall",
    "evt.time": 1748559579193502203,
    "falco.duration_sec": 60,
    "falco.evts_rate_sec": 7425.3,
    "falco.host_boot_ts": 1748555738000000000,
    "falco.host_netinfo.interfaces.docker0.protocols.ipv4.addresses": "172.17.0.1",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv4.addresses": "192.168.4.222",
    "falco.host_netinfo.interfaces.wlo1.protocols.ipv6.addresses": "fd7e:da33:f3a2:1:2c07:2831:bc9a:da8e,fe80:0:0:0:37a5:f3c9:ffeb:64df",
    "falco.host_num_cpus": 8,
    "falco.kernel_release": "6.14.6-300.fc42.x86_64",
    "falco.num_evts": 306864,
    "falco.num_evts_prev": 158584,
    "falco.outputs_queue_num_drops": 0,
    "falco.reload_ts": 1748559519169221738,
    "falco.sha256_config_file.falco_yaml": "205f2ad7789b9740dca59f9e02bbc8293146843bf46ae547b4cc3e335a462088",
    "falco.sha256_rules_file.falco_rules_yaml": "58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4",
    "falco.start_ts": 1748559519168791232,
    "falco.version": "0.41.0",
    "plugins.container.n_containers": 16,
    "plugins.container.n_missing_container_images": 0,
    "scap.engine_name": "bpf",
    "scap.n_drops_perc": 0.0
  },
  "priority": "Informational",
  "rule": "Falco internal: metrics snapshot",
  "source": "internal",
  "time": "2025-05-29T22:59:39.193502203Z"
}
```

Prometheus

```yaml
# HELP falcosecurity_falco_version_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_version_info gauge
falcosecurity_falco_version_info{version="0.41.0"} 1
# HELP falcosecurity_falco_sha256_rules_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_rules_files_info gauge
falcosecurity_falco_sha256_rules_files_info{file_name="falco_rules.yaml",sha256="58a4f187b6b04b43ae938132325cbbb6b2bb9eb4e76e553f5b4b7b5b360ee0b4"} 1
# HELP falcosecurity_falco_sha256_config_files_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_sha256_config_files_info gauge
falcosecurity_falco_sha256_config_files_info{file_name="falco.yaml",sha256="205f2ad7789b9740dca59f9e02bbc8293146843bf46ae547b4cc3e335a462088"} 1
# HELP falcosecurity_scap_engine_name_info https://falco.org/docs/metrics/
# TYPE falcosecurity_scap_engine_name_info gauge
falcosecurity_scap_engine_name_info{engine_name="bpf",evt_source="syscall"} 1
# HELP falcosecurity_plugins_container_n_containers_total https://falco.org/docs/metrics/
# TYPE falcosecurity_plugins_container_n_containers_total counter
falcosecurity_plugins_container_n_containers_total 16
# HELP falcosecurity_plugins_container_n_missing_container_images_total https://falco.org/docs/metrics/
# TYPE falcosecurity_plugins_container_n_missing_container_images_total counter
falcosecurity_plugins_container_n_missing_container_images_total 0
# HELP falcosecurity_falco_kernel_release_info https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_kernel_release_info gauge
falcosecurity_falco_kernel_release_info{kernel_release="6.14.6-300.fc42.x86_64"} 1
# HELP falcosecurity_evt_hostname_info https://falco.org/docs/metrics/
# TYPE falcosecurity_evt_hostname_info gauge
falcosecurity_evt_hostname_info{hostname="test"} 1
# HELP falcosecurity_falco_outputs_queue_num_drops_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_outputs_queue_num_drops_total counter
falcosecurity_falco_outputs_queue_num_drops_total 0
# HELP falcosecurity_falco_reload_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_reload_timestamp_nanoseconds gauge
falcosecurity_falco_reload_timestamp_nanoseconds 1748559681094292165
# HELP falcosecurity_falco_start_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_start_timestamp_nanoseconds gauge
falcosecurity_falco_start_timestamp_nanoseconds 1748559681093675649
# HELP falcosecurity_falco_duration_seconds_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_duration_seconds_total counter
falcosecurity_falco_duration_seconds_total 2
# HELP falcosecurity_falco_host_boot_timestamp_nanoseconds https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_boot_timestamp_nanoseconds gauge
falcosecurity_falco_host_boot_timestamp_nanoseconds 1748555738000000000
# HELP falcosecurity_falco_host_num_cpus_total https://falco.org/docs/metrics/
# TYPE falcosecurity_falco_host_num_cpus_total gauge
falcosecurity_falco_host_num_cpus_total 8
```
  
</details>

