---
title: Generating sample events
weight: 4
---

If you'd like to check if Falco is working properly, we have sample programs that can perform activity for both our syscall and k8s audit related rules.

## System Call Activity

We've created a test program [`event_generator`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/event_generator.cpp) that performs a variety of suspect actions that are detected by the current Falco ruleset.

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

> **Warning** — We strongly recommend that you run the program within Docker (see below), as it modifies files and directories below `/bin`, `/etc`, `/dev`, etc.

## K8s Audit Activity

We've created a shell script [`k8s_event_generator.sh`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/k8_event_generator.sh) and supporting k8s object files that generate activity that matches the k8s audit event ruleset.

In the interests of keeping things self-contained, all objects are created in a `falco-eg-sandbox` namespace. The namespace should be created before running the event generator. This means that some activity related to cluster roles/cluster role bindings is not performed.

You can provide a specific rule name to the script. If provided, only those objects related to that rule will trigger. The default is "all", meaning that all objects are created.

The script loops forever, deleting the resources in the `falco-eg-sandbox` namespace after each iteration.

## Docker Image

The above programs are also available as a [Docker image](https://hub.docker.com/r/falcosecurity/falco-event-generator/) on [Docker Hub](https://hub.docker.com). To run the image:

```bash
docker pull falcosecurity/falco-event-generator
docker run -it --rm falcosecurity/falco-event-generator event_generator [syscall|k8s_audit (<rule name>|all)|bash]
```

* syscall: generate activity for the system call rules
* k8s_audit: generate activity for the k8s audit rules
* bash: spawn a shell

The default is "syscall" to preserve legacy behavior.

The image includes a kubectl binary, but in most cases, you'll need to provide kube config files/directories that allow access to your cluster. A command like the following will work:

```
docker run -v $HOME/.kube:/root/.kube -it falcosecurity/falco-event-generator k8s_audit
```

## Running the Event Generator in K8s

We've also provided K8s resource object files that make it easy to run the event generator in K8s Clusters:

* [`event-generator-syscall-daemonset.yaml`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/event-generator-syscall-daemonset.yaml) creates a K8s DaemonSet that runs the event generator with the `syscall` argument. It will run on every non-master node.
* [`event-generator-role-rolebinding-serviceaccount.yaml`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/event-generator-role-rolebinding-serviceaccount.yaml) creates a Service Account, Cluster Role, and Role that allows a service account `falco-event-generator` to create objects in a namespace `falco-eg-sandbox`.
* [`event-generator-k8saudit-deployment.yaml`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/event-generator-syscall-daemonset.yaml) creates a deployment running in the `falco-event-generator` namespace that runs the event generator with the argument `k8s_audit`.

You can run the following to create the necessary namespaces and objects:

```
kubectl create namespace falco-event-generator && \
  kubectl create namespace falco-eg-sandbox && \
  kubectl apply -f event-generator-role-rolebinding-serviceaccount.yaml && \
  kubectl apply -f event-generator-k8saudit-deployment.yaml && \
  kubectl apply -f event-generator-syscall-daemonset.yaml
```

