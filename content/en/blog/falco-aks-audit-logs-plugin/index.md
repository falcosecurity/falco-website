---
title: Falco plugin for collecting AKS audit logs
date: 2025-03-09
author: Igor Eulalio
slug: falco-aks-audit-logs-plugin
tags: ["Falco","Kubernetes", "Plugin", "Azure", "AKS", "auditlogs"]
---

Troubleshooting Kubernetes events is challenging due to the multitude of data sources involved: container logs, Kubernetes events, cloud logs, and more. Among these sources, Kubernetes audit logs are especially valuable for identifying threats, as every action passing through the Kubernetes API server is recorded there.

We already provide plugins that let you parse and use Falco to detect threats in audit logs from GKE and EKS clusters. With our latest plugin, you'll now have the same powerful threat detection capabilities for your Azure AKS clusters.

## What is Falco?

Falco is a Cloud Native Computing Foundation project that provides runtime threat detection. Out of the box, Falco examines syscalls to alert you to any suspicious activity. And, since containers share the same kernel as their host, Falco can monitor not only activity on the host but also activity on all of the containers running on that host. Moreover, Falco pulls data from both Kubernetes and the container runtime to add additional context to its alerts. 

With Falco running on your GKE clusters you can be notified of a wide variety of events, such as: 

* Did someone start a container with high privileges?
* Has someone shelled into a running container?
* Has an executable been added to the container after it was deployed?

These are just a few examples. Falco has over 80 rules that can be used to make you aware of not only external threats but also when clusters aren't being operated in accordance with industry best practices. 

## What is the AKS audit logs plugin?

The AKS audit logs plugin extends Falco's capabilities to Microsoft Azure Kubernetes Service (AKS) clusters, providing you with the same security insights and threat detection Falco already offers for GKE and EKS environments. With this plugin, you can seamlessly integrate AKS audit logs into Falco's event processing pipeline, enabling it to identify anomalies, suspicious activities, and policy violations within your AKS-based workloads.

## Using AKS audit logs plugin

In order to use the AKS audit log plugin, you must first configure your AKS cluster to ship the logs where we can fetch them.

The current supported output source is Event hub, so when following the [guide](https://learn.microsoft.com/en-us/azure/aks/monitor-aks#aks-control-planeresource-logs) to configure your AKS audit logs, you must have Eventhub enabled. You can also optionally send it to other sources:
![aks-audit-logs](/blog/falco-aks-audit-logs-plugin/falco-aks-audit-logs-plugin1.png)

Once you have the stream enabled, you must create or reuse a storage account blob container so that the plugin can track the last event that was consumed, which is done trough checkpoints.

## Configuring Falco to use AKS audit logs plugin

First, using [falcoctl](https://github.com/falcosecurity/falcoctl), download the plugin: 
```yaml
sudo falcoctl artifact install k8saudit-aks
```

In your falco.yaml file, you must add the plugin configuration and later enable the plugin
```yaml
config_files:
  - /etc/falco/config.d

watch_config_files: true

plugins:
#  - name: k8saudit
#    library_path: libk8saudit.so
#    init_config: ""
#    open_params: "http://:9765/k8s-audit"
#  - name: json
#    library_path: libjson.so
 - name: k8saudit-aks
   library_path: libk8saudit-aks.so
   init_config:
     event_hub_name: ${EVENTHUB_NAME}
     blob_storage_container_name: ${BLOB_STORAGE_CONTAINER_NAME}
     event_hub_namespace_connection_string: ${EVENTHUB_NAMESPACE_CONNECTION_STRING}
     blob_storage_connection_string: ${BLOB_STORAGE_CONNECTION_STRING}

load_plugins: [k8saudit-aks]

stdout_output:
  enabled: true
```

Once they are exported, run Falco and after some seconds you'll logs informing the k8saudit-aks plugin was loaded:
```bash
falco -c /etc/falco/falco.yaml -r /etc/falco/falco_rules.yaml
``` 
```t
Tue Dec 17 18:02:07 2024: Opening 'k8s_audit' source with plugin 'k8saudit-aks'
2024/12/17 21:02:07 [k8saudit-aks] opened connection to blob storage
2024/12/17 21:02:07 [k8saudit-aks] opened blob checkpoint connection
2024/12/17 21:02:07 [k8saudit-aks] opened consumer client
2024/12/17 21:02:07 [k8saudit-aks] created eventhub processor
```

## Testing out!

Append rule to **falco_rules.yaml** file:
```yaml
- rule: K8s Audit Event Detected
  desc: A test rule that detects any Kubernetes audit event
  condition: ka.req exists
  output: "K8s Audit Event Detected: %ka.req"
  priority: DEBUG
  source: k8s_audit
  tags: [testing, k8s_audit]
```

```bash
$ falco -c /etc/falco/falco.yaml -r /etc/falco/falco_rules.yaml
```

Then, you should see initialization message, followed by some events from your AKS cluster. Since we have debug enabled, you should see some events from the aksService:
```
Thu Dec 19 11:44:55 2024: Falco version: 0.39.2 (aarch64)
Thu Dec 19 11:44:55 2024: Falco initialized with configuration files:
Thu Dec 19 11:44:55 2024:    /etc/falco/config.d/engine-kind-falcoctl.yaml | schema validation: ok
Thu Dec 19 11:44:55 2024:    /etc/falco/falco.yaml | schema validation: ok
Thu Dec 19 11:44:55 2024: System info: Linux version 6.8.0-51-generic (buildd@bos03-arm64-031) (aarch64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #52-Ubuntu SMP PREEMPT_DYNAMIC Thu Dec  5 13:32:09 UTC 2024
Thu Dec 19 11:44:55 2024: Loading plugin 'k8saudit-aks' from file /usr/share/falco/plugins/libk8saudit-aks.so
Thu Dec 19 11:44:55 2024: Loading plugin 'json' from file /usr/share/falco/plugins/libjson.so
Thu Dec 19 11:44:55 2024: Loading rules from:
Thu Dec 19 11:44:55 2024:    /etc/falco/falco_rules.yaml | schema validation: ok
Thu Dec 19 11:44:55 2024:    /etc/falco/falco_rules.local.yaml | schema validation: none
Thu Dec 19 11:44:55 2024:    /etc/falco/falco_aks_audit.yaml | schema validation: ok
Thu Dec 19 11:44:55 2024: The chosen syscall buffer dimension is: 8388608 bytes (8 MBs)
Thu Dec 19 11:44:55 2024: Starting health webserver with threadiness 4, listening on 0.0.0.0:8765
Thu Dec 19 11:44:55 2024: Loaded event sources: syscall, k8s_audit
Thu Dec 19 11:44:55 2024: Enabled event sources: k8s_audit, syscall
Thu Dec 19 11:44:55 2024: Opening 'k8s_audit' source with plugin 'k8saudit-aks'
2024/12/19 14:44:55 [k8saudit-aks] opened connection to blob storage
2024/12/19 14:44:55 [k8saudit-aks] opened blob checkpoint connection
2024/12/19 14:44:55 [k8saudit-aks] opened consumer client
2024/12/19 14:44:55 [k8saudit-aks] created eventhub processor
Thu Dec 19 11:44:55 2024: Opening 'syscall' source with modern BPF probe.
Thu Dec 19 11:44:55 2024: One ring buffer every '2' CPUs.
```

```yaml
10:52:03.348668000: Debug K8s Audit Event Detected: verb=create, user=aksService, groups=(system:masters,system:authenticated), target=<NA>
```

## Let's meet!

As always, we meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

 - Join the #falco channel on the [Kubernetes Slack](https://slack.k8s.io)
 - [Join the Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)


Enjoy 😎,

_Igor_