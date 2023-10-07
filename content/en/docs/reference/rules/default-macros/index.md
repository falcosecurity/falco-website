---
title: Default Macros
linktitle: Default Macros
description: Use the default macros to simplify Falco Rules
aliases:
- ../../../rules/default-macros
weight: 20
---

The default Falco rule set defines a number of macros that makes it easier to start writing rules. These macros provide shortcuts for a number of common scenarios and can be used in any user defined rule sets. 

Falco also provide Macros that should be overridden. Refer [here](/docs/reference/rules/macros-override) for further information.

### File Opened for Writing

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/open_write.md" >}}

### File Opened for Reading

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/open_read.md" >}}

### Never True

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/never_true.md" >}}

### Always True

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/always_true.md" >}}

### Proc Name is Set

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/proc_name_exists.md" >}}

### File System Object Renamed

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/rename.md" >}}

### New Directory Created

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/mkdir.md" >}}

### File System Object Removed

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/remove.md" >}}

```yaml
- macro: remove
  condition: evt.type in (rmdir, unlink, unlinkat)
```

### File System Object Modified

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/modify.md" >}}

### New Process Spawned

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/spawned_process.md" >}}

### Common Directories for Binaries

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/bin_dir.md" >}}

### Shell is Started

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/shell_procs.md" >}}

### Known Sensitive Files

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/sensitive_files.md" >}}

### Newly Created Process

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/proc_is_new.md" >}}

### Inbound Network Connections

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/inbound.md" >}}

### Outbound Network Connections

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/outbound.md" >}}

### Inbound or Outbound Network Connections

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/inbound_outbound.md" >}}

### Object is a Container

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/container.md" >}}

### Interactive Process Spawned

{{< markdown_inline contentPath = "/docs/reference/rules/default-macros/interactive.md" >}}
