---
title: We love Kubernetes! Which is why we don't want you to run Falco there.
description: Understanding our decision to recommend running Falco natively on Linux hosts.
date: 2020-04-20
author: Kris Nóva
---

Since joining [Sysdig, Inc](https://sysdig.com) in August of 2019 I have enjoyed watching The Falco Project grow and gain adoption. 

As the project has grown The Falco Community has been discussing introducing a concept of **official support** given the overwhelming requests for support for various installation methods. 

This new idea would set a clear scope for which artifacts, and avenues the project has agreed to support for the community. 
The motivation behind this is that we would live to give the community a minimal set of artifacts and installation avenues to support while keeping the project accessible, secure, and resilient. 

{{< success >}}

It is important to understand what we mean by "support" in this context. We are simply defining the artifacts and avenues in which The Falco Project claims responsibility for maintaining. 

Any contributor will always be able to create and document any third-party integration with full endorsement and resources from the community.

{{< /success >}}

So to start, let's look at the goals and constraints of what we would like to achieve for our official installation methods.

## Goals

**Accessible**: A standard Linux user should easily be able to get Falco up and running in just a few minutes. 
This includes understanding Falco, downloading Falco, installing Falco, and demonstrating that it does what it advertises to do. 

**Secure**: Falco at it's core is a security project. 
In an attempt to lead by example, we have to take all security concerns seriously. 
Falco is a powerful tool, and by nature the project should not endorse running Falco in such a way that it can compromise itself. 
In short, we don't think Falco should alert against it self. We should see to this not by bypassing the alerts, but rather by truly running Falco in a safe way.

**Resilient**: Falco should be hard to break, and should be there when unexpected things happen.
Falco should also run at the lowest level of a system, without exposing itself to lateral exploits at the level it's running. 
In other words, we don't think a last line of defense should be running at the same layer we hope to be protecting. 

## Constraints 

**Minimal set up artifacts**: In an attempt to simplify what The Falco Project is responsible for building, hosting, and documenting we aim to provide a "lowest common ancestor" approach given the goals above. 

**Falco cannot alert against itself**: We cannot treat Falco any different than another application. If given avenue is a risk and is something the community has agreed to support we MUST fix it. 

**5 Minutes or less check**: A reasonably modern Linux user with backend access to a system should be able to install, manage, and observe Falco in 5 minutes or less.

## Official Support - Falco on Linux with Systemd

So after a few months of deliberation in the [Falco community](https://github.com/falco/community) we have decided to only support (and strongly encourage) Falco running on the host system in a Cloud Native environment. 

This means that The Falco Community will only support installations where Falco is running on the underlying host and was installed using one of the supported Linux packages.

 - Debian/Ubuntu (`.deb` packages)
 - RHEL/EC2 Linux/CentOS (`.rpm` packages)
 - Binary installation (`.tar.gz` packages)
 
[Read more](https://falco.org/docs/installation) in the documentation.
 
Furthermore we will support a handful of container images as a community. These images will only contain the userspace component of the Falco process, and will still require a driver installed on the underlying host to work. 

As a project we will encourage installation using the packages above, and deployment via `systemd` or `init` on older systems. 
We will support running the userspace component in a container, and users can install a driver as they prefer. 


## The Kubernetes Story 

We understand that most Cloud Native end-users run their applications in Kubernetes. This is the main reason we suggest for Falco NOT to run in Kubernetes. 

{{< info >}}

**Where should I run Falco then**?  

The main work horse behind Kubernetes is called the Kubelet and is installed using a `systemd` unit file.
We hope to mirror that same functionality with Falco. 

{{< /info >}} 

Lateral movement is a well known attack vector and given the complexity of Kubernetes we suggest that Falco should run **beside** Kubernetes, instead of **on top** of Kubernetes. 
In the event that an application or cluster is compromised having a set of checks and balances running at a different level of the stack provides resilience against these zero day situations. 

We hope that administrators see the wisdom in running Falco as a `systemd` unit. Falco offers an easy to use gRPC API where a Kubernetes pod could safely consume Falco events and shuttle them around the rest of the cluster as needed. 

## Reviewing our Installation methods
 
As we began exploring deployment and installation avenues we started to look at things such as the Falco static manifests, the `helm` chart, and even the complexity of the container images we built. 

We started to notice that all of these installation methods involved a large amount of complexity when it came time to ensure a driver was installed. Why? 
Because by design Kubernetes has limited or no access to the layer of the stack that we need to gain access to in order to set up the driver, the kernel. 
 
So while in some cases we were able to "work around" this limitation, these "work arounds" weren't a viable long term solution. In the case of the `helm` chart and the static manifests we blatantly exploited a well known vector in Kubernetes such that Falco would alert against itself upon installation.

As a security tool, this was concerning.
As an engineering org, this was a red flag that we were trying to do something we shouldn't be doing. 
As a project, this was causing a lot of confusion. 

We hope that users will understand that having Falco running in the system it is supposed to be watching, fundamentally doesn't make very much sense.

{{< info >}}

**Will Falco still work with Kubernetes**?  

Absolutely. 

Falco by design is built to work with Kubernetes. 
It will continue to consume Kubernetes events, and alert against Kubernetes anomalies in the exact same way it always has. 

{{< /info >}} 

{{< info >}}

**What if this impacts my deployment of Falco**?  

Remember nothing in the existing Falco ecosystem will change other than our documentation around what is and isn't an officially supported installation method. 
If you are still impacted by this and were unable to be apart of the planning sessions please reach out to the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev) so we can immediately look at your concern. 


{{< /info >}} 

  
## Third Party Integrations

There are many open source projects that Falco has integrated with such as `helm`, `minikube`, `kubernetes`, `prometheus`, and even configuration management systems such as `puppet`, `chef`, and `ansible`. 

The Falco Community will have a space to document these integrations, and will provide a space for the community to work and build out these integrations in a safe, and productive way.

We will characterize them as third-party integrations, and will keep them separated from the small scope of the supported artifacts mentioned above so that they can grow as needed. 

Furthermore we hope to start offering a "Falco Install" container that will use the privilege escalation method defined earlier to simply install Falco on the host, and exit so that users who are bound by the Kubernetes API can still get Falco installed.


{{< info >}}

**Will Falco still work with my cloud provider**?  

Yes.

There will be many options for running Falco in various cloud providers, and as a community we will be working on tooling to make this a seamless experience while still adhering to our constraints. 

{{< /info >}} 

