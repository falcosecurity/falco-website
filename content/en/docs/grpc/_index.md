---
title: gRPC API
weight: 10
---

Starting from version [0.18.0](https://github.com/falcosecurity/falco/releases/tag/0.18.0), Falco has its own gRPC server with provides a set of gRPC APIs.

The current APIs are:

- Subscribe to Falco output events
  - [schema definition](./outputs)
- Retrieve the Falco version
  - [schema definition](./version)

In order to interact with these API the falcosecurity organization provides a [Go client](./client-go).

## Configuration

By default, nor the Falco gRPC server neither the Falco gRPC Outputs API are enabled.

To enable them you have to edit the `falco.yaml` Falco configuration file.

{{< highlight yaml >}}
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
{{< / highlight >}}

### Certificates

As you probably already noticed, the Falco gRPC server only works with mutual TLS by design. So you have to generate the certificates and update the paths in the above configuration.

The Falco authors plan to automate the certificates generation soon.

In the meantime, to generate the certificates you can use the following script.

{{< highlight bash >}}
#!/usr/bin/env bash

# Generate valid CA
openssl genrsa -passout pass:1234 -des3 -out ca.key 4096
openssl req -passin pass:1234 -new -x509 -days 365 -key ca.key -out ca.crt -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Test/CN=Root CA"

# Generate valid Server Key/Cert
openssl genrsa -passout pass:1234 -des3 -out server.key 4096
openssl req -passin pass:1234 -new -key server.key -out server.csr -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Server/CN=localhost"
openssl x509 -req -passin pass:1234 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt

# Remove passphrase from the Server Key
openssl rsa -passin pass:1234 -in server.key -out server.key

# Generate valid Client Key/Cert
openssl genrsa -passout pass:1234 -des3 -out client.key 4096
openssl req -passin pass:1234 -new -key client.key -out client.csr -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Client/CN=localhost"
openssl x509 -passin pass:1234 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt

# Remove passphrase from Client Key
openssl rsa -passin pass:1234 -in client.key -out client.key
{{< / highlight >}}

## Usage

Once configured as such Falco is ready to expose its gRPC server and its Outputs API.

To do so simply run it as usual. Eg.,

{{< highlight bash >}}
falco -c falco.yaml -r rules/falco_rules.yaml -r rules/falco_rules.local.yaml -r rules/k8s_audit_rules.yaml
{{< / highlight >}}

Finally, to receive and consume the output events you can take a look at the [Go example](./outputs) we provided.
