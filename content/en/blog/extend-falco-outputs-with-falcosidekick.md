---
Title: Extend Falco outputs with falcosidekick
Date: 2020-06-22
Author: Thomas Labarussias
slug: extend-falco-outputs-with-falcosidekick
---
*(2021-04-13) edit: update to integrate `Falcosidekick-UI` use last versions of `Falco` helm chart which embeds `Falcosidekick` as dependency*

By default, Falco has 5 outputs for its events: **stdout**, **file**, **gRPC**, **shell** and **http**. As you can see in the following diagram:

![falco extendend architecture](/img/falco-extended-architecture.png)

Even if they're convenient, we can quickly be limited to integrating Falco with other components. Here comes [`Falcosidekick`](https://github.com/falcosecurity/falcosidekick), a little daemon that extends that number of possible outputs. 

The current list of available `Falcosidekick` outputs (version [`v2.22.0`](https://github.com/falcosecurity/falcosidekick/releases/tag/2.22.0)) is: 

- [**Slack**](https://slack.com)
- [**Rocketchat**](https://rocket.chat/)
- [**Mattermost**](https://mattermost.com/)
- [**Teams**](https://products.office.com/en-us/microsoft-teams/group-chat-software)
- [**Datadog**](https://www.datadoghq.com/)
- [**Discord**](https://www.discord.com/)
- [**AlertManager**](https://prometheus.io/docs/alerting/alertmanager/)
- [**Elasticsearch**](https://www.elastic.co/)
- [**Loki**](https://grafana.com/oss/loki)
- [**NATS**](https://nats.io/)
- [**STAN (NATS Streaming)**](https://docs.nats.io/nats-streaming-concepts/intro)
- [**Influxdb**](https://www.influxdata.com/products/influxdb-overview/)
- [**AWS Lambda**](https://aws.amazon.com/lambda/features/)
- [**AWS SQS**](https://aws.amazon.com/sqs/features/)
- [**AWS SNS**](https://aws.amazon.com/sns/features/)
- [**AWS CloudWatchLogs**](https://aws.amazon.com/cloudwatch/features/)
- [**AWS S3**](https://aws.amazon.com/s3/features/)
- **SMTP** (email)
- [**Opsgenie**](https://www.opsgenie.com/)
- [**StatsD**](https://github.com/statsd/statsd) (for monitoring of
  `falcosidekick`)
- [**DogStatsD**](https://docs.datadoghq.com/developers/dogstatsd/?tab=go) (for
  monitoring of `falcosidekick`)
- **Webhook**
- [**Azure Event Hubs**](https://azure.microsoft.com/en-in/services/event-hubs/)
- [**Prometheus**](https://prometheus.io/) (for both events and monitoring of
  `falcosidekick`)
- [**GCP PubSub**](https://cloud.google.com/pubsub)
- [**GCP Storage**](https://cloud.google.com/storage)
- [**Google Chat**](https://workspace.google.com/products/chat/)
- [**Apache Kafka**](https://kafka.apache.org/)
- [**PagerDuty**](https://pagerduty.com/)
- [**Kubeless**](https://kubeless.io/)
- [**OpenFaaS**](https://www.openfaas.com)
- [**WebUI**](https://github.com/falcosecurity/falcosidekick-ui) (a Web UI for displaying latest events in real time)

Beyond that, it provides metrics about the number of events and let you add `custom fields` in events, for example *environment*, *region*, etc

In this article, we'll see how to deploy together in a Kubernetes cluster [`Falco`](https://github.com/falcosecurity/falco), [`Falcosidekick`](https://github.com/falcosecurity/falcosidekick) and [`Falcosidekick-UI`](https://github.com/falcosecurity/falcosidekick-ui). 

We'll use `Helm` (*version 3*) for installing all components and for a better user experience, the official `Falco` [chart](https://github.com/falcosecurity/charts/tree/master/charts/falco) is able to install and set all configurations for us:

For this tutorial, we'll send the events in a **Slack** channel, so [get your webhook URL](https://api.slack.com/messaging/webhooks#create_a_webhook) first.

Run the following `Helm` 

```bash
kubectl create namespace falco
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm install falco falcosecurity/falco \
--set falcosidekick.enabled=true \
--set falcosidekick.webui.enabled=true \
--set falcosidekick.config.slack.webhookurl="https://hooks.slack.com/services/XXXX" \
-n falco 
```

- `--set falcosidekick.enabled=true` enables deployment of `Falcosidekick` aside `Falco` and configures `Falco` for sending its events to `Falcosidekick`
- `--set falcosidekick.webui.enabled=true` enables deployment of `Falcosidekick-UI` and configure `Falcosidekick` for using it as output
- `--set falcosidekick.config.slack.webhookurl="https://hooks.slack.com/services/XXXX"` enables `Slack` as output for `Falcosidekick`

All possible values can be seen in the according `Helm` charts, see the [repository](https://github.com/falcosecurity/charts)

After few seconds you should get:

```bash
kubectl -n falco get pods

NAME                                      READY   STATUS    RESTARTS   AGE
falco-falcosidekick-ui-7bdc54fb4c-h99b6   1/1     Running   0          26s
falco-falcosidekick-7779579477-pfspz      1/1     Running   0          26s
falco-falcosidekick-7779579477-bn8pv      1/1     Running   0          26s
falco-6ksbx                               1/1     Running   0          26s
falco-pxvbk                               1/1     Running   0          26s
falco-5cg5b                               1/1     Running   0          26s
```
```bash
kubectl -n falco get svc

NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
falco-falcosidekick      ClusterIP   10.43.212.119   <none>        2801/TCP   61s
falco-falcosidekick-ui   ClusterIP   10.43.35.87     <none>        2802/TCP   60s
```

You can test the deployment of `Falcosidekick` with a typical port forward:

```bash
kubectl -n falco port-forward svc/falco-falcosidekick 2801
```

```bash
curl -s http://localhost:2801/ping

pong
```

It's alive !

We can send a test event to **Slack** to test whether it works or not. `Falcosidekick` provides a useful endpoint for that:

```bash
curl -sI -XPOST http://localhost:2801/test

HTTP/1.1 200 OK
Date: Tue, 13 Apr 2021 20:42:32 GMT
Content-Length: 0
```

In logs you'll get:

```bash
kubectl -n falco logs deployment/falcosidekick

kubectl logs deployment/falco-falcosidekick -n falco
Found 2 pods, using pod/falco-falcosidekick-7779579477-pfspz
2021/04/13 20:40:11 [INFO]  : Enabled Outputs : [Slack WebUI]
2021/04/13 20:40:11 [INFO]  : Falco Sidekick is up and listening on :2801
2021/04/13 20:41:35 [INFO]  : WebUI - Post OK (200)
2021/04/13 20:41:35 [INFO]  : WebUI - Publish OK
2021/04/13 20:41:35 [INFO]  : Slack - Post OK (200)
2021/04/13 20:41:35 [INFO]  : Slack - Publish OK
```

We can notice the fist line of logs `[INFO]  : Enabled Outputs : [Slack WebUI]`, we do have 2 enabled outputs, `Slack` and `WebUI` ([`Falcosidekick-UI`](https://github.com/falcosecurity/falcosidekick-ui))

And in your **Slack** channel:

![falcosidekick slack test](/img/falcosidekick-slack-test.png)

*Tip: For **Slack** and some other ouputs, the message format can be customized, more informations in [README](https://github.com/falcosecurity/falcosidekick/blob/master/README.md)*

We'll now add some custom fields and test a more realistic event.

Upgrade your deployment:

```bash
helm upgrade falco falcosecurity/falco \
--set falcosidekick.enabled=true \
--set falcosidekick.webui.enabled=true \
--set falcosidekick.config.slack.webhookurl="https://hooks.slack.com/services/XXXX" \
--set falcosidekick.config.customfields="environment:production\,datacenter:paris"
-n falco 
```

Send a more advanced test event to `Falcosidekick` (still with the port forward aside):
```bash
curl "http://localhost:2801/" -d'{"output":"A more realistic test event","priority":"Error","rule":"Fake rule","time":"2021-04-13T20:58:00.746609046Z+2", "output_fields": {"evt.time":1618347519000000,"fd.name":"/bin/hack","proc.cmdline":"touch /bin/hack","user.name":"root"}}'
```
![falcosidekick slack test 2](/img/falcosidekick-slack-test2.png)

`Falco` community also provides a Web UI for following live events an get statistics about last. (*Tip: you can add filters by clicking on any label*)

By default, you can access to it through a port forward too:

```bash
kubectl port-forward svc/falco-falcosidekick-ui -n falco 2802
```

You now have access in your browser with the URL: [http://localhost:2802/ui](http://localhost:2802/ui)

![falcosidekick slack test 2](/img/falcosidekick-ui-1.png)

![falcosidekick slack test 2](/img/falcosidekick-ui-2.png)

## Get involved

If you would like to find out more about Falco:<br />

<ul>
<li>Get started in <a target="_blank" href="http://falco.org/">Falco.org</a>.</li>
<li>Check out the <a target="_blank" href="https://github.com/falcosecurity/falco">Falco project on GitHub</a>.</li>
<li>Get involved <a target="_blank" href="https://falco.org/community/">Falco community</a>.</li>
<li>Meet the maintainers on the <a target="_blank" href="https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32">Falco Slack</a>.</li>
<li>Follow <a target="_blank" href="https://twitter.com/falco_org">@falco_org on Twitter</a>.</li>
</ul>

And that's it!

![falco extendend architecture](/img/falcosidekick-color.png)

*Enjoy*
