---
title: The GPG key used to sign Falco packages has been rotated
date: 2023-01-18
author: Jason Dellaluce
slug: falco-packages-gpg-key-rotated
---

The Falcosecurity organization uses a GPG key for providing detatched signatures for the official Falco packages available at [download.falco.org/?prefix=packages](https://download.falco.org/?prefix=packages/). After [the security incident of CircleCI](https://circleci.com/blog/january-4-2023-security-alert/) disclosed in January 2023, the Falco maintainers opted for rotating the organization's secrets and token stored in the platform. Although we have not found any evidence of unauthorized modification of the Falco packages or their signatures, the GPG key has still been rotated as a safety measure.

As of January 18th 2023, [the old key with fingerprint `15ED 05F1 91E4 0D74 BA47 109F 9F76 B25B 3672 BA8F`](/repo/falcosecurity-3672BA8F.asc) has been revoked. The GPG fingerprint of [the new key is `2005 3990 02D5 E8FF 59F2 8CE6 4021 833E 14CB 7A8D`](/repo/falcosecurity-14CB7A8D.asc). Please refer to the Falco [installation guide](/content/en/docs/getting-started/installation.md) for learn more about how the key can be used to verify the official packages.

## Action items for existing users

Users not using package signature verification (enabled by default in most DEB and RPM systems) will be not affected.

Otherwise, your should update the key as soon as you can to download its revocation certificate. The next step is to download the new key as documented in the Falco [installation guide](/content/en/docs/getting-started/installation.md). All the Falco packages' signatures will be signed with the new key starting from January 18th 2023.

The old key should be considered invalid and signatures produced with it should be untrusted. The existing release package signatures available at [download.falco.org/?prefix=packages](https://download.falco.org/?prefix=packages/) have been updated by signing their relative packages with the new key.

## Action items for new users

No action item is required for new users, simply follow the Falco [installation guide](/content/en/docs/getting-started/installation.md) to learn how to employ the package signature verification.

## Contacts

Do not hesitate to reach out to the Falco community and its maintainers for further clarifications.

* Join our [weekly community calls](https://github.com/falcosecurity/community)
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/messages/falco).
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).
