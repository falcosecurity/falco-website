---
title: CloudTrail Events
description: Detect undesired actions in your AWS environment
linktitle: CloudTrail Events
weight: 30
aliases: [/docs/event-sources/cloudtrail/]
---

The Falco [cloudtrail](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail#readme) plugin can read [AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html) logs and emit events for each CloudTrail log entry.

This plug-in also includes out-of-the-box [rules](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail/rules/aws_cloudtrail_rules.yaml) that can be used to identify interesting/suspicious/notable events in CloudTrail logs, including:

* Console logins that do not use multi-factor authentication 
* Disabling multi-factor authentication for users 
* Disabling encryption for S3 buckets 

## Configuration

See the [README](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail#configuration) for information on how to configure the plugin. The plugin initialization and open params strings/objects can be added to `falco.yaml` under the `plugins` [configuration key](/docs/reference/daemon/config-options/).

## Methods to read AWS CloudTrail logs

The plugin can be configured to read log files from:

* A S3 bucket
* A SQS queue that passes along SNS notifications about new log files
* A local filesystem path

For more information on the open params syntax, see [open params](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail#plugin-open-params).

## Terraform Module for CloudTrail | Prerequisites

In order to use the AWS CloudTrail plugin, you must [enable](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enable-cloudtrail-logging-for-s3.html) CloudTrail logging for the account(s) you want to monitor. This must be done before using the plugin.

In addition, of the three options above, using an SQS queue provides the easiest-to-consume source of logs. With the SQS queue, the plugin can detect when the new log files are written and can automatically consume them.

However, this also requires creating multiple AWS cloud resources, such as SQS queues, SNS topics/subscriptions, IAM policy documents, etc., outside of Falco, which involve multiple manual steps.

To make this process easier, we've created a Terraform [module](https://github.com/falcosecurity/falco-aws-terraform) that automatically creates these resources.
