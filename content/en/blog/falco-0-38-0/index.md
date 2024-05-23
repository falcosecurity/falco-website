---
title: Introducing Falco 0.38.0
date: 2024-05-30
author: Luca Guerra, Federico Di Pierro
slug: falco-0-38-0
tags: ["Falco","Release"]
---

Dear Falco Community, today we are happy to announce the release of Falco 0.38.0! This is the first Falco release since its [graduation](/blog/falco-graduation/) within the CNCF, and, as usual, brings many improvements and features alongside some pretty big changes in its configuration mechanism.

This release brings an easier to use mechanism to install and configure your drivers, new rule language features, better support for Falco metrics and many more improvements.

During this release cycle, we merged more than 100 PRs on Falco and more than 180 PRs for libs and drivers, version 0.17.0 and version 7.2.0 respectively. Thank you to our maintainers and contributors, as this would not happen without your support and dedication!

To learn all about these changes, read on!

## What’s new? TL;DR

*Key features:*

* [New capabilities](#driver-loader-magic) in `falcoctl` to automatically select the best driver for your system and make it easier to install
* The [Falco configuration file](#organize-your-falco-configuration-files) can now be split into multiple files to make it more manageable
* [Rule selection](#choose-which-rules-to-load-at-runtime) from configuration file or command line
* [Field transformers and value comparison](#choose-which-rules-to-load-at-runtime)
* [Prometheus metrics support](#prometheus-metrics-support)
* [Plugin API improvements](#plugin-api-improvements)

This release also comes with [breaking changes](#breaking-changes) that you should be aware of before upgrading.

## Major features and improvements

The 0.38.0 release contains a number of feature and UX improvements, here are list of some of the key new capabilities.

### Driver loader magic ✨

If we could pick the most common issue that we've heard from adopters and we experienced first hand is the fact that sometimes we all struggle with installing and upgrading Falco drivers. The Falco team has been tirelessly working for years to improve the installation experience and Linux kernel compatibility with massive changes such as the introduction of the new CO-RE eBPF probe and most recently the complete rewrite of our driver loading component, integrated in falcoctl. With this new version of `falcoctl`, integrated in Falco 0.38.0, our loading tool will automatically detect your system and pick the most compatible driver without any intervention; on recent kernel versions this is likely the modern eBPF probe. As you probably know, the modern probe does not require any extra driver download or compilation, making it load almost instantly. Of course, the tool also allows to select the preferred driver if the automatic choice is not optimal for your use case. On top of that, our driver loader tool can now automatically download kernel headers for many distributions supported by [driverkit](https://github.com/falcosecurity/driverkit) so in many cases you will be able to install even the kernel module without having to install kernel headers first. Read more about how to configure this functionality in the [installation](/docs/install-operate/installation/) documentation page.

### Organize your Falco configuration files 🗃️

Our `falco.yaml` configuration file gains more options, fine tuning configuration flags and feature selection for every release; in fact, they are so many that some people would like to better organize them in separate configuration files which can also be kept across Falco upgrades. Starting from this release you can add list of files or directory to the `config_files` configuration entry, which comes populated with the `/etc/falco/config.d/` directory by default. Any additional file is read in order and can override settings in `falco.yaml`. Read more in the [configuration options](/docs/reference/daemon/config-options/) section of the documentation.

### Choose which rules to load at runtime 📝

We distribute several files that contain community contributed rules and you can always write your own. But how do you select which rules Falco will load at runtime? There are several ways, including using `override`s or specifying command line options such as `-D`, `-t` and `-T`. However, those do not allow you to express something as simple as "I would like to exclude all rules except for this one" or "I would like to include a specific tag and disable some of its rules". Furthermore, you couldn't specify this configuration in your `falco.yaml` file. To make this possible, we introduced a new configuration option, `rules`, that can be specified both in the configuration file or the command line. For instance, you can now write:

```yaml
rules:
  - disable:
      rule: "*"
  - enable:
      rule: Netcat Remote Code Execution in Container
  - enable:
      rule: Delete or rename shell history
```

To finely control your rule loading without modifying the rule files themselves. Read more in [controlling rules](/docs/rules/controlling-rules/#via-falco-configuration-or-parameters).

### Field transformers and value comparison in conditions

Up until now we couldn't write a condition that catches operations like "a process deleting its own executable" because you couldn't use a field value on the right hand side of the condition. Since this version we have added a syntax to do just that with the `val()` operator:

```
evt.type = unlink and proc.exepath = val(fs.path.name)
```

will trigger only if the process exepath is the same as the unlink argument target, meaning that the process is trying to delete its own executable!

In addition you can also apply simple transform operators to both sides of the comparison: `toupper()` and `tolower()` will convert casing as you'd expect and `b64()` can decode base64. Stay tuned for additional transformers to cover more use cases! Read more on [transform operators](/docs/rules/conditions/#transform-operators) in the documentation.

### Prometheus Metrics support 🔥

If you have been following Falco development, you probably know we are constantly improving support for metrics that tell you how the Falco engine is doing. We now have introduced [Prometheus support](/docs/metrics/falco-metrics/#prometheus-support) so you can better integrate Falco with your existing performance monitoring infrastructure, and paves the way for the community to create an official Grafana dashboard that can be integrated in our charts.

### Plugin API improvements ⚙️

Plugins are getting more powerful at each version. We now have a set of experimental APIs to expose metrics and read more into the Falco internal state that our expert plugin authors have been asking about. Stay tuned for more in-depth documentation on those!

## Breaking changes and deprecations ⚠️

This version comes with breaking changes, mostly in the configuration interface

### Changed configuration options

* The `syscall_buf_size_preset` Falco configuration option has been replaced by `engine.<driver>.buf_size_preset` (e.g. `engine.kmod.buf_size_preset`)
* The `syscall_drop_failed_exit` Falco configuration option has been replaced by `engine.<driver>.drop_failed_exit` (e.g. `engine.kmod.drop_failed_exit`)
* The `modern_bpf.cpus_for_each_syscall_buffer` Falco configuration option has been replaced by `engine.modern_ebpf.cpus_for_each_buffer`
* The `syscall_event_drops` Falco configuration option has been replaced by the `metrics` config plus some automatic notification on drops.

### Removed command line options and equivalent configuration options

The `--modern_ebpf` command line option has been replaced by `engine.kind: modern_ebpf` in `falco.yaml` (or, on the command line `-o engine.kind=modern_ebpf`). Likewise, `--nodriver` is now `engine.kind: nodriver`.

The environment variable `FALCO_BPF_PROBE` is replaced by `engine.ebpf.probe` configuration option. Example:

```yaml
engine:
  kind: ebpf
  ebpf:
    # path to the elf file to load.
    probe: ${HOME}/.falco/falco-bpf.o
```

The `-e` option to load capture files is no longer available. In order to read a capture file use the configuration option `engine.replay.capture_file`. Since options can be specified on both the command line and the configuration file, an equivalent command line as `falco -e <file.scap>` is `falco -o engine.kind=replay -o engine.replay.capture_file=<file.scap>`

The gVisor command line options have been replaced by equivalent configuration options. `-g`/`--gvisor-config` is now `engine.gvisor.config` while `--gvisor-root` is now `engine.gvisor.root`. Example `falco.yaml` configuration file:

```yaml
engine:
  kind: gvisor
  gvisor:
    # A Falco-compatible configuration file can be generated with
    # '--gvisor-generate-config' and utilized for both runsc and Falco.
    config: "/etc/docker/runsc_falco_config.json"
    # Set gVisor root directory for storage of container state when used
    # in conjunction with 'gvisor.config'. The 'gvisor.root' to be passed
    # is the one usually passed to 'runsc --root' flag.
    root: "/var/run/docker/runtime-runc/moby"
```

Or, equivalent writing on the command line:

```
falco -o engine.kind=gvisor -o engine.gvisor.config=/etc/docker/runsc_falco_config.json -o engine.gvisor.root=/var/run/docker/runtime-runc/moby
```

You can find more information on breaking changes in the [tracking issue](https://github.com/falcosecurity/falco/issues/2840).

### Deprecations

In Falco 0.39.0 we will remove the `-D`, `-t`, `-T` options, continuing our tradition of removing single-character options that nobody remembers what they do.

## Try it out

Interested in trying out the new features? Use the resources below to get started.

* [Container Images](/docs/getting-started/running/#docker)
  * `falco` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco))
  * `falco-no-driver` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-no-driver), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-no-driver))
  * `falco-driver-loader` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-driver-loader), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-driver-loader))
* [CentOS/Amazon Linux](/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](/docs/getting-started/installation/#debian)
* [openSUSE](/docs/getting-started/installation/#suse)
* [Linux binary package](/docs/getting-started/installation/#linux-binary)

## What’s next?

Falco is more mature with each release. Following its [graduation](/blog/falco-graduation/) we have published the [roadmap](/docs/roadmap/#road-to-falco-1-0-0) for version 1.0.0 which is guiding us in the next steps. As you can see, this version is addressing some of the roadmap points with our changes to configuration and CLI options and adding rule constructs and drivers. For the next release, you can expect more stability, streamlined container images, refinements to our rule syntax, new detections and more.

## Stay connected

Join us on social media and in our weekly community calls! It’s always great to have new members in the community, and we’re looking forward to hearing your feedback and ideas.

You can find all the most up-to-date information at [https://falco.org/community/](https://falco.org/community/).
