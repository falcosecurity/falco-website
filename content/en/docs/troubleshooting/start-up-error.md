---
title: Falco Is Not Starting Up
description: Follow this guide to identify whether an issue or misconfiguration is causing Falco to crash or preventing it from starting up
weight: 10
---

## Action Items (TL;DR)

- Read [Install and Operate](/docs/install-operate/) Guides and review [falco.yaml](https://github.com/falcosecurity/falco/blob/master/falco.yaml) and any local configuration file for necessary preconditions.
- Address common startup issues by verifying and correcting config misconceptions.
- Monitor for potential kernel driver bugs, though less frequent.
- Be aware of userspace bugs that can also interfere with Falco startup.
- First, always try running Falco with the default and/or easiest configuration without any plugins.

Let's find out!

## Debugging Tips

Please acknowledge that The Falco Project performs a wide range of tests and provides pre-built kernel drivers, but perfection is not guaranteed.

How do I determine if Falco does not start up because of a kernel driver or userspace or pure config issue?

- When you start Falco, watch the print statements. 
- If Falco crashes after passing load config stages, especially during syscall source setup, it signals potential kernel driver issues. These issues may include device unavailability, permission problems, or strange printouts. Alternatively, it could suggest that the kernel driver is not present in the first place, for instance, due to a download failure or missing mounts.
- If Falco started up, but then crashed after, it's likely a genuine bug somewhere, we would have to find out.

### Kernel Drivers

Falco kernel driver issues are the most common source of frustrating errors.
Please note that since Falco 0.38.0, `modern_ebpf` driver is the new default driver, and it will be automatically used wherever is supported; this should help mitigate most of the following issues.
Here are a few tips to demystify what can go wrong with respect to Falco's kernel drivers:

- Check if all preconditions to start up the kernel drivers are met. Common issues include: 
   - For `ebpf` based drivers, the `bpf` syscall needs to be allowed and not blocked by SELinux or similar. 
   - Ensure the DKMS package is installed for the `kmod` driver, and your system may require custom-signed kernel modules. Also, verify the availability of the host `/dev` mount (e.g. `/dev:/host/dev` when running Falco over a container).
   - In general, check that Falco has all host mounts when running from a container or as a daemonset in Kubernetes. Critical mounts for running Falco, assuming the kernel driver is available, include: `/etc:/host/etc`,  `/proc:/host/proc`, `/boot:/host/boot`, `/dev:/host/dev`.
- For `ebpf` and `kmod` drivers, the kernel object code needs to be available for the exact kernel release (`uname -r`) of your system. This invites a wide range of possible issues:
  - If you use the Falco open-source binary on Linux distributions such as stock Ubuntu, Fedora, Debian, Arch Linux, Oracle Linux, Rocky Linux, AlmaLinux, etc., you may encounter an issue if the pre-built kernel driver from The Falco Project is not available for download. Verify on the [Driver Index](https://download.falco.org/driver/site/index.html) page if the driver is available for your specific OS and kernel.
  - Your network ACLs may be blocking the download.
  - In case the download fails, building the driver on the fly (over the init container in Kubernetes, for example) can fail for many reasons.
  - Lastly, if you run a custom kernel, you'll need to build your own drivers (`ebpf` or `kmod` only) or explore the option of using the `modern_ebpf` driver if applicable.
- If your kernel version is >= 5.8 and you are enforcing either `kmod` or `ebpf` driver, consider switching to the  `modern_ebpf` driver. It's bundled into the userspace binary and works out of the box, regardless of the kernel release, thanks to the eBPF feature called 'Compile Once Run Everywhere' (CO-RE).
- If you are using the `ebpf` or `modern_ebpf` driver and encounter verbose and lengthy instruction printouts, you may have encountered a dreaded eBPF verifier failure. In such cases, kindly reach out to the Falco maintainers, providing the kernel release (`uname -r`). Resolving such instances involves modifying the driver code to ensure the eBPF verifier is happy again.

### Userspace

- Errors associated with Falco's rules or configurations are generally more understandable, and we provide warnings with clear instructions.
- Historically, we have encountered edge case bugs with some newer features. Please bear with us in such cases, and we typically release patches to address them.
- In the past, there have been instances where regressions were introduced, and certain configurations or combinations thereof may exhibit unexpected behavior. However, Falco's core functionality undergoes comprehensive testing, and we are committed to ensuring its continued reliability.

### Restarts

Falco is a C/C++ application for performance reasons, and as such, it is not unheard of for Falco to crash and restart in some rare code paths or edge case conditions. However, if you deploy Falco with resource limits, for example the OOM killer can also kill the process and force a restart. Read more in the [Falco Performance](/docs/metrics/performance/) Guide.

### References and Community Discussions

- [[UMBRELLA] Errors at Falco start-up related to Falco's kernel driver {kmod, ebpf, modern_ebpf}](https://github.com/falcosecurity/falco/issues/2873)
- [Falco Performance](/docs/metrics/performance/)
- [Driver Index](https://download.falco.org/driver/site/index.html)
