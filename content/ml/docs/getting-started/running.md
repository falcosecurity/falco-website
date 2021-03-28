---
title: Running
description: Operating and Managing Falco
weight: 4
---


## ഒരു സേവനമായി ഫാൽക്കോ പ്രവർത്തിപ്പിക്കുക

[the deb or the rpm](/docs/getting-started/installation) പാക്കേജ് ഉപയോഗിച്ച് ആണ് നിങ്ങൾ ഫാൽക്കോ ഇൻസ്റ്റാൾ ചെയ്തിട്ടുണ്ടെങ്കിൽ, സേവനം ഇങ്ങനെ ആരംഭിക്കാൻ കഴിയും:

```bash
service falco start
```

Or, for `systemd`:
```bash
systemctl start falco
```

`systemd-sysv-generator` നു ` init.d` സ്ക്രിപ്റ്റുകളെ` systemd` യൂണിറ്റുകളിലേക്ക് ഉൾപെടുത്തുവാൻ കഴിയുന്നതിനാൽ ഇത് പ്രവർത്തിക്കുന്നു.
 `journalctl` ഉപയോഗിച്ച് നിങ്ങൾക്ക് ഫാൽകോ ലോഗുകളും കാണാനാകും.

```bash
journalctl -fu falco
```

## ഫാൽക്കോ സ്വമേധയാ പ്രവർത്തിപ്പിക്കുന്ന വിധം

ഫാൽക്കോ സ്വമേധയാ പ്രവർത്തിപ്പിക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെങ്കിൽ, താഴെ കൊടുത്തത് ടൈപ്പുചെയ്തുക.  ഔട്ട്പുട്ട് ഫാൽക്കോയുടെ പൂർണ്ണ ഉപയോഗ വിവരണം നിങ്ങൾക്ക് നൽകുന്നു
```
falco --help
```

{{% pageinfo color="primary" %}}

നിങ്ങൾ യൂസർപേസ് ഇൻസ്ട്രുമെന്റേഷനായി തിരയുകയാണോ? [ദയവായി കാണുക](/docs/event-sources/drivers/).

{{% /pageinfo %}}


## ഡോക്കറിനുള്ളിൽ പ്രവർത്തിപ്പിക്കുന്ന വിധം {#docker}


{{% pageinfo color="primary" %}}

കണ്ടെയ്നർ ഇമേജുകൾ ഉപയോഗിച്ചാലും, ഡ്രൈവർ ശരിയായി നിർമ്മിക്കുന്നതിന് ഫാൽക്കോയ്ക്ക് ഹോസ്റ്റിൽ ഇൻസ്റ്റാൾ ചെയ്തിട്ടുള്ള കേർണൽ ഹെഡറുകൾ ആവശ്യമാണ് (the [kernel module](/docs/event-sources/drivers/#kernel-module) or the [eBPF probe](/docs/event-sources/drivers/#ebpf-probe)). ഒരു പ്രീബിൽറ്റ് ഡ്രൈവർ ഇതിനകം ലഭ്യമാകുമ്പോൾ ഈ ഘട്ടം ആവശ്യമില്ല.

[Install section](/docs/getting-started/installation) എന്നതിന് കീഴിൽ നിങ്ങളുടെ സിസ്റ്റത്തിനായി കേർണൽ തലക്കെട്ടുകൾ എങ്ങനെ ഇൻസ്റ്റാൾ ചെയ്യാമെന്നതിനുള്ള നിർദ്ദേശങ്ങൾ നിങ്ങൾക്ക് കണ്ടെത്താൻ കഴിയും.

{{% /pageinfo %}}

ഫാൽകോ ഒരു കൂട്ടം ഔദ്യോഗിക [docker images](/docs/getting-started/download#images) നൽകുന്നു.
ചിത്രങ്ങൾ‌ ഇനിപ്പറയുന്ന രീതിയിൽ രണ്ട് തരത്തിൽ ഉപയോഗിക്കാൻ‌ കഴിയും:
- [Least privileged (recommended)](#docker-least-privileged)
- [Fully privileged](#docker-privileged)

### ലീസ്റ് പ്രിവിലേജ്ഡ് (ശുപാർശചെയ്യപ്പെടുന്ന ഇൻസ്റ്റാളേഷൻ രീതി) {#docker-least-privileged}

{{% pageinfo color="primary" %}}

നിങ്ങൾക്ക് കേർണൽ 5.8 എങ്കിലും ഇല്ലെങ്കിൽ നിങ്ങൾക്ക് ഇബിപിഎഫ് പ്രോബ് ഡ്രൈവറിൽ കുറഞ്ഞ പ്രിവിലേജ് മോഡ് ഉപയോഗിക്കാൻ കഴിയില്ല.
കാരണം, `bpf` syscall ചെയ്യുന്നതിന് `--privileged` ആവശ്യമാണ്.
നിങ്ങൾ കേർണൽ > = 5.8 പ്രവർത്തിപ്പിക്കുകയാണെങ്കിൽ, സ്റ്റെപ്-2 ലെ ഡോക്കർ റൺ കമാൻഡിലേക്ക് `--cap-add SYS_BPF` നൽകി
കേർണൽ മൊഡ്യൂൾ വിഭാഗം ഇൻസ്റ്റാൾ ചെയ്യുന്നത്  പൂർണ്ണമായും അവഗണിക്കാം.

ഇതിനെക്കുറിച്ചുള്ള കൂടുതൽ വിശദാംശങ്ങൾ നിങ്ങൾക്ക് [ഇവിടെ വായിക്കാം](https://github.com/falcosecurity/falco/issues/1299#issuecomment-653448207).

{{% /pageinfo %}}

ഫാൽക്കോ യൂസർസ്പേസ് പ്രോസസ്സ് ഒരു കണ്ടെയ്നറിൽ പ്രവർത്തിപ്പിക്കുന്നത് ഇങ്ങനെയാണ്.

ഹോസ്റ്റ് സിസ്റ്റത്തിൽ കേർണൽ മൊഡ്യൂൾ നേരിട്ട് ഇൻസ്റ്റാൾ ചെയ്തുകഴിഞ്ഞാൽ, അത് ഒരു കണ്ടെയ്നറിൽ നിന്ന് ഉപയോഗിക്കാൻ കഴിയും.

1. കേർണൽ മൊഡ്യൂൾ ഇൻസ്റ്റാൾ ചെയ്യുക:

    - നിങ്ങൾക്ക് ഹോസ്റ്റിൽ നേരിട്ട് ഒരു ഔദ്യോഗിക [ഇൻസ്റ്റാളേഷൻ രീതി](/docs/getting-started/installation) ഉപയോഗിക്കാം.

    - പകരമായി, ഹോസ്റ്റിൽ ഡ്രൈവർ ഇൻസ്റ്റാളുചെയ്യുന്നതിന് നിങ്ങൾക്ക് ഒരു പ്രത്യേക കണ്ടെയ്നർ ഉപയോഗിക്കാം:

    ```shell
    docker pull falcosecurity/falco-driver-loader:latest
    docker run --rm -i -t \
        --privileged \
        -v /root/.falco:/root/.falco \
        -v /proc:/host/proc:ro \
        -v /boot:/host/boot:ro \
        -v /lib/modules:/host/lib/modules:ro \
        -v /usr:/host/usr:ro \
        -v /etc:/host/etc:ro \
        falcosecurity/falco-driver-loader:latest
    ```


`falcosecurity/falco-driver-loader` ഇമേജ്  `falco-driver-loader` നെ റാപ് ചെയ്ത് ഉൾക്കൊള്ളുന്നു.

അതിന്റെ ഉപയോഗത്തെക്കുറിച്ച് നിങ്ങൾക്ക് കൂടുതൽ [ഇവിടെ](/docs/getting-started/installation#install-driver) കണ്ടെത്താനാകും.

2. [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) ഉപയോഗിച്ച് ഡോക്കർ ഉപയോഗിച്ച് ഒരു കണ്ടെയ്നറിൽ ഫാൽക്കോ പ്രവർത്തിപ്പിക്കുക:

    ```shell
    docker pull falcosecurity/falco-no-driver:latest
    docker run --rm -i -t \
        -e HOST_ROOT=/ \
        --cap-add SYS_PTRACE --pid=host $(ls /dev/falco* | xargs -I {} echo --device {}) \
        -v /var/run/docker.sock:/var/run/docker.sock \
        falcosecurity/falco-no-driver:latest
    ```


{{% pageinfo color="warning" %}}

AppArmor LSM പ്രവർത്തനക്ഷമമാക്കിയ (ഉദാ. ഉബുണ്ടു) ഒരു സിസ്റ്റത്തിൽ നിങ്ങൾ ഫാൽക്കോ പ്രവർത്തിപ്പിക്കുകയാണെങ്കിൽ, മുകളിലുള്ള `ഡോക്കർ റൺ` കമാൻഡീൽ `--security-opt apparmor:unconfined` നൽകി പ്രവർത്തിപ്പിക്കുക.

ചുവടെയുള്ള കമാൻഡ് ഉപയോഗിച്ച് നിങ്ങൾക്ക് AppArmor പ്രാപ്തമാക്കിയിട്ടുണ്ടോ എന്ന് നിങ്ങൾക്ക് പരിശോധിക്കാൻ കഴിയും:

```bash
docker info | grep -i apparmor
```

{{% /pageinfo %}}


{{% pageinfo color="primary" %}}


`ls /dev/falco* | xargs -I {} echo --device {}` ഔട്പുട്ട് ചെയ്യുന്നത് ഓരോ CPU-വിനും ഒരു  `--device /dev/falcoX` ഓപ്ഷൻ ആണ് (ഫാൽകോയുടെ കെർണൽ മൊഡ്യൂൾ നിർമ്മിച്ച ഡിവൈസുകൾ).


Note that `ls /dev/falco* | xargs -I {} echo --device {}` outputs a `--device /dev/falcoX` option per CPU (ie. just the devices created by the Falco's kernel module). ഡിവൈസുകളെ `/host/dev/`-ലേക്ക് വീണ്ടും മാപ് ചെയ്യാൻ മറ്റു മാർഗങ്ങൾ ഇല്ലാത്തതിനാൽ  `-e HOST_ROOT=/` അവശ്യമാണ്.

{{% /pageinfo %}}

### പൂർണ്ണമായും പ്രിവിലേജ്ഡ് {#docker-privileged}

പൂർണ്ണ പദവികളുള്ള ഡോക്കർ ഉപയോഗിച്ച് ഒരു കണ്ടെയ്നറിൽ ഫാൽക്കോ പ്രവർത്തിപ്പിക്കുന്നതിന്:

നിങ്ങൾക്ക് കേർണൽ മൊഡ്യൂൾ ഡ്രൈവറിനൊപ്പം ഫാൽക്കോ ഉപയോഗിക്കാൻ താൽപ്പര്യമുണ്ടെങ്കിൽ:

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest
```

പകരമായി, നിങ്ങൾക്ക് ഇബി‌പി‌എഫ് പ്രോബ് ഡ്രൈവർ ഉപയോഗിക്കാം:

```shell
docker pull falcosecurity/falco:latest
docker run --rm -i -t \
    --privileged \
    -e FALCO_BPF_PROBE="" \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco:latest
```

മറ്റു കോൺഫിഗറബിൾ ഒപ്ഷനുകൾ

- `DRIVER_REPO` - [Installing the driver](https://falco.org/docs/getting-started/installation/#install-driver)  കാണുക.
- `SKIP_DRIVER_LOADER` - `falcosecurity/falco` ഇമേജ് ആരംഭിക്കുമ്പോൾ `falco-driver-loader` പ്രവർത്തിക്കുന്നത് ഒഴിവാക്കാൻ ഈ എൻവയോൺമെന്റ് വേരിയബിൾ സജ്ജമാക്കുക. ഡ്രൈവർ ഇതിനകം ഹോസ്റ്റിൽ മറ്റ് മാർഗങ്ങളിലൂടെ ഇൻസ്റ്റാൾ ചെയ്തിരിക്കുമ്പോൾ ഉപയോഗപ്രദമാണ്.

## ഹോട് റീലോഡ്

ഇത് ഫാൽകോ കോൺഫിഗറേഷൻ വീണ്ടും ലോഡുചെയ്യുകയും pid-നെ ടെർമിനേറ്റ് ചെയ്യാതെ എഞ്ചിൻ പുനരാരംഭിക്കുകയും ചെയ്യും. ഡെമനെ ടെർമിനേറ്റ് ചെയ്യാതെ പുതിയ കോൺഫിഗറേഷൻ മാറ്റങ്ങൾ പ്രചരിപ്പിക്കാൻ ഇത് ഉപയോഗപ്രദമാണ്.


```bash
kill -1 $(cat /var/run/falco.pid)
```
