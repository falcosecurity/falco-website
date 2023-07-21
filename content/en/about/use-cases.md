---
title: Falco use cases
keywords: Host security, container security, Kubernetes security, k8s security, cloud security, runtime security, detection, intrusion detection, Detect, Respond
---

{{< blocks/content wrap="col-9" >}}
<h2>What you can do with Falco today</h2>

Falco can help organizations comply with industry regulations and align with well-known security frameworks. For example, Falco can detect adversarial tactics, techniques, and procedures (TTPs) aligned with the [MITRE ATT&CK framework](https://falco.org/blog/tidal-registry-release/), ensuring proactive identification of threats, intrusions, and data theft in real time. It works well with legacy infrastructures, and excels at supporting containers, Kubernetes, and the cloud. Falco monitors both workloads (processes, containers, services) and infrastructure (hosts, VMs, network, cloud infrastructure and services). 

It is lightweight, efficient, and scalable, making it ideal to use in both development and production. Furthermore, Falco assists engineering teams in maintaining regulatory compliance by actively detecting misconfigurations associated with frameworks such as [PCI DSS](https://falco.org/blog/falco-pci-controls/) and [NIST](https://falco.org/blog/falco-nist-controls/). Falco can detect many classes of threats and misconfigurations in running workloads out of the box, but should you need more, you can add custom detections. Falco is driven by a thriving open source community, bringing support and constant enhancement.

![Falco today](/img/about/falco_today.svg#img-fit)
{{< /blocks/content >}}

{{< blocks/content wrap="col-9" >}}
<h3 id="threat-detection">Align threat detections with the MITRE ATT&CK Framework</h3>

The landscape of containers, Kubernetes and Cloud is evolving fast, and so are potential attacks. To help InfoSec teams use Falco in their incident response workflows, we have aligned Falco's threat detection capabilities with the well-known MITRE ATT&CK framework. 

Falco's rule alignment with the MITRE ATT&CK matrix enables detection of Tactics, Techniques, and Procedures (TTPs) employed by adversaries, aiding rapid identification and response to potential security incidents. Falco can help organizations proactively defend their systems, maintain compliance, and strengthen overall security posture.
{{< /blocks/content >}}

{{< blocks/content wrap="col-9" >}}
<h3 id="compliance">Maintain regulatory compliance</h3>

Falco offers real-time runtime detection powered by eBPF, making it a good solution for organizations seeking to maintain regulatory compliance with frameworks such as PCI DSS, NIST, and others in cloud-native systems. Unlike traditional security tools that struggle with the ephemeral nature of these environments, Falco is purpose-built for cloud-native architectures and integrates with container orchestrators like Kubernetes. 

Falco adapts to the dynamic nature of containers, ensuring continuous compliance. With a comprehensive library of predefined rules based on security best practices and compliance standards like PCI DSS and NIST, Falco covers a wide range of security events, including unauthorized access attempts, privilege escalation, data exfiltration attempts, and more. By leveraging Falco's robust capabilities, organizations can observe their cloud-native systems while meeting the stringent requirements of regulatory frameworks.

{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col-9">}}
  <h3 class="mb-3">Falco FAQs</h3>

  {{< faq take=6 skip=8 >}}

  <div class="text-center mt-5">
    <a href="/about/faq/" class="text-center btn btn-primary btn-lg">Go to all FAQs</a>
  </div>
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col-9">}}
{{< feedback >}}
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col-9">}}
{{< footer_nav 
  prev="/about/why-falco"
  prevTitle="Why Falco?"
  next="/about/ecosystem" 
  nextTitle="Falco Ecosystem" 
>}}
{{< /blocks/content >}}
