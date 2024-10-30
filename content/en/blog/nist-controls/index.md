---
title: Validating NIST Requirements with Falco
linktitle: Validating NIST Requirements with Falco
description: Learn how Falco detects failed/misconfigured NIST Controls
date: 2023-07-18
author: Nigel Douglas
slug: falco-nist-controls
images:
  - /blog/falco-nist-controls/images/falco-nist-controls-featured.png
---

The NIST organization, a non-regulatory federal agency in the United States, plays a crucial role in establishing guidelines across various domains, including cybersecurity. In this article, we focus on NIST 800-171 compliance checks, which pertain to the management of Controlled Unclassified Information (CUI) in non-federal systems & organizations. NIST 800-171 sets forth guidelines & requirements specifically aimed at safeguarding CUI.


It is worth noting that NIST 800-171 closely aligns with the NIST 800-53 framework. While the latter framework outlines security controls applicable to federal agencies and their contractors, NIST 800-171 specifically addresses the management of CUI, ensuring its protection and confidentiality within non-federal systems and organizations.

The inception of NIST 800-171 can be traced back to [Executive Order 13556](https://obamawhitehouse.archives.gov/the-press-office/2010/11/04/executive-order-13556-controlled-unclassified-information), signed by President Obama in 2010, which aimed to enhance the protection of CUI within federal agencies. The goal was to establish a standardized policy for data sharing and transparency across all agencies. 

In the wake of significant breaches in government systems, most notably the [2020 United States federal government data breach](https://en.wikipedia.org/wiki/2020_United_States_federal_government_data_breach) that involved the exploitation of U.S. supply chain firms such as Microsoft, SolarWinds, and VMware to gain unauthorized access to federal systems, has exemplified the importance of strong cybersecurity controls at the federal level.

While delving into the extensive history of the NIST framework is beyond the scope of this article, we will focus on explaining the requirements of NIST 800-171 and explore how the open source tool Falco can be utilized to detect potential control failures in cloud-native systems.


## Listing the Requirements

The NIST 800-171 documentation provides a comprehensive list of 14 controls accompanied by their corresponding compliance requirements. For the purpose of this article, we will focus on how Falco can effectively address 3 of the 14 controls and their corresponding requirements to ensure compliance in-line with the NIST 800-171 documentation.

1. <b>Access Controls:</b> Who has access to data and whether or not they’re authorized.
- [AC-2](https://csf.tools/reference/nist-sp-800-53/r4/ac/ac-2/) : Account Management
- [AC-6](https://csf.tools/reference/nist-sp-800-53/r4/ac/ac-6/) : Least Privilege

2. <b>Audit & Accountability:</b> Know who’s accessing CUI and who’s responsible for what.
- [AU-9](https://csf.tools/reference/nist-sp-800-53/r5/au/au-9/) : Protection of Audit Information
- [AU-10](https://csf.tools/reference/nist-sp-800-53/r5/au/au-10/) : Non-repudiation

3. <b>Configuration Management:</b> Follow guidelines to maintain secure configurations.
- [CM-5](https://csf.tools/reference/nist-sp-800-53/r5/cm/cm-5/) : Access Restrictions for Change
- [CM-7](https://csf.tools/reference/nist-sp-800-53/r5/cm/cm-7/) : Least Functionality

4. <b>Awareness & Training:</b> Your staff should be adequately trained on CUI handling.
5. <b>Identification & Authentication:</b> Manage and audit all instances of CUI access.
6. <b>Incident Response:</b> Data breach preparedness and response plan protecting CUI.
7. <b>Maintenance:</b> Ensure ongoing security and change management to safeguard CUI.
8. <b>Media Protection:</b> Secure handling of backups, external drives, and backup equipment.
9. <b>Physical Protection:</b> Authorized personnel only in physical spaces where CUI lives.
10. <b>Personnel Security:</b> Train your staff to identify and prevent insider threats.
11. <b>Risk Assessment:</b> Conduct pen testing and formulate a CUI risk profile. 
12. <b>Security Assessment:</b> Verify that your security procedures are in place and working. 
13. <b>System and Communications Protection:</b> Secure your comms channels and systems.
14. <b>System and Information Integrity:</b> Address new vulnerabilities and system downtime.

## Access Controls

The first control family in NIST 800-171, Access Controls, emphasizes the importance of enforcing secure access to systems and data. Open source Intrusion Detection System (IDS) tools like Falco can play a significant role in monitoring and enhancing access controls. 

Falco can be used to monitor access enforcement by detecting unauthorized access attempts, unusual login patterns, or suspicious user activities. It can also aid in user identification and authentication, ensuring that only authorized users gain access to sensitive resources. 

### NIST AC-2 - Account Management

The NIST control AC-2 pertains to account management. It focuses on the establishment and management of user accounts; including the creation, modification, and termination of accounts, as well as the assignment of associated privileges.

The Falco rule [System User Interactive](https://github.com/falcosecurity/rules/blob/c558fc7d2d02cc2c2edc968fe5770d544f1a9d55/rules/falco_rules.yaml#L2048C1-L2053C57) detects any attempt to run interactive commands by a system user (i.e. non login user).  By monitoring system user interactions, Falco can identify instances where system users, who typically do not engage in interactive sessions, attempt to execute commands interactively.

This rule helps enforce proper account management practices by flagging potentially unauthorized activities or misuse of system accounts. For example, if a non-login system user attempts to run interactive commands, it may indicate an unauthorized attempt to gain access or perform actions beyond their intended privileges.

```
- rule: System user interactive
  desc: an attempt to run interactive commands by a system (i.e. non-login) user
  condition: spawned_process and system_users and interactive and not user_known_system_user_login
  output: "System user ran an interactive command (user=%user.name user_loginuid=%user.loginuid)"
  priority: INFO
  tags: [host, container, users, mitre_execution, T1059, NIST_800-53_AC-2]
```


### NIST AC-6 - Least Privilege

Regarding Least Privilege, organizations are expected to employ the principle of least privilege where possible. This means allowing only authorized and expected users accesses which are necessary to accomplish assigned tasks in accordance with organizational missions and business functions. 

There are several Falco rules that can support least privilege security observability and therefore proof of violations.

```
- rule: Unexpected K8s NodePort Connection
  desc: Detect attempts to use K8s NodePorts from a container
  condition: (inbound_outbound) and fd.sport >= 30000 and fd.sport <= 32767 and container and not nodeport_containers
  output: Unexpected K8s NodePort Connection (command=%proc.cmdline pid=%proc.pid connection=%fd.name container_id=%container.id image=%container.image.repository)
  priority: NOTICE
  tags: [network, k8s, container, mitre_persistence, T1205.001, NIST_800-53_AC-6]
```

As you can see in the above example, there is very little to configure since the port numbers are in a range between ```30000 and 32767```, and this is the expected range used by a NodePort service. 

A macro named ```inbound_outbound``` is defined to handle the types of events (```accept```, ```listen``` and ```connect```) as well as the expected localhost IP’s, as stated below:

```
- macro: inbound_outbound
  condition: >
    ((((evt.type in (accept,listen,connect) and evt.dir=<)) and
     (fd.typechar = 4 or fd.typechar = 6)) and
     (fd.ip != "0.0.0.0" and fd.net != "127.0.0.0/8") and
     (evt.rawres >= 0 or evt.res = EINPROGRESS))
```

Here are a number of Falco rules that can be fine-tuned to your organization’s environment to achieve least privilege control observability, such as:

- [Unexpected outbound connection destination](https://github.com/falcosecurity/rules/blob/c558fc7d2d02cc2c2edc968fe5770d544f1a9d55/rules/falco_rules.yaml#L398C1-L408C70)
- [Unexpected inbound connection source](https://github.com/falcosecurity/rules/blob/c558fc7d2d02cc2c2edc968fe5770d544f1a9d55/rules/falco_rules.yaml#L419C1-L429C70)
- [Unexpected UDP Traffic](https://github.com/falcosecurity/rules/blob/c558fc7d2d02cc2c2edc968fe5770d544f1a9d55/rules/falco_rules.yaml#L2244C1-L2252C63)

For each of these rules you’ll need to populate the associated list items with the allowed sources/destinations:

```
- list: allowed_outbound_destination_domains
  items: [google.com, www.yahoo.com]
```



## Audit & Accountability

The second NIST control family aims to establish mechanisms for recording and reviewing system activities to ensure accountability, detect security incidents, and support investigations. This control focuses on implementing robust audit capabilities, including the collection, protection, analysis, and retention of audit logs. By implementing this control, organizations can enhance their ability to track and monitor system events, detect suspicious activities or policy violations, and maintain an audit trail for forensic analysis and compliance purposes.


### NIST AU-9 - Protection of Audit Information

Audit information pertains to all information needed to successfully audit system activity, such as audit records, audit log settings, audit reports, and personally identifiable information. Audit logging tools are those programs and devices used to conduct system audit and logging activities. 

You can use Falco rules to maintain NIST compliance by detecting and alerting when there are modifications to your logging tools, such as the [CloudTrail Logging Disabled rule](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail/rules/aws_cloudtrail_rules.yaml#L424C1-L439C25) below:


```
- rule: CloudTrail Logging Disabled
  desc: The CloudTrail audit logging has been disabled, this could be potentially malicious.
  condition:
    ct.name="StopLogging" and not ct.error exists
  output:
    The CloudTrail logging has been disabled.
    (requesting user=%ct.user,
     requesting IP=%ct.srcip,
     AWS region=%ct.region,
     resource name=%ct.request.name)
  priority: WARNING 
  tags: [cloud, aws, aws_cloudtrail, NIST_800-53_AU-9]
  source: aws_cloudtrail
```

### NIST AU-10 - Non-repudiation

In the context of NIST compliance, non-repudiation ensures that a party cannot deny their involvement in a particular action or transaction.

The Falco rule [Clear Log Activities](https://github.com/falcosecurity/rules/blob/c558fc7d2d02cc2c2edc968fe5770d544f1a9d55/rules/falco_rules.yaml#L2613C1-L2625C61) aligns with the requirement of non-repudiation by discouraging or preventing the deletion or modification of log activities. Logs are essential for capturing and preserving records of events and actions within a system or application. They serve as a crucial source of evidence for auditing, forensic investigations, and compliance purposes.

```
- rule: Clear Log Activities
  desc: Detect clearing of critical log files
  condition: >
    open_write and
    access_log_files and
    evt.arg.flags contains "O_TRUNC" and
    not trusted_logging_images and
    not allowed_clear_log_files
  output: >
    Log files were tampered (user=%user.name user_loginuid=%user.loginuid command=%proc.cmdline)
  priority: WARNING
  tags: [host, container, filesystem, mitre_defense_evasion, NIST_800-53_AU-10]
```

The above Falco rule monitors for activities or commands that attempt to clear or tamper with log files. By detecting and alerting on such actions, it helps ensure the integrity and non-repudiation of log data. This rule can help organizations comply with NIST guidelines by preserving the availability and authenticity of logs, making it difficult for malicious actors or legitimate users to manipulate or delete log entries of their activity/actions.

## Configuration Management

The third NIST control family encompasses a set of controls designed to establish and maintain an organization's baseline configuration for its information systems. These controls focus on effectively managing and controlling changes to hardware, software, and firmware configurations. The purpose of the Configuration management controls ensure that systems are securely configured, minimize vulnerabilities, and maintain the integrity and stability of the organization's IT environment. 

By implementing robust configuration management practices, organizations can effectively track and manage configuration changes, reduce the risk of unauthorized modifications, and establish a foundation for secure and reliable operations. These controls play a crucial role in maintaining the overall security posture of an organization's information systems.

### NIST CM-5: Access Restrictions for Change

The CM-5 requirement focuses on establishing and maintaining access restrictions for changes made to a system. The goal is to ensure that access to system components and resources is appropriately defined, documented, approved, and enforced throughout the change process. This control helps mitigate the risk of unauthorized or malicious changes that could compromise the system's security or integrity.

The below [K8s Audit Log Falco rule](https://github.com/falcosecurity/plugins/blob/master/plugins/k8saudit/rules/k8s_audit_rules.yaml#L416C1-L422C14) effectively detects unauthorized service account creations in the kube-system and/or kube-public namespaces, aligning with NIST control CM-5 objectives. By monitoring these creations, it ensures that access controls are properly defined, documented, and enforced in line with security policies. This enhances compliance, provides visibility into potential deviations, enables prompt remediation, and upholds system integrity and security.

```
- rule: Service Account Created in Kube Namespace
  desc: Detect any attempt to create a service account in the kube-system or kube-public namespaces
  condition: kevt and serviceaccount and kcreate and ka.target.namespace in (kube-system, kube-public) and response_successful and not trusted_sa
  output: Service account created in kube namespace (user=%ka.user.name serviceaccount=%ka.target.name resource=%ka.target.resource ns=%ka.target.namespace)
  priority: WARNING
  source: k8s_audit
  tags: [k8s, NIST_800-53_CM-5]
```

### NIST CM-7: Least Functionality

The NIST control CM-7 emphasizes the implementation and maintenance of the least functionality principle, aiming to limit the capabilities of information systems to essential functions. Falco's capability to detect unauthorized inbound and outbound connections is one way to support the enforcement of the least privilege control. 

```
- rule: Outbound or Inbound Traffic not to Authorized Server Process and Port
  desc: Detects traffic that is not to the authorized server process and port.
  condition: >
    inbound_outbound and
    container and
    container.image.repository in (allowed_image) and
    not proc.name in (authorized_server_binary) and
    not fd.sport in (authorized_server_port)
  enabled: false
  output: >
    Network connection outside authorized port and binary
    (command=%proc.cmdline pid=%proc.pid connection=%fd.name user=%user.name user_loginuid=%user.loginuid container_id=%container.id
    image=%container.image.repository)
  priority: WARNING
  tags: [container, network, mitre_discovery, TA0011, NIST_800-53_CM-7]
```


## Conclusion

In conclusion, we have explored three essential NIST control families: Access Controls, Audit & Accountability, and Configuration Management. These control families address crucial aspects of information security, such as ensuring secure access to systems and data, establishing mechanisms for recording and reviewing system activities, and effectively managing and controlling configuration changes. By covering these control families, we have highlighted the significance of implementing strong security practices to protect sensitive information and maintain compliance with regulatory frameworks like NIST.

Moreover, it is crucial to detect misconfigured controls and insecure behaviors in real-time. Timely detection allows incident response teams to take immediate corrective actions, preventing potential security incidents and ensuring compliance with regulatory frameworks like NIST. Falco has open source rules that you can quickly and easily implement/use to comply with the nist framework. Falco’s real-time detections enable organizations to proactively identify and respond to security risks, minimize the impact of incidents, and safeguard sensitive data. 

By maintaining compliance with NIST and other regulatory requirements, organizations can enhance their security posture, build trust with stakeholders, and mitigate the potential legal, financial, and reputational consequences of non-compliance. Prioritizing real-time detection and swift incident response is essential in maintaining a robust security posture and upholding regulatory compliance.

If you would like to know how Falco meets additional regulatory frameworks, check out the Falco blog on enforcing PCI/DSS controls in cloud-native systems - https://falco.org/blog/falco-pci-controls/.

As usual, if you have any feedback or need help, you can find us at any of the following locations.

* Get started in [Falco.org](http://falco.org/)
* Check out the [Falco project on GitHub](https://github.com/falcosecurity/falco).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).
