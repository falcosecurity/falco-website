---
title: Introducing Falco 0.45.0
date: 2026-09-21
author: Leonardo Grasso, Alessandro Cannarella
slug: falco-0-45-0
tags: ["Falco", "Release"]
draft: true
---

Dear Falco Community, we are happy to announce the release of Falco 0.45.0 today!

This release brings raw byte matching in rule conditions, new reload status and control endpoints, and fixes for
package upgrades and container metadata collection. It also improves modern eBPF capture on preemptible kernels
and adds sandbox rules for detecting suspicious GPU activity in containers.

We upgraded libs to `0.26.0` and drivers to `11.0.0+driver`. We also ship `falcoctl 0.14.2`, the `container` plugin
`0.7.4`, and `falco-rules 5.2.0`. Thank you to everyone who contributed code, tested the release, and reported issues!

## What's new? TL;DR

- [Raw byte matching and output escaping](#raw-byte-matching-and-output-escaping)
- [Reload status and control](#reload-status-and-control)
- [More reliable package upgrades](#more-reliable-package-upgrades)
- [Wildcard matching fixes](#wildcard-matching-fixes)
- [Security hardening](#security-hardening)
- [Modern eBPF improvements](#drivers)
- [Container plugin robustness](#plugins)
- [GPU detection rules](#rules)
- [Helm chart fixes](#kubernetes)

{{% pageinfo color="warning" %}}
This release includes [breaking changes](#breaking-changes-and-action-required). Before upgrading, review custom
rules and output consumers, and make sure your deployment uses a matching driver.
{{% /pageinfo %}}

## Major features and improvements

### Raw byte matching and output escaping

Falco 0.45.0 preserves the original bytes when extracting field values for rule matching. Previously, invalid UTF-8
sequences were sanitized before comparisons, so a rule could not distinguish the original bytes from their
replacement characters.

Rule conditions now accept `\xHH` escapes to express individual bytes. This is useful when matching filenames or
process arguments containing bytes that cannot be represented as ordinary UTF-8 text. The `regex` operator remains
an exception: it continues to work on sanitized input.

Output formatting changes too. Both text and JSON output escape control characters and replace invalid UTF-8
sequences. Matching and display therefore serve different purposes: rules inspect the original data, while alerts
keep a printable representation.

**Review custom rules that relied on sanitization**, along with tools that parse Falco's formatted output. See the
[raw byte matching changes](https://github.com/falcosecurity/libs/pull/3051) and
[output formatting changes](https://github.com/falcosecurity/falco/pull/3942) for details.

### Reload status and control

Two new **incubating** interfaces make reloads easier to coordinate and observe. The webserver's `GET /reload`
endpoint reports process identity, reload generations, and readiness. Integrations can use that information to
check whether Falco has completed a requested reload.

The optional `reload_control` configuration opens a Unix socket accepting `POST /reload`. It is disabled by default
and checks socket directory permissions before starting. Reload requests use this local socket; the webserver's
endpoint provides status.

We also fixed `SIGHUP` handling: hot reload works when `watch_config_files` is disabled, and requests arriving
during a reload are preserved. See the [reload interfaces](https://github.com/falcosecurity/falco/pull/4005) and
[SIGHUP fix](https://github.com/falcosecurity/falco/pull/3939).

These interfaces support the Falco Operator integration, which we will cover in a separate blog post.

### More reliable package upgrades

DEB and RPM upgrades now restore the selected Falco service and driver. This fixes cases where an upgrade left
Falco stopped or its kernel module unavailable to `modprobe`. Package-generated driver pins migrate to the new
default, while different custom pins are preserved.

Upgrades follow the same driver-selection settings as installation. `FALCO_DRIVER_CHOICE=none` skips driver setup,
and `FALCOCTL_DRIVER_VERSION` lets you specify an explicit driver version during the transaction. Administrator-created
service masks are preserved.

The bundled `falcoctl 0.14.2` also preserves DKMS installations when installing cached kernel modules, so reinstalling
a driver does not remove the persistent installation needed by later service starts.

For details, see the [package lifecycle fix](https://github.com/falcosecurity/falco/pull/3994) and
[falcoctl driver fix](https://github.com/falcosecurity/falcoctl/pull/1089).

### Wildcard matching fixes

Wildcard matching now tries later matches when an earlier one fails. This fixes patterns used to enable or disable
rules by name and to discover rules files in a directory. For example, `*.yaml` correctly matches
`backup.yaml.yaml`, which was previously skipped. See the
[wildcard matching fix](https://github.com/falcosecurity/falco/pull/3913).

### Security hardening

This release includes several targeted fixes:

- [Pidfile creation rejects symlinks](https://github.com/falcosecurity/falco/pull/3871), protecting installations
  whose configured pidfile directory is writable by other users.
- [Kernel module fallback loading uses an absolute `modprobe` path](https://github.com/falcosecurity/falco/pull/3943),
  removing its dependency on the process's `PATH`.
- [Capture replay and conversion validate malformed events](https://github.com/falcosecurity/libs/pull/3032)
  before accessing or rebuilding them.
- [File descriptor cache invalidation](https://github.com/falcosecurity/libs/pull/3045) fixes a use-after-free
  triggered by `close_range` followed by `dup2` or `dup3`.

## Drivers

Drivers `11.0.0+driver` address a modern eBPF race on preemptible kernels. The probe uses two auxiliary buffers
per CPU to protect event construction when execution is interrupted. This doubles **auxiliary map memory per CPU**.

New counters expose drops caused by reentrancy and exhausted auxiliary buffers, along with CPU migrations. These
make it easier to distinguish capture pressure related to preemption from other causes of dropped events.

The protection requires BPF atomic operations. Falco checks support at load time; kernels lacking the required
support use a fallback and emit a warning. The driver API also moves to `11.0.0`, so older drivers are incompatible
with the new userspace.
See the [preemption handling changes](https://github.com/falcosecurity/libs/pull/3086).

## Plugins

The bundled `container` plugin `0.7.4` improves startup and metadata recovery. Its `engine_timeout` option defaults
to 10 seconds, preventing an unresponsive runtime socket from blocking Falco startup indefinitely. Setting it to
`0` disables the timeout.

When an engine responds but its initial container listing is interrupted, the plugin keeps the metadata already
collected and retrieves missing information in the background. Containers may temporarily lack metadata while
those lookups complete. See the [container plugin documentation](https://github.com/falcosecurity/plugins/blob/plugins/container/v0.7.4/plugins/container/README.md).

For RHEL 8 and UBI 8 users, the bundled plugin also fixes the missing `libresolv` dependency. The
`LD_PRELOAD` workaround documented for earlier Falco versions is no longer needed. See the
[linking fix](https://github.com/falcosecurity/plugins/pull/1501).

## Rules

The stable ruleset [`falco-rules 5.2.0`](https://github.com/falcosecurity/rules/releases/tag/falco-rules-5.2.0)
reduces false positives in `Read sensitive file untrusted` by excluding expected systemd helper activity.

The sandbox ruleset [`falco-sandbox-rules 6.2.0`](https://github.com/falcosecurity/rules/releases/tag/falco-sandbox-rules-6.2.0)
adds two rules targeting GPU resource hijacking:

- `Container Accessing GPU Device` detects containers opening GPU or accelerator devices.
- `GPU Management Tool Run in Container` detects tools such as `nvidia-smi` and `rocm-smi` running inside containers.

Both rules are **disabled by default**. Tune `user_known_gpu_workloads` for legitimate GPU workloads before enabling
them. The incubating ruleset remains at `6.0.1`.

## Kubernetes

Helm chart `9.2.0` includes two important deployment fixes:

- A dedicated `emptyDir` for the configuration snippets directory prevents image-provided configuration from
  adding a duplicate `container` plugin when falcoctl is disabled.
- Container runtime mounts use the directories containing the sockets, allowing Falco to keep accessing them
  after a runtime restart replaces the socket files.

The chart also adds `revisionHistoryLimit` and `serviceAccount.labels`, fixes Grafana priority mappings, and updates
plugin and subchart dependencies. See the
[chart changelog](https://github.com/falcosecurity/falco/blob/release/0.45.x/chart/falco/CHANGELOG.md).

## Breaking changes and action required

Before upgrading, please review the following:

- **Drivers:** deploy drivers compatible with API `11.0.0`. Falco 0.45.0 refuses older kernel modules and probes.
  Account for the additional auxiliary map memory when using modern eBPF.
- **Rules and output consumers:** check comparisons that depended on UTF-8 sanitization and parsers that relied on
  the previous output escaping.
- **Container configuration:** remove obsolete `container_engines.*` settings and configure the container plugin
  instead, for example through its `engines.cri.sockets` setting. The obsolete key has also been
  [removed from the configuration schema](https://github.com/falcosecurity/falco/pull/3924).
- **Package upgrades:** account for the selected service being started and the driver being installed during
  upgrades. Review custom driver pins and unattended installation settings.

## Try it out

Ready to try Falco 0.45.0? Get started with the
[installation documentation](https://falco.org/docs/setup/),
[container images](https://hub.docker.com/r/falcosecurity/falco), or
[Helm chart](https://github.com/falcosecurity/charts/tree/master/charts/falco).

## Stay connected

We look forward to hearing your feedback! Join the conversation, share your experience, or help improve the next
release. Find our community channels and calls on the [Falco community page](https://falco.org/community/).
