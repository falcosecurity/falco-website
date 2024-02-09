---
title: Automate Kubernetes Network Security with Falco Talon
description: Block Suspicious Network Traffic with Talon and NetworkPolicies
date: 2023-02-09
author: Nigel Douglas
slug: falco-network-security
images:
  - /blog/atomic-red-falco/images/falco-network-featured.png
tags: ["security-concept"]
---


Setting up robust network security in Kubernetes is a challenge that demands both precision and adaptability. NetworkPolicy offers the potential for highly specific network configurations, enabling or blocking traffic based on a comprehensive set of criteria. However, the dynamic nature of network topologies and the complexities of managing policy implementations present ongoing challenges. The need for constant policy updates, especially in response to changing threat landscapes, introduces risks such as the potential for misconfiguration and the unintended dropping of packets.

## The Challenge of IP-Based Network Policies

Building network policies around IP addresses is notoriously challenging. For instance, threat feeds, which list known malicious IP addresses, are constantly changing. An IP address associated with a malicious entity one week might be reassigned and deemed safe the next. This fluidity necessitates an agile approach to network policy management, integrating solutions like NetworkSets to dynamically update policies based on the latest intelligence. However, the sheer volume of threat intelligence feeds – from Tor IP lists to cryptomining blocklists – complicates this integration, making it a daunting task to maintain accurate network controls.

Here, Falco Talon emerges as a transformative solution. By leveraging Falco's detection capabilities, such as identifying [Outbound Connections to C2 Servers](https://thomas.labarussias.fr/falco-rules-explorer/?hash=0d2e8a0dd3369a030f7acfaab682ad92), Falco Talon can instantly update Kubernetes network policies  to block all egress traffic except allowed CIDR ranges. This is facilitated through the [kubernetes:networkpolicy](https://docs.falco-talon.org/docs/actionners/list/#kubernetesnetworkpolicy) Talon action, demonstrating a seamless integration of dynamic threat detection with network policy enforcement.


```
- action: Disable outbound connections
  actionner: kubernetes:networkpolicy
  parameters:
    allow:
      - "192.168.1.0/24"
      - "172.17.0.0/16"
      - "10.0.0.0/32"

- rule: Suspicious outbound connection
  match:
    rules:
      - Outbound Connections to C2 Servers
  actions:
    - action: Disable outbound connections
```


While this would certainly block the egress network connections, it’s not really convenient for some organizations as it’s a scorched-earth approach to blocking traffic but still relies on an IP-based allowlist on each Talon rule - rather than blocking the actual suspicious IP address specified in the Falco rule. Instead, we will propose the use of labels as a response action in Talon to better isolate network traffic at runtime.



## Shifting from IPs to Labels for Network Security

While IP-based blocking is effective in response to specific threats detected by Falco, it's not the most scalable solution for ongoing network policy management in production environments. An alternative approach focuses on using labels to create quarantine-style network policies. This method involves configuring a network policy that applies a default-deny stance on all ingress and egress traffic for pods matching certain labels, effectively isolating potentially compromised workloads. This can easily be achieved with the below one-liner:

```
kubectl label pod <pod-name> -n <namespace-name> quarantine=true
```

This is certainly a cleaner approach than the previous enforced network policy implementation, but the challenge here is the manual process of labeling those suspected workloads, which can be cumbersome and slow in response to emerging threats. How many minutes will it take our security team to enforce this label action, and what happens if this happens over the weekend? 

Falco Talon addresses this gap with its [kubernetes:labelize](https://docs.falco-talon.org/docs/actionners/list/#kuberneteslabelize) response action. Upon detecting a threat, such as the [Detect outbound connections to common miner pool ports](https://thomas.labarussias.fr/falco-rules-explorer/?hash=3f01c102c6d26af968d5eb6b6777085d), Talon can automatically apply a ```quarantine:true``` label to the affected pod, triggering the enforcement of the quarantine network policy in real-time. This capability not only enhances the speed and efficiency of response actions but also underscores the power of integrating dynamic threat detection with network policy enforcement.

```
- action: Quarantine Pod in Network Policy
  actionner: kubernetes:labelize
  parameters:
    labels:
      quarantine: true

- rule: Suspicious outbound connection
  match:
    rules:
      - Detect outbound connections to common miner pool ports
  actions:
    - action: Quarantine Pod in Network Policy
```

While Talon can apply the label, you still need a component that will enforce the quarantine. Most CNI's can do this, but for the purpose of this blog I'll add an example with Calico:
```
apiVersion: projectcalico.org/v3
kind: GlobalNetworkPolicy
metadata:
  name: quarantine
spec:
  selector: quarantine == "true"
  ingress:
    - action: Deny
      source: {}
      destination: {}
  egress:
    - action: Deny
      source: {}
      destination: {}
  types:
    - Ingress
    - Egress
```

## Conclusion

The integration of Falco Talon into Kubernetes network security strategies represents a significant advancement in the field. By automating the enforcement of network policies based on real-time threat detection, Falco Talon simplifies the complexities associated with managing network security in a constantly evolving landscape. Whether responding to immediate threats through IP-based policies or proactively isolating workloads with label-based quarantine policies, Falco Talon provides a flexible, powerful tool for enhancing the security and resilience of Kubernetes environments. As organizations navigate the challenges of cloud-native security, solutions like Falco Talon offer a beacon of adaptability and effectiveness, ensuring that network security keeps pace with the dynamic nature of containerized deployments.
