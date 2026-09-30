---
title: Your Detector Has a Drop Rate
date: 2026-08-10
author: Santhosh Kumar Somarapu
slug: your-detector-has-a-drop-rate
tags: ["Falco", "Reliability", "Observability"]
---

Falco tells you when something suspicious happens. The second question matters just as much: what
does it do when it cannot keep up?

The answer is in the default configuration, and it is more permissive than most operators expect.
Values below are from `falco.yaml` at Falco 0.44.1.

## The default tolerance is ten percent

```yaml
syscall_event_drops:
  # -- The percentage of dropped syscall events with respect to the number of events in the last
  # second that will trigger the actions. A value in the range [0, 1]. If you want to be alerted
  # on any drops, set the threshold to 0.
  threshold: .1
  actions:
    - log
    - alert
  # -- The rate at which log/alert messages are emitted is governed by a token bucket. The rate
  # corresponds to one message every `1/rate` seconds.
  rate: .03333
  max_burst: 1
```

Read that as an operational statement rather than a config block. Up to ten percent of syscall events
in one second can be dropped before Falco takes any action at all. Below that line, events are
lost and nothing is said.

The comment is explicit that this is a choice rather than a floor: set the threshold to zero if you
want to hear about any drops.

## The alert is rate limited too

When the threshold is exceeded, the message goes through a token bucket. A rate of `.03333` is one
message every thirty seconds, with `max_burst: 1`.

That is sensible design. A detector that spams its own alert channel during an event storm makes the
storm worse, and the incident where drops matter most is exactly the incident that generates them.

It does mean the signal is deliberately coarse. One message every thirty seconds tells you drops are
happening. It does not tell you how many there were, or whether the rate is climbing. For that
you need the metrics, not the alert.

## Silence reads as safety

Losing telemetry is annoying. Losing detection input is different in kind, because absence of an
alert reads as absence of a problem.

Every other part of a security stack fails where you can see it. A crashed agent pages someone. An
expired certificate breaks a connection. A dropped syscall event just produces silence,
indistinguishable from a quiet system, and it happens exactly when the machine is busiest, which is
often when something interesting is going on.

So the blind spot is not randomly distributed. It is correlated with load, and load correlates with
the events you most wanted to see.

## What to do about it

**Decide your threshold deliberately.** The default is a reasonable engineering compromise, not a
recommendation for your environment. If you are running Falco to satisfy a control that assumes
complete coverage, ten percent is not your number. Zero is available.

**Treat drops as a capacity signal, not just a Falco setting.** A sustained drop rate says the
producer is outrunning the consumer. The fix is usually upstream, tuning what you ask Falco to
evaluate or giving it more headroom, rather than raising the threshold until the message stops.

**Alert on the metrics, not the log line.** The rate-limited message is a notification, and Falco
says as much in its own configuration: if you depend on the detailed drop-counter payload, use
`metrics.output_rule` together with `metrics.kernel_event_counters_enabled`, which adds kernel-side
event and drop counters to the metrics output. There is a per-CPU variant too, useful because drops
are rarely spread evenly across CPUs. A drop rate you can graph is a drop rate you can put an
objective against.

**Write the number down.** If someone asks what percentage of syscall events your detection stack
observed last month, that should be answerable. On a default install it is not, because nothing below
the threshold was ever recorded as having happened.

## The general shape

Detectors are dependencies like any other, and they degrade under load like any other. The difference
is that most dependencies tell you when they are struggling by failing at something you asked for,
while a detector degrades by quietly having less to say.

Any system whose job is to notice things deserves the same question you would ask of a database or a
queue: what happens when it saturates, and how would I know? Falco answers the first part in its
default config. The second part is on you.
