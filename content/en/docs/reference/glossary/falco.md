---
title: Falco
id: falco
date: 2023-07-17
full_link: /docs/#what-is-falco
short_description: >
  The name of the project and the main engine on which the rest of the project is built.

aka:
tags:
- fundamental
---
The name of the project and the main engine on which the rest of the project is built.

<!--more--> 
Falco is a cloud native runtime security tool for Linux operating systems. It is designed to detect and provide real-time alerts about {{< glossary_tooltip text="abnormal behaviors" term_id="abnormal-behavior" >}} and potential security threats.

At its core, Falco is a {{< glossary_tooltip text="kernel" term_id="kernel" >}} {{< glossary_tooltip text="monitoring" term_id="rules" >}} and {{< glossary_tooltip text="detection" term_id="detection" >}} agent that observes events, such as {{< glossary_tooltip text="syscalls" term_id="syscalls" >}}, based on custom {{< glossary_tooltip text="rules" term_id="rules" >}}. Falco can enhance these events by {{< glossary_tooltip text="integrating metadata" term_id="data-enrichment" >}} from the container runtime and Kubernetes. The collected events can be analyzed off-host in SIEM or data lake systems.

Ref: https://github.com/falcosecurity/falco
