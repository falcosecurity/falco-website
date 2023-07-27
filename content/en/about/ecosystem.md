---
title: Falco Ecosystem
---

{{< blocks/content wrap="col-12 col-lg-9" >}}
  ## Falco ecosystem
  
  Falco’s rich ecosystem of plugins and integrations with the cloud native stack will help you enhance your organization’s security posture. This page showcases plugins and integrations, as well as success stories from end users, and vendors whose products build on Falco.
{{< /blocks/content >}}

{{< blocks/content wrap="col" content="html" >}}
  {{< blocks/tabs name="integrations" >}}

  {{< tab name="Integrations" >}}
  <p class="mt-4 mb-5">You can connect Falco with your ecosystem by forwarding the events as output to 50+ targets with <a href="/docs/alerts/forwarding/">Falcosidekick</a>.</p>
  
  {{< blocks/grid layout="lg-4 md-3 sm-2 2" gap=4 class="gallery-vendor" >}}
  {{< docs/vendors_gallery_items integrations />}}
    <div class="d-flex flex-column align-items-center">
      <a class="icon-button shadow" href="https://github.com/falcosecurity/falcosidekick#outputs">
        <img src="/img/icons/box-arrow-up-right.svg" alt="box-arrow-up-right"/>
      </a>
      <span class="font-weight-bold mt-2">More outputs...</span>
    </div>
  {{< /blocks/grid >}}

  <div class="col-12 col-sm-8 col-md-6 col-lg-4 offset-sm-2 offset-md-3 offset-lg-4 mt-5 mb-3 mb-md-0">
    <a class="btn btn-lg btn-primary btn-block" href="https://github.com/falcosecurity/falcosidekick/issues/new?assignees=&labels=kind%2Ffeature&template=feature_request.md&title=" role="button">Need a new integration?</a>
  </div>

  <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-md-5 mt-3">
  <div class="mr-md-4 mr-lg-5">
    <h3>gVisor</h3>
    <p>Falco can be used out of the box with gVisor sandboxes, more info 
    <a href="https://falco.org/blog/intro-gvisor-falco/">here</a>.</p>
  </div>
    <img src="/img/falco-gvisor.png" alt="falco-gvisor" loading="lazy" width="200"/>
  </div>

  <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-md-5 mt-3">
  <div class="mr-md-4 mr-lg-5">
    <h3>Helm</h3>
    <p>You can smoothly install Falco and its ecosystem components in your Kubernetes clusters with our official Helm charts, more info 
    <a href="https://github.com/falcosecurity/charts">here</a>.</p>
  </div>
    <img src="/img/helm.png" alt="helm" loading="lazy" width="120"/>
  </div>

  {{< /tab >}}

  {{< tab name="Plugins" >}}
  <p class="mt-4 mb-5">Falco’s capabilities to ingest and analyze events can be extended with Plugins. They are shared libraries that allow you to add new streams of events as inputs to Falco and to enrich your events with more contextual information.</p>

  {{< blocks/grid layout="lg-4 md-3 sm-2 2" gap=4 class="gallery-vendor" >}}
  {{< docs/plugins_gallery_items plugins icon />}}
    <div class="d-flex flex-column align-items-center">
      <a class="icon-button shadow" href="https://github.com/falcosecurity/plugins#registered-plugins" aria-label="go to plugins#registered-plugins" >
        <img src="/img/icons/box-arrow-up-right.svg" alt="box-arrow-up-right" />
      </a>
      <span class="font-weight-bold mt-2">More plugins...</span>
    </div>
  {{< /blocks/grid >}}
  
  <div class="col-12 col-sm-8 col-md-6 col-lg-4 offset-sm-2 offset-md-3 offset-lg-4 mt-5 mb-3 mb-md-0">
    <a class="btn btn-lg btn-primary btn-block" href="https://github.com/falcosecurity/plugin-sdk-go" role="button">Build your own plugin</a>
  </div>
  {{< /tab >}}

  {{< /blocks/tabs >}}


  {{< blocks/tabs name="vendors" class="mt-5" >}}

  {{< tab name="End-users" >}}
    <p class="mt-4 mb-5">Falco elevates threat detection in companies and organizations around the world.</p>
  
  <h3 class="mt-5">Falco is used by</h3>
  
  {{< blocks/grid layout="lg-4 md-3 sm-2 2" gap=4 class="gallery-vendor" >}}
  {{< docs/vendors_gallery_items endusers />}}
  {{< /blocks/grid >}}
  {{< slider >}}
  
  {{< /tab >}}

  {{< tab name="Vendors" >}}
  <p class="mt-4 mb-5">Many vendors use Falco as part of their product to offer fully managed security services.</p>

  {{< blocks/grid layout="lg-4 md-3 sm-2 2" gap=4 class="gallery-vendor" >}}
    {{< docs/vendors_gallery_items vendors />}}
  {{< /blocks/grid >}}

  <div class="col-12 col-sm-8 col-md-6 col-lg-4 offset-sm-2 offset-md-3 offset-lg-4 mt-5 mb-3 mb-md-0">
    <a class="btn btn-lg btn-primary btn-block" href="https://github.com/falcosecurity/falco-website/blob/master/ADD_ECOSYSTEM_LOGO.md" role="button">Add your logo</a>
  </div>

  {{< /tab >}}

  {{< /blocks/tabs >}}
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
  <h3 class="mb-3">Falco FAQs</h3>
  
  {{< faq take=9 skip=11 >}}

  <div class="text-center mt-5">
    <a href="/about/faq/" class="text-center btn btn-primary btn-lg">Go to all FAQs</a>
  </div>
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col">}}
{{< feedback >}}
{{< /blocks/content >}}

{{< blocks/content content="html" wrap="col" >}}
{{< footer_nav 
  prev="/about/use-cases"
  prevTitle="Falco use cases"
  next="/about/faq" 
  nextTitle="Frequently Asked Questions" 
>}}
{{< /blocks/content >}}
