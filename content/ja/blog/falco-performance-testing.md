---
exclude_search: true
title: Falco パフォーマンステスト
description: イベントジェネレータを使ったFalcoのパフォーマンステストを理解する
date: 2021-01-20
author: Samar Sidharth
slug: falco-performance-testing
---

**私を助けてくれた[Leonardo Grasso](https://github.com/leogr)に特別な感謝を捧げます。**

## アジェンダ

このドキュメントのアジェンダは、Kubernetesクラスター上にhelm chartを使用してデプロイされたFalcoアプリケーションのパフォーマンステストの経験を共有し、手順を説明し、Falcoが必要とするリソース（CPUとメモリ）とFalcoが処理できる毎秒のsyscall数との関係を確立することです。

## 前提条件

パフォーマンステストの**前提条件**は以下の通りです:

- **既知のイベント**は、Falcoルールにマッチし、アラートをトリガーするシステムコールです。

- **未知のイベント**は、Falcoのルールでは条件を満たしていないため、Falcoによって破棄されるシステムコールです。

- 未知のイベントの負荷は、Falcoパフォーマンステストの間、最小にすべきです。

- パフォーマンステストは、Falcoイベント生成ツールのベンチマーク機能を使用しています。

- Falco [event-generator](https://github.com/falcosecurity/event-generator) ベンチマークは、syscall イベントのみを生成するので、このベンチマークの実行中に k8s-audit タイプのイベントはありません。

  > ベンチマークに使用できるアクションの中には、EPSを大量に生成するのに時間がかかりすぎるものもあるので、すべてのアクションがベンチマークに使用できるわけではないことを覚えておいてください。例えば、`k8saudit` アクションは動作しないと思われます。また、`syscall` アクションの中にはしばらくスリープしてしまうものもあります( [syscall.ReadSensitiveFileUntrusted](https://github.com/falcosecurity/event-generator/blob/7bf714aab8da5a3f6d930225f04852e97d682dac/events/syscall/read_sensitive_file_trusted_after_startup.go#L10)のように)ので、使用できません。

- EPS (Event Per Second) イベントジェネレータが一回のラウンドで生成するイベントの数。システムコールには対応しませんが、ここでのイベントは複数のシステムコールの組み合わせです。例えば、アクションが/binの下でファイルが作成されたときにトリガーされるルールをターゲットにしている場合、アクションはおそらく3つのシステムコールを使用します:

     1. ディレクトリを確認するための1つ

     2. 1つは /bin の下にファイルを作成します。

     3. 最後に最後に削除します

        しかし、イベントジェネレーターはアクションごとに1つのイベントしかカウントしません。

  ```
  INFO statistics  cpu="38.1%" lost="2%" res_mem="38 MB" throughput="4371.6 EPS" virt_mem="1.1 GB"
  ```

- Falcoは多くのイベントを受信しますが、すべてのイベントがルールをトリガーするわけではないので、Falcoプロセスによって生成されるドロップ統計は、受信したsyscallの生の数を参照します(Falcoはそれらのsyscallを失ったので、それらのsyscallがルールにマッチしたかどうかは知りません)。一方、イベントジェネレーターはどのイベントを生成したかを正確に知っているので、確実に次のように言うことができます: 私は100回送信して50回受信したので、50%が失われた

- パフォーマンステスト中はカスタムルールは考慮されず、デフォルトの Falco ルールのみがトリガーされます。

- ベンチマーク機能は、3種類のアクション `ChangeThreadNamespace|ReadSensitiveFileUntrusted|WriteBelowBinaryDir` でのみテストしました。

- Falcoのログでドロップが確認されたラウンドの前のイベント生成ラウンドは、特定のリソース設定でサポートされているsyscallの数を計算するために考慮されました。
  

  > Falcoの楽しい事実:
  >
  > ここでは、性能試験中にあなたの頭に浮かぶかもしれない、Falcoについてのいくつかの事実を紹介します。
  >
  > - Falcoは、バッファから一度に一つのイベントを読み込んで、それを処理し、それを破棄します。
  > - Falcoは多くのイベントを受信しますが、それらのすべてがルールをトリガするわけではありません。
  > - Falcoはメモリ消費が少ないように設計されているだけで、メモリはEPSとは厳密には関係ない（だから一回イベントが処理されたら破棄されてメモリが解放される）。

  

   

## ステップ

**セットアップ**

- Falcoは `-s` オプションと `--stats-interval` を1秒に設定してデプロイされ、Falcoによる1秒あたりの総システムコールを捕捉しました。

  ```
  -s <stats_file>               If specified, append statistics related to Falco's reading/processing of events
                                 to this file (only useful in live mode).
   --stats-interval <msec>       When using -s <stats_file>, write statistics every <msec> ms.
                                 This uses signals, so don't recommend intervals below 200 ms.
                                 Defaults to 5000 (5 seconds).
  ```

  サンプルの設定:

  ```
  # Changes in Falco daemonset
     spec:
        containers:
        - args:
          - /usr/bin/falco
          - -s
          - /var/log/falco.txt
          - --stats-interval
          - "1000"
          - --cri
          - /run/containerd/containerd.sock
          - -K
          - /var/run/secrets/kubernetes.io/serviceaccount/token
          - -k
          - https://$(KUBERNETES_SERVICE_HOST)
          - -pk
  ```

- values.yamlに以下の変更を加えることで、gRPCを有効にし、Falcoの設定でレートリミッターを緩和します。 

  ```
    grpc:
      enabled: true
      threadiness: 0
  
      # gRPC unix socket with no authentication
      unixSocketPath: "unix:///var/run/falco/falco.sock"
  
      # gRPC over the network (mTLS) / required when unixSocketPath is empty
      listenPort: 5060
      privateKey: "/etc/falco/certs/server.key"
      certChain: "/etc/falco/certs/server.crt"
      rootCerts: "/etc/falco/certs/ca.crt"
  
    # gRPC output service.
    # By default it is off.
    # By enabling this all the output events will be kept in memory until you read them with a gRPC client.
    # Make sure to have a consumer for them or leave this disabled.
    grpcOutput:
      enabled: true
  
  ```

  ```
    # A throttling mechanism implemented as a token bucket limits the
    # rate of Falco notifications. This throttling is controlled by the following configuration
    # options:
    #  - rate: the number of tokens (i.e. right to send a notification)
    #    gained per second. Defaults to 1.
    #  - max_burst: the maximum number of tokens outstanding. Defaults to 1000.
    #
    # With these defaults, Falco could send up to 1000 notifications after
    # an initial quiet period, and then up to 1 notification per second
    # afterward. It would gain the full burst back after 1000 seconds of
    # no activity.
    outputs:
      rate: "1000000000"
      maxBurst: "1000000000"
  
  ```

- [ここ](https://github.com/falcosecurity/event-generator/releases/download/v0.6.0/event-generator_0.6.0_linux_amd64.tar.gz)からイベントジェネレータのバイナリをダウンロードしてください。バイナリを展開して `event-generator list` コマンドを使って、このツールが生成するサンプルイベントをリストアップする。

  ベンチオプションを使って以下のコマンドでイベントジェネレータを実行します。

  ```
  event-generator bench "ChangeThreadNamespace|ReadSensitiveFileUntrusted|WriteBelowBinaryDir" --loop --pid $(ps -ef | awk '$8=="falco" {print $2}')
  ```

  

  > ## event-generator bench
  >
  > Falcoのベンチマーク
  >
  > ### あらすじ
  >
  > 実行中のFalcoインスタンスをベンチマークします。
  >
  > このコマンドは、Falco で許可されているイベントスループットをテストするために、高い数の Event Per Second (EPS) を生成します。EPSの数は"-sleep "オプションによって制御されます。もし"--loop "オプションが設定されている場合、スリープ時間は各ラウンドで半分になります。pid "オプションは、Falcoのプロセスを監視するために使用することができます。
  >
  > このコマンドを使用するには、Falco gRPC Outputが有効になっていなければなりません - Falco構成内の "output.rate "と "output.max_burst "の値を増加させなければなりません。
  >
  > このコマンドを使用する一般的な方法としては、以下のようなものがあります:
  >
  > ```
  > event-generator bench "ChangeThreadNamespace|ReadSensitiveFileUntrusted" --loop --sleep 10ms --pid $(pidof -s falco) 
  > ```
  >
  > 警告: このコマンドはシステムを変更する可能性があります。例えば、いくつかのアクションは、/bin, /etc, /dev などの下のファイルやディレクトリを変更します。何らかのアクションを実行する前に、このツールの目的を十分に理解していることを確認してください。
  >
  > ```
  > event-generator bench [regexp] [flags]
  > ```
  >
  > ### オプション
  >
  > ```
  >       --all                            デフォルトで無効化されているものも含めて、すべてのアクションを実行する
  >       --as string                      操作のためになりすますユーザー名
  >       --as-group stringArray           このフラグは複数のグループを指定するために繰り返すことができます。
  >       --cache-dir string               デフォルトの HTTP キャッシュディレクトリ (デフォルトは "$HOME/.kube/http-cache")
  >       --certificate-authority string   証明書局の証明書ファイルへのパス
  >       --client-certificate string      TLS 用のクライアント証明書ファイルへのパス
  >       --client-key string              TLS 用のクライアント鍵ファイルへのパス
  >       --cluster string                 使用する kubeconfig クラスターの名前
  >       --context string                 使用する kubeconfig コンテキストの名前
  >       --grpc-ca string                 Falco gRPCサーバに接続するためのCAルートファイルのパス (デフォルトは"/etc/falco/certs/ca.crt "です)
  >       --grpc-cert string               Falco gRPCサーバーに接続するための証明書ファイルのパス (デフォルトは"/etc/falco/certs/client.crt "です)
  >       --grpc-hostname string           Falco gRPCサーバに接続するためのホスト名(デフォルトは "localhost "です)
  >       --grpc-key string                Falco gRPCサーバに接続するためのキーファイルのパス (デフォルトは"/etc/falco/certs/client.key")
  >       --grpc-port uint16               Falco gRPCサーバに接続するためのポート(デフォルト5060)
  >       --grpc-unix-socket string        Falco gRPCサーバに接続するためのUnixソケットパス (デフォルトは "unix:///var/run/falco.sock")
  >   -h, --help                           benchヘルプ
  >       --humanize                       統計情報をプリントする際に値を人に読みやすくする（デフォルトはtrue）
  >       --insecure-skip-tls-verify       true の場合、サーバの証明書の有効性はチェックされません。これにより、HTTPS 接続は安全ではなくなります
  >       --kubeconfig string              CLI リクエストに使用する kubeconfig ファイルへのパス
  >       --loop                           ループで実行
  >       --match-server-version           クライアントのバージョンと一致するようにサーバのバージョンを要求する
  >   -n, --namespace string               存在する場合、このCLIリクエストのネームスペーススコープ (デフォルトは "default" です)
  >       --pid int                        ベンチマーク中に監視するプロセスPID（例：ファルコプロセス）
  >       --polling-interval duration      gRPC API のポーリングタイムアウト時間 (デフォルトは 100ms)
  >       --request-timeout string         1つのサーバリクエストをあきらめるまでの待ち時間の長さ。0 以外の値には対応する時間単位 (例: 1s, 2m, 3h) を含めなければなりません。0 の値はリクエストをタイムアウトさせないことを意味します。(デフォルトは "0")
  >       --round-duration duration        ベンチマークラウンドの持続時間 (デフォルトは5秒)
  >   -s, --server string                  Kubernetes API サーバーのアドレスとポート
  >       --sleep duration                 アクションを実行する前に待機する時間の長さ。ゼロ以外の値には、対応する時間単位(例: 1s, 2m, 3h)を含める必要があります。ゼロの値はスリープしないことを意味します。(デフォルトは100ms)
  >       --token string                   APIサーバーへの認証用のBearer token
  >       --user string                    使用する kubeconfig ユーザ名
  > ```
  >
  > ### 親コマンドから継承されるオプション
  >
  > ```
  >   -c, --config string      設定ファイルのパス (デフォルト $HOME/.falco-event-generator.yaml が存在する場合)
  >       --logformat string   利用可能なフォーマット: "text" または "json" (デフォルトは "text" です)
  >   -l, --loglevel string    ログレベル (デフォルトは "info" です)
  > ```



**実行**

- Falcoがデプロイされているサーバー上の1秒あたりのsyscall数を監視します。以下のサンプル出力では、"cur "セクションの値は累積合計値を示し、"delta "セクションの値は特定のインスタンスの値を示しています。

  Falco syscall logs:

  ```
  {"sample": 2961, "cur": {"events": 46226792, "drops": 86992, "preemptions": 0}, "delta": {"events": 10700, "drops": 0, "preemptions": 0}, "drop_pct": 0},
  {"sample": 2962, "cur": {"events": 46323843, "drops": 86992, "preemptions": 0}, "delta": {"events": 97051, "drops": 0, "preemptions": 0}, "drop_pct": 0},
  {"sample": 2963, "cur": {"events": 46696561, "drops": 86992, "preemptions": 0}, "delta": {"events": 372718, "drops": 0, "preemptions": 0}, "drop_pct": 0},
  {"sample": 2964, "cur": {"events": 47069599, "drops": 86992, "preemptions": 0}, "delta": {"events": 373038, "drops": 0, "preemptions": 0}, "drop_pct": 0},
  {"sample": 2965, "cur": {"events": 47419658, "drops": 86992, "preemptions": 0}, "delta": {"events": 350059, "drops": 0, "preemptions": 0}, "drop_pct": 0},
  {"sample": 2966, "cur": {"events": 47784238, "drops": 86992, "preemptions": 0}, "delta": {"events": 364580, "drops": 0, "preemptions": 0}, "drop_pct": 0},
  {"sample": 2967, "cur": {"events": 48134675, "drops": 102975, "preemptions": 0}, "delta": {"events": 350437, "drops": 15983, "preemptions": 0}, "drop_pct": 4.56088},
  {"sample": 2968, "cur": {"events": 48311955, "drops": 131484, "preemptions": 0}, "delta": {"events": 177280, "drops": 28509, "preemptions": 0}, "drop_pct": 16.0813},
  {"sample": 2969, "cur": {"events": 48323039, "drops": 131484, "preemptions": 0}, "delta": {"events": 11084, "drops": 0, "preemptions": 0}, "drop_pct": 0},
  {"sample": 2970, "cur": {"events": 48333847, "drops": 131484, "preemptions": 0}, "delta": {"events": 10808, "drops": 0, "preemptions": 0}, "drop_pct": 0},
  {"sample": 2971, "cur": {"events": 48342737, "drops": 131484, "preemptions": 0}, "delta": {"events": 8890, "drops": 0, "preemptions": 0}, "drop_pct": 0}
  ```

  この方法では、アイドルモードでのサーバのsyscall活動を取得し、参照として使用することができます。また、イベントジェネレーターを起動する前に、何かドロップが発生しているかどうかをチェックすることもできます。

- イベントジェネレーターツールを起動し、各ラウンドの統計情報を表示し、Falcoのsyscall出力で1秒あたりのsyscall数を並行して監視します。

  **イベントジェネレーターのサイクル:** すべてのラウンドで、それは特定のレート（EPS）で負荷を生成し、その後、休息します。次のラウンドでは、それはレートを倍増し、同じサイクルが停止するまで繰り返されます。

  event-generator logs:

  ```
  INFO round #14                                     sleep="12.207µs"
  INFO resting...
  INFO syscall.ReadSensitiveFileUntrusted            actual=14224 expected=14458 ratio=0.9838151888227971
  INFO syscall.WriteBelowBinaryDir                   actual=14219 expected=14456 ratio=0.9836054233536248
  INFO syscall.ChangeThreadNamespace                 actual=14208 expected=14457 ratio=0.9827765096493049
  INFO statistics                                    cpu="68.0%" lost="1%" res_mem="36 MB" throughput="8674.2 EPS" virt_mem="1.1 GB"
  INFO
  INFO round #15                                     sleep="6.103µs"
  INFO resting...
  INFO syscall.ReadSensitiveFileUntrusted            actual=15093 expected=16962 ratio=0.8898125221082419
  INFO syscall.WriteBelowBinaryDir                   actual=15080 expected=16963 ratio=0.8889936921535105
  INFO syscall.ChangeThreadNamespace                 actual=15058 expected=16961 ratio=0.8878014268026649
  INFO statistics                                    cpu="72.6%" lost="11%" res_mem="36 MB" throughput="10177.2 EPS" virt_mem="1.1 GB"
  ```

  

- あなたが "delta "セクションのドロップの値を見るインスタンス（上記のFalco syscallログのサンプル2967）は、イベントジェネレーターツールを停止し、それ以前のイベント生成ラウンドの値をキャプチャーします（ドロップは、上記のイベント生成統計で見られるように、ラウンド#15で発生したので、ラウンド#14の値を考慮します）。

- 与えられたリソース設定でFalcoがサポートする総syscallは、ドロップが発生したインスタンスの前のインスタンス（サンプル2963、2964、2965、2966）のsyscall値の平均を取ることで計算できます。低いsyscallを持つインスタンス（サンプル2961と2962）は、イベントジェネレーターサイクルの休息期間のためのものである。

 

## 観測

ここでの観察はあくまでも参考目的のためのものであり、このドキュメントの意図はFalcoのパフォーマンステストのプロセスを説明することです。テスト対象の環境は、openstack上でホストされたVM上にデプロイされたkubernetesクラスタです。



|    CPU    | Memory | 1秒あたりのシステムコール数       | EPS (四捨五入) |
| :-------: | :----: | :---------------------------: | :--------------------------: |
| 500m(0.5) | 512 Mi |           Upto 150K           |             2800             |
|     1     | 512 Mi |           Upto 250K           |             4200             |
|     2     | 512 Mi |           Upto 320K           |             7000             |



**重要なポイント:**

- イベントジェネレーターでイベントのタイプを追加/削除することはEPSに影響を与えますが、システムコールの合計値はまだ同じ範囲にあるはずです。

- EPSがある範囲で止まってしまった場合は、イベントジェネレーターがアクションを順次実行する(シングルスレッド)ので、システムコールの負荷を生成するためにイベントジェネレーターで使用されるイベントの種類を見直してください。そして、スリープ時間が0になると、ループ内の全ての時間がアクションの実行時間になるので、イベントジェネレーターのEPSはこれ以上大きくなることはありません。

  例: 

  以下の例では、EPSは本来の増加率ではなく、むしろ一回のラウンドで減少しました。これは、イベント `ChangeThreadNamespace|ReadSensitiveFileUntrusted|WriteBelowBinaryDir` のいずれかがイベントジェネレーターの速度低下の原因となっていることを示しています。この場合、サーバのルートディスクにI/Oの問題があったため、`WriteBelowBinaryDir`というイベントが発生していました。問題のあるイベント `WriteBelowBinaryDir` をリストから削除すると、正常に動作するようになりました。

  ```
  #event-generator bench "ChangeThreadNamespace|ReadSensitiveFileUntrusted|WriteBelowBinaryDir" --loop --grpc-unix-socket=unix:///var/run/falco/falco.sock --pid <Falco PID>
  
  INFO round #12                                     sleep="97.656µs"
  INFO resting...
  INFO syscall.WriteBelowBinaryDir                   actual=1696 expected=1696 ratio=1
  INFO syscall.ChangeThreadNamespace                 actual=1695 expected=1695 ratio=1
  INFO syscall.ReadSensitiveFileUntrusted            actual=1696 expected=1696 ratio=1
  INFO statistics                                    cpu="21.9%" lost="0%" res_mem="121 MB" throughput="1017.4 EPS" virt_mem="1.5 GB"
  INFO
  INFO round #13                                     sleep="48.828µs"
  INFO resting...
  INFO syscall.WriteBelowBinaryDir                   actual=1787 expected=1787 ratio=1
  INFO syscall.ChangeThreadNamespace                 actual=1788 expected=1788 ratio=1
  INFO syscall.ReadSensitiveFileUntrusted            actual=1786 expected=1786 ratio=1
  INFO statistics                                    cpu="23.6%" lost="0%" res_mem="121 MB" throughput="1072.2 EPS" virt_mem="1.5 GB"
  INFO
  INFO round #14                                     sleep="24.414µs"
  INFO resting...
  INFO syscall.WriteBelowBinaryDir                   actual=1614 expected=1614 ratio=1
  INFO syscall.ChangeThreadNamespace                 actual=1613 expected=1613 ratio=1
  INFO syscall.ReadSensitiveFileUntrusted            actual=1615 expected=1615 ratio=1
  INFO statistics                                    cpu="22.4%" lost="0%" res_mem="121 MB" throughput="968.4 EPS" virt_mem="1.5 GB"
  
  ```
