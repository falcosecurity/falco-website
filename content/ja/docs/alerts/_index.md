---
title: Falcoアラート
---

Falcoは1つ以上のチャネルにアラートを送信できます：

* 標準出力
* ファイル
* Syslog
* プログラム起動
* HTTP[s]エンドポイント

チャネルは、falco設定ファイル `falco.yaml`を介して設定されます。詳細については、[Falcoの設定](../configuration)ページを参照してください。これらの各チャネルの詳細は次のとおりです。

## 標準出力

標準出力を介してアラートを送信するように設定されている場合、アラートごとに1行が出力されます。次に例を示します：

```yaml
stdout_output:
  enabled: true
```

```
10:20:05.408091526: Warning Sensitive file opened for reading by non-trusted program (user=root command=cat /etc/shadow file=/etc/shadow)
```
標準出力は、FluentdまたはLogstashを使用してコンテナからログをキャプチャする場合に役立ちます。次にアラートをElasticsearchに保存し、ダッシュボードを作成してアラートを視覚化できます。詳細については、[このブログ投稿](https://sysdig.com/blog/kubernetes-security-logging-fluentd-falco/)をご覧ください。

`-d/--daemon`コマンドラインオプションを介してバックグラウンドで実行すると、標準出力メッセージは破棄されます。

## ファイル出力

アラートをファイルに送信するように設定すると、アラートごとにメッセージがファイルに書き込まれます。形式は、標準出力形式と非常によく似ています：

```yaml
file_output:
  enabled: true
  keep_alive: false
  filename: ./events.txt
```

`keep_alive`がfalse（デフォルト）の場合、アラートごとにファイルが追加のために開かれ、単一のアラートが書き込まれ、ファイルが閉じられます。ファイルはローテーションまたは切り捨てられません。`keep_alive`がtrueに設定されている場合、ファイルは最初のアラートの前に開かれ、その後のすべてのアラートに対して開かれたままになります。出力はバッファリングされ、閉じるときにのみフラッシュされます。（これは`--unbuffered`で変更できます）。

[logrotate](https://github.com/logrotate/logrotate)のようなプログラムを使用して出力ファイルをローテーションする場合は、サンプルのlogrotate設定を利用できます[こちら](https://github.com/falcosecurity/falco/blob/ffd8747ec0943db2546c3270826e1700dc4df75f/examples/logrotate/falco)。

Falco 0.10.0以降、`SIGUSR1`で通知されると、falcoはファイル出力を閉じて再度開きます。上記のlogrotateの例はそれに依存しています。

## Syslogアウトプット

アラートをsyslogに送信するように設定されている場合、syslogメッセージがアラートごとに送信されます。実際の形式はsyslogデーモンによって異なりますが、以下に例を示します：

```yaml
syslog_output:
  enabled: true
```

```
Jun  7 10:20:05 ubuntu falco: Sensitive file opened for reading by non-trusted program (user=root command=cat /etc/shadow file=/etc/shadow)
```

Syslogメッセージは、LOG_USERの機能を使用して送信されます。ルールの優先度は、syslogメッセージの優先度として使用されます。

## プログラムアウトプット

アラートをプログラムに送信するように設定されている場合、Falcoはアラートごとにプログラムを起動し、その内容をプログラムの標準入力に書き込みます。一度に設定できるのは、1つのプログラム出力（たとえば、アラートを1つのプログラムにルーティングする）だけです。

たとえば、以下の`falco.yaml`設定が与えられたとします：

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: mail -s "Falco Notification" someone@example.com
```

プログラムが標準入力からの入力を正常に受け入れることができない場合は、`xargs`を使用して、引数付きのFalcoイベントを渡すことができます。例えば：

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: "xargs -I {} aws --region ${region} sns publish --topic-arn ${falco_sns_arn} --message {}"
```

`keep_alive`がfalse（デフォルト）の場合、アラートごとにFalcoはプログラム`mail -s ...` を実行し、アラートをプログラムに書き込みます。プログラムはシェルを介して実行されるため、追加のフォーマットを追加する場合は、コマンドパイプラインを指定できます。

`keep_alive`がtrueに設定されている場合、最初のアラートの前にFalcoはプログラムを起動してアラートを書き込みます。プログラムパイプは、後続のアラートのために開いたままになります。出力はバッファリングされ、閉じるときにのみフラッシュされます。（これは--unbufferedで変更できます）。

*注意*：falcoによって生成されたプログラムは、falcoと同じプロセスグループにあり、falcoが受信するすべてのシグナルを受信します。たとえば、SIGTERMを無視して、バッファリングされた出力に直面してもクリーンシャットダウンできるようにする場合は、シグナルハンドラを自分でオーバーライドする必要があります。

Falco 0.10.0以降、`SIGUSR1`で通知されると、falcoはファイル出力を閉じて再度開きます。

### プログラム出力の例：SlackのIncoming WebhookへのPost

Falco通知をSlackチャネルに送信する場合は、JSON出力をSlack Webhookエンドポイントに必要なフォームにメッセージするために必要な設定を次に示します：

```yaml
# Whether to output events in json or text
json_output: true
…
program_output:
  enabled: true
  program: "jq '{text: .output}' | curl -d @- -X POST https://hooks.slack.com/services/XXX"
```

### プログラム出力：ネットワークチャネルへのアラートの送信

ネットワーク接続を介して一連のアラートを送信する場合は、次の例をご覧ください：

```yaml
# Whether to output events in json or text
json_output: true
…
program_output:
  enabled: true
  keep_alive: true
  program: "nc host.example.com 1234"
```

ネットワーク接続を永続的に保つために、`keep_alive: true`を使用していることに注意してください。

## HTTP[s] Output: Send alerts to an HTTP[s] end point.

アラートをHTTP[s]エンドポイントに送信する場合は、`http_output`オプションが使用できます：

```yaml
json_output: true
...
http_output:
  enabled: true
  url: http://some.url/some/path/
```

現在、暗号化されていないHTTPエンドポイントまたは有効で安全なHTTPエンドポイントのみがサポートされています（つまり、無効な証明書または自己署名証明書はサポートされていません）。

## JSON Output

すべての出力チャネルについて、設定ファイルまたはコマンドラインでJSON出力に切り替えることができます。アラートごとに、falcoは次のプロパティを含むJSONオブジェクトを1行で出力します。

* `time`: ISO8601形式のアラートの時刻.
* `rule`: アラートの原因となったルール.
* `priority`: アラートを生成したルールの優先度.
* `output`: アラートのフォーマットされた出力文字列.
* `output_fields`: 出力式のテンプレート値ごとに、アラートをトリガーしたイベントのそのフィールドの値.

次に例を示します：

```javascript
{"output":"16:31:56.746609046: Error File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack)","priority":"Error","rule":"Write below binary dir","time":"2017-10-09T23:31:56.746609046Z", "output_fields": {"evt.t\
ime":1507591916746609046,"fd.name":"/bin/hack","proc.cmdline":"touch /bin/hack","user.name":"root"}} 
```

これは、きれいに印刷された同じ出力です：

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




