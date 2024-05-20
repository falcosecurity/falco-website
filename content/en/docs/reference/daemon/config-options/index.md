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

Any configuration option can be overridden on the command line via the `-o/--option key=value` flag.
For `key: [value list]` options, you can specify individual list items using `--option key.subkey=value`.

If a configuration entry (e.g. `key.subkey`) is a list you can override a specific entry by index, e.g.: `--option key.subkey[0]=value`.
Since Falco 0.38.0 you can also append new elements to a list by adding `--option key.subkey[]=value` and/or `--option key.subkey[].newitem=value`.

Since Falco 0.38.0 you can also load additional configuration files after the main one with the `config_files` configuration entry, which can accept both files and directories. By default this option contains the `/etc/falco/config.d` directory.

The full list of configuration items is documented in the file itself that you can find in your Falco distribution or in the [Falco repository](https://github.com/falcosecurity/falco/blob/{{< latest >}}/falco.yaml).
