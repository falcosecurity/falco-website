---
title: The Falco Configuration File
notoc: true
weight: 2
---

Falco's configuration file is a [YAML](http://www.yaml.org/start.html)
file containing a collection of `key: value` or `key: [value list]` pairs.

Any configuration option can be overridden on the command line via the `-o/--option key=value` flag. For `key: [value list]` options, you can specify individual list items using ``--option key.subkey=value``.

## Current configuration options

{{< config >}}
