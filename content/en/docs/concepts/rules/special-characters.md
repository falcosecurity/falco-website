---
title: Escaping Special Characters
description: Escape special characters in your Falco Rules
linktitle: Escaping Special Characters
weight: 90
aliases:
- ../../rules/special-characters
---

In some cases, rules may need to contain special characters like `(`, spaces, etc. For example, you may need to look for a `proc.name` of `(systemd)`, including the surrounding parentheses.

You can use `"` to capture these special characters. Here's an example:

```yaml
- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name="(systemd)" or proc.name=systemd
  output: "File opened by systemd | user=%user.name command=%proc.cmdline file=%fd.name"
  priority: WARNING
```

When including items in {{< glossary_tooltip text="lists" term_id="lists" >}}, ensure that the double quotes are not interpreted from your YAML file by surrounding the quoted string with single quotes. Here's an example:

```yaml
- list: systemd_procs
  items: [systemd, '"(systemd)"']

- rule: Any Open Activity by Systemd
  desc: Detects all open events by systemd.
  condition: evt.type=open and proc.name in (systemd_procs)
  output: "File opened by systemd | user=%user.name command=%proc.cmdline file=%fd.name"
  priority: WARNING
```

## Byte escapes and YAML quoting

Since Falco 0.45, quoted condition strings support `\xHH`, where `HH` is exactly two hexadecimal digits identifying one byte. Existing escapes include `\n` for a newline, `\t` for a tab, and `\\` for a literal backslash.

YAML parses the rule before Falco parses its condition. A YAML block scalar preserves the backslashes for Falco:

```yaml
- rule: Filename contains an invalid UTF-8 byte
  desc: Detect opens of filenames containing byte 0xFF.
  condition: >-
    evt.type in (open, openat, openat2) and fd.name contains "\xFF"
  output: File opened with an invalid UTF-8 byte (file=%fd.name)
  priority: WARNING
```

These two YAML scalars express the same condition:

```yaml
condition: 'fd.name contains "\xFF"'
```

```yaml
condition: "fd.name contains \"\\xFF\""
```

With a double-quoted YAML scalar, escape the backslash as `\\` so Falco receives `\xFF`. Writing `\xFF` directly in a double-quoted YAML scalar asks YAML to decode a character, which does not express the same raw byte.

List items also need to preserve the quotes that Falco parses:

```yaml
- list: suspicious_filename_bytes
  items: ['"\xFF"', '"\xFE"']

- macro: filename_has_suspicious_bytes
  condition: fd.name contains anyof (suspicious_filename_bytes)
```

To match NUL in a byte-buffer field, use `evt.buffer contains "\x00"`. Filter values containing NUL are rejected for other field types. For `bcontains` and `bstartswith`, supply hexadecimal digits directly, such as `evt.buffer bcontains 00FF`.

See [string matching and character encoding](/docs/concepts/rules/conditions/#string-matching-and-character-encoding) for the special handling of `regex` and the changes to matching in Falco 0.45.
