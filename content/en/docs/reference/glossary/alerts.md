---
title: Alerts
id: alerts
date: 2023-07-17
full_link: /docs/outputs/
short_description: >
  Downstream actions executed after a rule is triggered.
aka:
tags:
- fundamental
---
Downstream actions executed after a rule is triggered.

<!--more--> 

They can be as simple as logging to `stdout` or as complex as delivering an HTTP request to an endpoint.

Falco supports sending alerts to:

- Standard Output
- A file
- Syslog
- A spawned program
- An HTTP[s] endpoint
- A client through the {{< glossary_tooltip text="gRPC" term_id="grpc" >}} API (deprecated)
