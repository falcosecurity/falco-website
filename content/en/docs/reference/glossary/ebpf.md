---
title: eBPF
id: ebpf
date: 2023-07-17
full_link: /docs/event-sources/kernel/#classic-ebpf-probe
short_description: >
  eBPF is a technology to collect metrics and events from the Kernel in a secure way.
tags:
- architecture
- security-concept
---
eBPF is a technology to collect metrics and events from the {{< glossary_tooltip text="kernel" term_id="kernel" >}} in a secure way.

<!--more-->
eBPF is a technology that can run sandboxed programs in a privileged context such as the operating system {{< glossary_tooltip text="kernel" term_id="kernel" >}}. It is used to extend the capabilities of the {{< glossary_tooltip text="kernel" term_id="kernel" >}} at runtime without requiring to change {{< glossary_tooltip text="kernel" term_id="kernel" >}} source code or load {{< glossary_tooltip text="kernel modules" term_id="kernel-module" >}}. It is considered safer than {{< glossary_tooltip text="kernel modules" term_id="kernel-module" >}} since it cannot crash your system.

Ref: https://ebpf.io