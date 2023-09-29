---
title: Forwarding Alerts
description: Forward Falco Alerts to third parties with Falcosidekick
linktitle: Forwarding Alerts
weight: 30
aliases: [/docs/alerts/forwarding/]
---

Falco alerts can easily be forwarded to third-party systems. Their JSON format allows them to be easily consumed for storage, analysis and reaction. 

## Falcosidekick

Falcosidekick is a proxy forwarder, it acts as central point for any fleet of Falco instances using their http outputs to send their alerts.

The current available outputs are chat, alert, log, storage, streaming systems, etc.

![Falcosidekick](/docs/images/falcosidekick_forwarding.png)

Falcosidekick can also add custom fields to the alerts, filter them by priority and expose a Prometheus metrics endpoint.

The full documentation and the project repository are [here](https://github.com/falcosecurity/falcosidekick).

Falcosidekick can be deployed with Falco in Kubernetes clusters with the official Falco [Helm chart](https://github.com/falcosecurity/charts).

Its configuration can be made through a yaml file and/or env vars.

### Outputs

{{% alert color="primary" %}}
Follow the links to know what are the settings of each output.
{{% /alert %}}

The available outputs in Falcosidekick are:

*Chat*

- [**Slack**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/slack.md)
- [**Rocketchat**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/rocketchat.md)
- [**Mattermost**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/mattermost.md)
- [**Teams**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/teams.md)
- [**Discord**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/discord.md)
- [**Google Chat**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/googlechat.md)
- [**Zoho Cliq**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/cliq.md)
- [**Telegram**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/telegram.md)

*Metrics / Observability*

- [**Datadog**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/datadog.md)
- [**Influxdb**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/influxdb.md)
- [**StatsD**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/statsd.md) (for monitoring of `falcosidekick`)
- [**DogStatsD**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/dogstatsd.md) (for monitoring of `falcosidekick`)
- [**Prometheus**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/prometheus.md) (for both events and monitoring of `falcosidekick`)
- [**Wavefront**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/wavefront.md)
- [**Spyderbat**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/spyderbat.md)
- [**TimescaleDB**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/timescaledb.md)
- [**Dynatrace**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/dynatrace.md)

*Alerting*

- [**AlertManager**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/alertmanager.md)
- [**Opsgenie**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/opsgenie.md)
- [**PagerDuty**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/pagerduty.md)
- [**Grafana OnCall**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/grafana_oncall.md)

*Logs*

- [**Elasticsearch**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/elasticsearch.md)
- [**Loki**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/loki.md)
- [**AWS CloudWatchLogs**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/aws_cloudwatch_logs.md)
- [**Grafana**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/grafana.md)
- [**Syslog**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/syslog.md)
- [**Zincsearch**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs//zincsearch.md)
- [**OpenObserve**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/openobserve.md)

*Object Storage*

- [**AWS S3**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/aws_s3.md)
- [**GCP Storage**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/gcp_storage.md)
- [**Yandex S3 Storage**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/yandex_s3.md)

*FaaS / Serverless*

- [**AWS Lambda**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/aws_lambda.md)
- [**GCP Cloud Run**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/gcp_cloud_run.md)
- [**GCP Cloud Functions**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/gcp_cloud_functions.md)
- [**Fission**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/fission.md)
- [**KNative (CloudEvents)**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/cloudevents.md)
- [**Kubeless**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/kubeless.md)
- [**OpenFaaS**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/openfaas.md)
- [**Tekton**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/tekton.md)

*Message queue / Streaming*

- [**NATS**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/nats.md)
- [**STAN (NATS Streaming)**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/stan.md)
- [**AWS SQS**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/aws_sqs.md)
- [**AWS SNS**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/aws_sns.md)
- [**AWS Kinesis**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/aws_kinesis.md)
- [**GCP PubSub**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/gcp_pub_sub.md)
- [**Apache Kafka**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/kafka.md)
- [**Kafka Rest Proxy**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/kafkarest.md)
- [**RabbitMQ**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/rabbitmq.md)
- [**Azure Event Hubs**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/azure_event_hub.md)
- [**Yandex Data Streams**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/yandex_datastreams.md)
- [**MQTT**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/mqtt.md)
- [**Gotify**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/gotify.md)

*Email*

- [**SMTP**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/smtp.md)

*Database*

- [**Redis**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/redis.md)

*Web*

- [**Webhook**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/webhook.md)
- [**Node-RED**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/nodered.md)
- [**WebUI**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/falcosidekick-ui.md)

*SIEM*

- [**AWS Security Lake**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/aws_security_lake.md)

*Workflow*

- [**n8n**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/n8n.md)

*Other*

- [**Policy Report**](https://github.com/falcosecurity/falcosidekick/blob/master/docs/outputs/policy-reporter.md)

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

Adapt the version and the architecture to your environment. You can find all the releases [here](https://github.com/falcosecurity/falcosidekick/releases).

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

You can install the UI at the same moment as Falcosidekick by adding the argument `--set falcosidekick.webui.enabled=true`.

```shell
helm install falco falcosecurity/falco \
-n falco --create-namespace \
--set falcosidekick.enabled=true \
--set falcosidekick.webui.enabled=true \
--set tty=true 
```

Then create a port-forward to access it: `kubectl port-forward svc falco-falcosidekick-ui 2802:2802 -n falco`. The default credentials are `admin/admin`.

The full documentation and the repository of the project are [here](https://github.com/falcosecurity/falcosidekick-ui).
