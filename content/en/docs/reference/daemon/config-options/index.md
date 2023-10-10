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

Falco's configuration file is a YAML file containing a collection of `key: value` or `key: [value list]` pairs.

Any configuration option can be overridden on the command line via the `-o/--option key=value` flag. 
For `key: [value list]` options, you can specify individual list items using `--option key.subkey=value`.

{{< yaml_table_inline  
    header="Falco options"
    subheader="Apply either via falco.yaml or with the -o/--option argument."
    class="inline-config-options"
    contentPath="reference.daemon.config_options"
    columnTitles="Option Name,Option Type,Description"
    columnKeys="name,type,description"
>}}
