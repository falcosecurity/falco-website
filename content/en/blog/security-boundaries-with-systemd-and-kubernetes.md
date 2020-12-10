---
title: Security boundaries with Kubernetes and systemd
description: Understanding why I do not run Falco in Kubernetes
date: 2020-12-10
author: Kris Nóva
---

# A familiar scenario

Imagine installing a security tool that requires privileged access using the Kubernetes API. 
Now imagine our cluster is compromised. 
As an attacker, the first thing I would do would be to ensure that whatever security tool you were running in Kubernetes - was turned off.
Fortunately if I compromised your cluster there is a very lush toolchain that would make that very easy for me.

---

# Why I run Falco directly on Linux

Fundamentally I disagree with running a security tool in the same layer of the stack that it hopes to protect.
That is effectively like keeping the keys to your front door conveniently hung on the outside of a locked door.
The goal is for multiple layers of the stack to watch each other such that if one is compromised you still have control of another.
Putting **everything** in Kubernetes violates this.

I understand that Falco is easy to use, and installing it with Helm is fun.

I run 5 public facing Dell poweredge servers on a `/29` with BGP and I assure you I have offended more people on the internet than you can imagine. 
I do not have Falco running in Kubernetes. 
I run Falco with systemd.
Yes I have found hackers with it.
Yes they have gained access to unwanted parts of my cluster.

The [Helm chart](https://github.com/falcosecurity/charts) is a great place to get started! 

---

# How I do it

Here is how I install and run Falco in production.

Check out the [latest tag](https://github.com/falcosecurity/falco/releases/tag/0.26.2) (Great job team!)

#### Note: If you are running Arch you need an updated Kernel and packages

Running this on a 4.19 kernel.

```bash
git fetch
git checkout tags/0.26.2 -b branch-0.26.2
cmake ../ \
      -DBUILD_BPF="ON" \
      -DBUILD_WARNINGS_AS_ERRORS="OFF" \
      -DCMAKE_BUILD_TYPE="Release" \
      -DCMAKE_INSTALL_PREFIX="/usr" \
      -DFALCO_ETC_DIR="/etc/falco" \
      -DUSE_BUNDLED_DEPS=ON
make bpf
make falco
make install
```

Here is my unit file in `/lib/systemd/system`

```
[Unit]
Description=Falco Runtime Security

[Service]
ExecStart=/usr/bin/falco --pidfile=/var/run/falco.pid -c /etc/falco/falco.yaml
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
Restart=always

[Install]
WantedBy=multi-user.target

```

I enable the service

```
systemctl enable falco
systemctl start falco
```

---

# Conclusion

Yes -- I run Falco on Linux with eBPF - and it works great.
If my cluster ever gets attacked I know that I have good Linux security in place to prevent any more escalation.
I understand out what happened.
I fix the problem.

In conclusion, we see this question a lot. 
Having a boundary between your cluster and your host is wise.
Installing Falco using Kubernetes breaks that boundary.
This is how I do things.
