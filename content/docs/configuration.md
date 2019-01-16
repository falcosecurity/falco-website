---
title: Falco Configuration
short: Configuration
---

Falco's configuration file is a [YAML](http://www.yaml.org/start.html)
file containing a collection of `key: value` or `key: [value list]` pairs.

Any configuration option can be overridden on the command line via the `-o/--option key=value` flag. For `key: [value list]` options, you can specify individual list items using ``--option key.subkey=value``.

The current configuration keys are:

#### `rules_file: [<path1>, <path2>, ...]`

the location of the rules file(s). This can contain one or more paths to separate rules files. In falco.yaml, this is expressed as the equivalent:

```yaml
rules_file:
  - <path1>
  - <path2>
  - ...
```

You can also specify multiple rules files on the command line via one or more `-r` options.

#### `json_output: [true|false]`

whether to use JSON output for alert messages.

#### `json_include_output_property: [true|false]`

When using json output, whether or not to include the "output" property
itself (e.g. "File below a known binary directory opened for writing
(user=root ....") in the json output.

#### `log_stderr: [true|false]`

if true, log messages describing falco's activity will be logged to stderr. Note these are *not* alert messages--these are log messages for falco itself.

#### `log_syslog: [true|false]`

if true, log messages describing falco's activity will be logged to syslog.

#### `log_level: [emergency|alert|critical|error|warning|notice|info|debug]`

Minimum log level to include in logs. Note: these levels are separate from the priority field of rules. This refers only to the log level of falco's internal logging.

#### `priority: [emergency|alert|critical|error|warning|notice|info|debug]`

Minimum rule priority level to load and run. All rules having a priority more severe than this level will be loaded/run. 

#### `outputs`

a list containing these sub-keys:

* `rate: <notifications/second>`
* `outputs: max_burst: <number of messages>`

A throttling mechanism implemented as a token bucket limits the rate of falco notifications. This throttling is controlled by the `rate` and `max_burst` options. 

`rate` is the number of tokens (i.e. right to send a notification) gained per second, and defaults to 1. `max_burst` is the maximum number of tokens outstanding, and defaults to 1000.

With these defaults, falco could send up to 1000 notifications after an initial quiet period, and then up to 1 notification per second afterward. It would gain the full burst back after 1000 seconds of no activity.

#### `syslog_output`

a list containing these sub-keys:

* `enabled: [true|false]`: if true, falco alerts will be sent via syslog

#### `file_output`

a list containing these sub-keys:

* `enabled: [true|false]`: if true, falco alerts will be sent to the specified file
* `keep_alive: [true|false]`: If false (default), will reopen file for every alert. If true, will open the file once and keep it open for all alerts. Might be necessary to also specify `--unbuffered` on falco command line.
* `filename: <path>`: the location of the file to which alerts will be sent


#### `stdout_output`

a list containing these sub-keys:

* `enabled: [true|false]`: if true, falco alerts will be sent to standard output

#### `program_output`

a list containing these sub-keys:

* `enabled: [true|false]`: if true, falco alerts will be sent to a program
* `keep_alive: [true|false]`: If false (default), run program for each alert. If true, will spawn program once and keep it open for all alerts. Might be necessary to also specify `--unbuffered` on falco command line.
* `program: <program>`: the program to run for each alert. This is started via a shell, so you can specify a command pipeline to allow for additional formatting.

#### `webserver`

a list containing these sub-keys:
* `enabled: [true|false]`: if true, falco will start an embedded webserver to accept k8s audit events
* `listen_port`: The port on which to listen for k8s audit events. Default 8765.
* `k8s_audit_endpoint`: The uri on which to listen for k8s audit events. Default `/k8s_audit`.

