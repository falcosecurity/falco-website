---
title: Why Falco?
keywords: Scalable, performant, customizable, flexible deployment, single language policy
---

{{< blocks/content wrap="col" >}}
## Why Falco?
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img content="html" src="/img/about/highly_scalable.svg" alt="highly scalable" index="1 md-1 lg-1 xl-1" header="Highly Scalable" >}}

{{< content_arrow href="#compatibility-with-container-orchestration-tools" >}}
Falco is highly scalable, due to its containerized architecture and  tight Kubernetes integration.
{{< /content_arrow >}}

{{< content_arrow href="#runs-as-a-daemonset" class="mt-2" >}}
Falco runs as a Kubernetes daemon set, ensuring every node in the cluster is monitored by Falco.
{{< /content_arrow >}}

{{< content_arrow href="#leverages-the-kubernetes-api" class="mt-2" >}}
Falco leverages Kubernetes to dynamically update its configuration as new pods are added or removed from the cluster.
{{< /content_arrow >}}

{{< content_arrow href="#analyze-alerts-at-scale" class="mt-2" >}}
Falco's integration with cloud-native technologies like Prometheus and Grafana provides users with the ability to visualize and analyze Falco alerts at scale.
{{< /content_arrow >}}

{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img content="html" src="/img/about/highly_perfomant.svg" alt="highly performant" index="1 md-0 lg-0 xl-0" header="Highly Performant" >}}

{{< content_arrow href="#event-driven-architecture" >}}
Falco is highly performant due to its low overhead, streaming event architecture, and the ability to leverage kernel-level instrumentation to capture system events.
{{< /content_arrow >}}

{{< content_arrow href="#uses-a-minimal-set-of-resources" class="mt-2" >}}
Falco keeps its footprint small by using a minimal set of resources, including CPU, memory, and I/O, while monitoring system events.
{{< /content_arrow >}}

{{< content_arrow href="#only-monitor-the-relevant-events" class="mt-2" >}}
Falco's event-driven architecture allows it to monitor only relevant events, reducing noise, decreasing latency, and dramatically reducing storage costs.
{{< /content_arrow >}}

{{< content_arrow href="#kernel-level-instrumentation-to-capture-system-events" class="mt-2" >}}
Falco uses eBPF or kernel modules capturing system and application behavior and detecting a broad range of security issues.
{{< /content_arrow >}}

{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img content="html" src="/img/about/single_policy.svg" alt="single policy language" index="1 md-1 lg-1 xl-1" header="Single Policy Language" >}}

{{< content_arrow href="#ensures-consistency-and-reduces-complexity" >}}
Falco's policy language is all you need to know: reducing complexity and misconfigurations.
{{< /content_arrow >}}

{{< content_arrow href="#promotes-collaboration-between-security-ops-teams" class="mt-2" >}}
Collaboration over security and operations teams is eased by the use of a shared policy language.
{{< /content_arrow >}}

{{< content_arrow href="#provides-flexibility-extensibility" class="mt-2" >}}
Policy language extensibility means you can create, reuse, and consume others' rules.
{{< /content_arrow >}}

{{< content_arrow href="#simplifies-compliance-auditing" class="mt-2" >}}
A single policy language simplifies compliance and auditing.
{{< /content_arrow >}}

{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img content="html" src="/img/about/flexible_deployment.svg" alt="flexible deployment options" index="1 md-0 lg-0 xl-0" header="Flexible Deployment Options" >}}

{{< content_arrow href="#tailor-the-install-process-to-your-specific-needs" >}}
Customizable install lets you deploy to hosts, VMs, or Kubernetes, on or off-prem.
{{< /content_arrow >}}

{{< content_arrow href="#deploy-in-a-cloud-native-way" class="mt-2" >}}
Falco was born cloud-native, so works well as a containerized app executing inside K8s clusters.
{{< /content_arrow >}}

{{< content_arrow href="#deploy-additional-components" class="mt-2" >}}
Falco installation plays nice with common cloud-native services such as Prometheus or Grafana.
{{< /content_arrow >}}

{{< content_arrow href="#falco-uses-ebpf-by-default" class="mt-2" >}}
Falco deploys by default using eBPF, providing performance, maintainability and simplified UX.
{{< /content_arrow >}}

{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content content="html" >}}
{{< two_column_block_img content="html" src="/img/about/customizable.svg" alt="Customizable" index="1 md-1 lg-1 xl-1" header="Customizable" >}}

{{< content_arrow href="#meet-specific-security-requirements" >}}
Define your own custom rules to meet specific security requirements.
{{< /content_arrow >}}

{{< content_arrow href="#build-your-own-falco-plugins" class="mt-2" >}}
Create your own custom plugins to handle events from additional sources.
{{< /content_arrow >}}

{{< content_arrow href="#trigger-your-own-custom-actions" class="mt-2" >}}
Configure alerts to trigger specific actions, such as executing custom scripts.
{{< /content_arrow >}}

{{< content_arrow href="#enrich-alerts-with-custom-metadata-context" class="mt-2" >}}
Define custom metadata to enrich Falco alerts with context specific to your needs.
{{< /content_arrow >}}

{{< /two_column_block_img >}}
{{< /blocks/content >}}

{{< blocks/content wrap="col" content="text" color="light">}}
{{< icon_header index=0 src="/img/about/file-earmark-check-fill.svg" alt="file-earmark-check-fill" class="mb-5" >}}
### Policy Language Benefits
{{< /icon_header >}}

##### Ensures Consistency and Reduces Complexity

Falco's rule language is used to define security policies for detecting and alerting on potential threats, and its use across the entire platform ensures a uniform approach to security monitoring. This means that all team members can understand the policies and alerts, regardless of their role or the context in which they are used.

<hr class="w-100 my-4"/>

##### Promotes Collaboration between Security & Ops teams

Since everyone is working with the same set of rules and policies, it becomes easier for these teams to share insights and work together to solve security issues. This can help to reduce the time it takes to identify and resolve security incidents.

<hr class="w-100 my-4"/>

##### Provides Flexibility & Extensibility

The language is designed to be easy to use, and it offers a wide range of operators and conditions that can be used to create customized rules for specific security scenarios. This allows teams to create policies that are tailored to their unique needs and requirements.

<hr class="w-100 my-4"/>

##### Simplifies Compliance & Auditing
Falco's rules language can also be used to alert on compliance violations, such as detecting unauthorized changes to files under PCI/DSS. As a result, it becomes easier to demonstrate compliance with regulations and standards. To better understand how Falco can be used for meeting regulatory compliance in cloud-native environments, check out this [video](https://youtu.be/qce3h0II4yw?t=143).

{{< /blocks/content >}}

{{< blocks/content wrap="col" content="text" color="light">}}
{{< icon_header index=0 src="/img/about/arrows-fullscreen.svg" alt="arrows-fullscreen" class="mb-5" >}}
### Scalability Benefits
{{< /icon_header >}}

##### Compatibility with Container Orchestration Tools

At its core, Falco is a kernel event monitoring and detection agent. Falco can enhance these events by integrating metadata from the container runtime and Kubernetes. This tight integration with various container orchestration tools enables the expansion of Falco's detection capabilities and scope. It can, for example, detect and alert on new containers and workloads being deployed, ensuring that security visibility is comprehensive across your infrastructure. In addition, through Falco's native support for daemonset-like deployments, it can seamlessly integrate into your existing setup, whether you are using Kubernetes, Docker Swarm, or other container orchestration platforms.

<hr class="w-100 my-4"/>

##### Runs as a Daemonset

Like other workload objects, a DaemonSet manages groups of replicated Pods. However, DaemonSets attempt to adhere to a one-Pod-per-node model, either across the entire cluster or a subset of nodes. As you add nodes to a node pool, DaemonSets automatically add Pods to the new nodes as needed. This enables Falco to monitor all containers on all nodes, providing comprehensive security visibility across the entire cluster. To learn how Falco is used as a DaemonSet, check out our [workshop](https://github.com/falcosecurity-retire/falco-security-workshop/blob/master/exercise2/k8s-using-daemonset/).

<hr class="w-100 my-4"/>

##### Leverages the Kubernetes API

Falco leverages the Kubernetes API to monitor the state of pods and nodes in the cluster. It can detect anomalies and violations in real-time, and alert the user or take automated actions based on defined rules. As the Kubernetes cluster grows, Falco can use the Kubernetes API to dynamically adjust its monitoring capabilities, such as adding more sensors, without manual intervention. This ensures that the monitoring remains effective and efficient even as the cluster scales up or down.

<hr class="w-100 my-4"/>

##### Analyze Alerts at Scale

Falco integrates with Prometheus and Grafana to provide users with a scalable solution for visualizing and analyzing Falco alerts. This allows users to quickly identify and respond to potential security threats in their containerized environments. As your Kubernetes environment expands, so too does your cloud-native monitoring platform.

{{< /blocks/content >}}

{{< blocks/content wrap="col" content="text" color="light">}}
{{< icon_header index=0 src="/img/about/speedometer.svg" alt="speedometer" class="mb-5" >}}
### Performance Benefits
{{< /icon_header >}}

##### Event-driven Architecture

Falco's high performance is due to several factors, including its low overhead, event-driven architecture, and kernel-level instrumentation. The low overhead of Falco's design allows it to capture and analyze events with minimal impact on system performance. The event-driven architecture enables Falco to respond quickly to security incidents, while kernel-level instrumentation ensures that it can capture and analyze events in real-time, further enhancing its performance.

<hr class="w-100 my-4"/>

##### Uses a minimal set of resources

Falco is designed to use a minimal set of resources, such as CPU and memory, while still providing effective monitoring and detection capabilities. By using a minimal set of resources, Falco operates efficiently and does not impact the performance of the monitored applications, ensuring that the applications can continue to function smoothly without any degradation in performance.This makes Falco an ideal choice for monitoring Kubernetes clusters where resource utilization is critical and any performance degradation can have significant consequences.

<hr class="w-100 my-4"/>

##### Only monitor the relevant events

Falco only monitors relevant events by using filters and rules to define which events to monitor, such as file access or network connections. By filtering events, Falco can avoid processing unnecessary data, and concentrate only on security-related events. This reduces the amount of data to be processed and analyzed, which enables Falco to detect security threats more effectively and efficiently.

<hr class="w-100 my-4"/>

##### Kernel-level instrumentation to capture system events

Falco uses kernel instrumentation to observe system events by monitoring system calls and other kernel-level signals. The Falco kernel components are designed to be fast and non intrusive, as they do not alter the system's behavior. By using this approach, Falco can collect rich information of what applications are doing nearly in real-time while minimizing overhead and preventing interference with regular workload behavior.

{{< /blocks/content >}}

{{< blocks/content wrap="col" content="text" color="light">}}
{{< icon_header index=0 src="/img/about/stack.svg" alt="stack" class="mb-5" >}}
### Flexible Deployment Benefits
{{< /icon_header >}}

##### Tailor the install process to your specific needs

Users can select which components to install. You can configure specific settings for your needs. And you can even choose the deployment environment, whether it be in Kubernetes, on a bare metal VM, an IoT device or Edge computing. More documentation on install options can be seen [here](https://falco.org/docs/getting-started/running/).

<hr class="w-100 my-4"/>

##### Deploy in a “Cloud-Native” way

By installing Falco as a containerized pod within Kubernetes, it becomes easier to scale, manage, and deploy multiple instances of Falco. Containerization provides a lightweight and portable way to package and deploy applications, allowing for faster and more consistent deployments. Kubernetes is designed for enabling automatic scaling, self-healing, and centralized management of Falco instances. This can lead to improved operational efficiency and reduced overhead for security teams.

<hr class="w-100 my-4"/>

##### Deploy Additional Components

The benefit of Falco installation playing nice with common cloud-native services such as Prometheus or Grafana is that it enables seamless integration with existing monitoring and observability toolchains. This integration can help organizations streamline their security workflows, enabling faster detection and response to security incidents. It can also provide a more holistic view of the security landscape, allowing security teams to identify and mitigate potential threats more effectively.

<hr class="w-100 my-4"/>

##### Falco uses eBPF by default

Deploying Falco using eBPF reduces complexity by removing the need for additional kernel modules or user-space agents. This simplifies deployment and maintenance, making it easier to integrate Falco into existing environments. Deploying Falco using eBPF provides a simplified user experience. With eBPF, users can deploy Falco with a single command, eliminating the need for additional configuration or setup.

{{< /blocks/content >}}

{{< blocks/content wrap="col" content="text" color="light">}}
{{< icon_header index=0 src="/img/about/gear-fill.svg" alt="gear-fill" class="mb-5" >}}
### Customization Benefits
{{< /icon_header >}}

##### Meet specific security requirements

Defining custom Falco rules can benefit security by allowing organizations to create rules tailored to specific security requirements. Custom rules can detect behaviors unique to an organization's environment, providing more targeted security alerts. They can also help organizations comply with regulatory requirements or internal security policies.

<hr class="w-100 my-4"/>

##### Build your own Falco Plugins

Creating custom Falco plugins can benefit security by allowing organizations to extend Falco's functionality to handle events from additional sources beyond system calls. Custom plugins can integrate with other tools or data sources, providing a more comprehensive view of the security landscape. They can also automate workflows or remediation actions based on Falco alerts.

<hr class="w-100 my-4"/>

##### Trigger your own custom actions

Configuring custom Falco alerts can benefit security by allowing organizations to automate incident response workflows. Custom alerts can trigger specific actions, such as executing custom scripts or sending notifications, enabling faster response times and reducing the impact of security incidents. They can also help organizations comply with internal processes or regulatory requirements.

<hr class="w-100 my-4"/>

##### Enrich alerts with custom metadata context

Defining custom metadata can benefit security by enriching Falco alerts with context specific to an organization's needs. Custom metadata can provide additional information about the alert, such as user information or application details, enabling faster investigation and response times. It can also help organizations comply with regulatory requirements or internal security policies.

{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
  <h3 class="mb-3">Falco FAQs</h3>

  {{< faq take=3 skip=5 >}}

  <div class="text-center mt-5">
    <a href="/about/faq/" class="text-center btn btn-primary btn-lg">Go to all FAQs</a>
  </div>
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
{{< feedback >}}
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
{{< footer_nav 
  prev="/about/falco"
  prevTitle="About Falco"
  next="/about/use-cases"
  nextTitle="Falco use cases" >}}
{{< /blocks/content >}}
