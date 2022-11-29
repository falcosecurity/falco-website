---
title: Default and Local Rules Files
description: Falco provides default rules, but you can add your own
linktitle: Default and Local Rules
weight: 20
---

Starting with Falco 0.8.0, falco officially supports the notion of a _default_ rules file and a _local_ rules file. This has previously been supported by running falco with multiple `-r` arguments. In 0.8.0, we're formalizing this notion to make it easier to customize falco's behavior but still retain access to rule changes as a part of software upgrades. Of course, you can always customize the set of files you want to read by changing the `rules_file` option in `falco.yaml`.

The default rules file is always read first, followed by the local rules file.

When installed via rpm/debian packages, both rules files, as well as the falco configuration file, are flagged as "config" files, meaning they are not overridden on package upgrade/uninstall if modified.

## Default Rules File

The default falco rules file is installed at `/etc/falco/falco_rules.yaml`. It contains a predefined set of rules designed to provide good coverage in a variety of situations. The intent is that this rules file is not modified, and is replaced with each new software version.

## Local Rules File

The local falco rules file is installed at `/etc/falco/falco_rules.local.yaml`. It is empty other than some comments. The intent is that additions/overrides/modifications to the main rules file are added to this local file. It will not be replaced with each new software version.
