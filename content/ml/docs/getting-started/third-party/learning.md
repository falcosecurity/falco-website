| ശീർഷകം        | വിവരണം                                              | വെയ്റ്റ് |
| ------------- | --------------------------------------------------- | ----- |
| പഠന പരിതസ്ഥിതി | ഒരു പഠന പരിതസ്ഥിതിയിൽ ഫാൽക്കോ കോറിൽ നിർമ്മിച്ച സംയോജനങ്ങൾ | 2     |


## minikube

ഒരു പ്രാദേശിക പരിതസ്ഥിതിയിൽ Kubernetes ൽ ഏറ്റവും എളുപ്പത്തിൽ ഫാൽക്കോ ഉപയോഗിക്കാനാവുന്നത് [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/) ലാണ്.
ഡീഫോൾട്ട് `--driver` ആർഗ്യുമെൻറുകൾ ഉപയോഗിച്ച് `minikube` റൺ ചെയ്യുമ്പോൾ, വ്യത്യസ്ത Kubernetes സേവനങ്ങൾ പോഡുകൾ റൺ ചെയ്യാനുള്ള കണ്ടെയ്നർ ഫ്രെയിംവർക്ക് തുടങ്ങിയവ റൺ ചെയ്യുന്ന ഒരു VM മിനിക്യൂബ് സൃഷ്ടിക്കുന്നു. സാധാരണയായി,ഫാൽക്കോ കേർണൽ മൊഡ്യൂൾ നേരിട്ട് മിനിക്യൂബ് VM ൽ നിർമ്മിക്കാൻ സാധ്യമല്ല, കാരണം VM ൽ, റൺ ചെയ്യുന്ന കേർണലിനായുള്ള കേർണൽ തലക്കെട്ടുകൾ ഉൾപ്പെടുന്നില്ല.

ഇത് പരിഹരിക്കുന്നതിന്, ഫാൽക്കോ 0.13.1 മുതൽ തുടങ്ങുന്ന, അവസാന 10 മിനിക്യൂബ് വേർഷനുകൾക്കായുള്ള ഒരു മുൻകൂട്ടി നിർമ്മിതമായ കേർണൽ മൊഡ്യൂളുകൾ https://s3.amazonaws.com/download.draios.com എന്നതിൽ ലഭ്യമാണ്.ലോഡ് ചെയ്യാനാകുന്ന ഒരു കേർണൽ മൊഡ്യൂൾ ഉപയോഗിച്ച് തുടരുന്നതിന് ഡൌൺലോഡ് ഫാൾബാക്ക് ഘട്ടത്തെ ഇത് അനുവദിക്കുന്നു.ഓരോ പുതിയ ഫാൽക്കോ റിലീസിനോടുമൊപ്പം, മിനിക്യൂബിൻറെ ഏറ്റവും പുതിയ 10 വേർഷനുകൾ ഫാൽക്കോ ഇപ്പോൾ പിന്തുണക്കുന്നുണ്ട്. നിലവിൽ ഫാൽക്കോ ഡൌൺലോഡ് ചെയ്യാനായി മുൻപ് നിർമ്മിച്ച കേർണൽ മൊഡ്യൂളുകൾ നിലനിർത്തുകയും, പരിമിതമായ ചരിത്രപിന്തുണ ലഭ്യമാക്കുന്നത് തുടരുകയും ചെയ്യുന്നു.
ഇൻസ്റ്റാൾ ചെയ്യാനായി ഔദ്യോഗികമായ [Get Started!](https://minikube.sigs.k8s.io/docs/start/) ഗൈഡ് നിങ്ങൾക്ക് പിന്തുടരാവുന്നതാണ്. [View minikube Get Started! Guide](https://minikube.sigs.k8s.io/docs/start/)

1. കുറിപ്പ്: [kubectl](https://github.com/falcosecurity/falco-website/blob/master/docs/getting-started/third-party/install-tools/#kubectl) ഇൻസ്റ്റാൾ ചെയ്തിട്ടുണ്ട് എന്ന് ഉറപ്പുവരുത്തുക.
ഫാൽക്കോ മിനിക്യൂബിനൊപ്പം സജ്ജമാക്കുന്നതിന്:
    ഒരു VM ഡ്രൈവർ ഉപയോഗിച്ച് മിനിക്യൂബിനൊപ്പം ക്ലസ്റ്റർ സൃഷ്ടിക്കുക

2. എല്ലാ പോഡുകളും റൺ ചെയ്യുന്നുണ്ടോയെന്ന് പരിശോധിക്കുക:

    ```shell
    kubectl get pods --all-namespaces
    ```

3. Helm സങ്കേതത്തിലേക്ക് സ്ഥിരമായ ചാർട്ട് ചേർക്കുക:

    ```shell
    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update
    ```

4.  Helm ഉപയോഗിച്ച് ഫാൽക്കോ ഇൻസ്റ്റാൾ ചെയ്യുക:

    ```shell
    helm install falco falcosecurity/falco
    ```

    ഔട്ട്പുട്ട് ഇനി കൊടുത്തിരിക്കുന്നതിന് സമാനമാണ്:

```
NAME: falco
LAST DEPLOYED: Wed Jan 20 18:24:08 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Falco agents are spinning up on each node in your cluster. After a few
seconds, they are going to start monitoring your containers looking for
security issues.


No further action should be required.


Tip:
You can easily forward Falco events to Slack, Kafka, AWS Lambda and more with falcosidekick.
Full list of outputs: https://github.com/falcosecurity/charts/falcosidekick.
You can enable its deployment with `--set falcosidekick.enabled=true` or in your values.yaml.
See: https://github.com/falcosecurity/charts/blob/master/falcosidekick/values.yaml for configuration values.
```

5. ഫാൽക്കോ റൺ ചെയ്യുന്നുണ്ടെന്ന് ഉറപ്പുവരുത്താൻ ലോഗുകൾ പരിശോധിക്കുക:

    ```shell
    kubectl logs -l app=falco -f
    ```

    ഔട്ട്പുട്ട് ഇനി കൊടുത്തിരിക്കുന്നതിന് സമാനമാണ്:

```
* Trying to dkms install falco module with GCC /usr/bin/gcc-5
DIRECTIVE: MAKE="'/tmp/falco-dkms-make'"
* Running dkms build failed, couldn't find /var/lib/dkms/falco/5c0b863ddade7a45568c0ac97d037422c9efb750/build/make.log (with GCC /usr/bin/gcc-5)
* Trying to load a system falco driver, if present
* Success: falco module found and loaded with modprobe
Wed Jan 20 12:55:47 2021: Falco version 0.27.0 (driver version 5c0b863ddade7a45568c0ac97d037422c9efb750)
Wed Jan 20 12:55:47 2021: Falco initialized with configuration file /etc/falco/falco.yaml
Wed Jan 20 12:55:47 2021: Loading rules from file /etc/falco/falco_rules.yaml:
Wed Jan 20 12:55:48 2021: Loading rules from file /etc/falco/falco_rules.local.yaml:
Wed Jan 20 12:55:49 2021: Starting internal webserver, listening on port 8765
```

## kind

നിങ്ങളുടെ പ്രാദേശിക കമ്പ്യൂട്ടറിൽ Kubernetes റൺ ചെയ്യാൻ [`kind`](https://kind.sigs.k8s.io/docs/) നിങ്ങളെ അനുവദിക്കുന്നു. നിങ്ങൾ [Docker](https://docs.docker.com/get-docker/) ഇൻസ്റ്റാൾ ചെയ്ത് ക്രമീകരിക്കേണ്ടത് ഈ ഉപകരണത്തിന് ആവശ്യമാണ്. നിലവിൽ Linuxkit ഉപയോഗിച്ച് മാക്കിൽ നേരിട്ട് പ്രവർത്തിക്കുന്നില്ല, പക്ഷേ ഈ ആദേശങ്ങൾ `kind` ഉപയോഗിച്ച് ലിനക്സ് ഗസ്റ്റ് OS ൽ റൺ ചെയ്യും.

Kind ഉപയോഗിച്ച് പ്രവർത്തിക്കാൻ എന്തൊക്കെ ചെയ്യേണ്ടതുണ്ടെന്ന് Kind [Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/) നിങ്ങൾക്ക് കാണിച്ചുതരും.
[View kind Quick Start Guide](https://kind.sigs.k8s.io/docs/user/quick-start/)
ഒരു `kind` ക്ലസ്റ്ററിൽ ഫാൽക്കോ റൺ ചെയ്യുന്നത് ഇനിപ്പറയുന്നപോലെയാണ്:

1. ഒരു ക്രമീകരണ ഫയൽ സൃഷ്ടിക്കുക. ഉദാഹരണം: `kind-config.yaml`

2. ഇനി പറയുന്നത് ഫയലിൽ ചേർക്കുക:

    ```yaml
    kind: Cluster
    apiVersion: kind.x-k8s.io/v1alpha4
    nodes:
    - role: control-plane
      extraMounts:
        # allow Falco to use devices provided by the kernel module
      - hostPath: /dev
        containerPath: /dev
        # allow Falco to use the Docker unix socket
      - hostPath: /var/run/docker.sock
        containerPath: /var/run/docker.sock
    ```

3. ക്രമീകരണ ഫയൽ വ്യക്തമാക്കിക്കൊണ്ട് ക്ലസ്റ്റർ സൃഷ്ടിക്കുക:

    ```shell
    kind create cluster --config=./kind-config.yaml
    ```

4. Kind ക്ലസ്റ്ററിലെ ഒരു നോഡിൽ ഫാൽക്കോ [Install](https://github.com/falcosecurity/falco-website/blob/master/docs/getting-started/installation) ചെയ്യുക. ഒരു Kubernetes ക്ലസ്റ്ററിൽ ഒരു ഡെയ്മൺസെറ്റായി ഫാൽക്കോ ഇൻസ്റ്റാൾ ചെയ്യാൻ Helm ഉപയോഗിക്കുക. ഫാൽക്കോ ചാർട്ടുകളുടെ ക്രമീകരണത്തിനെ കുറിച്ചുള്ള കൂടുതൽ വിവരങ്ങൾക്ക്, https://github.com/falcosecurity/charts/tree/master/falco കാണുക.

## MicroK8s

MicroK8s ഏറ്റവും ചെറുതും ഏറ്റവും വേഗതയുള്ളതുമായ മൾട്ടി-നോഡ് Kubernetes ആണ്. ലിനക്സ്, വിൻഡോസ്, മാക് എന്നിവയിൽ പ്രവർത്തിക്കുന്ന ഒരൊറ്റ പാക്കേജുള്ള പൂർണ്ണമായും അനുരൂപമായ ഭാരം കുറഞ്ഞ Kubernetes.
ഇൻസ്റ്റാൾ ചെയ്യാനായി ഔദ്യോഗികമായ [Getting Started](https://microk8s.io/docs) ഗൈഡ് നിങ്ങൾക്ക് പിന്തുടരാവുന്നതാണ്.

[View MicroK8s Getting Started Guide](https://microk8s.io/docs)

MicroK8s ൽ ഫാൽക്കോ റൺ ചെയ്യാനായി:

1. MicroK8s ക്ലസ്റ്ററിലെ ഒരു നോഡിൽ ഫാൽക്കോ [Install](https://github.com/falcosecurity/falco-website/blob/master/docs/getting-started/installation) ചെയ്യുക. ഒരു Kubernetes ക്ലസ്റ്ററിൽ ഒരു ഡെയ്മൺസെറ്റായി ഫാൽക്കോ ഇൻസ്റ്റാൾ ചെയ്യാൻ Helm ഉപയോഗിക്കുക. ഫാൽക്കോ ചാർട്ടുകളുടെ ക്രമീകരണത്തിനെ കുറിച്ചുള്ള കൂടുതൽ വിവരങ്ങൾക്ക്, https://github.com/falcosecurity/charts/tree/master/falco കാണുക.
