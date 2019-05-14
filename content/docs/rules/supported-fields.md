---
title: Supported Fields for Rule Conditions
weight: 3
---

# Introduction

Here are the fields supported by Falco. You can also see this set of fields via `falco --list=<source>`, with `<source>` being one of the sources below.

# System Calls (source `syscall`)

`syscall` event source fields are provided by the [kernel module](../event-sources/kernel-module/). These fields are identical to the [Sysdig filter fields](https://github.com/draios/sysdig/wiki/Sysdig-User-Guide#all-supported-filters) that can be used to filter Sysdig captures.

```
# System Kernel Fields
$ falco --list=syscall``
```

## `fd` Field Class

Fields for File Descriptors. Includes networking as well as file/directory fields.

```
fd.num          the unique number identifying the file descriptor.
fd.type         type of FD. Can be 'file', 'directory', 'ipv4', 'ipv6', 'unix',
                 'pipe', 'event', 'signalfd', 'eventpoll', 'inotify' or 'signal
                fd'.
fd.typechar     type of FD as a single character. Can be 'f' for file, 4 for IP
                v4 socket, 6 for IPv6 socket, 'u' for unix socket, p for pipe, 
                'e' for eventfd, 's' for signalfd, 'l' for eventpoll, 'i' for i
                notify, 'o' for unknown.
fd.name         FD full name. If the fd is a file, this field contains the full
                 path. If the FD is a socket, this field contain the connection
                 tuple.
fd.directory    If the fd is a file, the directory that contains it.
fd.filename     If the fd is a file, the filename without the path.
fd.ip           (FILTER ONLY) matches the ip address (client or server) of the 
                fd.
fd.cip          client IP address.
fd.sip          server IP address.
fd.lip          local IP address.
fd.rip          remote IP address.
fd.port         (FILTER ONLY) matches the port (either client or server) of the
                 fd.
fd.cport        for TCP/UDP FDs, the client port.
fd.sport        for TCP/UDP FDs, server port.
fd.lport        for TCP/UDP FDs, the local port.
fd.rport        for TCP/UDP FDs, the remote port.
fd.l4proto      the IP protocol of a socket. Can be 'tcp', 'udp', 'icmp' or 'ra
                w'.
fd.sockfamily   the socket family for socket events. Can be 'ip' or 'unix'.
fd.is_server    'true' if the process owning this FD is the server endpoint in 
                the connection.
fd.uid          a unique identifier for the FD, created by chaining the FD numb
                er and the thread ID.
fd.containername
                chaining of the container ID and the FD name. Useful when tryin
                g to identify which container an FD belongs to.
fd.containerdirectory
                chaining of the container ID and the directory name. Useful whe
                n trying to identify which container a directory belongs to.
fd.proto        (FILTER ONLY) matches the protocol (either client or server) of
                 the fd.
fd.cproto       for TCP/UDP FDs, the client protocol.
fd.sproto       for TCP/UDP FDs, server protocol.
fd.lproto       for TCP/UDP FDs, the local protocol.
fd.rproto       for TCP/UDP FDs, the remote protocol.
fd.net          (FILTER ONLY) matches the IP network (client or server) of the 
                fd.
fd.cnet         (FILTER ONLY) matches the client IP network of the fd.
fd.snet         (FILTER ONLY) matches the server IP network of the fd.
fd.lnet         (FILTER ONLY) matches the local IP network of the fd.
fd.rnet         (FILTER ONLY) matches the remote IP network of the fd.
fd.connected    for TCP/UDP FDs, 'true' if the socket is connected.
fd.name_changed True when an event changes the name of an fd used by this event
                . This can occur in some cases such as udp connections where th
                e connection tuple changes.
fd.cip.name     Domain name associated with the client IP address.
fd.sip.name     Domain name associated with the server IP address.
fd.lip.name     Domain name associated with the local IP address.
fd.rip.name     Domain name associated with the remote IP address.
fd.dev          device number (major/minor) containing the referenced file
fd.dev.major    major device number containing the referenced file
fd.dev.minor    minor device number containing the referenced file
```

## `proc` & `thread` Field Class 

Fields for running or spawned processes or threads.

```
Field Class: process

proc.pid        the id of the process generating the event.
proc.exe        the first command line argument (usually the executable name or
                 a custom one).
proc.name       the name (excluding the path) of the executable generating the 
                event.
proc.args       the arguments passed on the command line when starting the proc
                ess generating the event.
proc.env        the environment variables of the process generating the event.
proc.cmdline    full process command line, i.e. proc.name + proc.args.
proc.exeline    full process command line, with exe as first argument, i.e. pro
                c.exe + proc.args.
proc.cwd        the current working directory of the event.
proc.nthreads   the number of threads that the process generating the event cur
                rently has, including the main process thread.
proc.nchilds    the number of child threads that the process generating the eve
                nt currently has. This excludes the main process thread.
proc.ppid       the pid of the parent of the process generating the event.
proc.pname      the name (excluding the path) of the parent of the process gene
                rating the event.
proc.pcmdline   the full command line (proc.name + proc.args) of the parent of 
                the process generating the event.
proc.apid       the pid of one of the process ancestors. E.g. proc.apid[1] retu
                rns the parent pid, proc.apid[2] returns the grandparent pid, a
                nd so on. proc.apid[0] is the pid of the current process. proc.
                apid without arguments can be used in filters only and matches 
                any of the process ancestors, e.g. proc.apid=1234.
proc.aname      the name (excluding the path) of one of the process ancestors. 
                E.g. proc.aname[1] returns the parent name, proc.aname[2] retur
                ns the grandparent name, and so on. proc.aname[0] is the name o
                f the current process. proc.aname without arguments can be used
                 in filters only and matches any of the process ancestors, e.g.
                 proc.aname=bash.
proc.loginshellid
                the pid of the oldest shell among the ancestors of the current 
                process, if there is one. This field can be used to separate di
                fferent user sessions, and is useful in conjunction with chisel
                s like spy_user.
proc.duration   number of nanoseconds since the process started.
proc.fdopencount
                number of open FDs for the process
proc.fdlimit    maximum number of FDs the process can open.
proc.fdusage    the ratio between open FDs and maximum available FDs for the pr
                ocess.
proc.vmsize     total virtual memory for the process (as kb).
proc.vmrss      resident non-swapped memory for the process (as kb).
proc.vmswap     swapped memory for the process (as kb).
thread.pfmajor  number of major page faults since thread start.
thread.pfminor  number of minor page faults since thread start.
thread.tid      the id of the thread generating the event.
thread.ismain   'true' if the thread generating the event is the main one in th
                e process.
thread.exectime CPU time spent by the last scheduled thread, in nanoseconds. Ex
                ported by switch events only.
thread.totexectime
                Total CPU time, in nanoseconds since the beginning of the captu
                re, for the current thread. Exported by switch events only.
thread.cgroups  all the cgroups the thread belongs to, aggregated into a single
                 string.
thread.cgroup   the cgroup the thread belongs to, for a specific subsystem. E.g
                . thread.cgroup.cpuacct.
thread.vtid     the id of the thread generating the event as seen from its curr
                ent PID namespace.
proc.vpid       the id of the process generating the event as seen from its cur
                rent PID namespace.
thread.cpu      the CPU consumed by the thread in the last second.
thread.cpu.user the user CPU consumed by the thread in the last second.
thread.cpu.system
                the system CPU consumed by the thread in the last second.
thread.vmsize   For the process main thread, this is the total virtual memory f
                or the process (as kb). For the other threads, this field is ze
                ro.
thread.vmrss    For the process main thread, this is the resident non-swapped m
                emory for the process (as kb). For the other threads, this fiel
                d is zero.
proc.sid        the session id of the process generating the event.
proc.sname      the name of the current process's session leader. This is eithe
                r the process with pid=proc.sid or the eldest ancestor that has
                 the same sid as the current process.
proc.tty        The controlling terminal of the process. 0 for processes withou
                t a terminal.
proc.exepath    The full executable path of the process.
proc.vpgid      the process group id of the process generating the event, as se
                en from its current PID namespace.
proc.is_container_healthcheck
                true if this process is running as a part of the container's he
                alth check.
```

## `evt` Field Class

Fields for system call events. Use `evt.type` to specify the system call name. At least one `evt` field is required per Falco `syscall` rule. 

```
evt.num         event number.
evt.time        event timestamp as a time string that includes the nanosecond p
                art.
evt.time.s      event timestamp as a time string with no nanoseconds.
evt.time.iso8601
                event timestamp in ISO 8601 format, including nanoseconds and t
                ime zone offset (in UTC).
evt.datetime    event timestamp as a time string that includes the date.
evt.rawtime     absolute event timestamp, i.e. nanoseconds from epoch.
evt.rawtime.s   integer part of the event timestamp (e.g. seconds since epoch).
evt.rawtime.ns  fractional part of the absolute event timestamp.
evt.reltime     number of nanoseconds from the beginning of the capture.
evt.reltime.s   number of seconds from the beginning of the capture.
evt.reltime.ns  fractional part (in ns) of the time from the beginning of the c
                apture.
evt.latency     delta between an exit event and the correspondent enter event, 
                in nanoseconds.
evt.latency.s   integer part of the event latency delta.
evt.latency.ns  fractional part of the event latency delta.
evt.latency.human
                delta between an exit event and the correspondent enter event, 
                as a human readable string (e.g. 10.3ms).
evt.deltatime   delta between this event and the previous event, in nanoseconds
                .
evt.deltatime.s integer part of the delta between this event and the previous e
                vent.
evt.deltatime.ns
                fractional part of the delta between this event and the previou
                s event.
evt.outputtime  this depends on -t param, default is %evt.time ('h').
evt.dir         event direction can be either '>' for enter events or '<' for e
                xit events.
evt.type        The name of the event (e.g. 'open').
evt.type.is     allows one to specify an event type, and returns 1 for events t
                hat are of that type. For example, evt.type.is.open returns 1 f
                or open events, 0 for any other event.
syscall.type    For system call events, the name of the system call (e.g. 'open
                '). Unset for other events (e.g. switch or sysdig internal even
                ts). Use this field instead of evt.type if you need to make sur
                e that the filtered/printed value is actually a system call.
evt.category    The event category. Example values are 'file' (for file operati
                ons like open and close), 'net' (for network operations like so
                cket and bind), memory (for things like brk or mmap), and so on
                .
evt.cpu         number of the CPU where this event happened.
evt.args        all the event arguments, aggregated into a single string.
evt.arg         one of the event arguments specified by name or by number. Some
                 events (e.g. return codes or FDs) will be converted into a tex
                t representation when possible. E.g. 'evt.arg.fd' or 'evt.arg[0
                ]'.
evt.rawarg      one of the event arguments specified by name. E.g. 'evt.rawarg.
                fd'.
evt.info        for most events, this field returns the same value as evt.args.
                 However, for some events (like writes to /dev/log) it provides
                 higher level information coming from decoding the arguments.
evt.buffer      the binary data buffer for events that have one, like read(), r
                ecvfrom(), etc. Use this field in filters with 'contains' to se
                arch into I/O data buffers.
evt.buflen      the length of the binary data buffer for events that have one, 
                like read(), recvfrom(), etc.
evt.res         event return value, as a string. If the event failed, the resul
                t is an error code string (e.g. 'ENOENT'), otherwise the result
                 is the string 'SUCCESS'.
evt.rawres      event return value, as a number (e.g. -2). Useful for range com
                parisons.
evt.failed      'true' for events that returned an error status.
evt.is_io       'true' for events that read or write to FDs, like read(), send,
                 recvfrom(), etc.
evt.is_io_read  'true' for events that read from FDs, like read(), recv(), recv
                from(), etc.
evt.is_io_write 'true' for events that write to FDs, like write(), send(), etc.
evt.io_dir      'r' for events that read from FDs, like read(); 'w' for events 
                that write to FDs, like write().
evt.is_wait     'true' for events that make the thread wait, e.g. sleep(), sele
                ct(), poll().
evt.wait_latency
                for events that make the thread wait (e.g. sleep(), select(), p
                oll()), this is the time spent waiting for the event to return,
                 in nanoseconds.
evt.is_syslog   'true' for events that are writes to /dev/log.
evt.count       This filter field always returns 1 and can be used to count eve
                nts from inside chisels.
evt.count.error This filter field returns 1 for events that returned with an er
                ror, and can be used to count event failures from inside chisel
                s.
evt.count.error.file
                This filter field returns 1 for events that returned with an er
                ror and are related to file I/O, and can be used to count event
                 failures from inside chisels.
evt.count.error.net
                This filter field returns 1 for events that returned with an er
                ror and are related to network I/O, and can be used to count ev
                ent failures from inside chisels.
evt.count.error.memory
                This filter field returns 1 for events that returned with an er
                ror and are related to memory allocation, and can be used to co
                unt event failures from inside chisels.
evt.count.error.other
                This filter field returns 1 for events that returned with an er
                ror and are related to none of the previous categories, and can
                 be used to count event failures from inside chisels.
evt.count.exit  This filter field returns 1 for exit events, and can be used to
                 count single events from inside chisels.
evt.around      (FILTER ONLY) Accepts the event if it's around the specified ti
                me interval. The syntax is evt.around[T]=D, where T is the valu
                e returned by %evt.rawtime for the event and D is a delta in mi
                lliseconds. For example, evt.around[1404996934793590564]=1000 w
                ill return the events with timestamp with one second before the
                 timestamp and one second after it, for a total of two seconds 
                of capture.
evt.abspath     Absolute path calculated from dirfd and name during syscalls li
                ke renameat and symlinkat. Use 'evt.abspath.src' or 'evt.abspat
                h.dst' for syscalls that support multiple paths.
evt.is_open_read
                'true' for open/openat events where the path was opened for rea
                ding
evt.is_open_write
                'true' for open/openat events where the path was opened for wri
                ting
```

## `user` Field Class

Fields related to the user executing the event. 

```
user.uid        user ID.
user.name       user name.
user.homedir    home directory of the user.
user.shell      user's shell.
user.loginuid   audit user id (auid).
user.loginname  audit user name (auid).
```

## `group` Field Class

Fields related to the group of the user executing the event.

```
group.gid       group ID.
group.name      group name.
```

## `syslog` Field Class

Fields related to messages sent to syslog. Allows rules to be created based on syslog messages.

```
syslog.facility.str
                facility as a string.
syslog.facility facility as a number (0-23).
syslog.severity.str
                severity as a string. Can have one of these values: emerg, aler
                t, crit, err, warn, notice, info, debug
syslog.severity severity as a number (0-7).
syslog.message  message sent to syslog.
```

## `container` Field Class

Fields related to containers. Allows for filtering based on `container.name`, `container.image`, etc.
```
container.id    the container id.
container.name  the container name.
container.image the container image name (e.g. sysdig/sysdig:latest for docker,
                 ).
container.image.id
                the container image id (e.g. 6f7e2741b66b).
container.type  the container type, eg: docker or rkt
container.privileged
                true for containers running as privileged, false otherwise
container.mounts
                A space-separated list of mount information. Each item in the l
                ist has the format <source>:<dest>:<mode>:<rdrw>:<propagation>
container.mount Information about a single mount, specified by number (e.g. con
                tainer.mount[0]) or mount source (container.mount[/usr/local]).
                 The pathname can be a glob (container.mount[/usr/local/*]), in
                 which case the first matching mount will be returned. The info
                rmation has the format <source>:<dest>:<mode>:<rdrw>:<propagati
                on>. If there is no mount with the specified index or matching 
                the provided source, returns the string "none" instead of a NUL
                L value.
container.mount.source
                the mount source, specified by number (e.g. container.mount.sou
                rce[0]) or mount destination (container.mount.source[/host/lib/
                modules]). The pathname can be a glob.
container.mount.dest
                the mount destination, specified by number (e.g. container.moun
                t.dest[0]) or mount source (container.mount.dest[/lib/modules])
                . The pathname can be a glob.
container.mount.mode
                the mount mode, specified by number (e.g. container.mount.mode[
                0]) or mount source (container.mount.mode[/usr/local]). The pat
                hname can be a glob.
container.mount.rdwr
                the mount rdwr value, specified by number (e.g. container.mount
                .rdwr[0]) or mount source (container.mount.rdwr[/usr/local]). T
                he pathname can be a glob.
container.mount.propagation
                the mount propagation value, specified by number (e.g. containe
                r.mount.propagation[0]) or mount source (container.mount.propag
                ation[/usr/local]). The pathname can be a glob.
container.image.repository
                the container image repository (e.g. sysdig/sysdig).
container.image.tag
                the container image tag (e.g. stable, latest).
container.image.digest
                the container image registry digest (e.g. sha256:d977378f890d44
                5c15e51795296e4e5062f109ce6da83e0a355fc4ad8699d27).
container.healthcheck
                The container's health check. Will be the null value ("N/A") if
                 no healthcheck configured, "NONE" if configured but explicitly
                 not created, and the healthcheck command line otherwise
```

## `k8s` Field Class

Fields to filter on Kubernetes metadata. Allows rules to apply to particular namespaces (`k8s.ns.name`) or a resource's labels.

```
k8s.pod.name    Kubernetes pod name.
k8s.pod.id      Kubernetes pod id.
k8s.pod.label   Kubernetes pod label. E.g. 'k8s.pod.label.foo'.
k8s.pod.labels  Kubernetes pod comma-separated key/value labels. E.g. 'foo1:bar
                1,foo2:bar2'.
k8s.rc.name     Kubernetes replication controller name.
k8s.rc.id       Kubernetes replication controller id.
k8s.rc.label    Kubernetes replication controller label. E.g. 'k8s.rc.label.foo
                '.
k8s.rc.labels   Kubernetes replication controller comma-separated key/value lab
                els. E.g. 'foo1:bar1,foo2:bar2'.
k8s.svc.name    Kubernetes service name (can return more than one value, concat
                enated).
k8s.svc.id      Kubernetes service id (can return more than one value, concaten
                ated).
k8s.svc.label   Kubernetes service label. E.g. 'k8s.svc.label.foo' (can return 
                more than one value, concatenated).
k8s.svc.labels  Kubernetes service comma-separated key/value labels. E.g. 'foo1
                :bar1,foo2:bar2'.
k8s.ns.name     Kubernetes namespace name.
k8s.ns.id       Kubernetes namespace id.
k8s.ns.label    Kubernetes namespace label. E.g. 'k8s.ns.label.foo'.
k8s.ns.labels   Kubernetes namespace comma-separated key/value labels. E.g. 'fo
                o1:bar1,foo2:bar2'.
k8s.rs.name     Kubernetes replica set name.
k8s.rs.id       Kubernetes replica set id.
k8s.rs.label    Kubernetes replica set label. E.g. 'k8s.rs.label.foo'.
k8s.rs.labels   Kubernetes replica set comma-separated key/value labels. E.g. '
                foo1:bar1,foo2:bar2'.
k8s.deployment.name
                Kubernetes deployment name.
k8s.deployment.id
                Kubernetes deployment id.
k8s.deployment.label
                Kubernetes deployment label. E.g. 'k8s.rs.label.foo'.
k8s.deployment.labels
                Kubernetes deployment comma-separated key/value labels. E.g. 'f
                oo1:bar1,foo2:bar2'.
```

## `mesos` Field Class

Fields to filter on Mesosphere metadata such as application name, task, etc.

```
mesos.task.name Mesos task name.
mesos.task.id   Mesos task id.
mesos.task.label
                Mesos task label. E.g. 'mesos.task.label.foo'.
mesos.task.labels
                Mesos task comma-separated key/value labels. E.g. 'foo1:bar1,fo
                o2:bar2'.
mesos.framework.name
                Mesos framework name.
mesos.framework.id
                Mesos framework id.
marathon.app.name
                Marathon app name.
marathon.app.id Marathon app id.
marathon.app.label
                Marathon app label. E.g. 'marathon.app.label.foo'.
marathon.app.labels
                Marathon app comma-separated key/value labels. E.g. 'foo1:bar1,
                foo2:bar2'.
marathon.group.name
                Marathon group name.
marathon.group.id
                Marathon group id.
```

# Kubernetes Audit Events (source `k8s_audit`)

Kubernetes Audit event fields are supported by the Kubernetes Audit event source. For more information please refer to the [Kubernetes Audit event source](../event-sources/kubernetes-audit/) documentation.

```
# Kubernetes Audit event Fields
$ falco --list=k8s_audit``
```

## `jevt` Field Class: generic ways to access json events
```
jevt.time       json event timestamp as a string that includes the nanosecond p
                art
jevt.rawtime    absolute event timestamp, i.e. nanoseconds from epoch.
jevt.value      General way to access single property from json object. The syn
                tax is [<json pointer expression>]. The property is returned as
                 a string
jevt.obj        The entire json object, stringified
```

## `ka` Field Class: Access K8s Audit Log Events
```
ka.auditid      The unique id of the audit event
ka.stage        Stage of the request (e.g. RequestReceived, ResponseComplete, e
                tc.)
ka.auth.decision
                The authorization decision
ka.auth.reason  The authorization reason
ka.user.name    The user name performing the request
ka.user.groups  The groups to which the user belongs
ka.impuser.name The impersonated user name
ka.verb         The action being performed
ka.uri          The request URI as sent from client to server
ka.uri.param    The value of a given query parameter in the uri (e.g. when uri=
                /foo?key=val, ka.uri.param[key] is val).
ka.target.name  The target object name
ka.target.namespace
                The target object namespace
ka.target.resource
                The target object resource
ka.target.subresource
                The target object subresource
ka.req.binding.subjects
                When the request object refers to a cluster role binding, the s
                ubject (e.g. account/users) being linked by the binding
ka.req.binding.subject.has_name
                When the request object refers to a cluster role binding, retur
                n true if a subject with the provided name exists
ka.req.binding.role
                When the request object refers to a cluster role binding, the r
                ole being linked by the binding
ka.req.configmap.name
                If the request object refers to a configmap, the configmap name
ka.req.configmap.obj
                If the request object refers to a configmap, the entire configm
                ap object
ka.req.container.image
                When the request object refers to a container, the container's
                images. Can be indexed (e.g. ka.req.container.image[0]). Withou
                t any index, returns the first image
ka.req.container.image.repository
                The same as req.container.image, but only the repository part (
                e.g. sysdig/falco)
ka.req.container.host_network
                When the request object refers to a container, the value of the
                 hostNetwork flag.
ka.req.container.privileged
                When the request object refers to a container, whether or not a
                ny container is run privileged. With an index, return whether o
                r not the ith container is run privileged.
ka.req.role.rules
                When the request object refers to a role/cluster role, the rule
                s associated with the role
ka.req.role.rules.apiGroups
                When the request object refers to a role/cluster role, the api
                groups associated with the role's rules. With an index, return
                only the api groups from the ith rule. Without an index, return
                 all api groups concatenated
ka.req.role.rules.nonResourceURLs
                When the request object refers to a role/cluster role, the non
                resource urls associated with the role's rules. With an index,
                return only the non resource urls from the ith rule. Without an
                 index, return all non resource urls concatenated
ka.req.role.rules.verbs
                When the request object refers to a role/cluster role, the verb
                s associated with the role's rules. With an index, return only
                the verbs from the ith rule. Without an index, return all verbs
                 concatenated
ka.req.role.rules.resources
                When the request object refers to a role/cluster role, the reso
                urces associated with the role's rules. With an index, return o
                nly the resources from the ith rule. Without an index, return a
                ll resources concatenated
ka.req.service.type
                When the request object refers to a service, the service type
ka.req.service.ports
                When the request object refers to a service, the service's port
                s. Can be indexed (e.g. ka.req.service.ports[0]). Without any i
                ndex, returns all ports
ka.req.volume.hostpath
                If the request object contains volume definitions, whether or n
                ot a hostPath volume exists that mounts the specified path from
                 the host (...hostpath[/etc]=true if a volume mounts /etc from
                the host). The index can be a glob, in which case all volumes a
                re considered to find any path matching the specified glob (...
                hostpath[/usr/*] would match either /usr/local or /usr/bin)
ka.resp.name    The response object name
ka.response.code
                The response code
ka.response.reason
                The response reason (usually present only for failures)
```
