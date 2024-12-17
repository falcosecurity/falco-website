---
title: Plugins SDKs
linktitle: SDKs
description: Available Falco Plugins SDKs
weight: 15
---

## Plugins SDKs

To facilitate the development of plugins, The Falco Project provides SDKs for multiple programming languages: Go, C++, and Rust. These SDKs provide flexibility for developers to choose the programming language they are most comfortable with while ensuring a consistent and streamlined experience when building Falco plugins.

### C++ SDK  
The [C++ SDK](https://github.com/falcosecurity/plugin-sdk-cpp) provides abstract base classes for plugin development. Plugin authors can derive from these base classes and implement abstract methods to:  
- Supply plugin metadata and capabilities.  
- Provide events.  
- Extract fields from events.

### Go SDK  
We offer a [Go SDK](https://github.com/falcosecurity/plugin-sdk-go) that simplifies plugin development by providing support code and abstractions. This SDK includes:  
- Go structs and enums corresponding to the C structs and enums used by the plugin API.  
- Utility packages to handle memory management and type conversions.  
- Abstract interfaces that provide a streamlined and user-friendly way to implement plugins.  

For a detailed explanation of the architecture and usage of the Go SDK, refer to the [Go SDK walkthrough section](/docs/plugins/go-sdk-walkthrough).

### Rust SDK  
We recently introduced a [Rust SDK](https://github.com/falcosecurity/plugin-sdk-rs), enabling developers to write plugins in Rust. The Rust SDK offers a safe, idiomatic interface for interacting with the Falco plugin API while leveraging Rust’s strong type system and memory safety guarantees.  