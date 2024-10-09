---
title: Introducing Falco 0.39.1
date: 2024-10-09
author: Federico Di Pierro
slug: falco-0-39-1
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.39.1** 🦅!

## Fixes

Falco's 0.39.1 is a small patch release that includes some important bugfixes:

* Fixed a crash when using plugin with event parsing capabilities (eg: k8smeta plugin)
* Fixed a bug while parsing `-o key={object}` command line arguments, when the object definition contains a comma
* Improved config json schema to allow null init_config for plugin info

Thanks to everyone in the community for helping us with spotting these annoying bugs and improving Falco every day 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.39.1**, you can install its packages following the process outlined in the docs:

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

Enjoy 😎,

_Federico_
