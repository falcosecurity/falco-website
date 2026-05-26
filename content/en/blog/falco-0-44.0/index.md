---
title: Introducing Falco 0.44.0
date: 2026-05-26
author: Leonardo Di Giovanna, Leonardo Grasso, Iacopo Rozzo, Alessandro Cannarella
slug: falco-0-44-0
tags: [ "Falco","Release" ]
---

Dear Falco Community, we are happy to announce the release of Falco 0.44.0 today!

This release completes the deprecation cycle started in 0.42.0 and 0.43.0: the legacy eBPF probe, the gVisor engine, and
the gRPC output (along with the gRPC server) are now fully removed from the entire stack. On top of that, 0.44.0 brings
new rule-language capabilities, a long-requested safety knob for the capture feature, JSON output for the `--list`
family of commands, a substantial round of performance work on process tree lookups, and a wave of multi-thread safety
fixes that lay the groundwork for the upcoming multi-threaded Falco architecture.

During this release cycle, we merged:

* 60 PRs on Falco, including 14 release note-worthy changes
* 160 PRs on Falco libs, including 54 release note-worthy changes
* 16 PRs on Falco drivers, including 3 release note-worthy changes

We upgraded libs to version `0.25.2` and drivers to `10.2.0+driver`. We also ship `falcoctl 0.13.0`, the `container`
plugin `0.7.1`, and the `falco-rules` ruleset `5.1.0`. Thank you to our maintainers and contributors. This would not
have been possible without your support and dedication!

To learn everything about the changes, read on!

## What's new? TL;DR

*Major features and improvements:*

* [Comparison operator list modifiers (`oneof`/`anyof`/`allof`)](#comparison-operator-list-modifiers)
* [Hard limit on capture file size](#hard-limit-on-capture-file-size)
* [Stricter rule schema validation](#stricter-rule-schema-validation)
* [Backslash escaping in `-o` dotted key paths](#backslash-escaping-in--o-dotted-key-paths)
* [JSON output for the listing CLI commands](#json-output-for-the-listing-cli-commands)
* [Faster process tree lookups](#faster-process-tree-lookups)
* [Multi-thread safety hardening](#multi-thread-safety-hardening)

*Drivers:*

{{% pageinfo color="warning" %}}
The kernel module pre-builds for this release are still being produced and will be available within a couple of days
from the release. In the meantime, `falcoctl` can build the kernel module locally on the host.
{{% /pageinfo %}}

* [Drivers: new syscall, kernel 7.0, and BPF iterators](#drivers-new-syscall-kernel-70-and-bpf-iterators)

*Plugins:*

* [Container plugin fix for containerd v2.3.0](#container-plugin-fix-for-containerd-v230)
* [Plugin library path traversal hardening](#plugin-library-path-traversal-hardening)

*Event generator:*

* [Event generator: HTTP output and new `suite` namespace](#event-generator-http-output-and-new-suite-namespace)

*Rules:*

* [Updated ruleset (falco-rules 5.1.0)](#rules)

*Kubernetes:*

* [Kubernetes Operator: Helm chart, artifact startup gating and minor fixes](#kubernetes-operator-helm-chart-artifact-startup-gating-and-minor-fixes)
* [Source-managed Helm chart publication flow](#source-managed-helm-chart-publication-flow)

*Major cleanups (previously deprecated, now removed):*

* [Legacy eBPF probe removal](#legacy-ebpf-probe-removal)
* [gVisor engine removal](#gvisor-engine-removal)
* [gRPC output and server removal](#grpc-output-and-server-removal)

{{% pageinfo color="warning" %}}
This release comes with [breaking changes](#breaking-changes-and-deprecations) you should be aware of before upgrading.
In particular, the driver API and schema have undergone a major bump: the kernel module and modern eBPF probe shipped
with Falco 0.43.0 are not compatible with Falco 0.44.0 userspace. Make sure to redeploy a matching driver when
upgrading.
{{% /pageinfo %}}

## Major features and improvements

### Comparison operator list modifiers

Falco 0.44.0 introduces three new modifiers - `oneof`, `anyof`, and `allof` - for comparison operators in rule
conditions and single-field exceptions. They let you apply a comparison operator (e.g. `=`, `!=`, `startswith`,
`contains`, `endswith`, `regex`) against a list of values without writing it out multiple times.

For example, rather than:

```yaml
- rule: Sensitive Process Exec
  condition: >
    spawned_process and (proc.name startswith "ssh"
                        or proc.name startswith "sudo"
                        or proc.name startswith "systemd")
```

you can now write:

```yaml
- rule: Sensitive Process Exec
  condition: >
    spawned_process and proc.name startswith anyof (ssh, sudo, systemd)
```

Each modifier is syntactic sugar: match against the expression `field <op> <mod> (e0, e1, ... en)` is determined by
expanding it into the sub-expressions `field <op> e0`, `field <op> e1`, ... `field <op> en`, and combining them
according to the modifier `<mod>`:

* `oneof` - matches when **exactly one** of the sub-expressions matches;
* `anyof` - matches when **at least one** sub-expression matches; equivalent to ORing them;
* `allof` - matches when **all** sub-expressions match; equivalent to ANDing them.

The left-hand side is required to produce a single value at runtime, and the overall expression always fails to match if
the list on the right-hand side is empty.

A few useful combinations:

* `proc.name = anyof (sshd, sudo, su)` - the classic "value is in the list", which expands to
  `proc.name = sshd or proc.name = sudo or proc.name = su`;
* `proc.name != allof (sshd, sudo, su)` - the matching negation "value is not in the list", which expands to
  `proc.name != sshd and proc.name != sudo and proc.name != su` (note that `!= anyof` would not do this: it would
  expand to ORed inequalities, which trivially match whenever the list has two distinct items);
* `proc.cmdline contains allof (curl, bash)` - the cmdline contains both substrings:
  `proc.cmdline contains curl and proc.cmdline contains bash`;
* `proc.name startswith oneof (kube-, etcd-)` - exactly one prefix matches, handy when the list items are mutually
  exclusive;
* `proc.name regex anyof ("^python[23]\\.[0-9]+$", "^node[0-9]+$")` - the process name matches at least one of the
  patterns (e.g. `python3.11` or `node18`):
  `proc.name regex "^python[23]\\.[0-9]+$" or proc.name regex "^node[0-9]+$"`.

The modifiers are also accepted in single-field exception `comps`, making it easier to keep exception lists concise.
For instance, the exception:

```yaml
- name: trusted_process_prefixes
  fields: proc.name
  comps: startswith anyof
  values:
    - kube-
    - etcd-
    - containerd-
```

appends `... and not proc.name startswith anyof (kube-, etcd-, containerd-)` to the rule condition, suppressing it
whenever `proc.name` starts with one of the listed prefixes. Before 0.44.0 the single-field exception shortcut only
accepted `in`, `pmatch`, and `intersects` as `comps`, since those are the only operators that natively consume a list
on the right-hand side; the new modifiers extend the shortcut to any comparison operator.

For more details see [#3878](https://github.com/falcosecurity/falco/pull/3878)
and [libs#2984](https://github.com/falcosecurity/libs/pull/2984).

### Hard limit on capture file size

The capture recording feature introduced in 0.42.0 now supports a global, per-file hard cap on capture size via the new
`capture.max_file_size_mb` configuration option. The limit applies to every generated capture file, cannot be
overridden by individual rules, and accepts any value between 0 and 1,048,576 MB (0 means unlimited). When a capture is
truncated to honor the limit, Falco emits an informational message in its logs.

```yaml
capture:
  enabled: true
  mode: rules
  # New in 0.44.0: hard cap on capture file size, in MB. 0 means unlimited.
  max_file_size_mb: 100
```

For more details see [#3824](https://github.com/falcosecurity/falco/pull/3824).

### Stricter rule schema validation

The rule loader now rejects unknown top-level keys in `- rule:`, `- macro:`, and `- list:` items instead of silently
ignoring them. Misspelled or unsupported keys now produce a clear validation error at load time, which helps catch
silent misconfigurations early. The same change makes `warn_evttypes`, `skip-if-unknown-filter`, `capture`,
`capture_duration`, and `tags` first-class targets of the rule `override` mechanism.

For more details see [#3805](https://github.com/falcosecurity/falco/pull/3805).

### Backslash escaping in `-o` dotted key paths

The `-o` CLI option now supports backslash escaping in dotted key paths, so you can target keys that contain literal
dots, brackets, or backslashes (e.g. `-o "base.dotted\.key=val"`).

For more details see [#3835](https://github.com/falcosecurity/falco/pull/3835).

### JSON output for the listing CLI commands

The `--list` and `--list-events` subcommands gained a new `--format text|markdown|json` flag. The new JSON output makes
it easy to consume the list of supported fields and events from tooling, integrations, and documentation pipelines. The
legacy `--markdown` flag is now deprecated in favor of `--format markdown`; it still works, but emits a runtime warning.

For more details see [#3803](https://github.com/falcosecurity/falco/pull/3803)
and [libs#2837](https://github.com/falcosecurity/libs/pull/2837).

### Faster process tree lookups

Falco maintains a process tree to enrich syscall events with thread, file descriptor, and connection metadata. The
tree is kept up to date by the stream of events flowing from the drivers; on top of that, Falco also needs a separate
lookup path for the cases where events are not enough: building the initial state at startup, and refilling any stale
or missing entries that Falco detects later on (typically as a consequence of dropped events). Historically this
lookup path has been implemented by scraping `/proc` from user space. Falco 0.44.0 reworks it on two fronts:

* the user-space `/proc` parsers have been rewritten to reduce allocations and CPU cost - both the process metadata
  parsers and the network/file descriptor parsers have been overhauled;
* a new kernel-side lookup path has been introduced, based on modern BPF iterators exposed by the driver. BPF
  iterators give libs an in-process walker for tasks and file descriptors that avoids the round-trips and string
  parsing inherent to scraping `/proc` from user space, and provides a more efficient lookup path on systems where
  the modern eBPF probe is available.

Because the same lookup machinery is used in both scenarios, these improvements pay off twice: cold start times go
down on systems with many running processes and active connections, and the steady-state cost of recovering from
dropped events is reduced as well.

For more details see the tracking issues
[libs#2784](https://github.com/falcosecurity/libs/issues/2784) and
[libs#2879](https://github.com/falcosecurity/libs/issues/2879).

### Multi-thread safety hardening

Falco 0.44.0 includes a round of multi-thread safety fixes that touch core building blocks: `random()` is replaced with
a thread-local `std::mt19937`, `gmtime`/`localtime` are replaced with their reentrant `_r` counterparts, `strerror` is
replaced with `strerror_r`, and a watchdog race condition on timeout exchange has been fixed using proper memory
orderings. Portable compatibility wrappers were also added for macOS, musl, WASM, and Win32.

These changes are part of the broader effort outlined in the
[Multi-thread Falco design proposal](https://github.com/falcosecurity/falco/blob/0.44.0/proposals/20251205-multi-thread-falco-design.md),
which is now available in the Falco repository. While 0.44.0 does not yet enable multi-threading at runtime, this work
lays the foundation for the upcoming concurrent architecture.

For more details see the [`random()` fix](https://github.com/falcosecurity/falco/commit/f004258b),
the [`gmtime`/`localtime` fix](https://github.com/falcosecurity/falco/commit/6a00de21),
the [`strerror` fix](https://github.com/falcosecurity/falco/commit/127f0b2a),
and the [watchdog race condition fix](https://github.com/falcosecurity/falco/pull/3820).

## Drivers: new syscall, kernel 7.0, and BPF iterators

The drivers shipped with Falco 0.44.0 are at version `10.2.0+driver`, up from `9.1.0+driver` in 0.43.0. The modern
eBPF probe and kernel module now support the `keyctl` syscall, making it possible to observe key-management operations
from Falco rules. The modern eBPF probe also gains support for Linux kernel 7.0 and includes fixes for the BPF
verifier on kernel 6.19 and newer.

Other notable driver changes:

* support for 32-bit encoded fds/pids;
* support for synchronous file/task fetching via modern BPF iterators;
* the kernel module now builds correctly on clang+LTO kernels and the s390 compat layer is compiled conditionally;
* euid/egid/loginuid are now consistently exported from the init user namespace by both drivers;
* new `metrics.kernel_iter_event_counters_enabled` knob exposes kernel-side BPF-iterator event and drop counters in
  Falco's metrics output, complementing the existing `kernel_event_counters_enabled` knob.

For more details see the [`keyctl` syscall support](https://github.com/falcosecurity/libs/pull/2944),
the [kernel 7.0 support](https://github.com/falcosecurity/libs/pull/2997),
the [BPF verifier fixes for kernel 6.19+](https://github.com/falcosecurity/libs/pull/2893),
the [32-bit encoded fds/pids support](https://github.com/falcosecurity/libs/pull/2883),
the [modern BPF iterators work](https://github.com/falcosecurity/libs/issues/2879),
the [clang+LTO kernel module build fix](https://github.com/falcosecurity/libs/pull/2791),
the [conditional s390 compat layer](https://github.com/falcosecurity/libs/pull/2961),
the [init user namespace export for euid/egid/loginuid](https://github.com/falcosecurity/libs/pull/3000),
and the [BPF-iterator metrics knob](https://github.com/falcosecurity/falco/pull/3840).

## Plugins

### Container plugin fix for containerd v2.3.0

The `container` plugin shipped with Falco 0.44.0 is at version `0.7.1`, and includes a high-impact fix for users
running on recent Kubernetes clusters. On `containerd v2.3.0` nodes (CRI API v0.36) the CRI-O-specific `runtimeSpec`
field is not populated in the sandbox info JSON; when `CNIResult` is also absent, the plugin's CNI fallback path
dereferenced a nil pointer and panicked. The fix wraps the annotation lookup in a nil check, matching the existing
pattern already used elsewhere for the same field, and prevents the resulting `CrashLoopBackOff` that would otherwise
affect all Falco DaemonSet pods on the impacted nodes.

Version `0.7.0` also deprecated `container.healthcheck`, `container.liveness_probe`, `container.readiness_probe`, and
the related `proc.is_container_*` fields, and dropped their implementation in the same release. The motivation is
twofold: these fields relied on the `kubectl.kubernetes.io/last-applied-configuration` annotation, which is fragile
and Kubernetes-specific; and the liveness/readiness probes had only ever been implemented for Docker - they had been
silently broken on CRI runtimes (containerd, CRI-O) for 6+ years. No official Falco rules referenced them, and the
long-term plan is to move the functionality to the `k8smeta` plugin. If you were relying on these fields in custom
rules, please review the
[plugin CHANGELOG](https://github.com/falcosecurity/plugins/blob/main/plugins/container/CHANGELOG.md) for details.

For more details see [plugins#fbfa3004](https://github.com/falcosecurity/plugins/commit/fbfa3004)
and [plugins#1265](https://github.com/falcosecurity/plugins/pull/1265).

### Plugin library path traversal hardening

The configuration loader now rejects plugin `library_path` values that try to traverse outside the configured plugin
directory via `..`, regardless of operating system path separator. This protects against a class of misconfigurations
and hostile input that could otherwise lead a Falco process to load a library from an unexpected location.

For more details see [#3850](https://github.com/falcosecurity/falco/pull/3850).

## Event generator: HTTP output and new `suite` namespace

The `event-generator` ships as `v0.13.0`. Two main themes: a breaking switch from gRPC to HTTP for retrieving alerts
from Falco (mirroring the gRPC removal on the Falco side), and the introduction of a new `suite` command namespace
for declaratively authoring and running end-to-end tests against Falco rules.

A `suite` description is a YAML document that declares a sequence of steps to perform (syscalls, file/directory
operations, process chains, container operations) and the Falco rule expected to fire as a result. Templates let
descriptions be parameterized and reused; field bindings let later steps reference values produced by earlier ones
(for example, the file descriptor returned by an `open` step can be passed to a subsequent `read`). Running the
description with `event-generator suite test` then drives Falco and reports whether the expected rule actually
fired - say, that opening `/etc/shadow` triggers `Read sensitive file untrusted`.

For more details see the
[`suite` command documentation](https://github.com/falcosecurity/event-generator/blob/main/docs/event-generator_suite.md).

## Rules

Falco 0.44.0 ships with `falco-rules 5.1.0`. A few highlights:

* fixed CVE detections - `Sudo Potential Privilege Escalation (CVE-2021-3156)` and `Polkit Local Privilege Escalation
  (CVE-2021-4034)` now actually fire (replaced `user.uid` with `user.loginuid`, which survives SUID transitions);
* new supply-chain rule - `Network Tool Executed During NPM Package Install` catches network tools spawned from
  `npm`/`yarn`/`pnpm`/`bun` install scripts;
* six new sandbox rules from XPAV - `Known Cryptominer Process Executed`, `Web Server Spawned Shell`, `Web Server
  Spawned Suspicious Child Process`, `Reverse Shell from Web Server`, `Privileged Container Device Access`, `Container
  Access to Host Sensitive Paths`;
* false-positive reductions - `Run shell untrusted` now excludes CloudNativePG; `Read sensitive file trusted after
  startup` allows `rkhunter`; `k8s_containers` adds MetalLB, kiwigrid k8s-sidecar, snapshot-controller,
  nfs-subdir-external-provisioner, and fully-qualified Prometheus/Velero images;
* deprecated rules archived - legacy network-baseline templates moved from `rules/falco-deprecated_rules.yaml` to
  `archive/`.

## Kubernetes Operator: Helm chart, artifact startup gating and minor fixes

Since the Falco Operator 0.2.0 announcement, the work has focused on packaging, installation ergonomics, and runtime
correctness rather than on another API redesign.

Falco Operator now ships as `0.3.0`, together with the `falco-operator` Helm chart `0.2.0`. The operator chart was
introduced during this cycle and synced to `falcosecurity/charts`, giving the operator a first-class Helm-based
installation path. It installs the operator controllers and CRDs, deploys the instance operator, and renders the RBAC
needed for `Falco`, `Component`, `Rulesfile`, `Plugin`, and `Config` resources.

The installation assets are now chart-driven: generated `install.yaml` manifests are rendered with `helm template`,
CRDs live under `chart/falco-operator/crds`, and the old Kustomize-based manifest generation path has been removed.
The chart exposes the operational knobs expected from a first-class Kubernetes install path.

The `0.2.0` chart sets `appVersion` to Falco Operator `0.3.0`, and Falco Operator `0.3.0` bumps the built-in default
managed Falco image tag from `0.43.0` to `0.44.0`.

Falco Operator also fixes an important startup race in the artifact operator sidecar. On fresh Falco pods, the main
Falco container could previously start while the sidecar was still reconciling plugins, rules, and config into the
shared `emptyDir` volumes, causing early `LOAD_ERR_VALIDATE` failures and restarts. The sidecar now uses a
process-local startup gate and startup probe: it snapshots node-applicable `Plugin`, `Rulesfile`, and `Config`
resources at boot and only opens the gate after each one has been reconciled locally by that sidecar process.

RBAC was tightened as well: the instance operator no longer receives create/delete permissions on artifact resources
it only needs to observe or update, and Secret permissions were reduced from full write access to `get`, `list`,
`patch`, and `watch`.

For more details see the Helm chart introduction
([falco-operator#297](https://github.com/falcosecurity/falco-operator/pull/297),
[falco-operator#303](https://github.com/falcosecurity/falco-operator/pull/303),
[charts#1006](https://github.com/falcosecurity/charts/pull/1006)),
the [default managed Falco image tag bump](https://github.com/falcosecurity/falco-operator/pull/336),
the [artifact operator sidecar startup gate](https://github.com/falcosecurity/falco-operator/pull/329),
and the [RBAC tightening](https://github.com/falcosecurity/falco-operator/pull/298).

## Source-managed Helm chart publication flow

The Falco Helm chart ecosystem also changed during this cycle. `falcosecurity/charts` remains the published Helm
chart repository and the installation endpoint for users, but it is no longer the source of truth for every chart it
contains. Source-managed charts are now authored in the repository that owns the component, then synchronized into
`falcosecurity/charts` for publication.

The managed chart list now covers `falco`, `falco-operator`, `event-generator`, and `k8s-metacollector`, with sources
in `falcosecurity/falco`, `falcosecurity/falco-operator`, `falcosecurity/event-generator`, and
`falcosecurity/k8s-metacollector` respectively. Direct contributor PRs changing those managed chart directories in
`falcosecurity/charts` are blocked; chart bugs, feature requests, templates, values, changelogs, generated README
files, and release metadata belong in the source repository instead.

The chart contribution policy changed as well: contributors are encouraged to read the policy in the owning source
repository before opening chart PRs, since regular chart changes no longer require an immediate `Chart.yaml` version
bump; version bumps are reserved for chart-release PRs.

## Major cleanups

In Falco 0.43.0, we announced the deprecation of the legacy eBPF probe, the gVisor engine, and the gRPC output and
server. As anticipated, these components are now fully removed across Falco, libs, drivers, and falcoctl. Reducing the
surface of supported components allows us to focus engineering effort on modern, more portable alternatives.

### Legacy eBPF probe removal

The `engine.ebpf` configuration block and the corresponding `ebpf` engine kind have been removed. Users still relying
on the legacy eBPF probe must switch to the Modern eBPF probe (`engine.kind=modern_ebpf`) or fall back to the kernel
module (`engine.kind=kmod`) on kernels that do not yet support modern eBPF.

The drop is enforced across the stack: libs no longer build the legacy BPF probe, the driver API/schema have been
bumped accordingly, and `falcoctl driver` no longer offers operations on the legacy BPF driver.

For more details see [#3796](https://github.com/falcosecurity/falco/pull/3796) and the
[relevant section](https://github.com/falcosecurity/falco/blob/0.44.0/proposals/20251215-legacy-bpf-grpc-output-gvisor-engine-deprecation.md#legacy-ebpf-probe-deprecation)
of the deprecation proposal.

### gVisor engine removal

The `gvisor` engine kind, the `engine.gvisor` configuration block, the `--gvisor-generate-config` CLI flag, and the
`BUILD_LIBSCAP_GVISOR` CMake option have all been removed. The gVisor engine in libs has been removed as well, which
also drops the protobuf dependency it required, lowering build time and maintenance burden.

For more details see [#3797](https://github.com/falcosecurity/falco/pull/3797) and the
[relevant section](https://github.com/falcosecurity/falco/blob/0.44.0/proposals/20251215-legacy-bpf-grpc-output-gvisor-engine-deprecation.md#gvisor-libscap-engine-deprecation)
of the deprecation proposal.

### gRPC output and server removal

The `grpc_output` and `grpc` top-level configuration blocks, the entire gRPC code path, and the c-ares dependency (only
needed for gRPC) have been removed. Users consuming alerts via gRPC should migrate to the HTTP output or use
[Falcosidekick](https://github.com/falcosecurity/falcosidekick) to forward events to their destination of choice.

For more details see [#3798](https://github.com/falcosecurity/falco/pull/3798) and the
[relevant section](https://github.com/falcosecurity/falco/blob/0.44.0/proposals/20251215-legacy-bpf-grpc-output-gvisor-engine-deprecation.md#grpc-output-deprecation)
of the deprecation proposal.

## Breaking changes and deprecations ⚠️

This version comes with breaking changes you should be aware of before upgrading.

### Removed components

The components deprecated in Falco 0.43.0 are now fully removed:

* the legacy eBPF probe (`engine.kind=ebpf`, `engine.ebpf` configuration block);
* the gVisor engine (`engine.kind=gvisor`, `engine.gvisor` configuration block, `--gvisor-generate-config` CLI flag);
* the gRPC output and gRPC server (`grpc_output` and `grpc` configuration blocks).

Falco will fail at startup if it still finds any of these configuration keys.

### Falcoctl breaking changes

* the `falcoctl tls` subcommand has been removed;
* all references to the legacy eBPF probe have been removed from `falcoctl driver`.

### Deprecation warnings

* the `--markdown` CLI flag is deprecated in favor of `--format markdown` and will be removed in a future release;
* a small set of healthcheck/readiness/liveness fields in the `container` plugin has been deprecated.

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

Join us on social media and in our community calls, held every other Wednesday! It's always great to have new members
in the community, and we're looking forward to hearing your feedback and ideas.

You can find all the most up-to-date information at [https://falco.org/community/](https://falco.org/community/).
