---
title: Deploy on Kubernetes with the Operator
description: Learn how to deploy Falco on Kubernetes using the Falco Operator
slug: operator
weight: 5
---

{{% pageinfo color="primary" %}}
The **Falco Operator** is the recommended way to deploy and manage Falco on Kubernetes. It provides a declarative, Kubernetes-native experience for managing Falco instances, detection rules, plugins, and configuration through Custom Resources.

Going forward, the Falco Operator will become the standard deployment method for Falco on Kubernetes. The existing [Helm chart](/docs/setup/kubernetes/) remains fully supported during the transition period.
{{% /pageinfo %}}

## Overview

The [Falco Operator](https://github.com/falcosecurity/falco-operator) manages the full Falco ecosystem through Kubernetes Custom Resources:

- **Falco Operator** - Manages Falco instances (DaemonSet or Deployment mode) and ecosystem components
- **Artifact Operator** - Manages rules, plugins, and configuration fragments (runs as a sidecar in each Falco pod)

The operator uses **five Custom Resource Definitions (CRDs)** across two API groups:

| CRD | API Group | Purpose |
|-----|-----------|---------|
| `Falco` | `instance.falcosecurity.dev/v1alpha1` | Define and manage a Falco instance |
| `Component` | `instance.falcosecurity.dev/v1alpha1` | Deploy ecosystem components (Falcosidekick, Falcosidekick UI, k8s-metacollector) |
| `Rulesfile` | `artifact.falcosecurity.dev/v1alpha1` | Manage detection rules (OCI, inline YAML, or ConfigMap) |
| `Plugin` | `artifact.falcosecurity.dev/v1alpha1` | Manage Falco plugins from OCI registries |
| `Config` | `artifact.falcosecurity.dev/v1alpha1` | Manage configuration fragments (inline YAML or ConfigMap) |

## Prerequisites

- Kubernetes 1.29+ (native sidecar support required)
- `kubectl` installed and configured
- Cluster admin privileges (for CRD and ClusterRole installation)

## Install the Operator

Install the Falco Operator with a single command:

```shell
VERSION=latest
if [ "$VERSION" = "latest" ]; then
  kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/latest/download/install.yaml
else
  kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/download/${VERSION}/install.yaml
fi
```

This creates:
- 5 CRDs
- The `falco-operator` namespace
- A ServiceAccount, ClusterRole, and ClusterRoleBinding
- The operator Deployment

Verify the operator is running:

```shell
kubectl get pods -n falco-operator
kubectl wait pods --for=condition=Ready --all -n falco-operator
```

## Full Stack Quickstart

Want to deploy the entire Falco ecosystem in one command? The quickstart manifest deploys everything in the `falco` namespace: Falco, detection rules, container and k8smeta plugins, Falcosidekick, Falcosidekick UI with Redis, k8s-metacollector, and the configuration to wire them all together:

```shell
VERSION=latest
if [ "$VERSION" = "latest" ]; then
  kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/latest/download/quickstart.yaml
else
  kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/download/${VERSION}/quickstart.yaml
fi
```

Verify everything is running:

```shell
kubectl get falco,plugins,rulesfiles,configs,components -n falco
kubectl get pods -n falco
```

All resources should show `Reconciled: True` and `Available: True`. All pods should be `Running`.

To uninstall (order matters - artifacts first so the sidecar can process finalizer cleanup):

```shell
# 1. Artifacts first
kubectl delete configs,rulesfiles,plugins --all -n falco
# 2. Instances and components
kubectl delete components,falcos --all -n falco
# 3. Infrastructure
kubectl delete statefulset falcosidekick-ui-redis -n falco
kubectl delete svc falcosidekick-ui-redis -n falco
# 4. Namespace
kubectl delete namespace falco
```

> To configure Falcosidekick outputs (Slack, Elasticsearch, S3, etc.), see the [Falcosidekick documentation](https://github.com/falcosecurity/falcosidekick#outputs).

{{% pageinfo color="info" %}}
If you prefer to deploy components individually and customize each one, follow the step-by-step quickstart below.
{{% /pageinfo %}}

## Step-by-Step Quickstart

### Deploy Falco

Create a Falco instance with default settings (DaemonSet mode, `modern_ebpf` driver):

```shell
cat <<EOF | kubectl apply -f -
apiVersion: instance.falcosecurity.dev/v1alpha1
kind: Falco
metadata:
  name: falco
spec: {}
EOF
```

Check that Falco pods are running on your nodes:

```shell
kubectl get falco
kubectl get pods -l app.kubernetes.io/name=falco
```

{{% pageinfo color="info" %}}
Falco starts in idle mode until you provide detection rules. The next steps add the container plugin and rules to activate monitoring.
{{% /pageinfo %}}

### Add the Container Plugin

{{% pageinfo color="warning" %}}
The official Falco rules use fields like `container.id` and `container.image.repository` that require the [container plugin](https://github.com/falcosecurity/plugins/tree/main/plugins/container). Without it, rules referencing container metadata fields will not work. Always load the container plugin **before** adding rules.
{{% /pageinfo %}}

```shell
cat <<EOF | kubectl apply -f -
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Plugin
metadata:
  name: container
spec:
  ociArtifact:
    image:
      repository: falcosecurity/plugins/plugin/container
      tag: latest
    registry:
      name: ghcr.io
EOF
```

### Add Detection Rules

Load the official Falco rules from the OCI registry:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Rulesfile
metadata:
  name: falco-rules
spec:
  ociArtifact:
    image:
      repository: falcosecurity/rules/falco-rules
      tag: latest
    registry:
      name: ghcr.io
  priority: 50
EOF
```

Check the rulesfile status:

```shell
kubectl get rulesfiles
```

Falco will automatically pick up the rules and start monitoring.

{{% pageinfo color="info" %}}
The `registry.name` field defaults to `ghcr.io` when omitted. The `image.tag` field defaults to `latest`.
{{% /pageinfo %}}

Rules can also come from inline YAML or Kubernetes ConfigMaps. See the [Rulesfile CRD reference](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/rulesfile.md) for all options.

### Add Other Plugins

Load additional plugins from OCI registries. For example, the k8saudit plugin for Kubernetes audit log monitoring:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Plugin
metadata:
  name: k8saudit
spec:
  ociArtifact:
    image:
      repository: falcosecurity/plugins/plugin/k8saudit
      tag: latest
    registry:
      name: ghcr.io
EOF
```

See the [Plugin CRD reference](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/plugin.md) for configuration options.

### Add Ecosystem Components

The operator can deploy ecosystem components alongside Falco using the `Component` CRD.

#### Falcosidekick

Deploy [Falcosidekick](https://github.com/falcosecurity/falcosidekick) to route Falco events to 70+ integrations:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: instance.falcosecurity.dev/v1alpha1
kind: Component
metadata:
  name: sidekick
spec:
  component:
    type: falcosidekick
  replicas: 2
EOF
```

Then configure Falco to send events to Falcosidekick:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Config
metadata:
  name: sidekick-output
spec:
  config:
    json_output: true
    http_output:
      enabled: true
      url: "http://sidekick:2801"
  priority: 60
EOF
```

#### Falcosidekick UI

Deploy the web dashboard for event visualization. Requires a Redis instance:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: instance.falcosecurity.dev/v1alpha1
kind: Component
metadata:
  name: sidekick-ui
spec:
  component:
    type: falcosidekick-ui
  replicas: 2
EOF
```

{{% pageinfo color="warning" %}}
Falcosidekick UI requires an external Redis instance. If Redis is not available, pods will stay in `Init:0/1` state until Redis becomes reachable. See the [Component CRD reference](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/component.md#falcosidekick-ui-with-redis) for a complete example with a bundled Redis StatefulSet.
{{% /pageinfo %}}

#### k8s-metacollector

Deploy the centralized Kubernetes metadata collector:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: instance.falcosecurity.dev/v1alpha1
kind: Component
metadata:
  name: metacollector
spec:
  component:
    type: metacollector
  replicas: 1
EOF
```

### Customize Configuration

Override Falco configuration with Config resources:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Config
metadata:
  name: custom-config
spec:
  config:
    engine:
      kind: modern_ebpf
      modern_ebpf:
        buf_size_preset: 4
    output_timeout: 2000
  priority: 50
EOF
```

Configuration fragments are applied in priority order (0–99) and merged with the base configuration. You can target specific nodes using label selectors. See the [Config CRD reference](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/config.md).

### Deployment Modes

The operator supports two deployment modes:

#### DaemonSet (default)

Runs Falco on every node for cluster-wide syscall monitoring using the `modern_ebpf` driver. This is the standard deployment for runtime security.

```yaml
spec:
  type: DaemonSet
```

#### Deployment

Runs Falco as a regular Deployment instead of a DaemonSet.

```yaml
spec:
  type: Deployment
  replicas: 2
```

## Uninstall

Remove resources in the correct order, artifacts first (so the sidecar can clean up finalizers), then instances, then the operator:

```shell
# 1. Remove artifact resources first
kubectl delete rulesfiles --all --all-namespaces
kubectl delete plugins --all --all-namespaces
kubectl delete configs --all --all-namespaces

# 2. Remove instance resources
kubectl delete components --all --all-namespaces
kubectl delete falco --all --all-namespaces

# 3. Remove the operator and CRDs
kubectl delete -f https://github.com/falcosecurity/falco-operator/releases/latest/download/install.yaml
```

{{% pageinfo color="warning" %}}
Deleting Falco instances before artifacts will terminate the Artifact Operator sidecar, leaving artifact finalizers unresolved. Always delete artifact resources (`Rulesfile`, `Plugin`, `Config`) before Falco instances.
{{% /pageinfo %}}

## Learn More

For complete documentation, including the CRD reference, architecture overview, migration guide, and contributing instructions, visit the [Falco Operator repository](https://github.com/falcosecurity/falco-operator).

| Resource | Link |
|----------|------|
| Full documentation | [github.com/falcosecurity/falco-operator/docs](https://github.com/falcosecurity/falco-operator/blob/main/docs/README.md) |
| CRD reference | [Falco](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/falco.md), [Rulesfile](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/rulesfile.md), [Plugin](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/plugin.md), [Config](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/config.md), [Component](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/component.md) |
| Architecture | [Architecture overview](https://github.com/falcosecurity/falco-operator/blob/main/docs/architecture.md) |
| Sample manifests | [config/samples/](https://github.com/falcosecurity/falco-operator/tree/main/config/samples) |
