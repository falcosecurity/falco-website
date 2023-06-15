---
title: Modern eBPF probe is ready to shine
linktitle: Modern eBPF probe is ready to shine
description: Discover the modern BPF world with Falco
date: 2023-06-14
author: Andrea Terzolo, Vicente J. Jiménez Miras
slug: falco-modern-bpf-0-35-0
images:
  - /blog/falco-modern-bpf-0-35-0/images/falco-modern-bpf-featured.png
tags: ["eBPF"]
---

Introducing the brand-new eBPF probe: a game-changing addition to Falco's toolkit. Curious to learn more? Dive into our [first blog post](https://falco.org/blog/falco-modern-bpf/) where we spill the beans on its exciting features, what you need to get started, and real-world use cases.

Initially a Falco 0.34.0 experimental feature, we've put in months of hard work to refine it for production use. The wait is finally over! Falco 0.35.0 now ships with the modern probe as an official driver, alongside the trusted Kernel module and current eBPF probe. Falco is now more prepared than ever to scale with your infrastructure.

## Supported Syscalls

In our driver history, we've supported syscalls in two possible ways:

1. Fully instrumented 🟢
2. Generically instrumented 🟡

**Fully instrumented** means that Falco notifies when a syscall is invoked in the system and enables the user to examine its parameters. You can find the list of available parameters for each syscall on <https://falco.org/docs/reference/rules/supported-events/>.

**Generically instrumented** means that Falco notifies when a syscall is invoked in the system, but nothing more.

Excitingly, in the latest Falco 0.35.0 version, the modern probe extends its support to reach syscall parity with the other drivers. [This report](https://github.com/falcosecurity/libs/blob/master/driver/report.md) outlines the current instrumentation state.

## Advanced support checks

Before Falco 0.35.0, the modern probe was restricted to running exclusively on machines with kernel versions >= 5.8. This limitation posed challenges for certain users, prompting us to implement a more intelligent support detection mechanism. Leveraging the capabilities of the `libbpf` library, we can now search for specific features within the target system, precisely addressing our needs.

To elaborate further, we currently search for two crucial features that are essential for running the modern probe:

- BPF Ring Buffer
- BTF Tracing Programs

![Required features to run the modern eBPF probe](/blog/falco-modern-bpf-0-35-0/images/falco-modern-bpf-01.png)

For a more in-depth understanding of these two concepts, we invite you to explore the [previous blog](https://falco.org/blog/falco-modern-bpf/#what-s-new) discussing the modern eBPF driver.

Now, let's delve into the potential errors that you may encounter if any of these features are missing.

- If the BPF ring buffer is not available, Falco will present you with an error message similar to:

    ```plain
    ring buffer map type is not supported
    ```

- If BTF tracing programs are absent, the error message you can expect to encounter would be along the lines of:

    ```plain
    tracing program type is not supported
    ```

## Buffers allocation

Every Falco driver utilizes shared buffers to facilitate the transmission of security events between the kernel and the userspace. To be more specific, there is an individual buffer allocated for each online CPU, ensuring efficient handling of events.

![Buffers allocation using the current eBPF probe](/blog/falco-modern-bpf-0-35-0/images/falco-modern-bpf-02.png)

We have always followed this particular approach for utilizing shared buffers, and recently we introduced a new feature that allows you to modify the size of these buffers using a custom Falco configuration option called `syscall_buf_size_preset`. By default, each buffer is set to 8 MB, but you have the flexibility to adjust it anywhere between 1 MB and 512 MB.

Increasing the buffer size can be beneficial when you encounter syscall drops. A larger buffer size can help mitigate syscall drops in systems with high production loads. However, it's important to note that very large buffers may also impact the overall system performance, potentially slowing down the machine.

Conversely, reducing the buffer size can help enhance system speed, but it may also result in an increased number of syscall drops. It's crucial to exercise caution when experimenting with this configuration option, taking into consideration the trade-off between performance and syscall drops ⚠️

While the ability to adjust buffer sizes is a cool feature, it is available to all drivers. So, what sets the modern probe apart? Well, with this new driver, you have the added capability to manipulate the number of buffers. This means that the traditional rule of having one buffer per CPU is no longer a strict requirement. Unlike the old drivers, where the only possible configuration was one buffer per CPU, the modern probe introduces flexibility in this aspect, opening up new possibilities and alternative scenarios.

As an illustration, one such scenario is the allocation of a ring buffer for every 3 CPUs.

![Buffers allocation using the modern eBPF probe](/blog/falco-modern-bpf-0-35-0/images/falco-modern-bpf-03.png)

{{% pageinfo color="info" %}}

> Observe that the second buffer can still be used by another CPU.

{{% /pageinfo %}}

To adjust the number of buffers, you can use the Falco configuration option called `modern_bpf.cpus_for_each_syscall_buffer`. Unlike other drivers that have a 1:1 mapping between buffers and CPUs, the modern probe has a default value of one buffer for every two CPUs. This distinction arises because the BPF ring buffer requires more memory compared to other drivers, necessitating a reduction in the number of buffers.

However, feel free to experiment and find the configuration that best suits your system. Just remember the following guideline: having more buffers can reduce the likelihood of drops but will increase the overall memory footprint. On the other hand, reducing the number of buffers can help decrease memory consumption but may lead to an increased risk of drops.

## Least privileged mode

Similar to the current probe, the modern probe can operate in _least privileged_ mode. However, to ensure proper functionality, Falco always mandates a minimum of two capabilities: `CAP_SYS_RESOURCE` and `CAP_SYS_PTRACE`. Additional required capabilities vary depending on your specific kernel version, like the `CAP_SYS_ADMIN` capability for older kernels, which can be replaced by the `CAP_PERFMON` and `CAP_BPF` ones when running on a kernel newer than 5.8.

![Newer kernels allow more granularity when using Linux capabilities](/blog/falco-modern-bpf-0-35-0/images/falco-modern-bpf-04.png)

Here's an example command to run Falco in _least privileged_ mode using the modern probe:

```bash
docker run --rm -i -t \
           --cap-drop all \
           --cap-add sys_admin \
           --cap-add sys_resource \
           --cap-add sys_ptrace \
           -v /var/run/docker.sock:/host/var/run/docker.sock \
           -v /proc:/host/proc:ro \
           falcosecurity/falco-no-driver:latest falco --modern-bpf
```

{{% pageinfo color="info" %}}

Observe we cannot use `CAP_BPF` and `CAP_PERFMON` here since [docker doesn't support](https://github.com/moby/moby/pull/41563) them yet.

{{% /pageinfo %}}

## Try it out

The modern eBPF probe is compatible with all the installation methods available for other drivers.

- [Falco packages](/docs/getting-started/installation/#installation-with-dialog)
- [Falco binary](/docs/getting-started/running/#falco-binary)
- [Docker](/docs/getting-started/running/#modern-ebpf)
- [Helm chart](https://github.com/falcosecurity/charts/blob/master/falco/README.md#daemonset)

Also, you can test it live in this interactive environment that we have prepared for you. Let's start playing with it 🎮

<iframe width="1140" height="640" sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts" src="https://play.instruqt.com/embed/sysdig/tracks/falco-modern-ebpf?token=em_Kwn3AXuYeONY6e0v" style="border: 0;" allowfullscreen></iframe>

{{% pageinfo color="info" %}}
For a better experience, or if your browser didn't let you access the lab within this page, <a target="_blank" href="https://play.instruqt.com/embed/sysdig/tracks/falco-modern-ebpf?token=em_Kwn3AXuYeONY6e0v">click here to open the lab</a> a new window.
{{% /pageinfo %}}
