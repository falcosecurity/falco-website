---
title: Cryptomining Detection Using Falco
linktitle: Cryptomining Detection Using Falco
description: Learn how Falco detects cryptominers activity in your cluster
date: 2022-12-05
author: Nigel Douglas
slug: falco-detect-cryptomining
images:
  - /blog/falco-detect-cryptomining/images/falco-detect-cryptomining-featured.png
---
![](/blog/falco-detect-cryptomining/images/falco-detect-cryptomining-01.png)

Cryptominers are programs that utilize computer resources to mine cryptocurrency. XMRig is an example of an open source cryptomining software designed for the sole purpose of mining cryptocurrencies, like Monero or Bitcoin. Cryptominers usually get rewarded with a token for every successful transaction mined, which makes cryptomining a profitable activity.

Whether the threat is from an external entity, or an insider, cybercriminals are most commonly abusing services such as Kubernetes and GitHub actions by infecting hosts and containers with cryptojackers and using the business resources to mine cryptocurrency on the attacker's behalf.


## Detecting Mining Pools

Assuming the cybercriminal has already compromised your environment and installed the XMRig miner, they will need to communicate with a cryptocurrency mining pool to distribute the resources by miner, share the processing power over a network, and split the reward equally, according to the amount of work they contributed to the probability of finding a block.

![](/blog/falco-detect-cryptomining/images/falco-detect-cryptomining-02.png)
**Source**: [Compass Mining](https://compassmining.io/education/comparison-hashrate-managers-traditional-mining-pools/)

The mining pool is a collection of miners that work together to augment their chances of mining a block, sharing rewards among each other in proportion to the computing power contributed in successfully mining a block. There are lots of pools to choose from. You can find a list at [miningpoolstats.stream/monero](miningpoolstats.stream/monero).


### Lists

By default, Falco creates a list of all common pool domains used for Monero mining.
The below [YAML file](https://github.com/falcosecurity/falco/blob/e3dbae325935dd2ddec5edb750ee8dfda0b785d6/rules/falco_rules.yaml#L2784) shows how the list defines all domains as list items.

```
- list: miner_domains
  items: [
      "asia1.ethpool.org","ca.minexmr.com",
      "cn.stratum.slushpool.com","de.minexmr.com",
      "eth-ar.dwarfpool.com","eth-asia.dwarfpool.com",
      "eth-asia1.nanopool.org","eth-au.dwarfpool.com",
      … 
      ]
```

For the purpose of accuracy, we can define separate lists for [HTTP domains](https://github.com/falcosecurity/falco/blob/e3dbae325935dd2ddec5edb750ee8dfda0b785d6/rules/falco_rules.yaml#L2842) as well as [HTTPS domains](https://github.com/falcosecurity/falco/blob/e3dbae325935dd2ddec5edb750ee8dfda0b785d6/rules/falco_rules.yaml#L2820).


```
- list: https_miner_domains
  items: [
    "ca.minexmr.com",
    "cn.stratum.slushpool.com",
    "de.minexmr.com",
    "fr.minexmr.com",
   … 
  ]

- list: http_miner_domains
  items: [
    "ca.minexmr.com",
    "de.minexmr.com",
    "fr.minexmr.com",
    "mine.moneropool.com",
   … 
  ]
```

Another list contains all port numbers that are commonly used by the cryptominer at the source. \
There's no need for users to create the lists or macros. They are enabled by the default Falco rules.


```
- list: miner_ports
  items: [
        25, 3333, 3334, 3335, 3336, 3357, 4444,
        5555, 5556, 5588, 5730, 6099, 6666, 7777,
        7778, 8000, 8001, 8008, 8080, 8118, 8333,
        8888, 8899, 9332, 9999, 14433, 14444,
        45560, 45700
    ]
```

### Macros

Similar to the lists mentioned above, the following macros are already created. The macros define the ports used to connect to the mining domains - whether HTTP (unsecure) domains or HTTP/s (secure) domain names. The HTTP/s domain connects over port 443. Unencrypted HTTP connections are made over port 80.

```
- macro: minerpool_https
  condition: (fd.sport="443" and fd.sip.name in (https_miner_domains))

- macro: minerpool_http
  condition: (fd.sport="80" and fd.sip.name in (http_miner_domains))
```

Falco assigns all commonly used miner ports to the miner domains via the `minerpool_other` macro.

```
- macro: minerpool_other
  condition: (fd.sport in (miner_ports) and fd.sip.name in (miner_domains))
```

The field fd.sport (File Descriptor - Port) could match any port listed in the `miner_ports` macro, while the field fd.sip (File Description - IP name) would match any domain listed within the `miner_domains` macro. 


### Falco Rule

The final rule will aim to detect anything matching the condition described by the [**`net_miner_pool`**](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml#L2864) macro, unless it's listed within the [**`trusted_images_query_miner_domain_dns`**](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml#L2867) macro. Both macros are specified within the `condition` section of the completed Falco rule.


```
- rule: Detect outbound connections to common miner pool ports
  desc: Miners typically connect to miner pools on common ports.
  condition: >
    net_miner_pool and not trusted_images_query_miner_domain_dns
    enabled: false
  output: >
    Outbound connection to IP/Port flagged by https://cryptoioc.ch 
    (command=%proc.cmdline pid=%proc.pid port=%fd.rport ip=%fd.rip 
    container=%container.info image=%container.image.repository)
  priority: CRITICAL
  tags: [network, mitre_execution]
```

The rule is disabled by default. However, to enable this Falco rule you simply need to change the condition `enabled: false` to `enabled: true`.

#### Macro `net_miner_pool`

The following macro is looking at any event type such as connections made or message data sent to the macros: `minerpool_http`, `minerpool_https`, or `minerpool_other` that were mentioned earlier in the blog. 

```
- macro: net_miner_pool
  condition: >
    (evt.type in (sendto, sendmsg, connect) and evt.dir=< and 
    (fd.net != "127.0.0.0/8"  and not fd.snet in (rfc_1918_addresses)) 
     and ((minerpool_http) or (minerpool_https) or (minerpool_other)))
```

#### Macro `trusted_images_query_miner_domain_dns`

The below macro is created simply to exclude Falco images from detection. The rule will use it to exclude known Falco images from Docker registry or from the public Elastic Container Registry (ECR).

```
- macro: trusted_images_query_miner_domain_dns
  condition: >
    (container.image.repository in (docker.io/falcosecurity/falco, 
    falcosecurity/falco, public.ecr.aws/falcosecurity/falco))
```

## Detecting Stratum Protocol

Miners typically specify the mining pool to connect with a [URI](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier) that begins with `stratum+tcp`. That's because Stratum is a line-based protocol using a plain [TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) socket. The message payload is encoded as JSON-RPC. The protocol was designed specifically for mining operations. Therefore, it makes sense to detect scenarios where a client opens a TCP socket and writes requests using the Stratum protocol. \
For more information on the new protocol designed for bitcoin mining, check out [this link](https://braiins.com/stratum-v1/docs).

### Falco Rule

The following rule quickly shows how to detect the Stratum protocol. There's no need for any complex macros this time around. The already existing macro  `spawned_process` watches for newly started processes, while the rest of the rule looks for a string on command, such as:
- `stratum+tcp`
- `stratum2+tcp`
- `stratum+ssl`
- `stratum2+ssl`

```
- rule: Detect crypto miners using the Stratum protocol
  desc: >
        Miners typically specify the mining pool to connect to 
        with a URI that begins with 'stratum+tcp'
  condition: >
            spawned_process and 
            (proc.cmdline contains "stratum+tcp" or 
             proc.cmdline contains "stratum2+tcp" or 
             proc.cmdline contains "stratum+ssl" or 
             proc.cmdline contains "stratum2+ssl")
  output: Possible miner running (command=%proc.cmdline 
          pid=%proc.pid container=%container.info
          image=%container.image.repository)
  priority: CRITICAL
  tags: [process, mitre_execution]
```

### Macro

The `spawned_process` macro is easy to understand. It's basically just looking for the event types [**`execve`**](https://linux.die.net/man/2/execve) and/or [**`execveat`**](https://manpages.ubuntu.com/manpages/xenial/man2/execveat.2.html) in any event directory. 

```
- macro: spawned_process
  condition: (evt.type in (execve, execveat) and evt.dir=<)
```

## Github Actions with Miners

Cryptomining detection shouldn't be limited to just your local endpoints, VMs, or EC2 hosts. GitHub Actions has unfortunately been actively [abused](https://github.blog/2021-04-22-github-actions-update-helping-maintainers-combat-bad-actors/) in recent months to mine cryptocurrency on GitHub servers. Falco's [GitHub plugin](https://github.com/falcosecurity/plugins/tree/master/plugins/github) can detect potential miners abusing GitHub actions.


### Falco Rule

The condition filters for webhook messages of type **`workflow_run`** that point to the execution of miners. **`github.workflow.has_miners`** is the main action to highlight. It fetches the workflow's definition file and scans it line by line, looking for patterns that identify the execution of one of the well-known miner binaries.


```
- rule: Github action with miners
  desc: a github action containing crypto miners was executed
  condition: >
            github.type=workflow_run and 
            github.action=requested and 
            github.workflow.has_miners=true
  output: >
          a github action containing crypto miners was executed 
          (repository=%github.repo repo_owner=%github.owner
          org=%github.org user=%github.user file=%github.workflow.filename)
  priority: CRITICAL
  source: github
```

Within **`github.workflow.miners.type`**, we can specify one or more miners to be detected within the workflow definition file. This field contains the type of each detected miner as a comma separated list (e.g., XMRig, Stratum). Looking further into the [**`miners.go`**](https://github.com/falcosecurity/plugins/blob/master/plugins/github/pkg/github/miners.go) file, we can see the exact list of miner binaries checked:

```
var minersChecks = []string{
	"xmrig",
	"ccminer",
	"t-rex",
	"stratum",
	"pool",
	"hashrate",
	"cryptonight",
	"wallet",
                …  }
```

As you can see from the above list, it includes the strings for the crypto [*wallet*](https://www.coinbase.com/learn/crypto-basics/what-is-a-crypto-wallet), the crypto-mining [*pool*](https://www.investopedia.com/terms/m/mining-pool.asp), and the miners, such as [*xmrig*](https://xmrig.com/) and [*ccminer*](https://ccminer.org/).

## Set `setuid` or `setgid` bit 
When the setuid or setgid bits are set for an application, this means that the application will run with the privileges of the owning user or group respectively. In the case of cryptojacking, the hacker will want to have root permissions over the running containerized workloads in order to install the XMRig binary. That's why it's important to detect setuid or setgid bits set via chmod.

### Falco Rule

```
- rule: Set Setuid or Setgid bit
  desc: >
    When the setuid or setgid bits are set for an application,
    This means that the application will run with the privileges 
    of the owning user or group respectively.
    Detect setuid or setgid bits set via chmod
  condition: >
    chmod and (evt.arg.mode contains "S_ISUID" or 
               evt.arg.mode contains "S_ISGID")
    and not proc.name in (user_known_chmod_applications)
    and not exe_running_docker_save
    and not user_known_set_setuid_or_setgid_bit_conditions
  enabled: false
  output: >
    Setuid or setgid bit is set via chmod (fd=%evt.arg.fd filename=%evt.arg.filename 
    mode=%evt.arg.mode user=%user.name user_loginuid=%user.loginuid process=%proc.name
    command=%proc.cmdline pid=%proc.pid container_id=%container.id 
    container_name=%container.name image=%container.image.repository:%container.image.tag)
  priority:
    NOTICE
  tags: [process, mitre_persistence]
```

Similar to the mining pool example, the rule is disabled by default. To enable it within the rule engine, simply change the `enabled` flag to `enabled: true`.

In Linux systems, processes can receive a variety of signals, such as SIGINT or SIGKILL. 

The SIGINT signal is sent to a process by its controlling terminal when a user wishes to interrupt the process. This is typically initiated by pressing Ctrl-C, but on some systems, the "delete" character or "break" key can be used. The SIGKILL signal is sent to a process to cause it to terminate immediately (kill). If XMRig is run as root, but the [`SIGINT`](https://www.howtogeek.com/devops/linux-signals-hacks-definition-and-more/) caller must also be [running as root](https://github.com/xmrig/xmrig/issues/2826#:~:text=If%20XMRig%20is%20run%20as%20root%2C%20the%20SIGINT%20caller%20must%20also%20be%20running%20as%20root.) if the adversary plans on interrupting/pausing their operations to evade detection.

As a result, the adversary will need to give themselves *root* permissions by setting their User ID (SetUID) or Group User ID (SetGID) to *root*. Detecting changes to SetUID or SetGID bit is a clear indication of compromise, and we should look to prevent users (whether internal or adversarial) from giving themselves root permissions. Without root permissions, the adversary cannot operate XMRig effectively. The SetUID/SetGID Falco rule is in the rule engine, but [disabled by default](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml#L2690).

## Container Drift Detection

As mentioned at the beginning of this blog, Kubernetes is an ideal target for cryptojacking - hijacking of legitimate running workloads/applications. To detect when an XMRig binary is installed, we can apply drift detection to containers at runtime.

### Falco Rule

```
- rule: Container Drift Detected (open+create)
  desc: New executable created in a container due to open+create
  condition: >
    evt.type in (open,openat,openat2,creat) and
    evt.is_open_exec=true and
    container and
    not runc_writing_exec_fifo and
    not runc_writing_var_lib_docker and
    not user_known_container_drift_activities and
    evt.rawres>=0
  enabled: false
  output: Drift detected (open+create), new executable created in a container (user=%user.name user_loginuid=%user.loginuid command=%proc.cmdline pid=%proc.pid filename=%evt.arg.filename name=%evt.arg.name mode=%evt.arg.mode event=%evt.type)
  priority: ERROR
```

Generally speaking, attackers would look to install the XMRig miner in the /tmp directory. However, the above [Falco rule](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml#L3019) will detect when executables are created in the container (regardless of the directory). From a forensics perspective, we will receive a Falco notification that tells us which executable was installed and to which directory.

## Detect the XMRig Binary

We have provided multiple ways to detect the XMRig binary, whether that be through container drift when installing XMRig, outbound connections to mining pools coming from XMRig, or when file permissions are changed to *root* for XMRig. 

The final rule, although not in the rules library by default, is to simply detect the XMRig binary outright - not based on behavior, just the binary name. 

### Custom Falco Rule

```
- rule: Malicious binary detected
  desc: >-
    Malicious script or binary detected in pod or host. 
    The rule was triggered by the execve syscall.
  condition: >
    spawned_process and (in_malicious_binaries or (proc.name in (shell_binaries)
    and scripts_in_or and not proc.args startswith "-c"))
  output: >-
    Malicious binary or script executed in the pod or host.
    proc.cmdline=%proc.cmdline evt.type=%evt.type evt.res=%evt.res
    proc.pid=%proc.pid proc.cwd=%proc.cwd proc.ppid=%proc.ppid
    proc.pcmdline=%proc.pcmdline proc.sid=%proc.sid proc.exepath=%proc.exepath
    user.uid=%user.uid user.loginuid=%user.loginuid
    user.loginname=%user.loginname user.name=%user.name group.gid=%group.gid
    group.name=%group.name container.id=%container.id
    container.name=%container.name %evt.args
  priority: warning
  source: syscall
```

The above Falco rule detects when a malicious script or binary is detected in a pod or host. The rule is triggered by the [`execve`](https://linuxhint.com/c-execve-function-usage/) syscall. The rule looks for any spawned process via the `spawned_process` macro. As mentioned earlier, the spawned_process macro looks for the execve syscall.

Leveraging lists and macros again, to detect the XMRig binary, security teams can manually specify *XMRig* and other relevant binaries in a `malicious_binaries` list, and place it within the `in_malicious_binaries` macro.

### Macro

```
- macro: in_malicious_binaries
  condition: (proc.name in (malicious_binaries))
```

### List

```
- list: malicious_binaries
  items: [ "xmrig", ".x1mr", "kill_miner", "titcoind", "nanominer", "pwnrig", "ccminer" ]
```

The above list provides more binaries than just ‘XMRig.’ As new miners become available, users can add those binaries to their `malicious_binaries` list. 

## Conclusion

The monetary gain of mining cryptocurrency is a motivation for threat actors to compromise the endpoints of unsuspecting users and use them for illegitimate mining activities. 

The endpoints are usually part of a botnet that is being controlled by a Command and Control (C2) server. Aside from the rules listed above, Falco can also detect unwanted [outbound connections to C2 servers](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml#L3055), as well as other IoC's that could indicate a potential incident before the mining has begun.

The mode of initial access for threat actors may be through compromised SSH credentials or the exploitation of a vulnerability. Once the threat actor has gained remote access to the endpoints, the cryptomining software is executed on it. Being able to detect suspicious activity, such as [Disallowed SSH connections](https://github.com/falcosecurity/falco/blob/master/rules/falco_rules.yaml#L366) on a Linux server, is critical for your incident response and forensics teams.

If you would like to find out more about Falco:

* Get started in [falco.org](http://falco.org/).
* Read the [official documentation](https://falco.org/docs/).
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org](https://twitter.com/falco_org)  on Twitter.