---
title: Version
linktitle: Version
description: Protocol buffer schema definition of the Falco gRPC Version APIs
weight: 90
---

{{% pageinfo color=warning %}}

The gRPC Output as well as the embedded gRPC server have been deprecated in Falco `0.43.0` and will be removed in a
future release. Until removal and since Falco `0.43.0`, using any of them will result in a warning informing the user
about the deprecation. Users are encouraged to leverage another output and/or Falcosidekick, as the usage will result
in an error after the removal.

{{% /pageinfo %}}

{{< highlight protobuf >}}
{{< githubcode "falcosecurity/falco" "userspace/falco/version.proto" >}}
{{< /highlight >}}

{{< github_alert title="Warning" color="warning" >}}
There was an error retrieving the required information.<br>
However, you can still access [**this content on Github**](https://github.com/falcosecurity/falco/blob/master/userspace/falco/version.proto).
{{< /github_alert >}}
