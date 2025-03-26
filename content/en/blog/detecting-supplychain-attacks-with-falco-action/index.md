---
title: Detecting Supply Chain Attacks with Falco Actions
date: 2025-03-19
author: Igor Eulalio and Edson Celio
slug: detecting-supplychain-attacks-with-falco-action
tags: ["Falco","Kubernetes", "cicd", "Github Action", "SupplyChain"]
---


The recently discovered CVE for the GitHub action `tj-actions/changed-files` brought to light a topic that is really critical for companies: supply chain attacks. With that, we want to discuss and show a bit about how Falco can help your organization detect this kind of attack and other suspect behaviors inside your CI/CD pipeline.


## What is Falco?

Falco is a cloud native security tool that provides runtime security across hosts, containers, Kubernetes, and cloud environments. It leverages custom rules on Linux kernel events and other data sources through plugins, enriching event data with contextual metadata to deliver real-time alerts. Falco enables the detection of abnormal behavior, potential security threats, and compliance violations.

## What is Falco Actions?

[Falco Actions](https://github.com/falcosecurity/falco-actions) enable you to run Falco in GitHub Actions to detect suspicious behavior in your CI/CD workflows. If you run it in a pull request, the action will create a comment with the findings.

Thanks to ad-hoc Falco rules specific to this use case, these GitHub actions can monitor your GitHub runner and detect software supply chain attacks.

## Using Falco Actions

To have Falco inside your pipeline, you need to add these two actions:
* `falcosecurity/falco-actions/start`
* `falcosecurity/falco-actions/stop`

Below you can see an example:

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      actions: read

    steps:
      - uses: actions/checkout@v4

      - name: Start Falco
        uses: falcosecurity/falco-actions/start@main
        with:
          mode: live
          falco-version: '0.40.0'
          verbose: true
        
      - name: My Custom Step
        run: |
          echo "This is my custom step"
        
      - name: Stop Falco
        uses: falcosecurity/falco-actions/start@main
        with:
          mode: live
          verbose: true   
```

**OBS: main is being used here only to simplify how it works, you should always pin your dependencies to a specific commit SHA.**

After the execution, you will be able to see the results at the github action summary.


If you want a more detailed report, you can use the action `falcosecurity/falco-actions/analyze`; it will allow you to have a better report with information like:

* Falco rules triggered during steps' execution.
* Contacted IPs
* Contacted DNS domains
* SHA256 hash of spawned executables
* Spawned container images
* Written files
* A summary of the report generated with OpenAI
* Reputation of Contacted IPs
* Reputation of SHA256 hashes

For more informations about the usage, you can check the [github repository](https://github.com/falcosecurity/falco-actions) for the actions.

## Default rules file

By default, Falco action will detect a variety of events, following the [default CICD rules](https://github.com/falcosecurity/falco-actions/blob/main/rules/falco_cicd_rules.yaml), that can be overridden if you want.

In the example from the `tj-actions/changed-files` exploit, one rule that would be triggered is the **Process Dumping Memory of Others**, which was used during the exploit to dump environment variables from the main process and print them as part of the Github runner execution.

The Falco team is always adding new rules to ensure our users get value out of the box, but you can also write your own rules according to your company policy.

## Conclusions

These actions are just the beginning of having the Falco capabilities inside the CI/CD pipelines. You can customize and have your own set of rules, keeping all environments and scenarios covered and protected from supply chain attacks.

## Let's meet!

As always, we meet every 2 weeks on Wednesday at 4pm UTC in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

 - Join the #falco channel on the [Kubernetes Slack](https://slack.k8s.io)
 - [Join the Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)


Enjoy 😎,

_Igor and Edson_



