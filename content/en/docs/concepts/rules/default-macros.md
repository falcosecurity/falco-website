---
aliases: ["/docs/rules/default-macros"]
title: Default Macros
weight: 2
---

The default Falco rule set defines a number of macros that makes it easier to start writing rules. These macros provide shortcuts for a number of common scenarios and can be used in any user defined rule sets. Falco also provide Macros that should be overridden by the user to provide settings that are specific to a user's environment. The provided Macros can also be appended to in a local rules file.

### File Opened for Writing

```yaml
- macro: open_write
  condition: (evt.type=open or evt.type=openat) and evt.is_open_write=true and fd.typechar='f' and fd.num>=0
```

### File Opened for Reading

```yaml
- macro: open_read
  condition: (evt.type=open or evt.type=openat) and evt.is_open_read=true and fd.typechar='f' and fd.num>=0
```

### Never True

```yaml
- macro: never_true
  condition: (evt.num=0)
```

### Always True

```yaml
- macro: always_true
  condition: (evt.num=>0)
```

### Proc Name is Set

```yaml
- macro: proc_name_exists
  condition: (proc.name!="<NA>")
```

### File System Object Renamed

```yaml
- macro: rename
  condition: evt.type in (rename, renameat)
```

### New Directory Created

```yaml
- macro: mkdir
  condition: evt.type = mkdir
```

### File System Object Removed

```yaml
- macro: remove
  condition: evt.type in (rmdir, unlink, unlinkat)
```

### File System Object Modified

```yaml
- macro: modify
  condition: rename or remove
```

### New Process Spawned

```yaml
- macro: spawned_process
  condition: evt.type = execve and evt.dir=<
```

### Common Directories for Binaries

```yaml
- macro: bin_dir
  condition: fd.directory in (/bin, /sbin, /usr/bin, /usr/sbin)
```

### Shell is Started

```yaml
- macro: shell_procs
  condition: (proc.name in (shell_binaries))
```

### Known Sensitive Files

```yaml
- macro: sensitive_files
  condition: >
    fd.name startswith /etc and
    (fd.name in (sensitive_file_names)
     or fd.directory in (/etc/sudoers.d, /etc/pam.d))
```

### Newly Created Process

```yaml
- macro: proc_is_new
  condition: proc.duration <= 5000000000
```

### Inbound Network Connections

```yaml
- macro: inbound
  condition: >
    (((evt.type in (accept,listen) and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### Outbound Network Connections

```yaml
- macro: outbound
  condition: >
    (((evt.type = connect and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### Inbound or Outbound Network Connections

```yaml
- macro: inbound_outbound
  condition: >
    (((evt.type in (accept,listen,connect) and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### Object is a Container

```yaml
- macro: container
  condition: container.id != host
```

### Interactive Process Spawned

```yaml
- macro: interactive
  condition: >
    ((proc.aname=sshd and proc.name != sshd) or
    proc.name=systemd-logind or proc.name=login)
```

## Macros to Override

The below macros contain values that can be overridden for a user's specific environment.

### Common SSH Port

Override this macro to reflect ports in your environment that provide SSH services.

```yaml
- macro: ssh_port
  condition: fd.sport=22
```

### Allowed SSH Hosts

Override this macro to reflect hosts that can connect to known SSH ports (ie a bastion or jump box).

```yaml
- macro: allowed_ssh_hosts
  condition: ssh_port
```

### User Whitelisted Containers

Whitelist containers that are allowed to run in privileged mode.

```yaml
- macro: user_trusted_containers
  condition: (container.image startswith sysdig/agent)
```

### Containers Allowed to Spawn Shells

Whitelist containers that are allowed to spawn shells, which may be needed if containers are used in the CI/CD pipeline.

```yaml
- macro: user_shell_container_exclusions
  condition: (never_true)
```

### Containers Allowed to Communicate with EC2 Metadata Services

Whitelist containers that are allowed to communicate with the EC2 metadata service. Default: any container.

```yaml
- macro: ec2_metadata_containers
  condition: container
```

### Kubernetes API Server

Set the IP of your Kubernetes API Service here.

```yaml
- macro: k8s_api_server
  condition: (fd.sip="1.2.3.4" and fd.sport=8080)
```

### Containers Allowed to Communicate with the Kubernetes API

Whitelist containers that are allowed to communicate with the Kubernetes API Service. Requires k8s_api_server being set.

```yaml
- macro: k8s_containers
  condition: >
    (container.image startswith gcr.io/google_containers/hyperkube-amd64 or
    container.image startswith gcr.io/google_containers/kube2sky or
    container.image startswith sysdig/agent or
    container.image startswith sysdig/falco or
    container.image startswith sysdig/sysdig)
```

### Containers Allowed to Communicate with Kubernetes Service NodePorts

```yaml
- macro: nodeport_containers
  condition: container
```
