---
title: Build Falco from source
weight: 5
---

Welcome to the guide on how to build Falco yourself! You are very brave! Since you are already
doing all this, chances that you are willing to contribute are high! Please read our [contributing guide](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md).

1. Install the dependencies

{{< tabs name="Dependencies" >}}
{{% tab name="CentOS / RHEL " %}}

CentOS 7 / RHEL 7

```bash
yum install gcc gcc-c++ git make autoconf automake pkg-config patch ncurses-devel libtool glibc-static libstdc++-static elfutils-libelf-devel
```

You will also need `cmake` version `3.5.1` or higher which is not included in CentOS 7. You can follow the [official guide](https://cmake.org/install/) or look at how that is done in the [Falco builder Dockerfile](https://github.com/falcosecurity/falco/blob/master/docker/builder/Dockerfile).

CentOS 8 / RHEL 8

```bash
dnf install gcc gcc-c++ git make cmake autoconf automake pkg-config patch ncurses-devel libtool elfutils-libelf-devel diffutils which
```
{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}
```bash
apt install git cmake build-essential libncurses-dev pkg-config autoconf libtool libelf-dev -y
```
{{< /tab >}}}

{{% tab name="Arch Linux" %}}
```bash
pacman -S git cmake make gcc wget
pacman -S zlib jq ncurses yaml-cpp openssl curl c-ares protobuf grpc libyaml
```

You'll also need kernel headers for building and making binaries properly.
```bash
pacman -S linux-headers
```

You can use `uname -r` to determine the kernel version and select the appropriate header.
{{< /tab >}}}

{{% tab name="Alpine" %}}
Since Alpine ships with `musl` instead of `glibc`, to build on Alpine, we need to pass the `-DMUSL_OPTIMIZED_BUILD=On` CMake option.

If that option is used along with the `-DUSE_BUNDLED_DEPS=On` option, then the final build will be 100% statically-linked and portable across different Linux distributions.

```bash
apk add g++ gcc cmake cmake make ncurses-dev git bash perl linux-headers autoconf automake m4 libtool elfutils-dev libelf-static patch binutils
```
{{< /tab >}}}

{{% tab name="openSUSE" %}}
```bash
zypper -n install gcc gcc-c++ git-core cmake libjq-devel ncurses-devel yaml-cpp-devel libopenssl-devel libcurl-devel c-ares-devel protobuf-devel grpc-devel patch which automake autoconf libtool libelf-devel libyaml-devel
```
{{< /tab >}}}
{{< /tabs >}}

2. Build Falco

{{< tabs name="Build" >}}
{{% tab name="CentOS / RHEL " %}}

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake -DUSE_BUNDLED_DEPS=ON ..
make falco
```

More details [here](#build-directly-on-host).

{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}

You can skip this on Ubuntu 18.04.

```bash
apt install libssl-dev libc-ares-dev libprotobuf-dev protobuf-compiler libjq-dev libgrpc++-dev protobuf-compiler-grpc libcurl4-openssl-dev libyaml-cpp-dev
```

If you are on Ubuntu 18.04, instead of `cmake ..` do `cmake -DUSE_BUNDLED_DEPS=ON ..`.

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

More details [here](#build-directly-on-host).

{{< /tab >}}}

{{% tab name="Arch Linux" %}}

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

More details [here](#build-directly-on-host).


{{< /tab >}}}
{{% tab name="Alpine" %}}
```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake -DUSE_BUNDLED_DEPS=On -DMUSL_OPTIMIZED_BUILD=On ..
make falco
```
{{< /tab >}}}

{{% tab name="openSUSE" %}}
```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

More details [here](#build-directly-on-host).

{{< /tab >}}}
{{< /tabs >}}



3. Build kernel module driver

{{< tabs name="KernelModule" >}}
{{% tab name="CentOS / RHEL " %}}

In the build directory:

```bash
yum -y install kernel-devel-$(uname -r)
make driver
```

More details [here](#build-directly-on-host).

{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}

Kernel headers are required to build the driver.

```bash
apt install linux-headers-$(uname -r)
```

In the build directory:

```bash
make driver
```
{{< /tab >}}}

{{% tab name="Arch Linux" %}}

In the build directory:

```bash
pacman -S --needed linux-headers
make driver
```

More details [here](#build-directly-on-host).


{{< /tab >}}}
{{% tab name="Alpine" %}}
NO STEP
{{< /tab >}}}

{{% tab name="openSUSE" %}}
In the build directory:

```bash
zypper -n install kernel-default-devel
make driver
```
{{< /tab >}}}
{{< /tabs >}}

4. Build eBPF driver (optional)

{{< tabs name="eBPFdriver" >}}
{{% tab name="CentOS / RHEL " %}}

If you do not want to use the kernel module driver you can, alternatively, build the eBPF driver as follows.

In the build directory:

```bash
dnf install clang llvm
cmake -DBUILD_BPF=ON ..
make bpf
```

{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}

If you do not want to use the kernel module driver you can, alternatively, build the eBPF driver as follows.

In the build directory:

```bash
apt install llvm clang
cmake -DBUILD_BPF=ON ..
make bpf
```
{{< /tab >}}}

{{% tab name="Arch Linux" %}}

If you do not want to use the kernel module driver you can, alternatively, build the eBPF driver as follows.

In the build directory:

```bash
pacman -S llvm clang
cmake -DBUILD_BPF=ON ..
make bpf
```


{{< /tab >}}}
{{% tab name="Alpine" %}}
NO STEP
{{< /tab >}}}

{{% tab name="openSUSE" %}}
If you do not want to use the kernel module driver you can, alternatively, build the eBPF driver as follows.

In the build directory:

```bash
zypper -n install clang llvm
cmake -DBUILD_BPF=ON ..
make bpf
```
{{< /tab >}}}
{{< /tabs >}}

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

## Build Falco

There are two supported ways to build Falco

- [Build directly on host](#build-directly-on-host)
- [Build using a container](#build-using-falco-builder-container)

### Build directly on host

To build Falco, you will need to create a `build` directory.
It's common to have the `build` directory in the Falco working copy itself, however it can be
anywhere in your filesystem.

There are **three main steps to compile** Falco.

1. Create the build directory and enter in it
2. Use cmake in the build directory to create the build files for Falco. `..` was used because the source directory
is a parent of the current directory, you can also use the absolute path for the Falco source code instead
3. Build using make


#### Build all

```bash
mkdir build
cd build
cmake ..
make
```

You can also build only specific targets:

#### Build Falco only

Do the build folder and cmake setup, then:

```bash
make falco
```

#### Build the Falco engine only

Do the build folder and cmake setup, then:

```bash
make falco_engine
```

#### Build libscap only

Do the build folder and cmake setup, then:

```bash
make scap
```

#### Build libsinsp only

Do the build folder and cmake setup, then:

```bash
make sinsp
```

#### Build the eBPF probe / kernel driver only

Do the build folder and cmake setup, then:

```bash
make driver
```

#### Build results

Once Falco is built, the three interesting things that you will find in your `build` folder are:

- `userspace/falco/falco`: the actual Falco binary
- `driver/src/falco.ko`: the Falco kernel driver
- `driver/bpf/falco.o`: if you built Falco with [BPF support](#enable-bpf-support)

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
 -DFALCO_VERSION={{< latest >}}-dirty
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

### Build using falco-builder container

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


## Load latest falco kernel module

If you have a binary version of Falco installed, an older Falco kernel module may already be loaded. To ensure you are using the latest version, you should unload any existing Falco kernel module and load the locally built version.

Unload any existing kernel module via:

```bash
rmmod falco
```

To load the locally built version, assuming you are in the `build` dir, use:

```bash
insmod driver/falco.ko
```

## Run falco

Once Falco is built and the kernel module is loaded, assuming you are in the `build` dir, you can run falco as:

```bash
sudo ./userspace/falco/falco -c ../falco.yaml -r ../rules/falco_rules.yaml
```

By default, falco logs events to standard error.


### Run regression tests

#### Test directly on host

To run regression tests, after building Falco, in the Falco root directory, you need to run the `test/run_regression_tests.sh` script.

##### Dependencies

You will need the following dependencies for the regression testing framework to work.

- Python 3
- [Avocado Framework](https://github.com/avocado-framework/avocado), version 69
- [Avocado Yaml to Mux plugin](https://avocado-framework.readthedocs.io/en/69.0/optional_plugins/varianter_yaml_to_mux.html)
- [JQ](https://github.com/stedolan/jq)
- The `unzip` and `xargs` commands
- [Docker CE](https://docs.docker.com/install)

You will also need to obtain some test fixtures from the internet for the regression test suites to work.

For the python dependencies, how to setup the virtualenv, how to obtain test fixtures, read more [here](https://github.com/falcosecurity/falco/tree/master/test/README.md).

##### Run the tests

Change `$PWD/build` with the directory you built Falco in, if different.

```bash
./test/run_regression_tests.sh -d $PWD/build
```

#### Test using falco-tester container

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
