*Schema Version*: 2.0.0
## Syscall events

Default | Dir | Name | Args 
:-------|:----|:-----|:-----
Yes | `>` | `open` | FSPATH **name**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*, UINT32 **mode**
Yes | `<` | `open` | FD **fd**, FSPATH **name**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*, UINT32 **mode**, UINT32 **dev**, UINT64 **ino**
Yes | `>` | `close` | FD **fd**
Yes | `<` | `close` | ERRNO **res**
No | `>` | `read` | FD **fd**, UINT32 **size**
No | `<` | `read` | ERRNO **res**, BYTEBUF **data**
No | `>` | `write` | FD **fd**, UINT32 **size**
No | `<` | `write` | ERRNO **res**, BYTEBUF **data**
Yes | `>` | `socket` | ENUMFLAGS32 **domain**: *AF_NFC*, *AF_ALG*, *AF_CAIF*, *AF_IEEE802154*, *AF_PHONET*, *AF_ISDN*, *AF_RXRPC*, *AF_IUCV*, *AF_BLUETOOTH*, *AF_TIPC*, *AF_CAN*, *AF_LLC*, *AF_WANPIPE*, *AF_PPPOX*, *AF_IRDA*, *AF_SNA*, *AF_RDS*, *AF_ATMSVC*, *AF_ECONET*, *AF_ASH*, *AF_PACKET*, *AF_ROUTE*, *AF_NETLINK*, *AF_KEY*, *AF_SECURITY*, *AF_NETBEUI*, *AF_DECnet*, *AF_ROSE*, *AF_INET6*, *AF_X25*, *AF_ATMPVC*, *AF_BRIDGE*, *AF_NETROM*, *AF_APPLETALK*, *AF_IPX*, *AF_AX25*, *AF_INET*, *AF_LOCAL*, *AF_UNIX*, *AF_UNSPEC*, UINT32 **type**, UINT32 **proto**
Yes | `<` | `socket` | FD **fd**
Yes | `>` | `bind` | FD **fd**
Yes | `<` | `bind` | ERRNO **res**, SOCKADDR **addr**
Yes | `>` | `connect` | FD **fd**, SOCKADDR **addr**
Yes | `<` | `connect` | ERRNO **res**, SOCKTUPLE **tuple**, FD **fd**
Yes | `>` | `listen` | FD **fd**, UINT32 **backlog**
Yes | `<` | `listen` | ERRNO **res**
No | `>` | `send` | FD **fd**, UINT32 **size**
No | `<` | `send` | ERRNO **res**, BYTEBUF **data**
Yes | `>` | `sendto` | FD **fd**, UINT32 **size**, SOCKTUPLE **tuple**
Yes | `<` | `sendto` | ERRNO **res**, BYTEBUF **data**
No | `>` | `recv` | FD **fd**, UINT32 **size**
No | `<` | `recv` | ERRNO **res**, BYTEBUF **data**
Yes | `>` | `recvfrom` | FD **fd**, UINT32 **size**
Yes | `<` | `recvfrom` | ERRNO **res**, BYTEBUF **data**, SOCKTUPLE **tuple**
Yes | `>` | `shutdown` | FD **fd**, ENUMFLAGS8 **how**: *SHUT_RDWR*, *SHUT_WR*, *SHUT_RD*
Yes | `<` | `shutdown` | ERRNO **res**
Yes | `>` | `getsockname` | 
Yes | `<` | `getsockname` | 
Yes | `>` | `getpeername` | 
Yes | `<` | `getpeername` | 
Yes | `>` | `socketpair` | ENUMFLAGS32 **domain**: *AF_NFC*, *AF_ALG*, *AF_CAIF*, *AF_IEEE802154*, *AF_PHONET*, *AF_ISDN*, *AF_RXRPC*, *AF_IUCV*, *AF_BLUETOOTH*, *AF_TIPC*, *AF_CAN*, *AF_LLC*, *AF_WANPIPE*, *AF_PPPOX*, *AF_IRDA*, *AF_SNA*, *AF_RDS*, *AF_ATMSVC*, *AF_ECONET*, *AF_ASH*, *AF_PACKET*, *AF_ROUTE*, *AF_NETLINK*, *AF_KEY*, *AF_SECURITY*, *AF_NETBEUI*, *AF_DECnet*, *AF_ROSE*, *AF_INET6*, *AF_X25*, *AF_ATMPVC*, *AF_BRIDGE*, *AF_NETROM*, *AF_APPLETALK*, *AF_IPX*, *AF_AX25*, *AF_INET*, *AF_LOCAL*, *AF_UNIX*, *AF_UNSPEC*, UINT32 **type**, UINT32 **proto**
Yes | `<` | `socketpair` | ERRNO **res**, FD **fd1**, FD **fd2**, UINT64 **source**, UINT64 **peer**
Yes | `>` | `setsockopt` | 
Yes | `<` | `setsockopt` | ERRNO **res**, FD **fd**, ENUMFLAGS8 **level**: *SOL_SOCKET*, *SOL_TCP*, *UNKNOWN*, ENUMFLAGS8 **optname**: *SO_COOKIE*, *SO_MEMINFO*, *SO_PEERGROUPS*, *SO_ATTACH_BPF*, *SO_INCOMING_CPU*, *SO_BPF_EXTENSIONS*, *SO_MAX_PACING_RATE*, *SO_BUSY_POLL*, *SO_SELECT_ERR_QUEUE*, *SO_LOCK_FILTER*, *SO_NOFCS*, *SO_PEEK_OFF*, *SO_WIFI_STATUS*, *SO_RXQ_OVFL*, *SO_DOMAIN*, *SO_PROTOCOL*, *SO_TIMESTAMPING*, *SO_MARK*, *SO_TIMESTAMPNS*, *SO_PASSSEC*, *SO_PEERSEC*, *SO_ACCEPTCONN*, *SO_TIMESTAMP*, *SO_PEERNAME*, *SO_DETACH_FILTER*, *SO_ATTACH_FILTER*, *SO_BINDTODEVICE*, *SO_SECURITY_ENCRYPTION_NETWORK*, *SO_SECURITY_ENCRYPTION_TRANSPORT*, *SO_SECURITY_AUTHENTICATION*, *SO_SNDTIMEO*, *SO_RCVTIMEO*, *SO_SNDLOWAT*, *SO_RCVLOWAT*, *SO_PEERCRED*, *SO_PASSCRED*, *SO_REUSEPORT*, *SO_BSDCOMPAT*, *SO_LINGER*, *SO_PRIORITY*, *SO_NO_CHECK*, *SO_OOBINLINE*, *SO_KEEPALIVE*, *SO_RCVBUFFORCE*, *SO_SNDBUFFORCE*, *SO_RCVBUF*, *SO_SNDBUF*, *SO_BROADCAST*, *SO_DONTROUTE*, *SO_ERROR*, *SO_TYPE*, *SO_REUSEADDR*, *SO_DEBUG*, *UNKNOWN*, DYNAMIC **val**, UINT32 **optlen**
Yes | `>` | `getsockopt` | 
Yes | `<` | `getsockopt` | ERRNO **res**, FD **fd**, ENUMFLAGS8 **level**: *SOL_SOCKET*, *SOL_TCP*, *UNKNOWN*, ENUMFLAGS8 **optname**: *SO_COOKIE*, *SO_MEMINFO*, *SO_PEERGROUPS*, *SO_ATTACH_BPF*, *SO_INCOMING_CPU*, *SO_BPF_EXTENSIONS*, *SO_MAX_PACING_RATE*, *SO_BUSY_POLL*, *SO_SELECT_ERR_QUEUE*, *SO_LOCK_FILTER*, *SO_NOFCS*, *SO_PEEK_OFF*, *SO_WIFI_STATUS*, *SO_RXQ_OVFL*, *SO_DOMAIN*, *SO_PROTOCOL*, *SO_TIMESTAMPING*, *SO_MARK*, *SO_TIMESTAMPNS*, *SO_PASSSEC*, *SO_PEERSEC*, *SO_ACCEPTCONN*, *SO_TIMESTAMP*, *SO_PEERNAME*, *SO_DETACH_FILTER*, *SO_ATTACH_FILTER*, *SO_BINDTODEVICE*, *SO_SECURITY_ENCRYPTION_NETWORK*, *SO_SECURITY_ENCRYPTION_TRANSPORT*, *SO_SECURITY_AUTHENTICATION*, *SO_SNDTIMEO*, *SO_RCVTIMEO*, *SO_SNDLOWAT*, *SO_RCVLOWAT*, *SO_PEERCRED*, *SO_PASSCRED*, *SO_REUSEPORT*, *SO_BSDCOMPAT*, *SO_LINGER*, *SO_PRIORITY*, *SO_NO_CHECK*, *SO_OOBINLINE*, *SO_KEEPALIVE*, *SO_RCVBUFFORCE*, *SO_SNDBUFFORCE*, *SO_RCVBUF*, *SO_SNDBUF*, *SO_BROADCAST*, *SO_DONTROUTE*, *SO_ERROR*, *SO_TYPE*, *SO_REUSEADDR*, *SO_DEBUG*, *UNKNOWN*, DYNAMIC **val**, UINT32 **optlen**
Yes | `>` | `sendmsg` | FD **fd**, UINT32 **size**, SOCKTUPLE **tuple**
Yes | `<` | `sendmsg` | ERRNO **res**, BYTEBUF **data**
No | `>` | `sendmmsg` | 
No | `<` | `sendmmsg` | 
Yes | `>` | `recvmsg` | FD **fd**
Yes | `<` | `recvmsg` | ERRNO **res**, UINT32 **size**, BYTEBUF **data**, SOCKTUPLE **tuple**
No | `>` | `recvmmsg` | 
No | `<` | `recvmmsg` | 
Yes | `>` | `creat` | FSPATH **name**, UINT32 **mode**
Yes | `<` | `creat` | FD **fd**, FSPATH **name**, UINT32 **mode**, UINT32 **dev**, UINT64 **ino**
Yes | `>` | `pipe` | 
Yes | `<` | `pipe` | ERRNO **res**, FD **fd1**, FD **fd2**, UINT64 **ino**
Yes | `>` | `eventfd` | UINT64 **initval**, FLAGS32 **flags**
Yes | `<` | `eventfd` | FD **res**
Yes | `>` | `futex` | UINT64 **addr**, ENUMFLAGS16 **op**: *FUTEX_CLOCK_REALTIME*, *FUTEX_PRIVATE_FLAG*, *FUTEX_CMP_REQUEUE_PI*, *FUTEX_WAIT_REQUEUE_PI*, *FUTEX_WAKE_BITSET*, *FUTEX_WAIT_BITSET*, *FUTEX_TRYLOCK_PI*, *FUTEX_UNLOCK_PI*, *FUTEX_LOCK_PI*, *FUTEX_WAKE_OP*, *FUTEX_CMP_REQUEUE*, *FUTEX_REQUEUE*, *FUTEX_FD*, *FUTEX_WAKE*, *FUTEX_WAIT*, UINT64 **val**
Yes | `<` | `futex` | ERRNO **res**
Yes | `>` | `stat` | 
Yes | `<` | `stat` | ERRNO **res**, FSPATH **path**
Yes | `>` | `lstat` | 
Yes | `<` | `lstat` | ERRNO **res**, FSPATH **path**
Yes | `>` | `fstat` | FD **fd**
Yes | `<` | `fstat` | ERRNO **res**
Yes | `>` | `stat64` | 
Yes | `<` | `stat64` | ERRNO **res**, FSPATH **path**
Yes | `>` | `lstat64` | 
Yes | `<` | `lstat64` | ERRNO **res**, FSPATH **path**
Yes | `>` | `fstat64` | FD **fd**
Yes | `<` | `fstat64` | ERRNO **res**
Yes | `>` | `epoll_wait` | ERRNO **maxevents**
Yes | `<` | `epoll_wait` | ERRNO **res**
Yes | `>` | `poll` | FDLIST **fds**, INT64 **timeout**
Yes | `<` | `poll` | ERRNO **res**, FDLIST **fds**
Yes | `>` | `select` | 
Yes | `<` | `select` | ERRNO **res**
Yes | `>` | `lseek` | FD **fd**, UINT64 **offset**, ENUMFLAGS8 **whence**: *SEEK_END*, *SEEK_CUR*, *SEEK_SET*
Yes | `<` | `lseek` | ERRNO **res**
Yes | `>` | `llseek` | FD **fd**, UINT64 **offset**, ENUMFLAGS8 **whence**: *SEEK_END*, *SEEK_CUR*, *SEEK_SET*
Yes | `<` | `llseek` | ERRNO **res**
Yes | `>` | `getcwd` | 
Yes | `<` | `getcwd` | ERRNO **res**, CHARBUF **path**
Yes | `>` | `chdir` | 
Yes | `<` | `chdir` | ERRNO **res**, CHARBUF **path**
Yes | `>` | `fchdir` | FD **fd**
Yes | `<` | `fchdir` | ERRNO **res**
No | `>` | `pread` | FD **fd**, UINT32 **size**, UINT64 **pos**
No | `<` | `pread` | ERRNO **res**, BYTEBUF **data**
No | `>` | `pwrite` | FD **fd**, UINT32 **size**, UINT64 **pos**
No | `<` | `pwrite` | ERRNO **res**, BYTEBUF **data**
No | `>` | `readv` | FD **fd**
No | `<` | `readv` | ERRNO **res**, UINT32 **size**, BYTEBUF **data**
No | `>` | `writev` | FD **fd**, UINT32 **size**
No | `<` | `writev` | ERRNO **res**, BYTEBUF **data**
No | `>` | `preadv` | FD **fd**, UINT64 **pos**
No | `<` | `preadv` | ERRNO **res**, UINT32 **size**, BYTEBUF **data**
No | `>` | `pwritev` | FD **fd**, UINT32 **size**, UINT64 **pos**
No | `<` | `pwritev` | ERRNO **res**, BYTEBUF **data**
Yes | `>` | `signalfd` | FD **fd**, UINT32 **mask**, FLAGS8 **flags**
Yes | `<` | `signalfd` | FD **res**
Yes | `>` | `kill` | PID **pid**, SIGTYPE **sig**
Yes | `<` | `kill` | ERRNO **res**
Yes | `>` | `tkill` | PID **tid**, SIGTYPE **sig**
Yes | `<` | `tkill` | ERRNO **res**
Yes | `>` | `tgkill` | PID **pid**, PID **tid**, SIGTYPE **sig**
Yes | `<` | `tgkill` | ERRNO **res**
Yes | `>` | `nanosleep` | RELTIME **interval**
Yes | `<` | `nanosleep` | ERRNO **res**
Yes | `>` | `timerfd_create` | UINT8 **clockid**, FLAGS8 **flags**
Yes | `<` | `timerfd_create` | FD **res**
Yes | `>` | `inotify_init` | FLAGS8 **flags**
Yes | `<` | `inotify_init` | FD **res**
Yes | `>` | `getrlimit` | ENUMFLAGS8 **resource**: *RLIMIT_UNKNOWN*, *RLIMIT_RTTIME*, *RLIMIT_RTPRIO*, *RLIMIT_NICE*, *RLIMIT_MSGQUEUE*, *RLIMIT_SIGPENDING*, *RLIMIT_LOCKS*, *RLIMIT_AS*, *RLIMIT_MEMLOCK*, *RLIMIT_NOFILE*, *RLIMIT_NPROC*, *RLIMIT_RSS*, *RLIMIT_CORE*, *RLIMIT_STACK*, *RLIMIT_DATA*, *RLIMIT_FSIZE*, *RLIMIT_CPU*
Yes | `<` | `getrlimit` | ERRNO **res**, INT64 **cur**, INT64 **max**
Yes | `>` | `setrlimit` | ENUMFLAGS8 **resource**: *RLIMIT_UNKNOWN*, *RLIMIT_RTTIME*, *RLIMIT_RTPRIO*, *RLIMIT_NICE*, *RLIMIT_MSGQUEUE*, *RLIMIT_SIGPENDING*, *RLIMIT_LOCKS*, *RLIMIT_AS*, *RLIMIT_MEMLOCK*, *RLIMIT_NOFILE*, *RLIMIT_NPROC*, *RLIMIT_RSS*, *RLIMIT_CORE*, *RLIMIT_STACK*, *RLIMIT_DATA*, *RLIMIT_FSIZE*, *RLIMIT_CPU*
Yes | `<` | `setrlimit` | ERRNO **res**, INT64 **cur**, INT64 **max**
Yes | `>` | `prlimit` | PID **pid**, ENUMFLAGS8 **resource**: *RLIMIT_UNKNOWN*, *RLIMIT_RTTIME*, *RLIMIT_RTPRIO*, *RLIMIT_NICE*, *RLIMIT_MSGQUEUE*, *RLIMIT_SIGPENDING*, *RLIMIT_LOCKS*, *RLIMIT_AS*, *RLIMIT_MEMLOCK*, *RLIMIT_NOFILE*, *RLIMIT_NPROC*, *RLIMIT_RSS*, *RLIMIT_CORE*, *RLIMIT_STACK*, *RLIMIT_DATA*, *RLIMIT_FSIZE*, *RLIMIT_CPU*
Yes | `<` | `prlimit` | ERRNO **res**, INT64 **newcur**, INT64 **newmax**, INT64 **oldcur**, INT64 **oldmax**
Yes | `>` | `fcntl` | FD **fd**, ENUMFLAGS8 **cmd**: *F_GETPIPE_SZ*, *F_SETPIPE_SZ*, *F_NOTIFY*, *F_DUPFD_CLOEXEC*, *F_CANCELLK*, *F_GETLEASE*, *F_SETLEASE*, *F_GETOWN_EX*, *F_SETOWN_EX*, *F_SETLKW64*, *F_SETLK64*, *F_GETLK64*, *F_GETSIG*, *F_SETSIG*, *F_GETOWN*, *F_SETOWN*, *F_SETLKW*, *F_SETLK*, *F_GETLK*, *F_SETFL*, *F_GETFL*, *F_SETFD*, *F_GETFD*, *F_DUPFD*, *F_OFD_GETLK*, *F_OFD_SETLK*, *F_OFD_SETLKW*, *UNKNOWN*
Yes | `<` | `fcntl` | FD **res**
Yes | `>` | `brk` | UINT64 **addr**
Yes | `<` | `brk` | UINT64 **res**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**
Yes | `>` | `mmap` | UINT64 **addr**, UINT64 **length**, FLAGS32 **prot**: *PROT_READ*, *PROT_WRITE*, *PROT_EXEC*, *PROT_SEM*, *PROT_GROWSDOWN*, *PROT_GROWSUP*, *PROT_SAO*, *PROT_NONE*, FLAGS32 **flags**: *MAP_SHARED*, *MAP_PRIVATE*, *MAP_FIXED*, *MAP_ANONYMOUS*, *MAP_32BIT*, *MAP_RENAME*, *MAP_NORESERVE*, *MAP_POPULATE*, *MAP_NONBLOCK*, *MAP_GROWSDOWN*, *MAP_DENYWRITE*, *MAP_EXECUTABLE*, *MAP_INHERIT*, *MAP_FILE*, *MAP_LOCKED*, FD **fd**, UINT64 **offset**
Yes | `<` | `mmap` | ERRNO **res**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**
Yes | `>` | `mmap2` | UINT64 **addr**, UINT64 **length**, FLAGS32 **prot**: *PROT_READ*, *PROT_WRITE*, *PROT_EXEC*, *PROT_SEM*, *PROT_GROWSDOWN*, *PROT_GROWSUP*, *PROT_SAO*, *PROT_NONE*, FLAGS32 **flags**: *MAP_SHARED*, *MAP_PRIVATE*, *MAP_FIXED*, *MAP_ANONYMOUS*, *MAP_32BIT*, *MAP_RENAME*, *MAP_NORESERVE*, *MAP_POPULATE*, *MAP_NONBLOCK*, *MAP_GROWSDOWN*, *MAP_DENYWRITE*, *MAP_EXECUTABLE*, *MAP_INHERIT*, *MAP_FILE*, *MAP_LOCKED*, FD **fd**, UINT64 **pgoffset**
Yes | `<` | `mmap2` | ERRNO **res**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**
Yes | `>` | `munmap` | UINT64 **addr**, UINT64 **length**
Yes | `<` | `munmap` | ERRNO **res**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**
Yes | `>` | `splice` | FD **fd_in**, FD **fd_out**, UINT64 **size**, FLAGS32 **flags**: *SPLICE_F_MOVE*, *SPLICE_F_NONBLOCK*, *SPLICE_F_MORE*, *SPLICE_F_GIFT*
Yes | `<` | `splice` | ERRNO **res**
Yes | `>` | `ptrace` | ENUMFLAGS16 **request**: *PTRACE_SINGLEBLOCK*, *PTRACE_SYSEMU_SINGLESTEP*, *PTRACE_SYSEMU*, *PTRACE_ARCH_PRCTL*, *PTRACE_SET_THREAD_AREA*, *PTRACE_GET_THREAD_AREA*, *PTRACE_OLDSETOPTIONS*, *PTRACE_SETFPXREGS*, *PTRACE_GETFPXREGS*, *PTRACE_SETFPREGS*, *PTRACE_GETFPREGS*, *PTRACE_SETREGS*, *PTRACE_GETREGS*, *PTRACE_SETSIGMASK*, *PTRACE_GETSIGMASK*, *PTRACE_PEEKSIGINFO*, *PTRACE_LISTEN*, *PTRACE_INTERRUPT*, *PTRACE_SEIZE*, *PTRACE_SETREGSET*, *PTRACE_GETREGSET*, *PTRACE_SETSIGINFO*, *PTRACE_GETSIGINFO*, *PTRACE_GETEVENTMSG*, *PTRACE_SETOPTIONS*, *PTRACE_SYSCALL*, *PTRACE_DETACH*, *PTRACE_ATTACH*, *PTRACE_SINGLESTEP*, *PTRACE_KILL*, *PTRACE_CONT*, *PTRACE_POKEUSR*, *PTRACE_POKEDATA*, *PTRACE_POKETEXT*, *PTRACE_PEEKUSR*, *PTRACE_PEEKDATA*, *PTRACE_PEEKTEXT*, *PTRACE_TRACEME*, *PTRACE_UNKNOWN*, PID **pid**
Yes | `<` | `ptrace` | ERRNO **res**, DYNAMIC **addr**, DYNAMIC **data**
Yes | `>` | `ioctl` | FD **fd**, UINT64 **request**, UINT64 **argument**
Yes | `<` | `ioctl` | ERRNO **res**
Yes | `>` | `rename` | 
Yes | `<` | `rename` | ERRNO **res**, FSPATH **oldpath**, FSPATH **newpath**
Yes | `>` | `renameat` | 
Yes | `<` | `renameat` | ERRNO **res**, FD **olddirfd**, FSRELPATH **oldpath**, FD **newdirfd**, FSRELPATH **newpath**
Yes | `>` | `symlink` | 
Yes | `<` | `symlink` | ERRNO **res**, CHARBUF **target**, FSPATH **linkpath**
Yes | `>` | `symlinkat` | 
Yes | `<` | `symlinkat` | ERRNO **res**, CHARBUF **target**, FD **linkdirfd**, FSRELPATH **linkpath**
No | `>` | `sendfile` | FD **out_fd**, FD **in_fd**, UINT64 **offset**, UINT64 **size**
No | `<` | `sendfile` | ERRNO **res**, UINT64 **offset**
Yes | `>` | `quotactl` | FLAGS16 **cmd**: *Q_QUOTAON*, *Q_QUOTAOFF*, *Q_GETFMT*, *Q_GETINFO*, *Q_SETINFO*, *Q_GETQUOTA*, *Q_SETQUOTA*, *Q_SYNC*, *Q_XQUOTAON*, *Q_XQUOTAOFF*, *Q_XGETQUOTA*, *Q_XSETQLIM*, *Q_XGETQSTAT*, *Q_XQUOTARM*, *Q_XQUOTASYNC*, FLAGS8 **type**: *USRQUOTA*, *GRPQUOTA*, UINT32 **id**, FLAGS8 **quota_fmt**: *QFMT_NOT_USED*, *QFMT_VFS_OLD*, *QFMT_VFS_V0*, *QFMT_VFS_V1*
Yes | `<` | `quotactl` | ERRNO **res**, CHARBUF **special**, CHARBUF **quotafilepath**, UINT64 **dqb_bhardlimit**, UINT64 **dqb_bsoftlimit**, UINT64 **dqb_curspace**, UINT64 **dqb_ihardlimit**, UINT64 **dqb_isoftlimit**, RELTIME **dqb_btime**, RELTIME **dqb_itime**, RELTIME **dqi_bgrace**, RELTIME **dqi_igrace**, FLAGS8 **dqi_flags**: *DQF_NONE*, *V1_DQF_RSQUASH*, FLAGS8 **quota_fmt_out**: *QFMT_NOT_USED*, *QFMT_VFS_OLD*, *QFMT_VFS_V0*, *QFMT_VFS_V1*
Yes | `>` | `setresuid` | UID **ruid**, UID **euid**, UID **suid**
Yes | `<` | `setresuid` | ERRNO **res**
Yes | `>` | `setresgid` | GID **rgid**, GID **egid**, GID **sgid**
Yes | `<` | `setresgid` | ERRNO **res**
Yes | `>` | `setuid` | UID **uid**
Yes | `<` | `setuid` | ERRNO **res**
Yes | `>` | `setgid` | GID **gid**
Yes | `<` | `setgid` | ERRNO **res**
Yes | `>` | `getuid` | 
Yes | `<` | `getuid` | UID **uid**
Yes | `>` | `geteuid` | 
Yes | `<` | `geteuid` | UID **euid**
Yes | `>` | `getgid` | 
Yes | `<` | `getgid` | GID **gid**
Yes | `>` | `getegid` | 
Yes | `<` | `getegid` | GID **egid**
Yes | `>` | `getresuid` | 
Yes | `<` | `getresuid` | ERRNO **res**, UID **ruid**, UID **euid**, UID **suid**
Yes | `>` | `getresgid` | 
Yes | `<` | `getresgid` | ERRNO **res**, GID **rgid**, GID **egid**, GID **sgid**
Yes | `>` | `clone` | 
Yes | `<` | `clone` | PID **res**, CHARBUF **exe**, BYTEBUF **args**, PID **tid**, PID **pid**, PID **ptid**, CHARBUF **cwd**, INT64 **fdlimit**, UINT64 **pgft_maj**, UINT64 **pgft_min**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**, CHARBUF **comm**, BYTEBUF **cgroups**, FLAGS32 **flags**: *CLONE_FILES*, *CLONE_FS*, *CLONE_IO*, *CLONE_NEWIPC*, *CLONE_NEWNET*, *CLONE_NEWNS*, *CLONE_NEWPID*, *CLONE_NEWUTS*, *CLONE_PARENT*, *CLONE_PARENT_SETTID*, *CLONE_PTRACE*, *CLONE_SIGHAND*, *CLONE_SYSVSEM*, *CLONE_THREAD*, *CLONE_UNTRACED*, *CLONE_VM*, *CLONE_INVERTED*, *NAME_CHANGED*, *CLOSED*, *CLONE_NEWUSER*, *CLONE_CHILD_CLEARTID*, *CLONE_CHILD_SETTID*, *CLONE_SETTLS*, *CLONE_STOPPED*, *CLONE_VFORK*, *CLONE_NEWCGROUP*, UINT32 **uid**, UINT32 **gid**, PID **vtid**, PID **vpid**, UINT64 **pidns_init_start_ts**
Yes | `>` | `fork` | 
Yes | `<` | `fork` | PID **res**, CHARBUF **exe**, BYTEBUF **args**, PID **tid**, PID **pid**, PID **ptid**, CHARBUF **cwd**, INT64 **fdlimit**, UINT64 **pgft_maj**, UINT64 **pgft_min**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**, CHARBUF **comm**, BYTEBUF **cgroups**, FLAGS32 **flags**: *CLONE_FILES*, *CLONE_FS*, *CLONE_IO*, *CLONE_NEWIPC*, *CLONE_NEWNET*, *CLONE_NEWNS*, *CLONE_NEWPID*, *CLONE_NEWUTS*, *CLONE_PARENT*, *CLONE_PARENT_SETTID*, *CLONE_PTRACE*, *CLONE_SIGHAND*, *CLONE_SYSVSEM*, *CLONE_THREAD*, *CLONE_UNTRACED*, *CLONE_VM*, *CLONE_INVERTED*, *NAME_CHANGED*, *CLOSED*, *CLONE_NEWUSER*, *CLONE_CHILD_CLEARTID*, *CLONE_CHILD_SETTID*, *CLONE_SETTLS*, *CLONE_STOPPED*, *CLONE_VFORK*, *CLONE_NEWCGROUP*, UINT32 **uid**, UINT32 **gid**, PID **vtid**, PID **vpid**, UINT64 **pidns_init_start_ts**
Yes | `>` | `vfork` | 
Yes | `<` | `vfork` | PID **res**, CHARBUF **exe**, BYTEBUF **args**, PID **tid**, PID **pid**, PID **ptid**, CHARBUF **cwd**, INT64 **fdlimit**, UINT64 **pgft_maj**, UINT64 **pgft_min**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**, CHARBUF **comm**, BYTEBUF **cgroups**, FLAGS32 **flags**: *CLONE_FILES*, *CLONE_FS*, *CLONE_IO*, *CLONE_NEWIPC*, *CLONE_NEWNET*, *CLONE_NEWNS*, *CLONE_NEWPID*, *CLONE_NEWUTS*, *CLONE_PARENT*, *CLONE_PARENT_SETTID*, *CLONE_PTRACE*, *CLONE_SIGHAND*, *CLONE_SYSVSEM*, *CLONE_THREAD*, *CLONE_UNTRACED*, *CLONE_VM*, *CLONE_INVERTED*, *NAME_CHANGED*, *CLOSED*, *CLONE_NEWUSER*, *CLONE_CHILD_CLEARTID*, *CLONE_CHILD_SETTID*, *CLONE_SETTLS*, *CLONE_STOPPED*, *CLONE_VFORK*, *CLONE_NEWCGROUP*, UINT32 **uid**, UINT32 **gid**, PID **vtid**, PID **vpid**, UINT64 **pidns_init_start_ts**
Yes | `>` | `getdents` | FD **fd**
Yes | `<` | `getdents` | ERRNO **res**
Yes | `>` | `getdents64` | FD **fd**
Yes | `<` | `getdents64` | ERRNO **res**
Yes | `>` | `setns` | FD **fd**, FLAGS32 **nstype**: *CLONE_FILES*, *CLONE_FS*, *CLONE_IO*, *CLONE_NEWIPC*, *CLONE_NEWNET*, *CLONE_NEWNS*, *CLONE_NEWPID*, *CLONE_NEWUTS*, *CLONE_PARENT*, *CLONE_PARENT_SETTID*, *CLONE_PTRACE*, *CLONE_SIGHAND*, *CLONE_SYSVSEM*, *CLONE_THREAD*, *CLONE_UNTRACED*, *CLONE_VM*, *CLONE_INVERTED*, *NAME_CHANGED*, *CLOSED*, *CLONE_NEWUSER*, *CLONE_CHILD_CLEARTID*, *CLONE_CHILD_SETTID*, *CLONE_SETTLS*, *CLONE_STOPPED*, *CLONE_VFORK*, *CLONE_NEWCGROUP*
Yes | `<` | `setns` | ERRNO **res**
Yes | `>` | `flock` | FD **fd**, FLAGS32 **operation**: *LOCK_SH*, *LOCK_EX*, *LOCK_NB*, *LOCK_UN*, *LOCK_NONE*
Yes | `<` | `flock` | ERRNO **res**
Yes | `>` | `accept` | 
Yes | `<` | `accept` | FD **fd**, SOCKTUPLE **tuple**, UINT8 **queuepct**, UINT32 **queuelen**, UINT32 **queuemax**
Yes | `>` | `semop` | INT32 **semid**
Yes | `<` | `semop` | ERRNO **res**, UINT32 **nsops**, UINT16 **sem_num_0**, INT16 **sem_op_0**, FLAGS16 **sem_flg_0**: *IPC_NOWAIT*, *SEM_UNDO*, UINT16 **sem_num_1**, INT16 **sem_op_1**, FLAGS16 **sem_flg_1**: *IPC_NOWAIT*, *SEM_UNDO*
Yes | `>` | `semctl` | INT32 **semid**, INT32 **semnum**, FLAGS16 **cmd**: *IPC_STAT*, *IPC_SET*, *IPC_RMID*, *IPC_INFO*, *SEM_INFO*, *SEM_STAT*, *GETALL*, *GETNCNT*, *GETPID*, *GETVAL*, *GETZCNT*, *SETALL*, *SETVAL*, INT32 **val**
Yes | `<` | `semctl` | ERRNO **res**
Yes | `>` | `ppoll` | FDLIST **fds**, RELTIME **timeout**, SIGSET **sigmask**
Yes | `<` | `ppoll` | ERRNO **res**, FDLIST **fds**
Yes | `>` | `mount` | FLAGS32 **flags**: *RDONLY*, *NOSUID*, *NODEV*, *NOEXEC*, *SYNCHRONOUS*, *REMOUNT*, *MANDLOCK*, *DIRSYNC*, *NOATIME*, *NODIRATIME*, *BIND*, *MOVE*, *REC*, *SILENT*, *POSIXACL*, *UNBINDABLE*, *PRIVATE*, *SLAVE*, *SHARED*, *RELATIME*, *KERNMOUNT*, *I_VERSION*, *STRICTATIME*, *LAZYTIME*, *NOSEC*, *BORN*, *ACTIVE*, *NOUSER*
Yes | `<` | `mount` | ERRNO **res**, CHARBUF **dev**, FSPATH **dir**, CHARBUF **type**
Yes | `>` | `semget` | INT32 **key**, INT32 **nsems**, FLAGS32 **semflg**: *IPC_EXCL*, *IPC_CREAT*
Yes | `<` | `semget` | ERRNO **res**
Yes | `>` | `access` | FLAGS32 **mode**: *F_OK*, *R_OK*, *W_OK*, *X_OK*
Yes | `<` | `access` | ERRNO **res**, FSPATH **name**
Yes | `>` | `chroot` | 
Yes | `<` | `chroot` | ERRNO **res**, FSPATH **path**
Yes | `>` | `setsid` | 
Yes | `<` | `setsid` | PID **res**
Yes | `>` | `mkdir` | UINT32 **mode**
Yes | `<` | `mkdir` | ERRNO **res**, FSPATH **path**
Yes | `>` | `rmdir` | 
Yes | `<` | `rmdir` | ERRNO **res**, FSPATH **path**
Yes | `>` | `unshare` | FLAGS32 **flags**: *CLONE_FILES*, *CLONE_FS*, *CLONE_IO*, *CLONE_NEWIPC*, *CLONE_NEWNET*, *CLONE_NEWNS*, *CLONE_NEWPID*, *CLONE_NEWUTS*, *CLONE_PARENT*, *CLONE_PARENT_SETTID*, *CLONE_PTRACE*, *CLONE_SIGHAND*, *CLONE_SYSVSEM*, *CLONE_THREAD*, *CLONE_UNTRACED*, *CLONE_VM*, *CLONE_INVERTED*, *NAME_CHANGED*, *CLOSED*, *CLONE_NEWUSER*, *CLONE_CHILD_CLEARTID*, *CLONE_CHILD_SETTID*, *CLONE_SETTLS*, *CLONE_STOPPED*, *CLONE_VFORK*, *CLONE_NEWCGROUP*
Yes | `<` | `unshare` | ERRNO **res**
Yes | `>` | `execve` | FSPATH **filename**
Yes | `<` | `execve` | ERRNO **res**, CHARBUF **exe**, BYTEBUF **args**, PID **tid**, PID **pid**, PID **ptid**, CHARBUF **cwd**, UINT64 **fdlimit**, UINT64 **pgft_maj**, UINT64 **pgft_min**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**, CHARBUF **comm**, BYTEBUF **cgroups**, BYTEBUF **env**, INT32 **tty**, PID **pgid**, INT32 **loginuid**, FLAGS32 **flags**: *EXE_WRITABLE*, *EXE_UPPER_LAYER*, UINT64 **cap_inheritable**, UINT64 **cap_permitted**, UINT64 **cap_effective**, UINT64 **exe_ino**, ABSTIME **exe_ino_ctime**, ABSTIME **exe_ino_mtime**, INT32 **uid**
Yes | `>` | `setpgid` | PID **pid**, PID **pgid**
Yes | `<` | `setpgid` | PID **res**
Yes | `>` | `seccomp` | UINT64 **op**
Yes | `<` | `seccomp` | ERRNO **res**
Yes | `>` | `unlink` | 
Yes | `<` | `unlink` | ERRNO **res**, FSPATH **path**
Yes | `>` | `unlinkat` | 
Yes | `<` | `unlinkat` | ERRNO **res**, FD **dirfd**, FSRELPATH **name**, FLAGS32 **flags**: *AT_REMOVEDIR*
Yes | `>` | `mkdirat` | 
Yes | `<` | `mkdirat` | ERRNO **res**, FD **dirfd**, FSRELPATH **path**, UINT32 **mode**
Yes | `>` | `openat` | FD **dirfd**, FSRELPATH **name**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*, UINT32 **mode**
Yes | `<` | `openat` | FD **fd**, FD **dirfd**, FSRELPATH **name**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*, UINT32 **mode**, UINT32 **dev**, UINT64 **ino**
Yes | `>` | `link` | 
Yes | `<` | `link` | ERRNO **res**, FSPATH **oldpath**, FSPATH **newpath**
Yes | `>` | `linkat` | 
Yes | `<` | `linkat` | ERRNO **res**, FD **olddir**, FSRELPATH **oldpath**, FD **newdir**, FSRELPATH **newpath**, FLAGS32 **flags**: *AT_SYMLINK_FOLLOW*, *AT_EMPTY_PATH*
Yes | `>` | `fchmodat` | 
Yes | `<` | `fchmodat` | ERRNO **res**, FD **dirfd**, FSRELPATH **filename**, MODE **mode**
Yes | `>` | `chmod` | 
Yes | `<` | `chmod` | ERRNO **res**, FSPATH **filename**, MODE **mode**
Yes | `>` | `fchmod` | 
Yes | `<` | `fchmod` | ERRNO **res**, FD **fd**, MODE **mode**
Yes | `>` | `renameat2` | 
Yes | `<` | `renameat2` | ERRNO **res**, FD **olddirfd**, FSRELPATH **oldpath**, FD **newdirfd**, FSRELPATH **newpath**, FLAGS32 **flags**: *RENAME_NOREPLACE*, *RENAME_EXCHANGE*, *RENAME_WHITEOUT*
Yes | `>` | `userfaultfd` | 
Yes | `<` | `userfaultfd` | ERRNO **res**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*
Yes | `>` | `openat2` | FD **dirfd**, FSRELPATH **name**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*, UINT32 **mode**, FLAGS32 **resolve**: *RESOLVE_BENEATH*, *RESOLVE_IN_ROOT*, *RESOLVE_NO_MAGICLINKS*, *RESOLVE_NO_SYMLINKS*, *RESOLVE_NO_XDEV*, *RESOLVE_CACHED*
Yes | `<` | `openat2` | FD **fd**, FD **dirfd**, FSRELPATH **name**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*, UINT32 **mode**, FLAGS32 **resolve**: *RESOLVE_BENEATH*, *RESOLVE_IN_ROOT*, *RESOLVE_NO_MAGICLINKS*, *RESOLVE_NO_SYMLINKS*, *RESOLVE_NO_XDEV*, *RESOLVE_CACHED*
Yes | `>` | `mprotect` | UINT64 **addr**, UINT64 **length**, FLAGS32 **prot**: *PROT_READ*, *PROT_WRITE*, *PROT_EXEC*, *PROT_SEM*, *PROT_GROWSDOWN*, *PROT_GROWSUP*, *PROT_SAO*, *PROT_NONE*
Yes | `<` | `mprotect` | ERRNO **res**
Yes | `>` | `execveat` | FD **dirfd**, FSRELPATH **pathname**, FLAGS32 **flags**: *AT_EMPTY_PATH*, *AT_SYMLINK_NOFOLLOW*
Yes | `<` | `execveat` | ERRNO **res**, CHARBUF **exe**, BYTEBUF **args**, PID **tid**, PID **pid**, PID **ptid**, CHARBUF **cwd**, UINT64 **fdlimit**, UINT64 **pgft_maj**, UINT64 **pgft_min**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**, CHARBUF **comm**, BYTEBUF **cgroups**, BYTEBUF **env**, INT32 **tty**, PID **pgid**, INT32 **loginuid**, FLAGS32 **flags**: *EXE_WRITABLE*, *EXE_UPPER_LAYER*, UINT64 **cap_inheritable**, UINT64 **cap_permitted**, UINT64 **cap_effective**, UINT64 **exe_ino**, ABSTIME **exe_ino_ctime**, ABSTIME **exe_ino_mtime**, INT32 **uid**
Yes | `>` | `copy_file_range` | FD **fdin**, UINT64 **offin**, UINT64 **len**
Yes | `<` | `copy_file_range` | ERRNO **res**, FD **fdout**, UINT64 **offout**
Yes | `>` | `clone3` | 
Yes | `<` | `clone3` | PID **res**, CHARBUF **exe**, BYTEBUF **args**, PID **tid**, PID **pid**, PID **ptid**, CHARBUF **cwd**, INT64 **fdlimit**, UINT64 **pgft_maj**, UINT64 **pgft_min**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**, CHARBUF **comm**, BYTEBUF **cgroups**, FLAGS32 **flags**: *CLONE_FILES*, *CLONE_FS*, *CLONE_IO*, *CLONE_NEWIPC*, *CLONE_NEWNET*, *CLONE_NEWNS*, *CLONE_NEWPID*, *CLONE_NEWUTS*, *CLONE_PARENT*, *CLONE_PARENT_SETTID*, *CLONE_PTRACE*, *CLONE_SIGHAND*, *CLONE_SYSVSEM*, *CLONE_THREAD*, *CLONE_UNTRACED*, *CLONE_VM*, *CLONE_INVERTED*, *NAME_CHANGED*, *CLOSED*, *CLONE_NEWUSER*, *CLONE_CHILD_CLEARTID*, *CLONE_CHILD_SETTID*, *CLONE_SETTLS*, *CLONE_STOPPED*, *CLONE_VFORK*, *CLONE_NEWCGROUP*, UINT32 **uid**, UINT32 **gid**, PID **vtid**, PID **vpid**, UINT64 **pidns_init_start_ts**
Yes | `>` | `open_by_handle_at` | 
Yes | `<` | `open_by_handle_at` | FD **fd**, FD **mountfd**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*, FSPATH **path**
Yes | `>` | `io_uring_setup` | 
Yes | `<` | `io_uring_setup` | ERRNO **res**, UINT32 **entries**, UINT32 **sq_entries**, UINT32 **cq_entries**, FLAGS32 **flags**: *IORING_SETUP_IOPOLL*, *IORING_SETUP_SQPOLL*, *IORING_SQ_NEED_WAKEUP*, *IORING_SETUP_SQ_AFF*, *IORING_SETUP_CQSIZE*, *IORING_SETUP_CLAMP*, *IORING_SETUP_ATTACH_RW*, *IORING_SETUP_R_DISABLED*, UINT32 **sq_thread_cpu**, UINT32 **sq_thread_idle**, FLAGS32 **features**: *IORING_FEAT_SINGLE_MMAP*, *IORING_FEAT_NODROP*, *IORING_FEAT_SUBMIT_STABLE*, *IORING_FEAT_RW_CUR_POS*, *IORING_FEAT_CUR_PERSONALITY*, *IORING_FEAT_FAST_POLL*, *IORING_FEAT_POLL_32BITS*, *IORING_FEAT_SQPOLL_NONFIXED*, *IORING_FEAT_ENTER_EXT_ARG*, *IORING_FEAT_NATIVE_WORKERS*, *IORING_FEAT_RSRC_TAGS*
Yes | `>` | `io_uring_enter` | 
Yes | `<` | `io_uring_enter` | ERRNO **res**, FD **fd**, UINT32 **to_submit**, UINT32 **min_complete**, FLAGS32 **flags**: *IORING_ENTER_GETEVENTS*, *IORING_ENTER_SQ_WAKEUP*, *IORING_ENTER_SQ_WAIT*, *IORING_ENTER_EXT_ARG*, SIGSET **sig**
Yes | `>` | `io_uring_register` | 
Yes | `<` | `io_uring_register` | ERRNO **res**, FD **fd**, ENUMFLAGS16 **opcode**: *IORING_REGISTER_BUFFERS*, *IORING_UNREGISTER_BUFFERS*, *IORING_REGISTER_FILES*, *IORING_UNREGISTER_FILES*, *IORING_REGISTER_EVENTFD*, *IORING_UNREGISTER_EVENTFD*, *IORING_REGISTER_FILES_UPDATE*, *IORING_REGISTER_EVENTFD_ASYNC*, *IORING_REGISTER_PROBE*, *IORING_REGISTER_PERSONALITY*, *IORING_UNREGISTER_PERSONALITY*, *IORING_REGISTER_RESTRICTIONS*, *IORING_REGISTER_ENABLE_RINGS*, *IORING_REGISTER_FILES2*, *IORING_REGISTER_FILES_UPDATE2*, *IORING_REGISTER_BUFFERS2*, *IORING_REGISTER_BUFFERS_UPDATE*, *IORING_REGISTER_IOWQ_AFF*, *IORING_UNREGISTER_IOWQ_AFF*, *IORING_REGISTER_IOWQ_MAX_WORKERS*, *IORING_REGISTER_RING_FDS*, *IORING_UNREGISTER_RING_FDS*, UINT64 **arg**, UINT32 **nr_args**
Yes | `>` | `mlock` | 
Yes | `<` | `mlock` | ERRNO **res**, UINT64 **addr**, UINT64 **len**
Yes | `>` | `munlock` | 
Yes | `<` | `munlock` | ERRNO **res**, UINT64 **addr**, UINT64 **len**
Yes | `>` | `mlockall` | 
Yes | `<` | `mlockall` | ERRNO **res**, FLAGS32 **flags**: *MCL_CURRENT*, *MCL_FUTURE*, *MCL_ONFAULT*
Yes | `>` | `munlockall` | 
Yes | `<` | `munlockall` | ERRNO **res**
Yes | `>` | `capset` | 
Yes | `<` | `capset` | ERRNO **res**, UINT64 **cap_inheritable**, UINT64 **cap_permitted**, UINT64 **cap_effective**
Yes | `>` | `dup2` | FD **fd**
Yes | `<` | `dup2` | FD **res**, FD **oldfd**, FD **newfd**
Yes | `>` | `dup3` | FD **fd**
Yes | `<` | `dup3` | FD **res**, FD **oldfd**, FD **newfd**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*
Yes | `>` | `dup` | FD **fd**
Yes | `<` | `dup` | FD **res**, FD **oldfd**
Yes | `>` | `bpf` | INT64 **cmd**
Yes | `<` | `bpf` | FD **fd**
Yes | `>` | `mlock2` | 
Yes | `<` | `mlock2` | ERRNO **res**, UINT64 **addr**, UINT64 **len**, UINT32 **flags**
Yes | `>` | `fsconfig` | 
Yes | `<` | `fsconfig` | ERRNO **res**, FD **fd**, ENUMFLAGS32 **cmd**: *FSCONFIG_SET_FLAG*, *FSCONFIG_SET_STRING*, *FSCONFIG_SET_BINARY*, *FSCONFIG_SET_PATH*, *FSCONFIG_SET_PATH_EMPTY*, *FSCONFIG_SET_FD*, *FSCONFIG_CMD_CREATE*, *FSCONFIG_CMD_RECONFIGURE*, CHARBUF **key**, BYTEBUF **value_bytebuf**, CHARBUF **value_charbuf**, INT32 **aux**
Yes | `>` | `epoll_create` | INT32 **size**
Yes | `<` | `epoll_create` | ERRNO **res**
Yes | `>` | `epoll_create1` | FLAGS32 **flags**: *EPOLL_CLOEXEC*
Yes | `<` | `epoll_create1` | ERRNO **res**
Yes | `>` | `chown` | 
Yes | `<` | `chown` | ERRNO **res**, FSPATH **path**, UINT32 **uid**, UINT32 **gid**
Yes | `>` | `lchown` | 
Yes | `<` | `lchown` | ERRNO **res**, FSPATH **path**, UINT32 **uid**, UINT32 **gid**
Yes | `>` | `fchown` | 
Yes | `<` | `fchown` | ERRNO **res**, FD **fd**, UINT32 **uid**, UINT32 **gid**
Yes | `>` | `fchownat` | 
Yes | `<` | `fchownat` | ERRNO **res**, FD **dirfd**, FSRELPATH **pathname**, UINT32 **uid**, UINT32 **gid**, FLAGS32 **flags**: *AT_SYMLINK_NOFOLLOW*, *AT_EMPTY_PATH*
Yes | `>` | `umount` | 
Yes | `<` | `umount` | ERRNO **res**, FSPATH **name**
Yes | `>` | `accept4` | INT32 **flags**
Yes | `<` | `accept4` | FD **fd**, SOCKTUPLE **tuple**, UINT8 **queuepct**, UINT32 **queuelen**, UINT32 **queuemax**
Yes | `>` | `umount2` | FLAGS32 **flags**: *FORCE*, *DETACH*, *EXPIRE*, *NOFOLLOW*
Yes | `<` | `umount2` | ERRNO **res**, FSPATH **name**
Yes | `>` | `pipe2` | 
Yes | `<` | `pipe2` | ERRNO **res**, FD **fd1**, FD **fd2**, UINT64 **ino**, FLAGS32 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*
Yes | `>` | `inotify_init1` | 
Yes | `<` | `inotify_init1` | FD **res**, FLAGS16 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*
Yes | `>` | `eventfd2` | UINT64 **initval**
Yes | `<` | `eventfd2` | FD **res**, FLAGS16 **flags**: *O_LARGEFILE*, *O_DIRECTORY*, *O_DIRECT*, *O_TRUNC*, *O_SYNC*, *O_NONBLOCK*, *O_EXCL*, *O_DSYNC*, *O_APPEND*, *O_CREAT*, *O_RDWR*, *O_WRONLY*, *O_RDONLY*, *O_CLOEXEC*, *O_NONE*, *O_TMPFILE*
Yes | `>` | `signalfd4` | FD **fd**, UINT32 **mask**
Yes | `<` | `signalfd4` | FD **res**, FLAGS16 **flags**
Yes | `>` | `prctl` | 
Yes | `<` | `prctl` | ERRNO **res**, ENUMFLAGS32 **option**: *PR_GET_DUMPABLE*, *PR_SET_DUMPABLE*, *PR_GET_KEEPCAPS*, *PR_SET_KEEPCAPS*, *PR_SET_NAME*, *PR_GET_NAME*, *PR_GET_SECCOMP*, *PR_SET_SECCOMP*, *PR_CAPBSET_READ*, *PR_CAPBSET_DROP*, *PR_GET_SECUREBITS*, *PR_SET_SECUREBITS*, *PR_MCE_KILL*, *PR_MCE_KILL*, *PR_SET_MM*, *PR_SET_CHILD_SUBREAPER*, *PR_GET_CHILD_SUBREAPER*, *PR_SET_NO_NEW_PRIVS*, *PR_GET_NO_NEW_PRIVS*, *PR_GET_TID_ADDRESS*, *PR_SET_THP_DISABLE*, *PR_GET_THP_DISABLE*, *PR_CAP_AMBIENT*, CHARBUF **arg2_str**, INT64 **arg2_int**
Yes | `>` | `sigreturn` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sigreturn` | SYSCALLID **ID**
Yes | `>` | `s390_runtime_instr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `s390_runtime_instr` | SYSCALLID **ID**
Yes | `>` | `s390_sthyi` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `s390_sthyi` | SYSCALLID **ID**
Yes | `>` | `readdir` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `readdir` | SYSCALLID **ID**
Yes | `>` | `sync_file_range` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sync_file_range` | SYSCALLID **ID**
Yes | `>` | `faccessat2` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `faccessat2` | SYSCALLID **ID**
Yes | `>` | `sched_getattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_getattr` | SYSCALLID **ID**
Yes | `>` | `rseq` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rseq` | SYSCALLID **ID**
Yes | `>` | `nfsservctl` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `nfsservctl` | SYSCALLID **ID**
Yes | `>` | `sigsuspend` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sigsuspend` | SYSCALLID **ID**
Yes | `>` | `getpmsg` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getpmsg` | SYSCALLID **ID**
Yes | `>` | `set_mempolicy_home_node` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `set_mempolicy_home_node` | SYSCALLID **ID**
Yes | `>` | `io_pgetevents` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `io_pgetevents` | SYSCALLID **ID**
Yes | `>` | `statx` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `statx` | SYSCALLID **ID**
Yes | `>` | `epoll_ctl_old` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `epoll_ctl_old` | SYSCALLID **ID**
Yes | `>` | `mbind` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mbind` | SYSCALLID **ID**
Yes | `>` | `move_pages` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `move_pages` | SYSCALLID **ID**
Yes | `>` | `migrate_pages` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `migrate_pages` | SYSCALLID **ID**
Yes | `>` | `landlock_add_rule` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `landlock_add_rule` | SYSCALLID **ID**
Yes | `>` | `landlock_restrict_self` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `landlock_restrict_self` | SYSCALLID **ID**
Yes | `>` | `pkey_alloc` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pkey_alloc` | SYSCALLID **ID**
Yes | `>` | `pidfd_open` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pidfd_open` | SYSCALLID **ID**
Yes | `>` | `close_range` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `close_range` | SYSCALLID **ID**
Yes | `>` | `kexec_file_load` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `kexec_file_load` | SYSCALLID **ID**
Yes | `>` | `memfd_secret` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `memfd_secret` | SYSCALLID **ID**
Yes | `>` | `memfd_create` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `memfd_create` | SYSCALLID **ID**
Yes | `>` | `fadvise64` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fadvise64` | SYSCALLID **ID**
Yes | `>` | `getrandom` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getrandom` | SYSCALLID **ID**
Yes | `>` | `sigaltstack` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sigaltstack` | SYSCALLID **ID**
Yes | `>` | `finit_module` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `finit_module` | SYSCALLID **ID**
Yes | `>` | `process_vm_writev` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `process_vm_writev` | SYSCALLID **ID**
Yes | `>` | `fallocate` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fallocate` | SYSCALLID **ID**
Yes | `>` | `waitpid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `waitpid` | SYSCALLID **ID**
Yes | `>` | `nice` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `nice` | SYSCALLID **ID**
Yes | `>` | `olduname` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `olduname` | SYSCALLID **ID**
Yes | `>` | `sgetmask` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sgetmask` | SYSCALLID **ID**
Yes | `>` | `_newselect` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `_newselect` | SYSCALLID **ID**
Yes | `>` | `socketcall` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `socketcall` | SYSCALLID **ID**
Yes | `>` | `sigprocmask` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sigprocmask` | SYSCALLID **ID**
Yes | `>` | `fstatat64` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fstatat64` | SYSCALLID **ID**
Yes | `>` | `process_vm_readv` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `process_vm_readv` | SYSCALLID **ID**
Yes | `>` | `fstatfs64` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fstatfs64` | SYSCALLID **ID**
Yes | `>` | `statfs64` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `statfs64` | SYSCALLID **ID**
Yes | `>` | `msgctl` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `msgctl` | SYSCALLID **ID**
Yes | `>` | `msgget` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `msgget` | SYSCALLID **ID**
Yes | `>` | `process_mrelease` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `process_mrelease` | SYSCALLID **ID**
Yes | `>` | `msgrcv` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `msgrcv` | SYSCALLID **ID**
Yes | `>` | `perf_event_open` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `perf_event_open` | SYSCALLID **ID**
Yes | `>` | `getcpu` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getcpu` | SYSCALLID **ID**
Yes | `>` | `shmctl` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `shmctl` | SYSCALLID **ID**
Yes | `>` | `set_robust_list` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `set_robust_list` | SYSCALLID **ID**
Yes | `>` | `pselect6` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pselect6` | SYSCALLID **ID**
Yes | `>` | `modify_ldt` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `modify_ldt` | SYSCALLID **ID**
Yes | `>` | `timerfd_settime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `timerfd_settime` | SYSCALLID **ID**
Yes | `>` | `getitimer` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getitimer` | SYSCALLID **ID**
Yes | `>` | `sched_getscheduler` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_getscheduler` | SYSCALLID **ID**
Yes | `>` | `kcmp` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `kcmp` | SYSCALLID **ID**
Yes | `>` | `open_tree` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `open_tree` | SYSCALLID **ID**
Yes | `>` | `setpriority` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setpriority` | SYSCALLID **ID**
Yes | `>` | `sched_setscheduler` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_setscheduler` | SYSCALLID **ID**
Yes | `>` | `fdatasync` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fdatasync` | SYSCALLID **ID**
Yes | `>` | `pkey_mprotect` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pkey_mprotect` | SYSCALLID **ID**
Yes | `>` | `clock_nanosleep` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `clock_nanosleep` | SYSCALLID **ID**
Yes | `>` | `signal` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `signal` | SYSCALLID **ID**
Yes | `>` | `sched_yield` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_yield` | SYSCALLID **ID**
Yes | `>` | `pidfd_getfd` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pidfd_getfd` | SYSCALLID **ID**
Yes | `>` | `get_robust_list` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `get_robust_list` | SYSCALLID **ID**
Yes | `>` | `set_tid_address` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `set_tid_address` | SYSCALLID **ID**
Yes | `>` | `getpgid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getpgid` | SYSCALLID **ID**
Yes | `>` | `getsid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getsid` | SYSCALLID **ID**
Yes | `>` | `sched_getparam` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_getparam` | SYSCALLID **ID**
Yes | `>` | `init_module` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `init_module` | SYSCALLID **ID**
Yes | `>` | `ioperm` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `ioperm` | SYSCALLID **ID**
Yes | `>` | `syslog` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `syslog` | SYSCALLID **ID**
Yes | `>` | `wait4` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `wait4` | SYSCALLID **ID**
Yes | `>` | `rt_sigaction` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rt_sigaction` | SYSCALLID **ID**
Yes | `>` | `mq_timedreceive` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mq_timedreceive` | SYSCALLID **ID**
Yes | `>` | `rt_tgsigqueueinfo` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rt_tgsigqueueinfo` | SYSCALLID **ID**
Yes | `>` | `rt_sigprocmask` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rt_sigprocmask` | SYSCALLID **ID**
Yes | `>` | `_sysctl` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `_sysctl` | SYSCALLID **ID**
Yes | `>` | `epoll_wait_old` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `epoll_wait_old` | SYSCALLID **ID**
Yes | `>` | `vhangup` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `vhangup` | SYSCALLID **ID**
Yes | `>` | `sched_get_priority_min` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_get_priority_min` | SYSCALLID **ID**
Yes | `>` | `semtimedop` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `semtimedop` | SYSCALLID **ID**
Yes | `>` | `rt_sigreturn` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rt_sigreturn` | SYSCALLID **ID**
Yes | `>` | `rt_sigpending` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rt_sigpending` | SYSCALLID **ID**
Yes | `>` | `io_destroy` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `io_destroy` | SYSCALLID **ID**
Yes | `>` | `pivot_root` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pivot_root` | SYSCALLID **ID**
Yes | `>` | `mincore` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mincore` | SYSCALLID **ID**
Yes | `>` | `msgsnd` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `msgsnd` | SYSCALLID **ID**
Yes | `>` | `sysinfo` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sysinfo` | SYSCALLID **ID**
Yes | `>` | `acct` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `acct` | SYSCALLID **ID**
Yes | `>` | `epoll_pwait` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `epoll_pwait` | SYSCALLID **ID**
Yes | `>` | `sysfs` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sysfs` | SYSCALLID **ID**
Yes | `>` | `clock_adjtime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `clock_adjtime` | SYSCALLID **ID**
Yes | `>` | `sync` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sync` | SYSCALLID **ID**
Yes | `>` | `name_to_handle_at` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `name_to_handle_at` | SYSCALLID **ID**
Yes | `>` | `sched_setparam` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_setparam` | SYSCALLID **ID**
Yes | `>` | `stime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `stime` | SYSCALLID **ID**
Yes | `>` | `pause` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pause` | SYSCALLID **ID**
Yes | `>` | `timerfd` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `timerfd` | SYSCALLID **ID**
Yes | `>` | `msync` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `msync` | SYSCALLID **ID**
Yes | `>` | `rt_sigsuspend` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rt_sigsuspend` | SYSCALLID **ID**
Yes | `>` | `landlock_create_ruleset` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `landlock_create_ruleset` | SYSCALLID **ID**
Yes | `>` | `lremovexattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `lremovexattr` | SYSCALLID **ID**
Yes | `>` | `remap_file_pages` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `remap_file_pages` | SYSCALLID **ID**
Yes | `>` | `restart_syscall` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `restart_syscall` | SYSCALLID **ID**
Yes | `>` | `times` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `times` | SYSCALLID **ID**
Yes | `>` | `sched_get_priority_max` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_get_priority_max` | SYSCALLID **ID**
Yes | `>` | `fanotify_mark` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fanotify_mark` | SYSCALLID **ID**
Yes | `>` | `statfs` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `statfs` | SYSCALLID **ID**
Yes | `>` | `utime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `utime` | SYSCALLID **ID**
Yes | `>` | `getpid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getpid` | SYSCALLID **ID**
Yes | `>` | `mknod` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mknod` | SYSCALLID **ID**
Yes | `>` | `uname` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `uname` | SYSCALLID **ID**
Yes | `>` | `process_madvise` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `process_madvise` | SYSCALLID **ID**
Yes | `>` | `ioprio_get` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `ioprio_get` | SYSCALLID **ID**
Yes | `>` | `swapon` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `swapon` | SYSCALLID **ID**
Yes | `>` | `readahead` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `readahead` | SYSCALLID **ID**
Yes | `>` | `pkey_free` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pkey_free` | SYSCALLID **ID**
Yes | `>` | `time` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `time` | SYSCALLID **ID**
Yes | `>` | `settimeofday` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `settimeofday` | SYSCALLID **ID**
Yes | `>` | `iopl` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `iopl` | SYSCALLID **ID**
Yes | `>` | `set_mempolicy` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `set_mempolicy` | SYSCALLID **ID**
Yes | `>` | `ftruncate` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `ftruncate` | SYSCALLID **ID**
Yes | `>` | `syncfs` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `syncfs` | SYSCALLID **ID**
Yes | `>` | `readlink` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `readlink` | SYSCALLID **ID**
Yes | `>` | `gettimeofday` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `gettimeofday` | SYSCALLID **ID**
Yes | `>` | `s390_guarded_storage` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `s390_guarded_storage` | SYSCALLID **ID**
Yes | `>` | `sched_rr_get_interval` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_rr_get_interval` | SYSCALLID **ID**
Yes | `>` | `setgroups` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setgroups` | SYSCALLID **ID**
Yes | `>` | `timer_gettime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `timer_gettime` | SYSCALLID **ID**
Yes | `>` | `ioprio_set` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `ioprio_set` | SYSCALLID **ID**
Yes | `>` | `futimesat` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `futimesat` | SYSCALLID **ID**
Yes | `>` | `reboot` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `reboot` | SYSCALLID **ID**
Yes | `>` | `get_kernel_syms` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `get_kernel_syms` | SYSCALLID **ID**
Yes | `>` | `uselib` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `uselib` | SYSCALLID **ID**
Yes | `>` | `mremap` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mremap` | SYSCALLID **ID**
Yes | `>` | `truncate` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `truncate` | SYSCALLID **ID**
Yes | `>` | `ustat` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `ustat` | SYSCALLID **ID**
Yes | `>` | `timer_settime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `timer_settime` | SYSCALLID **ID**
Yes | `>` | `quotactl_fd` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `quotactl_fd` | SYSCALLID **ID**
Yes | `>` | `umask` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `umask` | SYSCALLID **ID**
Yes | `>` | `clock_settime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `clock_settime` | SYSCALLID **ID**
Yes | `>` | `mount_setattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mount_setattr` | SYSCALLID **ID**
Yes | `>` | `getpriority` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getpriority` | SYSCALLID **ID**
Yes | `>` | `get_mempolicy` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `get_mempolicy` | SYSCALLID **ID**
Yes | `>` | `move_mount` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `move_mount` | SYSCALLID **ID**
Yes | `>` | `alarm` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `alarm` | SYSCALLID **ID**
Yes | `>` | `getxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getxattr` | SYSCALLID **ID**
Yes | `>` | `personality` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `personality` | SYSCALLID **ID**
Yes | `>` | `getpgrp` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getpgrp` | SYSCALLID **ID**
Yes | `>` | `fstatfs` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fstatfs` | SYSCALLID **ID**
Yes | `>` | `create_module` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `create_module` | SYSCALLID **ID**
Yes | `>` | `preadv2` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `preadv2` | SYSCALLID **ID**
Yes | `>` | `vmsplice` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `vmsplice` | SYSCALLID **ID**
Yes | `>` | `rt_sigtimedwait` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rt_sigtimedwait` | SYSCALLID **ID**
Yes | `>` | `mq_open` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mq_open` | SYSCALLID **ID**
Yes | `>` | `mq_getsetattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mq_getsetattr` | SYSCALLID **ID**
Yes | `>` | `fspick` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fspick` | SYSCALLID **ID**
Yes | `>` | `newfstatat` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `newfstatat` | SYSCALLID **ID**
Yes | `>` | `faccessat` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `faccessat` | SYSCALLID **ID**
Yes | `>` | `capget` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `capget` | SYSCALLID **ID**
Yes | `>` | `setreuid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setreuid` | SYSCALLID **ID**
Yes | `>` | `setregid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setregid` | SYSCALLID **ID**
Yes | `>` | `setfsuid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setfsuid` | SYSCALLID **ID**
Yes | `>` | `setfsgid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setfsgid` | SYSCALLID **ID**
Yes | `>` | `s390_pci_mmio_read` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `s390_pci_mmio_read` | SYSCALLID **ID**
Yes | `>` | `ssetmask` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `ssetmask` | SYSCALLID **ID**
Yes | `>` | `madvise` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `madvise` | SYSCALLID **ID**
Yes | `>` | `swapoff` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `swapoff` | SYSCALLID **ID**
Yes | `>` | `add_key` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `add_key` | SYSCALLID **ID**
Yes | `>` | `membarrier` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `membarrier` | SYSCALLID **ID**
Yes | `>` | `gettid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `gettid` | SYSCALLID **ID**
Yes | `>` | `query_module` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `query_module` | SYSCALLID **ID**
Yes | `>` | `shmat` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `shmat` | SYSCALLID **ID**
Yes | `>` | `lsetxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `lsetxattr` | SYSCALLID **ID**
Yes | `>` | `lookup_dcookie` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `lookup_dcookie` | SYSCALLID **ID**
Yes | `>` | `fsetxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fsetxattr` | SYSCALLID **ID**
Yes | `>` | `ipc` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `ipc` | SYSCALLID **ID**
Yes | `>` | `fsync` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fsync` | SYSCALLID **ID**
Yes | `>` | `lgetxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `lgetxattr` | SYSCALLID **ID**
Yes | `>` | `futex_waitv` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `futex_waitv` | SYSCALLID **ID**
Yes | `>` | `fgetxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fgetxattr` | SYSCALLID **ID**
Yes | `>` | `sigpending` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sigpending` | SYSCALLID **ID**
Yes | `>` | `shmdt` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `shmdt` | SYSCALLID **ID**
Yes | `>` | `listxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `listxattr` | SYSCALLID **ID**
Yes | `>` | `setxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setxattr` | SYSCALLID **ID**
Yes | `>` | `mq_timedsend` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mq_timedsend` | SYSCALLID **ID**
Yes | `>` | `sigaction` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sigaction` | SYSCALLID **ID**
Yes | `>` | `arch_prctl` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `arch_prctl` | SYSCALLID **ID**
Yes | `>` | `waitid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `waitid` | SYSCALLID **ID**
Yes | `>` | `llistxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `llistxattr` | SYSCALLID **ID**
Yes | `>` | `flistxattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `flistxattr` | SYSCALLID **ID**
Yes | `>` | `timer_create` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `timer_create` | SYSCALLID **ID**
Yes | `>` | `removexattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `removexattr` | SYSCALLID **ID**
Yes | `>` | `delete_module` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `delete_module` | SYSCALLID **ID**
Yes | `>` | `fremovexattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fremovexattr` | SYSCALLID **ID**
Yes | `>` | `utimensat` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `utimensat` | SYSCALLID **ID**
Yes | `>` | `rt_sigqueueinfo` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `rt_sigqueueinfo` | SYSCALLID **ID**
Yes | `>` | `sched_getaffinity` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_getaffinity` | SYSCALLID **ID**
Yes | `>` | `sched_setattr` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_setattr` | SYSCALLID **ID**
Yes | `>` | `epoll_pwait2` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `epoll_pwait2` | SYSCALLID **ID**
Yes | `>` | `fsopen` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fsopen` | SYSCALLID **ID**
Yes | `>` | `fanotify_init` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fanotify_init` | SYSCALLID **ID**
Yes | `>` | `request_key` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `request_key` | SYSCALLID **ID**
Yes | `>` | `sched_setaffinity` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sched_setaffinity` | SYSCALLID **ID**
Yes | `>` | `io_submit` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `io_submit` | SYSCALLID **ID**
Yes | `>` | `set_thread_area` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `set_thread_area` | SYSCALLID **ID**
Yes | `>` | `get_thread_area` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `get_thread_area` | SYSCALLID **ID**
Yes | `>` | `epoll_ctl` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `epoll_ctl` | SYSCALLID **ID**
Yes | `>` | `pidfd_send_signal` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pidfd_send_signal` | SYSCALLID **ID**
Yes | `>` | `inotify_add_watch` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `inotify_add_watch` | SYSCALLID **ID**
Yes | `>` | `setdomainname` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setdomainname` | SYSCALLID **ID**
Yes | `>` | `io_setup` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `io_setup` | SYSCALLID **ID**
Yes | `>` | `s390_pci_mmio_write` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `s390_pci_mmio_write` | SYSCALLID **ID**
Yes | `>` | `io_getevents` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `io_getevents` | SYSCALLID **ID**
Yes | `>` | `io_cancel` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `io_cancel` | SYSCALLID **ID**
Yes | `>` | `timer_getoverrun` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `timer_getoverrun` | SYSCALLID **ID**
Yes | `>` | `timerfd_gettime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `timerfd_gettime` | SYSCALLID **ID**
Yes | `>` | `setitimer` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `setitimer` | SYSCALLID **ID**
Yes | `>` | `clock_gettime` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `clock_gettime` | SYSCALLID **ID**
Yes | `>` | `fsmount` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `fsmount` | SYSCALLID **ID**
Yes | `>` | `exit_group` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `exit_group` | SYSCALLID **ID**
Yes | `>` | `getrusage` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getrusage` | SYSCALLID **ID**
Yes | `>` | `sethostname` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `sethostname` | SYSCALLID **ID**
Yes | `>` | `timer_delete` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `timer_delete` | SYSCALLID **ID**
Yes | `>` | `idle` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `idle` | SYSCALLID **ID**
Yes | `>` | `shmget` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `shmget` | SYSCALLID **ID**
Yes | `>` | `readlinkat` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `readlinkat` | SYSCALLID **ID**
Yes | `>` | `utimes` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `utimes` | SYSCALLID **ID**
Yes | `>` | `adjtimex` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `adjtimex` | SYSCALLID **ID**
Yes | `>` | `mq_unlink` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mq_unlink` | SYSCALLID **ID**
Yes | `>` | `pwritev2` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `pwritev2` | SYSCALLID **ID**
Yes | `>` | `mq_notify` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mq_notify` | SYSCALLID **ID**
Yes | `>` | `kexec_load` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `kexec_load` | SYSCALLID **ID**
Yes | `>` | `clock_getres` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `clock_getres` | SYSCALLID **ID**
Yes | `>` | `keyctl` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `keyctl` | SYSCALLID **ID**
Yes | `>` | `bdflush` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `bdflush` | SYSCALLID **ID**
Yes | `>` | `tee` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `tee` | SYSCALLID **ID**
Yes | `>` | `getgroups` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getgroups` | SYSCALLID **ID**
Yes | `>` | `inotify_rm_watch` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `inotify_rm_watch` | SYSCALLID **ID**
Yes | `>` | `exit` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `exit` | SYSCALLID **ID**
Yes | `>` | `getppid` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `getppid` | SYSCALLID **ID**
Yes | `>` | `mknodat` | SYSCALLID **ID**, UINT16 **nativeID**
Yes | `<` | `mknodat` | SYSCALLID **ID**


## Tracepoint events

Default | Dir | Name | Args 
:-------|:----|:-----|:-----
Yes | `>` | `switch` | PID **next**, UINT64 **pgft_maj**, UINT64 **pgft_min**, UINT32 **vm_size**, UINT32 **vm_rss**, UINT32 **vm_swap**
Yes | `>` | `procexit` | ERRNO **status**, ERRNO **ret**, SIGTYPE **sig**, UINT8 **core**
Yes | `>` | `signaldeliver` | PID **spid**, PID **dpid**, SIGTYPE **sig**
Yes | `>` | `page_fault` | UINT64 **addr**, UINT64 **ip**, FLAGS32 **error**: *PROTECTION_VIOLATION*, *PAGE_NOT_PRESENT*, *WRITE_ACCESS*, *READ_ACCESS*, *USER_FAULT*, *SUPERVISOR_FAULT*, *RESERVED_PAGE*, *INSTRUCTION_FETCH*


## Plugin events

Default | Dir | Name | Args 
:-------|:----|:-----|:-----
Yes | `>` | `pluginevent` | UINT32 **plugin_id**, BYTEBUF **event_data**


## Metaevents

Default | Dir | Name | Args 
:-------|:----|:-----|:-----
Yes | `>` | `drop` | UINT32 **ratio**
Yes | `<` | `drop` | UINT32 **ratio**
Yes | `>` | `scapevent` | UINT32 **event_type**, UINT64 **event_data**
Yes | `>` | `procinfo` | UINT64 **cpu_usr**, UINT64 **cpu_sys**
Yes | `>` | `cpu_hotplug` | UINT32 **cpu**, UINT32 **action**
Yes | `>` | `k8s` | CHARBUF **json**
Yes | `>` | `tracer` | INT64 **id**, CHARBUFARRAY **tags**, CHARBUF_PAIR_ARRAY **args**
Yes | `<` | `tracer` | INT64 **id**, CHARBUFARRAY **tags**, CHARBUF_PAIR_ARRAY **args**
Yes | `>` | `mesos` | CHARBUF **json**
Yes | `>` | `notification` | CHARBUF **id**, CHARBUF **desc**
Yes | `>` | `infra` | CHARBUF **source**, CHARBUF **name**, CHARBUF **description**, CHARBUF **scope**
Yes | `>` | `container` | CHARBUF **json**
Yes | `>` | `useradded` | UINT32 **uid**, UINT32 **gid**, CHARBUF **name**, CHARBUF **home**, CHARBUF **shell**, CHARBUF **container_id**
Yes | `>` | `userdeleted` | UINT32 **uid**, UINT32 **gid**, CHARBUF **name**, CHARBUF **home**, CHARBUF **shell**, CHARBUF **container_id**
Yes | `>` | `groupadded` | UINT32 **gid**, CHARBUF **name**, CHARBUF **container_id**
Yes | `>` | `groupdeleted` | UINT32 **gid**, CHARBUF **name**, CHARBUF **container_id**
Yes | `>` | `asyncevent` | UINT32 **plugin_id**, CHARBUF **name**, BYTEBUF **data**
