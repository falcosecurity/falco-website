---
title: Installing Falco
description: Get up and running on Linux and a variety of container platforms
weight: 2
---

Falco can be installed on several platforms:

* [Kubernetes](#kubernetes)
* [Linux](#linux)
* [Docker](#docker)
* [CoreOS](#coreos)


## Kubernetes

The default method to run Falco on Kubernetes is to use a Daemonset. Falco supports a variety of installation methods depending on your deployment methods of choice and underlying Kubernetes version. The default installation includes support for system call events via a kernel module and is thus dependent on the underlying operating system for the worker nodes. Installing the appropriate kernel headers on the worker nodes will allow Falco to dynamically build (and `insmod`) the kernel module on pod start. Falco also provides a number of prebuilt modules for common distributions and kernels. Falco will automatically attempt to download a prebuilt module if module compilation fails. 

For platforms such as Google's Container Optimized OS & GKE, where access to the underlying kernel is limited, see the [GKE section(#GKE)] below.

### Kernel Module via HTTPS

The kernel module can be prebuilt and provided to the Falco pods via HTTPs. The easiest way to build the kernel module is to deploy Falco on a node with the required kernel headers, have Falco (via the `falco-probe-loader` script) build the kernel module, then copy the kernel module out of the pod or container. By default the kernel module is copied to ......

`SYSDIG_PROBE_URL` - Set this environment variable for the Falco pod to override the default host for prebuilt kernel modules. This should be only the host portion of the URL without the trailing slash, ie `https://myhost.mydomain.com`. The kernel modules should be placed in directory `/stable/sysdig-probe-binaries/` and named as follows:
`falco-probe-${falco_version}-$(uname -i)-$(uname -r)-{md5sum of kernel config}.ko`

The `falco-probe-loader` script will name the module in this format by default. 

### Helm

Helm is one of the preferred methods for installing Falco on Kubernetes. The [Falco Helm chart](https://github.com/helm/charts/tree/master/stable/falco) provides an extensive set of [configuration values](https://github.com/helm/charts/tree/master/stable/falco#configuration) to start Falco with a variety of different configurations.

Assuming you have Helm installed and running in your cluster, to deploy Falco with the default configuration simply run:
```shell
helm install --name falco stable/falco
```

To remove Falco from your cluster run:
```
helm delete falco
```

#### Kubernetes Response Engine

Using the Falco Helm chart is the easiest way to deploy the [Falco Kuberentes Response Engine (KRE)](https://github.com/falcosecurity/kubernetes-response-engine). The KRE provides the ability to send Falco alerts to a messaging service such as NATS, AWS SNS, or Google Pub/Sub. This allows Falco alerts to be processed by subcribers of the respective messaging services. Refer to the `integrations.*` [configuration options](https://github.com/helm/charts/tree/master/stable/falco#configuration) of the Helm chart to enable this integration. 

The KRE also allows you to deploy security playbooks (via serverless functions) that can take action when Falco rules are violated. Refer to the [Response Engine documentation](https://github.com/falcosecurity/kubernetes-response-engine/tree/master/playbooks) on how to deploy the included playbooks.

### DaemonSet Manifests
To run Falco as a Kubernetes [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/), follow the instructions below. These are the `generic` instructions for Kubernetes. See below for Kubernetes platform specific instructions.

1. Clone the [Falco repo](https://github.com/falcosecurity/falco/) and change to the directory with the manifests.
```shell
git clone https://github.com/falcosecurity/falco/
cd falco/integrations/k8s-using-daemonset
```
2. Create a service account and RBAC permissions which Falco will run as. This will allow Falco to connect to the Kubernetes API server to fetch resource metadata. 
```shell
kubectl apply -f k8s-with-rbac/falco-account.yaml
```
3. Create a service for the Falco pods. This will allow Falco to recieve [Kubernetes Audit Log Events](event-sources/kubernetes-audit). If you're not planning on using this feature, you can skip this step.
```shell
kubectl apply -f k8s-with-rbac/falco-service.yaml
```

4. The Daemon Set also relies on a Kubernetes ConfigMap to store the Falco configuration and make the configuration available to the Falco Pods. This allows you to manage custom configuration without rebuilding and redeploying the underlying Pods. In order to create the ConfigMap you'll need to first need to copy the required configuration from their location in this GitHub repo to the `k8s-with-rbac/falco-config/` directory (please note that you will need to create the k8s-with-rbac/falco-config directory). Any modification of the configuration should be performed on these copies rather than the original files.

```shell
mkdir -p k8s-with-rbac/falco-config
k8s-using-daemonset$ cp ../../falco.yaml k8s-with-rbac/falco-config/
k8s-using-daemonset$ cp ../../rules/falco_rules.* k8s-with-rbac/falco-config/
k8s-using-daemonset$ cp ../../rules/k8s_audit_rules.yaml k8s-with-rbac/falco-config/
```

5. Any custom rules for your environment can be added to into the `falco_rules.local.yaml` file and they will be picked up by Falco at start time. You can also modify the `falco.yaml` file to change any [configuration options](configuration/) required for your deployment. Create the configmap with the below command.
```shell
kubectl create configmap falco-config --from-file=k8s-with-rbac/falco-config
```

6. With the dependencies of the configmap created, the daemonset can now be created.
```shell
kubectl apply -f k8s-with-rbac/falco-daemonset-configmap.yaml
```

7. In order to confirm that Falco started correctly. You can check the status of the Falco pods by checking the logs.
```shell

```

### Minkube

The easiest way to use Falco on Kubernetes in a local environment is on [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/).

#### Notes on kernel modules

A part of Falco's installation involves compiling a kernel module that allows it to see the stream of system calls on the machine on which Falco runs. The kernel module is built using DKMS and relies on the kernel headers being installed for the running kernel. If the DKMS step fails, as a fallback the installation script will try to download pre-built kernel modules from https://s3.amazonaws.com/download.draios.com.

When running minikube with the default `--driver` arguments, Minikube creates a VM that runs the various Kubernetes services and a container framework to run Pods, etc. Generally, it's not possible to build kernel modules directly on the Minikube VM, as the VM doesn't include the kernel headers for the running kernel.

To address this, starting with falco 0.13.1 we pre-build kernel modules for the last 10 Minikube versions and make them available at https://s3.amazonaws.com/download.draios.com. This allows the fallback step to succeed with a loadable kernel module.

Going forward, we'll continue to support the most recent 10 Minikube versions with each new Falco release. We also keep previously built kernel modules around for download, so we will continue to have limited historical support as well.

### GKE



## Linux

### Scripted install {#scripted}

To install Falco on Linux, you can download a shell script that takes care of the necessary steps:

```shell
curl -o install-falco.sh -s https://s3.amazonaws.com/download.draios.com/stable/install-falco
```

Then verify the [SHA256](https://en.wikipedia.org/wiki/SHA-2) checksum of the script using the `sha256sum` tool (or something analogous):

```shell
sha256sum install-falco.sh
```

It should be `{{< sha256sum >}}`.

Then run the script either as root or with sudo:

```shell
sudo bash install-falco.sh
```

### Package install {#package}

#### RHEL

1. Trust the Draios GPG key and configure the yum repository:

    ```shell
    rpm --import https://s3.amazonaws.com/download.draios.com/DRAIOS-GPG-KEY.public
    curl -s -o /etc/yum.repos.d/draios.repo https://s3.amazonaws.com/download.draios.com/stable/rpm/draios.repo
    ```

1. Install the EPEL repository:

    > **Note** — The following command is required only if DKMS is not available in the distribution. You can verify if DKMS is available using `yum list dkms`. If necessary, install it using:

    ```shell
    rpm -i https://mirror.us.leaseweb.net/epel/6/i386/epel-release-6-8.noarch.rpm
    ```

1. Install kernel headers:

    > **Warning** — The following command might not work with any kernel. Make sure to customize the name of the package properly.

    ```shell
    yum -y install kernel-devel-$(uname -r)
    ```

1. Install Falco:

    ```shell
    yum -y install falco
    ```

    To uninstall, run `yum erase falco`.

#### Debian

1. Trust the Draios GPG key, configure the apt repository, and update the package list:

    ```shell
    curl -s https://s3.amazonaws.com/download.draios.com/DRAIOS-GPG-KEY.public | apt-key add -
    curl -s -o /etc/apt/sources.list.d/draios.list https://s3.amazonaws.com/download.draios.com/stable/deb/draios.list
    apt-get update
    ```

1. Install kernel headers:

    > **Warning** — The following command might not work with any kernel. Make sure to customize the name of the package properly.

    ```shell
    apt-get -y install linux-headers-$(uname -r)
    ```

1. Install Falco:

    ```shell
    apt-get install -y falco
    ```

    To uninstall, run `apt-get remove falco`.

## Config Management Systems

You can also install Falco using configuration management systems like [Puppet](#puppet) and [Ansible](#ansible).

### Puppet

A [Puppet](https://puppet.com/) module for Falco, `sysdig-falco`, is available on [Puppet Forge](https://forge.puppet.com/sysdig/falco/readme).

### Ansible

[@juju4](https://github.com/juju4/) has helpfully written an [Ansible](https://ansible.com) role for Falco, `juju4.falco`. It's available on [GitHub](https://github.com/juju4/ansible-falco/) and [Ansible Galaxy](https://galaxy.ansible.com/juju4/falco/). The latest version of Ansible Galaxy (v0.7) doesn't work with Falco 0.9, but the version on GitHub does.

## Docker

If you have full control of your host operating system, then installing Falco using the normal installation method is the recommended best practice. This method allows full visibility into all containers on the host OS. No changes to the standard automatic/manual installation procedures are required.

Falco can also, however, run inside a [Docker](https://docker.com) container. To guarantee a smooth deployment, the kernel headers must be installed in the host operating system before running Falco.

This can usually be done on Debian-like distributions using `apt-get`:

```shell
apt-get -y install linux-headers-$(uname -r)
```

On RHEL-like distributions:

```shell
yum -y install kernel-devel-$(uname -r)
```

Falco can then be running using Docker:

```shell
docker pull falcosecurity/falco
docker run -i -t \
    --name falco \
    --privileged \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro \
    -v /usr:/host/usr:ro \
    falcosecurity/falco
```

To see it in action, also run the [event generator](../event-sources/sample-events) to perform actions that trigger Falco's ruleset:

```shell
docker pull sysdig/falco-event-generator
docker run -it --name falco-event-generator sysdig/falco-event-generator
```

### Using custom rules with the Docker container

The Falco image has a built-in set of rules located at `/etc/falco/falco_rules.yaml` which is suitable for most purposes. However, you may want to provide your own rules file and still use the Falco image. In that case, you should add a volume mapping to map the external rules file to `/etc/falco/falco_rules.yaml` within the container by adding `-v path-to-falco-rules.yaml:/etc/falco/falco_rules.yaml` to your `docker run` command.

## CoreOS

The recommended way to run Falco on CoreOS is inside of its own Docker container using the install commands in the [Docker section](#docker) above. This method allows full visibility into all containers on the host OS.

This method is automatically updated, includes some nice features such as automatic setup and bash completion, and is a generic approach that can be used on other distributions outside CoreOS as well.

However, some users may prefer to run Falco in the CoreOS toolbox. While not the recommended method, this can be achieved by installing Falco inside the toolbox using the normal installation method, and then manually running the `falco-probe-loader` script:

```shell
toolbox --bind=/dev --bind=/var/run/docker.sock
curl -s https://s3.amazonaws.com/download.draios.com/stable/install-falco | bash
falco-probe-loader
```


