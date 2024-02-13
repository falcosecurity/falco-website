---
title: Introducing Falco 0.37.1
date: 2024-02-13
author: Federico Di Pierro
slug: falco-0-37-1
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.37.1** 🦅!

## Fixes

Falco's 0.37.1 release is a small patch aimed at addressing a few minor bugs. It includes the following:

* Added `--http-insecure` flag to driver loader images
* Added new env variable `FALCOCTL_DRIVER_HTTP_HEADERS` understood by driver loader images to pass a comma separated list of http headers for driver download, eg: `FALCOCTL_DRIVER_HTTP_HEADERS='x-emc-namespace: default,Proxy-Authenticate: Basic'`
* Falcoctl was bumped to v0.7.2, fixing an [issue building Flatcar drivers](https://github.com/falcosecurity/falcoctl/pull/425) and a bug withing the [kernel release fixup method](https://github.com/falcosecurity/falcoctl/pull/427) to build drivers download URLs
* Fixed a nasty bug that caused Falco to crash when a `priority` higher than `debug` was set in the config: https://github.com/falcosecurity/falco/pull/3060
* Libs were updated to 0.14.3

Last, but not least, as recommended by the CNCF, **we now link `libelf` dynamically** instead of statically, so that the library remains separable from Falco at runtime.  
This has multiple outcomes:
* Falco static (musl) build is disabled for now; we are experimenting with some solutions and we will hopefully be able to bring it back up soon
* Users of docker images won't notice anything since they already shipped `libelf` library
* Users of `deb` and `rpm` packages won't notice anything since `libelf` was already a nested dependency
* **Users of the `tar.gz` package will need to manually install `libelf` where not present**

Thanks to everyone in the community for helping us in spotting these annoying bugs 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.37.1**, you can install its packages following the process outlined in the docs:

* [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
* [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
* [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Prefer to use a container image? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

You can also find the Falcosecurity container images on the public AWS ECR gallery:

* [falco](https://gallery.ecr.aws/falcosecurity/falco)
* [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
* [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## Let's meet 🤝

We meet every Wednesday in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

_Federico_
