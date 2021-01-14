---
title: Falcosidekick 2020
date: 2021-01-12
author: Thomas Labarussias
---

This fantastic post from [@leodido](https://github.com/leodido) about how has been the previous year 2020 for falco inspired me ([link](https://falco.org/blog/falco-2020/))  I wanted to bring everyone up to speed on what we built for `falcosidekick` in 2020

Aside a lot of improvments and bug fixes, 8 new outputs have been integrated:
* **Rocketchat**
* **Mattermost**
* **Azure Event Hub**
* **Discord**
* **AWS SNS**
* **GCP PubSub**
* **Cloudwatch Logs**
* **Apache Kafka**

What really changed with previous releases was that almost all these outputs have been proposed and developed by other members of the `falco` community (kindly called the *famiglia* 😉). It warms my ♥️ a lot and makes me learn a lot about how to manage an open source project.

Thanks to everybody for your ideas, your comments, your help, your PR, your reviews, etc.

The following chart shows well how things are getting bigger and bigger for this small project that finally appeared useful for some people and companies.

![falcosidekick github activity 2020](/img/falcosidekick-github-activity-2020.png)

A special 🙏 to [@cpanato](https://github.com/cpanato), [@KeisukeYamashita](https://github.com/KeisukeYamashita) and [@nibalizer](https://github.com/nibalizer), who are now official maintainers of `falcosidekick` with me. 🎉 to them! 

Last but not least, all my friendship to [@danpopSD](https://github.com/cpanato) for his support and motivation. Merci mon ami.

#### What's next?

##### Release 2.20.0

Few times before this article is out we released one of the biggest versions since the beginning of `falcosidekick`. It results of a combination of a lot of efforts from many people.

The full changelog can be found [here](https://github.com/falcosecurity/falcosidekick/releases/tag/2.20.0).

The main changes are three new outputs:

- [**STAN (NATS Streaming)**](https://docs.nats.io/nats-streaming-concepts/intro)
- [**PagerDuty**](https://pagerduty.com/)
- [**Kubeless**](https://kubeless.io/) *(stay tuned, a post about this will be out soon 😉)*

##### And ?

We believe the duo of  `falco + falcosidekick` to be an obvious solution for most infrastructures, we are working hard to improve the code base and documentation. That will be all the major set of goals for the next major release `3.0.0` which is coming in the next few months. Until then with the help of [n3wscott](https://github.com/n3wscott), we're working on adding the [`Cloudevents`](https://cloudevents.io/) spec in a new HTTP output that will able to forward `falco`'s events to more backends, like [`Knative`](https://knative.dev/).

*Enjoy*