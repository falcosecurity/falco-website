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
`evt.pluginname` | CHARBUF | if the event comes from a plugin-defined event source, the name of the plugin that generated it. The plugin must be currently loaded.
`evt.plugininfo` | CHARBUF | if the event comes from a plugin-defined event source, a summary of the event as formatted by the plugin. The plugin must be currently loaded.
`evt.source` | CHARBUF | the name of the source that produced the event.
`evt.is_async` | BOOL | 'true' for asynchronous events, 'false' otherwise.
`evt.asynctype` | CHARBUF | If the event is asynchronous, the type of the event (e.g. 'container').
`evt.hostname` | CHARBUF | The hostname of the underlying host can be customized by setting an environment variable (e.g. FALCO_HOSTNAME for the Falco agent). This is valuable in Kubernetes setups, where the hostname can match the pod name particularly in DaemonSet deployments. To achieve this, assign Kubernetes' spec.nodeName to the environment variable. Notably, spec.nodeName generally includes the cluster name.

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
`evt.is_open_read` | BOOL | 'true' for open/openat/openat2/open_by_handle_at events where the path was opened for reading
`evt.is_open_write` | BOOL | 'true' for open/openat/openat2/open_by_handle_at events where the path was opened for writing
`evt.is_open_exec` | BOOL | 'true' for open/openat/openat2/open_by_handle_at or creat events where a file is created with execute permissions
`evt.is_open_create` | BOOL | 'true' for for open/openat/openat2/open_by_handle_at events where a file is created.

### Field Class: process

Additional information about the process and thread executing the syscall event.


Name | Type | Description
:----|:-----|:-----------
`proc.exe` | CHARBUF | The first command line argument argv[0] (truncated after 4096 bytes) which is usually the executable name but it could be also a custom string, it depends on what the user specifies. This field is collected from the syscalls args or, as a fallback, extracted from /proc/<pid>/cmdline.
`proc.pexe` | CHARBUF | The proc.exe (first command line argument argv[0]) of the parent process.
`proc.aexe` | CHARBUF | The proc.exe (first command line argument argv[0]) for a specific process ancestor. You can access different levels of ancestors by using indices. For example, proc.aexe[1] retrieves the proc.exe of the parent process, proc.aexe[2] retrieves the proc.exe of the grandparent process, and so on. The current process's proc.exe line can be obtained using proc.aexe[0]. When used without any arguments, proc.aexe is applicable only in filters and matches any of the process ancestors. For instance, you can use `proc.aexe endswith java` to match any process ancestor whose proc.exe ends with the term `java`.
`proc.exepath` | CHARBUF | The full executable path of the process (it could be truncated after 1024 bytes if read from '/proc'). This field is collected directly from the kernel or, as a fallback, extracted resolving the path of /proc/<pid>/exe, so symlinks are resolved. If you are using eBPF drivers this path could be truncated due to verifier complexity limits. (legacy eBPF kernel version < 5.2) truncated after 24 path components. (legacy eBPF kernel version >= 5.2) truncated after 48 path components. (modern eBPF kernel) truncated after 96 path components.
`proc.pexepath` | CHARBUF | The proc.exepath (full executable path) of the parent process.
`proc.aexepath` | CHARBUF | The proc.exepath (full executable path) for a specific process ancestor. You can access different levels of ancestors by using indices. For example, proc.aexepath[1] retrieves the proc.exepath of the parent process, proc.aexepath[2] retrieves the proc.exepath of the grandparent process, and so on. The current process's proc.exepath line can be obtained using proc.aexepath[0]. When used without any arguments, proc.aexepath is applicable only in filters and matches any of the process ancestors. For instance, you can use `proc.aexepath endswith java` to match any process ancestor whose path ends with the term `java`.
`proc.name` | CHARBUF | The process name (truncated after 16 characters) generating the event (task->comm). This field is collected from the syscalls args or, as a fallback, extracted from /proc/<pid>/status. The name of the process and the name of the executable file on disk (if applicable) can be different if a process is given a custom name which is often the case for example for java applications.
`proc.pname` | CHARBUF | The proc.name truncated after 16 characters) of the process generating the event.
`proc.aname` | CHARBUF | The proc.name (truncated after 16 characters) for a specific process ancestor. You can access different levels of ancestors by using indices. For example, proc.aname[1] retrieves the proc.name of the parent process, proc.aname[2] retrieves the proc.name of the grandparent process, and so on. The current process's proc.name line can be obtained using proc.aname[0]. When used without any arguments, proc.aname is applicable only in filters and matches any of the process ancestors. For instance, you can use `proc.aname=bash` to match any process ancestor whose name is `bash`.
`proc.args` | CHARBUF | The arguments passed on the command line when starting the process generating the event excluding argv[0] (truncated after 4096 bytes). This field is collected from the syscalls args or, as a fallback, extracted from /proc/<pid>/cmdline.
`proc.cmdline` | CHARBUF | The concatenation of `proc.name + proc.args` (truncated after 4096 bytes) when starting the process generating the event.
`proc.pcmdline` | CHARBUF | The proc.cmdline (full command line (proc.name + proc.args)) of the parent of the process generating the event.
`proc.acmdline` | CHARBUF | The full command line (proc.name + proc.args) for a specific process ancestor. You can access different levels of ancestors by using indices. For example, proc.acmdline[1] retrieves the full command line of the parent process, proc.acmdline[2] retrieves the proc.cmdline of the grandparent process, and so on. The current process's full command line can be obtained using proc.acmdline[0].  When used without any arguments, proc.acmdline is applicable only in filters and matches any of the process ancestors. For instance, you can use `proc.acmdline contains base64` to match any process ancestor whose command line contains the term base64.
`proc.cmdnargs` | UINT64 | The number of command line args (proc.args).
`proc.cmdlenargs` | UINT64 | The total count of characters / length of the comamnd line args (proc.args) combined excluding whitespaces between args.
`proc.exeline` | CHARBUF | The full command line, with exe as first argument (proc.exe + proc.args) when starting the process generating the event.
`proc.env` | CHARBUF | The environment variables of the process generating the event.
`proc.cwd` | CHARBUF | The current working directory of the event.
`proc.loginshellid` | INT64 | The pid of the oldest shell among the ancestors of the current process, if there is one. This field can be used to separate different user sessions, and is useful in conjunction with chisels like spy_user.
`proc.tty` | UINT32 | The controlling terminal of the process. 0 for processes without a terminal.
`proc.pid` | INT64 | The id of the process generating the event.
`proc.ppid` | INT64 | The pid of the parent of the process generating the event.
`proc.apid` | INT64 | The pid for a specific process ancestor. You can access different levels of ancestors by using indices. For example, proc.apid[1] retrieves the pid of the parent process, proc.apid[2] retrieves the pid of the grandparent process, and so on. The current process's pid can be obtained using proc.apid[0].  When used without any arguments, proc.acmdline is applicable only in filters and matches any of the process ancestors. For instance, you can use `proc.apid=1337` to match any process ancestor whose pid is equal to 1337.
`proc.vpid` | INT64 | The id of the process generating the event as seen from its current PID namespace.
`proc.pvpid` | INT64 | The id of the parent process generating the event as seen from its current PID namespace.
`proc.sid` | INT64 | The session id of the process generating the event.
`proc.sname` | CHARBUF | The name of the current process's session leader. This is either the process with pid=proc.sid or the eldest ancestor that has the same sid as the current process.
`proc.sid.exe` | CHARBUF | The first command line argument argv[0] (usually the executable name or a custom one) of the current process's session leader. This is either the process with pid=proc.sid or the eldest ancestor that has the same sid as the current process.
`proc.sid.exepath` | CHARBUF | The full executable path of the current process's session leader. This is either the process with pid=proc.sid or the eldest ancestor that has the same sid as the current process.
`proc.vpgid` | INT64 | The process group id of the process generating the event, as seen from its current PID namespace.
`proc.vpgid.name` | CHARBUF | The name of the current process's process group leader. This is either the process with proc.vpgid == proc.vpid or the eldest ancestor that has the same vpgid as the current process. The description of `proc.is_vpgid_leader` offers additional insights.
`proc.vpgid.exe` | CHARBUF | The first command line argument argv[0] (usually the executable name or a custom one) of the current process's process group leader. This is either the process with proc.vpgid == proc.vpid or the eldest ancestor that has the same vpgid as the current process. The description of `proc.is_vpgid_leader` offers additional insights.
`proc.vpgid.exepath` | CHARBUF | The full executable path of the current process's process group leader. This is either the process with proc.vpgid == proc.vpid or the eldest ancestor that has the same vpgid as the current process. The description of `proc.is_vpgid_leader` offers additional insights.
`proc.duration` | RELTIME | Number of nanoseconds since the process started.
`proc.ppid.duration` | RELTIME | Number of nanoseconds since the parent process started.
`proc.pid.ts` | RELTIME | Start of process as epoch timestamp in nanoseconds.
`proc.ppid.ts` | RELTIME | Start of parent process as epoch timestamp in nanoseconds.
`proc.is_exe_writable` | BOOL | 'true' if this process' executable file is writable by the same user that spawned the process.
`proc.is_exe_upper_layer` | BOOL | 'true' if this process' executable file is in upper layer in overlayfs. This field value can only be trusted if the underlying kernel version is greater or equal than 3.18.0, since overlayfs was introduced at that time.
`proc.is_exe_from_memfd` | BOOL | 'true' if the executable file of the current process is an anonymous file created using memfd_create() and is being executed by referencing its file descriptor (fd). This type of file exists only in memory and not on disk. Relevant to detect malicious in-memory code injection. Requires kernel version greater or equal to 3.17.0.
`proc.is_sid_leader` | BOOL | 'true' if this process is the leader of the process session, proc.sid == proc.vpid. For host processes vpid reflects pid.
`proc.is_vpgid_leader` | BOOL | 'true' if this process is the leader of the virtual process group, proc.vpgid == proc.vpid. For host processes vpgid and vpid reflect pgid and pid. Can help to distinguish if the process was 'directly' executed for instance in a tty (similar to bash history logging, `is_vpgid_leader` would be 'true') or executed as descendent process in the same process group which for example is the case when subprocesses are spawned from a script (`is_vpgid_leader` would be 'false').
`proc.exe_ino` | INT64 | The inode number of the executable file on disk. Can be correlated with fd.ino.
`proc.exe_ino.ctime` | ABSTIME | Last status change time of executable file (inode->ctime) as epoch timestamp in nanoseconds. Time is changed by writing or by setting inode information e.g. owner, group, link count, mode etc.
`proc.exe_ino.mtime` | ABSTIME | Last modification time of executable file (inode->mtime) as epoch timestamp in nanoseconds. Time is changed by file modifications, e.g. by mknod, truncate, utime, write of more than zero bytes etc. For tracking changes in owner, group, link count or mode, use proc.exe_ino.ctime instead.
`proc.exe_ino.ctime_duration_proc_start` | ABSTIME | Number of nanoseconds between modifying status of executable image and spawning a new process using the changed executable image.
`proc.exe_ino.ctime_duration_pidns_start` | ABSTIME | Number of nanoseconds between PID namespace start ts and ctime exe file if PID namespace start predates ctime.
`proc.pidns_init_start_ts` | UINT64 | Start of PID namespace (container or non container pid namespace) as epoch timestamp in nanoseconds.
`thread.cap_permitted` | CHARBUF | The permitted capabilities set
`thread.cap_inheritable` | CHARBUF | The inheritable capabilities set
`thread.cap_effective` | CHARBUF | The effective capabilities set
`proc.is_container_healthcheck` | BOOL | 'true' if this process is running as a part of the container's health check.
`proc.is_container_liveness_probe` | BOOL | 'true' if this process is running as a part of the container's liveness probe.
`proc.is_container_readiness_probe` | BOOL | 'true' if this process is running as a part of the container's readiness probe.
`proc.fdopencount` | UINT64 | Number of open FDs for the process
`proc.fdlimit` | INT64 | Maximum number of FDs the process can open.
`proc.fdusage` | DOUBLE | The ratio between open FDs and maximum available FDs for the process.
`proc.vmsize` | UINT64 | Total virtual memory for the process (as kb).
`proc.vmrss` | UINT64 | Resident non-swapped memory for the process (as kb).
`proc.vmswap` | UINT64 | Swapped memory for the process (as kb).
`thread.pfmajor` | UINT64 | Number of major page faults since thread start.
`thread.pfminor` | UINT64 | Number of minor page faults since thread start.
`thread.tid` | INT64 | The id of the thread generating the event.
`thread.ismain` | BOOL | 'true' if the thread generating the event is the main one in the process.
`thread.vtid` | INT64 | The id of the thread generating the event as seen from its current PID namespace.
`thread.exectime` | RELTIME | CPU time spent by the last scheduled thread, in nanoseconds. Exported by switch events only.
`thread.totexectime` | RELTIME | Total CPU time, in nanoseconds since the beginning of the capture, for the current thread. Exported by switch events only.
`thread.cgroups` | CHARBUF | All cgroups the thread belongs to, aggregated into a single string.
`thread.cgroup` | CHARBUF | The cgroup the thread belongs to, for a specific subsystem. e.g. thread.cgroup.cpuacct.
`proc.nthreads` | UINT64 | The number of alive threads that the process generating the event currently has, including the leader thread. Please note that the leader thread may not be here, in that case 'proc.nthreads' and 'proc.nchilds' are equal
`proc.nchilds` | UINT64 | The number of alive not leader threads that the process generating the event currently has. This excludes the leader thread.
`thread.cpu` | DOUBLE | The CPU consumed by the thread in the last second.
`thread.cpu.user` | DOUBLE | The user CPU consumed by the thread in the last second.
`thread.cpu.system` | DOUBLE | The system CPU consumed by the thread in the last second.
`thread.vmsize` | UINT64 | For the process main thread, this is the total virtual memory for the process (as kb). For the other threads, this field is zero.
`thread.vmrss` | UINT64 | For the process main thread, this is the resident non-swapped memory for the process (as kb). For the other threads, this field is zero.

### Field Class: user

Information about the user executing the specific event.


Name | Type | Description
:----|:-----|:-----------
`user.uid` | UINT32 | user ID.
`user.name` | CHARBUF | user name.
`user.homedir` | CHARBUF | home directory of the user.
`user.shell` | CHARBUF | user's shell.
`user.loginuid` | INT64 | audit user id (auid), internally the loginuid is of type `uint32_t`. However, if an invalid uid corresponding to UINT32_MAX is encountered, it is returned as -1 to support familiar filtering conditions.
`user.loginname` | CHARBUF | audit user name (auid).

### Field Class: group

Information about the user group.


Name | Type | Description
:----|:-----|:-----------
`group.gid` | UINT32 | group ID.
`group.name` | CHARBUF | group name.

### Field Class: container

Container information. If the event is not happening inside a container, both id and name will be set to 'host'.


Name | Type | Description
:----|:-----|:-----------
`container.id` | CHARBUF | The truncated container id (first 12 characters).
`container.name` | CHARBUF | The container name.
`container.image` | CHARBUF | The container image name (e.g. falcosecurity/falco:latest for docker).
`container.image.id` | CHARBUF | The container image id (e.g. 6f7e2741b66b).
`container.type` | CHARBUF | The container type, eg: docker or rkt
`container.privileged` | BOOL | 'true' for containers running as privileged, false otherwise
`container.mounts` | CHARBUF | A space-separated list of mount information. Each item in the list has the format <source>:<dest>:<mode>:<rdrw>:<propagation>
`container.mount` | CHARBUF | Information about a single mount, specified by number (e.g. container.mount[0]) or mount source (container.mount[/usr/local]). The pathname can be a glob (container.mount[/usr/local/*]), in which case the first matching mount will be returned. The information has the format <source>:<dest>:<mode>:<rdrw>:<propagation>. If there is no mount with the specified index or matching the provided source, returns the string "none" instead of a NULL value.
`container.mount.source` | CHARBUF | The mount source, specified by number (e.g. container.mount.source[0]) or mount destination (container.mount.source[/host/lib/modules]). The pathname can be a glob.
`container.mount.dest` | CHARBUF | The mount destination, specified by number (e.g. container.mount.dest[0]) or mount source (container.mount.dest[/lib/modules]). The pathname can be a glob.
`container.mount.mode` | CHARBUF | The mount mode, specified by number (e.g. container.mount.mode[0]) or mount source (container.mount.mode[/usr/local]). The pathname can be a glob.
`container.mount.rdwr` | CHARBUF | The mount rdwr value, specified by number (e.g. container.mount.rdwr[0]) or mount source (container.mount.rdwr[/usr/local]). The pathname can be a glob.
`container.mount.propagation` | CHARBUF | The mount propagation value, specified by number (e.g. container.mount.propagation[0]) or mount source (container.mount.propagation[/usr/local]). The pathname can be a glob.
`container.image.repository` | CHARBUF | The container image repository (e.g. falcosecurity/falco).
`container.image.tag` | CHARBUF | The container image tag (e.g. stable, latest).
`container.image.digest` | CHARBUF | The container image registry digest (e.g. sha256:d977378f890d445c15e51795296e4e5062f109ce6da83e0a355fc4ad8699d27).
`container.healthcheck` | CHARBUF | The container's health check. Will be the null value ("N/A") if no healthcheck configured, "NONE" if configured but explicitly not created, and the healthcheck command line otherwise
`container.liveness_probe` | CHARBUF | The container's liveness probe. Will be the null value ("N/A") if no liveness probe configured, the liveness probe command line otherwise
`container.readiness_probe` | CHARBUF | The container's readiness probe. Will be the null value ("N/A") if no readiness probe configured, the readiness probe command line otherwise
`container.start_ts` | UINT64 | Container start as epoch timestamp in nanoseconds based on proc.pidns_init_start_ts.
`container.duration` | RELTIME | Number of nanoseconds since container.start_ts.
`container.ip` | CHARBUF | The container's / pod's primary ip address as retrieved from the container engine. Only ipv4 addresses are tracked. Consider container.cni.json (CRI use case) for logging ip addresses for each network interface.
`container.cni.json` | CHARBUF | The container's / pod's CNI result field from the respective pod status info. It contains ip addresses for each network interface exposed as unparsed escaped JSON string. Supported for CRI container engine (containerd, cri-o runtimes), optimized for containerd (some non-critical JSON keys removed). Useful for tracking ips (ipv4 and ipv6, dual-stack support) for each network interface (multi-interface support).

### Field Class: fd

Every syscall that has a file descriptor in its arguments has these fields set with information related to the file.


Name | Type | Description
:----|:-----|:-----------
`fd.num` | INT64 | the unique number identifying the file descriptor.
`fd.type` | CHARBUF | type of FD. Can be 'file', 'directory', 'ipv4', 'ipv6', 'unix', 'pipe', 'event', 'signalfd', 'eventpoll', 'inotify'  'signalfd' or 'memfd'.
`fd.typechar` | CHARBUF | type of FD as a single character. Can be 'f' for file, 4 for IPv4 socket, 6 for IPv6 socket, 'u' for unix socket, p for pipe, 'e' for eventfd, 's' for signalfd, 'l' for eventpoll, 'i' for inotify, 'b' for bpf, 'u' for userfaultd, 'r' for io_uring, 'm' for memfd ,'o' for unknown.
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
`fd.ino` | INT64 | inode number of the referenced file
`fd.nameraw` | CHARBUF | FD full name raw. Just like fd.name, but only used if fd is a file path. File path is kept raw with limited sanitization and without deriving the absolute path.
`fd.types` | CHARBUF | List of FD types in used. Can be passed an fd number e.g. fd.types[0] to get the type of stdout as a single item list.

### Field Class: fs.path

Every syscall that has a filesystem path in its arguments has these fields set with information related to the path arguments. This differs from the fd.* fields as it includes syscalls like unlink, rename, etc. that act directly on filesystem paths as compared to opened file descriptors.


Name | Type | Description
:----|:-----|:-----------
`fs.path.name` | CHARBUF | For any event type that deals with a filesystem path, the path the file syscall is operating on. This path is always fully resolved, prepending the thread cwd when needed.
`fs.path.nameraw` | CHARBUF | For any event type that deals with a filesystem path, the path the file syscall is operating on. This path is always the path provided to the syscall and may not be fully resolved.
`fs.path.source` | CHARBUF | For any event type that deals with a filesystem path, and specifically for a source and target like mv, cp, etc, the source path the file syscall is operating on. This path is always fully resolved, prepending the thread cwd when needed.
`fs.path.sourceraw` | CHARBUF | For any event type that deals with a filesystem path, and specifically for a source and target like mv, cp, etc, the source path the file syscall is operating on. This path is always the path provided to the syscall and may not be fully resolved.
`fs.path.target` | CHARBUF | For any event type that deals with a filesystem path, and specifically for a target and target like mv, cp, etc, the target path the file syscall is operating on. This path is always fully resolved, prepending the thread cwd when needed.
`fs.path.targetraw` | CHARBUF | For any event type that deals with a filesystem path, and specifically for a target and target like mv, cp, etc, the target path the file syscall is operating on. This path is always the path provided to the syscall and may not be fully resolved.

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

Kubernetes related context. When configured to fetch from the API server, all fields are available. Otherwise, only the `k8s.pod.*` and `k8s.ns.name` fields are populated with data gathered from the container runtime.


Name | Type | Description
:----|:-----|:-----------
`k8s.pod.name` | CHARBUF | Kubernetes pod name.
`k8s.pod.id` | CHARBUF | Kubernetes pod id.
`k8s.pod.label` | CHARBUF | Kubernetes pod label. E.g. 'k8s.pod.label.foo'.
`k8s.pod.labels` | CHARBUF | Kubernetes pod comma-separated key/value labels. E.g. 'foo1:bar1,foo2:bar2'.
`k8s.pod.ip` | CHARBUF | Kubernetes pod ip, same as container.ip field as each container in a pod shares the network stack of the sandbox / pod. Only ipv4 addresses are tracked. Consider k8s.pod.cni.json for logging ip addresses for each network interface.
`k8s.pod.cni.json` | CHARBUF | Kubernetes pod CNI result field from the respective pod status info, same as container.cni.json field. It contains ip addresses for each network interface exposed as unparsed escaped JSON string. Supported for CRI container engine (containerd, cri-o runtimes), optimized for containerd (some non-critical JSON keys removed). Useful for tracking ips (ipv4 and ipv6, dual-stack support) for each network interface (multi-interface support).
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

