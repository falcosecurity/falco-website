---
title: 규칙
weight: 2
---

팔코의 *규칙 파일*은 세 가지 유형의 요소를 포함하는 [YAML](http://www.yaml.org/start.html) 파일이다.

요소 | 설명
:-------|:-----------
[규칙](#규칙) | 알림이 생성되어야 하는 *조건*이다. 규칙은 알림과 함께 전송되는 설명형의 *출력 문자열*과 함께 제공된다.
[매크로](#매크로) | 규칙 및 다른 매크로 안에서 재사용 될 수 있는 규칙 조건 스니펫. 매크로는 공통 패턴의 이름을 지정하고 규칙의 중복을 제거하는 방법을 제공한다.
[리스트](#리스트) | 규칙, 매크로 또는 기타 리스트에 포함될 수 있는 항목 모음이다. 규칙 및 매크로와 달리 목록은 필터링 식으로 구문을 분석할수 없다.

## 버저닝

때때로, 우리는 이전 버전의 팔코와 호환되지 않는 규칙 파일의 형식을 변경한다. 마찬가지로 팔코에 통합된 Sysdig 라이브러리는 새로운 필터 검사 필드, 연산자 등을 정의할 수 있다. 주어진 규칙 세트는 해당 Sysdig 라이브러리의 필드/연산자에 따라 다르다는 뜻이다.

{{% pageinfo color="primary" %}}
팔코 버전 **0.14.0**부터 팔코 규칙은 팔코 엔진과 팔코 규칙 파일 모두의 명시적인 버전 관리를 지원한다.
{{% /pageinfo %}}

### 팔코 엔진 버저닝

`falco` 실행 파일과 `falco_engine` C++ 객체는 이제 버전 번호 반환을 지원한다. 초기 버전은 2 이다(이전 버전은 1임을 의미한다). 규칙파일 형식을 호환되지 않게 변경하거나 팔코에 새 필터체크 필드/연산자를 추가할 때마다 이 버전을 증가시킬 예정이다.

### 팔코 규칙 파일 버저닝

팔코에 포함된 팔코 규칙 파일에는 이 규칙 파일을 읽는 데 필요한 최소 엔진 버전을 지정하는 새로운 최상위 객체인 `required_engine_version: N` 이 포함되어 있다. 포함되지 않는 경우 규칙 파일을 읽을 때 버전을 확인하지 않는다.

규칙 파일의 `engine_version` 이 팔코 엔진 버전보다 큰 경우 규칙 파일이 로드되고 오류가 반환 된다.

## 규칙

팔코 *규칙*은 다음의 키들을 포함하는 노드이다.

키 이름 | 필요 여부 | 설명 | 기본값
:---|:---------|:------------|:-------
`rule` | yes | 규칙의 짧고 고유한 이름 |
`condition` | yes | 규칙과 일치하는지 확인하기 위해 이벤트에 적용되는 필터링 표현식 |
`desc` | yes | 규칙이 감지하는 내용에 대한 자세한 설명 |
`output` | yes | [출력 형식 구문](http://www.sysdig.com/wiki/sysdig-user-guide/#output-formatting)에 따라 일치하는 이벤트가 발생하는 경우, 출력되어야 하는 메세지를 지정 |
`priority` | yes | 이벤트의 심각도에 대한, 대소문자를 구분하지 않는 표현. 다음 중 하나여야 한다. `emergency`, `alert`, `critical`, `error`, `warning`, `notice`, `informational`, `debug`. |
`enabled` | no | `false` 로 설정하면, 어떠한 이벤트에도 규칙이 로드되지 않으며 일치하지도 않는다. | `true`
`tags` | no | 규칙에 적용된 태그 목록(자세한 내용은 [아래](#tags)). |
`warn_evttypes` | no | `false` 로 설정하면, 팔코는 이벤트 유형이 없는 규칙과 관련된 경고를 표시하지 않는다(자세한 내용은 [아래](#규칙-조건의-모범-사례)). | `true`
`skip-if-unknown-filter` | no | `true` 로 설정하면, 규칙 조건에 예를 들어 이 버전의 팔코에서 알려지지 않은 `fd.some_new_field` 와 같은 필터 검사가 표함되어 있는 경우, 팔코는 해당 규칙을 수락하지만 실행하지는 않는다. 만약 `false` 로 설정하면, 팔코는 에러를 기록하고 알려지지 않은 필터체크를 찾을 때까지 존재한다. | `false`

## 조건

규칙의 핵심 부분은 _condition_ 필드이다. 조건은 단순히 Sysdig [필터 구문](http://www.sysdig.com/wiki/sysdig-user-guide/#filtering)을 사용하여 표현된 Sysdig 이벤트에 대한 부울 술어이다. 모든 Sysdig 필터는 유효한 팔코 조건(아래에서 설명하는 특정 제외된 시스템 호출 제외)이다. 또한 팔코 조건에는 매크로 용어가 포함될 수 있다(이 기능은 Sysdig 구문에는 존재하지 않는다).

다음은 bash 셸이 컨테이너 내부에서 실행될 때마다 알리는 조건의 예이다.

```
container.id != host and proc.name = bash
```

첫 번째 절은 이벤트가 컨테이너에서 발생했는지를 확인한다(이벤트가 일반 호스트에서 발생한 경우 Sysdig 이벤트에는 `"host"` 와 동일한 `container` 필드가 존재한다). 두 번째 절은 프로세스 이름이 `bash` 인지 확인한다. 이 조건은 시스템 호출이 있는 절은 포함하지 않는다. 이벤트 메타 데이터만을 확인한다. 따라서 bash 셸이 컨테이너에서 시작되면 팔코는 해당 셸에서 수행되는 모든 시스템 호출에 대한 이벤트를 출력한다.

이 조건을 사용하는 완성된 규칙은 다음과 같다.

```yaml
- rule: shell_in_container
  desc: notice shell activity within a container
  condition: container.id != host and proc.name = bash
  output: shell in a container (user=%user.name container_id=%container.id container_name=%container.name shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```

## 매크로

위에서 언급했듯이, 매크로는 재사용 가능한 방식으로 규칙의 공통 하위 부분을 정의하는 방법을 제공한다. 아주 간단한 예로서, 컨테이너에서 발생하는 이벤트에 대한 많은 규칙이 있다면 `in_container` 매크로를 정의할수 있다.

```yaml
- macro: in_container
  condition: container.id != host
```

이 매크로를 정의하면 위 규칙의 조건을 `in_container and proc.name = bash` 로 다시 작성할 수 있다.

규칙 및 매크로의 더 많은 예에 대하여는 [기본 매크로](https://falco.org/docs/rules/default-macros/) 또는 `rules/falco_rules.yaml` 파일에 대한 문서를 참조하라.

## 리스트

*리스트* 는 규칙, 매크로 또는 기타 모곩에 포함할 수 있는 명명된 항목의 모음이다. 목록은 필터링 표현식으로 구문 분석할수 *없다*. 각 목록 노드에는 다음의 키가 있다.

키 | 설명
:---|:-----------
`list` | 리스트의 고유한 이름(간단한 표현(slug)로써)
`items` | 값들의 리스트

다음은 리스트와 리스트를 사용하는 매크로의 몇 가지 예이다.

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

리스트를 참조하면 매크로, 규칙 또는 리스트에 리스트 항목이 삽입된다.

리스트는 다른 리스트를 포함할 수 *있다*.


## 리스트, 규칙 및 매크로에 추가하기

여러 개의 팔코 규칙 파일을 사용하는 경우 기존 리스트, 규칙 또는 매크로에 새 항목을 추가할 수 있다. 이를 위해 기존 항목과 이름이 같은 항목을 정의하고 `append: true` 속성을 리스트에 추가한다. 리스트를 추가하면 항목이 리스트의 **끝**에 추가된다. 규칙/매크로를 추가할 때 추가 텍스트가 규칙/매크로의 condition: 필드에 추가된다.

### 예제

아래의 모든 예제에서, `falco -r /etc/falco/falco_rules.yaml -r /etc/falco/falco_rules.local.yaml` 을 통해 팔코를 실행 중이거나, `/etc/falco/falco.yaml`	가 앞에 오고, `/etc/falco/falco_rules.local.yaml` 항목이 두 번째에 있는 falco.yaml 파일 안의  `rules_file` 에 대한 기본 항목이 있는 것으로 가정한다.

#### 리스트에 추가하기

다음은 리스트에 추가하는 몇 가지 예제이다.

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

`my_programs_opened_file` 규칙은 `ls`, `cat`, `pwd` 또는 `cp` 가 파일을 열 때마다 트리거 된다.

#### 매크로에 추가하기

다음은 매크로에 추가하는 몇 가지 예제이다.

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

`program_accesses_file` 규칙은 `ls`/`cat` 이 파일에서 `open`/`openat` 를 사용할 때 트리거 된다.

#### 규칙에 추가하기

다음은 규칙에 추가하는 몇 가지 예제이다.

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
`program_accesses_file` 규칙은 `ls`/`cat` 이 파일에서 `open` 을 사용할 때 트리거 되지만, 사용자가 루트인 경우에는 트리거 되지 않는다.

### 규칙/매크로 및 논리 연산자에 대한 불안정한 구조(Gotchas)

규칙과 매크로를 추가할 때 두 번째 규칙/매크로는 첫 번째 규칙/매크로의 조건에 추가된다. 원래 규칙/매크로에 잠재적으로 모호한 논리 연산자가 있는 경우 의도하지 않은 결과가 발생할 수 있다. 예를 들면 다음과 같다.

```yaml
- rule: my_rule
  desc: ...
  condition: evt.type=open and proc.name=apache
  output: ...

- rule: my_rule
  append: true
  condition: or proc.name=nginx
```

`proc.name=nginx` 가 apache/nginx 가 파일을 열도록 허용하는 `and proc.name=apache` 와 연결하여 해석되어야 할까? 아니면 apache가 파일을 열도록 허용하고 nginx 에게는 모든 것을 허용하도록 `evt.type=open` 에 연결하여 해석되어야 할까?

이와 같은 경우, 원래 조건의 논리 연산잔 범위를 괄호로 지정하거나 그렇게 하는것이 가능하지 않은 경우 조건을 추가하지 않아야 한다.

## 규칙 우선순위

모든 팔코 규칙에는 규칙 위반이 얼마나 심각한지를 나타내는 우선 순위가 있다. 우선 순위는 메세지/JSON 출력 등에 포함된다. 사용 가능한 우선 순위는 다음과 같다.

* `EMERGENCY`
* `ALERT`
* `CRITICAL`
* `ERROR`
* `WARNING`
* `NOTICE`
* `INFORMATIONAL`
* `DEBUG`

규칙에 우선 순위를 할당하는데 사용되는 일반적인 지침은 다음과 같다.

* 규칙이 쓰기 상태(예를 들어, 파일 시스템 등)와 관련된 경우의 우선순위는 `ERROR` 이다.
* 규칙이 허가되지 않은 읽기 상태(예를 들어, 민감한 파일 읽기 등)와 관련된 경우 우선 순위는 `WARNING` 이다.
* 규칙이 예기치 않은 동작(컨테이너에서 예기치 않은 셸 생성, 예기치 않은 네트워크 연결 열기 등)과 관련된 경우 우선 순위는 `NOTICE` 이다.
* 규칙이 모범 사례(예기치 않은 권한 있는 컨테이너, 민감한 마운트 요소가 있는 컨테이너, 루트로 대화형 명령을 실행하는 경우)에 대한 동작과 관련된 경우 우선 순위는 `INFO` 이다.

한 가지 예외로 FP-취약점과 같은 "신뢰할 수 없는 셸 구동" 규칙의 우선순위는 `DEBUG` 이다.

## 규칙 태그 {#tags}

0.6.0 이후로, 규칙에는 규칙 집합을 관련 규칙 그룹으로 분류하는데 사용되는 선택적 _tags_ 집합이 있다. 예를 들면 다음과 같다.

```yaml
- rule: File Open by Privileged Container
  desc: Any open by a privileged container. Exceptions are made for known trusted images.
  condition: (open_read or open_write) and container and container.privileged=true and not trusted_containers
  output: File opened for read/write by privileged container (user=%user.name command=%proc.cmdline %container.info file=%fd.name)
  priority: WARNING
  tags: [container, cis]
```

이 경우 "권한 있는 컨테이너로 파일 열기" 규칙에 "container" 및 "cis" 태그가 지정되었다. 지정된 규칙에 대한 태그 키가 없거나 목록이 비어있으면 규칙에 태그가 없는 경우이다.

태그를 사용하는 방법은 다음과 같다.

* `-T <tag>` 인수를 사용하여 지정된 태그가 있는 규칙을 비활성화 할 수 있다. `-T` 는 여러 번 지정 가능하다. 예를 들어 "filesystem" 및 "cis" 태그가 있는 모든 규칙을 건너 뛰려면 `falco -T filesystem -T cis ...` 로 팔코를 실행한다. `-T` 는 `-t` 와 함께 지정할 수 없다.
* `-t <tag>` 인수를 사용하여 주어진 태그가 있는 규칙*만* 실행할 수 있다. `-t` 는 여러 번 지정 가능하다. 예를 들어 "filesystem" 및 "cis 태그가 있는 규칙만 실행하려면 `falco -t filesystem -t cis ...` 로 팔코를 실행한다. `-t` 는 `-T` 또는 `-D <pattern>` 과 함께 지정할 수 없다. (규칙이름의 정규 표현식으로 규칙이 사용되지 않는다.)

### 현재 팔코 규칙 집합에 대한 태그

이제 기본 규칙 집합을 살펴보고, 초기 태그 집합으로 모든 규칙에 태그를 지정하였다. 사용한 태그는 다음과 같다.

태그 | 설명
:---|:-----------
`filesystem` | 이 규칙은 파일 읽기/쓰기와 관련이 있다.
`software_mgmt` | 이 규칙은 rpm, dpkg 등과 같은 소프트웨어/패키지 관리 도구와 관련이 있다.
`process` | 이 규칙은 새 프로세스를 시작하거나 현재 프로세스의 상태를 변경하는 것고 관련이 있다.
`database` | 이 규칙은 데이터베이스와 관련이 있다.
`host` | 이 규칙은 컨테이너 외부에서*만* 동작한다.
`shell` | 이 규칙은 특별히 셸의 시작과 관련이 있다.
`container` | 이 규칙은 컨테이너 내부에서*만* 동작한다.
`cis` | 이 규칙은 CIS 도커 벤치마크와 관련이 있다.
`users` | 이 규칙은 사용자 관리 또는 실행중인 프로세스의 ID 변경과 관련된다.
`network` | 이 규칙은 네트워크 활동과 관련이 있다.

위의 여러 태그와 관련된 규칙은 다수의 태그를 가질 수 있다. 팔코 규칙 세트의 모든 규칙에는 적어도 하나 이상의 태그가 존재한다.

## 규칙 조건의 모범 사례

성능 향상을 위해 규칙을 이벤트 유형별로 그룹화하려면, 조건 시작 부분에 부정적인 연산자 (예: `not`  또는 `!=`) 앞에 `evt.type=` 연산자가 적어도 하나 이상 있는 것이 좋다. 조건에 `evt.type=` 연산자가 없으면 팔코는 다음과 같은 경고를 기록한다.

```
Rule no_evttype: warning (no-evttype):
proc.name=foo
     did not contain any evt.type restriction, meaning that it will run for all event types.
     This has a significant performance penalty. Consider adding an evt.type restriction if possible.
```

규칙이 조건 후반부에 `evt.type` 연산자를 가지고 있는 경우, 팔코는 다음과 같은 경고를 기록한다.

```
Rule evttype_not_equals: warning (trailing-evttype):
evt.type!=execve
     does not have all evt.type restrictions at the beginning of the condition,
     or uses a negative match (i.e. "not"/"!=") for some evt.type restriction.
     This has a performance penalty, as the rule can not be limited to specific event types.
     Consider moving all evt.type restrictions to the beginning of the rule and/or
     replacing negative matches with positive matches if possible.
```

## 특수 문자 이스케이프

경우에 따라, `(` , 공백 등의 특수 문자를 포함해야 할 수 있다. 예를 들어 주변 괄호를 포함하여 `(systemd)` 의 `proc.name` 을 찾아야 할 수도 있다.

Sysdig 와 마찬가지로 팔코에서는 `"` 를 사용하여 이러한 특수 문자를 캡처 할 수 있다. 예제는 다음과 같다.

```yaml
- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name="(systemd)" or proc.name=systemd
  output: "File opened by systemd (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```

목록에 리스트를 포함할 때 따옴표로 묶인 문자열을 작은 따옴표로 묶어 YAML 파일에서 큰 따옴표가 해석되지 않도록 한다. 예를 들면 다음과 같다.

```yaml
- list: systemd_procs
  items: [systemd, '"(systemd)"']

- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name in (systemd_procs)
  output: "File opened by systemd (user=%user.name command=%proc.cmdline file=%fd.name)"
  priority: WARNING
```

## 무시된 시스템 호출

성능상의 이유로 일부 시스템 호출은 현재 팔코가 처리하기 전에 삭제된다. 다음은 현재의 목록이다.

```
access alarm brk capget clock_getres clock_gettime clock_nanosleep clock_settime close container cpu_hotplug drop epoll_create epoll_create1 epoll_ctl epoll_pwait epoll_wait eventfd eventfd2 exit_group fcntl fcntl64 fdatasync fgetxattr flistxattr fstat fstat64 fstatat64 fstatfs fstatfs64 fsync futex get_robust_list get_thread_area getcpu getcwd getdents getdents64 getegid geteuid getgid getgroups getitimer getpeername getpgid getpgrp getpid getppid getpriority getresgid getresuid getrlimit getrusage getsid getsockname getsockopt gettid gettimeofday getuid getxattr infra io_cancel io_destroy io_getevents io_setup io_submit ioprio_get ioprio_set k8s lgetxattr listxattr llistxattr llseek lseek lstat lstat64 madvise mesos mincore mlock mlockall mmap mmap2 mprotect mq_getsetattr mq_notify mq_timedreceive mq_timedsend mremap msgget msgrcv msgsnd munlock munlockall munmap nanosleep newfstatat newselect notification olduname page_fault pause poll ppoll pread pread64 preadv procinfo pselect6 pwrite pwrite64 pwritev read readv recv recvmmsg remap_file_pages rt_sigaction rt_sigpending rt_sigprocmask rt_sigsuspend rt_sigtimedwait sched_get_priority_max sched_get_priority_min sched_getaffinity sched_getparam sched_getscheduler sched_yield select semctl semget semop send sendfile sendfile64 sendmmsg setitimer setresgid setrlimit settimeofday sgetmask shutdown signaldeliver signalfd signalfd4 sigpending sigprocmask sigreturn splice stat stat64 statfs statfs64 switch sysdigevent tee time timer_create timer_delete timer_getoverrun timer_gettime timer_settime timerfd_create timerfd_gettime timerfd_settime times ugetrlimit umask uname ustat vmsplice wait4 waitid waitpid write writev
```

`-i` 로 실행하면, 팔코는 무시된 이벤트/시스템 호출 집합을 출력하고 종료한다. 위 목록의 시스템 호출을 포함하여 모든 이벤트에 대해 팔코를 실행하려면 `-A` 플래그를 사용하여 팔코를 실행해야 한다.
