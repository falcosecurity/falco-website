---
title: Cloud Native Security Hub
date: 2019-11-18
author: Kris Nova
---
# Falco rules management 

The Falco community is excited to announce that we will be optimizing how we manage and install security rules for the Falco engine to assert.

We have published an [open source repository](https://github.com/falcosecurity/cloud-native-security-hub/tree/master/resources/falco) of common security rules that can be used with Falco. You can check out the rules dynamically rendered on [securityhub.dev](https://securityhub.dev/).

## Installing a rule

In this quick example we will be adding runtime detection for `CVE-2019-11246`. 

#### Understanding Rules

Notice how the meta information found in the [repository](https://github.com/falcosecurity/cloud-native-security-hub/blob/master/resources/falco/cve/2019-11246.yaml#L10-L19) matches up with the data rendered on [the security hub page for CVE-2019-11246](https://github.com/falcosecurity/cloud-native-security-hub/blob/master/resources/falco/cve/2019-11246.yaml#L10-L19)

Currently we support `helm upgrade` as well as raw YAML for rules.

#### Installing with Helm

If you are using `helm` to install and manage Falco you can mutate the configuration using friendly `helm` commands. In this example we use `-f` to append our `falco` installment with a rule from the repository.

```bash
helm upgrade falco -f https://api.securityhub.dev/resources/cve-2019-11246/custom-rules.yaml stable/falco
```

#### Installing with raw YAML

You can click the `yaml` button in the repository website to view the raw YAML for the rule:

```yaml
- macro: safe_kubectl_version
  condition: (jevt.value[/userAgent] startswith "kubectl/v1.19" or
              jevt.value[/userAgent] startswith "kubectl/v1.18" or
              jevt.value[/userAgent] startswith "kubectl/v1.17" or
              jevt.value[/userAgent] startswith "kubectl/v1.16" or
              jevt.value[/userAgent] startswith "kubectl/v1.15" or
              jevt.value[/userAgent] startswith "kubectl/v1.14.3" or
              jevt.value[/userAgent] startswith "kubectl/v1.14.2" or
              jevt.value[/userAgent] startswith "kubectl/v1.13.7" or
              jevt.value[/userAgent] startswith "kubectl/v1.13.6" or
              jevt.value[/userAgent] startswith "kubectl/v1.12.9")

# CVE-2019-11246
# Run kubectl version --client and if it does not say client version 1.12.9, 1.13.6, or 1.14.2 or newer,  you are running a vulnerable version.
- rule: K8s Vulnerable Kubectl Copy
  desc: Detect any attempt vulnerable kubectl copy in pod
  condition: kevt_started and pod_subresource and kcreate and
             ka.target.subresource = "exec" and ka.uri.param[command] = "tar" and
             not safe_kubectl_version
  output: Vulnerable kubectl copy detected (user=%ka.user.name pod=%ka.target.name ns=%ka.target.namespace action=%ka.target.subresource command=%ka.uri.param[command] userAgent=%jevt.value[/userAgent])
  priority: WARNING
  source: k8s_audit
  tags: [k8s]
```

You can then install using the supported Falco parlance defined [in the official documentation](https://falco.org/docs/rules/#appending-to-lists-rules-and-macros). 

We have plans to take it a step further with our new CLI tool `falcoctl` that is currently in an alpha state. Some basic features we are looking to build

 - CLI style interface for managing `falco` rules (install, get, update, remove)
 - Authentication of rules using hashing and well-known keys in a repository 
 - Documentation on how to build your own repository 
 - Gitops style workflow 

Keep reading to find out more on how to get involved and contribute, especially if you have ideas. We would **love** to hear them.

# Getting involved 

The project was originally started by Sysdig, but maintaining the repositories, and building out rules will now be governed by the CNCF and the Falco community. 

If you are interested in getting involved with writing rules, or building out tooling around the new hub please reach out to [The official CNCF Falco Mailing List](https://lists.cncf.io/g/cncf-falco-dev) or join the [Falco slack channel](slack.sysdig.com).

### Integrating with Falcoctl

We are currently in the process of building out command line tooling for managing security hub rules with [falcoctl](github.com/falcosecurity/falcoctl).

If you write Go, and are interested in joining in the effort of building out a management experience for users, we would love to collaborate with you! Please reach out using the links above and we can get started. 

We have [proposed some changes](https://github.com/falcosecurity/falcoctl/issues/44) to the `falcoctl` code base to begin work on using `falcoctl` to manage rules. 

If reading about this gets you excited, and you would be interested in collaborating we would love to talk more. 

### Call for maintainers 

Furthermore if you are interested in getting directly involved with CNCF open source, and would like a shot at becoming a maintainer please reach out using the links above. You will have a chance to work directly with the Falco team, and the Falco community. As well as have ownership over a cutting edge security tool.

### Contributing rules

The anatomy of a Falco rule for the security hub is as follows:

```yaml
apiVersion: v1
kind: FalcoRules
name: CVE-2020-12345
shortDescription: What does this rule do? Why is it useful?
version: 1.0.0
description: |
  # Here is valid markdown
  
  Add *anything* you want and it will be rendered on the security hub!

keywords:
  - falco, rule, awesome
icon: https://cve.mitre.org/images/cvebanner.png
maintainers:
  - name: Kris Nova
    link: https://github.com/kris-nova
rules:
  - raw: |
  # Here is a valid Lua rule for Falco
```

Please open up a PR to the [security hub repository](https://github.com/falcosecurity/cloud-native-security-hub) with a new rule matching the syntax defined above. 
