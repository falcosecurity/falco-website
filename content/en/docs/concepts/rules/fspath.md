---
title: Accessing File System Paths in Falco Rules
description: How fs.path.* fields work
linktitle: Accessing File System Paths
weight: 100
---

## Introduction

This section explains how the fields `fs.path.*` work and when they can be used.

### Motivation

A variety of different syscalls take file system paths as arguments. However, there is little consistency in the fields that can access those file system paths. Depending on the syscall, the file system path might be available in `evt.rawarg.path`, `evt.rawarg.pathname`, `evt.rawarg.name`, `fd.name`, etc. And for some system calls, the file system path is in the enter event instead of the exit event. This makes writing simple Falco rules that act on file system paths challenging because the field must depend on the syscall and the event direction.

To help address this inconsistency, in Falco version 0.36, we added a new set of fields that normalize file system paths across various syscalls.

#### What Counts As A File System Path?

Lots of existing fields also refer to file system paths. For example, `proc.exepath` contains the file system path for an executable, and there are related fields `proc.pexepath`/`proc.aexepath`. `container.mount.*` fields all contain the file system paths for file systems mounted into a container.

The `fs.path.*` fields are *only* populated for syscalls generally related to reading, writing, or modifying some file system object and have a file system path as an argument. The goal is to have a single set of fields that can always be relied on to refer to those paths, compared to checking the widely varying per-event fields.

### `fs.path.*` fields

The following fields are available for any syscall that operates on a file system path:

* fs.path.name
* fs.path.nameraw
* fs.path.source
* fs.path.sourceraw
* fs.path.target
* fs.path.targetraw

`fs.path.name` is for file operations that work on a path like open, unlink, rmdir, etc. For other file operations that have a source and target, like cp, symlink, link, mv, etc., there are fields `fs.path.source` and `fs.path.target`.

These convert relative paths to absolute paths when needed, using the thread's current working directory (cwd).

`fs.path.nameraw/fs.path.sourceraw/fs.path.targetraw` are like the above but do *not* convert relative paths to absolute paths. They always contain the original path, which may or may not be relative.

The fields only work for exit events and only return a value if the syscall succeeds.

The below tables show:
* the specific syscalls that are are supported
* the specific falco event identifers are supported. The reason there are multiple event identifers for the same syscall (e.g. MKDIR vs MKDIR_2) is that libs used to define new events every time we added/modified arguments to the enter or exit event. Older applications using the older version of libs will use the older event identifier for the syscall name, while newer applications will use the newer event identifier.
* the specific event fields that are mapped to `fs.path.*` fields
* whether the fields actually come from the enter event instead of the exit event.

#### Single Argument File System Syscalls

| Syscall  | `fs.path.name` field |
| -------  | ---------------------|
| mkdir    | `evt.rawarg.path`    |
| mkdirat  | `evt.rawarg.path`    |
| rmdir    | `evt.rawarg.path`    |
| unlink   | `evt.rawarg.path`    |
| unlinkat | `evt.rawarg.name`    |
| open     | `evt.rawarg.name`    |
| openat   | `evt.rawarg.name`    |
| openat2  | `evt.rawarg.name`    |
| fchmod   | `fd.name`            |
| fchmodat | `evt.rawarg.filename`|
| chmod    | `evt.rawarg.filename`|
| chown    | `evt.rawarg.path`    |
| lchown   | `evt.rawarg.path`    |
| fchown   | `fd.name`            |
| fchownat | `evt.rawarg.pathname`|
| quotactl | `evt.rawarg.special` |
| umount   | `evt.rawarg.name`    |
| umount2  | `evt.rawarg.name`    |

#### Source/Target File System Syscalls

| Syscall    | `fs.path.source` field | `fs.path.target` field |
| ---------- | -----------------------| -----------------------|
| rename     | `evt.rawarg.oldpath`   | `evt.arg.newpath`      |
| renameat   | `evt.rawarg.oldpath`   | `evt.arg.newpath`      |
| renameat2  | `evt.rawarg.oldpath`   | `evt.arg.newpath`      |
| link       | `evt.arg.newpath`      | `evt.rawarg.oldpath`   |
| linkat     | `evt.arg.newpath`      | `evt.rawarg.oldpath`   |
| symlink    | `evt.arg.linkpath`     | `evt.rawarg.target`    |
| symlinkat  | `evt.arg.linkpath`     | `evt.rawarg.target`    |
| mount      | `evt.rawarg.dev`       | `evt.rawarg.dir`       |

### Example Rule Using `fs.path.*` Fields

Here is an example rule that allows monitoring a wide variety of different file related operations below a set of specifed root directories:

```
- list: file_operation_paths
  items: [/tmp/example-dir]

- macro: file_operation
  condition: (mkdir or rename or remove or open_write or create_symlink or evt.type in (link, linkat))

- rule: Any File Related Operation on Path
  desc: Detect any file operation on a single path
  condition: (fs.path.name pmatch (file_operation_paths) or fs.path.source pmatch (file_operation_paths) or fs.path.target pmatch (file_operation_paths)) and file_operation
  output: >
      Some File Related Operation on Path (evt.type=%evt.type path=%fs.path.name source=%fs.path.source
           target=%fs.path.target %user.name=%user.name proc.cmdline=%proc.cmdline proc.pcmdline=%proc.pcmdline
	   container.id=%container.id container.name=%container.name image=%container.image.repository)
  priority: DEBUG
  source: syscall
```
