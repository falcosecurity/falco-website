---
title: Try Falco on Linux
description: Learn how to install Falco on Linux
slug: falco-linux-quickstart
aliases:
- ../../try-falco-on-ubuntu
weight: 30
---

In this scenario, you will learn how to install Falco on an Ubuntu host, trigger a Falco rule by generating a suspicious event, and then examine the output.

This activity aims to give you a quick example of how Falco works. After you complete it, you should be able to move on to [trying Falco on Kubernetes](/docs/getting-started/falco-kubernetes-quickstart/) or spend some time reading some [additional resources](/docs/getting-started/falco-additional).

## Prerequisites

This lab is based on installing Falco on a virtual machine.

The scenario has been tested using VirtualBox and Lima (for MacBooks running Apple Silicon).

While this tutorial may work with Ubuntu running on a cloud provider or another virtualization platform, it has not been tested.

### VirtualBox setup

The following steps will set up a VirtualBox virtual machine running Ubuntu 24.04.

* Install VirtualBox and Vagrant according to the instructions appropriate for your local system.

* Issue the following commands from the command line to create an Ubuntu 24.04 virtual machine.

```bash
vagrant init bento/ubuntu-24.04
vagrant up
```

* Log into the newly launched virtual machine and continue to the *Install Falco* section below (the default password is *vagrant*).

```bash
vagrant ssh
```

### Lima setup for Apple silicon (M1/M2)

This section explains how to create an Ubuntu 24.04 VM on Apple computers running M1 silicon (as opposed to Intel).

If you are unsure what processor your Apple machine is running, you can find out by clicking the Apple icon in the upper left and choosing "About this Mac". The first item listed, Chip, tells you what silicon you're running on.

* Install Homebrew according to the project's documentation.

* Use Homebrew to install Lima.

```bash
brew install lima
```

* Create an Ubuntu 24.04 VM with Lima.

```bash
limactl start --name=falco-quickstart template://ubuntu-lts
```

* Shell into the Ubuntu VM, and once you're in the VM, continue to the Install Falco section.

```bash
limactl shell falco-quickstart
```

## Install Falco

Regardless of which setup you used above, this section will show you how to install Falco on a host system. You'll begin by updating the package repository. Next, you'll install the dialog package. Then you'll install Falco and ensure it's up and running.

### Set up the package repository

* Add the Falco repository key.

```bash
curl -fsSL https://falco.org/repo/falcosecurity-packages.asc | \
sudo gpg --dearmor -o /usr/share/keyrings/falco-archive-keyring.gpg
```

* Add the Falco repository.

```bash
sudo bash -c 'cat << EOF > /etc/apt/sources.list.d/falcosecurity.list
deb [signed-by=/usr/share/keyrings/falco-archive-keyring.gpg] https://download.falco.org/packages/deb stable main
EOF'
```

* Read the repository contents.

```bash
sudo apt-get update -y
```

### Install dialog

* Install *dialog*, which is used by the Falco installer.

```bash
sudo apt-get install -y dialog
```

### Install Falco

* Install the latest Falco version.

```bash
sudo apt-get install -y falco
```

* When prompted, choose the **Modern eBPF** option. This will enable the usage of the modern eBPF-based driver.

    ![Dialog window - Choose the modern eBPF driver](/docs/getting-started/images/dialog-1.png)

* When prompted, choose **Yes**. Although we won't use the functionality in this exercise, this option allows Falco to update its rules automatically.

    ![Dialog window - Choose the follow automatic ruleset updates](/docs/getting-started/images/dialog-2.png)

Wait for the Falco installation to complete - this should only take a few minutes.

### Verify Falco is running

* Make sure the Falco service is running.

```bash
sudo systemctl status falco-modern-bpf.service
```

The output should be similar to the following:

```plain
● falco-modern-bpf.service - Falco: Container Native Runtime Security with modern ebpf
     Loaded: loaded (/usr/lib/systemd/system/falco-modern-bpf.service; enabled; preset: enabled)
     Active: active (running) since Wed 2024-09-18 08:40:04 UTC; 11min ago
       Docs: https://falco.org/docs/
   Main PID: 4751 (falco)
      Tasks: 7 (limit: 2275)
     Memory: 24.7M (peak: 37.1M)
        CPU: 3.913s
     CGroup: /system.slice/falco-modern-bpf.service
             └─4751 /usr/bin/falco -o engine.kind=modern_ebpf

Sep 18 08:40:12 vagrant falco[4751]:    /etc/falco/falco.yaml
Sep 18 08:40:12 vagrant falco[4751]: System info: Linux version 6.8.0-31-generic (buildd@lcy02-amd64-080) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.2.0-23ubuntu4) 13.2.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #31-Ubuntu SMP PREEMPT_DYNAMIC Sat Apr 20 00:40:06 UTC 2024
Sep 18 08:40:12 vagrant falco[4751]: Loading rules from file /etc/falco/falco_rules.yaml
Sep 18 08:40:12 vagrant falco[4751]: Loading rules from file /etc/falco/falco_rules.local.yaml
Sep 18 08:40:12 vagrant falco[4751]: The chosen syscall buffer dimension is: 8388608 bytes (8 MBs)
Sep 18 08:40:12 vagrant falco[4751]: Starting health webserver with threadiness 2, listening on 0.0.0.0:8765
Sep 18 08:40:12 vagrant falco[4751]: Loaded event sources: syscall
Sep 18 08:40:12 vagrant falco[4751]: Enabled event sources: syscall
Sep 18 08:40:12 vagrant falco[4751]: Opening 'syscall' source with modern BPF probe.
Sep 18 08:40:12 vagrant falco[4751]: One ring buffer every '2' CPUs.
```

## See Falco in action

### Generate a suspicious event

* There is a Falco rule that is designed to trigger whenever someone accesses a sensitive file (of which, /etc/shadow is one). Run the following command to trigger that rule.

```bash
sudo cat /etc/shadow > /dev/null
```

### Examine Falco's output

One of the endpoints that Falco can write output to is *syslog*. There are multiple ways to examine the system logs, but we have featured two for our exercise: using *journalctl* and simply using *cat* on the log file.

***Using journalctl***

* Run the following command to retrieve Falco messages that have been generated with a priority of `warning`:
```bash
sudo journalctl _COMM=falco -p warning
```
You should see output similar to the following:

```plain
...
Sep 18 12:50:52 vagrant falco[4751]: 11:48:24.195279773: Warning Sensitive file opened for
reading by non-trusted program (file=/etc/shadow gparent=sudo ggparent=bash gggparent=sshd
evt_type=openat user=root user_uid=0 user_loginuid=1000 process=cat proc_exepath=/usr/bin/cat
parent=sudo command=cat /etc/shadow terminal=34818 container_id=host container_name=host)
...
```



***Using /var/log/syslog***

* Log messages describing Falco's activity are logged to syslog. Run the following command to retrieve Falco logs:

```bash
sudo grep Sensitive /var/log/syslog
```

You should see output similar to the following:

```plain
...
2024-09-18T12:50:52.164570+00:00 vagrant falco: 11:48:24.195279773: Warning Sensitive file opened for
reading by non-trusted program (file=/etc/shadow gparent=sudo ggparent=bash gggparent=sshd
evt_type=openat user=root user_uid=0 user_loginuid=1000 process=cat proc_exepath=/usr/bin/cat
parent=sudo command=cat /etc/shadow terminal=34818 container_id=host container_name=host)
```

## Cleanup

### Remove the Lima virtual machine

* If you wish, remove the Lima virtual machine

    ```bash
    limactl delete falco-quickstart --force
    ```

### Remove the Virtualbox virtual machine

* If you wish, remove the Virtualbox virtual machine

    ```bash
    vagrant destroy
    ```
{{% pageinfo color=info %}}
Be sure you are in same subdirectory as the Vagrantfile
{{% /pageinfo %}}
