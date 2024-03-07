---
title: Incepto Medical Case Study
date: 2024-03-07
author: Alexandre Lemaresquier, Thomas Labarussias
slug: incepto-medical
---

{{< blocks/content content="html" wrap="col" color="light" >}}

<div>
    <img class="case-study-logo mb-4" alt="Trendyol Log" src="/img/case-studies/incepto-medical/incepto-medical.png">
</div>

<h1>Protect shared clusters for medical imaging</h1>

{{< /blocks/content >}}

{{< blocks/content wrap="col" >}}


[Incepto Medical](https://incepto-medical.com/en) provides on-demand medical imaging analysis to healthcare facilities. This analysis is based on AI technology manufactured or distributed by Incepto for mammography, X-ray, emergency, CT, MR and PET scanners. Incepto’s partners can also use shared clusters to host their own medical devices and AI models.

## A secure, multi-tenant medical imaging service

Incepto Medical specializes in providing medical images analysis using artificial intelligence. Their models enable hospitals, private institutions and doctors to rapidly detect and diagnose cancer and other pathologies. Incepto shared platform can also be used to host and run their partner’s image analysis models.

Their service processes sensitive medical data in a multi-tenant environment. For these reasons, privacy and security are of utmost importance. Falco has been a good fit for their needs.

## GPU-enabled Kubernetes deployments

Incepto deploys Kubernetes clusters in AWS in self-managed EC2 instances, having then full control over the infrastructure. The associated AWS services are managed via Terraform and the clusters are deployed using KOPS. The clusters consist of GPU-enabled Ubuntu instances. Each environment (dev/staging/prod) has its own cluster, and each cluster serves multiple customers. Tenant segmentation is carried out by namespace and by using Cillium CNI to manage the network.

Incepto’s API receives pseudonymized medical images from health institutions to comply with GDPR requirements.
Falco is deployed as a DaemonSet in each cluster, monitoring both syscalls and Kubernetes audit logs. Falcosidekick runs alongside Falco to forward alerts to Slack. The alerts are segmented by client/partner namespace.

## Empowering custom workloads securely

Incepto’s partners can submit their own container images to customize workloads and models. To provide this flexibility, they must ensure that customer workloads behave safely, and do not interfere with workloads from other tenants. For this reason, Falco runs on every node to alert of any policy violations at the OS level or in the Kubernetes environment by inspecting system calls and Kubernetes audit logs. Any drift that is detected in production is instantly reported.

Falco’s flexible rule engine allows Incepto team to continuously improve their detections by developing new custom Falco rules. They built a process to tune and promote Falco rules: Nothing goes into production without a staging period. The development and staging environments enable the testing of the new rules and ensure only relevant alerts will fire in production.
Incepto went beyond Kubernetes, and they also created a custom set of Falco rules to detect suspicious activity in their S3 buckets, such as data exfiltration or corruption.

## Choosing a security solution for Kubernetes

Incepto's DevSecOps team had previous experience with Falco, so it was a natural choice to adopt it.
Adopting Falco was not without its challenges. Incepto team hit issues related to compatibility between Falco’s drivers and the Linux kernel in their VMs, to detection noise related due to different versions of the Nvidia drivers, and forwarding Kubernetes audit logs to Falco. However, once Falco was operational, they were assured that any security event would be detected.

In the end, Falco’s holistic approach to securing workloads gives Incepto the assurance that their customers’ data and proprietary models are safe.
In the coming months, Incepto will be studying the feasibility of updating to the latest Falco version. Currently, they are using version 0.31 and the pre-plugin mechanism to ingest Kubernetes Audit logs.

{{< /blocks/content >}}
