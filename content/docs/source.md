---
title: Installing Falco from Source
weight: 6
---

Building falco requires having `cmake` and `g++` installed.

## Build using docker-builder container

One easy way to build falco is to run the [falco-builder](https://hub.docker.com/r/falcosecurity/falco-builder) container. It contains the reference toolchain we use to build packages.

The image depends on the following parameters:

* `FALCO_VERSION`: the version to give any built packages
* `BUILD_TYPE`: Debug or Release
* `BUILD_DRIVER`: whether or not to build the kernel module when
building. This should usually be OFF, as the kernel module would be
built for the files in the centos image, not the host.
* `BUILD_BPF`: Like `BUILD_DRIVER` but for the ebpf program.
* `BUILD_WARNINGS_AS_ERRORS`: consider all build warnings fatal
* `MAKE_JOBS`: passed to the -j argument of make

A typical way to run this builder is the following. Assumes you have
checked out falco and sysdig to directories below /home/user/src, and
want to use a build directory of /home/user/build/falco:

```bash
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -e MAKE_JOBS=4 -it -v /home/user/src:/source -v /home/user/build/falco:/build falco-builder cmake
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -e MAKE_JOBS=4 -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder package
```

## Build directly on host

If you'd rather build directly on the host, you can use your local toolchain and cmake binaries.

Clone this repo in a directory that also contains the sysdig source repo. The result should be something like:

```
22:50 vagrant@vagrant-ubuntu-trusty-64:/sysdig
$ pwd
/sysdig
22:50 vagrant@vagrant-ubuntu-trusty-64:/sysdig
$ ls -l
total 20
drwxr-xr-x  1 vagrant vagrant  238 Feb 21 21:44 falco
drwxr-xr-x  1 vagrant vagrant  646 Feb 21 17:41 sysdig
```

To build from the head of falco's dev branch, make sure you're also using the head of the sysdig dev branch. If you're building from a specific version of falco (say x.y.z), there will be a corresponding tag `falco/x.y.z` on the sysdig repository that you should use.

create a build dir, then setup cmake and run make from that dir:

```bash
mkdir build
cd build
cmake ..
make
```

Afterward, you should have a falco executable in `build/userspace/falco/falco`.

If you'd like to build a debug version, run cmake as `cmake -DCMAKE_BUILD_TYPE=Debug ..` instead.

## Load latest falco-probe kernel module

If you have a binary version of falco installed, an older falco kernel module may already be loaded. To ensure you are using the latest version, you should unload any existing falco kernel module and load the locally built version.

Unload any existing kernel module via:

```bash
rmmod falco_probe
```

To load the locally built version, assuming you are in the `build` dir, use:

```bash
insmod driver/falco-probe.ko
```

## Running falco

Assuming you are in the `build` dir, you can run falco as:

```bash
sudo ./userspace/falco/falco -c ../falco.yaml -r ../rules/falco_rules.yaml
```

By default, falco logs events to standard error.
