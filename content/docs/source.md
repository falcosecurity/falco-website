---
title: Build Falco from source
weight: 6
---

TODO(fntlnz, leodido): finish up this page.

Content that will be here:
- System requirements
- Obtain the source code
- Build options (USE_BUNDLED STUFF, linking) - Also build type, Debug or Release - The FALCO_VERSION environment variable
- Build the falco binary
- Build the kernel module
- Build the bpf probe
- Building packages
- Debugging
- Release a new version



## System requirements

TODO(fntlnz, leodido): finish up this

- wget
- pkg-config
- make
- cmake
- gcc
- g++
- glibc-static
- kernel headers
- libelf-dev


### CentOS/RHEL

```bash
yum install gcc gcc-c++ cmake make pkgconfig autoconf wget automake patch elfutils-libelf libtool kernel-devel kernel-headers
```

### Fedora

```bash
dnf install gcc gcc-c++ cmake make pkgconfig autoconf wget automake patch elfutils-libelf libtool kernel-devel kernel-headers
```

### Ubuntu

```
TODO
```

### Debian

```
TODO
```

### Arch Linux

```
TODO
```

## Dependencies

By default Falco build bundles its dependencies statically.

You can notice this observing that the option [`USE_BUNDLED_DEPS`](https://github.com/falcosecurity/falco/blob/75b816d806d29bd47ace6b14a311c18dfc610d19/CMakeLists.txt#L86) is `ON` by default. Which in turn causes all of the dependencies options (eg., [`USE_BUNDLED_ZLIB`](https://github.com/falcosecurity/falco/blob/75b816d806d29bd47ace6b14a311c18dfc610d19/CMakeLists.txt#L91), [`USE_BUNDLED_JQ`](https://github.com/falcosecurity/falco/blob/75b816d806d29bd47ace6b14a311c18dfc610d19/CMakeLists.txt#L120), ...) to inherit this setting.

In case you prefer to have all of them dynamically linked, you can change the value of this option.

But it's also possible to selectively declare which dependency have to be linked dynamically through the `USE_BUNDLED_*` environment variables to disable the default behavior.

For example, suppose you do not want to use the bundled `jq` dependency but you prefer to link the `jq` dalready present in your system.
To achieve this goal you need to configure the build process passing the `USE_BUNDLED_JQ=False` as shown in more detail [here](#disable-a-bundled-dependency).

These are all the dependencies for which you can disable the bundling mechanism.

Each of these respects an option `USE_BUNDLED_<DEPENDENCY_NAME>` you can set to `False`.

- b64
- cares
- curl
- civetweb
- grpc
- jq
- libyaml
- lpeg
- luajit
- lyaml
- ncurses
- njson
- openssl
- protobuf
- tbb
- yamlcpp
- zlib

Furthermore Falco also depends on the following libraries coming from the Sysdig repository:

- libscap
- libsinsp

## Obtain the source code

First, make sure you have a working copy of the Falco source code along with a working copy of Sysdig to compile `libscap` and `libsinsp`.

You will need to have them in the same directory, this is a requirement to compile Falco.

**Clone Falco**

```bash
git clone https://github.com/falcosecurity/falco.git
```

**Clone Sysdig**

```bash
git clone https://github.com/draios/sysdig.git
```

# Build Falco

There are two supported ways to build Falco

- [Build directly on host](#build-directly-on-host)
- [Build using a container](#build-using-falco-builder-container)

## Build directly on host

To build Falco, you will need to create a `build` directory.
It's common to have the `build` directory in the Falco working copy itself, however it can be
anywhere in your filesystem.

There are **three main steps to compile** Falco.

1. Create the build directory and enter in it
2. Use cmake in the build directory to create the build files for Falco. `..` was used because the source directory
is a parent of the current directory, you can also use the absolute path for the Falco source code instead
3. Build using make


### Build all

```bash
mkdir build
cd build
cmake ..
make
```

You can also build only specific targets:

### Build Falco only

Do the build folder and cmake setup, then:

```bash
make falco
```

### Build the Falco engine only

Do the build folder and cmake setup, then:

```bash
make falco_engine
```

### Build libscap only

Do the build folder and cmake setup, then:

```bash
make scap
```

### Build libsinsp only

Do the build folder and cmake setup, then:

```bash
make sinsp
```

### Build the kernel driver only

Do the build folder and cmake setup, then:

```bash
make driver
```

### Build results

Once Falco is built, the three interesting things that you will find in your `build` folder are:

- `userspace/falco/falco`: the actual Falco binary
- `driver/src/falco-probe.ko`: the Falco kernel driver
- `driver/bpf/probe.o`: if you built Falco with [BPF support](#enable-bpf-support)

If you'd like to build a debug version, run cmake as `cmake -DCMAKE_BUILD_TYPE=Debug ..` instead, see the [CMake Options](#cmake-options) section for further customizations.

### CMake Options

When doing the `cmake` command, we can pass additional parameters to change the behavior of the build files.

Here'are some examples, always assuming your `build` folder is inside the Falco working copy.

#### Generate verbose makefiles

```bash
-DCMAKE_VERBOSE_MAKEFILE=On
```

#### Specify C and CXX compilers

```
-DCMAKE_C_COMPILER=$(which gcc) -DCMAKE_CXX_COMPILER=$(which g++)
```

#### Disable a bundled dependency

```
-DUSE_BUNDLED_JQ=False
```

Read more about Falco dependencies [here](#dependencies).


#### Treat warnings as errors

```
-DBUILD_WARNINGS_AS_ERRORS=True
```

#### Specify the build type

Debug build type
```
-DCMAKE_BUILD_TYPE=Debug
```

Release build type
```
-DCMAKE_BUILD_TYPE=Release
```

#### Specify the Falco version

```
 -DFALCO_VERSION=0.15.0-dirty
```

#### Enable BPF support

```
-DBUILD_BPF=True
```

When enabling this you will be able to make the `bpf` target after:

```bash
make bpf
```

## Build using falco-builder container

An alternative way to build Falco is to run the [falco-builder](https://hub.docker.com/r/falcosecurity/falco-builder) container.
It contains the reference toolchain that can be used to build packages and all the dependencies are already satisfied.

The image depends on the following parameters:

* `FALCO_VERSION`: the version to give any built packages
* `BUILD_TYPE`: Debug or Release
* `BUILD_DRIVER`: whether or not to build the kernel module when
building. This should usually be OFF, as the kernel module would be
built for the files in the centos image, not the host.
* `BUILD_BPF`: Like `BUILD_DRIVER` but for the ebpf program.
* `BUILD_WARNINGS_AS_ERRORS`: consider all build warnings fatal
* `MAKE_JOBS`: passed to the -j argument of make

A typical way to run this builder is the following. Assuming you have
checked out falco and sysdig to directories below /home/user/src, and
want to use a build directory of /home/user/build/falco, you would run
the following:

```bash
FALCO_VERSION=0.1.2-test docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -e MAKE_JOBS=4 -e FALCO_VERSION=${FALCO_VERSION} -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder cmake
FALCO_VERSION=0.1.2-test docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -e MAKE_JOBS=4 -e FALCO_VERSION=${FALCO_VERSION} -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder package
```

The default value for `FALCO_VERSION` is `0.1.1dev`, so you can skip specifying `FALCO_VERSION` if you want.


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

```bash
rmmod falco_probe
```

To load the locally built version, assuming you are in the `build` dir, use:

```bash
insmod driver/falco-probe.ko
```

# Run falco

Once Falco is built and the kernel module is loaded, assuming you are in the `build` dir, you can run falco as:

```bash
sudo ./userspace/falco/falco -c ../falco.yaml -r ../rules/falco_rules.yaml
```

By default, falco logs events to standard error.


# Run regression tests

## Test directly on host


## Test using falco-tester container

If you'd like to run the regression test suite against your build, you can use the [falco-tester](https://hub.docker.com/r/falcosecurity/falco-tester) container. Like the builder image, it contains the necessary environment to run the regression tests, but relies on a source directory and build directory that are mounted into the image. It's a different image than `falco-builder` as it doesn't need a compiler and needs a different base image to include the test runner framework [avocado](http://avocado-framework.github.io/).

It does build a new container image `falcosecurity/falco:test` to test the process of buillding and running a container with the falco packages built during the build step.

The image depends on the following parameters:

* `FALCO_VERSION`: The version of the falco package to include in the test container image.

A typical way to run this builder is the following. Assuming you have
checked out falco and sysdig to directories below /home/user/src, and
want to use a build directory of /home/user/build/falco, you would run
the following:

```bash
docker run --user $(id -u):$(id -g) -v $HOME:$HOME:ro -v /boot:/boot:ro -v /var/run/docker.sock:/var/run/docker.sock -v /etc/passwd:/etc/passwd:ro -e FALCO_VERSION=${FALCO_VERSION} -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-tester
```

Mounting $HOME allows the test execution framework to run. You may need to replace `$(id -g)` with the right gid of the group that is allowed to access the docker socket (often the `docker` group).

The default value for FALCO_VERSION is `0.1.1dev`, so you can skip specifying `FALCO_VERSION` if you want.
