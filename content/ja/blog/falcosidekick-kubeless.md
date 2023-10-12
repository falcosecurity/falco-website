---
exclude_search: true
title: Falcosidekick + Kubeless = a Kubernetes Response Engine
date: 2021-01-15
author: Thomas Labarussias
slug: falcosidekick-kubeless
---

2年前、私たちは `Falco` をベースにした `Kubernetes Response Engine` を紹介しました。そのアイデアは、感染したポッドを削除したり、`Sysdig` のキャプチャを開始したり、`GCP PubSub` に`イベント`を転送したりするために、[`Kubeless`](https://kubeless.io) のserverless functionをトリガーすることでした。[README](https://github.com/falcosecurity/kubernetes-response-engine)を参照してください。

このカスタムスタックを維持することを避けるために、私たちはコミュニティと協力して、すべてのコンポーネントを [`Falcosidekick`](https://github.com/falcosecurity/falcosidekick) に統合し、UXを改善するために努力しました。
最後のリリース [`2.20.0`]](https://github.com/falcosecurity/falcosidekick/releases/tag/2.20.0) で、最後の仕上げとして `Kubeless` をネイティブ出力として統合しました。詳細は [2020年の回顧](/ja/blog/falcosidekick-2020/) をご覧ください。

今回のブログ記事では、スタック `Falco` + `Falcosidekick` + `Kubeless` を用いて、独自のレスポンスエンジンを K8S に統合するための基本的な考え方を説明します。

## 必要条件

少なくとも `1.17` リリースの `kubernetes` クラスタが動作しており、[`helm`](https://helm.sh) と `kubectl` がインストールされている必要があります。

## Kubelessのインストール

公式の[クイックスタート](https://kubeless.io/docs/quick-start/)ページをフォローしてください：

```shell
export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)
kubectl create ns kubeless
kubectl create -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$RELEASE.yaml
```

数秒後、コントローラが起動していることを確認できます：

```shell
kubectl get pods -n kubeless
NAME                                          READY   STATUS    RESTARTS   AGE
kubeless-controller-manager-99459cb67-tb99d   3/3     Running   3          2m34s
```

## Falcoのインストール

まず、`Falco` と `Falcosidekick` の両方のネームスペースを作成します。

```shell
kubectl create ns falco
```

`helm`のrepoを追加します：

```shell
helm repo add falcosecurity https://falcosecurity.github.io/charts
```

実際のプロジェクトでは、`helm pull falcosecurity/falco --untar` でチャート全体を取得し、`values.yaml` を設定する必要があります。このチュートリアルでは、できるだけ簡単な設定を心がけ、`helm install`コマンドで直接設定を行います。

```shell
helm install falco falcosecurity/falco --set falco.jsonOutput=true --set falco.httpOutput.enabled=true --set falco.httpOutput.url=http://falcosidekick:2801 -n falco
```

このような出力が得られるはずです。

```shell
NAME: falco
LAST DEPLOYED: Thu Jan 14 23:43:46 2021
NAMESPACE: falco
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Falco agents are spinning up on each node in your cluster. After a few
seconds, they are going to start monitoring your containers looking for
security issues.
No further action should be required.
```

そして、新しい`Falco`ポッドを見ることができます：

```shell
kubectl get pods -n falco
NAME                           READY   STATUS        RESTARTS   AGE
falco-ctmzg                    1/1     Running       0          111s
falco-sfnn8                    1/1     Running       0          111s
falco-rrg28                    1/1     Running       0          111s
```

引数 `--set falco.jsonOutput=true -set falco.httpOutput.enabled=true -set falco.httpOutput.url=http://falcosidekick:2801` は、イベントのフォーマットと `Falco` がイベントを送信するURLを設定するものです。`Falco` と `Falcosidekick` は同じネームスペースにあるので、サービス名 (`falcosidekick`) を直接使うことができます。

## Falcosidekickをインストールする

過程は全く同じです：

```shell
helm install falcosidekick falcosecurity/falcosidekick --set config.kubeless.namespace=kubeless --set config.kubeless.function=delete-pod -n falco
```

このような出力が得られるはずです。
```shell
NAME: falcosidekick
LAST DEPLOYED: Thu Jan 14 23:55:12 2021
NAMESPACE: falco
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace falco -l "app.kubernetes.io/name=falcosidekick,app.kubernetes.io/instance=falcosidekick" -o jsonpath="{.items[0].metadata.name}")
  kubectl port-forward $POD_NAME 2801:2801
  echo "Visit http://127.0.0.1:2801 to use your application"
```

ログを確認します。
```shell
kubectl logs deployment/falcosidekick -n falco
2021/01/14 22:55:31 [INFO]  : Enabled Outputs : Kubeless 
2021/01/14 22:55:31 [INFO]  : Falco Sidekick is up and listening on port 2801
````

`Kubeless` が出力可能と表示されているので、全て順調です👍。

パラメータについて簡単に説明します。
- `config.kubeless.namespace`: `Kubeless` が実行されるネームスペース。
- `config.kubeless.function`: は `Kubeless function` の名前です。

以上、本当に素敵なUXを手に入れようとしました 😉。

## Kubeless functionをインストールする

ここでは `Kubeless` 関数の書き方や動作については説明しませんが、詳細は公式の [ドキュメント](https://kubeless.io/docs/) を参照してください。

私たちの本当に基本的な関数は、`Falcoidekick`によって `Falco` からイベントを受信し、トリガーされたルールが *Terminal Shell in container* であるかどうかをチェックし([rule](https://github.com/falcosecurity/falco/blob/0d7068b048772b1e2d3ca5c86c30b3040eac57df/rules/falco_rules.yaml#L2063)を参照)、イベントのフィールドから *namespace* と *pod name* を抽出して、該当するポッドを削除します。

```python
from kubernetes import client,config

config.load_incluster_config()

def delete_pod(event, context):
    rule = event['data']['rule'] or None
    output_fields = event['data']['output_fields'] or None

    if rule and rule == "Terminal shell in container" and output_fields:
        if output_fields['k8s.ns.name'] and output_fields['k8s.pod.name']:
            pod = output_fields['k8s.pod.name']
            namespace = output_fields['k8s.ns.name']
            print (f"Deleting pod \"{pod}\" in namespace \"{namespace}\"")
            client.CoreV1Api().delete_namespaced_pod(name=pod, namespace=namespace, body=client.V1DeleteOptions())
```

基本的なプロセスは、：
```shell
           +----------+                 +---------------+                    +----------+
           |  Falco   +-----------------> Falcosidekick +--------------------> Kubeless |
           +----^-----+   sends event   +---------------+      triggers      +-----+----+
                |                                                                  |
detects a shell |                                                                  |
                |                                                                  |
           +----+-------+                                   deletes                |
           | Pwned Pod  <----------------------------------------------------------+
           +------------+
```

functionをデプロイする前に、functionの`ServiceAccount`を作成する必要があります。これは、任意のネームスペースのポッドを削除する権限が必要になるためです：

```shell
cat <<EOF | kubectl apply -n kubeless -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: falco-pod-delete
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: falco-pod-delete-cluster-role
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "delete"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: falco-pod-delete-cluster-role-binding
roleRef:
  kind: ClusterRole
  name: falco-pod-delete-cluster-role
  apiGroup: rbac.authorization.k8s.io
subjects:
  - kind: ServiceAccount
    name: falco-pod-delete
    namespace: kubeless
EOF
```

```shell
namespace: kubelessetetion.k8s.io
serviceaccount/falco-pod-delete created
clusterrole.rbac.authorization.k8s.io/falco-pod-delete-cluster-role created
clusterrolebinding.rbac.authorization.k8s.io/falco-pod-delete-cluster-role-binding created
```

残っているのはfunction自体のインストールだけです：

```shell
cat <<EOF | kubectl apply -n kubeless -f -
apiVersion: kubeless.io/v1beta1
kind: Function
metadata:
  finalizers:
    - kubeless.io/function
  generation: 1
  labels:
    created-by: kubeless
    function: delete-pod
  name: delete-pod
spec:
  checksum: sha256:a68bf570ea30e578e392eab18ca70dbece27bce850a8dbef2586eff55c5c7aa0
  deps: |
    kubernetes>=12.0.1
  function-content-type: text
  function: |-
    from kubernetes import client,config

    config.load_incluster_config()

    def delete_pod(event, context):
        rule = event['data']['rule'] or None
        output_fields = event['data']['output_fields'] or None

        if rule and rule == "Terminal shell in container" and output_fields:
            if output_fields['k8s.ns.name'] and output_fields['k8s.pod.name']:
                pod = output_fields['k8s.pod.name']
                namespace = output_fields['k8s.ns.name']
                print (f"Deleting pod \"{pod}\" in namespace \"{namespace}\"")
                client.CoreV1Api().delete_namespaced_pod(name=pod, namespace=namespace, body=client.V1DeleteOptions())
  handler: delete-pod.delete_pod
  runtime: python3.7
  deployment:
    spec:
      template:
        spec:
          serviceAccountName: falco-pod-delete
EOF
```

```shell
function.kubeless.io/delete-pod created
```

ネームスペース*kubeless*で`Kubeless`functionを実行していて、ポート*8080*のサービス*delete-pod*で起動できるようになっています。

```shell
kubectl get pods -n kubeless

NAME                                          READY   STATUS    RESTARTS   AGE
kubeless-controller-manager-99459cb67-tb99d   3/3     Running   3          3d14h
delete-pod-d6f98f6dd-cw228                    1/1     Running   0          2m52s
```
```shell
kubectl get svc -n kubeless

NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
delete-pod   ClusterIP   10.43.211.201   <none>        8080/TCP         4m38s
```

## functionをテストする

dumbポッドを作るところから始めます：

```shell
kubectl run alpine -n default --image=alpine --restart='Never' -- sh -c "sleep 600"
```
```shell
kubectl get pods -n default
NAME     READY   STATUS    RESTARTS   AGE
alpine   1/1     Running   0          9s
```

内部で*shell*コマンドを実行して、何が起こるか見てみましょう：

```shell
kubectl exec -i --tty alpine -n default -- sh -c "uptime"

23:44:25 up 1 day, 19:11,  load average: 0.87, 0.77, 0.77
```

As expected we got the result of our command, but, if get the status of the pod now:

```shell
kubectl get pods -n default
NAME     READY   STATUS        RESTARTS   AGE
alpine   1/1     Terminating   0          103s
```

💥 **削除されました。** 💥 

これでコンポーネントのログを確認できるようになりました。

For `Falco`:
```bash
kubectl logs daemonset/falco -n falco

{"output":"23:39:44.834631763: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=alpine container=5892b41bcf46 shell=sh parent=<NA> cmdline=sh terminal=34817 container_id=5892b41bcf46 image=<NA>) k8s.ns=default k8s.pod=alpine container=5892b41bcf46","priority":"Notice","rule":"Terminal shell in container","time":"2021-01-14T23:39:44.834631763Z", "output_fields": {"container.id":"5892b41bcf46","container.image.repository":null,"evt.time":1610667584834631763,"k8s.ns.name":"default","k8s.pod.name":"alpine","proc.cmdline":"sh","proc.name":"sh","proc.pname":null,"proc.tty":34817,"user.loginuid":-1,"user.name":"root"}}
```

For `Falcosidekick`:
```shell
kubectl logs deployment/falcosidekick -n falco

2021/01/14 23:39:45 [INFO]  : Kubeless - Post OK (200)
2021/01/14 23:39:45 [INFO]  : Kubeless - Function Response : 
2021/01/14 23:39:45 [INFO]  : Kubeless - Call Function "delete-pod" OK
```

*(このfunctionは何も返さないことに注意してください。これがメッセージログが空である理由です)*

For `delete-pod` function:
```shell
kubectl logs deployment/delete-pod -n kubeless

10.42.0.31 - - [14/Jan/2021:23:39:45 +0000] "POST / HTTP/1.1" 200 0 "" "Falcosidekick" 0/965744
Deleting pod "alpine" in namespace "default"
```

## まとめ

この本当にシンプルな例では、可能性の表面を掻きむしっただけですが、すべてが可能になりました。また、いつでも[コントリビュート](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md)を歓迎します。

*ボーナス: `Kubernetes` の外で `Falcosidekick` を実行しているが、`Kubeless` の出力を使いたいと思っていませんか? 問題ありません。[README](https://github.com/falcosecurity/falcosidekick/blob/master/README.md)を参照してください。*

*ボーナス2: `Kubeless` の代わりに `Knative` を使いたい人のために、`Kubeless` は近日中にリリースされる予定です。 😉*。

*エンジョイ*

