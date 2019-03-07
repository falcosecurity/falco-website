---
title: Kubernetes Audit Events
weight: 2
---

As of Falco 0.13.0, falco supports a second source of events in addition to system call events: [K8s Audit Events](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/#audit-backends). An improved implementation of k8s audit events was introduced in k8s v1.11 and provides a log of requests and responses to [kube-apiserver](https://kubernetes.io/docs/admin/kube-apiserver). Since almost all cluster management tasks are done through the API server, the audit log is a way to track the changes made to your cluster. Examples of this include:

* Creating/destroying pods, services, deployments, daemonsets, etc.
* Creating/updating/removing config maps or secrets
* Attempts to subscribe to changes to any endpoint

We also added additional falco rules that look for notable or suspicious activity, including:

* Creating pods that are privileged, mount sensitive host paths, or use host networking.
* Granting overly broad permissions such as `cluster-admin` to users.
* Creating configmaps with sensitive information.

Once you've configured your cluster with audit logging and selected which events you'd like to pass along to falco, you can write falco rules that read these events and send notifications for suspicious or other notable activity.

## Falco Changes

The overall architecture of Falco remains the same, with events being matched against sets of rules, with a rule identifying suspicious/notable behavior. What's new is that there are two parallel independent streams of events being read separately and matched separately against the sets of rules instead of just one.

To receive k8s audit events, falco embeds a [civetweb](https://github.com/civetweb/civetweb) webserver that listens on a configurable port and accepts `POST` requests on a configurable endpoint. Details on configuring the embedded webserver are on the [config page](../../configuration/config-file). The posted json object comprises the event.
