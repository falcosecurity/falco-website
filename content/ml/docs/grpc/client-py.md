---
exclude_search: true
---
|   ശീർഷകം    | വെയ്റ്റ് |
| :---------: | :---: |
| പൈത്തൺ ക്ലൈൻറ് |   3   |

[client-py](https://github.com/falcosecurity/client-py) എന്ന പൈത്തൺ ലൈബ്രറി ഇവ നൽകുന്നു:

- ഫാൽക്കോ gRPC സർവറിനോടൊപ്പം gRPC സുരക്ഷിത ചാനൽ ആരംഭിക്കാൻ ഉപയോഗിക്കുന്ന  ഒരു `Client` ക്ലാസ്സ് .
- പ്രോട്ടോബഫ് ഓബ്ജക്റ്റുകളെ പ്രതിനിധീകരിക്കുന്ന അതേ പേരിലുള്ള `Request`, `Response` എന്നീ ക്ലാസ്സുകൾ.

പൈത്തൺ ക്ലൈൻറ് എങ്ങനെയാണ് ഫാൽക്കോ gRPC ഔട്ട്പുട്ട് API ആയി ബന്ധപ്പെടുന്നതെന്നും JSON ലെ ഇവൻറുകൾ പ്രദർശിപ്പിക്കുന്നത് എന്നും കാണാൻ [example](https://github.com/falcosecurity/client-py/blob/master/examples/get_events.py) എന്നത് റഫർ ചെയ്യുക. 

നിലവിൽ പൈത്തൺ ക്ലൈൻറിന് രണ്ട് ഔട്ട്പുട്ട് ഫോർമാറ്റുകളുണ്ട്: ഡീഫോൾട്ട് ആയതും, ഡാറ്റ പൈത്തൺ അല്ലെങ്കിൽ JSON ഉപയോഗിച്ച് പ്രോസസ്സ് ചെയ്യേണ്ട ആവശ്യമുണ്ടെങ്കിൽ ശുപാർശ ചെയ്യപ്പെടുന്നതുമായ [Response](https://github.com/falcosecurity/client-py/blob/master/falco/domain/response.py) ക്ലാസ്സ്. JSON ഔട്ട്പുട്ട് പ്രവർത്തനക്ഷമമാക്കുന്നതിന്, ഒരു `Client` നെ ഇൻസ്റ്റാൻഷ്യേറ്റ് ചെയ്യുമ്പോൾ `output_format="json"` പാരാമീറ്റർ പാസ് ചെയ്യുന്നത് പര്യാപ്തമാണ്.

1. `/tmp/{client.crt,client.key,ca.crt}`എന്നിടത്ത് ഉദാഹരണത്തിൻറെ പാതയിൽ നിങ്ങൾക്ക് സർട്ടിഫിക്കറ്റുകളുണ്ട് എന്ന് ഉറപ്പുവരുത്തുക.

2. [required dependencies](https://github.com/falcosecurity/client-py/blob/master/requirements.txt) എന്നതിനോടൊപ്പം പൈത്തൺ പരിതസ്ഥിതി സൃഷ്ടിക്കുകയും പ്രയോഗക്ഷമമാക്കുകയും ചെയ്യുക.

3.  [client-py](https://github.com/falcosecurity/client-py) റൂട്ട് ഡയറക്റ്ററിയിൽ നിന്നും, ഇനി പറയുന്നത് റൺ ചെയ്യുക:

    ```bash
    $ python -m examples.get_events -o json
    ```

    നിങ്ങളുടെ ഫാൽക്കോ ഇൻസ്റ്റൻസിനുള്ള നിയമഗണങ്ങളെ ആശ്രയിച്ച് ഔട്ട്പുട്ട് ഇവൻറുകൾ ഫ്ലോ ചെയ്യാൻ തുടങ്ങുന്നത് നിങ്ങൾ കണ്ടിരിക്കും.

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
