---
title: 設定
description: Falco デーモンの設定
weight: 4
notoc: true
---

{{< info >}}

これはFalcoデーモンの設定オプションのためのものです。

これらのオプションについては、[rules]（.../rules）または[alerts]（.../alerts）を参照してください。

{{< /info >}}


Falcoの設定ファイルは[YAML](http://www.yaml.org/start.html)ファイルで、`key: value` または `key: [value list]` のペアのコレクションを含むファイルです。


設定オプションはコマンドラインで `-o/--option key=value` フラグを使って上書きすることができます。オプションの場合、`-o/--option key.subkey=value` フラグを使って個々のリスト項目を指定することができます。オプションでは、`--option key.subkey=value` を使って個々のリスト項目を指定することができます。

## 現在の設定オプション


[comment]: <> (@kris-nova: This data is loaded from the YAML file in data/en/config.yaml)
{{< config >}}
