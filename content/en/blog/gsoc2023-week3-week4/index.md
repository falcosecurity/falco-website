---
Title: "Gsoc Week-3 and Week-4 updates"
Description: "Adaptive syscalls selection with the new base_syscalls option"
Date: 2023-07-18
Author: Rohith Raju
slug: gsoc-2023-3rd-4th-week
tags: ["Gsoc","Week 3", "Week 4"]
images:
  - /blog/gsoc2023-week3-week4/images/falco-gsoc-featured.jpg
---

This week I worked on creating `parsers` for the syscalls that I added previously. I learnt how metadata is extracted from
the syscalls to provied user with more context on the triggred syscall. We also compiled Falco's main repository from which
the web application will be built on. As always, thanks to my mentor [Jason Dellaluce](https://github.com/jasondellaluce) for assisting me! 

# Wasm Target For Falco 🦅

Now that [Libs](https://github.com/falcosecurity/libs) has wasm support, it's time for [Falco](https://github.com/falcosecurity/falco) to get it's new target as well. 

Similar approch to libs was followed here as well. We first modified `cmakelist` to add the wasm target and added the `preprossesor` checks for emscripten. Finally we added `CI` to build and test wasm target for flaco. 

More information about this, [here](https://github.com/falcosecurity/falco/pull/2663/files).

A quick run of `falco --help` command through `node.js` 🤩

```
root@rohithraju:~/code/falco/build_emcc# node ./userspace/falco/falco.js --help
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
  -i                            Print all high volume syscalls that are ignored by default for performance reasons (i.e. without the -A 
                                flag) and exit.
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

# Conclusions

Overall, I had so much fun building parsers for [memfd_syscall](https://github.com/falcosecurity/libs/pull/1162) and diving into the [Falco's main repository](https://github.com/falcosecurity/falco). Going foward, I'll be working on front-end side of things which is very exciting. I'll have to come up with UI/UX designs which takes be back to the days I started my web developemt journey. I'm super ready to flex my creative muscles 😁.