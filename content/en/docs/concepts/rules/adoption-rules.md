---
title: Adoption of Falco Rules in Production
description: How to adopt Falco rules in real-life production
linktitle: Adoption of Falco Rules in Production
weight: 100
aliases:
- ../rules/adoption-rules
---


You have learned how to write Falco rules with best practices in mind and are now ready to deploy Falco to production and operationalize the rules. You might be wondering, "How do I go about this? How can I not only get the most value out of Falco but also maintain the rules effectively across varying infrastructure setups?"

The Falco Project has introduced the [Rules Maturity Framework](https://github.com/falcosecurity/rules/blob/main/CONTRIBUTING.md#rules-maturity-framework) to precisely assist you in this process. The framework facilitates the adoption of the stable default rules more effectively while also providing guidance for custom rules. This framework ensures a smooth transition for adopters, whether they use rules generically or for specific use cases. A smooth adoption process is defined by making it easy for adopters to understand each rule and also gain an understanding of not just what the rule is doing, but also how beneficial it can be under various circumstances. As a result, adopters should have a clear idea of which rules can likely be adopted as-is versus which rules may require significant engineering efforts to evaluate and adopt.

To begin, allocate some time to assess the top cyber threats that are specific to your organization and require monitoring in place. One way to go about this is by exploring the already mentioned default rules tagged with the maturity level "stable" first. Explore the source [falco_rules.yaml](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml) file and/or the latest [rules overview](https://falcosecurity.github.io/rules/) document. These rules are designed to detect more universal system-level cyber threats, aligned with the [Mitre Attack](https://attack.mitre.org/) framework. Examples include remote code execution, generic malicious executions, container escapes, network pivots, privilege escalations, or credentials lifting. Some of these rules are also valuable for compliance-related monitoring.

Depending on your familiarity with security monitoring and detections, a little ramping up may be necessary to assess how useful a particular rule is in your environment. This includes determining the level of customization needed for a rule, for example, tuning out noise to reduce False Positives, and on the flip side, ensuring you are resilient against False Negatives. Additionally, it involves determining the appropriate output fields and the deployment configurations you need. It may also include finding the most optimal ways to maintain different deployment configurations across various infrastructures where you intend to deploy Falco. Existing descriptions of Falco rules, the [official guides](https://falco.org/docs/) you've read, as well as the many [blog](https://falco.org/blog/) posts hosted by The Falco Project, can provide you with further assistance.

## High-level Phases

- Newcomers to Falco will be encouraged to start by configuring their setup with introductory rules labeled as "Falco's default rules" (`maturity_stable`). These rules, which are currently based on syscall and container events, live in the established [falco_rules.yaml](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml) file.
- As users become more familiar with Falco and better understand their unique environments, they can gradually fine-tune the default rules to meet their specific requirements. Tuning rules goes hand in hand with assessing the performance overhead and adjusting Falco's [configuration](https://github.com/falcosecurity/falco/blob/master/falco.yaml) accordingly. This consideration is important to keep in mind as there are usually limitations to the budget allocated for security monitoring.
- Once adopters have integrated the stable default rules with low false positives and acceptable performance consistently, they can add a next set of rules. This set may include rules with `maturity_incubating` or `maturity_sandbox`,  offering more specific detections and/or broader monitoring, depending on the rule. The level of engineering effort needed to effectively use these rules at this stage is likely to increase.
- Alongside each of these phases, creating custom rules early on often makes a lot of sense. For instance, enabling monitoring around sensitive files that are unique to your environment and ecosystem would be an appropriate example. The same approach could be applied to set up monitoring for crown jewel services with detailed knowledge of their usual execution patterns, and then set up alerts for any deviations.
- Lastly, up until now, we focused on syscall and container event-based default rules. However, Falco also features a rich [plugins](https://github.com/falcosecurity/plugins) system alongside plugin rules that you can explore to see if they are a fit for your ecosystem.

*Disclaimer*: The maturity level of the rules, however, does not directly reflect their potential for generating noise in the adopters' environment. This is due to the unique and constantly changing nature of each environment, especially in cloud environments, making it challenging to accurately predict the impact of rules.


## Effective End-to-End Operationalization

Effective end-to-end operationalization is ideally accomplished through 24/7 detection triage by security analysts and pre-defined runbooks in the incident response workflows. This aspect is unique to your environment, and you can explore how Falco alerts can be augmented with additional data enrichments. Finding the right scope of monitoring can be achieved through experimentation. We also encourage you to find ways to perform continuous end-to-end testing or simulations to ensure the entire data pipeline is functional. This includes validating that Falco is logging the events, ensuring subsequent log transport to your end destination (which can be a data lake and compute platform or a SIEM) is working, and having effective triage and response mechanisms in place.

## Continuous Learning and Maintenance

Falco continuously evolves and improves over time. This also means that for each Falco release, allocating time to explore the newest features can be beneficial. Furthermore, infrastructure, cloud environments, and your organization's applications keep evolving as well. Therefore, Falco rules require constant tuning and maintenance to ensure the desired monitoring quality.
