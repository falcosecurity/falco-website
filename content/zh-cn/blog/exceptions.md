---
exclude_search: true
title: Falco Rules Now Support Exceptions
date: 2021-01-19
author: Mark Stemm
---

Falco 0.28.0将推出支持规则中例外的功能。例外是一种简洁的方式，用来表示规则不生成警报的条件。下面是一个简单的例子:

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

规则定义异常 `known_bin_writers`,使用字段`proc.name`和`fd.name`,并列出允许写入二进制目录的进程和文件路径的组合。

### 为什么异常有用？

目前，大多数规则都有附加条件片段定义例外的情况，例如用户条件的规则不应生成警报。

在这些更改之前，它有大约90个例外来跟踪/etc下面的各种程序和路径等等！每个异常都表示为自己的顶级宏:

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

这污染了顶级对象，因为只由一条规则使用的一次性宏。

#### 用于定义异常的附加/重写问题

虽然条件字段中的宏和列表的概念，与在宏/规则中附加到列表/条件相结合，是非常通用的，它可能会很笨拙:

* 附加到条件可能会导致不正确的行为，除非原始条件用括号正确地设置了逻辑操作符。例如:

```yaml
rule: my_rule
condition: (evt.type=open and (fd.name=/tmp/foo or fd.name=/tmp/bar))

rule: my_rule
condition: or fd.name=/tmp/baz
append: true
```

导致意外行为。它将匹配名称为/tmp/baz的任何fd相关事件，当目的可能是将/tmp/baz添加为额外打开的文件。

* 许多规则使用的一个好约定是在条件字段中内置一个子句“and not user_known_xxxx”。然而，这并不是所有的规则，它的使用有点随意。

* 如果您尝试多次应用附录和重写，它们可能会变得混乱:

```yaml
macro: allowed_files
condition: fd.name=/tmp/foo

...

macro: allowed_files
condition: and fd.name=/tmp/bar
append: true
```

如果有人想覆盖allowed_files文件的行为，他们必须在第三方允许的allowed_files定义中使用“append:false”，但这将导致append:true被覆盖。

### 异常语法

从0.28.0开始，falco支持规则的可选“exceptions”属性。exceptions属性值是标识符列表、filtercheck字段的元组列表，以及可选的比较运算符和字段值。下面是一个例子:

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

该规则定义了四种例外情况:
  * proc_writer: uses a combination of proc.name and fd.directory
  * container_writer: uses a combination of container.image.repository and fd.directory
  * proc_filenames: uses a combination of process and list of filenames.
  * filenames: uses a list of filenames

特定字符串“proc_writer”/“container_writer”/“proc_filenames”/“filenames”是任意字符串，对规则文件解析器没有特殊含义。它们仅用于将字段名称列表与异常对象中存在的字段值列表链接在一起。

proc_writer 没有任何 comps 属性，因此使用 = 运算符将字段直接与值进行比较。container_writer 确实有一个 comps 属性，因此每个字段将使用相应的比较运算符与相应的异常项进行比较。

proc_filenames 使用 in 比较运算符，因此相应的值条目应该是文件名列表。

文件名与其他文件名的不同之处在于它命名了单个字段和单个 comp 运算符。在这种情况下，所有值都组合到一个列表中.

请注意，异常字段和比较运算符被定义为规则的一部分。这很重要，因为规则的作者定义了什么是规则的有效例外。在这种情况下，异常可以包含进程和文件目录（参与者和目标），但不能仅包含进程名称（太宽泛）.

异常值也可以定义为规则的一部分，但在许多情况下，值将在规则中用append:true定义。下面是一个例子:

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

这个附加版本的“Write below binary dir”定义了字段值的元组，例外名用于链接filtercheck字段和值。对于给定事件，规则中的字段适用规则例外。异常匹配某个异常中的所有值。项目例如，如果程序“apk”写入“/usr/lib/alpine”下的文件，则即使满足条件，也不会触发该规则。

注意，值列表中的项可以是列表。这允许使用“in”、“pmatch”等操作符构建例外，这些操作符可以处理列表项。项目也可以是现有列表的名称。如果不存在，将添加周围的括号。

最后，请注意，在字段是字段列表（proc_writer/container_writer/proc_filenames）和单个字段（procs_only）的项目之间，values 属性的结构是不同的。这会改变异常被折叠到规则条件中的方式。

### 更新规则以使用例外

除了此代码更改之外，我们还修改了规则以迁移尽可能多的规则以使用异常而不是一次性宏。我们保留了原始的临时“自定义”宏，例如user_known_update_package_registry,user_known_write_below_binary_dir_activities等，因此如果您已经以附加/覆盖这些宏的形式添加了异常，这些异常将继续有效。请考虑尽可能使用异常自定义现有规则的行为，请在创建自己的规则时定义例外字段。


### 了解更多

We have a more complete description of how exceptions work in the [documentation](https://falco.org/docs/rules/exceptions) along with best practices for adding exceptions to rules. You can also read the original [proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md) describes the benefits of exceptions in more detail.

In case you prefer to just try them out please notice you need Falco 0.27.0-15+8c4040b ([deb](https://download.falco.org/packages/deb-dev/stable/falco-0.27.0-15%2B8c4040b-x86_64.deb), [rpm](https://download.falco.org/packages/rpm-dev/falco-0.27.0-15%2B8c4040b-x86_64.rpm), [tarball](https://download.falco.org/packages/bin-dev/x86_64/falco-0.27.0-19%2B959811a-x86_64.tar.gz)).
