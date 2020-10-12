---
title: K8s 파드 시큐리티 폴리시 (PSP) 지원
weight: 3
---

## 팔코의 파드 시큐리티 폴리시 지원

팔코 0.18.0부터 K8s 파드 시큐리티 폴리시를 지원한다. 특히 PSP를 클러스터에 실제로 배포하지 않고도 PSP의 조건에 해당하는 팔코 규칙으로 변환할 수 있다.

## 동기

파드의 동작을 제한하고 클러스터 전반에 일관된 보안 정책을 적용할 수 있는 풍부하고 강력한 프레임워크를 제공하지만, 원하는 보안 정책과 클러스터가 실제로 수행하는 작업 사이의 간극을 파악하기 어렵다. 또한 PSP가 적용되고 나면, 실행 중인 파드가 중단될 수 있고, 클러스터에서 실시간으로 PSP를 조정하는 프로세스에 혼란과 지장을 줄 수 있다.

그래서 팔코를 활용할 수 있다. 팔코는 PSP의 평가를 "드라이 런(dry run)"으로 수행해, 배포된 파드의 동작을 관찰하고 차단 없이 위반에 대해 알림을 보낼 수 있는 팔코 규칙으로 변환할 수 있다. 이는 PSP 제작 주기를 가속화하고, 클러스터에 배포 없이 제작할 수 있는 완벽한 프레임워크를 제공한다.

## 도구

두 가지 구성 요소로 지원한다. PSP에서 일련의 규칙을 생성하는 `falcoctl convert psp`, 그리고 이러한 규칙을 실행 시 필요한 새 필드가 있는 `falco`가 있다.

### Falcoctl Convert PSP

[falcoctl convert psp](https://github.com/falcosecurity/falcoctl) 도구는 PSP를 입력으로 읽어 PSP의 제약 조건을 평가하는 팔코 규칙 파일을 생성한다. 예를 들면 다음과 같다.

다음 PSP는 특권(privileged) 이미지를 제한하고 루트 파일 시스템을 강제하지만, histPID와 같은 다른 일반적인 속성은 허용한다.

```
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  annotations:
    falco-rules-psp-images: "[nginx]"
  name: no_privileged
spec:
  fsGroup:
    rule: "RunAsAny"
  hostPID: true
  hostIPC: true
  hostNetwork: true
  privileged: false
  readOnlyRootFilesystem: true
```

PSP의 `falco-rules-psp-images` 어노테이션을 주목하라. 이는 생성된 규칙의 범위를 특정 컨테이너들로 제한한다. 어노테이션의 값은 문자열이지만, 규칙을 적용할 컨테이너 이미지 목록이어야 한다.

명령어 `falcoctl convert psp --psp-path test_psp.yaml --rules-path psp_rules.yaml`를 실행해 다음 규칙 파일을 생성한다. 그러면 `falco -r psp_rules.yaml`로 팔코를 실행할 수 있다.

```
- required_engine_version: 5

- list: psp_images
  items: [nginx]

# K8s audit specific macros here
- macro: psp_ka_always_true
  condition: (jevt.rawtime exists)

- macro: psp_ka_never_true
  condition: (jevt.rawtime=0)

- macro: psp_ka_enabled
  condition: (psp_ka_always_true)

- macro: psp_kevt
  condition: (jevt.value[/stage] in ("ResponseComplete"))

- macro: psp_ka_pod
  condition: (ka.target.resource=pods and not ka.target.subresource exists)

- macro: psp_ka_container
  condition: (psp_ka_enabled and psp_kevt and psp_ka_pod and ka.verb=create and ka.req.pod.containers.image.repository in (psp_images))

# syscall audit specific macros here
- macro: psp_always_true
  condition: (evt.num>=0)

- macro: psp_never_true
  condition: (evt.num=0)

- macro: psp_enabled
  condition: (psp_always_true)

- macro: psp_container
  condition: (psp_enabled and container.image.repository in (psp_images))

- macro: psp_open_write
  condition: (evt.type=open or evt.type=openat) and evt.is_open_write=true and fd.typechar='f' and fd.num>=0


#########################################
# Rule(s) for PSP privileged property
#########################################
- rule: PSP Violation (privileged) K8s Audit
  desc: >
    Detect a psp validation failure for a privileged pod using k8s audit logs
  condition: psp_ka_container and ka.req.pod.containers.privileged intersects (true)
  output: Pod Security Policy no_privileged validation failure--pod with privileged=true (user=%ka.user.name pod=%ka.resp.name ns=%ka.target.namespace images=%ka.req.pod.containers.image spec=%jevt.value[/requestObject/spec])
  priority: WARNING
  source: k8s_audit
  tags: [k8s-psp]

- rule: PSP Violation (privileged) System Activity
  desc: Detect a psp validation failure for a privileged pod using syscalls
  condition: psp_container and evt.type=container and container.privileged intersects (true)
  output: Pod Security Policy no_privileged validation failure--container with privileged=true created (user=%user.name command=%proc.cmdline %container.info images=%container.image.repository:%container.image.tag)
  priority: WARNING
  source: syscall
  tags: [k8s-psp]


#########################################
# Rule(s) for PSP readOnlyRootFilesystem property
#########################################
- rule: PSP Violation (readOnlyRootFilesystem) K8s Audit
  desc: >
    Detect a psp validation failure for a readOnlyRootFilesystem pod using k8s audit logs
  condition: psp_ka_container and not ka.req.pod.containers.read_only_fs in (true)
  output: Pod Security Policy no_privileged validation failure--pod without readOnlyRootFilesystem=true (user=%ka.user.name pod=%ka.resp.name ns=%ka.target.namespace images=%ka.req.pod.containers.image spec=%jevt.value[/requestObject/spec])
  priority: WARNING
  source: k8s_audit
  tags: [k8s-psp]

- rule: PSP Violation (readOnlyRootFilesystem) System Activity
  desc: >
    Detect a psp validation failure for a readOnlyRootFilesystem pod using syscalls
  condition: psp_container and psp_open_write
  output: >
    Pod Security Policy no_privileged validation failure--write in container with readOnlyRootFilesystem=true
    (user=%user.name command=%proc.cmdline file=%fd.name parent=%proc.pname container_id=%container.id images=%container.image.repository)
  priority: WARNING
  source: syscall
  tags: [k8s-psp]
```

### PSP 규칙 평가를 위한 팔코 지원

이러한 새 규칙을 지원하기 위해, 여러가지 추가 필터 필드를 정의하고, 파드 명세 내 컨테이너 세트와 원하거나 원하지 않는(desirable/undesirable) 값 세트의 속성을 비교하기 쉽게 해주는 새로운 연산자 `intersects`를 추가했다. 늘 그렇듯이 `falco --list`를 실행해 지원하는 필드 목록과 그에 대한 설명을 확인할 수 있다.

대부분의 경우, PSP에서 생성된 규칙은 [K8s Audit 로그 지원](https://falco.org/docs/event-sources/kubernetes-audit/)에 의존하기 때문에 규칙을 최대한 활용하려면 이를 활성화해야 한다. 
