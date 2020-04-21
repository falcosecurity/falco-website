---
title: Running 
description: Operating and Managing Falco
weight: 4
---


After Falco is [installed](../installation) there are a few commonly used features for users to be aware of. 

### Hot Reload

This will reload the Falco configuration and restart the engine without killing the pid. This is useful to propagate new config changes without killing the daemon.

```bash
kill -1 $(cat /var/run/falco.pid)
```

### Logs

Falco logs to `syslog` by default. 

You can view the Falco logs using `journalctl`

```bash 
journalctl -fu falco
```

