---
title: Falco 0.35.0
date: 2023-06-07
author: Federico Di Pierro, Andrea Terzolo, Lorenzo Susini
slug: falco-0-35-0
tags: ["Falco","Release"]
featured_image: https://falco.org/blog/falco-nist-controls/images/falco-nist-controls-featured.png
---

Dear Community, today we are delighted to announce the release of Falco 0.35.0!

A big thank you to all our contributors for helping get the latest release out, we are thrilled to share this release and its goodies with the community.   To read a detailed account of the release, see [v0.35.0 in the changelog](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0350).

During this release cycle, we had 90+ PRs on Falco and a grand total of 170+ PRs for libs 0.11.0 and 60+ for drivers 5.0.1. Thank you to our maintainers and contributors, as this would not happen without your support, dedication, and contribution!

## What's new? TL;DR 🩳

In release v0.35.0,  we focused on addressing the following key features: 
- Moving the modern eBPF probe out of experimental status
- Improving Falco performance, allowing tailoring syscall detection to one's needs
- New Falco metrics
- Falco images signing
- Improving plugins SDK
- Test infra revamp

{{< youtube-80 id="wGwXiYYUgAs" title="What's New in Falco 0.35" >}}
For more information check out the 0.35 [overview video](https://www.youtube.com/watch?v=wGwXiYYUgAs) on YouTube

## Modern eBPF probe 👨‍🚀

The new, modern eBPF probe was released as experimental during the 0.34.0 release cycle.  Since then we worked hard to implement all the remaining syscalls and behaviors, and now the same eBPF probe has left experimental status.

The new eBPF probe is a CO-RE probe, which means it is already built into Falco, and you don't need any downloads. Moreover, it sports better performance compared to the old eBPF probe.  

Finally, while delivering the new eBPF probe, Andrea Terzolo also shipped a brand new driver testing framework, now used in libs CI to test consistency between all three drivers. This addition alone was worth the effort: on behalf of the whole community, thank you Andrea!

The new probe has stricter kernel release requirements: for more info, check out our [blog post](https://falco.org/blog/falco-modern-bpf/).

## Improved Falco performance

Thanks to the collaborative effort from Melissa Kilby, Jason Dellaluce, Andrea Terzolo and Federico Di Pierro, we were able to completely revamp the way that Falco detects syscalls that needs to be captured. With the new **adaptive syscalls** feature, Falco will only enable syscalls that are needed to detect the ruleset it is being run with. It will also enable a bunch of syscalls that are needed for _libsinsp_ internal state parsers, and that's it.

Consequently, the `-A` flag semantics have changed. By default, ie. without `-A`, heavy syscalls (like I/O ones) won't be captured, even if the ruleset ships with them, and a warning is shown to the user. Using `-A` will now allow Falco to capture even heavy syscalls, without showing a warning. A couple of new config keys are now available to further tailor Falco adaptive syscalls: a related blog post will be published soon, so stay tuned!  

One of the neatest things about this work is that the huge libs refactor it required lays the groundwork for another highly requested feature: LSM and kprobes support.

## Falco metrics

Thanks to yet another collaborative effort led by Melissa, Falco has a new experimental `metrics` feature.   This introduces a redesigned stats/metrics system, emitted as monotonic counters at predefined intervals (Prometheus-like).

There are multiple options available: one can enable the output of these metrics as internal metric snapshot rule, allowing them to be emitted as outputs. Or you can choose to output metrics to a file, that is **not** rotated by Falco. Moreover, there are options to enable CPU and memory usage metrics, internal kernel event counters and _libbpf_ stats.

This is a great first step to improve Falco resource observability!  

## Falco images signing

Starting from 0.35.0, all Falco images that you can deploy in your cluster are now signed with [cosign 2.0](https://github.com/sigstore/cosign) in keyless mode.  
This means that you can always verify that the Falco image you downloaded is an official Falco image, regardless of which registry you downloaded it from.   Moreover, you don't have to install or explicitly trust any public key for it to work. This is the magic of cosign in action!

So, how do you verify our brand new images? Install cosign 2 and run:
```
cosign verify docker.io/falcosecurity/falco:0.35.0 \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  --certificate-identity-regexp=https://github.com/falcosecurity/falco/ \
  --certificate-github-workflow-ref=refs/tags/0.35.0
```

Of course, you can do the same for all the deployable images including `falco`, `falco-driver-loader`, `falco-no-driver` and `falcoctl` (see its [repo](https://github.com/falcosecurity/falcoctl) for more details).

This wouldn't have been possible without a big effort from Luca Guerra and Federico Di Pierro to migrate our entire release pipeline from CircleCI to GitHub Actions.  The work is part of a larger effort from the Falco Supply Chain Working Group to bring all the Falco official artifacts up to date with the latest supply chain security standards. Special thanks to Massimiliano Giovagnoli, Batuhan Apaydın and Carlos Panato for your help and expertise in this area!

## Plugins workstream

The Plugin API has seen quite a few big improvements, mainly from Jason.

The first big change is that the plugin framework is now totally compatible with all the events supported by the Falco libraries, including all system calls and kernel events. The plugin API now shares all the event definitions of _libscap_ and allows plugins to both produce syscall events and extract fields from them. This feature has been in big demand since the first plugin system release ([#410](https://github.com/falcosecurity/libs/issues/410), [#992](https://github.com/falcosecurity/libs/issues/992)), and opens the door to many new opportunities for Falco extensions.

Second, plugins now have a standard way for managing and maintaining internal state. Up until now, plugins were only able to extract fields from the information available in the payloads of each event, thus being stateless components by definition. Now, plugins have a defined protocol ([#991](https://github.com/falcosecurity/libs/issues/991)) for hooking into the event stream, reconstructing an internal state, and using it for extracting fields for Falco rules. Also, plugins can inject asynchronous metadata events in open data streams to notify about state transitions and make them reproduceable when replaying capture files, just like has always happened with container-related events in the Falco libraries.

Lastly, plugins are now able to communicate bidirectionally with the Falco libraries and access their internal state, both in read and write modes. For example, this enables creating plugins that extract metadata fields from syscall event streams, and that have access to all the thread information reconstructed by _libsinsp_, with the opportunity of enriching it dynamically at runtime. The API surface also allows cross-plugin state access. We hope the developer community will appreciate the new power this offers plugin authors.

This big feature package required altering the plugin API in a way that is **incompatible** with the previous versions (the API major version has been bumped). As such, plugins released after Falco version 0.35 will not be compatible with Falco versions <= 0.34.1, and plugins released before version 0.35 will not be compatible with Falco from version 0.35 onwards. So, the **action required** for you is to **remember to also update all your plugins to the latest versions when updating Falco to v0.35**!

## Test-infra revamp

Massimiliamo Giovagnoli and Samuele Cappellin have contributed tremendous work on improving our infra. Prow is now lighter, quicker and less issue-prone. Multiple prow jobs were moved to GitHub Actions to improve cluster efficiency; moreover, driver-building jobs are now much less frequently killed (basically never).

Also, arm64 drivers are now built on arm64 nodes, without using _qemu_, speeding up the build time. At the same time, resources allocated to the cluster were enlarged, with autoscaling limits now set to 20 ARM nodes and 20 x86 nodes.  We can now deliver weekly new driver artifacts much quicker than before!  

Finally, the cluster now exposes Grafana dashboards for monitoring purposes: https://monitoring.prow.falco.org/.  

## Try it out

It’s time to try out the new release! Here are some pointers for getting started with Falco:

* [Container Images](/docs/getting-started/running/#docker)
  * `falco` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco))
  * `falco-no-driver` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-no-driver), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-no-driver))
  * `falco-driver-loader` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-driver-loader), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-driver-loader))
* [CentOS/Amazon Linux](/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](/docs/getting-started/installation/#debian)
* [openSUSE](/docs/getting-started/installation/#suse)
* [Linux binary package](/docs/getting-started/installation/#linux-binary)

## What next? 🔮

The community is active on many topics and we hope to deliver great features and many stability fixes once again during the next release cycle!

* We will revisit and improve _libsinsp_ API, for a more coherent developer experience.
* Finally, the long-awaited LSM and kprobes will be implemented.
* As the plugin API has seen huge improvements, we expect new plugins using the new features very soon.
* Fixes, fixes and also fixes everywhere
* Above all, we will work to improve thread tables and process trees inconsistencies; that's a huge topic and we plan to tackle it in multiple ways!  

## Stay tuned 🤗

**Join us** in our communication channels and in our weekly community calls! It’s always great to have new members in the community, and we’re looking forward to having your feedback and hearing your ideas.

You can find all the most up to date information at https://falco.org/community/.

See you for the next release!  

_Federico, Andrea and Lorenzo_
