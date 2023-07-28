---
title: Configuration
linktitle: Configuration
description: Setup Falco to serve events via the gRPC Server
weight: 10
---

## Enabling the Server

The Falco {{< glossary_tooltip text="gRPC" term_id="grpc" >}} server and the Falco gRPC Outputs APIs are not enabled by default.

To enable them, edit the `falco.yaml` Falco configuration file. A sample Falco configuration file is given below:

```yaml
# Falco supports running a gRPC server with two main binding types
# 1. Over the network with mandatory mutual TLS authentication (mTLS)
# 2. Over a local unix socket with no authentication
# By default, the gRPC server is disabled, with no enabled services (see grpc_output)
# please comment/uncomment and change accordingly the options below to configure it.
# Important note: if Falco has any troubles creating the gRPC server
# this information will be logged, however the main Falco daemon will not be stopped.
# gRPC server over network with (mandatory) mutual TLS configuration.
# This gRPC server is secure by default so you need to generate certificates and update their paths here.
# By default the gRPC server is off.
# You can configure the address to bind and expose it.
# By modifying the threadiness configuration you can fine-tune the number of threads (and context) it will use.
grpc:
  enabled: true
  bind_address: "0.0.0.0:5060"
  threadiness: 8
  private_key: "/etc/falco/certs/server.key"
  cert_chain: "/etc/falco/certs/server.crt"
  root_certs: "/etc/falco/certs/ca.crt"
```

As you can see, binding to a network address requires you to generate and specify a set of TLS certificates
as shown in the next section.

Alternatively, if you want something simpler, you can tell Falco to bind the gRPC server to a local unix socket,
this does not require you to generate certificates for mTLS but also comes without any authentication mechanism.

```yaml
# gRPC server using an unix socket
grpc:
  enabled: true
  bind_address: "unix:///var/run/falco.sock"
  threadiness: 8
```

Then, remember to enable the services you need. Otherwise, the gRPC server won't expose anything.

For the outputs use:

```yaml
# gRPC output service.
# By default it is off.
# By enabling this all the output events will be kept in memory until you read them with a gRPC client.
# Make sure to have a consumer for them or leave this disabled.
grpc_output:
  enabled: true
```

## Certificates

When configured to bind to a network address, the Falco gRPC server works only with mutual TLS by design. Therefore, you have to generate the certificates and update the paths in the above configuration.

The Falco authors plan to automate the certificate generation soon.

In the meantime, use the following script to generate the certificates.

**Note**: Ensure that you configure the `-passin`, `-passout`, and `-subj` flags according to your settings.

### Generate CA

Run the following commands:

```bash
$ openssl genrsa -des3 -out ca.key 4096 -passout pass:1234

$ openssl req -new                  \
              -x509                 \
              -days 365             \
              -key ca.key           \
              -out ca.crt           \
              -passin pass:1234     \
              -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Test/CN=Root CA"
```

### Generate Server Key/Cert

Run the following command:

```bash
$ openssl genrsa -des3 -out server.key 4096 -passout pass:1234

$ openssl req -new                  \
              -key server.key       \
              -out server.csr       \
              -passin pass:1234     \
              -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Server/CN=localhost"

$ openssl x509 -req                 \
               -days 365            \
               -CA ca.crt           \
               -CAkey ca.key        \
               -in server.csr       \
               -out server.crt      \
               -set_serial 01       \
               -passin pass:1234
```

### Remove passphrase from Server Key

Run the following command:

```bash
$ openssl rsa -in server.key -out server.key -passin pass:1234
```

### Generate Client Key/Cert

Run the following command:

```bash
$ openssl genrsa -des3 -passout pass:1234 -out client.key 4096

$ openssl req -new                  \
              -passin pass:1234     \
              -key client.key       \
              -out client.csr       \
              -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Client/CN=localhost"

$ openssl x509 -req                 \
               -days 365            \
               -CA ca.crt           \
               -CAkey ca.key        \
               -set_serial 01       \
               -in client.csr       \
               -out client.crt      \
               -passin pass:1234
```

### Remove passphrase from Client Key

Run the following command:

```bash
$ openssl rsa -in client.key -out client.key -passin pass:1234
```

## Usage

When the configuration is complete, Falco is ready to expose its gRPC server and its Outputs APIs.

To do so, simply run Falco. For example:

```bash
$ falco -c falco.yaml -r rules/falco_rules.yaml -r rules/falco_rules.local.yaml
```

Refer to the [Go client](./client-go) documentation to learn how to receive and consume Falco [output](./outputs) events.
