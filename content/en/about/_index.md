---
title: What is Falco?
keywords: Falco, Runtime security, kubernetes security, k8s security, Threat detection,
  intrusion detection, Falcosidekick
aliases:
- about/falco
---

{{< blocks/content wrap="col" >}}
  ## Real-time threat detection solution for containers, hosts, Kubernetes and the cloud
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col" >}}
{{< card class="shadow" >}}
  ### How Falco's runtime security can help your organization

  Multi-level defense is essential for effective cybersecurity. Whether securing your software supply chain, controlling access, or protecting against cloud misconfigurations, the acceleration of cloud adoption has rapidly expanded the potential attack surface that companies need to address.

  The ultimate line of defense, however, is runtime security. Security is an ever-evolving war against attacks, and one of the most powerful ways to improve the security posture of your cloud-native environment is to detect threats as they occur. With the increasing number of cyber attacks and breaches, it’s crucial to have real-time visibility across your cloud, workloads, and user activity.

  To effectively detect threats, runtime security systems must be efficient and alert to suspicious behavior in real-time. Attackers have adapted their tactics to the cloud landscape and can initiate attacks within seconds of entering your environment. While legacy tools struggle to detect cloud-native threats, Falco can provide a sophisticated security monitoring layer to identify abnormal behaviors as they happen. This will give you an opportunity to take the right response action and minimize the impact of possible breaches, including sustained financial loss and reputational damage.
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
  Falco provides real-time detection capabilities for environments from individual containers, hosts, Kubernetes and the cloud. It is able to detect and alert on abnormal behavior and potential security threats in real-time, such as [crypto mining](https://falco.org/blog/falco-detect-cryptomining/), [file exfiltration](https://falco.org/blog/sysflow-falco-sidekick/), [privilege escalation](https://sysdig.com/blog/mitre-privilege-escalation-falco/) in applications, rootkit installs among many others. These malicious behaviors are detected via user-defined [Falco rules](https://falco.org/docs/rules/) that classify events of application activity as malicious or suspicious.

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
  Observing system calls is performance-critical, and there are two ways in which Falco achieves this: an {{< glossary_tooltip text="eBPF probe" term_id="ebpf-probe" >}} or a {{< glossary_tooltip text="kernel module" term_id="kernel-module-driver" >}}.

  {{< glossary_tooltip text="eBPF" term_id="ebpf" >}} is a revolutionary technology that enables us to run sandboxed programs inside an operating system. eBPF scripts are flexible, safe, and run extremely fast, making them perfect for capturing runtime security. This makes it ideal for instrumenting system calls for Falco.

  Before eBPF emerged, kernel modules were the norm for extending functionality in the Linux kernel. They run in privileged mode and are written in C, making them efficient and an excellent option for performance-critical work. Falco offers a kernel module for situations where eBPF isn't the best fit.

{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img img-aligned="left" src="/img/about/response_to_threats.svg" alt="react to threats" index="1 md-0 lg-0 xl-0" header="React to threats" >}}
  With Falco and [Falcosidekick](https://github.com/falcosecurity/falcosidekick), you can also forward suspicious events to serverless systems to trigger actions and remediate threats.

[Falcosidekick](https://github.com/falcosecurity/falcosidekick) is a companion application to Falco that forwards Falco events. It allows you to distribute events to more than 50 systems, such as email, chat, message queues, serverless functions, databases and more. It’s easy to configure and use both locally and inside Kubernetes.
{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}

<div class="grid-1 grid-lg-3 gap-4">
  <div class="use-cases-item">
    <a href="/docs/getting-started/" class="d-flex align-items-baseline text-decoration-none">
      <p class="w-100 text-body font-weight-normal">Get started with Falco, whether on a host, Kubernetes, or the cloud</p>
      <i class="fa fa-arrow-right"></i>
    </a>
  </div>
  <div class="use-cases-item">
    <a href="/about/use-cases/" class="d-flex align-items-baseline text-decoration-none">
      <h6 class="w-100 text-body font-weight-normal">Discover the most common use cases for Falco</h6>
      <i class="fa fa-arrow-right"></i>
    </a>
  </div>
  <div class="use-cases-item">
    <a href="/docs/" class="d-flex align-items-baseline text-decoration-none">
      <p class="w-100 text-body font-weight-normal">Check out Falco’s comprehensive documentation to dive deeper</p>
      <i class="fa fa-arrow-right"></i>
    </a>
  </div>
</div>


{{< /blocks/content >}}


{{< blocks/content content="html" wrap="col">}}
  <h3 class="mb-3">Falco FAQs</h3>

  {{< faq take=0 skip=2 >}}

  <div class="text-center mt-5">
    <a href="/about/faq/" class="text-center btn btn-primary btn-lg">Go to all FAQs</a>
  </div>
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
{{< feedback >}}
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
{{< footer_nav next="/about/why-falco" nextTitle="Why Falco?" >}}
{{< /blocks/content >}}
