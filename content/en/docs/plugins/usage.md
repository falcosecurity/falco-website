---
title: How Falco Uses Plugins
linktitle: Plugins Usage
description: Plugins for Falco libraries/Falco daemon
weight: 20
---

Falco loads plugins based on configuration in [`falco.yaml`](https://github.com/falcosecurity/falco/blob/master/falco.yaml). Currently, if a plugin with event sourcing capability is loaded then the *only* events processed are from that plugin; syscall events are disabled. There are other restrictions on loaded plugins (see below).

## Loading plugins in Falco

The new `plugins` property in `falco.yaml` will define the set of plugins that Falco can load, and a new `load_plugins` property will control which plugins are actually loaded when Falco starts.

Here's an example:

```yaml
plugins:
  - name: cloudtrail
    library_path: libcloudtrail.so
    init_config: ""
    open_params: ""
  - name: json
    library_path: libjson.so
    init_config: ""

# Optional
load_plugins: [cloudtrail, json]
```

{{% alert color="primary" %}}
For more information, see [Falco Config Options](/docs/reference/daemon/config-options).
{{% /alert %}}

The mechanics of loading a plugin are implemented in the libraries and leverage the dynamic library functionality of the operating system (dlopen/dlsym in unix, LoadLibrary/GetProcAddress in Windows). The plugin loading code also ensures that:

- The plugin is valid, i.e. that it exports the set of expected symbols
- The plugin has an API version number that is compatible with the plugin framework.
- That only one plugin with event sourcing capability is loaded at a time for a given event source
- If a mix of plugins for both event sourcing and field extraction are loaded for a given event source, that the exported fields have unique names that don't overlap across plugins

## Event Sources and Falco Rules

Falco rules already have the notion of a *source*, using the `source` property in YAML rules objects. There is primarily one kind of event source: `syscall`. The `source` property in Falco rules maps a given rule to the event source on which the rule runs.

For example, given a plugin providing events with source `aws_cloudtrail`, and a Falco rule with `source` property `aws_cloudtrail`, the rule will be evaluated for any events returned by the AWS CloudTrail plugin.

Similarly, a plugin with field extraction capability that includes `aws_cloudtrail` in its set of event sources will have the opportunity to extract information from CloudTrail events. As a result, fields exported by the plugin can be put in a rule's condition, exception, or output properties when the rule has a source `aws_cloudtrail`.

Falco compiles rules/macros/lists selectively based on the set of loaded plugins (specifically, their event sources), instead of unconditionally as Falco is started. This is especially important for macros, which do not contain a `source` property, but might contain fields that are only implemented by a given plugin.

## Plugin Versions and Falco Rules

To allow rules files to document the plugin versions they are compatible with, rules files can have a new top-level field `required_plugin_versions`. The field is optional, and if not provided no plugin compatibility checks will be performed. The syntax of `required_plugin_versions` is the following:

```yaml
- required_plugin_versions:
  - name: <plugin_name>
    version: x.y.z
  ...
```

Below required_plugin_versions is a list of objects, where each object has `name` and `version` properties. If a plugin is loaded, and if an entry in `required_plugin_versions` has a matching name, then the loaded plugin version must be semver compatible with the version property.

Falco can load multiple rules files, and each file may contain its own `required_plugin_versions` property. In this case, name+version pairs across all files will be merged, and in the case of duplicate names all provided versions must be compatible.

## Plugin Developer's Guide

If you are interested in authoring your own plugin, or modifying an existing plugin to add new functionality, we've written a [developer's guide](/docs/plugins/developers-guide) that documents the full plugin APIs and walks through two existing plugins to show how the API is used.
