---
title: Getting started with gVisor support in Falco
linktitle: Getting started with gVisor support in Falco
description: Learn how to integrate gVisor and Falco on Docker and GKE
date: 2022-09-15
author: Luca Guerra, Lorenzo Susini, Vicente J. Jiménez Miras
slug: intro-gvisor-falco
images:
  - /blog/intro-gvisor-falco/images/intro-gvisor-falco-01.png
  - /blog/intro-gvisor-falco/images/intro-gvisor-falco-02.png
  - /blog/intro-gvisor-falco/images/intro-gvisor-falco-03.png
  - /blog/intro-gvisor-falco/images/intro-gvisor-falco-featured.png
---

_This post has been updated in December 2022 after initial publication. It now contains up-to-date instructions about how to use gVisor support on Docker and Kubernetes with GKE as well! The recommended version for gVisor support is now Falco 0.33.1 or above._

Falco can now work with **[gVisor](https://gvisor.dev/)**! So, what is it and how can we use it?

gVisor, quoting the [official documentation](https://gvisor.dev/docs), is an application kernel that provides an **additional layer of isolation** between running applications and the host operating system. It delivers an additional security boundary for containers by **intercepting and monitoring workload runtime instructions in user space** before they can reach the underlying host.

Falco, on the other hand, works by [monitoring runtime system calls](https://falco.org/docs/), normally in kernel space via a kernel module or an eBPF probe, that are then evaluated against the flexible and powerful [Falco rule engine](https://falco.org/docs/rules/) and so used to trigger security alerts.

Before, Falco could not work with gVisor monitored sandboxes because it is not possible to install a kernel module or eBPF probe in such an environment. But wouldn't it be great to **leverage the stream of system call information that gVisor collects through its powerful monitoring system directly in Falco**? This is exactly what is possible now!

In this article, you will learn:
* [✨ The magic that allows Falco and gVisor to work together](#How-Falco-and-gVisor-work-together)
* [🚀 How to run Falco with gVisor on your host with Docker](#Setup-gVisor-Docker-sandbox-monitoring-with-Falco)
* [☸️ How to run Falco with gVisor on your k8s GKE cluster](#Falco-and-gVisor-on-Kubernetes-with-GKE)

## How Falco and gVisor work together

When running containers with gVisor, there are several components that interact with our workload:

![](/blog/intro-gvisor-falco/images/intro-gvisor-falco-02.png)

The Sentry is the gVisor component that implements all the application kernel functionalities. In particular, from the Falco perspective, the Sentry abstracts the system call layer and manages almost every syscall an application can ever execute. In other words, the Sentry could be seen as an alternative to our drivers: it is in the right position to put together the information contained in the events that our eBPF probe or kernel module usually generates. So, how do we turn the Sentry into a *new driver* for Falco?

The key observation here is that there is one Sentry process for each gVisor sandbox. If we want them to be able to communicate with Falco, we must set up a form of inter-process communication.

We decided to use a UDS (Unix Domain Socket) to handle the communication between each Sentry and Falco. Falco is acting as a server, and it is responsible for setting up the socket and listening to connections. On the other hand, each Sentry process acts as a client, and it is configured to connect to the endpoint where Falco is listening.

Whenever a syscall gets executed inside the sandboxed application, the Sentry will manage it as usual, plus it will send a message to Falco through the UDS. Messages are serialized through Protocol Buffers so that gVisor and Falco can communicate even if they are written in different programming languages.

Once a message related to a syscall is received, Falco unpacks it and creates the corresponding event in a way that is consumable by our libraries. This way, it is possible to update necessary state information and trigger Falco rules whenever a match occurs!

![](/blog/intro-gvisor-falco/images/intro-gvisor-falco-03.png)

## Setup gVisor Docker sandbox monitoring with Falco

First, [install **Falco**](https://falco.org/docs/getting-started/installation/) 0.33.1 or above and [install the **gVisor runsc tool**](https://gvisor.dev/docs/user_guide/install/) 20221122.0 or above.

You can check the version by running:
```bash
falco --version
```
... which needs to report 0.33.1 or above and:
```bash
runsc --version
```
... which needs to report `release-20221122.0` or above.

gVisor needs to be configured to send events to Falco. Generate the appropriate configuration file:

```bash
$ falco --gvisor-generate-config > /tmp/runsc_falco_config.json
$ sudo mv /tmp/runsc_falco_config.json /etc/docker/runsc_falco_config.json

# Don't forget to protect this configuration
$ sudo chmod 640 /etc/docker/runsc_falco_config.json
```

The easiest way to run a gVisor sandbox is by using Docker. For this reason, you need to first [configure Docker to work with gVisor via `runsc install`](https://gvisor.dev/docs/user_guide/quick_start/docker/), and then we're going to update the `runsc` pod init config configuration for our Docker containers:

```bash
$ sudo -e /etc/docker/daemon.json
```

Then, add the `runtimeArgs` key with the `--pod-init-config=` parameter like in the example below:

```json
{
    "runtimes": {
        "runsc": {
            "path": "/usr/local/bin/runsc",

--- Do not forget the comma at the end of the previous line. ---
--- Add the following config, not these instructions.        ---

            "runtimeArgs": [
                "--pod-init-config=/etc/docker/runsc_falco_config.json"

--- End of added config.                                     ---
--- Have I told you not to include these instructions.       ---

            ]
        }
    }
}
```

Then, restart the Docker daemon to let it use the new configuration:

```bash
$ sudo systemctl restart docker
```

## Runtime detection in action

Now it's time to put everything together and see how to use Falco to monitor gVisor sandboxes!
To start monitoring gVisor sandboxes, you can use the `-g` or `--gvisor-config` options, passing the path to the pod init config. Falco uses that config file for two main reasons:

- Extract the path of the UDS that needs to be created
- Create a trace session for all the already existing gVisor sandboxes. New ones will directly connect to the running Falco instance as we configured in the previous step.

### Run Falco stand-alone

Simply run Falco on the command line:

```bash
$ sudo falco --gvisor-config=/etc/docker/runsc_falco_config.json
```

You're now monitoring your gVisor sandboxes!

### Example permanent configuration with Systemd

Alternatively, for a more permanent configuration:

```bash

$ sudo mkdir /etc/systemd/system/falco.service.d
$ cat << EOF | sudo tee /etc/systemd/system/falco.service.d/gvisor.conf
[Service]
ExecStartPre=
ExecStopPost=
ExecStart=
ExecStart=/usr/bin/falco --gvisor-config=/etc/docker/runsc_falco_config.json
PrivateTmp=false
EOF

$ sudo systemctl daemon-reload
$ sudo systemctl restart falco
```
> The parameter PrivateTmp, set to false, inside the unit config file is needed since /etc/docker/runsc_falco_config.json points to /tmp/gvisor.sock.
>
> Changing the /tmp/gvisor.sock file to /run/gvisor.sock would avoid that we have to use that parameter, and the temporary directory would remain private.

Falco will load the configuration indicating it with a line similar to:
```
Thu Jul 21 15:41:58 2022: Enabled event collection from gVisor. Configuration path: /etc/docker/runsc_falco_config.json
```

Now we can run any container with gVisor:

```bash
$ sudo docker run --runtime=runsc -it ubuntu bash
```

If all goes well, the container will start properly configured to be monitored by Falco! To test the detection capabilities, try to trigger a simple rule like *Write below binary dir*:

```bash
$ touch /bin/foo
```

You will see Falco alerting:
```
07:47:42.173335167: Error File below a known binary directory opened for writing (user=root user_loginuid=0 command=touch touch /bin/foo file=/bin/foo parent=bash pcmdline=bash bash gparent=<NA> container_id=f6d77af4ee3d image=ubuntu) container=f6d77af4ee3d pid=8 tid=8
```

### Falco and gVisor in action

If you don't happen to have the time to try it right now, here is a short video showing every step to follow.

<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item"
    src="https://www.youtube.com/embed/zjK1FlSe1ow"
    title="Getting Started with gVisor support in Falco"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>

\
And if you liked this step-by-step tutorial, don't miss the one that Google has published on the gVisor blog: [Configuring Falco with gVisor](https://gvisor.dev/docs/tutorials/falco/).

## Falco and gVisor on Kubernetes with GKE

gVisor can be used to [sandbox pods on GKE](https://cloud.google.com/kubernetes-engine/docs/concepts/sandbox-pods) for higher security. If your cluster has node pools with gVisor support enabled and k8s version at least `1.24.4-gke.1800` or `1.25.0-gke.200`, you can deploy an instance of Falco to monitor them via the [Helm chart](https://github.com/falcosecurity/charts).

```
helm install falco-gvisor falcosecurity/falco -f https://raw.githubusercontent.com/falcosecurity/charts/master/falco/values-gvisor-gke.yaml --namespace falco-gvisor --create-namespace
```

As simple as that! Note that this new instance is completely independent of other Falco instances that you might have that monitor your regular nodes (w/o gVisor sandboxing), so you can decide whether you want to monitor **regular** node pools, **gVisor-enabled** node pools or **both**! 

For more information about these use cases and more check out the [related sections](https://github.com/falcosecurity/charts/blob/master/falco/README.md#about-gvisor) of the Falco Helm chart documentation.

## Limitations and syscall support

Falco supports many [system call events](https://falco.org/docs/rules/supported-events/). For its first release, gVisor does not support all of them. Our focus was to make sure the most important events used in the default rulesets are covered and enough information flows about processes, file descriptors, and connections to maintain consistency of the data throughout the analysis and rule processing. To support an event, the gVisor Sentry needs to emit it and Falco needs to be able to parse and ingest it.


<div style="display: flex; flex-direction: column; justify-content: center; padding-left: 4rem; padding-right: 4rem; padding-top: 2rem">
  <div style="text-align: center;">
    <h3> Falco and gVisor Webinar </h3>
  </div>
  <div>
    Looking for more amazing content about this integration? Then don't forget to register for <a href="https://community.cncf.io/events/details/cncf-cncf-online-programs-presents-cncf-on-demand-webinar-gvisorfalco-strengthen-k8s-container-security-without-losing-visibility/">this CNCF on-demand webinar</a> where you'll learn directly from the experts!
  </div>
  <div style="margin-top: 1rem; border: 2px solid #dddddd; box-shadow: 6px 8px 12px 8px; margin-left: 4rem; margin-right: 4rem;">
    <a href="https://community.cncf.io/events/details/cncf-cncf-online-programs-presents-cncf-on-demand-webinar-gvisorfalco-strengthen-k8s-container-security-without-losing-visibility/"><img alt="Falco and gVisor Webinar" src="/blog/intro-gvisor-falco/images/intro-gvisor-falco-webinar.png"></a>
  </div>
</div>
