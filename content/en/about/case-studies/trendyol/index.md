---
title: Trendyol Case Study
date: 2023-07-26
author: Emin Aktas, Furkan Türkal, Vicente J. Jiménez Miras
slug: trendyol
---

{{< blocks/content content="html" wrap="col" color="light" >}}

<div>
    <img class="case-study-logo mb-4" alt="Trendyol Log" src="/img/case-studies/trendyol/trendyol.png">
</div>

<h1>Threat hunting at scale: auditing hundreds of clusters with Falco</h1>

{{< /blocks/content >}}

{{< blocks/content wrap="col" >}}

[Trendyol](https://www.trendyol.com/whoweare) is a leading e-commerce platform in Turkey, with a fast-growing customer base of over 30 million people and a dedicated team of 4,000+ employees. With an extensive product selection spanning fashion, electronics, home & furniture, food, mother-child, and cosmetics, Trendyol has over 200 million items on its platform and delivers to 27 European countries. The company's impressive growth and broad range of offerings have solidified its position as one of the region's largest and most successful e-commerce platforms.

To ensure a seamless shopping experience for customers, they operate numerous production-grade Kubernetes clusters spread across nine distinct regions. Given the vast size of their infrastructure, it can be difficult to track each component, resource, user, and team promptly.


## Background

On an average workday, Trendyol's production environment produces more than 700,000 Kubernetes audit logs per minute. Handling audits efficiently at this scale while minimizing disruption to the cluster's regular operations can pose a challenge.

Moreover, Trendyol required a reliable and scalable indexing and backend storage system that seamlessly integrates with the chosen solution to manage this substantial amount of data.

Trendyol aimed to create a system capable of identifying three specific anti-patterns: unauthorized privilege escalation, attempts to access Kubernetes secrets without proper authorization, and interactive access to running containers in their production environment. To enhance the security of their systems, Trendyol devised a monitoring system as their primary defense mechanism. This system implemented threat-hunting techniques to proactively identify potential security vulnerabilities and issues before they could be exploited.


## Journey to Falco

To tackle tracking activities in its production environment, Trendyol created a monitoring solution by leveraging two open source projects: Falco and Fluent Bit. The team successfully developed an audit observability system and implemented alerting mechanisms by utilizing this architecture. These components work together to efficiently identify recurring patterns, enabling improved threat detection and enhanced visibility within the system.


### Learn about the Technology

[Fluent Bit](https://fluentbit.io) is an open source tool that is lightweight and high-speed, serving as a data forwarder. It can collect, process, and forward logs and metrics from diverse sources to different destinations in real time. Unlike other popular open source tools, Fluent Bit is specifically designed to be more efficient and consume fewer resources. It can be used as a standalone tool or as a lightweight substitute for Fluentd in larger logging infrastructures.

[Falco](https://falco.org) is an open source project focused on cloud-native runtime security. Its primary purpose is to monitor and identify unexpected behavior within cloud, host, and container-based environments, particularly in Kubernetes. By leveraging various event sources, such as Kubernetes audit logs and kernel system calls, Falco can promptly detect and raise alerts for potential security threats. It offers in-depth insights into the nature of these threats, empowering security teams to respond swiftly and efficiently to mitigate risks.

Events related to the Kernel tell us most of what happens above. Leveraging syscalls and kernel events is essential for monitoring the system and detecting potential security threats, as they play a crucial role in providing essential information about the activities and behavior of processes within the system.

To illustrate this, imagine a movie where a group of bad guys kidnaps a communication satellite to gain an advantage over the good guys. In this scenario, we assume the role of the good guys, and the kernel represents that communication satellite, which grants control and an advantage to whoever possesses it. This parallels how the good guys would use the information from the satellite to gain an advantage and foil the bad guys' plans.


### The Architecture

When designing the architecture, Trendyol emphasized achieving optimal performance and scalability. They carefully aligned the architecture with its intended purpose and identified potential bottlenecks that could arise from integrating various components. Additionally, they prioritized factors such as fault tolerance and aimed to maintain vendor independence whenever feasible.

Because the architecture incorporates Fluent Bit and Falco, both active projects within the _[Cloud Native Computing Foundation (CNCF)](https://cncf.io)_, vendor independence was not a significant concern. However, it remains important to consider the potential for future replacements and not overlook the possibility of maintaining vendor independence. This architecture is designed to function effectively in tightly coupled and component-independent configurations, offering flexibility and adaptability to suit different needs and potential future changes.

This architecture aims to effectively gather, process effectively, and store system and application logs with a focus on reliability. Fluent Bit is sufficient for the initial tasks of log collection and storage, particularly due to its ability to extract information from all the containers. However, the monitoring system goes beyond basic log processing by incorporating Falco. Falco introduces an additional layer of log processing capabilities by actively detecting Indicators of Compromise (IoC) within the log content. This integration enhances the system's ability to identify security threats and take appropriate actions.

In Trendyol's monitoring system, information is obtained from the Linux kernel of each node and the audit logs generated by the nodes that make up the control plane of each Kubernetes cluster. This could introduce additional complexity in the architecture since only a specific number of nodes within a cluster run instances of the Kubernetes API server. However, the right configuration makes Fluent Bit treat those particular nodes as any other, removing that potentially added complexity. Therefore, capturing and processing the audit logs from the control plane nodes would require a few additional tweaks for the Fluent Bit to retrieve the logs correctly.

Within Cloud-Native environments, a widely recommended approach among practitioners is to treat compute nodes and applications as cattle rather than pets. In this approach, the focus is on scalability and resilience rather than the individual instances themselves. The specific number of instances becomes less relevant, as the system is designed to scale up dynamically or down based on demand.

The Trendyol team recognized the importance of this principle and adopted it seriously. They prioritized building a Cloud-Native architecture that could easily scale and handle varying workloads without being constrained by the fixed number of instances. By embracing this approach, Trendyol ensured its system's flexibility and ability to adapt to changing requirements and fluctuations in demand, leading to improved performance and resilience.

{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col" >}}

<div>
    <img class="w-100" src="/img/case-studies/trendyol/log-processing.png" alt="Log processing inside a Kubernetes Cluster ">
</div>

{{< /blocks/content >}}

{{< blocks/content wrap="col" >}}

As mentioned, the [Kubernetes Audit Logs](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/) and Linux Kernel System Calls serve as the primary sources of logs in the monitoring system. While Fluent Bit serves as the main log collector and forwarder, it is incapable of understanding and collecting Linux Kernel System Calls. To address this limitation, Falco is responsible for retrieving information related to syscalls using its dedicated libraries. Falco diligently performs this task, ensuring that the necessary syscall data is captured and made available for further processing and analysis within the monitoring system. By leveraging the combined capabilities of Fluent Bit and Falco, Trendyol achieves comprehensive log collection, including both Kubernetes Audit Logs and Linux Kernel System Calls, enhancing their ability to detect and respond to potential security threats.

Understood, let's pause and focus on the Audit Logs. Falco does have the capability to receive Kubernetes Audit Logs directly. However, as of the time of writing, Kubernetes is limited to sending these logs to a single destination using the [webhook backend](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/#webhook-backend). If the Audit Logs were sent directly to Falco, it would mean losing the option to enrich the log metadata and store the original ones in a dedicated logging storage for later analysis and compliance purposes.

To overcome this limitation, a potential solution is to implement a log-forwarding mechanism. By setting up a log forwarding system, the Kubernetes Audit Logs can be sent simultaneously to both Falco and the dedicated logging storage simultaneously. This way, Falco can effectively analyze the logs in real-time for immediate threat detection, while the original logs are also preserved in the dedicated storage for future analysis, auditing, and compliance requirements.

By employing this log forwarding approach, Trendyol can maintain the benefits of both real-time monitoring and long-term log storage, ensuring a comprehensive, resilient and robust monitoring system that aligns with operational and compliance needs.

In the solution implemented by Trendyol, the [log backend](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/#log-backend) mechanism provided by Kubernetes is utilized for collecting the Audit Logs. This mechanism involves writing the audit events to a file, which is then accessed by Fluent Bit. Fluent Bit retrieves the audit events from the file and sends them to multiple destinations, including the Falco Service and previously mentioned dedicated storage.

During this process, Fluent Bit takes the opportunity to enrich the log stream by adding relevant data such as the cluster origin, region, and the team associated with the cluster. This additional information provides contextual details that can be valuable for analysis and monitoring. By leveraging the Kubernetes Audit log backend mechanism and employing Fluent Bit's log enrichment and distribution capabilities, Trendyol achieves a comprehensive monitoring system that incorporates real-time threat detection with Falco and ensures long-term log storage for operational and compliance needs.

Indeed, with Falco receiving information from the Kernel via native System Calls and the Kubernetes API Audit Logs through Fluent Bit using the K8s Audit Plug-in, the next step is processing this collected data.

Falco excels in real-time processing and analysis of the received logs. It leverages its rule-based detection engine to evaluate the log entries against a set of predefined [rules](https://falco.org/docs/reference/rules/examples/) or policies. These rules define specific behaviors or _Indicators of Compromise (IoCs)_ that Falco actively looks for within the log content. When a log entry matches a rule, Falco generates an alert or triggers an action, providing the security team with immediate visibility and an opportunity to respond to potential threats swiftly.

To clarify, the same rule engine will process both sets of events, including the parsed System Calls and the K8s Audit Logs. However, they will each be evaluated against different rules tailored to their specific context.

For the System Calls, Falco will apply rules designed to detect anomalous behavior related to file access, process creation, or other relevant activities. These rules are crafted to identify potential security threats or unauthorized activities within the system. When a System Call event matches one of these rules, Falco will generate an alert that will be sent back to Fluent Bit.

On the other hand, the K8s Audit Logs will undergo analysis using a separate set of rules specifically created to identify Indicators of Compromise (IoC) related to the usage of the Kubernetes API. These rules will focus on detecting actions such as unauthorized access attempts, attempts to access deployment secrets, or the exposure of applications to the external world unnecessarily. Whenever an event from the K8s Audit Logs matches one of these rules, Falco will generate an alert that will be treated as those generated when processing the System calls.

To enable simultaneous forwarding of alerts generated by Falco to multiple destinations, additional configuration and auxiliary tools such as [Falco Sidekick](https://github.com/falcosecurity/falcosidekick) would be required. However, Trendyol opted for a different approach to achieve this goal.

Following a similar method used to collect the K8s Audit Logs, Trendyol decided to leverage file-based reading to handle the alerts generated by Falco. Each container within the environment is associated with a [file descriptor (FD)](https://en.wikipedia.org/wiki/File_descriptor) in a known location on the node. Fluent Bit, configured accordingly, captures the contents of these container-associated log files and sends them to the dedicated logging storage.

Fluent Bit also adds value by labeling the logs with tags for improved identification during later stages of analysis and processing. This ensures that the alerts can be easily distinguished and categorized based on their origin and other relevant metadata. This labeling assigns a different priority to the Falco logs during further processing.

Indeed, utilizing Fluent Bit for forwarding Falco alerts saves resources on the Falco instances themselves. It eliminates the need to configure each Falco instance individually to send alerts to potentially dynamic destinations. With Fluent Bit's capability to identify the cluster it is running in, it can seamlessly handle forwarding the alerts.

By leveraging Fluent Bit's features and implementing a standardized configuration pattern, Trendyol has optimized resource utilization, facilitated log identification, and established an efficient and scalable monitoring system that can be easily replicated across their infrastructure.


## Results

The architecture implemented by Trendyol emphasizes optimal performance, scalability, fault tolerance, and vendor independence. The system collects and processes Kubernetes Audit Logs and Linux Kernel System Calls, using Falco and Fluent Bit to enrich and distribute the logs. Falco applies rule-based detection to evaluate the logs, generating alerts when specific behaviors or Indicators of Compromise (IoC) are detected. By forwarding alerts through Fluent Bit, Trendyol efficiently processes and stores them, ensuring comprehensive monitoring and long-term log storage for real-time threat detection and future analysis.

Overall, Trendyol's use of Falco and Fluent Bit has optimized resource utilization, streamlined configuration, and established a scalable monitoring system. The combination of these open source projects has allowed Trendyol to enhance security, improve visibility, and efficiently track activities within its complex infrastructure. Moreover, Trendyol has achieved a repeatable configuration pattern that can be applied to new clusters, regardless of the region they are created in. This consistency in configuration allows for streamlined deployment and management of the monitoring system across different clusters, simplifying the operational processes and ensuring a consistent security monitoring approach.

{{< /blocks/content >}}
