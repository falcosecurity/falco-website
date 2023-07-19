---
title: Priorities
id: priorities
date: 2023-07-17
full_link: /docs/rules/basic-elements/#priority
short_description: >
  Every Falco rule has a priority which indicates how serious a violation of the rule is.
aka:
tags:
- fundamental
---
Every Falco {{< glossary_tooltip text="rule" term_id="rules" >}} has a priority which indicates how serious a violation of the {{< glossary_tooltip text="rule" term_id="rules" >}} is.

<!--more-->
This is similar to what we know as the severity of a syslog message. The priority is included in the message/JSON output/etc.