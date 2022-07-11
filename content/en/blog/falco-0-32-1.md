---
title: Falco 0.32.1
date: 2022-07-11
author: Luca Guerra
slug: falco-0-32-1
---

Today we announce the release of **Falco 0.32.1** 🦅!

## Novelties 🆕

A bit more than a month has passed since the last release, and we already have 84 new commits in Falco (bringing the falcosecurity/falco repo to an even and eye pleasing total of _3,000 commits_ 😎) and a massive 215 commit changelog in libs!

A big THANK YOU 💖 goes as usual to everyone in the community for working on that many features and _especially_ to those that are willing to test them even before release! You make Falco successful 🦅! Thanks as always to the Falco maintainers with their relentless work reviewing PRs and making sure the release process works smoothly.

Let's review some of the highlights of the new [release](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md#v0321).

### What's new?

First of all, this new version comes with out of the box support for two technologies that were already partially or internally supported in previous versions and they're now getting the complete feature set they deserve, plus some minor CLI and configuration changes and under-the-hood improvements.

**Official ARM AArch64 Packages and Images** 🚀: you read it right! By popular demand, we now have official AArch64 support! It's hard to overstate the community effort that was required to make this happen, as the necessary changes span across multiple repos and touch pretty much all the components that make Falco work, including:
* falcosecurity/falco with a ton of work by [Federico Di Pierro](https://github.com/FedeDP) to properly build Falco and create shiny new artifacts and images to make installation easy!
* falcosecurity/libs thanks to [Andrea Terzolo](https://github.com/Andreagit97) and Federico for adding kernel and eBPF support to this new architecture which, surprise surprise, behaves differently than x86_64 sometimes in [really unexpected ways](https://github.com/falcosecurity/libs/pull/416) that are tricky to handle;
* falcosecurity/test-infra and falcosecurity/driverkit thanks to [David Windsor](https://github.com/dwindsor), Federico, [maxgio92](https://github.com/maxgio92) and [Michele Zuccala](https://github.com/zuc) we now have proper infrastructure to build multi platform drivers and eBPF probes, now available in the [download.falco.org repository](https://download.falco.org/?prefix=driver/2.0.0%2Bdriver/)!

**gVisor support and relevant CLI options** 🌕: [gVisor](https://gvisor.dev/) is an application kernel for containers that provides efficient defense-in-depth anywhere. When usign gVisor, in order to limit the attack surface of the host, each container is provided with its own application kernel. Normally, Falco would be unable to work in such environments since kernel modules or eBPF probes may not be installed within those sandboxes. Recently, the gVisor team developed a feature that allows security software to receive and audit syscalls that are executed by sandboxed containers; Falco can then use this stream of syscalls as a data source and monitor gVisor systems with the same rulesets as it normally would use. The relevant CLI options `--gvisor-config`, `--gvisor-generate-config` and `--gvisor-root` have been added for this purpose. Stay tuned for more information about how to make Falco and gVisor work together! I had the pleasure to work on this along with [Lorenzo Susini](https://github.com/loresuso). Thanks a lot to the gVisor team for their help!

If you are interested in the Falco libraries and drivers you will be happy to know that both **libs and drivers are now versioned**. In fact, this release uses **libs version 0.7.0** and **driver 2.0.0**. Refer to the [libs readme](https://github.com/falcosecurity/libs#versioning) for more information about versioning strategies and release processes.

This release introduces some minor changes in the configuration, adding `libs_logger.enabled` and `libs_logger.severity` to be able to read libs logs which would otherwise be hidden from the user. The default behavior does not change but those options could be useful for troubleshooting and development.

Also, you can now see additional information about any configured plugin with the new `--plugin-info` CLI option.

Very worth mentioning is the big refactor that is going on in libscap (part of the falco libs) to make it easier to support different types of syscall sources. gVisor support leverages this feature, as the next big things most likely will.

### New syscalls

The support for the `dup` family of syscalls has been enhanced, and also support for `dup2` and `dup3` is now available.

### Fixes

Multiple bugs were fixed:

* fixed incorrect behavior of the `-V` option when validating rules files;
* fixed issues when loading kernel module with DKMS on Flatcar Linux and supporting fetching pre-built module/eBPF probe

...and much more of course, many of which are listed in the [libs 0.7.0 release notes](https://github.com/falcosecurity/libs/releases/tag/0.7.0).

Not really a bug fix from previous releases but I'd like to add a shout out to [Mauro Moltrasio](https://github.com/Molter73) for catching bugs early in reviews and also finding and fixing a tricky stability bug in the integration code for gVisor that was affecting the whole Falco, just right after I committed it!

### Security Content 🔒

* The default signature algorithm for the RPM package is now RSA/SHA256;
* Bundled dependencies were upgraded, namely `openssl` to 1.1.1p and `libcurl` to 7.84.0.

### Default rules update 🛡️

This release also includes updates to the default ruleset: 👇
* [Redirect STDOUT/STDIN to Network Connection in Container](https://github.com/falcosecurity/falco/pull/2092)

Moreover, new rules were added: 👇
* [Java Process Class Download: detect potential log4shell exploitation](https://github.com/falcosecurity/falco/pull/2041)

---

## Try it!

As usual, in case you just want to try out the stable Falco 0.32.1, you can install its packages following the process outlined in the docs:

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

It's an exciting time for Falco as we see so many great improvements and features. What's more exciting is the fact that there are many great ideas and awesome work going on to make the next big things happen.

Recently, there has been a lot of interest on [the shiny new eBPF probe](https://github.com/falcosecurity/libs/pull/268), making use of modern eBPF features like CO-RE, ringbuffer API and new tracing program.

In addition, many people in the community are interested in using Falco to read syscall events and plugin events simultaneously. If you are, I would suggest to take a look at the [in-depth design](https://github.com/falcosecurity/falco/issues/2074) for this new feature!

## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

- Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
- Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

Luca
