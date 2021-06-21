---
title: Falco 0.28.0 a.k.a. Falco 2021.04
date: 2021-04-09
author: Leonardo Di Donato
slug: falco-0-28-0
---

本日、Falco 0.28.0の春のリリースを発表します🌱。

これは2021年中のFalcoの2回目のリリースです

ここでは、変更点のセットを見ていただけます：

- [0.28.0](https://github.com/falcosecurity/falco/releases/tag/0.28.0)

通常通り、stable版のFalco 0.28.0を試したい場合は、ドキュメントに記載されている手順に従ってパッケージをインストールすることができます：

- [CentOS/Amazon Linux](https://falco.org/ja/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/ja/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/ja/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/ja/docs/getting-started/installation/#linux-binary)

コンテナイメージを使う方がいいですか？全く問題ありません! 🐳

Dockerを使ったFalcoの実行については、[ドキュメント](https://falco.org/ja/docs/getting-started/running/#docker)で詳しく説明しています。

**お知らせ** このリリースから、Falco Infraのメンテナの一人であるJonahのおかげで、[AWS ECR gallery](https://gallery.ecr.aws/falcosecurity/falco-no-driver)で**falco-no-driver**コンテナイメージを見つけることができます。同じく **falco-driver-loader** コンテナイメージ ([link](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)) もあります。これは、Falco 0.27.0 の開発時に始めた、Falco コンテナイメージを他のレジストリで公開する取り組みの一環です。

## ノベルティ 🆕

それでは、Falco 0.28.0で新しくなった点をいくつかご紹介します。

完全なリストについては、[変更履歴](https://github.com/falcosecurity/falco/releases/tag/0.28.0)をご覧ください。

### ブレークチェンジ

話を始める前に、このリリースにはいくつかの**画期的な変更**があることを知っておいてください。

[bintrayの終了](https://jfrog.com/blog/into-the-sunset-bintray-jcenter-gocenter-and-chartcenter)から、公式にサポートされているすべてのディストロ用のすべての**Falcoパッケージ**は、今後、https://download.falco.org で公開されます。

私たちはすでにパッケージリポジトリと**以前のFalcoのバージョン**（Falco 0.26.1以降の開発版とFalco 0.20.0以降のすべてのステーブル版）を移動しました。

そのため、今すぐ新しいパッケージリポジトリを使い始めることができます。以下は、Falcoのリポジトリ設定をアップグレードするための[ステップバイステップガイド](https://falco.org/docs/getting-started/upgrade)です。📄

もう[Falco Bintray リポジトリ](https://dl.bintray.com/falcosecurity)は使わないでください。⚠️

また、DEBおよびRPMパッケージでは、以前のinit.dサービスユニットの代わりに、**systemd** ⚫◀️を使用していることにも注意してください。

特筆すべきもうひとつの変更点は、Falco コンテナイメージがドライバのロードをスキップするために使用していた環境変数 `SKIP_MODULE_LOAD` を明確に削除したことです。これは、Falco 0.24.0 で非推奨となりました。まだ使っている方は、`SKIP_DRIVER_LOADER`という新しい環境変数を使うように切り替えてください。⏭️

### 例外

予告通り、構造化されたルールの例外のサポートがマージされました。✔️

これは、マッチしたときに、Falco エンジンが相対的な Falco アラートを **出さない** ようにする追加条件を定義するメカニズムです。

このような機能については、[document proposing it](https://github.com/falcosecurity/falco/blob/master/proposals/20200828-structured-exception-handling.md)に詳しく書かれています。

今のところ、デフォルトのFalcoルールセットはこの例外を使用していませんが、必要に応じてこの機能を使用した独自のFalcoルールを書くことができます。

### Healthz

Carlos のおかげで、Falco Kubernetes Web サーバーは、`/healthz` エンドポイントを公開しています。

これは、Falco が稼働しているかどうかを確認するために使用できます。これは、Falco Helmチャートを改善するために、ユーザーからリクエストされた機能です。

### Falcoドライバーローダー

Falco ドライバーローダーは、Falco コンテナが起動したときに魔法のようなことをする bash の集まりですが、最初に、現在のホスト用のビルド済みの Falco ドライバーを検出してダウンロードしようとします（現在のビルド済みドライバーのリストは [ここ](https://download.falco.org/?prefix=driver/) で入手可能です）。

私たちは、4K以上のプリビルドドライバーと、新しいディストロや新しいカーネルが生まれたときにそれらを更新するメカニズムを持っているので、このような論理を逆転させることにしました。

この方法では、Falco コンテナの起動時間は、ほとんどの場合、大幅に改善され、私たちがすでに構築したホスト用の Falco ドライバーをコンパイルする必要がなくなります。

### 調整可能なドロップ

`falco.yaml` 内の `syscall_event_drops` 設定項目に新しい子 (`threshold`) が追加され、これを使ってドロップのノイズさを調整することができます。

これはパーセンテージを表すので、0から1の間の値を指定します。デフォルトでは0.1ですが、必要に応じて自由に試してみてください。

## その他すべて

### エンジンの修正

Falcoエンジンのバグ、正確にはFalcoのルール言語のバグで、数字が正しく解析されないというものがようやく修正されました。

また、複数の値を持つフィールド(リストなど)での欠損値(`NA`)の扱いに関する別のバグも修正され、存在しなくなりました。

### ルール

いつものように、私たちのコミュニティはFalcoのルールを素晴らしく改善しています!

今回のリリースでは、様々なマクロ、リスト、ルールの改良が行われています。それらの詳細については、[changelog (rules section)](https://github.com/falcosecurity/falco/releases/tag/0.28.0)をご覧ください。

3つの3️⃣新しいルール、`Debugfs Launched in Privileged Container`、`Mount Launched in Privileged Container`、`Sudo Potential Privilege Escalation`（[CVE-2021-3156](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-3156)について迅速に警告するのに非常に役立ちます）も導入されました。

## 次は？ 🔮

2021年5月4日に[0.28.1](https://github.com/falcosecurity/falco/milestone/18)のリリースを予定しています!

いつものように、最終的なリリース日は[Falco Community Calls](https://github.com/falcosecurity/community)の中で議論されます。

いつものように、バグ修正と改善を予定しています。

## 会いましょう 🤝

いつものように、私たちは毎週[コミュニティコール](https://github.com/falcosecurity/community)で会っています。
最新の情報を知りたい方は、ぜひ参加してみてください。

何か質問があれば

- [Kubernetes Slack](https://slack.k8s.io)の[#falcoチャンネル](https://kubernetes.slack.com/messages/falco)に参加する。
- [Falcoメーリングリストに参加する](https://lists.cncf.io/g/cncf-falco-dev)

すべての素晴らしいコントリビューターに感謝します! Falcoは100人のコントリビューターを達成しましたが、その他のFalcoのプロジェクトも、毎日非常に多くのコントリビューションを得ています。

これからもがんばりましょう！

Bye!

Leo
