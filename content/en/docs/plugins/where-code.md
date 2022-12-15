---
title: Where's the Code
linktitle: Where's the Code
description: Find out about the included plugins in Falco and the Plugins SDK
weight: 30
---

## Plugins

Plugins hosted and maintained by the Falcosecurity community are at the [plugins GitHub repository](https://github.com/falcosecurity/plugins). There, you can also find the [plugin registry](https://github.com/falcosecurity/plugins/blob/master/registry.yaml) containing info about all the plugins officially recognized by the Falcosecurity organization, which include both the ones hosted by the community and the external ones.

### Included with Falco 

Falco itself includes the `k8saudit`, `cloudtrail` and `json` plugins in its packages and container images. The plugins are defined in `falco.yaml` but by default, no plugins are loaded when Falco starts.

To add plugins, you can put them as shared libraries below `/usr/share/falco/plugins`, and use a relative path in the value for `library_path` in falco.yaml.

## Plugins SDKs

To facilitate the development of plugins written in Go, we've written a [SDK](https://github.com/falcosecurity/plugin-sdk-go) that provides support code for writing plugins. The SDK provides Go structs/enums corresponding to the C structs/enums used by the API, has utility packages that manage the details of memory management/type conversion, and presents abstract interfaces that provide a more streamlined interface to potential plugin authors. We go through the details and the architecture of the GO SDK in the [Go SDK walkthrough section](/docs/plugins/go-sdk-walkthrough).

There is also an experimental [C++](https://github.com/falcosecurity/plugins/tree/master/sdk/cpp) SDK that defines abstract C++ base classes for plugins. Plugin authors can derive from these base classes and implement the abstract methods to provide demographic information, events, and extract fields from events. This SDK is currently in line with the most recent changes in the plugin API, and will be subject to many updates in the near future.

All of the Falcosecurity-provided plugins use these SDKs.

