---
title: Performance
description: Adopt best practices for monitoring performance in production
linktitle: Performance
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

The Falco Project provides native support for measuring resource utilization and statistics, including event drop counters, kernel tracepoint invocation counters, timeouts, and internal state handling. More detailed information is given in the [Falco Metrics](../falco-metrics/) Guide.

### CPU and Memory Utilization

On top of the mind for SREs or system admins is how much CPU and memory Falco will utilize on their hosts. They need to assess whether the cost is justified. To maintain excellent relationships with infrastructure teams, setting resource limits for your Falco deployment is crucial. This can be done through systemd or [daemonset](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) limits in a Kubernetes environment. 

This is an essential consideration because running a kernel tool always comes with specific challenges and considerations. For example, it could slow down the kernel or the request rates of applications.

Top metrics:

- CPU usage: Typically measured as a percentage of one CPU, it can be compared with the number of available CPUs on the host. Falco's hot path is single-threaded, so it should not be able to exceed the capacity of one full CPU. 
- Memory RSS: Resident Set Size is the portion of memory held in RAM by a process.
- Memory VSZ: Virtual Memory Size is the total memory allocated to a process, including both RAM and swap space.
- [container_memory_working_set_bytes](https://mohamedmsaeed.medium.com/memory-working-set-vs-memory-rss-in-kubernetes-which-one-you-should-monitor-8ef77bf0acee) in Kubernetes settings: This is almost equivalent to the cgroups container `memory_used` metric natively exposed in Falco metrics.

Beyond monitoring the tool's utilization, check if your applications perform as before. This evaluation could include overall network, I/O, or general contention metrics.

Read [Falco Metrics](../falco-metrics/) next.

### Server Load and Falco Event Drops

A common misconception is to think that Falco has constant resource utilization. However, that is not accurate. Falco's utilization is directly dependent on the current workload on the host. The more system calls the applications make, the more work Falco has to handle. You can read our [Kernel Testing Framework Proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20230530-driver-kernel-testing-framework.md#why-does-kernel-testing-matter) for more insights into this topic.

Read [Help, Falco Is Dropping Syscalls Events!](/docs/help/dropping/) next.

Top metrics:

- Kernel side and userspace event counts.
- Kernel side and userspace event drop counts.
- Kernel tracepoint invocation counts to deduce the overall server load.
- Userspace timeouts.
- Falco internal state counters.
