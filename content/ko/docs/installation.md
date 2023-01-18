---
title: 설치
description: 리눅스 시스템에서 팔코 설치하기
weight: 3
---

팔코는 시스템 호출을 이용해 시스템을 모니터링하고 보호하는 리눅스 보안 도구이다.

{{% pageinfo color="primary" %}}
팔코는 쿠버네티스 런타임 보안에 사용할 수 있다.
팔코를 설치하는 가장 안전한 방법은 시스템 손상 시 팔코와 쿠버네티스가 격리되도록 호스트 시스템에 직접 설치하는 것이다.
그 다음 팔코 알림은 쿠버네티스에서 실행되는 읽기 전용 에이전트를 통해 사용할 수 있다.

격리가 문제가 되지 않는 경우에는 팔코를 쿠버네티스에서 직접 실행할 수 있다.
Kind, Minikube, Helm 같은 도구를 이용해 팔코를 쿠버네티스에서 직접 실행하는 방법은 [써드파티 통합](https://falco.org/docs/third-party/)을 참고한다.
{{% /pageinfo %}}


아래의 패키지 관리 아티팩트를 이용해 팔코를 설치한 경우에는 다음이 준비되어 있다.

 - `systemd`를 통해 예정된 팔코 사용자 공간 프로그램
 - 패키지 관리 도구를 통해 설치된 팔코 드라이버 (호스트에 따라 커널 모듈 또는 eBPF)
 - `/etc/falco`에 위치한 기본 설정 파일

또는 [아래에서 설명하는](#linux-binary) 바이너리 패키지를 사용할 수도 있다.

## 설치하기

### Debian/Ubuntu {#debian}

1. falcosecurity GPG 키를 추가하고, apt 리포지터리를 설정하고, 패키지 목록을 업데이트한다.

    ```shell
    curl -s https://falco.org/repo/falcosecurity-packages.asc | apt-key add -
    echo "deb https://download.falco.org/packages/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
    apt-get update -y
    ```

2. 커널 헤더를 설치한다.

    ```shell
    apt-get -y install linux-headers-$(uname -r)
    ```

3. 팔코를 설치한다.

    ```shell
    apt-get install -y falco
    ```

    이제 팔코, 커널 모듈 드라이버, 기본 설정 파일이 설치되었다.
	 팔코는 systemd 유닛으로 실행 중이다.

	 팔코를 관리하고, 실행하고, 디버깅하는 방법은 [실행](https://falco.org/docs/getting-started/running/)을 참고한다.

4. 팔코를 삭제한다.

    ```shell
    apt-get remove falco
    ```

### CentOS/RHEL/Fedora/Amazon Linux {#centos-rhel}

1. falcosecurity GPG 키를 추가하고, yum 리포지터리를 설정한다.

    ```shell
    rpm --import https://falco.org/repo/falcosecurity-packages.asc
    curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo
    ```

    > **Note** — 다음 명령어는 해당 배포판에서 DKMS와 `make`를 사용할 수 없는 경우에만 필요하다. DKMS 사용 여부는 `yum list make dkms`를  통해 확인할 수 있다. 필요하다면 `yum install epel-release`를 실행하고 `yum install make dkms`를 실행해 설치한다.

2. 커널 헤더 설치하기

    ```shell
    yum -y install kernel-devel-$(uname -r)
    ```

    > **Note** — 위 명령어 실행 시 패키지를 찾을 수 없다면, `yum distro-sync`를 실행해 해결할 수도 있다. 이 경우 시스템을 재시작해야 할 수 있다.

3. 팔코 설치하기

    ```shell
    yum -y install falco
    ```

	 이제 팔코, 커널 모듈 드라이버, 기본 설정 파일이 설치되었다.
	 팔코는 systemd 유닛으로 실행 중이다.

	 팔코를 관리하고, 실행하고, 디버깅하는 방법은 [실행](https://falco.org/docs/getting-started/running/)을 참고한다.

4. 팔코 삭제하기

    ```shell
    yum erase falco
    ```

### Linux generic (binary package) {#linux-binary}

1. 최신 바이너리를 다운로드한다.

    ```shell
    curl -L -O https://download.falco.org/packages/bin/x86_64/falco-{{< latest >}}-x86_64.tar.gz
    ```

2. 팔코를 설치한다.

    ```shell
    tar -xvf falco-{{< latest >}}-x86_64.tar.gz
    cp -R falco-{{< latest >}}-x86_64/* /
    ```

3. 다음 의존성을 설치한다.
	- 리눅스 배포판에 맞는 커널 헤더

4. [아래](#install-driver) 설명된 드라이버를 설치한다.

드라이버가 설치되면 `falco`를 수동으로 실행할 수 있다.

### 드라이버 설치하기 {#install-driver}

드라이버를 설치하는 가장 쉬운 방법은 `falco-driver-loader` 스크립트를 이용하는 것이다.

기본적으로 해당 스크립트는 먼저 로컬에서 `dkms`를 이용해 커널 모듈을 빌드한다. 불가능한 경우, 사전에 빌드된(prebuilt) 파일을 `~/.falco/` 경로에 다운로드 한다. 커널 모듈이 발견되면 그것을 삽입한다.

eBPF 프로브(probe) 드라이버를 설치하려면 `falco-driver-loader bpf`를 실행한다.
이 명령어는 먼저 로컬에서 eBPF 프로브를 빌드하고, 안될 경우 사진에 빌드된 파일을 `~/.falco/` 경로에 다운로드한다.

구성 가능한 옵션은 다음과 같다.

- `DRIVERS_REPO` - 사전 빌드된 커널 모듈과 eBPF 프로브를 다운로드할 기본 리포지터리 URL을 대체하려면 이 환경 변수를 후행 슬래시 없이 설정한다.

    `https://myhost.mydomain.com` 또는 `https://myhost.mydomain.com/drivers` 하위 디렉토리 구조 `https://myhost.mydomain.com/drivers`가 있는 경우를 예로 들어보자.

    드라이버는 `/${driver_version}/falco_${target}_${kernelrelease}_${kernelversion}.[ko|o]`와 같은 구조로 호스팅되어야 한다. 여기서 `ko`와 `o`는 각각 커널 모듈과 `eBPF` 프로브를 나타낸다.

    예를 들면, `/a259b4bf49c3330d9ad6c3eed9eb1a31954259a6/falco_amazonlinux2_4.14.128-112.105.amzn2.x86_64_1.ko`이다.

    `falco-driver-loader` 스크립트는 위의 형식을 이용해 드라이버를 가져온다.
