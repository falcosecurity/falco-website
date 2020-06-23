---
Title: Extend Falco outputs with falcosidekick
Date: 2020-06-22
Author: Thomas Labarussias
---
By default, Falco has 5 outputs for its events: **stdout**, **file**, **gRPC**, **shell** and **http**. As you see in the following diagram:

![falco extendend architecture](/img/falco-extended-architecture.png)

Even if they're convenient, we can quickly be limited to integrating Falco with other components. Here comes [`falcosidekick`](https://github.com/falcosecurity/falcosidekick), a little daemon that extends that number of possible outputs. 

The current list of available `falcosidekick` outputs (version `2.13.0`) is: 
* [**Slack**](https://slack.com)
* [**Rocketchat**](https://rocket.chat/)
* [**Mattermost**](https://mattermost.com/)
* [**Teams**](https://products.office.com/en-us/microsoft-teams/group-chat-software)
* [**Datadog**](https://www.datadoghq.com/)
* [**AlertManager**](https://prometheus.io/docs/alerting/alertmanager/)
* [**Elasticsearch**](https://www.elastic.co/)
* [**Loki**](https://grafana.com/oss/loki)
* [**NATS**](https://nats.io/)
* [**Influxdb**](https://www.influxdata.com/products/influxdb-overview/)
* [**AWS Lambda**](https://aws.amazon.com/lambda/features/)
* [**AWS SQS**](https://aws.amazon.com/sqs/features/)
* **SMTP** (email)
* [**Opsgenie**](https://www.opsgenie.com/)
* **Webhook**

Beyond that, it provides metrics about the number of events and let you add custom fields in events, for example *environment*, *region*, etc

In this article, we'll see how to integrate it in a Kubernetes aside `falco` with `helm` (*version 3*). For installing Falco with Helm see the [community chart](https://github.com/falcosecurity/charts):

```bash
kubectl -n falco get pods

NAME          READY   STATUS    RESTARTS   AGE
falco-562mb   1/1     Running   0          3m10s
falco-pvl27   1/1     Running   0          3m10s
falco-d4mgr   1/1     Running   0          3m10s
```

We'll send the events in a **Slack** channel for this tutorial, so [get your webhook URL]([https://](https://api.slack.com/messaging/webhooks#create_a_webhook) first.

Download the `falcosidekick` helm chart:

```bash
git clone https://github.com/falcosecurity/falcosidekick.git
cd falcosidekick/deploy/helm/falcosidekick
```

Install `falcosidekick` :

```bash
helm install falcosidekick . --namespace falco --set config.slack.webhookurl="https://hooks.slack.com/services/XXXX"
```
```bash
kubectl -n falco get pods

NAME                            READY   STATUS    RESTARTS   AGE
falco-562mb                     1/1     Running   0          65m
falco-pvl27                     1/1     Running   0          65m
falco-d4mgr                     1/1     Running   0          65m
falcosidekick-dddffd6bf-r6bwq   1/1     Running   0          42s
```

You can now test it with a typical port-forwarding:

```bash
kubectl port-forward svc/falcosidekick -n falco 2801:2801
```

```bash
curl -s http://localhost:2801/ping

pong
```

It's alive !

Now, we send an event to **Slack** to test whether it works or not:

```bash
curl -sI http://localhost:2801/test

HTTP/1.1 200 OK
Date: Mon, 22 Jun 2020 21:13:48 GMT
```

In logs you'll get:

```bash
kubectl logs deployment/falcosidekick -n falco

2020/06/22 21:12:56 [INFO]  : Enabled Outputs : Slack
2020/06/22 21:12:56 [INFO]  : Falco Sidekick is up and listening on port 2801
2020/06/22 21:13:34 [DEBUG] : Test sent
```
And in **Slack**:

![falcosidekick slack test](/img/falcosidekick-slack-test.png)

For **Slack** and some other ouputs, the message format can be customized, more informations in [README](https://github.com/falcosecurity/falcosidekick/blob/master/README.md).

We'll now add some custom fields and test a more realistic event.

Edit the *values.yaml* like this :
```bash
  customfields: "environment:production,datacenter:paris"
```

Send an event to `falcosidekick` :
```bash
curl "http://localhost:2801/" -d'{"output":"A more realistic test event","priority":"Error","rule":"Fake rule","time":"2020-06-22T23:28:00.746609046Z", "output_fields": {"evt.time":1507591916746609046,"fd.name":"/bin/hack","proc.cmdline":"touch /bin/hack","user.name":"root"}}'
```
![falcosidekick slack test 2](/img/falcosidekick-slack-test2.png)

Last but not least, it's time to use `falcosidekick` as output processor for our beloved Falco.

In the chart helm folder for `falco`, edit *values.yaml*:
```bash
json_output: true
json_include_output_property: true
http_output:
  enabled: true
  url: http://falcosidekick:2801/"
```
```bash
helm upgrade falco . --namespace falco

Release "falco" has been upgraded. Happy Helming!
```

And that's it!

![falcosidekick slack test 3](/img/falcosidekick-slack-test2.png)


![falco extendend architecture](/img/falcosidekick-color.png)

*Enjoy*
