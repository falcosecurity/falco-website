---
title: K8s Pod Security Policy (PSP) Support
weight: 3
---

## Support for Pod Security Policies in Falco

As of 0.18.0, Falco has support for K8s Pod Security Policies. Specifically, you can convert a PSP into a set of Falco rules that evaluate the conditions in the PSP, without actually deploying the PSP to your cluster.

## Motivation

PSPs provide a rich powerful framework to restrict the behavior of pods and apply consistent security policies across a cluster, but it’s difficult to know the gap between what you want your security policy to be and what your cluster is actually doing. Additionally, since PSPs enforce once applied, they might prevent pods from running, and the process of tuning a PSP live on a cluster can be disruptive and painful.

That's where Falco comes in. We want to make it possible for Falco to perform a "dry run" evaluation of a PSP, translating it to Falco rules that observe the behaviour of deployed pods and sending alerts for violations, *without* blocking. This helps accelerate the authoring cycle, providing a complete authoring framework for PSPs without deploying straight to the cluster.

## Tools

The support consists of two components: `falcoctl convert psp` to generate a set of rules from a PSP, and `falco` has new fields that are required to execute those rules.

### Falcoctl Convert PSP

The [falcoctl convert psp](https://github.com/falcosecurity/falcoctl) tool reads a PSP as input and creates a Falco rules file that evaluates the constraints in the PSP. Here's an example:

Given the following PSP, which disallows privileged images and enforces a root filesystem, but allows other common properties like hostPID, etc:

```
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  annotations:
    falco-rules-psp-images: "[nginx]"
  name: no_privileged
spec:
  fsGroup:
    rule: "RunAsAny"
  hostPID: true
  hostIPC: true
  hostNetwork: true
  privileged: false
  readOnlyRootFilesystem: true
```

Note that the PSP has an annotation `falco-rules-psp-images`. This is used to limit the scope of the generated rules to a specific set of containers. The value of the annotation is a string, but the string should be a list of container images for which the rules should apply.

You can run `falcoctl convert psp --psp-path test_psp.yaml --rules-path psp_rules.yaml`, which generates the following rules file. You could then run Falco with `falco -r psp_rules.yaml`:

```
- required_engine_version: 5

- list: psp_images
  items: [nginx]

# K8s audit specific macros here
- macro: psp_ka_always_true
  condition: (jevt.rawtime exists)

- macro: psp_ka_never_true
  condition: (jevt.rawtime=0)

- macro: psp_ka_enabled
  condition: (psp_ka_always_true)

- macro: psp_kevt
  condition: (jevt.value[/stage] in ("ResponseComplete"))

- macro: psp_ka_pod
  condition: (ka.target.resource=pods and not ka.target.subresource exists)

- macro: psp_ka_container
  condition: (psp_ka_enabled and psp_kevt and psp_ka_pod and ka.verb=create and ka.req.pod.containers.image.repository in (psp_images))

# syscall audit specific macros here
- macro: psp_always_true
  condition: (evt.num>=0)

- macro: psp_never_true
  condition: (evt.num=0)

- macro: psp_enabled
  condition: (psp_always_true)

- macro: psp_container
  condition: (psp_enabled and container.image.repository in (psp_images))

- macro: psp_open_write
  condition: (evt.type=open or evt.type=openat) and evt.is_open_write=true and fd.typechar='f' and fd.num>=0


#########################################
# Rule(s) for PSP privileged property
#########################################
- rule: PSP Violation (privileged) K8s Audit
  desc: >
    Detect a psp validation failure for a privileged pod using k8s audit logs
  condition: psp_ka_container and ka.req.pod.containers.privileged intersects (true)
  output: Pod Security Policy no_privileged validation failure--pod with privileged=true (user=%ka.user.name pod=%ka.resp.name ns=%ka.target.namespace images=%ka.req.pod.containers.image spec=%jevt.value[/requestObject/spec])
  priority: WARNING
  source: k8s_audit
  tags: [k8s-psp]

- rule: PSP Violation (privileged) System Activity
  desc: Detect a psp validation failure for a privileged pod using syscalls
  condition: psp_container and evt.type=container and container.privileged intersects (true)
  output: Pod Security Policy no_privileged validation failure--container with privileged=true created (user=%user.name command=%proc.cmdline %container.info images=%container.image.repository:%container.image.tag)
  priority: WARNING
  source: syscall
  tags: [k8s-psp]


#########################################
# Rule(s) for PSP readOnlyRootFilesystem property
#########################################
- rule: PSP Violation (readOnlyRootFilesystem) K8s Audit
  desc: >
    Detect a psp validation failure for a readOnlyRootFilesystem pod using k8s audit logs
  condition: psp_ka_container and not ka.req.pod.containers.read_only_fs in (true)
  output: Pod Security Policy no_privileged validation failure--pod without readOnlyRootFilesystem=true (user=%ka.user.name pod=%ka.resp.name ns=%ka.target.namespace images=%ka.req.pod.containers.image spec=%jevt.value[/requestObject/spec])
  priority: WARNING
  source: k8s_audit
  tags: [k8s-psp]

- rule: PSP Violation (readOnlyRootFilesystem) System Activity
  desc: >
    Detect a psp validation failure for a readOnlyRootFilesystem pod using syscalls
  condition: psp_container and psp_open_write
  output: >
    Pod Security Policy no_privileged validation failure--write in container with readOnlyRootFilesystem=true
    (user=%user.name command=%proc.cmdline file=%fd.name parent=%proc.pname container_id=%container.id images=%container.image.repository)
  priority: WARNING
  source: syscall
  tags: [k8s-psp]
```

### Falco Support for Evaluating PSP Rules

To support these new rules, we defined a bunch of additional filter fields and added new operators `intersects` that makes it easier to compare properties from a set of containers in a pod specification against a set of desirable/undesirable values. As always, running `falco --list` lists the supported fields with descriptions.

For the most part, rules generated from a PSP rely on [K8s Audit Log Support](https://falco.org/docs/event-sources/kubernetes-audit/), so you'll need to get that enabled to make the most use of the rules.
