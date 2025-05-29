---
title: Introducing Falco 0.41.0
date: 2025-05-29
author: Federico Di Pierro
slug: falco-0-41-0
tags: ["Falco","Release"]
---

Dear Falco Community, today we are happy to announce the release of Falco 0.41.0!

This version brings several new features, performance enhancements, and bug fixes that streamline Falco’s detection capabilities.
During this release cycle, we merged more than 50 PRs on Falco and around 130 PRs for libs and drivers, version 0.21.0 and version 8.1.0, respectively. Thank you to our maintainers and contributors. This would not have been possible without your support and dedication!

To learn everything about the changes, read on!

## What’s new? TL;DR

*Key features:*

* [Reimplemented container engines support from scratch](#reimplemented-container-engines-support);
* [A Kubernetes operator is taking shape](#kubernetes-operator);
* Falco's `config_files` configuration gained support to specify the merge strategy;
* Modern eBPF driver is now capable of trying to load multiple programs for each event; consequently, `sendmmsg` and `recvmmsg` will now make use of `bpf_loop` eBPF helper where available, boosting their performances;
* New `proc.aargs` field available, ie: a lookup for an ancestor args field;
* `proc.args` gained support for indexed access, to only check a certain argument;
* `json_include_output_fields` configuration key for Falco to control whether output fields are included in the JSON message;
* Ongoing work to improve libs code modularity;

*Key fixes:*

* Avoid kmod crashing when a CPU gets enabled at runtime;
* Fixed Falco Prometheus metrics with multiple event sources enabled;
* Fixed RPM packages evaluation of RPM scripts;
* `-o` options do now correctly override included `config_files`;


{{% pageinfo color="warning" %}}
This release also comes with [breaking changes](#breaking-changes-and-deprecations) that you should be aware of before upgrading.
{{% /pageinfo %}}

## Major features and improvements

The 0.41.0 release contains a number of features and UX improvements. Here is a list of some of the key new capabilities.

### Reimplemented container engines support

In the Falco 0.41.0 release, the Falco team has completely revised its support for container engines.
Key improvements include:

* Container support is now a plugin;
* The plugin will attach a listener to the engine's SDKs `onCreate` signal; since `onCreate` comes way before `onStart`, we have plenty of time to deliver the container's metadata before the first process in the container is even started;
* For now, it is bundled within Falco to avoid breaking changes, but in the future, it will need to be downloaded through `falcoctl`;

These changes should address all issues related to missing container metadata.

### Kubernetes operator

In Falco 0.41.0, we worked hard to create a Falco k8s operator: https://github.com/falcosecurity/falco-operator/.
For now, this is considered a technical preview, but we will deliver a fully functional operator very soon. Expect more news in a new blog post!

## Breaking changes and deprecations ⚠️
This version comes with breaking changes, mostly in the configuration interface.

### Removed command line options and equivalent configuration options

We removed the already deprecated options  `-S`/`--snaplen`, `-A`, and `-b`, and it is now possible to achieve the same result through the Falco configuration:

* for `-S/--snaplen`: `falco_libs.snaplen` config key;
* for `-A`: `base_syscalls.all` config key;
* for `-b`: `buffer_format_base64` config key;

The configuration options for the container engines, added in 0.40.0, have been completely dropped in favor of the new plugin init configuration which can be found at https://github.com/falcosecurity/plugins/tree/main/plugins/container#configuration.

You can find more information on breaking changes in the [tracking issue](https://github.com/falcosecurity/falco/issues/3497).

### Behavior changes

Falco will now only consider and consequently load rules whose name ends in `.yml` or `.yaml`.

### Dropped features

`syslog` related fields were dropped by libs, since they were unused.

Also, as a consequence of the new `container` plugin, some breaking changes had to take place:

* the musl build is inherently not able to load plugins; that means that it loses container metadata support;
* `falcosecurity_scap_n_containers` and `falcosecurity_scap_n_missing_container_images` metrics are now moved to the plugin, and their name now have the `falcosecurity_plugins_` prefix;
* `-pc` and `-pk` command line options are now ineffective; it is up to the container and k8smeta plugins to declare suggested fields to be used as output fields; consequently, `container_image=%container.image.repository` and `k8s_ns=%k8s.ns.name` changed their name to `container_image_repository=` and `k8s_ns_name=`;

### Deprecations

In Falco 0.41.0, we have deprecated the following options:
* `-p` cli flag; the only remaining user for it is gVisor, which will be ported to a plugin sooner or later and will then make use of the suggested output fields plugin API;

## Try it out

Interested in trying out the new features? Use the resources below to get started.

* [Container Images](/docs/getting-started/running/#docker)
    * `falco` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco))
    * `falco-driver-loader` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-driver-loader), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-driver-loader))
* [CentOS/Amazon Linux](/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](/docs/getting-started/installation/#debian)
* [openSUSE](/docs/getting-started/installation/#suse)
* [Linux binary package](/docs/getting-started/installation/#linux-binary)

## What’s next?

Falco is more mature with each release. Following its [graduation](/blog/falco-graduation/), we have published the [roadmap](/docs/roadmap/#road-to-falco-1-0-0) for version 1.0.0, which is guiding us in the next steps. For the next release, you can expect more stability, a refined k8s operator, improved performance, and, as always, new detections and fixes.

## Stay connected

Join us on social media and in our weekly community calls! It’s always great to have new members in the community, and we’re looking forward to hearing your feedback and ideas.

You can find all the most up-to-date information at [https://falco.org/community/](https://falco.org/community/).
