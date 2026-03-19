---
title: Introducing Falco Operator 0.2.0
date: 2026-03-19
author: Alessandro Cannarella, Aldo Lacuku
slug: falco-operator-0-2-0
images:
  - /blog/falco-operator-0-2-0/images/falco-operator-featured.png
tags: ["Falco Operator","Release"]
---

Dear Falco Community, today we are excited to announce the release of **Falco Operator 0.2.0**, the first production-ready release of the [Kubernetes operator for Falco](https://github.com/falcosecurity/falco-operator)!

Since the [technical preview announced with Falco 0.41.0](/blog/falco-0-41-0/#kubernetes-operator), we have been working hard to make the operator robust, extensible, and ready for real-world environments. This release brings a redesigned API, a new Component controller for managing the Falco ecosystem, new artifact management capabilities, enhanced observability, and a significantly improved operational model, all grounded in Kubernetes-native patterns.

We merged **58 commits** since v0.1.1, delivering major new features, 10 bug fixes, and comprehensive architectural improvements. Thank you to all our contributors and the community for your feedback along the way!

Going forward, the Falco Operator is the recommended way to deploy and manage Falco on Kubernetes. While the existing [Helm chart](/docs/setup/kubernetes/) remains fully supported, we plan to transition to the operator as the standard deployment method. More details on the transition timeline will follow in a future announcement.

To learn everything about the changes, read on!

## What's new? TL;DR

*Key features:*
- [Ecosystem components](#ecosystem-components) - deploy Falcosidekick, Falcosidekick UI, and k8s-metacollector as managed components
- [ConfigMap support](#configmap-support-for-rules-and-configuration) for rules and configuration, alongside OCI artifacts and inline definitions
- [Structured API types](#structured-api-types) for inline rules and configuration - YAML objects instead of strings
- [Redesigned OCI artifact API](#redesigned-oci-artifact-api) with separate image and registry configuration
- [Reference tracking with finalizers](#reference-tracking-with-finalizers) to prevent accidental deletion of Secrets and ConfigMaps
- [Enhanced observability](#enhanced-observability) with Kubernetes events and status conditions across all controllers
- [Update strategy support](#update-strategy-support) for DaemonSet and Deployment modes
- [Server-Side Apply migration](#server-side-apply) for safer, conflict-free reconciliation

*Key fixes:*
- Plugin `initConfig` now supports nested configuration objects
- RBAC compatibility with Kubernetes 1.32+
- Spurious update prevention via managed fields comparison
- Correct event recording with node-level attribution

{{% pageinfo color="warning" %}}
This release comes with [breaking changes](#breaking-changes) that require updating your existing custom resources before upgrading. Please read the [migration guide](https://github.com/falcosecurity/falco-operator/blob/main/docs/migration-guide.md) carefully before proceeding.
{{% /pageinfo %}}

## The road to production readiness

When we introduced the Falco Operator as a technical preview in Falco 0.41.0, the vision was clear: provide a Kubernetes-native way to deploy and manage Falco that goes beyond what Helm charts and static manifests can offer. Since then, every aspect of the operator has been refined.

The reconciliation logic now uses Server-Side Apply for conflict-free updates. Status conditions follow Kubernetes conventions (`Programmed`, `ResolvedRefs`, `Available`, `Reconciled`) so that standard tooling and dashboards can monitor operator health out of the box. Finalizers protect referenced resources from accidental deletion. And the new Component controller lays the groundwork for managing the entire Falco ecosystem from a single operator.

Version 0.2.0 is the result of this effort, a release we are confident in for production environments.

## Major features and improvements

### Ecosystem components

The new `Component` custom resource (`instance.falcosecurity.dev/v1alpha1`) enables the operator to deploy and manage the full Falco ecosystem from a single control plane. Three component types are supported:

| Type | Component | What it does |
|------|-----------|--------------|
| `metacollector` | [k8s-metacollector](https://github.com/falcosecurity/k8s-metacollector) | Centralized Kubernetes metadata for Falco instances |
| `falcosidekick` | [Falcosidekick](https://github.com/falcosecurity/falcosidekick) | Fan-out daemon - routes Falco events to 70+ integrations (Slack, Elasticsearch, S3, Kafka, and more) |
| `falcosidekick-ui` | [Falcosidekick UI](https://github.com/falcosecurity/falcosidekick-ui) | Web dashboard for real-time event visualization |

Deploying Falcosidekick is as simple as:

```yaml
apiVersion: instance.falcosecurity.dev/v1alpha1
kind: Component
metadata:
  name: sidekick
spec:
  component:
    type: falcosidekick
  replicas: 2
```

The operator handles the Deployment, Service, ServiceAccount, and RBAC automatically. Each component type ships with production-ready defaults (health probes, security context, resource profiles) that can be fully customized via `podTemplateSpec`.

For Falcosidekick UI, note that an external Redis instance is required. If Redis is not available, the pod stays in `Init:0/1` state, the built-in `wait-redis` init container blocks until Redis is reachable. See the [component documentation](https://github.com/falcosecurity/falco-operator/blob/main/docs/crds/component.md) for setup examples including a bundled Redis StatefulSet.

As part of this work, the internal controller structure was reorganized under `controllers/instance/` with shared reconciliation logic extracted into reusable packages, improving maintainability and consistency across all instance-level controllers.

### ConfigMap support for rules and configuration

Rulesfile and Config resources can now source their content from Kubernetes ConfigMaps, in addition to OCI artifacts and inline definitions. This provides a familiar, Git-friendly workflow for teams that manage configuration through standard Kubernetes tooling.

**Rulesfile from a ConfigMap:**
```yaml
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Rulesfile
metadata:
  name: custom-rules
spec:
  configMapRef:
    name: my-rules-configmap
  priority: 50
```

**Config from a ConfigMap:**
```yaml
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Config
metadata:
  name: custom-config
spec:
  configMapRef:
    name: my-config-configmap
  priority: 50
```

The referenced ConfigMap must contain the content under a key named `rules.yaml` (for Rulesfile) or `config.yaml` (for Config). All three sources (OCI, inline, and ConfigMap) can be combined in a single resource when needed.

### Structured API types

The `inlineRules` field in the Rulesfile CRD and the `config` field in the Config CRD are now structured YAML objects instead of plain strings. This enables proper validation, better editor support, and eliminates the need for YAML-in-YAML escaping.

**Before (v0.1.x):**
```yaml
spec:
  config: |-
    engine:
      kind: modern_ebpf
```

**After (v0.2.0):**
```yaml
spec:
  config:
    engine:
      kind: modern_ebpf
```

The same applies to `inlineRules`: rules are now defined as structured YAML lists rather than pipe-literal strings.

### Redesigned OCI artifact API

The OCI artifact reference model has been completely redesigned for clarity and extensibility. The previous flat `reference` and `pullSecret` fields are replaced with a structured `image` and `registry` model.

**Before (v0.1.x):**
```yaml
spec:
  ociArtifact:
    reference: ghcr.io/falcosecurity/rules/falco-rules:latest
    pullSecret:
      secretName: my-secret
```

**After (v0.2.0):**
```yaml
spec:
  ociArtifact:
    image:
      repository: falcosecurity/rules/falco-rules
      tag: latest
    registry:
      name: ghcr.io
      auth:
        secretRef:
          name: my-secret
```

This separation makes the API more explicit and enables per-registry TLS configuration, plain HTTP support, and a consistent credential model. See the [migration guide](https://github.com/falcosecurity/falco-operator/blob/main/docs/migration-guide.md) for details on updating your resources.

### Reference tracking with finalizers

The operator now adds finalizers to Secrets and ConfigMaps that are referenced by artifact resources. This prevents accidental deletion of credentials or configuration data that would break Falco deployments. When a referenced resource is deleted, the operator blocks the deletion until all referencing artifacts are updated or removed.

### Enhanced observability

All controllers now emit Kubernetes events for significant operations: artifact creation, updates, removals, and priority changes. Events include the node name for artifact controllers, making it straightforward to trace which operations happened on which nodes.

Status conditions have been overhauled to follow Kubernetes conventions:
- **Artifact resources** report `Programmed` (whether the artifact is successfully applied) and `ResolvedRefs` (whether referenced ConfigMaps/Secrets exist)
- **Falco instances** report `Reconciled` and `Available`
- All artifact CRDs now include `printcolumns` for readable `kubectl get` output

### Update strategy support

The Falco CRD now accepts update strategy configuration for both deployment modes:

```yaml
# DaemonSet mode
spec:
  type: DaemonSet
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1

# Deployment mode
spec:
  type: Deployment
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
```

### Server-Side Apply

Under the hood, the operator has migrated from the dry-run/update pattern to [Server-Side Apply](https://kubernetes.io/docs/reference/using-api/server-side-apply/) (SSA) for all reconciliation operations. This brings:

- **Conflict detection**: concurrent modifications to managed fields are detected and reported
- **Ownership tracking**: the operator only manages fields it owns, leaving user-applied changes intact
- **Reduced spurious updates**: managed fields comparison prevents unnecessary API calls

## Breaking changes ⚠️

Version 0.2.0 includes several API breaking changes. All existing custom resources must be updated before upgrading. A detailed [migration guide](https://github.com/falcosecurity/falco-operator/blob/main/docs/migration-guide.md) is available in the repository documentation.

### Summary of breaking changes

| Change | Impact | Migration |
|--------|--------|-----------|
| `ociArtifact.reference` replaced by `ociArtifact.image` + `ociArtifact.registry` | All Rulesfile and Plugin CRs using OCI artifacts | Split the reference into `image.repository`, `image.tag`, and `registry.name` |
| `ociArtifact.pullSecret` replaced by `ociArtifact.registry.auth.secretRef` | CRs with private registry credentials | Update the credential reference path |
| Config `spec.config` changed from string to structured YAML | All Config CRs | Remove the `\|-` pipe literal, write YAML directly |
| Rulesfile `spec.inlineRules` changed from string to structured YAML | Rulesfile CRs with inline rules | Remove the `\|-` pipe literal, write YAML directly |
| Plugin `spec.config.initConfig` changed from `map[string]string` to JSON | Plugin CRs with init config | Re-apply CRD; flat maps still validate |
| Falco resource `shortName` changed from `prom` to `falco` | Scripts using `kubectl get prom` | Use `kubectl get falco` instead |
| Condition types renamed (`ConditionReconciled` → `Reconciled`, `ConditionAvailable` → `Available`) | Monitoring tools filtering on condition types | Update condition type filters |
| `kubectl get` column output changed for all CRDs | Dashboard parsing or scripts | Update parsers to match new column names |
| RBAC permissions expanded | Security-sensitive environments | Review the updated ClusterRole |

After upgrading, re-apply all CRDs and update your custom resources following the migration guide. The operator will reconcile the new format automatically.

## A Helm chart is on its way

We are currently developing a Helm chart for installing the Falco Operator itself, which will simplify deployment and configuration of the operator in production environments. Stay tuned for the announcement.

## Meet us at KubeCon

We will be talking about the Falco Operator during the **maintainer track** at the upcoming KubeCon. If you are interested in learning more, asking questions, or sharing feedback, come find us at the **CNCF Falco kiosk**, we would love to chat!

## Try it out

Install the operator:

```bash
VERSION=latest
if [ "$VERSION" = "latest" ]; then
  kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/latest/download/install.yaml
else
  kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/download/${VERSION}/install.yaml
fi
```

Then choose how you want to get started:

### Full stack quickstart

Deploy the entire Falco ecosystem in the `falco` namespace with one command:

```bash
VERSION=latest
if [ "$VERSION" = "latest" ]; then
  kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/latest/download/quickstart.yaml
else
  kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/download/${VERSION}/quickstart.yaml
fi
```

This deploys Falco, container and k8smeta plugins, detection rules, Falcosidekick, Falcosidekick UI with Redis, and k8s-metacollector - all pre-wired.

Verify:

```bash
kubectl get falco,plugins,rulesfiles,configs,components -n falco
kubectl get pods -n falco
```

### Step by step

Deploy Falco:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: instance.falcosecurity.dev/v1alpha1
kind: Falco
metadata:
  name: falco
spec: {}
EOF
```

Add the container plugin (required by the official rules for container metadata fields):

```bash
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

And add detection rules:

```bash
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

Optionally, add Falcosidekick to route events to your favorite integrations:

```bash
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

For the complete documentation, including the CRD reference, configuration options, and architecture overview, visit the [Falco Operator repository](https://github.com/falcosecurity/falco-operator) and the [operator setup guide](/docs/setup/operator/).

## Stay connected

Join us on social media and in our community calls! It's always great to have new members in the community, and we're looking forward to hearing your feedback and ideas.

You can find all the most up-to-date information at [https://falco.org/community/](https://falco.org/community/).
