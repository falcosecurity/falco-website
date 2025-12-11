---
title: GPG Key Rotation for Falco Packages (2026)
date: 2025-12-12
author: Leonardo Grasso
slug: gpg-key-rotation-2026
tags: ["Falco","Announcements"]
---


The GPG key used to sign official Falco packages (RPM and DEB) is set to expire on **January 17, 2026**. To ensure the security and continuity of our software distribution, the Falco maintainers will be rotating to a new 4096-bit RSA key.

We have designed a two-phase **"Soft Launch"** strategy to make this transition as smooth as possible, providing a one-month transition window before the old key is retired.

## The Rotation Plan

To avoid immediate disruption, we are rolling out the new key in two distinct phases. You can follow the detailed progress in our [tracking issue \#3750](https://github.com/falcosecurity/falco/issues/3750).

### Phase 1: Soft Launch (Dec 12, 2025)

  * **What happens:** The new GPG key has been published and added to our repository configuration.
  * **Dev Builds:** Will begin using the **New Key** immediately.
  * **Stable Builds:** No stable releases are planned for this phase. If any hotfixes are released, they will be signed with **New Key** as well.
  * **Key Bundle:** The [official key URL](https://falco.org/repo/falcosecurity-packages.asc) has been updated to serve a **bundle** containing *both* the Old (valid) and New (valid) keys.

### Phase 2: Hard Cut-Over (Jan 12–17, 2026)

  * **What happens:** This is the maintenance window where we fully switch to the new key.
  * **Mass Resign:** All existing stable packages on `download.falco.org` will be resigned with the **New Key**.
  * **Revocation:** The Old Key will be officially revoked and removed from the active bundle.
  * **Impact:** If you have not updated your keyring by this date, your package manager (`apt` or `yum`) will reject updates with a signature verification error.

## Action Items for Users

We strongly recommend all users update their GPG keyring **before January 12, 2026** to avoid interruption.

### New Users

If you are installing Falco for the first time following our [Install on a host (DEB,RPM)](https://falco.org/docs/setup/packages/) instructions, no action is required. The installation process will guide you to fetch the new key bundle, ensuring you are ready for both phases.

### Existing Users

If you have an existing Falco installation, you must manually import the new key. We have updated the key file at our standard URL to include both the old and new keys, allowing you to transition safely.

For **`apt` users**, to update your keyring, run the following command:
```bash
# Download the updated key bundle (Old + New) and import it
curl -fsSL https://falco.org/repo/falcosecurity-packages.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/falco-archive-keyring.gpg
```

For **`yum` users**, to update your keyring, run the following command:
```bash
# Download the updated key bundle (Old + New) and import it
rpm --import https://falco.org/repo/falcosecurity-packages.asc
```

*Note: These commands overwrite the existing keyring file with the new bundle. Since the bundle contains both keys, your current installation will continue to work immediately, and will remain working after the January cut-over.*

For more details on `apt` and `yum` specific instructions, please refer to the [Install on a host (DEB,RPM)](https://falco.org/docs/setup/packages/) page of our documentation.


## Summary

  * **Deadline:** Update your keys before **Jan 12, 2026**.
  * **Old Key (Expiring Jan 17, 2026):** [falcosecurity-14CB7A8D.asc](/repo/falcosecurity-14CB7A8D.asc) (Fingerprint `2005399002D5E8FF59F28CE64021833E14CB7A8D`)
  * **New Key:** [falcosecurity-B35B1B1F.asc](/repo/falcosecurity-B35B1B1F.asc) (Fingerprint `478B2FBBC75F4237B731DA4365106822B35B1B1F`)
  * **Tracking Issue:** [falcosecurity/falco\#3750](https://github.com/falcosecurity/falco/issues/3750)

If you encounter any issues during this transition, please reach out to us on the [\#falco channel](https://www.google.com/search?q=https://kubernetes.slack.com/archives/CMWH3EH32) on Kubernetes Slack or open an issue on GitHub.

Thank you for your attention and cooperation in keeping Falco secure!