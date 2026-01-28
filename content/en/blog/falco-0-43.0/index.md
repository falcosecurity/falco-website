---
title: Introducing Falco 0.43.0
date: 2026-01-26
author: Leonardo Di Giovanna, Leonardo Grasso, Iacopo Rozzo, Alessandro Cannarella
slug: falco-0-43-0
tags: [ "Falco","Release" ]
---

Dear Falco Community, we are happy to announce the release of Falco 0.43.0 today!

This is a stabilization release that consolidates the changes introduced in 0.42.0, including
the [drop-enter initiative](https://falco.org/blog/falco-0-42-0/#drop-enter-initiative) and
the [capture recording feature](https://falco.org/blog/falco-0-42-0/#capture-recording-feature). It also introduces
several deprecations to improve maintainability and fixes minor issues across falcoctl, plugins, and libs.

During this release cycle, we merged:

* 31 PRs on Falco, including 11 release note-worthy changes
* 48 PRs on Falco libs, including 17 release note-worthy changes
* 8 PRs on Falco drivers, including 3 release note-worthy changes

We upgraded libs to version `0.23.1` and drivers to `9.1.0+driver`. Thank you to our maintainers and contributors. This
would not have been possible without your support and dedication!

To learn everything about the changes, read on!

## What's new? TL;DR

* [Deprecations](#deprecations)
* [GPG key rotation](#gpg-key-rotation)
* [Container plugin improvements](#container-plugin-improvements)
* [Falcoctl tweaks and improvements](#falcoctl-tweaks-and-improvements)

*Key fixes:*

* [`evt.arg.filename` field reintroduction](#evtargfilename-field-reintroduction)
* [Falcoctl signature verification fixes](#falcoctl-signature-verification-fixes)
* overflow and NULL pointer dereferences fixes for the `container` plugin, shipped with `plugins/container/0.6.1`
* race condition fix for the `k8smeta` plugin, shipped with `plugins/k8smeta/0.4.1`

{{% pageinfo color="warning" %}}
This release also comes with [breaking changes](#breaking-changes-and-deprecations) that you should be aware of before
upgrading.
{{% /pageinfo %}}

## Latest updates

### Deprecations

In Falco 0.43.0, we are announcing the deprecation of three significant components to streamline the project, reduce
maintenance burden, and focus on modern, more efficient alternatives. All these components are stable, and considering
that the deprecation is first enforced in this version, they could be removed at any future version starting from
0.44.0.

#### Legacy eBPF probe deprecation

The "legacy" eBPF probe (configured via `engine.kind=ebpf`) was the original eBPF implementation in Falco. It required
compiling a specific probe for each kernel version, often necessitating the dynamic usage of the `falco-driver-loader`
or pre-built drivers. The Modern eBPF probe (`engine.kind=modern_ebpf`), which leverages CO-RE (Compile Once – Run
Everywhere), has reached maturity and feature parity. It offers superior stability, portability (no need to compile
drivers on the fly), flexibility and performance. Maintaining two eBPF drivers splits engineering effort and complicates
the codebase. Users currently using the legacy eBPF probe are strongly encouraged to switch to the Modern eBPF probe by
setting `engine.kind=modern_ebpf` in their `falco.yaml`, or to `engine.kind=kmod` if the used kernel doesn't provide
support for the modern eBPF probe.

See [the relevant section](https://github.com/falcosecurity/falco/blob/master/proposals/20251215-legacy-bpf-grpc-output-gvisor-engine-deprecation.md#legacy-ebpf-probe-deprecation)
of the deprecation proposal for the detailed motivation behind the deprecation.

#### gVisor deprecation

The gVisor engine is a dedicated, internal C++ implementation designed to monitor system calls from gVisor sandboxes
leveraging events coming from gVisor itself through gRPC. There is evidence that this engine is little used. Moreover,
gVisor doesn't provide all information required to build all supported event types, indeed resulting in a system call
source not completely equivalent to the ones provided by drivers. Finally, it requires libs being dependent on protobuf,
this latter introducing a non-negligible build time overhead and maintainability burden.

See [the relevant section](https://github.com/falcosecurity/falco/blob/master/proposals/20251215-legacy-bpf-grpc-output-gvisor-engine-deprecation.md#gvisor-libscap-engine-deprecation)
of the deprecation proposal for the detailed motivation behind the deprecation.

#### gRPC output and server deprecation

The gRPC output was implemented to allow external consumers to subscribe to a stream of Falco security alerts over a
gRPC connection. It was notably utilized by tools like the `event-generator` (in test mode) and custom integrations
requiring a streaming API for alerts. The gRPC output and the gRPC server embedded in Falco add substantial complexity
to the core codebase, including dependencies on specific protobuf and gRPC framework versions in Falco and libs. Over
time, it has become clear that the community prefers standard, widespread integration patterns for alert consumption -
primarily HTTP and the ecosystem enabled by Falcosidekick. Users consuming alerts via gRPC should migrate to the HTTP
output or use Falcosidekick to forward events to their destination of choice.

See [the relevant section](https://github.com/falcosecurity/falco/blob/master/proposals/20251215-legacy-bpf-grpc-output-gvisor-engine-deprecation.md#grpc-output-deprecation)
of the deprecation proposal for the detailed motivation behind the deprecation.

### GPG key rotation

In anticipation of the previous GPG key's expiration in January 2026, we have rotated the GPG key used to sign the
official RPM and DEB packages. Pre-existing Falco installations (installed via apt or yum before the rotation) must
manually import the new GPG key. Failure to do so may result in errors during package updates or verification failures.
Please follow the "Trust the falcosecurity GPG key" step in the official documentation for your package manager:

- apt (Debian/Ubuntu): [Install with apt](https://falco.org/docs/setup/packages/#install-with-apt)
- yum/dnf (CentOS/RHEL/Fedora): [Install with yum](https://falco.org/docs/setup/packages/#install-with-yum)

Notice that new installations following the current documentation will automatically receive the updated key bundle and
do not require additional steps.

For more details
see [[TRACKING] [deadline 2026-01-17] Rotate public GPG key for RPM/DEB package signing](https://github.com/falcosecurity/falco/issues/3750).

### Container plugin improvements

The `container` plugin, which extracts metadata from container runtimes to enrich Falco events, includes important
updates in version `0.6.1` to enhance its API capabilities and performance. This release exposes `container.id`,
`container.image`, `container.name`, and `container.type` through the table API and adds comprehensive logging across
all engines, while also preventing allocations by extensively using zero-allocation tools offered by the C++ (like
`std::string_view`) and avoiding reflex matcher allocations during resolve operations.

### Falcoctl tweaks and improvements

#### `follow` polling interval increase to 1 week

About three years ago, we started distributing Falco artifacts (rules files and plugins) via ghcr.io, and later added
automatic rule updates in falcoctl with a 6h check interval. With years of data now, it’s clear we don’t need checks
that frequent: our rule updates happen far less often. Moreover, due to the growth of Falco adoption, these frequent
checks are now hitting ghcr.io rate limit. These two reasons drove the decision to increase the artifact follow interval
from 6h to 1 week.

For more details
see [chore(scripts/falcoctl): increase follow interval to 1 week](https://github.com/falcosecurity/falco/pull/3757)
and [Falco's Helm chart changelog](https://github.com/falcosecurity/charts/blob/master/charts/falco/CHANGELOG.md#v702).

#### Dependency resolution improvements

The artifact installation logic has been reworked to handle dependencies and references correctly. Previously,
dependencies could be duplicated or incorrectly resolved, and signature verification was skipped for full registry
references. Now dependencies are properly deduplicated, all refs are correctly resolved, and **signatures are verified
for all resolved dependencies**, not just the top-level artifacts. This provides end-to-end verification of the entire
dependency chain.

For more details
see [Inefficient deduplication logic and incorrect input handling for dependency resolution](https://github.com/falcosecurity/falcoctl/issues/868)

#### Support for cosign v3

Falcoctl now supports **Cosign v3 bundle format** for signature verification. This is the new standard for signing OCI
artifacts, replacing the legacy `.sig` tag format.

**What this means for you:**

- Artifacts signed with cosign v3 are now fully supported
- Backward compatibility with cosign v2 signatures is maintained

For more details see [feat: Upgrade to Cosign v3 with Bundle Format](https://github.com/falcosecurity/falcoctl/pull/880)

## Key fixes

### `evt.arg.filename` field reintroduction

As part of the recent "drop enter" optimization initiative (which removed enter events for most syscalls to improve
performance), the filename argument - historically available only in the enter event for `execve` and `execveat` - was
inadvertently made unavailable. This caused a regression where specific context, such as the exact path provided to the
syscall (e.g., a symlink path versus the resolved binary path), was lost in the remaining exit event.

In Falco 0.43.0 (via libs `0.23.0`), this has been fixed. The filename argument is now correctly populated in the exit
events for these syscalls. Users can once again access this data using the evt.arg.filename field in their rules,
ensuring that the critical execution context is preserved without needing the deprecated enter events.

For more details
see [Missing "filename" argument to execve syscall in libscap 0.22.x](https://github.com/falcosecurity/libs/issues/2709).

### Falcoctl signature verification fixes

#### Signature verification fix for full reference artifacts

Fixed an issue where **signature verification** was skipped for artifacts specified with a full registry reference (
e.g., `ghcr.io/falcosecurity/plugins/plugin/container:0.4.1`). Now all artifacts are verified regardless of how they are
referenced.

#### Signature verification fix for authenticated registries

Signature verification now works correctly on **private/authenticated registries**. Previously, verification would fail
with authentication errors even though the artifact pull succeeded, and credentials were not being passed to the
signature verification component.

**Supported authentication methods:**

- Basic auth (Docker credentials)
- OAuth2 client credentials
- GCP Workload Identity (for GKE deployments)

For more details
see [fix(signature): pass registry credentials to cosign for signature verification](https://github.com/falcosecurity/falcoctl/pull/891)

## Breaking changes and deprecations

This version includes breaking changes you should be aware of before upgrading.

### Bump drivers minimum required kernel version to `3.10`

Falco 0.43.0 introduces a breaking change regarding the Falco drivers. Starting with drivers version `9.1.0+driver`, the
minimum required Linux kernel version has been bumped to `3.10`. In practice, this only affects the `kmod` driver and
means that the kernel module will explicitly fail to compile on kernels older than `3.10`. This choice is motivated by
the fact that even Linux `3.10` is a 12-year-old kernel, and its support ended in 2017: maintaining support for older
kernels is a maintenance burden and limits progress. This change enables the team to focus on modernizing the codebase
and improving stability for current environments.

### Deprecation warnings

Falco 0.43.0 introduces several deprecation warnings to help users migrate to newer components:

* **Legacy eBPF probe deprecation**: using the legacy eBPF probe (`engine.kind=ebpf`) will now generate warnings
* **gVisor engine deprecation**: using the gVisor engine (`engine.kind=gvisor`) will now generate warnings
* **gRPC deprecation**: using the gRPC output or the gRPC server (`grpc_output.enabled=true` or `grpc.enabled=true`),
  will now generate warnings

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

Join us on social media and in our community calls, held every other Wednesday! It's always great to have new members in
the community, and we're looking forward to hearing your feedback and ideas.

You can find all the most up-to-date information at [https://falco.org/community/](https://falco.org/community/).
