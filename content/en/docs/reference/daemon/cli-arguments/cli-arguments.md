```
Falco - Cloud Native Runtime Security
Usage:
  falco [OPTION...]

  -h, --help                    Print this page
  -c <path>                     Configuration file. If not specified uses /etc/falco/falco.yaml.
  -A                            Monitor all events supported by Falco defined in rules and configs. Please use the -i option to list the 
                                events ignored by default without -A. This option affects live captures only. Setting -A can impact 
                                performance.
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
      --dry-run                 Run Falco without proceesing events. Can be useful for checking that the configuration and rules do not 
                                have any errors.
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
      --modern-bpf              Use BPF modern probe to capture system events.
  -i                            Print all high volume syscalls that are ignored by default for performance reasons (i.e. without the -A 
                                flag) and exit.
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
  -L                            Show the name and description of all rules and exit. If json_output is set to true, it prints details about 
                                all rules, macros and lists in JSON format
  -l <rule>                     Show the name and description of the rule with name <rule> and exit. If json_output is set to true, it 
                                prints details about the rule in JSON format
      --list [=<source>(=)]     List all defined fields. If <source> is provided, only list those fields for the source <source>. Current 
                                values for <source> are "syscall" or any source from a configured plugin with event sourcing capability.
      --list-syscall-events     List all defined system call events.
      --list-plugins            Print info on all loaded plugins and exit.
  -M <num_seconds>              Stop collecting after <num_seconds> reached. (default: 0)
      --markdown                When used with --list/--list-syscall-events, print the content in Markdown format
  -N                            When used with --list, only print field names.
      --nodriver                Capture for system events without drivers. If a loaded plugin has event sourcing capability and can produce 
                                system events, it will be used to for event collection.
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
                                Additionally, specifying -pc/-pk will change the interpretation of %container.info in rule output fields.
  -P, --pidfile <pid_file>      When run as a daemon, write pid to specified file (default: /var/run/falco.pid)
  -r <rules_file>               Rules file/directory (defaults to value set in configuration file, or /etc/falco_rules.yaml). This option 
                                can be passed multiple times to read from multiple files/directories.
  -s <stats_file>               If specified, append statistics related to Falco's reading/processing of events to this file (only useful 
                                in live mode).
      --stats-interval <msec>   When using -s <stats_file>, write statistics every <msec> ms. This uses signals, and has a minimum 
                                threshold of 100 ms. Defaults to 5000 (5 seconds).
  -S, --snaplen <len>           Capture the first <len> bytes of each I/O buffer. By default, the first 80 bytes are captured. Use this 
                                option with caution, it can have a strong performance impact. (default: 0)
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
