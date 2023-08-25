---
title: The Falco Project
description: クラウドネイティブランタイムセキュリティ
weight: 1
aliases: [/jp/docs/]
---

## Falcoとは?

Falcoプロジェクトは、元々[Sysdig, Inc](https://sysdig.com)によって構築されたオープンソースのランタイムセキュリティツールです。Falcoは[CNCFに寄贈され、現在はCNCFのインキュベーションプロジェクトとなっています](https://www.cncf.io/blog/2020/01/08/toc-votes-to-move-falco-into-cncf-incubator/)。

## Falcoは何をしますか？

Falcoは実行時にカーネルからのLinuxシステムコールを解析し、強力なルールエンジンに対してストリームをアサートします。
ルールに違反した場合は、Falcoのアラートが発せられます。Falco [rules](rules)についてもっと読む

 - Parse
 - Assert
 - Alert

## Falcoは何を見ているのか？

デフォルトでは、Falco には成熟したルールのセットが同梱されています。

- 特権コンテナを使用した特権のエスカレーション 
 - `setns` のようなツールを使ったネームスペースの変更 
 - `/etc`, `/usr/bin`, `/usr/sbin` などのよく知られたディレクトリへの読み込み/書き込み
 - シンボリックリンクの作成 
 - 所有権とモードの変更 
 - 予期しないネットワーク接続またはソケットの変異
 - `execve` を使ってプロセスをSpawnした
 - `sh`, `bash`, `csh`, `zsh` などのシェルバイナリの実行
 - SSH バイナリ `ssh`, `scp`, `sftp` などを実行する
 - Linux の `coreutils` 実行ファイルを変異させる
 - ログインバイナリの変異 
 - `shadowutil` や `passwd` の実行ファイルを変異させる  
    - `shadowconfig`
    - `pwck`
    - `chpasswd`
    - `getpasswd`
    - `change`
    - `useradd`

...などなど。

## Falcoルールとは?

これらは、Falcoがアサートする項目です。これらは、Falcoの設定で定義されており、システム上で探しているものを表しています。

Falcoルールの作成、管理、デプロイの詳細については、[ルール](rules)のセクションを参照してください。

## Falco アラートとは?

これらは設定可能なダウンストリームアクションで、`STDOUT`へのロギングのような単純なものから、クライアントへのgRPCコールの配信のような複雑なものまであります。

Falcoアラートの設定、理解、開発の詳細については、[alerts](alerts)のセクションを参照してください。

## Falcoコンポーネント 

Falcoは3つの主要コンポーネントで構成されています。

 - ユーザスペースプログラム
 - [ドライバー](/docs/event-sources/drivers/)
 - [設定](configuration)

### Falcoユーザスペースプログラム

これはCLIツール `falco` です。これはユーザが対話するプログラムです。ユーザスペースプログラムは、シグナルの処理、Falcoドライバからの情報の解析、およびアラートを担当します。

### Falcoドライバー

Falcoのドライバー仕様に準拠し、システムコール情報をストリーム送信することができるソフトウェアです。

ドライバーがインストールされていないと、Falcoは動作しません。

現在、Falcoプロジェクトは以下のドライバをサポートしています。

 - (デフォルト) C++ ライブラリ `libscap` および `libsinsp` 上に構築されたカーネルモジュール
 - 同じモジュールから構築されたBPFプローブ
 - ユーザスペースの計装

ドライバーの詳細はこちらをご覧ください[こちら](/docs/event-sources/drivers/)。
 
### Falco設定 

これは、Falcoがどのように実行されるか、どのようなルールをアサートするか、アラートをどのように実行するかを定義します。Falcoを設定する方法の詳細については、[設定](configuration)のセクションを参照してください。
