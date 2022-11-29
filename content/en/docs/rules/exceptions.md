---
title: Rule Exceptions
description: Add exceptions to Falco Rules to adapt them to your environment
linktitle: Rule Exceptions
weight: 70
---

## Introduction

Almost all Falco Rules have cases where the behavior detected by the
rule should be allowed. For example, The rule Write Below Binary Dir
has exceptions for specific programs that are known to write below
these directories as a part of software installation/management:

```yaml
- rule: Write below binary dir
  desc: an attempt to write to any file below a set of binary directories
  condition: >
    bin_dir and evt.dir = < and open_write
    and not package_mgmt_procs
    and not exe_running_docker_save
    and not python_running_get_pip
    and not python_running_ms_oms
    and not user_known_write_below_binary_dir_activities
...
```
Previously, these exceptions were expressed as concatenations to the original rule's condition. For example, looking at the macro package_mgmt_procs:

```yaml
- macro: package_mgmt_procs
  condition: proc.name in (package_mgmt_binaries)
```

The result is appending `and not proc.name in (package_mgmt_binaries)` to the condition of the rule.

A more extreme case of this is the write_below_etc macro used by Write below etc rule. It had tens of exceptions:

```
...
    and not sed_temporary_file
    and not exe_running_docker_save
    and not ansible_running_python
    and not python_running_denyhosts
    and not fluentd_writing_conf_files
    and not user_known_write_etc_conditions
    and not run_by_centrify
    and not run_by_adclient
    and not qualys_writing_conf_files
    and not git_writing_nssdb
...
```

The exceptions all generally follow the same structure--naming a program and a directory prefix below /etc where that program is allowed to write files.

## Rule Exceptions

Starting in 0.28.0, falco supports an optional `exceptions` property to rules. The exceptions key is a list of identifier plus list of tuples of filtercheck fields. Here's an example:

```yaml
- rule: Write below binary dir
  desc: an attempt to write to any file below a set of binary directories
  condition: >
    bin_dir and evt.dir = < and open_write
    and not package_mgmt_procs
    and not exe_running_docker_save
    and not python_running_get_pip
    and not python_running_ms_oms
    and not user_known_write_below_binary_dir_activities
  exceptions:
   - name: proc_writer
     fields: [proc.name, fd.directory]
     comps: [=, =]
     values:
       - [my-custom-yum, /usr/bin]
       - [my-custom-apt, /usr/local/bin]
   - name: cmdline_writer
     fields: [proc.cmdline, fd.directory]
     comps: [startswith, =]
   - name: container_writer
     fields: [container.image.repository, fd.directory]
   - name: proc_filenames
     fields: [proc.name, fd.name]
     comps: [=, in]
     values:
       - [my-custom-dpkg, [/usr/bin, /bin]]
   - name: filenames
     fields: fd.filename
     comps: in
```

This rule defines four kinds of exceptions:
  * proc_writer: uses a combination of proc.name and fd.directory
  * cmdline_writer: uses a combination of proc.cmeline and fd.directory
  * container_writer: uses a combination of container.image.repository and fd.directory
  * proc_filenames: uses a combination of process and list of filenames.
  * filenames: uses a list of filenames

The specific strings "proc_writer"/"container_writer"/"proc_filenames"/"filenames" are arbitrary strings and don't have a special meaning to the rules file parser. They're only used to provide a handy name, and to potentially link together values in a later rule that has append: true (more on that below).

Notice that exceptions are defined as a part of the rule. This is important because the author of the rule defines what construes a valid exception to the rule. In this case, an exception can consist of a process and file directory (actor and target), but not a process name only (too broad).

The `fields` property contains one or more fields that will extract a value from the events. The `comps` property contains comparison operators that align 1-1 with the items in the fields property. The `values` property contains tuples of values. Each item in the tuple should align 1-1 with the corresponding field and comparison operator. Together, each tuple of values is combined with the fields/comps to modify the condition to add an exclusion to the rule's condition.

For example, for the exception "proc_writer" above, the fields/comps/values are the equivalent of adding the following to the rule's condition:

```
... and not ((proc.name=my-custom-yum and fd.directory=/usr/bin) or (proc.name=my-custom-apt and fd.directory=/usr/local/bin))
```

Note that when a comparison operator is "in", the corresponding values tuple item should be a list. "proc_filenames" above uses that syntax, and is the equivalent of:

```
... and not (proc.name=my-custom-dpkg and fd.name in (/usr/bin, /bin))
```

### Exception Syntax Shortcuts

In general, the value for an exceptions fields properly should always be a list of fields. The comps property must be an equal-length list of comparison operators, and the values property must be a list of tuples, where each tuple has the same length as the fields/comps list.

However, there are a few shortcuts that can be used when defining an exception:

#### Values are Optional

A rule may define fields and comps, but not define values. This allows a later rule with "append: true" to add values to an exception (more on that below). The exception "cmdline_writer" above has this format:

```
   - name: cmdline_writer
     fields: [proc.cmdline, fd.directory]
     comps: [startswith, =]
```

#### Fields/Comps Can Be a Single Value, Not a List

An alternate way to define an exception is to have fields contain a single field and comps contain a single comparison operator (which must be one of "in", "pmatch", "intersects"). In this format, values is a list of values rather than list of tuples. The exception "filenames" above has this format:

```
   - name: filenames
     fields: fd.filename
     comps: in
```

In this case, the exception is the equivalent of:

```
... and not (fd.filename in (...))
```

#### Comps is Optional

If comps is not provided, a default value is filled in. When fields is a list, comps will be set to an equal-length list of =. The exception "container_writer" above has that format, and is equivalent to:

```
   - name: container_writer
     fields: [container.image.repository, fd.directory]
     comps: [=, =]
```

When fields is a single field, comps is set to the single field "in".

### Appending Exception Values

Exception values will most commonly be defined in rules with append: true. Here's an example:

```yaml
- list: apt_files
  items: [/bin/ls, /bin/rm]

- rule: Write below binary dir
  exceptions:
  - name: proc_writer
    values:
    - [apk, /usr/lib/alpine]
    - [npm, /usr/node/bin]
  - name: container_writer
    values:
    - [docker.io/alpine, /usr/libexec/alpine]
  - name: proc_filenames
    values:
    - [apt, [apt_files]]
    - [rpm, [/bin/cp, /bin/pwd]]
  - name: filenames
    values: [python, go]
  append: true
```

In this case, the values are appended to any values for the base rule, and then the fields/comps/values are added to the rule's condition.

Putting it all together, the effective rule condition for this rule is:

```
... and not ((proc.name=my-custom-yum and fd.directory=/usr/bin) or                             # proc_writer
             (proc.name=my-custom-apt and fd.directory=/usr/local/bin) or
	     (proc.name=apk and fd.directory=/usr/lib/alpine) or
	     (proc.name=npm and fd.directory=/usr/node/bin) or
	     (container.image.repository=docker.io/alpine and fd.name=/usr/libexec/alpine) or   # container_writer
	     (proc.name=apt and fd.name in (apt_files)) or                                      # proc_filenames
	     (proc.name=rpm and fd.name in (/bin/cp, /bin/pwd)) or
	     (fd.filename in (python, go))                                                      # filenames
```

## Guidelines For Adding Exceptions To Rules

The default rules files have been revamped to use exceptions whenever possible, and are a good reference for best practices when defining exceptions for rules. Here are some other guidelines to follow:

### Be Specific

When defining an exception, try to think about the *actor*, *action*, and *target*, and whenever possible use all three items for an exception. For example, instead of simply using `proc.name` or `container.image.repository` for a file-based exception, also include the file being acted on via `fd.name`, `fd.directory`, etc. Similarly, if a rule is container-specific, don't only include the image `container.image.repository`, also include the processs name `proc.name`.

### Use Set Operators

If an exception involves a set of process names, file paths, etc., combine the process names into a list and use the `in`/`pmatch` operator to handle the values in a single exception. Here's an example:

```yaml
    - name: proc_file
      fields: [proc.name, fd.name]
      comps: [in, in]
      values:
        - [[qualys-cloud-ag], [/etc/qualys/cloud-agent/qagent-log.conf]]
        - [[update-haproxy-,haproxy_reload.], [/etc/openvpn/client.map]]
        - [[start-fluentd], [/etc/fluent/fluent.conf, /etc/td-agent/td-agent.conf]]
```

This exception matches process name and path, but allows for multiple process names writing to any of a set of files.

## More Information

The original [proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md) describes the benefits of exceptions in more detail.
