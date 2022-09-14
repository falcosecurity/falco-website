---
aliases: ["/docs/event-sources/okta"]
title: Okta Events
weight: 2
---

The Falco [Okta](https://github.com/falcosecurity/plugins/blob/master/plugins/okta/README.md) plugin can read [Okta](https://www.okta.com/) logs and emit events for each Okta log entry.

Falco also distributes out-of-the-box [rules](https://github.com/falcosecurity/falco/blob/master/rules/okta_rules.yaml) that can be used to identify interesting/suspicious/notable events in Okta logs, including:

* Creating a new OKTA user account
* Detecting a locked-out user
* Assigning admin permissions to an okta user

# Configuration

See the [README](https://github.com/falcosecurity/plugins/blob/master/plugins/okta/README.md#settings) for information on configuring the plugin. This simply involves providing the `organization/api` token as part of init params. These can be added to `falco.yaml` under the `plugins` [configuration key](https://falco.org/docs/configuration/) key.

The plugin does not use any open params configuration.

# Sample Output

For example, when using a dummy rule as follows:

```
- rule: Dummy
  desc: Dummy
  condition: okta.app!=""
  output: "evt=%okta.evt.type user=%okta.actor.name ip=%okta.client.ip app=%okta.app"
  priority: DEBUG
  source: okta
  tags: [okta]
```

The dummy rule will emit an alert for each Okta log entry, like the following:

```
19:12:25.439350000: Debug evt=user.authentication.sso user=User1 ip=x.x.x.x app=google
19:12:30.675628000: Debug evt=user.authentication.sso user=User2 ip=x.x.x.x app=github
19:12:35.918456000: Debug evt=user.authentication.sso user=User3 ip=x.x.x.x app=office365
```
