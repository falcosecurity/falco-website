---
title: Falcosidekick + Kubeless = a Kubernetes Response Engine
date: 2021-01-15
author: Thomas Labarussias
---

Two years ago, we presented to you a `Kubernetes Response Engine` based on `Falco`. The idea was to trigger [`Kubeless`](https://kubeless.io) serverless functions for deleting infected pod, start a `Sysdig` capture or forward the `events` to `GCP PubSub`. See the [README](https://github.com/falcosecurity/kubernetes-response-engine).

To avoid maintaining this custom stack, we worked hard with the community to integrate all components into [`Falcosidekick`](https://github.com/falcosecurity/falcosidekick) and to improve the UX. 
With the last release [`2.20.0`](https://github.com/falcosecurity/falcosidekick/releases/tag/2.20.0) we have the finale piece, the integration of `Kubeless` as native output. More details in [our retrospective of 2020](https://falco.org/blog/falcosidekick-2020/).

In this blog post, we will explain the basic concepts for integrating your own Response Engine into K8S with the stack `Falco` + `Falcosidekick` + `Kubeless`.

## Requirements

We require a `kubernetes` cluster running at least `1.17` release and [`helm`](https://helm.sh) and `kubectl` installed.

## Install Kubeless

Follow the official [quick start](https://kubeless.io/docs/quick-start/) page:

```shell
export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)
kubectl create ns kubeless
kubectl create -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$RELEASE.yaml
```

After a few seconds, we can check that the controller is up and running:

```shell
kubectl get pods -n kubeless
NAME                                          READY   STATUS    RESTARTS   AGE
kubeless-controller-manager-99459cb67-tb99d   3/3     Running   3          2m34s
```

## Install Falco

Firstly, we'll create the namespace that will both `Falco` and `Falcosidekick`:

```shell
kubectl create ns falco
```

Add the `helm` repo:

```shell
helm repo add falcosecurity https://falcosecurity.github.io/charts
```

In a real project, you should get the whole chart with `helm pull falcosecurity/falco --untar` and then configure the `values.yaml`. For this tutorial, will try to keep thing as easy as possible and set configs directly by `helm install` command:

```shell
helm install falco falcosecurity/falco --set falco.jsonOutput=true --set falco.httpOutput.enabled=true --set falco.httpOutput.url=http://falcosidekick:2801 -n falco
```

You should get this output:

```shell
NAME: falco
LAST DEPLOYED: Thu Jan 14 23:43:46 2021
NAMESPACE: falco
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Falco agents are spinning up on each node in your cluster. After a few
seconds, they are going to start monitoring your containers looking for
security issues.
No further action should be required.
```

And you can see your new `Falco` pods:

```shell
kubectl get pods -n falco
NAME                           READY   STATUS        RESTARTS   AGE
falco-ctmzg                    1/1     Running       0          111s
falco-sfnn8                    1/1     Running       0          111s
falco-rrg28                    1/1     Running       0          111s
```

The arguments `--set falco.jsonOutput=true --set falco.httpOutput.enabled=true --set falco.httpOutput.url=http://falcosidekick:2801` are there configuring the format of events and the URL where `Falco` will send them. As `Falco` and `Falcosidekick` will be in the same namespace, we can directly use the name of the service (`falcosidekick`).

## Install Falcosidekick

The process is quite the same:

```shell
helm install falcosidekick falcosecurity/falcosidekick --set config.kubeless.namespace=kubeless --set config.kubeless.function=delete-pod -n falco
```

You should get this output:
```shell
NAME: falcosidekick
LAST DEPLOYED: Thu Jan 14 23:55:12 2021
NAMESPACE: falco
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace falco -l "app.kubernetes.io/name=falcosidekick,app.kubernetes.io/instance=falcosidekick" -o jsonpath="{.items[0].metadata.name}")
  kubectl port-forward $POD_NAME 2801:2801
  echo "Visit http://127.0.0.1:2801 to use your application"
```

We check the logs:
```shell
kubectl logs deployment/falcosidekick -n falco
2021/01/14 22:55:31 [INFO]  : Enabled Outputs : Kubeless 
2021/01/14 22:55:31 [INFO]  : Falco Sidekick is up and listening on port 2801
````

`Kubeless` is displayed as enabled output, everything is good 👍.

A brief explanation of parameters:
- `config.kubeless.namespace`: is the namespace where our `Kubeless` will run
- `config.kubeless.function`: is the name of our `Kubeless function`

That's it, we really tried to get a nice UX 😉.

## Install our Kubeless function

We'll not explain how to write or how work `Kubeless` functions, please read the official [docs](https://kubeless.io/docs/) for more information.

Our really basic function will receive events from `Falco` thanks to `Falcosidekick`, check if the triggered rule is *Terminal Shell in container* (See [rule](https://github.com/falcosecurity/falco/blob/0d7068b048772b1e2d3ca5c86c30b3040eac57df/rules/falco_rules.yaml#L2063)), extract the *namespace* and *pod name* from fields of events and delete the according pod:

```python
from kubernetes import client,config

config.load_incluster_config()

def delete_pod(event, context):
    rule = event['data']['rule'] or None
    output_fields = event['data']['output_fields'] or None

    if rule and rule == "Terminal shell in container" and output_fields:
        if output_fields['k8s.ns.name'] and output_fields['k8s.pod.name']:
            pod = output_fields['k8s.pod.name']
            namespace = output_fields['k8s.ns.name']
            print (f"Deleting pod \"{pod}\" in namespace \"{namespace}\"")
            client.CoreV1Api().delete_namespaced_pod(name=pod, namespace=namespace, body=client.V1DeleteOptions())
```

Basically, the process is:
```shell
           +----------+                 +---------------+                    +----------+
           |  Falco   +-----------------> Falcosidekick +--------------------> Kubeless |
           +----^-----+   sends event   +---------------+      triggers      +-----+----+
                |                                                                  |
detects a shell |                                                                  |
                |                                                                  |
           +----+-------+                                   deletes                |
           | Pwned Pod  <----------------------------------------------------------+
           +------------+
```

Before deploying our function, we need to create a `ServiceAccount` for it, as it will need the right to delete a pod in any namespace:

```shell
cat <<EOF | kubectl apply -n kubeless -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: falco-pod-delete
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
    namespace: kubeless
EOF
```

```shell
namespace: kubelessetetion.k8s.io
serviceaccount/falco-pod-delete created
clusterrole.rbac.authorization.k8s.io/falco-pod-delete-cluster-role created
clusterrolebinding.rbac.authorization.k8s.io/falco-pod-delete-cluster-role-binding created
```

Only remains the installation of our function itself:

```shell
cat <<EOF | kubectl apply -n kubeless -f -
apiVersion: kubeless.io/v1beta1
kind: Function
metadata:
  finalizers:
    - kubeless.io/function
  generation: 1
  labels:
    created-by: kubeless
    function: delete-pod
  name: delete-pod
spec:
  checksum: sha256:a68bf570ea30e578e392eab18ca70dbece27bce850a8dbef2586eff55c5c7aa0
  deps: |
    kubernetes>=12.0.1
  function-content-type: text
  function: |-
    from kubernetes import client,config

    config.load_incluster_config()

    def delete_pod(event, context):
        rule = event['data']['rule'] or None
        output_fields = event['data']['output_fields'] or None

        if rule and rule == "Terminal shell in container" and output_fields:
            if output_fields['k8s.ns.name'] and output_fields['k8s.pod.name']:
                pod = output_fields['k8s.pod.name']
                namespace = output_fields['k8s.ns.name']
                print (f"Deleting pod \"{pod}\" in namespace \"{namespace}\"")
                client.CoreV1Api().delete_namespaced_pod(name=pod, namespace=namespace, body=client.V1DeleteOptions())
  handler: delete-pod.delete_pod
  runtime: python3.7
  deployment:
    spec:
      template:
        spec:
          serviceAccountName: falco-pod-delete
EOF
```

```shell
function.kubeless.io/delete-pod created
```

Here we are, after a few moments, we have a `Kubeless` function running in namespace *kubeless* and that can be triggered by its service *delete-pod* on port *8080*:

```shell
kubectl get pods -n kubeless

NAME                                          READY   STATUS    RESTARTS   AGE
kubeless-controller-manager-99459cb67-tb99d   3/3     Running   3          3d14h
delete-pod-d6f98f6dd-cw228                    1/1     Running   0          2m52s
```
```shell
kubectl get svc -n kubeless

NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
delete-pod   ClusterIP   10.43.211.201   <none>        8080/TCP         4m38s
```

## Test our function

We start by creating a dumb pod:

```shell
kubectl run alpine -n default --image=alpine --restart='Never' -- sh -c "sleep 600"
```
```shell
kubectl get pods -n default
NAME     READY   STATUS    RESTARTS   AGE
alpine   1/1     Running   0          9s
```

Let's run a *shell* command inside and see what happens:

```shell
kubectl exec -i --tty alpine -n default -- sh -c "uptime"

23:44:25 up 1 day, 19:11,  load average: 0.87, 0.77, 0.77
```

As expected we got the result of our command, but, if get the status of the pod now:

```shell
kubectl get pods -n default
NAME     READY   STATUS        RESTARTS   AGE
alpine   1/1     Terminating   0          103s
```

💥 **It has been terminated** 💥

We can now check the logs of components.

For `Falco`:
```bash
kubectl logs daemonset/falco -n falco

{"output":"23:39:44.834631763: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine container=5892b41bcf46 shell=sh parent=<NA> cmdline=sh terminal=34817 container_id=5892b41bcf46 image=<NA>) k8s.ns=default k8s.pod=alpine container=5892b41bcf46","priority":"Notice","rule":"Terminal shell in container","time":"2021-01-14T23:39:44.834631763Z", "output_fields": {"container.id":"5892b41bcf46","container.image.repository":null,"evt.time":1610667584834631763,"k8s.ns.name":"default","k8s.pod.name":"alpine","proc.cmdline":"sh","proc.name":"sh","proc.pname":null,"proc.tty":34817,"user.loginuid":-1,"user.name":"root"}}
```

For `Falcosidekick`:
```shell
kubectl logs deployment/falcosidekick -n falco

2021/01/14 23:39:45 [INFO]  : Kubeless - Post OK (200)
2021/01/14 23:39:45 [INFO]  : Kubeless - Function Response : 
2021/01/14 23:39:45 [INFO]  : Kubeless - Call Function "delete-pod" OK
```

*(Notice, the function returns nothing, this is why the message log is empty)*

For `delete-pod` function:
```shell
kubectl logs deployment/delete-pod -n kubeless

10.42.0.31 - - [14/Jan/2021:23:39:45 +0000] "POST / HTTP/1.1" 200 0 "" "Falcosidekick" 0/965744
Deleting pod "alpine" in namespace "default"
```

## Conclusion

With this really simple example, we only scratched the surface of possibilities, everything is possible now, so don't hesitate to share with us on Slack (https://kubernetes.slack.com #falco) your comments, ideas and successes. You're also always welcome to [contribute](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md).

*Bonus: You're running `Falcosidekick` outside `Kubernetes` but still want to use the `Kubeless` output? No problem, you can declare a kubeconfig file to use. See [README](https://github.com/falcosecurity/falcosidekick/blob/master/README.md).*

*Bonus 2: For people who wants to use `Knative` in place of `Kubeless`, it's coming soon 😉*

*Enjoy*
