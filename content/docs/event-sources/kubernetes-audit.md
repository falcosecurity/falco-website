---
title: Kubernetes Audit Events
weight: 2
---

As of Falco 0.13.0, falco supports a second source of events in addition to system call events: [K8s Audit Events](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/#audit-backends). An improved implementation of k8s audit events was introduced in k8s v1.11 and provides a log of requests and responses to [kube-apiserver](https://kubernetes.io/docs/admin/kube-apiserver). Since almost all cluster management tasks are done through the API server, the audit log is a way to track the changes made to your cluster. Examples of this include:

* Creating/destroying pods, services, deployments, daemonsets, etc.
* Creating/updating/removing config maps or secrets
* Attempts to subscribe to changes to any endpoint

We also added additional falco rules that look for notable or suspicious activity, including:

* Creating pods that are privileged, mount sensitive host paths, or use host networking.
* Granting overly broad permissions such as `cluster-admin` to users.
* Creating configmaps with sensitive information.

Once you've configured your cluster with audit logging and selected which events you'd like to pass along to falco, you can write falco rules that read these events and send notifications for suspicious or other notable activity.

# Falco Changes

The overall architecture of Falco remains the same, with events being matched against sets of rules, with a rule identifying suspicious/notable behavior. What's new is that there are two parallel independent streams of events being read separately and matched separately against the sets of rules instead of just one.

To receive k8s audit events, falco embeds a [civetweb](https://github.com/civetweb/civetweb) webserver that listens on a configurable port and accepts POST requests on a configurable endpoint. Details on configuring the embedded webserver are on the [config page](../../configuration/config-file). The posted JSON object comprises the event.

A given rule is tied to either system call events or k8s audit events, via the `source` attribute. If not specified, the source defaults to `syscall`. Rules with source `syscall` are matched against system call events. Rules with source `k8s_audit` are matched against k8s audit events.

## Conditions and Fields

Like system call rules, a condition field for k8s audit rules is a logical expression based on operators and event fields (e.g. `ka.user.name`). A given event field selects one property value from the json object. For example, the field `ka.user.name` first identifies the `user` object within the k8s audit event, and then selects the `username` property of that object.

Falco includes a number of predefined fields that access common properties of the k8s event/json object. You can view these via `falco --list <source>`, using `k8s_audit` for `<source>`.

If you wish to select a property value of the k8s audit event/json object that isn't covered by one of the predefined fields, you can use `jevt.value[<json pointer>]`. A [JSON Pointer](http://rapidjson.org/md_doc_pointer.html) is a way to select a single property value from a json object. This allows you to select arbitrary property values from the k8s audit event to create your rule's condition. For example, an equivalent way to extract `ka.username` is `jevt.value[/user/username]`.

## K8s Audit Rules

Rules devoted to k8s audit events are in [k8s_audit_rules.yaml](https://github.com/falcosecurity/falco/blob/dev/rules/k8s_audit_rules.yaml). When installed as a daemon, falco installs this rules file to `/etc/falco/`, so they are available for use.

## Example

Here's an example. One of the rules in `k8s_audit_rules.yaml` is the following:

```yaml
- list: k8s_audit_stages
  items: ["ResponseComplete"]

# This macro selects the set of Audit Events used by the below rules.
- macro: kevt
  condition: (jevt.value[/stage] in (k8s_audit_stages))

- macro: create
  condition: ka.verb=create

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

The rule `Configmap contains private credentials` checks for a configmap being created where the contents of the configmap contain possibly sensitive items like aws keys or passwords.

Assuming that K8s Audit Logging is configured, we can create a configmap containing the following:

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

Note that the configmap contains aws credentials.

Assuming that k8s audit logging is enabled, creating the configmap results in the following json object in the audit log:

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

When the rule Configmap contains private credentials, it first uses the `kevt` field to check that the object's `stage` property is in the list `k8s_audit_stages`. It then uses `configmap` to check the value of the property `objectRef->resource` and see if it equals "configmap". `modify` checks that the value of `verb` is one of `create`,`update`,`patch`. `contains-private-credentials` looks at the configmap contents at `requestObject->data` to see if they contain any of the sensitive strings named in the `contains_private_credentials` macro. 

If they do, a falco event is generated:

```log
17:18:28.428398080: Warning K8s configmap with private credential (user=minikube-user verb=create configmap=my-config config={"access.properties":"aws_access_key_id = MY-ID\naws_secret_access_key = MY-KEY\n","ui.properties":"color.good=purple\ncolor.bad=yellow\nallow.textmode=true\n"})
```

The output string is used to print essential information about the audit event, including:

* the user `%ka.user.name`, verb `%ka.verb`, and configmap name `%ka.req.configmap.name`
* the full configmap contents `%ka.req.configmap.obj`

# Enabling K8s Audit Logs

In order to enable k8s audit logs, you need to change the arguments to the `kube-apiserver` process to add `--audit-policy-file` and `--audit-webhook-config` arguments and provide files that implement an audit policy/webhook config. Exactly how to do this is somewhat out of the scope of falco's documentation, but we've provided some example files [here](https://github.com/falcosecurity/falco/blob/dev/examples/k8s_audit_config/README.md) that show how we added audit logging to minikube.
