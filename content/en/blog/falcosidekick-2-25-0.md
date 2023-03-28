---
title: Falcosidekick 2.25.0 and Falcosidekick 2.0.0
date: 2022-06-01
author: Thomas Labarussias
slug: falcosidekick-2-25-0-falco-2-0-0
tags: ["Falcosidekick","Release"]
---

A few days ago was the KubeCon EU in Valencia, Spain. The moment to meet contributors who made what Falcosidekick is now was a really enjoyable time and I hope we'll do it again in the future. One week before, two new major versions of Falcosidekick and Falcosidekick-Ui were released. Let's see what's new.

# Falcosidekick

Almost 10 months without a new release for Falcosidekick, the version [2.25.0](https://github.com/falcosecurity/falcosidekick/releases/tag/2.25.0), and what a huge release is. For curious people, the full changelog can be found [here](https://github.com/falcosecurity/falcosidekick/releases/tag/2.25.0).

## New outputs

Each new release brings more outputs, thanks to the community. Here's the list of new ones:

### Policy Report

With some CRD, you can now create reports in your Kubernetes clusters, the feature is often used for Security or Compliance, but anything is technically possible. For more details about how to use this output, read the documentation from [@anushkamittal20](https://github.com/anushkamittal20) who implemented it for her project for [Linux Foundation Mentorship Program](https://lfxms22.sched.com/event/tRXy/understanding-falco-and-policy-report-output-for-falcosidekick-anushka-mittal-nirmata-india).

```yaml
apiVersion: wgpolicyk8s.io/v1alpha2
kind: ClusterPolicyReport
metadata:
  creationTimestamp: "2022-05-23T13:57:40Z"
  generation: 110
  name: falco-cluster-policy-report-4c9eac68
  resourceVersion: "71090"
  uid: ed8f0659-74d5-488c-90f8-d7b0622738cf
results:
- category: SI - System and Information Integrity
  message: Cluster Role Binding to cluster-admin role (user=%ka.user.name subject=%ka.req.binding.subjects)
  policy: Attach to cluster-admin Role
  properties:
    ka.req.binding: '%ka.req.binding'
    ka.user.name: '%ka.user.name'
  result: fail
  severity: high
  source: Falco
  timestamp:
    nanos: 98821031
    seconds: 40
- category: SI - System and Information Integrity
  message: Created Role/ClusterRole with write privileges (user=%ka.user.name role=%ka.target.name
    rules=%ka.req.role.rules)
  policy: ClusterRole With Write Privileges Created
  properties:
    ka.req.role: '%ka.req.role'
    ka.target.name: '%ka.target.name'
    ka.user.name: '%ka.user.name'
  result: fail
  severity: high
  source: Falco
  timestamp:
    nanos: 103148849
    seconds: 42
```

The reports can also be displayed with [Policy Reporter UI](https://github.com/kyverno/policy-reporter-ui), created by [@fjogeleit](https://github.com/fjogeleit) another member of the Falco community.

![policy-reporter-ui](/img/falcosidekick-2-25-0-policy-reporter-ui.png)

### Syslog

Years after its creation, Syslog remains a solid solution for managing the log files, especially if you're running Falcosidekick or else directly at the host level. With this new version, a Syslog server can be directly used as the target for the events, allowing you to send them in a secure place. Thanks to [@bdluca](https://github.com/bdluca). 

### AWS Kinesis

Do you want to ingest thousands of events from Falco and be able to run data analysis on them? You can do so smoothly with the new AWS Kinesis output, bringing a new integration of Falco with AWS Ecosystem. We would be delighted to know any use case with analytics the community could create now. Thanks to [@gauravgahlot](https://github.com/gauravgahlot).

### Zoho Cliq

Your DevOps/SRE/SecOps team uses [Zoho Cliq](https://www.zoho.com/cliq/) for their communication? Allow them to receive nice notifications with this new output for Falcosidekick. Thanks to [@averni](https://github.com/averni).

## Enhancements

Getting new features is nice, but we can also improve the existing ones, here's a list of major changes of this 2.25.0 release.

### Compiled ans signed binaries

Until then, if you wanted binaries of Falcosidekick, you had to build them by yourself or use the provided Docker image. Now, each release will contain the compiled binaries for amd64 and arm64. The security is not forgotten, all artifacts are signed with [Cosign](https://docs.sigstore.dev/cosign/overview/).

### Tags and Source

In January, [Falco 0.31.0](https://falco.org/blog/falco-0-31-0/) brought its new Plugin system, the `source` field of events becoming more important. This new release of Falcosidekick updates all the outputs to deal with `source` and `tags` events. Your Response Engines can now be much clever than even.

### IRSA

IRSA, aka Iam Role for Service Accounts, is the method provided by AWS for linking a Kubernetes Service Account with an IAM Role, allowing the Pod to easily use a Service. Falcosidekick is now able to use this mechanism for its outputs for AWS Services, no need to add Access and Secret Keys in your `values.yaml`. The UX is much better. Thanks to [@VariableExp0rt](https://github.com/VariableExp0rt).

# Falcosidekick UI

I created the first version v0 of Falcosidekick-UI to have something more graphical for my talks, with the help of [@fjogeleit](https://github.com/fjogeleit) we created a nice v1 that has been finally used more and more by people, becoming a famous product in the community. 
It was time to have a better version with some requested features:
* a database (Redis) for a long term storage of events
* an API for counting or searching the events
* filters are kept as query strings, allowing to share links

All details to use this new version, v2.0.0, are described in the [README](https://github.com/falcosecurity/falcosidekick-ui).

Here's some screenshots:

![https://github.com/falcosecurity/falcosidekick-ui/raw/master/imgs/webui_01.png](https://github.com/falcosecurity/falcosidekick-ui/raw/master/imgs/webui_01.png)
![https://github.com/falcosecurity/falcosidekick-ui/raw/master/imgs/webui_02.png](https://github.com/falcosecurity/falcosidekick-ui/raw/master/imgs/webui_02.png)
![https://github.com/falcosecurity/falcosidekick-ui/raw/master/imgs/webui_04.png](https://github.com/falcosecurity/falcosidekick-ui/raw/master/imgs/webui_04.png)

# Deployments

The Helm charts are already up to date, you can upgrade your deployments with:

```yaml
helm upgrade falcosidekick falcosecurity/falcosidekick --set webui.enabled=true -n falco
```
or
```yaml
helm upgrade falco falcosecurity/falco \
  --set falcosidekick.enabled=true \
  --set falcosdekick.webui.enabled=true -n falco
```

*Enjoy*

----

If you would like to find out more about Falco:

- Get started in [Falco.org](http://falco.org/).
- Check out the
  [Falco project in GitHub](https://github.com/falcosecurity/falco).
- Get involved in the [Falco community](https://falco.org/community/).
- Meet the maintainers on the
  [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
- Follow [@falco_org on Twitter](https://twitter.com/falco_org).

