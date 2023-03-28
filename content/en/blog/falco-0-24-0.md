---
title: Falco 0.24.0 a.k.a. "the huge release"
date: 2020-07-16
author: Leonardo Di Donato, Leonardo Grasso
slug: falco-0-24-0
tags: ["Falco","Release"]
---

After two long months, look who's back!

Today we announce the release of Falco 0.24 🥳

You can take a look at the huge set of changes here:

- [0.24.0](https://github.com/falcosecurity/falco/releases/tag/0.24.0)

In case you just want to try out the stable Falco 0.24, you can install its packages following the usual process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)

Do you rather prefer using the docker images? No problem!

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

## Breaking Changes

In case you wanna grab statistics about your running Falco instance, be aware that this [PR](https://github.com/falcosecurity/falco/pull/1308) fixed and changed the name of the CLI flag you need to enable such feature. The flag is `--stats-interval` now and finally, it also works for values greater than 999 milliseconds.

Because of performance issues of the Falco gRPC Outputs API we went through an almost complete redesign of the gRPC server and the outputs RPCs.

Long story short: the gRPC outputs method is now `falco.outputs.service/get` and **not** `falco.outputs.service/subscribe` anymore.

Furthermore, we introduced a `falco.outputs.service/sub` gRPC method that behaves in the same way the old one was behaving, except that it is way faster than the old method.

## Notorious gRPC fixes and features

Some months ago, a user [reported](https://github.com/falcosecurity/falco/issues/1126) a very high CPU usage when using Falco gRPC outputs API with Falco 0.21.

Profiling the code we discovered that the gRPC threads were keeping the CPUs very very busy.

![falco 0.21 high CPU usage](/img/grpc-outputs-before.png)

Digging deeply into the gRPC code and the gRPC core, [Leo](https://github.com/leodido) and [Lore](https://github.com/fntlnz) soon realized that to solve the issue a rewrite of important pieces of the Falco gRPC code was needed.

So we introduced a **bidirectional API** (`falco.outputs.service/sub`) to **watch the Falco alerts** through gRPC and we changed the server streaming gRPC outputs method (`falco.outputs.service/get`) to consume less memory and fewer CPU resources.

After some days of fine-tuning and continuous tests (4MLN requests towards the gRPC server, in 10 seconds) we've been able to reduce the CPUs occupancy of the gRPC outputs methods from nearly ~90% to values less than 20%. 🚀

![Falco 0.24 low CPU usage](/img/grpc-outputs-after.png)

In that [PR](https://github.com/falcosecurity/falco/pull/1241) you can find all the story, all the code changes, and also the instructions to quickly try out the new Falco gRPC output methods using `grpcurl`.

So, all's well that ends well: users are now happy and we too! 🤗

![Falco users reporting ](/img/cpu-usage-with-grpc-back-to-normal.png)

Finally, now that Falco gRPC outputs are better, we want to advertise the community about two other important and gRPC related features that Falco 0.24 ships:

- you can now let Falco automatically configure the threadiness of its gRPC server by using `threadiness: 0` into the Falco config ([falco#1271](https://github.com/falcosecurity/falco/pull/1271))
- lo and behold, you can now connect to the Falco gRPC server through a Unix socket ([falco#1217](https://github.com/falcosecurity/falco/pull/1217))

We already updated the [Falco Go client](https://github.com/falcosecurity/go-client).

So, we'd invite all the Falco community and users to try out these new features and the improvements about gRPC!

## Support for eBPF driver on CentOS 8 is back!

Since April some friends of our community reported issues on building the Falco eBPF driver on CentOS 8 ([falco#1129](https://github.com/falcosecurity/falco/issues/1129)).

After some intensive debugging sessions, [Lorenzo](https://github.com/fntlnz) and [Leo](https://github.com/leodido) discovered the cause: CentOS 8 backported process type functionalities (and relates structs) from Linux kernel 4.19 to 4.18 that made the driver checks ineffective.

Do you wanna look at some eBPF? Take a look at this [PR](https://github.com/draios/sysdig/pull/1650/files)!

Falco driver version [85c8895](https://github.com/falcosecurity/falco/pull/1305) contains the fix so that y'all can again run our beloved tool on your CentOS 8 boxes. 📦

## Unbuffered outputs 😆

[Leonardo Grasso](https://github.com/leogr) finally spotted a tricky typo that was causing `buffered_output: false` config option to do not work as expected.

Thanks to his fix, from now on Falco will promptly output its alerts on `stdout` when this option is disabled.

Also, we'd like to welcome Grasso in the family of Falco maintainers!

## Rules update

We are very thankful to [Khaize](https://github.com/Kaizhe) for this huge [PR](https://github.com/falcosecurity/falco/pull/1294) that introduces a bunch of placeholder macros.

Thanks to his effort, users can now customize their own Falco rulesets more easily!

## Some statistics

38 pull requests merged in, 29 of which containing changes directly targeting our end-users.

105 commits since past release, that was two months ago.

## Be aware: userspace instrumentation is coming...

In this release Falco introduces userspace level instrumentation contract.

This functionality can be enabled by passing the `-u` flag when starting Falco, or using its long version - ie., `--userspace`.

A userspace implementation will also need to be implemented as well to take advantage of this contract.

The Falco community is currently working on an implementation called `pdig` which is built around `ptrace(2)` and `seccomp`. We are very excited to see `pdig` reach production support in the future.

Read more into the [Falco website](https://falco.org/docs/event-sources/drivers/#userspace-instrumentation).

See you in August with many more things!
