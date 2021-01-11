---
title: ドロップされたシステムコールイベントにおけるアクション
weight: 3
---
# 概要

v0.15.0で導入されたエンハンスメントにより、Falcoはドロップされたシステムコールイベントをインテリジェントに検出し、アラートやFalco全体の終了などの修正アクションを実行できるようになりました。システムコールイベントが削除されると、使用中のプロセス、ファイル、コンテナ、オーケストレーターメタデータの内部ビューを構築するときにFalcoで問題が発生し、そのメタデータに依存するルールに影響を与える可能性があります。Falcoが提供する明示的なシグナルにより、ドロップされたシステムコールを簡単に検出できるようになりました。

この機能の詳細については、[CVE-2019-8339](https://sysdig.com/blog/cve-2019-8339-falco-vulnerability/)のブログ投稿を参照してください。


## 実装

Falcoは毎秒、カーネルモジュール/eBPFプログラムによって入力されるシステムコールイベントカウントを読み取ります。読み取り値には、処理されたシステムコールの数が含まれます。最も重要なのは、カーネルがシステムコール情報をカーネルとユーザースペース間の共有バッファーに書き込もうとした時のバッファーがいっぱいであることが判明した回数です。これらの失敗した書き込み試行は、*ドロップされた*システムコールイベントと見なされます

ドロップされたイベントが少なくとも1つ検出されると、Falcoは次のいずれかのアクションを実行します：

* `ignore`: アクションは実行されません。空のリストが指定された場合、無視が想定されます。
* `log`: バッファがいっぱいであることを知らせる重要なメッセージをログに記録します。
* `alert`: バッファがいっぱいであることを示すFalcoアラートを発します。
* `exit`: non-zero rcでFalcoを終了します。

以下に、サンプルのログメッセージ、アラート、および終了メッセージを示します：

```
Wed Mar 27 15:28:22 2019: Falco initialized with configuration file /etc/falco/falco.yaml
Wed Mar 27 15:28:22 2019: Loading rules from file /etc/falco/falco_rules.yaml:
Wed Mar 27 15:28:24 2019: Falco internal: syscall event drop. 1 system calls dropped in last second.
15:28:24.000207862: Critical Falco internal: syscall event drop. 1 system calls dropped in last second.(n_drops=1 n_evts=1181)
Wed Mar 27 15:28:24 2019: Falco internal: syscall event drop. 1 system calls dropped in last second.
Wed Mar 27 15:28:24 2019: Exiting.
```

## アクションレートスロットリング

ログメッセージ/アラートのフラッディングの可能性を減らすために、アクションを管理するトークンバケットが提供されています。トークンバケットのデフォルトパラメータは、最大10メッセージのバーストが許可された、30秒あたり1つのアラートのレートです。

## 設定

ドロップされたシステムコールイベントに対して実行するアクションとトークンバケットのスロットルパラメーターは、`falco.yaml`で設定可能であり、[syscall_event_drops](../../configuration)で説明されています。
