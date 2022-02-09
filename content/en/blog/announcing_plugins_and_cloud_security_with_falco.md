---
title: "Announcing Plugins and Cloud Security with Falco"
linktitle: "Announcing Plugins and Cloud Security with Falco"
date: 2022-02-09
author: Loris Degioanni
slug: falco-announcing-plugins
---

The just released Falco v0.31.0 is the result of several months of hard work and includes many exciting new features. One of them, however, is particularly strategic for Falco as a project: the general availability of the plugins framework. I would like to use this blog post to explain why plugins are exciting and what they mean for the future of Falco. Let’s start by explaining what this new technology is.

### What Are Plugins?
Plugins are shared libraries that can be loaded by Falco to extend its functionality. Plugins come in two flavors:

- Source Plugins add new data sources to Falco. They produce input events, from either the local machine or a remote source, that Falco can understand.
- Extractor Plugins parse the data coming from source plugins and expose new fields that can be used in Falco rules.

The combination of Source and extractors plugins allows users to feed arbitrary data into Falco, parse it in useful ways and create rules and policies from it. Let me give you an example: the Cloudtrail plugin extends Falco to understand Cloudtrail logs (either local or stored on S3) and allows you to write rules like this one:

```yaml
- rule: Console Login Without MFA
  desc: Detect a console login without MFA.
  condition: ct.name="ConsoleLogin" and ct.error=""
    and ct.user.identitytype!="AssumedRole" and json.value[/responseElements/ConsoleLogin]="Success"
    and json.value[/additionalEventData/MFAUsed]="No"
  output: Detected a console login without MFA (requesting user=%ct.user, requesting IP=%ct.srcip, AWS region=%ct.region)
  priority: CRITICAL
  source: aws_cloudtrail
```

A rule like the one above is validated and evaluated by your out-of-the-box Falco. But with plugins, rules can now be applied to almost any data source where you can write a plugin for it. And you can add new data sources without even having to rebuild Falco.

### Why Plugins?
Falco’s “runtime security” philosophy is based on some key concepts:
- Parse data in a streaming fashion to detect threats in real time
- Implement detection on top of an engine that is lightweight to run and easy to deploy 
- Offer a compact rule language that is quick to learn but flexible and expressive

This philosophy has proved to be very effective with system calls, and is the reason why Falco has thrived as a runtime security solution for containers.

Plugins extend the applicability of this philosophy to an endless number of new domains. One of these domains is cloud security.

### Runtime Security: a Better Option for Threat Detection in the Cloud
Cloud security is a fertile and constantly evolving space. When implementing cloud security you can choose among many different options. However, architecturally, most options fall in one of the following categories:

1. Tools that query the cloud APIs or watch cloud data stores to detect misconfigurations or vulnerabilities
2. Tools that stream cloud logs into a backend, index them and let you query them

To detect threats in cloud-based software, Category 1 is not very useful. Polling is great to detect gaps and validate compliance, but lacks the real time nature required to detect threats and respond quickly. Category 2 is powerful, but it’s also tremendously expensive (especially in environments like the public cloud where tons of logs are produced) and not friendly to deploy and use.

I argue that the Falco runtime security approach is the ideal one. Falco consumes few resources and, most importantly, it analyzes the data in a streaming way. No need to perform expensive copies, no need to wait until the data is indexed. Falco looks at your data in real time and notifies you in seconds.

Getting up and running with Falco takes only a few minutes, and adopting it for both cloud logs and system calls allows a unified approach to threat detection.

### What is the future for Falco?

V0.31.0 comes with one plugin, Cloudtrail, but expect many more to come in the future. Our vision is making Falco the runtime policy engine for, well, everything. :-) We want to support all the clouds, and include more services from each of them. 

Stay tuned for announcements in the near future, and at the same time, please let us know if there is an area where you would like to see Falco in action in the future. Also, [writing your own plugin is easy](https://falco.org/docs/plugins/) and, as a community, we would love to consider your creative contribution. 


You can find us in the [Falco community](https://github.com/falcosecurity/community). Please feel free to reach out to us for any questions, suggestions, or even for a friendly chat!

If you would like to find out more about Falco:

* Get started in [Falco.org](http://falco.org/)
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).
