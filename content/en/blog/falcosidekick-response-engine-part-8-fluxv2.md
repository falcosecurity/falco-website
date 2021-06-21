---
title: "Kubernetes Response Engine, Part 8: Falcosidekick + Flux v2"
date: 2021-06-21
author: Batuhan Apaydın
slug: falcosidekick-reponse-engine-part-8-fluxv2
---

> *This blog post is part of a series of articles about how to create a `Kubernetes` response engine with `Falco`, `Falcosidekick` and a `FaaS`.*
> 
> See other posts:
> * [Kubernetes Response Engine, Part 1 : Falcosidekick + Kubeless]({{< ref "/blog/falcosidekick-reponse-engine-part-1-kubeless" >}})
> * [Kubernetes Response Engine, Part 2 : Falcosidekick + OpenFaas]({{< ref "/blog/falcosidekick-reponse-engine-part-2-openfass" >}})
> * [Kubernetes Response Engine, Part 3 : Falcosidekick + Knative]({{< ref "/blog/falcosidekick-reponse-engine-part-3-knative" >}})
> * [Kubernetes Response Engine, Part 4 : Falcosidekick + Tekton]({{< ref "/blog/falcosidekick-reponse-engine-part-4-tekton" >}})
> * [Kubernetes Response Engine, Part 5 : Falcosidekick + Argo]({{< ref "/blog/falcosidekick-reponse-engine-part-5-argo" >}})

----

Today, we will set up another KRE (Kubernetes Response Engine) based on Flux v2. If you don't know about Flux v2, let me explain it in a few words. Flux is a tool for keeping Kubernetes clusters in sync with sources of configuration (like Git repositories), and automating updates to configuration when there is new code to deploy.

To learn more about Flux v2, see [Flux Documentation](https://fluxcd.io/docs/).

You might be thinking, Flux v2 sounds like a GitOps tool, really it is btw, how does it fit to the KRE setup, because in the previous blog posts related to set up KRE, we used some kind of eventing systems such as `Knative Eventing`, `Tekton Triggers`, `Argo Events`, etc to forward events from one point to another but Flux v2 is not supporting the same kind of eventing systems by it's design because you know it is just a GitOps tool, it basically watches GitHub repositories for changes, keeps the current state and the desired state always in sync, and it is doing that on top of Kubernetes with the make use of a bunch of CRs (Custom Resources). In order to set up KRE with Flux v2, we will create a small go project that listens events and updates the GitHub repository which Flux v2 monitors for changes to change the desired state for example get the event of pwned pod, then change it's replicas to a zero within the deployment.yaml file.

Given below is a reference architecture of what's being explained in this blog.

![kre_flux_v2_gitops_toolkit](/docs/images/kre_flux_v2_gitops_toolkit.png)

## Prerequisites

* minikube v1.20.0
* helm v3.6.0+g7f2df64
* kubectl v1.21.1

## Tutorial

### Provision local Kubernetes Cluster

```shell
minikube start
```

### Install Flux V2 - GitOps Toolkit

I highly recommended you to check it out [getting started](https://fluxcd.io/docs/get-started/) page of `Flux v2` to learn more about detailed installation of Flux v2 before jump into the next sections.

We have to define token and username informations for Flux v2 to successfully create a GitHub repository for its resources. Flux is installed in a GitOps way and its manifest will be pushed to the repository.

```shell
export GITHUB_TOKEN=<token>
export GITHUB_USER=<username>
```

Once we defined the necessary environment variables, we can install Flux v2. This command will create and push its manifests to the repository, then install Flux components.

```shell
flux bootstrap github \
  --owner=$GITHUB_USER \
  --repository=fleet-infra \
  --branch=main \
  --path=./clusters/my-cluster \
  --personal
```

After we installed the Flux v2 components, the next step is creating our  [GitRepository](./alpine-gitsource.yaml) and [Kustomization](./alpine-kustomization.yaml) CRD's (Custom Resource Definitions). If you want to learn more about them, you can visit this [link](https://fluxcd.io/docs/components/).

You can apply these files like the following:

```shell
kubectl apply -f alpine-gitsource.yaml -f alpine-kustomization.yaml
```

or you can use the [Flux CLI](https://fluxcd.io/docs/cmd/#installation) to do the same thing.

To create `GitRepository`:

```shell
flux create source git alpine \
    --url https://github.com/developer-guy/desired-state-repository \
    --branch master \
    --interval 30s
```

To create `Kustomization`:

```shell
flux create kustomization alpine \
    --source alpine \
    --path "./" \
    --prune true \
    --validation client \
    --interval 5m
```

### Install falco-event-listener

As the name suggests, this project will listen to an event in form of `CloudEvents` that forwarded from Falcosidekick which is a simple daemon for enhancing available outputs for Falco. Once, an event received from Falcosidekick, this project will update the YAML definition to scale its replicas to zero based on the informations in the event.

At the end of the day, the architecture of the demo is going to be:

Falco w/HTTP --> Falcosidekick w/CloudEvent --> falco-event-listener

If you want to learn more about `CloudEvents`, you can follow this [link](https://cloudevents.io).

Let's clone the project's repository first.

```shell
git clone https://github.com/developer-guy/falco-event-listener
cd falco-event-listener
```

This project is basically a CLI application and uses the following [arguments](https://github.com/developer-guy/falco-event-listener/blob/master/falcoeventlistener.yaml#L12):

```yaml
args:
  - "--owner"
  - "developer-guy" # this is the owner of the desired state repository
  - "--repository"
  - "desired-state-repository" # this is the repository which we store desired state configurations
  - "--file"
  - "alpine.yaml" # this is the file that we are going to update
  - "--github-token"
  - "$(GITHUB_TOKEN)"
```

Before installing this project, we have to [create a GitHub PAT (Personal Access Token)](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) to update the desired state configurations which is in GitHub repository after we detect a malicious behaviour related to our Pod.

As you can see in the above arguments, we should pass `GITHUB_TOKEN` as an argument to our CLI application, in order to do that in Kubernetes environment, the best option is storing `GITHUB_TOKEN` in a Kubernetes Secret and [using Secret as environment variables](https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-environment-variables).

```shell
kubectl create namespace falco
kubectl create secret generic github-secret \
         --from-literal GITHUB_TOKEN=$GITHUB_TOKEN \
         --namespace falco
```

Last but least, we're going to use `ko` tool which is created by Google to build, push our container image and deploy the project on Kubernetes cluster. `ko` is a simple, fast container image builder for Go applications.

If you want to learn more about it, you can follow the [official repository](https://github.com/google/ko) of the project.

We are also going to use `Container Registry` as an image repository service provided by the Google Cloud to Store, manage, and secure your Docker container images, but this is not an only the option for this demo, you can use `DockerHub`, `quay.io`, etc.

```shell
export PROJECT_ID=$(gcloud config get-value project)
export KO_DOCKER_REPO=gcr.io/$PROJECT_ID
ko apply -f falcoeventlistener.yaml
```

> If you are using private container registry, don't forget to create a registry secret to be able to pull and push images. You can follow the following guide to achieve this:                                                       
https://colinwilson.uk/2020/07/09/using-google-container-registry-with-kubernetes/

If everything works well, we should see the similar output below:

```shell
$ kubectl get pods --namespace falco
NAME                   READY   STATUS    RESTARTS   AGE
falco-event-listener   1/1     Running   0          59s
```

The last thing we have to do is installing `Falco`, `Falcosidekick` and configuring `Falcodekick` to forward events to our project.

### Installing Falco and Falcosidekick

There is a up-to-date and detail guide available to install `Falco` and `Falcosidekick`, you can follow this [link](https://github.com/falcosecurity/charts/blob/master/falcosidekick/README.md#installing-the-chart) to learn more about installing them.

Here is that we are going to enable `CloudEvents` support of Falcosidekick.

```shell
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
helm upgrade --install falco falcosecurity/falco \
  --namespace falco \
  --set falcosidekick.enabled=true \
  --set falcosidekick.webui.enabled=true \
  --set falcosidekick.config.cloudevents.address=http://falco-event-listener
```

Verify if everything is working before move on to the next step.

```shell
$ kubectl get pods --namespace falco
NAME                                      READY   STATUS    RESTARTS   AGE
falco-event-listener                      1/1     Running   0          5m19s
falco-falcosidekick-5854669c76-ddvrv      1/1     Running   0          2m16s
falco-falcosidekick-5854669c76-rdlqn      1/1     Running   0          2m16s
falco-falcosidekick-ui-7c5fc8dd54-q4qh9   1/1     Running   0          2m16s
falco-vkl4f                               1/1     Running   0          2m16s
```

## Test

To test this, we have to connect a shell within the container.

Let's list the pods that we already have.

```shell
$ kubectl get pods
NAME                                 READY   STATUS    RESTARTS   AGE
alpine-deployment-77789455d6-m7flp   1/1     Running   15         3h6m
alpine-deployment-77789455d6-v7fkw   1/1     Running   15         3h6m
podinfo-6df788c7b8-gs5qb             1/1     Running   0          3h28m
podinfo-6df788c7b8-sfxvd             1/1     Running   0          3h28m
```

Now, run the following command to connect a shell.

```shell
$ kubectl exec -ti alpine-deployment-77789455d6-m7flp -- sh -c "uptime"
19:35:58 up  3:04,  load average: 3.12, 1.91, 1.22
```

Once you run the command above, Falco will detect that malicious behavior and send it to the Falcosidekick via HTTP.

You should see the similar output below in the `Falco` logs:

```shell
{"output":"19:35:58.532086161: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine-deployment-77789455d6-m7flp container=788861c3cf83 shell=sh parent=runc cmdline=sh -c uptime terminal=34816 container_id=788861c3cf83 image=alpine) k8s.ns=default k8s.pod=alpine-deployment-77789455d6-m7flp container=788861c3cf83","priority":"Notice","rule":"Terminal shell in container","time":"2021-06-13T19:35:58.532086161Z", "output_fields": {"container.id":"788861c3cf83","container.image.repository":"alpine","evt.time":1623612958532086161,"k8s.ns.name":"default","k8s.pod.name":"alpine-deployment-77789455d6-m7flp","proc.cmdline":"sh -c uptime","proc.name":"sh","proc.pname":"runc","proc.tty":34816,"user.loginuid":-1,"user.name":"root"}}
```

and the similar output below in the `Falcosidekick` logs:

```shell
falco-falcosidekick-5854669c76-ddvrv falcosidekick 2021/06/13 19:51:45 [INFO] : CloudEvents - Send OK
```

and the similar output below in the `falco-event-listener` logs:

```shell
falco-event-listener falco-event-listener 2021/06/13 19:35:59 resp.Status=200 OK
falco-event-listener falco-event-listener 2021/06/13 19:35:59 resp.StatusCode=200
falco-event-listener falco-event-listener 2021/06/13 19:35:59 [Terminal shell in container] scaled down to zero alpine-deployment-77789455d6-m7flp from default because 19:35:58.532086161: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine-deployment-77789455d6-m7flp container=788861c3cf83 shell=sh parent=runc cmdline=sh -c uptime terminal=34816 container_id=788861c3cf83 image=alpine) k8s.ns=default k8s.pod=alpine-deployment-77789455d6-m7flp container=788861c3cf83
```

You should also notice that there is a new commit in the `desired-state-repository` like the following picture:

![update_desired_state_repository](/docs/images/update_desired_state_repository.png)

After that commit, Flux v2 will detect that change and sync the current state of the cluster with the desired state in the GitHub repository, so the Pods of the `alpine` deployment will be terminated.

```shell
$ kubectl get pods -l app=alpine
No resources found in default namespace.
```