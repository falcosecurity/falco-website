---
title: Contribution of the drivers and the libraries
date: 2021-02-23
author: Leonardo Di Donato, Leonardo Grasso
slug: contribution-drivers-kmod-ebpf-libraries
---

![Contribution of the drivers and the libraries to the CNCF!](/img/falco-contributes-libraries-cncf-featured.png)

We are excited to announce the contribution from Sysdig Inc. of the **kernel module**, the **eBPF** probe, and the **libraries** to the Cloud Native Computing Foundation. The source code of these components has been moved into the Falco organization. You can already find it in the [falcosecurity/libs](https://github.com/falcosecurity/libs) repository.

This contribution is an initial - yet fundamental - part of a broader process outlined in a [proposal](https://github.com/falcosecurity/falco/blob/master/proposals/20210119-libraries-donation.md) that the Falco Authors presented and discussed with the Falco community during the past months.

As you all already know, Falco mainly operates on top of a data source: system calls. This data source is collected using either a kernel module or an eBPF probe, which we call drivers. The two drivers are equivalent in functionality. On the performance side, the kernel module is a tiny bit more efficient, while the eBPF approach is safer and more modern. Before being consumed by Falco, the collected data needs to be enriched (for example, a file descriptor number needs to be converted into a file name or an IP address). The enrichment is accomplished by two libraries: `libsinsp` and `libscap`.

![The complete Falco architecture with drivers and libraries!](/img/falco-diagram-blog-contribution.png)

## Future plans

In the coming months, we planned to make these components even more awesome and consumable by the community.

- Improve the build mechanism by modernizing the CMake files
- Define a SemVer 2.0 versioning mechanism
- Implement a robust test suite
- Setup Continuous Integrations jobs through our beautiful [Falco Prow Infra](https://prow.falco.org/)
- Distribute these libraries as packages for major distros, hosting them on [download.falco.org](https://download.falco.org/)
- Document the API

As you can see, there is a lot to do! New opportunities for contributions 😄

## How to migrate existing pull requests

In case you have on-going pull requests against [draios/sysdig](https://github.com/draios/sysdig/pulls)
regarding these components, we provide the following instructions to move them to [falcosecurity/libs](https://github.com/falcosecurity/libs) repository.


Assuming you already have a fork of https://github.com/falcosecurity/libs and a fork of https://github.com/draios/sysdig under your GitHub handle, and assuming they are in sync with their respective upstreams:

Clone your `falcosecurity/libs` fork locally:
```console
git clone https://github.com/<your_handle>/libs
cd libs
```

Add the a remote for your `draios/sysdig` fork:
```console
git remote add sysdig-fork https://github.com/<username>/sysdig.git
git fetch --all
```

Checkout your pull request's branch:
```console
git checkout --no-track -b <branch> sysdig-fork/<branch>
```

Rebase it on top the `master` branch:
```console
git rebase -i --exec 'git commit --amend --no-edit -n -s -S' master
```

Then, push it to your `<your_handle>/libs` repository:
```console
git push -u origin <branch>
```

You are now all set to open a PR on https://github.com/falcosecurity/libs. As usual, you can do that manually from the GitHub user interface.

## Conclusions

The contribution of such fantastic software will help not only Falco but also other projects to have a more secure Cloud-Native environment. More information about this contribution is in Loris Degioanni’s [CNCF blog post](https://www.cncf.io/blog/2021/02/24/sysdig-contributes-falcos-kernel-module-ebpf-probe-and-libraries-to-the-cncf/).

Aside from Falco, also the [sysdig cli-tool](https://github.com/draios/sysdig) was refactored to use these libraries. From now on, also other projects can benefit from them! We are thrilled to see what folks will build upon these libraries!

If you would like to find out more about Falco:

- Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco)
- Get involved in the [Falco community](https://falco.org/community/)
- Meet the maintainers on the [#falco channel (Kubernetes Slack)](https://kubernetes.slack.com/?redir=%2Fmessages%2Ffalco)
- Follow [@falco_org](https://twitter.com/falco_org) on Twitter
