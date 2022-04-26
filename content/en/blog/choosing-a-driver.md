---
title: Choosing a Falco driver
description: Understanding which Falco driver is right for you
date: 2020-09-23
author: Kris Nóva
slug: choosing-a-driver
---

Falco works by taking Linux system call information at runtime, and rebuilding the state of the kernel in memory.
The Falco engine depends on a driver in order to consume the raw stream of system call information.
Currently the Falco project supports 3 different drivers in which the engine can consume this information.

 - A kernel module
 - An eBPF probe
 - A ptrace(2) userspace program 
 
This blog will highlight the nuances of each implementation and explain why they exist. 
Hopefully this resource will give you a starting point for understanding which driver is right for your use case.

*Updated: Falco 0.26.0*

---

## Kernel Module

The Falco Kernel module is the traditional way of consuming the required stream of data from the kernel.

_Source_: [github.com/draios/sysdig/driver](https://github.com/draios/sysdig/tree/dev/driver)

The kernel module must be loaded in order for Falco to start.
The kernel module depends on the `linux-headers` package in order to compile. [More information
](https://falco.org/docs/source/).

_Note_: A convenience script found [here](https://github.com/falcosecurity/falco/blob/master/scripts/falco-driver-loader)

#### Using the kernel module
 
```bash
cd ~
git clone git@github.com/falcosecurity/falco
cd falco
mkdir build
cd build
cmake ../ \
      -DBUILD_BPF=OFF \
      -DBUILD_WARNINGS_AS_ERRORS="OFF" \
      -DCMAKE_BUILD_TYPE="Release" \
      -DCMAKE_INSTALL_PREFIX="/usr" \
      -DFALCO_ETC_DIR="/etc/falco" \
      -DUSE_BUNDLED_DEPS=ON
make driver
sudo insmod driver/falco.ko
sudo falco
```

#### Pros

The kernel module is the most commonly used driver for Falco and can be used in any environment where loading a kernel module is trusted and viable.

 - The module can be built, hosted, and installed directly onto a hosted system.
 - The Falco community offers [limited support](https://falco.org/docs/getting-started/installation/) for pre-building kernel modules.
 - Will work regardless of kernel version (as compared to eBPF below)

#### Cons

 - Tightly coupled with the host kernel and changing kernel versions, architecture, operating systems can introduce complexity.
 - A faulty kernel module could potentially panic or crash a Linux kernel.
 - Loading a kernel module is not always trusted or allowed in some environments.
 
#### Summary 

Kernel modules are the quickest, and most common way to run Falco. They are a viable solution in any environment where access to the host kernel is trusted.

 - Kubernetes 
 - AWS EC2 (kops, eks, kubeadm) Anywhere access to the host is allowed
 - Azure 
 - IBM Cloud
 
 ---
 
## eBPF Probe

The Falco eBPF probe is a viable option in environments where kernel modules are not trusted or are not allowed but eBPF programs are.
The most common example of this environment is GKE. Running Falco in GKE was the original use case for creating the eBPF probe.

_Source_: [github.com/draios/sysdig/driver/bpf](https://github.com/draios/sysdig/tree/dev/driver/bpf)

The eBPF probe must be loaded in order for Falco to start, and will provide the same stream of metrics that the kernel module does.
Falco should work seamlessly with this approach.

#### Using the eBPF probe

_Note_: Notice the `-DBUILD_BPF=ON` flag
_Note_: A convenience script found [here](https://github.com/falcosecurity/falco/blob/master/scripts/falco-driver-loader)

```bash
cd ~
git clone git@github.com/falcosecurity/falco
cd falco
mkdir build
cd build
cmake ../ \
      -DBUILD_BPF=ON \
      -DBUILD_WARNINGS_AS_ERRORS="OFF" \
      -DCMAKE_BUILD_TYPE="Release" \
      -DCMAKE_INSTALL_PREFIX="/usr" \
      -DFALCO_ETC_DIR="/etc/falco" \
      -DUSE_BUNDLED_DEPS=ON
make bpf
cp driver/bpf/falco.o ${HOME}/.falco/probe.o
sudo falco
```

#### Pros

 - The eBPF probe can be ran in environments like GKE where loading a kernel module is not an option.
 - eBPF is considered safer, and unable to crash or panic a kernel. The eBPF code is already compiled into a Linux kernel, and is simply enabled using the eBPF program.
 - The eBPF probe can be dynamically loaded into a kernel at runtime, and does not require using tools like `dkms`, `modprobe`, or `insmod` to load the program.

#### Cons

 - The eBPF probe does not work for every system.
 - You need at least Linux kernel version 4.14 but the Falco project suggests an LTS kernel of 4.14/4.19 or above.

#### Summary 

The eBPF probe should be used when loading a kernel module is not a viable option.
Reasons for not loading a kernel module may change, and in this case the eBPF probe is the default.

 - Kubernetes
 - GKE
 - Environments where loading a kernel module is untrusted or not supported
 
 ---
 
## pdig

The `pdig` binary is the newest and most viable path forward when both a kernel module, and eBPF probe is not an option.
The most common example of this environment is AWS ECS with Fargate. 

The `pdig` tool is built on `ptrace(2)`. It requires `CAP_SYS_PTRACE` enabled for the container runtime. 
The `pdig` tool enables a new way of consuming metrics about a given application at the process level.

_Note_: The eBPF probe and kernel module work at a global host level, whereas `pdig` works at a process level. A clever invocation of `pdig` against a system can simulate a broader scope of system parsing. PID 1 is sometimes of interest.

_Source_: [github.com/falcosecurity/pdig](https://github.com/falcosecurity/pdig)

#### Pros

 - Lightweight, safe, and process specific
 - Runs only in userspace
 - Enables Falco for use cases when a kernel module, and an eBPF probe is not viable
 
#### Cons

 - The dependency on `ptrace(2)` is slow. Period.
 - Requires executing Falco with the `pdig` binary to "hack" the driver.
 
#### Summary

The `pdig` tool is the most unique of all the drivers, and enables functionality not otherwise possible.

 - Kubernetes
 - AWS ECS/Fargate 
 - AWS EKS/Fargate
 - Environments where kernel modules and eBPF is not an option
 
--- 

## Suggested Cloud Provider Implementations 

| Solution             | Suggested Driver            | More Resources                                                                                         |
|----------------------|-----------------------------|--------------------------------------------------------------------------------------------------------|
| Baremetal Kubernetes | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| Kubeadm Kubernetes   | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| Kubernetes Kind      | Kernel Module               | [Kind Documentation](https://falco.org/docs/third-party/#kind)                                         |
| Minikube             | Kernel Module               | [Minikube Documentation](https://falco.org/docs/third-party/#minikube)                                 |
| AWS EKS              | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| Azure                | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| GKE                  | eBPF Probe                  | [Falco on GKE](https://falco.org/docs/third-party/#gke)                                                |
| IBM Cloud            | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| OpenShift            | Kernel Module               | [Helm Chart](https://falco.org/docs/third-party/#helm)                                                 |
| AWS ECS              | pdig                        | [pdig](https://github.com/falcosecurity/pdig) [falco-trace](https://github.com/kris-nova/falco-trace)  |
| AWS EKS (Fargate)    | pdig                        | [pdig](https://github.com/falcosecurity/pdig) [falco-inject](https://github.com/fntlnz/falco-inject)  |
| ARM/Raspberry PI     | eBPF Probe *Kernel specific |                                                                                                        |

