---
title: Forwarding Alerts to third parties
description: Forward Falco Alerts to third parties
linktitle: Forwarding Alerts to third parties
weight: 30
---

Falco alerts can easily be forwarded to third-party systems. Their JSON format allows them to be easily consumed for storage, analysis and reaction. 

## Falcosidekick

Falcosidekick is a proxy forwarder, it acts as central point for any fleet of Falco instances using their http outputs to send their alerts.

The current available outputs are chat, alert, log, storage, streaming systems, etc. The exhaustive list can be found [here](https://github.com/falcosecurity/falcosidekick/tree/master#outputs).

![Falcosidekick](/docs/images/falcosidekick_forwarding.png)

Falcosidekick can also add custom fields to the alerts, filter by priority and it exposes a prometheus endpoint for metrics.

The full documentation and the repository of the project are [here](https://github.com/falcosecurity/falcosidekick).

Falcosidekick can be deployed with Falco in Kubernetes clusters with the official Falco [Helm chart](https://github.com/falcosecurity/charts).

Its configuration can be made through a yaml file and/or env vars.

### Installation in Kubernetes with Helm

See the available [Helm values](https://github.com/falcosecurity/charts/blob/master/falcosidekick/values.yaml) to configure Falcosidekick. 

```shell
helm install falco falcosecurity/falco \
-n falco --create-namespace \
--set falcosidekick.enabled=true \
--set tty=true 
```

### Installation in Docker

Use the env vars to configure Falcosidekick.

```shell
docker run -d -p 2801:2801 -e SLACK_WEBHOOKURL=XXXX falcosecurity/falcosidekick:2.27.0
```

### Installation on the host

Adapt the version and the architecture to your environment, you can find all the releases [here](https://github.com/falcosecurity/falcosidekick/releases).

```shell
sudo mkdir -p /etc/falcosidekick
wget https://github.com/falcosecurity/falcosidekick/releases/download/2.27.0/falcosidekick_2.27.0_linux_amd64.tar.gz && sudo tar -C /usr/local/bin/ -xzf falcosidekick_2.27.0_linux_amd64.tar.gz
```

See the example config file to create your own in `/etc/falcosidekick/config.yaml`.

To enable and start the service, you can use a systemd unit `/etc/systemd/system/falcosidekick.service` like this one:
```shell
[Unit]
Description=Falcosidekick
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=/usr/local/bin/falcosidekick -c /etc/falcosidekick/config.yaml
EOF
```

```shell
systemctl enable falcosidekick
systemctl start falcosidekick
```

## Falcosidekick UI

Falcosidekick comes with its own interface to visualize the events and get statistics.

![Falcosidekick UI](/docs/images/falcosidekick_forwarding_ui_1.png)

### Installation in Kubernetes with Helm

The installation is made at same moment than Falcosidekick by adding the argument `--set falcosidekick.webui.enabled=true`

```shell
helm install falco falcosecurity/falco \
-n falco --create-namespace \
--set falcosidekick.enabled=true \
--set falcosidekick.webui.enabled=true \
--set tty=true 
```

Then creates a port-forward to access to it: `kubectl port-forward svc falco-falcosidekick-ui 2802:2802 -n falco`. The default credentials are `admin/admin`.

The full documentation and the repository of the project are [here](https://github.com/falcosecurity/falcosidekick-ui).
