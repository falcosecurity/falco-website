---
title: Alerts
id: alerts
date: 2023-07-17
full_link: /docs/alerts/
short_description: >
  Downstream actions executed after a rule triggered.
aka:
tags:
- fundamental
---
Downstream actions executed after a rule triggered.

<!--more--> 

They can be as simple as logging to `stdout` or as complex as delivering a {{< glossary_tooltip text="gRPC" term_id="grpc" >}} call to a client.

Falco supports sending alerts to:

- Standard Output
- A file
- Syslog
- A spawned program
- A HTTP[s] end point
- A client through the {{< glossary_tooltip text="gRPC" term_id="grpc" >}} API