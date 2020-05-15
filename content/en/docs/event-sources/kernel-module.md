---
title: Falco Kernel Module
weight: 1
---

Falco depends on a kernel module that taps into the stream of system calls on a machine and passes those system calls to user space.

Falco uses its own kernel module, called `falco`.

# Installing the kernel module

By default, the kernel module will be installed when installing the falco debian/rpm package or when running the `falcosecurity/falco` docker image. The script that installs the kernel module tries to install it in 3 different ways:

* Build the kernel module from source using [dkms](https://en.wikipedia.org/wiki/Dynamic_Kernel_Module_Support).
* Download a pre-built kernel module from `https://dl.bintray.com/falcosecurity/driver/`.
* Look for a pre-built kernel module from `~/.falco`.

For options using a pre-built kernel module, please refer to the [installation](/docs/installation/#installing-the-driver) page.
