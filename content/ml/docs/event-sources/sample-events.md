|           ശീർഷകം           | വെയ്റ്റ് |
| :------------------------: | ----- |
| സാമ്പിൾ ഇവൻറുകൾ ജനറേറ്റ് ചെയ്യൽ | 4     |

നിങ്ങൾക്ക് ഫാൽക്കോ ശരിയായി പ്രവർത്തിക്കുന്നുണ്ടോ എന്ന് പരിശോധിക്കണമെന്നുണ്ടെങ്കിൽ, ഞങ്ങളുടെ സിസ്കോൾ, k8s ഓഡിറ്റ് അനുബന്ധനിയമങ്ങൾക്കായി ഒരു പ്രവർത്തനം നടത്താൻ കഴിവുള്ള [`event-generator`](https://github.com/falcosecurity/falco/event-generator)  ഉപകരണം ഞങ്ങളുടെ പക്കലുണ്ട്.

ഉപകരണം ചില അല്ലെങ്കിൽ എല്ലാ സാമ്പിൾ ഇവൻറുകളും റൺ ചെയ്യാനുള്ള ഒരു നിർദ്ദേശം നൽകുന്നു.

```
event-generator run [regexp]
```
ആർഗ്യുമെൻറുകൾ ഇല്ലാതെ ഇത് എല്ലാ പ്രവർത്തനങ്ങളും റൺ ചെയ്യുന്നു, അതല്ലെങ്കിൽ നൽകിയിരിക്കുന്ന പതിവ് എക്സ്പ്രഷനുകളുമായി പൊരുത്തപ്പെടുന്ന പ്രവർത്തനങ്ങൾ മാത്രം.

പൂർണ്ണ കമാൻഡ് ലൈൻ ഡോക്യുമെൻറേഷൻ [here](https://github.com/falcosecurity/event-generator/blob/master/docs/event-generator_run.md) എന്നതിൽ.

## **ഡൌൺലോഡുകൾ** 
| Artifacts     |  | Version |
|------|----------|----------|
| ബൈനറികൾ | [download link](https://github.com/falcosecurity/event-generator/releases/latest) | [![Release](https://img.shields.io/github/release/falcosecurity/event-generator.svg?style=flat-square)](https://github.com/falcosecurity/event-generator/releases/latest) |
| കണ്ടെയ്നർ ചിത്രങ്ങൾ | `docker pull falcosecurity/event-generator:latest` | [![Docker Image Version (latest semver)](https://img.shields.io/docker/v/falcosecurity/event-generator?color=blue&style=flat-square)](https://hub.docker.com/r/falcosecurity/event-generator/tags) |

## **സാമ്പിൾ ഇവൻറുകൾ**

### **സിസ്റ്റം കോൾ പ്രവർത്തനം**

{{% pageinfo color="primary" %}}
**മുന്നറിയിപ്പ്** — ചില കമാൻഡുകൾ നിങ്ങളുടെ സിസ്റ്റത്തിൽ മാറ്റം വരുത്തിയേക്കാമെന്നതിനാൽ, ഡോക്കറിനുള്ളിൽ തന്നെ പ്രോഗ്രാം റൺ ചെയ്യാനായി ഞങ്ങൾ ശക്തമായി ശുപാർശ ചെയ്യുന്നു. ഉദാഹരണത്തിന്, ചില പ്രവർത്തനങ്ങൾ `/bin`, `/etc`, `/dev` തുടങ്ങിയവക്ക് കീഴിൽ ഫയലുകളും ഡയറക്റ്ററികളും പരിഷ്കരിക്കുന്നു.

{{% /pageinfo %}}

`syscall` ശേഖരം, [default Falco ruleset](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml) കണ്ടെത്തുന്ന വ്യത്യസ്ത സംശയ നടപടികൾ നടപ്പിലാക്കുന്നു.

```shell
docker run -it --rm falcosecurity/event-generator run syscall --loop
```

മുകളിലുള്ള കമാൻഡ് ഓരോ സെക്കൻഡിലും ഒരു സാമ്പിൾ ഇവൻറ് ജനറേറ്റ് ചെയ്തുകൊണ്ട് നിർത്താതെ എന്നെന്നേക്കുമായി ലൂപ്പ് ചെയ്യുന്നു. 


### **Kubernetes ഓഡിറ്റിങ് പ്രവർത്തനം**

`k8saudit` ശേഖരം [k8s audit event ruleset](https://github.com/falcosecurity/falco/blob/master/rules/k8s_audit_rules.yaml) എന്നതുമായി പൊരുത്തപ്പെടുന്ന പ്രവർത്തനം ജനറേറ്റ് ചെയ്യുന്നു.


```shell
event-generator run k8saudit --loop
```

നിലവിലുള്ള നെയിംസ്പേസിൽ ഉറവിടങ്ങൾ സൃഷ്ടിച്ചും, ഓരോ ആവർത്തനത്തിന് ശേഷവും അവ ഡിലീറ്റ് ചെയ്തും, മുകളിലുള്ള കമാൻഡ് എന്നെന്നേക്കുമായി ലൂപ്പ് ചെയ്യുന്നു. വ്യത്യസ്ത നെയിംസ്പേസ് തിരഞ്ഞെടുക്കാൻ `--namespace` ഓപ്ഷൻ ഉപയോഗിക്കുക.


## **K8sൽ ഇവൻറ് ജനറേറ്റർ റൺ ചെയ്യൽ**

K8s ക്ലസ്റ്ററുകളിൽ ഇവൻറ് ജനറേറ്റർ റൺ ചെയ്യുന്നത് എളുപ്പമാക്കുന്ന K8s ഉറവിട ഓബ്ജക്റ്റ് ഫയലുകളും ഞങ്ങൾ നൽകിയിട്ടുണ്ട്:

* [`role-rolebinding-serviceaccount.yaml`](https://github.com/falcosecurity/event-generator/blob/master/deployment/role-rolebinding-serviceaccount.yaml) ഒരു സേവനഅക്കൌണ്ട്, ക്ലസ്റ്റർ റോൾ, ഒരു `falco-event-generator` സർവീസ് അക്കൌണ്ട് അനുവദിക്കുന്ന റോൾ എന്നിവ സൃഷ്ടിക്കുന്നു.
* [`event-generator.yaml`](https://github.com/falcosecurity/event-generator/blob/master/deployment/event-generator.yaml) എല്ലാ സാമ്പിൾ ഇവൻറുകളും ഒരു ലൂപ്പിൽ റൺ ചെയ്യുന്ന ഒരു ഡിപ്ലോയ്മെൻറ് സൃഷ്ടിക്കുന്നു.
* [`run-as-job.yaml`](https://github.com/falcosecurity/event-generator/blob/master/deployment/run-as-job.yaml) എല്ലാ സാമ്പിൾ ഇവൻറുകളും ഒരിക്കൽ റൺ ചെയ്യുന്ന ഒരു ജോലി സൃഷ്ടിക്കുന്നു.


ഉദാഹരണത്തിന്, നിങ്ങൾക്ക് നിലവിലെ നെയിംസ്പേസിൽ ആവശ്യമായ ഓബ്ജക്റ്റുകൾ സൃഷ്ടിക്കുന്നതിന് ഇനി പറയുന്നത് റൺ ചെയ്യാനും നിരന്തരമായി ഇവൻറുകൾ ജെനറേറ്റ് ചെയ്യാനും കഴിയും:

```
kubectl apply -f deployment/role-rolebinding-serviceaccount.yaml \
  -f deployment/event-generator.yaml
```

മുകളിലുള്ള കമാൻഡ് ഡീഫോൾട്ട് നെയിംസ്പേസിന് ബാധകമാകുന്നു. വ്യത്യസ്ത നെയിംസ്പേസിൽ വിന്യസിക്കാൻ `--namespace` ഓപ്ഷൻ ഉപയോഗിക്കുക. ഇവൻറുകൾ അതേ നെയിംസ്പേസിൽ തന്നെ ജെനറേറ്റ് ചെയ്യപ്പെടും.

[documentation](https://github.com/falcosecurity/event-generator#with-kubernetes) റെപ്പോസിറ്ററിയിലും നിങ്ങൾക്ക് കൂടുതൽ ഉദാഹരണങ്ങൾ കണ്ടെത്താനാകും.