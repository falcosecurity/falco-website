---
title: PCI/DSS Controls with Falco
linktitle: Understanding PCI/DSS Controls with Falco
description: Learn how Falco detects failed/misconfigured PCI/DSS Controls
date: 2023-07-06
author: Nigel Douglas
slug: falco-pci-controls
images:
  - /blog/falco-pci-controls/images/falco-pci-controls-featured.png
---

As organizations increasingly adopt cloud-native systems for sensitive data and operations, ensuring compliance with industry standards like the Payment Card Industry Data Security Standard ([PCI DSS](https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Standard/PCI-DSS-v4_0.pdf)) becomes imperative. This standard is specific to those organizations that deal with cardholder data, such as payment processors, financial services providers, and ecommerce companies. Some organizations also use it as a type of high bar to elevate their security posture. Lawrence E Hecht of TheNewStack aptly discusses the distinctive monitoring and compliance enforcement challenges brought about by cloud-native environments in [this article](https://thenewstack.io/cloud-native-security-hasnt-solved-compliance-challenges/).

In this blog post, we will explore why Falco is a crucial component in detecting and enforcing PCI DSS compliance in cloud-native systems. We will delve into the key features and capabilities of Falco that make it an invaluable tool for monitoring, alerting, and maintaining the security and integrity of payment card data in the ever-evolving landscape of cloud-native technologies.


## Listing the Requirements

Here is a list of the 12 main requirements, also known as control objectives, of PCI/DSS.
In this article we will discuss how Falco can be used to address 3 unique sub-controls objectives.

1. Install and maintain a firewall configuration to protect cardholder data
2. Do not use vendor-supplied defaults for system passwords and other security parameters
3. Protect stored cardholder data
4. Encrypt transmission of cardholder data across open, public networks.
5. Use and regularly update anti-virus software or programs
6. [<b>Develop and maintain secure systems and applications</b>](#pci-control-6)
7. Restrict access to cardholder data by business need-to-know
8. Assign a unique ID to each person with computer access
9. Restrict physical access to cardholder data
10. [<b>Track and monitor all access to network resources and cardholder data</b>](#pci-control-10)
11. [<b>Regularly test security systems and processes</b>](#pci-control-11)
12. Maintain a policy that addresses information security for all personnel

## PCI Control #6

**Develop and maintain secure systems & applications**

PCI control #6 emphasizes the importance of implementing robust security measures throughout the development and maintenance life cycle of systems and applications. This control aims to safeguard sensitive data by ensuring that secure coding practices, vulnerability management, and access controls are in place. Falco, with its runtime security and behavioral monitoring capabilities, can significantly contribute to meeting this control.

By continuously monitoring containerized environments, Falco can detect security events, which helps engineering teams enforce secure configurations, identify potential vulnerabilities, and provide real-time insights into system and application behavior. Its ability to generate real-time alerts, trigger automated responses, and integrate with other security tools empowers organizations to develop and maintain secure systems and applications that align with PCI requirements.

### PCI Sub-Control #6.4.2

**Separation of duties between development/test environments**

The Falco rule "[Network Connection Outside Local Subnet](https://github.com/falcosecurity/rules/blob/c558fc7d2d02cc2c2edc968fe5770d544f1a9d55/rules/falco_rules.yaml#L2962)," is an excellent example of how Falco can be utilized to detect the separation of duties between development/test environments for containerized workloads, specifically in the context of PCI control 6.4.2.

The [PCI control 6.4.2](https://security.stackexchange.com/questions/12962/pci-dss-requirement-6-4-2-separation-of-duties-between-development-test-environm) focuses on ensuring that development/test environments are segregated from production environments in order to minimize the risk of unauthorized access or data leakage. By monitoring network connections within containerized environments, Falco can play a crucial role in enforcing this control.

The local subnet network connection rule is designed to alert whenever a container attempts to establish unwarranted network connections. This indicates that a container in the development/test environment is trying to communicate with resources outside its designated network boundaries. Such communication might be a sign of misconfiguration, unauthorized access attempts, or a potential data exfiltration attempt.

When Falco detects a network connection outside the local subnet, it generates an alert or takes a defined action, such as logging the event, sending notifications to security personnel, or triggering automated responses. This allows security teams to identify and investigate any suspicious activities that violate the separation of duties between development/test and production environments.

```
- rule: Network Connection outside Local Subnet
  desc: Detect traffic to image outside local subnet.
  condition: >
    inbound_outbound and
    container and
    not network_local_subnet and
    k8s.ns.name in (namespace_scope_network_only_subnet)
  enabled: false
  output: >
    Network connection outside local subnet
    (command=%proc.cmdline pid=%proc.pid connection=%fd.name user=%user.name user_loginuid=%user.loginuid container_id=%container.id
     image=%container.image.repository namespace=%k8s.ns.name
     fd.rip.name=%fd.rip.name fd.lip.name=%fd.lip.name fd.cip.name=%fd.cip.name fd.sip.name=%fd.sip.name)
  priority: WARNING
  tags: [container, network, mitre_discovery, PCI_DSS_6.4.2]
```

By implementing this Falco rule, organizations can ensure that containers in development/test environments adhere to the principle of isolation and prevent potential security breaches or data leaks. It provides an additional layer of security by actively monitoring and alerting on any network connections that violate the defined boundaries, thus aligning with PCI control 6.4.2 requirements.

Overall, leveraging Falco's rule-based approach and real-time monitoring capabilities, organizations can effectively detect and respond to any attempts to breach the separation of duties between development/test and production environments, helping to maintain a secure containerized ecosystem in accordance with PCI standards.


## PCI Control #10

**Track and monitor all access to network resources & cardholder data**

PCI DSS Requirement #10 emphasizes the need for organizations to implement comprehensive logging and monitoring capabilities to track and monitor access to network resources and cardholder data. Thankfully, Falco can track and monitor network traffic, container activities, and access to sensitive data within cloud-native environments. Falco generates alerts and logs based on predefined rules and policies, providing visibility into potentially suspicious or unauthorized activities.

### PCI Sub-Control #10.2.5

**Usage and modification of identification & authentication mechanisms**

The specific [PCI sub-control 10.2.5](https://www.pcidssguide.com/pci-dss-requirement-10/#:~:text=PCI%20DSS%20Requirement%2010.2.5%3A%20Use%20and%20modification%20of%20identification%20and%20authentication%20mechanisms%20and%20all%20changes%2C%20additions%20or%20deletions%20in%20accounts%20with%20root%20or%20administrator%20privileges) focuses on ensuring that organizations implement secure and controlled mechanisms for user identification and authentication. Falco's capability to detect the launch of privileged containers can greatly assist in meeting this control requirement.

When Falco detects the [launch of privileged containers](https://github.com/falcosecurity/rules/blob/c558fc7d2d02cc2c2edc968fe5770d544f1a9d55/rules/falco_rules.yaml#L1938), it signifies that containers with elevated privileges or escalated access rights are being created within the environment. This can be an indication of potential security risks, as privileged containers may bypass normal security controls or introduce vulnerabilities if misused or compromised.

By actively monitoring container orchestration platforms, such as Kubernetes, Falco can generate alerts when privileged containers are spawned. Security teams can then investigate the event, ensuring that proper authentication and access controls are in place for such containers. This includes verifying that appropriate authorization mechanisms, such as strong user authentication and secure access controls, are applied to privileged containers:

```
- rule: Launch Privileged Container
  desc: Detect the initial process started in a privileged container.
        Exceptions are made for known trusted images.
  condition: >
    container_started and container
    and container.privileged=true
    and not falco_privileged_containers
    and not user_privileged_containers
    and not redhat_image
  output: Privileged container started (user=%user.name user_loginuid=%user.loginuid command=%proc.cmdline)
  priority: INFO
  tags: [container, privilege_escalation, lateral_movement, T1610, PCI_DSS_10.2.5]
```

Falco provides the capability to identify the creation of previously unrecognized privileged containers that are not included in its known list (defined by the [user_privileged_containers](https://github.com/falcosecurity/rules/blob/c558fc7d2d02cc2c2edc968fe5770d544f1a9d55/rules/falco_rules.yaml#L1904) macro). This ensures that if a new privileged container is spawned, the security team is alerted and given the opportunity to thoroughly review the activity and initiate appropriate actions, if needed.

By detecting these unknown privileged containers, Falco enhances the overall security posture by enabling proactive monitoring to address the sub-control 10.2.5. This helps to maintain the integrity and security of access controls, which is needed to safeguard sensitive cardholder data.


## PCI Control #11

**Regularly test security systems & processes**

PCI control 11 highlights the importance of conducting regular assessments and evaluations to ensure the effectiveness of security systems and processes. By conducting regular security testing, including penetration testing and code reviews, organizations can identify potential security gaps, validate the effectiveness of security controls, and strengthen their overall security posture. PCI control 11 ensures that security measures remain robust, evolving alongside emerging threats and vulnerabilities.


### PCI Sub-Control #11.5.1

**Implement a Process to Respond to Any Alerts Generated by a Change-Detection Solution**

The below Container Drift rule can be used to address [PCI control 11.5.1](https://kirkpatrickprice.com/video/pci-requirement-11-5-1-implement-a-process-to-respond-to-any-alerts-generated-by-the-change-detection-solution/), which emphasizes the implementation of a process to respond to alerts generated by changes.

When the "[Drop and execute new binary in container](https://github.com/falcosecurity/rules/blob/de5a29552b3e735c6e0b4f49f2e9c250be156bf5/rules/falco_rules.yaml#L3402C9-L3418C47)" rule is triggered, it indicates that there has been a modification to the executable content currently running in a container. This kind of change should not happen in containers that are designed with the [Principle of Immutability](https://cloud.google.com/architecture/best-practices-for-operating-containers#immutability) in mind and may be a strong indication of unauthorized or unexpected actions within the container environment. It is crucial to respond to such alerts promptly to ensure the integrity and security of the system.

```
- rule: Drop and execute new binary in container
  desc:
    Detects if an executable not belonging to the base image of a container is being executed.
    The drop and execute pattern can be observed after an attacker gained an initial foothold.
    is_exe_upper_layer filter field only applies for runtimes using overlayfs as union mount fs.
  condition: >
    spawned_process
    and container
    and proc.is_exe_upper_layer=true
    and not container.image.repository in (known_drop_and_execute_containers)
  output: >
    Executing binary not part of base image (user=%user.name user_loginuid=%user.loginuid
    proc.exepath=%proc.exepath proc.cwd=%proc.cwd proc.vpgid=%proc.vpgid evt.res=%evt.res)
  priority: CRITICAL
  tags: [container, mitre_persistence, TA0003, PCI_DSS_11.5.1]
```

Falco's real-time alerting capability enables organizations to receive immediate notifications when cases of drift occur, allowing DevOps & DevSecOps engineers to seamlessly integrate these alerts into a robust incident response process. In the context of PCI control 11.5.1, organizations can establish a predefined response procedure for handling such alerts.

The rule itself is triggered when a new binary is dropped and executed within a container. The remediation process might involve investigating the source of the file permission change, assessing the impact on the container and the surrounding environment, and taking appropriate mitigation measures.

By leveraging the insights provided by Falco's container drift rules, users can implement a proactive incident response process that aligns with PCI control 11.5.1. Responding to alerts promptly helps to address any unauthorized changes and ensures that security systems and processes remain intact, protecting cardholder data and maintaining compliance with PCI requirements.


## Conclusion

PCI DSS sets forth many security requirements with prescriptive validations and guidance. It serves as a comprehensive standard for organizations that must safeguard cardholder data and ensure secure payment card transactions. Meeting each requirement and sub-requirement is crucial for achieving PCI DSS compliance, avoiding financial penalties from the PCI Security Standards Council, mitigating the risk of data breaches and fraud.

While Falco does not provide inherent data protection mechanisms, it plays a vital role as a detection tool for cardholder data environments, enabling organizations to identify potential risks and breaches that could compromise stored cardholder data. By harnessing Falco's capabilities, organizations can promptly detect security incidents and take necessary actions to protect sensitive information or initiate appropriate responses as defined in the PCI DSS.

This guidance focuses on 3 areas of security requirements (#6, #10 and #11). It serves as a foundation for understanding how Falco can be leveraged to detect insecure behaviors that may result in a failed PCI DSS audit. Future articles will delve into the remaining PCI DSS controls. It is essential to emphasize  that even a single failed control can have severe financial and reputational consequences for organizations.

As usual, if you have any feedback or need help, you can find us at any of the following locations.

* Get started in [Falco.org](http://falco.org/)
* Check out the [Falco project on GitHub](https://github.com/falcosecurity/falco).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).
