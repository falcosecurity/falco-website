---
title: Try Falco
description: Learn how to install Falco on various platforms
hide_section_index: true
weight: 1
---
We know trying a new tool is always challenging. For that, the Falco Project includes some tutorials that will ease the road to discovering all that Falco can do for you.

{{< blocks/collapse title="Check the requirements" id="check-the-requirements" class="pb-5">}}
{{< pageinfo color="secondary" >}}
Depending on the tutorial you choose you might need either a Virtual Machine (you can your use your own machine, but we prefer to keep everything clear) or a Kubernetes cluster (Minikube would be enough, but using a multi-node Kubernetes cluster will definitely give you a better taste of it).

If you don’t know how or don’t have the time to set up a proper environment, we have prepared some scenarios on Killercoda, the de-facto successor of the famous Katacoda.
{{< /pageinfo >}}
{{< /blocks/collapse >}}

#### Choose your next tutorial

{{< link_wrapper href="ubuntu-tutorial" class="section-index">}}
{{< card class="card-sm shadow btn btn-light p-0">}}
<div class="text-left d-flex gap-4">
    <img class="align-self-center icon-4 icon-lg-5" src="/img/ubuntu.png" alt="Ubuntu" loading="lazy">
    <div class="align-self-center">
        <div class="card-title mb-2">
            <h5>Try Falco on Ubuntu</h5>
        </div>
        <span class="card-text text-black-50">Learn how to install Falco on Ubuntu</span>
    </div>
</div>
{{< /card >}}
{{< /link_wrapper >}}

{{< link_wrapper href="ubuntu-falcosidekick-tutorial" class="section-index mt-3">}}
{{< card class="card-sm shadow btn btn-light p-0">}}
<div class="text-left d-flex gap-4">
    <img class="align-self-center icon-4 icon-lg-5" src="/img/ubuntu.png" alt="Ubuntu" loading="lazy">
    <div class="align-self-center">
        <div class="card-title mb-2">
            <h5>Try Falco and Falcosidekick on Ubuntu</h5>
        </div>
        <span class="card-text text-black-50">Learn how to install Falco and Falcosidekick on Ubuntu</span>
    </div>
</div>
{{< /card >}}
{{< /link_wrapper >}}

{{< link_wrapper href="kubernetes-tutorial" class="section-index mt-3">}}
{{< card class="card-sm shadow btn btn-light p-0">}}
<div class="text-left d-flex gap-4">
    <img class="align-self-center icon-4 icon-lg-5" src="/img/kubernetes-logo.png" alt="Ubuntu" loading="lazy">
    <div class="align-self-center">
        <div class="card-title mb-2">
            <h5>Try Falco on Kubernetes</h5>
        </div>
        <span class="card-text text-black-50">Learn how to install Falco on Kubernetes</span>
    </div>
</div>
{{< /card >}}
{{< /link_wrapper >}}

{{< link_wrapper href="kubernetes-falcosidekick-tutorial" class="section-index mt-3 pb-5">}}
{{< card class="card-sm shadow btn btn-light p-0">}}
<div class="text-left d-flex gap-4">
    <img class="align-self-center icon-4 icon-lg-5" src="/img/kubernetes-logo.png" alt="Ubuntu" loading="lazy">
    <div class="align-self-center">
        <div class="card-title mb-2">
            <h5>Try Falco and Falcosidekick on Kubernetes</h5>
        </div>
        <span class="card-text text-black-50">Learn how to install Falco and Falcosidekick on Kubernetes</span>
    </div>
</div>
{{< /card >}}
{{< /link_wrapper >}}

#### Next steps
Do you want to continue learning about Falco? Here is a list of resources to read:

{{< blocks/grid layout="md-3 1" gap="3" class="pt-4" >}}
{{< card class="card-sm bg-light">}}
<div class="d-flex flex-column align-items-start h-100">
    <p class="flex-grow-1">If you are convinced, and want to learn more check our documentation</p>
    <a class="btn btn-link btn-lg p-0" href="/docs" role="button">Learn</a>
</div>
{{< /card >}}

{{< card class="card-sm bg-light">}}
<div class="d-flex flex-column align-items-start h-100">
    <p class="flex-grow-1">Here is how to get started with Falco</p>
    <a class="btn btn-link btn-lg p-0" href="/docs/getting-started/" role="button">Learn</a>
</div>
{{< /card >}}

{{< card class="card-sm bg-light">}}
<div class="d-flex flex-column align-items-start h-100">
    <p class="flex-grow-1">The most common use cases for Falco</p>
    <a class="btn btn-link btn-lg p-0" href="/about/use-cases/" role="button">Learn</a>
</div>
{{< /card >}}
{{< /blocks/grid >}}