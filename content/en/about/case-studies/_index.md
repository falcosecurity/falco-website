---
title: Case Studies
---

<!-- Testimonials -->

{{< blocks/content wrap="col" content="html" >}}

  {{< slider >}}

{{< /blocks/content >}}

<!-- End-users & Vendors -->

{{< blocks/content wrap="col" content="html" >}}

  {{< blocks/tabs name="vendors" class="mt-5" >}}

  <!-- End-users -->

    {{< tab name="End-users" >}}

      <p class="mt-4 mb-5">Falco elevates threat detection in companies and organizations around the world.</p>

      <h3 class="mt-5">Falco is used by</h3>

      {{< blocks/grid layout="lg-4 md-3 sm-2 2" gap=4 class="gallery-vendor" >}}

        {{< docs/vendors_gallery_items endusers />}}

      {{< /blocks/grid >}}

    {{< /tab >}}

  <!-- Vendors -->

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
