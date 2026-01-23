---
title: Build Falco from source
description: Build Falco or its libraries from the source code
aliases:
- ../source
- ../getting-started/source
- ../install-operate/source
weight: 10
---

Welcome to the guide on how to build Falco yourself! You are very brave! Since you are already
doing all this, chances that you are willing to contribute are high! Please read our [contributing guide](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md).

1. Install the dependencies

{{< tabs name="Dependencies" >}}
{{% tab name="CentOS / RHEL " %}}

CentOS 8 Stream / RHEL 8

```bash
dnf install git gcc gcc-c++ make cmake elfutils-libelf-devel perl-IPC-Cmd
```

{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}

```bash
apt update && apt install git cmake clang build-essential linux-tools-common linux-tools-generic libelf-dev bpftool
```

{{< /tab >}}}

{{% tab name="Arch Linux" %}}

```bash
pacman -S git cmake make gcc wget
pacman -S zlib jq yaml-cpp openssl curl c-ares protobuf grpc libyaml bpf
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
apk add g++ gcc cmake make git bash perl linux-headers autoconf automake m4 libtool elfutils-dev libelf-static binutils bpftool clang
```

{{< /tab >}}}

{{% tab name="openSUSE" %}}

```bash
zypper -n install git gcc12 gcc12-c++ cmake make libelf-devel gawk
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

More details [here](#build-falco).

{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake -DUSE_BUNDLED_DEPS=On ..
make falco
```

More details [here](#build-falco).

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

More details [here](#build-falco).

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

First, make sure that `gcc` and `g++` are version 9 or above. If you have multiple versions installed you can [set the preferred one](#specify-c-and-cxx-compilers).

```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake -DUSE_BUNDLED_DEPS=ON ..
make falco
```

More details [here](#build-falco).

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

More details [here](#build-falco).

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

More details [here](#build-falco).

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

4. Build eBPF driver (deprecated)

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

## Build Falco

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
- `driver/bpf/falco.o`: if you built Falco with [eBPF support](#enable-ebpf-support)

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

#### Enable eBPF support

```
-DBUILD_BPF=True
```

When enabling this you will be able to make the `bpf` target after:

```bash
make bpf
```

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
