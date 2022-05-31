---
title: Falco 0.32.0
date: 2022-06-03
author: Federico Di Pierro
slug: falco-0-32-0
---

Today we announce the release of **Falco 0.32.0** 🦅!

## Novelties 🆕

Let's review some of the highlights of the new [release](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0320).  
This is one amonge the biggest releases ever™, with around 200 commits on Falco and 230 on libs.  
The Falco community once again proved to be super active, and we wanted to say a huge THANK YOU 🙏 💖 to everyone involved.

### New features

This new release comes with a ton of inner rework; let's start with the foremost important change: lua is no more a dependency of Falco!  
Ok, calm down now.  
Basically, the Falco rule loader was rewritten in C++, to achieve better performance. Moreover, the entire rule engine has been rewritten too.  
This work reduces the needs of weird workarounds in Falco, as it is now fully using libsinsp provided filter parsers and compiler; finally, the [new grammar](https://github.com/falcosecurity/libs/pull/217) fixes quite a lot of minor and not-so-minor bugs.  
Thanks to Jason Dellaluce for his amazing work!  

Another effort by Jason was the porting of k8s audit log support to a [plugin](https://github.com/falcosecurity/plugins/tree/master/plugins/k8saudit); consequently, there is no k8s audit log related code in Falco anymore.

Moreover, a new `--list-syscall-events` CLI option is now available, to print list of supported syscalls.

Users and groups management is now dynamic: newly added users/groups will be properly fetched by Falco. On host, their full informations will be retrieved; instead, on containers, only the uid and gid will be retrieved as there is no stable API to fetch user/group info.
Moreover, Falco won't confuse host and container users anymore.

Another big refactor happened on how Falco handles its CLI and config options, with the concept of "app action". While this has no user facing changes, it is a big change that is also noteworthy.  

Falco is now able to detect changes to ruleset or config file, and automatically restart itself. This behavior is enabled by default.  

Two new operators were developed: `bcontains` and `bstartswith`. These are useful to perform byte matching on events raw data.  
It allows better detection for log4shell like vulnerabilities.  

Finally, all the Falco CI that is not involving any output artifact, has been ported to github actions.  
This frees up credits for CircleCI builds, mitigating various CI issues; moreover, it is now quicker.  

### New syscalls

As always, hard work was also spent on hardening the system, supporting new syscalls:
* `io_uring` family of syscalls
* `mlock` family of syscalls
* `capset` syscall
* `open_by_handle_at` syscall

### Plugins

Plugins API reached stable 1.0.0, with tons of work to improve the API and its performances, eventually fixing any bug encountered.  
This means that the contract is now stable and there is guarantee of avoiding future API breaks.  

GO Plugin Sdk was updated and all plugins were ported to new sdk.

Moreover, with this release, plugin related rules are shipped together with their plugin.  

An okta plugin is now [officially supported](https://github.com/falcosecurity/plugins/tree/master/plugins/okta), and more came from the community:
* [docker plugin](https://github.com/Issif/docker-plugin)
* [seccompagent plugin](https://github.com/kinvolk/seccompagent)

We are really pleased to see new plugins coming; hopefully Plugin API 1.0.0 will give it a boost!

### Fixes

Multiple bugs were fixed:

* a bug that caused Falco memory usage to skyrocket was solved. We are sorry for the inconvenience. 
* multiple issues with container events were fixed.
* number of reported drops was doubled while using the eBPF probe. This is now fixed.
* multiple eBPF verifier issues were solved, resulting in a much more resilient probe.

...and much more of course!

### Security Content 🔒

Bundled dependencies were upgraded, namely openssl to 1.1.1o and libcurl to 7.83.1, fixing a ton of CVEs!  
Moreover, gRPC was also bumped to 1.44.0.

### Default rules update 🛡️

This release also includes updates to the default ruleset: 👇
* [Include .ash_history  in rule: Delete or rename shell history](https://github.com/falcosecurity/falco/pull/1956)
* [rule(Anonymous Request Allowed): exclude {/livez, /readyz}](https://github.com/falcosecurity/falco/pull/1954)
* [rule(k8s): secret get detection for both successful and unsuccessful attempts](https://github.com/falcosecurity/falco/pull/1949)
* [rules: whitelist GCP's container threat detection image](https://github.com/falcosecurity/falco/pull/1959)
* [Fixed ouput Rules K8s Serviceaccount Created/Deleted](https://github.com/falcosecurity/falco/pull/1973/files)
* [rule(falco_rules) Removed use cases not triggering macro curl_download](https://github.com/falcosecurity/falco/pull/1968)
* [rule(Disallowed K8s User): exclude allowed eks users](https://github.com/falcosecurity/falco/pull/1960)
* [Add user_known_mount_in_privileged_containers macro](https://github.com/falcosecurity/falco/pull/1930)
* [Allow to whitelist shell config modifiers](https://github.com/falcosecurity/falco/pull/1938)

Moreover, new rules were added: 👇
* [New Rule Detect Linux Cgroup Container Escape Vulnerability (CVE-2022-0492)](https://github.com/falcosecurity/falco/pull/1969)
* [new(rules): add rule to detect excessively capable container](https://github.com/falcosecurity/falco/pull/1963)
* [rules: detect pods sharing host pid and IPC namespaces](https://github.com/falcosecurity/falco/pull/1951)

---

## Try it!

As usual, in case you just want to try out the stable Falco 0.32.0, you can install its packages following the process outlined in the docs:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian)
- [openSUSE](https://falco.org/docs/getting-started/installation/#suse)
- [Linux binary package](https://falco.org/docs/getting-started/installation/#linux-binary)

Do you rather prefer using the container images? No problem at all! 🐳

You can read more about running Falco with Docker in the [docs](https://falco.org/docs/getting-started/running/#docker).

You can also find the Falcosecurity container images on the public AWS ECR gallery:

- [falco](https://gallery.ecr.aws/falcosecurity/falco)
- [falco-no-driver](https://gallery.ecr.aws/falcosecurity/falco-no-driver)
- [falco-driver-loader](https://gallery.ecr.aws/falcosecurity/falco-driver-loader)

## What's next 🔮

Don't worry, we are still very hungry for improvements!   
Falco 0.33.0 is anticipated to be released in September 2022!

As usual, the final release date will be discussed during the [Falco Community Calls](https://github.com/falcosecurity/community).

Current work is involving arm64 support (https://github.com/falcosecurity/falco/pull/1997, https://github.com/falcosecurity/falco/pull/1990, https://github.com/falcosecurity/driverkit/pull/143), gvisor event source support, and libs versioning with proper tags.  

Moreover, [a proposal for a new eBPF probe](https://github.com/falcosecurity/libs/pull/268) was merged, and hopefully we will see the new probe coming into life very soon™!

In the end, as always, the best is yet to come 😉

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

- Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
- Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Enjoy! 🥳

Federico
