---
Title: Extend Falco outputs with falcosidekick
Date: 2020-06-22
Author: Thomas Labarussias
slug: extend-falco-outputs-with-falcosidekick
---
*(2021-04-13) edit: update to integrate `Falcosidekick-UI` use last versions of `Falco` helm chart which embeds `Falcosidekick` as dependency*

默认情况下，Falco 的事件有 5 个输出：stdout、file、gRPC、shell 和 http。 如下图所示：

![falco extendend architecture](/img/falco-extended-architecture.png)

即使它们很方便，我们也可以很快将 Falco 与其他组件集成。 Falcosidekick 来了，这是一个小守护进程，它扩展了可能的输出数量。 

当前可用的 Falcosidekick 输出列表（版本 v2.22.0）是：

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

除此之外，它还提供有关事件数量的指标，并允许您在事件中添加自定义字段，例如环境、区域等

在本文中，我们将了解如何在 Kubernetes 集群中一起部署 Falco、Falcosidekick 和 Falcosidekick-UI。

我们将使用 Helm（版本 3）来安装所有组件，为了更好的用户体验，官方 Falco chart 能够为我们安装和设置所有配置：

对于本教程，我们将在 Slack 频道中发送事件，因此请先获取您的 webhook URL。

运行以下`Helm`

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

所有可能的值都可以在相应的 Helm 图表中看到，请参阅存储库

几秒钟后，您应该得到：

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

您可以使用典型的端口转发测试 Falcosidekick 的部署：

```bash
kubectl -n falco port-forward svc/falco-falcosidekick 2801
```

```bash
curl -s http://localhost:2801/ping

pong
```

它还活着 ！

我们可以向 Slack 发送一个测试事件来测试它是否有效。 Falcosidekick 为此提供了一个有用的端点：

```bash
curl -sI -XPOST http://localhost:2801/test

HTTP/1.1 200 OK
Date: Tue, 13 Apr 2021 20:42:32 GMT
Content-Length: 0
```

在日志中，您将获得：

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

我们可以注意到日志的第一行 [INFO] : Enabled Outputs : [Slack WebUI]，我们确实有 2 个启用的输出，Slack 和 WebUI ([`Falcosidekick-UI`](https://github.com/falcosecurity/falcosidekick-ui))

在您的 Slack 频道中：

![falcosidekick slack test](/img/falcosidekick-slack-test.png)

提示：对于 Slack 和其他一些输出，可以自定义消息格式，更多信息在 README(https://github.com/falcosecurity/falcosidekick/blob/master/README.md)*

我们现在将添加一些自定义字段并测试更真实的事件。

升级您的部署：

```bash
helm upgrade falco falcosecurity/falco \
--set falcosidekick.enabled=true \
--set falcosidekick.webui.enabled=true \
--set falcosidekick.config.slack.webhookurl="https://hooks.slack.com/services/XXXX" \
--set falcosidekick.config.customfields="environment:production\,datacenter:paris"
-n falco 
```

向 Falcosidekick 发送更高级的测试事件（仍然保留端口转发）：
```bash
curl "http://localhost:2801/" -d'{"output":"A more realistic test event","priority":"Error","rule":"Fake rule","time":"2021-04-13T20:58:00.746609046Z+2", "output_fields": {"evt.time":1618347519000000,"fd.name":"/bin/hack","proc.cmdline":"touch /bin/hack","user.name":"root"}}'
```
![falcosidekick slack test 2](/img/falcosidekick-slack-test2.png)

Falco 社区还提供了一个 Web UI，用于跟踪实时事件并获取有关上次的统计信息。 （提示：您可以通过单击任何标签来添加过滤器）

默认情况下，您也可以通过端口转发访问它：

```bash
kubectl port-forward svc/falco-falcosidekick-ui -n falco 2802
```

您现在可以使用以下 URL 在浏览器中访问：http://localhost:2802/ui

![falcosidekick slack test 2](/img/falcosidekick-ui-1.png)

![falcosidekick slack test 2](/img/falcosidekick-ui-2.png)

## 参与其中

如果您想了解有关 Falco 的更多信息:<br />

<ul>
<li>Get started in <a target="_blank" href="http://falco.org/">Falco.org</a>.</li>
<li>Check out the <a target="_blank" href="https://github.com/falcosecurity/falco">Falco project on GitHub</a>.</li>
<li>Get involved <a target="_blank" href="https://falco.org/community/">Falco community</a>.</li>
<li>Meet the maintainers on the <a target="_blank" href="https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32">Falco Slack</a>.</li>
<li>Follow <a target="_blank" href="https://twitter.com/falco_org">@falco_org on Twitter</a>.</li>
</ul>

就是这样！

![falco extendend architecture](/img/falcosidekick-color.png)

*Enjoy*

