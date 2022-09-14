---
aliases: ["/docs/event-sources/sample-events"]
title: Generating sample events
weight: 4
---

If you'd like to check if Falco is working properly, we have the [`event-generator`](https://github.com/falcosecurity/event-generator) tool that can perform an activity for both our syscall and k8s audit related rules.

The tool provides a command to run either some or all sample events.

```
event-generator run [regexp]
```
Without arguments it runs all actions, otherwise only those actions matching the given regular expression.

The full command line documentation is [here](https://github.com/falcosecurity/event-generator/blob/master/docs/event-generator_run.md).

## Downloads 
| Artifacts     |  | Version |
|------|----------|----------|
| binaries | [download link](https://github.com/falcosecurity/event-generator/releases/latest) | [![Release](https://img.shields.io/github/release/falcosecurity/event-generator.svg?style=flat-square)](https://github.com/falcosecurity/event-generator/releases/latest) |
| container images | `docker pull falcosecurity/event-generator:latest` | [![Docker Image Version (latest semver)](https://img.shields.io/docker/v/falcosecurity/event-generator?color=blue&style=flat-square)](https://hub.docker.com/r/falcosecurity/event-generator/tags) |

## Sample events

### System Call Activity

{{% pageinfo color="primary" %}}
**Warning** — We strongly recommend that you run the program within Docker (see below), since some commands might alter your system. For example, some actions modify files and directories below `/bin`, `/etc`, `/dev`, etc.

{{% /pageinfo %}}

The `syscall` collection performs a variety of suspect actions that are detected by the [default Falco ruleset](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml).

```shell
docker run -it --rm falcosecurity/event-generator run syscall --loop
```

The above command loops forever, incessantly generating a sample event each second. 


### Kubernetes Auditing Activity

The `k8saudit` collection generates activity that matches the [k8s audit event ruleset](https://github.com/falcosecurity/plugins/blob/master/plugins/k8saudit/rules/k8s_audit_rules.yaml).


```shell
event-generator run k8saudit --loop
```

The above command loops forever, creating resources in the current namespace and deleting them after each iteration. Use the `--namespace` option to choose a different namespace.


## Running the Event Generator in K8s

We've also provided a [helm chart](https://github.com/falcosecurity/charts/tree/master/event-generator) that make it easy to run the event generator in K8s Clusters.

First thing, we need to add the `falcosecurity` charts repository:

```shell
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
```
Once you have the helm repo configured, you can run the following to create the necessary objects in the `event-generator` namespace and then generate events continuously:

```shell
helm install event-generator falcosecurity/event-generator \
  --namespace event-generator \
  --create-namespace \
  --set config.loop=false \
  --set config.actions=""
```

The above command applies to the `event-generator` namespace. Use the `--namespace` option to deploy in a different namespace. Events will be generated in the same namespace.

You can also find more examples in the [event-generator](https://github.com/falcosecurity/event-generator#with-kubernetes) and [charts](https://github.com/falcosecurity/charts/tree/master/event-generator) repositories.
