---
title: Falco Configuration Options
linktitle: Config Options
description: Configuration for the Falco daemon
weight: 40
notoc: true
no_edit: true
aliases:
  - ../../configuration
categories:
  - Installation
  - Deployment
  - Configuration
tags:
  - Falco Daemon
  - falco.yaml
  - rules files
---

Falco's configuration file is a YAML file containing a collection of `key: value` or `key: [value list]` pairs. Depending on your installation type the configuration file could be located in `/etc/falco/falco.yaml` or loaded as a configmap in Kubernetes deployments.

The full list of configuration items is documented in the file itself that you can find in your Falco distribution or in the [Falco repository](https://github.com/falcosecurity/falco/blob/{{< latest >}}/falco.yaml).

Any configuration option can be overridden on the command line via the `-o/--option key=value` flag.
For `key: [value list]` options, you can specify individual list items using `--option key.subkey=value`.

If a configuration entry (e.g. `key.subkey`) is a list you can override a specific entry by index, e.g.: `--option key.subkey[0]=value`.
Since Falco 0.38.0 you can also append new elements to a list by adding `--option key.subkey[]=value` and/or `--option key.subkey[].newitem=value`.

## `config_files`

Since Falco 0.38.0 you can also load additional configuration files after the main one with the `config_files` configuration entry, which can accept both files and directories. By default this option contains the `/etc/falco/config.d` directory.

### Merge strategy

Since Falco 0.41.0, it is possible to specify a merge strategy for each entry provided in the `config_files` option. The loading of these files is assumed to happen after the main config file has been processed and then in the order they are specified. If a folder is specified, the files within that path are loaded in lexicographical order, and the merge strategy is applied for all files within that path. There are three merge strategies available, with `append` being the default merge strategy.

- `append`

  - Existing sequence keys will be appended
  - Existing scalar keys will be overridden
  - Non-existing keys will be added

- `override`

  - Existing keys will be overridden
  - Non-existing keys will be added

- `add-only`

  - Existing keys will be ignored
  - Non-existing keys will be added

To utilize these merge strategies in the `config_files` option, add the strategy alongside the path:

```yaml
config_files:
  - /etc/falco/config.d
  - path: /etc/falco/config.append.d/
    strategy: append
  - path: /etc/falco/extra_config.yaml
    strategy: add-only
```
