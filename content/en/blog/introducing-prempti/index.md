---
title: "Introducing Prempti: Falco meets AI coding agents"
date: 2026-05-12
author: Leonardo Grasso
slug: introducing-prempti
tags: ["Prempti", "AI Coding Agents", "Falco"]
---

Today's developer workflow is increasingly reliant on AI coding agents. Tools like Claude Code sit in your terminal, read your files, run shell commands, make network requests, and write code, all on your behalf. They are fast, capable, and increasingly trusted with real tasks on real machines.

But with that trust comes a question worth taking seriously: what exactly is your coding agent doing on your machine?

Today, we're introducing an experimental project that brings Falco to this new frontier: [Prempti](https://prempti.falco.org).

## Agents are a black box at runtime

When a coding agent runs a bash command, writes a file, or reads a configuration, those actions happen inside your user session, with your permissions, in your filesystem, against your credentials. Most developers using these tools have no structured visibility into that activity. You see the agent's chat output, but you don't see what's happening under the hood.

Here's a simple scenario: you ask your coding agent to refactor a module. It reads your source files. It makes edits. Then, perhaps prompted by a malicious dependency or an unexpected instruction in a file it just parsed, it attempts to read `~/.ssh/known_hosts` or write a file to `~/.aws/`. Should it be allowed to? Would you even know if it tried?

The demo below captures exactly this situation:

{{< asciicast src="https://asciinema.org/a/857572.json" poster="npt:0:04" autoPlay=true loop=true >}}

The agent tried to both read and write to sections it's not allowed to, and both were blocked. The agent itself received a structured message explaining why, and showed that to the user. This is detection and enforcement working together at the tool-call level.

## How Prempti works

Prempti runs as a lightweight user-space service alongside your coding agent. It does not require root, kernel modules, or containers. When your agent makes a tool call such as a file write, a shell command, or a file read, Prempti intercepts it **before it executes**, evaluates it against Falco rules, and delivers a verdict:

<div class="table-responsive">
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Verdict</th>
        <th>What Happens</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Allow</strong></td>
        <td>The tool call proceeds normally</td>
      </tr>
      <tr>
        <td><strong>Deny</strong></td>
        <td>The tool call is blocked and the agent is told why</td>
      </tr>
      <tr>
        <td><strong>Ask</strong></td>
        <td>You are prompted to approve or reject interactively</td>
      </tr>
    </tbody>
  </table>
</div>

The architecture looks like this:

1. Prempti's hook fires before each tool call
2. An interceptor sends the event to Falco via a Unix socket
3. Falco's rule engine evaluates the event against your policies
4. Matching rules produce verdicts (deny / ask / allow)
5. The interceptor delivers the verdict back to the agent

Prempti uses Falco's plugin system to define a new event source (`coding_agent`) with fields purpose-built for this context: `tool.name`, `tool.input_command`, `tool.file_path`, `agent.cwd`, and so on.

## Two modes: Monitor and Guardrails

Prempti is designed to let you both observe what the agent is doing and align it with your security policy:

**Monitor mode** evaluates every tool call against your rules and logs the results, but does not enforce any action. This is what we recommend as a starting point: run it for a few sessions, see what your agent actually touches, and tune your rules before you enable blocking.

**Guardrails mode** (the default) fully enforces verdicts as explained above — deny blocks, ask prompts you, allow proceeds.

You can switch between modes at any time:

```shell
premptictl mode monitor      # observe only
premptictl mode guardrails   # enforce verdicts
premptictl logs              # watch live events
```

## Writing rules: Familiar territory

If you've written Falco rules before, agent security policies will feel very familiar. Here's a rule that blocks piping content directly to a shell interpreter, a classic vector for prompt injection attacks:

```yaml
- rule: Deny pipe to shell
  desc: Block piping content to shell interpreters
  condition: >
    tool.name = "Bash"
    and (tool.input_command contains "| sh"
         or tool.input_command contains "| bash"
         or tool.input_command contains "| zsh")
  output: >
    Falco blocked piping to a shell interpreter (%tool.input_command)
  priority: CRITICAL
  source: coding_agent
  tags: [coding_agent_deny]
```

The output field is designed to be LLM-friendly, so that the agent receives it as a structured message it can surface directly to the user. Correlation IDs allow you to trace every event across your logs.

The default ruleset ships with policies covering six areas:

- **Working-directory boundary** — monitor and ask on file access outside the session's project directory
- **Sensitive paths** — deny reads and writes to `/etc/`, `~/.ssh/`, `~/.aws/`, cloud credentials, `.env` files, and similar
- **Sandbox disable** — detect attempts to disable the agent's own sandbox configuration
- **Threats** — credential access, destructive commands, pipe-to-shell, encoded payloads, exfiltration, IMDS access, reverse shells, and supply-chain installs from known-malicious hosts
- **MCP and skill content** — MCP server config poisoning and slash-command file injection
- **Persistence vectors** — hook injection, git hooks, package-registry redirects, AI API base-URL overrides, and API keys leaking into env files

You can add your own rules to `~/.prempti/rules/user/`; they're preserved across upgrades.

## Rule authoring with Claude Code

The project also includes a Claude Code skill for writing Falco rules for Prempti interactively. You can install it directly from the Prempti plugin marketplace:

```
/plugin marketplace add falcosecurity/prempti
/plugin install prempti-falco-rules@prempti-skills
```

Then you can ask Claude Code to create rules like:

- "Block the agent from running git push"
- "Deny any read outside the working directory"
- "Create a rule that requires confirmation before editing Dockerfiles"

The skill guides you through writing the rule, placing it in the right directory, and validating it with Falco. It's a great example of the kind of human-AI collaboration this project is designed to enable: the agent helps you constrain itself.

## Let's be honest about limitations

We want to be clear about what this project is and isn't.

Prempti intercepts tool calls as declared by the agent, not the system calls those tool calls produce. If an agent writes a malicious binary and runs it, Falco sees `gcc main.c -o main` and `./main`, not what `./main` does at the OS level. For deep syscall-level visibility on Linux, Falco's kernel instrumentation (eBPF/kmod) remains the right tool.

Prempti is also not a sandbox. It doesn't prevent a sufficiently determined agent from circumventing the hook mechanism if it can find a path the hook doesn't cover. Think of it as a policy layer at the agent level — a valuable complement to sandboxing and system hardening, not a replacement for them.

What it does provide is visibility and a programmable policy boundary that lives at the most natural enforcement point: the moment the agent decides to act.

## Getting started

Download the latest release from the GitHub repository: https://github.com/falcosecurity/prempti/releases

**macOS:**
```shell
installer -pkg prempti-<version>-darwin-universal.pkg \
          -target CurrentUserHomeDirectory
```
The installer wizard handles everything. The service starts automatically on login.

**Linux:**
```shell
tar xzf prempti-<version>-linux-x86_64.tar.gz
cd prempti-<version>-linux-x86_64
bash install.sh
```

**Windows:**
```shell
msiexec /i prempti-<version>-windows-<arch>.msi
```

Verify your setup:
```shell
premptictl status
premptictl hook status
```

## Explore together with us

Runtime security for AI coding agents is genuinely new territory. The threat models are still being defined. The right default policies are still being discovered. We believe our community of developers, security engineers, and the people running these agents day to day are the ones who will figure out what good looks like here. If you've used Prempti, we'd love to hear what you found:

- What rules have you written? What did you catch?
- What agents or platforms do you need support for?
- What didn't work as expected?

Open an [issue](https://github.com/falcosecurity/prempti/issues), start a [discussion](https://github.com/falcosecurity/prempti/discussions), or come chat with us in the [Falco Slack](https://kubernetes.slack.com/archives/CMWH3EH32). Every piece of feedback shapes what this project becomes.

*Prempti is released under the Apache License 2.0. Currently supports Claude Code on Linux (x86_64, aarch64), macOS (Apple Silicon, Intel), and Windows (x86_64, ARM64). Codex integration is on the roadmap.*
