---
title: "Kubernetes Response Engine, Part 6: Falcosidekick + Cloud Run"
date: 2021-06-25
author: Batuhan Apaydın
slug: falcosidekick-response-engine-part-6-cloud-run
tags: ["Falcosidekick","Integration"]
---

> *This blog post is part of a series of articles about how to create a `Kubernetes` response engine with `Falco`, `Falcosidekick` and a `FaaS`.*
>
> See other posts:
> * [Kubernetes Response Engine, Part 1 : Falcosidekick + Kubeless]({{< ref "/blog/falcosidekick-response-engine-part-1-kubeless" >}})
> * [Kubernetes Response Engine, Part 2 : Falcosidekick + OpenFaas]({{< ref "/blog/falcosidekick-response-engine-part-2-openfass" >}})
> * [Kubernetes Response Engine, Part 3 : Falcosidekick + Knative]({{< ref "/blog/falcosidekick-response-engine-part-3-knative" >}})
> * [Kubernetes Response Engine, Part 4 : Falcosidekick + Tekton]({{< ref "/blog/falcosidekick-response-engine-part-4-tekton" >}})
> * [Kubernetes Response Engine, Part 5 : Falcosidekick + Argo]({{< ref "/blog/falcosidekick-response-engine-part-5-argo" >}})
> * [Kubernetes Response Engine, Part 7: Falcosidekick + Cloud Functions]({{< ref "/blog/falcosidekick-response-engine-part-7-cloud-functions" >}})

---

Recently, we added two new output-type support to Falcosidekick, and they are Cloud Functions, and Cloud Run. This blog post will discuss how to set up Kubernetes Response Engine on GKE (Google Kubernetes Engine) by using Cloud Run.

Let's start by explaining a little bit about Cloud Run. `Cloud Run` is a managed compute platform that enables you to run containers that are invocable via requests or events. `Cloud Run` is serverless: it abstracts away all infrastructure management, so you can focus on what matters most — building great applications.

For more information, see [Cloud Run](https://cloud.google.com/run/docs).

Given below is a reference architecture of what's being explained in this blog.

![cloud_run_reference_arch](/docs/images/cloud_run_reference_arch.png)

This demo might be useful for Google Cloud users who might already be using GKE with `Falco` to protect container runtime against malicious behaviors, and wants to take any action for them with `Cloud Run`.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Prerequisites](#prerequisites)
- [Tutorial](#tutorial)
  - [Provision GKE (Google Kubernetes Engine) Cluster](#provision-gke-google-kubernetes-engine-cluster)
  - [Deploy Cloud Run Function](#deploy-cloud-run-function)
  - [Install Falco + Falcosidekick](#install-falco--falcosidekick)
  - [Test](#test)
- [Conclusion](#conclusion)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Prerequisites

- gcloud 342.0.0
- ko 0.8.3

## Tutorial

### Provision GKE (Google Kubernetes Engine) Cluster

First, let us create a GKE cluster.

```shell
$ GKE_CLUSTER_NAME=cloud-run-demo
$ gcloud container clusters create $GKE_CLUSTER_NAME
```

To learn more about the setup GKE Cluster, see [quickstart guide](https://cloud.google.com/kubernetes-engine/docs/quickstart#create_cluster).

### Deploy Cloud Run Function

Once GKE is set up, we are ready to deploy Cloud Run. But before doing that, let us examine the responsibility of the Cloud Run function. As you can see in the reference architecture, this function will delete the pwned pods. To be able to do that, Cloud Run should be given appropriate permissions.

There are two approaches to obtain these permissions.

- The first approach is creating a Kubernetes Service Account, an appropriate Role with granted permissions to delete pod resource, and a RoleBinding to bind Role to Service Account. Then create the kubeconfig file, package it up with the function code while deploying the Cloud Run function, and use this file to create a Kubernetes client.

To learn more about the kubeconfig files, see [kubeconfig](https://ahmet.im/blog/mastering-kubeconfig/).

- The second approach is producing a valid ~/.kube/config with a library called google.golang.org/api/ within the function code. We are doing this because the representation of the valid ~/.kube/config file is [clientcmd/api/Config](https://pkg.go.dev/k8s.io/client-go@v0.21.1/tools/clientcmd/api#Config) in Go.

We'll go with the second approach in this demo. Thanks to Scott Blum and his detailed [blog post](https://bionic.fullstory.com/connect-to-google-kubernetes-with-gcp-credentials-and-pure-golang/) on this topic. I highly recommend that you check that out.

Let's deploy the function. If you want to take a look at the function code, see the [repository](github.com:developer-guy/kubernetes-response-engine-based-on-gke-and-cloud-run.git).

Note that we're going to use the ko tool to build and push our container image which is created by Google. ko is a simple and fast container image builder for Go applications.

To learn more, see the [official repository](https://github.com/google/ko) of the project.

We are also going to use Container Registry as an image repository service provided by the Google Cloud to store, manage, and secure your Docker container images. Alternatively, you can also use DockerHub, quay.io, etc.

```shell
$ git clone https://github.com/developer-guy/kubernetes-response-engine-based-on-gke-and-cloud-run.git
$ cd kubernetes-response-engine-based-on-gke-and-cloud-run
$ GKE_CLUSTER_NAME=$(kubectl config view --minify -o jsonpath='{.clusters[].name}{"\n"}')
$ PROJECT_ID=$(gcloud config get-value project)
$ FUNCTION_NAME=pod-deleter
$ export KO_DOCKER_REPO=gcr.io/$PROJECT_ID # Please, change this variable if you are not using Container Registry.
$ gcloud config set run/region us-west1
$ gcloud config set run/platform managed
$ gcloud run deploy $FUNCTION_NAME --image=$(ko publish .) \
    --set-env-vars GKE_CLUSTER_NAME=$GKE_CLUSTER_NAME \
    --set-env-vars PROJECT_ID=$PROJECT_ID
...
Allow unauthenticated invocations to [pod-deleter] (y/N)?  N

Deploying container to Cloud Run service [pod-deleter] in project [developerguy-311909] region [us-west1]
✓ Deploying... Done.
  ✓ Creating Revision...
  ✓ Routing traffic...
Done.
Service [pod-deleter] revision [pod-deleter-00002-cej] has been deployed and is serving 100 percent of traffic.
Service URL: https://pod-deleter-uoz6q2wria-uw.a.run.app
```

### Install Falco + Falcosidekick

Now, it is time to set up `Falco`, `Falcosidekick` with the `Cloud Run` output type enabled.

```shell
$ kubectl create namespace falco
$ helm repo add falcosecurity https://falcosecurity.github.io/charts
$ helm repo update
$ helm install falco falcosecurity/falco --namespace falco \
--set ebpf.enabled=true \
--set falcosidekick.enabled=true \
--set falcosidekick.webui.enabled=true \
--set falcosidekick.config.gcp.cloudrun.endpoint=$(gcloud run services list --format json | jq -r ".[] | select(.metadata.name==\"$FUNCTION_NAME\") | .status.address.url") \
--set falcosidekick.config.gcp.cloudrun.jwt=$(gcloud auth print-identity-token)
```

Check the logs to see if `Cloud Run` output enabled for Falcosidekick.

```shell
$ kubectl logs -f falco-falcosidekick-7cd7bc6859-2nd9t --namespace falco
falco-falcosidekick-7cd7bc6859-2nd9t falcosidekick 2021/06/07 16:03:14 [INFO]  : Enabled Outputs : [GCPCloudRun WebUI]
falco-falcosidekick-7cd7bc6859-2nd9t falcosidekick 2021/06/07 16:03:14 [INFO]  : Falco Sidekick is up and listening on :2801
...
```

If you see the GCPCloudRun in the list of enabled outputs, you can confirm that everything is working as expected 👍.

### Test

Let us start by creating a test pod:

```shell
$ kubectl run alpine --namespace default --image=alpine --restart='Never' -- sh -c "sleep 600"
pod/alpine created
```

```shell
$ kubectl get pods --namespace default
AME     READY   STATUS    RESTARTS   AGE
alpine   1/1     Running   0          11s
```

Let's run a *shell* command inside and see what happens:

```shell
$ kubectl exec -i --tty alpine --namespace default -- sh -c "uptime"
19:27:21 up 50 min,  load average: 0.11, 0.12, 0.11
```

As expected the command returned the output. However, the status of the pod we retrieved is Terminating as follows:

```shell
$ kubectl get pods --namespace default
NAME     READY   STATUS        RESTARTS   AGE
alpine   1/1     Terminating   0          103s
```

To investigate further, check the logs of the Cloud Run function from the Google Cloud Console:

![cloud_run_function_output](/docs/images/cloud_run_function_outout.png)

Let us check the logs of Falco and Falcosidekick to see what happened.

```shell
 $ kubectl logs daemonset/falco --namespace falco
..
{"output":"19:27:21.002873265: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine container=97c9868ea832 shell=sh parent=runc cmdline=sh -c uptime terminal=34816 container_id=97c9868ea832 image=alpine) k8s.ns=default k8s.pod=alpine container=97c9868ea832","priority":"Notice","rule":"Terminal shell in container","time":"2021-04-10T19:27:21.002873265Z", "output_fields": {"container.id":"97c9868ea832","container.image.repository":"alpine","evt.time":1618082841002873265,"k8s.ns.name":"default","k8s.pod.name":"alpine","proc.cmdline":"sh -c uptime","proc.name":"sh","proc.pname":"runc","proc.tty":34816,"user.loginuid":-1,"user.name":"root"}}
...
```

For `Falcosidekick`:

```shell
$ kubectl logs deployment/falco-falcosidekick --namespace falco
2021/06/07 16:03:15 [INFO]  : GCPCloudRun - Post OK (200)
2021/06/07 16:03:15 [INFO]  : GCPCloudRun - Function Response : OK
..
```

## Conclusion

We got another way to create a Response Engine with amazing pieces of software from the Open Source world. Of course, it's just the beginning, feel free to share your functions and workflows with the community for creating a library of remediation methods.

If you would like to find out more about Falco:

- Get started in [Falco.org](http://falco.org/).
- Check out the
  [Falco project in GitHub](https://github.com/falcosecurity/falco).
- Get involved in the [Falco community](https://falco.org/community/).
- Meet the maintainers on the
  [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
- Follow [@falco_org on Twitter](https://twitter.com/falco_org).
