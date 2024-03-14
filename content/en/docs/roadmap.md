---
title: The Falco Roadmap
linktitle: Roadmap
description: The Project direction
weight: 110
---

The Falco maintainers team works daily to provide more features, robust security and stability and better user experience to all adopters.

The maintainer team frequently communicates and meets to decide the next important areas for the project. This page is updated to list the efforts that are currently ongoing.

## Road to Falco 1.0.0

Falco is on track to release its 1.0.0 version. While "one point oh" is just a number, it is a signal from the community that the project has reached a certain degree of stability and maturity. Following the [graduation](https://falco.org/blog/falco-graduation/) within the CNCF, this is the next logical step. Below we are listing the main topics we wish to address for this milestone.

### Falco Engine

- Provide standardized features adoption and depreciation policies, to make sure users understand when features can be considered stable and when they are being removed
- Make flagship features even more robust
- Streamlining `falco.yaml` structure
- CLI args consolidation and standardization
- Advanced metrics support

### Rules Syntax

- Address current language inconsistencies arising from our commitment to backward compatibility
- Introduce new constructs to address the most common user requests

### Drivers

- Make the modern eBPF probe the default driver

### Distribution

- Packages consolidation (by following Linux distro best practices)
- Publish signatures for drivers and all packages
- Make the Falco default image a "no-driver"/"distroless" image
- Complete supply chain security best practices efforts

### Documentation

- Better documentation around our feature adoption and deprecation policies
- Improve troubleshooting guide
    - Improved guide and messages about running Falco for the first time and upon kernel update
- Enhance guidance on operationalizing and responding to Falco alerts based on adopters' feedback
- Revamp and enhance documentation for non-Kubernetes use cases (i.e. Falco installed on a Linux host)

### Integrations

- Improve stability in the container runtime integration
- Provide deeper access from the Plugin Framework to the Falco stream of events to make Falco more modular and easier to extend
