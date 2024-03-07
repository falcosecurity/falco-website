---
title: Preventing attacker persistence with Falco on AWS
description: Use Falco to detect when malicious code may have been added to a Lambda function. 
date: 2024-03-07
author: Mike Coleman
slug: aws-detection
images:
  - /blog/atomic-red-falco/images/aws-detection-featured.png
tags: ["security-concept"]
---


I recently read an [interesting blog](https://medium.com/@MorattiSec/the-crow-flies-at-midnight-exploring-red-team-persistence-via-aws-lex-chatbots-b3de1edb7893) on how hackers could use a Lambda function alongside Lex to establish persistence in an AWS account. For those unfamiliar with the term, persistence is when attackers leverage some technique to retain access to systems without being detected. A [recent news article](https://www.nbcnews.com/tech/security/chinese-hackers-cisa-cyber-5-years-us-infrastructure-attack-rcna137706) cited a study that reported that some Chinese hackers have lurked in systems for up to FIVE YEARS! Luckily for all of us, Falco can be used to detect the exact scenario detailed in the blog and immediately raise an alert. 

The blog detailed how an attacker who has gained access to an AWS account could modify an existing Lex-based Lambda function to provide a set of AWS credentials. In short, the attacker modified the function of the Lex-based chatbot to respond whenever a secret phrase was entered with the Lambda’s AWS key ID and secret key. 

The author notes there are several ways to establish persistence on AWS, and maybe this wasn’t the most practical, but I still found it a fun exercise. It got me thinking: How could Falco help here? My immediate thought was to use Falco’s [AWS Cloudtrail plugin](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail/README.md). 

The plugin, as the name implies, ingests Cloudtrail events. The events can be evaluated against a [set of rules](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail/rules/aws_cloudtrail_rules.yaml#L237,L252) to alert engineers of any suspicious activity. There are currently just over 20 different rules that can be assessed. They include scenarios like creating new users, having someone log into the root account without MFA, changing permissions on an S3 bucket, and, most relevant to our discussion here, modifying a Lambda function. 

```yaml
- rule: Update Lambda Function Code
  desc: Detect updates to a Lambda function code.
  condition:
    ct.name="UpdateFunctionCode20150331v2" and not ct.error exists
  output:
    The code of a Lambda function has been updated.
    (requesting user=%ct.user,
     requesting IP=%ct.srcip,
     AWS region=%ct.region,
     lambda function=%ct.request.functionname)
  priority: WARNING
  tags:
    - cloud
    - MITRE_TA0003_persistence
    - aws_lambda
  source: aws_cloudtrail
```

Alternatively, you could create custom rules based on a whole list of AWS CloudTrail events. In the below Falco rule, we referenced the Cloudtrail event name [UpdateFunctionCode20150331v2](https://gist.github.com/pkazi/8b5a1374771f6efa5d55b92d8835718c#file-cloudtraileventnames-list-L2882). Over 3000 event names can be used with Falco for deep incident response and forensics in the cloud.

So, in the scenario above, whenever the attacker modifies the function, an entry is written to the Cloudtrail logs (note that Cloudtrail is enabled by default, so no extra work is needed to get it running). Those logs would be immediately forwarded to Falco via the Cloudtrail plugin. Falco would evaluate the event against the ruleset and fire off an alert that the rule had been violated. 

```
 The code of a Lambda function has been updated.
(requesting user=mikegcoleman, requesting IP=10.0.01, AWS region=us-west-1,lambda function=AirlinesBusinessLogic)
```

Upon receiving the alert, an AWS engineer could review whether or not the change had been authorized and act accordingly. 

Now, it’s important to note that there are other ways that Lambda functions can be stored. For instance, the function's code can be zipped up and then stored in an S3 bucket. The rules we used above wouldn't cover this scenario. You could very likely craft a rule to ensure that a bucket’s contents have not been modified. We will save that for another blog. 

The [Falco plugins repository](https://github.com/falcosecurity/plugins/) includes the AWS Cloudtrail plugin and plugins for [Okta](https://github.com/falcosecurity/plugins/tree/master/plugins/okta), [GitHub](https://github.com/falcosecurity/plugins/tree/master/plugins/github), [Google Cloud](https://github.com/falcosecurity/plugins/tree/master/plugins/gcpaudit), and more. In fact, I recently published a [walkthrough](https://github.com/falcosecurity/plugins/blob/master/plugins/gcpaudit/walkthrough.md) on how to use the Google Cloud plugin. Be sure to check it if you’d like to learn more about how plugins are installed and configured. 
