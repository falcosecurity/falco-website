# Disabling Automatic Updates in Falco

This is a guide to completely disable automatic updates for both the Falco engine and rules, addressing concerns about supply chain risks.

**Important note: When Falco is installed via .deb or .rpm packages, falcoctl is also installed and comes with a systemd service that may have auto-update enabled by default.
In this scenario, even though Falco itself does not perform any automatic updates, falcoctl may still automatically update rules, plugins, or other artifacts. Therefore, you must ensure that falcoctl auto-update is explicitly disabled.**

---

## Without `falcoctl`

By default, Falco itself does **not automatically update** its engine or rules. If you installed Falco via package manager or container image, updates occur **only when you manually upgrade the package or image**.

To ensure safety:

1. **Do not run any update commands** inside the container or host for Falco rules
2. Use local rules only:
   - `/etc/falco/falco_rules.yaml`
   - `/etc/falco/falco_rules.local.yaml`
3. Avoid enabling any external artifact fetching tools

## With `falcoctl`

**falcoctl** can automatically manage artifacts (rules, plugins, drivers). To disable updates:

### If the configuration file does not exist :

Create the configuration directory and file:

```sh
mkdir -p /etc/falcoctl
cat <<EOF > /etc/falcoctl/falcoctl.yaml
artifact:
  install:
    enabled: false
  follow:
    enabled: false
indexes: []
EOF
```

- artifact.install.enabled: false → prevents falcoctl from **automatically downloading or installing any artifacts** (rules, plugins, drivers)

- artifact.follow.enabled: false → prevents falcoctl from **tracking or updating any remote artifact indexes**

- indexes: [] → ensures no external repositories are used

This configuration guarantees that falcoctl will **not connect to GitHub or any remote registry**, fully disabling automatic updates.

## If the configuration file already exists :

1. Open /etc/falcoctl/falcoctl.yaml (or $HOME/.falcoctl.yaml if using user config).
2. Ensure the artifact section contains:

```sh
artifact:
  install:
    enabled: false
  follow:
    enabled: false
```

- If install or follow keys are missing, add them with enabled: false

- This overrides any defaults that would fetch or update rules/plugins automatically

By explicitly disabling install and follow, falcoctl will stop all automatic artifact updates, addressing supply chain security concerns.
