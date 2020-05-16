---
title: Falcoカーネルモジュール
weight: 1
---

Falcoは、マシン上におけるシステムコールのストリームを利用し、それらのシステムコールをユーザー空間に渡すカーネルモジュールに依存しています。

Falcoは、`falco`と呼ばれる独自のカーネルモジュールを使用します。

# カーネルモジュールのインストール

デフォルトでは、カーネルモジュールは、falco debian/redhatパッケージをインストールするとき、または `falcosecurity/falco` Dockerイメージを実行するときにインストールされます。カーネルモジュールをインストールするスクリプトは、次の3つの方法でインストールを試みます：

* [dkms](https://en.wikipedia.org/wiki/Dynamic_Kernel_Module_Support)を使用して、ソースからカーネルモジュールをビルドします。
* ビルド済みのカーネルモジュールを`https://dl.bintray.com/falcosecurity/driver/`からダウンロードします。
* `~/.falco`からビルド済みのカーネルモジュールを探します。

ビルド済みのカーネルモジュールを使用するオプションについては、[インストール](/jp/docs/installation/)ページをご覧ください。
