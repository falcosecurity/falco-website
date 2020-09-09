---
title: The Falco Project
description: 클라우드 네이티브 런타임 보안
weight: 1
---

## Falco는 무엇인가요?

Falco Project는 [Sysdig, Inc](https://sysdig.com)가 개발한 오픈 소스 런타임 보안 도구입니다. Falco는 [CNCF에 기부되었고 현재 CNCF 인큐베이팅 프로젝트입니다](https://www.cncf.io/blog/2020/01/08/toc-votes-to-move-falco-into-cncf-incubator/).

## Falco는 어떤 일을 하나요?

Falco는 런타임에 커널의 리눅스 시스템 호출을 분석하고, 강력한 규칙 엔진에 대한 스트림을 어썰션합니다.
규칙이 위반될 경우, Falco 알림이 실행됩니다. 상세한 내용은 Falco [규칙](https://falco.org/docs/rules/)을 참고하세요.

 - Parse
 - Assert
 - Alert

## Falco는 무엇을 찾습니까?

기본적으로 Falco는 커널에서 비정상적인 동작을 확인하는 규칙을 제공합니다. 예를 들면,

 - 특권을 가진(Privileged) 컨테이너를 이용한 권한 에스컬레이션(Privilege escalation)
 - `setns`와 같은 도구를 이용한 네임스페이스를 변경
 - 잘 알려진 디렉토리(`/etc`, `/usr/bin`, `/usr/sbin` 등)에 읽기/쓰기
 - 심볼릭링크를 생성
 - 소유권(Ownership)과 권한(Mode)을 변경
 - 예상치 못한 네트워크 연결 또는 소켓 변형
 - `execve`를 이용한 프로세스 생성
 - 쉘 바이너리(`sh`, `bash`, `csh`, `zsh` 등) 실행
 - SSH 바이너리(`ssh`, `scp`, `sftp` 등) 실행
 - 리눅스 `coreutils` 실행 파일 변형
 - 로그인 바이너리 변형
 - `shadowutil` 또는 `passwd` 실행 파일 변형
	- `shadowconfig`
    - `pwck`
    - `chpasswd`
    - `getpasswd`
    - `change`
    - `useradd`
    - 기타

...이밖에도 많습니다.

## Falco 규칙은 무엇입니까?

Falco가 어썰션할 항목입니다. Falco 설정에 정의되어 있고, 시스템에서 찾고자 하는 것을 나타냅니다.

Falco 규칙 작성, 관리, 배포에 대한 자세한 정보는 [규칙](https://falco.org/docs/rules/)을 참고하세요.

## Falco 알림은 무엇입니까?

`STDOUT` 로깅을 남기는 것처럼 간단한 것부터 gRPC 호출을 클라이언트에 전달하는 것처럼 복잡한 것까지 설정할 수 있는 후속 조치입니다.

Falco 알림 설정, 이해, 개발에 대한 자세한 정보는 [알림](https://falco.org/docs/alerts/)을 참고하세요.

## Falco 구성 요소

Falco는 3가지 주요 구성 요소로 이루어져 있습니다.

 - 사용자 공간 프로그램
 - [드라이버](https://falco.org/docs/event-sources/drivers/)
 - [설정](https://falco.org/docs/configuration/)

### Falco 사용자 공간 프로그램

CLI 도구인 `falco`입니다. 이는 사용자와 상호 작용하는 프로그램입니다. 사용자 공간 프로그램은 신호를 처리하고, Falco 드라이버에서 오는 정보를 분석하고, 알림을 담당합니다.

### Falco 드라이버

Falco 드라이버 스펙을 준수하고 시스템 호출 스트림을 보낼 수 있는 하나의 소프트웨어입니다.

Falco는 드라이버 설치 없이는 실행할 수 없습니다.

현재 Falco 프로젝트는 다음 드라이버를 지원합니다.

 - (기본값) `libscap`와 `libsinsp` C++ 라이브러리로 빌드된 커널 모듈
 - 동일한 모듈로 빌드된 BPF probe
 - 사용자 공간 계측(Userspace instrumentation)

드라이버에 대한 자세한 정보는 [해당 페이지](/docs/event-sources/drivers/)를 참고하세요.

### Falco 설정

Falco가 어떻게 실행되는지, 어떤 규칙을 어썰션하는지, 경고를 어떻게 실행할 것인지를 정의합니다. Falco를 설정하는 자세한 정보는 [설정](https://falco.org/docs/configuration/)을 참고하세요.