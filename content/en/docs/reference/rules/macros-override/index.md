---
title: Macros to Override
linktitle: Macros to Override
description: Control the behavior of some rules by enabling or disabling these default macros
weight: 25
---

Falco also provide Macros that should be overridden by the user to provide settings that are specific to a user's environment. The provided Macros can also be appended to in a local rules file.

The below macros contain values that can be overridden for a user's specific environment.

### Common SSH Port

Override this macro to reflect ports in your environment that provide SSH services.

{{< markdown_inline contentPath = "/docs/reference/rules/macros-override/ssh_port.md" >}}

### Allowed SSH Hosts

Override this macro to reflect hosts that can connect to known SSH ports (ie a bastion or jump box).

{{< markdown_inline contentPath = "/docs/reference/rules/macros-override/allowed_ssh_hosts.md" >}}

### User Whitelisted Containers

Whitelist containers that are allowed to run in privileged mode.

{{< markdown_inline contentPath = "/docs/reference/rules/macros-override/user_trusted_containers.md" >}}

### Containers Allowed to Spawn Shells

Whitelist containers that are allowed to spawn shells, which may be needed if containers are used in the CI/CD pipeline.

{{< markdown_inline contentPath = "/docs/reference/rules/macros-override/user_shell_container_exclusions.md" >}}

### Containers Allowed to Communicate with EC2 Metadata Services

Whitelist containers that are allowed to communicate with the EC2 metadata service. Default: any container.

{{< markdown_inline contentPath = "/docs/reference/rules/macros-override/ec2_metadata_containers.md" >}}

### Kubernetes API Server

Set the IP of your Kubernetes API Service here.

{{< markdown_inline contentPath = "/docs/reference/rules/macros-override/k8s_api_server.md" >}}

### Containers Allowed to Communicate with the Kubernetes API

Whitelist containers that are allowed to communicate with the Kubernetes API Service. Requires k8s_api_server being set.

{{< markdown_inline contentPath = "/docs/reference/rules/macros-override/k8s_containers.md" >}}

### Containers Allowed to Communicate with Kubernetes Service NodePorts

{{< markdown_inline contentPath = "/docs/reference/rules/macros-override/nodeport_containers.md" >}}
