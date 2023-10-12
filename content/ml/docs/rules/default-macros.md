---
exclude_search: true
---
|     ശീർഷകം      | വെയ്റ്റ് |
| :-------------: | :---: |
| ഡീഫോൾട്ട് മാക്രോകൾ |   2   |

ഡീഫോൾട്ട് ഫാൽക്കോ നിയമഗണം, നിയമങ്ങൾ എഴുതാൻ തുടങ്ങുന്നത് എളുപ്പമാക്കുന്ന  നിരവധി മാക്രോകളെ നിർവചിക്കുന്നു. ഈ മാക്രോകൾ ഒരു കൂട്ടം സാധാരണ സന്ദർഭങ്ങൾക്കായുള്ള ഷോർട്ട്കട്ടുകൾ ലഭ്യമാക്കുന്നു, കൂടാതെ അവ ഏതൊരു ഉപയോക്തൃനിർവചിതമായ നിയമഗണങ്ങളിലും ഉപയോഗ്യവുമാണ്. ഉപയോക്താവിൻറെ പരിതസ്ഥിതിക്ക് പ്രത്യേകമായുള്ള ക്രമീകരണങ്ങൾ ലഭ്യമാക്കുന്നതിന് ഉപയോക്താവിനാൽ ഓവർറൈഡ് ചെയ്യപ്പെടേണ്ട മാക്രോകളും ഫാൽക്കോ പ്രദാനം ചെയ്യുന്നു. ലഭ്യമായിട്ടുള്ള മാക്രോകളെ  ഒരു പ്രാദേശിക നിയമഫയലിലേക്കും കൂട്ടിച്ചേർക്കാവുന്നതാണ്.

### എഴുതാനായി തുറന്ന ഫയലുകൾ

```yaml
- macro: open_write
  condition: (evt.type=open or evt.type=openat), evt.is_open_write=true, fd.typechar='f', fd.num>=0 എന്നിവ
```

### വായിക്കാനായി തുറന്ന ഫയലുകൾ

```yaml
- macro: open_read
  condition: (evt.type=open or evt.type=openat), evt.is_open_read=true, fd.typechar='f', fd.num>=0 
```

### Never True

```yaml
- macro: never_true
  condition: (evt.num=0)
```

### Always True

```yaml
- macro: always_true
  condition: (evt.num=>0)
```

### Proc നാമം സജ്ജീകരിച്ചിരിക്കുന്നു

```yaml
- macro: proc_name_exists
  condition: (proc.name!="<NA>")
```

### ഫയൽ സിസ്റ്റം ഓബ്ജക്റ്റ് പുനർനാമകരണം ചെയ്തിരിക്കുന്നു

```yaml
- macro: rename
  condition: evt.type in (rename, renameat)
```

### പുതിയ ഡയറക്റ്ററി നിർമ്മിച്ചിരിക്കുന്നു

```yaml
- macro: mkdir
  condition: evt.type = mkdir
```

### ഫയൽ സിസ്റ്റം ഓബ്ജക്റ്റ് നീക്കം ചെയ്തിരിക്കുന്നു

```yaml
- macro: remove
  condition: evt.type in (rmdir, unlink, unlinkat)
```

### ഫയൽ സിസ്റ്റം ഓബ്ജക്റ്റ് നവീകരിച്ചിരിക്കുന്നു

```yaml
- macro: modify
  condition: rename or remove
```

### പുതിയ പ്രക്രിയ സ്പോൺ ചെയ്തിരിക്കുന്നു

```yaml
- macro: spawned_process
  condition: evt.type = execve and evt.dir=<
```

### ബൈനറികൾക്കുള്ള പൊതുഡയറക്റ്ററികൾ

```yaml
- macro: bin_dir
  condition: fd.directory in (/bin, /sbin, /usr/bin, /usr/sbin)
```

### ഷെൽ ആരംഭിച്ചിരിക്കുന്നു

```yaml
- macro: shell_procs
  condition: (proc.name in (shell_binaries))
```

### അറിയപ്പെടുന്ന സെൻസിറ്റീവ് ഫയലുകൾ

```yaml
- macro: sensitive_files
  condition: >
    fd.name startswith /etc and
    (fd.name in (sensitive_file_names)
     or fd.directory in (/etc/sudoers.d, /etc/pam.d))
```

### പുതിയതായി നിർമ്മിച്ച പ്രക്രിയ

```yaml
- macro: proc_is_new
  condition: proc.duration <= 5000000000
```

### ഇൻബൌണ്ട് നെറ്റ്വർക്ക് കണക്ഷനുകൾ

```yaml
- macro: inbound
  condition: >
    (((evt.type in (accept,listen) and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### ഔട്ട്ബൌണ്ട് നെറ്റ്വർക്ക് കണക്ഷനുകൾ

```yaml
- macro: outbound
  condition: >
    (((evt.type = connect and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### ഇൻബൌണ്ട് അഥവാ ഔട്ട്ബൌണ്ട് നെറ്റ്വർക്ക് കണക്ഷനുകൾ

```yaml
- macro: inbound_outbound
  condition: >
    (((evt.type in (accept,listen,connect) and evt.dir=<)) or
     (fd.typechar = 4 or fd.typechar = 6) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

### ഓബ്ജക്റ്റ് ഒരു കണ്ടെയ്നർ ആണ്

```yaml
- macro: container
  condition: container.id != host
```

### ഇൻററാക്റ്റീവ് പ്രക്രിയ സേപോൺ ചെയ്തിരിക്കുന്നു

```yaml
- macro: interactive
  condition: >
    ((proc.aname=sshd and proc.name != sshd) or
    proc.name=systemd-logind or proc.name=login)
```

## ഓവർറൈഡ് ചെയ്യാനുള്ള മാക്രോസ്

താഴെയുള്ള മാക്രോകൾ ഉപയോക്താവിന് പ്രത്യേകമായുള്ള പരിതസ്ഥിതിക്കായി ഓവർറൈഡ് ചെയ്യാൻ കഴിയുന്ന മൂല്യങ്ങൾ ഉൾക്കൊള്ളുന്നു.

### സാധാരണ SSH പോർട്ട്

SSH സേവനങ്ങൾ ലഭ്യമാക്കുന്ന നിങ്ങളുടെ പരിതസ്ഥിതിയിൽ പോർട്ടുകൾ പ്രതിഫലിപ്പിക്കാൻ ഈ മാക്രോ ഓവർറൈഡ് ചെയ്യുക.

```yaml
- macro: ssh_port
  condition: fd.sport=22
```

### അനുവദിച്ചിട്ടുള്ള SSH ഹോസ്റ്റുകൾ

അറിയപ്പെടുന്ന SSH പോർട്ടുകൾ ബന്ധിപ്പിക്കാനാകുന്ന ഹോസ്റ്റുകളെ പ്രതിഫലിപ്പിക്കാൻ ഈ മാക്രോ ഓവർറൈഡ് ചെയ്യുക (ഉദാ: ഒരു ബാസ്റ്റ്യൺ അല്ലെങ്കിൽ ജമ്പ് ബോക്സ് ).

```yaml
- macro: allowed_ssh_hosts
  condition: ssh_port
```

### യൂസർ വൈറ്റ്ലിസ്റ്റഡ് കണ്ടെയ്നറുകൾ

പ്രിവിലേജ്ഡ് മോഡിൽ റൺ ചെയ്യാൻ അനുമതിയുള്ള വൈറ്റ്ലിസ്റ്റ് കണ്ടെയ്നറുകൾ.

```yaml
- macro: user_trusted_containers
  condition: (container.image startswith sysdig/agent)
```

### ഷെല്ലുകൾ സ്പോൺ ചെയ്യാൻ അനുമതിയുള്ള കണ്ടെയ്നറുകൾ

കണ്ടെയ്നറുകൾ CI/CD പൈപ്പ്ലൈനിലാണ് ഉപയോഗിക്കുന്നതെങ്കിൽ ആവശ്യം വന്നേക്കാവുന്ന ഷെല്ലുകൾ സ്പോൺ ചെയ്യാൻ അനുമതിയുള്ള കണ്ടെയ്നറുകൾ.

```yaml
- macro: user_shell_container_exclusions
  condition: (never_true)
```

### EC2 മെറ്റാഡാറ്റ സേവനങ്ങളുമായി ആശയവിനിമയം നടത്താൻ അനുമതിയുള്ള കണ്ടെയ്നറുകൾ

EC2 മെറ്റാഡാറ്റ സേവനങ്ങളുമായി ആശയവിനിമയം നടത്താൻ അനുമതിയുള്ള വൈറ്റ്ലിസ്റ്റ് കണ്ടെയ്നറുകൾ. ഡീഫോൾട്ട്: ഏതെങ്കിലും കണ്ടെയ്നർ.

```yaml
- macro: ec2_metadata_containers
  condition: container
```

### Kubernetes API സർവർ

Kubernetes API സേവനത്തിൻറെ IP ഇവിടെ സജ്ജീകരിക്കുക.

```yaml
- macro: k8s_api_server
  condition: (fd.sip="1.2.3.4" and fd.sport=8080)
```

### Kubernetes APIയുമായി ആശയവിനിമയം നടത്താൻ അനുമതിയുള്ള കണ്ടെയ്നറുകൾ

Kubernetes API സേവനവുമായി ആശയവിനിമയം നടത്താൻ അനുമതിയുള്ള വൈറ്റ്ലിസ്റ്റ് കണ്ടെയ്നറുകൾ. k8s_api_സർവർ സജ്ജീകരിക്കുന്നത് ആവശ്യമാണ് .

```yaml
- macro: k8s_containers
  condition: >
    (container.image startswith gcr.io/google_containers/hyperkube-amd64 or
    container.image startswith gcr.io/google_containers/kube2sky or
    container.image startswith sysdig/agent or
    container.image startswith sysdig/falco or
    container.image startswith sysdig/sysdig)
```

### Kubernetes സേവന നോഡ്പോർട്ടുകളുമായി ആശയവിനിമയം നടത്താൻ അനുമതിയുള്ള കണ്ടെയ്നറുകൾ

```yaml
- macro: nodeport_containers
  condition: container
```
