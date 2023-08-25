---
title: "Kubernetes Response Engine, Part 2: Falcosidekick + OpenFaas"
date: 2021-04-11
author: Batuhan Apaydın
slug: falcosidekick-response-engine-part-2-openfaas
tags: ["Falcosidekick","Integration"]
aliases:
  - /blog/falcosidekick-openfaas/
  - /blog/falcosidekick-reponse-engine-part-2-openfaas/
---

> *This blog post is part of a series of articles about how to create a `Kubernetes` response engine with `Falco`, `Falcosidekick` and a `FaaS`.*
> 
> See other posts:
> * [Kubernetes Response Engine, Part 1 : Falcosidekick + Kubeless]({{< ref "/blog/falcosidekick-response-engine-part-1-kubeless" >}})
> * [Kubernetes Response Engine, Part 3 : Falcosidekick + Knative]({{< ref "/blog/falcosidekick-response-engine-part-3-knative" >}})
> * [Kubernetes Response Engine, Part 4 : Falcosidekick + Tekton]({{< ref "/blog/falcosidekick-response-engine-part-4-tekton" >}})
> * [Kubernetes Response Engine, Part 5 : Falcosidekick + Argo]({{< ref "/blog/falcosidekick-response-engine-part-5-argo" >}})
> * [Kubernetes Response Engine, Part 6 : Falcosidekick + Cloud Run]({{< ref "/blog/falcosidekick-response-engine-part-6-cloud-run" >}})
> * [Kubernetes Response Engine, Part 7: Falcosidekick + Cloud Functions]({{< ref "/blog/falcosidekick-response-engine-part-7-cloud-functions" >}})

----

We recently talked about a concept called _"Kubernetes Response Engine"_, and we achieved this by using `Falco`
+ `Falcosidekick` + `Kubeless`. But as you might guess, `Falcosidekick` project is evolving day after day, which means
new outputs are added. With the release [`2.22.0`](https://github.com/falcosecurity/falcosidekick/releases/tag/2.22.0),
we are proud to support [`OpenFaaS`](https://www.openfaas.com) as a new output for _Falcosidekick_. This allows us to
achieve the same concept, _"Kubernetes Response Engine"_, but this time by using _"OpenFaaS"_ instead of _"Kubeless"_.

In this blog post, we will explain the basic concepts for integrating your own Response Engine into K8S with the
stack `Falco` + `Falcosidekick` + `OpenFaaS`.

## Prerequisites

We need tools with the following minimum versions to achieve this demo:

* Minikube v1.19.0
* Helm v3.5.3
* kubectl v1.21.0
* arkade v0.7.13
* faas-cli v0.13.9

### Provision local Kubernetes Cluster

There are various ways to provision a local Kubernetes cluster such as, KinD, k3s, k0s, Minikube etc. We are going to
use Minikube in this walkthrough.

Let's get provisioned a local Kubernetes cluster:

```shell
$ minikube start --cpus 3 --memory 8192 --vm-driver virtualbox
😄  minikube v1.19.0 on Darwin 10.15.7
✨  Using the virtualbox driver based on user configuration
👍  Starting control plane node minikube in cluster minikube
🔥  Creating virtualbox VM (CPUs=3, Memory=8192MB, Disk=20000MB) ...
🐳  Preparing Kubernetes v1.20.2 on Docker 20.10.4 ...
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

## Install OpenFaaS

OpenFaaS can be deployed into a variety of container orchestrators like Kubernetes, OpenShift, Docker Swarm or into a
single host with faasd.

Follow the official documentation
for [deploying OpenFaaS to Kubernetes](https://docs.openfaas.com/deployment/kubernetes/).

The fastest option is the tool called [arkade](https://github.com/alexellis/arkade) to deploy OpenFaaS:

```shell
$ arkade install openfaas
Using Kubeconfig: /Users/batuhan.apaydin/.kube/config
Client: x86_64, Darwin
2021/04/10 21:39:29 User dir established as: /Users/batuhan.apaydin/.arkade/
"openfaas" already exists with the same configuration, skipping

Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "falcosecurity" chart repository
...Successfully got an update from the "openfaas" chart repository
Update Complete. ⎈Happy Helming!⎈

VALUES values.yaml
Command: /Users/batuhan.apaydin/.arkade/bin/helm [upgrade --install openfaas openfaas/openfaas --namespace openfaas --values /var/folders/pf/6h9t0mnd4d342ncgpjq_3zl80000gp/T/charts/openfaas/values.yaml --set queueWorker.replicas=1 --set queueWorker.maxInflight=1 --set clusterRole=false --set operator.create=false --set faasnetes.imagePullPolicy=Always --set basicAuthPlugin.replicas=1 --set gateway.replicas=1 --set gateway.directFunctions=false --set openfaasImagePullPolicy=IfNotPresent --set ingressOperator.create=false --set basic_auth=true --set serviceType=NodePort]
Release "openfaas" does not exist. Installing it now.
NAME: openfaas
LAST DEPLOYED: Sat Apr 10 21:39:37 2021
NAMESPACE: openfaas
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
To verify that openfaas has started, run:

  kubectl -n openfaas get deployments -l "release=openfaas, app=openfaas"
=======================================================================
= OpenFaaS has been installed.                                        =
=======================================================================

# Get the faas-cli
curl -SLsf https://cli.openfaas.com | sudo sh

# Forward the gateway to your machine
kubectl rollout status -n openfaas deploy/gateway
kubectl port-forward -n openfaas svc/gateway 8080:8080 &

# If basic auth is enabled, you can now log into your gateway:
PASSWORD=$(kubectl get secret -n openfaas basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode; echo)
echo -n $PASSWORD | faas-cli login --username admin --password-stdin

faas-cli store deploy figlet
faas-cli list

# For Raspberry Pi
faas-cli store list \
 --platform armhf

faas-cli store deploy figlet \
 --platform armhf

# Find out more at:
# https://github.com/openfaas/faas

Thanks for using arkade!
```

Check if everything is working before moving onto the next step:

```shell
$ kubectl get pods --namespace openfaas
NAME                                 READY   STATUS    RESTARTS   AGE
alertmanager-74f9b48464-7gvrj        1/1     Running   0          2m13s
basic-auth-plugin-54bbd886f5-fclgn   1/1     Running   0          2m13s
gateway-6f8f5d5c87-tbxns             2/2     Running   0          2m13s
nats-695bf7587-hcbc2                 1/1     Running   0          2m13s
prometheus-577c65f58c-4nvm7          1/1     Running   0          2m13s
queue-worker-b45b85966-g7kpt         1/1     Running   0          2m13s
```

Now, it is time to deploy our function. The function we are going to deploy basically receives events for an infected
pod from the _Falcosidekick_ and deletes it immediately. Before deploying the function we need some
permissions to delete Pod. We create a `ServiceAccount` with right to delete a Pod in any namespace, and we'll associate
it to our function:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: falco-pod-delete
  namespace: openfaas-fn
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: falco-pod-delete-cluster-role
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "delete"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: falco-pod-delete-cluster-role-binding
roleRef:
  kind: ClusterRole
  name: falco-pod-delete-cluster-role
  apiGroup: rbac.authorization.k8s.io
subjects:
  - kind: ServiceAccount
    name: falco-pod-delete
    namespace: openfaas-fn
EOF
```

Now, we are ready to deploy our _falco-pod-delete_ function, log in into _OpenFaaS Gateway_ first:

```shell
$ kubectl port-forward -n openfaas svc/gateway 8080:8080 &
$  PASSWORD=$(kubectl get secret -n openfaas basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode; echo)
$echo -n $PASSWORD | faas-cli login --username admin --password-stdin
Calling the OpenFaaS server to validate the credentials...
credentials saved for admin http://127.0.0.1:8080
```

## Install Falco + Falcosidekick

Firstly, we'll create the namespace that will host both `Falco` and `Falcosidekick`:

```shell
$ kubectl create namespace falco
```

We add the `helm` repo:

```shell
$ helm repo add falcosecurity https://falcosecurity.github.io/charts
"falcosecurity" has been added to your repositories
$ helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "falcosecurity" chart repository
...Successfully got an update from the "openfaas" chart repository
Update Complete. ⎈Happy Helming!⎈
```

In a real project, you should get the whole chart with `helm pull falcosecurity/falco --untar` and then configure
the `values.yaml`. For this tutorial, will try to keep thing as easy as possible and set configs directly
by passing arguments to `helm install` command line:

```shell
$ helm upgrade --install falco falcosecurity/falco --namespace falco \
--set falcosidekick.enabled=true \
--set falcosidekick.config.openfaas.functionname="falco-pod-delete"
```

You should get this output:

```shell
Release "falco" does not exist. Installing it now.
NAME: falco
LAST DEPLOYED: Tue Apr 13 10:49:49 2021
NAMESPACE: falco
STATUS: deployed
REVISION: 1
NOTES:
Falco agents are spinning up on each node in your cluster. After a few
seconds, they are going to start monitoring your containers looking for
security issues.


No further action should be required.
```

And you can see your new `Falco` and `Falcosidekick`pods:

```shell
$ kubectl get pods --namespace falco
NAME                                   READY   STATUS    RESTARTS   AGE
falco-falcosidekick-7779579477-mwsb4   1/1     Running   0          67s
falco-falcosidekick-7779579477-n5v89   1/1     Running   0          67s
falco-p97rw                            1/1     Running   0          67s
```

The argument `falcosidekick.enabled=true` sets the following settings in _Falco_ for you:

```shell
--set falco.jsonOutput=true \
--set falco.httpOutput.enabled=true \
--set falco.httpOutput.url=http://falco-falcosidekick:2801
```

The
arguments `--set falco.jsonOutput=true --set falco.httpOutput.enabled=true --set falco.httpOutput.url=http://falco-falcosidekick:2801`
are there to configure the format of events and the URL where `Falco` will send them. As `Falco` and `Falcosidekick` will
be in the same namespace, it can directly use the name of the service (`falco-falcosidekick`) above `Falcosidekick` pods.

We check the logs:

```shell
$ kubectl logs deployment/falco-falcosidekick -n falco
Found 2 pods, using pod/falcosidekick-5c696d7fd8-9bnnj
2021/04/10 19:21:55 [INFO]  : Enabled Outputs : [OpenFaaS]
2021/04/10 19:21:55 [INFO]  : Falco Sidekick is up and listening on :2801
````

`OpenFaaS` is displayed as enabled output, everything is good 👍.

## Install our OpenFaaS function

Our really basic function will receive events from `Falco` thanks to `Falcosidekick`, check if the triggered rule is *
[Terminal Shell in container*](https://github.com/falcosecurity/falco/blob/0d7068b048772b1e2d3ca5c86c30b3040eac57df/rules/falco_rules.yaml#L2063)
, extract the *namespace* and *pod name* from the fields of events and delete the according pod:

Basically, the process is:

```shell
           +----------+                 +---------------+                    +----------+
           |  Falco   +-----------------> Falcosidekick +--------------------> OpenFaaS |
           +----^-----+   sends event   +---------------+      triggers      +-----+----+
                |                                                                  |
detects a shell |                                                                  |
                |                                                                  |
           +----+-------+                                   deletes                |
           | Pwned Pod  <----------------------------------------------------------+
           +------------+
```

Let's create the function and deploy it:

```
$ faas-cli template store pull golang-middleware
Fetch templates from repository: https://github.com/openfaas/golang-http-template at
2021/04/10 21:56:34 Attempting to expand templates from https://github.com/openfaas/golang-http-template
2021/04/10 21:56:35 Fetched 2 template(s) : [golang-http golang-middleware] from https://github.com/openfaas/golang-http-template


$ tree -L 2 .
.
└── template
    ├── golang-http
    └── golang-middleware

# Don't forget to set your docker id in the prefix section, mine is devopps.
$ faas-cli new falco-pod-delete --lang golang-middleware --prefix devopps
faas-cli new falco-pod-delete --lang golang-middleware --prefix devopps
Folder: falco-pod-delete created.
  ___                   _____           ____
 / _ \ _ __   ___ _ __ |  ___|_ _  __ _/ ___|
| | | | '_ \ / _ \ '_ \| |_ / _` |/ _` \___ \
| |_| | |_) |  __/ | | |  _| (_| | (_| |___) |
 \___/| .__/ \___|_| |_|_|  \__,_|\__,_|____/
      |_|


Function created in folder: falco-pod-delete
Stack file written: falco-pod-delete.yml

Notes:
You have created a new function which uses Golang 1.13.

To include third-party dependencies, use Go modules and use
"--build-arg GO111MODULE=on" with faas-cli build or configure this
via your stack.yml file.

See more: https://docs.openfaas.com/cli/templates/
For detailed examples:
https://github.com/openfaas-incubator/golang-http-template


$ tree -L 2 .
.
├── falco-pod-delete
│ └── handler.go
├── falco-pod-delete.yml
└── template
    ├── golang-http
    └── golang-middleware
```

First, replace the _falco-pod-delete.yml_ with the following content:

```yaml
version: 1.0
provider:
  name: openfaas
  gateway: http://127.0.0.1:8080
functions:
  falco-pod-delete:
    lang: golang-middleware
    handler: ./falco-pod-delete
    image: devopps/falco-pod-delete:latest # be careful this line, it should be your docker id.
    annotations:
      com.openfaas.serviceaccount: falco-pod-delete
    build_args:
      GO111MODULE: on
```

Once you have edited it, let's continue with the code, create a `go.mod`.

```
$ cd falco-pod-delete
$ go mod init falco-pod-delete
go: creating new go.mod: module falco-pod-delete
go: to add module requirements and sums:
        go mod tidy
```

Then, replace the `handler.go` with the following content:

```golang
package function

import (
  "context"
  "encoding/json"
  "io/ioutil"
  "log"
  "net/http"
  "time"

  metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
  "k8s.io/client-go/kubernetes"
  "k8s.io/client-go/rest"
)

var kubeClient *kubernetes.Clientset

func init() {

  // creates the in-cluster config
  config, err := rest.InClusterConfig()
  if err != nil {
    panic(err.Error())
  }
  // creates the clientset
  kubeClient, err = kubernetes.NewForConfig(config)
  if err != nil {
    panic(err.Error())
  }
}

type Alert struct {
  Output       string    `json:"output"`
  Priority     string    `json:"priority"`
  Rule         string    `json:"rule"`
  Time         time.Time `json:"time"`
  OutputFields struct {
    ContainerID              string      `json:"container.id"`
    ContainerImageRepository interface{} `json:"container.image.repository"`
    ContainerImageTag        interface{} `json:"container.image.tag"`
    EvtTime                  int64       `json:"evt.time"`
    FdName                   string      `json:"fd.name"`
    K8SNsName                string      `json:"k8s.ns.name"`
    K8SPodName               string      `json:"k8s.pod.name"`
    ProcCmdline              string      `json:"proc.cmdline"`
  } `json:"output_fields"`
}

var CriticalNamespaces = []string{"kube-system", "kube-public", "kube-node-lease", "falco", "openfaas", "openfaas-fn"}

func Handle(w http.ResponseWriter, r *http.Request) {
  var alert Alert

  if r.Body != nil {
    defer r.Body.Close()

    body, _ := ioutil.ReadAll(r.Body)

    json.Unmarshal(body, &alert)

    podName := alert.OutputFields.K8SPodName
    namespace := alert.OutputFields.K8SNsName
    
    var critical bool
    for _ , ns := range CriticalNamespaces {
        if ns == namespace {
            critical = true
            break
        }
    }

    if !critical {
      log.Printf("Deleting pod %s from namespace %s", podName, namespace)
      kubeClient.CoreV1().Pods(namespace).Delete(context.Background(), podName, metaV1.DeleteOptions{})
    }
  }

  w.WriteHeader(http.StatusOK)
  w.Write([]byte("OK"))
}
```

After that, update your _Go Modules_ by doing `go mod tidy`:

```shell
$ go mod tidy
go: finding module for package k8s.io/client-go/rest
go: finding module for package k8s.io/apimachinery/pkg/apis/meta/v1
go: finding module for package k8s.io/client-go/kubernetes
go: downloading k8s.io/client-go v0.21.0
go: downloading k8s.io/apimachinery v0.21.0
go: found k8s.io/apimachinery/pkg/apis/meta/v1 in k8s.io/apimachinery v0.21.0
go: found k8s.io/client-go/kubernetes in k8s.io/client-go v0.21.0
go: found k8s.io/client-go/rest in k8s.io/client-go v0.21.0
go: downloading k8s.io/api v0.21.0
go: downloading golang.org/x/net v0.0.0-20210224082022-3d97a244fca7
go: downloading sigs.k8s.io/structured-merge-diff/v4 v4.1.0
go: downloading golang.org/x/term v0.0.0-20210220032956-6a3ed077a48d
```

Now, you should be able to build, push and deploy your function with `faas-cli`:

```shell
$ cd ..
$ faas-cli up -f falco-pod-delete.yml
[0] > Building falco-pod-delete.
Clearing temporary build folder: ./build/falco-pod-delete/
Preparing: ./falco-pod-delete/ build/falco-pod-delete/function
Building: devopps/falco-pod-delete:latest with golang-middleware template. Please wait..
#1 [internal] load build definition from Dockerfile
#1 sha256:8cd765381aabb90df3bcfbc06f4d175af37d66b85125d463585abc1fc878b94b
#1 transferring dockerfile: 1.81kB done
#1 DONE 0.0s
...

Use 'docker scan' to run Snyk tests against images to find vulnerabilities and learn how to fix them
Image: devopps/falco-pod-delete:latest built.
[0] < Building falco-pod-delete done in 1.31s.
[0] Worker done.

Total build time: 1.31s

[0] > Pushing falco-pod-delete [devopps/falco-pod-delete:latest].
The push refers to repository [docker.io/devopps/falco-pod-delete]
8096edd09fbc: Layer already exists
464d68aca3d9: Layer already exists
e4766ea46ad0: Layer already exists
5f70bf18a086: Layer already exists
a823d50a5b72: Layer already exists
060f21486264: Layer already exists
8ea3b23f387b: Layer already exists
latest: digest: sha256:f94abba203232b97cb2873ef5d60eec31b52d492f3d3ee106d6a9877bf131d95 size: 1782
[0] < Pushing falco-pod-delete [devopps/falco-pod-delete:latest] done.
[0] Worker done.

Deploying: falco-pod-delete.

Deployed. 202 Accepted.
URL: http://127.0.0.1:8080/function/falco-pod-delete
```

Check if everything is working before moving to the next step:

```shell
$ kubectl get pods --namespace openfaas-fn
NAME                                READY   STATUS    RESTARTS   AGE
falco-pod-delete-7dc9f5fbb8-gbfk7   1/1     Running   0          27s
```

## Test our function

We start by creating a dumb pod:

```shell
$ kubectl run alpine --namespace default --image=alpine --restart='Never' -- sh -c "sleep 600"
pod/alpine created
```

```shell
$ kubectl get pods --namespace default
AME     READY   STATUS    RESTARTS   AGE
alpine   1/1     Running   0          11s
```

Let's run a *shell* command inside and see what happens:

```shell
$ kubectl exec -i --tty alpine --namespace default -- sh -c "uptime"

19:27:21 up 50 min,  load average: 0.11, 0.12, 0.11
```

As expected we got the result of our command, but, if we get the status of the pod we retrieve:

```shell
$ kubectl get pods --namespace default
NAME     READY   STATUS        RESTARTS   AGE
alpine   1/1     Terminating   0          103s
```

💥 **It has been terminated** 💥

We can now check the logs of components.

For `Falco`:

```shell
$ kubectl logs daemonset/falco --namespace falco
..
{"output":"19:27:21.002873265: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine container=97c9868ea832 shell=sh parent=runc cmdline=sh -c uptime terminal=34816 container_id=97c9868ea832 image=alpine) k8s.ns=default k8s.pod=alpine container=97c9868ea832","priority":"Notice","rule":"Terminal shell in container","time":"2021-04-10T19:27:21.002873265Z", "output_fields": {"container.id":"97c9868ea832","container.image.repository":"alpine","evt.time":1618082841002873265,"k8s.ns.name":"default","k8s.pod.name":"alpine","proc.cmdline":"sh -c uptime","proc.name":"sh","proc.pname":"runc","proc.tty":34816,"user.loginuid":-1,"user.name":"root"}}
{"output":"19:27:21.038853452: Notice Unexpected connection to K8s API Server from container (command=handler k8s.ns=openfaas-fn k8s.pod=falco-pod-delete-7dc9f5fbb8-gbfk7 container=12fc4de5ccc3 image=devopps/falco-pod-delete:latest connection=172.17.0.9:43812->10.96.0.1:443) k8s.ns=openfaas-fn k8s.pod=falco-pod-delete-7dc9f5fbb8-gbfk7 container=12fc4de5ccc3","priority":"Notice","rule":"Contact K8S API Server From Container","time":"2021-04-10T19:27:21.038853452Z", "output_fields": {"container.id":"12fc4de5ccc3","container.image.repository":"devopps/falco-pod-delete","container.image.tag":"latest","evt.time":1618082841038853452,"fd.name":"172.17.0.9:43812->10.96.0.1:443","k8s.ns.name":"openfaas-fn","k8s.pod.name":"falco-pod-delete-7dc9f5fbb8-gbfk7","proc.cmdline":"handler"}}
```

For `Falcosidekick`:

```shell
$ kubectl logs deployment/falcosidekick --namespace falco
2021/04/10 19:27:21 [INFO]  : OpenFaas - Post OK (200)
2021/04/10 19:27:21 [INFO]  : OpenFaas - Function Response : OK
2021/04/10 19:27:21 [INFO]  : OpenFaas - Call Function "falco-pod-delete.openfaas-fn" OK
..
```

For _falco-delete-pod_ function:

```shell
$ faas-cli logs -f --name falco-pod-delete
2021/04/10 19:34:03 Deleting pod alpine from namespace default
2021/04/10 19:34:03 POST / - 200 OK - ContentLength: 2
```

## Conclusion

With this really simple example, we only scratched the surface of possibilities, so don't
hesitate to share with us on Slack (https://kubernetes.slack.com #falco) your comments, ideas and successes. You're also
always welcome to [contribute](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md).
