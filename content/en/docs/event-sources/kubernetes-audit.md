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

## What's New in Falco

Since [Falco 0.32.0](../../../blog/falco-0-32-0), the Kubernetes Audit Events support has been [refactored to become a plugin](https://github.com/falcosecurity/plugins/tree/master/plugins/k8saudit) and is compliant to the [Falco Plugin System](../../plugins/). Previously, this feature was supported as a parallel independent stream of events that was read separately from system calls, and was matched separately against its own sets of rules. 

To receive Kubernetes audit events, the plugin embeds a webserver that listens on a configurable port and accepts POST requests on a configurable endpoint. The posted JSON object comprises the event. The webserver embedded inside Falco to implement endpoints such as `/healtz` is totally **unrelated and independent** from the webserver of the plugin. The webserver of the plugin can be configuted as part of the plugin's init configuration and open parameters. See [configuration page](../../configuration/) for information on how plugins can be configured in Falco, and refer to [the plugin's readme for more specifics](https://github.com/falcosecurity/plugins/blob/master/plugins/k8saudit/README.md).

The new plugin-based implementation has been developed to be as similar as possible to the legacy K8S Audit Events feature introduced in Falco 0.13.0. However, due to technical constraints, there are few user-facing differences. Although the most up-to-date setups should work as they used to, there are few user-facing differences to be mindful of:

* K8S Audit Events support should be configured in `falco.yaml` through the `plugins` section through the plugin's init configuration and open parameters
* In the legacy implementation, the extraction of list of values was supported implicitly. When extracting a field for a rule condition or output, the check used to be able to extract single values or list of values, and use them with operators such as `in`, `intersect`, etc. However, the concept of "list" was totally implicity and there was no distinction between single values and lists of values with lenght equal to 1. Now, the plugin-based implementation is compliant to the new semantics supported in the libs since Falco 0.32, which allows fields to be of explicit list type. A field of list type will always extract list of values, containing one or more entries, or fail the extraction
*  Fields of list type now only support the `in` and `intersects` operators. For example, checks such as `ka.req.role.rules.verbs contains create` would be rejected and would need to be changed in the equivalent `ka.req.role.rules.verbs intersects (create)`
* Failed field value extraction should now be checked with the `exists` operator, and not by comparing with the `<NA>` string
* The `<NA>` string literal is not returned anymore, neither in single-valued fields nor in list fields. In the legacy implementation, field existence was occasionally checked with expressions like `ka.target.subresource != <NA>`, which would now inherently be always false, because if the field was absent the string comparison ends up failing. Instead, prefer using the analoguous `ka.target.subresource exists`, which explicitly checks for missing values
* The `/healtz` endpoint endpoint of Falco cannot bind to the same port of the K8S Audit Log endpoint (e.g. `/k8s-audit`), due to the fact that they are now managed by two different webservers (one in Falco, one in the plugin)
* In Falco versions 0.32.x ([Falco v0.32.0](/blog/falco-0-32-0.md), [Falco v0.32.1](/blog/falco-0-32-1.md), and Falco v0.32.2), Falco didn't allow the use of Syscalls and K8S Audit event sources on the same instance. Starting from [version 0.33.0](/blog/falco-0-33-0.md), Falco introduced the capability of [consuming events from multiple event sources simultaneously within the same Falco instance](/docs/event-sources/#configuring-event-sources).

## Kubernetes Audit Rules

Rules devoted to Kubernetes audit events are given in [the default k8saudit plugin rules](https://github.com/falcosecurity/plugins/tree/master/plugins/k8saudit/rules). When installed as a daemon, falco installs this rules file to `/etc/falco/`, so they are available for use.

### Example

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

### Enabling Kubernetes Audit Logs

To enable Kubernetes audit logs, you need to change the arguments to the `kube-apiserver` process to add `--audit-policy-file` and `--audit-webhook-config-file` arguments and provide files that implement an audit policy/webhook configuration. It is beyond the scope of Falco documentation to give a detailed description of how to do this, but [here](/content/en/docs/getting-started/third-party/learning.md#Falco-with-multiple-sources) you will find a step-by-step guide on how to configure `kubernetes audit logs` on `minikube` and deploy Falco. Managed Kubernetes providers will usually provide a mechanism to configure the audit system.

> Note: Dynamic Audit Webhooks were [removed](https://github.com/kubernetes/kubernetes/pull/91502) from Kubernetes. However, static audit configuration continues to work.
