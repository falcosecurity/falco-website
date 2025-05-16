```
Falco - Cloud Native Runtime Security
Usage:
  falco [OPTION...]

  -h, --help                    Print this help list and exit.
  -c <path>                     Configuration file. If not specified tries /home/runner/work/falco/falco/falco.yaml, /etc/falco/falco.yaml.
      --config-schema           Print the config json schema and exit.
      --rule-schema             Print the rule json schema and exit.
      --disable-source <event_source>
                                Turn off a specific <event_source>. By default, all loaded sources get enabled. Available sources are 
                                'syscall' plus all sources defined by loaded plugins supporting the event sourcing capability. This option 
                                can be passed multiple times, but turning off all event sources simultaneously is not permitted. This 
                                option can not be mixed with --enable-source. This option has no effect when reproducing events from a 
                                capture file.
      --dry-run                 Run Falco without processing events. It can help check that the configuration and rules do not have any 
                                errors.
      --enable-source <event_source>
                                Enable a specific <event_source>. By default, all loaded sources get enabled. Available sources are 
                                'syscall' plus all sources defined by loaded plugins supporting the event sourcing capability. This option 
                                can be passed multiple times. When using this option, only the event sources specified by it will be 
                                enabled. This option can not be mixed with --disable-source. This option has no effect when reproducing 
                                events from a capture file.
      --gvisor-generate-config [=<socket_path>(=/run/falco/gvisor.sock)]
                                Generate a configuration file that can be used for gVisor and exit. See --gvisor-config for more details.
  -i                            Print those events that are ignored by default for performance reasons and exit.
  -L                            Show the name and description of all rules and exit. If json_output is set to true, it prints details about 
                                all rules, macros, and lists in JSON format.
  -l <rule>                     Show the name and description of the rule specified <rule> and exit. If json_output is set to true, it 
                                prints details about the rule in JSON format.
      --list [=<source>(=)]     List all defined fields and exit. If <source> is provided, only list those fields for the source <source>. 
                                Current values for <source> are "syscall" or any source from a configured plugin with event sourcing 
                                capability.
      --list-events             List all defined syscall events, metaevents, tracepoint events and exit.
      --list-plugins            Print info on all loaded plugins and exit.
  -M <num_seconds>              Stop Falco execution after <num_seconds> are passed. (default: 0)
      --markdown                Print output in Markdown format when used in conjunction with --list or --list-events options. It has no 
                                effect when used with other options.
  -N                            Only print field names when used in conjunction with the --list option. It has no effect when used with 
                                other options.
  -o, --option <opt>=<val>      Set the value of option <opt> to <val>. Overrides values in the configuration file. <opt> can be identified 
                                using its location in the configuration file using dot notation. Elements of list entries can be accessed 
                                via square brackets [].
                                    E.g. base.id = val
                                         base.subvalue.subvalue2 = val
                                         base.list[1]=val
      --plugin-info <plugin_name>
                                Print info for the plugin specified by <plugin_name> and exit.
                                This includes all descriptive information like name and author, along with the
                                schema format for the init configuration and a list of suggested open parameters.
                                <plugin_name> can be the plugin's name or its configured 'library_path'.
  -p, --print <output_format>   DEPRECATED: use -o append_output... instead. Print additional information in the rule's output.
                                Use -pc or -pcontainer to append container details to syscall events.
                                Use -pk or -pkubernetes to add both container and Kubernetes details to syscall events.
                                If using gVisor, choose -pcg or -pkg variants (or -pcontainer-gvisor and -pkubernetes-gvisor, respectively).
                                The details will be directly appended to the rule's output.
                                Alternatively, use -p <output_format> for a custom format. In this case, the given <output_format> will be 
                                appended to the rule's output without any replacement to all events, including plugin events.
  -P, --pidfile <pid_file>      Write PID to specified <pid_file> path. By default, no PID file is created. (default: "")
  -r <rules_file>               Rules file or directory to be loaded. This option can be passed multiple times. Falco defaults to the 
                                values in the configuration file when this option is not specified. Only files with .yml or .yaml extension 
                                are considered.
      --support                 Print support information, including version, rules files used, loaded configuration, etc., and exit. The 
                                output is in JSON format.
  -U, --unbuffered              Turn off output buffering for configured outputs. This causes every single line emitted by Falco to be 
                                flushed, which generates higher CPU usage but is useful when piping those outputs into another process or a 
                                script.
  -V, --validate <rules_file>   Read the contents of the specified <rules_file> file(s), validate the loaded rules, and exit. This option 
                                can be passed multiple times to validate multiple files.
  -v                            Enable verbose output.
      --version                 Print version information and exit.
      --page-size               Print the system page size and exit. This utility may help choose the right syscall ring buffer size.
```