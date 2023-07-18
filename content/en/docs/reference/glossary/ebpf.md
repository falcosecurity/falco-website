---
title: eBPF
id: ebpf
date: 2023-07-17
full_link: /docs/event-sources/kernel/#classic-ebpf-probe
short_description: >
  eBPF is a technology to collect metrics and events from the Kernel in a secure way.
tags:
- integration
- security-concept
---
eBPF is a technology to collect metrics and events from the {{< glossary_tooltip text="kernel" term_id="kernel" >}} in a secure way.

<!--more-->
eBPF is a technology that can run sandboxed programs in a privileged context such as the operating system {{< glossary_tooltip text="kernel" term_id="kernel" >}}. It is used to safely and efficiently extend the capabilities of the {{< glossary_tooltip text="kernel" term_id="kernel" >}} at runtime without requiring to change {{< glossary_tooltip text="kernel" term_id="kernel" >}} source code or load a {{< glossary_tooltip text="kernel module" term_id="kernel-module" >}}.

Ref: https://ebpf.io