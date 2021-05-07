---
title: Kubernetes Response Engine, Part 3: Falcosidekick + Knative
date: 2021-04-28
author: Scott Nichols and Dan Papandrea
slug: falcosidekick-reponse-engine-part-3-knative
---

> *This blog post is part of a series of articles about how to create a `Kubernetes` response engine with `Falco`, `Falcosidekick` and a `FaaS`.*
> 
> See other posts:
> * [Kubernetes Response Engine, Part 1 : Falcosidekick + Kubeless]({{< ref "/blog/falcosidekick-reponse-engine-part-1-kubeless" >}})
> * [Kubernetes Response Engine, Part 2 : Falcosidekick + OpenFaas]({{< ref "/blog/falcosidekick-reponse-engine-part-2-openfass" >}})

----
As the Cloud Native ecosystem grows and the idea that an integrator can browse
the offerings and slap them together like an a la carte menu resonates. We call
this _Thinking Cloud Native_.

[Falco](http://falco.org/) already produced events, but in the form of a webhook
with bespoke payloads, which is fine, unless you would like to integrate into an
ecosystem for event routing. To enable this for Falco we had to think about how
these events are moved from producer to consumer via something else. Enter:
CloudEvents.

What is CloudEvents? It is a specification for translating an event and the
metadata onto a specific protocol and back. What? It lets you think about the
event in a generic way without it being tied to particular choices the
integration is making today, and with minor effort CloudEvents lets that
integration change the protocol choice without changing the meaning of the
event.

This lossless property of CloudEvents means the integrator is free to choose
middleware that also speaks CloudEvents and has its own choices of persistence
and protocol, but the consumer of the event need not be aware of these
translations that have happened between the producer and consumer.

There are several choices that support CloudEvents today: Serverless.com Event
Gateway, Argo, Google Cloud Pub/Sub, Azure Event Grid, and Knative Eventing. A
more full list is at the
[cloudevents/spec repo](https://github.com/cloudevents/spec/blob/v1.0.1/community/open-source.md).

For this blog post, we are going to focus in on Falco+Knative and see what we
can do with that a la carte selection.

## Falco+Knative

What is Knative? It is two things: Knative Serving and Knative Eventing. Serving
provides a container based scale to zero, scale real big functionality; as well
as rainbow deploys, auto-TLS, domain mappings, and various knobs to control
concurrency and scale traits. Eventing provides a thin abstraction on top of
traditional message brokers (think Kafka or AMQP) that lets you compose your
application without considering the message persistence choices in the moment
(CloudEvents).

From Knative Eventing, we will use two components: Broker and Trigger. A Knative
Eventing Broker represents a event delivery and persistence layer, sort of an
eventing mesh. A Knative Eventing Trigger works with the Broker to ask that a
consumer be involved with a CloudEvent that matches some specified attributes.
So the Broker is the stream of events, the Trigger is how you select events out
of the stream and get them delivered.

With Falco producing CloudEvents, we can point our alerts from Falco at the
Knative Eventing Broker. Then create a Trigger that selects the Falco event we
want to react to. But we also need something to consume the event and react!

From Knative Serving, we can leverage a Knative Serving Service (KService). A
KService looks like a lot like a Kubernetes deployment, but it is realized on
the cluster as an autoscaling and routable component without the need for
manually creating additional Kubernetes Services. KService can run any container
as long as it is stateless, and the lifecycle is defined only in the context of
an active HTTP request.

To tie this up in a picture,

```
Falco --[via Sidekick]--> Broker --[via Trigger]--> KService
```

We are free to make the subscriber of the Trigger be _anything_ we want it to be
as long as it is routable from the Broker, and it accepts HTTP POSTs. The
request will be a CloudEvent in Binary mode, and Falco makes JSON events, so the
payload will be the standard JSON Falco is known for. In-fact, we can replace
the KService in with a
[Kubeless function](https://falco.org/blog/falcosidekick-kubeless/) and it will
work.

## Demo

To demonstrate this, we have prepared a simple example: We will detect root
shell creations and delete that pod.

### Prerequisites

- [multipass](https://multipass.run/)
- [Kubernetes](https://kubernetes.io/),
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [Helm](https://helm.sh/docs/intro/install/)

### K3s Cluster

For this blog post, we a will show the demo using k3s using multipass. Here is a
cluster creation commands:

```shell
multipass launch --name k3s-leader --cpus 2 --mem 2048M --disk 10G

multipass exec k3s-leader -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE=644 sh -"

export K3S_IP_SERVER="https://$(multipass info k3s-leader | grep "IPv4" | awk -F' ' '{print $2}'):6443"

multipass exec k3s-leader -- /bin/bash -c "cat /etc/rancher/k3s/k3s.yaml" | sed "s%https://127.0.0.1:6443%${K3S_IP_SERVER}%g" | sed "s/default/k3s/g" > ./k3s.yaml
export KUBECONFIG=./k3s.yaml
```

You should get this final output:

```shell
(╯°□°)╯︵  multipass launch --name k3s-leader --cpus 2 --mem 2048M --disk 10G
Launched: k3s-leader
(╯°□°)╯︵  multipass exec k3s-leader -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE=644 sh -"
[INFO]  Finding release for channel stable
[INFO]  Using v1.20.6+k3s1 as release
[INFO]  Downloading hash https://github.com/k3s-io/k3s/releases/download/v1.20.6+k3s1/sha256sum-amd64.txt
[INFO]  Downloading binary https://github.com/k3s-io/k3s/releases/download/v1.20.6+k3s1/k3s
[INFO]  Verifying binary download
[INFO]  Installing k3s to /usr/local/bin/k3s
[INFO]  Creating /usr/local/bin/kubectl symlink to k3s
[INFO]  Creating /usr/local/bin/crictl symlink to k3s
[INFO]  Creating /usr/local/bin/ctr symlink to k3s
[INFO]  Creating killall script /usr/local/bin/k3s-killall.sh
[INFO]  Creating uninstall script /usr/local/bin/k3s-uninstall.sh
[INFO]  env: Creating environment file /etc/systemd/system/k3s.service.env
[INFO]  systemd: Creating service file /etc/systemd/system/k3s.service
[INFO]  systemd: Enabling k3s unit
Created symlink /etc/systemd/system/multi-user.target.wants/k3s.service → /etc/systemd/system/k3s.service.
[INFO]  systemd: Starting k3s
```

Now we have a bare bones k3s cluster!

### Install Knative

To install the rest of Knative into k3s:

```bash
# Installs Knative Serving
kubectl apply -f https://github.com/knative/serving/releases/download/v0.22.0/serving-crds.yaml
kubectl wait --for=condition=Established --all crd
kubectl apply -f https://github.com/knative/serving/releases/download/v0.22.0/serving-core.yaml
kubectl apply -f https://github.com/knative/net-kourier/releases/download/v0.22.0/kourier.yaml
kubectl patch configmap/config-network \
  --namespace knative-serving \
  --type merge \
  --patch '{"data":{"ingress.class":"kourier.ingress.networking.knative.dev"}}'

# Installs Knative Eventing
kubectl apply -f https://github.com/knative/eventing/releases/download/v0.22.0/eventing-crds.yaml
kubectl wait --for=condition=Established --all crd
kubectl apply -f https://github.com/knative/eventing/releases/download/v0.22.0/eventing-core.yaml
kubectl apply -f https://github.com/knative/eventing/releases/download/v0.22.0/in-memory-channel.yaml
kubectl apply -f https://github.com/knative/eventing/releases/download/v0.22.0/mt-channel-broker.yaml

# Creates a default Broker
kubectl create -f - <<EOF
apiVersion: eventing.knative.dev/v1
kind: Broker
metadata:
  name: default
  namespace: default
EOF
```

See also
[knative.dev install instructions](https://knative.dev/docs/install/any-kubernetes-cluster/)
for installing these into your own cluster.

### Falco/Falcosidekick/sidekick UI

We'll use helm to install `Falco` ,`Falcosidekick` and `Falcosidekick UI`.

First, add the falcosecurity `helm` repo:

```shell
helm repo add falcosecurity https://falcosecurity.github.io/charts
```

In a real project, you should get the whole chart with
`helm pull falcosecurity/falco --untar` and then configure the `values.yaml`.
For this tutorial, will try to keep thing as easy as possible and set configs
directly by `helm install` command:

```shell
helm install falco falcosecurity/falco \
  --create-namespace --namespace falco \
  --set falcosidekick.enabled=true --set falcosidekick.webui.enabled=true \
  --set falcosidekick.config.cloudevents.address=http://broker-ingress.knative-eventing.svc.cluster.local/default/default
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

And you can see your new `Falco`,`Falco Sidekick`,`Falco Sidekick UI` pods:

```shell
kubectl get pods -n falco
NAME                                      READY   STATUS    RESTARTS   AGE
falco-jh75c                               1/1     Running   0          1d
falco-falcosidekick-554b8859d5-v9xkg      1/1     Running   0          1d
falco-falcosidekick-554b8859d5-x2zkk      1/1     Running   0          1d
falco-falcosidekick-ui-5d747688f9-g96x5   1/1     Running   11         1d
```

The arguments
`--set falcosidekick.enabled=true --set falcosidekick.webui.enabled=true`
enables Falcosidekick and the UI as the below shows:

![falcosidekick ui](/img/falcosidekick-ui-colors.png)

You can now test it with a typical port-forwarding:

```bash
kubectl port-forward svc/falco-falcosidekick-ui -n falco 2802:2802
```

### Drop demo

Install the demo with:

```shell
kubectl apply -f https://github.com/n3wscott/falco-drop/releases/download/v0.1.0/release.yaml
```

This will install a
[Knative Service](https://knative.dev/docs/serving/#serving-resources) that will
consume the Falco events sent by falcosidekick (to the broker), some
[RBAC](https://github.com/n3wscott/falco-drop/blob/v0.1.0/config/rbac.yaml) to
enable that service to delete pods, and a Knative Trigger to register this
consumer for events from the
[Knative Eventing Broker](https://knative.dev/docs/eventing/broker/).

#### Consumer KService

The simplified go code in use is like the following:

```go
func main() {
	...setup context...
	kc := kubeclient.Get(ctx)

	// Make a CloudEvents Client.
	c, _ := cloudevents.NewDefaultClient(p)

	// StartReceiver is blocking, it will deliver events to the inline function.
	c.StartReceiver(ctx, func(event cloudevents.Event) {
		// Filter based on source and type.
		if event.Source() == "falco.org" && event.Type() == "falco.rule.output.v1" {

			// Extract the Falco event Payload
			payload := &FalcoPayload{}
			if err := event.DataAs(payload); err != nil {
				return
			}

			// Only react to "Terminal shell in container" triggered rules.
			if payload.Rule == "Terminal shell in container" {
				if err := kc.CoreV1().Pods(payload.Fields.Namespace).Delete(ctx, payload.Fields.Pod, metav1.DeleteOptions{}); err != nil {
					log.Println("failed to delete pod from event:", err)
					return
				}
				log.Printf("[%s] deleted %s from %s because %s\n", payload.Rule, payload.Fields.Pod, payload.Fields.Namespace, payload.Output)
			}
		}
	})
}
```

The full implementation can be found in the
[falco-drop](https://github.com/n3wscott/falco-drop/blob/main/cmd/drop/main.go)
repo.

> Pro-tip: if you are developing in Go for Kubernetes, take a look at
> [ko](https://github.com/google/ko). `ko` enables containerizing go
> applications without needing a Dockerfile.

Even though the Trigger only delivers events that match the Trigger filter, it
is a good idea to validate the event that the function is receiving, which is
why we are validating again in the above code (trust, but verify).

#### Eventing Triggers

The Trigger configures the Broker for a subscriber to be invoked when the Broker
ingresses an event that matches the `spec.filter` settings.

```yaml
apiVersion: eventing.knative.dev/v1
kind: Trigger
metadata:
  name: drop
  namespace: default
spec:
  broker: default
  filter:
    attributes:
      source: falco.org
      type: falco.rule.output.v1
  subscriber:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: drop
```

> Note: the `kind: Service, name: drop` resource is the Knative Service we
> created above.

Here we are requesting that the broker only deliver events that have the
attributes (CloudEvent attributes) of `source=falco.org` and
`type=falco.rule.output.v1`. These events are delivered to our subscriber
KService.

![Eventing Topology](https://github.com/n3wscott/falco-drop/raw/main/img/graph.png)

Want to learn how that `spec.subscriber.ref` works?! It is
[duck typing](https://en.wikipedia.org/wiki/Duck_typing)
[and](https://docs.google.com/document/d/1Bud636dMcAQjXe6xfOMBzT0YYqOj1rx3EELxrq2YQv8/edit#heading=h.7o4a6nr4d1sv)
[you](https://docs.google.com/document/d/e/2PACX-1vQeYowntWI4U8yN19Esf0mK8HiY0Cf1XhbbfzLpnLzGcWqhWHwpqNFH7FqDQGTIAHqz4iFP7dPIBKvG/pub)
[can](https://github.com/knative/pkg/tree/master/apis/duck#duck-types)
[learn](https://www.youtube.com/watch?v=Mb8c5SP-Sw0)
[more](https://www.youtube.com/watch?v=kldVg63Utuw), but tl;dr: it is basically
doing this (except fancy),

```
kubectl get ksvc drop -o jsonpath='{.status.address.url}'
```

### Test

First we will create a pod that we can execute code on later:

```shell
kubectl run alpine --namespace default --image=alpine --restart='Never' -- sh -c "sleep 600"
```

You should see two pods runing, `drop-00001-*` and a `alpine`:

```shell
(╯°□°)╯︵  kubectl get pods
NAME                                    READY   STATUS              RESTARTS   AGE
drop-00001-deployment-6b4c5d8bb-m8q4z   2/2     Running             0          4m9s
alpine                                  1/1     Running   0          39s
```

Next, we will execute a command in that `alpine` pod:

```shell
kubectl exec -i --tty alpine --namespace default -- sh -c "uptime"
```

The `alpine` pod will be terminated by the drop function once the events are
processed:

```shell
(╯°□°)╯︵  kubectl exec -i --tty alpine --namespace default -- sh -c "uptime"
pod/alpine created
(╯°□°)╯︵  kubectl exec -i --tty alpine --namespace default -- sh -c "uptime"
 19:29:29 up 17 min,  load average: 0.90, 0.85, 0.59
(╯°□°)╯︵  kubectl get pods
NAME                                    READY   STATUS        RESTARTS   AGE
drop-00001-deployment-6b4c5d8bb-m8q4z   2/2     Running       0          10m
alpine                                  1/1     Terminating   0          5s
```

Or simply start a hanging shell:

```shell
kubectl run alpine-alpine --namespace default --image=alpine --restart='Never' -- sh -c "sleep 600"
kubectl exec -i --tty alpine-hang --namespace default -- sh
```

And the shell will be closed:

```shell
(╯°□°)╯︵  kubectl exec -i --tty alpine-hang --namespace default -- sh
/ # command terminated with exit code 137
```

The event that the drop function is reacting to is a CloudEvent that looks
something like this:

```
Context Attributes,
  specversion: 1.0
  type: falco.rule.output.v1
  source: falco.org
  id: f7628198-3822-4c98-ac3f-71770e272a16
  time: 2021-01-11T23:46:19.82302759Z
  datacontenttype: application/json
Extensions,
  foo: bar
  priority: Notice
  rule: Terminal shell in container
Data,
  {
    "output": "23:46:19.823027590: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine container=f29b261f8831 shell=bash parent=runc cmdline=bash -il terminal=34816 container_id=f29b261f8831 image=mysql) k8s.ns=default k8s.pod=mysql-db-7d59548d75-wh44s container=f29b261f8831",
    "priority": "Notice",
    "rule": "Terminal shell in container",
    "time": "2021-01-11T23:46:19.82302759Z",
    "output_fields": {
      "container.id": "f29b261f8831",
      "container.image.repository": "mysql",
      "evt.time": 1610408779823027700,
      "k8s.ns.name": "default",
      "k8s.pod.name": "alpine",
      "proc.cmdline": "bash -il",
      "proc.name": "bash",
      "proc.pname": "runc",
      "proc.tty": 34816,
      "user.loginuid": -1,
      "user.name": "root"
    }
  }
```

The KService consumes this event and simply deletes the pod. You can also see
this activity in the [falcosidekick UI](http://localhost:2802/ui/#/).

## Conclusion

Thinking Cloud Native is a mindset of picking the right tool for the job and
assembling these tools into something greater than their parts. Falco is a great
tool for detection and alerts, it gets really interesting once we can react to
those events in ways we never imagined, because integrators are creative and
innovative.

What will you build?

### Knative

If you would like to find out more about Knative:

- Get started in [knative.dev](http://knative.dev/).
- Check out the [Knative Project in GitHub](https://github.com/knative).
- Meet the maintainers on the [Knative Slack](https://slack.knative.dev/).
- Follow [@KnativeProject on Twitter](https://twitter.com/KnativeProject).

### Falco

If you would like to find out more about Falco:

- Get started in [Falco.org](http://falco.org/).
- Check out the
  [Falco project in GitHub](https://github.com/falcosecurity/falco).
- Get involved in the [Falco community](https://falco.org/community/).
- Meet the maintainers on the
  [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
- Follow [@falco_org on Twitter](https://twitter.com/falco_org).
