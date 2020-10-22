---
title: 기본 매크로
weight: 2
---

기본 팔코 규칙 집합은 규칙 작성을 보다 쉽게 시작할수 있도록 여러 매크로를 정의한다. 이런 매크로는 여러 일반적인 시나리오에 대한 바로가기를 제공하며 모든 사용자 정의 규칙 집합에서 사용할 수 있다. 팔코는 사용자 환경에 특정한 설정을 제공하기 위해 사용자가 재정의해야 하는 매크로도 제공한다. 제공된 매크로를 로컬 규칙 파일에 추가할 수도 있다.

### 쓰기 작업을 위해 열린 파일

```yaml
- macro: open_write
  condition: (evt.type=open or evt.type=openat) and evt.is_open_write=true and fd.typechar='f' and fd.num>=0
```

### 읽기 작업을 위해 열린 파일

```yaml
- macro: open_read
  condition: (evt.type=open or evt.type=openat) and evt.is_open_read=true and fd.typechar='f' and fd.num>=0
```

### 언제나 참(True)이 아님

```yaml
- macro: never_true
  condition: (evt.num=0)
```

### 항상 참(True)

```yaml
- macro: always_true
  condition: (evt.num=>0)
```

### Proc 이름이 설정됨

```yaml
- macro: proc_name_exists
  condition: (proc.name!="<NA>")
```

### 파일 시스템 객체 이름이 변경됨

```yaml
- macro: rename
  condition: evt.type in (rename, renameat)
```

### 새로운 디렉토리가 생성됨

```yaml
- macro: mkdir
  condition: evt.type = mkdir
```

### 파일 시스템 객체가 제거됨

```yaml
- macro: remove
  condition: evt.type in (rmdir, unlink, unlinkat)
```

### 파일 시스템 객체가 수정됨

```yaml
- macro: modify
  condition: rename or remove
```

### 새로운 프로세스가 생성됨

```yaml
- macro: spawned_process
  condition: evt.type = execve and evt.dir=<
```

### 바이너리용 공통 디렉터리

```yaml
- macro: bin_dir
  condition: fd.directory in (/bin, /sbin, /usr/bin, /usr/sbin)
```

### 셸이 시작됨

```yaml
- macro: shell_procs
  condition: (proc.name in (shell_binaries))
```

### 알려진 민감한 파일

```yaml
- macro: sensitive_files
  condition: >
    fd.name startswith /etc and
    (fd.name in (sensitive_file_names)
     or fd.directory in (/etc/sudoers.d, /etc/pam.d))
```

### 새로 생성된 프로세스

```yaml
- macro: proc_is_new
  condition: proc.duration <= 5000000000
```

### 인바운드 네트워크 연결

```yaml
- macro: inbound
  condition: >
    (((evt.type in (accept,listen) and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### 아웃바운드 네트워크 연결

```yaml
- macro: outbound
  condition: >
    (((evt.type = connect and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### 인바운드 혹은 아웃바운드 연결

```yaml
- macro: inbound_outbound
  condition: >
    (((evt.type in (accept,listen,connect) and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### 객체가 컨테이너인 경우

```yaml
- macro: container
  condition: container.id != host
```

### 대화형 프로세스 생성

```yaml
- macro: interactive
  condition: >
    ((proc.aname=sshd and proc.name != sshd) or
    proc.name=systemd-logind or proc.name=login)
```

## 재정의할 매크로

아래 매크로에는 사용자의 특정 환경에 대해 재정의할 수 있는 값이 포함되어 있다.

### 공통 SSH 포트

SSH 서비스를 제공하는 환경의 포트를 반영하도록 매크로를 재정의한다.

```yaml
- macro: ssh_port
  condition: fd.sport=22
```

### 허용된 SSH 호스트

알려진 SSH 포트(예: 배스천(bastion) 혹은 점프박스)에 연결할 수 있는 호스트를 반영하도록 매크로를 재정의한다.

```yaml
- macro: allowed_ssh_hosts
  condition: ssh_port
```

### 사용자가 허용한 컨테이너

권한모드에서 실해이 허용된 컨테이너를 화이트 리스트에 추가한다.

```yaml
- macro: user_trusted_containers
  condition: (container.image startswith sysdig/agent)
```

### 셸 생성이 허용된 컨테이너

컨테이너가 CI/CD 파이프라인에서 사용되는 경우, 필요할 수 있는 셸 생성이 허용된 컨테이너를 화이트리스트에 추가한다.

```yaml
- macro: user_shell_container_exclusions
  condition: (never_true)
```

### EC2 메타 데이터 서비스와 통신할 수 있는 컨테이너

EC2 메타 데이터 서비스와 통신할 수 있는 컨테이너를 화이트리스트에 추가한다. 기본값: 모든 컨테이너

```yaml
- macro: ec2_metadata_containers
  condition: container
```

### 쿠버네티스 API 서버

여기에서 쿠버네티스 API 서비스의 IP를 설정한다.

```yaml
- macro: k8s_api_server
  condition: (fd.sip="1.2.3.4" and fd.sport=8080)
```

### 쿠번네티스 API 와 통신할 수 있는 컨테이너

쿠버네티스 API 서비스와 통신할 수 있는 컨테이너를 화이트리스트에 추가한다. k8s_api_server 를 설정해야 한다.

```yaml
- macro: k8s_containers
  condition: >
    (container.image startswith gcr.io/google_containers/hyperkube-amd64 or
    container.image startswith gcr.io/google_containers/kube2sky or
    container.image startswith sysdig/agent or
    container.image startswith sysdig/falco or
    container.image startswith sysdig/sysdig)
```

### 쿠버네티스 서비스 NodePort와 통신할 수 있는 컨테이너

```yaml
- macro: nodeport_containers
  condition: container
```
