---
exclude_search: true
title: Pythonクライアント
weight: 3
---

[client-py](https://github.com/falcosecurity/client-py)Pythonライブラリは以下を提供します：


- Falco gRPCサーバーでgRPCセキュアチャネルを初期化するために使用される`Client`クラス。
- 同じ名前のprotobufオブジェクトを表す `Request`および`Response`クラス。

[例](https://github.com/falcosecurity/client-py/blob/master/examples/get_events.py)を参照して、PythonクライアントがFalco gRPC出力APIに接続し、イベントをJSONで表示する方法を確認します 。

現在、Pythonクライアントには2つの出力形式があります。[Response](https://github.com/falcosecurity/client-py/blob/master/falco/domain/response.py)クラスはデフォルトであり、次の場合に推奨されます。データはPythonまたはJSONでさらに処理する必要があります。JSON出力を有効にするには、 `Client`をインスタンス化するときに`output_format="json"`パラメーターを渡すだけで十分です。

1. 例のパスの`/tmp/{client.crt,client.key,ca.crt}`に証明書があることを確認します。

2. [必須の依存関係](https://github.com/falcosecurity/client-py/blob/master/requirements.txt)を使用してPython環境を作成し、アクティベイトします。

3. [client-py](https://github.com/falcosecurity/client-py)ルートディレクトリから、次のコマンドを実行します：

    ```bash
    $ python -m examples.get_events -o json
    ```

    Falcoインスタンスが持っている一連のルールに応じて、出力イベントが流れ始めます。

    ```json
    {
      "time":"2020-03-03T17:50:03.391768+00:00",
      "priority":"warning",
      "source":"syscall",
      "rule":"Delete or rename shell history",
      "output":"18:50:03.391767411: Warning Shell history had been deleted or renamed (user=matt type=unlink command=zsh fd.name=<NA> name=<NA> path=/home/matt/.zsh_history.LOCK oldpath=<NA> host (id=host))",
      "output_fields":{
          "container.name":"host",
          "user.name":"matt",
          "container.id":"host",
          "fd.name":"<NA>",
          "proc.cmdline":"zsh",
          "evt.arg.path":"/home/matt/.zsh_history.LOCK",
          "evt.arg.name":"<NA>",
          "evt.arg.oldpath":"<NA>",
          "evt.type":"unlink",
          "evt.time":"18:50:03.391767411"
      },
      "hostname":"localhost.localdomain"
    }
    ```
