---
title: Cloudtrail Events
weight: 2
---

The Falco [Cloudtrail](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail#readme) plugin can read [AWS Cloudtrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html) logs and emit events for each Cloudtrail log entry.

Falco also distributes out-of-the-box [rules](https://github.com/falcosecurity/falco/blob/master/rules/aws_cloudtrail_rules.yaml) that can be used to identify interesting/suspicious/notable events in Cloudtrail logs, including:

* Console logins that do not use multi-factor authentication
* Disabling multi-factor authentication for users
* Disabling encryption for S3 buckets.

# Configuration

See the [README](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail#configuration) for information on how to configure the plugin. The plugin initialization and open params strings/objects can be added to `falco.yaml` under the `plugins` [configuration key](https://falco.org/docs/configuration/) key.

# Ways to read Cloudtrail Logs

The plugin can be configured to read log files from:

* A S3 bucket
* A SQS queue that passes along SNS notifications about new log files
* A local filesystem path

For more information on the open params syntax, see [open params](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail#plugin-open-params).

# Terraform Module For Cloudtrail Prerequsites

In order to use the Cloutrail plugin, you must [enable](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enable-cloudtrail-logging-for-s3.html) Cloudtrail logging for the account(s) you want to monitor. This must be done before using the plugin.

In addition, of the three options above, using an SQS queue provides the easiest-to-consume source of logs. With the SQS queue, the plugin can detect when the new log files are written and can automatically consume them. However, this also requires creating multiple AWS cloud resources, such as SQS queues, SNS topics/subscriptions, IAM policy documents, etc., outside of Falco, which involve multiple manual steps.

To make this process easier, we've created a Terraform [module](https://github.com/falcosecurity/falco-cloudtrail-terraform) that automatically creates these resources.
