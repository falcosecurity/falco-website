```yaml
- rule: change_thread_namespace
  desc: an attempt to change a program/thread\'s namespace (commonly done as a part of creating a container) by calling setns.
  condition: syscall.type = setns and not proc.name in (docker, sysdig, dragent)
  output: "Namespace change (setns) by unexpected program | user=%user.name command=%proc.cmdline container=%container.id"
  priority: WARNING
```