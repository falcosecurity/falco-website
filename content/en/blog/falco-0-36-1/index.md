---
title: Falco 0.36.1
date: 2023-10-16
author: Andrea Terzolo, Luca Guerra
slug: falco-0-36-1
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.36.1** 🦅!

## Fixes

Here is a tiny patch release! It addresses some small bugs that will not bother us and our users anymore:

* Address a **HIGH** severity vulnerability in libcurl **[CVE-2023-38545](https://curl.se/docs/CVE-2023-38545.html)**, bumping the library to the patched version `8.4.0`. You can find more details in the [section below](#vulnerability-in-libcurl).
* The legacy eBPF probe can now handle systems with CPU hotplug enabled, opening the right number of kernel buffers. (https://github.com/falcosecurity/falco/issues/2843)
* Remove a no more useful experimental Falco config `outputs_queue.recovery`. This was introduced in Falco `0.36.0` as an experiment.
* Fix a possible segfault caused by a faulty implementation of [`timer_delete`](https://bugs.launchpad.net/ubuntu/+source/glibc/+bug/1940296). (https://github.com/falcosecurity/falco/issues/2850)

Thanks to everyone in the community for helping us in spotting these annoying bugs 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

### Vulnerability in libcurl

A **HIGH** severity vulnerability in libcurl, **[CVE-2023-38545](https://curl.se/docs/CVE-2023-38545.html)**, was disclosed alongside a patched version (`8.4.0`). We would like to answer the main question you might have about it: **Does it affect Falco?**

According to the excellent [in-depth description](https://daniel.haxx.se/blog/2023/10/11/how-i-made-a-heap-overflow-in-curl/) of the bug, this can only be triggered if **both conditions below** are true:
* A **SOCKS5 HTTP(S) proxy has been configured**. This happens if you have set the standard environment variables that control proxy connections, such as `http_proxy`/`https_proxy`/`no_proxy` or libcurl-specific ones as indicated in the [advisory](https://curl.se/docs/CVE-2023-38545.html) or the libcurl documentation.
* An **attacker controls** the server that Falco is connecting to, namely the **server configured to receive http_output** or a **custom prebuilt driver repository server**, and the SOCKS5 proxy is "slow enough" to allow the attack to happen.

Having an environment that is exploitable does not appear to be common, but possible nonetheless, for this reason, Falco maintainers have shipped a patch release 🦅

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.36.1**, you can install its packages following the process outlined in the docs:

* [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
* [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
* [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the container images? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

You can also find the Falcosecurity container images on the public AWS ECR gallery:

* [falco](https://gallery.ecr.aws/falcosecurity/falco)
* [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
* [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## What next? 🔮

The community is active on many topics and we hope to deliver great features and many stability fixes once again during the next release cycle!

- The old `falco-driver-loader` script is showing its age and it's time to work on a more maintainable solution. `falcoctl` is a great candidate to host everything driver related, implement new features and make our lives easier when we need to install Falco drivers on a new machine.
- Lately we have expanded the syscall coverage that Falco can provide. We wish to improve these efforts across all drivers with even more 32 bit syscalls.
- Our rule framework is brand new and we forsee many improvements and active development work on it.
- The latest Falco versions brought many improvements to the plugin framework; we wish to use those to create a more scalable Kubernetes client plugin that will be able to withstand much heavier loads and will be easier to maintain.

And many, many, more enhancements!

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

_Andrea, Luca_
