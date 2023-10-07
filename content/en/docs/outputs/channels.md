---
title: Output Channels
description: Supported output channels for Falco Alerts
linktitle: Output Channels
aliases:
- ../alerts/channels
weight: 10
---

## Standard Output

When configured to send alerts via standard output, a line is printed for each alert. 

Here is an example:

```yaml
stdout_output:
  enabled: true
```

```
10:20:05.408091526: Warning Sensitive file opened for reading by non-trusted program (user=root command=cat /etc/shadow file=/etc/shadow)
```
Standard output is useful when using [Fluentd](https://www.fluentd.org/) or [Logstash](https://www.elastic.co/logstash/) to capture logs from containers. Alerts can then be stored in [Elasticsearch](https://www.elastic.co/elasticsearch/), and dashboards can be created to visualize the alerts. For more information, read [this blog post](https://sysdig.com/blog/kubernetes-security-logging-fluentd-falco/).

{{% alert color="warning" %}}
When run in the background via the `-d/--daemon` command line option,\
standard output messages are discarded.
{{% /alert %}}

### Standard Output buffering

If the logs are inspected by tailing container logs (e.g. `kubectl logs -f` in Kubernetes) it might look like events can take a long time to appear, sometimes longer than 15 minutes. This is not an issue with Falco but is simply a side effect of the system output buffering. 

However, if realtime update of these logs is necessary it can be forced
with the `-U/--unbuffered` command line option which will ensure the output is flushed for every event at the cost of higher CPU usage.

## File Output

When configured to send alerts to a file, a message is written to the file for each alert. The configuration is very similar to the [Standard Output](/docs/outputs/channels/#standard-output) format:

```yaml
file_output:
  enabled: true
  keep_alive: false
  filename: ./events.txt
```

When the field `keep_alive` is set to false (default value), for each alert the file is opened for appending, the single alert is written, and the file is closed. The file is not rotated or truncated. If `keep_alive` is set to true, the file is opened before the first alert and kept open for all subsequent alerts. Output is buffered and will be flushed only on close. (This can be changed with `--unbuffered`).

If you'd like to use a program like [logrotate](https://github.com/logrotate/logrotate) to rotate the output file, an example logrotate config is available [here](https://github.com/falcosecurity/falco/blob/ffd8747ec0943db2546c3270826e1700dc4df75f/examples/logrotate/falco).

As of Falco 0.10.0, falco will close and reopen its file output when signaled with `SIGUSR1`. The logrotate example above depends on it.

## Syslog Output

When configured to send alerts to syslog, a syslog message is sent for each alert. The actual format depends on your syslog daemon, but here's a simple configuration example:

```yaml
syslog_output:
  enabled: true
```

And its respective entry in the syslog service:

```
Jun  7 10:20:05 ubuntu falco: Sensitive file opened for reading by non-trusted program (user=root command=cat /etc/shadow file=/etc/shadow)
```

{{% alert color="primary" %}}
Syslog messages are sent with a facility of **`LOG_USER`**.\
The rule's priority is used as the priority of the syslog message.
{{% /alert %}}

## Program Output

When configured to send alerts to a program, Falco normally starts the program for each alert and writes its contents to the program's standard input. You can only configure a single program output (e.g. route alerts to a single program) at a time.

Here you can find an example of how to configure the `program_output` inside the `falco.yaml` file:

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: mail -s "Falco Notification" someone@example.com
```

If the program cannot normally accept an input from standard input, `xargs` can be used to pass the falco events with an argument. For example:

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: "xargs -I {} aws --region ${region} sns publish --topic-arn ${falco_sns_arn} --message {}"
```

When `keep_alive` is set to false (default value), for each alert falco will run the program `mail -s ...` and write the alert to the program. The program is run via a shell, so it's possible to specify a command pipeline if you wish to add additional formatting.

If `keep_alive` is set to true, before the first alert falco will spawn the program and write the alert. The program pipe will be kept open for subsequent alerts.  Output is buffered and will be flushed only on close. (This can be changed with --unbuffered).

{{% alert title="Controlling the program output" color="primary" %}}
The program spawned by falco is in the same process group as falco and will receive all signals that falco receives. If you want to, say, ignore SIGTERM to allow for a clean shutdown in the face of buffered outputs, you must override the signal handler yourself.
\
As of Falco 0.10.0, falco will close and reopen its file output when signaled with `SIGUSR1`.
{{% /alert %}}


### Example 1: Posting to a Slack Incoming Webhook

If you'd like to send falco notifications to a slack channel, here's the required configuration to massage the JSON output to a form required for the slack webhook endpoint:

```yaml
# Whether to output events in json or text
json_output: true
…
program_output:
  enabled: true
  program: "jq '{text: .output}' | curl -d @- -X POST https://hooks.slack.com/services/XXX"
```

### Example 2: Sending Alerts to Network Channel

If you'd like to send a stream of alerts over a network connection, here's an example:

```yaml
# Whether to output events in json or text
json_output: true
…
program_output:
  enabled: true
  keep_alive: true
  program: "nc host.example.com 1234"
```

Note the use of `keep_alive: true` to keep the network connection persistent.

## HTTP/HTTPS Output {#http-output}

If you'd like to send alerts to an HTTP(S) endpoint, you can use the `http_output` option:

```yaml
json_output: true
...
http_output:
  enabled: true
  url: http://some.url/some/path/
```

Currently, only unencrypted HTTP endpoints and valid HTTPS endpoints are supported (i.e., invalid or self-signed certificates are not supported).

## JSON Output

For all output channels, you can switch to JSON output either in the configuration file or on the command line. For each alert, falco will print a JSON object, on a single line, containing the following properties:

* `time`: the time of the alert, in ISO8601 format.
* `rule`: the rule that resulted in the alert.
* `priority`: the priority of the rule that generated the alert.
* `output`: the formatted output string for the alert.
* `hostname`: the name of the host running Falco (can be the hostname inside the container).
* `tags`: the list of tags associated with the rule.
* `output_fields`: for each templated value in the output expression, the value of that field from the event that triggered the alert.

Here's an example:

```javascript
{"hostname":"falco-xczjd","output":"13:44:05.478445995: Critical A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=kubecon container=ee97d9c4186f shell=sh parent=runc cmdline=sh -c clear; (bash || ash || sh) terminal=34816 container_id=ee97d9c4186f image=docker.io/library/alpine)","priority":"Critical","rule":"Terminal shell in container","source":"syscall","tags":["container","mitre_execution","shell"],"time":"2023-05-25T13:44:05.478445995Z", "output_fields": {"container.id":"ee97d9c4186f","container.image.repository":"docker.io/library/alpine","evt.time":1685022245478445995,"k8s.ns.name":"default","k8s.pod.name":"kubecon","proc.cmdline":"sh -c clear; (bash || ash || sh)","proc.name":"sh","proc.pname":"runc","proc.tty":34816,"user.loginuid":-1,"user.name":"root"}}
```

Here's the same output, pretty-printed:

```javascript
{
    "hostname": "falco-xczjd",
    "output": "13:44:05.478445995: Critical A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=kubecon container=ee97d9c4186f shell=sh parent=runc cmdline=sh -c clear; (bash || ash || sh) terminal=34816 container_id=ee97d9c4186f image=docker.io/library/alpine)",
    "priority": "Critical",
    "rule": "Terminal shell in container",
    "source": "syscall",
    "tags": [
        "container",
        "mitre_execution",
        "shell"
    ],
    "time": "2023-05-25T13:44:05.478445995Z",
    "output_fields": {
        "container.id": "ee97d9c4186f",
        "container.image.repository": "docker.io/library/alpine",
        "evt.time": 1685022245478445995,
        "k8s.ns.name": "default",
        "k8s.pod.name": "kubecon",
        "proc.cmdline": "sh -c clear; (bash || ash || sh)",
        "proc.name": "sh",
        "proc.pname": "runc",
        "proc.tty": 34816,
        "user.loginuid": -1,
        "user.name": "root"
    }
}
```

## gRPC Output

If you'd like to send alerts to an external program connected via gRPC API (for example, the [falco-exporter](https://github.com/falcosecurity/falco-exporter)), you need to enable both the `grpc` and `grpc_output` options as described under the [gRPC Configuration section](/docs/grpc/#configuration).
