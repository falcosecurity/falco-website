---
title: Go Client
linktitle: Go Client
description: Retrieve Falco events using the gRPC Go Client
weight: 50
---

{{% pageinfo color=warning %}}

The gRPC Output as well as the embedded gRPC server have been deprecated in Falco `0.43.0` and will be removed in a
future release. Until removal and since Falco `0.43.0`, using any of them will result in a warning informing the user
about the deprecation. Users are encouraged to leverage another output and/or Falcosidekick, as the usage will result
in an error after the removal.

{{% /pageinfo %}}

The [client-go](https://github.com/falcosecurity/client-go) Go library provides:

- [type and service mappings](https://godoc.org/github.com/falcosecurity/client-go/pkg/api/outputs) for the Falco gRPC API. For more information, see [output schema](/docs/grpc/outputs).
- `Client` and `Config` structs that simplify the connection to the gRPC server. For more information, see [documentation](https://godoc.org/github.com/falcosecurity/client-go/pkg/client).

Refer to the [fully-functional example](https://github.com/falcosecurity/client-go/blob/master/examples/output/main.go) to see how the Go client connects to the Falco gRPC Outputs API and displays the events in JSON.

Additional examples for various APIs are located in the [examples](https://github.com/falcosecurity/client-go/tree/master/examples) directory of the [client-go](https://github.com/falcosecurity/client-go) repository.

1. Ensure that you have the certificates in the example's path at `/etc/falco/certs/{client.crt,client.key,ca.crt}`.

2. In the [client-go](https://github.com/falcosecurity/client-go) root directory, run:

    ```bash
    $ go run examples/output/main.go | jq
    ```

    The output events start flowing in depending on the set of rules in the Falco instance.

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
