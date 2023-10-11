---
title: Linux Introspection - From BPF to Wireshark to Falco
date: 2023-10-11
author: Nigel Douglas
slug: wireshark-to-falco
images:
  - /blog/wireshark-to-falco/images/falcon-shark-featured.png
tags: ["Falco","Wireshark", "Linux"]
---

_Falco, an open source innovation, was conceived with the vision of crafting a flexible and robust rules engine atop the Sysdig libraries. This initiative aimed to furnish a potent tool for the detection of aberrant behaviors and intrusions within modern applications, akin to the Snort paradigm but tailored to the realm of system calls and finely tuned for cloud environments._

Nevertheless, it's important to recognize that Falco and Wireshark represent distinct facets of this evolutionary process. Falco offers ongoing surveillance akin to Snort, while Wireshark specializes in interactive endpoint network traffic analysis.


### The Need for Modern System Introspection

Part of this journey has been the emergence of cloud-native apps. From the early days of BPF (Berkley Packet Filter) and libpcap (a portable C/C++ library for network traffic capture), which laid the foundation for network packet analysis, to the familiar graphical user interface of Wireshark, our understanding of network data has undergone profound changes. This article embarks on a journey through this transformation, shedding light on how tcpdump and libpcap sparked an explosion of packet-based analysis and runtime security tools exemplified by Wireshark and Snort.

Wireshark, Snort, Nmap, Kismet, ngrep, and a bunch of other tools started at around the same time and are all evolutionary branches of tcpdump and libpcap.

However, as cloud computing continues to reshape the technological landscape, traditional network packet analysis tools have found themselves grappling with an evolving challenge: the cloud itself. Cloud-native applications have ushered in a new era of complexity and dynamism, rendering many existing visibility solutions obsolete. This shift necessitated a fresh perspective on network monitoring, leading to the birth of Falco, a tool poised to be the [Snort](https://www.snort.org/) of the cloud.


### Starting the story with Network Packet Analysis

During the late 1990s Internet boom, the demand for computer networks skyrocketed, leading to an increased need for monitoring, troubleshooting, and securing these networks. Regrettably, the available network visibility tools of that era were prohibitively expensive for many operators, leaving them grappling with a lack of insights.

Consequently, teams worldwide embarked on a mission to address this predicament. Their efforts revolved around expanding existing operating systems to incorporate packet capture capabilities, essentially transforming off-the-shelf computer workstations into devices capable of residing on a network and capturing all inbound and outbound data packets from other workstations. One such solution was the Berkeley Packet Filter (BPF), crafted to extend the functionality of the BSD (Berkeley Software Distribution) operating system kernel.

For Linux users, the term 'eBPF' may ring a bell – a virtual machine renowned for securely executing arbitrary code within the Linux kernel. Remarkably, eBPF has evolved into a powerful and flexible technology over the years. However, its origins trace back to a modest programmable packet capture and filtering module designed for BSD Unix.

The BPF team introduced a game-changing library known as 'libpcap,' which enabled any program to capture raw network packets. It was developed in order to make tcpdump more useful. For instance, it gave the ability to filter packets. Since then, a bunch of spin-off networking projects would emerge on the scene. In 1998, a GUI-based open source protocol analyzer named 'Ethereal' (later renamed Wireshark) was introduced, eventually becoming the gold standard in packet analysis that persists to this day. \


What unites 'tcpdump,' Wireshark, and numerous other popular networking tools is their ability to access a data source that is rich, accurate, and reliable, all collected in a nonintrusive manner: raw network packets. This fundamental concept will be central to our discussion moving forward.


### The evolution of Packet-Based Intrusion Detection Systems

Introspection tools, such as tcpdump and Wireshark, naturally emerged as the initial applications harnessing the capabilities of the BPF packet capture stack. However, as time progressed, innovative applications for packet data began to surface. Enter Snort, an open source, packet-based runtime security tool that shares common ground with Falco. Much like Falco, Snort operates as a rule engine, processing packets acquired from network traffic. Like its cloud-native counterpart, Snort boasts an extensive library of pre-configured rules designed to identify threats and unwarranted activities by scrutinizing packet content, protocols, and payload data. The success of Snort served as a catalyst for the development of similar tools, including Suricata and Zeek.

What truly empowers tools like Snort is their proficiency in assessing the security of networks and applications in real time, even as these applications run. This real-time focus proves invaluable by delivering immediate protection with a unique emphasis on runtime behavior, enabling the detection of threats rooted in vulnerabilities that may remain undisclosed.


### The issue with Network Packet Capture in the Cloud

The utilization of network packets as a foundational data source has spawned a thriving ecosystem. Nonetheless, several emerging trends have gradually eroded the viability of packets as an unequivocal source of information.

First, the task of comprehensively collecting packets has grown increasingly complex, especially within environments such as the cloud, where access to routers and network infrastructure is constrained. Second, the proliferation of encryption and network virtualization has posed formidable challenges in extracting valuable insights from network traffic. Lastly, the ascent of containerization and orchestrators like Kubernetes has rendered infrastructures more elastic while concurrently complicating the reliable collection of network data.

Once again, a dynamic new ecosystem was unfolding, yet the means to effectively troubleshoot and secure it remained elusive.


### System Calls are the New Network Packets

Before the emergence of Falco, an open source tool known as 'Sysdig Inspect' was crafted with a primary focus on the collection of packet data within cloud-native ecosystems. This was achieved through the capture of system calls, often referred to as syscalls, originating from the kernel of the operating system. 

Syscalls, as a data source, offer a richness that surpasses that of mere network packets. They encompass a wide spectrum of activities, extending beyond network data to encompass file I/O operations, command executions, interprocess communication, and more. Syscalls stand out as an ideal data source for cloud-native environments as they can be harnessed from the kernel, catering to both containerized environments and cloud instances. Moreover, the process of collecting syscalls is characterized by its simplicity, efficiency, and non-invasiveness.

The architecture of Sysdig comprised a kernel capture probe, making use of either the default, loadable kernel module or leveraging eBPF. To facilitate the development of capture programs, Sysdig offered a suite of libraries, enabling seamless integration with modern cloud-native technologies such as Kubernetes and various orchestrators. This versatility addressed the shortcomings observed in environments where traditional solutions like Snort and Wireshark fell short. Additionally, Sysdig provided a command-line tool replete with decoding and filtering functionalities, tailored to accommodate the prevalent network packet workflows essential in cloud environments, where the ease of filtering and scriptability of trace files is paramount.


### Falco - the evolution of Wireshark to the Cloud

Drawing from our comprehension of how Snort introduced a rule-based engine for scrutinizing network traffic to identify suspicious activity, an evolution that implemented Wireshark's network introspection, and how Sysdig expanded the scope of visibility within cloud-native environments by delving into system calls, effectively departing from sole reliance on Wireshark's libpcap framework. It logically followed that an Intrusion Detection System (IDS) solution would emerge, featuring a sophisticated rule-based engine tailored for cloud-native workloads while harnessing the capabilities of eBPF and the kernel's system call architecture.

Falco's rule engine drew inspiration from Snort's design but operated within a far more expansive and versatile dataset, seamlessly integrated with the Sysdig libraries. While its default ruleset may be more concise than Snort's, Falco empowers users to craft intricate rules that trigger in real-time based on arbitrary contextual factors. These factors encompass a wide array of scenarios, including access to sensitive data, mode transitions, unexpected network connections, socket alterations, compliance breaches, and more. Given its capacity to monitor all activities on a server or node through system calls, Falco functions as a real-time intrusion detection tool, mirroring Wireshark's role in providing real-time network analysis for endpoints.


### Falco for Cloud Native Security

In the journey from the early days of BPF to the widespread adoption of Wireshark, we've witnessed the remarkable evolution of system introspection tools, each one contributing to the ever-expanding landscape of cybersecurity. However, as cloud-native computing and microservices architectures become the new norm, a new champion has emerged: Falco. Falco represents the cutting edge of intrusion detection, specifically designed to tackle the intricacies and challenges posed by cloud-native hosts and workloads. With its real-time behavioral monitoring, container awareness, and comprehensive rule sets, Falco stands as a testament to the adaptability and innovation in the world of cybersecurity. As the digital landscape continues to evolve, Falco is the tool of choice for those who prioritize the security and integrity of their cloud-native environments. It's not just a system introspection tool; it's the future of protecting what matters most in this rapidly changing world of technology.

If you want to try out Falco, check out our [Getting Started](https://falco.org/docs/getting-started/) documentation. Join our community at [#falco channel within Kubernetes Slack](https://communityinviter.com/apps/kubernetes/community).
