---
title: GSoC Week 1 Reflections
date: 2023-06-27
author: Rohith Raju
slug: gsoc-2023-1st-week
tags: ["Gsoc","Mentorship"]
images:
  - /blog/gsoc2023/images/falco-gsoc-featured.jpg
---

Hello Folks!, my name is [Rohith](https://github.com/Rohith-Raju), and I am thrilled to share my experiences and reflections on the first week of the Google Summer of Code (GSoC) period. 

This is an exhilarating time for participants like myself as we embark on our coding journey and dive into the world of open-source development.

A huge thank you! to all the community members accepting me as one of them ❤️.

# My Project: Falco Playground

Falco is a security tool that comes with a rule language for its runtime security engine. However, there is currently no official
and user-friendly integrated development environment (IDE) for writing and testing Falco rules. To address this gap, we propose a 
project that aims to add WebAssembly as a supported compilation target for Falco.

By using the Emscripten toolchain, we plan to create a web-based single-page application that serves as a development 
environment for security rules. This means you can write and test Falco rules right inside your browser without the need for any
backend infrastructure. The end result will be similar to the Go Playground, where you can experiment with code in a seamless and
accessible manner.

The project offers an exciting opportunity to explore various technologies within the cloud-native landscape. It involves working
with low-level system code in close proximity to the Linux kernel, WebAssembly world, and engaging in frontend development for 
web application. By combining these different aspects, we aim to provide a convenient and comprehensive solution for developing Falco rules with ease.

# New beginnings 🚀

By contributing to the project prior to the GSoC period, I had the opportunity to understand the project's ecosystem, gain insights into its development processes, and establish myself as a valuable member of the community. It provided me with a deeper understanding of the project's goals and challenges, enabling me to better align my proposed solutions and goals for the GSoC period.

During this pre-GSoC contribution phase, [Jason Dellaluce](https://github.com/jasondellaluce), my mentor, played a crucial role in guiding and supporting me. Jason provided valuable feedback on my early contributions, helped me navigate the project's codebase, and encouraged me to explore new areas for improvement. My ongoing collaboration with Jason played a crucial role in my development as a contributor, paving the way for a fruitful journey through GSoC.

As Week 1 of the official GSoC period began, my pre-GSoC contributions served as a foundation for diving deeper into the project. The knowledge and familiarity I gained before allowed me to hit the ground running and make meaningful progress from the very beginning. It also reinforced the strong mentor-mentee relationship with Jason, as we had already established a rapport and had a shared understanding of the project's context.

Here is a summary of  pull requests (PRs) I have submitted: 

- [PR #1: Test For command falco -i (ignore default events)](https://github.com/falcosecurity/testing/pull/8)
    - Description: The [falcosecurity/testing](https://github.com/falcosecurity/testing) repository contains regression a test suite for Falco and other tools in its ecosystem. I contributed by adding a new test case for Falco's help output when used with thie `-i` flag. I contributed to two other flags. 

- [PR #2: Semver check for RequiredAPIVersion values](https://github.com/falcosecurity/plugin-sdk-go/pull/73)
    - Description: This pr checks if user's RequiredAPIVersion follows semver system and checks if is compatible with internally-supported API version
    
-  [PR #3: Feat: Support for memfd_create syscall](https://github.com/falcosecurity/libs/pull/1127)   
    - Desciption: Whenever the kernel is updated and released, a new syscall or updated version of syscall may be added. This can 
    create new vulnerabilities that can allow malicious activity from Falco to go undetected. Therefore, we need to update Falco's
    internal syscall table to address vulnerabilities. This PR adds support for the `memfd_create` syscall

- [PR #4: Feat: Support for pidfd_getfd syscall](https://github.com/falcosecurity/libs/pull/1145)
    - Description: Same as above, this PR adds support to the `pidfd_getfd` syscall

# Conclusions 

In conclusion, my early contributions to the project before the GSoC period commenced provided me with a head start, enabling me to make a more significant impact right from the start. The guidance and support from Jason, combined with my pre-GSoC involvement, allowed me to seamlessly transition into the official GSoC period and continue building upon my previous contributions.

Please stay tuned for updates and feel free to reach out to me via the CNCF Falco community channels. Your guidance, feedback, and support are invaluable.

Thank you all for your warm welcome, and here’s to an exciting and fruitful GSoC.
