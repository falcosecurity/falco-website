---
title: 써드파티 통합
description: 팔코 코어에 구축된 커뮤니티 기반 통합
weight: 5
---

## 스크립트 설치 {#scripted}

리눅스에 팔코를 설치하기 위해, 필요한 단계를 처리하는 셸 스크립트를 다운로드 할 수 있다. 

```shell
curl -o install_falco -s https://falco.org/script/install
```

그 다음 `sha256sum` 도구 (또는 유사한 도구)를 사용하여 스크립트의 [SHA256](https://en.wikipedia.org/wiki/SHA-2) 체크섬을 확인한다.

```shell
sha256sum install_falco
```

그 값은 `{{< sha256sum >}}` 여야 한다.

그 다음 root 또는 sudo 로 스크립트를 실행한다.

```shell
sudo bash install_falco
```

## Minikube

로컬 환경에서 쿠버네티스에 팔코를 설치하는 가장 쉬운 방법은 [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/)를 사용하는 것이다. 쿠버네티스 YAML 메니페스트와 Helm 차트 모두 Minikube 에서 정기적으로 테스트된다.

기본 `--driver` 인수로 `minikube` 를 실행하면, Minikube 는 다양한 쿠버네티스 서비스를 실행하는 VM 과 Pod 등을 실행하기 위한 컨테이너 프레임워크를 생성한다. VM은 실행 중인 커널의 커널 헤더를 포함하지 않기 때문에, 일반적으로 팔코 커널 모듈을 Minikube VM 상에서 직접 빌드하는 것은 불가능하다.

이를 해결하기 위해, 팔코 0.13.1부터는 10개의 최신 Minikube 버전에 대한 사전 빌드된 커널 모듈을 https://s3.amazonaws.com/download.draios.com 에서 지원한다. 이렇게 하면 다운로드 실패 후 폴백 단계로 커널 모듈을 로드할 수 있다.

앞으로도 새로운 팔코가 릴리즈될 때마다, 10개의 최신 Minikube 버전을 계속 지원할 것이다. 현재 다운로드를 위해 이전에 빌드된 커널 모듈을 유지하고 있으므로, 제한된 내역에 대한 지원도 계속 제공할 것이다.

Minikube 에 팔코를 설정하는 방법은 [이 블로그 포스트](https://falco.org/blog/minikube-falco-kernel-module/)도 참고한다.


## Kind

팔코를 [Kind](https://github.com/kubernetes-sigs/kind) 클러스터에 설치하는 가장 쉬운 방법은 다음과 같다.

1. 설정 파일을 생성한다. 예를 들면, `kind-config.yaml`.

2. 다음 내용을 파일에 추가한다.
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraMounts:
  - hostPath: /dev
    containerPath: /dev
```

3. 해당 설정 파일을 명시하여 클러스터를 생성한다.
```
kind create cluster --config=./kind-config.yaml
```

4. kind로 구성한 쿠버네티스 클러스터에 팔코를 설치한다.

## Helm

Helm 은 쿠버네티스에 팔코를 설치하는 한 가지 방법이다. 팔코 커뮤니티는 헬름 차트와 이를 사용하는 방법에 대한 문서를 [여기서](https://github.com/falcosecurity/charts/tree/master/falco) 제공한다.

## Puppet

팔코용 [Puppet](https://puppet.com/) 모듈인 `sysdig-falco` 는 [Puppet Forge](https://forge.puppet.com/sysdig/falco/readme) 에서 사용할 수 있다.

## Ansible

[@juju4](https://github.com/juju4/)가 팔코의 유용한 [Ansible](https://ansible.com) 롤인 `juju4.falco` 를 작성했다. 이는 [GitHub](https://github.com/juju4/ansible-falco/) 와 [Ansible Galaxy](https://galaxy.ansible.com/juju4/falco/) 에서 사용할 수 있다. 최신 버전의 Ansible Galaxy (v0.7)는 팔코 0.9에서 동작하지 않지만, GitHub의 버전은 동작한다.

## CoreOS

CoreOS 에서 팔코를 실행하는 권장 방법은 [도커 섹션](/docs/getting-started/running#docker)의 설치 명령을 이용해 도커 컨테이너에서 자체에서 하는 방법이다. 이 방법은 호스트 OS 의 모든 컨테이너를 완전히 시각화할 수 있다.

이 방법은 자동으로 업데이트되고, 자동 설정 및 배쉬 완성 기능과 같은 몇 가지 멋진 기능을 포함하고 있으며, CoreOS 이외의 다른 배포판에서도 사용할 수 있는 일반적인 방법이다.

하지만 일부 사용자는 CoreOS 툴박스에서 팔코를 실행하는 방식을 선호할 수 있다. 이는 권장되는 방법은 아니지만, 일반적인 설치 방법을 이용하여 툴박스 내에서 팔코를 설치한 다음, 수동으로 `falco-driver-loader` 스크립트를 실행하면 된다.


```shell
toolbox --bind=/dev --bind=/var/run/docker.sock
curl -s https://falco.org/script/install | bash
falco-driver-loader
```

## GKE

구글 쿠버네티스 엔진 (GKE)은 작업 노드 풀의 기본 운영체제로 Container-Optimized OS (COS)를 사용한다. COS는 기반 OS의 특정 부분에 대한 액세스를 제한하는 보안이 강화된 운영체제이다. 이러한 보안 제약사항으로 인해, 팔코는 시스템 호출 이벤트를 처리하기 위해 커널 모듈을 삽입할 수 없다. 하지만 COS 는 eBPF (extended Berkeley Packet Filter)를 활용하여 시스템 호출 스트림을 팔코 엔진에 전달하는 기능을 제공한다.

팔코는 최소한의 설정 변경으로 eBPF 를 사용할 수 있다. 이를 위해선 `FALCO_BPF_PROBE` 환경 변수를 `FALCO_BPF_PROBE=""` 처럼 빈 값으로 설정한다.

eBPF 는 현재 GKE 와 COS 만 지원하지만, 여기에서는 다양한 플랫폼에 대한 설치 세부 정보를 소개한다.

{{< info >}}
 
 프로브 파일의 대체 경로를 지정하려면, `FALCO_BPF_PROBE`를 기존 eBPF 프로브 경로로 설정할 수도 있다.

{{< /info >}}

공식 컨테이너 이미지 사용 시 이 환경 변수를 설정하면, `falco-driver-loader` 스크립트가 실행되어 적절한 버전의 COS 커널 헤더를 다운로드한 다음 적절한 eBPF 프로브를 컴파일한다. 다른 모든 환경에서는 다음 방법으로 `falco-driver-loader` 를 직접 실행할 수 있다.

```bash
sudo FALCO_VERSION="{{< latest >}}" FALCO_BPF_PROBE="" falco-driver-loader
```

위의 스크립트를 성공적으로 실행하려면, `clang` 과 `llvm` 이 설치되어 있어야 한다.

패키지에서 팔코를 설치하려면, `falco` systemd 유닛을 편집해야 한다.

다음 명령어로 이를 실행할 수 있다.

```bash
systemctl edit falco
```

편집기가 열리면, 다음 내용을 파일에 추가해 유닛에 대한 환경 변수를 설정할 수 있다.

```
[Service]
Environment='FALCO_BPF_PROBE=""'
```

[Helm을 이용해 팔코를 설치](https://falco.org/docs/third-party/#helm)한다면, `ebpf.enabled` 옵션을 `true`로 설정해야 한다.

```
helm install falco falcosecurity/falco --set ebpf.enabled=true
```
