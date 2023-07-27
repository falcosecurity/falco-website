---
title: Try Falco on Kubernetes
description: Try Falco on Kubernetes
slug: falco-kubernetes-quickstart
aliases: [/falco-kubernetes-quickstart]
weight: 25
---

## Introduction
Falco is designed to provide real-time notification of suspicious behavior. By default, it can send these alerts to stdout, stdrerr, an HTTPs endpoint, and a gRPC endpoint. However, in most production scenarios, you will want to send the output to some other system so you can take further action. Perhaps you would forward notification to Elastic or an SIEM. 

The important point is that while Falco performs a valuable task, it is most effective as part of a larger security workflow.

You might be asking, how does Falco forward its alerts? One way to accomplish this is through an add-on piece of software, [Falcosidekick](https://github.com/falcosecurity/falcosidekick). Falcosidekick can be used to forward notification to various platforms, including notification services, function as a service platforms, log aggregators, and many more. 

In this walkthrough, you will install Falco and Falcosidekick on a Kubernetes cluster. Falcosidekick will be configured to send alerts to a public Slack server. 

## Prerequisites

This walkthrough uses Helm to install Falco on a Kubernetes cluster. If you wish to follow the steps precisely as they were tested, you'll need the following software:

### Mac requirements
* Lima
* Helm
* K3s
* Kubectl

### Windows and Linux requirements
* Virtualbox
* Vagrant
* Helm
* K3s
* Kubectl

## Create a Kubernetes cluster

### Create a K3s Cluster on Mac with Lima

* Install [Helm](https://helm.sh/docs/intro/install/), [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/), and [Lima](https://github.com/lima-vm/lima#installation) according to the documentation. 

* Use Lima to create a K3s cluster. 

    ```plain
    limactl start template://k3s
    ```

    When prompted, choose "Proceed with current configuration"

* Export the Kubeconfig file as shown in the Lima output

    **Note**:  don't copy and paste from below; copy and paste from your terminal window

    For example:
    ```plain
    export KUBECONFIG="/Users/falco.user/.lima/k3s/copied-from-guest/kubeconfig.yaml"
    ```

* Check to see that the Kubernetes cluster is up and running

    ```plain
    kubectl get nodes
    ```

### Create a K3 cluster on Windows or Linux with Virtual box

**Note**: while you can install K3s natively on Linux, the instructions below have been tested and offer a higher likelihood of success. 

* Install [Virtual Box](https://www.virtualbox.org/wiki/Downloads) and [Vagrant](https://developer.hashicorp.com/vagrant/downloads)

* Issue the following commands from the command line to create an Ubuntu 20.04 virtual machine

    ```plain
        vagrant init bento/ubuntu-20.04
        vagrant up
    ```

* Log into the newly launched virtual machine  (the default password is *vagrant*)

    ```plain
        ssh -p 2222 vagrant@127.0.0.1
    ```

* Install [Helm](https://helm.sh/docs/intro/install/), [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/), and [K3s](https://docs.k3s.io/quick-start per the instructions for Ubuntu 20.04

    **Note**: be sure you're installing inside your SSH session, not on your local machine. Also, installing K3s last makes the next step easier. 

* Export the Kubeconfig file as shown in the K3s output

    **Note**:  don't copy and paste from below; copy and paste from your terminal window

    For example:

    ```plain
    export KUBECONFIG="/Users/falco.user/.lima/k3s/copied-from-guest/kubeconfig.yaml"
    ```

* Check to see that the Kubernetes cluster is up and running

    ```plain
    kubectl get nodes
    ```

**Note**: For Mac users, do the remaining steps from the terminal on your local machine. For Windows and Linux users, do these steps in the terminal session for your Virtualbox VM. 

## Install Falco using Helm
Helm is the simplest way to deploy Falco and Falcosidekick. In this section, you'll add the Falco Helm chart repository. Next, you'll deploy Falco and Falcosidekick with the eBPF probe. Because we want to send output to a Slack channel, you will provide the Slack webhook information. Additionally, we supply a custom parameter (*user*) that you will customize to your username. 

* Add the Falco Helm repository

    ```plain
    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update
    ```

* Create a namespace (*falco*) in which to run Falco

    ```plain
    kubectl create namespace falco
    ```

* Use Helm to install Falco and Falcosidekick. Notice we are specifying the eBPF probe and the information to forward any alerts with a priority higher than *Notice* to our Slack server. 



    ```plain 
    helm install falco -n falco --set driver.kind=ebpf --set tty=true falcosecurity/falco \
    --set falcosidekick.enabled=true \
    --set falcosidekick.config.slack.webhookurl="https://hooks.slack.com/services/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" \
    --set falcosidekick.config.slack.minimumpriority=notice \
    --set falcosidekick.config.customfields="user:<changeme>"
    ```

* Wait for the Falco and Falcosidekick pods to come online

    ```plain 
    k get pods -n falco  -w
    ```

You should ultimately see 3 entries similar to those below

```plain
NAME                                   READY   STATUS    RESTARTS   AGE
falco-falcosidekick-59c5d6cc45-l2qjz   1/1     Running   0          3m7s
falco-falcosidekick-59c5d6cc45-kpcws   1/1     Running   0          3m7s
falco-vdsc8                            2/2     Running   0          3m7s
``` 

## Simulate suspicious activity

One of Falco's rules alerts you if someone runs an interactive shell into a running container. In this section, you'll shell into a running Alpine container to trigger a Falco notification

* Start an Alpine container 

    ```plain 
    kubectl run alpine --image alpine -- sh -c "sleep infinity"
    ```
* Wait for the Alpine pod to come online

    ```plain
    kubectl get pods -w
    ```
You should see something similar to this:

```plain
NAME     READY   STATUS    RESTARTS   AGE
alpine   1/1     Running   0          16s
```

* Shell into the running container and run the *uptime* command. This will trigger Falco to send an Alert

    ```
    kubectl exec -it alpine -- sh -c "uptime"
    ```

## Examine Falco's output

* One of the outputs Falco writes to by default is standard out, so one way to view our notification is to examine the Kubernetes logs for the Falco pod. Since we know our alert has a severity of *Notice* we can grep for that to make it easier to find

```
kubectl logs -l app.kubernetes.io/name=falco -n falco -c falco | grep Notice
```

You should see output similar to this:

```
{"hostname":"falco-vdsc8","output":"22:09:57.827858816: Notice A shell was spawned in a container with an attached
 terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine container=d34690e67a3a shell=sh parent=runc 
 cmdline=sh -c uptime pid=6461 terminal=34816 container_id=d34690e67a3a image=<NA> exe_flags=EXE_WRITABLE)",
 "priority":"Notice","rule":"Terminal shell in container","source":"syscall","tags":["T1059","container",
 "mitre_execution","shell"],"time":"2023-07-26T22:09:57.827858816Z", "output_fields": {"container.
 id":"d34690e67a3a","container.image.repository":null,"evt.arg.flags":"EXE_WRITABLE","evt.time":1690409397827858816,
 "k8s.ns.name":"default","k8s.pod.name":"alpine","proc.cmdline":"sh -c uptime","proc.name":"sh","proc.pid":6461,
 "proc.pname":"runc","proc.tty":34816,"user.loginuid":-1,"user.name":"root"}}
```

Notice that there is a bunch of interesting information in the output, including the pod name, container id, time of the notification, and much more. 

* Since we used Falcosidekick to send the information to Slack, you can also view it there. Visit our #falco-notifications channel on the [public slack channel](https://join.slack.com/t/sysdig-workshops/shared_invite/zt-1rd6raamc-UldAmUJe5FgnB5NhsAPeMQ) and look for the alert with your name. 

![Slack output](../images/slack-output.png)






## Congratulations, you finished this scenario!

Check out other items in our Getting Started section, including installing Falco on Linux or learning more about Falco's architecture and features in the additional resources section.