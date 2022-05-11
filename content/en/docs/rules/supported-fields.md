---
title: Supported Fields for Conditions and Outputs
weight: 3
---

Here are the fields supported by Falco. These fields can be used in the `condition` key of a Falco rule and well as the `output` key. Any fields included in the `output` key of a rule will also be included in the alert's `output_fields` object when [`json_output`](../../alerts#json-output) is set to `true`.

You can also see this set of fields via `falco --list=<source>`, with `<source>` being one of the [supported sources](../event-sources/).

## System Calls (source `syscall`)
<!-- 
generated with:
falco --list=syscall --markdown  | sed -E 's/## Field Class/### Field Class/g'
-->

`syscall` event source fields are provided by the [Falco Drivers](/docs/event-sources/drivers/).

```
# System Kernel Fields
$ falco --list=syscall
```

### Field Class: evt

These fields can be used for all event types

Name | Type | Description
:----|:-----|:-----------
`evt.num` | UINT64 | event number.
`evt.time` | CHARBUF | event timestamp as a time string that includes the nanosecond part.
`evt.time.s` | CHARBUF | event timestamp as a time string with no nanoseconds.
`evt.time.iso8601` | CHARBUF | event timestamp in ISO 8601 format, including nanoseconds and time zone offset (in UTC).
`evt.datetime` | CHARBUF | event timestamp as a time string that includes the date.
`evt.datetime.s` | CHARBUF | event timestamp as a datetime string with no nanoseconds.
`evt.rawtime` | ABSTIME | absolute event timestamp, i.e. nanoseconds from epoch.
`evt.rawtime.s` | ABSTIME | integer part of the event timestamp (e.g. seconds since epoch).
`evt.rawtime.ns` | ABSTIME | fractional part of the absolute event timestamp.
`evt.reltime` | RELTIME | number of nanoseconds from the beginning of the capture.
`evt.reltime.s` | RELTIME | number of seconds from the beginning of the capture.
`evt.reltime.ns` | RELTIME | fractional part (in ns) of the time from the beginning of the capture.
`evt.pluginname` | CHARBUF | if the event comes from a plugin, the name of the plugin that generated it. The plugin must be currently loaded.
`evt.plugininfo` | CHARBUF | if the event comes from a plugin, a summary of the event as formatted by the plugin. The plugin must be currently loaded.

### Field Class: evt (for system calls)

Event fields applicable to syscall events. Note that for most events you can access the individual arguments/parameters of each syscall via evt.arg, e.g. evt.arg.filename.

Name | Type | Description
:----|:-----|:-----------
`evt.latency` | RELTIME | delta between an exit event and the correspondent enter event, in nanoseconds.
`evt.latency.s` | RELTIME | integer part of the event latency delta.
`evt.latency.ns` | RELTIME | fractional part of the event latency delta.
`evt.latency.human` | CHARBUF | delta between an exit event and the correspondent enter event, as a human readable string (e.g. 10.3ms).
`evt.deltatime` | RELTIME | delta between this event and the previous event, in nanoseconds.
`evt.deltatime.s` | RELTIME | integer part of the delta between this event and the previous event.
`evt.deltatime.ns` | RELTIME | fractional part of the delta between this event and the previous event.
`evt.dir` | CHARBUF | event direction can be either '>' for enter events or '<' for exit events.
`evt.type` | CHARBUF | The name of the event (e.g. 'open').
`evt.type.is` | UINT32 | allows one to specify an event type, and returns 1 for events that are of that type. For example, evt.type.is.open returns 1 for open events, 0 for any other event.
`syscall.type` | CHARBUF | For system call events, the name of the system call (e.g. 'open'). Unset for other events (e.g. switch or internal events). Use this field instead of evt.type if you need to make sure that the filtered/printed value is actually a system call.
`evt.category` | CHARBUF | The event category. Example values are 'file' (for file operations like open and close), 'net' (for network operations like socket and bind), memory (for things like brk or mmap), and so on.
`evt.cpu` | INT16 | number of the CPU where this event happened.
`evt.args` | CHARBUF | all the event arguments, aggregated into a single string.
`evt.arg` | CHARBUF | one of the event arguments specified by name or by number. Some events (e.g. return codes or FDs) will be converted into a text representation when possible. E.g. 'evt.arg.fd' or 'evt.arg[0]'.
`evt.rawarg` | DYNAMIC | one of the event arguments specified by name. E.g. 'evt.rawarg.fd'.
`evt.info` | CHARBUF | for most events, this field returns the same value as evt.args. However, for some events (like writes to /dev/log) it provides higher level information coming from decoding the arguments.
`evt.buffer` | BYTEBUF | the binary data buffer for events that have one, like read(), recvfrom(), etc. Use this field in filters with 'contains' to search into I/O data buffers.
`evt.buflen` | UINT64 | the length of the binary data buffer for events that have one, like read(), recvfrom(), etc.
`evt.res` | CHARBUF | event return value, as a string. If the event failed, the result is an error code string (e.g. 'ENOENT'), otherwise the result is the string 'SUCCESS'.
`evt.rawres` | INT64 | event return value, as a number (e.g. -2). Useful for range comparisons.
`evt.failed` | BOOL | 'true' for events that returned an error status.
`evt.is_io` | BOOL | 'true' for events that read or write to FDs, like read(), send, recvfrom(), etc.
`evt.is_io_read` | BOOL | 'true' for events that read from FDs, like read(), recv(), recvfrom(), etc.
`evt.is_io_write` | BOOL | 'true' for events that write to FDs, like write(), send(), etc.
`evt.io_dir` | CHARBUF | 'r' for events that read from FDs, like read(); 'w' for events that write to FDs, like write().
`evt.is_wait` | BOOL | 'true' for events that make the thread wait, e.g. sleep(), select(), poll().
`evt.wait_latency` | RELTIME | for events that make the thread wait (e.g. sleep(), select(), poll()), this is the time spent waiting for the event to return, in nanoseconds.
`evt.is_syslog` | BOOL | 'true' for events that are writes to /dev/log.
`evt.count` | UINT32 | This filter field always returns 1 and can be used to count events from inside chisels.
`evt.count.error` | UINT32 | This filter field returns 1 for events that returned with an error, and can be used to count event failures from inside chisels.
`evt.count.error.file` | UINT32 | This filter field returns 1 for events that returned with an error and are related to file I/O, and can be used to count event failures from inside chisels.
`evt.count.error.net` | UINT32 | This filter field returns 1 for events that returned with an error and are related to network I/O, and can be used to count event failures from inside chisels.
`evt.count.error.memory` | UINT32 | This filter field returns 1 for events that returned with an error and are related to memory allocation, and can be used to count event failures from inside chisels.
`evt.count.error.other` | UINT32 | This filter field returns 1 for events that returned with an error and are related to none of the previous categories, and can be used to count event failures from inside chisels.
`evt.count.exit` | UINT32 | This filter field returns 1 for exit events, and can be used to count single events from inside chisels.
`evt.around` | UINT64 | Accepts the event if it's around the specified time interval. The syntax is evt.around[T]=D, where T is the value returned by %evt.rawtime for the event and D is a delta in milliseconds. For example, evt.around[1404996934793590564]=1000 will return the events with timestamp with one second before the timestamp and one second after it, for a total of two seconds of capture.
`evt.abspath` | CHARBUF | Absolute path calculated from dirfd and name during syscalls like renameat and symlinkat. Use 'evt.abspath.src' or 'evt.abspath.dst' for syscalls that support multiple paths.
`evt.is_open_read` | BOOL | 'true' for open/openat/openat2 events where the path was opened for reading
`evt.is_open_write` | BOOL | 'true' for open/openat/openat2 events where the path was opened for writing
`evt.is_open_exec` | BOOL | 'true' for open/openat/openat2 or creat events where a file is created with execute permissions

### Field Class: process

Additional information about the process and thread executing the syscall event.

Name | Type | Description
:----|:-----|:-----------
`proc.pid` | INT64 | the id of the process generating the event.
`proc.exe` | CHARBUF | the first command line argument (usually the executable name or a custom one).
`proc.name` | CHARBUF | the name (excluding the path) of the executable generating the event.
`proc.args` | CHARBUF | the arguments passed on the command line when starting the process generating the event.
`proc.env` | CHARBUF | the environment variables of the process generating the event.
`proc.cmdline` | CHARBUF | full process command line, i.e. proc.name + proc.args.
`proc.exeline` | CHARBUF | full process command line, with exe as first argument, i.e. proc.exe + proc.args.
`proc.cwd` | CHARBUF | the current working directory of the event.
`proc.nthreads` | UINT32 | the number of threads that the process generating the event currently has, including the main process thread.
`proc.nchilds` | UINT32 | the number of child threads that the process generating the event currently has. This excludes the main process thread.
`proc.ppid` | INT64 | the pid of the parent of the process generating the event.
`proc.pname` | CHARBUF | the name (excluding the path) of the parent of the process generating the event.
`proc.pcmdline` | CHARBUF | the full command line (proc.name + proc.args) of the parent of the process generating the event.
`proc.apid` | INT64 | the pid of one of the process ancestors. E.g. proc.apid[1] returns the parent pid, proc.apid[2] returns the grandparent pid, and so on. proc.apid[0] is the pid of the current process. proc.apid without arguments can be used in filters only and matches any of the process ancestors, e.g. proc.apid=1234.
`proc.aname` | CHARBUF | the name (excluding the path) of one of the process ancestors. E.g. proc.aname[1] returns the parent name, proc.aname[2] returns the grandparent name, and so on. proc.aname[0] is the name of the current process. proc.aname without arguments can be used in filters only and matches any of the process ancestors, e.g. proc.aname=bash.
`proc.loginshellid` | INT64 | the pid of the oldest shell among the ancestors of the current process, if there is one. This field can be used to separate different user sessions, and is useful in conjunction with chisels like spy_user.
`proc.duration` | RELTIME | number of nanoseconds since the process started.
`proc.fdopencount` | UINT64 | number of open FDs for the process
`proc.fdlimit` | INT64 | maximum number of FDs the process can open.
`proc.fdusage` | DOUBLE | the ratio between open FDs and maximum available FDs for the process.
`proc.vmsize` | UINT64 | total virtual memory for the process (as kb).
`proc.vmrss` | UINT64 | resident non-swapped memory for the process (as kb).
`proc.vmswap` | UINT64 | swapped memory for the process (as kb).
`thread.pfmajor` | UINT64 | number of major page faults since thread start.
`thread.pfminor` | UINT64 | number of minor page faults since thread start.
`thread.tid` | INT64 | the id of the thread generating the event.
`thread.ismain` | BOOL | 'true' if the thread generating the event is the main one in the process.
`thread.exectime` | RELTIME | CPU time spent by the last scheduled thread, in nanoseconds. Exported by switch events only.
`thread.totexectime` | RELTIME | Total CPU time, in nanoseconds since the beginning of the capture, for the current thread. Exported by switch events only.
`thread.cgroups` | CHARBUF | all the cgroups the thread belongs to, aggregated into a single string.
`thread.cgroup` | CHARBUF | the cgroup the thread belongs to, for a specific subsystem. E.g. thread.cgroup.cpuacct.
`thread.vtid` | INT64 | the id of the thread generating the event as seen from its current PID namespace.
`proc.vpid` | INT64 | the id of the process generating the event as seen from its current PID namespace.
`thread.cpu` | DOUBLE | the CPU consumed by the thread in the last second.
`thread.cpu.user` | DOUBLE | the user CPU consumed by the thread in the last second.
`thread.cpu.system` | DOUBLE | the system CPU consumed by the thread in the last second.
`thread.vmsize` | UINT64 | For the process main thread, this is the total virtual memory for the process (as kb). For the other threads, this field is zero.
`thread.vmrss` | UINT64 | For the process main thread, this is the resident non-swapped memory for the process (as kb). For the other threads, this field is zero.
`proc.sid` | INT64 | the session id of the process generating the event.
`proc.sname` | CHARBUF | the name of the current process's session leader. This is either the process with pid=proc.sid or the eldest ancestor that has the same sid as the current process.
`proc.tty` | INT32 | The controlling terminal of the process. 0 for processes without a terminal.
`proc.exepath` | CHARBUF | The full executable path of the process.
`proc.vpgid` | INT64 | the process group id of the process generating the event, as seen from its current PID namespace.
`proc.is_container_healthcheck` | BOOL | true if this process is running as a part of the container's health check.
`proc.is_container_liveness_probe` | BOOL | true if this process is running as a part of the container's liveness probe.
`proc.is_container_readiness_probe` | BOOL | true if this process is running as a part of the container's readiness probe.
`proc.is_exe_writable` | BOOL | true if this process' executable file is writable by the same user that spawned the process.

### Field Class: user

Information about the user executing the specific event.

Name | Type | Description
:----|:-----|:-----------
`user.uid` | UINT32 | user ID.
`user.name` | CHARBUF | user name.
`user.homedir` | CHARBUF | home directory of the user.
`user.shell` | CHARBUF | user's shell.
`user.loginuid` | INT32 | audit user id (auid).
`user.loginname` | CHARBUF | audit user name (auid).

### Field Class: group

Information about the user group.

Name | Type | Description
:----|:-----|:-----------
`group.gid` | UINT64 | group ID.
`group.name` | CHARBUF | group name.

### Field Class: container

Container information. If the event is not happening inside a container, both id and name will be set to 'host'.

Name | Type | Description
:----|:-----|:-----------
`container.id` | CHARBUF | the container id.
`container.name` | CHARBUF | the container name.
`container.image` | CHARBUF | the container image name (e.g. falcosecurity/falco:latest for docker).
`container.image.id` | CHARBUF | the container image id (e.g. 6f7e2741b66b).
`container.type` | CHARBUF | the container type, eg: docker or rkt
`container.privileged` | BOOL | true for containers running as privileged, false otherwise
`container.mounts` | CHARBUF | A space-separated list of mount information. Each item in the list has the format <source>:<dest>:<mode>:<rdrw>:<propagation>
`container.mount` | CHARBUF | Information about a single mount, specified by number (e.g. container.mount[0]) or mount source (container.mount[/usr/local]). The pathname can be a glob (container.mount[/usr/local/*]), in which case the first matching mount will be returned. The information has the format <source>:<dest>:<mode>:<rdrw>:<propagation>. If there is no mount with the specified index or matching the provided source, returns the string "none" instead of a NULL value.
`container.mount.source` | CHARBUF | the mount source, specified by number (e.g. container.mount.source[0]) or mount destination (container.mount.source[/host/lib/modules]). The pathname can be a glob.
`container.mount.dest` | CHARBUF | the mount destination, specified by number (e.g. container.mount.dest[0]) or mount source (container.mount.dest[/lib/modules]). The pathname can be a glob.
`container.mount.mode` | CHARBUF | the mount mode, specified by number (e.g. container.mount.mode[0]) or mount source (container.mount.mode[/usr/local]). The pathname can be a glob.
`container.mount.rdwr` | CHARBUF | the mount rdwr value, specified by number (e.g. container.mount.rdwr[0]) or mount source (container.mount.rdwr[/usr/local]). The pathname can be a glob.
`container.mount.propagation` | CHARBUF | the mount propagation value, specified by number (e.g. container.mount.propagation[0]) or mount source (container.mount.propagation[/usr/local]). The pathname can be a glob.
`container.image.repository` | CHARBUF | the container image repository (e.g. falcosecurity/falco).
`container.image.tag` | CHARBUF | the container image tag (e.g. stable, latest).
`container.image.digest` | CHARBUF | the container image registry digest (e.g. sha256:d977378f890d445c15e51795296e4e5062f109ce6da83e0a355fc4ad8699d27).
`container.healthcheck` | CHARBUF | The container's health check. Will be the null value ("N/A") if no healthcheck configured, "NONE" if configured but explicitly not created, and the healthcheck command line otherwise
`container.liveness_probe` | CHARBUF | The container's liveness probe. Will be the null value ("N/A") if no liveness probe configured, the liveness probe command line otherwise
`container.readiness_probe` | CHARBUF | The container's readiness probe. Will be the null value ("N/A") if no readiness probe configured, the readiness probe command line otherwise

### Field Class: fd

Every syscall that has a file descriptor in its arguments has these fields set with information related to the file.

Name | Type | Description
:----|:-----|:-----------
`fd.num` | INT64 | the unique number identifying the file descriptor.
`fd.type` | CHARBUF | type of FD. Can be 'file', 'directory', 'ipv4', 'ipv6', 'unix', 'pipe', 'event', 'signalfd', 'eventpoll', 'inotify' or 'signalfd'.
`fd.typechar` | CHARBUF | type of FD as a single character. Can be 'f' for file, 4 for IPv4 socket, 6 for IPv6 socket, 'u' for unix socket, p for pipe, 'e' for eventfd, 's' for signalfd, 'l' for eventpoll, 'i' for inotify, 'o' for unknown.
`fd.name` | CHARBUF | FD full name. If the fd is a file, this field contains the full path. If the FD is a socket, this field contain the connection tuple.
`fd.directory` | CHARBUF | If the fd is a file, the directory that contains it.
`fd.filename` | CHARBUF | If the fd is a file, the filename without the path.
`fd.ip` | IPADDR | matches the ip address (client or server) of the fd.
`fd.cip` | IPADDR | client IP address.
`fd.sip` | IPADDR | server IP address.
`fd.lip` | IPADDR | local IP address.
`fd.rip` | IPADDR | remote IP address.
`fd.port` | PORT | matches the port (either client or server) of the fd.
`fd.cport` | PORT | for TCP/UDP FDs, the client port.
`fd.sport` | PORT | for TCP/UDP FDs, server port.
`fd.lport` | PORT | for TCP/UDP FDs, the local port.
`fd.rport` | PORT | for TCP/UDP FDs, the remote port.
`fd.l4proto` | CHARBUF | the IP protocol of a socket. Can be 'tcp', 'udp', 'icmp' or 'raw'.
`fd.sockfamily` | CHARBUF | the socket family for socket events. Can be 'ip' or 'unix'.
`fd.is_server` | BOOL | 'true' if the process owning this FD is the server endpoint in the connection.
`fd.uid` | CHARBUF | a unique identifier for the FD, created by chaining the FD number and the thread ID.
`fd.containername` | CHARBUF | chaining of the container ID and the FD name. Useful when trying to identify which container an FD belongs to.
`fd.containerdirectory` | CHARBUF | chaining of the container ID and the directory name. Useful when trying to identify which container a directory belongs to.
`fd.proto` | PORT | matches the protocol (either client or server) of the fd.
`fd.cproto` | CHARBUF | for TCP/UDP FDs, the client protocol.
`fd.sproto` | CHARBUF | for TCP/UDP FDs, server protocol.
`fd.lproto` | CHARBUF | for TCP/UDP FDs, the local protocol.
`fd.rproto` | CHARBUF | for TCP/UDP FDs, the remote protocol.
`fd.net` | IPNET | matches the IP network (client or server) of the fd.
`fd.cnet` | IPNET | matches the client IP network of the fd.
`fd.snet` | IPNET | matches the server IP network of the fd.
`fd.lnet` | IPNET | matches the local IP network of the fd.
`fd.rnet` | IPNET | matches the remote IP network of the fd.
`fd.connected` | BOOL | for TCP/UDP FDs, 'true' if the socket is connected.
`fd.name_changed` | BOOL | True when an event changes the name of an fd used by this event. This can occur in some cases such as udp connections where the connection tuple changes.
`fd.cip.name` | CHARBUF | Domain name associated with the client IP address.
`fd.sip.name` | CHARBUF | Domain name associated with the server IP address.
`fd.lip.name` | CHARBUF | Domain name associated with the local IP address.
`fd.rip.name` | CHARBUF | Domain name associated with the remote IP address.
`fd.dev` | INT32 | device number (major/minor) containing the referenced file
`fd.dev.major` | INT32 | major device number containing the referenced file
`fd.dev.minor` | INT32 | minor device number containing the referenced file

### Field Class: syslog

Content of Syslog messages.

Name | Type | Description
:----|:-----|:-----------
`syslog.facility.str` | CHARBUF | facility as a string.
`syslog.facility` | UINT32 | facility as a number (0-23).
`syslog.severity.str` | CHARBUF | severity as a string. Can have one of these values: emerg, alert, crit, err, warn, notice, info, debug
`syslog.severity` | UINT32 | severity as a number (0-7).
`syslog.message` | CHARBUF | message sent to syslog.

### Field Class: fdlist

Poll event related fields.

Name | Type | Description
:----|:-----|:-----------
`fdlist.nums` | CHARBUF | for poll events, this is a comma-separated list of the FD numbers in the 'fds' argument, returned as a string.
`fdlist.names` | CHARBUF | for poll events, this is a comma-separated list of the FD names in the 'fds' argument, returned as a string.
`fdlist.cips` | CHARBUF | for poll events, this is a comma-separated list of the client IP addresses in the 'fds' argument, returned as a string.
`fdlist.sips` | CHARBUF | for poll events, this is a comma-separated list of the server IP addresses in the 'fds' argument, returned as a string.
`fdlist.cports` | CHARBUF | for TCP/UDP FDs, for poll events, this is a comma-separated list of the client TCP/UDP ports in the 'fds' argument, returned as a string.
`fdlist.sports` | CHARBUF | for poll events, this is a comma-separated list of the server TCP/UDP ports in the 'fds' argument, returned as a string.

### Field Class: k8s

Kubernetes related context. Available when configured to fetch k8s meta-data from API Server.

Name | Type | Description
:----|:-----|:-----------
`k8s.pod.name` | CHARBUF | Kubernetes pod name.
`k8s.pod.id` | CHARBUF | Kubernetes pod id.
`k8s.pod.label` | CHARBUF | Kubernetes pod label. E.g. 'k8s.pod.label.foo'.
`k8s.pod.labels` | CHARBUF | Kubernetes pod comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.
`k8s.rc.name` | CHARBUF | Kubernetes replication controller name.
`k8s.rc.id` | CHARBUF | Kubernetes replication controller id.
`k8s.rc.label` | CHARBUF | Kubernetes replication controller label. E.g. 'k8s.rc.label.foo'.
`k8s.rc.labels` | CHARBUF | Kubernetes replication controller comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.
`k8s.svc.name` | CHARBUF | Kubernetes service name (can return more than one value, concatenated).
`k8s.svc.id` | CHARBUF | Kubernetes service id (can return more than one value, concatenated).
`k8s.svc.label` | CHARBUF | Kubernetes service label. E.g. 'k8s.svc.label.foo' (can return more than one value, concatenated).
`k8s.svc.labels` | CHARBUF | Kubernetes service comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.
`k8s.ns.name` | CHARBUF | Kubernetes namespace name.
`k8s.ns.id` | CHARBUF | Kubernetes namespace id.
`k8s.ns.label` | CHARBUF | Kubernetes namespace label. E.g. 'k8s.ns.label.foo'.
`k8s.ns.labels` | CHARBUF | Kubernetes namespace comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.
`k8s.rs.name` | CHARBUF | Kubernetes replica set name.
`k8s.rs.id` | CHARBUF | Kubernetes replica set id.
`k8s.rs.label` | CHARBUF | Kubernetes replica set label. E.g. 'k8s.rs.label.foo'.
`k8s.rs.labels` | CHARBUF | Kubernetes replica set comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.
`k8s.deployment.name` | CHARBUF | Kubernetes deployment name.
`k8s.deployment.id` | CHARBUF | Kubernetes deployment id.
`k8s.deployment.label` | CHARBUF | Kubernetes deployment label. E.g. 'k8s.rs.label.foo'.
`k8s.deployment.labels` | CHARBUF | Kubernetes deployment comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.

### Field Class: mesos

Mesos related context.

Name | Type | Description
:----|:-----|:-----------
`mesos.task.name` | CHARBUF | Mesos task name.
`mesos.task.id` | CHARBUF | Mesos task id.
`mesos.task.label` | CHARBUF | Mesos task label. E.g. 'mesos.task.label.foo'.
`mesos.task.labels` | CHARBUF | Mesos task comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.
`mesos.framework.name` | CHARBUF | Mesos framework name.
`mesos.framework.id` | CHARBUF | Mesos framework id.
`marathon.app.name` | CHARBUF | Marathon app name.
`marathon.app.id` | CHARBUF | Marathon app id.
`marathon.app.label` | CHARBUF | Marathon app label. E.g. 'marathon.app.label.foo'.
`marathon.app.labels` | CHARBUF | Marathon app comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.
`marathon.group.name` | CHARBUF | Marathon group name.
`marathon.group.id` | CHARBUF | Marathon group id.

### Field Class: span

Fields used if information about distributed tracing is available.

Name | Type | Description
:----|:-----|:-----------
`span.id` | INT64 | ID of the span. This is a unique identifier that is used to match the enter and exit tracer events for this span. It can also be used to match different spans belonging to a trace.
`span.time` | CHARBUF | time of the span's enter tracer as a human readable string that includes the nanosecond part.
`span.ntags` | UINT32 | number of tags that this span has.
`span.nargs` | UINT32 | number of arguments that this span has.
`span.tags` | CHARBUF | dot-separated list of all of the span's tags.
`span.tag` | CHARBUF | one of the span's tags, specified by 0-based offset, e.g. 'span.tag[1]'. You can use a negative offset to pick elements from the end of the tag list. For example, 'span.tag[-1]' returns the last tag.
`span.args` | CHARBUF | comma-separated list of the span's arguments.
`span.arg` | CHARBUF | one of the span arguments, specified by name or by 0-based offset. E.g. 'span.arg.xxx' or 'span.arg[1]'. You can use a negative offset to pick elements from the end of the tag list. For example, 'span.arg[-1]' returns the last argument.
`span.enterargs` | CHARBUF | comma-separated list of the span's enter tracer event arguments. For enter tracers, this is the same as evt.args. For exit tracers, this is the evt.args of the corresponding enter tracer.
`span.enterarg` | CHARBUF | one of the span's enter arguments, specified by name or by 0-based offset. For enter tracer events, this is the same as evt.arg. For exit tracer events, this is the evt.arg of the corresponding enter event.
`span.duration` | RELTIME | delta between this span's exit tracer event and the enter tracer event.
`span.duration.human` | CHARBUF | delta between this span's exit tracer event and the enter event, as a human readable string (e.g. 10.3ms).

### Field Class: evtin

Fields used if information about distributed tracing is available.

Name | Type | Description
:----|:-----|:-----------
`evtin.span.id` | INT64 | accepts all the events that are between the enter and exit tracers of the spans with the given ID and are generated by the same thread that generated the tracers.
`evtin.span.ntags` | UINT32 | accepts all the events that are between the enter and exit tracers of the spans with the given number of tags and are generated by the same thread that generated the tracers.
`evtin.span.nargs` | UINT32 | accepts all the events that are between the enter and exit tracers of the spans with the given number of arguments and are generated by the same thread that generated the tracers.
`evtin.span.tags` | CHARBUF | accepts all the events that are between the enter and exit tracers of the spans with the given tags and are generated by the same thread that generated the tracers.
`evtin.span.tag` | CHARBUF | accepts all the events that are between the enter and exit tracers of the spans with the given tag and are generated by the same thread that generated the tracers. See the description of span.tag for information about the syntax accepted by this field.
`evtin.span.args` | CHARBUF | accepts all the events that are between the enter and exit tracers of the spans with the given arguments and are generated by the same thread that generated the tracers.
`evtin.span.arg` | CHARBUF | accepts all the events that are between the enter and exit tracers of the spans with the given argument and are generated by the same thread that generated the tracers. See the description of span.arg for information about the syntax accepted by this field.
`evtin.span.p.id` | INT64 | same as evtin.span.id, but also accepts events generated by other threads in the same process that produced the span.
`evtin.span.p.ntags` | UINT32 | same as evtin.span.ntags, but also accepts events generated by other threads in the same process that produced the span.
`evtin.span.p.nargs` | UINT32 | same as evtin.span.nargs, but also accepts events generated by other threads in the same process that produced the span.
`evtin.span.p.tags` | CHARBUF | same as evtin.span.tags, but also accepts events generated by other threads in the same process that produced the span.
`evtin.span.p.tag` | CHARBUF | same as evtin.span.tag, but also accepts events generated by other threads in the same process that produced the span.
`evtin.span.p.args` | CHARBUF | same as evtin.span.args, but also accepts events generated by other threads in the same process that produced the span.
`evtin.span.p.arg` | CHARBUF | same as evtin.span.arg, but also accepts events generated by other threads in the same process that produced the span.
`evtin.span.s.id` | INT64 | same as evtin.span.id, but also accepts events generated by the script that produced the span, i.e. by the processes whose parent PID is the same as the one of the process generating the span.
`evtin.span.s.ntags` | UINT32 | same as evtin.span.id, but also accepts events generated by the script that produced the span, i.e. by the processes whose parent PID is the same as the one of the process generating the span.
`evtin.span.s.nargs` | UINT32 | same as evtin.span.id, but also accepts events generated by the script that produced the span, i.e. by the processes whose parent PID is the same as the one of the process generating the span.
`evtin.span.s.tags` | CHARBUF | same as evtin.span.id, but also accepts events generated by the script that produced the span, i.e. by the processes whose parent PID is the same as the one of the process generating the span.
`evtin.span.s.tag` | CHARBUF | same as evtin.span.id, but also accepts events generated by the script that produced the span, i.e. by the processes whose parent PID is the same as the one of the process generating the span.
`evtin.span.s.args` | CHARBUF | same as evtin.span.id, but also accepts events generated by the script that produced the span, i.e. by the processes whose parent PID is the same as the one of the process generating the span.
`evtin.span.s.arg` | CHARBUF | same as evtin.span.id, but also accepts events generated by the script that produced the span, i.e. by the processes whose parent PID is the same as the one of the process generating the span.
`evtin.span.m.id` | INT64 | same as evtin.span.id, but accepts all the events generated on the machine during the span, including other threads and other processes.
`evtin.span.m.ntags` | UINT32 | same as evtin.span.id, but accepts all the events generated on the machine during the span, including other threads and other processes.
`evtin.span.m.nargs` | UINT32 | same as evtin.span.id, but accepts all the events generated on the machine during the span, including other threads and other processes.
`evtin.span.m.tags` | CHARBUF | same as evtin.span.id, but accepts all the events generated on the machine during the span, including other threads and other processes.
`evtin.span.m.tag` | CHARBUF | same as evtin.span.id, but accepts all the events generated on the machine during the span, including other threads and other processes.
`evtin.span.m.args` | CHARBUF | same as evtin.span.id, but accepts all the events generated on the machine during the span, including other threads and other processes.
`evtin.span.m.arg` | CHARBUF | same as evtin.span.id, but accepts all the events generated on the machine during the span, including other threads and other processes.
