---
title: Falco 0.27.0 a.k.a. "The happy 2021 release"
date: 2021-01-18
author: Lorenzo Fontana
---

今日はFalco 0.27.0のリリースをお知らせします🥳。

2021年の第一弾リリースです!

変更点のセットはこちらからご覧いただけます:

- [0.27.0](https://github.com/falcosecurity/falco/releases/tag/0.27.0)

いつものように、安定版のFalco 0.27.0を試してみたい場合は、ドキュメントに概説されているプロセスに従って、そのパッケージをインストールすることができます。:

- [CentOS/Amazon Linux](https://falco.org/ja/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/ja/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/ja/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/ja/docs/getting-started/installation/#linux-binary)

dockerイメージを使う方がいいですか？問題ありません！

DockerでFalcoを実行する方法については、[ドキュメント](https://falco.org/ja/docs/getting-started/running/#docker)に詳しく書かれています。

**重要** Falco 0.27.0 は、コンテナイメージがリリースされた最初のリリースです。また、[**Amazon ECR**](https://gallery.ecr.aws/falcosecurity/falco)にもあります。
これは、まだ[officially supported](https://github.com/falcosecurity/evolution#official-support)ではありません。現在は `falcosecurity/falco` のイメージのみを公開しています。
[@leodido](https://github.com/leodido) と [@jonahjon](https://github.com/jonahjon) に感謝します!
## 新規機能

これは完全なリストではありません。完全なリストは [変更履歴](https://github.com/falcosecurity/falco/releases/tag/0.27.0) を参照してください。

### 互換性を損なう変更
何か試す前に、このFalcoのリリースでは**互換性を損なう変更**があることに気をつけることが重要です。
設定ファイルなしでFalcoを実行することに頼っているのであれば、もうそれはできません。
すべての公式のインストール方法にはデフォルトの設定ファイルが添付されています。

### パフォーマンスノート

Falcoの出力を処理するメカニズムは、C++で完全に書き直されました(ありがとう [@leogr](https://github.com/leogr))。
このリリース以前、FalcoはLuaとC++のAPIコールの混在に依存しており、エンジンと出力メカニズムの間で多くのクロストークが発生していました。単一のC++実装を持つことは、クロストークの問題を軽減するのに大いに役立ちます。

Luaが出力に使用されなくなったので、マルチスレッド出力の妨げとなっていた唯一の理由もなくなりました。Falco 0.27.0の出力は複数のスレッドを使用することができ、また、出力が遅すぎる場合にそれを検出するメカニズムを持っています。

出力が "遅すぎる "とは、与えられた期限内にアラートを配信することができない場合、Falcoはアラートを表示します。
内部のデータソースからそのことについての不満が出てきました。デフォルトのタイムアウトは200ミリ秒です。これは `falco.yaml` の `output_timeout` で設定できます。

### それ以外の全部!

**新しいWebサイト**
お気づきの方もいらっしゃると思いますが、新しいサイトを立ち上げました! [Raji](https://github.com/Rajakavitha1)と[Lore](https://github.com/fntlnz)は、[@leogr](https://github.com/leogr)と[@leodido](https://github.com/leodido)の助けを借りて、この新しいスタイルにしました。この新しいウェブサイトは、新しいデザイン、検索バー、古いFalcoのリリースをナビゲートするために使用できる素敵なドロップダウンを特徴としています(現在利用可能なのはFalco 0.26と0.27だけです)。

**gRPCの変更**
Falco gRPC版サービスでは、Falcoエンジン版も公開されるようになりました。

**ルールの変更**

今回のリリースでは15のルール変更があります
いつものように、私たちのコミュニティはルールの質を最優先事項として大切にしています。誰もが利益を得られるように、まともなデフォルトルールのセットを維持することは、私たちにとって非常に重要です!

## 次はなんでしょうか?

2021年3月18日に[0.28.0](https://github.com/falcosecurity/falco/milestone/15)のリリースを予定しています!

いつものように、バグ修正と改善が行われる予定です。

0.28.0への移行が発表されている機能は、構造化されたルールの例外のサポートで、例外が発生したときに特定のアラートが発生しないように条件を定義する方法です。

ここでは、[@mstemm](https://github.com/mstemm)の提案を読むことができます](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md)。

さらに、私たちは次のリリースで ARM 版 (armv7 と aarch64 ビルド) の Falco をリリースしようとしています。
[Lore](https://github.com/fntlnz)は、これらのアーキテクチャにFalcoを移植するために[PR#1442](https://github.com/falcosecurity/falco/pull/1442)に取り組み、[Jonahjon](https://github.com/jonahjon)は、これらのアーキテクチャにも対応したビルド、テスト、リリースのために[私たちのインフラストラクチャーサポート](https://github.com/falcosecurity/test-infra/pull/284)に取り組んでいます。

## 会いましょう！

いつものように毎週[コミュニティコール](https://github.com/falcosecurity/community)でお会いしています。
最新かつ最高の情報を知りたい方は、そこに参加してみてはいかがでしょうか？

ご質問があれば

 - [Kubernetes Slack](https://slack.k8s.io)の[#falcoチャンネル](https://kubernetes.slack.com/messages/falco)に参加してみましょう。
 - [falcoのメーリングリストに参加してください](https://lists.cncf.io/g/cncf-falco-dev)

素晴らしいコントリビューターの皆様に感謝します！これからも元気でいてね!

Bye!

Lore

