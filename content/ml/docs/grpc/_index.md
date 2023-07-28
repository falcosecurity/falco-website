|  ശീർഷകം  | വെയ്റ്റ് |
| :------: | :---: |
| gRPC API |   7   |

[0.18.0](https://github.com/falcosecurity/falco/releases/tag/0.18.0) എന്ന വേർഷനിൽ നിന്നും തുടങ്ങി, APIകളുടെ ഒരു ഗണം നൽകുന്ന ഒരു സ്വന്തം gRPC സർവർ ഫാൽക്കോക്ക് ഉണ്ട്.

നിലവിലുള്ള APIകൾ ഇവയാണ്:

- [schema definition](outputs): ഫാൽക്കോ ഔട്ട്പുട്ട് ഇവൻറുകൾ നേടുകയോ അവ സബ്സ്ക്രൈബ് ചെയ്യുകയോ ചെയ്യുക.
- [schema definition](version): ഫാൽക്കോ വേർഷൻ വീണ്ടെടുക്കുക.

ഈ APIകളുമായി സംവദിക്കുന്നതിന് , ഫാൽക്കോ സെക്യൂരിറ്റി സംഘടന ചില ക്ലൈൻറുകൾ/SDKകൾ നൽകുന്നു:

- [client-go](./client-go)

## ക്രമീകരണം

ഫാൽക്കോ gRPC സർവറും ഫാൽക്കോ gRPC ഔട്ട്പുട്ട് APIകളും ഡീഫോൾട്ട് ആയി പ്രവർത്തനസജ്ജമാക്കിയിട്ടില്ല.

അവയെ പ്രവർത്തനസജ്ജമാക്കാൻ, `falco.yaml` ഫാൽക്കോ ക്രമീകരണ ഫയൽ എഡിറ്റ് ചെയ്യുക. ഒരു സാമ്പിൾ ഫാൽക്കോ ക്രമീകരണ ഫയൽ താഴെ കൊടുത്തിരിക്കുന്നു:

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

നിങ്ങൾക്ക് കാണാനാകുന്നത് പോലെ, ഒരു നെറ്റ്വർക്ക് വിലാസത്തിലേക്ക് ബൈൻഡ് ചെയ്യുന്നതിന്, നിങ്ങൾ അടുത്ത ഭാഗത്ത് കാണിച്ചിരിക്കുന്നതുപോലെ TLS സർട്ടിഫിക്കറ്റുകളുടെ ഒരു ഗണം ജനറേറ്റ് ചെയ്യുകയും വ്യക്തമാക്കുകയും ചെയ്യേണ്ടതുണ്ട്.

പകരം, നിങ്ങൾക്ക് കൂടുതൽ ലളിതമായ ഒന്നാണ് വേണ്ടതെങ്കിൽ, gRPC സർവർ ലോക്കൽ യൂണിക്സ് സോക്കറ്റിലേക്ക് ബൈൻഡ് ചെയ്യാൻ നിങ്ങൾക്ക് ഫാൽക്കോയോട് പറയാം, ഇത് നിങ്ങളോട് mTLS ന് വേണ്ടി സർട്ടിഫിക്കറ്റുകൾ ജനറേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുകയില്ല എന്ന് മാത്രമല്ല, ഒരു പ്രാമാണീകരണസംവിധാനവുമില്ലാതെയാണ് ഇത് വരുന്നത്.

```yaml
# gRPC server using an unix socket
grpc:
  enabled: true
  bind_address: "unix:///var/run/falco.sock"
  threadiness: 8
```

പിന്നെ, നിങ്ങൾക്കാവശ്യമായ സേവനങ്ങൾ പ്രവർത്തനക്ഷമമാക്കാൻ ഓർമ്മിക്കുക, അല്ലെങ്കിൽ ഔട്ട്പുട്ട്സ് ഉപയോഗത്തിനായി gRPC സർവർ ഒന്നും വെളിപ്പെടുത്തുകയില്ല:

```yaml
# gRPC output service.
# By default it is off.
# By enabling this all the output events will be kept in memory until you read them with a gRPC client.
# Make sure to have a consumer for them or leave this disabled.
grpc_output:
  enabled: true
```


### സർട്ടിഫിക്കറ്റുകൾ

ഒരു നെറ്റ്വർക്ക് വിലാസത്തിലേക്ക് ബൈൻഡ് ചെയ്യാനായി ക്രമീകരിച്ചുകഴിഞ്ഞാൽ, ഡിസൈൻ അനുസരിച്ച് മ്യൂച്വൽ TLS നോടൊപ്പം മാത്രമേ ഫാൽക്കോ gRPC സർവർ പ്രവർത്തിക്കുകയുള്ളൂ. അതിനാൽ, നിങ്ങൾ സർട്ടിഫിക്കറ്റ് ജനറേറ്റ് ചെയ്യുകയും മുകളിലെ ക്രമീകരണത്തിൽ പാതകൾ അപ്ഡേറ്റ് ചെയ്യുകയും ചെയ്യേണ്ടതുണ്ട്.

സർട്ടിഫിക്കറ്റ് ജനറേഷൻ ഉടൻ ഓട്ടോമേറ്റ് ചെയ്യാൻ ഫാൽക്കോ രചയിതാക്കൾ പദ്ധതിയിടുന്നു. 

അതിനിടയിൽ, സർട്ടിഫിക്കറ്റുകൾ ജനറേറ്റ് ചെയ്യാൻ ഇനി പറയുന്ന സ്ക്രിപ്റ്റ് ഉപയോഗിക്കുക. 

**കുറിപ്പ്**: നിങ്ങളുടെ സജ്ജീകരണങ്ങൾക്കനുസരിച്ച് `-passin`, `-passout`, `-subj` എന്നീ ഫ്ലാഗുകൾ ക്രമീകരിക്കുന്നുവെന്ന് ഉറപ്പുവരുത്തുക. 

### പ്രബലമായ CA ജനറേറ്റ് ചെയ്യുക

ഇനി പറയുന്ന കമാൻഡ് റൺ ചെയ്യുക:

```bash
$ openssl genrsa -passout pass:1234 -des3 -out ca.key 4096
$ openssl req -passin pass:1234 -new -x509 -days 365 -key ca.key -out ca.crt -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Test/CN=Root CA"
```

### പ്രബലമായ സർവർ കീ/സർട്ട് ജനറേറ്റ് ചെയ്യുക

ഇനി പറയുന്ന കമാൻഡ് റൺ ചെയ്യുക:

```bash
$ openssl genrsa -passout pass:1234 -des3 -out server.key 4096
$ openssl req -passin pass:1234 -new -key server.key -out server.csr -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Server/CN=localhost"
$ openssl x509 -req -passin pass:1234 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
```

### സർവർ കീയിൽ നിന്നും പാസ്ഫ്രേസ് നീക്കം ചെയ്യുക 

ഇനി പറയുന്ന കമാൻഡ് റൺ ചെയ്യുക:

```bash
$ openssl rsa -passin pass:1234 -in server.key -out server.key
```

### പ്രബലമായ ക്ലൈൻറ് കീ/സർട്ട് ജനറേറ്റ് ചെയ്യുക

ഇനി പറയുന്ന കമാൻഡ് റൺ ചെയ്യുക:

```bash
$ openssl genrsa -passout pass:1234 -des3 -out client.key 4096
$ openssl req -passin pass:1234 -new -key client.key -out client.csr -subj  "/C=SP/ST=Italy/L=Ornavasso/O=Test/OU=Client/CN=localhost"
$ openssl x509 -passin pass:1234 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
```

### ക്ലൈൻറ് കീയിൽ നിന്നും പാസ്ഫ്രേസ് നീക്കം ചെയ്യുക 

ഇനി പറയുന്ന കമാൻഡ് റൺ ചെയ്യുക:

```bash
$ openssl rsa -passin pass:1234 -in client.key -out client.key
```

## ഉപയോഗം

ക്രമീകരണം പൂർണ്ണമാകുമ്പോൾ, ഫാൽക്കോ അതിൻറെ gRPC സർവറും അതിൻറെ ഔട്ട്പുട്ട് APIകളും വെളിപ്പെടുത്താൻ തയ്യാറാവുന്നു.

അങ്ങനെ ചെയ്യാൻ, ലളിതമായി ഫാൽക്കോ റൺ ചെയ്യുക. ഉദാഹരണത്തിന്:

```bash
$ falco -c falco.yaml -r rules/falco_rules.yaml -r rules/falco_rules.local.yaml -r rules/k8s_audit_rules.yaml
```

ഫാൽക്കോ [output](./outputs) ഇവൻറുകൾ സ്വീകരിക്കുന്നതും ഉപയോഗിക്കുന്നതും എങ്ങനെയാണെന്ന് പഠിക്കുന്നതിന് [Go client](./client-go) അല്ലെങ്കിൽ [Python client](./client-py) ഡോക്യുമെൻറേഷൻ റഫർ ചെയ്യുക.