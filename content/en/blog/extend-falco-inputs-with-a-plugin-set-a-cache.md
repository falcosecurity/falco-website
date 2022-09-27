---
Title: "Extend Falco inputs by creating a Plugin: set a cache"
Date: 2022-09-27
Author: Thomas Labarussias
slug: extend-falco-inputs-with-a-plugin-set-a-cache
---

> This post is is part of a series of articles about `How to develop Falco plugins`. It's adressed to anybody who would like to understand how plugins are written and want to contribute.
> See other articles:
> * [Extend Falco inputs by creating a Plugin: The basics]({{< ref "/blog/extend-falco-inputs-with-a-plugin-the-basics" >}})
> * [Extend Falco inputs by creating a Plugin: Register the plugin]({{< ref "/blog/extend-falco-inputs-with-a-plugin-register" >}})

- [Why using a cache?](#why-using-a-cache)
- [Our use case](#our-use-case)
- [Chosen cache](#chosen-cache)
- [Implementation](#implementation)
	- [Requirement](#requirement)
	- [New fields](#new-fields)
	- [Settings and Init of the cache](#settings-and-init-of-the-cache)
	- [Set in cache](#set-in-cache)
	- [Get from cache](#get-from-cache)
	- [Rules](#rules)
- [Conclusion](#conclusion)

# Why using a cache?

By design, Falco considers the events as atomic, it can't make links between them. It comes from its first purpose, which is to monitor syscalls. It means we can't create rules based on counts, like a number of failed HTTP requests in a period of times. This behavior will not change for syscalls, but for other sources of events, with the plugins, we have full control ands can imagine to do so. The performances issues we may have are less constraining as the amount of handled events is smaller than for syscalls.
It comes the idea to store in the memory of the plugin some counters to add extra fields to the captured events, these fields will be usable in rules like any other fields. When we talk about "keeping in memory", it rings a bell in our engineer minds, this mechanism is a **cache**. So this is what we'll explain in this new post in our series "How to write a plugin": setting up and using a cache in a plugin.

# Our use case

Recently, Uber, a major tech companies has been breached by the Lapsus$ cyber-crime group, by using social engineering attack. The hackers used the technique known as MFA spamming or MFA fatigue, the attacker repeatedly logs into a victim account, it results in several application or text push notifications sent to the victim in the hopes that the victim will eventually confirm the requests. 

Few months ago, the Falco maintainers created [a plugin to monitor audit logs from Okta]({{< ref "/blog/falco-okta-plugin" >}}), as an SSO using the MFA pattern, it might also be targeted by this kind of attack. It could be nice to count the number of failed attempts in the last minutes and trigger a rule if a threshold is reached. Luckily, Okta returns 2 kind of events we can use (see their [event types](https://developer.okta.com/docs/reference/api/event-types/)):

* `user.authentication.auth_via_mfa`: Authentication of user via MFA, with the result (SUCCESS or FAILURE) and the reason if it fails
* `user.mfa.okta_verify.deny_push`: User rejected Okta push verify

By keeping, by event type and user, the last timestamps where the related events occurred we can easily count the occurrences since 1min, 5min, 10min, ...
We end with key=value items like this: `<event_type>:<user_id>=t1,t2,t3`.

# Chosen cache

This is a proposal, feel free to use the system you want or even code it yourself, but for the needs of this upgrade of the [Okta plugin](https://github.com/falcosecurity/plugins/tree/master/plugins/okta) we wanted:
* a maintained and commonly used go module
* everything is stored in memory, no tierce database
* a TTL mechanism for the keys, to avoid to have an endless growth of the memory footprint

We found [gcache](https://github.com/bluele/gcache), a basic but easy to use in-memory cache which accepts any go type/struct and allows to set an expiration to the keys.

# Implementation

## Requirement

To understand the following, please read before [the first blog post of this series]({{< ref "/blog/extend-falco-inputs-with-a-plugin-the-basics" >}}) and the blog post post related to the [Okta plugin]({{< ref "/blog/falco-okta-plugin" >}}).

## New fields

The first step is to declare the new fields we'll have in our events. To allow the users to set the time windows they want in their rules, we'll create new fields with the format `map[uint64]uint64`. The key will be the time window in seconds (eg: 300 for the last 5min) and the value the number of events in the time window.

We add the fields in the `Fields()` method:

```go
	return []sdk.FieldEntry{
		...
		{Type: "uint64", Name: "okta.mfa.failure.countlast", Desc: "Count of MFA failures in last seconds", Arg: sdk.FieldEntryArg{IsRequired: true, IsIndex: true}},
		{Type: "uint64", Name: "okta.mfa.deny.countlast", Desc: "Count of MFA denies in last seconds", Arg: sdk.FieldEntryArg{IsRequired: true, IsIndex: true}},
	}
```
The details about the `Arg` field can be found in the official [documentation](https://falco.org/docs/plugins/plugin-api-reference/#field-extraction-capability-api).

These fields will allow to use conditions like `okta.mfa.failure.countlast[60] >= 3`, which means, 3 or more failed MFA requests in last 60 seconds.

## Settings and Init of the cache

First, we need to extend the structure of our plugin for the new settings for the cache and the cache itself:
```go
// Plugin represents our plugin
type Plugin struct {
	plugins.BasePlugin
	APIToken         string `json:"api_token" jsonschema:"title=API token,description=API Token,required"`
	Organization     string `json:"organization" jsonschema:"title=Organization,description=Your Okta organization,required"`
	CacheExpiration  uint64 `json:"cache_expiration" jsonschema:"title=Cache Expiration,description=TTL in seconds for keys in cache for MFA events (default: 600)"`
	CacheUserMaxSize uint64 `json:"cache_usermaxsize" jsonschema:"title=Cache User Max Size,description=Max size by user for the cache (default: 200)"`
	lastLogEvent     LogEvent
	lastEventNum     uint64
	cache            gcache.Cache
}
```
* `CacheExpiration` is use to set the TTL of keys
* `CacheUserMaxSize` is to avoid to store too much events for same user (it's not supposed to happen if the TTL is well configured, it's for security purpose)
* `cache` is the cache itself, it allows to call it in any method

The `falco.yaml` can now be updated to use the new settings, for examples:
```yaml
plugins:
  - name: okta
    library_path: /usr/local/share/falco/plugins/libokta.so
    init_config:
      organization: <my_org>
      cache_timeout: 42300 #12h
	  cache_usermaxsize: 100
	  api_token: <token>
```

The `Init()` methods is also updated to set the default values and create the cache:
```go
// Init is called by the Falco plugin framework as first entry,
// we use it for setting default configuration values and mapping
// values from `init_config` (json format for this plugin)
func (oktaPlugin *Plugin) Init(config string) error {
	oktaPlugin.CacheExpiration = 84600 // default
	oktaPlugin.CacheUserMaxSize = 200 // default
	err := json.Unmarshal([]byte(config), &oktaPlugin)
	if err != nil {
		return err
	}

	oktaPlugin.cache = gcache.New(10000).LFU().Build() // Creation of the cache

	return nil
}
```

In our example, we choosed to set a max size for the whole cache to 10000 keys, it's hardcoded for simplicity but you could allow the user to set it in the `init_config` too.

## Set in cache

We already explained in [the basics]({{< ref "/blog/extend-falco-inputs-with-a-plugin-the-basics" >}}) blog post how the extraction works and how to avoid to unmarshall several times the same event, we'll use the exact same condition to increment the counters only once per event.
We get the existing value from the cache and add it the new timestamp, by removing the oldest one if the size exceeds the value of `CacheUserMaxSize`. Once the list of timestamps updated, we can refresh the cache and reset the TTL of the key.

The `Extract()` methods will now have:
```go
// Extract allows Falco plugin framework to get values for all available fields
func (oktaPlugin *Plugin) Extract(req sdk.ExtractRequest, evt sdk.EventReader) error {
	data := oktaPlugin.lastLogEvent
	// the counters are incremented only once by event
	if evt.EventNum() != oktaPlugin.lastEventNum {
		...

		// we only consider these event types
		if data.EventType == "user.mfa.okta_verify.deny_push" || (data.EventType == "user.authentication.auth_via_mfa" && data.Outcome.Result == "FAILURE") {
			key := data.EventType + ":" + data.Actor.ID // the key <event_type>:<user_id>
			valueList := []uint64{} // Falco events uses Unix Timestamps, the format is uint64
			value, err := oktaPlugin.cache.Get(key) // we get the value already set in cache for the key
			if err == nil {
				if value != nil {
					valueList = value.([]uint64) // the cache stores the values as interface{} we need to assert them
				}
			}
			valueList = append(valueList, evt.Timestamp()) // we add the new timestamp
			if uint64(len(valueList)) > oktaPlugin.CacheUserMaxSize { // if the number of timestamps in the value is too high, we remove the oldest
				valueList = valueList[1:]
			}
			err = oktaPlugin.cache.SetWithExpire(key, valueList, time.Duration(oktaPlugin.CacheExpiration)*time.Second) // update in cache the new value with an Expiration for the key
			if err != nil {
				return err
			}
		}
	}
```

The timestamps for Falco events are uint64 because it uses Unix timestamp format, it pretty convenient to compare them and avoid complicated date managements. The cache stores the values as interface{}, we need to assert them into uint64 before using them.

## Get from cache

The last step is to update the event Falco will receive with new new fields we created and are not originally from Okta, it also happens in `Extract()` method:

```go
	switch req.Field() {
	...
	case "okta.mfa.failure.countlast", "okta.mfa.deny.countlast":
		if data.EventType == "user.mfa.okta_verify.deny_push" || (data.EventType == "user.authentication.auth_via_mfa" && data.Outcome.Result == "FAILURE") { // we don't need to set the new fields for other event types
			key := data.EventType + ":" + data.Actor.ID // the key <event_type>:<user_id>
			shift := req.ArgIndex() // it corresponds to the value from the rule
			getvalue, err := oktaPlugin.cache.Get(key) // get the value from the cache
			if err == nil {
				if getvalue != nil {
					var count uint64
					values := getvalue.([]uint64) // the cache stores the values as interface{} we need to assert them
					oldest := evt.Timestamp() - uint64(shift*1e9) // calculate the oldest timestamp we can have
					for _, i := range values {
						if i > uint64(oldest) { // compare each timestamp in the value from the cache
							count++
						}
					}
					req.SetValue(count) // set the field in the event
				}
			}
		}
	}
```

The logic is easy to understand, we get the value from the cache and count each timestamp after a certain date. This date depends of the rule, in our example above, we used `okta.mfa.failure.countlast[60]`, it means, we'll consider the last 60 seconds. This process is automatically repeated for each rule.

## Rules

With these new fields, we can create new conditions, here's the rule which have been added to the plugin since we integrated the changes:

```yaml
- rule: Too many failed MFA in last 5min
  desc: An user failed MFA too many times in the last 5min
  condition: okta.mfa.failure.countlast[300]>=3
  output: "A user has failed MFA too many times in last 5min (user='%okta.actor.name' last_reason='%okta.reason' countLast300=%okta.mfa.failure.countlast[300])"
  priority: WARNING
  source: okta
  tags: [okta]

- rule: Too many denied MFA Pushes in last 5min
  desc: A user denied too many MFA Pushes in the last 5min
  condition: okta.mfa.deny.countlast[300]>=2
  output: "A user has denied too many MFA pushes in last 5min (user='%okta.actor.name' reason='%okta.reason' countLast300=%okta.mfa.deny.countlast[300])"
  priority: WARNING
  source: okta
  tags: [okta]
```

In our tests, we have been able to get these logs (obfuscated):

```shell
13:56:59.678000000: Warning A user has denied too many MFA pushes in last 5min (user='John Doe' reason='User rejected Okta push verify' countLast300=2)
13:57:28.012000000: Warning A user has failed MFA too many times in last 5min (user='John Doe' last_reason='User rejected Okta push verify' countLast300=3)
```

# Conclusion

The new flavor for the Okta plugin can be downloaded [here](https://download.falco.org/?prefix=plugins/stable/). We hope it shows once again how powerful and extensible the new plugin framework is. With a memory, we could imagine more complex features, like correlation between events without using an SIEM or writing complex queries to your log aggregator.

---

You can find us in the [Falco community](https://github.com/falcosecurity/community). Please feel free to reach out to us for any questions, suggestions, or even for a friendly chat!

If you would like to find out more about Falco:

* Get started in [Falco.org](http://falco.org/)
* [Plugin Documentation](https://falco.org/docs/plugins/)
* [Plugin Developer Guide](https://falco.org/docs/plugins/developers-guide/)
* [Plugin registry](https://github.com/falcosecurity/plugins) 
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco)
* Get involved in the [Falco community](https://falco.org/community/)
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/messages/falco)
* Follow [@falco_org on Twitter](https://twitter.com/falco_org)