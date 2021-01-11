---
title: Goクライアント
weight: 2
---

[client-go](https://github.com/falcosecurity/client-go) Goライブラリは以下を提供します：

- Falco gRPC APIの[タイプとサービスのマッピング](https://godoc.org/github.com/falcosecurity/client-go/pkg/api/output) 。詳細については、[出力スキーマ](../outputs)を参照してください。
- gRPCサーバーへの接続を簡略化することを目的とした`Client`および`Config`構造体。詳細については、[ドキュメント](https://godoc.org/github.com/falcosecurity/client-go/pkg/client)を参照してください。

[完全に機能する例]（(https://github.com/falcosecurity/client-go/blob/master/examples/output/main.go)を参照して、GoクライアントがFalco gRPC出力APIに接続する方法と、イベントをJSONで表示します。

1. 例のパスの`/tmp/{client.crt,client.key,ca.crt}`に証明書があることを確認します。

2. [client-go](https://github.com/falcosecurity/client-go)ルートディレクトリから、次のコマンドを実行します：

    ```bash
    $ go run examples/output/main.go | jq
    ```

    Falcoインスタンスが持っている一連のルールに応じて、出力イベントが流れ始めます。

    ```json
    {
      "time": {
        "seconds": 1570094449,
        "nanos": 259268899
      },
      "priority": 3,
      "rule": "Modify binary dirs",
      "output": "09:20:49.259268899: Error File below known binary directory renamed/removed (user=vagrant command=lua /home/vagrant/.dotfiles/zsh/.config/zsh/plugins/z.lua/z.lua --init zsh once enhanced pcmdline=zsh operation=rena
    me file=<NA> res=0 oldpath=/usr/bin/realpath newpath=/usr/bin/realpath container_id=host image=<NA>)",
      "output_fields": {
        "container.id": "host",
        "container.image.repository": "<NA>",
        "evt.args": "res=0 oldpath=/usr/bin/realpath newpath=/usr/bin/realpath ",
        "evt.time": "09:20:49.259268899",
        "evt.type": "rename",
        "fd.name": "<NA>",
        "proc.cmdline": "lua /home/vagrant/.dotfiles/zsh/.config/zsh/plugins/z.lua/z.lua --init zsh once enhanced",
        "proc.pcmdline": "zsh",
        "user.name": "vagrant"
      }
    }
    {
      "time": {
        "seconds": 1570094449,
        "nanos": 620298462
      },
      "priority": 4,
      "rule": "Delete or rename shell history",
      "output": "09:20:49.620298462: Warning Shell history had been deleted or renamed (user=vagrant type=unlink command=zsh fd.name=<NA> name=<NA> path=/home/vagrant/.zsh_history.LOCK oldpath=<NA> host (id=host))",
      "output_fields": {
        "container.id": "host",
        "container.name": "host",
        "evt.arg.name": "<NA>",
        "evt.arg.oldpath": "<NA>",
        "evt.arg.path": "/home/vagrant/.zsh_history.LOCK",
        "evt.time": "09:20:49.620298462",
        "evt.type": "unlink",
        "fd.name": "<NA>",
        "proc.cmdline": "zsh",
        "user.name": "vagrant"
      }
    }
    ```
