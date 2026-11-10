---
title: Introducing Falco Operator 0.5.0
date: 2026-11-10
author: "[Aldo Lacuku](https://github.com/alacuku)"
slug: falco-operator-0-5-0
images:
  - /blog/falco-operator-0-5-0/images/falco-operator-0-5-0-featured.png
tags: ["Falco Operator", "Release"]
---

Dear Falco Community, we are thrilled to announce **Falco Operator 0.5.0**!

If you have ever wondered *"is my new rule actually loaded on every node?"*, this release is for you. Version **0.5.0** rethinks how rules, plugins and configuration travel from your cluster's API to the Falco pods that need them, and gives you a clear answer, node by node.

Around that new core, we hardened almost every step of the artifact lifecycle and prepared the operator for clusters with thousands of nodes.

It took four release candidates and [**176 commits**](https://github.com/falcosecurity/falco-operator/compare/v0.4.1...v0.5.0) to get here. A big thank you to everyone who tested the RCs, reported issues and sent patches. You made this release much better than it would otherwise be.

Read on for the full story!

## What's new? TL;DR

*Key features:*
- [A central artifact server](#pull-once-serve-everywhere): the operator pulls OCI artifacts once and serves them to every Falco pod from inside the cluster
- [The `ArtifactNode` resource](#every-node-accounted-for): see exactly what is assigned to, and installed on, each node
- [mTLS for artifact delivery](#locked-down-with-mtls), with a unique identity per Falco instance
- [Compatibility checks on by default](#rules-that-fit-their-falco): artifacts are checked against the Falco version they will run on before being installed
- [Reliable reloads and restarts](#reloads-you-can-count-on): one coalesced reload per change, and no redownloads when a sidecar restarts
- [Ready for large clusters](#other-notable-changes): API rate limits, API Priority and Fairness, and a per-node admission policy
- [A single image registry setting](#other-notable-changes), for mirrored and air-gapped environments

*Key fixes:*
- [Full syscall coverage with modern eBPF](#other-notable-changes): host `/sys/kernel` is now mounted, so enter events for `open*`, `creat` and `connect` are no longer lost
- [OCI downloads pinned to digests](#same-revision-on-every-node), so every node runs the same artifact revision
- Pod template labels, proxy settings for insecure registries, and RBAC permissions all fixed

{{% pageinfo color="warning" %}}
This release comes with [breaking changes](#breaking-changes). Before upgrading, read the [v0.5.0 migration guide](https://github.com/falcosecurity/falco-operator/blob/main/docs/migrations/v0.4.x-to-v0.5.0.md). Coming from a **0.5.0** release candidate? The guide has [a dedicated path](https://github.com/falcosecurity/falco-operator/blob/main/docs/migrations/v0.4.x-to-v0.5.0.md#upgrading-from-a-release-candidate) for you.
{{% /pageinfo %}}

## A new home for your artifacts

Rules, plugins and configuration are what turn Falco from a sensor into a detection engine, so getting them onto every node, correctly and consistently, is one of the operator's most important jobs. In previous releases, each Falco pod's sidecar fetched its own artifacts straight from the registry. That works, but it does not age well. A hundred nodes meant a hundred registry pulls, registry credentials had to be reachable from every pod, and the only way to know what a given node was running was to look inside it.

Version **0.5.0** splits the job in two. The **instance operator** resolves, downloads and caches artifacts centrally, and decides which ones belong on which node, writing it down in a new per-node resource, the `ArtifactNode`. The **artifact operator**, the sidecar in each Falco pod, takes care of the node: it checks compatibility, installs files, reloads Falco and reports back on that same `ArtifactNode`.

![How artifacts reach Falco in Falco Operator 0.5.0: the instance operator pulls from the OCI registry once and serves the files from its artifact server; on every node, the artifact operator sidecar downloads them over HTTP or mTLS, installs them and reloads Falco. The instance operator writes each node's ArtifactNode spec, and the sidecar reports back in its status.](images/falco-operator-0-5-0-01.svg)

Let's follow a rulesfile along that path, from the registry all the way to Falco, and back.

### Pull once, serve everywhere

The journey starts at the registry, and it now happens only once. For OCI sources, the instance operator resolves each artifact's metadata and digest, pulls the files into its local cache, and serves them over the new artifact Service on port **8082**. Plugins are cached for each operating system and architecture your nodes run, so mixed `amd64`/`arm64` clusters just work.

What this means in practice:

- One registry pull per artifact revision, not one per node.
- Registry credentials stay with the operator. They are read from the artifact's namespace and never need to reach Falco pods.
- Already-installed files keep working if the registry or the server is temporarily unavailable. A missing cache entry is simply rebuilt from the resolved digest while the sidecars retry.

### Same revision on every node

Pulling once also means every node gets *the same thing*. Tags move: if `falco-rules:latest` is updated while your nodes are installing it, some could end up with the old rules and some with the new ones. In **0.5.0**, the instance operator resolves each tag to a digest once, records it, and every node installs exactly that revision. Downloads whose digest does not match are rejected before they ever reach the cache. If a node asks for a revision that is not cached yet, it waits and keeps its current files rather than installing something else.

### Locked down with mTLS

Next, the files travel from the operator to the nodes. By default, the artifact server speaks plain HTTP inside the cluster. For environments that need more, **0.5.0** adds optional mTLS built on [cert-manager](https://cert-manager.io/) and [trust-manager](https://cert-manager.io/docs/trust/trust-manager/):

- Every Falco instance gets its own client certificate, carrying a unique SPIFFE identity.
- The server checks that identity against an existing `Falco` resource and only serves artifacts from that resource's namespace. A valid certificate from the shared CA is not enough on its own.
- Server and client certificates are reloaded on rotation, without restarting anything.

The Helm chart can bootstrap a private CA for you, or plug into a `ClusterIssuer` you already manage:

```bash
kubectl create namespace falco-operator
kubectl create namespace falco
kubectl label namespace falco-operator falco artifact.falcosecurity.dev/trust=true

helm install falco-operator falcosecurity/falco-operator \
  --namespace falco-operator --set mtls.enabled=true
```

The chart-managed CA has a few cert-manager and trust-manager prerequisites, so read the [mTLS section of the installation guide](https://github.com/falcosecurity/falco-operator/blob/main/docs/installation.md#artifact-transport-and-mtls) before enabling it.

### Rules that fit their Falco

The rulesfile has reached the node, but the sidecar does not simply drop it into Falco's directories. First, it checks that it fits. A rulesfile written for a newer Falco, or one that needs a plugin version the node does not have, will not load. Before **0.5.0**, you found out from Falco's logs. Now, the sidecar asks Falco for its versions through the `/versions` API and checks every artifact's declared requirements *before* installing it.

Requirements are collected from everywhere they can live: OCI metadata, inline rules and ConfigMaps, across every YAML document they contain. Declaring them is a matter of a couple of lines:

```yaml
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Rulesfile
metadata:
  name: custom-rules
spec:
  inlineRules:
    - required_engine_version: 0.62.0
    - required_plugin_versions:
        - name: container
          version: 0.7.0
    - rule: Terminal shell in container
      # ...
```

#### Dependencies, resolved on every node

Requirements are not only about the Falco `engine`. Most rules depend on plugins: the official rules need the `container` plugin, Kubernetes-aware rules need `k8smeta`, and so on. In **0.5.0**, the sidecar resolves those dependencies on each node, against the plugins **Falco has actually loaded** there, not just the ones that were asked for.

The checks follow the same logic Falco uses when it loads rules:

- A plugin version is compatible if it has the same major version and is at least the required one.
- Alternatives are honored: if a rulesfile accepts either of two plugins, the first one that is present decides.
- A plugin that was just configured but not yet confirmed by Falco holds back the rules that need it. They are installed as soon as Falco reports the plugin as loaded.

It works in the other direction too. A plugin that an installed rulesfile still depends on cannot be removed from underneath it. The removal waits, with a `DeletionBlocked` condition explaining why, until the rulesfile goes away or no longer needs it.

#### Falco keeps running, whatever happens

Above all, **an unsatisfied dependency never reaches Falco**. Rules that need a newer `engine`, or a plugin the node does not have, are never written to Falco's directories, so Falco is never asked to load something it would reject. Updates get the same treatment: if a new revision of an installed artifact is not compatible, it is rejected. Falco keeps running, and keeps detecting, with the last set of artifacts that worked.

Enforcement is **on by default** (`enforceRequirements: true`). When something does not fit, the reason shows up in the `DependenciesSatisfied` condition, both on the parent resource and on the node's `ArtifactNode`.

If you are not ready to add requirement metadata everywhere, you can switch to advise mode with `enforceRequirements: false`. Artifacts are then installed regardless, and any unmet requirement is still reported in their status, so you know exactly what to fix.

### Reloads you can count on

Once the rulesfile passes the checks, it is installed, and Falco has to pick it up. The sidecar now watches Falco's rules, plugins and configuration directories and **coalesces every change into a single `SIGHUP`**, sent only once all the files have landed. A periodic check compares on-disk hashes and loaded plugins with what Falco reports, catching anything the watcher may have missed.

Restarts are much gentler too. When a sidecar restarts, it rebuilds its view of the node from the files on disk and the `ArtifactNode` status *before* any controller runs. Nothing is downloaded again unnecessarily, and anything that no longer belongs on the node is cleaned up.

Configuration is no longer stuck behind Falco either. `Config` resources are delivered as soon as the sidecar starts, so they can carry settings that Falco needs at startup, such as `engine.kind`.

Under the hood, a long list of lifecycle fixes landed during the RC cycle: OCI clients are isolated so a pull never reuses another artifact's credentials or TLS settings, downloads have a configurable timeout, partially written files never appear in Falco's directories, cleanup errors are retried until removal succeeds, and filesystem permissions are now deterministic.

### Every node, accounted for

Finally, the sidecar reports what it did. Each `ArtifactNode` lives in the `artifact.falcosecurity.dev` group. There is one per namespace and node running Falco, named after the node, and it has two parts, each written by a single owner:

- `spec.artifacts` lists the `Rulesfile`, `Plugin` and `Config` resources assigned to the node. Only the instance operator writes it.
- `status.artifacts` reports what the node's sidecar actually did: conditions for every source and the files it installed, with their paths and content hashes.

You never write an `ArtifactNode` yourself. You keep managing artifacts exactly as before, and the operator does the bookkeeping. But when you need to know what is going on, the answer is now one `kubectl` away:

```bash
# One row per node running Falco in the namespace
kubectl get artifactnodes -n falco

# What is assigned to a node, and what its sidecar reports
kubectl get artifactnode <node-name> -n falco -o yaml
```

Here is a trimmed example of what you will find:

```yaml
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: ArtifactNode
metadata:
  name: worker-1
  namespace: falco
spec:
  nodeName: worker-1
  artifacts:
    - kind: Plugin
      name: container
    - kind: Rulesfile
      name: falco-rules
status:
  artifacts:
    - kind: Rulesfile
      name: falco-rules
      conditions:
        - type: Programmed
          status: "True"
        - type: DependenciesSatisfied
          status: "True"
      installedArtifacts:
        - medium: oci
          path: /etc/falco/rules.d/50-01-falco-rules-oci.yaml
          priority: 50
          contentHash: sha256:...
```

The per-node conditions are aggregated back onto each parent `Rulesfile`, `Plugin` and `Config`, so the parent remains the first place to look. The `ArtifactNode` tells you *which node* is reporting *what*. The operator also emits warning events when something looks off, such as a single change removing ten or more artifacts from a node, which is more often a selector typo than an intended change.

## Other notable changes

- **Built for large clusters.** With one artifact operator per node, requests to the API server grow with the size of your cluster. **0.5.0** keeps that in check:
  - **Client-side rate limits**, on by default: 50 QPS (burst 100) for the operator and 5 QPS (burst 10) for each sidecar, tunable with `extraArgs`.
  - **API Priority and Fairness**, opt-in with `apiPriorityAndFairness.enabled: true`, gives the sidecars their own bounded priority level, so a burst from thousands of them cannot crowd out the rest of the cluster.
  - **A per-node admission policy**, opt-in with `artifactNodeAdmissionPolicy.enabled: true` (Kubernetes 1.30+), only lets a sidecar update the `ArtifactNode` of the node it runs on, and never its spec.
- **One registry for every image.** The new `imageRegistry` chart value (or `--image-registry` flag) sets the registry for every image the operator generates, including Falco, the sidecar and all ecosystem components, which makes mirrored and air-gapped setups much simpler. Explicit image overrides are preserved, and the sidecar's tag is now built into the operator, so the two can never drift out of sync.
- **Tighter RBAC.** Unused pod write permissions are gone, and the missing permission on Leases needed for leader election has been added.
- **Full syscall coverage with modern eBPF.** Falco pods now mount the host's `/sys/kernel` read-only, as the [Falco Helm chart](https://github.com/falcosecurity/charts) does. Without it, the modern eBPF driver could not attach the tracepoints for the enter events of `open`, `openat`, `openat2`, `creat` and `connect`, silently disabling Falco's TOCTOU mitigation for those syscalls.
- Pod template labels are kept when the resource itself also has labels.
- Proxy, timeout and connection pooling settings are honored for insecure registries.
- `Component` resources now require a `spec`.
- The end-to-end test suite was rewritten with [Chainsaw](https://kyverno.github.io/chainsaw/), and now covers the artifact and instance controllers, validation, self-healing and per-node edge cases.

## Breaking changes

Upgrading replaces every Falco pod, so it is worth a few minutes of preparation. The [migration guide](https://github.com/falcosecurity/falco-operator/blob/main/docs/migrations/v0.4.x-to-v0.5.0.md) starts with a table that tells you which steps apply to the version you run today. Here is what to check before you upgrade.

- **Compatibility checks are enforced by default.** Plugins and rulesfiles that declare no requirements are blocked. Since the upgrade replaces every Falco pod and new pods start with empty artifact volumes, an artifact that **0.4.x** installed but **0.5.0** blocks will be missing from Falco after the upgrade. Add `required_engine_version` and `required_plugin_versions` where needed, or set `enforceRequirements: false`.
- **The default Falco version moves from 0.44.1 to 0.45.2**, along with new default images for Falcosidekick, Falcosidekick UI and k8s-metacollector. Set `spec.version` if you want to keep the Falco version you run today and upgrade it separately.
- **The sidecar reloads Falco with `SIGHUP`.** On nodes where the container runtime applies its default AppArmor profile, such as Ubuntu with containerd, the signal is denied and Falco may not pick up new artifacts. On such nodes, set `artifactOperatorAppArmorUnconfined: true` (Kubernetes 1.30+).
- **The Falco pod runs with new settings.** It shares its process namespace, runs the sidecar as UID 0, and mounts the host's `/sys/kernel` read-only. If Pod Security admission, Kyverno, Gatekeeper or similar policies apply to your Falco namespaces, make sure they admit these settings.
- **The sidecar needs Falco's `/versions` API.** Rulesfiles and plugins are installed only once it answers. If you disabled or moved Falco's webserver, keep it reachable at `http://localhost:8765`, or point `FALCO_URL` to it.
- **Falco pods download artifacts from the operator.** If you use restrictive NetworkPolicies, allow Falco pods to reach the operator's Service on TCP `8082`, and the operator to reach your registries.
- **The sidecar is now a regular container.** It is no longer a restartable init container. If your `Falco` resources customize it, move it from `initContainers` to `containers` and drop its `restartPolicy`. Release candidates already use the new layout.
- **The sidecar image can no longer be set on the operator.** Remove `--artifact-operator-image` and `ARTIFACT_OPERATOR_IMAGE`, including from `extraArgs` and `extraEnv`: **0.5.0** does not know the flag and exits at startup. Use `imageRegistry` to select a mirror.
- **`Component` resources must have a `spec`.** Add one to any `Component` that has none, or delete it, before upgrading.
- **Coming from a release candidate?** Do not delete `ArtifactNode` objects by hand, neither before nor after the upgrade. **rc1** to **rc3** created one per artifact and node: the new operator replaces them on its own and releases their finalizers. **rc4** already uses one per node, and its objects are kept as they are.

**How to upgrade.** Apply the new CRDs first, then upgrade the operator: `helm upgrade` alone does not update CRDs. The [migration guide](https://github.com/falcosecurity/falco-operator/blob/main/docs/migrations/v0.4.x-to-v0.5.0.md) walks you through every step, from backing up your resources to verifying the result.

## Try it out

Falco Operator **0.5.0** ships with version **0.4.0** of the Helm chart. To install it:

```bash
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update

helm install falco-operator falcosecurity/falco-operator \
  --namespace falco-operator \
  --create-namespace
```

Prefer plain manifests? The single-file installer is still available:

```bash
kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/download/v0.5.0/install.yaml
```

Then deploy the whole Falco stack, including Falco, plugins, rules, Falcosidekick, Falcosidekick UI and k8s-metacollector, with a single command:

```bash
kubectl apply --server-side -f https://github.com/falcosecurity/falco-operator/releases/download/v0.5.0/quickstart.yaml
```

And watch the artifacts land, node by node:

```bash
kubectl get rulesfiles,plugins,configs -n falco
kubectl get artifactnodes -n falco
```

The complete documentation, including the CRD reference, configuration options and architecture overview, lives in the [Falco Operator repository](https://github.com/falcosecurity/falco-operator) and in the [operator setup guide](/docs/setup/operator/).

## Thank you

This release would not exist without its contributors. A special welcome to everyone who made their first contribution in this cycle: [@chimanjain](https://github.com/chimanjain), [@zeroalphat](https://github.com/zeroalphat), [@scale03](https://github.com/scale03), [@blacksoxx](https://github.com/blacksoxx) and [@NopeCharon](https://github.com/NopeCharon). And thanks to [@c2ndev](https://github.com/c2ndev), [@younsl](https://github.com/younsl) and [@leogr](https://github.com/leogr) for their work on this release.

Found a bug, or have an idea for the next release? Open an [issue](https://github.com/falcosecurity/falco-operator/issues) or join us on the `#falco` channel in the [Kubernetes Slack](https://kubernetes.slack.com/).

## Stay connected

Join us on social media and in our community calls! It's always great to have new members in the community, and we're looking forward to hearing your feedback and ideas.

You can find all the most up-to-date information at [https://falco.org/community/](https://falco.org/community/).
