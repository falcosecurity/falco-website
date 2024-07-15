---
title: Try Falco on Kubernetes
description: Learn how to deploy Falco on Kubernetes
slug: falco-kubernetes-quickstart
aliases:
- ../../try-falco-on-kubernetes
- try-falco/try-falcosidekick-on-kubernetes
weight: 20
---

First, ensure you can access a test Kubernetes cluster running with Linux nodes, either x86_64 or ARM64. Note that using Docker Desktop on Windows or macOS will not work for this purpose. Also, you will need to have [kubectl](https://kubernetes.io/docs/tasks/tools/) and [helm](https://helm.sh/docs/intro/install/) installed and configured.

## Deploy Falco

First, install the helm repository:

```sh
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
```

Then install Falco:

```sh
helm install --replace falco --namespace falco --create-namespace --set tty=true falcosecurity/falco
```

And check that the Falco pods are running:

```sh
kubectl get pods -n falco
```

Falco pod(s) might need a few seconds to start. Wait until they are ready:

```sh
kubectl wait pods --for=condition=Ready --all -n falco
```

Falco comes with a [pre-installed set of rules](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml) that alert you upon suspicious behavior.

## Trigger a rule

Let's create a deployment:

```sh
kubectl create deployment nginx --image=nginx
```

And execute a command that would trigger a rule:

```sh
kubectl exec -it $(kubectl get pods --selector=app=nginx -o name) -- cat /etc/shadow
```

Now let's take a look at the Falco logs:

```sh
kubectl logs -l app.kubernetes.io/name=falco -n falco -c falco | grep Warning
```

You will see logs for all the Falco pods deployed on the system. The Falco pod corresponding to the node in which our nginx deployment is running has detected the event, and you'll be able to read a line like:

```plain
09:46:05.727801343: Warning Sensitive file opened for reading by non-trusted program (file=/etc/shadow gparent=systemd ggparent=<NA> gggparent=<NA> evt_type=openat user=root user_uid=0 user_loginuid=-1 process=cat proc_exepath=/usr/bin/cat parent=containerd-shim command=cat /etc/shadow terminal=34816 container_id=bf74f1749e23 container_image=docker.io/library/nginx container_image_tag=latest container_name=nginx k8s_ns=default k8s_pod_name=nginx-7854ff8877-h97p4)
```

This is your first Falco event 🦅! If you are curious, [this](https://github.com/falcosecurity/rules/blob/c0a9bf17d5451340ab8a497efae1b8a8bd95adcb/rules/falco_rules.yaml#L398) is the rule that describes it.

## Create a custom rule

Now it's time to create our own rule and load it into Falco. We can be pretty creative with them, but let's stick with something simple. This time, we want to be alerted when any file is opened for writing in the `/etc` directory, either on the host or inside containers.

Create a file and call it `falco_custom_rules_cm.yaml` with the following content:

```yaml
customRules:
  custom-rules.yaml: |-
    - rule: Write below etc
      desc: An attempt to write to /etc directory
      condition: >
        (evt.type in (open,openat,openat2) and evt.is_open_write=true and fd.typechar='f' and fd.num>=0)
        and fd.name startswith /etc
      output: "File below /etc opened for writing (file=%fd.name pcmdline=%proc.pcmdline gparent=%proc.aname[2] ggparent=%proc.aname[3] gggparent=%proc.aname[4] evt_type=%evt.type user=%user.name user_uid=%user.uid user_loginuid=%user.loginuid process=%proc.name proc_exepath=%proc.exepath parent=%proc.pname command=%proc.cmdline terminal=%proc.tty %container.info)"
      priority: WARNING
      tags: [filesystem, mitre_persistence]
```

And load it into Falco:

```sh
helm upgrade --namespace falco falco falcosecurity/falco --set tty=true -f ~/tmp/falco_custom_rules_cm.yaml
```

Falco pod(s) might need a few seconds to restart. Wait until they are ready:

```sh
kubectl wait pods --for=condition=Ready --all -n falco
```

Then trigger our new rule:

```sh
kubectl exec -it $(kubectl get pods --selector=app=nginx -o name) -- touch /etc/test_file_for_falco_rule
```

And look at the logs:

```sh
kubectl logs -l app.kubernetes.io/name=falco -n falco -c falco | grep Warning
```

You should see a log entry like the one below:

```plain
13:14:27.811647863: Warning File below /etc opened for writing (file=/etc/test_file_for_falco_rule pcmdline=containerd-shim -namespace k8s.io -id d5438fedb274ac82963d99987313dae8da512236ace2f70472a772d95090b607 -address /run/containerd/containerd.sock gparent=systemd ggparent=<NA> gggparent=<NA> evt_type=openat user=root user_uid=0 user_loginuid=-1 process=touch proc_exepath=/usr/bin/touch parent=containerd-shim command=touch /etc/test_file_for_falco_rule terminal=34816 container_id=bf74f1749e23 container_image=docker.io/library/nginx container_image_tag=latest container_name=nginx k8s_ns=default k8s_pod_name=nginx-7854ff8877-h97p4)
```

## Deploy Falcosidekick

XXX Missing

## Cleanup

If you wish to remove Falco from your cluster you can simply run:

```sh
helm -n falco uninstall falco
```
