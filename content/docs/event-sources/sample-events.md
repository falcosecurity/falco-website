---
title: Generating sample events
weight: 1
---

If you'd like to check if Falco is working properly, we've created a test program [`event_generator`](https://github.com/falcosecurity/falco/blob/dev/docker/event-generator/event_generator.cpp) that performs a variety of suspect actions that are detected by the current Falco ruleset.

Here's the usage block for the test program:

```shell
Usage event_generator [options]

Options:
     -h/--help: show this help
     -a/--action: actions to perform. Can be one of the following:
          write_binary_dir                           Write to files below /bin
          write_etc                                  Write to files below /etc
          read_sensitive_file                        Read a sensitive file
          read_sensitive_file_after_startup          As a trusted program, wait a while,
                                                     then read a sensitive file
          write_rpm_database                         Write to files below /var/lib/rpm
          spawn_shell                                Run a shell (bash)
          db_program_spawn_process                   As a database program, try to spawn
                                                     another program
          modify_binary_dirs                         Modify a file below /bin
          mkdir_binary_dirs                          Create a directory below /bin
          change_thread_namespace                    Change namespace
          system_user_interactive                    Change to a system user and try to
                                                     run an interactive command
          network_activity                           Open network connections
                                                     (used by system_procs_network_activity below)
          system_procs_network_activity              Open network connections as a program
                                                     that should not perform network actions
          non_sudo_setuid                            Setuid as a non-root user
          create_files_below_dev                     Create files below /dev
          exec_ls                                    execve() the program ls
                                                     (used by user_mgmt_binaries below)
          user_mgmt_binaries                         Become the program "vipw", which triggers
                                                     rules related to user management programs
          exfiltration                               Read /etc/shadow and send it via udp to a
                                                     specific address and port
          all                                        All of the above
       The action can also be specified via the environment variable EVENT_GENERATOR_ACTIONS
           as a colon-separated list
       if specified, -a/--action overrides any environment variables
     -i/--interval: Number of seconds between actions
     -o/--once: Perform actions once and exit
```

The program packaged as a [Docker image](https://hub.docker.com/r/sysdig/falco-event-generator/) on [Docker Hub](https://hub.docker.com). To run the image:

```shell
docker pull sysdig/falco-event-generator
docker run -it --name falco-event-generator sysdig/falco-event-generator
```

> **Warning** — We strongly recommend that you run the program within Docker, as it modifies files and directories below `/bin`, `/etc`, `/dev`, etc.
