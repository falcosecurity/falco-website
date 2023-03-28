---
title: "Kubernetes Response Engine, Part 9: Falcosidekick + Fission"
date: 2021-09-01
author: Gaurav Gahlot
slug: falcosidekick-response-engine-part-9-fission
tags: ["Falcosidekick","Integration"]
---

> *This blog post is part of a series of articles about how to create a `Kubernetes` response engine with `Falco`, `Falcosidekick` and a `FaaS`.*
> 
> See other posts:
> * [Kubernetes Response Engine, Part 1 : Falcosidekick + Kubeless]({{< ref "/blog/falcosidekick-response-engine-part-1-kubeless" >}})
> * [Kubernetes Response Engine, Part 2 : Falcosidekick + OpenFaas]({{< ref "/blog/falcosidekick-response-engine-part-2-openfass" >}})
> * [Kubernetes Response Engine, Part 3 : Falcosidekick + Knative]({{< ref "/blog/falcosidekick-response-engine-part-3-knative" >}})
> * [Kubernetes Response Engine, Part 4 : Falcosidekick + Tekton]({{< ref "/blog/falcosidekick-response-engine-part-4-tekton" >}})
> * [Kubernetes Response Engine, Part 5 : Falcosidekick + Argo]({{< ref "/blog/falcosidekick-response-engine-part-5-argo" >}})
> * [Kubernetes Response Engine, Part 6 : Falcosidekick + Cloud Run]({{< ref "/blog/falcosidekick-response-engine-part-6-cloud-run" >}})
> * [Kubernetes Response Engine, Part 7 : Falcosidekick + Cloud Functions]({{< ref "/blog/falcosidekick-response-engine-part-7-cloud-functions" >}})
> * [Kubernetes Response Engine, Part 8: Falcosidekick + Flux v2]({{< ref "/blog/falcosidekick-response-engine-part-8-fluxv2" >}})

----

The earlier posts in this series, show how to use Kubeless, Argo, Knative, and others to trigger a resource after getting input from Falcosidekick.
Recently, Falcosidekick received a new output type support for [Fission](https://github.com/falcosecurity/falcosidekick/pull/255).

In this blog post, we will cover using `Falcosidekick` and `Fission` to detect and delete a compromised pod in a Kubernetes cluster.
We will briefly talk about Fission in this blog, however, you can check the complete documentation [here](https://fission.io/).

## Prerequisites

We need tools with the following minimum versions to achieve this demo:

* Minikube v1.19.0
* Helm v3.5.4
* kubectl v1.21.0
* fission-cli v1.13.1

### Provision local Kubernetes Cluster

There are various ways to provision a local Kubernetes cluster such as, KinD, k3s, k0s, Minikube, etc. We are going to
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

## Install Fission

Fission is a fast, open source serverless framework for Kubernetes with a focus on developer productivity and high performance.
Fission operates on just the code: Docker and Kubernetes are abstracted away under normal operation, though you can use both to extend Fission if you want to.

Follow the official documentation for [deploying Fission to Kubernetes](https://docs.fission.io/docs/installation/).

Here we will be using Helm to install Fission:

```shell
$ export FISSION_NAMESPACE="fission"
$ kubectl create namespace $FISSION_NAMESPACE
$ kubectl create -k "github.com/fission/fission/crds/v1?ref=1.13.1"
$ helm repo add fission-charts https://fission.github.io/fission-charts/
$ helm repo update
$ helm install --version 1.13.1 --namespace $FISSION_NAMESPACE fission fission-charts/fission-all
NAME: fission
LAST DEPLOYED: Wed Jul 21 18:03:44 2021
NAMESPACE: fission
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
1. Install the client CLI.

Mac:
  $ curl -Lo fission https://github.com/fission/fission/releases/download/1.13.1/fission-1.13.1-darwin-amd64 && chmod +x fission && sudo mv fission /usr/local/bin/

Linux:
  $ curl -Lo fission https://github.com/fission/fission/releases/download/1.13.1/fission-1.13.1-linux-amd64 && chmod +x fission && sudo mv fission /usr/local/bin/

Windows:
  For Windows, you can use the linux binary on WSL. Or you can download this windows executable: https://github.com/fission/fission/releases/download/1.13.1/fission-1.13.1-windows-amd64.exe

2. You're ready to use Fission!

  # Create an environment
  $ fission env create --name nodejs --image fission/node-env

  # Get a hello world
  $ curl https://raw.githubusercontent.com/fission/examples/master/nodejs/hello.js > hello.js

  # Register this function with Fission
  $ fission function create --name hello --env nodejs --code hello.js

  # Run this function
  $ fission function test --name hello
  Hello, world!
```

Check if everything is working before moving onto the next step:

```shell
$ kubectl get pods --namespace fission
NAME                                               READY   STATUS    RESTARTS   AGE
buildermgr-5698c89fff-rk9z6                        1/1     Running   0          7m20s
controller-5dcb44bcd6-vq9hb                        1/1     Running   0          7m20s
executor-6b6d6469d6-2xrlk                          1/1     Running   0          7m20s
fission-kube-state-metrics-5fc9bd6684-7ffwp        1/1     Running   0          7m20s
fission-prometheus-alertmanager-65f5574885-tlrz6   2/2     Running   0          7m20s
fission-prometheus-node-exporter-jd9w6             1/1     Running   0          7m20s
fission-prometheus-node-exporter-jpzn8             1/1     Running   0          7m20s
fission-prometheus-node-exporter-rb25l             1/1     Running   0          7m20s
fission-prometheus-pushgateway-54c87b5796-28x2h    1/1     Running   0          7m20s
fission-prometheus-server-9d64c74b4-ld97h          2/2     Running   0          7m20s
influxdb-59649c8c6-5vx54                           1/1     Running   0          7m20s
kubewatcher-6996fccc6b-5vbvx                       1/1     Running   0          7m20s
logger-6kdw4                                       2/2     Running   0          7m20s
logger-nmw9t                                       2/2     Running   0          7m20s
logger-zkrq9                                       2/2     Running   0          7m20s
mqtrigger-keda-7584989c48-n5w6g                    1/1     Running   0          7m20s
mqtrigger-nats-streaming-664c55c979-t9gp5          1/1     Running   0          7m19s
nats-streaming-6c6d7c6fbf-ft468                    1/1     Running   0          7m20s
router-5c5c6cbb87-989pc                            1/1     Running   0          7m20s
storagesvc-57ccf58976-qcr4d                        1/1     Running   0          7m19s
timer-794b89579b-6kxwx                             1/1     Running   0          7m20s
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
--set falcosidekick.config.fission.function="falco-pod-delete"
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
NAME                                  READY   STATUS    RESTARTS   AGE
falco-falcosidekick-f77c58899-gd467   1/1     Running   0          51s
falco-falcosidekick-f77c58899-hfsjx   1/1     Running   0          51s
falco-hg2wm                           1/1     Running   0          51s
```

The argument `falcosidekick.enabled=true` sets the following settings in _Falco_ for you:

```shell
--set falco.jsonOutput=true \
--set falco.httpOutput.enabled=true \
--set falco.httpOutput.url=http://falco-falcosidekick:2801
```

The
arguments `--set falco.jsonOutput=true --set falco.httpOutput.enabled=true --set falco.httpOutput.url=http://falco-falcosidekick:2801`
are there to configure the format of events and the URL where `Falco` will send them.
As `Falco` and `Falcosidekick` will
be in the same namespace, it can directly use the name of the service (`falco-falcosidekick`) above `Falcosidekick` pods.

We check the logs:

```shell
$ kubectl logs deployment/falco-falcosidekick -n falco
Found 2 pods, using pod/falco-falcosidekick-f77c58899-gd467
2021/07/21 12:52:02 [INFO]  : Enabled Outputs : [Fission]
2021/07/21 12:52:02 [INFO]  : Falco Sidekick is up and listening on :2801
```

`Fission` is displayed as enabled output, everything is good 👍.

## Install our Fission Function

Our really basic function will receive events from `Falco`, thanks to `Falcosidekick`, check if the triggered rule is
[Terminal Shell in container](https://github.com/falcosecurity/falco/blob/0d7068b048772b1e2d3ca5c86c30b3040eac57df/rules/falco_rules.yaml#L2063),
extract the *namespace* and *pod name* from the fields of events and delete the according pod:

Basically, the process is:

```shell
           +----------+                 +---------------+                    +----------+
           |  Falco   +-----------------> Falcosidekick +--------------------> Fission  |
           +----^-----+   sends event   +---------------+      triggers      +-----+----+
                |                                                                  |
detects a shell |                                                                  |
                |                                                                  |
           +----+-------+                                   deletes                |
           | Pwned Pod  <----------------------------------------------------------+
           +------------+
```

Let's get the function and other artifacts:

```
$ git clone https://github.com/fission/examples.git && cd examples/sample/falco
```

The function we are going to deploy basically receives events for an infected pod from the _Falcosidekick_ and deletes it immediately.
Before deploying the function we need some permissions to delete Pod.
We create a `ServiceAccount` with rights to delete a Pod in any namespace, and we'll associate it to our function:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: falco-pod-delete
  namespace: fission-function
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: falco-pod-delete-cluster-role
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "delete"]
- apiGroups: [""]
  resources: ["events"]
  verbs: ["*"]
- apiGroups: ["fission.io"]
  resources: ["packages"]
  verbs: ["get", "list"]
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
    namespace: fission-function
```

Let's create the service account with:

```sh
$ kubectl apply -f sa-falco-pod-delete.yaml
```

The `falco-pod-delete/handler.go` contains our function:

```golang
package main

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

var criticalNamespaces = []string{"kube-system", "kube-public", "kube-node-lease", "falco", "fission", "fission-function"}

func Handler(w http.ResponseWriter, r *http.Request) {
	var alert Alert

	if r.Body != nil {
		defer r.Body.Close()

		body, _ := ioutil.ReadAll(r.Body)
		json.Unmarshal(body, &alert)

		log.Printf("\n[ INFO ] Alert : %v\n", alert)

		podName := alert.OutputFields.K8SPodName
		namespace := alert.OutputFields.K8SNsName

		var critical bool
		for _, ns := range criticalNamespaces {
			if ns == namespace {
				critical = true
				break
			}
		}

		if !critical {
			_, err := kubeClient.CoreV1().Pods(namespace).Get(context.Background(), podName, metaV1.GetOptions{})
			if err != nil {
				log.Printf("\n[ WARN ] Failed to get pod '%s' in '%s' namespace", podName, namespace)
				return
			}

			log.Printf("Deleting pod %s from namespace %s", podName, namespace)
			err = kubeClient.CoreV1().Pods(namespace).Delete(context.Background(), podName, metaV1.DeleteOptions{})
			if err != nil {
				log.Printf("\n[ ERROR ] Failed to delete pod: %v", err)
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(err.Error()))
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
```

A fission function requires an environment/runtime to run.
The `yaml` definitions for the runtime, the function and the router are available under the `specs` directory.

Now, we are ready to deploy our _falco-pod-delete_ function using the specs:

```shell
$ fission spec apply
DeployUID: edc80e3e-7d1e-448c-aba8-c8cd75b3a1eb
Resources:
 * 1 Functions
 * 1 Environments
 * 1 Packages
 * 1 Http Triggers
 * 0 MessageQueue Triggers
 * 0 Time Triggers
 * 0 Kube Watchers
 * 1 ArchiveUploadSpec
Validation Successful
Spec doesn't belong to Git Tree.
1 function created: falco-pod-delete
1 HTTPTrigger created: falco-pod-delete
1 environment created: go
1 package created: falco-pod-delete-d18f6a0b-e5a1-4275-9471-38d684ac4dfe
```

Check if the package was built successfully for our fission function before moving to the next step:

```shell
$ fission pkg list
NAME                                                  BUILD_STATUS ENV LASTUPDATEDAT
falco-pod-delete-d18f6a0b-e5a1-4275-9471-38d684ac4dfe succeeded    go  21 Jul 21 08:26 IST
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
{"output":"10:36:32.750441241: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine container=cbd3133ccac6 shell=sh parent=runc cmdline=sh -c uptime terminal=34816 container_id=cbd3133ccac6 image=alpine) k8s.ns=default k8s.pod=alpine container=cbd3133ccac6","priority":"Notice","rule":"Terminal shell in container","time":"2021-07-21T10:36:32.750441241Z", "output_fields": {"container.id":"cbd3133ccac6","container.image.repository":"alpine","evt.time":1626863792750441241,"k8s.ns.name":"default","k8s.pod.name":"alpine","proc.cmdline":"sh -c uptime","proc.name":"sh","proc.pname":"runc","proc.tty":34816,"user.loginuid":-1,"user.name":"root"}}
{"output":"10:37:09.101509967: Notice Unexpected connection to K8s API Server from container (command=fetcher -secret-dir /secrets -cfgmap-dir /configs -jaeger-collector-endpoint  /userfunc k8s.ns=fission-function k8s.pod=poolmgr-go-default-516098-5bdbf8c8f5-g8gvc container=281c99ea33c2 image=fission/fetcher:1.13.1 connection=192.168.43.223:39526->10.100.0.1:443) k8s.ns=fission-function k8s.pod=poolmgr-go-default-516098-5bdbf8c8f5-g8gvc container=281c99ea33c2","priority":"Notice","rule":"Contact K8S API Server From Container","time":"2021-07-21T10:37:09.101509967Z", "output_fields": {"container.id":"281c99ea33c2","container.image.repository":"fission/fetcher","container.image.tag":"1.13.1","evt.time":1626863829101509967,"fd.name":"192.168.43.223:39526->10.100.0.1:443","k8s.ns.name":"fission-function","k8s.pod.name":"poolmgr-go-default-516098-5bdbf8c8f5-g8gvc","proc.cmdline":"fetcher -secret-dir /secrets -cfgmap-dir /configs -jaeger-collector-endpoint  /userfunc"}}
..
```

For `Falcosidekick`:

```shell
$ kubectl logs deployment/falco-falcosidekick --namespace falco
..
2021/07/21 10:37:13 [INFO]  : Fission - Post OK (200)
2021/07/21 10:36:32 [INFO]  : Fission - Function Response : OK
2021/07/21 10:36:32 [INFO]  : Fission - Call Function "falco-pod-delete" OK
..
```

For _falco-delete-pod_ function:

```shell
$ fission function logs -f --name falco-pod-delete
..
[2021-07-21 10:47:27.206605532 +0000 UTC] 2021/07/21 10:47:27 Deleting pod alpine from namespace default
..
```

## Conclusion

With this really simple example, we got another way to create a Response Engine with amazing pieces of software from the Open Source world.
We only scratched the surface of possibilities, so don't hesitate to share with us your comments, ideas and successes.

----

If you would like to find out more about Falco:

- Get started in [Falco.org](http://falco.org/).
- Check out the
  [Falco project in GitHub](https://github.com/falcosecurity/falco).
- Get involved in the [Falco community](https://falco.org/community/).
- Meet the maintainers on the
  [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
- Follow [@falco_org on Twitter](https://twitter.com/falco_org).

