---
title: Running
description: Operating and Managing Falco
weight: 40
aliases:
- ../getting-started/running
---

## Falco packages

If you installed the Falco packages using the `dialog` all your services should be already up and running, while if you chose the `Manual configuration` or if you used the `FALCO_FRONTEND=noninteractive` env variable you have to configure services by your hand. Here we show a simple example with the `eBPF probe`.

Let's imagine we want to start the `falco-bpf.service`.

1. Type `systemctl list-units | grep falco` to check that no unit is running.

2. Now you have to decide whether you want the Falcoctl service running together with the Falco one. If yes you don't have to do anything, else you will need to mask the Falcoctl service with `systemctl mask falcoctl-artifact-follow.service`. As pointed out [in this section](/docs/getting-started/installation/#rule-update) the Falcoctl service is strictly related to the Falco one so if you don't mask it, it will be started together with the Falco service.

3. Type `falcoctl driver config --type ebpf` to configure Falco to use eBPF driver, then `falcoctl driver install` to download/compile the eBPF probe.

4. Now running `systemctl start falco-bpf.service` and typing `systemctl list-units | grep falco` you should see something like that (supposing you didn't mask the Falcoctl service):

    ```text
    falco-bpf.service                                 loaded active running   Falco: Container Native Runtime Security with ebpf
    falcoctl-artifact-follow.service                  loaded active running   Falcoctl Artifact Follow: automatic artifacts update service
    ```

5. If you want to stop both services in one shot

    ```bash
    systemctl stop falco-bpf.service
    ```
    
### Automatic driver selection

Please note that since Falco 0.38.0, its packages will leverage a falcoctl driver-loader feature to autodetect the best driver to be used by the system.
The algorithm will try to use the `modern_ebpf` driver wherever it is supported, falling back at other drivers where needed features are not available.

### Custom run

You may have noticed a Falco unit called `falco-custom.service`. You should use it when you want to run Falco with a custom configuration like a plugin or Gvisor. Please note that in this case you have to modify this template according to how you want to run Falco, the unit should not be used as is!

## Falco binary

Since Falco 0.38.0, the default configured driver is `modern_ebpf`; if you are willing to change it, here you can find some examples of how to run Falco after having [installed](/docs/getting-started/installation/#falco-binary) it using the binary package


```bash
# Default driver as set in the Falco config file
falco
# Force eBPF probe
falco -o engine.kind=ebpf
# Force kernel module
falco -o engine.kind=kmod
# For more info see all available options
falco --help
```

{{% pageinfo color="warning" %}}

If you are using the eBPF probe, in order to ensure that performance is not degraded, make sure that

* Your kernel has `CONFIG_BPF_JIT` enabled
* `net.core.bpf_jit_enable` is set to 1 (enable the BPF JIT Compiler)
* This can be verified via `sysctl -n net.core.bpf_jit_enable`

{{% /pageinfo %}}


## Rules validation

It's possible to validate Falco rules without installation by using the Docker image.

```bash
export RULES_PATH=<PATH_TO_YOUR_RULES_HERE>
docker run --rm \
    -v ${RULES_PATH}:/etc/falco/my-rules \
    falcosecurity/falco:latest /usr/bin/falco \
    -r /etc/falco/falco_rules.yaml \
    -r /etc/falco/my-rules \
    -L
```

## Hot Reload

This will reload the Falco configuration and restart the engine without killing the pid. This is useful to propagate new config changes without killing the daemon.

```bash
kill -1 $(cat /var/run/falco.pid)
```

Moreover, since Falco 0.32.0, `watch_config_files` config option drives the automatic reload of Falco when either the config or the ruleset change.
