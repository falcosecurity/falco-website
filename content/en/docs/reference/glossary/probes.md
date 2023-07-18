---
title: Probes
id: probes
date: 2023-07-17
full_link: /docs/event-sources/kernel/#classic-ebpf-probe
short_description: >
  Used to describe the .o object that would be dynamically loaded into the kernel as a secure and stable eBPF probe
aka:
tags:
- security-concept
---
Used to describe the .o object that would be dynamically loaded into the {{< glossary_tooltip text="kernel" term_id="kernel" >}} as a secure and stable {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}}.

<!--more--> 
Used to describe the .o object that would be dynamically loaded into the {{< glossary_tooltip text="kernel" term_id="kernel" >}} as a secure and stable {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}}. This is one option used to pass kernel events up to {{< glossary_tooltip text="userspace" term_id="user-space" >}} for Falco to consume. Sometimes this word is incorrectly used to refer to a {{< glossary_tooltip text="module" term_id="kernel-module" >}}.
