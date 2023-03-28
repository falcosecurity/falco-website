---
title: "Running Falco on Apple Silicon"
linktitle: "Running Falco on Apple Silicon"
date: 2022-09-20
author: Eduardo Minguez
slug: falco-apple-silicon
tags: ["Tutorial"]
---

Hello, Falcoers!

Do you want to run Falco on Apple ARM M1 CPUs? Since [Falco 0.32.1](https://github.com/falcosecurity/falco/releases/tag/0.32.1), you can! It requires a Linux virtual machine (VM) since Falco doesn't run on OSX, but it is pretty straightforward.

Let's go step by step:

- [Setting up the environment](#setting-up-the-environment)
  - [Creating a VM](#creating-a-vm)
- [Installing Falco](#installing-falco)
  - [Installing the Falco driver](#installing-the-falco-driver)
- [Running Falco](#running-falco)
- [Falco on M1 on Kubernetes](#falco-on-m1-on-kubernetes)
  - [Creating a Kubernetes cluster](#creating-a-kubernetes-cluster)
  - [Deploying Falco via Helm](#deploying-falco-via-helm)
- [Conclusion](#conclusion)

### Setting up the environment

There are a few ways to create a Linux VM on OSX using Apple Silicon, using [UTM](https://mac.getutm.app/), [VMWare Fusion](https://www.vmware.com/products/fusion/fusion-evaluation.html), or [Parallels](https://www.parallels.com/es/). In this case we are going to use [Lima](https://github.com/lima-vm/lima), an open source project based on QEMU with lots of features, including the ability to run ARM VMs on Apple Silicon (hint: [Rancher Desktop](https://rancherdesktop.io/) is based on Lima).

To install Lima, it is required to install Homebrew first. If you have Homebrew already installed, you can just skip those steps.

**NOTE:** It is highly recommended to read the [installation options](https://docs.brew.sh/Installation) before copying and pasting random commands. :)

Open the macOS terminal and paste the following snippet:

```shell
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After Homebrew is added, install lima as:

```shell
$ brew install lima
```

#### Creating a VM

Lima has different templates already available to choose from:

```shell
$ limactl start --list-templates
almalinux
alpine
archlinux
buildkit
centos-stream
debian
default
deprecated/centos-7
docker-rootful
docker
experimental/9p
experimental/almalinux-9
experimental/apptainer
experimental/centos-stream-9
experimental/opensuse-tumbleweed
experimental/oraclelinux-9
experimental/riscv64
experimental/rocky-9
faasd
fedora
k3s
k8s
nomad
opensuse
oraclelinux
podman
rocky
singularity
ubuntu-lts
ubuntu
vmnet
```

You can see the definition of those templates [here](https://github.com/lima-vm/lima/tree/master/examples).

For this exercise, we are going to launch a Fedora machine named 'falco-fedora' as:

```shell
$ limactl start --name=falco-fedora template://fedora
```

The previous command allows you to edit the template, choose a different one, or just deploy the VM (hint: you can skip that step using the `--tty=false` flag).

After a few seconds, you have a Fedora VM already available! Let's connect into it:

```shell
$ limactl shell falco-fedora

$ uname -a
Linux lima-falco-fedora 5.17.5-300.fc36.aarch64 #1 SMP Thu Apr 28 15:22:08 UTC 2022 aarch64 aarch64 aarch64 GNU/Linux
$ cat /etc/fedora-release
Fedora release 36 (Thirty Six)
```

Before moving forward, let's update the packages to the most recent versions and reboot the VM to use the latest kernel available:

```shell
$ sudo bash -c "dnf clean all && \
                dnf update -y && \
                reboot"
```

After a few minutes, the VM is updated and rebooted. Now it is time to install Falco!

### Installing Falco

Let's connect to the VM again and install Falco following the [official documentation](https://falco.org/docs/getting-started/installation/#centos-rhel):

```shell
$ limactl shell falco-fedora

$ sudo bash -c "rpm --import https://falco.org/repo/falcosecurity-packages.asc && \
                curl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo && \
                dnf install falco -y"
```

This will install the Falco repository and signature and then install the Falco binaries and dependencies (including make and the kernel headers).

#### Installing the Falco Driver

Falco depends on a driver that taps into the stream of system calls on a machine and passes them to user space. This driver can be either a kernel module or an eBPF probe (see the [driver official documentation](https://falco.org/docs/event-sources/drivers/) for more information).

In this exercise, we are going to go the eBPF route. But first, let's see if we have BPF JIT enabled (see [here](https://falco.org/docs/getting-started/installation/#install-driver) why it is recommended):

```shell
$ grep CONFIG_BPF_JIT= /boot/config-$(uname -r)
CONFIG_BPF_JIT=y
$ sysctl -n net.core.bpf_jit_enable
1
```

Great, now let's install some packages required to build the eBPF probe:

```shell
$ sudo dnf install -y clang llvm
```

Finally, let's run the `falco-driver-loader` script to build the eBPF probe using the `bpf` command argument as:

```shell
$ sudo falco-driver-loader bpf
```

The output should look like:

```
* Running falco-driver-loader for: falco version=0.32.2, driver version=2.0.0+driver
* Running falco-driver-loader with: driver=bpf, compile=yes, download=yes
* Mounting debugfs
* Trying to download a prebuilt eBPF probe from https://download.falco.org/driver/2.0.0%2Bdriver/aarch64/falco_fedora_5.19.8-200.fc36.aarch64_1.o
curl: (22) The requested URL returned error: 404
Unable to find a prebuilt falco eBPF probe
* Trying to compile the eBPF probe (falco_fedora_5.19.8-200.fc36.aarch64_1.o)
...
* eBPF probe located in /root/.falco/falco_fedora_5.19.8-200.fc36.aarch64_1.o
* Success: eBPF probe symlinked to /root/.falco/falco-bpf.o
```

The eBPF probe has been built and we are ready to go!

### Running Falco

The last step is to run Falco as a service as:

```shell
$ sudo systemctl enable --now falco
```

The journalctl logs should look like:

```
$ sudo journalctl -fu falco
Sep 15 11:07:41 lima-falco-fedora systemd[1]: Starting falco.service - Falco: Container Native Runtime Security...
Sep 15 11:07:41 lima-falco-fedora systemd[1]: Started falco.service - Falco: Container Native Runtime Security.
Sep 15 11:07:41 lima-falco-fedora falco[21290]: Falco version 0.32.2
Sep 15 11:07:41 lima-falco-fedora falco[21290]: Falco initialized with configuration file /etc/falco/falco.yaml
Sep 15 11:07:41 lima-falco-fedora falco[21290]: Loading rules from file /etc/falco/falco_rules.yaml:
Sep 15 11:07:41 lima-falco-fedora falco[21290]: Loading rules from file /etc/falco/falco_rules.local.yaml:
Sep 15 11:07:41 lima-falco-fedora falco[21290]: Starting internal webserver, listening on port 8765
Sep 15 11:07:54 lima-falco-fedora falco[21290]: 11:07:54.233793746: Warning Sensitive file opened for reading by non-trusted program (user=root user_loginuid=-1 program=systemd-userwor command=systemd-userwor                  file=/etc/shadow parent=systemd-userdbd gparent=systemd ggparent=<NA> gggparent=<NA> container_id=host image=<NA>)
```

Profit!!!

  > The last line in the output shows a Falco rule has already been triggered by running the previous systemctl command, so everything is working as it should. Yay!

### Falco on M1 on Kubernetes

Running Falco on a single host is great, but what about running it in Kubernetes on your Apple hardware? Let's do it!

#### Creating a Kubernetes cluster

This time, we will leverage the [k8s](https://github.com/lima-vm/lima/blob/master/examples/k8s.yaml) Lima template (basically, a vanilla Ubuntu 22.04 VM plus what is required to run Kubernetes via [kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)) to have a single node Kubernetes cluster:

```shell
$ limactl start --name=falco-k8s template://k8s --tty=false
```

After a few minutes, our Kubernetes cluster is ready to be used. But first, let's get the Kubeconfig file needed to interact with the cluster:

```shell
$ mkdir -p "${HOME}/.lima/falco-k8s/conf"
$ export KUBECONFIG="${HOME}/.lima/falco-k8s/conf/kubeconfig.yaml"
$ limactl shell falco-k8s sudo cat /etc/kubernetes/admin.conf >$KUBECONFIG
$ chmod 0600 ${KUBECONFIG}
```

Then, we are ready to go:

```shell
$ kubectl get pods -A

NAMESPACE      NAME                                     READY   STATUS    RESTARTS   AGE
kube-flannel   kube-flannel-ds-rjk74                    1/1     Running   0          17s
kube-system    coredns-565d847f94-5277n                 0/1     Running   0          17s
kube-system    coredns-565d847f94-spkgc                 1/1     Running   0          17s
kube-system    etcd-lima-falco-k8s                      1/1     Running   0          31s
kube-system    kube-apiserver-lima-falco-k8s            1/1     Running   0          31s
kube-system    kube-controller-manager-lima-falco-k8s   1/1     Running   0          32s
kube-system    kube-proxy-265h6                         1/1     Running   0          17s
kube-system    kube-scheduler-lima-falco-k8s            1/1     Running   0          33s
```

#### Deploying Falco via Helm

We leverage [Helm](https://helm.sh) to deploy Falco on our Kubernetes cluster using the official [Falco helm chart](https://github.com/falcosecurity/charts/tree/master/falco).

To install Helm, we can use brew as:

```shell
$ brew install helm
```

Then, we need to add the `falcosecurity` helm repository and install the `falcosecurity/falco` chart.

  > For this basic example we are just going to enable eBPF as we did before, but there are tons of parameters and configurations that can be tweaked. Check the [official documentation](https://github.com/falcosecurity/charts/tree/master/falco) to know more.

```shell
$ helm repo add falcosecurity https://falcosecurity.github.io/charts
$ helm repo update
$ helm install falco falcosecurity/falco --namespace falco --create-namespace --set driver.kind=ebpf
```

This will trigger the deployment of Falco on your Kubernetes cluster. The `falco-driver-loader` init container will perform all the steps required to build the eBPF probe (hint: the kernel headers are already included in the VM) as you can see with the following snippet:

```shell
$ kubectl logs -n falco $(kubectl get po -n falco -l app.kubernetes.io/name=falco -o name) -c falco-driver-loader

* Setting up /usr/src links from host
* Running falco-driver-loader for: falco version=0.32.2, driver version=2.0.0+driver
* Running falco-driver-loader with: driver=bpf, compile=yes, download=yes
...
* eBPF probe located in /root/.falco/falco_ubuntu-generic_5.15.0-47-generic_51.o
* Success: eBPF probe symlinked to /root/.falco/falco-bpf.o
```

And then, the falco pod should be running:

```shell
$ kubectl logs -n falco $(kubectl get po -n falco -l app.kubernetes.io/name=falco -o name) -c falco

Thu Sep 15 13:03:03 2022: Falco version 0.32.2
Thu Sep 15 13:03:03 2022: Falco initialized with configuration file /etc/falco/falco.yaml
Thu Sep 15 13:03:03 2022: Loading rules from file /etc/falco/falco_rules.yaml:
Thu Sep 15 13:03:04 2022: Loading rules from file /etc/falco/falco_rules.local.yaml:
Thu Sep 15 13:03:04 2022: Starting internal webserver, listening on port 8765
```

Yay!

### Conclusion

You have learned how to set up a Linux VM to run Falco with the help of Lima in your ARM-powered Apple hardware.

You can find us in the [Falco community](https://github.com/falcosecurity/community). Please feel free to reach out to us for any questions, suggestions, or just a friendly chat!

If you would like to find out more about Falco:

* Get started in [Falco.org](http://falco.org/).
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).
