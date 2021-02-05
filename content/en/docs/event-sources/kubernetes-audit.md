---
title: Kubernetes Audit Events
weight: 2
---

Falco v0.13.0 adds [Kubernetes Audit Events](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/#audit-backends) to the list of supported event sources. This is in addition to the existing support for system call events. An improved implementation of audit events was introduced in Kubernetes v1.11 and it provides a log of requests and responses to [kube-apiserver](https://kubernetes.io/docs/admin/kube-apiserver). Because almost all the cluster management tasks are performed through the API server, the audit log can effectively track the changes made to your cluster.

Examples of this include:

* Creating and destroying pods, services, deployments, daemonsets, etc.
* Creating, updating, and removing ConfigMaps or secrets
* Subscribing to the changes introduced to any endpoint

To cover these scenarios, additional set of falco rules have been added that monitor for notable or suspicious activity, including:

* Creating pods that are privileged, mount sensitive host paths, or use host networking.
* Granting overly broad permissions such as `cluster-admin` to users.
* Creating ConfigMaps with sensitive information.

Once your cluster is configured with audit logging and the events are selected to be sent to falco, you can write falco rules that can read these events and send notifications for suspicious or other notable activity.

# What's New in Falco

The overall architecture of Falco remains the same, with events being matched against sets of rules, with a rule identifying suspicious or notable behavior. What falco introduces in v0.13.0 is two parallel independent streams of events that are read separately and matched separately against the sets of rules, instead of just one.

To receive Kubernetes audit events, falco embeds a [civetweb](https://github.com/civetweb/civetweb) webserver that listens on a configurable port and accepts POST requests on a configurable endpoint. See [configuration page](../../configuration/) for information on configuring the embedded webserver. The posted JSON object comprises the event.

A given rule is tied to either system call events or Kubernetes audit events, via the `source` attribute. If not specified, the source defaults to `syscall`. Rules with source `syscall` are matched against system call events. Rules with source `k8s_audit` are matched against Kubernetes audit events.

See [Auditing with Falco](https://kubernetes.io/docs/tasks/debug-application-cluster/falco/) to get started with Falco.

## Conditions and Fields

Like system call rules, a condition field for Kubernetes audit rules is a logical expression based on operators and event fields. For example, `ka.user.name`. A given event field selects one property value from the json object. For instance, the field `ka.user.name` first identifies the `user` object within the Kubernetes audit event, and selects the `username` property of that object.

Falco includes a number of predefined fields that access common properties of the Kubernetes event/json object. You can view the fields via `falco --list k8s_audit`.

To select a property value of the Kubernetes audit event/json object that isn't covered by one of the predefined fields, you can use `jevt.value[<json pointer>]`. You use [JSON Pointer](http://rapidjson.org/md_doc_pointer.html) to choose a single property value from a json object. This allows you to select arbitrary property values from the Kubernetes audit event to create your rule's condition. For example, an equivalent way to extract `ka.username` is `jevt.value[/user/username]`.

## Kubernetes Audit Rules

Rules devoted to Kubernetes audit events are given in [k8s_audit_rules.yaml](https://github.com/falcosecurity/falco/blob/master/rules/k8s_audit_rules.yaml). When installed as a daemon, falco installs this rules file to `/etc/falco/`, so they are available for use.

## Example

One of the rules in `k8s_audit_rules.yaml` is as follows:

```yaml
- list: k8s_audit_stages
  items: ["ResponseComplete"]

# This macro selects the set of Audit Events used by the below rules.
- macro: kevt
  condition: (jevt.value[/stage] in (k8s_audit_stages))

- macro: kmodify
  condition: (ka.verb in (create,update,patch))

- macro: configmap
  condition: ka.target.resource=configmaps

- macro: contains_private_credentials
  condition: >
    (ka.req.configmap.obj contains "aws_access_key_id" or
     ka.req.configmap.obj contains "aws-access-key-id" or
     ka.req.configmap.obj contains "aws_s3_access_key_id" or
     ka.req.configmap.obj contains "aws-s3-access-key-id" or
     ka.req.configmap.obj contains "password" or
     ka.req.configmap.obj contains "passphrase")

- rule: Configmap contains private credentials
  desc: >
     Detect configmap operations with map containing a private credential (aws key, password, etc.)
  condition: kevt and configmap and modify and contains_private_credentials
  output: K8s configmap with private credential (user=%ka.user.name verb=%ka.verb name=%ka.req.configmap.name configmap=%ka.req.configmap.name config=%ka.req.configmap.obj)
  priority: WARNING
  source: k8s_audit
  tags: [k8s]
```

The `Configmap contains private credentials` rule checks for a ConfigMap created with possibly sensitive items, such as AWS keys or passwords.

Let's see how the rule works in such cases. This topic assumes that Kubernetes audit logging is configured in your environment.

Create a ConfigMap containing AWS credentials:

```yaml
apiVersion: v1
data:
  ui.properties: |
    color.good=purple
    color.bad=yellow
    allow.textmode=true
  access.properties: |
    aws_access_key_id = MY-ID
    aws_secret_access_key = MY-KEY
kind: ConfigMap
metadata:
  creationTimestamp: 2016-02-18T18:52:05Z
  name: my-config
  namespace: default
  resourceVersion: "516"
  selfLink: /api/v1/namespaces/default/configmaps/my-config
  uid: b4952dc3-d670-11e5-8cd0-68f728db1985
```

Creating this ConfigMap results in the following json object in the audit log:

```json
{
  "kind": "Event",
  "apiVersion": "audit.k8s.io/v1beta1",
  "metadata": {
    "creationTimestamp": "2018-10-20T00:18:28Z"
  },
  "level": "RequestResponse",
  "timestamp": "2018-10-20T00:18:28Z",
  "auditID": "33fa264e-1124-4252-af9e-2ce6e45fe07d",
  "stage": "ResponseComplete",
  "requestURI": "/api/v1/namespaces/default/configmaps",
  "verb": "create",
  "user": {
    "username": "minikube-user",
    "groups": [
      "system:masters",
      "system:authenticated"
    ]
  },
  "sourceIPs": [
    "192.168.99.1"
  ],
  "objectRef": {
    "resource": "configmaps",
    "namespace": "default",
    "name": "my-config",
    "uid": "b4952dc3-d670-11e5-8cd0-68f728db1985",
    "apiVersion": "v1"
  },
  "responseStatus": {
    "metadata": {
    },
    "code": 201
  },
  "requestObject": {
    "kind": "ConfigMap",
    "apiVersion": "v1",
    "metadata": {
      "name": "my-config",
      "namespace": "default",
      "selfLink": "/api/v1/namespaces/default/configmaps/my-config",
      "uid": "b4952dc3-d670-11e5-8cd0-68f728db1985",
      "creationTimestamp": "2016-02-18T18:52:05Z"
    },
    "data": {
      "access.properties": "aws_access_key_id = MY-ID\naws_secret_access_key = MY-KEY\n",
      "ui.properties": "color.good=purple\ncolor.bad=yellow\nallow.textmode=true\n"
    }
  },
  "responseObject": {
    "kind": "ConfigMap",
    "apiVersion": "v1",
    "metadata": {
      "name": "my-config",
      "namespace": "default",
      "selfLink": "/api/v1/namespaces/default/configmaps/my-config",
      "uid": "ab04e510-d3fd-11e8-8645-080027728ac4",
      "resourceVersion": "45437",
      "creationTimestamp": "2018-10-20T00:18:28Z"
    },
    "data": {
      "access.properties": "aws_access_key_id = MY-ID\naws_secret_access_key = MY-KEY\n",
      "ui.properties": "color.good=purple\ncolor.bad=yellow\nallow.textmode=true\n"
    }
  },
  "requestReceivedTimestamp": "2018-10-20T00:18:28.420807Z",
  "stageTimestamp": "2018-10-20T00:18:28.428398Z",
  "annotations": {
    "authorization.k8s.io/decision": "allow",
    "authorization.k8s.io/reason": ""
  }
}
```

When the ConfigMap contains private credentials, the rule uses the following fields in the given order:

1. `kevt`: Checks whether the `stage` property of the object is present in the `k8s_audit_stages` list.

2. `configmap`: Checks whether the value of the `objectRef > resource` property equals to "configmap".

3. `kmodify`: Checks whether the value of `verb` is one of the following: `create`,`update`,`patch`.

4. `contains-private-credentials`: Search the ConfigMap contents at `requestObject > data` for any of the sensitive strings named in the `contains_private_credentials` macro.

If they do, a falco event is generated:

```log
17:18:28.428398080: Warning K8s ConfigMap with private credential (user=minikube-user verb=create configmap=my-config config={"access.properties":"aws_access_key_id = MY-ID\naws_secret_access_key = MY-KEY\n","ui.properties":"color.good=purple\ncolor.bad=yellow\nallow.textmode=true\n"})
```

The output string is used to print essential information about the audit event, including:

* user: `%ka.user.name`
* verb: `%ka.verb`
* ConfigMap name: `%ka.req.configmap.name`
* ConfigMap contents: `%ka.req.configmap.obj`

## Enabling Kubernetes Audit Logs

To enable Kubernetes audit logs, you need to change the arguments to the `kube-apiserver` process to add `--audit-policy-file` and `--audit-webhook-config-file` arguments and provide files that implement an audit policy/webhook configuration. It is beyond the scope of Falco documentation to give a detailed description of how to do this, but the [example files](https://github.com/falcosecurity/evolution/blob/master/examples/k8s_audit_config/README.md) show how audit logging is added to minikube. Managed Kubernetes providers will usually provide a mechanism to configure the audit system.

> Note: Dynamic Audit Webhooks were [removed](https://github.com/kubernetes/kubernetes/pull/91502) from Kubernetes. However, static audit configuration continues to work.
