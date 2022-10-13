---
title: Arguments
description: List of CLI arguments allowed by Falco
weight: 4
---

This page lists all arguments you can pass to Falco in your command line:

```
Falco - Cloud Native Runtime Security
Usage:
  falco [OPTION...]

  -h, --help                    Print this page
  -c <path>                     Configuration file. If not specified uses /etc/falco/falco.yaml.
  -A                            Monitor all events, including those not interesting to Falco. Please use the -i option to list all ignored 
                                events. This option has effect only on live captures.
  -b, --print-base64            Print data buffers in base64. This is useful for encoding binary data that needs to be used over media 
                                designed to consume this format.
      --cri <path>              Path to CRI socket for container metadata. Use the specified socket to fetch data from a CRI-compatible 
                                runtime. If not specified, uses the libs default. This option can be passed multiple times to specify 
                                socket to be tried until a successful one is found.
  -d, --daemon                  Run as a daemon.
      --disable-cri-async       Disable asynchronous CRI metadata fetching. This is useful to let the input event wait for the container 
                                metadata fetch to finish before moving forward. Async fetching, in some environments leads to empty fields 
                                for container metadata when the fetch is not fast enough to be completed asynchronously. This can have a 
                                performance penalty on your environment depending on the number of containers and the frequency at which 
                                they are created/started/stopped.
      --disable-source <event_source>
                                Disable a specific event source. By default, all loaded sources get enabled. Available sources are 
                                'syscall' and all sources defined by loaded plugins supporting the event sourcing capability. This option 
                                can be passed multiple times. This has no offect when reading events from a trace file. Can not disable all 
                                event sources. Can not be mixed with --enable-source.
  -D <substring>                Disable any rules with names having the substring <substring>. This option can be passed multiple times. 
                                Can not be mixed with -t.
  -e <events_file>              Read the events from a trace file <events_file> in .scap format instead of tapping into live.
      --enable-source <event_source>
                                Enable a specific event source. If used, all loaded sources get disabled by default and only the ones 
                                passed with this option get enabled. Available sources are 'syscall' and all sources defined by loaded 
                                plugins supporting the event sourcing capability. This option can be passed multiple times. This has no 
                                offect when reading events from a trace file. Can not be mixed with --disable-source.
  -g, --gvisor-config <gvisor_config>
                                Parse events from gVisor using the specified configuration file. A falco-compatible configuration file can 
                                be generated with --gvisor-generate-config and can be used for both runsc and Falco.
      --gvisor-generate-config [=<socket_path>(=/run/falco/gvisor.sock)]
                                Generate a configuration file that can be used for gVisor.
      --gvisor-root <gvisor_root>
                                gVisor root directory for storage of container state. Equivalent to runsc --root flag.
  -i                            Print all events that are ignored by default (i.e. without the -A flag) and exit.
  -k, --k8s-api <url>           Enable Kubernetes support by connecting to the API server specified as argument. E.g. 
                                "http://admin:password@127.0.0.1:8080". The API server can also be specified via the environment variable 
                                FALCO_K8S_API.
  -K, --k8s-api-cert (<bt_file> | <cert_file>:<key_file[#password]>[:<ca_cert_file>])
                                Use the provided files names to authenticate user and (optionally) verify the K8S API server identity. Each 
                                entry must specify full (absolute, or relative to the current directory) path to the respective file. 
                                Private key password is optional (needed only if key is password protected). CA certificate is optional. 
                                For all files, only PEM file format is supported. Specifying CA certificate only is obsoleted - when single 
                                entry is provided for this option, it will be interpreted as the name of a file containing bearer token. 
                                Note that the format of this command-line option prohibits use of files whose names contain ':' or '#' 
                                characters in the file name.
      --k8s-node <node_name>    The node name will be used as a filter when requesting metadata of pods to the API server. Usually, this 
                                should be set to the current node on which Falco is running. If empty, no filter is set, which may have a 
                                performance penalty on large clusters.
  -L                            Show the name and description of all rules and exit.
  -l <rule>                     Show the name and description of the rule with name <rule> and exit.
      --list [=<source>(=)]     List all defined fields. If <source> is provided, only list those fields for the source <source>. Current 
                                values for <source> are "syscall" or any source from a configured plugin with event sourcing capability.
      --list-syscall-events     List all defined system call events.
      --list-plugins            Print info on all loaded plugins and exit.
  -m, --mesos-api <url[,marathon_url]>
                                Enable Mesos support by connecting to the API server specified as argument. E.g. 
                                "http://admin:password@127.0.0.1:5050". Marathon url is optional and defaults to Mesos address, port 8080. 
                                The API servers can also be specified via the environment variable FALCO_MESOS_API.
  -M <num_seconds>              Stop collecting after <num_seconds> reached. (default: 0)
      --markdown                When used with --list/--list-syscall-events, print the content in Markdown format
  -N                            When used with --list, only print field names.
  -o, --option <opt>=<val>      Set the value of option <opt> to <val>. Overrides values in configuration file. <opt> can be identified 
                                using its location in configuration file using dot notation. Elements which are entries of lists can be 
                                accessed via square brackets [].
                                    E.g. base.id = val
                                         base.subvalue.subvalue2 = val
                                         base.list[1]=val
      --plugin-info <plugin_name>
                                Print info for a single plugin and exit.
                                This includes all descriptivo info like name and author, along with the
                                schema format for the init configuration and a list of suggested open parameters.
                                <plugin_name> can be the name of the plugin or its configured library_path.
  -p, --print <output_format>   Add additional information to each falco notification's output.
                                With -pc or -pcontainer will use a container-friendly format.
                                With -pk or -pkubernetes will use a kubernetes-friendly format.
                                With -pm or -pmesos will use a mesos-friendly format.
                                Additionally, specifying -pc/-pk/-pm will change the interpretation of %container.info in rule output 
                                fields.
  -P, --pidfile <pid_file>      When run as a daemon, write pid to specified file (default: /var/run/falco.pid)
  -r <rules_file>               Rules file/directory (defaults to value set in configuration file, or /etc/falco_rules.yaml). This option 
                                can be passed multiple times to read from multiple files/directories.
  -s <stats_file>               If specified, append statistics related to Falco's reading/processing of events to this file (only useful 
                                in live mode).
      --stats-interval <msec>   When using -s <stats_file>, write statistics every <msec> ms. This uses signals, so don't recommend 
                                intervals below 200 ms. Defaults to 5000 (5 seconds). (default: 5000)
  -S, --snaplen <len>           Capture the first <len> bytes of each I/O buffer. By default, the first 80 bytes are captured. Use this 
                                option with caution, it can generate huge trace files. (default: 0)
      --support                 Print support information including version, rules files used, etc. and exit.
  -T <tag>                      Disable any rules with a tag=<tag>. This option can be passed multiple times. Can not be mized with -t
  -t <tag>                      Only run those rules with a tag=<tag>. This option can be passed multiple times. Can not be mixed with 
                                -T/-D.
  -U, --unbuffered              Turn off output buffering to configured outputs. This causes every single line emitted by falco to be 
                                flushed which generates higher CPU usage but is useful when piping those outputs into another process or 
                                into a script.
  -u, --userspace               Parse events from userspace. To be used in conjunction with the ptrace(2) based driver (pdig)
  -V, --validate <rules_file>   Read the contents of the specified rules(s) file and exit. This option can be passed multiple times to 
                                validate multiple files.
  -v                            Verbose output.
      --version                 Print version number.
      --page-size               Print the system page size (may help you to choose the right syscall ring-buffer size).
```
