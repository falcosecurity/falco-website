---
title: 설정
description: 팔코 데몬을 위한 설정
weight: 5
notoc: true
---

{{< info >}}

이것은 팔코 데몬의 구성 옵션이다.

이러한 옵션을 보려면 [규칙](https://falco.org/docs/rules/) 또는 [알림](https://falco.org/docs/alerts/)을 방문하자.

{{< /info >}}


팔코의 구성 파일은 `key: value` 또는 `key: [value list]` 쌍의 모음을 포함하는 [YAML](http://www.yaml.org/start.html)파일이다.



모든 구성 옵션은 `-o/--option key=value` 플래그를 통해 명령 줄에서 재정의 할 수 있다. `key: [value list]` 옵션의 경우, `--option key.subkey=value` 를 사용하여 개별 목록 항목을 지정할 수 있다.

## 현재의 설정 옵션들


[comment]: <> (@kris-nova: This data is loaded from the YAML file in data/ko/config.yaml)
{{< config >}}
