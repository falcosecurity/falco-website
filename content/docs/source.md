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

TODO(fntlnz, leodido): write here about the runtime dependencies,
how to have them static, dynamic by using the USE_BUNDLED flags.

b64
cares
civetweb
grpc
jq
libcurl
libyaml
lpeg
luajit
lyaml
ncurses
njson
openssl
protobuf
sysdig
tbb
yamlcpp
zlib


## Obtain the source code

First, make sure you have a working copy of the Falco source code along with a working copy of Sysdig.

You will need to have them in the same directory, this is a requirement to compile Falco.

**Clone Falco**

```bash
git clone https://github.com/falcosecurity/falco.git
```

**Clone Sysdig**

```bash
git clone https://github.com/draios/sysdig.git
```

## Build from source

To build Falco, you will need to create a `build` directory.
It's common to have the `build` directory in the Falco working copy itself, however it can be
anywhere in your filesystem.

There are **three main steps to compile** Falco.

1. Create the build directory and enter in it
2. Use cmake in the build directory to create the build files for Falco. `..` was used because the source directory
is a parent of the current directory, you can also use the absolute path for the Falco source code instead
3. Build using make

Here's how to do it:

```bash
mkdir build
cd build
cmake ..
make
```

When doing the `cmake` command, we can pass additional parameters to change the behavior of the build files.

### Examples

Here'are some examples, always assuming your `build` folder is inside the Falco working copy.

**Generate verbose makefiles**

```bash
cmake -DCMAKE_VERBOSE_MAKEFILE=On ..
```

**Specify C and CXX compilers**

```
cmake -DCMAKE_C_COMPILER=$(which gcc) -DCMAKE_CXX_COMPILER=$(which g++) ..
```

**Disable a bundled dependency**

```
cmake -DUSE_BUNDLED_JQ=False ..
```

Read more about Falco dependencies [here](#Dependencies).
