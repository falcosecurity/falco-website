---
title: Getting Started
description: Getting started with Falco
hide_section_index: true
weight: 10
---
 
Falco is a cloud-native security tool. It provides near real-time threat detection for cloud, container, and Kubernetes workloads by leveraging runtime insights. Falco can monitor events defined via customizable {{< glossary_tooltip text="rules" term_id="rules" >}} from various sources, including the Linux kernel, and enrich them with metadata from the Kubernetes API server, container runtime, and more. Falco supports a wide range of kernel versions, x86_64 and ARM64 architectures, and many different output channels.

## Try it now

Get started on your Linux host or Kubernetes cluster.

{{< link_wrapper href="falco-docker-quickstart" class="section-index">}}
{{< card class="card-sm shadow btn btn-light p-0">}}
<div class="text-left d-flex gap-4">
    <img class="align-self-center icon-4 icon-lg-5" src="/img/docker-logo.png" alt="Docker" loading="lazy">
    <div class="align-self-center">
        <div class="card-title mb-2">
            <h5>Try Falco with Docker</h5>
        </div>
        <span class="card-text text-black-50">Run Falco on your host with a Docker container</span>
    </div>
</div>
{{< /card >}}
{{< /link_wrapper >}}

{{< link_wrapper href="falco-kubernetes-quickstart" class="section-index mt-3">}}
{{< card class="card-sm shadow btn btn-light p-0">}}
<div class="text-left d-flex gap-4">
    <img class="align-self-center icon-4 icon-lg-5" src="/img/kubernetes-logo.png" alt="Kubernetes" loading="lazy">
    <div class="align-self-center">
        <div class="card-title mb-2">
            <h5>Try Falco on Kubernetes</h5>
        </div>
        <span class="card-text text-black-50">Install Falco and Falcosidekick on your Kubernetes cluster with Helm</span>
    </div>
</div>
{{< /card >}}
{{< /link_wrapper >}}

{{< link_wrapper href="falco-linux-quickstart" class="section-index mt-3">}}
{{< card class="card-sm shadow btn btn-light p-0">}}
<div class="text-left d-flex gap-4">
    <img class="align-self-center icon-4 icon-lg-5" src="/img/ubuntu.png" alt="Ubuntu" loading="lazy">
    <div class="align-self-center">
        <div class="card-title mb-2">
            <h5>Try Falco on Ubuntu</h5>
        </div>
        <span class="card-text text-black-50">Run Falco on your host or set up a Vagrant VM to try it</span>
    </div>
</div>
{{< /card >}}
{{< /link_wrapper >}}
