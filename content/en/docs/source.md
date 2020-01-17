---
title: Build Falco from source
weight: 6
---

Welcome to the guide on how to build Falco yourself! You are very brave! Since you are already
doing all this, chances that you are willing to contribute are high! Please read our [contributing guide](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md).

## System requirements

In order to compile Falco, you will need the following tools and installed on your machine.

- wget
- pkg-config
- make
- cmake
- gcc
- g++
- kernel headers
- libelf-dev

Following, you can find how to meet the minimum requirements in the most common Linux distros.

### CentOS/RHEL

```bash
yum install
```

### Fedora

```bash
dnf install
```

### Ubuntu

```bash
apt install
```

### Debian

```bash
apt install
```

### Arch Linux

```bash
pacman -S
```

## Dependencies

By default Falco build bundles **most of** its runtime dependencies **dynamically**.

You can notice this observing that the option `USE_BUNDLED_DEPS` is `OFF` by default. Which means that, whether applicable, Falco build will try to link against libraries already existing into your machine.

Changing such option to `ON` causes Falco build to bundle all the dependencies statically.

For the sake of completeness this is the complete list of Falco dependencies:

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
- libscap
- libsinsp

## Obtain the source code

First, make sure you have a working copy of the Falco source code along with a working copy of `libsinsp` and `libscap`.

**Clone Falco**

```bash
git clone https://github.com/falcosecurity/falco.git
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

### Build the probe / kernel driver only

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

#### Enforce bundled dependencies

```
-DUSE_BUNDLED_DEPS=True
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

Notice this variable is case-insensitive and it defaults to release.

#### Specify the Falco version

Optionally the user can specify the version he wants Falco to have. Eg.,

```
 -DFALCO_VERSION=0.19.0-dirty
```

When not explicitly specifying it the build system will compute the `FALCO_VERSION` value from the git history.

In case the current git revision has a git tag, the Falco version will be equal to it (without the leading "v" character). Otherwise the Falco version will be in the form `0.<commit hash>[.dirty]`.

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

* `BUILD_TYPE`: debug or release (case-insensitive, defaults to release)
* `BUILD_DRIVER`: whether or not to build the kernel module when
building. This should usually be OFF, as the kernel module would be
built for the files in the centos image, not the host.
* `BUILD_BPF`: Like `BUILD_DRIVER` but for the ebpf program.
* `BUILD_WARNINGS_AS_ERRORS`: consider all build warnings fatal
* `MAKE_JOBS`: passed to the -j argument of make

A typical way to run this builder is the following. Assuming you have
checked out Falco and Sysdig to directories below /home/user/src, and
want to use a build directory of /home/user/build/falco, you would run
the following:

```bash
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder cmake
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder package
```

It's also possible to explicitly provide the `FALCO_VERSION` environment variable to use it as the version for any built package.

Otherwise the docker image will use the default `FALCO_VERSION`.


# Load latest falco-probe kernel module

If you have a binary version of Falco installed, an older Falco kernel module may already be loaded. To ensure you are using the latest version, you should unload any existing Falco kernel module and load the locally built version.

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

To run regression tests, after building Falco, in the Falco root directory, you need to run the `test/run_regression_tests.sh` script.

### Dependencies

You will need the following dependencies for the regression testing framework to work.

- [Avocado Framework](https://github.com/avocado-framework/avocado), version 69
- [Avocado Yaml to Mux plugin](https://avocado-framework.readthedocs.io/en/69.0/optional_plugins/varianter_yaml_to_mux.html)
- [JQ](https://github.com/stedolan/jq)
- The `unzip` and `xargs` commands
- [Docker CE](https://docs.docker.com/install/)

To install Avocado and its plugins, you can use pip:

```
pip2 install avocado-framework==69.0 avocado-framework-plugin-varianter-yaml-to-mux==69.0
```

### Run the tests

Change `$PWD/build` with the directory you built Falco in, if different.

```bash
./test/run_regression_tests.sh $PWD/build
```

## Test using falco-tester container

If you'd like to run the regression test suite against your build, you can use the [falco-tester](https://hub.docker.com/r/falcosecurity/falco-tester) container. Like the builder image, it contains the necessary environment to run the regression tests, but relies on a source directory and build directory that are mounted into the image. It's a different image than `falco-builder` as it doesn't need a compiler and needs a different base image to include the test runner framework [avocado](http://avocado-framework.github.io/).

It does build a new container image `falcosecurity/falco:test` (which source is into `docker/local` directory into Falco GitHub repository) to test the process of buillding and running a container with the Falco packages built during the build step.

The image depends on the following parameters:

* `FALCO_VERSION`: The version of the Falco package to include in the test container image. It must match the version of the built packages.

A typical way to run this builder is the following. Assuming you have
checked out Falco and Sysdig to directories below `/home/user/src`, and
want to use a build directory of `/home/user/build/falco`, you would run
the following:

```bash
docker run --user $(id -u):$(id -g) -v $HOME:$HOME:ro -v /boot:/boot:ro -v /var/run/docker.sock:/var/run/docker.sock -v /etc/passwd:/etc/passwd:ro -e FALCO_VERSION=${FALCO_VERSION} -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-tester
```

Mounting `$HOME` allows the test execution framework to run. You may need to replace `$(id -g)` with the right gid of the group that is allowed to access the docker socket (often the `docker` group).
