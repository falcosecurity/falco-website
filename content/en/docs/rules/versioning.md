---
title: Rule Format Version
description: Understand how Falco Rules support explicit versioning
linktitle: Rules Versioning
weight: 200
---

From time to time, we make changes to the rules file format that are not backwards-compatible with older versions of Falco. Similarly, libsinsp and libscap may define new filtercheck fields, operators, etc. We want to denote that a given set of rules depends on the fields/operators from those libraries.

There are currently two optional fields in the falco rules file related to versioning:

Element | Description
:-------|:-----------
`required_engine_version` | Used to track compatibility between rules content and the falco [engine version](/docs/rules/versioning/#falco-engine-versioning).
`required_plugin_versions` | Used to track compatibility between rules content and [plugin versions](/docs/plugins#plugin-versions-and-falco-rules).

### Falco Engine Versioning

The `falco` executable and the `falco_engine` C++ object now support returning a version number. The initial version is 2 (implying that prior versions were 1). We will increment this version whenever we make an incompatible change to the rules file format or add new [fields](/docs/reference/rules/supported-fields), [events](/docs/reference/rules/supported-events) or [syntax elements](/docs/rules/conditions/) to Falco. You can check the Falco engine version that your installation supports by running `falco --version`.

### Falco Rules File Versioning

The Falco rules files included with Falco include a new top-level object, `required_engine_version: N`, that specifies the minimum engine version required to read this rules file. If not included, no version check is performed when reading the rules file. Here's an example:

```yaml
# This rules file requires a falco with falco engine version 7.
- required_engine_version: 7
```

If a rules file has an `engine_version` greater than the Falco engine version, the rules file is loaded and an error is returned.

### Official Rules File Versioning

If you use the official rules distributed by the Falco organization, they are versioned in [the repository](https://github.com/falcosecurity/rules/releases) along with the relevant changelog.
