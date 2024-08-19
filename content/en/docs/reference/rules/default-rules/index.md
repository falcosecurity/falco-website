---
title: Default Rules
description: List of default rules for Falco
linktitle: Default Rules
weight: 90
---

Falco provides default rules maintained by the maintainers with contributions from the community. More information on this [page](/docs/rules/default-custom/). 

This list presents the default rules based on syscall events.

{{% pageinfo color="info" %}}

By default, only the `stable` rules are loaded by Falco, you can install the `sandbox` or `incubating` rules by referencing them in the Helm chart:

```shell
helm install falco falcosecurity/falco \
--set "falcoctl.config.artifact.install.refs={falco-rules:3,falco-incubating-rules:4,falco-sandbox-rules:4}" \
--set "falcoctl.config.artifact.follow.refs={falco-rules:3,falco-incubating-rules:4,falco-sandbox-rules:4}" \
--set "falco.rules_files={/etc/falco/k8s_audit_rules.yaml,/etc/falco/rules.d,/etc/falco/falco_rules.yaml,/etc/falco/falco-incubating_rules.yaml,/etc/falco/falco-sandbox_rules.yaml}"
```

Where the option `falcoctl.config.artifact.install.refs` governs which rules are downloaded at startup, `falcoctl.config.artifact.follow.refs` identifies which rules are automatically updated and `falco.rules_files` indicates which rules are loaded by the engine.

{{% /pageinfo %}}

You can find all the rules in their official [repository](https://github.com/falcosecurity/rules/blob/main/rules/).

{{< rules_list >}}
