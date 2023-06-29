---
title: Falco 0.35.1
date: 2023-06-29
author: Lorenzo Susini
slug: falco-0-35-1
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.35.1** 🦅!

## Novelties 🆕 and Fixes

Here is a tiny patch release! It addresses some small bugs that will not bother us and our users anymore:

* Bug fix in the plugin framework, wa can now associate a thread ID also to async events so that we can access related juicy information when writing rules! We suggest updating to this version to be able to use all the new capabilities that the new Plugin API has to offer!
* Modern BPF can now be used in least privileged mode without any trouble in COS
* Driver loader now correctly parses the kernel version of Ubuntu’s kernel flavors, and also supports Debian rt and cloud
* Solved a rule ordering problem on our default ruleset that caused some rules to be shadowed
* Updated falcoctl to the latest version, which fixes a corner cases that cause the tool to freeze


Thanks to everyone in the community for helping us in spotting these annoying bugs 🐛! You make Falco successful 🦅!

Thanks as always to the Falco maintainers for their support and effort during the entire release process.

## Try it! 🏎️

As usual, in case you just want to try out the stable **Falco 0.35.1**, you can install its packages following the process outlined in the docs:

* [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
* [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
* [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
* [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the container images? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

You can also find the Falcosecurity container images on the public AWS ECR gallery:

* [falco](https://gallery.ecr.aws/falcosecurity/falco)
* [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
* [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## What's next 🔮

We are in the working to let new big things happen in Falco, stay tuned!

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

_Jason and Lorenzo_
