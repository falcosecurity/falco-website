---
title: 실행 
description: 팔코의 관리 및 운영
weight: 4
---


## 서비스로 팔코 실행하기

[deb 또는 rpm](../installation) 패키지를 사용하여 팔코를 설치한 경우 바로 서비스를 시작할 수 있다.

```bash
service falco start
```

혹은, `systemd` 의 경우:
```bash
systemctl start falco
```
`systemd-sysv-generator` 가 `init.d` 스크립트를 `systemd` 단위로 래핑하기 때문에 작동하게 된다.

`journalctl` 을 사용하여 팔코 로그를 확인할 수도 있다.

```bash 
journalctl -fu falco
```

## 수동으로 팔코 실행하기

팔코를 직접 실행하려는 경우, 다음을 입력하여 팔코에 대한 전체 사용 설명을 찾을 수 있다.

```
falco --help
```

{{< info >}}

사용자 공간의 계측을 찾고 있는 경우, [이 페이지](/docs/event-sources/drivers/)를 참조 한다.

{{< /info >}}

## 도커 안에서 실행하기 {#docker}

{{< info >}}

컨테이너 이미지를 사용하더라도 팔코는 드라이버([커널 모듈](/docs/event-sources/drivers/#kernel-module) 또는 [eBPF 프로브](/docs/event-sources/drivers/#ebpf-probe))를 바로, 올바르게 빌드하기 위한 전체 조건으로 호스트에 설치된 커널 헤더가 필요하다. 미리 빌드 된 드라이버를 이미 사용할 수 있는 경우에는 이 단계가 필요하지 않다.

[설치 섹션](/docs/installation)에서 시스템용 커널 헤더를 설치하는 방법에 대한 지침을 찾을 수 있다.

{{< /info >}}

팔코는 공식 [도커 이미지](/docs/download#images) 셋을 제공한다. 
이미지는 다음과 같은 두 가지 방법으로 사용할 수 있다.
- [최소 권한 (권장)](#docker-least-privileged)
- [권장 권한](#docker-privileged)

### 최소 권한 (권장) {#docker-least-privileged}


{{< info >}}

사용자의 커널이 5.8 이상이 아닐 경우, eBPF 프로브 드라이버와 함께 최소 권한 모드를 
사용할수 없다. 이는 `bpf` 가 `--privileged` 를 필요로 하기 때문이다.
5.8 이상의 커널을 실행중인 경우 2단계의 docker run 명령에 
`--cap-add SYS_BPF` 를 전달하고 커널 모듈의 설치 섹션을 완전히 무시할 수 있다.

이에 대한 자세한 내용은 [여기](https://github.com/falcosecurity/falco/issues/1299#issuecomment-653448207)에서 확인할 수 있다.

{{< /info >}}

이것이 팔코 사용자 공간의 프로세스가 컨테이너에서 실행되는 방법이다.

커널 모듈이 호스트 시스템에 직접 설치되면 컨테이너 안에서 사용될 수 있다.

1. 커널 모듈을 설치한다.

    - 공식 [설치 방법](/docs/installation)을 호스트에서 직접 사용할 수 있다.
    - 또는 임시로 권한이 있는 컨테이너를 사용하여 호스트에 드라이버를 설치할 수 있다.

    ```shell
    docker pull falcosecurity/falco-driver-loader:latest
    docker run --rm -i -t \
        --privileged \
        -v /root/.falco:/root/.falco \
        -v /proc:/host/proc:ro \
        -v /boot:/host/boot:ro \
        -v /lib/modules:/host/lib/modules:ro \
        -v /usr:/host/usr:ro \
        -v /etc:/host/etc:ro \
        falcosecurity/falco-driver-loader:latest
    ``` 

`falcosecurity/falco-driver-loader` 이미지는 `falco-driver-loader` 스크립트를 래핑한다.
사용법에 대한 자세한 내용은 [여기](/docs/installation#install-driver)를 참조한다.


2. [최소 권한 원칙](https://en.wikipedia.org/wiki/Principle_of_least_privilege)으로 도커를 사용하여 컨테이너에서 팔코를 실행한다.

    ```shell
    docker pull falcosecurity/falco-no-driver:latest
    docker run --rm -i -t \
        --cap-add SYS_PTRACE --pid=host $(ls /dev/falco* | xargs -I {} echo --device {}) \
        -v /var/run/docker.sock:/var/run/docker.sock \
        falcosecurity/falco-no-driver:latest
    ```

{{< warning >}}

앱아머(AppArmor) LSM이 활성화 된 시스템(예: 우분투)에서 팔코를 실행하는 경우 위의 `docker run` 명령에 `--security-opt apparmor:unconfined` 도
전달해야 한다.

아래 명령을 사용하여 앱아머가 활성화 되어 있는지 확인할 수 있다.

```bash
docker info | grep -i apparmor
```

{{< /warning >}}

{{< info >}}

`ls /dev/falco* | xargs -I {} echo --device {}` 명령어는 CPU(즉, 팔코의 커널 모듈에 의해 생성된 장치) 당 `--device /dev/falcoX` 옵션을 출력한다. 

{{< /info >}}

### 최대 권한 {#docker-privileged}

전체 권한으로 도커를 사용하여 컨테이너 안에서 팔코를 실행하는 방법이다.

커널 모듈 드라이버와 함께 팔코를 사용하려는 경우,

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest
```

또는 eBPF 프로브 드라이버를 사용할 수 있다.

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -e FALCO_BPF_PROBE="" \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest
```

기타 구성 가능한 옵션은 다음과 같다.

- `DRIVER_REPO` - [드라이버 설치하기](https://falco.org/docs/installation/#install-driver) 섹션을 확인한다.
- `SKIP_DRIVER_LOADER` - `falcosecurity/falco` 이미지가 시작될 때 `falco-driver-loader` 실행을 방지하려면 이 환경변수를 설정한다. 드라이버가 다른 방법으로 호스트에 이미 설치된 경우 유용하다.

## 핫 리로드(Hot Reload)

이 경우 팔코 구성을 다시 로드하고 PID를 죽이지 않고 엔진을 다시 시작한다. 이것은 데몬을 죽이지 않고 새로운 구성 변경 사항을 전파하는데 유용하다.

```bash
kill -1 $(cat /var/run/falco.pid)
```
