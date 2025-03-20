---
title: Detecting Supply Chain Attacks with Falco Actions
date: 2025-03-19
author: Igor Eulalio and Edson Celio
slug: detecting-supplychain-attacks-with-falco-action
tags: ["Falco","Kubernetes", "cicd", "Github Action", "SupplyChain"]
---


The recently discovered CVE for the GitHub action tj-actions/changed-files brought to light a topic that is really critical for companies: supply chain attacks. With that, we want to discuss and show a bit about how Falco can help your organization detect this kind of attack and other suspect behaviors inside your CI/CD pipeline.


## What is Falco?

Falco is a cloud native security tool that provides runtime security across hosts, containers, Kubernetes, and cloud environments. It leverages custom rules on Linux kernel events and other data sources through plugins, enriching event data with contextual metadata to deliver real-time alerts. Falco enables the detection of abnormal behavior, potential security threats, and compliance violations.

## What is Falco Actions?

Falco Actions enable you to run Falco in GitHub Actions to detect suspicious behavior in your CI/CD workflows. If you run it in a pull request, the action will create a comment with the findings.

Thanks to ad-hoc Falco rules specific to this use case, these GitHub actions can monitor your GitHub runner and detect software supply chain attacks.

## Using Falco Actions

You can use the actions in two modes:
* `live`: it meant to protect a single job at runtime
* `analyze`:  it meant to offer a more detailed report

To use with the `live` mode, you need to have a workflow similar to this:

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
          falco-version: '0.39.0'
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

With this you will be able to see at the github action summary the list of the events that detected by Falco.






