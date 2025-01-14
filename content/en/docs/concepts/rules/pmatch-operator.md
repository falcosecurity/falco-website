---
title: Using the pmatch Operator to Match File System Paths
description: How the pmatch Operator Works
linktitle: Using pmatch Operator
weight: 100
aliases:
- ../../rules/pmatch-operator
---

## Introduction

This section provides more detail on the `pmatch` (prefix match) [operator](/docs/rules/conditions/#operators).

### How `pmatch` Works

The `pmatch` operator matches a left hand side filesystem path that is the value for a given falco field like `fd.name`, `evt.rawarg.path`, `fs.path.name`, etc. against a set of right hand side filesystem path prefixes. It returns true if any of the right hand side paths is a prefix of the left hand side path. Here's an example:

```
fd.name pmatch (/var/run, /var/spool, /etc, /boot)
```

If the value for `fd.name` were `/var/spool/maillog`, this expression would evaluate to true. If the value for `fd.name` were `/opt/data/file.txt`, this expression would evaluate to false.

Functionally, it is equivalent to the following:

```
fd.name startswith /var/run or fd.name startswith /var/spool or fd.name startswith /etc or fd.name startswith /boot
```

However, using `pmatch` allows the comparison to be done in parallel, against all prefixes at once, instead of individually.

The implementation of `pmatch` builds a tree-like data structure using all the right hand side paths, broken on directory separators, and then traverses the tree using the path components from the left hand side path. If the traversal gets to a leaf node in the tree, it evaluates to true.

#### `pmatch` Can Contain Globs

As of Falco 0.36, the right hand paths used by `pmatch` can contain glob wildcards. Here's an example:

```
fd.name pmatch (/var/*/*.txt, /etc, /boot)
```

This expression would evaluate to true for `/var/spool/log.txt` as well as `/var/run/file.txt`.

This matching differs from the `glob` operator as `glob` requires the left hand side to fully match the glob, while `pmatch` still allows for a prefix match. So for an expression like `fd.name pmatch (/var/*)` vs `fd.name glob /var/*` and when fd.name has the value `/var/run/file.txt`, the pmatch expression would evaluate to true while the glob expression would not. When glob is evaluated against a path, wildcards don't cross directory separators. See the sentence "Globbing is applied on each of the components of a pathname separately." at the [man page](https://man7.org/linux/man-pages/man7/glob.7.html) for glob.
