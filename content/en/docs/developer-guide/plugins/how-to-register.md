---
title: How to register a plugin
linktitle: Public registry
description: How to register a plugin in the Falco Plugin Registry
weight: 30
aliases:
- ../plugins/how-to-register
---

## Plugin Registry

The [registry](https://github.com/falcosecurity/plugins) is a GitHub repository that provides metadata and information about all plugins recognized by The Falco Project. It includes plugins hosted within this repository as well as those located in other repositories. These plugins are developed for Falco and shared with the community.

## Registering your plugin

In this section, we’ll outline the key steps to get your plugin registered successfully.

To complete the registration process, you’ll need to:

1. Create a clear and well-structured **README** for your plugin.  
2. Fill in all the required fields in the `plugins` section of the [registry.yaml](https://github.com/falcosecurity/plugins/blob/master/registry.yaml) file, like in the below example.

```yaml
plugins:
    source:
      - id: 2
        source: aws_cloudtrail
        name: cloudtrail
        description: Reads Cloudtrail JSON logs from files/S3 and injects as events
        authors: The Falco Authors
        contact: https://falco.org/community
        url: https://github.com/falcosecurity/plugins/tree/master/plugins/cloudtrail
        license: Apache-2.0
```

### License

You're free to choose the open source license you want, you can check [https://choosealicense.com/](https://choosealicense.com/) for help. Most of the current plugins are under Apache License 2.0.

### ID

Every source plugin requires its own unique plugin event `ID` to interoperate with `Falco` and the other plugins. This `ID` is used in the following ways:

* It is stored inside in-memory event objects and used to identify the associated plugin that injected the event.
* It is stored in capture files and used to recreate in-memory event objects when reading capture files.

It must be unique to ensure that events written by a given plugin will be properly associated with that plugin (and its event sources, see below).

### Name

Each plugin in the registry must have its own `name` and can be different from `event source`, which can be shared across multiple plugins (e.g., for k8s audit logs, there might be several plugins but only one type of `event source`).

The `name` should match this regular expression `^[a-z]+[a-z0-9_]*$`.

### Fields

The `fields` are used for conditions in rules. Describe the available fields of your plugin in the README.

For example:

| Name                     | Type   | Description                    |
| ------------------------ | ------ | ------------------------------ |
| `docker.status`          | string | Status of the event            |
| `docker.id`              | string | ID of the event                |
| `docker.from`            | string | From of the event (deprecated) |
| `docker.type`            | string | Type of the event              |
| `docker.action`          | string | Action of the event            |
| `docker.stack.namespace` | string | Stack Namespace                |

### Propose your Plugin

Once you're ready, follow these steps to submit your plugin for registration:

1. **Fork** the [falcosecurity/plugins repository](https://github.com/falcosecurity/plugins).  
2. **Update** the [`registry.yaml`](https://github.com/falcosecurity/plugins/edit/master/registry.yaml) file by adding your plugin to the `plugins` section.  
3. **Make sure to follow our [Contributing Guide](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md)**, e.g. all commits must be **signed-off**.
4. **Submit a Pull Request (PR)** to the [falcosecurity/plugins repository](https://github.com/falcosecurity/plugins).  

For more details, check out the [plugin registration documentation](https://github.com/falcosecurity/plugins#registering-a-new-plugin).
