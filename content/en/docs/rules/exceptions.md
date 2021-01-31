---
title: Rule Exceptions
weight: 3
---

# Introduction

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

# Rule Exceptions

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
   - name: container_writer
     fields: [container.image.repository, fd.directory]
     comps: [=, startswith]
   - name: proc_filenames
     fields: [proc.name, fd.name]
     comps: [=, in]
   - name: filenames
     fields: fd.filename
     comps: in
```

This rule defines four kinds of exceptions:
  * proc_writer: uses a combination of proc.name and fd.directory
  * container_writer: uses a combination of container.image.repository and fd.directory
  * proc_filenames: uses a combination of process and list of filenames.
  * filenames: uses a list of filenames

The specific strings "proc_writer"/"container_writer"/"proc_filenames"/"filenames" are arbitrary strings and don't have a special meaning to the rules file parser. They're only used to link together the list of field names with the list of field values that exist in the exception object.

proc_writer does not have any comps property, so the fields are directly compared to values using the = operator. container_writer does have a comps property, so each field will be compared to the corresponding exception items using the corresponding comparison operator.

proc_filenames uses the in comparison operator, so the corresponding values entry should be a list of filenames.

filenames differs from the others in that it names a single field and single comp operator. This changes how the exception condition snippet is constructed (see below).

Notice that exceptions are defined as a part of the rule. This is important because the author of the rule defines what construes a valid exception to the rule. In this case, an exception can consist of a process and file directory (actor and target), but not a process name only (too broad).

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
    - [apt, apt_files]
    - [rpm, [/bin/cp, /bin/pwd]]
  - name: filenames
    values: [python, go]
  append: true
```

A rule exception applies if for a given event, the fields in a rule.exception match all of the values in some exception.item. For example, if a program `apk` writes to a file below `/usr/lib/alpine`, the rule will not trigger, even if the condition is met.

Notice that an item in a values list can be a list. This allows building exceptions with operators like "in", "pmatch", etc. that work on a list of items. The item can also be a name of an existing list. If not present surrounding parantheses will be added.

Finally, note that the structure of the values property differs between the items where fields is a list of fields (proc_writer/container_writer/proc_filenames) and when it is a single field (procs_only). This changes how the condition snippet is constructed.

## Exceptions: Syntatic Sugar For Conditions

For exception items where the fields property is a list of field names, each exception can be thought of as an implicit "and not (field1 cmp1 val1 and field2 cmp2 val2 and...)" appended to the rule's condition. For exception items where the fields property is a single field name, the exception can be thought of as an implict "and not field cmp (val1, val2, ...)". That's how exceptions are implemented--when parsing rules, exceptions are converted to a string like the above and appended to the condition, before the condition is compiled.

When a rule is parsed, the original condition is wrapped in an extra layer of parentheses and all exception values are appended to the condition. For example, using the example above, the resulting condition is:

```
(<Write below binary dir condition>) and not (
    (proc.name = apk and fd.directory = /usr/lib/alpine) or (proc.name = npm and fd.directory = /usr/node/bin) or
	(container.image.repository = docker.io/alpine and fd.directory startswith /usr/libexec/alpine) or
	(proc.name=apt and fd.name in (apt_files))) or
	(fd.filename in (python, go))))
```

The exceptions are effectively syntatic sugar that allows expressing sets of exceptions in a concise way.

# Guidelines For Adding Exceptions To Rules

The default rules files have been revamped to use exceptions whenever possible, and are a good reference for best practices when defining exceptions for rules. Here are some other guidelines to follow:

## Be Specific

When defining an exception, try to think about the *actor*, *action*, and *target*, and whenever possible use all three items for an exception. For example, instead of simply using `proc.name` or `container.image.repository` for a file-based exception, also include the file being acted on via `fd.name`, `fd.directory`, etc. Similarly, if a rule is container-specific, don't only include the image `container.image.repository`, also include the processs name `proc.name`.

## Use Set Operators

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

# More Information

The original [proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md) describes the benefits of exceptions in more detail.
