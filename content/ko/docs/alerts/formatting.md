---
title: 경고 형식
description: 컨테이너 및 Kubernetes용 팔코 형식 경고
linktitle: 형식 경고
weight: 20
---

팔코는 컨테이너 및 오케스트레이션 환경을 기본적으로 지원한다. 옵션 '-k'를 사용하면 팔코는 이벤트와 관련된 K8s pod/namespace/deployment/etc. 으로 이벤트를 장식하기 위해 제공되는 K8s API 서버와 통신한다. '-m'을 사용하면 팔코는 동일한 작업을 수행하기 위해 마라톤 서버와 통신한다.

팔코는 k8s-friendly/container-friendly/general 형식을 형식화된 출력으로 변경되는 `-pk`/`-pc`/`-p` 인수로 실행할 수 있다. 그러나, 형식화된 출력 소스는 커맨드 라인이 아닌 규칙 집합에 있다. 이 페이지는 규칙의 속성 '출력'이 있는 형식 문자열과 상호 작용하는 방법에 대해 자세히 설명한다.

k8s/containers의 정보는 다음과 같은 방식으로 커맨드 라인 옵션과 함께 사용된다:

* 규칙 출력에서, 형식 문자열에 `%container.info`가 포함되어 있으면, 해당 옵션 중 하나가 제공된 경우 `-pk`/`-pc`의 값으로 대체된다. 옵션이 제공되지 않은 경우, `%container.info`는 대신 일반 `%container.name (id=%container.id)`으로 대체된다.

* 형식 문자열에 `%container.info`가 포함되어 있지 않으면, `-pk`/`-pc` 중 하나가 제공된 경우 형식 문자열 끝에 추가된다.

* `-p`가 일반적인 값으로 지정된 경우 (즉, `-pk`/`-pc` 아님), 값이 단순히 끝에 추가되고 `%container.info`는 일반 값으로 대체된다.


## 예제

여기는 팔코 커맨드 라인, 규칙의 출력 문자열 및 결과 출력의 예제이다:

### 출력에는 `%container.info`가 포함된다.
```
output: "Namespace change (setns) by unexpected program (user=%user.name command=%proc.cmdline parent=%proc.pname %container.info)"

$ falco
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s-kubelet (id=4a4021c50439))

$ falco -pk -k <k8s api server url>
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s.pod=jclient-3160134038-qqaaz container=4a4021c50439)

$ falco -p "This is Some Extra" -k <k8s api server url>
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s-kubelet (id=4a4021c50439)) This is Some Extra
```

### 출력에는 `%container.info`가 포함되지 않는다.

```
output: "File below a known binary directory opened for writing (user=%user.name command=%proc.cmdline file=%fd.name)"

$ falco
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) k8s-kubelet (id=4a4021c50439)

$ falco -pk -k <k8s api server url>
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) k8s.pod=jclient-3160134038-qqaaz container=4a4021c50439

$ falco -p "This is Some Extra" -k <k8s api server url>
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) This is Some Extra
```
