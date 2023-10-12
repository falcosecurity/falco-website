---
exclude_search: true
title: Falcoのルールが例外をサポートするようになりました
date: 2021-01-19
author: Mark Stemm
---

Falco 0.28.0で予定されている機能の1つは、ルールの*exceptions*のサポートです。例外は、ルールがアラートを生成してはいけない条件を簡潔に表現する方法です。ここに簡単な例を示します:

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

このルールは `known_bin_writers` という例外を定義し、 `proc.name` と `fd.name` というフィールドを用いて、バイナリディレクトリへの書き込みを許可するプロセスとファイルパスの組み合わせをリストアップします。

### なぜ例外は有用なのか？

現在のところ、ほとんどのルールは `and not ...` という形式の条件スニペットを追加しており、ルールがアラートを生成してはいけない条件などの例外を定義しています。

最も例外が多いルールは `write_etc_common` マクロを使った `Write below etc` です。これらの変更の前には、/etc 以下の様々なプログラムやパスを追跡するために ~90 個の例外がありました! それぞれの例外は、それ自身のトップレベルのマクロとして表現されていました:

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

これは、単一のルールでのみ使用されるワンオフマクロの束でオブジェクトのトップレベルセットを汚しています。

#### 例外を定義するための追加/オーバーライドの問題点

条件フィールド内のマクロとリストの概念は、マクロ/ルール内のリスト/条件への追加と組み合わせて非常に汎用的ですが、扱いにくくなることがあります。

* 元の条件の論理演算子が括弧で適切に設定されていない限り、条件への追加は正しくない動作になる可能性があります。例えば、以下のようになります。

```yaml
rule: my_rule
condition: (evt.type=open and (fd.name=/tmp/foo or fd.name=/tmp/bar))

rule: my_rule
condition: or fd.name=/tmp/baz
append: true
```

意図しない動作をします。fd関連のイベントで名前が/tmp/bazになっているものは、おそらく/tmp/bazを追加でオープンしたファイルとして追加することを意図していたのでしょうが、これはマッチします。

* 多くのルールで使われている良い慣習は、条件フィールドに "and not user_known_xxxx "という句を入れることです。しかし、これはすべてのルールにあるわけではなく、少し行き当たりばったりな使い方をしています。

* 追加やオーバーライドは、複数回適用しようとすると混乱する可能性があります。例えば、以下のようになります:

```yaml
macro: allowed_files
condition: fd.name=/tmp/foo

...

macro: allowed_files
condition: and fd.name=/tmp/bar
append: true
```

もし誰かが allowed_files の元の動作を上書きしたい場合は、allowed_files の第三の定義で `append: false` を使用しなければなりませんが、これは append: true の上書きを失うことになります。

### 例外構文

0.28.0 以降、falco はオプションの `exceptions` プロパティをルールに追加できるようになりました。例外プロパティの値は、識別子のリスト、フィルタチェックフィールドのタプルのリスト、オプションの比較演算子とフィールド値のリストです。以下に例を示します:

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

このルールでは、4種類の例外を定義しています:
  * proc_writer: proc.name と fd.directory の組み合わせを使用します。
  * container_writer: container.image.repository と fd.directory を組み合わせて使用します。
  * proc_filenames: プロセスとファイル名のリストを組み合わせて使用します。
  * filenames: ファイル名のリストを使用します。

特定の文字列 "proc_writer"/"container_writer"/"proc_filenames"/"filenames "は任意の文字列であり、ルール・ファイル・パーサにとって特別な意味を持ちません。これらは、フィールド名のリストと例外オブジェクトに存在するフィールド値のリストをリンクするためにのみ使用されます。

proc_writer は comps プロパティを持たないので、フィールドは = 演算子を使用して値と直接比較されます。 container_writer は comps プロパティを持つので、各フィールドは対応する比較演算子を使用して対応する例外項目と比較されます。

proc_filenames は in comparison 演算子を使用するので、対応する値のエントリはファイル名のリストでなければなりません。

filenamesは、単一のフィールドと単一の比較演算子を指定する点で他のものとは異なります。この場合、すべての値は1つのリストにまとめられます。

例外フィールドと比較演算子がルールの一部として定義されていることに注目してください。これは、ルールの作成者が、ルールに対する有効な例外の解釈を定義しているため、重要なことです。この場合、例外はプロセスとファイルディレクトリ(アクターとターゲット)で構成されますが、プロセス名のみでは構成されません(広すぎる)。

例外値はルールの一部として定義することもできますが、多くの場合、値は append: true でルールの中で定義されます。以下に例を示します:

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

バイナリディレクトリの下に書き込む`Write below binary dir`の追加版では、フィールドの値のタプルを定義し、フィルタチェックのフィールドと値をリンクするための例外名を使用します。ルールの例外は、あるイベントに対して、rule.exceptionのフィールドがexception.itemのすべての値と一致した場合に適用されます。例えば、プログラム `apk` が `/usr/lib/alpine` 以下のファイルに書き込んだ場合、条件が満たされていてもルールは発動しない。

値リストの項目はリストになることに注意してください。これにより、"in "や "pmatch "などの演算子を使って例外を構築することができます。項目は、既存のリストの名前にすることもできます。存在しない場合は、周囲の括弧が追加されます。

最後に、fieldsがフィールドのリスト(proc_writer/container_writer/proc_filenames)である場合と、単一のフィールド(procs_only)である場合では、valuesプロパティの構造が異なることに注意してください。これにより、例外がルールの条件にどのように折り込まれるかが変わります。

### 例外を使用するためにルールが更新されました

このコードの変更に伴い、1回限りのマクロの代わりに例外を使用するために、できるだけ多くのルールを移行するようにルールを刷新しました。 `user_known_update_package_registry`、`user_known_write_below_binary_dir_activities`などの元のアドホックな「カスタマイズ」マクロを保持しているため、これらのマクロの追加/オーバーライドの形で例外をすでに追加している場合、それらの例外は引き続き機能します。可能な限り例外を使用して既存のルールの動作をカスタマイズすることを検討してください。独自のルールを作成するときは、例外フィールドを定義してください。

### さらに学ぶ

例外がどのように機能するのかについては、[ドキュメント](https://falco.org/docs/rules/exceptions) に、ルールに例外を追加するためのベストプラクティスとともに、より完全な説明があります。また、オリジナルの [proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md) には、例外の利点をより詳細に説明しています。

例外を試してみたい場合は、Falco 0.27.0-15+8c4040b ([deb](https://download.falco.org/packages/deb-dev/stable/falco-0.27.0-15%2B8c4040b-x86_64.deb), [rpm](https://download.falco.org/packages/rpm-dev/falco-0.27.0-15%2B8c4040b-x86_64.rpm), [tarball](https://download.falco.org/packages/bin-dev/x86_64/falco-0.27.0-19%2B959811a-x86_64.tar.gz))が必要です。