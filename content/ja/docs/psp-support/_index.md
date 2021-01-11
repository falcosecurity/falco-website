---
title: K8sポッドセキュリティポリシー(PSP)のサポート
weight: 3
---

## Falcoにおけるポッドセキュリティポリシーのサポート

0.18.0において、FalcoはK8sポッドセキュリティポリシー(以下、PSP)をサポートしています。 具体的には、PSPをクラスターに実際にデプロイせずに、PSPをPSPの条件を評価する一連のFalcoルールに変換できます。

## 動機

PSPは、ポッドの動作を制限し、クラスター全体に一貫したセキュリティポリシーを適用するための豊富で強力なフレームワークを提供しますが、セキュリティポリシーにしたいこととクラスターが実際に実行していることとのギャップを知ることは困難です。 さらに、PSPは一度適用されると強制されるため、ポッドの実行を妨げる可能性があり、クラスター上でPSPをライブで調整するプロセスは混乱を招き、痛みを伴う場合があります。

そこでFalcoが活用できます。FalcoがPSPの「ドライラン」評価を実行できるようにし、デプロイされたポッドの動作を監視するFalcoルールに変換し、ブロックせずに違反のアラートを送信できるようにします。 これにより、オーサリングサイクルが加速され、クラスターに直接デプロイすることなく、PSPの完全なオーサリングフレームワークが提供されます。

## ツール

サポート機能は、2つのコンポーネントで構成されています。`falcoctl convert psp`はPSPから一連のルールを生成し、`falco`にはこれらのルールを実行するために必要な新しいフィールドがあります。

### Falcoctl Convert PSP

[falcoctl convert psp](https://github.com/falcosecurity/falcoctl)ツールは、PSPを入力として読み取り、PSPにおける制約を評価するFalcoルールファイルを作成します。 以下に例を示します：

以下のPSPでは、特権イメージを禁止し、ルートファイルシステムを強制しますが、hostPIDなどの他の一般的なプロパティを許可しています：

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

PSPにはアノテーション`falco-rules-psp-images`が記述されています。 これは、生成されたルールの範囲を特定のコンテナセットに制限するために使用されます。 アノテーションの値は文字列ですが、文字列はルールが適用されるコンテナイメージのリストである必要があります。

`falcoctl convert psp --psp-path test_psp.yaml --rules-path psp_rules.yaml`を実行すると、次のルールファイルが生成されます。 その後、`falco -r psp_rules.yaml`を使用してFalcoを実行できます：

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

### PSPルールの評価に対するFalcoサポート

これらの新しいルールをサポートするために、一連の追加のフィルターフィールドを定義し、ポッド仕様のコンテナのセットのプロパティをdesirable/undesirable値のセットと比較しやすくする新規にオペレータ`intersects`を追加しました。 いつものように、`falco --list`を実行すると、サポートされているフィールドと説明のリストが確認できます。


ほとんどの場合、PSPから生成されたルールは[K8s監査ログサポート](../../docs/event-sources/kubernetes-audit/)に依存しているため、ルールを最大限に活用するには、それを有効にする必要があります。
