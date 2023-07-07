|  ശീർഷകം  | വെയ്റ്റ് |
| :------: | :---: |
| ഗോ ക്ലൈൻറ് |   2   |



 [client-go](https://github.com/falcosecurity/client-go) ഗോ ലൈബ്രറി ഇവ നൽകുന്നു:

- ഫാൽക്കോ gRPC API ക്കായി [type and service mappings](https://godoc.org/github.com/falcosecurity/client-go/pkg/api/outputs). കൂടുതൽ വിവരങ്ങൾക്കായി, [output schema](../outputs) കാണുക.
- gRPC സർവറിലേക്കുള്ള കണക്ഷൻ ലളിതമാക്കുന്ന `Client`, `Config`  ഘടനകൾ . കൂടുതൽ വിവരങ്ങൾക്കായി, [documentation](https://godoc.org/github.com/falcosecurity/client-go/pkg/client) കാണുക.

എങ്ങനെയാണ് ഗോ ക്ലൈൻറ് ഫാൽക്കോ gRPC ഔട്ട്പുട്ട് API ലേക്ക് കണക്റ്റ് ചെയ്യുന്നതെന്നും JSON ൽ ഇവൻറുകൾ പ്രദർശിപ്പിക്കുന്നതെന്നും കാണാൻ [fully-functional example](https://github.com/falcosecurity/client-go/blob/master/examples/output/main.go) റഫർ ചെയ്യുക.

വ്യത്യസ്ത APIകൾക്കുള്ള കൂടുതൽ ഉദാഹരണങ്ങൾ  [client-go](https://github.com/falcosecurity/client-go) റെപ്പോസിറ്റോറിയിലെ  [examples](https://github.com/falcosecurity/client-go/tree/master/examples) ഡയറക്റ്ററിയിൽ സ്ഥിതിചെയ്യുന്നു .

1. സർട്ടിഫിക്കറ്റുകൾ `/etc/falco/certs/{client.crt,client.key,ca.crt}` എന്നതിലെ ഉദാഹരണത്തിൻറെ പാതയിൽ ഉണ്ട് എന്ന് ഉറപ്പുവരുത്തുക.

2. [client-go](https://github.com/falcosecurity/client-go) റൂട്ട് ഡയറക്റ്ററിയിൽ, ഇത് റൺ ചെയ്യുക:

    ```bash
    $ go run examples/output/main.go | jq
    ```

    ഔട്ട്പുട്ട് ഇവൻറുകൾ ഫാൽക്കോ ഇൻസ്റൻസിലെ നിയമങ്ങളുടെ ഗണത്തിനെ ആശ്രയിച്ച് ഫ്ലോ ചെയ്യാൻ തുടങ്ങുന്നു.

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
