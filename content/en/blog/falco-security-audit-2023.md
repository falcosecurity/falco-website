---
title: The 2023 Falco Security Audit
date: 2023-03-22
author: Luca Guerra
slug: falco-security-audit-2023
---

We are happy to announce that in early 2023 the Falco project completed a security audit sponsored by the CNCF, with support from the [Open Source Technology Improvement Fund](https://www.ostif.org) and conducted by the security experts at [Quarkslab SAS](https://www.quarkslab.com/). The audit was focused on identifying security issues in the codebase and providing suggestions for implementing more static and dynamic security analysis strategies to help continuously maintain high security standards in the project.

A group of Falco maintainers volunteered to provide help and collaborated with the team every step of the way, including defining a threat model, navigating the codebase and agreeing on static and dynamic analysis recommendations.

## Findings and available patches

The full report is available in the [Falco repository (pdf)](https://github.com/falcosecurity/falco/blob/master/audits/SECURITY_AUDIT_2023_01_23-01-1097-LIV.pdf). In a nutshell, the report identified one medium severity finding and a number of low and informational severity findings. There were no high or critical severity vulnerabilities and the findings were not found to be likely to be exploited with significant impact.

We worked to address all the findings in our most recent releases. The Falco [0.34.0 release](https://falco.org/blog/falco-0-34-0/) and [0.34.1 patch release](https://falco.org/blog/falco-0-34-1/) launched February 2023 based on Falco Libraries 0.10.3 and 0.10.4 addressed all the medium and low severity findings, along with informational findings as well. Details on the issues, credits, patches and affected versions have been published in the relevant [repository security advisories](https://github.com/falcosecurity/libs/security/advisories) as soon as the fixes were available.

## Static and dynamic analysis enhancements

One very important aspect of this audit is that the team worked on providing valuable suggestions to strengthen static and dynamic analysis of the entire codebase. We have already enhanced our CI/CD pipelines with [additional CppCheck steps in the Falco CI](https://github.com/falcosecurity/falco/blob/93ae6bb6098e7563f94738839715c2d7ee8f5ab5/.github/workflows/staticanalysis.yaml). The community has also decided to [integrate Semgrep](https://github.com/falcosecurity/libs/tree/master/semgrep) to prevent potentially dangerous functions from being added and [extend our AddressSanitizer and LeakSanitizer coverage](https://github.com/falcosecurity/libs/blob/33b2337c384b608049c8d619698396bd706ad98b/.github/workflows/ci.yml#L283), with even more additions to come.

Another very interesting part of the report concerns the technical challenges of implementing a [fuzzer](https://owasp.org/www-community/Fuzzing) for a project as complex as Falco. By leveraging the expertise shared by the audit team in the report, we believe it is possible to build a robust fuzzer that can run continuously. According to the report it is not an easy project but certainly a worthwhile one.

## Conclusions and thanks

Security is a never ending task, and the Falco community is always very happy and eager to collaborate with security experts to make all aspects of Falco more secure. 

The Falco maintainers had a pleasant experience working with the Quarkslab team and we appreciate the smooth communication while sharing security and engineering knowledge. The community is pleased with the overall high quality of this work.

We wish to thank all of the following Falco project maintainers who were involved in the audit Fred Araujo, Jason Dellaluce, Mauro Moltrasio, Leonardo Grasso, Luca Guerra, Teryl Taylor and Michele Zuccala, we appreciate your assistance and knowledge sharing with the Quarkslab team. Big thank you to the Quarkslab team too: Frédéric Raynal, Ramtine Tofighi Shirazi, Victor Houal, Laurent Laubin and Mahé Tardy and the OSTIF team for facilitating and sponsoring the project: Derek Zimmer and Amir Montazery.
