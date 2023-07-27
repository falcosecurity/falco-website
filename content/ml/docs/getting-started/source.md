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
yum install gcc gcc-c++ git make autoconf automake pkg-config patch libtool glibc-static libstdc++-static elfutils-libelf-devel
```

CentOS 7 ൽ ഉൾപ്പെടുത്തിയിട്ടില്ലാത്തതിനാൽ  `cmake` ` 3.5.1`-ഓ  ഉയർന്നതോ ആയ പതിപ്പ്  നിങ്ങൾക്ക് ആവശ്യമാണ്. നിങ്ങൾക്ക് ഔദ്യോഗിക ഗൈഡ് [official guide](https://cmake.org/install/) പിന്തുടരാം. അല്ലെങ്കിൽ ഫാൽകോ ബിൽഡർ ഡോക്കർ ഫയലിൽ [Falco builder Dockerfile](https://github.com/falcosecurity/falco/blob/master/docker/builder/Dockerfile) ഇത് എങ്ങനെ ചെയ്യാമെന്ന് നോക്കാം.

CentOS 8 / RHEL 8

```bash
dnf install gcc gcc-c++ git make cmake autoconf automake pkg-config patch libtool elfutils-libelf-devel diffutils which
```
{{< /tab >}}}

{{% tab name="Debian/ Ubuntu" %}}
```bash
apt install git cmake build-essential pkg-config autoconf libtool libelf-dev -y
```
{{< /tab >}}}

{{% tab name="Arch Linux" %}}
```bash
pacman -S git cmake make gcc wget
pacman -S zlib jq yaml-cpp openssl curl c-ares protobuf grpc libyaml
```
{{< /tab >}}}

{{% tab name="Alpine" %}}
നിർമ്മാണ കാര്യങ്ങൾക്കായി `glib`-നുപകരം `musl`  ഉള്ള ആൽപൈൻ ലഭ്യമായതിനാൽ, `-DMUSL_OPTIMIZED_BUILD = On` CMake ഓപ്ഷൻ പാസ് ചെയ്യുന്നു.

`-DUSE_BUNDLED_DEPS = On` ഓപ്ഷനുമൊത്ത് ആ ഓപ്ഷൻ ഉപയോഗിച്ചിട്ടുണ്ടെങ്കിൽ, അന്തിമ ബിൽഡ് 100% സ്റ്റാറ്റിക്ക്-ലിങ്ക്ഡ് ആകുകയും വ്യത്യസ്ത ലിനക്സ് വിതരണങ്ങളിലുടനീളം പോർട്ടബിൾ ആകുകയും ചെയ്യും.


```bash
apk add g++ gcc cmake cmake make git bash perl linux-headers autoconf automake m4 libtool elfutils-dev libelf-static patch binutils
```
{{< /tab >}}}

{{% tab name="openSUSE" %}}
```bash
zypper -n install gcc gcc-c++ git-core cmake libjq-devel yaml-cpp-devel libopenssl-devel libcurl-devel c-ares-devel protobuf-devel grpc-devel patch which automake autoconf libtool libelf-devel libyaml-devel
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
- grpc
- jq
- libyaml
- lpeg
- luajit
- lyaml
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

ഓപ്ഷണലായി ഉപയോക്താവിന് ആഗ്രഹിക്കുന്ന ഫാൽക്കോ പതിപ്പ് വ്യക്തമാക്കാം.

```
 -DFALCO_VERSION={{< latest >}}-dirty
```

ബിൽഡ് വ്യക്തമായി വ്യക്തമാക്കാത്തപ്പോൾ, Git ഹിസ്റ്ററിയിൽ നിന്നുള്ള `FALCO_VERSION` കണക്കാക്കും.

നിലവിലെ ഗിറ്റ് പുനരവലോകനത്തിന് ഒരു ഗിറ്റ് ടാഗ് ഉണ്ടെങ്കിൽ, ഫാൽകോ പതിപ്പ് അതിന് തുല്യമായിരിക്കും (മുൻ‌നിര "വി" കാരക്ടർ ഇല്ലാതെ). അല്ലെങ്കിൽ ഫാൽക്കോ പതിപ്പ് `0.<commit hash>[.dirty]` രൂപത്തിലായിരിക്കും.

#### Enable BPF support

```
-DBUILD_BPF=True
```
`bpf` ടാർഗെറ്റ് ചെയ്യാൻ ഇത് പ്രവർത്തനക്ഷമമാക്കുക:

```bash
make bpf
```

### Build using falco-builder container

[falco-builder](https://hub.docker.com/r/falcosecurity/falco-builder) കണ്ടെയ്നർ പ്രവർത്തിപ്പിക്കുക എന്നതാണ് ഫാൽക്കോ നിർമ്മിക്കാനുള്ള മറ്റൊരു മാർഗ്ഗം.
പാക്കേജുകൾ നിർമ്മിക്കാൻ ഉപയോഗിക്കാവുന്ന റഫറൻസ് ടൂൾചെയിൻ ഇതിൽ അടങ്ങിയിരിക്കുന്നു. കൂടാതെ എല്ലാ ഡിപൻഡൻസികളും ഇതിനകം തൃപ്തികരമാണ്.

ഇമേജ്  ഇനിപ്പറയുന്ന പാരാമീറ്ററുകളെ ആശ്രയിച്ചിരിക്കുന്നു:

* `BUILD_TYPE`: ഡീബഗ് അല്ലെങ്കിൽ റിലീസ് (case-insensitive, defaults to release)
* `BUILD_DRIVER`: കേർണൽ മൊഡ്യൂൾ നിർമ്മിക്കണോ വേണ്ടയോ. എപ്പോൾ നിർമ്മിക്കണം. കേർണൽ മൊഡ്യൂൾ പോലെ ഇത് സാധാരണയായി ഓഫായിരിക്കണം കാരണം സെന്റോസ് ഇമേജിലെ ഫയലുകൾക്കായി ആണിത് നിർമ്മിച്ചത്. ഹോസ്റ്റിനു വേണ്ടി അല്ല.
* `BUILD_BPF`: `BUILD_DRIVER` പോലെ, പക്ഷേ ebpf പ്രോഗ്രാമിനായി.
* `BUILD_WARNINGS_AS_ERRORS`: എല്ലാ ബിൽഡ് മുന്നറിയിപ്പുകളും മാരകമാണെന്ന് പരിഗണിക്കുക.
* `MAKE_JOBS`: `make` -j ആർഗ്യുമെന്റിലേക്ക് കൈമാറി.

ഈ ബിൽഡർ പ്രവർത്തിപ്പിക്കുന്നതിനുള്ള ഒരു സാധാരണ മാർഗ്ഗം ഇനിപ്പറയുന്നവയാണ്. നിങ്ങൾ `/home/user/src`- ന് താഴെയുള്ള ഡയറക്ടറികളിലേക്ക് ഫാൽക്കോയും Sysdig-ഉം  ചെക്ക് ഔട്ട് ചെയ്തു എന്നും `/home/user/build/falco`- ന്റെ ഒരു ബിൽഡ് ഡയറക്ടറി ഉപയോഗിക്കാൻ ആഗ്രഹിക്കുന്നു എന്നും വിചാരിക്കുക. അതിനു വേണ്ടി ചെയ്യേണ്ടത് ഇനിപ്പറയുന്നവ:


```bash
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder cmake
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -it -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-builder package
```
ഏതെങ്കിലും ബിൽറ്റ് പാക്കേജിന്റെ പതിപ്പായി ഉപയോഗിക്കാൻ `FALCO_VERSION` എൻ‌വയോൺ‌മെൻറ് വേരിയബിൾ‌ ആയി നൽ‌കാനും കഴിയും.

അല്ലെങ്കിൽ ഡോക്കർ ഇമേജ് ഡീഫോൾട് ആയ `FALCO_VERSION` ഉപയോഗിക്കും.


## ഏറ്റവും പുതിയ ഫാൽക്കോ കേർണൽ മൊഡ്യൂൾ ലോഡുചെയ്യുക

ഫാൽക്കോയുടെ ഒരു ബൈനറി പതിപ്പ് ഇൻസ്റ്റാൾ ചെയ്തിട്ടുണ്ടെങ്കിൽ, ഒരു പഴയ ഫാൽക്കോ കേർണൽ മൊഡ്യൂൾ ഇതിനകം ലോഡ് ചെയ്തേക്കാം. നിങ്ങൾ ഏറ്റവും പുതിയ പതിപ്പാണ് ഉപയോഗിക്കുന്നതെന്ന് ഉറപ്പാക്കാൻ, നിലവിലുള്ള ഏതെങ്കിലും ഫാൽക്കോ കേർണൽ മൊഡ്യൂൾ അൺലോഡുചെയ്‌ത് പ്രാദേശികമായി നിർമ്മിച്ച പതിപ്പ് ലോഡുചെയ്യണം.

നിലവിലുള്ള ഏതെങ്കിലും കേർണൽ മൊഡ്യൂൾ ഇതിലൂടെ അൺലോഡുചെയ്യുക:

```bash
rmmod falco
```
പ്രാദേശികമായി നിർമ്മിച്ച പതിപ്പ് ലോഡുചെയ്യാൻ, നിങ്ങൾ `build ` ഡയറക്ടറിയിലാണെന്നു  കരുതുക. ശേഷം:

```bash
insmod driver/falco.ko
```

```bash
rmmod falco
```

പ്രാദേശികമായി നിർമ്മിച്ച പതിപ്പ് ലോഡുചെയ്യാൻ, നിങ്ങൾ `build ` ഡയറക്ടറിയിലാണെന്നു  കരുതുക. ശേഷം:

```bash
insmod driver/falco.ko
```

## ഫാൽക്കോ പ്രവർത്തിപ്പിക്കുക

ഫാൽക്കോ നിർമ്മിച്ച് കേർണൽ മൊഡ്യൂൾ ലോഡുചെയ്തുകഴിഞ്ഞാൽ, നിങ്ങൾ `build ` ഡയറക്ടറിയിലാണെന് കരുതുക.  ശേഷം നിങ്ങൾക്ക് ഫാൽക്കോ ഇങ്ങനെ പ്രവർത്തിപ്പിക്കാൻ കഴിയും:

```bash
sudo ./userspace/falco/falco -c ../falco.yaml -r ../rules/falco_rules.yaml
```
സ്ഥിരസ്ഥിതിയായി, ഫാൽക്കോ ഇവന്റുകൾ സ്റ്റാൻഡേർഡ് എരറിലേക്ക് ലോഗ് ചെയ്യുന്നു.


### റിഗ്രഷൻ ടെസ്റ്റുകൾ പ്രവർത്തിപ്പിക്കുക

#### ഹോസ്റ്റിൽ നേരിട്ട് പരിശോധിക്കുക

റിഗ്രഷൻ ടെസ്റ്റുകൾ പ്രവർത്തിപ്പിക്കുന്നതിന്, ഫാൽക്കോ നിർമ്മിച്ച ശേഷം, നിങ്ങൾ ഫാൽകോ റൂട്ട് ഡയറക്ടറിയിൽ, `test/run_regression_tests.sh` സ്ക്രിപ്റ്റ് പ്രവർത്തിപ്പിക്കേണ്ടതുണ്ട്.

##### ഡിപെൻഡൻസികൾ

റിഗ്രഷൻ ടെസ്റ്റിംഗ് ഫ്രെയിംവർക്ക് പ്രവർത്തിക്കുന്നതിന് നിങ്ങൾക്ക് ഇനിപ്പറയുന്ന ഡിപൻഡൻസികൾ ആവശ്യമാണ്.

- Python 3
- [Avocado Framework](https://github.com/avocado-framework/avocado), version 69
- [Avocado Yaml to Mux plugin](https://avocado-framework.readthedocs.io/en/69.0/optional_plugins/varianter_yaml_to_mux.html)
- [JQ](https://github.com/stedolan/jq)
- `unzip`, `xargs` കമാന്റുകൾ
- [Docker CE](https://docs.docker.com/install)

റിഗ്രഷൻ ടെസ്റ്റ് സ്യൂട്ടുകൾ പ്രവർത്തിക്കുന്നതിന് നിങ്ങൾ ഇന്റർനെറ്റിൽ നിന്ന് ചില ടെസ്റ്റ് ഫിക്ചറുകളും നേടേണ്ടതുണ്ട്.

പൈത്തൺ ഡിപൻഡൻസികൾക്കായി, `virtenv` എങ്ങനെ സജ്ജീകരിക്കാം, ടെസ്റ്റ് ഫിക്ചറുകൾ എങ്ങനെ നേടാം എന്നിവയെകുറിച്ചു  കൂടുതൽ [വായിക്കുക](https://github.com/falcosecurity/falco/tree/master/test/README.md).

##### ടെസ്റ്റുകൾ പ്രവർത്തിപ്പിക്കുക
വ്യത്യസ്‌തമാണെങ്കിൽ, ഫാൽക്കോ നിർമ്മിച്ച ഡയറക്‌ടറി ഉപയോഗിച്ച് `$PWD/build` മാറ്റുക.

```bash
./test/run_regression_tests.sh -d $PWD/build
```

#### ഫാൽക്കോ-ടെസ്റ്റർ കണ്ടെയ്നർ ഉപയോഗിച്ച് പരീക്ഷിക്കുക

നിങ്ങളുടെ ബിൽഡിനെതിരെ റിഗ്രഷൻ ടെസ്റ്റ് സ്യൂട്ട് പ്രവർത്തിപ്പിക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെങ്കിൽ, [falco-tester] (https://hub.docker.com/r/falcosecurity/falco-tester) കണ്ടെയ്നർ ഉപയോഗിക്കാം. ബിൽഡർ ഇമേജ് പോലെ, റിഗ്രഷൻ ടെസ്റ്റുകൾ പ്രവർത്തിപ്പിക്കുന്നതിന് ആവശ്യമായ അന്തരീക്ഷം ഇതിൽ അടങ്ങിയിരിക്കുന്നു. എങ്കിലും ഇത് ഇമേജിലേക്ക് മൌണ്ട്  ചെയ്തിട്ടുള്ള ഒരു സോഴ്സ് ഡയറക്ടറിയെയും ബിൽഡ് ഡയറക്ടറിയെയും ആശ്രയിക്കുന്നു. കംപൈലർ ആവശ്യമില്ലാത്തതിനാലും ടെസ്റ്റ് റണ്ണർ ഫ്രെയിംവർക്ക് [avocado] (http://avocado-framework.github.io/) ഉൾപ്പെടുത്തുന്നതിന് മറ്റൊരു അടിസ്ഥാന ഇമേജ് ആവശ്യമുള്ളതിനാലും  ഇത് `falco-builder` എന്നതിനേക്കാൾ വ്യത്യസ്തമായ ഒരു ഇമേജ് ആണ്.

`falcosecurity/falco:test` എന്ന പുതിയൊരു കണ്ടെയ്നർ ഇമേജ് നിർമ്മിക്കുന്നു. ഇത് ഗിറ്റ് ഹബിലെ  `docker/local` ഡിറക്ടറിയിലേക്കാണ് സോഴ്സ് ചെയ്യുന്നത്.  നിർമ്മാണ സമയത് നിർമ്മിതമായ, ഫാൽക്കോ പാക്കേജുകളുള്ള, കണ്ടെയ്നർ നിർമ്മിക്കുന്നതിനും പ്രവർത്തിപ്പിക്കുന്നതിനുമുള്ള പ്രക്രിയ പരിശോധിക്കുക എന്ന ലക്ഷ്യത്തോടെയാണ് ഈ ഇമേജ് നിർമ്മിക്കപ്പെട്ടിരിക്കുന്നത്

ഈ ഇമേജ് ഇനിപ്പറയുന്ന പാരാമീറ്ററുകളെ ആശ്രയിച്ചിരിക്കുന്നു:

* `FALCO_VERSION`: ടെസ്റ്റ് കണ്ടെയ്നർ ഇമേജിൽ ഉൾപ്പെടുത്താനുള്ള ഫാൽകോ പാക്കേജിന്റെ പതിപ്പ്. ഇത് അന്തർനിർമ്മിത പാക്കേജുകളുടെ പതിപ്പുമായി പൊരുത്തപ്പെടണം.

ഈ ബിൽഡർ പ്രവർത്തിപ്പിക്കുന്നതിനുള്ള ഒരു സാധാരണ മാർഗ്ഗം ഇനിപ്പറയുന്നവയാണ്. നിങ്ങൾ `/ home/user/src`- ന് താഴെയുള്ള ഡയറക്ടറികളിലേക്ക് ഫാൽക്കോയും Sysdig-ഉം  ചെക്ക് ഔട്ട് ചെയ്തു എന്നും `/home/user/build/falco`- ന്റെ ഒരു ബിൽഡ് ഡയറക്ടറി ഉപയോഗിക്കാൻ ആഗ്രഹിക്കുന്നു എന്നും വിചാരിക്കുക. അതിനു വേണ്ടി ചെയ്യേണ്ടത് ഇനിപ്പറയുന്നവ:

```bash
docker run --user $(id -u):$(id -g) -v $HOME:$HOME:ro -v /boot:/boot:ro -v /var/run/docker.sock:/var/run/docker.sock -v /etc/passwd:/etc/passwd:ro -e FALCO_VERSION=${FALCO_VERSION} -v /home/user/src:/source -v /home/user/build/falco:/build falcosecurity/falco-tester
```

`HOME` മൗണ്ട് ചെയ്യുന്നത് ടെസ്റ്റ് എക്സിക്യൂഷൻ ഫ്രെയിംവർക്ക് പ്രവർത്തിപ്പിക്കാൻ അനുവദിക്കുന്നു. ഡോക്കർ സോക്കറ്റിലേക്ക് (പലപ്പോഴും `docker` ഗ്രൂപ്പ്) പ്രവേശിക്കാൻ അനുവദിച്ചിരിക്കുന്ന ഗ്രൂപ്പിന്റെ ശരിയായ ഗിഡ് ഉപയോഗിച്ച് നിങ്ങൾ `$(id -g)` മാറ്റിസ്ഥാപിക്കേണ്ടതുണ്ട്.  
