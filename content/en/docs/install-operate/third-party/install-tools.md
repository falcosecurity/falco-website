---
title: Installation Tools
description: Installation tools  that are required for integrations built on the Falco core
aliases: [/docs/getting-started/third-party/install-tools]
weight: 10
---

## Scripted install {#scripted}

To install Falco on Linux, you can download a shell script that takes care of the necessary steps:

```shell
curl -o install_falco -s https://falco.org/script/install
```

Then verify the [SHA256](https://en.wikipedia.org/wiki/SHA-2) checksum of the script using the `sha256sum` tool (or something analogous):

```shell
sha256sum install_falco
```

It should be `{{< sha256sum >}}`.

Then run the script either as root or with sudo:

```shell
sudo bash install_falco
```

## Helm

You can install Falco in Kubernetes using Helm. The Falco community supports a helm chart and documentation on how to use it can [be found here](https://github.com/falcosecurity/charts/tree/master/falco).

See [Installing Helm](https://helm.sh/docs/intro/install/) for
information about how to download and install Helm.

<a class="btn btn-primary" href="https://helm.sh/docs/intro/install/" role="button" aria-label="View Installing Helm Guide">View Installing Helm Guide</a>

## Kubernetes Manifests

It is possible to deploy Falco in Kubernetes simply by using the [kubectl tool](https://kubernetes.io/docs/tasks/tools/install-kubectl/) and deploying Kubernetes manifests. For further details, [you can find an example here](https://github.com/falcosecurity/deploy-kubernetes/tree/main/kubernetes/falco/templates).
