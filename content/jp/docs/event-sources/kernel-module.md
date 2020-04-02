---
title: Falcoカーネルモジュール
weight: 1
---

Falcoは、マシン上におけるシステムコールのストリームを利用し、それらのシステムコールをユーザー空間に渡すカーネルモジュールに依存しています。

v0.6.0より前のバージョンでは、`sysdig-probe`と呼ばれるSysdigのカーネルモジュールが使用されていました。0.6.0以降では、falcoは独自のカーネルモジュール `falco-probe`を使用します。カーネルモジュールは実際には同じソースコードから構築されていますが、falco固有のカーネルモジュールを使用すると、ドライバーの互換性の問題なしにfalcoとSysdigを個別に更新できます。

# カーネルモジュールのインストール

デフォルトでは、カーネルモジュールは、falco debian/redhatパッケージをインストールするとき、または `falcosecurity/falco` Dockerイメージを実行するときにインストールされます。カーネルモジュールをインストールするスクリプトは、次の3つの方法でインストールを試みます：

* [dkms](https://en.wikipedia.org/wiki/Dynamic_Kernel_Module_Support)を使用して、ソースからカーネルモジュールをビルドします。
* ビルド済みのカーネルモジュールをdownloads.draios.comからダウンロードします。
* `~/.sysdig`からビルド済みのカーネルモジュールを探します。

または、ビルド済みのカーネルモジュールを使用するオプションの場合、カーネルモジュールには次のファイル名が必要です：`falco-probe-<falco version>-<arch>-<kernel release>-<kernel config hash>.ko` `<kernel config hash>`は、カーネルオプションを設定する設定ファイルのmd5sumです（たとえば、`/boot/config-4.4.0-64-generic`)。このファイルは他の場所に置くこともできます。カーネル設定ファイルを検索する一連のパスの詳細については、[kernel module builder script](https://github.com/falcosecurity/falco/blob/master/scripts/falco-driver-loader)をご覧ください。
