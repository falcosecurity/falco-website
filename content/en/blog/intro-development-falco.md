---
title: "Getting started developing Falco"
linktitle: "Getting started developing Falco"
date: 2022-04-18
author: Lorenzo Susini
slug: intro-development-falco
---

Hello, Falcoers!

Interested in Falco and want to contribute your ideas? Feeling stuck because you don't know where to start? No worries, we are here to help!

Whether you want Falco to [monitor a new system call](https://falco.org/blog/falco-monitoring-new-syscalls/), add a brand new feature, or solve a problem you ran into, you have to create a development environment. This blog post will walk you through the process of setting up a new one so that you can feel comfortable and ready to contribute!

Now, let's go step by step, showing what is required to get started hacking on Falco. We hope this table of contents will facilitate the use of this post as a future reference.

- [Setting up the environment](#setting-up-the-environment)
  - [Creating a dedicated VM](#creating-a-dedicated-vm)
- [Discovering the Falco code](#discovering-the-falco-code)
  - [Building Falco from scratch](#building-falco-from-scratch)
- [Testing your build](#testing-your-build)
  - [Falco Event-Generator](#falco-event-generator)
  - [Falco Test Suite](#falco-test-suite)
  - [Writing your own test rules](#writing-your-own-test-rules)
- [Conclusion](#conclusion)

### Setting up the environment

A peculiarity of the Falco project is that you may need to write some kernel-level code. An important consideration to make, even before starting to code, is that the [eBPF probe](https://falco.org/docs/event-sources/drivers/#ebpf-probe) and the [kernel module](https://falco.org/docs/event-sources/drivers/#kernel-module) should provide exactly the same features. 

For this reason, when developing something on the eBPF probe, you should implement the same functionality on the kernel module and vice versa, with the intent of preserving *feature parity* across the two drivers.

Writing code at the kernel-level is not an easy task. In particular, the kernel module requires extra care because your code will run with full kernel privileges. Any little mistake may result in a kernel panic, crashing the system.

On the other hand, [eBPF programs](https://ebpf.io/what-is-ebpf) are much safer than the kernel module, but sometimes you may need to fight against the verifier on different kernel versions.

For these reasons, some of us find using [Vagrant](https://www.vagrantup.com/) extremely helpful. Vagrant is a tool that allows you to easily spawn virtual machines, so that you can test your code against multiple kernel versions and Linux distributions without causing any harm to your system.

#### Creating a dedicated VM

If you have never used Vagrant before, you first need to [download and install Vagrant](https://www.vagrantup.com/downloads) and a [Vagrant VM provider](https://www.vagrantup.com/docs/providers). You may want to install [VirtualBox](https://www.virtualbox.org) since Vagrant comes with out-of-the-box support. You can follow the [Vagrant quickstart](https://learn.hashicorp.com/tutorials/vagrant/getting-started-index?in=vagrant/getting-started) to accomplish this.

Once you can spawn VMs with Vagrant, choose a [box](https://www.vagrantup.com/docs/boxes) from [Vagrant Cloud](https://app.vagrantup.com/boxes/search) containing your favorite distribution for development.

For instance, if you want to launch a Ubuntu Focal Fossa machine, you can issue the following commands:

```shell
$ mkdir ubuntu-vm && cd ubuntu-vm
$ vagrant init ubuntu/focal64
$ vagrant up
```

Vagrant initializes virtual machines so that you can easily access them via SSH. This helps in case you also want to try out [remote development](https://code.visualstudio.com/docs/remote/ssh), for instance with [Visual Studio Code](https://code.visualstudio.com). This way, you will be able to seamlessly code, build, and test on the Vagrant virtual machine!

From now on, the command `vagrant ssh` will log you into the VM and you could start working right away. However, unless you prefer writing code on older (but very powerful) tools like Vim, you may feel the need to use an IDE, as if you were developing on your local machine.

To do so, we will show you how to extend Visual Studio Code capabilities by downloading the `Remote - SSH` extension. This extension lets you use any remote machine that allows SSH access as your development environment. This includes the VM you just spawned with Vagrant.

After installing the extension, from inside the Vagrant VM directory, retrieve the SSH configuration:

```
$ vagrant ssh-config

Host default
  HostName 127.0.0.1
  User vagrant
  Port 2222
  UserKnownHostsFile /dev/null
  StrictHostKeyChecking no
  PasswordAuthentication no
  IdentityFile /Users/lorenzo.susini/vagrant/official-ubuntu/.vagrant/machines/default/virtualbox/private_key
  IdentitiesOnly yes
  LogLevel FATAL
```

Copy the output of the last command and paste it into the `.ssh/config` file in your local home directory. Also, we recommend changing the `Host default` line with something that helps you remember that this is the VM you use for developing Falco. Something like `Host falco-dev` would work.

Then, go back to Visual Studio Code. Press `Control + P` (or `Command + P` on MacOS) and type `> Remote-SSH: Connect to Host`. Press Enter and you will see the `falco-dev` entry in the UI to connect to the VM.
![](/img/intro-development-falco/intro-development-falco-01.png)

Your development environment is now up and running. You can open remote folders and projects, and use all the functionalities of Visual Studio Code!

### Discovering the Falco code

Now, it's time to have some fun. Falco's source code lives in the [Falco organization](https://github.com/falcosecurity) on GitHub. The two repositories you should take a look at are:

- [falcosecurity/libs](https://github.com/falcosecurity/libs), containing both the kernel module and the eBPF probe, and also libscap and libsinsp.
- [falcosecurity/falco](https://github.com/falcosecurity/falco), including the rule engine, rules, and support for any kind of output, such as standard output, file output, gRPC, and more.

If you're not yet familiar with the overall Falco architecture, you can go into detail by reading the [previous blog post](https://falco.org/blog/falco-monitoring-new-syscalls/).


#### Building Falco from scratch

Most of the time, the main starting point for developing something is building it from scratch. You can fork `falco` and `libs`, and clone them into your development machine. Forking the repositories first is recommended if you want to later push the changes and save your work.

Then, try to follow the steps in our [official Falco documentation](https://falco.org/docs/getting-started/source/). Some of the most useful `CMake` definitions you may want to use are:

- `-DUSE_BUNDLED_DEPS=ON` allows you to download and compile all the needed Falco dependencies. This also helps to build Falco independently of the libraries installed in your system. <br>
The build process will run trouble-free using this option, although it will be a little bit slower.

- `-DFALCOSECURITY_LIBS_SOURCE_DIR=/path/to/local/libs` allows you to compile Falco with a local version of libs. If not specified, `CMake` will download the `libs` repository directly from GitHub. <br>
This option is extremely handy when you are implementing something that requires modification to both `falco` and `libs` repositories so that you can easily test what you coded.

- `-DBUILD_BPF=ON` allows compilation of the eBPF probe, crucial when developing something on the eBPF driver.

- `-DCMAKE_BUILD_TYPE=Debug` is helpful when you want to debug something. Debug information is printed out and assertions are enabled.

The complete sequence of commands you may want to run is:

```shell
$ mkdir build && cd build
$ cmake -DUSE_BUNDLED_DEPS=ON \
        -DFALCOSECURITY_LIBS_SOURCE_DIR=/path/to/local/libs \
        -DBUILD_BPF=ON \
        -DCMAKE_BUILD_TYPE=Debug  ..
$ make
```

> Also, note that you can use the `-jxxx` option of make to spawn multiple parallel jobs, where `xxx` is the number of jobs.

![](/img/intro-development-falco/intro-development-falco-02.png)

### Testing your build

Now that you have successfully compiled Falco, try to run it. The default driver is the kernel module. To use it, assuming that you are in the build directory, just type:

```shell
$ sudo insmod driver/falco.ko
$ sudo ./userspace/falco/falco -c ../falco.yaml \
       -r ../rules/falco_rules.yaml
```

To start Falco with the eBPF driver instead, you need to set the `FALCO_BPF_PROBE` environment variable, like this:

```shell
$ sudo FALCO_BPF_PROBE=driver/bpf/probe.o ./userspace/falco/falco \
       -c ../falco.yaml  -r ../rules/falco_rules.yaml
```

#### Falco Event-Generator

Now that you built Falco, you may wonder if everything works as expected. A quick and dirty way of testing Falco is using the [event-generator](https://github.com/falcosecurity/event-generator).

This is yet another project from the Falcosecurity organization, and it can be used to generate some suspicious actions on the system, therefore, triggering some Falco rules.

All you need to do is to start two terminals. You will launch Falco from one of them and leave it running. From the second terminal, launch the event generator using the following command:

```shell
docker run -it --rm falcosecurity/event-generator run syscall
```

If everything works fine, in the first terminal you opened you will see Falco alerting of some malicious behaviors from the container we started in the second one.

#### Falco Test Suite

You can also test Falco by using its own test-suite. The Falco test-suite uses the [Avocado Framework](https://avocado-framework.readthedocs.io/en/95.0/) to launch tests.

All you have to do is the following:

```shell
$ cd falco/test
$ ./run_regression_tests.sh -p -v

$ virtualenv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
$ BUILD_DIR="../build" avocado run --mux-yaml falco_traces.yaml \
  --job-results-dir /tmp/job-results -- falco_test.py
$ deactivate
```

The `run_regression_tests.sh` script downloads and prepares trace files needed for testing. Falco can consume these files containing some recorded system activity that must trigger rules.

If you want, you can also refer to the [documentation](https://github.com/falcosecurity/falco/tree/master/test) to launch other kinds of tests, such as rule engine and k8s audit logs tests, just to name a few.

You can relaunch these tests whenever you add something to the codebase, just to make sure nothing got broken after you played around with it.

You are now ready to put your hands on Falco!

#### Writing your own test rules

At this point, let's say you have introduced a new syscall. A possible way to effectively test it is to write a custom rule. You can dig deeper on how to write rules by reading the [related section in the official documentation](https://falco.org/docs/rules/).

Falco's rule syntax is very simple and you will be able to write rules down very soon. A rule is made of:

| field name  | field description |
|-------------|-------------------|
| rule name   | a short unique name for the rule |
| description | a longer description of what the rule detects |
| condition   | a filtering expression that is applied against events <br>to see if they match the rule |
| output      | a message that should be produced if a matching <br>event occurs |
| priority    | severity associated with the rule |

To give you a little taste of writing rules, let's assume you have followed the [aforementioned post where we added support for a new syscall](https://falco.org/blog/falco-monitoring-new-syscalls/). You would like to throw an alert every time a process executes it.

You could create a `rule.yaml` file having this as content:

```yaml
- rule: My test rule
  desc: Detects any process executing openat2 and prints its name and pid
  condition: evt.type = openat2
  output: openat2 executed by (process name: %proc.name, pid: %proc.pid)
  priority: NOTICE
```

Then, you can use the `-r` option to tell Falco to use this rule file. Of course, you can create much more complex and meaningful rules using many different [fields](https://falco.org/docs/rules/supported-fields/) and [operators](https://falco.org/docs/rules/conditions/#operators).

### Conclusion

You have learned how to set up a development environment with the help of Vagrant and Visual Studio Code, and how to build and run tests on Falco. You are now all set to dig into the source code, hack around, and unleash your creativity! We can't wait to see some of your PRs and build something great together!

You can find us in the [Falco community](https://github.com/falcosecurity/community). Please feel free to reach out to us for any questions, suggestions, or just a friendly chat!

If you would like to find out more about Falco:

* Get started in [Falco.org](http://falco.org/)
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco).
* Get involved in the [Falco community](https://falco.org/community/).
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCMWH3EH32).
* Follow [@falco_org on Twitter](https://twitter.com/falco_org).

