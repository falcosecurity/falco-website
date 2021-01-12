---
title: 2020年におけるFalco
description: パンデミックイヤーにおけるFalcoとそのコミュニティの進行状況のレビュー
date: 2021-01-03
author: Leonardo Di Donato
---

この投稿の範囲は、パンデミックイヤーの間にファルコとそのコミュニティの進行状況をレビューすることです。この一年は決して忘れられないものになるでしょう。

私はコンパクトにまとめようとしますが、Falcoとそのコミュニティは今年、ブログ記事のシリーズになりそうなほど成長しました。

2020年は、私たちが完全に、そして最終的に**Falcoのリリースプロセスをオープンにした年でした**! 📖

2019年に[Lorenzo](https://github.com/fntlnz)と[I](https://github.com/leodido)が[Sysdig](https://sysdig.com)に参加した時はそうではありませんでした。

これは、[FalcoをCNCFインキュベーションレベルに移行させる](https://www.cncf.io/blog/2020/01/08/toc-votes-to-move-falco-into-cncf-incubator)というプロセスから出てきた必須要件でした。

そう、2020年はFalcoが[Cloud Native Computing Foundation](http://cncf.io)の**インキュベーションレベルのホストプロジェクト**として受け入れられた年でもあります。

現在、[Falco release process](https://github.com/falcosecurity/falco/blob/master/RELEASE.md)がオープンしており、いくつかのFalcoメンテナが私たちの[Community Calls](https://github.com/falcosecurity/community)の間に自分自身を提案し、彼らが次のFalcoリリースをリードしています。🔄

リリースの流れをオープンにしながらも、この機会に：

- Falcoに、より明確で首尾一貫したSemVer 2.0のバージョニングスキームを提供します。
- Falcoドライバー版とFalco版を分ける
- ドライバーの名前をより一貫性のある方法で変更します。
- アーティファクトを再構築する
- マスターブランチでのマージと新しいリリースのたびに、自動的に Falco パッケージを作成し、[Bintray](https://bintray.com/falcosecurity) のパッケージリポジトリ (tarball, DEB, RPM) にプッシュするようになりました。📦
- コンテナのイメージを再編成する
- マスターブランチへのマージや新しいリリースのたびに、コンテナイメージを自動的にビルドして [DockerHub](https://hub.docker.com/u/falcosecurity) 🐳に公開します。
- AWS ECR Gallery](https://gallery.ecr.aws/falcosecurity/falco)にも近日公開予定です ([1512](https://github.com/falcosecurity/falco/pull/1512)にも近日中に統合予定です)
- falcosecurityのGitHub組織に[新しいFalcoプロジェクトとコミュニティリソースを進化させ、インキュベートするプロセス](https://github.com/falcosecurity/evolution) ↗を設定する。

これらのトピックについてもっと知りたい場合は、[この記事](https://falco.org/blog/falco-0-21-0)と[この記事](https://falco.org/blog/falco-0-23-0)は、このFalcoブログ記事をお読みください。

その一方では、ユーザーが手動でホスト用のFalcoドライバをプレビルドできるように、[driverkit](https://github.com/falcosecurity/driverkit)を構築しました。そして、このツールを使用して[Drivers Build Grid](https://github.com/falcosecurity/test-infra/tree/master/driverkit)を作成し、最初はCircleCI上で実行し、現在は**Prow**と**Kubernetes**でバックアップされた**AWS**上の**Falco Infra](https://github.com/falcosecurity/test-infra)上で実行できるようにしました。

私たちは最終的に、ビルド済みのFalcoドライバーの保存方法を再整理しました。[download.falco.org](https://download.falco.org)をご覧ください。

私がお話しした**Falco Infra**を見てみませんか？🛠

[prow.falco.org](https://prow.falco.org)を見てみましょう。なんという素晴らしい結果でしょうか！

このトピックが本当に気になった場合は、AWSオープンソースブログのJonahとの共著である、 acsadeSo_1F517-manserver [このブログ記事](http://bit.ly/falco-prow-aws)で詳細を読むことができます。

私は、Falco Infra WGの参加者全員（Spencer, Massimiliano, Lorenzo, Grasso, Umang）、特にAmazonの[Jonah](https://github.com/jonahjon/)に公に感謝したいと思います。

Falcoの採用に大きな役割を果たしたもう一つの分野は、[Falco Helm chart](https://github.com/falcosecurity/charts)です。📋

私たちはそれらを自発的に、修正し、絶えず改善しました。
私たちのコミュニティは、[Spencer](https://github.com/nibalizer)のような外部のコントリビューターが、毎日チャートを健全に保つのを助けてくれるほど、これらのチャートを気に入ってくれています。

[falcosidekick](https://github.com/falcosecurity/falcosidekick)のように。🔫

[Thomas](https://github.com/issif)がFalco出力アラートを強化するためにここで行ったことは、まさに素晴らしいものです。彼がFalco出力アラートと統合したツールをここにリストアップすると、この記事がさらに長くなります。

ということで、POPの[このブログ記事](https://www.cncf.io/blog/2020/08/17/falco-update-whats-new-in-falco-0-25) (part #4 🔗) を読んで、POPのことをもっと知ってください。

彼のことを言ってしまったので、まだ知らない方のために。[POP](https://github.com/danpopsd)、私の大きなイタリア系アメリカ人の友人、[Falcoのコミュニティとエコシステムが前例のないレベルに輝くのを助けるために私たちに参加しました](https://www.cncf.io/blog/2020/12/14/join-pop-falco-org)。間違いなく: 彼はFalcoコミュニティに素晴らしい仲間入りをしてくれました。

2020年はFalcoのコミュニティが確実に離陸した年だったことは明らかだと思います! そうでしょう?

私たちが今どれだけのメンテナーを持っているかを見てみましょう。この **美しい** [mentainerers.yaml](https://github.com/falcosecurity/.github/blob/master/maintainers.yaml)を見て、私たちのFalco Infraが生成するように指示しました。👥

さまざまな企業（IBM、Amazon、メルカリ、Hetzner Cloud、DeltaTreなど）から新しい外部コントリビューターを多く取り入れ、彼らのおかげで違いが生まれました。

これがオープンソースの力、人が集まるとこうなるんですね。🤗

技術的な観点から見ると、Falcoへの最も困難で最も重要な貢献（IMHO）は、3月にLorenzoと私が開発したFalco eBPFドライバーの修正でした。🔬

実際、私が言ったように、本当の問題はeBPFのVMにありました。

いずれにしても、Falcoのコア技術を改善するために、この1年で多くのことが行われてきました。

私が今思い出すことのできるトップのものは（順不同）、以下の通りです（何か忘れているかもしれませんが、ご容赦ください）：

- Falco アラートにおける `<NA>` 値の存在を修正しました ([1133](https://github.com/falcosecurity/falco/pull/1133), [1138](https://github.com/falcosecurity/falco/pull/1138), [1140](https://github.com/falcosecurity/falco/pull/1140), [1492](https://github.com/falcosecurity/falco/pull/1492) ） 🩺
- valgrindで動かしている時の様々なメモリリークを修正🔩
- gRPC Falco Outputs APIの性能向上と双方向化([1241](https://github.com/falcosecurity/falco/pull/1241))👉👈
- Falco Output APIの Lua から C++ への移植 ([1412](https://github.com/falcosecurity/falco/pull/1412) の [Grasso](https://github.com/leogr))に感謝します🔧
- 他のgRPC APIをFalcoコアに追加
  - Version API
  - gRPC Falco Outputs APIを使用してドロップアラートをストリーム配信します。
- dropの調査
- 100%静的にリンクされたバージョンのFalco (thanks [Lorenzo](https://github.com/fntlnz)!)⛓
- aarch64でFalcoをビルド（またもやLorenzoさんに感謝：[1442](https://github.com/falcosecurity/falco/pull/1442))⚙
- カーネルモジュールやeBPFプローブを使用せずにFalcoを実行できるようにするユーザスペースの計装化
  - そして、最初のユーザスペースFalcoドライバ - すなわち、[pdig](https://github.com/falcosecurity/pdig) - LorisとGrzegorzに感謝します。

大事なことを忘れていたのは100％間違いない。でも、今日食べたパネトーネの量を考えると、🍞、ここに書いたことを思い出して書いたことは、私の頭の中ではかなり良い結果だと思っています。

## 2021年を垣間見る

2021年は、ユーザーがプログラム可能なFalcoを計画している年ですので、ご期待ください。📻

私たちは本物の Falco ルール言語を書いています。⚗

私たちはクールな C API (libhawk かな？) のセットを準備しています。🧪

私たちはFalcoのウェブサイトを改訂しています(watch [falco-website#324](https://github.com/falcosecurity/falco-website/pull/324))。

また、新しい開発者向けのクールなドキュメント (watch [1513](https://github.com/falcosecurity/falco/pull/1513)) を読んで、Falco コアにコントリビュートする準備をしてください! 📔
