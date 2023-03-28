---
title: Falco on AWS Cloud
date: 2022-11-30
author: The Falco Authors
slug: falco-on-aws
tags: ["Falco","Cloud"]
---

It's Amazon Web Services' largest user conference this week, [re:Invent](https://reinvent.awsevents.com/), which is a good time to highlight the ways you can use Falco in the AWS Cloud for runtime security. In this article we'll review what's new, and take a look at installation, plugins, and integrations for AWS.

## Support for Amazon Security Lake

We're pleased to announce that Falcosidekick will shortly be available with preview integration for [Amazon Security Lake](https://aws.amazon.com/security-lake/), a new service that optimizes and centralizes security data from cloud, on-premises, and custom sources into a purpose-built data lake.

Falcosidekick is designed to forward Falco events into other services: the new integration exports security events using the [Open Cybersecurity Schema Framework](https://schema.ocsf.io) (OCSF) format, an open industry standard, and sends them directly to Amazon Security Lake. This makes it easier to normalize and combine Falco events with other security data sources. You can check out the integration in the next version of Falcosidekick, 2.27.0.

## Installation and drivers

You can find Falco and Falcosidekick as container images through the Amazon ECR Registry:

* [Falco](https://gallery.ecr.aws/falcosecurity/falco) image.
* [Falcosidekick](https://gallery.ecr.aws/falcosecurity/falcosidekick) image.

Additionally, the Falco project publishes pre-built driver modules for AWS kernels, whether you are using the kernel module driver or the eBPF probe. These can be fetched using `falco-driver-loader`.

Review the available drivers:

* [eBPF probes for AWS](https://download.falco.org/driver/site/index.html?lib=3.0.1%2Bdriver&target=all&arch=all&kind=ebpf&search=amazon) 
* [Kernel modules for AWS](https://download.falco.org/driver/site/index.html?lib=3.0.1%2Bdriver&target=all&arch=all&kind=kmod&search=amazon) 

The prebuilt modules are available for both _x86_64_ and _aarch64_ architectures.

## Plugins

Falco plugins let you use event sources other than kernel syscalls. Falco has two plugins specific to AWS.

1. The [CloudTrail plugin](https://falco.org/docs/event-sources/cloudtrail/) can read AWS CloudTrail logs and emit events for each CloudTrail log entry. It includes out-of-the-box rules that can be used to identify potential threats in CloudTrail logs, including:
    * Console logins that do not use multi-factor authentication.
    * Disabling multi-factor authentication for users.
    * Disabling encryption for S3 buckets.
2. Falco has extended its capability to read Kubernetes audit logs through a [plugin for CloudWatch](https://github.com/falcosecurity/plugins/tree/master/plugins/k8saudit-eks), where it can read the EKS audit logs. [Read more about configuration and usage](https://falco.org/blog/k8saudit-eks-plugin/).

## Falcosidekick integrations

[Falcosidekick](https://github.com/falcosecurity/falcosidekick) lets you forward events from Falco into a variety of different services, including many on AWS.

* Cloudwatch Logs: emit events into a CloudWatch log stream.
* S3: add events in JSON format to an S3 bucket.
* Lambda: invoke a Lambda function in response to a Falco event.
* SQS: send a message into an SQS queue.
* SNS: create a push notification to apps or people.
* Kinesis: send Falco events as streaming data.
* Amazon Security Lake: add Falco events to a security data lake.

## Conclusion

Falco offers a wide variety of support for runtime security on the AWS cloud. As we are an open source project, we welcome contributions and feedback! Read more about running Falco on AWS from this AWS Security blog post, [Continuous runtime security monitoring with AWS Security Hub and Falco](https://aws.amazon.com/blogs/security/continuous-runtime-security-monitoring-with-aws-security-hub-and-falco/).

You can find us in the [Falco community](https://github.com/falcosecurity/community). Please feel free to reach out to us for any questions, suggestions, or even for a friendly chat!

If you would like to find out more about Falco:



* Get started in [Falco.org](http://falco.org/)
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org)
