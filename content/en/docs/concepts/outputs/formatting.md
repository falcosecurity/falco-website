---
title: Formatting
description: Format Falco Alerts for Containers and Kubernetes
linktitle: Output Formatting
aliases:
- ../../alerts/formatting
- ../../outputs/formatting
weight: 20
---

Previous guides introduced the [Output Fields of Falco Rules](/docs/rules/basic-elements/#output) and provided [Guidelines](/docs/rules/style-guide/#output-fields) on how to use them. This section specifically highlights additional global formatting options for your deployment, complementing the information previously provided.

Adding the same output field to multiple rules by editing the rule files manually can be tedious. Thankfully, Falco offers several ways to make it easier:

* Using the `append_output` configuration option in `falco.yaml` to add output text or fields to a subset of loaded rules
* Adding an override to a specific rule to replace its output
* Using the `-p` CLI switches

## Appending extra output and fields with `append_output`

Since Falco 0.39.0, the `append_output` option can be specified in the `falco.yaml` configuration file and it can be used to add extra output to rules specified by source, tag, name or to all rules unconditionally. The `append_output` section is a list of append entries which are applied in order.

Example:

```yaml
append_output:
  - match:
      source: syscall
    extra_output: "on CPU %evt.cpu"
    extra_fields:
      - home_directory: "${HOME}"
      - evt.hostname
```

In the example above, every rule with the `syscall` source will get `"on CPU %evt.cpu"` output appended at the end of the regular line and also gain additional fields only visible in the JSON output under the `output_fields` key which will not appear in the regular output. Environment variables are supported.

The `match` section can be used to specify optional conditions:

* `source`: with `syscall` or plugin names
* `rule`: with a complete rule name
* `tags`: a list of tags that need to be all present in a rule in order to match

If multiple conditions are specified all need to be present in order to match. If none are specified or `match` is not present output is appended to all rules.

This option can also be specified on the command line via `-o` such as:

```sh
falco ... -o 'append_output[]={"match": {"source": "syscall"}, "extra_fields": ["evt.hostname"], "extra_output": "on CPU %evt.cpu"}'
```

## Adding an override to a specific rule

Note that the `append_output` option allows to add output to a rule but not to remove or replace it. In order to do so you need to add another rule file, loaded in order after others, which contains [a replace override](/docs/rules/overriding/#append-and-replace-items-in-a-rule) for the output field, like in the example below:

```yaml
- rule: Read sensitive file trusted after startup
  output: A file (user=%user.name command=%proc.cmdline file=%fd.name) was read after startup
  override: 
    output: replace
```

## Using the `-p` CLI switches

Falco supports event decoration for associated [Container](https://falco.org/docs/reference/rules/supported-fields/#field-class-container) and [Kubernetes](https://falco.org/docs/reference/rules/supported-fields/#field-class-k8s) metadata using a special placeholder field  (`%container.info`) in a rule's output section.

To take advantage of event decoration, you need to run Falco with either the `-pk` or `-pc` command-line option.

Falco also provides a `-p` flag that lets you define additional custom output fields to be included in each rule. Please note that `-p something` is effectively the same as `-o 'append_output[]={"extra_output": "something"}'` and will be evaluated last.

## Example Rule

```yaml
- rule: Drop and execute new binary in container
  desc: SKIPPED
  condition: 
    spawned_process
    and container
    and proc.is_exe_upper_layer=true 
    and not container.image.repository in (known_drop_and_execute_containers)
  output: Executing binary not part of base image (proc_sname=%proc.sname user=%user.name process=%proc.name proc_exepath=%proc.exepath parent=%proc.pname command=%proc.cmdline terminal=%proc.tty %container.info)
  priority: CRITICAL
  tags: [maturity_stable, container, process, mitre_persistence, TA0003, PCI_DSS_11.5.1]
```

*Scenario 1*

The rule outputs include `%container.info`, but Falco is started without any command line flags:

```bash 
sudo /usr/bin/falco  -c /etc/falco/falco.yaml -r falco_rules_test.yaml
```

In this case Falco will output `%container.id` and `%container.name` but no other container metadata will be displayed:

```bash
03:00:45.104332605: Critical Executing binary not part of base image (proc_sname=bash user=root process=sleep proc_exepath=/tmp/sleep parent=bash command=sleep 10000 terminal=34816 container_id=0fdb3cd5b5fc container_name=optimistic_newton)
```

*Scenario 2*

The rule outputs include `%container.info`, and Falco is started with the `-pc` flag:

```bash 
sudo /usr/bin/falco  -c /etc/falco/falco.yaml -r falco_rules_test.yaml -pc
```

The output includes the default container fields:

```bash
03:02:52.019002207: Critical Executing binary not part of base image (proc_sname=bash user=root process=sleep proc_exepath=/tmp/sleep parent=bash command=sleep 10000 terminal=34816 container_id=0fdb3cd5b5fc container_image=ubuntu container_image_tag=latest container_name=optimistic_newton)
```

*Scenario 3*

The rule outputs include `%container.info`, and Falco is started with the `-pk` flag:

```bash 
sudo /usr/bin/falco  -c /etc/falco/falco.yaml -r falco_rules_test.yaml -pk
```

Output includes the default container fields and the default Kubernetes fields:

```bash
03:03:23.573329751: Critical Executing binary not part of base image (proc_sname=bash user=root process=sleep proc_exepath=/tmp/sleep parent=bash command=sleep 10000 terminal=34816 container_id=0fdb3cd5b5fc container_image=ubuntu container_image_tag=latest container_name=optimistic_newton k8s_ns=my_ns k8s_pod_name=my_pod_name)
```

*Scenario 4*

The rule outputs include `%container.info`, and you run Falco with the `-p` flag while providing custom output fields:

```bash 
sudo /usr/bin/falco  -c /etc/falco/falco.yaml -r falco_rules_test.yaml -p "k8s_pod_uid=%k8s.pod.uid proc_pexepath=%proc.pexepath"
```

The output includes your custom output fields along with the default `%container.id` and `%container.name` because the rule still contained the `%container.info` placeholder field:

```bash
03:05:34.475000383: Critical Executing binary not part of base image (proc_sname=bash user=root process=sleep proc_exepath=/tmp/sleep parent=bash command=sleep 10000 terminal=34816 container_id=0fdb3cd5b5fc container_name=optimistic_newton) k8s_pod_uid=my_pod_uid proc_pexepath=/usr/bin/bash
```
