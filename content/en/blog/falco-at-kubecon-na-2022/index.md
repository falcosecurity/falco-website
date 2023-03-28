---
title: Falco at the KubeCon NA 2022
slug: falco-kubecon-2022
date: 2022-11-08
author: Vicente J. Jimenez Miras
images:
  - /blog/falco-kubecon-2022/images/falco-at-kubecon-na-2022-featured.png
tags: ["Community","Live Event","Kubernetes"]
---

It was KubeCon recently. I doubt anyone reading this didn't know about it. And if you attended, you're probably still receiving e-mails about the event.

KubeCon is where everyone wants to be. And Falco was there too. It did indeed have a great presence: A project meeting, mentions, a few presentations, a keynote, it even had a party!


Once there, it was Falco time!

## Project Meeting

<!-- Tuesday, Oct 25 | 13:00 - 17:00 -->

A project meeting is where maintainers of the project, users, adopters and contributors have the opportunity to exchange impressions. On Tuesday afternoon, Falco maintainers met with interested users and potential adopters, and presented, not only the background of the project, but also its future roadmap.

There were questions from the attendees, requests and announcements of upcoming features, and even live demos. From the new plugins framework till the recent gVisor support, including a deep explanation of Falco libraries' insights. If you didn't know how Falco worked internally, you could leave the room being an expert.

![Falco Project Meeting at KubeCon NA 2022](/blog/falco-kubecon-2022/images/falco-at-kubecon-na-2022-01.png)

## Presentations

Falco is a well known project. It was mentioned in at least five presentations. Some of these, delivered by the core maintainers. Others, by the community or the CNCF organization itself. Its presence in so many occasions reflected the project's reputation in the community.

### Keynote

Tuesday morning. Still tired from the jet-lag, and after the first day of Cloud Native SecurityCon, our first public Falco moment of the day: A Keynote at the SecurityCon delivered by **Loris Degioanni**, original creator of Falco.

Loris introduced the new [GitHub Plugin for Falco](/blog/falco-plugin-github/), which is capable of detecting events like using GitHub actions for cryptominers, pushing code with secrets, or even detecting when someone starred the repository.

The time dedicated to a keynote is usually short, but for Loris it seemed to be enough to perform a couple of live demos. Don't miss them in this video.

{{< youtube-80 id="o3Mz3ha3gMM" title="Detecting Threats in GitHub with Falco - Loris Degioanni">}}
[Detecting Threats in GitHub with Falco - Loris Degioanni](https://www.youtube.com/watch?v=o3Mz3ha3gMM)


### The Eye of Falco

That same day, a few hours later, **Stefano Chierici**, *Senior Security Researcher*, and **Lorenzo Susini**, *Open Source Engineer*, both contributors of Falco, presented one of the most exciting of its features: Detection of attempts to escape Linux capabilities.

During this presentation, Lorenzo did an extensive walkthough on Linux capabilities, explaining the security situation before having them, detailing on its different sets (effective, permitted and inheritable) and its security implications when creating new processes that require higher privileges.

Stefano, on the other side, walked us through different scenarios showing a variety of real attacks. Therefore, having the CAP_SYS_MODULE capability enabled in the container would allow an attacker to use a Kernel Module to attack; having the CAP_SYS_PTRACE capability active would allow the injection of malicious code into memory; and having the CAP_SYS_ADMIN capability might open more than one path to make our host exploitable.

Trying not to spoil the end of the presentation (you can already imagine it though), we recommend to watch the following video to see how Falco faces this kind of threats, as it does with many others, by obtaining the state of the container and warning the user if the capabilities exceed the desirable ones.

<!-- (Oct 25, 2022 | 15:40 - 16:10) -->
{{< youtube-80 id="j3PcSGlJcZI" title="The Eye of Falco: You Can Escape but Not Hide - Stefano Chierici & Lorenzo Susini" >}}
[The Eye of Falco: You Can Escape but Not Hide - Stefano Chierici & Lorenzo Susini](https://www.youtube.com/watch?v=j3PcSGlJcZI)


### Detecting the Undetectable

Falso also squeezed into a presentation from **Carol Valencia**, *Cloud Native Security Advocate at Aqua Security*, where she demonstrated how three different runtime security solutions, Falco among them, were able to detect fileless attacks.


{{< youtube-80 id="dizRKAjuhS0" title="Fileless Attack - Detecting the Undetectable" >}}
[Fileless Attack - Detecting the Undetectable](https://www.youtube.com/watch?v=dizRKAjuhS0)


### Falco Project Updates

For those that were not able to attend the Project Meetings at the SecurityCon, KubeCon was a second great opportunity to learn from their favority CNCF projects.

On Friday afternoon, **Jason Dellaluce** and **Luca Guerra**, both *Open Source Engineers*, as well as Falco maintainers, gave an overview of the Falco project and its recent updates.

{{< youtube-80 id="pDwmWFa9oAQ" title="Security In the Cloud With Falco: Overview And Project Updates - Jason Dellaluce & Luca Guerra">}}
[Security In the Cloud With Falco: Overview And Project Updates - Jason Dellaluce & Luca Guerra](https://www.youtube.com/watch?v=pDwmWFa9oAQ)

![Falco Updates at KubeCon NA 2022](/blog/falco-kubecon-2022/images/falco-at-kubecon-na-2022-03.png)

## Falco Kiosk at the CNCF Pavillion

This year at the KubeCon, Falco maintainers spent a good amount of time at the Falco kiosk. They received visitors interested in the project, some, already users of Falco, others, new users looking to learn about it, even a couple of youtubers asking to interview the maintainers for their channels.

All in all, an awesome chance to discover, first hand, what people really thought of Falco, wonders and pain points, good and not so good experiences with the tool and its ecosystem. In other words, real and valuable feedback.


## Book signing

We haven't mentioned it yet, but Falco even had a book at the KubeCon. Shortly before the event, O'Reilly published [Practical Cloud Native Security with Falco](https://www.oreilly.com/library/view/practical-cloud-native/9781098118563/), written by **Loris Degionni** and **Leonardo Grasso**, both Falco maintainers with a large experience in the project.

Wednesday and Thursday, Loris and Leo spent some time signing copies of their book to users and developers interested in learning the secrets of Falco. Receiving a book at the KubeCon is probably not such a highligh anymore. Receiving Falco users willing to queue to receive your book is still a rewarding experience though.


## Party

<!-- October 25th, 19:00-22:00 -->

KubeCon is not only about collecting swag and attending presentations, although these are a great source of knowledge (and the swag a lot of stolen space in your luggage). KubeCon is also about interacting with other attendees, having exciting conversations, sharing experiences and point of views.

So Falco thought of using an evening to do exactly that!

People at the event (let's call it a party!). So people at the party enjoyed some food, drinks, had meaningful conversations -at least, that's what we want to believe-, and played [Cards against Containers](https://cardsagainst.io/) -the paper version, not the online one.

Since the party took place on Tuesday, it meant a nice break between two days full of Security-related presentations, and the KubeCon starting the next day. We didn't stay long, but we had some joy.

![Falco Party at KubeCon NA 2022](/blog/falco-kubecon-2022/images/falco-at-kubecon-na-2022-04.png)

## Conclusion

As you can see, it was a week full of emotions, opportunities, friends and colleagues, and Falco. We are already looking forward to the next event, and we hope you too.

And if you didn't get your copy of the book, maybe there'll be another chance next year in [Seattle](https://events.linuxfoundation.org/cloudnativesecuritycon-north-america/) or [Amsterdam](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/) ;-)

