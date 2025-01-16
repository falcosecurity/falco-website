---
title: Alert Formatting
description: Learn how to format and customize Falco alerts
linktitle: Formatting
aliases:
- ../../alerts/formatting
- ../../outputs/formatting
weight: 20
---

Previous guides introduced the [Output Fields of Falco Rules](/docs/concepts/rules/basic-elements/#output) and provided [Guidelines](/docs/concepts/rules/style-guide/#output-fields) on how to use them. This section highlights additional global formatting options for your deployment, complementing the information previously provided.

Adding the same output field to multiple rules by manually editing rule files can be tedious. Fortunately, Falco provides several ways to simplify this process:

- Using the `append_output` configuration option in `falco.yaml` to add output text or fields to a subset of loaded rules
- Adding an override to a specific rule to replace its output

## Appending Extra Output and Fields with `append_output`

The `append_output` option can be specified in the `falco.yaml` configuration file. You can use it to add extra output to rules specified by source, tag, name, or to all rules unconditionally. The `append_output` section is a list of items that are applied in the order they appear.

**Example:**

```yaml
append_output:
  - match:
      source: syscall
    extra_output: "on CPU %evt.cpu"
    extra_fields:
      - home_directory: "${HOME}"
      - evt.hostname
```

In this example:

- Every rule with the `syscall` source will have `on CPU %evt.cpu` appended at the end of the regular output line.  
- The rule will also include the additional fields (`home_directory` and `evt.hostname`) in the JSON output under `output_fields`. These extra fields do not appear in the regular (text) output.  
- Environment variables (like `$HOME`) expansion is supported in the configuration file, so for `extra_fields` as well.

### Matching Rules

The `match` section allows you to filter which rules are modified:

- `source`: filters rules by source (e.g., `syscall` or plugin names)
- `rule`: filters by the complete rule name
- `tags`: filters by a list of tags (all listed tags must be present)

If multiple conditions are specified under `match`, all must be met for the entry to apply. If no conditions are specified—or `match` is omitted—then the entry applies to all rules.

## Adding an Override to a Specific Rule

Note that `append_output` only *adds* output to an existing rule; it does not remove or replace existing fields. To remove or replace output fields, you can add another rule file (loaded after the original) that uses an [override](/docs/rules/overriding/#append-and-replace-items-in-a-rule). For example:

```yaml
- rule: Read sensitive file trusted after startup
  output: A file (user=%user.name command=%proc.cmdline file=%fd.name) was read after startup
  override:
    output: replace
```

### Suggested Output Fields

By default, Falco can also include "suggested" fields from plugins implementing the extraction capabilities. This is especially useful if certain plugins mark some fields as recommended for output. Those fields will appear automatically in your alerts.

Below is an example configuration entry that enables suggested output fields unconditionally for any source:

```yaml
append_output:
  - suggested_output: true  # Enable the use of extractor plugins' suggested fields for all matching sources.
```

When `suggested_output` is set to `true`, any extractor plugin that provides "suggested" fields will add them to the output in the form `plugin_field_name=$plugin.field`.

### Command-Line Usage

You can also specify this option on the command line via the `-o` flag, for example:

```bash
falco ... \
  -o 'append_output[]={"match": {"source": "syscall"}, "extra_output": "on CPU %evt.cpu", "extra_fields": ["evt.hostname"]}'
```

## Example Rule and Various Scenarios

Consider the rule:

```yaml
- rule: Drop and execute new binary in container
  desc: SKIPPED
  condition: >
    spawned_process
    and container
    and proc.is_exe_upper_layer=true
    and not container.image.repository in (known_drop_and_execute_containers)
  output: Executing binary not part of base image (proc_sname=%proc.sname user=%user.name process=%proc.name proc_exepath=%proc.exepath parent=%proc.pname command=%proc.cmdline terminal=%proc.tty %container.info)
  priority: CRITICAL
  tags: [maturity_stable, container, process, mitre_persistence, TA0003, PCI_DSS_11.5.1]
```

### Scenario 1

- The rule output includes `%container.info`.
- Falco is started without additional command-line flags:

```bash
sudo /usr/bin/falco -c /etc/falco/falco.yaml -r falco_rules_test.yaml
```

Output example:

```bash
03:00:45.104332605: Critical Executing binary not part of base image (proc_sname=bash user=root process=sleep proc_exepath=/tmp/sleep parent=bash command=sleep 10000 terminal=34816 container_id=0fdb3cd5b5fc container_name=optimistic_newton)
```

By default, `%container.info` includes `%container.id` and `%container.name`, but no other container metadata is shown.

### Scenario 2

- The rule output includes `%container.info`.
- Falco is started with the `-pc` flag:

```bash
sudo /usr/bin/falco -c /etc/falco/falco.yaml -r falco_rules_test.yaml -pc
```

Output example:

```bash
03:02:52.019002207: Critical Executing binary not part of base image (proc_sname=bash user=root process=sleep proc_exepath=/tmp/sleep parent=bash command=sleep 10000 terminal=34816 container_id=0fdb3cd5b5fc container_image=ubuntu container_image_tag=latest container_name=optimistic_newton)
```

Here, the default container fields (e.g., `%container.image`, `%container.image_tag`) are included.

### Scenario 3

- The rule output includes `%container.info`.
- Falco is started with the `-pk` flag:

```bash
sudo /usr/bin/falco -c /etc/falco/falco.yaml -r falco_rules_test.yaml -pk
```

Output example:

```bash
03:03:23.573329751: Critical Executing binary not part of base image (proc_sname=bash user=root process=sleep proc_exepath=/tmp/sleep parent=bash command=sleep 10000 terminal=34816 container_id=0fdb3cd5b5fc container_image=ubuntu container_image_tag=latest container_name=optimistic_newton k8s_ns=my_ns k8s_pod_name=my_pod_name)
```

In this case, the default container fields and Kubernetes fields are included.

### Scenario 4

- The rule output includes `%container.info`.
- Falco is started with the `-p` flag, providing custom output fields:

```bash
sudo /usr/bin/falco -c /etc/falco/falco.yaml -r falco_rules_test.yaml \
     -p "k8s_pod_uid=%k8s.pod.uid proc_pexepath=%proc.pexepath"
```

Output example:

```bash
03:05:34.475000383: Critical Executing binary not part of base image (proc_sname=bash user=root process=sleep proc_exepath=/tmp/sleep parent=bash command=sleep 10000 terminal=34816 container_id=0fdb3cd5b5fc container_name=optimistic_newton) k8s_pod_uid=my_pod_uid proc_pexepath=/usr/bin/bash
```

Here, your custom fields (`k8s_pod_uid` and `proc_pexepath`) appear along with `%container.id` and `%container.name`, which come from `%container.info` in the rule definition.