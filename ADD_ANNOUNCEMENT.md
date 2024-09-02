# How to add announcement
Please follow these steps to add announcement 
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Add new announcemnt to [data/en/announcements](https://github.com/falcosecurity/falco-website/tree/main/data/en/announcements) in a following format:
```
index: 2
startDate: '2023-04-01T00:00:00-0700'
endDate: '2023-04-23T00:00:00-0700'
content: '<a href="https://upandrunning.eventbrite.com" target="_blank">Meet the Falco community at KubeCon EU!</a>'
```
where:
- `startDate` is a date when you want the event to start showing in a specific timezone. Optional
- `endDate` is a date when you want the event to stop showing in a specific timezone. Optional
- `index` is еру order of the events. **IMPORTANT - index must be specified and must be greater than the largest existing event index**
- `content` text or html of the event
3. Create pull request to the Falco repository with your changes