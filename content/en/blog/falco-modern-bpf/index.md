---
title: Getting started with modern BPF probe in Falco
linktitle: Getting started with modern BPF probe in Falco
description: Discover the modern BPF world with Falco
date: 2022-11-30
author: Andrea Terzolo, Vicente J. Jiménez Miras
slug: falco-modern-bpf
images:
  - /blog/falco-modern-bpf/images/falco-modern-bpf-01.png
  - /blog/falco-modern-bpf/images/falco-modern-bpf-02.png
  - /blog/falco-modern-bpf/images/falco-modern-bpf-featured.png
tags: ["eBPF"]
---

The new BPF probe has landed among us 👽 and it brings to the table new shiny features. The BPF world grows continuously and every new kernel release introduces some unbelievable novelties!

To take advantage of these we have created a completely new architecture,  new BPF programs and maps. The main goal is to improve performance, maintainability, and user experience, shipping a unique, powerful, self-contained Falco executable. (... Oops, I said too much but don't burn the steps, first things first.)

## What's new 🗞️

We wouldn't be able to cover all the details here so we will just go through the most outstanding features. If you are interested in technical aspects you can always take a look at the [proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20220329-modern-bpf-probe.md) merged upstream some months ago with its corresponding [discussion](https://github.com/falcosecurity/libs/pull/268).

### CO-RE paradigm

Portability is one of the biggest issues we have with the current BPF driver. Our infrastructure tries to compile a BPF probe for every supported kernel since version `4.14`! As you can imagine, this is not a simple task, and it causes some pain to both, users and maintainers. For this reason, the Falco maintainers have been working hard to adopt the so-called **[CO-RE](https://nakryiko.com/posts/bpf-portability-and-co-re/)** paradigm.

CO-RE stands for *"Compile-once-run-everywhere"*, so as you may imagine, this paradigm allows compiling the BPF probe just once for all kernels!

You understood well: No more missing drivers, and no more painful local builds requiring the much-loved **KERNEL HEADERS**.

### BPF Ring Buffer map

Today, whenever a BPF program needs to send data to userspace, it first copies it into a BPF map, and then it pushes its content to a shared buffer located between userspace and kernel: The so-called **`perf-buffer`**.

This solution works great, but it has two major shortcomings that prove to be inconvenient in practice: Inefficient APIs and extra data copying.

The **`ring buffer`** can be considered an evolution of the **`perf buffer`**. We still use a shared buffer but with some advantages.

First, the APIs to interact with are more efficient. Second, and more importantly, we now have the possibility of writing data directly into this shared buffer, without having to write it twice!

This is a game changer in scenarios where high throughput is required, like running Falco, since it could save many cycles during the collection phase.

### BTF-enabled program

Kernel engineers recently introduced a sort of debugging information for BPF programs/maps. This is called [BTF](https://docs.kernel.org/bpf/btf.html) and stands for "BPF Type Format". This feature shook the foundations of the BPF world because it finally offers the possibility to write code without BPF helpers like the famous `bpf_probe_read()`.

This will not only increase the readability of the BPF code but will also reduce the bytecode dimension, allowing the crafting of smaller and more efficient programs!

### BPF global variables

The addition of global variables points in the same direction as BTF: Simplify the code experience, increase the readability and reduce the performance overhead due to BPF helpers.

While BTF allows to deference kernel pointer without the use of the `bpf_probe_read()` helper, global variables allow to access BPF maps without the use of helpers like `bpf_map_lookup_elem()`.

You can find further technical information about these 2 new features in the [probe proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20220329-modern-bpf-probe.md#new-bpf-tracing-programs-kernel-version-55).

### BPF skeleton

Do you remember when we talked about Falco being a self-contained binary?

Well the BPF skeleton concept allows us to achieve the dream:
**Ship Falco as a unique, self-contained executable!**

Under the hood, the probe is compiled once into Falco when the package is built. Hence, when you deploy Falco on different machines it will automatically inject the code without any extra effort on your side. Hard to believe? Try it [here](#modern-bpf-in-action).

### Multi-arch support

The modern BPF probe also supports multiple architectures by design. The actual targets are `x86_64`, `arm64`, and `s390x`, but new ones can be added at any time.

If you have a project that needs BPF instrumentation for one of these architectures you could simply link the Falco libraries (`libsinsp`, `libscap`) to obtain a working solution out of the box. We would to thank [Hendrik Brueckner](https://github.com/hbrueckner) for the huge help he gives in reviewing and implementing the multi-arch support!

> At this moment, we ship Falco for `x86_64` and `arm64` architectures only, due to their popularity in the community.

## Requirements ⛓️

To use the modern BPF probe, there are 2 main requirements:

1. **A kernel that implements all the aforementioned features**. Linux kernel version `5.8` is the first kernel that supports **all of them**, and for this reason, we consider it the minimum required one.

    Nevertheless, these features could also be backported into older kernels, so it wouldn't be completely fair to define the `5.8` as the first supported version. This is just a strict assumption that we put in place since we still miss the logic to detect all the necessary features of your kernel.

    Until that day arrives, if your kernel is older than `5.8`, you might find the following error when trying to start the modern probe:

    ```txt
    Error: Actual kernel version is: '5.4.0' while the minimum required is: '5.8.0'
    ```

2. **A kernel that exposes BTF types**. This shouldn't be a big issue since we already require a kernel version newer than `5.8` and most [recent Linux distributions](https://github.com/libbpf/libbpf#bpf-co-re-compile-once--run-everywhere) come with kernel BTF capabilities.

    If you want to be sure you can easily check their presence by typing:

    ```bash
    ls /sys/kernel/btf/vmlinux
    ```

    If your kernel supports them you should see:

    ```bash
    /sys/kernel/btf/vmlinux
    ```

Now, if your machine satisfies these 2 requirements, you are ready to have fun with the modern probe! 🚀

## Modern BPF in action 🏎️

Falco provides you with pre-release packages to try the modern BPF probe, but the full release will take place in Falco 0.34.

If you happen find some bugs or misbehaviors, please be kind with us and [open an issue on Falco](https://github.com/falcosecurity/falco/issues) 🙏

Having said that, you have 3 main ways to try Falco with the modern probe.

### 1. Pre-built `deb`, `rpm` packages

You can find [here](https://app.circleci.com/pipelines/github/falcosecurity/falco/3453/workflows/c8573555-0ecb-44de-af84-1f2a4121d772/jobs/29647/artifacts) the `x86_64` packages and [here](https://app.circleci.com/pipelines/github/falcosecurity/falco/3453/workflows/c8573555-0ecb-44de-af84-1f2a4121d772/jobs/29646/artifacts) the `arm64` ones.

Taking as an example the `deb` package, you have simply to download it and type the following command:

```bash
sudo dpkg -i <your_deb_package.deb> 
```

Now there are 2 possibilities:

1. If you have the `dialog` binary installed on your system you should see a dialog window like this (the dialog is a new feature that will be regularly shipped in Falco 0.34 for all the drivers!):

![](/blog/falco-modern-bpf/images/falco-modern-bpf-02.png)

You have simply to choose the *"Modern eBPF"* option.

2. If you don't have `dialog` installed, you must start the service manually:

```bash
sudo systemctl start falco-modern-bpf.service
```

Typing `sudo systemctl status falco-modern-bpf.service` should either way show you a similar output to:

```txt
Nov 15 14:50:46 ip-172-31-13-74 systemd[1]: Started Falco: Container Native Runtime Security with modern ebpf.
Nov 15 14:50:46 ip-172-31-13-74 falco[1587330]: Falco version: 0.32.1-291+5d1b0c5 (x86_64)
Nov 15 14:50:46 ip-172-31-13-74 falco[1587330]: Falco initialized with configuration file: /etc/falco/falco.yaml
Nov 15 14:50:46 ip-172-31-13-74 falco[1587330]: Loading rules from file /etc/falco/falco_rules.yaml
Nov 15 14:50:46 ip-172-31-13-74 falco[1587330]: Loading rules from file /etc/falco/falco_rules.local.yaml
Nov 15 14:50:46 ip-172-31-13-74 falco[1587330]: The chosen syscall buffer dimension is: 8388608 bytes (8 MBs)
Nov 15 14:50:46 ip-172-31-13-74 falco[1587330]: Starting health webserver with threadiness 8, listening on port 8765
Nov 15 14:50:46 ip-172-31-13-74 falco[1587330]: Enabled event sources: syscall
Nov 15 14:50:46 ip-172-31-13-74 falco[1587330]: Opening capture with modern BPF probe
```

### 2. Tar archive

You can download [here](https://output.circle-artifacts.com/output/job/eb00e055-c99b-4846-b203-8262ebe666f1/artifacts/0/packages/falco-0.32.1-293+76726d7-x86_64.tar.gz) the `x86_64` tar.gz and [here](https://output.circle-artifacts.com/output/job/457abf8a-f060-4cc1-961d-e2d2ac10eebb/artifacts/0/packages/falco-0.32.1-293+76726d7-aarch64.tar.gz) the `arm64` one.

Here the procedure is very simple, you can extract the contents of the archive and execute the Falco binary:

```bash
tar -xvf <targz_package.tar.gz>
cd <untar_folder>
sudo ./usr/bin/falco --modern-bpf -c ./etc/falco/falco.yaml -r ./etc/falco/falco_rules.yaml
```

> **Please note**: The command line option required to run Falco with the modern BPF probe is `--modern-bpf`

### 3. Docker image

In an environment where you can start containers, you can simply use the docker images from DockerHub:

```bash
# x86_64
docker pull andreater/falco-modern-x86:latest
docker run --rm -i -t \
           --privileged \
           -v /var/run/docker.sock:/host/var/run/docker.sock \
           -v /proc:/host/proc:ro \
           andreater/falco-modern-x86:latest

# arm64
docker pull andreater/falco-modern-arm64:latest
docker run --rm -i -t \
           --privileged \
           -v /var/run/docker.sock:/host/var/run/docker.sock \
           -v /proc:/host/proc:ro \
           andreater/falco-modern-arm64:latest
```

> **Please note**: The helm chart is not available yet since this is a pre-release but it will be shipped as expected with Falco `0.34`

## Current syscall support ⏲️

The modern BPF probe doesn't yet support all the syscalls supported by the current probe. It only supports the *"simple consumer set"*, which means that we support all the syscalls necessary to run Falco without `-A` option, also known as the *default Falco mode*. At the moment, adding the `-A` flag wouldn't have any further effect.

[Here](https://github.com/falcosecurity/libs/issues/513) you can find the complete list of syscalls currently supported by the modern probe.

The good news is that we are actively working to include all the syscalls supported by the [current probe](https://falcosecurity.github.io/libs/report/) 💥

## Next steps 🔮

- Release Falco 0.34 with the modern probe as an experimental feature.
- Reach the full support of syscall.
- Introduce new points of instrumentation like LSM hooks to collect security events.

## Falco and modern BPF at eBPF summit 🐝

If you want to know more about how the modern BPF probe works under the hood take a look at the eBPF summit presentation.

{{< youtube-80 id="BxoKztfHnYY" title="Falco's Discovery of the Modern eBPF World - Andrea Terzolo & Jason Dellaluce">}}
