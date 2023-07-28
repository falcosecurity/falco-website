---
title: Output Formatting
description: Format Falco Alerts for Containers and Kubernetes
linktitle: Output Formatting
aliases: [/docs/alerts/formatting/]
weight: 20
---

Previous guides introduced the [output field of Falco rules](/docs/rules/basic-elements/#output) and provided [guidelines](https://deploy-preview-1108--falcosecurity.netlify.app/docs/rules/style-guide/#output-fields) on how to use it. This section specifically highlights additional global formatting options for your deployment, complementing the information previously provided.

Falco natively supports the decoration of events with associated containers and Kubernetes metadata. When Falco runs with `-pk`/`-pc`/`-p` command-line options, it changes the output format to a format that is friendly to k8s/containers/general usage. However, the source of this formatted output lies within the ruleset, not the command line. This page elaborates on how `-pk`/`-pc`/`-p` interacts with the format strings in the `output` field of rules.

The information from k8s/containers is used in conjunction with the command-line options in these ways:

* In rule outputs, if the format string contains `%container.info`, that is replaced with the value from `-pk`/`-pc`, if one of those options was provided. If no option was provided, `%container.info` is replaced with a generic `%container.name (id=%container.id)` instead.

* If the format string does not contain `%container.info`, and one of `-pk`/`-pc` was provided, that is added to the end of the formatting string.

* If `-p` was specified with a general value (i.e. not `-pk`/`-pc`), the value is simply added to the end and any `%container.info` is replaced with the generic value.


## Examples

Here are some examples of Falco command lines, output strings in rules, and the resulting output:

### Output contains `%container.info`
```
output: "Namespace change (setns) by unexpected program (user=%user.name command=%proc.cmdline parent=%proc.pname %container.info)"

$ falco
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s-kubelet (id=4a4021c50439))

$ falco -pk -k <k8s api server url>
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s.pod=jclient-3160134038-qqaaz container=4a4021c50439)

$ falco -p "This is Some Extra" -k <k8s api server url>
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s-kubelet (id=4a4021c50439)) This is Some Extra
```

### Output does not contain `%container.info`

```
output: "File below a known binary directory opened for writing (user=%user.name command=%proc.cmdline file=%fd.name)"

$ falco
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) k8s-kubelet (id=4a4021c50439)

$ falco -pk -k <k8s api server url>
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) k8s.pod=jclient-3160134038-qqaaz container=4a4021c50439

$ falco -p "This is Some Extra" -k <k8s api server url>
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) This is Some Extra
```
