---
title: Falco 0.31.1
date: 2022-03-11
author: Luca Guerra
slug: falco-0-31-1
tags: ["Falco","Release"]
---

Today we announce the release of **Falco 0.31.1** 🦅!

## Novelties 🆕

Let's review some of the highlights of the new [release](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0311).

### New features

This release allows you to use multiple `--cri` command-line options ([#1893](https://github.com/falcosecurity/falco/pull/1893)) to specify multiple CRI socket paths. Note that Falco will only connect to the first one in order that successfully connects!

Speaking of command-line options, various changes are happening under the hood to improve the online help and to make it easier for contributors to add and modify options ([#1886](https://github.com/falcosecurity/falco/pull/1886) [#1903](https://github.com/falcosecurity/falco/pull/1903) [#1915](https://github.com/falcosecurity/falco/pull/1915)).

The update to the [drivers](https://github.com/falcosecurity/libs/tree/master/driver) version [b7eb0dd](https://github.com/falcosecurity/libs/tree/b7eb0dd65226a8dc254d228c8d950d07bf3521d2) brings in many [improvements](https://github.com/falcosecurity/libs/compare/319368f1ad778691164d33d59945e00c5752cd27...b7eb0dd65226a8dc254d228c8d950d07bf3521d2) including proper detection of [execveat](https://github.com/falcosecurity/libs/pull/204), [bugfixes](https://github.com/falcosecurity/libs/pull/236) for podman and support for the [clone3](https://github.com/falcosecurity/libs/pull/129) and [copy_file_range](https://github.com/falcosecurity/libs/pull/143) system calls. In addition, the necessary [extra arguments to entry system calls](https://github.com/falcosecurity/libs/pull/235) have been added to improve security of Falco event parsing as described below.

### Security Content 🔒

Falco is now more resilient to TOCTOU type attacks that could lead to rule bypass (CVE-2022-26316). For more information, read the [security advisory](https://github.com/falcosecurity/falco/security/advisories/GHSA-6v9j-2vm2-ghf7). Thanks to Xiaofei 'Rex' Guo and Junyuan Zeng for reporting this issue!

### Default rules update

This release also includes modifications to the default ruleset, including a [brand new rule](https://github.com/falcosecurity/falco/pull/1877) to detect CVE-2021-4034 (Polkit Local Privilege Escalation) and false positive fixes ([#1825](https://github.com/falcosecurity/falco/pull/1825), [#1832](https://github.com/falcosecurity/falco/pull/1832))!

---

## Try it!

As usual, in case you just want to try out the stable Falco 0.31.1, you can install its packages following the process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the container images? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

You can also find the Falcosecurity container images on the public AWS ECR gallery:

- [falco](https://gallery.ecr.aws/falcosecurity/falco)
- [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
- [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## What's next 🔮

Falco 0.32.0 is anticipated to be released in May 2022!

As usual, the final release date will be discussed during the [Falco Community Calls](https://github.com/falcosecurity/community).

## Let's meet 🤝

As always, we meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

- Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
- Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Enjoy! 🎉🔒

Luca
