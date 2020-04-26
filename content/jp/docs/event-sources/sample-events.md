---
title: サンプルイベントの生成
weight: 4
---

Falcoが正しく動作しているかどうかを確認したい場合は、システムコールとk8s監査に関する両方のアクティビティを実行できる[`event-generator`](https://github.com/falcosecurity/event-generator)ツールがあります。

このツールは、一部またはすべてのサンプルイベントを実行するコマンドを提供します。

```
event-generator run [regexp]
```
引数がない場合、すべてのアクションが実行されます。それ以外の場合は、指定された正規表現に一致するアクションのみが実行されます。

コマンドラインの完全なドキュメントは[こちら](https://github.com/falcosecurity/event-generator/blob/master/docs/event-generator_run.md)です。

## ダウンロード 
| アーティファクト     |  | バージョン |
|------|----------|----------|
| binaries | [download link](https://github.com/falcosecurity/event-generator/releases/latest) | [![Release](https://img.shields.io/github/release/falcosecurity/event-generator.svg?style=flat-square)](https://github.com/falcosecurity/event-generator/releases/latest) |
| container images | `docker pull falcosecurity/event-generator:latest` | [![Docker Image Version (latest semver)](https://img.shields.io/docker/v/falcosecurity/event-generator?color=blue&style=flat-square)](https://hub.docker.com/r/falcosecurity/event-generator/tags) |

## サンプルイベント

### システムコールアクティビティ

{{< info >}}

**注意** — 一部のコマンドはシステムを変更する可能性があるため、Docker(下記参照)内でプログラムを実行することを強くお勧めします。たとえば、一部のアクションは、`/bin`, `/etc`, `/dev`などの下のファイルとディレクトリを変更します。

{{< /info >}}

`syscall`コレクションは、[デフォルトのFalcoルールセット](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml)によって検出されるさまざまな疑わしいアクションを実行します。

```shell
docker run -it --rm falcosecurity/event-generator run syscall --loop
```

上記のコマンドは永久にループし、毎秒サンプルイベントを絶え間なく生成します。


### Kubernetes 監査アクティビティ

`k8saudit`コレクションは、[k8s監査イベントルールセット](https://github.com/falcosecurity/falco/blob/master/rules/k8s_audit_rules.yaml)に一致するアクティビティを生成します。


```shell
event-generator run k8saudit --loop
```

上記のコマンドは永久にループし、現在のネームスペースにリソースを作成し、各反復後にそれらを削除します。 別のネームスペースを選択するには、`--namespace`オプションを使用します。


## K8sでのイベントジェネレーターの実行

また、K8sクラスターでのイベントジェネレーターの実行を容易にするK8sリソースオブジェクトファイルも提供しています：

* [`role-rolebinding-serviceaccount.yaml`](https://github.com/falcosecurity/event-generator/blob/master/deployment/role-rolebinding-serviceaccount.yaml)は、サービスアカウント、クラスターロール、および サービスアカウント`falco-event-generator`を許可する役割。
* [`event-generator.yaml`](https://github.com/falcosecurity/event-generator/blob/master/deployment/event-generator.yaml)は、すべてのサンプルイベントをループで実行するデプロイメントを作成します。
* [`run-as-job.yaml`](https://github.com/falcosecurity/event-generator/blob/master/deployment/run-as-job.yaml)は、すべてのサンプルイベントを一度実行するジョブを作成します 。


たとえば、次のコマンドを実行して、現在のネームスペースに必要なオブジェクトを作成し、イベントを継続的に生成できます：

```
kubectl apply -f deployment/role-rolebinding-serviceaccount.yaml \
  -f deployment/event-generator.yaml
```

上記のコマンドは、デフォルトのネームスペースに適用されます。 別のネームスペースにデプロイするには、`--namespace`オプションを使用します。 イベントは同じネームスペースで生成されます。

リポジトリ[ドキュメント](https://github.com/falcosecurity/event-generator#with-kubernetes)には、他の例もあります。