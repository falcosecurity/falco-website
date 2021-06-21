---
title: ドライバーとライブラリーのコントリビューション
date: 2021-02-23
author: Leonardo Di Donato, Leonardo Grasso
slug: contribution-drivers-kmod-ebpf-libraries
---

![Contribution of the drivers and the libraries to the CNCF!](/img/falco-contributes-libraries-cncf-featured.png)

この度、Sysdig社より、**kernel module**、**eBPF** probe、**libraries**がCloud Native Computing Foundationに寄贈されました。これらのコンポーネントのソースコードはFalcoの組織に移されました。すでに[falcosecurity/libs](https://github.com/falcosecurity/libs)のリポジトリで見ることができます。

このコントリビューションは、Falcoの作者が過去数ヶ月の間にFalcoコミュニティに提示し、議論した[プロポーザル](https://github.com/falcosecurity/falco/blob/master/proposals/20210119-libraries-contribution.md)に概説されている広範なプロセスの最初のものですが、根本的な部分です。

皆さんがご存知のように、Falcoは主にシステムコールのデータソースの上で動作します。このデータソースは、私たちがドライバーと呼ぶカーネルモジュールまたはeBPFプローブを使って収集されます。この2つのドライバーは、機能的には同等です。パフォーマンスの面では、カーネルモジュールの方がほんの少し効率的で、eBPFのアプローチはより安全で先端的です。Falcoで使用する前に、収集したデータをエンリッチメントする必要があります（例えば、ファイル記述子の番号をファイル名やIPアドレスに変換する必要があります）。エンリッチメントは2つのライブラリで実現されます：`libsinsp`と`libscap`です。

![The complete Falco architecture with drivers and libraries!](/img/falco-diagram-blog-contribution.png)

## 将来の計画

今後数ヶ月の間に、これらのコンポーネントをさらに素晴らしいものにし、コミュニティで利用できるようにすることを計画しました。

- CMakeファイルのモダナイズによるビルドメカニズムの改善
- SemVer 2.0のバージョニングメカニズムの定義
- 堅牢なテストスイートの実装
- 私たちの美しい[Falco Prow Infra](https://prow.falco.org/)を通じて、継続的インテグレーションのジョブを設定します。
- [download.falco.org](https://download.falco.org/)でホスティングして、主要なディストロのパッケージとしてこれらのライブラリを配布します。
- APIのドキュメント化

ご覧の通り、やるべきことはたくさんあります！ 新たなコントリビューションの機会です😄

## 既存のプルリクエストを移行する方法

これらのコンポーネントに関して、[draios/sysdig](https://github.com/draios/sysdig/pulls)に対して進行中のプルリクエストがある場合は、[falcosecurity/libs](https://github.com/falcosecurity/libs)のリポジトリに移動させるための手順を以下に示します。


すでにあなたのGitHubハンドルの下に https://github.com/falcosecurity/libs のフォークと https://github.com/draios/sysdig のフォークがあり、それらがそれぞれのアップストリームと同期していることを前提とします：

あなたの`falcosecurity/libs`のフォークをローカルにクローンします：
```console
git clone https://github.com/<your_handle>/libs
cd libs
```

あなたの `draios/sysdig` フォークにリモートを追加します：
```console
git remote add sysdig-fork https://github.com/<username>/sysdig.git
git fetch --all
```

プルリクエストのブランチをチェックアウトします：
```console
git checkout --no-track -b <branch> sysdig-fork/<branch>
```

`master` ブランチにRebaseします：
```console
git rebase -i --exec 'git commit --amend --no-edit -n -s -S' master
```

そして、それを `<your_handle>/libs` リポジトリにプッシュします:
```console
git push -u origin <branch>
```

これで、https://github.com/falcosecurity/libs に PR を開設する準備が整いました。いつものように、GitHub のユーザーインターフェイスから手動で行うこともできます。

## まとめ

このような素晴らしいソフトウェアのコントリビューションは、Falcoだけでなく、他のプロジェクトがよりセキュアなCloud-Native環境を手に入れるのに役立ちます。このコントリビューションについての詳しい情報は、Loris Degioanniの[CNCF blog post](https://www.cncf.io/blog/2021/02/24/sysdig-contributes-falcos-kernel-module-ebpf-probe-and-libraries-to-the-cncf/)にあります。

Falco の他に、[sysdig cli-tool](https://github.com/draios/sysdig) もこれらのライブラリを使用するようにリファクタリングされました。今後は、他のプロジェクトでもこれらのライブラリを利用することができます。私たちは、皆さんがこれらのライブラリを使ってどのようなものを作るのか、ワクワクしています。

もし、Falcoについてもっと知りたいのであれば：

- GitHubのFalcoプロジェクト](https://github.com/falcosecurity/falco)をチェックしてください。
- Falco コミュニティ](https://falco.org/community/)に参加する。
- #falco channel (Kubernetes Slack)](https://kubernetes.slack.com/?redir=%2Fmessages%2Ffalco)でメンテナーに会いましょう。
- ツイッターで[@falco_org](https://twitter.com/falco_org)をフォローする。