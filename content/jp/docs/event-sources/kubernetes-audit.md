---
title: Kubernetes監査イベント
weight: 2
---

Falco v0.13.0では、サポートされているイベントソースのリストに[Kubernetes監査イベント](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/#audit-backends)が追加されています。これは、システムコールイベントの既存のサポートに追加されます。監査イベントの改善された実装がKubernetes v1.11で導入され、[kube-apiserver](https://kubernetes.io/docs/admin/kube-apiserver)へのリクエストとレスポンスのログを提供します。ほとんどすべてのクラスター管理タスクはAPIサーバーを介して実行されるため、監査ログはクラスターに加えられた変更を効果的に追跡できます。

この例は次のとおりです：

* ポッド、サービス、デプロイメント、デーモンセットなどの作成と破棄。
* ConfigMapまたはシークレットの作成、更新、削除
* エンドポイントに導入された変更をサブスクライブする

これらのシナリオをカバーするために、次のような注目すべきまたは疑わしいアクティビティを監視するFalcoルールのセットが追加されました：

* 特権付きのポッドの作成、機密ホストパスのマウント、またはホストネットワークの使用。
* `cluster-admin`などの過度に広い権限をユーザーに付与する。
* 機密情報を含むConfigMapの作成。

クラスターに監査ログが設定され、イベントがFalcoに送信されるように選択されたら、これらのイベントを読み取り、疑わしいアクティビティやその他の注目すべきアクティビティの通知を送信できるFalcoルールを作成できます。

# Falcoの新機能

Falcoの全体的なアーキテクチャーは同じままで、イベントは一連のルールと照合され、ルールは疑わしいビヘイビアまたは注目すべきビヘイビアを識別します。Falcoがv0.13.0で導入するのは、1つだけではなく、別々に読み取られ、ルールのセットに対して個別に照合される2つの並列の独立したイベントストリームです。

Kubernetes監査イベントを受信するために、Falcoは設定可能なポートでリッスンし、設定可能なエンドポイントでPOSTリクエストを受け入れる[civetweb](https://github.com/civetweb/civetweb)Webサーバーを埋め込みます。組み込みWebサーバーの構成については、[設定のページ](../../configuration/) を参照してください。 ポストされたJSONオブジェクトはイベントを含みます。

特定のルールは、`source`属性を介して、システムコールイベントまたはKubernetes監査イベントに関連付けられます。指定しない場合、ソースはデフォルトで`syscall`になります。 ソースが`syscall`のルールは、システムコールイベントと照合されます。ソースが `k8s_audit`のルールは、Kubernetes監査イベントと照合されます。

Falcoの使用を開始するには、[Falcoによる監査](https://kubernetes.io/docs/tasks/debug-application-cluster/falco/) を参照してください。

## 条件とフィールド

システムコールルールと同様に、Kubernetes監査ルールの条件フィールドは、演算子とイベントフィールドに基づく論理式です。 たとえば、`ka.user.name`です。 特定のイベントフィールドは、jsonオブジェクトから1つのプロパティ値を選択します。たとえば、フィールド`ka.user.name`は最初にKubernetes監査イベント内の`user`オブジェクトを識別し、そのオブジェクトの`username`プロパティを選択します。

Falcoには、Kubernetes event/jsonオブジェクトの共通プロパティにアクセスする多数の事前定義フィールドが含まれています。`falco --list k8s_audit`を使用してフィールドを表示できます。

事前定義されたフィールドのいずれかでカバーされていないKubernetes監査 event/jsonオブジェクトのプロパティ値を選択するには、`jevt.value[<json pointer>]`が使用できます。 [JSONポインター](http://rapidjson.org/md_doc_pointer.html)を使用して、jsonオブジェクトから単一のプロパティ値を選択します。これにより、Kubernetes監査イベントから任意のプロパティ値を選択して、ルールの条件を作成できます。たとえば、`ka.username` を抽出する同等の方法は、`jevt.value[/user/username]`です。

## Kubernetes監査ルール

Kubernetes監査イベント専用のルールは、[k8s_audit_rules.yaml](https://github.com/falcosecurity/falco/blob/master/rules/k8s_audit_rules.yaml)に記載されています。 デーモンとしてインストールされると、falcoはこのルールファイルを`/etc/falco/`にインストールし、使用できるようにします。

## 例

`k8s_audit_rules.yaml`のルールの1つは次のとおりです：

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

`Configmap contains private credentials`ルールは、AWSキーやパスワードなどの機密アイテムで作成されたConfigMapをチェックします。

このような場合のルールの動作を見てみましょう。このトピックでは、Kubernetes監査ロギングが環境で設定されていることを前提としています。
AWS認証情報を含むConfigMapを作成します：

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

このConfigMapを作成すると、監査ログに次のjsonオブジェクトが生成されます：

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

ConfigMapにプライベート資格情報が含まれている場合、ルールは以下のフィールドを指定された順序で使用します：

1. `kevt`:オブジェクトの`stage`プロパティが `k8s_audit_stages`リストに存在するかどうかを確認します。

2. `configmap`: `objectRef > resource`プロパティの値が"configmap"に等しいかどうかを確認します。

3. `modify`: `verb`の値が次のいずれかであるかどうかを確認します: `create`,`update`,`patch`。

4. `contains-private-credentials`: `requestObject > data`でConfigMapのコンテンツを検索し、`contains_private_credentials`マクロで指定された機密性の高い文字列を探します。

もしそうなら、Falcoイベントが生成されます：

```log
17:18:28.428398080: Warning K8s ConfigMap with private credential (user=minikube-user verb=create configmap=my-config config={"access.properties":"aws_access_key_id = MY-ID\naws_secret_access_key = MY-KEY\n","ui.properties":"color.good=purple\ncolor.bad=yellow\nallow.textmode=true\n"})
```

The output string is used to print essential information about the audit event, including:
出力文字列は、監査イベントに関する次のような重要な情報を出力するために使用されます：

* user: `%ka.user.name`
* verb: `%ka.verb`
* ConfigMap name: `%ka.req.configmap.name`
* ConfigMap contents: `%ka.req.configmap.obj`

# Kubernetes監査ログを有効にする

Kubernetes監査ログを有効にするには、`kube-apiserver` プロセスの引数を変更して、`--audit-policy-file`および `--audit-webhook-config`引数を追加し、audit policy/webhookを実装するファイルを提供する必要があります。これを行う方法の詳細な説明を提供することはFalcoのドキュメントの範囲外ですが、[サンプルファイル](https://github.com/falcosecurity/falco/blob/master/examples/k8s_audit_config/README.md) 監査ログをminikubeに追加する方法を示します。
