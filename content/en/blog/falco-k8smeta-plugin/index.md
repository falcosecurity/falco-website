---
title: How to Deploy Falco with k8s-metacollector + k8smeta Plugin
date: 2024-10-14
author: Aldo Lacuku
slug: falco-k8smeta-plugin
tags: ["Falco","Kubernetes", "Plugin", "Enrichment", "k8s-metacollector", "k8smeta"]
---

In today's cloud-native world, securing Kubernetes environments has become increasingly critical as containerized workloads gain complexity. Falco is designed to monitor and detect anomalous activities in Kubernetes clusters and container environments. By continuously observing system calls and enriching event data with metadata, Falco ensures that any suspicious behavior is detected in real-time, protecting against threats like privilege escalations, file tampering, and network anomalies.

In this tutorial, we will guide you through deploying Falco with two powerful components: [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) and the [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta). These tools significantly enhance Falco’s security event detection by adding important Kubernetes context, such as pod names, namespaces, deployment details, to the alerts.
Additionally, we will explore how to leverage the new [append_output](https://falco.org/docs/outputs/formatting/#appending-extra-output-and-fields-with-append-output) feature introduced in Falco version [0.39.0](https://github.com/falcosecurity/falco/releases/tag/0.39.0). This feature allows you to append extra metadata fields to Falco’s output, without the need to modify your [rules](https://github.com/falcosecurity/rules).

By the end of this guide, you will have a Falco setup capable of detecting security issues in Kubernetes with enriched metadata output, ensuring you get a complete picture of your cluster’s security posture. Whether you're an experienced Kubernetes administrator or just starting to explore container security, this guide will help you make the most of Falco's capabilities in a Kubernetes environment.

### What You'll Learn:

* The purpose and benefits of using the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) and 
  [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta) to enrich Falco alerts with Kubernetes-specific data.
* How to deploy Falco with the [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta) 
  on a Kubernetes cluster.
* How to configure and use the [append_output](https://falco.org/docs/outputs/formatting/#appending-extra-output-and-fields-with-append-output) feature to enhance Falco alerts with additional metadata fields.

### Prerequisites:

* A [working Kubernetes cluster](https://falco.org/docs/getting-started/learning-environments/) and some familiarity with Kubernetes concepts.
* Basic knowledge of Falco and how it works.
* [Helm](https://helm.sh/) installed on your system (for easy deployment of Falco).

Let’s dive in and set up a Falco deployment that will give you deeper security insights for your Kubernetes workloads.

## Step 1: Understanding k8s-metacollector and k8smeta Plugin
As Kubernetes has become the de facto platform for orchestrating containerized applications, it’s important to gain full visibility into what's happening within your cluster, especially when it comes to security monitoring. Falco can detect suspicious activities based on system calls, but to make these alerts more actionable, additional context about your Kubernetes resources (such as pod names, namespaces, and labels) is invaluable.

That’s where the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector)and [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta)  come in.

### What is the k8s-metacollector?
The [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) is responsible for gathering Kubernetes metadata for security events and sending that 
information to Falco. It collects key information for different resources from your Kubernetes cluster, such as:

* Pods;
* Namespaces;
* ReplicaSets;
* Services;
* Deployments;

The collected metadata provides greater clarity about where and why certain events are happening, which is crucial for pinpointing and mitigating security incidents in large-scale Kubernetes environments. Without this context, security alerts may lack the detail needed for quick and effective response.

### What is the k8smeta Plugin?

The [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta) is a source plugin for Falco that works in tandem with the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector). While Falco 
generates alerts based on detected anomalies, the [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta) enriches these alerts with Kubernetes-specific 
metadata, which allows you to understand exactly which Kubernetes entities (pods, deployments, namespaces) are 
involved in the detected event. This context is vital when you're trying to correlate security incidents with the resources they affect.

Key benefits of the k8smeta plugin include:

* Enriched Alerts: Falco alerts become more informative with Kubernetes-specific data like pod names, namespaces, 
  and deployment names.
* Improved Debugging: Knowing exactly which pod or namespace is involved in an alert can significantly reduce the time spent debugging and fixing security issues.
* Event Correlation: The plugin makes it easier to correlate low-level system events with higher-level Kubernetes concepts, providing a clearer view of what's happening in your cluster.

By using the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) and [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta) together, you transform Falco’s raw system call data into rich, actionable insights that give you full visibility into your Kubernetes environment.


## Step 2: Installing Falco, k8s-metacollector, and k8smeta Plugin with Helm and Configuring append_output

Deploying Falco along with the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) and the [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta) using Helm is a seamless process. This step will guide you through adding the Falco Security Helm chart repository, installing Falco, enabling the k8s-metacollector, and configuring the [append_output](https://falco.org/docs/outputs/formatting/#appending-extra-output-and-fields-with-append-output) feature to append Kubernetes metadata to Falco alerts.

### Step 2.1: Add the Falco Helm Chart Repository

Before you install Falco, you need to add the official Falco Security Helm chart repository to your Helm setup. Run the following command:

```bash
helm repo add falcosecurity https://falcosecurity.github.io/charts
```

Update your local Helm repositories to ensure you’re using the latest chart version:

```bash
helm repo update
```

### Step 2.2: Install Falco with k8s-metacollector and append_output

With the repository added, use the following command which includes the additional settings to enable the collection 
of Kubernetes metadata and to append this metadata to Falco alerts:

```bash
helm install falco falcosecurity/falco \
    --version 4.11.1 \
    --namespace falco \
    --create-namespace \
    --set collectors.kubernetes.enabled=true \
    --set tty=true \
    --set-json 'falco.append_output=[{"match": {"source": "syscall"},"extra_output": "pod_uid=%k8smeta.pod.uid, pod_name=%k8smeta.pod.name, namespace_name=%k8smeta.ns.name"}]'
```
Breaking Down the Command:

* `helm install falco falcosercurity/falco`: Installs Falco using the latest chart from the Falco Security repository.
* `--version 4.11.1`: Uses the `4.11.1` version of the chart. At the writing time it's the latest version.
* `--namespace falco`: Deploys Falco into the falco namespace. This helps keep Falco’s resources organized separately 
from other applications.
* `--create-namespace`: Automatically creates the falco namespace if it doesn’t already exist.
* `--set collectors.kubernetes.enabled=true`: Enables the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) and configures the [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta).
* `--set tty=true`: Ensures that Falco logs are emitted as soon as possible.
* `--set-json 'falco.append_output=...'`: Configures the [append_output](https://falco.org/docs/outputs/formatting/#appending-extra-output-and-fields-with-append-output) feature to append specific Kubernetes metadata fields to Falco’s alerts.

#### Why Use the append_output Feature?

The [append_output](https://falco.org/docs/outputs/formatting/#appending-extra-output-and-fields-with-append-output) feature allows you to enrich Falco alerts with additional metadata, providing a clearer view of which Kubernetes resources are involved in each security event. This context helps security teams quickly understand the severity and scope of an incident.

For example, an alert will now include:

* `pod_uid`: To precisely identify the pod.
* `pod_name`: To know which pod triggered the alert.
* `namespace_name`: Namespace where the pod is running.

### Step 2.3: Verifying the Installation

Once the installation is complete, you can verify that Falco and the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) are working as expected by 
checking the status of the Falco pod in the Falco namespace:

```bash
kubectl get pods -n falco
```

You should see the Falco pods running successfully.

## Step 3: Testing the Setup

Now that everything is in place, it's time to test the setup by deploying a simple Nginx pod and triggering Falco to 
generate security alerts enriched with Kubernetes metadata.

### Step 3.1: Deploy an Nginx Pod

To create some activity that Falco can monitor, start by deploying an Nginx pod in the falco namespace:

```bash
kubectl run nginx --image=nginx --namespace falco
```
This command will launch an Nginx container in the falco namespace.

### Step 3.2: Wait for the Nginx Pod to Run

Confirm that the Nginx pod is up and running by checking its status:

```bash
kubectl get pods -n falco
```
Once the pod is in the Running state, you can proceed to the next step.

### Step 3.3: Exec Into the Nginx Pod to Trigger Alerts

Exec into the running Nginx pod to simulate an interactive terminal session, which is something Falco is configured to detect:

```bash
kubectl exec -it nginx -n falco -- /bin/bash
```
This command opens a shell session inside the Nginx container. Inside the container, run some basic commands like ls or echo to generate system calls that Falco can monitor.

### Step 3.4: Check Falco Logs for Alerts

After executing inside the Nginx pod, check the Falco logs to see if any alerts were triggered by the kubectl exec action:

```bash
kubectl logs -n falco -l app.kubernetes.io/name=falco
```
In the logs, you should see alerts related to the interactive terminal session such as:
```bash
13:18:57.434030270: Notice A shell was spawned in a container with an attached terminal (evt_type=execve user=root user_uid=0 user_loginuid=-1 process=bash proc_exepath=/usr/bin/bash parent=containerd-shim command=bash terminal=34816 exe_flags=EXE_WRITABLE|EXE_LOWER_LAYER container_id=7cff9da475c6 container_image=docker.io/library/nginx container_image_tag=latest container_name=nginx k8s_ns=falco k8s_pod_name=nginx) pod_uid=2f20370c-6e0b-44b8-8ea1-2aa786d80f13, pod_name=nginx, namespace_name=falco
```

This confirms that Falco is properly configured to detect activity inside the pod and append useful Kubernetes metadata to the alerts.

## Key Takeaways:
In this tutorial, we explored how to deploy Falco with the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) and [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta) to enhance security monitoring in a Kubernetes environment. By enabling Falco’s [append_output](https://falco.org/docs/outputs/formatting/#appending-extra-output-and-fields-with-append-output) feature, we were able to enrich security alerts with vital Kubernetes metadata such as pod UID, pod name, and namespace, making the alerts more actionable and informative.

* Enhanced Alert Context: By appending Kubernetes metadata, you get more contextualized and meaningful alerts, 
enabling better incident investigation and faster resolution.

* Seamless Integration: Thanks to Helm, deploying Falco alongside the [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) and [k8smeta plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/k8smeta) is 
easy and efficient, requiring just a few simple commands.

* Real-Time Threat Detection: Falco continuously monitors system calls and Kubernetes events in real-time, ensuring 
that you’re always aware of potentially suspicious or malicious activities within your cluster.
