---
title: 다운로드
description: 공식 지원하는 Falco 아티팩트
weight: 2
---

## Downloading

Falco 프로젝트 커뮤니티는 Falco 다운로드 및 실행에 대해 두 가지 방법만 지원합니다:

 - Linux 호스트에서 직접 Falco를 실행하기
 - 드라이버가 설치된 호스트 상의 컨테이너에서 Falco 사용자 공간 프로그램을 실행하기

다음은 두 가지 아티팩트에 대한 내용입니다.

### Download for Linux {#packages}

|        | development                                                                                                                 | stable                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| rpm    | [![rpm-dev](https://img.shields.io/bintray/v/falcosecurity/rpm-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][1] | [![rpm](https://img.shields.io/bintray/v/falcosecurity/rpm/falco?label=Falco&color=%23005763&style=flat-square)][2] |
| deb    | [![deb-dev](https://img.shields.io/bintray/v/falcosecurity/deb-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][3] | [![deb](https://img.shields.io/bintray/v/falcosecurity/deb/falco?label=Falco&color=%23005763&style=flat-square)][4] |
| binary | [![bin-dev](https://img.shields.io/bintray/v/falcosecurity/bin-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][5] | [![bin](https://img.shields.io/bintray/v/falcosecurity/bin/falco?label=Falco&color=%23005763&style=flat-square)][6] |

사용 가능한 전체 아티팩트 목록은 [여기](https://bintray.com/falcosecurity)에 있습니다.

---

### Download container images {#images}

{{< info >}}

Falco는 실행 중인 시스템 호출 정보를 얻기 위해 호스트 시스템에 드라이버를 설치해야 합니다.

권장하는 방법은 위에서 명시한 네이티브 아티팩트로 드라이버를 설치하거나, `falcosecurity/falco-driver-loader` 이미지를 임시로 특권을 이용해(as privileged) 실행한 다음 `falcosecurity/falco-no-driver` 이미지를 사용하는 것입니다.

자세한 내용은 [Docker 섹션 내에서 실행](https://falco.org/docs/running/#docker)을 참조하세요.

{{< /info >}}

|tag | pull command | description |
|----|----------|-----------------|
|[latest](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:latest` | 최신 버전 |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:<version>` | Falco의 `{{< latest >}}`와 같은 특정 버전 |
|[latest](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:latest` | 빌드 툴체인을 갖춘 `falco-driver-loader`의 최신 버전 |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:<version>` | 빌드 툴체인을 갖춘 `falco-driver-loader`의 `{{< latest >}}`와 같은 특정 버전 |
|[latest](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:latest` | `falco-driver-loader`가 포함된 최신 버전 |
|[*version*](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:<version>` | `falco-driver-loader`가 포함된 `{{< latest >}}`와 같은 특정 버전 |

사용 가능한 전체 이미지 목록은 [여기](https://github.com/falcosecurity/falco/tree/master/docker)에 있습니다.

[1]: https://dl.bintray.com/falcosecurity/rpm-dev
[2]: https://dl.bintray.com/falcosecurity/rpm
[3]: https://dl.bintray.com/falcosecurity/deb-dev/stable
[4]: https://dl.bintray.com/falcosecurity/deb/stable
[5]: https://dl.bintray.com/falcosecurity/bin-dev/x86_64
[6]: https://dl.bintray.com/falcosecurity/bin/x86_64
