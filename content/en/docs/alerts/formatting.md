---
title: Formatting Alerts
description: Format Falco Alerts for Containers and Kubernetes
linktitle: Formatting Alerts
weight: 20
---

Falco has native support for containers and orchestration environments. With the option `-k`, Falco communicates with the provided K8s API server to decorate events with the K8s pod/namespace/deployment/etc. associated with the event. With `-m`, Falco communicates with the marathon server to do the same thing.

Falco can be run with `-pk`/`-pm`/`-pc`/`-p` arguments that change the formatted output to be a k8s-friendly/mesos-friendly/container-friendly/general format. However, the source of formatted output is in the set of rules and not on the command line. This page provides more detail on how `-pk`/`-pm`/`-pc`/`-p` interacts with the format strings in the `output` attribute of rules.

The information from k8s/mesos/containers is used in conjunction with the command line options in these ways:

* In rule outputs, if the format string contains `%container.info`, that is replaced with the value from `-pk`/`-pm`/`-pc`, if one of those options was provided. If no option was provided, `%container.info` is replaced with a generic `%container.name (id=%container.id)` instead.

* If the format string does not contain `%container.info`, and one of `-pk`/`-pm`/`-pc` was provided, that is added to the end of the formatting string.

* If `-p` was specified with a general value (i.e. not `-pk`/`-pm`/`-pc`), the value is simply added to the end and any `%container.info` is replaced with the generic value.


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
