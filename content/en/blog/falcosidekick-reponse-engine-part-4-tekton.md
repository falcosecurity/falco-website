---
title: "Kubernetes Response Engine, Part 4: Falcosidekick + Tekton"
date: 2021-05-14
author: Edvin Norling
slug: falcosidekick-response-engine-part-4-tekton
---

> *This blog post is part of a series of articles about how to create a `Kubernetes` response engine with `Falco`, `Falcosidekick` and a `FaaS`.*
>
> See other posts:
>
> - [Kubernetes Response Engine, Part 1 : Falcosidekick + Kubeless]({{< ref "/blog/falcosidekick-reponse-engine-part-1-kubeless" >}})
> - [Kubernetes Response Engine, Part 2 : Falcosidekick + OpenFaas]({{< ref "/blog/falcosidekick-reponse-engine-part-2-openfass" >}})
> - [Kubernetes Response Engine, Part 3 : Falcosidekick + Knative]({{< ref "/blog/falcosidekick-reponse-engine-part-3-knative" >}})

----

## Falcosidekick + Tekton

Earler in this series we have seen how to use [Kubeless](https://kubeless.io/), [OpenFaas](https://www.openfaas.com/)
and [Knative](https://knative.dev/) to trigger a pod after getting input from falcosidekick to delete a compromised pod.

In this part I will showcase how we can use [Tekton](https://tekton.dev) and not have to add any extra complexity to your cluster by adding a serverless runtime.

I won't go through how Tekton works in depth but, you can find a good overview in the  [official docs](https://tekton.dev/docs/overview/).
But here is the crash course:

- Tekton is built to be reusable.
- The smallest part of tekton is a **step**, a step can be something like this:
  - Run unit tests
  - Run linting
- In a **task** you can have multiple steps.
- A **pipeline** consist of one or multiple tasks.
- To trigger a pipeline to actually run you need a **pipelinerun** or a **trigger-template**.

Tekton also supports eventlisteners that is used to listen for webhooks.
Normally these webhooks listen for incoming changes to a git repo, for example a PR.
But we will use it to listen for Falco events.

You can find all the yaml and code in my [repo](https://github.com/NissesSenap/falcosidekick-tekton/tree/falco).

### Prerequisites

As always within Kubernetes we need a few tools, I have used the following versions of Helm, Minikube and kubectl in my setup.

- Minikube v1.19.0
- Helm v3.4.2
- kubectl v1.20.5

### Provision local Kubernetes Cluster

I'm sure you can use a [kind](https://github.com/kubernetes-sigs/kind) cluster as well to follow along,
but falco complained a bit when I tried and I was too lazy to check out what extra flags I need so I went with minikube.

```shell
minikube start --cpus 3 --memory 8192 --vm-driver virtualbox
```

### Install Tekton

Install Tekton pipelines and triggers.
When doing this in production I recommend the [Tekton operator](https://github.com/tektoncd/operator) but for now lets use some pure yaml.

```shell
kubectl apply --filename https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
kubectl apply --filename https://storage.googleapis.com/tekton-releases/triggers/latest/release.yaml

```

Within a few seconds you should be able to see a few pods in the tekton-pipelines namespace.

```shell
kubectl get pods -n tekton-pipelines
NAME                                          READY   STATUS    RESTARTS   AGE
tekton-pipelines-controller-6b94f5f96-cmf8m   1/1     Running   0          1h
tekton-pipelines-webhook-5bfbbd6475-fmjp4     1/1     Running   0          1h
tekton-triggers-controller-7cbd49fbb8-p4lrz   1/1     Running   0          1h
tekton-triggers-webhook-748fb7778c-w6zxv      1/1     Running   0          1h
```

If you want a deeper understanding how Tekton triggers work check out the [getting-started guide](https://github.com/tektoncd/triggers/tree/v0.13.0/docs/getting-started).

### Install Falco + Falcosidekick

Create the falco namespace and add the helm repo:

```shell
kubectl create namespace falco
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
```

For simplicity and long term usability lets create a custom values file and start falco.

```shell
cat <<'EOF' >> values.yaml
falcosidekick:
  config:
    webhook:
      address: http://el-falco-listener.falcoresponse.svc.cluster.local:8080
  enabled: true

customRules:
  # Applications which are expected to communicate with the Kubernetes API
  rules_user_known_k8s_api_callers.yaml: |-
    - macro: user_known_contact_k8s_api_server_activities
      condition: >
        (container.image.repository = "gcr.io/tekton-releases/github.com/tektoncd/triggers/cmd/eventlistenersink") or
        (container.image.repository = "quay.io/nissessenap/poddeleter")
EOF

# Install falco
helm upgrade --install falco falcosecurity/falco --namespace falco -f values.yaml
```

> Note the customRules and the webhook address.

We haven't setup this webhook address nor is there currently any reason for us to have customRules for eventlistenersink or poddeleter, but it will come.
Both the Tekton event listener and my poddeleter does a few kubernetes API calls and we don't want falco generate alarms for our own infrastructure.

You should be able to see falco and falcosidekick pods in the falco namespace:

```shell
kubectl get pods --namespace falco

NAME                                   READY   STATUS    RESTARTS   AGE
falco-44p4v                            1/1     Running   0          64m
falco-falcosidekick-779b87f446-8zf9m   1/1     Running   0          2h
falco-falcosidekick-779b87f446-fdk55   1/1     Running   0          2h
```

### Protect me Falco

My current setup is rather harsh and will delete any pods that breaks any falco rule.
In the future I plan to make both the go code and the tekton setup better and more flexible, hopefully this is something that we can do in the community.

During this demo I will use the [Terminal Shell in container](https://github.com/falcosecurity/falco/blob/0d7068b048772b1e2d3ca5c86c30b3040eac57df/rules/falco_rules.yaml#L2063) since it's very easy to reproduce.

So how does all this work?

- We start a random pod and perform a simple exec.
- Falco will notice that a pod have broken the rule
- Sends a event to Falcosidekick
- Sends a webhook to tekton event-listener
- Tekton triggers a new pipeline
- A task is started with a small go program that deletes the pod

So lets look at some yaml.

#### The go code

I have adapted the code that Batuhan Apaydın wrote in [Falcosidekick + OpenFaas = a Kubernetes Response Engine, Part 2](https://falco.org/blog/falcosidekick-openfaas/) to listen for json in a environment variable instead of a http request.

Below you can see the code, in short it does the following:

- Check for environment variable BODY.
- Unmarshal the data according to the Alert struct.
- Setups a kubernetes client, by calling setupKubeClient function.
- Calls the deletePod with a kubernetes client, the falcoEvent we gotten and a hash map of critical Namespaces.
- Check in the event that we got from falcosidekick and see if the pod that triggered the event is in our critical namespaces hash map.
- If it is return to the main and shutdown the application.
- Else deletes the pod in the namespace specified in the falcosidekick event.

```main.go
package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// Alert falco data structure
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

func main() {
	criticalNamespaces := map[string]bool{
		"kube-system":     true,
		"kube-public":     true,
		"kube-node-lease": true,
		"falco":           true,
	}

	var falcoEvent Alert

	bodyReq := os.Getenv("BODY")
	if bodyReq == "" {
		log.Fatalf("Need to get environment variable BODY")
	}
	bodyReqByte := []byte(bodyReq)
	err := json.Unmarshal(bodyReqByte, &falcoEvent)
	if err != nil {
		log.Fatalf("The data doesent match the struct %v", err)
	}

	kubeClient, err := setupKubeClient()
	if err != nil {
		log.Fatalf("Unable to create in-cluster config: %v", err)
	}

	err = deletePod(kubeClient, falcoEvent, criticalNamespaces)
	if err != nil {
		log.Fatalf("Unable to delete pod due to err %v", err)
	}
}

// setupKubeClient
func setupKubeClient() (*kubernetes.Clientset, error) {
	config, err := rest.InClusterConfig()
	if err != nil {
		return nil, err
	}

	// creates the clientset
	kubeClient, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}
	return kubeClient, nil
}

// deletePod, if not part of the criticalNamespaces the pod will be deleted
func deletePod(kubeClient *kubernetes.Clientset, falcoEvent Alert, criticalNamespaces map[string]bool) error {
	podName := falcoEvent.OutputFields.K8SPodName
	namespace := falcoEvent.OutputFields.K8SNsName
	log.Printf("PodName: %v & Namespace: %v", podName, namespace)

	log.Printf("Rule: %v", falcoEvent.Rule)
	if criticalNamespaces[namespace] {
		log.Printf("The pod %v won't be deleted due to it's part of the critical ns list: %v ", podName, namespace)
		return nil
	}

	log.Printf("Deleting pod %s from namespace %s", podName, namespace)
	err := kubeClient.CoreV1().Pods(namespace).Delete(context.Background(), podName, metaV1.DeleteOptions{})
	if err != nil {
		return err
	}
	return nil
}
```

If you rather see it in [github](https://raw.githubusercontent.com/NissesSenap/falcosidekick-tekton/falco/main.go).

Now that you know what I will make run in your cluster lets take a look at the Tekton yaml.

#### Tekton pipeline

Create the falcoresponse namespace to do our tests in.

```shell
kubectl create ns falcoresponse
```

##### Task

So lets start with the smallest part, the task.

```shell
cat <<EOF | kubectl apply -f -
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: pod-delete
  namespace: falcoresponse
spec:
  params:
    - name: falco-event
      description: The entire msg from falco
  steps:
    - name: pod-delete
      image: quay.io/nissessenap/poddeleter@sha256:ae94ec2c9f005573e31e4944d1055a0dd92ee7594e7e7e36a4540a1811977270
      env:
        - name: BODY
          value: \$(params.falco-event)
EOF
```

- The task needs a input variable falco-event.
- The step called pod-delete uses the poddeleter image.
- Step pod-delete sets the environment BODY from the input parameter called falco-event.

##### Pipeline

Here you can see the reusability of tekton.
This pipeline can easily add more tasks and other pipelines can use the exact same task as this one.

Just like the task this pipeline expects a parameter called falco-event which it sends in to the pod-delete task.

```shell
cat <<EOF | kubectl apply -f -
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: pod-delete-pipeline
  namespace: falcoresponse
spec:
  params:
    - name: falco-event
      description: The entire msg from falco
  tasks:
    - name: run-pod-delete
      taskRef:
        name: pod-delete
      params:
        - name: falco-event
          value: \$(params.falco-event)
EOF
```

##### RBAC

We will be using two separate serviceAccounts, one for the event-listener and one for the poddeleter it self.

So lets create these serviceAccounts and give them some access.

Below you can find the event listener RBAC config.

```shell
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tekton-triggers-example-sa
  namespace: falcoresponse
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: tekton-triggers-example-minimal
  namespace: falcoresponse
rules:
  # EventListeners need to be able to fetch all namespaced resources
  - apiGroups: ["triggers.tekton.dev"]
    resources:
      ["eventlisteners", "triggerbindings", "triggertemplates", "triggers"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    # configmaps is needed for updating logging config
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]
  # Permissions to create resources in associated TriggerTemplates
  - apiGroups: ["tekton.dev"]
    resources: ["pipelineruns", "pipelineresources", "taskruns"]
    verbs: ["create"]
  - apiGroups: [""]
    resources: ["serviceaccounts"]
    verbs: ["impersonate"]
  - apiGroups: ["policy"]
    resources: ["podsecuritypolicies"]
    resourceNames: ["tekton-triggers"]
    verbs: ["use"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: tekton-triggers-example-binding
subjects:
  - kind: ServiceAccount
    name: tekton-triggers-example-sa
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: tekton-triggers-example-minimal
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: tekton-triggers-example-clusterrole
rules:
  # EventListeners need to be able to fetch any clustertriggerbindings
  - apiGroups: ["triggers.tekton.dev"]
    resources: ["clustertriggerbindings", "clusterinterceptors"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: tekton-triggers-example-clusterbinding
subjects:
  - kind: ServiceAccount
    name: tekton-triggers-example-sa
    namespace: falcoresponse
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: tekton-triggers-example-clusterrole
EOF
```

And here is the poddeleter serviceAccount:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: falco-pod-delete
  namespace: falcoresponse
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
    namespace: falcoresponse
EOF
```

##### Event listener

Finally time to configure the tekton webhook receiver.
Just like rest of Tekton the event listener builds on multiple parts.

```shell
cat <<EOF | kubectl apply -f -
apiVersion: triggers.tekton.dev/v1alpha1
kind: EventListener
metadata:
  name: falco-listener
  namespace: falcoresponse
spec:
  serviceAccountName: tekton-triggers-example-sa
  triggers:
    - name: cel-trig
      bindings:
        - ref: falco-pod-delete-binding
      template:
        ref: falco-pod-delete-trigger-template
EOF
```

It is possible to expose a event listener using a ingress, this is a rather normal use case if you want github to trigger a pipeline for example.

> I cannot stress this enough DO **NOT** MAKE THE EVENT LISTENER PUBLIC TO THE INTERNET.
We haven't added any protection and this task have the power to kill pods in your cluster. Don't give a potential hacker this power!

The event listener is rather complex and can do [allot](https://tekton.dev/docs/triggers/eventlisteners/).
For example one way to improve this tekton pipeline could be to check for a specific Priority from Falco.
This could be done with a [cel interceptor](https://tekton.dev/docs/triggers/eventlisteners/#cel-interceptors)
and filter on body.Priority.

But for now lets just trigger on everything.

The triggerBinding lets you define what data should be gathered from the incoming webhook.
In this case I take the entire request body.

```shell
cat <<EOF | kubectl apply -f -
apiVersion: triggers.tekton.dev/v1alpha1
kind: TriggerBinding
metadata:
  name: falco-pod-delete-binding
  namespace: falcoresponse
spec:
  params:
    - name: falco-event
      value: \$(body)
EOF
```

We use the TriggerTemplate to call on the pipeline that we defined earlier using the parameter that the TriggerBinding gives us.

```shell
cat <<EOF | kubectl apply -f -
apiVersion: triggers.tekton.dev/v1alpha1
kind: TriggerTemplate
metadata:
  name: falco-pod-delete-trigger-template
  namespace: falcoresponse
  annotations:
    triggers.tekton.dev/old-escape-quotes: "true"
spec:
  params:
    - name: falco-event
      description: The entire msg from falco
  resourcetemplates:
    - apiVersion: tekton.dev/v1beta1
      kind: PipelineRun
      metadata:
        generateName: falco-pod-delete-pipeline-run-
      spec:
        serviceAccountName: falco-pod-delete
        pipelineRef:
          name: pod-delete-pipeline
        params:
          - name: falco-event
            value: \$(tt.params.falco-event)
EOF
```

> Notice the [annotations](https://tekton.dev/docs/triggers/triggertemplates/#escaping-quoted-strings), without it the pipeline will never get triggered.

We define the serviceAccount to use in our pipeline/task, point to the pipeline that we should use.
And what parameter to send down to the pipeline, notice the **tt** in front of parma. This is special syntax for TriggerBindings.

The triggerTemplate was the final piece needed and you should see a pod spinning up in the falcoresponse namespace.

```shell
kubectl get pdos -n falcoresponse
NAME                                                 READY   STATUS      RESTARTS   AGE
el-falco-listener-557786f598-zdmw2                   1/1     Running     0          2h
```

### Trigger job

Finally it's time to test our setup.

I would recommend that you start a second terminal for this part.

**Terminal 1** follow the falco logs:

```shell
kubectl logs -f $(kubectl get pods -l app=falco -o jsonpath="{.items[0].metadata.name}" -n falco) -n falco
```

**Terminal 2** lets trigger the Terminal Shell in container falco rule

```shell
# Start a alpine pod
kubectl run alpine --namespace falcoresponse --image=alpine --restart='Never' -- sh -c "sleep 600"
# Trigger the rule breaking behavior
kubectl exec -i --tty alpine --namespace falcoresponse -- sh -c "uptime"
# Watch for pods in falcoresponse namespace
kubectl get pods -n falcoresponse -w
```

In **Terminal 1** you should see something like this:

```txt
* Setting up /usr/src links from host
* Running falco-driver-loader for: falco version=0.28.0, driver version=5c0b863ddade7a45568c0ac97d037422c9efb750
* Running falco-driver-loader with: driver=module, compile=yes, download=yes
* Unloading falco module, if present
* Trying to load a system falco module, if present
* Success: falco module found and loaded with modprobe
Sun May  2 18:00:10 2021: Falco version 0.28.0 (driver version 5c0b863ddade7a45568c0ac97d037422c9efb750)
Sun May  2 18:00:10 2021: Falco initialized with configuration file /etc/falco/falco.yaml
Sun May  2 18:00:10 2021: Loading rules from file /etc/falco/falco_rules.yaml:
Sun May  2 18:00:10 2021: Loading rules from file /etc/falco/falco_rules.local.yaml:
Sun May  2 18:00:10 2021: Loading rules from file /etc/falco/rules.d/rules_user_known_k8s_api_callers.yaml:
Sun May  2 18:00:10 2021: Starting internal webserver, listening on port 8765
{"output":"20:24:10.361728219: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=falcoresponse k8s.pod=alpine container=6ac7d190134e shell=sh parent=runc cmdline=sh -c uptime terminal=34816 container_id=6ac7d190134e image=alpine) k8s.ns=falcoresponse k8s.pod=alpine container=6ac7d190134e k8s.ns=falcoresponse k8s.pod=alpine container=6ac7d190134e","priority":"Notice","rule":"Terminal shell in container","time":"2021-05-02T20:24:10.361728219Z", "output_fields": {"container.id":"6ac7d190134e","container.image.repository":"alpine","evt.time":1619987050361728219,"k8s.ns.name":"falcoresponse","k8s.pod.name":"alpine","proc.cmdline":"sh -c uptime","proc.name":"sh","proc.pname":"runc","proc.tty":34816,"user.loginuid":-1,"user.name":"root"}}
```

In **Terminal 2** you should see a pod starting and hopefully Complete without any errors and the alpine pod getting killed.

```shell
NAME                                                              READY   STATUS            RESTARTS   AGE
alpine                                                            0/1     Terminating       0          1m7s
el-falco-listener-557786f598-znzk9                                1/1     Running           0          10m
falco-pod-delete-pipeline-run-w2vf8-run-pod-delete-jlxl7--mk44k   0/1     Completed         0          59s

```

> Hurray our "hacked" pod have been killed

If you look in the logs of the task

```shell
kubectl logs -f $(kubectl get pods -l tekton.dev/task=pod-delete -o jsonpath="{.items[0].metadata.name}" -n falcoresponse) -n falcoresponse
2021/05/02 18:11:00 PodName: alpine & Namespace: falcoresponse
2021/05/02 18:11:00 Rule: Terminal shell in container
2021/05/02 18:11:00 Deleting pod alpine from namespace falcoresponse
```

### Conclusion

This was a rather simple example on how we can use the power of tekton together with Falco to protect us from bad actors that is trying to take over pods in our cluster.

As noted during this post there are a lot of potential improvements before this is production ready:

- The criticalNamespaces in our go code is currently hard-coded and needs to be input variable of some kind.
- We need to be able to delete pods depending on priority level, rule or something similar.
- To be able to debug pods we might need to shell in to them, we need a way to ignore pods temporary without the pod getting restarted. Probably a annotation to look for in the pod before deleting it.
- And probably many other needs that you can come up with.

If you have any ideas/issues come and share them in the falco slack [https://kubernetes.slack.com](https://kubernetes.slack.com) #falco.

#### Tekton

If you would like to find out more about Knative:

- Get started in [tekton.dev](https://tekton.dev/).
- Check out the [Tekton Project in GitHub](https://github.com/tektoncd).
- Meet the maintainers on the [TektonCD Slack](https://tektoncd.slack.com//).
- Follow [@tektoncd on Twitter](https://twitter.com/tektoncd).

#### Falco

If you would like to find out more about Falco:

- Get started in [Falco.org](https://falco.org/).
- Check out the
  [Falco project in GitHub](https://github.com/falcosecurity/falco).
- Get involved in the [Falco community](https://falco.org/community/).
- Meet the maintainers on the
  [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
- Follow [@falco_org on Twitter](https://twitter.com/falco_org).
