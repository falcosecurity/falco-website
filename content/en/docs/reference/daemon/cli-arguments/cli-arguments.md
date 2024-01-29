```
Falco - Cloud Native Runtime Security
Usage:
  falco [OPTION...]

  -h, --help                    Print this help list and exit.
  -c <path>                     Configuration file. If not specified uses /etc/falco/falco.yaml.
  -A                            Monitor all events supported by Falco and defined in rules and configs. Some events are ignored by default 
                                when -A is not specified (the -i option lists these events ignored). Using -A can impact performance. This 
                                option has no effect when reproducing events from a capture file.
  -b, --print-base64            Print data buffers in base64. This is useful for encoding binary data that needs to be used over media 
                                designed to consume this format.
      --cri <path>              Path to CRI socket for container metadata. Use the specified <path> to fetch data from a CRI-compatible 
                                runtime. If not specified, built-in defaults for commonly known paths are used. This option can be passed 
                                multiple times to specify a list of sockets to be tried until a successful one is found.
      --disable-cri-async       Turn off asynchronous CRI metadata fetching. This is useful to let the input event wait for the container 
                                metadata fetch to finish before moving forward. Async fetching, in some environments leads to empty fields 
                                for container metadata when the fetch is not fast enough to be completed asynchronously. This can have a 
                                performance penalty on your environment depending on the number of containers and the frequency at which 
                                they are created/started/stopped.
      --disable-source <event_source>
                                Turn off a specific <event_source>. By default, all loaded sources get enabled. Available sources are 
                                'syscall' plus all sources defined by loaded plugins supporting the event sourcing capability. This option 
                                can be passed multiple times, but turning off all event sources simultaneously is not permitted. This 
                                option can not be mixed with --enable-source. This option has no effect when reproducing events from a 
                                capture file.
      --dry-run                 Run Falco without processing events. It can help check that the configuration and rules do not have any 
                                errors.
  -D <substring>                Turn off any rules with names having the substring <substring>. This option can be passed multiple times. 
                                It cannot be mixed with -t.
  -e <events_file>              DEPRECATED. Reproduce the events by reading from the given <capture_file> instead of opening a live 
                                session. Only capture files in .scap format are supported.
      --enable-source <event_source>
                                Enable a specific <event_source>. By default, all loaded sources get enabled. Available sources are 
                                'syscall' plus all sources defined by loaded plugins supporting the event sourcing capability. This option 
                                can be passed multiple times. When using this option, only the event sources specified by it will be 
                                enabled. This option can not be mixed with --disable-source. This option has no effect when reproducing 
                                events from a capture file.
  -g, --gvisor-config <gvisor_config>
                                DEPRECATED. Collect 'syscall' events from gVisor using the specified <gvisor_config> file. A 
                                Falco-compatible configuration file can be generated with --gvisor-generate-config and utilized for both 
                                runsc and Falco.
      --gvisor-generate-config [=<socket_path>(=/run/falco/gvisor.sock)]
                                Generate a configuration file that can be used for gVisor and exit. See --gvisor-config for more details.
      --gvisor-root <gvisor_root>
                                DEPRECATED. Set gVisor root directory for storage of container state when used in conjunction with 
                                --gvisor-config. The <gvisor_root> to be passed is the one usually passed to runsc --root flag.
      --modern-bpf              DEPRECATED. Use the BPF modern probe driver to instrument the kernel and observe 'syscall' events.
  -i                            Print those events that are ignored by default for performance reasons and exit. See -A for more details.
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
      --nodriver                DEPRECATED. Do not use a driver to instrument the kernel. If a loaded plugin has event-sourcing capability 
                                and can produce system events, it will be used for event collection. Otherwise, no event will be collected.
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
  -p, --print <output_format>   Print (or replace) additional information in the rule's output.
                                Use -pc or -pcontainer to append container details.
                                Use -pk or -pkubernetes to add both container and Kubernetes details.
                                If using gVisor, choose -pcg or -pkg variants (or -pcontainer-gvisor and -pkubernetes-gvisor, respectively).
                                If a rule's output contains %container.info, it will be replaced with the corresponding details. Otherwise, 
                                these details will be directly appended to the rule's output.
                                Alternatively, use -p <output_format> for a custom format. In this case, the given <output_format> will be 
                                appended to the rule's output without any replacement.
  -P, --pidfile <pid_file>      Write PID to specified <pid_file> path. By default, no PID file is created. (default: "")
  -r <rules_file>               Rules file or directory to be loaded. This option can be passed multiple times. Falco defaults to the 
                                values in the configuration file when this option is not specified.
  -S, --snaplen <len>           Collect only the first <len> bytes of each I/O buffer for 'syscall' events. By default, the first 80 bytes 
                                are collected by the driver and sent to the user space for processing. Use this option with caution since 
                                it can have a strong performance impact. (default: 0)
      --support                 Print support information, including version, rules files used, loaded configuration, etc., and exit. The 
                                output is in JSON format.
  -T <tag>                      Turn off any rules with a tag=<tag>. This option can be passed multiple times. This option can not be mixed 
                                with -t.
  -t <tag>                      Only enable those rules with a tag=<tag>. This option can be passed multiple times. This option can not be 
                                mixed with -T/-D.
  -U, --unbuffered              Turn off output buffering for configured outputs. This causes every single line emitted by Falco to be 
                                flushed, which generates higher CPU usage but is useful when piping those outputs into another process or a 
                                script.
  -V, --validate <rules_file>   Read the contents of the specified <rules_file> file(s), validate the loaded rules, and exit. This option 
                                can be passed multiple times to validate multiple files.
  -v                            Enable verbose output.
      --version                 Print version information and exit.
      --page-size               Print the system page size and exit. This utility may help choose the right syscall ring buffer size.
```

{{< yaml_table_inline  
    header="-A option"
    subheader="With the -A option Falco monitors all events, including those not interesting to Falco itself (allowing high volume of I/O syscalls). This option has effect only on live captures."
    class="inline-config-options"
    contentPath="reference.daemon.cli_options"
    columnTitles="Category,evt.type,Default (without -A),With -A,custom_set, custom_set + repair,.scap file"
    columnKeys="category,evt_type,default,with_a,custom_set,custom_set_repair,scap_file"
>}}

### Adaptive syscalls

Falco offers to users the flexibility to choose from several behaviours based on their specific use cases. These behaviours provide different levels of control and customization for activating system calls in Falco rules. This documentation section will outline the three available options and their implications.

#### Behaviour 1 (default)

This configuration activates all system calls from Falco rules except for I/O system calls, which can be allowed using the `-A` flag.
Additionally, Falco activates a predefined set of system calls that are deemed useful for building Falco's state engine. However, in this configuration, the end user has no control over this static set (defined at compile time).


#### Behaviour 2: user defined `custom_set` (**use with caution**)

In addition to the system calls from Falco rules except the I/O syscalls (that can be enabled via `-A` flag), this option allows users to specify a set of system calls to be activated (through the configuration key `base_syscalls.custom_set`).
The final set of activated system calls is the union of Falco rules and the user-defined `custom_set` set.
It offers complete control to the end user, but improper usage can lead to issues such as breaking Falco or incomplete and incorrect logs.

#### Behaviour 3: `repair`

This is recommended for users who want Falco to be more resourceful and intelligent in an automated manner (setting the configuration key `base_syscalls.repair` to `true`).
This option activates all system calls from Falco rules, excluding I/O system calls (that can be enabled via `-A` flag). Furthermore, Falco automatically determines and activates the additional system calls required to build up its state engine. By scanning the system calls in each Falco rule, Falco ensures complete and accurate logs while running smoothly.

Falco's state engine refers to the struct created in memory that caches information about processes. It enables various functionalities such as looking up parent processes. Certain system calls can modify this process information, and monitoring relevant system calls ensures the state engine remains accurate. For example, monitoring the close system call ensures proper management of file descriptors.


### Scenarios

These different behaviours offer flexibility to address various scenarios.

1. Scenario: **Monitoring spawned processes with resource constraints**
   - Behaviour 1: Insufficient for this goal.
   - Behaviour 2 and Behaviour 3: Both options can be used to monitor spawned processes.
     - Behaviour 3 ensures automatic correctness of data fields, while Behaviour 2 requires manual understanding of certain data fields retrieved from relevant system calls (e.g., clone*/fork syscalls).

2. Scenario: **Monitoring spawned processes and network activity while excluding file opens due to kernel event drops**
   - Behaviour 1: Insufficient for this goal.
   - Behaviour 2 and Behaviour 3: Both options allow monitoring of spawned processes and network activity without file opens.
     - Behaviour 3 ensures automatic correctness of data fields, while Behaviour 2 requires manual configuration and understanding of data fields.

3. Various scenarios: **Configurability and usefulness**
   - There are numerous scenarios where configurability is useful, such as:
     - Using Falco for specific tasks (x) and relying on other tools for different tasks (y), thus avoiding duplication of work.
     - Enhancing network monitoring in the ecosystem while freeing up resources by using Falco selectively.
   - The flexibility of Falco's options allows users to tailor the tool to their specific needs and address a wide range of use cases.

4. Scenario: **Monitoring all system calls**
   - All three options can provide an equivalent solution for monitoring all system calls.
   - Users can choose any option based on their preference and requirements.

### Notes:

* To list all the ignored events use the `-i` option.
* `EF_OLD_VERSION` are never generated when live mode, but they may be present in .scap files
* Since the new Falco version won't apply any userspace pre-filtering, `-A` is implicit when reading from `.scap`.
