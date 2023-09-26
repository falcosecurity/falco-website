---
aliases: ["/docs/rules/supported-fields"]
title: Supported Fields for Conditions and Outputs
description: Events fields that you can use in conditions and outputs of Falco Rules
linktitle: Fields for Conditions and Outputs
weight: 60
---

Here are the fields supported by Falco. These fields can be used in the `condition` key of a Falco rule and well as the `output` key. Any fields included in the `output` key of a rule will also be included in the alert's `output_fields` object when `json_output` is set to `true`.

You can also see this set of fields via `falco --list=<source>`, with `<source>` being one of the [Falco event sources](/docs/event-sources/).

### System Calls (source `syscall`)

`syscall` event source fields are provided by the [Falco Drivers](/docs/event-sources/drivers/). See the [supported events](/docs/reference/rules/supported-events/) documentation to learn about all the available event types. The field `evt.arg`, `evt.args` and `evt.rawarg` is used to access arguments for each event. For example, in order to access the `target` arg of a `symlinkat` exit event you can use `evt.arg.target`.


```
# System Kernel Fields
$ falco --list=syscall
```

<!-- 
generated with:
falco --list=syscall --markdown  | sed -E 's/## Field Class/### Field Class/g' | awk '!/^Event Sources: syscall\w*/' | awk '/Field Class: evt/{c++;if(c==2){sub("evt","evt (for system calls)");c=0}}1'
-->

{{< markdown_inline
    contentPath="/docs/reference/rules/supported-fields/supported-fields.md"
>}}
