---
title: Falcoの設定
weight: 5
notoc: true
---

Falcoの設定ファイルは、 'key:value'または'key:[value list]'ペアのコレクションを含む[YAML](http://www.yaml.org/start.html)ファイルです。

設定オプションはすべて、'-o/--option key=value'フラグを使用してコマンドラインで上書きできます。'key:[value list]'オプションの場合、'--option key.subkey=value'を使用して個々のリスト項目を指定できます。

## 現在の設定オプション

{{< config >}}
