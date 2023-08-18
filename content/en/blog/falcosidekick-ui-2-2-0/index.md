---
title: Falcosidekick-UI 2.2.0
linktitle: Falcosidekick-UI 2.2.0
date: 2023-09-14
author: Thomas Labarussias
slug: falcosidekick-ui-2-2-0
images:
  - /blog/falcosidekick-ui-2-2-0/images/featured.png
tags: ["Falcosidekick-UI","Release"]
---

Not so long ago, we proudly released a new fantastic release of [falcosidekick](/blog/falcosidekick-2-28-0/), it's time for its little brother, [falcosidekick-ui](https://github.com/falcosecurity/falcosidekick-ui) to know the same, with the version v2.2.0.

Let's take a tour to introduce the most important cool new features of this release.

## Disabling the authentication

The previous version introduced a basic auth mechanism to protect access to the dashboard and API. Some complained it broke the access through their reverse proxy. You can now disable the authentication:

```shell
-d boolean
      Disable authentication (environment "FALCOSIDEKICK_UI_DISABLEAUTH")
```

## Dialog box to display the details of an event

To have a better view of each event, you can now open a dialog box that displays all details but also the raw JSON of the event. You can even copy it into your clipboard with a simple click.

![dialog-box](/blog/falcosidekick-ui-2-2-0/images/dialog-box.png)

To display the dialog box, just click on the `{...}` at the end of the event row.

![dialog-box-button](/blog/falcosidekick-ui-2-2-0/images/dialog-box-button.png)

## Export

A new `Export` button appeared, it allows you to export all the events found in json format. It takes in consideration the filters, of course.

![export](/blog/falcosidekick-ui-2-2-0/images/export.png)

![json](/blog/falcosidekick-ui-2-2-0/images/json.png)

## Units for TTL

For users with a lot of events, it can be useful to specify a TTL (time to live) for the keys in Redis (the storage backend). It can be done with `-t` argument for a while, and the value had to be in seconds, which is not convenient for long-term storage. You can now specify a unit (`s`econds, `m`inutes, `h`ours, `W`eeks, `M`onths, `y`ear). If no unit is specified, it's considered as seconds to avoid breaking previous configs.

```shell
-t string
      TTL for keys, the format is X<unit>,
      with unit (s, m, h, d, W, M, y)" (default "0", environment "FALCOSIDEKICK_UI_TTL")
```
## Redis password

The access to the dashboard and the API can be protected by credentials, but the Redis wasn't. You can now specify a password for access to Redis, it will prevent your security scans from complaining ;-).

```shell
-w string  
      Redis password (default "", environment "FALCOSIDEKICK_REDIS_PASSWORD")
```

## Conclusion

Thanks again to our amazing community, most of these features came from your ideas and we're still thrilled to see how much you find falcosidekick-ui useful.

---
As usual, if you have any feedback or need help, you can find us at any of the following locations.

* Get started in [Falco.org](http://falco.org/)
* Check out the [Falcosidekick project on GitHub](https://github.com/falcosecurity/falcosidekick).
* Check out the [Falcosidekick UI project on GitHub](https://github.com/falcosecurity/falcosidekick-ui).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).
