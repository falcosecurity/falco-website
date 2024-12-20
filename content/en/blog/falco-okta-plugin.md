---
title: "Analyze Okta Log Events with a Falco Plugin"
date: 2022-03-25
author: Thomas Labarussias
slug: falco-okta-plugin
---

In March 2022, the cybercriminal group LAPSUS$ claimed [to have breached Okta](https://www.okta.com/blog/2022/03/updated-okta-statement-on-lapsus/), the **Identity Platform**, only two months earlier, leaving their customers with the uncertainty of having been exposed as well. After a thorough investigation undertaken by their security team, Okta made public some details of this [security incident](https://www.okta.com/blog/2022/03/oktas-investigation-of-the-january-2022-compromise/).

Okta provides identity services for more than 15.000 companies. They guarantee that only legitimate personnel has access to networks and resources within their organization. This incident has raised once more the concern, that detecting suspicious events as soon as they occur within the organization is more necessary than ever. 

Falco has always excelled as a threat detection engine observing activity on Linux servers and Kubernetes clusters. Since Falco 0.31 it is also possible to **collect events from sources other than Kernel Syscalls and Kubernetes Audit logs**. The number of sources can be extended to cover any stream of events. For more information read our blogs posts about it:

* [Falco Plugins Early Access](https://falco.org/blog/falco-plugins-early-access/)
* [Falco 0.31.0 a.k.a. "the Gyrfalcon"](https://falco.org/blog/falco-0-31-0/)
* [Announcing Plugins and Cloud Security with Falco](https://falco.org/blog/falco-announcing-plugins/)
* [Extend Falco inputs by creating a Plugin: the basics](https://falco.org/blog/extend-falco-inputs-with-a-plugin-the-basics)

In this blog post, we'll introduce a new plugin created by the Falco Authors to collect [Okta Log Events](https://developer.okta.com/docs/reference/api/system-log/) and be able to trigger alerts whenever suspicious events are detected.

![Okta Plugin](/img/falco-okta-plugin-architecture.png)

### Installation

As with any other plugin created by the Falco Authors, you will find a library already built for a Linux environment in [this URL](https://download.falco.org/?prefix=plugins/stable/).

It is a good practice to download the stable version and install it in the directory `/usr/local/share/falco/plugins`.

Here are the steps to do so:
```shell=
sudo mkdir -p /usr/local/share/falco/plugins
cd /tmp
wget https://download.falco.org/plugins/stable/okta-0.1.0-x86_64.tar.gz
tar xvzf okta-0.1.0-x86_64.tar.gz
sudo mv libokta.so /usr/local/share/falco/plugins
```

### Configuration

To activate the plugin for Falco, add the following configuration inside the `plugin` section of the file `/etc/falco/falco.yaml` like this:

```yaml=
plugins:
  - name: okta
    library_path: /usr/local/share/falco/plugins/libokta.so
    init_config:
      organization: MYORG
      api_token: MY_API_TOKEN
    open_params: ''
```

And enable it in the `load_plugins` section of the same file:
```yaml=
load_plugins: [okta]
```

> Be aware that loading a plugin disables the syscalls collection. You may need to run a different instance of Falco service aside to collect both.

Only the following custom settings are required:
* `organization`: The name of your organization (same as in *https://xxxx.okta.com*)
* `api_token`: Your API Token to access Okta API. Follow [the steps in the Okta Docs](https://developer.okta.com/docs/guides/create-an-api-token/main/) to know how to create one.

### Rules

#### Available fields

The [plugin README](https://github.com/falcosecurity/plugins/tree/master/plugins/okta#supported-fields) lists all available fields to create your rules:

| Name                            | Type   | Description                     |
| ------------------------------- | ------ | ------------------------------- |
| `okta.app`                      | string | Application                     |
| `okta.evt.type`                 | string | Event Type                      |
| `okta.evt.legacytype`           | string | Event Legacy Type               |
| `okta.severity`                 | string | Severity                        |
| `okta.message`                  | string | Message                         |
| `okta.actor.id`                 | string | Actor ID                        |
| `okta.actor.Type`               | string | Actor Type                      |
| `okta.actor.alternateid`        | string | Actor Alternate ID              |
| `okta.actor.name`               | string | Actor Display Name              |
| `okta.client.zone`              | string | Client Zone                     |
| `okta.client.ip`                | string | Client IP Address               |
| `okta.client.device`            | string | Client Device                   |
| `okta.client.id`                | string | Client ID                       |
| `okta.client.geo.city`          | string | Client Geographical City        |
| `okta.client.geo.state`         | string | Client Geographical State       |
| `okta.client.geo.country`       | string | Client Geographical Country     |
| `okta.client.geo.postalcode`    | string | Client Geographical Postal Code |
| `okta.client.geo.lat`           | string | Client Geographical Latitude    |
| `okta.client.geo.lon`           | string | Client Geographical Longitude   |
| `okta.useragent.os`             | string | Useragent OS                    |
| `okta.useragent.browser`        | string | Useragent Browser               |
| `okta.useragent.raw`            | string | Raw Useragent                   |
| `okta.result`                   | string | Outcome Result                  |
| `okta.reason`                   | string | Outcome Reason                  |
| `okta.transaction.id`           | string | Transaction ID                  |
| `okta.transaction.type`         | string | Transaction Type                |
| `okta.requesturi`               | string | Request URI                     |
| `okta.principal.id`             | string | Principal ID                    |
| `okta.principal.alternateid`    | string | Principal Alternate ID          |
| `okta.principal.type`           | string | Principal Type                  |
| `okta.principal.name`           | string | Principal Name                  |
| `okta.authentication.step`      | string | Authentication Step             |
| `okta.authentication.sessionid` | string | External Session ID             |
| `okta.security.asnumber`        | uint64 | Security AS Number              |
| `okta.security.asorg`           | string | Security AS Org                 |
| `okta.security.isp`             | string | Security ISP                    |
| `okta.security.domain`          | string | Security Domain                 |
| `okta.target.user.id`           | string | Target User ID                  |
| `okta.target.user.alternateid`  | string | Target User Alternate ID        |
| `okta.target.user.name`         | string | Target User Name                |
| `okta.target.group.id`          | string | Target Group ID                 |
| `okta.target.group.alternateid` | string | Target Group Alternate ID       |
| `okta.target.group.name`        | string | Target Group Name               |


### List of event types of interest

Okta Security Team also proposes [a list of event types of interest](https://github.com/OktaSecurityLabs/CheatSheets/blob/master/SecurityEvents.md).

#### User Events

|EventType Filter|Notes|
|------------- |-------------|
|eventType eq "user.session.start"|User logging in|
|eventType eq "user.session.end"|User logging out|
|eventType eq “policy.evaluate_sign_on”|Sign in policy evaluation|
|eventType eq “user.account.lock”|Okta user locked out|
|eventType sw "user.authentication.auth"|All types of Auth events, covering MFA, AD, Radius, etc|
|eventType eq "user.account.update_password"|User changing password|
|eventType eq "user.authentication.sso"|User accesing app via single sign on|
|eventType eq "user.authentication.auth_via_mfa"|MFA challenge|
|eventType eq "user.mfa.factor.update"|User changing MFA factors|

#### Okta Events

| EventType Filter |  Notes|
| ------------- | -------------|
|eventType eq "user.session.access_admin_app | These events are associated with users accessing the Admin section of your Okta instance |
|eventType eq "user.account.reset_password" | User password reset by Okta Admin |
|eventType eq "zone.update"|Modification of a Network Zone|
|eventType eq "user.account.privilege.grant"|Granting Okta Admin to a user|
|eventType eq "group.user_membership.add"|Adding Okta user to a group|
|eventType eq "application.user_membership.add"|Adding user to application membership|
|eventType eq "policy.lifecycle.create"|Creation of a new Okta Policy|
|eventType eq ”application.lifecycle.create”|New Application created|
|eventType eq ”user.lifecycle.activate”|New Okta user|
|eventType eq "application.provision.user.push"|Assign application to user|
|eventType eq ”user.lifecycle.deactivate”|Deactivate Okta user|
|eventType eq ”user.lifecycle.suspend”|Suspend Okta user|
|eventType eq "user.session.clear"|Okta user login session cleared|
|eventType eq "system.api_token.create"|Creation of a new Okta API token|
|eventType eq “system.org.rate_limit.violation”|Hitting the rate limit on requests|
|eventType eq “user.mfa.factor.deactivate”|Removed MFA factor from user|
|eventType eq "user.mfa.factor.reset_all"|Remove all MFA factors from user|

#### Examples

We can now easily create Falco rules to detect possible threats, e.g.:

```yaml=
- rule: Adding user in OKTA group
  desc: Detect a new user added to an OKTA group
  condition: okta.evt.type = "group.user_membership.add"
  output: >
       "A user has been added in an OKTA group 
       (user=%okta.actor.name, 
       target group=%okta.target.group.name, 
       target user=%okta.target.user.name)"
  priority: NOTICE
  source: okta
  tags: [okta]
  
- rule: User accessing OKTA admin section
  desc: Detect a user accessing OKTA admin section of your OKTA instance
  condition: okta.evt.type = "user.session.access_admin_app"
  output: >
       "A user accessed the OKTA admin section of your OKTA instance
       (user=%okta.actor.name, ip=%okta.client.ip)"
  priority: NOTICE
  source: okta
  tags: [okta]
```

> Notice the `source: okta`. It is mandatory to tell Falco these rules are related to the Okta plugin.

**You can find the whole set of rules proposed by the Falco Authors among other rulesets in [a PR in main Falco repository](https://github.com/falcosecurity/falco/pull/1955).**

### Run

Once the configuration and our rules are ready to be used, it's time to test it:

```shell=
falco -c /etc/falco/falco.yaml -r /etc/falco/okta_rules.yaml
```

You should get this kind of results:
```shell
14:07:31.295984000: Notice A user has accessed an app using OKTA (user=Tony Stark, app=avengers_drive)
14:07:36.531283000: Notice A user has accessed an app using OKTA (user=Natasha Romanoff, app=shield_cloud)
14:08:24.077820000: Notice A user logged in OKTA from a suspicious country (user=Black Panther, ip=x.x.x.x, country=Wakanda)
14:09:22.064456000: Notice A user logged in OKTA from a suspicious country (user=Thanos, ip=x.x.x.x, country=Titan)
```

### Conclusion

With the power of Falco and its new plugin framework, we've been able to consume events from a new source in just a few hours. This effort also aims to improve the observability of such an important element in the infrastructure of numerous organizations, as an Identity Provider like Okta is.

Falco keeps demonstrating that it is much more than a runtime security project. It can support organizations by enabling their security teams to quickly detect and respond whenever a security incident occurs.

---

You can find us in the [Falco community](https://github.com/falcosecurity/community). Please feel free to reach out to us for any questions, suggestions, or even for a friendly chat!

If you would like to find out more about Falco:

* Get started in [Falco.org](http://falco.org/)
* [Plugin Documentation](https://falco.org/docs/plugins/)
* [Plugin Developer Guide](https://falco.org/docs/concepts/plugins/developers-guide/)
* [Plugin registry](https://github.com/falcosecurity/plugins) 
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco)
* Get involved in the [Falco community](https://falco.org/community/)
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/messages/falco)
* Follow [@falco_org on Twitter](https://twitter.com/falco_org)

