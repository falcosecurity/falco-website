---
title: Advanced Performance Tuning
description: 'Advanced performance tuning for kernel events.'
linktitle: Advanced Performance Tuning
weight: 30
----------

This document provides advanced performance tuning options for the `syscall` data source in Falco. It is intended for users who want to optimize the performance of their Falco deployment by customizing the syscall monitoring behavior.

## Adaptive syscalls selection

Falco provides users flexibility to select different syscall monitoring behaviors tailored to their specific use cases. These options offer various degrees of control over system calls, directly configured through the `falco.yaml` file.

This section outlines the available configurations and their implications.

### Default behavior

By default, Falco traces syscalls derived from:

1. Syscalls explicitly required by enabled Falco rules.
2. A predefined set essential for maintaining Falco's internal state engine, defined at compile-time.

With the default configuration:

```yaml
base_syscalls.custom_set: []
base_syscalls.repair: false
base_syscalls.all: false
```

This ensures accurate state engine management but offers no end-user customization of the additional syscalls.

### Monitoring all syscalls (`base_syscalls.all`)

Setting this option to `true` enables monitoring all events supported by Falco, including typically ignored events such as `write`:

```yaml
base_syscalls.all: true
```

Use with caution, as this may negatively impact performance due to increased resource usage.

### User-defined syscall set (`base_syscalls.custom_set`)

**CAUTION:** Misconfiguration may result in incomplete event logs or disrupt Falco's tracing capabilities.

This option allows you to explicitly define an additional set of syscalls to trace, supplementing those required by active Falco rules:

```yaml
base_syscalls.custom_set: [clone, clone3, fork, execve, execveat, close]
```

It offers fine-grained control and can help optimize resource utilization according to your threat model and performance constraints.

Recommended syscall sets for typical scenarios:

* **Process monitoring**: `[clone, clone3, fork, vfork, execve, execveat, close]`
* **Networking monitoring**: `[clone, clone3, fork, vfork, execve, execveat, close, socket, bind, getsockopt]`
* **Accurate UID/GID tracking**: Add `[setresuid, setsid, setuid, setgid, setpgid, setresgid, capset, chdir, chroot, fchdir]` to the relevant set.

Negative notation (`"!syscall_name"`) is supported to explicitly exclude specific syscalls.

### Automatic state engine management (`base_syscalls.repair`)

Recommended for most scenarios, enabling this option allows Falco to automatically select the minimal necessary set of syscalls beyond those explicitly required by enabled rules:

```yaml
base_syscalls.repair: true
base_syscalls.custom_set: []
base_syscalls.all: false
```

This option ensures Falco's internal state engine integrity with minimal performance overhead, automatically incorporating best-practice syscall configurations.

## Scenarios

Different configurations address various monitoring scenarios effectively:

1. **Monitoring spawned processes under resource constraints**

   * Default: Insufficient
   * `custom_set` and `repair`: Both viable, but `repair` is recommended for automatic correctness.

2. **Monitoring spawned processes and network activity, excluding file opens**

   * Default: Insufficient
   * `custom_set` and `repair`: Both suitable, with `repair` ensuring automatic correctness without manual intervention.

3. **Flexible configurability for tailored monitoring**

   * Useful in environments requiring selective monitoring to optimize resources.
   * Allows coexistence with other monitoring tools by minimizing duplication of work.

4. **Comprehensive syscall monitoring**

   * All three configurations (`default`, `custom_set`, `repair`) can achieve complete syscall monitoring.
   * Choice depends on user preference and performance trade-offs.

## Notes

* Use `falco -i` to list all events typically ignored in the default configuration.
* Events marked `EF_OLD_VERSION` are not generated during live monitoring but may appear in `.scap` files.
