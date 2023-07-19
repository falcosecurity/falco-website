---
title: Falco
id: falco
date: 2023-07-17
full_link: /docs/#what-is-falco
short_description: >
  The name of the project, and also the name of the main engine that the rest of the project is built on.
aka:
tags:
- fundamental
---
The name of the project, and also the name of the main engine that the rest of the project is built on.

<!--more--> 
Falco is a cloud native runtime security tool for Linux operating systems. It is designed to detect and alert on {{< glossary_tooltip text="abnormal behaviors" term_id="abnormal-behavior" >}} and potential security threats in real-time.

At its core, Falco is a {{< glossary_tooltip text="kernel" term_id="kernel" >}} event {{< glossary_tooltip text="monitoring" term_id="rules" >}} and {{< glossary_tooltip text="detection" term_id="detection" >}} agent that captures events, such as syscal{{< glossary_tooltip text="syscalls" term_id="syscalls" >}}ls, based on custom {{< glossary_tooltip text="rules" term_id="rules" >}}. Falco can enhance these events by {{< glossary_tooltip text="integration metadata" term_id="data-enrichment" >}} from the container runtime and Kubernetes. The collected events can be analyzed off-host in SIEM or data lake systems.

Ref: https://github.com/falcosecurity/falco