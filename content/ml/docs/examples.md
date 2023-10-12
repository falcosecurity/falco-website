---
exclude_search: true
title: ഫാൽക്കോ ഉദാഹരണങ്ങൾ
weight: 9
---

ഫാൽക്കോയ്ക്ക് തിരിച്ചറിയാൻ കഴിയുന്ന വ്യവഹാരങ്ങളുടെ ചില ഉദാഹരണങ്ങൾ ഇതാ.

കൂടുതൽ സമഗ്രമായ ഉദാഹരണങ്ങൾക്ക്, `falco_rules.yaml` ലെ പൂർണ്ണ റൂൾ ഫയൽ കാണുക.

## ഒരു ഷെൽ ഒരു കണ്ടെയ്നറിൽ പ്രവർത്തിക്കുന്നു

```yaml
- macro: container
  condition: container.id != host

- macro: spawned_process
  condition: evt.type = execve and evt.dir=<

- rule: run_shell_in_container
  desc: a shell was spawned by a non-shell program in a container. Container entrypoints are excluded.
  condition: container and proc.name = bash and spawned_process and proc.pname exists and not proc.pname in (bash, docker)
  output: "Shell spawned in a container other than entrypoint (user=%user.name container_id=%container.id container_name=%container.name shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)"
  priority: WARNING
```

## അപ്രതീക്ഷിത ഔട്‍ബൗണ്ട് Elasticsearch കണക്ഷൻ

```yaml
- macro: outbound
  condition: syscall.type=connect and evt.dir=< and (fd.typechar=4 or fd.typechar=6)

- macro: elasticsearch_cluster_port
  condition: fd.sport=9300

- rule: elasticsearch_unexpected_network_outbound
  desc: outbound network traffic from elasticsearch on a port other than the standard ports
  condition: user.name = elasticsearch and outbound and not elasticsearch_cluster_port
  output: "Outbound network traffic from Elasticsearch on unexpected port (connection=%fd.name)"
  priority: WARNING
```

## ഡയറക്ടറി ഹോൾഡിംഗ് സിസ്റ്റം ബൈനറികളിലേക്ക് എഴുത്ത്

```yaml
- macro: open_write
  condition: >
    (evt.type=open or evt.type=openat) and
    fd.typechar='f' and
    (evt.arg.flags contains O_WRONLY or
    evt.arg.flags contains O_RDWR or
    evt.arg.flags contains O_CREAT or
    evt.arg.flags contains O_TRUNC)

- macro: package_mgmt_binaries
  condition: proc.name in (dpkg, dpkg-preconfigu, rpm, rpmkey, yum)

- macro: bin_dir
  condition: fd.directory in (/bin, /sbin, /usr/bin, /usr/sbin)

- rule: write_binary_dir
  desc: an attempt to write to any file below a set of binary directories
  condition: evt.dir = < and open_write and not package_mgmt_binaries and bin_dir
  output: "File below a known binary directory opened for writing (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```

## അംഗീകൃതമല്ലാത്ത കണ്ടെയ്നർ നെയിംസ്‌പെയ്‌സ് മാറ്റം

```yaml
- rule: change_thread_namespace
  desc: an attempt to change a program/thread\'s namespace (commonly done as a part of creating a container) by calling setns.
  condition: syscall.type = setns and not proc.name in (docker, sysdig, dragent)
  output: "Namespace change (setns) by unexpected program (user=%user.name command=%proc.cmdline container=%container.id)"
  priority: WARNING
```

## /dev-ൽ ഉപകരണേതര ഫയലുകൾ എഴുതപ്പെട്ടിരിക്കുന്നു (ചില റൂട്ട്കിറ്റുകൾ ഇത് ചെയ്യുന്നു)

```yaml
- rule: create_files_below_dev
  desc: creating any files below /dev other than known programs that manage devices. Some rootkits hide files in /dev.
  condition: (evt.type = creat or evt.arg.flags contains O_CREAT) and proc.name != blkid and fd.directory = /dev and fd.name != /dev/null
  output: "File created below /dev by untrusted program (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```

## സ്കൈപ്പ് / വെബെക്സ് അല്ലാത്ത പ്രോസസ്സ് ക്യാമറ ഉപയോഗിക്കാൻ ശ്രമിക്കുന്നു

```yaml
- rule: access_camera
  desc: a process other than skype/webex tries to access the camera
  condition: evt.type = open and fd.name = /dev/video0 and not proc.name in (skype, webex)
  output: Unexpected process opening camera video device (command=%proc.cmdline)
  priority: WARNING
 ```
