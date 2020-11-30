---
title: Falco 0.21.0 is out!
date: 2020-03-18
author: Leonardo Di Donato
---

Even though there's the lockdown, [Falco 0.21.0](https://github.com/falcosecurity/falco/releases/tag/0.21.0) decided to go out!
Such a bad guy!

Notably, this is the first release that happens with the new build & release process. 🚀

<center>
![The new release process!](/img/release-0210.png)
</center>

In case you just want Falco 0.21.0, you can find its packages at the following repositories:

- https://bintray.com/falcosecurity/rpm/falco/0.21.0
- https://bintray.com/falcosecurity/deb/falco/0.21.0
- https://bintray.com/falcosecurity/bin/falco/0.21.0

Instructions to install using them are already updated on the Falco website:

- [CentOS/Amazon Linux](https://falco.org/docs/getting-started/installation/#centos-rhel-amazon-linux)
- [Debian/Ubuntu](https://falco.org/docs/getting-started/installation/#debian-ubuntu)

Instead, for people preferring docker images... 🐳

```bash
docker pull falcosecurity/falco:0.21.0
docker pull falcosecurity/falco:0.21.0-minimal
docker pull falcosecurity/falco:0.21.0-slim
```

## Notable Changes

Release #100 of Falco comes with some notable changes.

### New release process in place

During past weeks, [I](https://github.com/leodido) worked together with [Lorenzo](https://github.com/fntlnz) to put in place a completely new and automated release process for Falco.

We did most of the work into PR [1059](https://github.com/falcosecurity/falco/pull/1059).


This process takes place in two cases:

1. A pull request is merged into master, which leads to the release of a _development_ version of Falco
2. A commit on master receives a git tag, which leads to the release of a _stable_ version of Falco


When one of these two conditions happen:

1. it packages Falco into signed ([GPG public key](https://falco.org/repo/falcosecurity-3672BA8F.asc)) packages: DEB, a RPM, and a TAR.GZ
2. it pushes these packages to their new open repositories
    1. [deb-dev](https://bintray.com/falcosecurity/deb-dev/falco), [rpm-dev](https://bintray.com/falcosecurity/rpm-dev/falco), [bin-dev](https://bintray.com/falcosecurity/bin-dev/falco) for _development_ versions
	1. [deb](https://bintray.com/falcosecurity/deb/falco), [rpm](https://bintray.com/falcosecurity/rpm/falco), [bin](https://bintray.com/falcosecurity/bin/falco) for _stable_ versions
3. it builds the docker images from these packages
4. it pushes the docker images to the [docker hub](https://hub.docker.com/r/falcosecurity/falco)
   1. `falcosecurity/falco:master`, `falcosecurity/falco:master-slim`, `falcosecurity/falco:master-minimal` for _development_ versions
   2. `falcosecurity/falco:latest`, `falcosecurity/falco:latest-slim`, `falcosecurity/falco:latest-minimal` for _stable_ versions

### FALCO_BPF_PROBE

Thanks to [Lorenzo](https://github.com/fntlnz) contribution (PR [1050](https://github.com/falcosecurity/falco/pull/1050)),
to make Falco use the eBPF probe as a driver you need to specify an environment variable named `FALCO_BPF_PROBE`, not `SYSDIG_BPF_PROBE` anymore.

```bash
FALCO_BPF_PROBE="" ./build/release/userspace/falco/falco -r ...
```

Please update your systemd scripts or Kubernetes deployments.

### Falco versions are now SemVer 2.0 compliant

In PR [1086](https://github.com/falcosecurity/falco/pull/1086), [I](https://github.com/leodido) completed the process of creating the Falco version as SemVer 2.0 compliant version strings, from the git index.

This PR introduces the pre-release part into Falco versions.

Now Falco versions are something like `0.21.0-3+c5674c9`, where 3 is the number of commits since the latest _stable_ version (`0.21.0`) of Falco, while `c5674c9` is the commit hash of the current _development_ version.

Please notice that the Falco gRPC version API already contains this version part, too.

### Detect outbound connections to common miner pool ports rule disabled by default

Thanks to [Khaize](https://github.com/Kaizhe) work in PR [1061](https://github.com/falcosecurity/falco/pull/1061) users will not be hit from a tedious amount of alerts about hypothetical mining tools.

From now on, this rule is disabled by default.

Also, if it is enabled by you, it will ignore localhost and RFC1918 addresses.

## Other changes

You can read the full changelog [here](https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md)!

## Some statistics

19 PRs merged in, 12 of which containing changes targeting end-users.

64 commits since past release, in 17 days.

## Upcoming things

Stay tuned for the upcoming [drivers build grid](https://github.com/falcosecurity/test-infra/tree/master/driverkit) which, using [driverkit](https://github.com/falcosecurity/driverkit) - a quarantine project by [me](https://github.com/leodido) and [Lorenzo](https://github.com/fntlnz) - will pre-build and release (in the open too!) the Falco kernel modules and the Falco eBPF probes for a set of predefined target systems and kernel releases.

<center>
![Pre-built Falco kernel modules and Falco eBPF probes available in the open, soon!](/img/upcoming-drivers.png)
</center>
