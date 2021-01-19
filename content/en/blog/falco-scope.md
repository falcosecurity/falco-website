---
title: The Scope of Falco
description: Understanding the scope of the Falco project
date: 2020-04-20
author: Kris Nóva
slug: falco-scope
---

As The Falco Project continues to grow, we are begining to understand the differences in engagement and support for our tooling.

Drawing on the history of the [now deprecated Kubernetes incubator](https://github.com/kubernetes/community/blob/master/incubator.md#important---the-kubernetes-incubator-process-is-now-deprecated-and-has-been-superseded-by-kubernetes-subprojects) and the [CNCF project maturity levels](https://www.cncf.io/projects/) we began to realize that Falco and Falco integrations were reaching a state where we needed to begin separating sub projects from the Falco core components.

This of course started by first declaring the scope of The Falco Project. Pull request [#1184](https://github.com/falcosecurity/falco/pull/1184) aims at doing just that.

This introduces the idea of a small core, with a minimal scope for the official supported artifacts.
These core artifacts are designed to be the fundamental building blocks that other work can be built on top of.
Now that the core components are designed, and documented we can begin to build integrations and third party support on top of these.

Falco has adopted a familiar 3-tier approach at promoting sub projects, and the support for them through the community.
Falco will have 3 main levels that work can be tiered at.

### Contrib

This is the simplest and easiest way to share work in the Falco community.
There is no official support for this level other than "use at your own risk".
The community can still benefit from having an archive of this data, but the project does not have the resources to fully support this archive.

A contribution here could be as simple as a small amount of documentation, a script, or example configuration. Think convenience scripts, YAML, and markdown pages.

### Repository

The main difference between a contribution in **Contrib** and **Repository** is that a repository has two main features associated with the work.

 - A build and release
 - A github repository

These are more involved contributions and are usually in the form of programming languages.
These are convenience tooling, utilities, integrations, connectors, etc.
Think the Falco Helm [charts](https://github.com/falcosecurity/charts), the [falco-exporter](https://github.com/falcosecurity/falco-exporter) or the [falcosidekick](https://github.com/falcosecurity/falcosidekick).

The support for these contributions are handled by a one-off basis and each repository will have an `OWNERS` file. The maintainers listed in the `OWNERS` file will be responsible for supporting each of these repositories.

### Official

The most elite, and coveted of all Falco projects: **Official** support.

This means that the Falco core maintainers have agreed to provide timely releases, and support for these artifacts.

These artifacts are **ready to be deployed to production** and have been giving attention to the following

 - Security
 - Resilience
 - Stability

--

## Understanding core components

The Falco Project core components are intentionally designed to be small, fundamental artifacts.

Because of the complexity and security requirements of running Falco in production these artifacts are clearly labeled and can be composed for various use cases.

For instance. The Falco Project core supports various [container images](https://falco.org/docs/getting-started/download/#images) which require different access to the system in order to run effectively.
These container images can be composed with YAML manifests or other management tools like Helm or Kustomize.
The higher level compositions are not currently considered part of Falco core, as they make assumptions on behalf of the user.

The Falco community is supporting various **repository** level work around these higher level compositions such as the [charts](https://github.com/falcosecurity/charts) repository and [falcoctl](https://github.com/falcosecurity/falcoctl).

Each of these higher level tools, can then begin to craft opinionated compositions of Falco components such as `secure by defualt` or `convenient`. 

As these compositions are hardened and can demonstrate maintainer support and usage, they will then be promoted to **official** support as needed. 

