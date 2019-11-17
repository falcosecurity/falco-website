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

Notice how the meta information found in the [repository](https://github.com/falcosecurity/cloud-native-security-hub/blob/master/resources/falco/cve/2019-11246.yaml#L10-L19) matches up with the data rendered on [the security hub page for CVE-2019-11246](https://github.com/falcosecurity/cloud-native-security-hub/blob/master/resources/falco/cve/2019-11246.yaml#L10-L19)

Currently we support `helm upgrade` as well as raw YAML for rules.

We have plans to take it a step further with our new CLI tool `falcoctl` that is currently in an alpha state. Keep reading to find out more on how to get involved and contribute.

# Getting involved 

The project was originally started by Sysdig, but maintaining the repositories, and building out rules will now be governed by the CNCF and the Falco community. 

If you are interested in getting involved with writing rules, or building out tooling around the new hub please reach out to [The official CNCF Falco Mailing List](https://lists.cncf.io/g/cncf-falco-dev) or join the [Falco slack channel](slack.sysdig.com).

### Integrating with Falcoctl

We are currently in the process of building out command line tooling for managing security hub rules with [falcoctl](github.com/falcosecurity/falcoctl).

If you write Go, and are interested in joining in the effort of building out a management experience for users, we would love to collaborate with you! Please reach out using the links above and we can get started. 

We are currently working on proposing the following subcommands with `falcoctl`. We welcome all ideas and would love to invite new contributors to work on these features or offer ideas and suggestions. 

```bash 
# This will add a rule to the Falco configuration directory
# This will use the local kubeconfig to authenticate with the cluster
# We can add a --local flag or something else to tell Falcoctl 
falcoctl install rule github.com/org/repo/rule/

# This will add a repository to the local cache to use to install 
falcoctl add repo github.com/org/repo 

# This will hot-reload Falco by sending SIGHUP to the process to reload it, thus reloading newly installed rules
falcoctl reload

# Other ideas for Falcoctl
falcoctl delete rule 
falcoctl explain rule 
falcoctl list rules 
falcoctl new rule 
```

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
