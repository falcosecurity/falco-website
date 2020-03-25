---
title: Falcoを実行する
weight: 2
---

Falcoはサービスとして実行されることを意図しています。 ただし、実験やルールセットの設計/テストの場合は、コマンドラインから手動で実行することをお勧めします。

## Falcoをサービスとして実行する

OFalcoをパッケージとして[インストール](../installation)するとサービスを開始できます：

```bash
service falco start
```

デフォルトの設定では、イベントがsyslogに記録されます。

## 設定の再読み込み

Falco> = 0.13.0以降、SIGHUPでFalcoはメインループを完全に再起動し、カーネルモジュールのデバイスをクローズし、すべての設定などを最初から再読み込みします。これは、Falcoを再起動せずに、ルールファイルや設定などのセットをその場で変更したい場合に役立ちます。

## コンテナでFalcoを実行する

Falcoの現在のバージョンは、`falcosecurity/falco:{{< latest >}}`コンテナとして利用できます。Linuxにおいてローカルでコンテナを実行するコマンドの例を次に示します。

```bash
docker run \
  --interactive \
  --privileged \
  --tty \
  --name falco \
  --volume /var/run/docker.sock:/host/var/run/docker.sock \
  --volume /dev:/host/dev \
  --volume /proc:/host/proc:ro \
  --volume /boot:/host/boot:ro \
  --volume /lib/modules:/host/lib/modules:ro \
  --volume /usr:/host/usr:ro \
  falcosecurity/falco:{{< latest >}}
```

デフォルトでは、コンテナを起動すると、Falcoカーネルモジュールのロードやビルドが試行されます。 カーネルモジュールが読み込まれていることがすでにわかっていて、この手順をスキップしたい場合は、環境変数 `SYSDIG_SKIP_LOAD`を` 1`に設定できます：

```bash
docker run ... -e SYSDIG_SKIP_LOAD=1 ... falcosecurity/falco:{{< latest >}}
```

## Kind clusterでのFalcoの実行

[Kind](https://github.com/kubernetes-sigs/kind)クラスターでFalcoを実行する最も簡単な方法は次のとおりです：

1. 設定ファイルを作成. 例: `kind-config.yaml`

2. 以下をファイルに追加します：
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraMounts:
  - hostPath: /dev
    containerPath: /dev
```

3. 設定ファイルを指定してクラスターを作成します：
```
kind create cluster --config=./kind-config.yaml
```

4. FalcoをKind Kubernetesクラスター内に[Install](../installation)する。

## Falcoを手動で実行する

Falcoを手動で実行したい場合におけるFalcoの説明を以下に示します：

```
Usage: falco [options]

Options:
 -h, --help                    このページをプリントする
 -c                            Configuration file (default /mnt/sf_mstemm/work/src/falco/falco.yaml, /etc/falco/falco.yaml)
 -A                            EF_DROP_FALCOフラグのあるイベントを含むすべてのイベントを監視します。
 -b, --print-base64            base64でデータバッファーをプリントします。 これは、以下の目的で
                               設計されたメディアで使用する必要があるバイナリデータをエンコードするのに役立ちます。
 --cri <path>                  コンテナメタデータのCRIソケットへのパス
                               指定されたソケットを使用して、CRI互換のランタイムからデータをフェッチします
 -d, --daemon                  daemonとして実行する
 -D <pattern>                  正規表現<パターン>に一致するルールを無効にします。 複数回指定できます。
                               -tと一緒に指定することはできません。
 -e <events_file>              ライブでタッピングする代わりに<events_file>からイベントを読み取ります（sinspイベントの場合は.
                               scap形式、k8s auditイベントの場合はjsonl）
 -k <url>, --k8s-api=<url>
                               引数として指定されたAPIサーバーに接続して、Kubernetesサポートを有効にします。 
                               例えば "http://admin:password@127.0.0.1:8080".
                               APIサーバーは、環境変数FALCO_K8S_APIを介して指定することもできます。
 -K <bt_file> | <cert_file>:<key_file[#password]>[:<ca_cert_file>], --k8s-api-cert=<bt_file> | <cert_file>:<key_file[#password]>[:<ca_cert_file>]
                               提供されたファイル名を使用してユーザーを認証し、（オプションで）K8S APIサーバーIDを確認します。
                               各エントリは、対応するファイルへのフル（絶対、または現在のディレクトリからの相対）
                               パスを指定する必要があります。
                               秘密鍵のパスワードはオプションです（鍵がパスワードで保護されている場合にのみ必要）。
                               CA certificateはオプションです。すべてのファイルについて、PEMファイル形式のみがサポートされています。
                               CA certificateのみの指定は廃止されました。このオプションに単一のエントリが指定されている場合、
                               bearer tokenを含むファイルの名前として解釈されます。
                               このコマンドラインオプションの形式では、ファイル名に ':'または '#'文字を含む名前
                               のファイルの使用が禁止されています。
 -L                            すべてのルールの名前と説明を表示して終了します。
 -l <rule>                     name<rule>の名前と説明を表示して終了します。
 --list [<source>]             すべての定義済みフィールドをリストします。<source>が指定されている場合、ソース<source>のフィールドのみをリストします。
                               <source>の現在の値は"syscall"、"k8s_audit"です。
 -m <url[,marathon_url]>, --mesos-api=<url[,marathon_url]>
                               引数として指定されたAPIサーバーに接続して、Mesosサポートを有効にします。
                               例 "http://admin:password@127.0.0.1:5050".
                               マラソンURLはオプションで、デフォルトはMesosアドレス、ポート8080です。
                               APIサーバーは、環境変数FALCO_MESOS_APIを介して指定することもできます。
 -M <num_seconds>              <num_seconds>に達したら収集を停止します。
 -N                            --listと共に使用すると、フィールド名のみが出力されます。
 -o, --option <key>=<val>      オプション<key>の値を<val>に設定します。 設定ファイルの値を上書きします。
                               <key>は2つの部分からなる<key>.<subkey>にすることができます
 -p <output_format>, --print=<output_format>
                               各Falco通知の出力に追加情報を追加します。
                               -pcまたは-pcontainerを使用すると、コンテナーに適した形式が使用されます。
                               -pkまたは-pkubernetesを使用すると、kubernetesに適した形式が使用されます。
                               -pmまたは-pmesosを使用すると、mesosに適した形式が使用されます。
                               さらに、-pc/-pk/-pmを指定すると、ルール出力フィールドの
                               ％container.infoの解釈が変更されます
                               詳細については、以下の例のセクションを参照してください。
 -P, --pidfile <pid_file>      daemonとして実行する場合、指定したファイルにpidを書き込みます
 -r <rules_file>               Rules file/directory(デフォルトは設定ファイルで設定された値、
                               または/etc/falco_rules.yaml)。複数回指定して、複数のRules file/directory
                               fから読み取ることができます。
 -s <stats_file>               指定した場合、Falcoのイベントの読み取り/処理に関連する統計を
                               このファイルに書き込みます。(ライブモードでのみ役立ちます)
 --stats_interval <msec>       -s <stats_file>を使用する場合、<msec> msごとに統計を書き込みます。
                               (これはsignalを使用するため、200ミリ秒未満の間隔はお勧めしません)
                               デフォルトは5000(5秒)です
 -S <len>, --snaplen=<len>
                  	       各I/Oバッファーの最初の<len>バイトをキャプチャします。
                   	       デフォルトでは、最初の80バイトがキャプチャされます。このオプションは注意して
                   	       使用してください。巨大なトレースファイルが生成される可能性があります。
 --support                     バージョン、使用されているルールファイルなどのサポート情報をプリントします。
                               そして終了します。
 -T <tag>                      tag = <tag>を含むルールを無効にします。 複数回指定できます。
                               -tと一緒に指定することはできません。
 -t <tag>                      これらのルールはtag = <tag>でのみ実行してください。 複数回指定できます。
                               -T/-Dと一緒に指定することはできません。
 -U,--unbuffered               設定された出力への出力バッファリングをオフにします。これにより、
                               Falcoによって発行されたすべての単一行がフラッシュされ、CPU使用率が
                               高くなりますが、これらの出力を別のプロセスまたはスクリプトにパイプ
                               するときに役立ちます。
 -V,--validate <rules_file>    指定したルールファイルの内容を読み取り、終了します。
                               複数回指定して、複数のファイルを検証できます。
 -v                            詳細な出力
 --version                     バージョン番号を出力します。
```
