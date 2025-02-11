---
title: Falco Talon v0.3.0
date: 2025-02-11
author: Thomas Labarussias
slug: falco-talon-v0-3-0
images:
  - /blog/falco-talon-v0-3-0/images/falco-talon-featured.png
tags: ["Talon", "Release"]
---

Today, we announce the release of **Falco Talon 0.3.0** 🦅!

Three updates in a row, after [Falco](https://falco.org/blog/falco-0-40-0/) and [Falcosidekick](https://falco.org/blog/falcosidekick-2-31-0/), it's time for [Falco Talon](htts://docs.falco-talon.org) to know a new version.

## What's new?

The key feature this release brings is the new actionner `kubernetes:sysdig`. For those who are not familiar with [sysdig](https://github.com/draios/sysdig), it's a CLI tool that allows to capture and record the syscalls, like `tcpdump` does for the network packets. Old brother of Falco, they share the same libs and filters.

With this new integration, when a suspicious event occurs in a pod, Talon triggers a capture and then exports the created artifact to AWS S3 or Minio. You can configure the `duration` and the `amount of bytes` captured for each syscall. Check out the [docs](https://docs.falco-talon.org/docs/actionners/list/#kubernetessysdig) to discover more settings.

See this example rule:

```yaml
- action: Capture the syscalls
  actionner: kubernetes:sysdig
  parameters:
    buffer_size: 2048
    duration: 20
  output:
    target: minio:s3
    parameters:
      bucket: falco-talon
      prefix: /sysdig/
```

After the action has been completed, you'll find the capture in Minio:

![minio](/blog/falco-talon-v0-3-0/images/minio.png)

And you can run the CLI tool `sysdig` to explore it:

```shell
❯ sysdig -r 2025-01-23T13-26-41Z_default_cncf-597d69dbd4-h9fcb_sysdig.scap.gz evt.type=execve and evt.dir=">"

18563 14:26:38.376178286 0 bash (616444.616444) > execve filename=/usr/bin/apt
19163 14:26:38.394972623 0 apt (616445.616445) > execve filename=/usr/bin/dpkg
19599 14:26:38.399546432 0 apt (616446.616446) > execve filename=/usr/lib/apt/methods/http
20319 14:26:38.408846350 0 apt (616447.616447) > execve filename=/usr/lib/apt/methods/http
21775 14:26:38.453363037 0 apt (616448.616448) > execve filename=/usr/lib/apt/methods/gpgv
22335 14:26:38.461330752 0 apt (616449.616449) > execve filename=/usr/lib/apt/methods/gpgv
29434 14:26:38.481292691 0 gpgv (616451.616451) > execve filename=/usr/bin/apt-key
29604 14:26:38.486522901 0 apt-key (616453.616453) > execve filename=/usr/bin/apt-config
30183 14:26:38.494442117 0 apt-config (616454.616454) > execve filename=/usr/bin/dpkg
30422 14:26:38.497278722 0 apt-key (616455.616455) > execve filename=/usr/bin/apt-config
30996 14:26:38.504017535 0 apt-config (616456.616456) > execve filename=/usr/bin/dpkg
```

You can also explore the captures with [Stratoshark](https://stratoshark.org/), a GUI based on `Wireshark`.

## Try it! 🏎️

In case you want to try out this **Falco Talon 0.3.0**, you can install the Helm chart following the instructions on the [`documentation`](https://docs.falco-talon.org/docs/installation_usage/helm/)

## Let's meet 🤝

We meet every two weeks on Wednesday in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest, you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Enjoy 😎