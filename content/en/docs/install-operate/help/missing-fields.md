---
title: Help, Missing Fields in Falco Logs!
description: Follow this guide to identify issues or misconfigurations that may be causing missing fields in Falco rules outputs
weight: 30
---

## Action Items (TL;DR)

- Read [Install and Operate](../../../install-operate/) Guides and review [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml) for necessary preconditions.
- Refer to the relevant debugging guide based on suspected missing fields.
- Acknowledge that certain missing fields or data in Falco are legitimate.

## Background

Many of the [Supported Output Fields](../../../reference/rules/supported-fields/) are derived from multiple events and mechanisms. To provide a more concrete explanation, for each spawned process, Falco extracts and derives fields from the `clone*/*fork/execve*` syscalls. Falco generates a struct in userspace, stores the relevant information within this struct, and then adds it to the process cache table in memory. If a process makes additional system calls during its lifetime, such as opening a file, in a Falco rule, you typically also export process fields — assuming we haven't missed the spawned process event and the information is available. These details extend to various use cases, and, in essence, dropped events can lead to missing fields as well as race conditions.

As a result, Falco logs can never be perfect, and null values can occur. We are constantly aiming to improve the robustness in this regard. We encourage you to [contribute](/docs/contribute/) to the project if you encounter such cases or have improvement ideas. Also be aware that, unfortunately, missing fields can have different natures. Sometimes the field may be an empty string, or the string `<NA>`, or, if numeric, the default numeric value. These inconsistencies may be more difficult to address, as many Falco rules rely on legacy declarations.

Furthermore, sometimes Linux may not operate exactly as expected. One concrete example is that shell built-ins like `echo` do not cause a new spawned process, and the `echo` command does not get logged with Falco. Similarly, if a base64 encoded string gets interpreted during decoding, you do not have the original base64 blob in the command args unless the command was passed with the `sh -c` flag. Lastly, some fields only work for certain kernel versions or system configs (e.g. [proc.is_exe_upper_layer](https://falco.org/docs/reference/rules/supported-fields/#field-class-process) requires a container overlayfs).

## Missing Container Images

Check the basics:

- Is the container runtime socket correctly mounted? For Kubernetes, mount with the `HOST_ROOT` prefix: `/host/run/k3s/containerd/containerd.sock`. See [deploy-kubernetes](https://github.com/falcosecurity/deploy-kubernetes/tree/main/kubernetes) example template.
- Is a custom path specified for the container runtime socket in Kubernetes? If yes, use the `--cri` command line option when running Falco. The default paths include: `/run/containerd/containerd.sock`, `/run/k3s/containerd/containerd.sock`, `/run/crio/crio.sock`.
- To expedite lookups, attempt to disable asynchronous CRI API calls by using the `--disable-cri-async` command line option when running Falco.
- If you run the upstream Falco rules containing the `%container.info` placeholder output field, run Falco with the `-pc` or `-pk` command line option to automatically include and resolve crucial container and Kubernetes-related output fields. For additional details, consult the [Outputs Formatting](../../../outputs/formatting/) Guide, and consider adding more [Supported Output Fields](../../../reference/rules/supported-fields/#field-class-container).
- Falco monitors both host and container processes. If the `container.id` is set to `host`, it indicates that the process is running on the host, and therefore, no container image is associated with it.

{{% pageinfo color=info %}}
The `k8s.*` fields are extracted from the container runtime socket simultaneously as we look up the `container.*` fields from the CRI API calls responses.
{{% /pageinfo %}}

Carefully read the field description documentation:

- [Supported Output Fields `container.*`](../../../reference/rules/supported-fields/#field-class-container)   
- [Supported Output Fields `k8s.*`](../../../reference/rules/supported-fields/#field-class-k8s)

The container info enrichment, while robust, depends on the speed of making API requests against the container runtime socket.

Falco's [metrics](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config ([Falco Internal Metrics System](../../production-performance/#falco-internal-metrics-system)) provides a range of useful metrics related to software functioning, now also featuring metrics around Falco's internal state:

- `state_counters_enabled: true`

Here is an example metrics log snippet highlighting the fields crucial for this analysis.

```yaml
{
  "output_fields": {
    "evt.source": "syscall",
    "falco.n_containers": 50,
    "falco.n_missing_container_images": 0, 
  },
  "rule": "Falco internal: metrics snapshot"
}
```

`falco.n_containers` indicates how many containers are running at a given time, typically less than 100-300 at maximum. `falco.n_missing_container_images` is an updated snapshot of how many containers are internally stored in Falco without a container image at any given time.

To complicate matters, some processes in Kubernetes run in the pod sandbox container, which has no container image in the API responses. In such cases, the `container.id` is the same as the `k8s.pod.sandbox_id`. If the container image is consistently missing throughout the lifetime of the container, it's likely a process in a pod sandbox container in the majority of the cases. However, sandbox containers likely constitute less than 1% of the distinct containers in your overall Falco logs. Note that this comparison will be fully supported by Falco 0.38 and is a work in progress. 

Additionally, the improvement of the overall efficiency of the container engine, especially for the `--disable-cri-async` option, is also a work in progress. A more performant implementation is expected to be available by Falco 0.38. This improvement aims to address missing images observed by adopters and resolve most cases, leaving only some edge cases of race conditions where the lookup hasn't happened yet.

## Missing User Names

- Ensure proper mounts (e.g., `/etc:/host/etc`) when running Falco as a daemonset in Kubernetes, for example.
- If you expect Falco to be aware of Kubernetes Control Plane users, especially when execing into a pod (`kubectl exec`), we must disappoint you. The Linux kernel lacks knowledge of the control plane. However, we are actively exploring ways to support this. Refer to this [issue](https://github.com/falcosecurity/falco/issues/2895) for more details.

## Missing Process Tree Fields

Let's consider another example: the fields related to the process tree lineage (e.g. `proc.aname*`). 

- Falco adds processes to a cache in userspace when a new process starts and removes them when the process exits. The goal is to maintain a current view of running processes on the Linux host at any time. However, this also means that there are cases where the parent legitimately exits, re-parenting occurs, and/or PIDs get replaced or re-used. 
- As a result, missing processes in the process ancestry (process tree) may be due to dropped or missed events, failure to store the event, or the process exiting without proper tracking of re-parenting or orphan process cases by Falco. 
- Furthermore, a history of all `spawned_process` events is not equivalent to the current process tree on the system. Check out the Falco [rules](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml) macro `container_entrypoint` for one such example and explore this [resource](https://www.win.tue.nl/~aeb/linux/lk/lk-10.html).
- In summary, Falco aims to closely preserve the true system state, similar to the Linux kernel itself.

Falco's [metrics](https://github.com/falcosecurity/falco/blob/master/falco.yaml) config ([Falco Internal Metrics System](../../production-performance/#falco-internal-metrics-system)) provides a range of useful metrics related to software functioning, now also featuring metrics around Falco's internal state:

- `state_counters_enabled: true`

Here is an example metrics log snippet highlighting the fields crucial for this analysis.

```yaml
{
  "output_fields": {
    "evt.source": "syscall",
    "falco.n_drops_full_threadtable": 0,
    "falco.n_store_evts_drops": 0,
    "falco.n_failed_fd_lookups": 0,
    "falco.n_failed_thread_lookups": 0,
    "falco.n_retrieve_evts_drops": 0 
  },
  "rule": "Falco internal: metrics snapshot"
}
```

`falco.n_drops_full_threadtable` and `falco.n_store_evts_drops` reflect similar occurrences. They are monotonic counters indicating how often a spawned process event was dropped due to a full table (configurable by Falco 0.38 with a higher default value) and how frequently store actions to update the process structs in memory failed and were subsequently dropped. On the flip side, there are also counters keeping track of failed lookup or retrieve actions. Internally, Falco is granular and talks about `threads`, not processes.

### References and Community Discussions

- [[TRACKING] Re-audit container engines for empty container info values (Initial focus on CRI for Kubernetes)](https://github.com/falcosecurity/falco/issues/2708)
- [[PROPOSAL] Inject Kubernetes Control Plane users into Falco syscalls logs for kubectl exec activities](https://github.com/falcosecurity/falco/issues/2895)
