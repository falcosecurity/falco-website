---
exclude_search: true
title: Falcosidekick 2020
date: 2021-01-12
author: Thomas Labarussias
slug: falcosidekick-2020
---

この素晴らしい投稿は [@leodido](https://github.com/leodido) からのもので、Falcoのための前年2020年はどのようにされているかについてインスピレーションを受けました ([リンク](https://falco.org/ja/blog/2020%E5%B9%B4%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8Bfalco/)) 私は2020年に私たちが`falcosidekick`のために構築したものについてみんなをスピードアップさせたいと思っていました。

多くの改良とバグ修正のほかに、8つの新しい出力が統合されました。
* **Rocketchat**
* **Mattermost**
* **Azure Event Hub**
* **Discord**
* **AWS SNS**
* **GCP PubSub**
* **Cloudwatch Logs**
* **Apache Kafka**

以前のリリースで本当に変わったのは、ほとんどすべての出力が `falco` コミュニティの他のメンバー (親切にも *famiglia* 😉 と呼ばれています) によって提案され、開発されたことです。それは私の心を温めてくれます♥️ そして、オープンソースプロジェクトを管理する方法について多くのことを学ばせてくれます。

あなたのアイデア、コメント、ヘルプ、PR、レビューなど、みんなに感謝しています。

次のチャートは、この小さなプロジェクトが、最終的に何人かの人や企業の役に立つようになったことで、物事がどのように大きくなっているかをよく示しています。

![falcosidekick github activity 2020](/img/falcosidekick-github-activity-2020.png)

私と一緒に`falcosidekick`の公式メンテナーになってくれた[@cpanato](https://github.com/cpanato)、[@KeisukeYamashita](https://github.com/KeisukeYamashita)、[@nibalizer](https://github.com/nibalizer)に特別な🙏。🎉 彼らに乾杯 

最後になりましたが、彼のサポートとモチベーションを支えてくれた[@danpopSD](https://github.com/cpanato)への友情を紹介します。Merci mon ami.

#### 次は？

##### リリース 2.20.0

この記事が出る数回前に、私たちは `falcosidekick` の始まり以来最大のバージョンの一つをリリースしました。多くの人の努力の賜物です。

完全な変更履歴は [ここ](https://github.com/falcosecurity/falcosidekick/releases/tag/2.20.0) で見ることができます。

主な変更点は、3つの新しい出力です：

- [**STAN (NATS Streaming)**](https://docs.nats.io/nats-streaming-concepts/intro)
- [**PagerDuty**](https://pagerduty.com/)
- [**Kubeless**](https://kubeless.io/) *(このことについての記事がすぐに出ますので、ご期待ください 😉)*

##### そして？

私たちは、`falco + falcosidekick` のデュオがほとんどのインフラにとって明白なソリューションであると信じており、コードベースとドキュメントの改善に懸命に取り組んでいます。これが次のメジャーリリース `3.0.0` の主要な目標となります。それまでは、[n3wscott](https://github.com/n3wscott)の助けを借りて、新しいHTTP出力に[`Cloudevents`](https://cloudevents.io/)の仕様を追加する作業を行っています。これにより、`falco`のイベントを[`Knative`](https://knative.dev/)のようなより多くのバックエンドに転送することができるようになります。

*お楽しみに