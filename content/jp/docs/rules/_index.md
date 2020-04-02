---
title: ルール
weight: 2
---

Falco *ルールファイル*は、3種類の要素を含む[YAML](http://www.yaml.org/start.html)ファイルです：

要素 | 説明
:-------|:-----------
[Rules](#rules) | *アラートが生成される*条件*。 ルールには、アラートとともに送信される説明的な*出力文字列*が付いています。
[Macros](#macros) | ルールや他のマクロ内で再利用できるルール条件スニペット。マクロは、一般的なパターンに名前を付け、ルールの冗長性を除外する方法を提供します。
[Lists](#lists) | ルール、マクロ、またはその他のリストに含めることができるアイテムのコレクション。ルールやマクロとは異なり、リストはフィルタリング式としてパースできません。

## バージョン管理

時々、古いバージョンのFalcoとの下位互換性がないルールファイル形式に変更を加えます。同様に、Falcoに組み込まれたSysdigライブラリは、新しいfiltercheckフィールド、演算子などを定義する場合があります。特定のルールセットは、それらのSysdigライブラリのフィールド/演算子に依存することを示します。

{{< info >}}
Falcoバージョン** 0.14.0 **以降、Falcoルールは、FalcoエンジンとFalcoルールファイルの両方の明示的なバージョン管理をサポートしています。
{{< /info >}}

### Falcoエンジンのバージョン管理

`falco`実行可能ファイルと`falco_engine` C ++オブジェクトがバージョン番号を返すことをサポートするようになりました。初期バージョンは2です(以前のバージョンが1であったことを意味します)。ルールファイル形式に互換性のない変更を加えるか、新しいフィルターチェックフィールド/オペレーターをFalcoに追加するたびに、このバージョンを増分します。

### Falcoルールファイルのバージョン管理

Falcoに含まれているFalcoルールファイルには、このルールファイルを読み取るために必要な最低限のエンジンバージョンを指定する、新しい最上位オブジェクト `required_engine_version：N`が含まれています。含まれていない場合、ルールファイルの読み取り時にバージョンチェックは実行されません。

ルールファイルにFalcoエンジンのバージョンよりも大きい `engine_version`がある場合、ルールファイルがロードされてエラーが返されます。

## ルール

Falco *ルール*は、次のKeyを含むノードです：

Key | 必須 | 説明 | デフォルト
:---|:---------|:------------|:-------
`rule` | yes | 短いユニークなルール名。 |
`condition` | yes | イベントに対して適用され、ルールに一致するかどうかを確認するフィルタリング式。 |
`desc` | yes | ルールが検出した際の詳細な説明 |
`output` | yes | Sysdig [出力フォーマット構文](http://www.sysdig.com/wiki/sysdig-user-guide/#output-formatting)に従って、一致するイベントが発生した場合に出力されるメッセージを指定します。 |
`priority` | yes | イベントの重大度の大文字と小文字を区別しない表現。次のいずれかでなければなりません： `emergency`、` alert`、 `critical`、` error`、 `warning`、` notice`、 `informational`、` debug`。 |
`enabled` | no | もし`false`に設定されている場合、ルールは読み込まれず、どのイベントに対してもマッチしません。 | `true`
`tags` | no | ルールに適用されたタグのリスト(詳細については、[以下](#tags))。 |
`warn_evttypes` | no | もし`false`に設定されている場合、Falcoはイベントタイプを持たないルールに関連する警告を抑制します(詳細は、[以下](#rule-condition-best-practices))。 | `true`
`skip-if-unknown-filter` | no | もし`true`に設定されている場合でルール条件にフィルターチェックが含まれている場合、たとえば `fd.some_new_field`、これはFalcoのこのバージョンでは認識されていません。Falcoは暗黙のうちにルールを受け入れますが、実行しません。`false`に設定した場合、不明なフィルターチェックを見つけた時にFalcoはエラーをレポートし、existします。 | `false`

## 条件

ルールの重要な部分は_condition_フィールドです。条件は、Sysdig [フィルター構文](http://www.sysdig.com/wiki/sysdig-user-guide/#filtering)を使用して表現されたSysdigイベントのブール述語です。Sysdigフィルターはすべて有効なFalco条件になります(以下で説明する特定の除外されたシステムコールを除いて)。さらに、Falco条件にはマクロを含めることができます(この機能はSysdig構文にはありません)。

以下は、コンテナ内でbashシェルが実行されるたびに警告する条件の例です:

```
container.id != host and proc.name = bash
```

最初の句は、イベントがコンテナで発生したことを確認します(Sysdigイベントには、イベントが通常のホストで発生した場合、`"host"`に等しい`container`フィールドがあります)。 2番目の句は、プロセス名が`bash`であることを確認します。この条件には、システムコールの句も含まれていないことに注意してください。イベントのメタデータのみをチェックします。そのため、bashシェルがコンテナー内で起動した場合、Falcoはそのシェルによって実行されるすべてのsyscallに対してイベントを出力します。

{{< success >}}
Sysdigが初めてで、どのフィールドが利用可能かわからない場合は、 `sysdig -l`を実行して、サポートされているフィールドのリストを確認してください。
{{< /success >}}

上記の条件を使用した完全なルールは次のようになります：

```yaml
- rule: shell_in_container
  desc: notice shell activity within a container
  condition: container.id != host and proc.name = bash
  output: shell in a container (user=%user.name container_id=%container.id container_name=%container.name shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```

## マクロ

上記のように、マクロは、ルールの一般的なサブ部分を再利用可能な方法で定義する方法を提供します。非常に単純な例として、コンテナで発生するイベントに関する多くのルールがある場合、 `in_container`マクロを定義することができます：

```yaml
- macro: in_container
  condition: container.id != host
```

このマクロを定義すると、上記のルールの条件を `in_container and proc.name = bash`に書き換えることができます。

ルールとマクロのより多くの例については、[デフォルトマクロ](./default-macros)または `rules/falco_rules.yaml`ファイルのドキュメントをご覧ください。

## リスト

*リスト*は、ルール、マクロ、または他のリストに含めることができるアイテムの名前付きコレクションです。リストはフィルタリング式として解析できないことに注意してください。各リストノードには次のKeyがあります。

Key | 説明
:---|:-----------
`list` | リストのユニークな名前（スラッグとして）
`items` | 値のリスト

以下は、リストの例とそれらを使用するマクロです：

```yaml
- list: shell_binaries
  items: [bash, csh, ksh, sh, tcsh, zsh, dash]

- list: userexec_binaries
  items: [sudo, su]

- list: known_binaries
  items: [shell_binaries, userexec_binaries]

- macro: safe_procs
  condition: proc.name in (known_binaries)
```

リストを参照すると、マクロ、ルール、またはリストにリスト項目が挿入されます。

{{< success >}}
リストには他のリストを含めることが*できます*。
{{< /success >}}

## リスト、ルール、マクロへの追加

複数のFalcoルールファイルを使用する場合は、既存のリスト、ルール、またはマクロに新しいアイテムを追加することができます。これを行うには、既存のアイテムと同じ名前のアイテムを定義し、 `append: true`属性をリストに追加します。リストを追加すると、アイテムはリストの**末尾**に追加されます。ルール/マクロを追加すると、追加のテキストがルール/マクロの条件:フィールドに追加されます。

### 例

以下のすべての例では、`falco -r /etc/falco/falco_rules.yaml -r /etc/falco/falco_rules.local.yaml`を介してFalcoを実行しているか、またはデフォルトの`rules_file`のエントリがfalco.yamlにあり、最初に`/etc/falco/falco.yaml`、次に`/etc/falco/falco_rules.local.yaml`があります。

#### リストへの追加

リストに追加する例を次に示します：

**/etc/falco/falco_rules.yaml**

```yaml
- list: my_programs
  items: [ls, cat, pwd]

- rule: my_programs_opened_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (my_programs) and evt.type=open
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

**/etc/falco/falco_rules.local.yaml**

```yaml
- list: my_programs
  append: true
  items: [cp]
```

ルール `my_programs_opened_file`は、` ls`、 `cat`、` pwd`、または `cp`のいずれかがファイルをオープンした時にトリガーされます。

#### マクロに追加

マクロに追加する例を次に示します：

**/etc/falco/falco_rules.yaml**

```yaml
- macro: access_file
  condition: evt.type=open

- rule: program_accesses_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (cat, ls) and (access_file)
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

**/etc/falco/falco_rules.local.yaml**
```yaml
- macro: access_file
  append: true
  condition: or evt.type=openat
```

ルール `program_accesses_file`は、`ls`/`cat`がファイルに対して`open`/`openat`を使用したときにトリガーされます。

#### ルールに追加

ルールに追加する例を次に示します：

**/etc/falco/falco_rules.yaml**
```yaml
- rule: program_accesses_file
  desc: track whenever a set of programs opens a file
  condition: proc.name in (cat, ls) and evt.type=open
  output: a tracked program opened a file (user=%user.name command=%proc.cmdline file=%fd.name)
  priority: INFO
```

**/etc/falco/falco_rules.local.yaml**

```yaml
- rule: program_accesses_file
  append: true
  condition: and not user.name=root
```
ルール `program_accesses_file`は、`ls`/`cat`がファイルに対して`open`を使用したときにトリガーされますが、ユーザーがrootの場合はトリガーされません。

### ルール/マクロの追加および論理演算子を含む問題

ルールとマクロを追加する場合、2番目のルール/マクロのテキストは、最初のルール/マクロの条件に単に追加されることに注意してください。元のルール/マクロにあいまいな論理演算子が含まれている可能性がある場合、これは意図しない結果になる可能性があります。次に例を示します。

```yaml
- rule: my_rule
  desc: ...
  condition: evt.type=open and proc.name=apache
  output: ...

- rule: my_rule
  append: true
  condition: or proc.name=nginx
```

`proc.name=nginx`は`and proc.name=apache`に関連して解釈される必要があります。つまり、apache/nginxがファイルを開くことを許可するか、または`evt.type=open`に関連して解釈されます。Apacheがファイルを開くことを許可するか、nginxに何かをさせることを許可しますか？

このような場合、可能な場合は元の条件の論理演算子の範囲を括弧で囲み、条件が追加されないようにします。

## ルールの優先順位

すべてのFalcoルールには、ルール違反の深刻度を示す優先度があります。優先度はメッセージ/JSON出力などに含まれています。利用可能な優先順位は次のとおりです：

* `EMERGENCY`
* `ALERT`
* `CRITICAL`
* `ERROR`
* `WARNING`
* `NOTICE`
* `INFORMATIONAL`
* `DEBUG`

ルールに優先度を割り当てるために使用される一般的なガイドラインは次のとおりです：

* ルールが書き込み状態(ファイルシステムなど)に関連している場合、その優先度は`ERROR`です。
* ルールが状態の不正な読み取り(つまり、機密ファイルの読み取りなど)に関連している場合、その優先度は`WARNING`です。
* ルールが予期しない動作(コンテナでの予期しないシェルの起動、予期しないネットワーク接続のオープンなど)に関連している場合、その優先順位は`NOTICE`です。
* ルールが適切な慣行(予期しない特権コンテナ、重要なマウントを持つコンテナ、rootとして対話型コマンドを実行する)に対する動作に関連している場合、その優先度は`INFO`です。

例外の1つは、FPが発生しやすい"Run shell untrusted"ルールの優先度が`DEBUG`であることです。

## ルールタグ {#tags}

0.6.0以降、ルールにはオプションの_tags_のセットがあり、ルールセットを関連するルールのグループに分類するために使用されます。 次に例を示します：

```yaml
- rule: File Open by Privileged Container
  desc: Any open by a privileged container. Exceptions are made for known trusted images.
  condition: (open_read or open_write) and container and container.privileged=true and not trusted_containers
  output: File opened for read/write by privileged container (user=%user.name command=%proc.cmdline %container.info file=%fd.name)
  priority: WARNING
  tags: [container, cis]
```

この場合、"File Open by Privileged Container"ルールには、"container"と"cis"のタグが付けられています。特定のルールにタグキーが存在しないか、リストが空の場合、ルールにはタグがありません。

タグの使用方法は次のとおりです：

* `-T <tag>`引数を使用して、特定のタグを持つルールを無効にすることができます。`-T`は複数回指定できます。たとえば、"filesystem"タグと"cis"タグを持つすべてのルールをスキップするには、`falco -T filesystem -T cis ...`でfalcoを実行します。`-T`は`-t`と同時に指定できません。
* `-t <tag>`引数を使用して、特定のタグを持つルール*のみ*を実行できます。`-t`は複数回指定できます。たとえば、"filesystem"タグと"cis"タグを含むルールのみを実行するには、`falco -t filesystem -t cis ...`を指定してfalcoを実行します。`-t`は、`-T`または`-D <pattern>`と一緒に指定することはできません（ルール名の正規表現でルールを無効にします）。

### 現在のFalcoルールセットのタグ

デフォルトのルールセットを使用して、すべてのルールに最初のタグセットをタグ付けしました。使用したタグは次のとおりです：

タグ | 説明
:---|:-----------
`filesystem` | ルールはファイルの読み取り/書き込みに関連しています
`sofware_mgmt` | ルールは、rpm、dpkgなどのソフトウェア/パッケージ管理ツールに関連しています。
`process` | ルールは、新しいプロセスの開始または現在のプロセスの状態の変更に関連しています
`database` | ルールはデータベースに関連しています
`host` | ルールはコンテナの外で*のみ*機能します
`shell` | ルールは特にシェルの開始に関連しています
`container` | ルールはコンテナ内で*のみ*機能します
`cis` | ルールはCIS Dockerベンチマークに関連しています
`users` | ルールは、ユーザーの管理または実行中のプロセスのIDの変更に関連しています
`network` | ルールはネットワーク活動に関連しています

上記の複数に関連している場合、ルールは複数のタグを持つことができます。Falcoルールセットのすべてのルールには、現在少なくとも1つのタグがあります。

## ルール条件のベストプラクティス

イベントタイプごとにルールをグループ化できるようにしてパフォーマンスを向上させるために、Falcoは、条件の先頭で、否定演算子の前に少なくとも1つの `evt.type=`演算子を含むルール条件を優先します(つまり、 `not`または`!=`)。条件に `evt.type=`演算子がない場合、Falcoは次のような警告をログに記録します：

```
Rule no_evttype: warning (no-evttype):
proc.name=foo
     did not contain any evt.type restriction, meaning that it will run for all event types.
     This has a significant performance penalty. Consider adding an evt.type restriction if possible.
```

ルールの条件の後半に`evt.type`演算子がある場合、Falcoは次のような警告をログに記録します：

```
Rule evttype_not_equals: warning (trailing-evttype):
evt.type!=execve
     does not have all evt.type restrictions at the beginning of the condition,
     or uses a negative match (i.e. "not"/"!=") for some evt.type restriction.
     This has a performance penalty, as the rule can not be limited to specific event types.
     Consider moving all evt.type restrictions to the beginning of the rule and/or
     replacing negative matches with positive matches if possible.
```

## 特殊文字のエスケープ

場合によっては、ルールに `(`、スペースなどの特殊文字を含める必要があります。たとえば、`(systemd)`の`proc.name`を検索する必要がある場合があります。

FalcoはSysdigと同様に、`"`を使用してこれらの特殊文字をキャプチャできます。次に例を示します：

```yaml
- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name="(systemd)" or proc.name=systemd
  output: "File opened by systemd (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```

リストにアイテムを含める場合は、引用符で囲まれた文字列を一重引用符で囲んで、二重引用符がYAMLファイルから解釈されないようにしてください。 次に例を示します：

```yaml
- list: systemd_procs
  items: [systemd, '"(systemd)"']

- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name in (systemd_procs)
  output: "File opened by systemd (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```

## 無視されたシステムコール

パフォーマンス上の理由から、一部のシステムコールは現在、Falcoが処理する前に破棄されます。これが現在のリストです：

```
accept access alarm brk capget clock_getres clock_gettime clock_nanosleep clock_settime clone close container cpu_hotplug drop epoll_create epoll_create1 epoll_ctl epoll_pwait epoll_wait eventfd eventfd2 execve exit_group fcntl fcntl64 fdatasync fgetxattr flistxattr fork fstat fstat64 fstatat64 fstatfs fstatfs64 fsync futex get_robust_list get_thread_area getcpu getcwd getdents getdents64 getegid geteuid getgid getgroups getitimer getpeername getpgid getpgrp getpid getppid getpriority getresgid getresuid getrlimit getrusage getsid getsockname getsockopt gettid gettimeofday getuid getxattr infra io_cancel io_destroy io_getevents io_setup io_submit ioctl ioprio_get ioprio_set k8s lgetxattr listxattr llistxattr llseek lseek lstat lstat64 madvise mesos mincore mlock mlockall mmap mmap2 mprotect mq_getsetattr mq_notify mq_timedreceive mq_timedsend mremap msgget msgrcv msgsnd munlock munlockall munmap nanosleep newfstatat newselect notification olduname page_fault pause poll ppoll pread pread64 preadv procexit procinfo pselect6 pwrite pwrite64 pwritev read readv recv recvmmsg remap_file_pages rt_sigaction rt_sigpending rt_sigprocmask rt_sigsuspend rt_sigtimedwait sched_get_priority_max sched_get_priority_min sched_getaffinity sched_getparam sched_getscheduler sched_yield select semctl semget semop send sendfile sendfile64 sendmmsg setitimer setresgid setrlimit settimeofday sgetmask shutdown signaldeliver signalfd signalfd4 sigpending sigprocmask sigreturn splice stat stat64 statfs statfs64 switch sysdigevent tee time timer_create timer_delete timer_getoverrun timer_gettime timer_settime timerfd_create timerfd_gettime timerfd_settime times ugetrlimit umask uname unlink unlinkat ustat vfork vmsplice wait4 waitid waitpid write writev
```

`-i`を付けて実行すると、Falcoは無視された一連のイベント/syscallを出力して終了します。上記のリストのシステムコールを含むすべてのイベントに対してFalcoを実行する場合は、`-A`フラグを指定してFalcoを実行できます。


