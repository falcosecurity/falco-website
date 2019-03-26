---
title: Falco Kernel Module
weight: 4
---

Falco depends on a kernel module that taps into the stream of system calls on a machine and passes those system calls to user space.

Versions before v0.6.0 used the kernel module from sysdig called `sysdig-probe`. As of 0.6.0, falco uses its own kernel module `falco-probe`. The kernel modules are actually built from the same source code, but having a falco-specific kernel module allows falco and sysdig to be updated independently without driver compatibility problems.

# Installing the kernel module

By default, the kernel module will be installed when installing the falco debian/redhat package or when running the `faclosecurity/falco` docker image. The script that installs the kernel module tries to install it in 3 different ways:

* Build the kernel module from source using [dkms](https://en.wikipedia.org/wiki/Dynamic_Kernel_Module_Support).
* Download a pre-built kernel module from downloads.draios.com.
* Look for a pre-built kernel module from `~/.sysdig`.

For options using a pre-built kernel module, the kernel module should have the following filename: `falco-probe-<falco version>-<arch>-<kernel release>-<kernel config hash>.ko` `<kernel config hash>` is a md5sum of the config file that sets kernel options (e.g. `/boot/config-4.4.0-64-generic`). This file can reside in other locations--see the [kernel module builder script](https://github.com/draios/sysdig/blob/dev/scripts/sysdig-probe-loader) for full details on the set of paths it tries to find the kernel config file.
