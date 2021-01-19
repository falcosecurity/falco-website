---
title: Falco 0.26.2 a.k.a. "the download.falco.org release"
date: 2020-11-10
author: Leonardo Di Donato, Lorenzo Fontana
slug: falco-0-26-2
---

Today we announce the release of Falco 0.26.2 🥳

This one is a hotfix release for the Falco 0.26.1 released on October 1st.

You can take a look at the set of changes here:

- [0.26.2](https://github.com/falcosecurity/falco/releases/tag/0.26.2)

As usual, in case you just want to try out the stable Falco 0.26.2, you can install its packages following the process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the docker images? No problem!

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

## Why this release?

When you install Falco, you will either use a Kernel module, an eBPF probe or userspace instrumentation driver as described in the [documentation](https://falco.org/docs/event-sources/drivers/).

As a service to our community, the [Falco Infrastructure WG](https://lists.cncf.io/g/cncf-falco-dev/message/137) publishes pre-built drivers for all the current driver versions using the [driverkit build grid](https://github.com/falcosecurity/test-infra/tree/master/driverkit).

Due to a spike in adoption in the month of October 2020, we had to come up with a better strategy for distributing our pre-built drivers.

![Spike in Falco drivers adoption](https://raw.githubusercontent.com/falcosecurity/falco/662c82b82a1f8cbc65505f8240c1f21872c1669d/proposals/20201025-drivers-storage-s3_downloads.png)

To achieve this, we decided that from now on we will publish the drivers only to [download.falco.org/driver](https://download.falco.org/driver) instead of `dl.bintray.com/falcosecurity/driver`. Old drivers will be kept there to avoid disruption of current workloads but we will not
publish new versions to the old bucket anymore. The PR that made this happen can be found [here](https://github.com/falcosecurity/test-infra/pull/200).

We also had a proposal that was discussed & approved for this change to happen, you can find it [here](https://github.com/falcosecurity/falco/blob/662c82b82a1f8cbc65505f8240c1f21872c1669d/proposals/20201025-drivers-storage-s3.md)

## What should I do?

If you install Falco using a docker image and rely on our prebuilt drivers you have two options:

**RECOMMENDED**: *Update to 0.26.2*

Alternatively, you can change the `DRIVERS_REPO` environment variable in your current environment.

**On bash:**

```console
export DRIVERS_REPO=https://download.falco.org/driver
falco-driver-loader
```

**Docker**

Pass it as environment variable using the docker run flag -e - for example:

```console
docker run -e DRIVERS_REPO=https://download.falco.org/driver
```

**Kubernetes**

```yaml
spec:
  containers:
  - env:
    - name: DRIVERS_REPO
      value: https://download.falco.org/driver
```


## What's next?

We have a scheduled [0.27.0](https://github.com/falcosecurity/falco/milestone/13) release on December 1st!

It will contain a lot of exciting features and performance improvements! Stay tuned 🤙


## Let's meet!

As always, we meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

 - Join the #falco channel on the [Kubernetes Slack](https://slack.k8s.io)
 - [Join the Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)


Bye!

Leo & Lore
