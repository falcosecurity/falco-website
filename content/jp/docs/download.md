---
title: ダウンロード
description: 公式にサポートされているFalcoアーティファクト
weight: 2
---

## Downloading

Falcoプロジェクトコミュニティは、Falcoをダウンロードして実行するための2つの方法のみをサポートしています:

 - LinuxホストでFalcoを直接実行する
 - 基礎となるホストにドライバーがインストールされたコンテナでFalcoユーザースペースプログラムを実行する
 
以下に両方のアーティファクトがあります。


### Download for Linux {#packages}

|        | development                                                                                                                 | stable                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| rpm    | [![rpm-dev](https://img.shields.io/bintray/v/falcosecurity/rpm-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][1] | [![rpm](https://img.shields.io/bintray/v/falcosecurity/rpm/falco?label=Falco&color=%23005763&style=flat-square)][2] |
| deb    | [![deb-dev](https://img.shields.io/bintray/v/falcosecurity/deb-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][3] | [![deb](https://img.shields.io/bintray/v/falcosecurity/deb/falco?label=Falco&color=%23005763&style=flat-square)][4] |
| binary | [![bin-dev](https://img.shields.io/bintray/v/falcosecurity/bin-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][5] | [![bin](https://img.shields.io/bintray/v/falcosecurity/bin/falco?label=Falco&color=%23005763&style=flat-square)][6] |

利用可能なすべてのアーティファクトのリストは、[こちら](https://bintray.com/falcosecurity)にあります。

---

### Download container images {#images}

{{< info >}}

Falcoは、実行中のシステムコールに関する情報を取得するために、ホストシステムにドライバーをインストールすることに依存しています。

推奨されるインストール方法は、上記で定義されたネイティブアーティファクトを使用してドライバーをインストールするか、
特権として `falcosecurity/falco-driver-loader`イメージを一時的に実行してから、`falcosecurity/falco-no-driver`を使用します。

詳細については、[Dockerセクション内で実行](/docs/running#docker)を参照してください。

{{< /info >}}

|tag | pull command | description |
|----|----------|-----------------|
|[latest](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:latest` | 最新バージョン |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:<version>` | `{{< latest >}}`などの特定のバージョンのFalco |
|[latest](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:latest` | ビルドツールチェーンを備えた `falco-driver-loader`の最新バージョン |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:<version>` | ビルドツールチェーンを備えた`{{< latest >}}`などの  `falco-driver-loader`の特定のバージョン |
|[latest](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:latest` | `falco-driver-loader`が含まれる最新バージョン |
|[*version*](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:<version>` |  `{{< latest >}}`のような、`falco-driver-loader`が含まれた特定バージョンのFalco |

利用可能なすべてのイメージのリストは、[こちら](https://github.com/falcosecurity/falco/tree/master/docker)にあります。

[1]: https://dl.bintray.com/falcosecurity/rpm-dev
[2]: https://dl.bintray.com/falcosecurity/rpm
[3]: https://dl.bintray.com/falcosecurity/deb-dev/stable
[4]: https://dl.bintray.com/falcosecurity/deb/stable
[5]: https://dl.bintray.com/falcosecurity/bin-dev/x86_64
[6]: https://dl.bintray.com/falcosecurity/bin/x86_64