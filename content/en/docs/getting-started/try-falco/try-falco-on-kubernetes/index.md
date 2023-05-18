---
title: Try Falco on Kubernetes
description: Learn how to deploy Falco on Kubernetes
slug: try-falco-on-kubernetes
aliases: [/try-falco-on-kubernetes]
weight: 30
---

## 0. Requirements

### 0.1 Environment

This environment requires of a Kubernetes environment of at least 1 node. 

## 1. Deploying Falco

These are the main steps to install Falco on Kubernetes using Helm. Follow them and you should be able to use Falco in a matter of minutes.

### 1.1 Install kernel headers

Run the following command to install the kernel headers on every Kubernetes node:

```plain
sudo apt-get -y install linux-headers-$(uname -r)
```
> This step might not even be necessary if the specific driver for the Linux kernel in your Kubernetes cluster [is prebuilt and offered by Falco](https://download.falco.org/).
>
> Otherwise, the the presence of the kernel headers will allow the installer to build the Falco driver for you.

### 1.2 Add Falco chart repository

Run the following command to add the `falcosecurity` charts repository:
```plain
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
```

### 1.3 Install the chart

Run the following command to create a namespace for Falco and install the Falco chart:
```plain
kubectl create namespace falco
helm install falco -n falco --set tty=true falcosecurity/falco
```

### 1.4 Verify the Falco deployment

Verify that Falco is deployed correctly using the `kubectl` command:
```plain
kubectl get pods -n falco
```

Falco pod(s) might need a few seconds to start. Wait until they are ready:
```plain
kubectl wait pods --for=condition=Ready --all -n falco
```

## 2. Trying Falco in action

### 2.1 Generate a suspicious event

Run the following command to simulate a suspicious event:
```plain
kubectl exec -it alpine -- sh -c "uptime"
```

### 2.2 Look at Falco logs
Run the following command to look at Falco logs.
```plain
kubectl logs -l app.kubernetes.io/name=falco -n falco
```

Check the logs to see the following notice:
```
15:44:24.787469557: Notice A shell was spawned in a container with an attached terminal 
 (user=<NA> user_loginuid=-1 k8s.ns=default k8s.pod=alpine container=07f3751ec492 shell=sh 
 parent=runc cmdline=sh -c uptime pid=32402 terminal=34816 container_id=07f3751ec492 
 image=docker.io/library/alpine)
```

---
## Congratulations, you finished this scenario!

You should be able to install Falco in your Kubernetes cluster and watch for suspicious behavior.

Click on [Try Falco](/try-falco) and try out the next scenario.
