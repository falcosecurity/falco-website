---
title: ドキュメンテーション ホーム
description: Falcoコンテナセキュリティシステムの概要
weight: 1
---

## Falcoについて

Falcoは、アプリケーションの異常なアクティビティを検出するように設計されたビヘイビアアクティビティモニタです。もともとSysdigによって構築されたパワフルな[システムコールキャプチャ]（https://sysdig.com/blog/fascinating-world-linux-system-calls/）テクノロジーを使用します。Falcoでは、1組の[ルール]（ルール）を使用して、コンテナ、アプリケーション、ホスト、およびネットワークアクティビティを1か所で、1つのデータソースから継続的に監視および検出できます。

### Falcoはどのようなビヘイビアを検出できますか？

Falcoは、[Linuxシステムコール]（http://man7.org/linux/man-pages/man2/syscalls.2.html）の作成に関連するすべてのビヘイビアを検出およびアラートできます。Falcoアラートは、特定のシステムコールとその引数の使用、および呼び出しプロセスのプロパティによってトリガーできます。たとえば、次の場合に簡単に検出できます。

* コンテナ内でシェルが実行する
* サーバープロセスが、予期しないタイプの子プロセスを生成する
* `/ etc / shadow`などの機密ファイルが予期せずに読み取られる
* 非デバイスファイルが `/ dev`に書き込まれる
* 標準システムバイナリ（ `ls`など）がアウトバウンドネットワーク接続を作成する

## Falcoと他のツールの比較

Falcoが[SELinux]（https://en.wikipedia.org/wiki/Security-Enhanced_Linux）、[AppArmor]（https://wiki.ubuntu.com/AppArmor）、[Auditd]（https：//linux.die.net/man/8/auditd）、およびLinuxセキュリティポリシーに関連するその他のツールとどのように異なるかをよく聞かれます。[Sysdig blog]（https://sysdig.com/blog/selinux-seccomp-falco-technical-discussion/）でFalcoを他のツールと比較する[ブログ投稿]を作成しました。

## Falcoの使用方法

Falcoは、長時間実行されるデーモンとしてデプロイされます。通常のホストまたはコンテナホストに[Debian]（installation＃debian）/[rpm]（installation＃rhel）パッケージとしてインストールするか、[container]（installation＃docker）としてデプロイするか、または [ソースから]（ソース）をビルドします。

Falcoは、（1）監視するビヘイビアとイベントを定義する[ルールファイル]（ルール）、および（2）[一般設定ファイル]（コンフィグレーション）で構成されます。ルールは、ハイレベルで人間が読める言語で表現されます。サンプルのルールファイル[`./rules/falco_rules.yaml`](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml）を出発点として、あなたの環境に適応させる（そしておそらく望むでしょう！）ことができます。

ルールを開発する際の便利な機能の1つは、`scap`形式で保存されたトレースファイルを読み取るFalcoの機能です。これにより、問題のあるビヘイビアを1回「レコード」し、ルールを調整しながら必要な回数だけFalcoでリプレイできます。

デプロイされると、FalcoはカーネルモジュールとeBPFプローブを使用して、イベントをユーザースペースに持ってきます。Falcoは、ルールファイルで定義された条件のいずれかに一致するイベントを監視します。一致するイベントが発生すると、設定された出力に通知が書き込まれます。

## Falco アラート

Falcoは疑わしいビヘイビアを検出すると、1つ以上のチャネルを介して[アラート]（アラート）を送信します。

* 標準エラーへの書き込み
* ファイルへの書き込み
* syslogへの書き込み
* 生成されたプログラムへのパイプ。この出力タイプの一般的な使用法は、Falco通知ごとに電子メールを送信することです。
