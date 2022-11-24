---
aliases: ["/docs/rules/supported-events"]
title: Supported Syscall Events
linktitle: Syscall Events
weight: 40
---

Here are the system call event types and args supported by the [kernel module and BPF probe](/docs/event-sources/drivers) via `libscap` included in the Falco libs. Note that, for performance reasons, by default Falco will only consider a subset of them indicated in the table below. However, it's possible to make Falco consider all events by using the `-A` command line switch.

<!--
generated with:
falco --list-syscall-events --markdown
-->

{{< markdown_inline
    contentPath="/docs/reference/rules/supported-events/supported-events.md"
>}}
