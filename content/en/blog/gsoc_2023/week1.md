---
title: GSoC Week 1 Reflections
date: 2023-06-10
author: Rohith Raju
slug: Gsoc 2023
tags: ["Gsoc","Mentorship"]
---

Hello Folks!, my name is Rohith, and I am thrilled to share my experiences and reflections on the first week of the Google Summer of Code (GSoC) period. 

This is an exhilarating time for participants like myself as we embark on our coding journey and dive into the world of open-source development.

A huge thank you! to all the community members accepting me as one of them ❤️.

# My Project: Falco Playground

 Falco provides an intuitive and highly expressive rule language for configuring its powerful runtime security engine. However, the community still lacks an official and frictionless IDE solution for writing and testing Falco rules. Since the last few releases, the Falco libraries increased the support for multiple architectures and platforms, and the integrated rules validator added a new output in machine-readable JSON format. The idea for this project is to add WebAssembly as a new officially-supported compilation target for Falco by leveraging the Emscripten toolchain, and creating a new development environment for security rules in the form of a web single-page application by running Falco right inside the browser. The end result is envisioned to be similar to the Go Playground, but without the need of any backend. The beauty of this idea is the opportunity of experiencing very different technologies of the cloud-native landscape all in a single project: low-level system code close to the Linux kernel, the fast-growing WebAssembly world, and frontend development for a web application.


# New beginings 🚀

By contributing to the project prior to the GSoC period, I had the opportunity to understand the project's ecosystem, gain insights into its development processes, and establish myself as a valuable member of the community. It provided me with a deeper understanding of the project's goals and challenges, enabling me to better align my proposed solutions and goals for the GSoC period.

During this pre-GSoC contribution phase, Jason Dellaluce, my mentor, played a crucial role in guiding and supporting me. Jason provided valuable feedback on my early contributions, helped me navigate the project's codebase, and encouraged me to explore new areas for improvement. This continued collaborative relationship with Jason contributed to my growth as a contributor and helped set the stage for a successful GSoC journey.

As Week 1 of the official GSoC period began, my pre-GSoC contributions served as a foundation for diving deeper into the project. The knowledge and familiarity I had gained during this time allowed me to hit the ground running and make meaningful progress from the very beginning. It also reinforced the strong mentor-mentee relationship with Jason, as we had already established a rapport and had a shared understanding of the project's context.

Here is a summary of some of the pull requests (PRs) I have submitted up until today.

- [PR #1: Test For command falco -i (ignore default events)](https://github.com/falcosecurity/testing/pull/8)
    - Description: The [falcosecurity/testing](https://github.com/falcosecurity/testing) repository contains regression test suite for Falco and other tools in its ecosystem. I contributed by adding a new test case for falco's help output when used with -i flag. I contributed to two more of such falgs. 

- [PR #2: Semver check for RequiredAPIVersion values](https://github.com/falcosecurity/plugin-sdk-go/pull/73)
    - Description: This pr checks if user's RequiredAPIVersion follows semver system and checks if is compatible with internally-supported API version
    
-  [PR #3: Feat: Support for memfd_create syscall](https://github.com/falcosecurity/libs/pull/1127)   
    - Desciption: Every time when the kernel is updated and released, a new syscall or an updated version of syscall might be added to the release. This can create new ways to expose vulnerabilities by which malicious activity can remain undetected by Falco. Therefore we need to update Falco's internal syscall table to patch vulnerabilities. This PR adds support to `memfd_create` syscall

- [PR #4: Feat: Support for pidfd_getfd syscall](https://github.com/falcosecurity/libs/pull/1145)
    - Description: Same as above, his PR adds support to `pidfd_getfd` syscall

# Conclutions 

In conclusion, my early contributions to the project before the GSoC period commenced provided me with a head start, enabling me to make a more significant impact right from the start. The guidance and support from Jason, combined with my pre-GSoC involvement, allowed me to seamlessly transition into the official GSoC period and continue building upon my previous contributions.

Please stay tuned for updates and feel free to reach out to me via the CNCF Falco community channels. Your guidance, feedback, and support are invaluable.

Thank you all for your warm welcome, and here’s to an exciting and fruitful GSoC.
