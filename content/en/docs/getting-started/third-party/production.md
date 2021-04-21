---
title: Production Environment
description: Integrations built on the Falco core in a production environment
weight: 3
---

## Flatcar Linux

The recommended way to run Falco on Flatcar Linux is inside of its own Docker container using the install commands in the [Docker section](/docs/getting-started/running#docker). This method allows full visibility into all containers on the host OS.

This method is automatically updated, includes some nice features such as automatic setup and bash completion, and is a generic approach that can be used on other distributions outside Flatcar Linux as well.

However, some users may prefer to run Falco in the Flatcar Linux toolbox. While not the recommended method, this can be achieved by installing Falco inside the toolbox using the normal installation method, and then manually running the `falco-driver-loader` script:

```shell
toolbox 
curl -s https://falco.org/script/install | bash
falco-driver-loader
```


## GKE

Google Kubernetes Engine (GKE) uses Container-Optimized OS (COS) as the default operating system for its worker node pools. COS is a security-enhanced operating system that limits access to certain parts of the underlying OS. Because of this security constraint, Falco cannot insert its kernel module to process events for system calls. However, COS provides the ability to leverage eBPF (extended Berkeley Packet Filter) to supply the stream of system calls to the Falco engine.

Falco can use eBPF with minimal configuration changes. To do so, set the `FALCO_BPF_PROBE` environment variable to an empty value: `FALCO_BPF_PROBE=""`.

eBPF is currently supported only on GKE and COS, however here we provide installation details for a wider set of platforms

{{% pageinfo color="primary" %}}
 If you want to specify an alternative path for the probe file, you can also set `FALCO_BPF_PROBE` to the path of an existing eBPF probe.
{{% /pageinfo %}}

When using the official container images, setting this environment variable will trigger the `falco-driver-loader` script to download the kernel headers for the appropriate version of COS, and then compile the appropriate eBPF probe. In all the other environments you can call the `falco-driver-loader` script yourself to obtain it in this way:

```bash
sudo FALCO_VERSION="{{< latest >}}" FALCO_BPF_PROBE="" falco-driver-loader
```

To execute the script above successfully, you will need `clang` and `llvm` installed.

If you are installing Falco from packages, you will need to edit the `falco` systemd unit.

You can do that by executing the following command:

```bash
systemctl edit falco
```

It will open your editor, at this point you can set the environment variable for the unit by adding this content
to the file:

```
[Service]
Environment='FALCO_BPF_PROBE=""'
```

If you are [installing Falco with Helm](https://falco.org/docs/third-party/#helm), you will need to set the `ebpf.enabled` option to `true`:

```
helm install falco falcosecurity/falco --set ebpf.enabled=true
```
