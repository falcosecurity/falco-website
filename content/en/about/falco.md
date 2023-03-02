---
title: What is Falco
---

{{< blocks/content wrap="col" >}}
  ## Threat detection and response for containers, hosts, Kubernetes and the cloud
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col" >}}
{{< card class="shadow" >}}
  ### How Falco's runtime security protects your organization

  Multi-level defense is essential for effective cybersecurity. Whether it's securing your software supply chain, controlling access, or protecting against cloud misconfigurations, the acceleration of cloud adoption has rapidly expanded the potential attack surface companies need to protect.

  The ultimate line of defense, however, is runtime security. Security is an ever evolving war against attacks, and one of the most powerful ways to protect your cloud-native environment is to detect threats as they occur. With the increasing number of cyber attacks and breaches, it’s crucial to have real-time visibility across your cloud, workloads, and user activity. 

  ![What is runtime security and why it matters](/img/about/runtime_security.svg#img-fit)

  To effectively detect and respond to threats, runtime security solutions must be efficient and alert on suspicious behavior in real time. Attackers have adapted their tactics to the landscape of the cloud and can initiate attacks within seconds of entering your environment. While legacy solutions struggle to detect cloud-native threats, Falco can provide a layer of protection to identify and respond to these incidents as they happen. This will minimize the impact of breaches and protect your organization against financial loss and reputational damage.
{{< /card >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img src="/img/about/what_is_falco.svg" alt="what is falco" index="1 md-1 lg-1 xl-1" header="What is Falco" >}}
  At the highest level, you can think of Falco like a network of security cameras for your infrastructure. You deploy Falco across a distributed infrastructure. Falco collects data (from the local machine or by talking to some API), runs a set of rules against it, and notifies you if something bad happens.

  Falco makes it easy to consume Linux kernel syscalls, and enrich those events with information from Kubernetes and the rest of the cloud native stack. Falco has a rich set of out of the box security rules specifically built for Kubernetes, Linux and the cloud.

  Originally developed as open source by Sysdig, Falco was contributed to the Cloud Native Computing Foundation (CNCF) in 2018 and moved to the incubating level in 2020. Since its inception, Falco has been downloaded more than 50 million times, with more than 480% growth in the last two years.
{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img img-aligned="left" src="/img/about/how_it_works.svg" alt="how it works" index="1 md-0 lg-0 xl-0" header="How it works" >}}
  Falco provides real-time detection and response capabilities for environments from individual containers, hosts, Kubernetes and the cloud. It is able to detect malicious runtime behavior, such as [crypto mining](https://falco.org/blog/falco-detect-cryptomining/), [file exfiltration](https://falco.org/blog/sysflow-falco-sidekick/), [privilege escalation](https://sysdig.com/blog/mitre-privilege-escalation-falco/) in applications, rootkit installs among many others. These malicious behaviors are detected via user-defined [Falco rules](https://falco.org/docs/rules/) that classify events of application activity as malicious or suspicious.

  More specifically, Falco collects event data from a _source_ and compares each event against a set of _rules_. Some examples of sources for Falco events are:
  - Linux kernel syscalls
  - Kubernetes audit logs
  - Cloud events (e.g. AWS CloudTrail)
  - Events from other systems (GitHub, Okta)
  - New data sources can be added to Falco by developing [plugins](https://github.com/falcosecurity/plugins)
  
  Rules help the Falco engine identify security issues. Falco comes pre-loaded with a comprehensive set of rules that cover container, host, Kubernetes and cloud security, and you can easily create [your own rules](https://falco.org/docs/rules/appending/) to customize it. Newly introduced [falcoctl](https://falco.org/blog/falcoctl-install-manage-rules-plugins/) allows you to have always-up-to-date security rules out of the box for Falco.

  System calls are one of the most important data sources for Falco. If an application has been compromised, Falco is able to detect malicious or suspicious behavior based on the system calls that it performs.
{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img img-aligned="right" src="/img/about/instrumenting_system_calls.svg" alt="Instrumenting system calls" index="1 md-1 lg-1 xl-1" header="Instrumenting system calls" >}}
  Capturing system calls is performance-critical, and there are two ways in which Falco achieves this: an eBPF probe or a Kernel Module.

  eBPF is a revolutionary technology that allows us to run sandboxed programs inside an operating system. eBPF scripts are flexible and safe, and run extremely fast, making them perfect for capturing runtime security. This makes it ideal for instrumenting system calls for Falco.

  Before the emergence of eBPF, kernel modules were the norm for extending functionality in the Linux kernel. They run in privileged mode, and are written in C, making them very efficient and therefore a great option for performance-critical work. Falco offers a kernel module for situations where eBPF isn't the best fit.

  [Falcosidekick](https://github.com/falcosecurity/falcosidekick) is a companion application to Falco  forwards Falco events . It allows you to distribute events to more than 50 systems, such as email, chat, message queues, serverless functions, databases and more. It’s easy to configure and use both locally and inside Kubernetes.
{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img img-aligned="left" src="/img/about/response_to_threats.svg" alt="response to threats" index="1 md-0 lg-0 xl-0" header="Response to threats" >}}
  With Falco and [Falcosidekick](https://github.com/falcosecurity/falcosidekick), you can forward suspicious events to serverless systems to trigger actions and remediate threats. It creates a full response engine to protect your environments.
{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
<div class=" grid-1 grid-lg-3 gap-4">
  {{< card class="shadow">}}
  <div class="d-flex flex-column h-100 align-items-start">
    <h5 class="font-weight-normal flex-grow-1">If you are convinced, and want to learn more check our documentation</h5>
    <a href="/docs/" class="btn btn-primary mt-4">Learn more</a>
  </div>
  {{< /card >}}

  {{< card class="shadow">}}
  <div class="d-flex flex-column h-100 align-items-start">
    <h5 class="font-weight-normal flex-grow-1">Here is how to get started with Falco</h5>
    <a href="/docs/getting-started/" class="btn btn-primary mt-4">Learn more</a>
  </div>
  {{< /card >}}

  {{< card class="shadow">}}
  <div class="d-flex flex-column h-100 align-items-start">
    <h5 class="font-weight-normal flex-grow-1">The most common use cases for Falco</h5>
    <a href="/about/use-cases/" class="btn btn-primary mt-4">Learn more</a>
  </div>
  {{< /card >}}
</div>
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
  <h3 class="mb-3">Falco FAQs</h3>
  <div class="grid-1 gap-3">

  {{< card_faq title="What is runtime security and why is Falco a solution?" index=1 >}}

  Runtime security helps protect workloads against a variety of threats, such as:

  - Privilege escalation attacks through exploiting security bugs.
  - The deployment of unauthorized workloads by an attacker.
  - Unauthorized access to secrets or other sensitive information.
  - The activation of malware that is hidden inside an application.

  Falco is designed to detect these and other threats while your services and applications are running. When it detects unwanted behavior, Falco alerts you instantly so you’re informed (and can react!) right away, not after minutes or hours have passed.


  {{< /card_faq >}}

  {{< card_faq title="How do I explain to someone what Falco does in a nutshell?" index=2 >}}

  You can think of Falco like a set of smart security cameras for your infrastructure: you place the sensors in key locations, they observe what’s going on, and they ping you if they detect harmful behavior. 

  With Falco, a set of rules define what bad behavior is. You can customize or extend these rules for your needs. The alerts generated by the set of Falco sensors can stay in the local machine, but it is a good practice to export them  to a centralized collector.


  {{< /card_faq >}}

  {{< card_faq title="Can I run Falco in VMs?" index=3 >}}

  Yes, Falco can run in almost every Linux kernel, whether it is a bare-metal server or a VM or microVM.

  Please check the documentation to learn about kernel versions and more specific deployment restrictions. A list of available drivers can be found [here](https://download.falco.org/driver/site/index.html).


  {{< /card_faq >}}

  {{< card_faq title="Does Falco need to run in every container or pod in Kubernetes?" index=4 >}}

  No, Falco is deployed once per Linux OS (host OS or guest OS when a hypervisor is involved) - typically as privileged DaemonSet for a deployment in Kubernetes. Falco instruments the Linux kernel (either via a kernel module or eBPF probe) and can therefore monitor everything (e.g. system calls) within each container, because every container scheduled on the same node shares the same kernel.

  In addition, Falco can hook into the container runtime and that way associate each kernel event with the exact container (e.g. container id, name, image repository, tags) as well as Kubernetes attributes such as namespace or pod name etc.

  Lastly, Falco supports gVisor in GCP. However, please note that when for example microVMs are used in Kubernetes Falco would need to be installed in each microVM / VM guest OS.

  Please check the documentation to learn about limitations in kernel instrumentation options for some platforms such as GCP or AWS Fargate.


  {{< /card_faq >}}

  {{< card_faq title="Why do I need a driver to use Falco?" index=5 >}}

  System calls are Falco’s default data source. To instrument the Linux kernel and collect these system calls, it needs a driver: either a Linux kernel module or an eBPF probe.

  {{< /card_faq >}}

  </div>

  <div class="text-center mt-5">
    <a href="/about/faq/" class="text-center btn btn-primary btn-lg">Go to all FAQs</a>
  </div>
{{< /blocks/content >}}

<!-- TODO: uncomment this section when the redesign is ready -->
<!-- {{< blocks/content content="html" wrap="col">}}
{{< feedback >}}
{{< /blocks/content >}} -->

{{< blocks/content content="html" wrap="col">}}
{{< footer_nav next="/about/why-falco" nextTitle="Why Falco?" >}}
{{< /blocks/content >}}
