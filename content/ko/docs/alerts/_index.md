---
title: 팔코 알림
---

팔코는 하나 이상의 채널에 알림을 보낼 수 있다.:

* 표준 출력
* 단일 파일
* Syslog
* spawned 프로그램
* HTTP[s] 엔드포인트
* gRPC API를 경유하는 클라이언트

채널은 팔코 구성 파일인 `falco.yaml` 을 통하여 구성된다. 자세한 내용은 [팔코 설정](../configuration)페이지를 참조한다. 각 채널에 대한 세부 정보는 다음과 같다.

## 표준 출력

표준 출력을 통해 알림을 보내도록 구성된 경우, 각 경고에 대해 한 줄이 출력된다. 예를 들면 다음과 같다.

```yaml
stdout_output:
  enabled: true
```

```
10:20:05.408091526: Warning Sensitive file opened for reading by non-trusted program (user=root command=cat /etc/shadow file=/etc/shadow)
```
표준 출력은 Fluentd 또는 Logstash를 사용하여 컨테이너에 로그를 확보할 때 유용하다. 그런 다음에 Elasticsearch에 알림을 저장하고 대시보드를 생성하여 알림을 시각화 할 수 있다. 자세한 내용은 [이 블로그의 게시물](https://sysdig.com/blog/kubernetes-security-logging-fluentd-falco/)을 참조한다.

`-d/--daemon` 명령 줄 옵션을 통해 백그라운드에서 실행하면 표준 출력 메시지가 삭제된다.

## 파일 출력

알림을 파일로 보내도록 구성된 경우 각 알림에 대한 메시지가 파일에 기록된다. 형식은 표준 출력 형식과 매우 유사하다.

```yaml
file_output:
  enabled: true
  keep_alive: false
  filename: ./events.txt
```

`keep_alive` 가 false(기본값)이면 각 알림에 대해 추가를 위해 파일이 열리고, 단일 알림이 작성된 후에 파일이 닫힌다. 파일이 로테이트 되거나 잘리지는(truncated) 않는다. `keep_alive` 가 true로 설정된 경우 첫 번째 알림 전에 파일이 열리고 모든 후속 알림에 대해 열린 상태로 유지된다. 출력은 버퍼링되고 닫혀질 때에만 비워진다. (`--unbuffered` 로 변경 가능하다.)

만약 [logrotate](https://github.com/logrotate/logrotate)와 같은 프로그램을 사용하여 출력 파일을 로테이트 하려면 [여기](https://github.com/draios/falco/blob/master/examples/logrotate/falco)에서 logrotate 구성 예제를 사용할 수 있다. 

팔코 0.10.0 부터, 팔코는 `SIGUSR1` 신호를 받으면 파일 출력을 닫았다가 다시 열게 된다. 위의 logrotate 의 예제는 이에 영향을 받는다.

## Syslog 출력

알림을 syslog 로 보내도록 구성된 경우 각 알림에 대해 syslog 메시지가 전송된다. 실제 형식은 syslog 데몬에 따라 다르며, 하나의 예는 다음과 같다.

```yaml
syslog_output:
  enabled: true
```

```
Jun  7 10:20:05 ubuntu falco: Sensitive file opened for reading by non-trusted program (user=root command=cat /etc/shadow file=/etc/shadow)
```

Syslog 메시지는 LOG_USER 기능으로 전송된다. 규칙의 우선 순위는 syslog 메시지의 우선순위로 사용된다.

## 프로그램 출력

프로그램에 알림을 보내도록 구성된 경우, 팔코는 각 경고에 대해 프로그램을 시작하고 해당 내용을 프로그램의 표준 입력에 기록한다. 한 번에 하나의 프로그램 출력만 구성할 수 있다(예: 단일 프로그램에 대한 알림 라우팅).

예를 들면, 다음과 같은 `falco.yaml` 구성이 있다.

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: mail -s "Falco Notification" someone@example.com
```

만약 프로그램이 일반적으로 표준 입력을 통해 입력 받을 수 없는 경우 `xargs` 를 사용하여 인수와 함께 팔코 이벤트를 전달할 수 있다. 예를 들면,

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: "xargs -I {} aws --region ${region} sns publish --topic-arn ${falco_sns_arn} --message {}"
```

`keep_alive` 가 false(기본값)이면 각 알림에 대해 팔코는 `mall -s ...` 프로그램을 실행하고 프로그램에 알림을 쓴다. 프로그램은 셸을 통해 실행되므로 추가 형식을 추가하려는 경우, 명령 파이프 라인을 지정할 수 있다.

`keep_alive` 가 true로 설정되면, 첫 번째 알림 전에 팔코가 프로그램을 생성하고 알림을 작성한다. 프로그램 파이프는 후속 알림을 위해 열린 상태로 유지된다. 출력은 버퍼링 되고 닫혀질 때에만 비워진다. (`--unbuffered` 로 변경 가능하다.)

*참고*: 팔코에 의해 생성된 프로그램은 팔코와 동일한 프로세스 그룹에 있으며 팔코가 수신하는 모든 신호를 수신한다. 예를 들어 SIGTERM을 무시하여 버퍼링 된 출력에 대한 깔끔한 종료를 허용하려면 신호 처리기를 직접 재정의해야 한다.

팔코 0.10.0 부터, 팔코는 `SIGUSR1` 신호를 받으면 파일 출력을 닫았다가 다시 열게 된다. 

### 프로그램 출력 예제: 슬랙(Slack) 수신 웹훅(webhook)에 게시하기

슬랙 채널에 팔코 알림을 보내려는 경우, 슬랙 웹훅 엔드포인트에 필요한 양식으로 JSON 출력을 전달하기 위해 필요한 구성은 다음과 같다.

```yaml
# 이벤트를 json 또는 텍스트로 출력할지의 여부
json_output: true
…
program_output:
  enabled: true
  program: "jq '{text: .output}' | curl -d @- -X POST https://hooks.slack.com/services/XXX"
```

### 프로그램 출력: 네트워크 채널에 알림 보내기

네트워크 연결을 통해 알림 스트림을 보내려는 경우, 예제는 다음과 같다.

```yaml
# 이벤트를 json 또는 텍스트로 출력할지의 여부
json_output: true
…
program_output:
  enabled: true
  keep_alive: true
  program: "nc host.example.com 1234"
```

네트워크 연결을 지속적으로 유지하려는 경우 `keep_alive: true` 를 사용하도록 한다.

## HTTP[s] 출력: HTTP[s] 엔드 포인트에 알림 보내기

HTTP[s] 엔드 포인트에 알림을 보내려는 경우, `http_output` 옵션을 사용할 수 있다.

```yaml
json_output: true
...
http_output:
  enabled: true
  url: http://some.url/some/path/
```

현재는 암호화되지 않은 HTTP 엔드포인트 또는 유효한 보안 HTTP 엔드포인트만 지원된다. (즉 유효하지 않거나 자체 서명된 인증서는 지원되지 않는다.)

## JSON 출력

모든 출력 채널에 대해, 구성 파일 또는 명령 줄에서 JSON 출력으로 전환 가능하다. 각 알림에 대해 팔코는 다음 속성을 포함하는 JSON 개체를 한 줄에 출력한다.

* `time`: ISO8601 형식의 알림 시간
* `rule`: 알림을 발생시킨 규칙
* `priority`: 알림을 생성한 규칙의 우선순위
* `output`: 알림에 대한 형식화된 출력 문자열
* `output_fields`: 출력 표현식의 각 템플릿 값에 대해 알림을 드리커한 이벤트의 해당 필드 값

예제는 다음과 같다.

```javascript
{"output":"16:31:56.746609046: Error File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack)","priority":"Error","rule":"Write below binary dir","time":"2017-10-09T23:31:56.746609046Z", "output_fields": {"evt.t\
ime":1507591916746609046,"fd.name":"/bin/hack","proc.cmdline":"touch /bin/hack","user.name":"root"}} 
```

좀 더 보기 좋게 출력된 예제는 다음과 같다.

```javascript
{
   "output" : "16:31:56.746609046: Error File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack)"
   "priority" : "Error",
   "rule" : "Write below binary dir",
   "time" : "2017-10-09T23:31:56.746609046Z",
   "output_fields" : {
      "user.name" : "root",
      "evt.time" : 1507591916746609046,
      "fd.name" : "/bin/hack",
      "proc.cmdline" : "touch /bin/hack"
   }
}
```

## gRPC 출력

gRPC API를 통해 연결된 외부 프로그램(예: [falco-exporter](https://github.com/falcosecurity/falco-exporter))에 알림을 보내려면 [gRPC 구성 섹션](/docs/grpc/#configuration)에 설명된대로 `grpc` 및 `grpc_output` 옵션을 모두 사용 설정해야 한다.