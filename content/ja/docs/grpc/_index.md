---
title: gRPC API
weight: 10
---

バージョン[0.18.0](https://github.com/falcosecurity/falco/releases/tag/0.18.0)以降、Falcoには一連のgRPC APIを提供する自身のgRPCサーバーがあります。

現在のAPIは次のとおりです：

- [schema definition](outputs): Falco出力イベントをサブスクライブします。
- [schema definition](version): Falcoバージョンを取得します。現在のバージョンは**{{< latest >}}**です。

これらのAPIと対話するために、falcosecurity組織は[Go](./client-go)および[Python](./client-python)クライアントを提供しています。

## 設定

Falco gRPCサーバーとFalco gRPC出力APIは、デフォルトでは有効になっていません。

それらを有効にするには、`falco.yaml`  Falco設定ファイルを編集します。Falco設定ファイルのサンプルを以下に示します：

```yaml
# gRPC server configuration.
# The gRPC server is secure by default (mutual TLS) so you need to generate certificates and update their paths here.
# By default the gRPC server is off.
# You can configure the address to bind and expose it.
# By modifying the threadiness configuration you can fine-tune the number of threads (and context) it will use.

grpc:
  enabled: true
  bind_address: "0.0.0.0:5060"
  threadiness: 8
  private_key: "/tmp/server.key"
  cert_chain: "/tmp/server.crt"
  root_certs: "/tmp/ca.crt"

# gRPC output service.
# By default it is off.
# By enabling this all the output events will be kept in memory until you read them with a gRPC client.
grpc_output:
  enabled: true
```


### 証明書

Falco gRPCサーバーは、設計上、相互TLSでのみ機能します。したがって、上記の構成では、証明書を生成してパスを更新する必要があります。

Falcoの作成者は、証明書の生成を間もなく自動化する予定です。

それまでの間、次のスクリプトを使用して証明書を生成します。

**注**:設定に従って、必ず `-passin`, `-passout`、および `-subj`フラグを設定してください。

### 有効なCAを生成する

次のコマンドを実行します：

```bash
$ openssl genrsa -passout pass:1234 -des3 -out ca.key 4096
$ openssl req -passin pass:1234 -new -x509 -days 365 -key ca.key -out ca.crt -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Test/CN=Root CA"
```

### 有効なサーバーkey/証明書を生成する

次のコマンドを実行します：

```bash
$ openssl genrsa -passout pass:1234 -des3 -out server.key 4096
$ openssl req -passin pass:1234 -new -key server.key -out server.csr -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Server/CN=localhost"
$ openssl x509 -req -passin pass:1234 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
```

### サーバーkeyからパスフレーズを削除する

次のコマンドを実行します：

```bash
$ openssl rsa -passin pass:1234 -in server.key -out server.key
```

### 有効なクライアントkey/証明書を生成する

次のコマンドを実行します：

```bash
$ openssl genrsa -passout pass:1234 -des3 -out client.key 4096
$ openssl req -passin pass:1234 -new -key client.key -out client.csr -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Client/CN=localhost"
$ openssl x509 -passin pass:1234 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
```

### クライアントkeyからパスフレーズを削除

Run the following command:

```bash
$ openssl rsa -passin pass:1234 -in client.key -out client.key
```

## 使用法

設定が完了すると、FalcoはgRPCサーバーとその出力APIを公開する準備が整います。

これを行うには、シンプルにFalcoを実行します。 例えば：

```bash
$ falco -c falco.yaml -r rules/falco_rules.yaml -r rules/falco_rules.local.yaml -r rules/k8s_audit_rules.yaml
```

[Output](./outputs)イベントを受信して使用する方法については、[Go client](./client-go)または[Python client](./client-python)のドキュメントを参照してください。
