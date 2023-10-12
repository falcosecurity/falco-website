---
exclude_search: true
title: 구성
description: 팔코 데몬을 위한 구성
weight: 5
notoc: true
---

{{% pageinfo color="primary" %}}

이 문서는 팔코 데몬 구성 옵션을 위한 것이다.

이들 옵션을 보려면 [규칙](/docs/rules) 또는 [경고](/docs/alerts)를 확인한다.

{{% /pageinfo %}}



팔코의 구성 파일은 `key: value` 또는 `key: [value list]` 쌍의 모음을 포함하는 [YAML](http://www.yaml.org/start.html) 파일이다.



모든 구성 옵션은 `-o/-option key=value` 플래그를 통해 커맨드 라인에서 재정의할 수 있다. `key: [value list]` 옵션의 경우 `--option key.subkey=value` 를 사용하여 개별 목록 항목을 지정할 수 있다.

## 현재 구성 옵션


[comment]: <> (@kris-nova: This data is loaded from the YAML file in data/ko/config.yaml)

TODO-PRINT-CONFIG
