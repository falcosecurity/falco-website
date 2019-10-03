---
title: Go Client
weight: 2
---

The [client-go](https://github.com/falcosecurity/client-go) Go library provides:

- [type and service mappings](https://godoc.org/github.com/falcosecurity/client-go/pkg/api/output) for the Falco gRPC Outputs API ([schema](./outputs))
- `Client` and `Config` structs ([docs here](https://godoc.org/github.com/falcosecurity/client-go/pkg/client)) aimed at simplifying the connection to the gRPC server

Please read the .

A fully-working example which just connects to the Falco gRPC Outputs API and outputs the events in JSON is [here](https://github.com/falcosecurity/client-go/blob/master/examples/output/main.go).

From within the [client-go](https://github.com/falcosecurity/client-go) root directory, assuming you have the certificates in the example's path (`/tmp/{client.crt,client.key,ca.crt}`), run it with:

{{< highlight bash >}}
go run examples/output/main.go | jq
{{< / highlight >}}

You should see output events starting flowing in depending on the set of rules
your Falco instance has.

{{< highlight json >}}
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
{{< / highlight >}}
