---
title: "GitLab Container Registry now supports Falcoctl OCI Artifacts"
linktitle: "GitLab Container Registry now supports Falcoctl OCI Artifacts"
date: 2023-08-11
author: Batuhan Apaydın
slug: gitLab-supports-falcoctl-ociartifacts
tags: ["Rules", "Falco Plugins", "Falcoctl", "Configuration Management"]
---

Today, we'd like to share with the Falco community the latest contribution we (w/[Emin Aktas](https://twitter.com/emminaktas)) made to [GitLab Container Registry](https://gitlab.com/gitlab-org/container-registry).

We noticed that GitLab Container Registry didn't support Falcoctl OCI Artifact [mediaTypes](https://github.com/falcosecurity/falcoctl/blob/7f1e8825a6f86010b9194577c56712dd0ef0442d/pkg/oci/constants.go#L20-L29) while we were pushing the Falco rules stored from GitHub container registry to GitLab container registry. We decided then to contribute to GitLab Container Registry by adding the support for Falcoctl OCI Artifact mediaTypes.

```shell
Error: PUT https://registry.gitlab.com/v2/x/falcosecurity/rules/k8saudit-rules/manifests/1: MANIFEST_INVALID: manifest invalid; unknown media type: application/vnd.cncf.falco.rulesfile.config.v1+json
Error: PUT https://registry.gitlab.com/v2/x/falcosecurity/plugins/k8saudit/manifests/sha256:b29c97a6590486f8b3b83644677e11d2f68e201a7035699189653d7f571d7e13: MANIFEST_INVALID: manifest invalid; unknown media type: application/vnd.cncf.falco.plugin.config.v1+json
```

You can learn more about our contribution [here](https://gitlab.com/gitlab-org/container-registry/-/merge_requests/1375). Once the feature is released, planned for GitLab **16.3**, it will allow you to pull and push Falcoctl OCI Artifacts from and to GitLab Container Registry.

Falcoctl is one of the newest development efforts from the Falco community. It is a CLI tool that allows you to [manage the complete lifecycle of your Falco rules and plugins](https://falco.org/blog/falcoctl-install-manage-rules-plugins/) by leveraging the power of OCI Artifacts. 

For those who are not familiar with the OCI Artifacts concept, the OCI Artifacts specification is a way to extend the OCI Registry specification to support storing and retrieving arbitrary content, you can learn more about OCI Artifacts concept, [here](https://github.com/opencontainers/artifacts). OCI Artifacts are important because today's moden software requires storing more than just container images in OCI registries such as the following artifacts would be great use-case examples of that:

* Helm charts
* WebAssembly modules
* Falco rules and plugins. :)
* ...many other custom artifacts

You can even create your own custom OCI Artifacts. A key thing of OCI registries is uniquely identifying the type. This is done by using a media type, which is a string that identifies the type of content stored in the registry. The media type is used to determine how to interpret the content when it is retrieved from the registry. To learn more about how you can write your own custom OCI Artifacts, you can check out the [OCI Artifacts Authoring guide](https://github.com/opencontainers/artifacts/blob/main/artifact-authors.md).

Distributing software artifacts as OCI Artifacts served by OCI registries offers a standardized, secured, and efficient way to consume and reuse content within the container ecosystem, making it easier to integrate, distribute, and manage them across different environments and tools.

Hope you can enjoy the new feature once it's released. See you next time! :)