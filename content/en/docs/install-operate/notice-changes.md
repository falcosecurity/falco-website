---
title: Notice of Important Changes and Deprecations 
description: Learn Falco's stance on beneficial/breaking changes and deprecations
linktitle: Notice of Important Changes and Deprecations
weight: 75
---

This document outlines Falco's position regarding beneficial and disruptive changes, as well as deprecations that may impact adopters' deployments.

Like any thriving project -- Falco evolves over time. 

Complex projects, such as Falco, have a limit to the number of features they can support in a stable manner. Especially for a security project, more refined and new threat detection features are constantly necessary to stay relevant. Additionally, infrastructure evolves rapidly over time. Some features that were essential in the past are no longer relevant. Instead, new features are now necessary to enable effective security monitoring in modern infrastructures. Sometimes, the issue is as simple as something not being user-friendly or being broken.

For these reasons, the Falco Project maintainers periodically review existing features, assessing not only their relevance but also their stability. If the maintainers determine that it is in the project's best interest, they either deprecate certain features or significantly refactor them. This process not only creates space for new features but also alleviates the maintenance burden.

Consequently, we recommend dedicating time for each release to assess the Level of Effort (LOE) required for potential adjustments to your custom setup. Even if the changes do not directly affect your deployment or how you use Falco, staying informed and up-to-date is crucial. This ensures that you don't miss out on the latest advancements.

## Types of Changes

**Deprecations**

As new features are introduced and technology evolves, certain features may become irrelevant or be replaced by newer equivalents. In such cases, Falco issues deprecation warnings in one release and proceeds with deprecation in the following release.

**Semantic Changes**

At times, Falco modifies the meaning or implementation of existing elements, effectively treating these changes as equivalent to new features. These slight semantic shifts often result from addressing bugs and technical debt that accumulate over time. 

**New Features**

Each release enhances Falco for better performance. Not staying informed means missing out on improvements in performance and threat detection capabilities.

## Stable Project Areas

From its very beginning, Falco's core behavior and mission have stood the test of time.

- Falco's core functionality -- monitoring Linux kernel events, applying on-host filtering through a robust expression language, and enriching events with workload owner information, has remained stable since the project's inception. Semantic changes have primarily aimed to enhance accuracy and robustness, making core behavior deprecations unlikely.

- Output and filter fields are consistently supported; while some may undergo minor semantic changes or bug fixes, fields are not usually deprecated and remain stable across releases.

- A significant core feature of Falco is its wide range of kernel version support. Each release ensures compatibility with the officially minimum supported kernel version. Falco invests substantial engineering efforts to ensure compatibility across diverse kernel versions and distributions.

- Larger initiatives that achieve stable support are unlikely to be removed from the project. Instead, we invest in further development. Examples include Falco's plugins or falcoctl.

- Rule names are mostly stable; occasional renaming occurs, and with the rules maturity framework, some rules are deprecated but accessible in the falco-deprecated rules file.

## Frequently Changing Project Areas

Based on historical observations of the project's evolution, the following areas regularly undergo adjustments:

- Configuration adjustments are common, a standard practice in advanced software projects. Keep an eye on alterations in command line args, modifications or additions in falco.yaml configuration settings, and changes in supported environment variables. These updates aim to optimize configurability, and ensure enhanced performance and overall robustness.

- Falco provides upstream solutions for deploying its software. As technology and infrastructure continuously evolve, changes are often necessary, akin to Falco's configuration adjustments. Even with a custom deployment strategy, the associated overhead is likely to be similarly high.

- Falco rules: Updates to existing rules are usually minor but quite common, involving modifications to tags, descriptions, maturity levels, or tuning out noise. Occasionally, rules undergo refactoring or deprecation. Each release typically introduces several new rules, leveraging new threat detection monitoring capabilities.

- Newer project initiatives and frameworks that have achieved stable support are still undergoing active development such as plugins and falcoctl. Expect significant changes and new features in each release.

- Building Falco from source: Always inspect the CMake setup. We frequently make changes, and we do not guarantee a stable libscap and libsinsp API interface. Besides Falco's source changes, our dependencies might also require adjustments to your build setup.

## Unplanned / Undesired Changes

Falco's configuration spectrum is notably extensive. While we strive to be proactive and prevent bugs by continually expanding our CI and e2e tests, it's impossible to cover all possible configuration combinations and custom adopter setups. If the community identifies any issues, we prioritize resolving them, sometimes requiring significant changes that enhance Falco's long-term maintainability.

## Where to find the "Important Changes" for each Falco release?

To view the important or breaking changes for each Falco release, we encourage you to check out the historical release notes and inspect the TLDR sections to understand the evolution of the project.

The release notes are located under the blog section at https://falco.org/blog, where you can manually change the Falco version to the one you are interested in. For example, the Falco release blog post 0.36.0 has the following URL: https://falco.org/blog/falco-0-36-0/.
