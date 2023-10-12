---
exclude_search: true
---
|         ശീർഷകം          | വെയ്റ്റ് |
| :---------------------: | :---: |
| Kubernetes ഓഡിറ്റ് ഇവൻറുകൾ |   2   |

പിന്തുണക്കപ്പെട്ട ഇവൻറ് ഉറവിടങ്ങളുടെ ലിസ്റ്റിലേക്ക് ഫാൽക്കോ v0.13.0, [Kubernetes Audit Events](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/#audit-backends) എന്നതിനെ ചേർക്കുന്നു. സിസ്റ്റം കോൾ ഇവൻറുകൾക്കായി നിലവിലുള്ള പിന്തുണക്ക് പുറമെയാണ് ഇത്. ഓഡിറ്റ് ഇവൻറുകളുടെ ഒരു മെച്ചപ്പെട്ട നടപ്പാക്കൽ Kubernetes v1.11 എന്നതിൽ അവതരിപ്പിച്ചിരുന്നു, കൂടാതെ ഇത് [kube-apiserver](https://kubernetes.io/docs/admin/kube-apiserver) എന്നതിനുള്ള അഭ്യർത്ഥനകളുടെയും പ്രതികരണങ്ങളുടെയും ഒരു ലോഗും നൽകുന്നുണ്ട്. മിക്കവാറും എല്ലാ ക്ലസ്റ്റർ മാനേജ്മെൻറ് ടാസ്കുകളും API സർവർ വഴി നടത്തുന്നത് കാരണം, ഓഡിറ്റ് ലോഗിന് നിങ്ങളുടെ ക്ലസ്റ്ററിൽ വരുത്തിയ മാറ്റങ്ങൾ ഫലപ്രദമായി ട്രാക്ക് ചെയ്യാൻ കഴിയും.

ഇതിൻറെ ഉദാഹരണങ്ങളിൽ ഇവ ഉൾപ്പെടുന്നു:

* പോഡുകൾ, സേവനങ്ങൾ, ഡിപ്ലോയ്മെൻറുകൾ, daemonsets തുടങ്ങിയവ നിർമ്മിക്കുകയും നശിപ്പിക്കുകയും ചെയ്യുന്നത്
* ConfigMaps അല്ലെങ്കിൽ രഹസ്യങ്ങൾ നിർമ്മിക്കുകയോ അപ്ഡേറ്റ് ചെയ്യുകയോ നീക്കം ചെയ്യുകയോ ചെയ്യുന്നത്
* ഏതെങ്കിലും എൻഡ്പോയിൻറിൽ അവതരിപ്പിച്ച മാറ്റങ്ങൾ സബ്സ്ക്രൈബ് ചെയ്യുന്നത്

ഈ സാഹചര്യങ്ങൾ കവർ ചെയ്യുന്നതിന്, ശ്രദ്ധേയമായ അല്ലെങ്കിൽ സംശയാസ്പദമായ പ്രവർത്തനങ്ങൾക്ക് വേണ്ടി മേൽനോട്ടം നടത്തുന്ന, ഇനിപ്പറയുന്നവ ഉൾക്കൊള്ളുന്ന ഫാൽക്കോ നിയമങ്ങളുടെ വിശേഷാലുള്ള ഗണം ചേർത്തിട്ടുണ്ട്:

* പ്രത്യേകാവകാശമുള്ള പോഡുകൾ സൃഷ്ടിക്കുക, സെൻസിറ്റീവ് ഹോസ്റ്റ് പാതകൾ മൌണ്ട് ചെയ്യുക,അല്ലെങ്കിൽ ഹോസ്റ്റ് നെറ്റ്വർക്കിങ് ഉപയോഗിക്കുക.
* ഉപയോക്താക്കൾക്ക് `cluster-admin` പോലുള്ള അധികം വിശാലമായ അനുമതികൾ നൽകുക.
* സെൻസിറ്റീവ് വിവരങ്ങൾ ഉപയോഗിച്ച് ConfigMaps സൃഷ്ടിക്കുക.

നിങ്ങളുടെ ക്ലസ്റ്റർ ഓഡിറ്റ് ലോഗിങ് ഉപയോഗിച്ച് ക്രമീകരിക്കുകയും, ഫാൽക്കോയിലേക്ക് അയക്കാനുള്ള ഇവൻറുകൾ തിരഞ്ഞെടുക്കുകയും ചെയ്തുകഴിഞ്ഞാൽ, ഈ ഇവൻറുകളെ വായിക്കാനും സംശയാസ്പദമായ അല്ലെങ്കിൽ മറ്റ് ശ്രദ്ധേയമായ പ്രവർത്തനങ്ങൾക്കായി അറിയിപ്പുകൾ അയക്കാനും കഴിവുള്ള ഫാൽക്കോ നിയമങ്ങൾ നിങ്ങൾക്ക് എഴുതാനാകും.

# **ഫാൽക്കോയിൽ പുതിയതെന്തെല്ലാം**

സംശയാസ്പദമോ ശ്രദ്ധേയമോ ആയ പെരുമാറ്റം തിരിച്ചറിയുന്ന നിയമത്തോടുകൂടിയും, നിയമങ്ങളുടെ ഗണങ്ങളുമായി പൊരുത്തപ്പെടുന്ന ഇവൻറുകളോടുകൂടിയും, ഫാൽക്കോയുടെ മൊത്തത്തിലുള്ള രൂപകൽപ്പന അതേപടി നിലനിൽക്കുന്നു. ഒരെണ്ണം എന്നുള്ളതിന് പകരം, പ്രത്യേകമായി വായിക്കപ്പെടുകയും, നിയമങ്ങളുടെ ഗണങ്ങളുമായി പ്രത്യേകം പൊരുത്തപ്പെടുകയും ചെയ്യുന്ന രണ്ട് സമാന്തരവും സ്വതന്ത്രവുമായ ഇവൻറുകളുടെ സ്ട്രീമുകളാണ് v0.13.0 എന്നതിൽ ഫാൽക്കോ അവതരിപ്പിക്കുന്നത്.

Kubernetes ഓഡിറ്റ് ഇവൻറുകൾ സ്വീകരിക്കുന്നതിന്, ഫാൽക്കോ ക്രമീകരണയോഗ്യമായ ഒരു പോർട്ടിൽ ഒരു ശ്രദ്ധിക്കുന്ന [civetweb](https://github.com/civetweb/civetweb) വെബ് സർവർ ഉൾച്ചേർക്കുകയും,ക്രമീകരണയോഗ്യമായ ഒരു എൻഡ് പോയിൻറിൽ പോസ്റ്റ് അഭ്യർത്ഥനകൾ അംഗീകരിക്കുകയും ചെയ്യുന്നു. ഉൾച്ചേർത്ത വെബ് സർവർ ക്രമീകരിക്കുന്നതിനെ കുറിച്ചുള്ള വിവരങ്ങൾക്കായി [configuration page](https://github.com/falcosecurity/falco-website/blob/master/content/en/configuration) കാണുക. പോസ്റ്റ് ചെയ്ത JSON ഓബ്ജക്റ്റ് ഇവൻറ് ഉൾക്കൊള്ളുന്നു.

ലഭിച്ചിരിക്കുന്ന ഒരു നിയമം സിസ്റ്റം കോൾ ഇവൻറുകളായോ Kubernetes ഓഡിറ്റ് ഇവൻറുകളായോ `source` വിശേഷണം വഴി ബന്ധപ്പെട്ടിരിക്കുന്നു. വ്യക്തമാക്കിയിട്ടില്ലെങ്കിൽ, ഉറവിടം `syscall` എന്നതിലേക്ക് ഡീഫോൾട്ട് ആകുന്നു. `syscall` ഉറവിടമുള്ള നിയമങ്ങൾ സിസ്റ്റം കോൾ ഇവൻറുകളുമായി പൊരുത്തപ്പെട്ടിരിക്കുന്നു. `k8s_audit` ഉറവിടമുള്ള നിയമങ്ങൾ Kubernetes ഓഡിറ്റ് ഇവൻറുകളുമായി പൊരുത്തപ്പെട്ടിരിക്കുന്നു.

ഫാൽക്കോ ഉപയോഗിച്ച് തുടങ്ങുന്നതിന് [Auditing with Falco](https://kubernetes.io/docs/tasks/debug-application-cluster/falco/) കാണുക.

## **നിബന്ധനകളും ഫീൽഡുകളും**

സിസ്റ്റം കോൾ നിയമങ്ങൾ പോലെ, ഓപ്പറേറ്ററുകളും ഇവൻറ് ഫീൽഡുകളും അടിസ്ഥാനമാക്കിയുള്ള ഒരു യുക്തിപരമായ ആവിഷ്കാരമാണ് Kubernetes ഓഡിറ്റ് നിയമങ്ങൾക്കായുള്ള ഒരു വ്യവസ്ഥാ ഫീൽഡ്. ഉദാഹരണം, `ka.user.name`. തന്നിരിക്കുന്ന ഒരു ഇവൻറ് ഫീൽഡ് json ഓബ്ജക്റ്റിൽ നിന്ന് ഒരു പ്രോപ്പർട്ടി മൂല്യം തിരഞ്ഞെടുക്കുന്നു. ഉദാഹരണത്തിന്, `ka.user.name` എന്ന ഫീൽഡ് ആദ്യം Kubernetes ഓഡിറ്റ് ഇവൻറിനുള്ളിൽ നിന്ന് `user` ഓബ്ജക്റ്റിനെ തിരിച്ചറിയുകയും പിന്നെ ആ ഓബ്ജക്റ്റിൻറെ `username` പ്രോപ്പർട്ടി തിരിച്ചറിയുകയും ചെയ്യുന്നു.

Kubernetes ഇവൻറ് അല്ലെങ്കിൽ json ഓബ്ജക്റ്റിൻറെ സാധാരണ പ്രോപ്പർട്ടികൾ ആക്സസസ്സ് ചെയ്യുന്ന ഒരു കൂട്ടം മുൻനിശ്ചയിച്ച ഫീൽഡുകൾ ഫാൽക്കോ ഉൾക്കൊള്ളുന്നു. `falco --list k8s_audit` എന്നതിലൂടെ നിങ്ങൾക്ക് ഫീൽഡുകൾ കാണാനാകും.

മുൻനിശ്ചയിച്ച ഫീൽഡുകളിലൊന്നിനാൽ കവർ ചെയ്യപ്പെടാത്ത, Kubernetes ഇവൻറിൻറെ അല്ലെങ്കിൽ json ഓബ്ജക്റ്റിൻറെ ഒരു പ്രോപ്പർട്ടി മൂല്യം തിരഞ്ഞെടുക്കുന്നതിന്, നിങ്ങൾക്ക് `jevt.value[<json pointer>` എന്നതി ഉപയോഗിക്കാം. ഒരു json ഓബ്ജക്റ്റിൽ നിന്നും ഒരൊറ്റ പ്രോപ്പർട്ടി മൂല്യം തിരഞ്ഞെടുക്കുന്നതിന് നിങ്ങൾ [JSON Pointer](http://rapidjson.org/md_doc_pointer.html) ഉപയോഗിക്കുന്നു.നിങ്ങളുടെ നിയമത്തിൻറെ വ്യവസ്ഥ സൃഷ്ടിക്കുന്നതിന്, Kubernetes ഓഡിറ്റ് ഇവൻറിൽ നിന്ന് സ്വേച്ഛാപരമായ പ്രോപ്പർട്ടി മൂല്യങ്ങൾ തിരഞ്ഞെടുക്കാൻ ഇത് നിങ്ങളെ സഹായിക്കുന്നു. ഉദാഹരണത്തിന്, `ka.username` വേർതിരിച്ചെടുക്കാനുള്ള ഒരു തുല്യമായ മാർഗ്ഗം `jevt.value[/user/username]` എന്നതാണ്.

## **Kubernetes ഓഡിറ്റ് നിയമങ്ങൾ**

Kubernetes ഓഡിറ്റ് ഇവൻറുകൾക്കായി സമർപ്പിച്ചിരിക്കുന്ന നിയമങ്ങൾ [k8s_audit_rules.yaml](https://github.com/falcosecurity/falco/blob/master/rules/k8s_audit_rules.yaml) എന്നതിൽ നൽകിയിരിക്കുന്നു. ഒരു daemon ആയി ഇൻസ്റ്റാൾ ചെയ്യുമ്പോൾ, ഫാൽക്കോ ഈ നിയമഫയലിനെ `/etc/falco/` എന്നതിലേക്ക് ഇൻസ്റ്റാൾ ചെയ്യുന്നു, അങ്ങനെ അവ ഉപയോഗത്തിന് ലഭ്യമാകുന്നു.

## **ഉദാഹരണം**

`k8s_audit_rules.yaml` എന്നതിലെ നിയമങ്ങളിലൊന്ന് ഇനി പറയുന്ന പോലെയാണ്:

```yaml
- list: k8s_audit_stages
  items: ["ResponseComplete"]

# This macro selects the set of Audit Events used by the below rules.
- macro: kevt
  condition: (jevt.value[/stage] in (k8s_audit_stages))

- macro: kmodify
  condition: (ka.verb in (create,update,patch))

- macro: configmap
  condition: ka.target.resource=configmaps

- macro: contains_private_credentials
  condition: >
    (ka.req.configmap.obj contains "aws_access_key_id" or
     ka.req.configmap.obj contains "aws-access-key-id" or
     ka.req.configmap.obj contains "aws_s3_access_key_id" or
     ka.req.configmap.obj contains "aws-s3-access-key-id" or
     ka.req.configmap.obj contains "password" or
     ka.req.configmap.obj contains "passphrase")

- rule: Configmap contains private credentials
  desc: >
     Detect configmap operations with map containing a private credential (aws key, password, etc.)
  condition: kevt and configmap and modify and contains_private_credentials
  output: K8s configmap with private credential (user=%ka.user.name verb=%ka.verb name=%ka.req.configmap.name configmap=%ka.req.configmap.name config=%ka.req.configmap.obj)
  priority: WARNING
  source: k8s_audit
  tags: [k8s]
```

`Configmap contains private credentials` നിയമം,ഒരുപക്ഷേ AWS കീകൾ അല്ലെങ്കിൽ പാസ് വേർഡുകൾ പോലെ ഉപയോഗിച്ച് സെൻസിറ്റീവ് ആയിരിക്കാവുന്ന ഇനങ്ങൾ കൊണ്ട് സൃഷ്ടിച്ച ഒരു ConfigMap ന് വേണ്ടി പരിശോധിക്കുന്നു.

ഇത്തരം സന്ദർഭങ്ങളിൽ നിയമം എങ്ങനെ പ്രവർത്തിക്കുന്നുവെന്ന് നമുക്ക് നോക്കാം. ഈ വിഷയം Kubernetes ഓഡിറ്റ് ലോഗിങ് നിങ്ങളുടെ പരിതസ്ഥിതിയിൽ ക്രമീകരിച്ചിരിക്കുന്നുവെന്ന് അനുമാനിക്കുന്നു.

AWS ക്രെഡൻഷ്യലുകളടങ്ങിയ ഒരു ConfigMap സൃഷ്ടിക്കൂ:

```yaml
apiVersion: v1
data:
  ui.properties: |
    color.good=purple
    color.bad=yellow
    allow.textmode=true
  access.properties: |
    aws_access_key_id = MY-ID
    aws_secret_access_key = MY-KEY
kind: ConfigMap
metadata:
  creationTimestamp: 2016-02-18T18:52:05Z
  name: my-config
  namespace: default
  resourceVersion: "516"
  selfLink: /api/v1/namespaces/default/configmaps/my-config
  uid: b4952dc3-d670-11e5-8cd0-68f728db1985
```

ഈ ConfigMap സൃഷ്ടിക്കുന്നത് ഓഡിറ്റ് ലോഗിലെ ഇനി പറയുന്ന json ഓബ്ജക്റ്റിൽ കൊണ്ടെത്തിക്കുന്നു:

```json
{
  "kind": "Event",
  "apiVersion": "audit.k8s.io/v1beta1",
  "metadata": {
    "creationTimestamp": "2018-10-20T00:18:28Z"
  },
  "level": "RequestResponse",
  "timestamp": "2018-10-20T00:18:28Z",
  "auditID": "33fa264e-1124-4252-af9e-2ce6e45fe07d",
  "stage": "ResponseComplete",
  "requestURI": "/api/v1/namespaces/default/configmaps",
  "verb": "create",
  "user": {
    "username": "minikube-user",
    "groups": [
      "system:masters",
      "system:authenticated"
    ]
  },
  "sourceIPs": [
    "192.168.99.1"
  ],
  "objectRef": {
    "resource": "configmaps",
    "namespace": "default",
    "name": "my-config",
    "uid": "b4952dc3-d670-11e5-8cd0-68f728db1985",
    "apiVersion": "v1"
  },
  "responseStatus": {
    "metadata": {
    },
    "code": 201
  },
  "requestObject": {
    "kind": "ConfigMap",
    "apiVersion": "v1",
    "metadata": {
      "name": "my-config",
      "namespace": "default",
      "selfLink": "/api/v1/namespaces/default/configmaps/my-config",
      "uid": "b4952dc3-d670-11e5-8cd0-68f728db1985",
      "creationTimestamp": "2016-02-18T18:52:05Z"
    },
    "data": {
      "access.properties": "aws_access_key_id = MY-ID\naws_secret_access_key = MY-KEY\n",
      "ui.properties": "color.good=purple\ncolor.bad=yellow\nallow.textmode=true\n"
    }
  },
  "responseObject": {
    "kind": "ConfigMap",
    "apiVersion": "v1",
    "metadata": {
      "name": "my-config",
      "namespace": "default",
      "selfLink": "/api/v1/namespaces/default/configmaps/my-config",
      "uid": "ab04e510-d3fd-11e8-8645-080027728ac4",
      "resourceVersion": "45437",
      "creationTimestamp": "2018-10-20T00:18:28Z"
    },
    "data": {
      "access.properties": "aws_access_key_id = MY-ID\naws_secret_access_key = MY-KEY\n",
      "ui.properties": "color.good=purple\ncolor.bad=yellow\nallow.textmode=true\n"
    }
  },
  "requestReceivedTimestamp": "2018-10-20T00:18:28.420807Z",
  "stageTimestamp": "2018-10-20T00:18:28.428398Z",
  "annotations": {
    "authorization.k8s.io/decision": "allow",
    "authorization.k8s.io/reason": ""
  }
}
```

ConfigMap സ്വകാര്യ ക്രെഡെൻഷ്യലുകൾ ഉൾക്കൊള്ളുമ്പോൾ, നിയമം ഇനി പറയുന്ന ഫീൽഡുകൾ കൊടുത്തിരിക്കുന്ന ക്രമത്തിൽ ഉപയോഗിക്കുന്നു:

1. `kevt`: ഓബ്ജക്റ്റിൻറെ `stage` പ്രോപ്പർട്ടി `k8s_audit_stages` ലിസ്റ്റിൽ ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു.

2. `configmap`: `objectRef > resource` പ്രോപ്പർട്ടിയുടെ മൂല്യം "configmap" എന്നതിന് തുല്യമാണോ എന്ന് പരിശോധിക്കുന്നു.

3. `kmodify`: `verb` എന്നതിൻറെ മൂല്യം ഇനി പറയുന്നവയിൽ ഒന്നാണോ എന്ന് പരിശോധിക്കുന്നു: `create`,`update`,`patch`.

4. `contains-private-credentials`: `contains_private_credentials` മാക്രോയിൽ ഏതെങ്കിലും സെൻസിറ്റീവ് സ്ട്രിങ്ങുകൾ പേരുനൽകിയിട്ടുണ്ടോ എന്നതിനായി `requestObject > data` എന്നതിൽ ConfigMap ഉള്ളടക്കങ്ങൾ തിരയുക.

അവ അങ്ങനെ ചെയ്യുന്നുണ്ടെങ്കിൽ, ഒരു ഫാൽക്കോ ഇവൻറ് ജനറേറ്റ് ചെയ്യപ്പെടുന്നു:

```log
17:18:28.428398080: Warning K8s ConfigMap with private credential (user=minikube-user verb=create configmap=my-config config={"access.properties":"aws_access_key_id = MY-ID\naws_secret_access_key = MY-KEY\n","ui.properties":"color.good=purple\ncolor.bad=yellow\nallow.textmode=true\n"})
```

ഓഡിറ്റ് ഇവൻറിനെ കുറിച്ച് ഇനി പറയുന്നവ ഉൾക്കൊള്ളുന്ന അവശ്യവിവരങ്ങൾ പ്രിൻറ് ചെയ്യാൻ ഔട്ട്പുട്ട് സ്ട്രിങ് ഉപയോഗിക്കുന്നു:

* ഉപയോക്താവ്: `%ka.user.name`
* ക്രിയ: `%ka.verb`
* ConfigMap നാമം: `%ka.req.configmap.name`
* ConfigMap ഉള്ളടക്കങ്ങൾ: `%ka.req.configmap.obj`

## **Kubernetes ഓഡിറ്റ് ലോഗുകൾ പ്രവർത്തനക്ഷമമാക്കൽ**

Kubernetes ഓഡിറ്റ് ലോഗുകൾ പ്രവർത്തനക്ഷമമാക്കുന്നതിന്, നിങ്ങൾ `--audit-policy-file` , --`audit-webhook-config-file` എന്നീ ആർഗ്യുമെൻറുകൾ ചേർക്കാൻ ആർഗ്യുമെൻറുകൾ `kube-apiserver` എന്ന പ്രക്രിയയിലേക്ക് മാറ്റുകയും, ഒരു ഓഡിറ്റ് നയം/ വെബ്ഹുക്ക് ക്രമീകരണം നടപ്പാക്കുന്ന ഫയലുകൾ ലഭ്യമാക്കുകയും വേണം. ഇത് എങ്ങനെ ചെയ്യാമെന്നതിനെ കുറിച്ചുള്ള വിശദമായ വിവരണം നൽകുന്നത് ഫാൽക്കോ ഡോക്യുമെൻറേഷൻറെ പരിധിക്കപ്പുറത്താണ്, പക്ഷേ ഓഡിറ്റ് ലോഗിങ് മിനിക്യൂബിലേക്ക് എങ്ങനെ ചേർക്കുന്നു എന്ന് [example files](https://github.com/falcosecurity/evolution/blob/master/examples/k8s_audit_config/README.md) കാണിച്ചുതരുന്നു. നിയന്ത്രിത Kubernetes ദാതാക്കൾ സാധാരണയായി ഓഡിറ്റ് സിസ്റ്റം ക്രമീകരിക്കുന്നതിനുള്ള ഒരു പ്രവർത്തനവിദ്യ ലഭ്യമാക്കുന്നതാണ്.

> കുറിപ്പ്: ഡൈനാമിക് ഓഡിറ്റ് വെബ്ഹുക്കുകൾ Kubernetes ൽ നിന്നും [remove](https://github.com/kubernetes/kubernetes/pull/91502) ചെയ്തിരിക്കുന്നു. ഏതായാലും, സ്റ്റാറ്റിക് ഓഡിറ്റ് ക്രമീകരണം പ്രവർത്തിക്കുന്നുണ്ട്.
