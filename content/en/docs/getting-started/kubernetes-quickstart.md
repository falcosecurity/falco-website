---
title: Try Falco on Kubernetes
description: Learn how to deploy Falco on Kubernetes
slug: falco-kubernetes-quickstart
aliases:
- ../../try-falco-on-kubernetes
- try-falco/try-falcosidekick-on-kubernetes
weight: 25
---

Falco is designed to provide real-time notification of suspicious behavior. By default, it can send these alerts to stdout, stdrerr, an HTTPs endpoint, and a gRPC endpoint. However, in most production scenarios, you will want to send the output to some other system so you can take further action.

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
* VirtualBox
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

* When prompted, choose **Proceed with current configuration**.

* Export the Kubeconfig file as shown in the Lima output.

    For example:
    ```plain
    export KUBECONFIG="$HOME/.lima/k3s/copied-from-guest/kubeconfig.yaml"
    ```

{{% pageinfo color=warning %}}
**Important**

Don't copy and paste the previous command from here, since the path on your machine will probably differ.

Instead, copy and paste from your terminal window.
{{% /pageinfo %}}

* Check to see that the Kubernetes cluster is up and running.

    ```plain
    kubectl get nodes
    ```

* Proceed to **Install Falco using Helm**

### Create a K3 cluster on Windows or Linux with VirtualBox

{{% pageinfo color=info %}}
While you can install K3s natively on Linux, the instructions below have been tested and offer a higher likelihood of success.

{{% /pageinfo %}}

* Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads) and [Vagrant](https://developer.hashicorp.com/vagrant/downloads).

* Issue the following commands from the command line to create an Ubuntu 20.04 virtual machine.

    ```plain
        vagrant init bento/ubuntu-20.04
        vagrant up
    ```

* Log into the newly launched virtual machine  (the default password is *vagrant*).

    ```plain
        vagrant ssh
    ```

* Install [Helm](https://helm.sh/docs/intro/install/), [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/), and [K3s](https://docs.k3s.io/quick-start) per the instructions for Ubuntu 20.04.

{{% pageinfo color=warning %}}
**Important**

Be sure you're installing inside your SSH session, not on your local machine.\
Installing K3s last makes the next step easier.
{{% /pageinfo %}}

* Export the Kubeconfig file as shown in the K3s output.

    For example:

    ```plain
    export KUBECONFIG="$HOME/.lima/k3s/copied-from-guest/kubeconfig.yaml"
    ```

{{% pageinfo color=warning %}}
**Important**

Don't copy and paste the previous command from here, since the path on your machine will probably differ.

Instead, copy and paste from your terminal window.
{{% /pageinfo %}}

* Check to see that the Kubernetes cluster is up and running.

    ```plain
    kubectl get nodes
    ```


## Install Falco using Helm

{{% pageinfo color=warning %}}
**Important**

For Mac users, do the remaining steps from the terminal on your local machine.

For Windows and Linux users, do these steps in the terminal session for your VirtualBox VM.
{{% /pageinfo %}}

Helm is the simplest way to deploy Falco and Falcosidekick. In this section, you'll add the Falco Helm chart repository. Next, you'll deploy Falco and Falcosidekick with the eBPF probe. Because we want to send output to a Slack channel, you will provide the Slack webhook information. Additionally, we supply a custom parameter (*user*) that you will customize to your username.

* Add the Falco Helm repository.

    ```plain
    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update
    ```

* Create a namespace (*falco*) in which to run Falco.

    ```plain
    kubectl create namespace falco
    ```
### Option A - Slack Notification and FalcoSidekick

* Use Helm to install Falco and Falcosidekick. Notice we are specifying the eBPF probe and the information to forward any alerts with a priority higher than *Notice* to our Slack server. Be sure to change the last parameter from *changeme* to your name. 

    ```plain
    helm install falco -n falco --set driver.kind=ebpf --set tty=true falcosecurity/falco \
    --set falcosidekick.enabled=true \
    --set falcosidekick.config.slack.webhookurl=$(base64 --decode <<< "aHR0cHM6Ly9ob29rcy5zbGFjay5jb20vc2VydmljZXMvVDA0QUhTRktMTTgvQjA1SzA3NkgyNlMvV2ZHRGQ5MFFDcENwNnFzNmFKNkV0dEg4") \
    --set falcosidekick.config.slack.minimumpriority=notice \
    --set falcosidekick.config.customfields="user:changeme"
    ```

{{% pageinfo color=warning %}}
**Important**

Be sure to change the last parameter from *changeme* to your name.

{{% /pageinfo %}}

### Option B - Teams Notification and FalcoSidekick UI

* Use Helm to install Falco and Falcosidekick. Notice we are specifying the eBPF probe and the information to forward any alerts with a priority higher than *Notice* to your [Teams incomming webhook](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=dotnet). 

    ```plain
    helm install falco -n falco --set driver.kind=ebpf --set tty=true falcosecurity/falco \
    --set falcosidekick.enabled=true --set falcosidekick.webui.enabled=true --set falcosidekick.webui.redis.storageEnabled=false \
    --set falcosidekick.config.teams.webhookurl="https://xxxxx.webhook.office.com/webhookb2/xxxxxxxxx/IncomingWebhook/xxxxxxxxxx" \
    --set falcosidekick.config.teams.minimumpriority=notice \
    --set falcosidekick.config.teams.activityimage="https://raw.githubusercontent.com/falcosecurity/falcosidekick/master/imgs/falcosidekick_color.png"
    ```

* Wait for the Falco and Falcosidekick pods to come online.

    ```plain
    kubectl get pods -n falco -w
    ```

You should ultimately see 3 entries similar to those below:

```plain
NAME                                    READY   STATUS    RESTARTS        AGE
falco-falcosidekick-689f55b785-flqrw    1/1     Running   0               3m16s
falco-falcosidekick-689f55b785-fssmc    1/1     Running   0               3m16s
falco-falcosidekick-ui-6568c775-227dn   1/1     Running   3 (2m24s ago)   3m16s
falco-falcosidekick-ui-6568c775-tqprv   1/1     Running   3 (2m23s ago)   3m16s
falco-falcosidekick-ui-redis-0          1/1     Running   0               3m16s
falco-jk7c2                             2/2     Running   0               3m16s
```


* Press ctrl-c to return to the terminal prompt. 

* Check the Falco pod logs to verify falco loaded appropriately. 

    ```plain
    kubectl logs -l app.kubernetes.io/name=falco -n falco -c falco
    ```

You should see something similar to this:

```plain
Fri Jul 28 11:24:52 2023: Falco version: 0.35.1 (aarch64)
Fri Jul 28 11:24:52 2023: Falco initialized with configuration file: /etc/falco/falco.yaml
Fri Jul 28 11:24:52 2023: Loading rules from file /etc/falco/falco_rules.yaml
Fri Jul 28 11:24:52 2023: The chosen syscall buffer dimension is: 8388608 bytes (8 MBs)
Fri Jul 28 11:24:52 2023: Starting health webserver with threadiness 4, listening on port 8765
Fri Jul 28 11:24:52 2023: Loaded event sources: syscall
Fri Jul 28 11:24:52 2023: Enabled event sources: syscall
Fri Jul 28 11:24:52 2023: Opening 'syscall' source with BPF probe. BPF probe path: /root/.falco/falco-bpf.o
```

## Simulate suspicious activity

One of Falco's rules alerts you if someone runs an interactive shell into a running container. In this section, you'll shell into a running Alpine container to trigger a Falco notification.

* Start an Alpine container.

    ```plain
    kubectl run alpine --image alpine -- sh -c "sleep infinity"
    ```
* Wait for the Alpine pod to come online.

    ```plain
    kubectl get pods -w
    ```
You should see something similar to this:

```plain
NAME     READY   STATUS    RESTARTS   AGE
alpine   1/1     Running   0          16s
```

* Press ctrl-c to return to the terminal prompt. 

* Shell into the running container and run the *uptime* command. This will trigger Falco to send an Alert.

    ```plain
    kubectl exec -it alpine -- sh -c "uptime"
    ```

## Examine Falco's output

* One of the outputs Falco writes to by default is standard out, so one way to view our notification is to examine the Kubernetes logs for the Falco pod. Since we know our alert has a severity of *Notice* we can grep for that to make it easier to find.

```plain
kubectl logs -l app.kubernetes.io/name=falco -n falco -c falco | grep Notice
```

You should see output similar to this:

```plain
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

### Option A - Slack

* Since we used Falcosidekick to send the information to Slack, you can also view it there. Visit our `#falco-notifications` channel on the [public slack channel](https://join.slack.com/t/sysdig-workshops/shared_invite/zt-1rd6raamc-UldAmUJe5FgnB5NhsAPeMQ) and look for the alert with your name.

![Slack output](/docs/getting-started/images/slack-output.png)

### Option B - Teams

* Since we used Falcosidekick to send the information to Teams, you can also view it there.

![Teams output](/docs/getting-started/images/teams-output.png)


## Cleanup
If you wish to remove the resources created during this walkthrough, please follow the instructions below.

### Mac

* Remove the K3s Cluster

    ```plain
    limactl delete k3s --force
    ```

### Windows and Linux

* Remove the Virtualbox VM

    ```plain
    vagrant destroy
    ```

## Congratulations, you finished this scenario!

Check out other items in our Getting Started section, including installing Falco on Linux or learning more about Falco's architecture and features in the additional resources section.
