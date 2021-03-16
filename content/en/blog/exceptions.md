---
title: Falco Rules Now Support Exceptions
date: 2021-01-19
author: Mark Stemm
---

One of the upcoming features in Falco 0.28.0 is support for *exceptions* in rules. Exceptions are a concise way to represent conditions under which a rule should *not* generate an alert. Here's a quick example:

```yaml
- rule: Write below binary dir
  ...
  exceptions:
    - name: known_bin_writers
      fields: [proc.name, fd.name]
      comps: [=, contains]
	  values:
	   - [nginx, /usr/bin/nginx]
	   - [apache, /bin/apache]
  ...
```

This rule defines an exception `known_bin_writers`, using fields `proc.name` and `fd.name`, and lists combinations of processes and file paths that are allowed to write to binary directories.

### Why Are Exceptions Useful?

Currently, most rules have additional condition snippets of the form `and not ...` that define exceptions e.g. conditions user which the rule should not generate an alert.

The rule with the most exceptions is `Write below etc` via the macro `write_etc_common`. Prior to these changes, it had ~90 exceptions to track various programs and paths below /etc! Each exception was expressed as its own top-level macro:

```yaml
- macro: write_etc_common
  condition: >
    etc_dir and evt.dir = < and open_write
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
    and not plesk_writing_keys
    and not plesk_install_writing_apache_conf
    and not plesk_running_mktemp
    and not networkmanager_writing_resolv_conf
    and not run_by_chef
    and not add_shell_writing_shells_tmp
    and not duply_writing_exclude_files
    and not xmlcatalog_writing_files
    and not parent_supervise_running_multilog
    and not supervise_writing_status
    and not pki_realm_writing_realms
    and not htpasswd_writing_passwd
    and not lvprogs_writing_conf
    and not ovsdb_writing_openvswitch
    and not datadog_writing_conf
    and not curl_writing_pki_db	...
```

This polluted the top-level set of objects with a bunch of one-off macros only used by a single rule.

#### Problems with Appends/Overrides to Define Exceptions

Although the concepts of macros and lists in condition fields, combined with appending to lists/conditions in macros/rules, is very general purpose, it can be unwieldy:

* Appending to conditions can result in incorrect behavior, unless the original condition has its logical operators set up properly with parentheses. For example:

```yaml
rule: my_rule
condition: (evt.type=open and (fd.name=/tmp/foo or fd.name=/tmp/bar))

rule: my_rule
condition: or fd.name=/tmp/baz
append: true
```

Results in unintended behavior. It will match any fd related event where the name is /tmp/baz, when the intent was probably to add /tmp/baz as an additional opened file.

* A good convention many rules use is to have a clause "and not user_known_xxxx" built into the condition field. However, it's not in all rules and its use is a bit haphazard.

* Appends and overrides can get confusing if you try to apply them multiple times. For example:

```yaml
macro: allowed_files
condition: fd.name=/tmp/foo

...

macro: allowed_files
condition: and fd.name=/tmp/bar
append: true
```

If someone wanted to override the original behavior of allowed_files, they would have to use `append: false` in a third definition of allowed_files, but this would result in losing the append: true override.

### Exceptions Syntax

Starting in 0.28.0, falco supports an optional `exceptions` property to rules. The exceptions property value is a list of identifier, list of tuples of filtercheck fields, and optional comparison operators and field values. Here's an example:

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

filenames differs from the others in that it names a single field and single comp operator. In this case, all values are combined into a single list.

Notice that exception fields and comparison operators are defined as a part of the rule. This is important because the author of the rule defines what construes a valid exception to the rule. In this case, an exception can consist of a process and file directory (actor and target), but not a process name only (too broad).

Exception values may also be defined as a part of a rule, but in many cases values will be defined in rules with append: true. Here's an example:

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

This appended version of `Write below binary dir` defines tuples of field values, with the exception name used to link the filtercheck fields and values. A rule exception applies if for a given event, the fields in a rule.exception match all of the values in some exception.item. For example, if a program `apk` writes to a file below `/usr/lib/alpine`, the rule will not trigger, even if the condition is met.

Notice that an item in a values list can be a list. This allows building exceptions with operators like "in", "pmatch", etc. that work on a list of items. The item can also be a name of an existing list. If not present surrounding parantheses will be added.

Finally, note that the structure of the values property differs between the items where fields is a list of fields (proc_writer/container_writer/proc_filenames) and when it is a single field (procs_only). This changes how the exceptions are folded into the rule's condition.

### Rules Updated To Use Exceptions

Along with this code change, we've also revamped the rules to migrate as many rules as possible to use exceptions instead of one-off macros. We've kept the original ad-hoc "customization' macros e.g. `user_known_update_package_registry`, `user_known_write_below_binary_dir_activities`, etc. so if you had already added exceptions in the form of appends/overrides of these macros, those exceptions will continue to work. Please consider using exceptions whenever possible to customize the behavior of existing rules, and please define exceptions fields when creating your own rules.

### Learn More

We have a more complete description of how exceptions work in the [documentation](https://falco.org/docs/rules/exceptions) along with best practices for adding exceptions to rules. You can also read the original [proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md) describes the benefits of exceptions in more detail.

In case you prefer to just try them out please notice you need Falco 0.27.0-15+8c4040b ([deb](https://bintray.com/falcosecurity/deb-dev/falco/0.27.0-15%2B8c4040b), [rpm](https://bintray.com/falcosecurity/rpm-dev/falco/0.27.0-15%2B8c4040b), [tarball](https://bintray.com/falcosecurity/bin-dev/falco/0.27.0-15%2B8c4040b)).

**March 2021 update**: All packages are now published to [download.falco.org](https://download.falco.org/?prefix=packages/).
