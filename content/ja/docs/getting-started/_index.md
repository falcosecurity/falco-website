---
title: はじめに
description: Falcoの使用を開始する
weight: 2
---
ローカルマシン、クラウド、管理されたKubernetesクラスター、またはIoT & Edge computing上で動作するK3sなどのKubernetesクラスターにFalcoをデプロイすることができます。

## Falcoのアーキテクチャ

Falcoは、Linuxシステムコールを行うことを含むあらゆる動作を検出し、アラートを出すことができます。Falcoのアラートは、特定のシステムコール、引数、および呼び出しプロセスのプロパティに基づいてトリガされます。Falcoはユーザスペースとカーネルスペースで動作します。システムコールは、Falcoカーネルモジュールによって解釈されます。システムコールは、ユーザスペースのライブラリを使って解析されます。次に、イベントは、Falcoルールが設定されたルールエンジンを使用してフィルタリングされます。疑わしいイベントは、その後、Syslog、ファイル、標準出力などとして設定された出力にアラートされます。


![Falco Architecture](/docs/images/falco_architecture.png)
## デプロイメント
現在、以下の方法でFalcoをデプロイすることができます：
- Linuxホスト上でFalcoを[ダウンロード](/ja/docs/getting-started/download)して実行するか、コンテナ上でFalcoユーザスペースプログラムを実行し、基盤となるホストにドライバをインストールします。
- ソースから[ビルド](/ja/docs/getting-started/source)し、Linuxホストまたはコンテナ上でFalcoを実行します。

