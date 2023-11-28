---
title: Using Falco to Create Custom Identity Detections
linktitle: Understanding Okta plugin for Falco
description: Learn how Falco plugin is used for Identity Threat Detection
date: 2023-11-28
author: Nigel Douglas
slug: falco-okta-identity
images:
  - /blog/falco-okta-identity/images/falco-okta-featured.png
tags: ["Falco", "Okta", "Plugin", "Identity"]
---

Identity Threat Detection & Response (ITDR) in the cloud is of paramount importance to limit access to sensitive data and maintain the integrity of cloud infrastructure. Leading cloud providers like AWS, Microsoft Azure, and Google Cloud have implemented robust Identity and Access Management (IAM) controls, as well as Multi-Factor Authentication (MFA) options, to ensure that users have the standardized access control limitations. 

However, as the saying goes, "Trust, but verify." Even with these layers of security, there's a growing concern about what happens when a rogue employee or an external adversary manages to compromise an identity provider. Recent months have witnessed a surge in attacks targeting popular identity providers like Okta, underscoring the critical need for timely and effective detection capabilities. In fact, ([Crowdstrike’s 2023 Threat Hunting](https://cybermagazine.com/articles/crowdstrike-report-reveals-increase-in-identity-attacks)) report had classified 62% of all interactive cyber intrusions as having involved some form of compromised identities.

Without proper detection, incidents such as the attacks on organizations like Caesars and MGM might go unnoticed until it's too late. Fortunately, open source Falco offers a [Dedicated plugin](https://github.com/falcosecurity/plugins/blob/master/plugins/okta/README.md) for the Okta identity platform, empowering security teams to respond swiftly and with the context required to take real action against potential threats.

In this blog post, we will delve into how Falco fulfills the requirements for ITDR capabilities. We'll illustrate the significance of Falco's adaptable rule logic and provide readers with a real-world example of crafting custom rules derived directly from Okta audit logs.

## Understanding the rule logic
The Falco Okta plugin comes with a set of valuable [default rules](https://github.com/falcosecurity/plugins/blob/master/plugins/okta/rules/okta_rules.yaml) for Okta logs, which are designed to assist you in enhancing the security of your Okta platform. 

A typical illustration of the importance of these rules lies in the process of initiating a password reset within the Okta platform. In practice, an insider threat might reset a password, opt not to inform the end-user about the reset, and potentially carry out an account takeover in this context. Whenever a specific action is executed through the Okta user interface, there is a straightforward method to access the associated activity logs on the web user interface

![](/images/okta1.png)


Nonetheless, this default perspective is not particularly suitable for our Falco rule since it's focused on a specific user making changes to another specific user account. The system log focus is on algorithmically-generated actor IDs linked to both the user initiating the password reset and the user whose account password has been reset. 

While this event information may serve a purpose if you only wish to trigger detection events between these specific accounts, in practical scenarios, a more comprehensive view encompassing all users is typically required.

![](/images/okta2.png)

For a more efficient approach, it's advisable to select the `User updated password in Okta` event behavior shown at the bottom of the screenshot above. This action will automatically narrow down the search view to display event information exclusively related to password updates in Okta. With this method, we can effectively set up alerts for all password update activities. 

Utilizing Falco, we can extract the precise event type value from the system log and incorporate it into a Falco rule.

![](/images/okta3.png)

Fortunately, this task has already been handled for us in the Okta plugin ruleset. It's worth noting that the value found in the system logs aligns with our specified Falco conditions, ensuring that we attain equivalent visibility within Falco as we do in the Okta UI. However, it's important to be aware that in extensive production environments, this rule can generate a significant amount of noise. If needed, you have the option to filter this activity specifically for password resets targeting the 'Admin' privileged group, as they are frequently the primary targets of cyberattacks.

```
- rule: User password reset by OKTA admin
  desc: Detect a password reset on a user done by OKTA Admin Account
  condition: okta.evt.type = "user.account.reset_password"
  output: "A user password has been reset by an OKTA Admin account (user=%okta.actor.name, ip=%okta.client.ip, target user=%okta.target.user.name)"
  priority: NOTICE
  source: okta
  tags: [okta]
```

Here is the output displayed in our Falcosidekick UI, presenting the context of the actor's name and the corresponding IP address responsible for the change. It could be advantageous to explore the possibility of incorporating additional `Output` fields to enhance incident response capabilities when addressing identity threats.


![](/images/okta4.png)

## Building a custom Falco rule
The next example extends beyond the scope of the default Falco rules. For instance, if an identity integration or application were to be disassociated from the user `Nigel Douglas`, it might be an attempt to compromise security measures within established workflows or systems - a good example of `Impair Defenses` technique in the MITRE ATT&CK matrix. 

Consequently, we will replicate this specific action and create a custom Falco rule to identify such behavior. As shown in the screenshot below, the admin user is seen removing the application assignment from the user Nigel.

![](/images/okta5.png)

![](/images/okta6.png)

After the application has been unassigned, we receive the updated event type data in Okta, much like our previous workflow. The Okta query that provides the results of the application removal is as follows:

```
eventType eq "application.user_membership.remove"
```

![](/images/okta7.png)

With this understanding, we can navigate to the [falco_rules.local.yaml](https://falco.org/docs/rules/default-custom/#the-configuration-file) file linked to our Falco installation, which serves as a local repository for our Falco rules. Having grasped the construction of the previous Falco rule, we will substitute `okta.evt.type` for the Okta attribute `eventType` and assign it the precise string identified in the screenshot above. In your case, the Falco rule should be structured as follows:

```
- rule: Remove app membership
  desc: Detect membership removal in OKTA
  condition: okta.evt.type = "application.user_membership.remove"
  output: "A user has removed the following app in OKTA (user=%okta.actor.name, ip=%okta.client.ip, target user=%okta.target.user.name)"
  priority: CRITICAL
  source: okta
  tags: [custom_rule, mitre_defense_evasion, T1562, impair_defenses]
```

To ensure the custom rule is applied, it is necessary to restart the Falco service. If you have deployed Falco and Falcosidekick via a Docker compose file, this can be achieved by simply executing a `stop` command to halt the containers, followed by the `up -d` command, which restarts the Docker containers with the same configurations specified in the docker-compose.yaml file. 


While Docker is not the only [deployment option](https://falco.org/docs/install-operate/deployment/) for Falco, it is undeniably a very convenient option for these types of test environments. The source of the docker-compose.yaml can be [accessed here](https://github.com/LucaGuerra/falcosidekick-ui-compose/blob/main/docker-compose.yaml) .

```
docker compose -f docker-compose.yaml stop
docker compose -f docker-compose.yaml up -d
```


![](/images/okta8.png)

In order to assist with incident response initiatives, you will now notice the custom tags linked to MITRE ATT&CK tactics and techniques in your alert output. This enhanced alert output facilitates incident responders in recognizing the specific issues related to this behavior, enabling them to potentially detect insider threats at the earliest stage. These custom tags are then integrated into the Falco rule for further context.

## Why Falco instead of a traditional logging solution?
While it's possible to forward all your Okta logs to a centralized Security Incident & Event Management (SIEM) system, certain limitations become apparent. One prominent concern pertains to storage, as a substantial number of events must be retained in a centralized backend database, requiring aggregation and indexing to produce security alerts. This can impose a significant operational burden on organizations since they are effectively storing a multitude of events, a significant portion of which may be extraneous, potentially resulting in substantial costs associated with ingestion charges.

![](https://github.com/falcosecurity/falco-website/tree/master/content/en//blog/falco-okta-identity/images/okta9.png)

Similarly, once the events are in the system, it becomes crucial to have a solid grasp of crafting effective detection rules. Instead of managing intricate scripts and queries to minimize false positives, Falco streamlines the process by offering a unified rules language applicable across host endpoints, cloud services, CI/CD services, and Okta logs. This approach enables swift rule development and immediate testing within your environment without incurring ingestion charges. Furthermore, Falco addresses the issue of centralized storage bloat through its intelligent streaming engine, which processes event context and makes decisions on whether to trigger alerts based on specific event metadata, rather than indiscriminately ingesting all associated events.


![](/images/okta9.png)
![](/images/okta10.png)

Finally, the entire process of manually executing Okta search queries in the web UI, or managing intricate detection scripts, can be time-consuming and often results in coverage gaps. Falco offers a solution by delivering a nearly real-time detection engine that enables the use of macros and lists for complex querying. For instance, consider the task of verifying whether the user `Nigel Douglas` is logging in from their usual IP address. Instead of navigating through complex Okta queries, you can simply use the actor ID, cross-referencing it with the typical IP they use for sign-ins, and also taking into account the context of their access, such as interactions with the `Admin Dashboard` or other elements within the Okta user interface. 

This is how Okta queries can be structured:

```
eventType eq "user.session.access_admin_app" and client.ip_address eq "78.xx.xxx.249" and target.id eq "00u9xcz5aphuQ8ZQq5d7" and outcome.result eq "SUCCESS"
```

Yet, if our aim is to identify successful login attempts from questionable geographic regions or IP addresses, we must integrate lists and diligently keep them up-to-date. 
This is where the following Falco rule proves its worth:


```
- rule: Suspicious Login for Nigel Douglas
  desc: Detect suspicious login attempts from known suspicious IPs
  condition: okta.evt.type = "user.session.access_admin_app" and okta.client.ip in (suspicious_ips) and okta.target.user.id= "00u9xcz5aphuQ8ZQq5d7"
  output: Suspicious IP Inbound Request
(okta.actor.name=%okta.actor.name, okta.client.ip=%okta.client.ip, okta.target.user.id=%okta.target.user.id, okta.target.user.name=%okta.target.user.name, okta.app=%okta.app, okta.evt.type=%okta.evt.type)
  priority: CRITICAL
  tags: [custom_rule, mitre_initial_access, T1078, valid_accounts]
  source: okta
```

Next, we create a list that compiles all potentially identified malicious actors who may attempt an account takeover on a legitimate account, which should typically be accessed from a consistent IP address. This list logic can be applied to geolocations, such as countries, instead of specific IPs. In both scenarios, the list is named `suspicious_ips` and is referred to in the Falco rule conditions as follows:

```
- list: suspicious_ips
  items: ["103.236.201.88", "104.244.74.23", "107.189.13.251", "118.163.74.160", "125.212.241.131", "176.58.100.98", "176.58.121.177", "179.43.128.16", "179.48.251.188", "180.150.226.99", "181.214.39.73", "185.10.16.41", "185.100.85.132", "185.100.85.22", "185.100.85.23", "185.100.85.25", "185.191.204.254", "185.195.71.10", "185.195.71.12", "185.195.71.4", "185.195.71.5", "185.195.71.6", "185.195.71.7", "185.195.71.8", "185.220.101.3", "185.82.219.109", "195.80.151.30", "198.58.107.53", "198.98.60.90", "199.249.230.100", "199.249.230.107", "199.249.230.109", "199.249.230.113", "199.249.230.117", "199.249.230.119", "199.249.230.121", "199.249.230.140", "199.249.230.157", "199.249.230.165", "199.249.230.180", "199.249.230.70", "199.249.230.71", "199.249.230.78", "199.249.230.85", "199.249.230.88", "199.249.230.89", "200.122.181.2", "204.194.29.4", "205.185.119.35"]
```
Finally, we get the detection that there was a login from a suspicious IP address. We changed the `Priority` to `CRITICAL` to reflect the severity of a suspicious login from a malicious IP.


![](/images/okta11.png)

This is just one instance demonstrating the capabilities of Falco. I encourage you, as the reader, to explore various innovative approaches for crafting customized detection rules that align with your unique zero-trust architecture strategy. Should you have recommendations on enhancing default detection rules in Falco for Okta identity logs, please don't hesitate to reach out to us directly. We are always open to discussions: [https://falco.org/community/](https://falco.org/community/) .

## Strengthening Identity Security with Falco: Next Steps
In a landscape where identity threats are on the rise, extending to identity providers themselves, as exemplified by the recent [Okta security breach](https://www.theregister.com/2023/11/02/okta_staff_personal_data/), organizations are compelled to enhance their identity management and cybersecurity preparedness. After reading this article, you should hopefully have a deeper appreciation for Falco and its user identity security approach.

Evaluating your existing runtime security can be a valuable starting point, particularly if you identify gaps in Okta log coverage, making Falco a worthwhile consideration. And this very plugin logic can be extended to AWS and Google Cloud Platform via their own response logging services - [AWS Cloudtrail](https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail) and [GCP Audit Logs](https://github.com/falcosecurity/plugins/tree/master/plugins/gcpaudit).

For those interested in delving deeper into recent identity-related attacks, you can explore the article on DarkReading, where we delve into how ITDR solutions can be employed to [detect Okta Cross-Tenant Impersonation Attacks](https://www.darkreading.com/cyberattacks-data-breaches/how-the-okta-cross-tenant-impersonation-attacks-succeeded) .

If you're interested in installing Falco on a test machine and integrating the Okta plugin, you can find helpful deployment script at Luca Guerra’s Github repo: [https://github.com/LucaGuerra/falcosidekick-ui-compose/blob/main/falco.yaml](https://github.com/LucaGuerra/falcosidekick-ui-compose/blob/main/falco.yaml) .

To configure the Okta plugin, you can easily uncomment the section below and input your Okta details as needed. If you're uncertain about how to obtain your Okta API token, you can refer to this resource for guidance: 
[https://developer.okta.com/docs/guides/create-an-api-token/main](https://developer.okta.com/docs/guides/create-an-api-token/main/)

```
  - name: okta
    library_path: libokta.so
    init_config:
      organization: xxxxx # as in https://xxxxx.okta.com
      api_token: yyyyy # your Okta API token
    open_params: ''
```

