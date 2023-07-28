---
title: 팔코 경고
description: Falco를 통합하고 원하는 플랫폼에서 Falco 경고를 전송
linktitle: 팔코 경고
weight: 40
---

팔코는 하나 이상의 채널에 알림을 보낼 수 있다:

* 표준 출력(Standard Output)
* 파일
* Syslog
* 생성된 프로그램(spawned program)
* HTTP/HTTPS 엔드포인트(HTTP/HTTPS endpoint)
* gRPC API를 통한 클라이언트(client via the gRPC API)

채널은 팔코 구성파일 `falco.yaml`을 통해 설정된다. 자세한 내용은 [팔코 구성](../configuration) 페이지를 확인한다.

[경고 채널](/docs/outputs/channels/)에서 각 채널을 구성하는 방법에 대해 자세한 정보를 찾는다.
