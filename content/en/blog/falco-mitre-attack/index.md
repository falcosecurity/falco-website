---
title: Crafting Falco Rules With MITRE ATT&CK
linktitle: Crafting Falco Rules With MITRE ATT&CK
description: Learn how to align Falco rules with MITRE ATT&CK Framework
date: 2023-07-16
author: Anshu Bansal, Ashutosh Venkatrao More
slug: falco-mitre-attack
images:
  - /blog/falco-mitre-attack/images/falco-mitre-attack-featured.png
tags: ["Falco", "Falco Rules", "MITRE ATT&CK"] 
---

## Introduction:

The landscape of cybersecurity attacks has witnessed a notable rise in sophistication and complexity over the last decade, posing significant challenges to organizations in their efforts to identify and counter such threats effectively. It was within this context that the [MITRE ATT&CK®](https://attack.mitre.org/) Framework emerged as a valuable resource for security practitioners. In this blog, we will explore the benefits of using ATT&CK as a baseline to comprehensively understand threats, and Falco to detect and respond to these threats.

The ATT&CK Framework serves as an extensive repository of documented tactics, techniques, and procedures (TTPs) commonly employed by cyber adversaries. By gaining a comprehensive understanding of these TTPs, organizations can enhance their defensive capabilities and fortify their cybersecurity posture.

Falco is a valuable open-source tool that provides runtime security for containers, virtual machines, and standalone Linux hosts. Organizations use Falco to monitor, detect, identify, and respond to suspicious activity. Falco detects suspicious activities and alerts security teams in real-time based on static rules provided in the rules file.

Whether you are a security analyst, a DevOps engineer, or an avid container enthusiast, this blog offers invaluable insights on utilizing MITRE ATT&CK-focused Falco rules to bolster your environment against advanced adversarial attacks.

## Step 1: Gather Necessary Details

### Consider the attacker’s perspective

To create a rule that identifies a specific ATT&CK technique, you need to get inside the mind of the attacker. Imagine watching an attacker and thinking about how they might try to harm or take advantage of a victim’s environment. There are an endless number of things to consider, such as: changes to important files or folders; collection of user and network information; and the creation and upload of malicious scripts. Conducting an in-depth assessment of MITRE’s ATT&CK TTPs will provide you with enough information to understand an attacker’s perspective.

### Know where to look

In order to detect malicious activities using static rules, Falco relies heavily on system events (syscalls) generated within the user’s environment. To effectively capture these system behaviors, we must carefully consider the relevant system calls that occur during an attack. If network activity is involved, we must  pay attention to the corresponding network traffic and alert on known malicious IP addresses. Additionally, we need to capture the events that occur for files and directories during an attack. Armed with this knowledge, we can proceed to write rules that capture malicious activities as they unfold, ultimately triggering relevant events for further analysis and response.

### Bring in Falco

Falco uses a rule-based system to monitor application and container behavior in real-time. With predefined rules, Falco detects security threats like privilege escalation, file system manipulation, abnormal process execution, and many more. It continuously compares system activities against these rules, and either generates alerts or takes action when a match occurs. Since Falco is open-source, its flexibility allows customization of rules to fit an organization’s specific security requirements. By integrating with container orchestration platforms, Falco collects data from various sources and applies the rules in real-time, enabling proactive threat detection and prevention for cloud-native applications.

It is important to note that Falco will not identify a type of attack or malware. Rather, its strength lies in efficiently detecting common malicious system behaviors. Falco acts as a notifier, bringing your attention to specific system activities that have occurred. Once alerted, it becomes your responsibility to investigate the activity and take the appropriate steps to mitigate and prevent further malicious activities.

## Step 2: Write the Falco Rule

Rule writing is an iterative process that typically begins with crafting a basic rule, as best you can, and gradually refining its conditions to be more specific. It entails continually incorporating exceptions into the rule to prevent false positives, ensuring that events are not erroneously flagged as malicious. This process evolves over time as we identify activities related to an attack and incorporate them into the rule. Exceptions are crucial as they allow for the inclusion of benign activities that may be associated with malicious behavior. Avoiding false positives is vital, as it reduces noise by ensuring a rule does not incorrectly flag benign system changes or events as malicious activities.

### Identify the MITRE technique

Building upon our theoretical understanding of rule creation, we will now focus on the specific MITRE ATT&CK technique of Inhibit System Service and develop a Falco rule that can effectively identify this technique.

This technique is related to the recovery service of a system. Every system provides recovery services which are used in case of system failure. To make the system inaccessible an adversary may damage the system in such a way that the system becomes inaccessible to the user.

However, operating systems, including Linux, provide built-in mechanisms to assist administrators in recovering from such situations. These mechanisms include features like backup catalogs, volume shadow copies, and automatic repair functionalities. These tools help administrators restore the system to a functional state by reverting to previous configurations or repairing damaged components.

To impede system recovery efforts, attackers may specifically target and disable these built-in mechanisms. They can employ various native Linux utilities to accomplish this task. For instance, they might use commands like "rm" and "systemctl" to delete important system files, or employ tools like "dd" to overwrite the hard drive with random data. By doing so, they hinder the ability of system administrators to leverage these recovery mechanisms effectively.

### Understand the technical details

The following points provide an overview of the recovery features present in operating systems and the adversarial strategies employed to compromise them:

1. Recovery feature for creating archives of data.
These recovery features are given to store data on our system in the compressed form so that it can be used when it's needed by uncompressing it. Following are the tools which help us achieve this activity.  
    - `tar:` create a backup of the `/home` directory: `tar -czvf home_backup.tar.gz /home`
    - `rsync:` synchronize files and directories: `rsync -av /src /dest`
    - `dd:` create a disk image backup: `dd if=/dev/sda of=/mnt/backup.img`
Adversary actions to make the data inaccessible to users. Now, an adversary may try to completely remove these archives by making all the data inaccessible.
    - `Delete` backup files: `rm /path/to/backupfile.tar.gz`
    - `Overwrite` backup data: `dd if=/dev/zero of=/path/to/backupfile.img`

2. Recovery feature for creating snapshots of file systems.
Creating snapshots of a filesystem is a common practice in data management and backup strategies. Snapshots are essentially point-in-time copies or representations of a filesystem, capturing its state at a specific moment. Following are some snapshot creation techniques.
    - `Btrfs:` create a snapshot of the `/` filesystem: `btrfs subvolume snapshot / /snapshot`
    - `ZFS:` create a snapshot of a dataset: `zfs snapshot pool/dataset@snapshot`
Adversary actions to make file system broken:
To remove the backup of filesystem an adversary might do following activities. In which it contains deleting the snapshots , modifying the snapshots to make it unusable.
    - `Delete` snapshots: `btrfs subvolume delete /path/to/snapshot`
    - `Modify` snapshots: `vi /path/to/snapshot`
3. Boot Loader settings for banning of disabling recovery features
The ability to ban or disable recovery features. The reason such settings exist is to provide system administrators or advanced users with the ability to control and secure the boot process according to their specific requirements. 
    - `GRUB:` modify the `/etc/default/grub` file to disable recovery mode
    - `GRUB_DISABLE_RECOVERY=true`
Adversary actions to try disabling all recovery features by modifying GRUB menu. An adversary may try to edit the grub configuration such that it disables the banning of certain recovery features.
    - Modify GRUB configuration: `vi /etc/default/grub`
4. Systemd services for system recovery
In a Linux system, systemd is a widely used init system and service manager that plays a crucial role in managing the overall system and its services. It includes various features and components to ensure system recovery and maintain system availability. Here are the few recovery services present in the linux operating system.
    - Enter rescue mode: add `systemd.unit=rescue.target` to the end of the linux line in the GRUB configuration file
    - Switch to a different root filesystem: use the `systemd-nspawn` command
Also, there are other important services like: 
    - `recovery-mode.service`
    - `emergency.service`
    - `rescue.service`
    - `apport.serviceAA`
Adversaries will try to disable the above system recovery services.

Considering all these technical aspects and system changes that occur in a system when an adversary tries to inhibit system recovery, we can write a falco rule to identify these system events.

### Follow Falco guidelines

The [official Falco documentation](https://falco.org/docs/reference/rules/) provides all the rule fields, priorities, event, filenames, directory names, and covered syscalls that can be used in falco.

1. Decide on a `Rule Name`:
We need to first decide name of our rule, since we wrote a rule specific to an ATT&CK technique, let’s keep it similar:
    - `rule`: Disable recovery features.
2. Write a `description`:
Define what is the purpose and intention for the rule that you intend to trigger. In our case, this can point to the definition of the ATT&CK technique we are capturing.
    - `desc`: Detects disabling system recovery features by deleting or disabling services and  commands.
3. Define a `Conditional Set`:
To trigger an event, we need to define conditions that encompass various system activities such as relevant system calls, file or directory modifications, involved commands, spawned process names, and connections to prohibited IP addresses. These technical details should come from the attack analysis done prior to rule writing.

It is essential to adhere to the specified Falco format while crafting these conditions. Additionally, we must include exceptions to prevent false positives. Now, let us proceed to outline some fundamental conditions that will activate the desired event.
    - `condition: >`
            (spawned_process and proc.name = "rm" and proc.args contains "-rf") or
            (spawned_process and proc.name = "chattr" and proc.args contains "+i") or
            (spawned_process and proc.name = "mkfs.ext4" and proc.args contains "-E nodiscard") or
            (spawned_process and proc.name = "mount" and proc.args contains "remount,ro") or
            (spawned_process and proc.name = "systemctl" and proc.args contains "disable systemd-backlight@.service") or 
            (spawned_process and proc.name = "systemctl" and proc.args contains "disable apport.service") or
            (spawned_process and proc.name = "systemctl" and proc.args contains "disable rescue.service") or
            (spawned_process and proc.name = "systemctl" and proc.args contains "disable emergency.service") or
            (spawned_process and proc.name = "systemctl" and proc.args contains "disable recovery-mode.service")

In order to accommodate system administrators with the appropriate privileges to perform different tasks, such as the root user, we can introduce an exception in our conditions `(e.g., user.name != "root")`.

Likewise, we can incorporate exceptions for specific processes that engage in these activities for legitimate reasons. These exceptions help fine-tune our conditions and reduce the occurrence of false positives.
4. Create an `enabled` field:
This way you can optionally disable the rule as per your requirements.
If this field is not set, the rule is automatically enabled by default.
    - `enabled`: true/false
5. Write an `output` field:
 This is the text that Falco sends you when alerting on a suspicious activity. Here we can use all fields that can be used in rule conditions to give output in a more descriptive way like process name, username, container name or id etc. 
    - `output`: "Disabling recovery features so that system becomes non recoverable in case of failure."
6. Specify a `priority`:
The Falco team explains the concept of priorities within rules on their [official documentation](https://falco.org/docs/rules/basic-elements/#priority). 
It is important to clarify that the event is not triggered based on its assigned priority.

Rather, the event is triggered by specifying the priority level of a rule, which indicates the urgency in addressing it. Considering the paramount importance of this rule, we will assign it the highest priority level, known as `CRITICAL`:
    - `priority`: CRITICAL
7. Add Appropriate `Tagging`:
In the final step, we will include tags for the rule. Tags serve as metadata providing additional information about the rules, although they are not mandatory fields.
    - `tags`:[mitre_impact, inhibit_system_recovery, T1490]
When we bring all these elements together, our rule takes the following form:
<br><a target="_blank" href="images/falco-mitre-attack-01.png">
  <img style="border: 2px solid #00b4c8" 
       alt="Consolidated rule"
       src="images/falco-mitre-attack-01.png">
  </img>
</a><br><br>

The team at Cloud Defense developed a Python Script that simulates an attack scenario by emulating system changes. ['Link To The Script'](https://github.com/CloudDefenseAI/falco_extended_rules/blob/master/scripts/test/inhibit_system_recovery.py). To observe the corresponding output in the falco logs, you can try incorporating this rule into your [falco_rules.local.yaml](https://falco.org/docs/rules/default-custom/#local-rules-file) file and running the script. 

It's important to note that certain system calls are not instantiated by default in falco, so you will need to execute falco with all syscalls instantiated to capture them. This can be achieved by running `falco -A`.

## Conclusion

To wrap up, we have delved into the pivotal role of Falco rules in securing our environments against ATT&CK-aligned attacks. By leveraging the synergies between the MITRE ATT&CK Framework and Falco's capabilities, we can greatly enhance our ability to detect and respond to potential threats.

Throughout this blog, we have learned how to closely examine a MITRE ATT&CK technique and write a corresponding Falco rule to aid us and other Falco users in identifying suspicious activities. Equipped with this knowledge, we can better recognize and mitigate potential security threats.

However, it is crucial to reiterate that this is an ongoing process and not a one-time solution. We have emphasized the significance of continuously refining our Falco rules to minimize false alarms and improve accuracy. By remaining vigilant and staying abreast of the latest attack vectors, we can proactively stay ahead of the curve and effectively protect our environments.

Ultimately, this blog has provided invaluable insights for security professionals and DevOps teams striving to bolster their defenses. By embracing the MITRE ATT&CK Framework and implementing targeted Falco rules, we can actively detect and respond to threats as they emerge, ensuring a robust shield against attackers.





