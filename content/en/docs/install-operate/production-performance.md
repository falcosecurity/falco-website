---
title: Falco Performance in Production 
description: Adopt best practices when checking Falco performance in production
linktitle: Falco Performance in Production
weight: 45
---

If something seriously goes wrong during Falco deployment, it's usually noticeable immediately. On a longer time scale, continuous performance monitoring and quality assurance, driven by the right metrics, ensure Falco functions as expected 24/7.

As a security tool, Falco requires checking for a healthy deployment on multiple dimensions:

- Resource Utilization and System Impact: Aim to achieve the lowest possible compute overhead while ensuring the appropriate monitoring scope.
- Disruption / Upgrades: Ensure minimal downtime and avoid interruptions to the service, minimizing restarts.
- Data Quality Assurance: Verify that Falco outputs contain the desired quality with little to no missing data.
- End-to-end testing of data pipeline: Ensure alerts reach their end destination as quickly as possible.
- Security Monitoring Capabilities: Adopting the right Falco rules and resilience to bypasses by attackers.

The Falco Project provides guidance on some of these aspects, and there are ongoing long-term efforts, including a [partnership](https://github.com/falcosecurity/falco/issues/2435) with the CNCF TAG Environmental Sustainability, aimed at enhancing Falco's performance and assessing its impact on the system. These efforts are intended to make it easier for adopters to assess the actual impact on their systems, enabling them to make informed decisions about the cost-security monitoring tradeoffs.

Other aspects, such as data quality assurance and security monitoring capabilities, are continually improved upon, and with each Falco release, Falco becomes better and more efficient.

## Resource Utilization and System Impact

The Falco Project offers native support for measuring resource utilization and general statistics, such as event drop counters, kernel tracepoint invocation counters  or timeouts. To explore this functionality, refer to the [configuration](https://github.com/falcosecurity/falco/blob/master/falco.yaml) file and read the sections related to advanced Falco logging, alerting, and metrics, specifically focusing on software functioning (e.g. `metrics`).

### CPU and Memory Utilization

On top of the mind for SREs or system admins is how much CPU and memory Falco will utilize on their hosts. They need to assess whether the cost is justified.

As a result, closely inspecting these metrics is of paramount importance. To maintain excellent relationships with infrastructure teams, it's also crucial to set resource limits for your Falco deployment. This can be done through systemd limits or [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) limits in a Kubernetes environment. By setting limits, you ensure that, at worst, the tool may experience resource constraints, but it will not impact the system beyond the agreed-upon upper limits.

This is an essential consideration as running a kernel tool always comes with specific challenges and considerations. Read our kernel testing framework [proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20230530-driver-kernel-testing-framework.md#why-does-kernel-testing-matter).

Top metrics:

- CPU usage: Typically measured as a percentage of one CPU, it can be compared with the number of available CPUs on the host. Falco's hot path is single-threaded, so it should not be able to exceed the capacity of one full CPU. 
- Memory RSS: Resident Set Size, which is the portion of memory held in RAM by a process.
- Memory VSZ: Virtual Memory Size, which is the total memory allocated to a process, including both RAM and swap space.
- [container_memory_working_set_bytes](https://mohamedmsaeed.medium.com/memory-working-set-vs-memory-rss-in-kubernetes-which-one-you-should-monitor-8ef77bf0acee) in Kubernetes settings: This is almost equivalent to the cgroups container `memory_used` metric natively exposed in Falco metrics.

Beyond monitoring the tool's utilization, check if your applications perform as before. This evaluation could include overall network, I/O, or general contention metrics.

### Server Load and Falco Event Drops

A common misconception is to think that Falco has constant resource utilization. However, this is not true. Falco's utilization is directly dependent on the current workload on the host. The more system calls the applications are making, the more work Falco has to handle. For more insights into this topic, you can read our kernel testing framework [proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20230530-driver-kernel-testing-framework.md#why-does-kernel-testing-matter).

You can take actions to improve various aspects, notably reducing event drops. Some of these actions include increasing the kernel buffer size (although it comes with a higher memory cost) and tuning your Falco rules to minimize filtercheck matching operations while controlling the output volume. The key lies in being deliberate about what you monitor, taking into account your specific constraints. This approach may involve implementing enhanced monitoring in certain environments and adopting more targeted monitoring in challenging ones. For more in-depth insights, we recommend reading the [Adaptive Syscalls Selection in Falco](https://falco.org/blog/adaptive-syscalls-selection/) blog post. You can also experiment with the mentioned [configuration](https://github.com/falcosecurity/falco/blob/master/falco.yaml) options available to closely control Falco's performance and resource utilization. 

Top metrics:

- Kernel side and userspace event drops
- Kernel tracepoint invocation counts to deduce overall server load
- Userspace timeouts

## Data Quality Assurance

Furthermore, many of the [output fields](/docs/rules/style-guide/#output-fields) from the [supported output fields](/docs/reference/rules/supported-fields/) are derived from multiple events and mechanisms. As a result, they can never be perfect, and null values can occur. We are constantly aiming to improve the robustness in this regard. If you encounter such cases or have improvement ideas, we encourage you to [contribute](/docs/contribute/) to the project. 

For example, the container info enrichment, while robust, depends on the speed of making API requests against the container runtime socket before the event is directed to the output channel.

Let's consider another example, that is, the fields related to the process tree lineage (e.g. `proc.aname*`). Falco adds processes to a cache in userspace when a new process starts and removes them when the process exits. The goal is to maintain a current view of running processes on the Linux host at any given time. However, this also means that there are cases where the parent legitimately exits, re-parenting occurs, and/or PIDs get replaced or re-used. Therefore, a history of all `spawned_process` events is not equivalent to the current process tree on the system. Check out the Falco [rules](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml) macro `container_entrypoint` for one such example. By the way, here is a resource to learn more about [process hierarchies](https://www.win.tue.nl/~aeb/linux/lk/lk-10.html). In summary, Falco aims to closely preserve the true system state, similar to the Linux kernel itself.

## Security Monitoring Capabilities

Regarding Security Monitoring Capabilities, we offer a dedicated [Adoption of Falco Rules in Production](/docs/rules/adoption-rules/) guide to help you maximize the potential of Falco, which is ultimately driven by its rules.
