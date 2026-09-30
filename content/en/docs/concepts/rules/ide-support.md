---
title: IDE Support
description: IDE Support for Falco Rules Files
linktitle: IDE Support
weight: 250
aliases:
- ../../rules/ide-support
---

For some Integrated Development Environment (IDE) Editors, there is support for falco rules files that allow for on-the-fly syntax checking and validation of rules content.

#### Visual Studio Code

The [Falco Rules](https://marketplace.visualstudio.com/items?itemName=c2ndev.falco-rules) extension for VS Code provides syntax highlighting, hover documentation, and real-time validation of Falco rules files. It is powered by [falco-lsp](https://github.com/falcosecurity/falco-lsp), the official Falco Language Server Protocol implementation.

Features include:

- Syntax highlighting for `.yaml` Falco rules files
- Hover documentation for fields, macros, and rule elements
- Real-time diagnostics backed by the Falco rule engine

Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=c2ndev.falco-rules) or search for **"Falco Rules"** in the VS Code Extensions panel.

#### Emacs

For emacs, there is a [Flycheck](https://www.flycheck.org) checker called [flycheck-falco-rules](https://github.com/falcosecurity/flycheck-falco-rules):

![](https://github.com/falcosecurity/flycheck-falco-rules/raw/main/flycheck-falco-rules-example.png)

#### Falco Playground (browser)

The [Falco Playground](https://falcosecurity.github.io/falco-playground/) is a browser-based editor with live rule validation powered by the official Falco WebAssembly build. No local installation is required — paste or write rules and get immediate feedback from the Falco engine.
