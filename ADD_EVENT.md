# How to add new event
Please follow these steps to add your event to [Falco event page](https://falco.org/community/events/):
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Add a new event to [data/en/events](https://github.com/falcosecurity/falco-website/blob/master/data/en/events.yaml) in a following format:

```
- title: KubeCon EU — Amsterdam, here we come!
  location: Amsterdam
  type: conference
  format: offline
  description: See Falco at the conference
  url: /community/events/
  start: 2023-04-18T10:00:00+0200
  end: 2023-04-21T23:30:00+0200
  timezone: Europe/Amsterdam
  timezoneName: CEST
  schedule:
    - start: 2023-04-18T10:00:00+0200
      time:
        - start: 2023-04-18T10:30:00+0200
          end: 2023-04-18T12:30:00+0200
          content: <a href="https://sched.co/1JWQy" target="_blank">Join the Falco project meeting</a>
    - start: 2023-04-18T16:30:00+0200
      time:
        - start: 2023-04-18T16:30:00+0200
          end: 2023-04-18T17:05:00+0200
          content: <a href="https://sched.co/1HyTj" target="_blank">No Fear, Falco is Looking After Us!</a><br>featuring Falco community from Apple, Chainguard, IBM and Sysdig
    - start: 2023-04-19T10:00:00+0200
      end: 2023-04-21T23:30:00+0200
      time:
        - content: "See us at the Falco kiosk #13 in the Project Pavillion"
```
where:
- `title` _(required)_ - title of the event
- `location` _(optional)_ - location of the event. Will be shown on the landing page if specified 
- `type` _(optional)_ - type of the event (webcast, workshop, livestreametc.). Will be shown in "webcasts, livestreams and workshops" section of the events section if specified
- `format` _(optional)_ - format of the event. If `format=online` the event will be shown in "webcasts, livestreams and workshops" section
- `description` _(optional)_ - description of the event
- `url` _(optional)_ - url to the event
- `start` _(required)_ - start date-time of the event. Must be specified in [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) (for example `2023-04-18T10:00:00+0200`)
- `end` _(required)_ - end date-time of the event. Must be specified in [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) (for example `2023-04-18T10:00:00+0200`)
- `timezone` _(optional)_ - timezone of the event. Must be specified in [IANA](https://timezonedb.com/time-zones) timezone format
- `timezoneName` _(optional)_ - [Timezone suffix](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). Must be specified if `timezone` is specified
- `schedule` _(required)_ - a schedule of the event. Must contain at least 1 item
- `schedule.start` _(required)_ - a start date of the event or a group of sub-events
- `schedule.end` _(required)_ - an end date of the event or a group of sub-events. If specifed, the event will be shown like `Apr 18-21 Apr, 2023` in a schedule
- `schedule.time` _(required)_ - an array of sub-events for each day of the event. Must contain at least 1 item
- `schedule.time.start` _(optional)_ - daily sub-event start time
- `schedule.time.end` _(optional)_ - daily sub-event end time. If start and end are not specified, the event will have `All day` schedule
- `schedule.time.content` _(required)_ - text or html with the description of a daily sub-event
