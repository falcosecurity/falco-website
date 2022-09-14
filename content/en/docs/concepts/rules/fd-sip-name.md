---
aliases: ["/docs/rules/fd-sip-name"]

title: How fd.sip.name and Related Fields Work in Falco rules
weight: 3
---

# Introduction

This section explains how to use the fd.sip.name field and the related fd.{clr}ip.name fields in the default falco ruleset. For example:

```yaml
- list: https_miner_domains
  items: [
    "ca.minexmr.com",
    "cn.stratum.slushpool.com",
    "de.minexmr.com",
    "fr.minexmr.com",
    "mine.moneropool.com",
    "mine.xmrpool.net",
    "pool.minexmr.com",
    "sg.minexmr.com",
    "stratum-eth.antpool.com",
    "stratum-ltc.antpool.com",
    "stratum-zec.antpool.com",
    "stratum.antpool.com",
    "xmr.crypto-pool.fr"
  ]

# Add rule based on crypto mining IOCs
- macro: minerpool_https
  condition: (fd.sport="443" and fd.sip.name in (https_miner_domains))
```

The fd.sip.name field and the related fd.{clr}ip.name fields behave differently than the other fields in the falco ruleset. See the following to learn more.

# Resolve Domains First, Match IPs Later

When a rule contains a field `fd.*ip.name`, the domain names on the right hand side of the comparison (The `foo.com` in `=foo.com or in (foo.com, bar.com)`) are saved internally within the falco engine. The engine looks up the A records for those domains immediately and saves the set of returned IPs internally. This behavior prevents stalling the system call event loop to perform a blocking time-consuming DNS lookup at the time of the system call event.

Later, when a system call event is matched against the condition in the filter, the *actual* IP address associated with the system call event (the server IP for `fd.sip.name`, the client IP for `fd.cip.name`, etc) is compared against the previously looked up set of IPs for the domain name. The actual IP is compared against the set of resolved IPs, based on the comparison operator (=/!=/in, perhaps with a preceding not, etc) and results in a true/false result.

Here's an example. If a rule contains a predicate `evt.type=connect and fd.sip.name=yahoo.com`, the engine resolves the domain yahoo.com to a set of IPs (say 1.2.3.4, 1.2.3.5, 1.2.3.6) at the time the rules are loaded. Later, if a connect system call occurs (say to 1.2.3.5), the server side of the connection is compared against that set of IPs. Since the actual IP 1.2.3.5 is in the set of IPs for the domain yahoo.com, the rule snippet resolves to true.

The right hand side of a predicate can be `in` e.g. `fd.sip.name in (yahoo.com, foo.com)`. In this case, the set of IPs for both domains are resolved and held. A later system call event will compare a given IP to the set of IPs for both sets of domains.

# How Falco Engine Refreshes Domain/IP Mappings

The actual lookup of domains is done on a separate thread, to avoid stalling the main system call event loop. Additionally, the set of IPs for the domain is refreshed periodically, with the following strategy:

* Domain names have a base refresh time of 10 seconds.
* If after a refresh cycle the IP addresses haven't changed, the refresh timeout for that domain name is doubled until 320 seconds (~5mins).

# Caveats Related to fd.*ip.name Fields

There are a few caveats related to the use of `fd.*ip.name` fields that should be considered when writing Falco Rules.

## The Right-Hand Side Must Be a Resolvable Domain Name

Since the right hand side of the predicate (e.g. the `foo.com` part of `fd.sip.name=foo.com`) is used to perform a DNS lookup at the time the rules are loaded, it must be a resolvable domain name. As a result, it's not possible to use domain substrings in conjunction with comparison operators like startswith/endswith/contains/etc. e.g. `fd.sip.name contains company.com`. Also, the falco engine must be able to resolve domain names in order for rules using `fd.*ip.name` fields to return accurate results.

## Using fd.*ip.name Fields in Outputs

The fields `fd.*ip.name` can be used in rule outputs, but they will return meaningful values only when the actual IP for the system call event matches one of the IPs associated with the domain name for the field. For example, the following rule will display a meaningful output for `...IP=%fd.sip.name`, as the rule condition has a positive comparison for a `fd.sip.name` field:

```yaml
- rule: Connect to Yahoo
  desc: Detect Connects to yahoo.com IPs
  condition: evt.type=connect and fd.sip.name=yahoo.com
  output: Some connect to yahoo (command=%proc.cmdline connection=%fd.name IP=%fd.sip.name)
  priority: INFO
```

In contrast, this rule will never display a meaningful output for `...IP=%fd.sip.name`, as the comparison uses a negative match:

```yaml
- rule: Connect to Anything but Yahoo
  desc: Detect Connects to anything other than yahoo.com IPs
  condition: evt.type=connect and fd.sip.name!=yahoo.com
  output: Some connect to something other than yahoo (command=%proc.cmdline connection=%fd.name IP=%fd.sip.name)
  priority: INFO
```

The rule can match a given connect to an IP like 1.5.6.7, which is outside the known IPs 1.2.3.4/1.2.3.5/1.2.3.6 and generate an alert, but the value for `%fd.sip.name` will be blank. (The full connection information is still available in `%fd.name`, though.)

## Limited Comparison Operators

Although the falco rules systax supports a fairly wide set of comparison operators for IPs, including contains, the only allowed operators for `fd.*ip.name` fields are =/!=/in, with an optional preceding not.
