---
title: 소스로 팔코 빌드하기
weight: 6
---

팔코를 직접 빌드하는 방법에 대한 가이드다. 환영한다! 여러분은 매우 용감한 사람이다! 여러분이 이 모든 것을
이미 하고 있기 때문에, 기꺼이 팔코에 기여할 기회가 많다! 우리의 [기여 가이드](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md)를 읽어보자.

## CentOS / RHEL

CentOS 7은 릴리스 아티팩트를 컴파일하는데 사용하는 레퍼런스 빌드 환경이다.

### 의존성 패키지

**CentOS 8 / RHEL 8**

```bash
dnf install gcc gcc-c++ git make cmake autoconf automake pkg-config patch ncurses-devel libtool elfutils-libelf-devel diffutils which
```

**CentOS 7 / RHEL 7**

```
yum install gcc gcc-c++ git make autoconf automake pkg-config patch ncurses-devel libtool glibc-static libstdc++-static elfutils-libelf-devel
```

CentOS 7에 포함되지 않은 `cmake` 버전 `3.5.1` 이상도 필요하다. [공식 가이드](https://cmake.org/install/)를 따르거나
[Falco builder Dockerfile](https://github.com/falcosecurity/falco/blob/master/docker/builder/Dockerfile)에서 어떻게 수행되는지 확인할 수 있다.

### 팔코 빌드

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake -DUSE_BUNDLED_DEPS=ON ..
make falco
```

자세한 내용은 [여기](#build-directly-on-host)를 참고한다.

### 커널 모듈 드라이버 빌드

빌드 디렉터리에서 다음을 수행한다.

```bash
yum -y install kernel-devel-$(uname -r)
make driver
```

### eBPF 드라이버 빌드

커널 모듈 드라이버를 사용하지 않으려면, 다음과 같이 eBPF 드라이버를 빌드할 수도 있다.

빌드 디렉터리에서 다음을 수행한다.

```bash
dnf install clang llvm
cmake -DBUILD_BPF=ON ..
make bpf
```

### DEB/RPM 패키지 빌드

빌드 디렉터리에서 다음을 수행한다.

```bash
yum install rpm-build createrepo
make package
```

## Debian / Ubuntu


### 의존성 패키지

```bash
apt install git cmake build-essential libncurses-dev pkg-config autoconf libtool libelf-dev -y
```

### 팔코 빌드

Ubuntu 18.04에서는 이 단계를 건너뛸 수 있다.

```bash
apt install libssl-dev libc-ares-dev libprotobuf-dev protobuf-compiler libjq-dev libgrpc++-dev protobuf-compiler-grpc libcurl4-openssl-dev libyaml-cpp-dev
```

Ubuntu 18.04를 사용한다면, `cmake ..` 대신 `cmake -DUSE_BUNDLED_DEPS=ON ..` 을 사용한다.

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

자세한 내용은 [여기](#build-directly-on-host)를 참고한다.

### 커널 모듈 드라이버 빌드

드라이버를 빌드하려면 커널 헤더가 필요하다.

```bash
apt install linux-headers-$(uname -r)
```

빌드 디렉터리에서 다음을 수행한다.

```bash
make driver
```

### eBPF 드라이버 빌드

커널 모듈 드라이버를 사용하지 않으려면, 다음과 같이 eBPF 드라이버를 빌드할 수도 있다.

빌드 디렉터리에서 다음을 수행한다.

```bash
apt install llvm clang
cmake -DBUILD_BPF=ON ..
make bpf
```

## Arch Linux

### 의존성 패키지

```bash
pacman -S git cmake make gcc wget
pacman -S zlib jq ncurses yaml-cpp openssl curl c-ares protobuf grpc libyaml
```

### 팔코 빌드

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

자세한 내용은 [여기](#build-directly-on-host)를 참고한다.

### 커널 모듈 드라이버 빌드

빌드 디렉터리에서 다음을 수행한다.

```bash
make driver
```

### eBPF 드라이버 빌드

커널 모듈 드라이버를 사용하지 않으려면, 다음과 같이 eBPF 드라이버를 빌드할 수도 있다.

빌드 디렉터리에서 다음을 수행한다.

```bash
pacman -S llvm clang
cmake -DBUILD_BPF=ON ..
make bpf
```

## Alpine

Alpine이 `glibc` 대신 `musl` 을 제공하기 때문에, Alpine에서 빌드하려면 CMake 옵션에 `-DMUSL_OPTIMIZED_BUILD=On` 을 전달해야 한다.

이 옵션을 `-DUSE_BUNDLED_DEPS=On` 옵션과 함께 사용하면, 최종 빌드는 100% 정적으로 링크되고 다른 리눅스 배포판에서 사용할 수 있다.

### 의존성 패키지

```bash
apk add g++ gcc cmake cmake make ncurses-dev git bash perl linux-headers autoconf automake m4 libtool elfutils-dev libelf-static patch binutils
```

### 팔코 빌드

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake -DUSE_BUNDLED_DEPS=On -DMUSL_OPTIMIZED_BUILD=On ..
make falco
```

## openSUSE

### 의존성 패키지

```bash
zypper -n install gcc gcc-c++ git-core cmake libjq-devel ncurses-devel yaml-cpp-devel libopenssl-devel libcurl-devel c-ares-devel protobuf-devel grpc-devel patch which automake autoconf libtool libelf-devel
```

### 팔코 빌드

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

자세한 내용은 [여기](#build-directly-on-host)를 참고한다.

### 커널 모듈 드라이버 빌드

빌드 디렉터리에서 다음을 수행한다.

```bash
zypper -n install kernel-default-devel
make driver
```

### eBPF 드라이버 빌드

커널 모듈 드라이버를 사용하지 않으려면, 다음과 같이 eBPF 드라이버를 빌드할 수도 있다.

빌드 디렉터리에서 다음을 수행한다.

```bash
zypper -n install clang llvm
cmake -DBUILD_BPF=ON ..
make bpf
```

## 의존성

기본적으로 팔코 빌드는 **대부분의** 런타임 의존성을 **동적으로** 번들링한다.

`USE_BUNDLED_DEPS` 옵션이 기본적으로 `OFF` 임을 알 수 있다. 즉, 해당 여부에 관계없이 팔코 빌드는 컴퓨터에 이미 존재하는 라이브러리에 대해 링크를 시도한다.

이러한 옵션을 `ON` 으로 변경하면 팔코 빌드가 모든 의존성을 정적으로 번들링한다.

완성도를 위한 팔코 의존성의 전체 목록은 다음과 같다.

- b64
- cares
- curl
- civetweb
- grpc
- jq
- libyaml
- lpeg
- luajit
- lyaml
- ncurses
- njson
- openssl
- protobuf
- tbb
- yamlcpp
- zlib
- libscap
- libsinsp

## 팔코 빌드

팔코를 빌드하는데 지원되는 두 가지 방법이 있다.

- [호스트에서 직접 빌드](#build-directly-on-host)
- [컨테이너를 사용한 빌드](#build-using-falco-builder-container)

### 호스트에서 직접 빌드 {#build-directly-on-host}

팔코를 빌드하기 위해서, `build` 디렉터리를 생성해야 한다.
팔코 작업 복사본 자체에 `build` 디렉터리가 있는 것이 일반적이지만, 사용자 파일시스템의
어디에나 있을 수 있다.

팔코를 **컴파일하기 위해 세 가지 주요 단계**가 있다.

1. 빌드 디렉터리를 생성하고 그 디렉터리 안으로 들어간다.
2. 빌드 디렉터리에서 cmake를 사용해 팔코용 빌드 파일들을 생성한다. 소스 디렉터리가 현재 디렉터리의
부모이기 때문에 `..` 이 사용되었다. 팔코 소스 코드의 절대 경로를 사용할 수도 있다.
3. make를 사용하여 빌드한다.


#### 모두 빌드

```bash
mkdir build
cd build
cmake ..
make
```

특정 대상만 빌드할 수도 있다.

#### 팔코만 빌드

빌드 디렉터리를 생성하고 cmake 설정을 수행한 다음, 아래를 수행한다.

```bash
make falco
```

#### 팔코 엔진만 빌드

빌드 디렉터리를 생성하고 cmake 설정을 수행한 다음, 아래를 수행한다.

```bash
make falco_engine
```

#### libscap만 빌드

빌드 디렉터리를 생성하고 cmake 설정을 수행한 다음, 아래를 수행한다.

```bash
make scap
```

#### libsinsp만 빌드

빌드 디렉터리를 생성하고 cmake 설정을 수행한 다음, 아래를 수행한다.

```bash
make sinsp
```

#### eBPF 프로브 / 커널 드라이버만 빌드

빌드 디렉터리를 생성하고 cmake 설정을 수행한 다음, 아래를 수행한다.

```bash
make driver
```

#### 빌드 결과

일단 팔코가 빌드되면, `build` 디렉터리에서 세 가지 흥미로운 것들을 찾을 수 있는데 다음과 같다.

- `userspace/falco/falco`: 실제 팔코 바이너리
- `driver/src/falco.ko`: 팔코 커널 드라이버
- `driver/bpf/falco.o`: [BPF 지원](#bpf-지원-활성화)을 포함한 팔코를 빌드한 경우

디버그 버전을 빌드하려면, cmake 대신 `cmake -DCMAKE_BUILD_TYPE=Debug ..` 를 실행한다. 더 많은 맞춤 설정에 대해서는 [CMake 옵션](#cmake-옵션) 섹션을 참고한다.

### CMake 옵션

`cmake` 명령을 수행할 때, 추가 파라미터를 전달해 빌드 파일의 동작을 변경할 수 있다.

다음은 몇 가지 예이다. 사용자의 `build` 디렉터리가 팔코 작업 복사본 내에 있다고 항상 가정한다.

#### 상세한 makefile 생성

```bash
-DCMAKE_VERBOSE_MAKEFILE=On
```

#### C 및 CXX 컴파일러 지정

```
-DCMAKE_C_COMPILER=$(which gcc) -DCMAKE_CXX_COMPILER=$(which g++)
```

#### 번들 의존성 적용

```
-DUSE_BUNDLED_DEPS=True
```

팔코 의존성에 대해서는 [여기](#의존성)를 읽어본다.


#### 경고를 에러로 취급

```
-DBUILD_WARNINGS_AS_ERRORS=True
```

#### 빌드 유형 지정

디버그 빌드 유형

```
-DCMAKE_BUILD_TYPE=Debug
```

릴리스 빌드 유형

```
-DCMAKE_BUILD_TYPE=Release
```

참고로 이 변수는 대소문자를 구분하지 않으며 기본값은 release이다.

#### 팔코 버전 지정

선택적으로 사용자는 팔코의 원하는 버전을 지정할 수 있다. 예를 들어, 다음과 같다.

```
 -DFALCO_VERSION={{< latest >}}-dirty
```

명시적으로 지정하지 않으면 빌드 시스템은 git 히스토리에서 `FALCO_VERSION` 값을 계산한다.

현재 git 리비전에 git 태그가 있는 경우, 팔코 버전은 이 태그와 동일하다(앞의 "v" 문자 제외). 그렇지 않으면, 팔코 버전은 형식이 `0.<commit hash>[.dirty]` 가 된다.

#### BPF 지원 활성화

```
-DBUILD_BPF=True
```

이것을 활성화한 이후에는 `bpf` 타겟을 빌드할 수 있다.

```bash
make bpf
```

### falco-builder 컨테이너를 사용하여 빌드 {#build-using-falco-builder-container}

팔코를 빌드하는 또 다른 방법은 [falco-builder](https://hub.docker.com/r/falcosecurity/falco-builder) 컨테이너를 실행하는 것이다.
패키지를 빌드하는데 사용할 수 있는 레퍼런스 도구 모음이 포함되어 있으며 모든 의존성이 이미 충족되어 있다.

이미지는 다음의 파라미터에 따라 다르다.

* `BUILD_TYPE`: debug 또는 release (대소문자 구분없음, 기본값은 release)
* `BUILD_DRIVER`: 빌드 시 커널 모듈
빌드 여부. 커널 모듈은 호스트가 아닌 centos 이미지 안의 파일에 대해
빌드되므로 일반적으로 OFF여야 한다.
* `BUILD_BPF`: `BUILD_DRIVER` 와 비슷하지만 ebpf 프로그램용이다.
* `BUILD_WARNINGS_AS_ERRORS`: 모든 빌드 경고를 치명적이라고 간주한다.
* `MAKE_JOBS`: make의 -j 인수에 전달된다.

이 빌더를 실행하는 일반적인 방법은 다음과 같다. 팔코 및 Sysdig을
/home/user/src 아래의 디렉터리로 체크 아웃하고,
/home/user/build/falco의 빌드 디렉터리를 사용하려는 경우,
다음을 실행한다.

```bash
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder cmake
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder package
```

빌드된 패키지 버전으로 사용하기 위해 `FALCO_VERSION` 환경 변수를 명시적으로 제공할 수도 있다.

그렇지 않으면 도커 이미지가 `FALCO_VERSION` 기본값을 사용한다.


## 최신 falco 커널 모듈 로드

바이너리 버전의 팔코가 설치되어 있는 경우, 이전 팔코 커널 모듈이 이미 로드되었을 수 있다. 최신 버전을 사용하고 있는지 확인하려면, 기존 팔코 커널 모듈을 언로드하고 로컬에서 빌드된 버전을 로드해야 한다.

기존 커널 모듈을 언로드하기 위해서 다음을 수행한다.

```bash
rmmod falco
```

로컬에서 빌드된 버전을 로드하려면, `build` 디렉터리에 있다고 가정하고, 다음을 수행한다.

```bash
insmod driver/falco.ko
```

## falco 실행

팔코가 빌드되고 커널 모듈이 로드되면, `build` 디렉터리에 있다고 가정하고, falco를 다음과 같이 실행할 수 있다.

```bash
sudo ./userspace/falco/falco -c ../falco.yaml -r ../rules/falco_rules.yaml
```

기본적으로, falco는 이벤트를 표준 에러에 로그를 기록한다.


### 회귀 테스트 실행

#### 호스트에서 직접 테스트

팔코를 빌드한 후 회귀 테스트를 실행하려면, 팔코 루트 디렉터리에서 `test/run_regression_tests.sh` 스크립트를 실행해야 한다.

##### 의존성

회귀 테스트 프레임워크가 작동하려면 다음의 의존성이 필요하다.

- Python 3
- [Avocado Framework](https://github.com/avocado-framework/avocado), 버전 69
- [Avocado Yaml to Mux 플러그인](https://avocado-framework.readthedocs.io/en/69.0/optional_plugins/varianter_yaml_to_mux.html)
- [JQ](https://github.com/stedolan/jq)
- `unzip` 및 `xargs` 명령어
- [Docker CE](https://docs.docker.com/install)

회귀 테스트 스위트가 작동하려면 인터넷에서 몇 가지 테스트 픽스처를 얻어야 한다.

파이썬 의존성을 위해 virtualenv 설정하는 방법, 테스트 픽스처를 얻는 방법에 대한 자세한 내용은 [여기](https://github.com/falcosecurity/falco/tree/master/test/README.md)를 읽어본다.

##### 테스트 실행

`$PWD/build` 와 다른 경우, 팔코를 빌드한 디렉터리로 변경한다.

```bash
./test/run_regression_tests.sh -d $PWD/build
```

#### falco-tester 컨테이너를 사용하여 테스트

빌드에 대해 회귀 테스트 스위트를 실행하려는 경우, [falco-tester](https://hub.docker.com/r/falcosecurity/falco-tester) 컨테이너를 사용할 수 있다 . 빌더 이미지와 마찬가지로, 회귀 테스트를 실행하는 데 필요한 환경이 포함되어 있지만, 이미지에 마운트된 소스 디렉터리와 빌드 디렉터리에 의존한다. 이 이미지는 컴파일러가 필요하지 않고 테스트 실행 프레임워크 [avocado](http://avocado-framework.github.io/)를 포함하기 위해 다른 기본 이미지가 필요하기 때문에 `falco-builder` 와는 다른 이미지이다.

빌드 단계에서 빌드된 팔코 패키지로 컨테이너를 빌드하고 실행하는 프로세스를 테스트 하기 위해 새 컨테이너 이미지 `falcosecurity/falco:test`(팔코 GitHub 리포지터리의 `docker/local` 디렉터리에 있는 소스)를 빌드한다.

이미지는 다음의 파라미터에 따라 다르다.

* `FALCO_VERSION`: 테스트 컨테이너 이미지에 포함할 팔코 패키지의 버전이다. 빌드된 패키지의 버전과 일치해야 한다.

이 빌더를 실행하는 일반적인 방법은 다음과 같다. 팔코 및 Sysdig을
`/home/user/src` 아래 디렉터리로 체크 아웃했으며,
`/home/user/build/falco` 의 빌드 디렉터리를 사용하려는 경우,
다음을 실행한다.

```bash
docker run --user $(id -u):$(id -g) -v $HOME:$HOME:ro -v /boot:/boot:ro -v /var/run/docker.sock:/var/run/docker.sock -v /etc/passwd:/etc/passwd:ro -e FALCO_VERSION=${FALCO_VERSION} -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-tester
```

`$HOME` 을 마운트하면 테스트 실행 프레임워크를 실행할 수 있다. `$(id -g)` 를 도커 소켓에 액세스할 수 있는 그룹(보통 `docker` 그룹)의 올바른 gid로 바꿔야할 수 있다.
