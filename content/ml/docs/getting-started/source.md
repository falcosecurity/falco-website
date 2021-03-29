---
title: സോഴ്സിൽ നിന്ന് ഫാൽക്കോ നിർമ്മിക്കുക
weight: 5
---

ഫാൽകോ സ്വയം എങ്ങനെ നിർമ്മിക്കാം എന്നതിനെക്കുറിച്ചുള്ള ഗൈഡിലേക്ക് സ്വാഗതം! ഫാൽക്കോ ഉപയോഗിക്കാൻ തീരുമാനിച്ചത്തിലൂടെ നിങ്ങളുടെ സംഭാവനകൾക്ക് തുടക്കമായിരിക്കുകയാണ്. എങ്ങനെ ഫാൽക്കോ പ്രോജെക്ടിനെ സഹായിക്കാം എന്നറിയാൻ ദയവായി ഞങ്ങളുടെ [contributing guide](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md) വായിക്കുക.

1. ഡിപൻഡൻസികൾ ഇൻസ്റ്റാൾ ചെയ്യുക:

{{< tabs name="Dependencies" >}}
{{% tab name="CentOS / RHEL " %}}

CentOS 7 / RHEL 7

```bash
yum install gcc gcc-c++ git make autoconf automake pkg-config patch ncurses-devel libtool glibc-static libstdc++-static elfutils-libelf-devel
```

CentOS 7 ൽ ഉൾപ്പെടുത്തിയിട്ടില്ലാത്തതിനാൽ  `cmake` ` 3.5.1`-ഓ  ഉയർന്നതോ ആയ പതിപ്പ്  നിങ്ങൾക്ക് ആവശ്യമാണ്. നിങ്ങൾക്ക് ഔദ്യോഗിക ഗൈഡ് [official guide](https://cmake.org/install/) പിന്തുടരാം. അല്ലെങ്കിൽ ഫാൽകോ ബിൽഡർ ഡോക്കർ ഫയലിൽ [Falco builder Dockerfile](https://github.com/falcosecurity/falco/blob/master/docker/builder/Dockerfile) ഇത് എങ്ങനെ ചെയ്യാമെന്ന് നോക്കാം.

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
{{< /tab >}}}

{{% tab name="Alpine" %}}
നിർമ്മാണ കാര്യങ്ങൾക്കായി `glib`-നുപകരം `musl`  ഉള്ള ആൽപൈൻ ലഭ്യമായതിനാൽ, `-DMUSL_OPTIMIZED_BUILD = On` CMake ഓപ്ഷൻ പാസ് ചെയ്യുന്നു.

`-DUSE_BUNDLED_DEPS = On` ഓപ്ഷനുമൊത്ത് ആ ഓപ്ഷൻ ഉപയോഗിച്ചിട്ടുണ്ടെങ്കിൽ, അന്തിമ ബിൽഡ് 100% സ്റ്റാറ്റിക്ക്-ലിങ്ക്ഡ് ആകുകയും വ്യത്യസ്ത ലിനക്സ് വിതരണങ്ങളിലുടനീളം പോർട്ടബിൾ ആകുകയും ചെയ്യും.


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

2. ഫാൽക്കോ നിർമ്മിക്കുക:

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

കൂടുതൽ വിവരങ്ങൾക്ക് [ഈ ടോപ്പിക്ക്](#build-directly-on-host) കാണുക.

{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}

ഉബുണ്ടു 18.04 ൽ നിങ്ങൾക്ക് ഇത് ഒഴിവാക്കാം.

```bash
apt install libssl-dev libc-ares-dev libprotobuf-dev protobuf-compiler libjq-dev libgrpc++-dev protobuf-compiler-grpc libcurl4-openssl-dev libyaml-cpp-dev
```
നിങ്ങൾ ഉബുണ്ടു 18.04 ൽ ആണെങ്കിൽ `cmake` എന്നതിനുപകരം `cmake -DUSE_BUNDLED_DEPS=ON ..` ഉപയോഗിക്കുക.


```bash
git clone https://github.com/falcosecurity/falco.git
cd falco
mkdir -p build
cd build
cmake ..
make falco
```

കൂടുതൽ വിവരങ്ങൾക്ക് [ഈ ടോപ്പിക്ക്](#build-directly-on-host) കാണുക.

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

കൂടുതൽ വിവരങ്ങൾക്ക് [ഈ ടോപ്പിക്ക്](#build-directly-on-host) കാണുക.

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

കൂടുതൽ വിവരങ്ങൾക്ക് [ഈ ടോപ്പിക്ക്](#build-directly-on-host) കാണുക.

{{< /tab >}}}
{{< /tabs >}}



3. കേർണൽ മൊഡ്യൂൾ ഡ്രൈവർ നിർമ്മിക്കുക:

{{< tabs name="KernelModule" >}}
{{% tab name="CentOS / RHEL " %}}

ബിൽഡ് ഡയറക്ടറിയിൽ:

```bash
yum -y install kernel-devel-$(uname -r)
make driver
```

കൂടുതൽ വിവരങ്ങൾക്ക് [ഈ ടോപ്പിക്ക്](#build-directly-on-host) കാണുക.

{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}

ഡ്രൈവർ നിർമ്മിക്കുന്നതിന് കേർണൽ തലക്കെട്ടുകൾ ആവശ്യമാണ്.

```bash
apt install linux-headers-$(uname -r)
```

ബിൽഡ് ഡയറക്ടറിയിൽ:

```bash
make driver
```
{{< /tab >}}}

{{% tab name="Arch Linux" %}}

ബിൽഡ് ഡയറക്ടറിയിൽ:

```bash
pacman -S linux-headers
make driver
```

കൂടുതൽ വിവരങ്ങൾക്ക് [ഈ ടോപ്പിക്ക്](#build-directly-on-host) കാണുക.


{{< /tab >}}}
{{% tab name="Alpine" %}}
NO STEP
{{< /tab >}}}

{{% tab name="openSUSE" %}}

ബിൽഡ് ഡയറക്ടറിയിൽ:

```bash
zypper -n install kernel-default-devel
make driver
```
{{< /tab >}}}
{{< /tabs >}}

4. Build eBPF driver (optional)

{{< tabs name="eBPFdriver" >}}
{{% tab name="CentOS / RHEL " %}}

നിങ്ങൾക്ക് കേർണൽ മൊഡ്യൂൾ ഡ്രൈവർ ഉപയോഗിക്കാൻ താൽപ്പര്യമില്ലെങ്കിൽ, നിങ്ങൾക്ക് ഇബിപിഎഫ് ഡ്രൈവർ ഇനിപ്പറയുന്ന രീതിയിൽ നിർമ്മിക്കാം.

ബിൽഡ് ഡയറക്ടറിയിൽ:

```bash
dnf install clang llvm
cmake -DBUILD_BPF=ON ..
make bpf
```

{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}

നിങ്ങൾക്ക് കേർണൽ മൊഡ്യൂൾ ഡ്രൈവർ ഉപയോഗിക്കാൻ താൽപ്പര്യമില്ലെങ്കിൽ, നിങ്ങൾക്ക് ഇബിപിഎഫ് ഡ്രൈവർ ഇനിപ്പറയുന്ന രീതിയിൽ നിർമ്മിക്കാം.

ബിൽഡ് ഡയറക്ടറിയിൽ:

```bash
apt install llvm clang
cmake -DBUILD_BPF=ON ..
make bpf
```
{{< /tab >}}}

{{% tab name="Arch Linux" %}}

നിങ്ങൾക്ക് കേർണൽ മൊഡ്യൂൾ ഡ്രൈവർ ഉപയോഗിക്കാൻ താൽപ്പര്യമില്ലെങ്കിൽ, നിങ്ങൾക്ക് ഇബിപിഎഫ് ഡ്രൈവർ ഇനിപ്പറയുന്ന രീതിയിൽ നിർമ്മിക്കാം.

ബിൽഡ് ഡയറക്ടറിയിൽ:

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

നിങ്ങൾക്ക് കേർണൽ മൊഡ്യൂൾ ഡ്രൈവർ ഉപയോഗിക്കാൻ താൽപ്പര്യമില്ലെങ്കിൽ, നിങ്ങൾക്ക് ഇബിപിഎഫ് ഡ്രൈവർ ഇനിപ്പറയുന്ന രീതിയിൽ നിർമ്മിക്കാം.

ബിൽഡ് ഡയറക്ടറിയിൽ:

```bash
zypper -n install clang llvm
cmake -DBUILD_BPF=ON ..
make bpf
```
{{< /tab >}}}
{{< /tabs >}}

## ഡിപെൻഡൻസികൾ

സാധാരണയായി ഫാൽകോ അതിന്റെ റൺടൈം ഡിപൻഡൻസികളിൽ ഭൂരിഭാഗവും പാക്കേജ് ചെയ്യുന്നു.
`USE_BUNDLED_DEPS` ഓപ്ഷൻ സ്ഥിരസ്ഥിതിയായി `OFF` ആണെന്ന് നിങ്ങൾക്ക് കാണാം. ഇതിനർത്ഥം, ബാധകമാണെങ്കിൽ, നിങ്ങളുടെ മെഷീനിൽ ഇതിനകം നിലവിലുള്ള ലൈബ്രറികളുമായി ബന്ധിപ്പിക്കാൻ ഫാൽകോ ബിൽഡ് ശ്രമിക്കും.

അത്തരം ഓപ്‌ഷൻ‌ `ON` ഓണിലേക്ക് മാറ്റുന്നത് ഫാൽ‌കോ ബിൽ‌ഡ് എല്ലാ ഡിപൻ‌ഡൻസികളെയും സ്റ്റാറ്റിറ്റിക്കായി കൂട്ടിച്ചേർക്കുന്നു.

ഇത് ഫാൽക്കോ ഡിപൻഡൻസികളുടെ പൂർണ്ണമായ പട്ടികയാണ്:

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

## ഫാൽക്കോ നിർമ്മിക്കുക

There are two supported ways to build Falco

- [ഹോസ്റ്റിൽ നേരിട്ട് നിർമ്മിക്കുക](#build-directly-on-host)
- [ഒരു കണ്ടെയ്നർ ഉപയോഗിച്ച് നിർമ്മിക്കുക](#build-using-falco-builder-container)

### ഹോസ്റ്റിൽ നേരിട്ട് നിർമ്മിക്കുക

ഫാൽക്കോ നിർമ്മിക്കുന്നതിന്, നിങ്ങൾ ഒരു `build` ഡയറക്ടറി സൃഷ്ടിക്കേണ്ടതുണ്ട്.
ഫാൽക്കോ വർക്കിംഗ് കോപ്പിയിൽ തന്നെ `build` ഡയറക്ടറി ഉണ്ടായിരിക്കുന്നത് സാധാരണമാണ്, എന്നിരുന്നാലും ഇത് നിങ്ങളുടെ ഫയൽസിസ്റ്റത്തിൽ എവിടെയും ആകാം.

** ഫാൽക്കോ സമാഹരിക്കുന്നതിന് ** മൂന്ന് പ്രധാന ഘട്ടങ്ങളുണ്ട്.

1. ബിൽഡ് ഡയറക്ടറി സൃഷ്ടിച്ച് അതിൽ പ്രവേശിക്കുക.
2. ഫാൽക്കോയ്‌ക്കായി ബിൽഡ് ഫയലുകൾ സൃഷ്‌ടിക്കാൻ ബിൽഡ് ഡയറക്‌ടറിയിൽ `cmake` ഉപയോഗിക്കുക. `..` ഉപയോഗിച്ചതിന് കാരണം ഉറവിട ഡയറക്‌ടറി നിലവിലെ ഡയറക്‌ടറിയുടെ പാരന്റ് ആയതിനാലാണ്. പകരം നിങ്ങൾക്ക് ഫാൽകോ സോഴ്‌സ് കോഡിനായി കേവല പാത ഉപയോഗിക്കാം.
3. `make` ഉപയോഗിച്ച് നിർമ്മിക്കുക.


#### എല്ലാം നിർമ്മിക്കുക

```bash
mkdir build
cd build
cmake ..
make
```

നിർദ്ദിഷ്ട ടാർഗെറ്റുകൾ മാത്രം നിർമ്മിക്കാനും നിങ്ങൾക്ക് കഴിയും:

#### ഫാൽക്കോ മാത്രം നിർമ്മിക്കുക

ബിൽഡ് ഫോൾഡറും `cmake` സജ്ജീകരണവും ചെയ്യുക, തുടർന്ന്:

```bash
make falco
```

#### ഫാൽകോ എഞ്ചിൻ മാത്രം നിർമ്മിക്കുക

ബിൽഡ് ഫോൾഡറും `cmake` സജ്ജീകരണവും ചെയ്യുക, തുടർന്ന്:

```bash
make falco_engine
```

#### libscap മാത്രം നിർമ്മിക്കുക

ബിൽഡ് ഫോൾഡറും `cmake` സജ്ജീകരണവും ചെയ്യുക, തുടർന്ന്:

```bash
make scap
```

#### libsinsp മാത്രം നിർമ്മിക്കുക

ബിൽഡ് ഫോൾഡറും `cmake` സജ്ജീകരണവും ചെയ്യുക, തുടർന്ന്:

```bash
make sinsp
```

#### eBPF probe / kernel driver മാത്രം നിർമ്മിക്കുക

ബിൽഡ് ഫോൾഡറും `cmake` സജ്ജീകരണവും ചെയ്യുക, തുടർന്ന്:

```bash
make driver
```

#### results നിർമ്മിക്കുക

ഫാൽക്കോ നിർമ്മിച്ചുകഴിഞ്ഞാൽ, നിങ്ങളുടെ `build` ഫോൾഡറിൽ നിങ്ങൾ കണ്ടെത്തുന്ന മൂന്ന് കാര്യങ്ങൾ ഇവയാണ്:

- `userspace/falco/falco`: യഥാർത്ഥ ഫാൽക്കോ ബൈനറി
- `driver/src/falco.ko`: ഫാൽകോ കേർണൽ ഡ്രൈവർ
- `driver/bpf/falco.o`: [BPF support](#enable-bpf-support) ഉപയോഗിച്ച് നിങ്ങൾ ഫാൽക്കോ നിർമ്മിച്ചിട്ടുണ്ടെങ്കിൽ

ഒരു ഡീബഗ് പതിപ്പ് നിർമ്മിക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെങ്കിൽ, `cmake -DCMAKE_BUILD_TYPE = Debug ..` ആയി പ്രവർത്തിപ്പിക്കുക. കൂടുതൽ ഇഷ്‌ടാനുസൃതമാക്കലുകൾക്കായി[CMake Options](#cmake-options) കാണുക.

### CMake ഓപ്ഷനുകൾ

`cmake` കമാൻഡ് ചെയ്യുമ്പോൾ, ബിൽഡ് ഫയലുകളുടെ സ്വഭാവം മാറ്റുന്നതിന് ഞങ്ങൾക്ക് അധിക പാരാമീറ്ററുകൾ നൽകാം.
ഇവിടെ തന്നിരിക്കുന്ന  ഉദാഹരണങ്ങൾ നോക്കുക. എല്ലായ്പ്പോഴും നിങ്ങളുടെ `build` ഫോൾഡർ ഫാൽകോ വർക്കിംഗ് കോപ്പിക്കുള്ളിൽ ആണെന്ന് കരുതുക.

#### വെർബോസ് മെയ്ക്ക് ഫയലുകൾ സൃഷ്ടിക്കുക

```bash
-DCMAKE_VERBOSE_MAKEFILE=On
```

#### C, CXX കംപൈലറുകൾ വ്യക്തമാക്കുക

```
-DCMAKE_C_COMPILER=$(which gcc) -DCMAKE_CXX_COMPILER=$(which g++)
```

#### ബണ്ടിൽഡ് ഡിപൻഡൻസികൾ നടപ്പിലാക്കുക

```
-DUSE_BUNDLED_DEPS=True
```

ഫാൽകോ [ഡിപൻഡൻസികളെക്കുറിച്ച്](#dependencies) കൂടുതൽ വായിക്കുക.


#### മുന്നറിയിപ്പുകളെ പിശകുകളായി പരിഗണിക്കുക

```
-DBUILD_WARNINGS_AS_ERRORS=True
```

#### ബിൽഡ് തരം വ്യക്തമാക്കുക

ബിൽഡ് ടൈപ്പ് ഡീബഗ് ചെയ്യുക

```
-DCMAKE_BUILD_TYPE=Debug
```

ബിൽഡ് ടൈപ്പ് റിലീസ് ചെയ്യുക

```
-DCMAKE_BUILD_TYPE=Release
```
ഈ വേരിയബിൾ കേസ്-സെൻസിറ്റീവ് ആണെന്നും ഇത് സാധാരണയായി റിലീസ് ആയാണ് ക്രമീകരിച്ചിരിക്കുന്നത്.

#### ഫാൽകോ പതിപ്പ് വ്യക്തമാക്കുക

ഓപ്ഷണലായി ഉപയോക്താവിന് ആഗ്രഹിക്കുന്ന ഫാൽക്കോ പതിപ്പ് വ്യക്തമാക്കാം

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
