---
title: Falcoをソースからビルドする
weight: 6
---

Falcoを自分で構築する方法に関するガイドへようこそ！ あなたはとても勇敢です！ あなたはすでに
これらすべてを行うことで、あなたがコントリビュートしてくれる可能性が高いです！ [コントリビュートガイド](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md)をお読みください。

## CentOS / RHEL

CentOS 7は、リリースアーティファクトのコンパイルに使用するリファレンスビルド環境です。

### 依存関係

**CentOS 8 / RHEL 8**

```bash
dnf install 'dnf-command(config-manager)'
dnf config-manager --set-enabled PowerTools # needed for libyaml-devel
dnf install gcc gcc-c++ git make cmake autoconf automake pkg-config patch
dnf install libcurl-devel zlib-devel libyaml-devel libtool glibc-static libstdc++-static elfutils-libelf-devel -y
```

**CentOS 7 / RHEL 7**

```
yum install gcc gcc-c++ git make autoconf automake pkg-config patch
yum install libcurl-devel zlib-devel libyaml-devel libtool glibc-static libstdc++-static elfutils-libelf-devel -y
```

You will also need `cmake` version `3.5.1` or higher which is not included in CentOS 7. You can follow the [official guide](https://cmake.org/install/) or look at how that is done
in the [Falco builder Dockerfile](https://github.com/falcosecurity/falco/blob/master/docker/builder/Dockerfile).
また、CentOS 7には含まれていない`cmake`バージョン` 3.5.1`以降が必要です。[公式ガイド](https://cmake.org/install/) に従うか、
[Falco builder Dockerfile](https://github.com/falcosecurity/falco/blob/master/docker/builder/Dockerfile)内でそれがどのように行われるかを確認できます。

### Falcoのビルド

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake -DUSE_BUNDLED_DEPS=ON ..
make falco
```

詳細は [ここ](#ホストで直接ビルド)です。

### カーネルモジュールドライバーのビルド

ビルドディレクトリで：

```bash
yum -y install kernel-devel-$(uname -r)
make driver
```

### eBFPドライバーのビルド

カーネルモジュールドライバーを使用しない場合は、代わりに次のようにeBPFドライバーをビルドできます。

ビルドディレクトリで：

```bash
dnf install clang llvm
cmake -DBUILD_BPF=ON ..
make bpf
```

### DEB/RPMパッケージのビルド

ビルドディレクトリで：

```bash
yum install rpm-build createrepo
make package
```

## Debian / Ubuntu

### 依存関係

```bash
apt install git cmake build-essential
```

### Falcoのビルド

```bash
apt install libssl-dev libyaml-dev libc-ares-dev libprotobuf-dev protobuf-compiler libjq-dev libyaml-cpp-dev libgrpc++-dev protobuf-compiler-grpc libcurl4-openssl-dev libelf-dev
```

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

詳細は [ここ](#ホストで直接ビルド)です。

### カーネルモジュールドライバーのビルド

ドライバーをビルドするには、カーネルヘッダーが必要です。

```bash
apt install linux-headers-$(uname -r)
```

ビルドディレクトリで：

```bash
make driver
```

### eBFPドライバーのビルド

カーネルモジュールドライバーを使用しない場合は、代わりに次のようにeBPFドライバーをビルドできます。

ビルドディレクトリで：

```bash
apt install llvm clang
cmake -DBUILD_BPF=ON ..
make bpf
```

## Arch Linux

### 依存関係

```bash
pacman -S git cmake make gcc wget
pacman -S zlib jq yaml-cpp openssl curl c-ares protobuf grpc libyaml
```

### Falcoのビルド

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

詳細は [ここ](#ホストで直接ビルド)です。

### カーネルモジュールドライバーのビルド

ビルドディレクトリで：

```bash
make driver
```

### eBFPドライバーのビルド

カーネルモジュールドライバーを使用しない場合は、代わりに次のようにeBPFドライバーをビルドできます。

ビルドディレクトリで：

```bash
pacman -S llvm clang
cmake -DBUILD_BPF=ON ..
make bpf
```

## 依存関係

デフォルトでは、Falcoビルドはランタイム依存関係の**ほとんど**を**動的**にバンドルします。

これを確認すると、デフォルトでオプション`USE_BUNDLED_DEPS`が`OFF`になっています。つまり、該当するかどうかにかかわらず、Falcoビルドは、マシンに既に存在するライブラリに対してリンクしようとします。

そのようなオプションを`ON`に変更すると、Falcoビルドはすべての依存関係を静的にバンドルします。

完全を期すために、これはFalcoの依存関係の完全なリストです：

- b64
- cares
- curl
- grpc
- jq
- libyaml
- lpeg
- luajit
- lyaml
- njson
- openssl
- protobuf
- tbb
- yamlcpp
- zlib
- libscap
- libsinsp

## Falcoのビルド

Falcoをビルドするには、2つの方法がサポートされています

- [ホストで直接ビルド](#ホストで直接ビルド)
- [コンテナを使用してビルドする](#falco-builderコンテナを使用してビルド)

### ホストで直接ビルド

Falcoをビルドするには、`build`ディレクトリを作成する必要があります。
Falcoの作業コピー自体に`build`ディレクトリを置くのが一般的ですが、ファイルシステムのどこにあってもかまいません。

Falcoを**コンパイルする3つの主要なステップ**があります。

1. ビルドディレクトリを作成して入力します
2. ビルドディレクトリのcmakeを使用して、Falcoのビルドファイルを作成します。ソースディレクトリが現在のディレクトリの親であるため、`..`が使用されました。代わりに、Falcoソースコードの絶対パスを使用することもできます
3. makeを使用してビルドする


#### すべてビルド

```bash
mkdir build
cd build
cmake ..
make
```

特定のターゲットのみをビルドすることもできます：

#### Falcoだけをビルド

ビルドフォルダーとcmakeセットアップを実行してから、：

```bash
make falco
```

#### Falcoエンジンのみをビルド

ビルドフォルダーとcmakeセットアップを実行してから、：

```bash
make falco_engine
```

#### libscapだけをビルド

ビルドフォルダーとcmakeセットアップを実行してから、：

```bash
make scap
```

#### libsinspだけをビルド

ビルドフォルダーとcmakeセットアップを実行してから、：

```bash
make sinsp
```

#### probe / kernel ドライバーだけをビルド

ビルドフォルダーとcmakeセットアップを実行してから、：

```bash
make driver
```

#### 結果をビルド

Falcoがビルドされると、`build`フォルダーにある3つの興味深いものは次のとおりです：

- `userspace/falco/falco`: 実際のFalcoバイナリ
- `driver/src/falco-probe.ko`: Falcoカーネルドライバー
- `driver/bpf/probe.o`: [BPF support](#enable-bpf-support) でFalcoをビルドした場合

デバッグバージョンをビルドする場合は、代わりにcmakeを`cmake -DCMAKE_BUILD_TYPE=Debug ..`として実行します。詳細なカスタマイズについては、[CMake オプション](#CMake オプション) セクションを参照してください。

### CMake オプション

`cmake`コマンドを実行するとき、ビルドファイルの動作を変更するために追加のパラメーターを渡すことができます。

以下にいくつかの例を示します。常に、`build`フォルダーがFalco作業コピー内にあると想定しています。

#### verbose makefilesを生成する

```bash
-DCMAKE_VERBOSE_MAKEFILE=On
```

#### CおよびCXXコンパイラを指定する

```
-DCMAKE_C_COMPILER=$(which gcc) -DCMAKE_CXX_COMPILER=$(which g++)
```

#### バンドルされた依存関係を適用する

```
-DUSE_BUNDLED_DEPS=True
```

Falcoの依存関係の詳細については、[こちら](#依存関係)をご覧ください。


#### 警告をエラーとして扱う

```
-DBUILD_WARNINGS_AS_ERRORS=True
```

#### ビルドタイプを指定する

デバッグビルドタイプ

```
-DCMAKE_BUILD_TYPE=Debug
```

リリースビルドタイプ

```
-DCMAKE_BUILD_TYPE=Release
```

この変数は大文字と小文字を区別せず、デフォルトでリリースされることに注意してください。

#### Falcoのバージョンを指定する

オプションで、ユーザーはFalcoのバージョンを指定できます。 例えば、

```
 -DFALCO_VERSION={{< latest >}}-dirty
```

明示的に指定しない場合、ビルドシステムはgit履歴から`FALCO_VERSION`値を計算します。

現在のgitリビジョンにgitタグがある場合、Falcoバージョンはそれと同じになります（先頭の「v」文字なし）。それ以外の場合、Falcoのバージョンは `0.<commit hash>[.dirty]`の形式になります。

#### Enable BPF support

```
-DBUILD_BPF=True
```

これを有効にすると、次の後に`bpf`ターゲットを作成できます：

```bash
make bpf
```

### falco-builderコンテナを使用してビルド

Falcoをビルドする別の方法は、[falco-builder](https://hub.docker.com/r/falcosecurity/falco-builder)コンテナを実行することです。
パッケージのビルドに使用できるリファレンスツールチェーンが含まれており、すべての依存関係はすでに満たされています。

イメージは次のパラメーターに依存します：

* `BUILD_TYPE`：デバッグまたはリリース（大文字と小文字を区別せず、デフォルトはリリース）
* `BUILD_DRIVER`：ビルド時にカーネルモジュールをビルドするかどうか。カーネルモジュールはホストではなく、centosイメージ内のファイル用に構築されるため、これは通常オフにする必要があります。
* `BUILD_BPF`：` BUILD_DRIVER`に似ていますが、ebpfプログラム用です。
* `BUILD_WARNINGS_AS_ERRORS`：すべてのビルド警告を致命的と見なします
* `MAKE_JOBS`：makeの-j引数に渡されます


このビルダーを実行する一般的な方法は次のとおりです。FalcoとSysdigを/home/user/srcの下のディレクトリにチェックアウトしていて、/home/user/build/ falcoのビルドディレクトリを使用したい場合は、次のコマンドを実行します。

```bash
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder cmake
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder package
```

ビルドされたパッケージのバージョンとして使用するために、`FALCO_VERSION`環境変数を明示的に提供することも可能です。

それ以外の場合、Dockerイメージはデフォルトの`FALCO_VERSION`を使用します。


## 最新のfalco-probeカーネルモジュールをロードする

Falcoのバイナリバージョンがインストールされている場合、古いFalcoカーネルモジュールがすでにロードされている可能性があります。最新バージョンを使用していることを確認するには、既存のFalcoカーネルモジュールをアンロードし、ローカルでビルドされたバージョンをロードする必要があります。

次の方法で既存のカーネルモジュールをアンロードします：

```bash
rmmod falco_probe
```

ローカルでビルドされたバージョンをロードするには、`build`ディレクトリにいると仮定して、以下を使用します：

```bash
insmod driver/falco-probe.ko
```

```bash
rmmod falco_probe
```

ローカルでビルドされたバージョンをロードするには、`build`ディレクトリにいると仮定して、以下を使用します：

```bash
insmod driver/falco-probe.ko
```

## falcoを実行

Falcoがビルドされてカーネルモジュールが読み込まれると、`build`ディレクトリにいると想定して、次のようにfalcoを実行できます：

```bash
sudo ./userspace/falco/falco -c ../falco.yaml -r ../rules/falco_rules.yaml
```

デフォルトでは、falcoはイベントを標準エラーに記録します。


### 回帰テストを実行する

#### ホストで直接テスト

回帰テストを実行するには、Falcoをビルドした後、Falcoルートディレクトリで`test/run_regression_tests.sh`スクリプトを実行する必要があります。

##### 依存関係

回帰テストフレームワークが機能するには、次の依存関係が必要です。

- Python 3
- [Avocado Framework](https://github.com/avocado-framework/avocado), version 69
- [Avocado Yaml to Mux plugin](https://avocado-framework.readthedocs.io/en/69.0/optional_plugins/varianter_yaml_to_mux.html)
- [JQ](https://github.com/stedolan/jq)
- The `unzip` and `xargs` commands
- [Docker CE](https://docs.docker.com/install/)

Avocadoとそのプラグインをインストールするには、pipを使用できます：

```
pip install avocado-framework==69.0 avocado-framework-plugin-varianter-yaml-to-mux==69.0
```

##### テストを実行する

`$PWD/build`が異なる場合はFalcoを組み込んだディレクトリに変更します。

```bash
./test/run_regression_tests.sh -d $PWD/build
```

#### falco-testerコンテナを使用してテストする

ビルドに対して回帰テストスイートを実行する場合は、[falco-tester](https://hub.docker.com/r/falcosecurity/falco-tester)コンテナを使用できます。ビルダーイメージのように、回帰テストを実行するために必要な環境が含まれていますが、イメージにマウントされているソースディレクトリとビルドディレクトリに依存しています。コンパイラーを必要とせず、テストランナーフレームワーク[avocado](http://avocado-framework.github.io/)を含めるには別のベースイメージが必要なため、これは`falco-builder`とは異なるイメージです。

新しいコンテナイメージ`falcosecurity/falco:test` (ソースはFalco GitHubリポジトリの`docker/local`ディレクトリにあります)をビルドして、ビルドステップ中にビルドされたFalcoパッケージでコンテナーをビルドして実行するプロセスをテストします。

イメージは次のパラメーターに依存します：

* `FALCO_VERSION`：テストコンテナイメージに含めるFalcoパッケージのバージョン。ビルドされたパッケージのバージョンと一致する必要があります。

このビルダーを実行する一般的な方法は次のとおりです。FalcoとSysdigを`/home/user/src`の下のディレクトリにチェックアウトしていて、`/home/user/build/falco`のビルドディレクトリを使用したい場合は、次のコマンドを実行します：

```bash
docker run --user $(id -u):$(id -g) -v $HOME:$HOME:ro -v /boot:/boot:ro -v /var/run/docker.sock:/var/run/docker.sock -v /etc/passwd:/etc/passwd:ro -e FALCO_VERSION=${FALCO_VERSION} -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-tester
```
`$HOME`をマウントすると、テスト実行フレームワークを実行できます。`$(id -g)`を、Dockerソケットへのアクセスを許可されているグループ（多くの場合 `docker`グループ）の正しいgidに置き換える必要がある場合があります。
