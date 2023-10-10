---
aliases:
- ../../examples
title: Rules Examples
description: Several examples of Falco Rules
weight: 80
---

Here are some examples of the types of behavior falco can detect.

For a more comprehensive set of examples, see the full rules file at `falco_rules.yaml`.

## A shell is run in a container

{{< markdown_inline format = "raw"
    contentPath = "/docs/reference/rules/examples/run_shell_in_container.md"
>}}

## Unexpected outbound Elasticsearch connection

{{< markdown_inline format = "raw"
    contentPath = "/docs/reference/rules/examples/elasticsearch_unexpected_network_outbound.md"
>}}

## Write to directory holding system binaries

{{< markdown_inline format = "raw"
    contentPath = "/docs/reference/rules/examples/write_binary_dir.md"
>}}

## Non-authorized container namespace change

{{< markdown_inline format = "raw"
    contentPath = "/docs/reference/rules/examples/change_thread_namespace.md"
>}}

## Non-device files written in /dev (some rootkits do this)

{{< markdown_inline format = "raw"
    contentPath = "/docs/reference/rules/examples/create_files_below_dev.md"
>}}

## Process other than skype/webex tries to access camera

{{< markdown_inline format = "raw"
    contentPath = "/docs/reference/rules/examples/access_camera.md"
>}}