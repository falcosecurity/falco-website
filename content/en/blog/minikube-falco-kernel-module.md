---
title: Minikube 1.8.0 packages the Falco Kernel Module
date: 2020-03-08
author: Lorenzo Fontana
---

Minikube is a tool that implements a local Kubernetes cluster on macOS, Linux and Windows via a simple command line, it is
vastly used by community members who want to try Falco as well by Falco contributors who want to develop and debug it against new and old Kubernetes versions.

Now, thanks to [Anders Björklund](https://github.com/afbjorklund) who proposed [PR#6560](https://github.com/kubernetes/minikube/pull/6560) every user starting any Kubernetes cluster
using Minikube >= 1.8.0 (with the minikube iso, e.g: using a VM driver) will also find installed a copy of the Falco kernel module ready to serve Falco instances in user-space!

At the moment of writing, Minikube installs Kubernetes 1.17.3, and the Falco repository does not yet ship the manifests containing the new changes for
Kubernetes >= 1.16, although there are PRs [#1044](https://github.com/falcosecurity/falco/pull/1044) and [#1005](https://github.com/falcosecurity/falco/pull/1005) that go to that direction.

For this reason, to test this you can either just patch the manifests yourself or use the Falco Helm Chart that was [already patched](https://github.com/helm/charts/pull/17339) and works in this case!

It is extremely easy! After [installing Minikube](https://minikube.sigs.k8s.io/docs/start/) 1.8.0 you only need to start a cluster and [install Falco using the Helm Chart](https://github.com/helm/charts/tree/master/stable/falco).


Create the cluster with Minikube using a VM driver, in this case Virtualbox:

```bash
minikube start --driver=virtualbox
```

Once you issue the command, look at the logs to make sure you have at least Minikube 1.8.0:

```
😄  minikube v1.8.1 on Arch
    ▪ KUBECONFIG=/home/fntlnz/.kube/current
✨  Automatically selected the virtualbox driver
💿  Downloading VM boot image ...
🔥  Creating virtualbox VM (CPUs=2, Memory=3939MB, Disk=20000MB) ...
🐳  Preparing Kubernetes v1.17.3 on Docker 19.03.6 ...
🚀  Launching Kubernetes ...
🌟  Enabling addons: default-storageclass, storage-provisioner
⌛  Waiting for cluster to come online ...
🏄  Done! kubectl is now configured to use "minikube"
```

Now that our VM is ready, we can SSH into it to verify that the module is there!:


```
minikube ssh
```

Once we are in:

```
lsmod | grep -i falco
```

Aaaand..... It will show nothing! Because the Falco module has not been loaded yet!

Let's continue with the installation of Falco, it will load the module for us afterwards.

Verify that everything is running, it will need to show the system pods:

```bash
kubectl get pods --all-namespaces
```

Add the Stable chart repository to Helm:

```bash
helm repo add stable https://kubernetes-charts.storage.googleapis.com/
```

Install Falco using Helm:

```bash
helm install falco stable/falco
```

It will give something like this:

```
NAME: falco
LAST DEPLOYED: Sun Mar  8 16:29:11 2020
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Falco agents are spinning up on each node in your cluster. After a few
seconds, they are going to start monitoring your containers looking for
security issues.

No further action should be required.
```

Read the logs to make sure Falco is running!


```bash
kubectl logs -l app=falco -f
```

It will show errors trying to find the Kernel headers, those are needed to build the module but we can just skip those errors because the module is already there!

```
* Unloading falco-probe, if present
* Running dkms install for falco
Error! echo
Your kernel headers for kernel 4.19.94 cannot be found at
/lib/modules/4.19.94/build or /lib/modules/4.19.94/source.
* Running dkms build failed, couldn't find /var/lib/dkms/falco/0.20.0+d77080a/build/make.log
* Trying to load a system falco-probe, if present
falco-probe found and loaded with modprobe
Sun Mar  8 15:29:55 2020: Falco initialized with configuration file /etc/falco/falco.yaml
Sun Mar  8 15:29:55 2020: Loading rules from file /etc/falco/falco_rules.yaml:
Sun Mar  8 15:29:56 2020: Loading rules from file /etc/falco/falco_rules.local.yaml:
Sun Mar  8 15:29:56 2020: Starting internal webserver, listening on port 8765
```

Now that Falco is running, we can go and check if the module was loaded, again after doing `minikube ssh`:


```bash
sudo lsmod| grep -i falco
```

It will finally show that the Falco module is loaded!

```
falco_probe           630784  2
```

You're done! You're ready to start doing great contributions to Falco and to make a difference in our community!

We need help on many things right now:

- [Falcoctl](https://github.com/falcosecurity/falcoctl) the Falco command line, needs some love from Go developers to improve the Falco command line and automate maintainance and usage tasks;
- [Driverkit](https://github.com/falcosecurity/driverkit) the new Falco tool to build the Falco driver needs help from Go developer and Kernel hackers to support more Operating systems and architectures;
- [client-rs](https://github.com/falcosecurity/client-rs) needs Rust developers to support the latest gRPC APIs our community developed, like the Version API, see the similar PR on client go to understand what we mean [here](https://github.com/falcosecurity/client-go/pull/33)
- [Falco](https://github.com/falcosecurity/falco) itself needs C++ developers and Kernel hackers to fix bugs, make features more stable, add tests, and further improvements! Please join us!


**And you?** What do you want to hack on this week? Reach us in the Falco mailing list [subscribe on Falco.org by scrolling all the way down and input your email address](https://falco.org/).

