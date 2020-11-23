---
title: Rustクライアント
weight: 4
---

[client-rust](https://github.com/falcosecurity/client-rust)Rustライブラリは以下を提供します：


- Falco gRPC APIの[タイプとサービスのマッピング](https://godoc.org/github.com/falcosecurity/client-rust/src/api/output.rs) 。詳細については、[出力スキーマ](../outputs)を参照してください。
- gRPCサーバーへの接続を簡略化することを目的とした`Client`および`FalcoConnect`クラス。

[完全に機能する例]（(https://github.com/falcosecurity/client-rust/blob/master/examples/output.rs)を参照して、RustクライアントがFalco gRPC出力APIに接続する方法と、イベントをJSONで表示します。

1. 例のパスの`/tmp/{client.crt,client.key,ca.crt}`に証明書があることを確認します。

2. [client-rust](https://github.com/falcosecurity/client-rust)ルートディレクトリから、次のコマンドを実行します：

    ```bash
    $ cargo run --example outputs
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
