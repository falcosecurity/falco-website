---
title: カスタムカーネルを使ったWSL2上のFalco
description: WSL2 で Falco カーネルモジュールを有効にする方法
date: 2021-01-05
author: Nuno do Carmo
slug: falco-wsl2-custom-kernel
---

# Falco on WSL2

あなたはFalcoを愛し、素晴らしいブログ[2020年のFalco - The Falco Project](https://falco.org/ja/blog/2020年におけるfalco/)を読んだだけで、この成長している素晴らしいコミュニティの一部になりたいと思うでしょう。"でも"あなたはWindows 10を使っていて、どうやって実行するのか疑問に思っていますか？

さて、お待たせしました! WSL2のボートに乗ってコルセアを辿りましょう。



# 前提条件

今回のブログ記事では、以下の技術を使用します。

- Windows 10 Insiders (Devチャンネル)

  - バージョン21277を使用します

- WSL2 機能が有効で、デフォルトのディストリビューションがインストールされています。

  - このバージョンでは、下記のコマンドが実行されています:
    ```powershell
    wsl --install --distribution ubuntu
    ```

  - ただし、今回のブログ記事では、[Ubuntu Community Preview]([Announcing Ubuntu on Windows Community Preview - WSL2 - Ubuntu Community Hub](https://discourse.ubuntu.com/t/announcing-ubuntu-on-windows-community-preview/19789)) distroを使用します。

- [Linux カーネルバージョン 5.10.4](https://www.kernel.org/) (atest stable)

  - 現在のデフォルトWSL2カーネル: 5.4.72-microsoft-standard-WSL2
  
    - まだ WSL2 カーネル 4.x を持っている場合は、以下のコマンドで更新することができます。
  
      ```powershell
      wsl --update
      ```
  
    > **注意**: 新しいWSL2カーネルをコンパイルすると、Microsoftカスタムモジュール "DXGKRNL "が利用できなくなります。

- [Optional]: [Windows Terminal](https://github.com/microsoft/terminal)



# WSL2 用の (カスタム) カーネル

まず最初に、WSL2用のカーネルのコンパイル方法を詳しく説明しません。単純に、ZFSモジュールについては既に[それを行った](https://wsl.dev/wsl2-kernel-zfs/)からです。

これはまた、私が直接、あなたに有益なビットを提供する喜びを持っていることを意味します。



> *注: 最高のパフォーマンスを保証するために、コンパイルのすべての作業はWSL2ファイルシステムの**内部**から行われます。

WSL2distroでターミナルを起動してみましょう。

```bash
# WSL2のホームディレクトリに移動
cd

# 必要なパッケージをインストールする
# Source: https://github.com/microsoft/WSL2-Linux-Kernel/blob/7015d6023d60b29c3be4c6a398bed923b48b4341/README-Microsoft.WSL2
sudo apt install -y build-essential flex bison libssl-dev libelf-dev

# latest stable Linux カーネルを入手
# git をインストールする必要があります。
git clone https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git

# "stable" ブランチがアクティブなものであることを確認してください。
cd linux
git checkout linux-rolling-stable

# WSL2 用に最適化されたカーネル設定を取得する 
# Source: https://github.com/microsoft/WSL2-Linux-Kernel/pull/176
wget https://github.com/microsoft/WSL2-Linux-Kernel/blob/7015d6023d60b29c3be4c6a398bed923b48b4341/Microsoft/config-wsl -O .config

# LOCALVERSIONの値を変更します
sed -i 's/microsoft-standard-WSL2/generic/' ./.config

# [Optional] コンパイルを開始する前に、最新のカーネルオプションを含むように設定ファイルを「更新」してみましょう
make prepare

## 唯一、デフォルト値を選択しなかったオプションがあります。
*
* Preload BPF file system with kernel specific program and map iterators
*
Preload BPF file system with kernel specific program and map iterators (BPF_PRELOAD) [N/y/?] (NEW) y

# これですべての準備が整いましたので、カーネルをコンパイルしてみましょう
make -j $(nproc)

# コンパイルが完了したら, "オプション "モジュールをインストールします.
sudo make modules_install

# カーネルをWindowsファイルシステムのディレクトリにコピーする 
# wslkernel ディレクトリの作成をお勧めします
mkdir /mnt/c/wslkernel
cp arch/x86/boot/bzImage /mnt/c/wslkernel/kernelfalco

# 最後のステップとして、カーネルを .wslconfig ファイルで参照する必要があります 
# viを使用していますが、お好みのテキストエディタを自由に使ってください
vi /mnt/c/Users/<your username>/.wslconfig

## ファイルの内容は以下のようになります
## 出典: https://docs.microsoft.com/en-us/windows/wsl/wsl-config#wsl-2-settings
[wsl2]
kernel = c:\\wslkernel\\kernelfalco
swap = 0
localhostForwarding = true
```



これらの手順がすべて完了したので、Powershellで以下のコマンドを実行することで、WSL2を "再起動 "することができるようになりました。

```powershell
wsl --shutdown
```



WSL2 distro でターミナルをもう一度起動して、新しいカーネルが使われていることを確認してください。

```bash
uname -a
```



そして、latest stable Linux カーネルが WSL2 によってインストールされ、使用されています。WSL2 の(大きな)利点は、すべてのdistroが同じカーネルを使用していて、それ以上のコンパイルを必要としないことです。(潜在的な)欠点は、すべてのdistroが同じ設定を共有していることです。



# WSL2 で SystemD を探す

デフォルトでは、WSL2 はカスタマイズされた `init` プロセスのために SystemD を実行しません。しかし、非常に賢いコミュニティメンバーである [Daniel Llewellyn](https://twitter.com/diddledan) がそれを可能にしました。

いくつかの反復と代替案が利用可能になりましたが、このブログ記事では、追加パッケージのインストールを必要としない（＝押しつけがましくない）ので、彼の”1つのスクリプト”を使用しています。



> *注意: カーネルは**すべての** WSL2distroに適用されていますが、SystemDのインストールはすべてのdistroに対して行われる必要があります。*



もう一度ターミナルにジャンプしてください:

```bash
# SystemD スクリプトを取得して /etc/profile.d に配置します。
sudo wget https://raw.githubusercontent.com/diddlesnaps/one-script-wsl2-systemd/master/src/00-wsl2-systemd.sh -O /etc/profile.d/00-wsl2-systemd.sh

# [Optional] ユーザが root でない場合、スクリプトは sudo で自分自身を呼び出すので、最初の WSL2 起動時にパスワードを入力しないようにするために (シャットダウン後のみ)、以下のファイルを sudoers.d ディレクトリに追加するとよいでしょう
sudo wget https://raw.githubusercontent.com/diddlesnaps/one-script-wsl2-systemd/build-21286%2B/src/sudoers -O /etc/sudoers.d/wsl2-systemd
```



これで、Powershellで以下のコマンドを実行することで、WSL2を "再起動 "することができるようになりました。

```powershell
wsl --shutdown
```



WSL2distroでターミナルを再度起動し、`systemd`が起動するまでに少し遅れていることを確認してください。

シェルの準備ができたら、SystemD が起動していることを確認してください。

```bash
ps -aux
```



# 私の名前はFalco カーネルモジュールFalcoです

準備されたすべてのもので、次のステップは、[Falco documentation](https://falco.org/ja/docs/getting-started/installation/)に従うことで、"普通の "Linuxを持っている人がするようなものです。私はUbuntuを使用していることを覚えておいてください。

しかし、カーネル(WSL2ではなく)に関連した "回り道 "が必要になります。repo（このブログ記事を書いている時点では存在していませんでした）からヘッダーをインストールする代わりに、[Ubuntuカーネルのウェブサイト](https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/)からダウンロードします。その他のdistroについては、それぞれのサイトで確認してください。



> *注: カーネルヘッダパッケージのインストール時には、以下のエラーを無視することができます。*
>
>
> *W: mkconf: MD subsystem is not loaded, thus I cannot scan for arrays.*
> *W: mdadm: failed to auto-generate temporary mdadm.conf file.*



もう一度ターミナルにジャンプしましょう。

```bash
# WSL2のホームディレクトリに移動
cd

# Falcoドキュメントのステップ1を実行します: repoを追加します
curl -s https://falco.org/repo/falcosecurity-packages.asc | sudo apt-key add - -を追加します。
echo "deb https://download.falco.org/packages/deb stable main" | sudo tee -a /etc/apt/sources.list.d/falcosecurity.list
sudo apt update

# 上記の通り、ステップ2では、カーネルヘッダパッケージをダウンロードしてみましょう
# 私の場合は、CPUの機種に合わせて "amd64 "のものを使います。ARMの場合は、マッチするものをダウンロードしてください。
wget https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/amd64/linux-headers-5.10.4-051004_5.10.4-051004.202012301142_all.deb
wget https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/amd64/linux-headers-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb
wget https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/amd64/linux-image-unsigned-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb
wget https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/amd64/linux-modules-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb

# "generic" ヘッダーが "all" ヘッダーに依存しているので、この順番でパッケージをインストールします。
sudo dpkg -i linux-headers-5.10.4-051004_5.10.4-051004.20012301142_all.deb
sudo dpkg -i linux-headers-5.10.4-051004-generic_5.10.4-051004.20212301142_amd64.deb
sudo dpkg -i linux-image-unsigned-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb
sudo dpkg -i linux-modules-5.10.4-051004-generic_5.10.4-051004.20212301142_amd64.deb

# リポジトリからFalcoをインストール
sudo apt install -y falco
```



現在Falcoがインストールされているので、「有効化してテストする」にはまだいくつかのステップが必要です。もう一度言いますが、[Falcoのドキュメントは準備できている](https://falco.org/docs/getting-started/running/)ので、ここではそれに従います。



最後に(少なくともこのブログのために)ターミナルにジャンプしましょう:

```bash
# カーネルにロードされたモジュールをチェック
# Falcoは現れるべきではない
lsmod

# Falcoサービスを有効にして起動してください
sudo systemctl enable falco
sudo systemctl start falco

# カーネルがロードしたモジュールを再度確認してください
# Falcoが表示されます。
lsmod

# Falcoのログを見る
journalctl -fu falco
```



**おめでとう!!!** これでWSL2でFalcoを起動して実行することができ、お好みのKubernetesdistro(Falcoのドキュメントを参照)で使用できるようになりました。



# まとめ

このブログがFalcoをWSL2に導入するのに役立ち、テストするだけでなく、この素晴らしいチームにフィードバックを提供できることを願っています。

Falcoに関する質問やフィードバックがあれば、[Falco GitHub repo](https://github.com/falcosecurity/falco)でissueを作成することを躊躇しないでください。WSL2については、より具体的には、Twitter ([@nunixtech](https://twitter.com/nunixtech)で連絡を取ることができます。)



クラウドネイティブの海で会いましょう。

The WSL Corsair
