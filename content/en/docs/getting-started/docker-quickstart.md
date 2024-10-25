---
title: Try Falco with Docker
description: Try Falco locally using Docker
slug: falco-docker-quickstart
aliases:
- ../../try-falco-with-docker
weight: 10
---

## Install Falco

First, ensure you have a Linux machine with a recent version of Docker installed. Note that the following will not work on Windows or macOS running Docker Desktop.

Run the following command:

```sh
sudo docker run --rm -i -t --name falco --privileged  \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev -v /proc:/host/proc:ro -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro -v /usr:/host/usr:ro -v /etc:/host/etc:ro \
    falcosecurity/falco:{{< latest >}}
```

Falco is now monitoring your system using the [pre-installed set of rules](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml) that alert you upon suspicious behavior.

## Trigger a rule

Open another terminal on the same machine and run:

```sh
sudo cat /etc/shadow
```

Now go back to Falco, and you'll see a message like:

```
2024-06-21T08:54:23.812791015+0000: Warning Sensitive file opened for reading by non-trusted program (file=/etc/shadow gparent=sudo ggparent=bash gggparent=tmux: evt_type=openat user=root user_uid=0 user_loginuid=1000 process=cat proc_exepath=/usr/bin/cat parent=sudo command=cat /etc/shadow terminal=34826 container_id=host container_name=host)
```

This is your first Falco event 🦅! If you are curious, [this](https://github.com/falcosecurity/rules/blob/c0a9bf17d5451340ab8a497efae1b8a8bd95adcb/rules/falco_rules.yaml#L398) is the rule that describes it.

## Create a custom rule

Now it's time to create our own rule and load it into Falco. We can be pretty creative with them, but let's stick with something simple. This time, we want to be alerted when any file is opened for writing in the `/etc` directory, either on the host or inside containers.

Stop the Falco container with `Ctrl-C`, copy the following text in a file and call it `falco_custom_rules.yaml`:

```yaml
- rule: Write below etc
  desc: An attempt to write to /etc directory
  condition: >
    (evt.type in (open,openat,openat2) and evt.is_open_write=true and fd.typechar='f' and fd.num>=0)
    and fd.name startswith /etc
  output: "File below /etc opened for writing (file=%fd.name pcmdline=%proc.pcmdline gparent=%proc.aname[2] ggparent=%proc.aname[3] gggparent=%proc.aname[4] evt_type=%evt.type user=%user.name user_uid=%user.uid user_loginuid=%user.loginuid process=%proc.name proc_exepath=%proc.exepath parent=%proc.pname command=%proc.cmdline terminal=%proc.tty %container.info)"
  priority: WARNING
  tags: [filesystem, mitre_persistence]
```

Then start Falco again, this time mounting the new rule file:

```sh
sudo docker run --name falco --rm -i -t --privileged \
    -v $(pwd)/falco_custom_rules.yaml:/etc/falco/falco_rules.local.yaml \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev -v /proc:/host/proc:ro -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules:ro -v /usr:/host/usr:ro -v /etc:/host/etc:ro \
    falcosecurity/falco:{{< latest >}}
```

Finally, open another terminal and write a file in `/etc`:

```sh
sudo touch /etc/test_file_falco_rule
```

You should see an alert in the Falco terminal, just as before. As you can see, a lot of contextual information is displayed, as it was specified in the `output` field of the rule. There are many such fields that you can use both in the condition and the output to build your rule.
