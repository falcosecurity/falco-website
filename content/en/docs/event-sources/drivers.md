---
title: Falco Drivers
weight: 1
---

Falco depends on a driver that taps into the stream of system calls on a machine and passes those system calls to user space.

The kernel module called `falco` is the default driver. Alternatively, an eBPF probe can be used. 

The Falco project has three different kind of drivers.

- Kernel module
- eBPF probe
- Userspace instrumentation

## Kernel module

By default, the kernel module will be installed when installing the Falco [debian/rpm](/docs/installation) package, when running the `falco-driver-loader` script shipped within the [binary pagacke](/docs/installation#linux-binary), or when running the `falcosecurity/falco-driver-loader` docker image (that just wraps the aforementioned script). 

To install the kernel module, please refer to the [installation](/docs/installation/#install-driver) page.

Falco tries to use the kernel module driver by default.

## eBPF probe

The eBPF probe is an alternative to the one described above. Note that eBPF is a feature supported only by recent kernels.

To install the eBPF probe, please refer to the [installation](/docs/installation/#install-driver) page.

To enable the eBPF support in Falco set the `FALCO_BPF_PROBE` environment variable to an empty value (ie. `FALCO_BPF_PROBE=""`) or otherwise explicitly set it to the path where the eBPF probe resides.

## Userspace instrumentation

Differently from the other drivers, as the name suggests, userspace instrumentations happens 100% in userspace.

The Falco community, in 0.24.0 promoted the userspace instrumentation feature to **[official support](https://github.com/falcosecurity/evolution#official-support)** to be included in Falco.
However, there's a difference between userspce instrumentation and the other drivers: it is a contract and not an implementation.

That means that when we are talking about userspace instrumentation for Falco we are talking about an API defined in Falco
that can be used by many implementations to input syscalls data to the engine.

At the moment of writing, the Falco project does not have any officially supported userspace instrumentation implementation.

However, the community is working on an implementation based on PTRACE(2)
that you can find [falcosecurity/pdig](https://github.com/falcosecurity/pdig).

Since, as we said, the implementation of userspace instrumentation is not coupled with Falco, and our official implementation
is yet to be defined we don't have setup instructions in the official [Running](/docs/running/) docs. However, here is a
list of high level items you can follow to get your hands on it:

- Start Falco with the `--userspace` flag. This will tell Falco to look at userspace instrumentation instead of looking at the Kernel module (the default).
- Select an userspace instrumentation implementation you want to use (let's take [pdig](https://github.com/falcosecurity/pdig) as it is the only one available now )
- Now, since pdig is still [Incubating](https://github.com/falcosecurity/evolution#incubating) - a very early stage - it's not included in our [Release process](https://github.com/falcosecurity/falco/blob/master/RELEASE.md). This, for you means that to install it, you will need to compile it yourself. Follow the instructions [here](https://github.com/falcosecurity/pdig#instructions).
- Now that you have pdig installed, you will need to start it. Remember, in the case of pdig, it does not know the root process tree you want to instrument by itself. You have to specify that via the  `-p` flag or start the process with pdig itself. It's very similar to running a debugger against a binary. You can run a process directly using it or instrument an existing process. Full instructions [here](https://github.com/falcosecurity/pdig#how-to-run-it).

There are attempts at making the installation process easier, the community didn't pick one yet and it's likely that many iterations will go into making any one of the below GA. However, here's a list of projects you can look at if you want to get Falco with userspace instrumentation in Kubernetes.

- [Falco Trace](https://github.com/krisnova/falco-trace) - a convenient container image to use as a base to add userspace instrumentation to your images.
- [Falco Inject](https://github.com/fntlnz/falco-inject) - a tool that uses Falco Trace artifacts to inject Falco and userspace instrumentation into your containers via the kubernetes API.

As you probably already understood, the userspace instrumentation drivers are a bit different, handle with care!
