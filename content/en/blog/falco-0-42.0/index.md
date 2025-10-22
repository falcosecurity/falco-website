---
title: Introducing Falco 0.42.0
date: 2025-10-22
author: Leonardo Di Giovanna, Leonardo Grasso, Iacopo Rozzo
slug: falco-0-42-0
tags: ["Falco","Release"]
---

Dear Falco Community, today we are happy to announce the release of Falco 0.42.0!

This release brings exciting new capabilities, including the capture feature, significant performance improvements, and important bug fixes that enhance Falco's capabilities.
During this release cycle, we merged:

* 52 PRs on Falco,  including 23 release note-worthy changes
* 110 PRs on Falco libs, including 47 release note-worthy changes
* 102 PRs on Falco drivers, including 29 release note-worthy changes

We upgraded libs to version 0.22.1 and drivers to v9.0.0+driver. Thank you to our maintainers and contributors. This would not have been possible without your support and dedication!

To learn everything about the changes, read on!

## What's new? TL;DR

*Key features:*

* [Capture recording feature](#capture-recording-feature);
* [Drop enter initiative for performance](#drop-enter-initiative);
* [Plugin event schema validation](#plugin-event-schema-versioning);
* [Thread table auto-purging configuration](#thread-table-auto-purging-configuration);

*Key fixes:*

* Fix thread table memory leak when parsing vfork (or equivalent clone/clone3 with CLONE_VFORK) exit from the caller process;
* Enable handling of multiple actions configured with `syscall_event_drops.actions`;
* Disable dry-run restarts when Falco runs with config-watching disabled;
* Fix abseil-cpp for Alpine build;
* Fix detection sandbox containers for CRI and containerd runtimes (container plugin);
* Stability improvements for container plugin and static linking of libgcc/libstdc++ for legacy compatibility;

{{% pageinfo color="warning" %}}
This release also comes with [breaking changes](#breaking-changes-and-deprecations-%EF%B8%8F) that you should be aware of before upgrading.
{{% /pageinfo %}}

## Major features and improvements

The 0.42.0 release contains a new capture feature and significant performance improvements. Here is a list of the key new capabilities.

### Capture recording feature

Falco 0.42.0 introduces the new capture recording feature, now available at sandbox maturity. This capability allows Falco to generate `.scap` files whenever a detection rule is triggered automatically.

Each capture contains a detailed trace of system calls around the event, providing forensic-level visibility into what happened. The recordings can be opened directly in Stratoshark for Wireshark-style analysis of runtime behavior.

The capture system is fully configurable: you can enable global recording or tie captures to specific Falco rules for targeted runtime snapshots.

When targeting specific Falco rules (by setting `mode: rules`, as shown in the configuration below), users can modify individual rules to enable capture by adding `capture: true` and optionally `capture_duration` to specific rules.
For example:

```yaml
 - rule: Suspicious File Access
   desc: Detect suspicious file access patterns
   condition: >
     open_read and fd.name startswith "/etc/"
   output: >
     Suspicious file access (user=%user.name command=%proc.cmdline file=%fd.name)
   priority: WARNING
   capture: true
   capture_duration: 10000  # Capture for 10 seconds when this rule triggers
```

This configuration will capture events for 10 seconds whenever the "Suspicious File Access" rule is triggered, overriding the default duration.

Find below the configuration snippet to enable the capture feature in `falco.yaml`:

```yaml
capture:
  # -- Set to true to enable event capturing.
  enabled: false
  # -- Prefix for capture files. Falco appends a timestamp and event number to ensure unique filenames.
  path_prefix: /tmp/falco
  # -- Capture mode. Can be "rules" or "all_rules".
  mode: rules
  # -- Default capture duration in milliseconds if not specified in the rule.
  default_duration: 5000
```

**Learn more at KubeCon + CloudNativeCon North America 2025:**
- [Project Lightning Talk: When Falco Spots Trouble, The Shark Swims In](https://kccncna2025.sched.com/event/27d4o/project-lightning-talk-when-falco-spots-trouble-the-shark-swims-in-gerald-combs-falco-core-maintainer) - Gerald Combs, Falco Core Maintainer
- [Beyond the Cloud(s): Falco's Ascent in Performance and Deep Visibility](https://kccncna2025.sched.com/event/27No0/beyond-the-clouds-falcos-ascent-in-performanc[…]eep-visibility-leonardo-grasso-leonardo-di-giovanna-sysdig) - Leonardo Grasso & Leonardo Di Giovanna, Sysdig

### Drop enter initiative

We've just shipped a significant performance improvement: syscall enter events have been completely removed from our event pipeline.

In Falco, each system call traditionally used to generate two events: an enter event when syscall kernel processing starts (i.e., before its arguments are processed) and an exit event when the kernel processing completes. Now that we collect all relevant information on exit events, we can drop the generation and processing of enter events.

Nevertheless, for TOCTOU (Time-of-Check to Time-of-Use) mitigation, a few selected enter events are still monitored internally — their relevant data is captured and stored — but these events are no longer pushed downstream to the userspace processing pipeline.

By focusing solely on syscall exit events, we've nearly halved the number of events generated and processed by userspace, eliminating redundant data collection.
This reduces the Falco instrumentation overhead, improving workloads' performance up to 20% (by reducing syscall execution latency).
It also decreases Falco's CPU usage up to 30%, especially in high-syscall environments.

From a developer's perspective, this also removes ambiguity about where syscall parameters should be defined, streamlines event processing logic, and makes event handling code cleaner and easier to maintain.

Overall, you can expect better performance, leaner code, and a more predictable event model moving forward.

For more details, see:
- [Proposal](https://github.com/falcosecurity/libs/pull/2068)
- [[Tracking] Extend syscall exit events with syscall enter events parameters](https://github.com/falcosecurity/libs/issues/2427)
- [TOCTOU mitigation](https://github.com/falcosecurity/libs/issues/2407)
- [[Tracking] Drop syscall enter events](https://github.com/falcosecurity/libs/issues/2588)

### Plugin event schema versioning 

Falco 0.42.0 introduces plugin event schema validation, enabling plugins to specify their compatible event schema version.

It provides an event schema validation system for syscall events consumed by plugins that offer parsing and/or field extraction capabilities, ensuring backward compatibility and clear error reporting for plugins that depend on specific Event Schema Versions.

If the plugin does not declare a required Schema Version, it is assumed to be compatible with 3.0.0, the initial major version when the plugin event schema validation was introduced.

The plugins should implement a new function of the Plugin API to declare the required schema version.
Find below the signature of the new API function:

```
// New plugin API functions for schema management
typedef struct {
  ...
   // Event schema version check
   //
   // Return the minimum event schema version required by this plugin.
   // Required: no
   // Arguments:
   // - s: the plugin state, returned by init(). Can be NULL.
   // Return value: the event schema version string, in the following format:
   //       "<major>.<minor>.<patch>", e.g. "4.0.0".
   //       If the function is not implemented or NULL is returned, the plugin is assumed to be
   //       compatible with schema version 3.0.0.
   //
   const char* (*get_required_event_schema_version)(ss_plugin_t* s);
} plugin_api;
```

For more details, see:
- [Plugin system event schema versioning proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20250923-plugin-system-event-schema-versioning.md)

### Thread table auto-purging configuration

We've added a few new `falco_libs` configurations for advanced users who want finer control over Falco's performance and resource usage.
It introduces tunable parameters for Falco's internal thread table, which tracks active threads:

* `thread_table_size` defines the maximum number of entries.
* `thread_table_auto_purging_interval_s` controls how often stale threads are cleaned up.
* `thread_table_auto_purging_thread_timeout_s` sets how long inactive threads are kept before removal.

These options let you balance memory efficiency, CPU usage, and state accuracy, with related metrics (`n_drops_full_threadtable`, `n_store_evts_drops`) available to guide tuning.

## Breaking changes and deprecations ⚠️

This version comes with breaking changes that you should be aware of before upgrading.

### Event direction and `evt.dir` deprecation

Following the enter events initiative, the `evt.dir` field, as well as the concept of "direction", have been deprecated in Falco `0.42.0` and will be removed in a future release.
Until field removal and since Falco `0.42.0`, specifying `evt.dir='>'` will match nothing, while specifying `evt.dir='<'` will match everything, with a warning informing the user about the deprecation.
Users are encouraged to get rid of any reference to `evt.dir`, as its presence will result in an error at rules loading time after its removal.

### Plugin API changes

* Old plugins consuming syscall events not declaring the required event schema version will be incompatible with Falco 0.42.0 and later.

### Deprecation warnings

Falco 0.42.0 introduces several deprecation warnings to help users migrate to newer APIs:

* **evt.dir field deprecation**: Rules using the deprecated `evt.dir` field will now generate warnings;
* **Enter events drop stats**: Prometheus metrics for enter events drop statistics have been deprecated;
* **Configuration warnings**: Enhanced warning system for deprecated configuration options;


## Try it out

Interested in trying out the new features? Use the resources below to get started.

* [Container Images](/docs/getting-started/running/#docker)
    * `falco` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco))
    * `falco-driver-loader` ([DockerHub](https://hub.docker.com/r/falcosecurity/falco-driver-loader), [AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco-driver-loader))
* [CentOS/Amazon Linux](/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](/docs/getting-started/installation/#debian)
* [openSUSE](/docs/getting-started/installation/#suse)
* [Linux binary package](/docs/getting-started/installation/#linux-binary)

## Stay connected

Join us on social media and in our community calls, held every other Wednesday! It's always great to have new members in the community, and we're looking forward to hearing your feedback and ideas.

You can find all the most up-to-date information at [https://falco.org/community/](https://falco.org/community/).
