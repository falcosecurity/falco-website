---
title: Configuration
description: Configuration for the Falco daemon
weight: 4
notoc: true
---

{{% pageinfo color="primary" %}}
This is for the Falco daemon configuration options.

Please visit [rules](../rules) or [alerts](../alerts) for those options.

{{% /pageinfo %}}


Falco's configuration file is a [YAML](http://www.yaml.org/start.html) file containing a collection of `key: value` or `key: [value list]` pairs.



Any configuration option can be overridden on the command line via the `-o/--option key=value` flag. For `key: [value list]` options, you can specify individual list items using `--option key.subkey=value`.

## Current configuration options


[comment]: <> (@kris-nova: This data is loaded from the YAML file in data/en/config.yaml)
{{< config >}}
