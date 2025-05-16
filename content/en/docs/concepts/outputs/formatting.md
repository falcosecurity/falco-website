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

When `suggested_output` is set to `true`, any extractor plugin that provides "suggested" fields will add them to the output in the form `plugin_field_name=$plugin.field_name`.

### Command-Line Usage

You can also specify this option on the command line via the `-o` flag, for example:

```bash
falco ... \
  -o 'append_output[]={"match": {"source": "syscall"}, "extra_output": "on CPU %evt.cpu", "extra_fields": ["evt.hostname"]}'
```