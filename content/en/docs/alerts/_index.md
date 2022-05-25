---
title: Falco Alerts
weight: 8
---

Falco can send alerts to one or more channels:

* Standard Output
* A file
* Syslog
* A spawned program
* A HTTP[s] end point
* A client via the gRPC API

The channels are configured via the falco configuration file `falco.yaml`. See the [Falco Configuration](../configuration) page for more details. Here are details on each of those channels.

## Standard Output

When configured to send alerts via standard output, a line is printed for each alert. Here's an example:

```yaml
stdout_output:
  enabled: true
```

```
10:20:05.408091526: Warning Sensitive file opened for reading by non-trusted program (user=root command=cat /etc/shadow file=/etc/shadow)
```
Standard output is useful when using Fluentd or Logstash to capture logs from containers. Alerts can then be stored in Elasticsearch, and dashboards can be created to visualize the alerts. For more information, read [this blog post](https://sysdig.com/blog/kubernetes-security-logging-fluentd-falco/).

When run in the background via the `-d/--daemon` command line option, standard output messages are discarded.

### Standard Output buffering

If the logs are inspected by tailing container logs (e.g. `kubectl logs -f` in Kubernetes) it might look like events can take a long time to appear, sometimes more than 15 minutes.
This is not an issue with Falco but is simply a side effect of the system output buffering. However, if realtime update of these logs is necessary it can be forced
with the `-U/--unbuffered` command line option which will ensure the output is flushed for every event at the cost of higher CPU usage.

## File Output

When configured to send alerts to a file, a message is written to the file for each alert. The format is very similar to the Standard Output format:

```yaml
file_output:
  enabled: true
  keep_alive: false
  filename: ./events.txt
```

When `keep_alive` is false (the default), for each alert the file is opened for appending, the single alert is written, and the file is closed. The file is not rotated or truncated. If `keep_alive` is set to true, the file is opened before the first alert and kept open for all subsequent alerts. Output is buffered and will be flushed only on close. (This can be changed with `--unbuffered`).

If you'd like to use a program like [logrotate](https://github.com/logrotate/logrotate) to rotate the output file, an example logrotate config is available [here](https://github.com/falcosecurity/falco/blob/ffd8747ec0943db2546c3270826e1700dc4df75f/examples/logrotate/falco).

As of Falco 0.10.0, falco will close and reopen its file output when signaled with `SIGUSR1`. The logrotate example above depends on it.

## Syslog Output

When configured to send alerts to syslog, a syslog message is sent for each alert. The actual format depends on your syslog daemon, but here's an example:

```yaml
syslog_output:
  enabled: true
```

```
Jun  7 10:20:05 ubuntu falco: Sensitive file opened for reading by non-trusted program (user=root command=cat /etc/shadow file=/etc/shadow)
```

Syslog messages are sent with a facility of LOG_USER. The rule's priority is used as the priority of the syslog message.

## Program Output

When configured to send alerts to a program, Falco starts the program for each alert and writes its contents to the program's standard input. You can only configure a single program output (e.g. route alerts to a single program) at a time.

For example, given a `falco.yaml` configuration of:

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: mail -s "Falco Notification" someone@example.com
```

If the program cannot normally accept an input from standard input, `xargs` can be used to pass the falco events with an argument. For example :

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: "xargs -I {} aws --region ${region} sns publish --topic-arn ${falco_sns_arn} --message {}"
```

When `keep_alive` is false (the default), for each alert falco will run the program `mail -s ...` and write the alert to the program. The program is run via a shell, so it's possible to specify a command pipeline if you wish to add additional formatting.

If `keep_alive` is set to true, before the first alert falco will spawn the program and write the alert. The program pipe will be kept open for subsequent alerts.  Output is buffered and will be flushed only on close. (This can be changed with --unbuffered).

*Note*: the program spawned by falco is in the same process group as falco and will receive all signals that falco receives. If you want to, say, ignore SIGTERM to allow for a clean shutdown in the face of buffered outputs, you must override the signal handler yourself.

As of Falco 0.10.0, falco will close and reopen its file output when signaled with `SIGUSR1`.

### Program Output Example: Posting to a Slack Incoming Webhook

If you'd like to send falco notifications to a slack channel, here's the required configuration to massage the JSON output to a form required for the slack webhook endpoint:

```yaml
# Whether to output events in json or text
json_output: true
…
program_output:
  enabled: true
  program: "jq '{text: .output}' | curl -d @- -X POST https://hooks.slack.com/services/XXX"
```

### Program Output: Sending Alerts to Network Channel

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

## HTTP[s] Output: Send alerts to an HTTP[s] end point.

If you'd like to send alerts to an HTTP[s] endpoint, you can use the `http_output` option:

```yaml
json_output: true
...
http_output:
  enabled: true
  url: http://some.url/some/path/
```

Currently only unencrypted HTTP endpoints or valid, secure HTTPs endpoints are supported (ie invalid or self signed certificates are not supported).

## JSON Output

For all output channels, you can switch to JSON output either in the configuration file or on the command line. For each alert, falco will print a JSON object, on a single line, containing the following properties:

* `time`: the time of the alert, in ISO8601 format.
* `rule`: the rule that resulted in the alert.
* `priority`: the priority of the rule that generated the alert.
* `output`: the formatted output string for the alert.
* `output_fields`: for each templated value in the output expression, the value of that field from the event that triggered the alert.

Here's an example:

```javascript
{"output":"16:31:56.746609046: Error File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack)","priority":"Error","rule":"Write below binary dir","time":"2017-10-09T23:31:56.746609046Z", "output_fields": {"evt.t\
ime":1507591916746609046,"fd.name":"/bin/hack","proc.cmdline":"touch /bin/hack","user.name":"root"}}
```

Here's the same output, pretty-printed:

```javascript
{
   "output" : "16:31:56.746609046: Error File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack)"
   "priority" : "Error",
   "rule" : "Write below binary dir",
   "time" : "2017-10-09T23:31:56.746609046Z",
   "output_fields" : {
      "user.name" : "root",
      "evt.time" : 1507591916746609046,
      "fd.name" : "/bin/hack",
      "proc.cmdline" : "touch /bin/hack"
   }
}
```

## gRPC Output

If you'd like to send alerts to an external program connected via gRPC API (for example, the [falco-exporter](https://github.com/falcosecurity/falco-exporter)), you need to enable both the `grpc` and `grpc_output` options as described under the [gRPC Configuration section](/docs/grpc/#configuration).


{{% pageinfo color="primary" %}}

_SELinux note_: If you have [SELinux](https://en.wikipedia.org/wiki/Security-Enhanced_Linux) enabled you may see the following error while starting Falco with gRPC support enabled:

```shell

May 08 12:14:41 myserver falco[15442]: Falco version X.XX.X (driver version ZZZZ)
May 08 12:14:41 myserver falco[15442]: Falco initialized with configuration file /etc/falco/falco.yaml
May 08 12:14:41 myserver falco[15442]: Loading rules from file /etc/falco/falco_rules.yaml:
May 08 12:14:42 myserver falco[15442]: Loading rules from file /etc/falco/falco_rules.local.yaml:
May 08 12:14:42 myserver falco[15442]: Loading rules from file /etc/falco/k8s_audit_rules.yaml:
May 08 12:14:43 myserver falco[15442]: Starting internal webserver, listening on port 8765
May 08 12:14:43 myserver falco[15442]: gRPC server threadiness equals to 2
May 08 12:14:43 myserver falco[15442]: grpc: {"created":"@1652026483.513407096","description":"No address added out of total 1 resolved","file":"/build/release/grpc-prefix/src/grpc/src/core/e>
May 08 12:14:43 myserver falco[15442]: Error starting gRPC server
```

You may want to run SELinux in 'permissive' mode while you figure out how to give Falco the proper permission to create the gRPC server on startup:

```shell
sudo setenforce 0
```

To make this permanent across reboots (if you have Grubby installed):

```shell
sudo grubby --default-kernel
/boot/vmlinuz-5.6.13-100.fc30.x86_64
sudo grubby --update-kernel=/boot/vmlinuz-5.6.13-100.fc30.x86_64 --args='selinux=1 enforcing=0'
sudo reboot -n
```

Or if you want, you can turn the permissive mode directly onto the ```/etc/selinux/config``` file:

```shell
sudo sed -i 's#SELINUX=enforcing#SELINUX=permissive#' /etc/selinux/config 
sudo cat /etc/selinux/config

# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=permissive
# SELINUXTYPE= can take one of these three values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected. 
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted

sudo reboot -n
```

Then check your system logs (for example using ```journalctl --no-page --since 'YYYY-MM-DD' --grep selinux```) and check the messages.


{{% /pageinfo %}}
