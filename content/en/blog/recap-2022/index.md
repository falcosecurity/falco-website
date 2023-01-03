---
title: "Falco: Project Recap 2022"
slug: recap-2022
date: 2022-12-20
author: Jacqueline Salinas
images:
  - /blog/recap-2022/images/recap-2022-featured.png
---

![](images/recap-2022-featured.png)

Dear Falco community, 

As we write this, it’s unbelievable that 2022 is wrapping up and very soon! As always, we are truly grateful for the amazing community of maintainers and contributors. The Falco project and community would not be the vibrant ecosystem it is today without these incredible individuals. Let’s take a look at what the community accomplished in 2022, and we’ll give a quick glimpse of what to expect in 2023!  

### Thank you to the Falco maintainers
Falco would not be the same without these key individuals. They work hard to keep the project moving forward and the community engaged. On behalf of the Falco community, we want to extend a BIG thank you for all your dedication and hard work! 

- [Andrea Terzolo](https://github.com/andreagit97), Polytechnic of Turin
- [Carlos Tadeu Panato Junior](https://github.com/cpanato), Chainguard
- [David Windsor](https://github.com/dwindsor), Secureworks
- [Federico Di Pierro](https://github.com/fededp), Sysdig
- [Frank Jogeleit](https://github.com/fjogeleit), LOVOO
- [Fred Araujo](https://github.com/araujof), IBM
- [Grzegorz Nosek](https://github.com/gnosek), Sysdig
- [Hendrik Brueckner](https://github.com/hbrueckner), IBM
- [Jason Dellaluce](https://github.com/jasondellaluce), Sysdig
- [Jonah Jones](https://github.com/jonahjon), Amazon
- [Leonardo Di Donato](https://github.com/leodido), Independent
- [Leonardo Grasso](https://github.com/leogr), Sysdig
- [Logan Bond](https://github.com/exoner4ted), Secureworks
- [Loris Degioanni](https://github.com/ldegio), Sysdig
- [Luca Guerra](https://github.com/lucaguerra), Sysdig
- [Mark Stemm](https://github.com/mstemm), Sysdig
- [Massimiliano Giovagnoli](https://github.com/maxgio92), Clastix
- [Mauro Ezequiel Moltrasio](https://github.com/molter73), RedHat
- [Michele Zuccala](https://github.com/zuc), Sysdig
- [Radu Andries](https://github.com/admiral0), Independent
- [Teryl Taylor](https://github.com/terylt), IBM
- [Thomas Labarussias](https://github.com/issif), Sysdig

### New and noteworthy in Falco land 
The Falco community was busy in 2022, figuring out how to better serve contributors, developing new features, fixing bugs, and taking the project to new heights. Here is a recap of key milestones reached this year: 

- Falco’s governance underwent a facelift this year. Why is this important? As a CNCF project, Falco is committed to promoting a healthy community of contributors and maintainers from multiple vendors. In aid of this, the core maintainers formerly announced & published these updates to help contributors better serve the community. To read the full announcement, see [updating Falco Governance](https://falco.org/blog/updating-falco-governance/).

- Feeling terrorized by sneaky cryptominer programs? Falco is helping fight these monsters. Cryptominers are programs that utilize computer resources to mine cryptocurrency. XMRig is an example of an open source crypto mining software designed for the sole purpose of mining cryptocurrencies, like Monero or Bitcoin. Cryptominers usually get rewarded with a token for every successful transaction mined, which makes cryptomining a profitable activity.

- Whether an external entity, or an insider, cybercriminals are most commonly abusing services such as Kubernetes and GitHub actions by infecting hosts and containers with cryptojackers and using the business resources to mine cryptocurrency on the attacker's behalf. [Learn how Falco detects cryptominers activity in your cluster](https://falco.org/blog/falco-detect-cryptomining/). 

- The new eBPF probe landed among us 👽 this fall with new shiny features. The eBPF world grows continuously and every new kernel release introduces some unbelievable novelties! To take advantage of these the community created a completely new architecture, new BPF programs and maps. The main goal was to improve performance, maintainability, and user experience, shipping a unique, powerful, self-contained Falco executable. Discover the modern world of eBPF with Falco, read the [full blog here](https://falco.org/blog/falco-modern-bpf/). 

- At re:Invent 2022, it was a pleasure to announce that Falcosidekick would be available with preview integration for Amazon Security Lake, a new service that optimizes and centralizes security data from cloud, on-premises, and custom sources into a purpose-built data lake. Falcosidekick forwards Falco events into other services: the new integration exports security events using the Open Cybersecurity Schema Framework (OCSF) format, an open industry standard, and sends them directly to Amazon Security Lake. This makes it easier to normalize and combine Falco events with other security data sources. You can check out the integration in the next version of Falcosidekick, 2.27.0. Read the full announcement, [Support for Amazon Security Lake](https://falco.org/blog/falco-on-aws/).

- As the home of such important assets, GitHub repositories should be at the top of your list of security priorities. However, many people fail to put in place even basic measures to protect source code repositories. [Read about](https://falco.org/blog/falco-plugin-github/) three risks to GitHub repos and how you can reliably detect them, as they happen, using Falco open source security. 

- Before 0.32.1, Falco could not work with gVisor monitored sandboxes because it was not possible to install a kernel module or eBPF probe in such an environment. But wouldn't it be great to leverage the stream of system call information that gVisor collects through its powerful monitoring system directly in Falco? This is exactly what became possible with gVisor release 20220704.0 and Falco 0.32.1. [Learn how to integrate gVisor and Falco on Docker](https://falco.org/blog/intro-gvisor-falco/). 

- With Falco 0.32.1, you can now run Falco on Apple ARM M1 CPUs. It requires a Linux virtual machine (VM) since Falco doesn't run on OSX, but it is pretty straightforward. Here are the step by step [instructions.](https://falco.org/blog/falco-apple-silicon/) 

- Different technologies are used on a daily basis, and tools like Vagrant, Terraform, Ansible, plus many more allow us to create and destroy digital resources in a matter of minutes, if not seconds. However, if you keep changing your running environment, you might need to calibrate your workloads to these new changes. This is especially true when you deploy operating system-dependent applications. In other words, every time you deploy an application like Falco there's a chance that you need to compile a new module or eBPF probe to get along with the current underlying kernel. This is the first of a series of posts introducing some interesting techniques using Falco to generate the much needed driver and how you can make it available for your deployments. [Learn how to build your own Falco Drivers for Debian.](https://falco.org/blog/falco-driverkit-debian-docker/) 

- Giant Swarm simplifies the maintenance of the software stack within Kubernetes clusters by using its App Platform technology. Leverage this to easily deploy Falco, either individually or as part of Giant Swarm's Security Pack, to secure a managed Kubernetes service. [Learn how to deploy and manage applications across hybrid environments.](https://falco.org/blog/giantswarm-app-platform-falco/)


- A plugin also replaced the way Falco consumes the Audit Logs generated by a K8s API server. With these plugins, Falco covers more in depth the aspects of your infrastructure and allows you to use a single syntax for rules. Our adopters asked us for a way to monitor K8s Audit Logs and the previous implementation used an internal web server to receive the logs from the Kubernetes API. This method didn't support clusters managed by cloud providers, such as EKS, AKS, or GKE as they had to capture the Audit Logs for their own usage and then add them to their log aggregators. This situation is now solved thanks to the plugin framework and we're proud to have announced the first release of the plugin for EKS Audit Logs!!! Read the full blog [here! ](https://falco.org/blog/k8saudit-eks-plugin/) 

### Core releases 
The Falco [release process has been well-defined](https://github.com/falcosecurity/falco/blob/master/RELEASE.md) with a fixed schedule of three releases per year (roughly at the end of Jan, May, and Sept), plus patch releases that can occur when needed upon agreement by maintainers (for example, for hotfixes or security patches). Here are the three major releases for 2022: 

- [Falco 0.31.0 a.k.a. "the Gyrfalcon"](https://falco.org/blog/falco-0-31-0/) released in January 2022.  Why did we call it the Gyrfalcons release? Well, the Gyrfalcons are the largest of the falcon species, just like this version of Falco, which had the biggest changelog ever released.The falco and libs repositories counted 30+ individual contributors, 130+ pull requests, and 360+ commits 🤯. 

- [Falco 0.32.0](https://falco.org/blog/falco-0-32-0/) release in June 2022. This new release came with a ton of inner rework. Here is the foremost important change: Lua is no more a dependency of Falco! Basically, the Falco rule loader was rewritten in C++, to achieve better performance. Moreover, the entire rule engine has been rewritten too. This reduced the workarounds in Falco, and is now fully using libsinsp-provided filter parsers and compiler. Moreover, a new --list-syscall-events CLI option is now available. 

- [Falco 0.33.0 a.k.a. "the pumpkin release 🎃"](https://falco.org/blog/falco-0-33-0/)  made available October 2022.  For v0.33.0 the community focused on addressing the following updates & changes:
  - Libs now allow individual selection of which syscalls to collect during live captures, which helps Falco improve performance and reduce dropped events
  - Introduced the Kernel Crawler, a new tool that automatically identifies the most up to date kernel versions supported by popular distros
  - Syscall kernel ring-buffer size is now customizable for your environment needs
  - Mitigations for libsinsp’s Kubernetes metadata client to address recent issues that caused Falco to crash
  - Support for multiple simultaneous event sources, which means that you can now run multiple event sources in the same Falco instance
  - Added minikube as a supported platform in the driver loader and included it in our driver build matrix
  - Rule alert rate limiter is now optional and disabled at default
  - Support for two new syscalls and many improvements to the default Falco security ruleset

### Falcosidekick & UI
[Falcosidekick](https://github.com/falcosecurity/falcosidekick) is a little daemon that extends a number of possible outputs, and since its creation this little guy has evolved in many amazing ways. A big thank you to Thomas Labarussias for driving the development of Falcosidekick and the UI. Here is how the project evolved in 2022: 

- Falcosidekick saw a major update in June of 2022, delivering four new outputs and enhancing existing ones too! Not only did we see updates in outputs, but the community delivered the first version of the Falcosidekick UI. The UI offered these new features: Redis DB for long term storage of events, API for counting and searching for events, and lastly filters to keep and share query strings. For a full detailed account of this update, see the blog [Falcosidekick 2.25.0 and Falcosidekick 2.0.0.](https://falco.org/blog/falcosidekick-2-25-0-falco-2-0-0/).


### Plugins 
Falco v0.31.0 resulted in many exciting new features. One that is particularly strategic for the project is the general availability of the plugins framework. Why are plugins exciting and what do they mean for the future of Falco? 

Plugins are shared libraries that can be loaded by Falco to extend its functionality. Plugins can currently implement two capabilities:

- The event sourcing capability, which add new data sources to Falco. They produce input events, from either the local machine or a remote source, that Falco can understand.
- The field extraction capability, which parse the data coming from source plugins and expose new fields that can be used in Falco rules.

By supporting one or both capabilities, plugins allows users to feed data into Falco, parse it in useful ways and create rules and policies from it, read the full announcement [here!](https://falco.org/blog/falco-announcing-plugins/) 

Official plugins launched in 2022 include: 
- AWS CloudTrail
- GitHub
- K8saudit
- K8saudit-EKS
- Okta

### Falco project growth
The Falco project excitedly announced that on Nov 4, 2022, project maintainers submitted the proposal to be considered for graduation. This milestone is important because it demonstrates the health and maturity of the project to the Kubernetes & cloud ecosystem.

Falco joined the CNCF as a Sandbox project in the fall of 2018 and evolved into Incubating status two years later. The community believes the next natural step is for Falco to apply for graduation. The project has reached maturity in community health, diversity of contributions & contributors, and ecosystem adoption.

- Project highlights for 2022
- Github stars: + 26%
- Core repo contributors: +65%
- Forks: +46%
- Slack channel members: +126%
- Downloads:
  - 41.7M Docker hub pulls (25% growth)
  - 1.2M AWS ECR

### New features in Falco
The most significant additions since acceptance for Incubation include:

- Stable release schedule
- Contribution of the whole libs source code into the Falcosecurity organization
- Plugin framework, allowing event sources other than syscalls
- New eBPF probe
- gVisor integration

Thank you to all of the contributors and maintainers of the Falco project. The project would not be where it is today without the help and dedication of these key individuals. 

See you in 2023, 

Jacque
