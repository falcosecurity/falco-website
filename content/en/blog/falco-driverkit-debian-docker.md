---
title: Falco Driverkit with Docker on Debian
linktitle: Falco Driverkit with Docker on Debian
description: Learn how to use build your own Falco Drivers for Debian
date: 2022-09-05
author: Vicente J. Jiménez Miras
slug: falco-driverkit-debian-docker
tags: ["Kmod","eBPF"]
---

We use different technologies on a daily basis. Tools like Vagrant, Terraform, Ansible, and many more allow us to create and destroy digital resources in a matter of minutes, if not seconds. However, if you keep changing your running environment, you might also need to calibrate your workloads to these new changes. This is especially true when you deploy applications tightly dependent on the operating system.

In other words, every time you deploy an application like Falco there's a chance that you need to compile a new module or eBPF probe to get along with the current underlying kernel. This is the first of a series of posts where you will learn some interesting techniques related to how Falco generates the much needed driver and how you can make it available for your deployments.

## Falco on Docker

There are many ways to run Falco: as a service, as a local container, as a Pod in Kubernetes, etc. Either way, if what we want to do is use Falco to detect threats based on syscalls, we will need a driver that has been compiled for the specific kernel running on the machine, be it a physical machine, a virtual one, or a Kubernetes node in the cloud.

### Launching Falco as a container

The Falco image embeds a script, `/usr/bin/falco-driver-loader`, that will automatically try to find and download a kernel module or an eBPF probe. If that wasn't possible, it might try to compile it inside the container itself. We will learn a bit more about this process and how to control it.

Here is the output of a fresh instance of `falco` running on our local docker service:

```shell
$ docker run -it --privileged \
    --name falco-driver-test  \
    -v /dev:/host/dev         \
    -v /etc:/host/etc:ro      \
    -v /proc:/host/proc:ro    \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    docker.io/falcosecurity/falco:0.32.2

Unable to find image 'falcosecurity/falco:0.32.2' locally
0.32.2: Pulling from falcosecurity/falco
7e6a53d1988f: Pull complete
... output omitted
f3102eb3e85f: Pull complete
Digest: sha256:5ceb23e5baae9c86fc0b160fed397facd2074ca398b770878adbb9c6d049d8a8
Status: Downloaded newer image for falcosecurity/falco:0.32.2

* Setting up /usr/src links from host
* Running falco-driver-loader for: falco version=0.32.2, driver version=2.0.0+driver
* Running falco-driver-loader with: driver=module, compile=yes, download=yes

================ Cleaning phase ================

* 1. Check if kernel module 'falco' is still loaded:
- OK! There is no 'falco' module loaded.

* 2. Check all versions of kernel module 'falco' in dkms:
- There are some versions of 'falco' module in dkms.

* 3. Removing all the following versions from dkms:
2.0.0+driver

- Removing 2.0.0+driver...

------------------------------
Deleting module version: 2.0.0+driver
completely from the DKMS tree.
------------------------------
Done.

- OK! Removing '2.0.0+driver' succeeded.


[SUCCESS] Cleaning phase correctly terminated.

================ Cleaning phase ================

* Looking for a falco module locally (kernel 5.10.0-14-cloud-amd64)
* Trying to download a prebuilt falco module from https://download.falco.org/driver/2.0.0%2Bdriver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.ko
curl: (22) The requested URL returned error: 404
Unable to find a prebuilt falco module
* Trying to dkms install falco module with GCC /usr/bin/gcc
DIRECTIVE: MAKE="'/tmp/falco-dkms-make'"

Creating symlink /var/lib/dkms/falco/2.0.0+driver/source ->
                 /usr/src/falco-2.0.0+driver

DKMS: add completed.
* Running dkms build failed, couldn't find /var/lib/dkms/falco/2.0.0+driver/build/make.log (with GCC /usr/bin/gcc)
* Trying to dkms install falco module with GCC /usr/bin/gcc-8
DIRECTIVE: MAKE="'/tmp/falco-dkms-make'"
* Running dkms build failed, couldn't find /var/lib/dkms/falco/2.0.0+driver/build/make.log (with GCC /usr/bin/gcc-8)
* Trying to dkms install falco module with GCC /usr/bin/gcc-6
DIRECTIVE: MAKE="'/tmp/falco-dkms-make'"
* Running dkms build failed, couldn't find /var/lib/dkms/falco/2.0.0+driver/build/make.log (with GCC /usr/bin/gcc-6)
* Trying to dkms install falco module with GCC /usr/bin/gcc-5
DIRECTIVE: MAKE="'/tmp/falco-dkms-make'"
* Running dkms build failed, couldn't find /var/lib/dkms/falco/2.0.0+driver/build/make.log (with GCC /usr/bin/gcc-5)
* Trying to load a system falco module, if present
Consider compiling your own falco driver and loading it or getting in touch with the Falco community
2022-08-31T12:00:02+0000: Falco version 0.32.2
2022-08-31T12:00:02+0000: Falco initialized with configuration file /etc/falco/falco.yaml
2022-08-31T12:00:02+0000: Loading rules from file /etc/falco/falco_rules.yaml:
2022-08-31T12:00:02+0000: Loading rules from file /etc/falco/falco_rules.local.yaml:
2022-08-31T12:00:02+0000: Starting internal webserver, listening on port 8765
2022-08-31T12:00:02+0000: Unable to load the driver.
2022-08-31T12:00:02+0000: Runtime error: error opening device /host/dev/falco0. Make sure you have root credentials and that the falco module is loaded.. Exiting.
```

There are some important reads from this output:
* The driver version this image tries to load is the **`2.0.0+driver`**. This information will be really useful when we need to compile and share the driver with the *falco container*.
* By default, the container will look for a kernel module. It is possible to switch to an *eBPF probe* by using an environment variable, as you'll see later in this post.
* The `falco-driver-loader` script always removes the driver from memory and tries to load a current one. This is done for security reasons and the way to avoid that is not running this script when creating the container. More on this later, too.
* After looking in the system for a previously installed driver, the script tries to download it from the URL `https://download.falco.org`. Unfortunately, it doesn't seem to be able to find it and falls back to the local compilation method.
* When the script tries to compile the driver inside the container, it doesn't succeed because we haven't fulfilled one important prerequisite: installing the kernel headers on the host machine. In this post, we won't address that method but you can always refer to the documentation.

### Using Falco Driverkit

As mentioned, there are different ways to obtain a valid kernel: downloading it from `https://download.falco.org`, compiling it via the `falco-driver-loader` script, or the method we'll explain here: using `driverkit`.

We don't intend this post to be an exhaustive guide to `driverkit`. That's also why we've chosen a relatively easy and tested target operating system: Debian.

First of all, we need the `driverkit` tool which we'll compile ourselves. We can download the source code from `https://github.com/falcosecurity/driverkit`.

When compiling a tool, we like using a temporary container. In this case, we'll start our container using the `docker.io/golang:1.19` image and a `sleep` process until we're done. The `./driverkit` directory will help us to extract the binary to the host filesystem. Feel free to use any other method you prefer, like `docker cp`.

```bash
# This directory will contain the driverkit binary
# once it is compiled inside the container

$ mkdir ./driverkit

# Container with Go tools
$ docker run --rm -d --name golang-compiler \
    -v $PWD/driverkit:/export \
    golang:1.19 sleep infinity
```

Check that the container has been successfully created and still runs:
```bash
$ docker ps
CONTAINER ID   IMAGE         COMMAND            CREATED         STATUS         PORTS     NAMES
1ff943cbf7f9   golang:1.19   "sleep infinity"   4 seconds ago   Up 3 seconds             golang-compiler
```

Next, create a shell with a terminal in the container:
```bash
$ docker exec -it golang-compiler /bin/bash
```

Remember, you are in the container context now. Whatever you do here will be lost unless you copy it to the `/export` directory. We will clone the `driverkit` code and compile it using the following commands:

```bash
git clone https://github.com/falcosecurity/driverkit
cd driverkit && make
cp _output/bin/driverkit /export/driverkit
exit
```

Once we are done with the Golang container, we can stop it and it'll be automatically removed thanks to the `--rm` parameter that we used to start it.

```bash
docker stop golang-compiler -t0
```

#### Creating a configuration file for the driver request

Time to create a configuration file. Do you remember the driver version: `2.0.0+driver`? We will use that and additional information to create the configuration file.

```bash
# We've included some VARIABLES that will help you understand
# where the different values come from and what they represent

export DRIVER_VERSION=2.0.0+driver
export DRIVER_TARGET=debian
export DRIVER_ARCH=$(arch)

export KERNEL_VERSION=$(uname -v| cut -f1 -d' ' | tr -d \#)
export KERNEL_RELEASE=$(uname -r)
export DRIVER_NAME=falco
export PROBE_FILE=${DRIVER_NAME}_${DRIVER_TARGET}_${KERNEL_RELEASE}_${KERNEL_VERSION}.o
export MODULE_FILE=${DRIVER_NAME}_${DRIVER_TARGET}_${KERNEL_RELEASE}_${KERNEL_VERSION}.ko

mkdir -p drivers/${DRIVER_VERSION}/${DRIVER_ARCH}/

# Creating the actual file that we will pass to driverkit

cat > debian.yaml << EOF
target: ${DRIVER_TARGET}
driverversion: ${DRIVER_VERSION}
kernelrelease: ${KERNEL_RELEASE}
kernelversion: ${KERNEL_VERSION}
output:
  module: ./drivers/${DRIVER_VERSION}/x86_64/${MODULE_FILE}
  probe:  ./drivers/${DRIVER_VERSION}/x86_64/${PROBE_FILE}
EOF
```

The resulting file should look like this:

```bash
$ cat debian.yaml
target: debian
driverversion: 2.0.0+driver
kernelrelease: 5.10.0-14-cloud-amd64
kernelversion: 1
output:
  module: ./drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.ko
  probe:  ./drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.o
```

> In case you want to use a version previous to Falco 0.32.2 you might need to remove the `x86_64/` string from the probe path. This is due to the expected path inside the `falco-driver-loader` script. These paths will be offered via an HTTP server at a later stage, so make sure they match in both steps.

This same file is the one we will pass to `driverkit`. If the driver is compiled satisfactorily, we should see a similar output in some seconds. Be patient.

```bash
$ ./driverkit/driverkit docker -c debian.yaml

INFO using config file                             file=debian.yaml
INFO driver building, it will take a few seconds   processor=docker
INFO kernel module available                       path=./drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.ko
INFO eBPF probe available                          path=./drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.o
```

Make sure you use either the .yml or .yaml suffix. Otherwise, you'll get an error like:
```bash
$ ./driverkit/driverkit docker -c debian.unknown-ext
Error: exiting for validation errors
Usage:
  driverkit docker [flags]

Flags:

... output omitted

FATA error executing driverkit    error="exiting for validation errors"
```

Alternatively, we could have used a bunch of parameters in the command line, like:
```bash
# Don't forget to \, to let the command continue after each line

$ ./driverkit/driverkit docker          \
    --architecture amd64                \
    --target ${DRIVER_TARGET}           \
    --driverversion ${DRIVER_VERSION}   \
    --kernelversion ${KERNEL_VERSION}   \
    --kernelrelease ${KERNEL_RELEASE}   \
    --output-probe ./drivers/${DRIVER_VERSION}/x86_64/${PROBE_FILE} \
    --output-module ./drivers/${DRIVER_VERSION}/x86_64/${MODULE_FILE}

INFO driver building, it will take a few seconds   processor=docker
INFO kernel module available                       path=./drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.ko
INFO eBPF probe available                          path=./drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.o
```

Either way, if `driverkit` manages to compile the drivers, you can continue with the next step. Otherwise, you might need to adjust some of the parameters in the configuration or even customize your builder image, but we will explain that in a different post where we will deep dive into `driverkit`.

### Launching Falco with the new driver

There are different ways to load the driver when running Falco. We'll show you two of them: loading them manually and leaving this action to the script embedded in the container image.

#### Loading the driver manually

A kernel module only needs to be loaded once. So, if we load it manually before starting the container, Falco doesn't need to do it again.

There are two ways of achieving that, and both require avoiding the execution of the `falco-driver-loader` script:
* Setting the SKIP_DRIVER_LOADER environment variable to any value when creating the container. By doing so, the container entrypoint will skip the existing `falco-driver-loader` script.
* Using the image `docker.io/falco/falco-no-driver`, which doesn't contain that script.

First, try to load the driver on the host. Look for the `.ko` file in the directory structure we created and load it using `insmod`, for instance. If the compilation was successful and the kernel version chosen was the right one, you shouldn't see any message once the module is loaded. Don't forget to do it with the user *root* (i.e., via `sudo`).

```bash
$ find $HOME/drivers -type f
drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.o
drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.ko

$ sudo insmod drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.ko
$ lsmod | grep -i falco
falco                 741376  0
```

This first method of starting the `falco` container will use the `docker.io/falco/falco:0.32.2` image, passing the `SKIP_DRIVER_LOADER` variable. We've set it to one but the script doesn't check its value.

> Observe that we're removing any existing container with that name before starting ours, but the container image remains.

```shell
$ docker rm -f falco-driver-test  # Ignore any failure here
falco-driver-test

$ docker run -it --privileged \
    --name falco-driver-test  \
    -e SKIP_DRIVER_LOADER=1   \
    -v /dev:/host/dev         \
    -v /proc:/host/proc:ro    \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    docker.io/falcosecurity/falco:0.32.2

2022-08-31T12:07:30+0000: Falco version 0.32.2
2022-08-31T12:07:30+0000: Falco initialized with configuration file /etc/falco/falco.yaml
2022-08-31T12:07:30+0000: Loading rules from file /etc/falco/falco_rules.yaml:
2022-08-31T12:07:30+0000: Loading rules from file /etc/falco/falco_rules.local.yaml:
2022-08-31T12:07:30+0000: Starting internal webserver, listening on port 8765
```

The second method uses the `docker.io/falco/falco-no-driver` image, so, as you can expect, it won't try to reload the driver this time.
>This time, Docker will pull the image since we hadn't used it yet.

```shell
$ docker rm -f falco-driver-test  # Ignore any failure here
falco-driver-test

$ docker run -i -t --privileged \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -v /dev:/host/dev \
    -v /proc:/host/proc:ro \
    --name falco-driver-test \
    docker.io/falcosecurity/falco-no-driver:0.32.2

Unable to find image 'falcosecurity/falco-no-driver:0.32.2' locally
0.32.2: Pulling from falcosecurity/falco-no-driver
1efc276f4ff9: Pull complete
e34e1870ff2c: Pull complete
Digest: sha256:14e6d3da56fe607ff9b0bfe91ec812ab4f4b030cea3ed88a2d31ac9b31f97fb4
Status: Downloaded newer image for falcosecurity/falco-no-driver:0.32.2

2022-08-31T12:12:40+0000: Falco version 0.32.2
2022-08-31T12:12:40+0000: Falco initialized with configuration file /etc/falco/falco.yaml
2022-08-31T12:12:40+0000: Loading rules from file /etc/falco/falco_rules.yaml:
2022-08-31T12:12:40+0000: Loading rules from file /etc/falco/falco_rules.local.yaml:
2022-08-31T12:12:40+0000: Starting internal webserver, listening on port 8765
```

#### Sharing the probe and driver with the Falco container

This method is a bit more complicated than the previous one but will also give us the flexibility of deploying `falco` at scale.

The idea is simple though. After starting your favorite webserver and publishing the `./drivers` directory that we created before, we'll tell the `falco` container to use it as a repository and download the driver from there.

To keep things clean, we've used the `docker.io/python:latest` container image, which includes the Python module `http.server`. If you have Python already installed on your system, you can use it directly. Just remember to define a port accessible to the `falco` container and pass the right IP address.

```shell
$ docker run -d \
    --name falco-drivers-web \
    -v $PWD/drivers:/data:ro \
    docker.io/python:latest \
    bash -c "cd /data && python -m http.server"

Unable to find image 'python:latest' locally
latest: Pulling from library/python
1671565cc8df: Pull complete
... output omitted
4334b2fe8293: Pull complete
Digest: sha256:745efdfb7e4aac9a8422bd8c62d8bc35a693e8979a240d29677cb03e6aa91052
Status: Downloaded newer image for python:latest
f94cb601f85c312d62aab3e116619558239bada9f5d05e971fe26c0206828b6b
```

Our python web server is now available and offers the drivers to any local container that might need them. Retrieve the IP address of this container for later use:
```bash
$ docker inspect falco-drivers-web --format '{{ .NetworkSettings.IPAddress }}'
172.17.0.2

# Assign it to a variable for later use
$ export DRIVERS_REPO=$(docker inspect falco-drivers-web \
    --format '{{ .NetworkSettings.IPAddress }}'):8000

$ echo $DRIVERS_REPO
172.17.0.2:8000
```
It's always a good practice to test that the drivers are in the right place and accessible through the webserver.

```bash
# This is the checksum of the local files

$ find ./drivers -type f -name "*o" -exec cksum {} \;
3873827283 843080 ./drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64.ko
914371530 4980536 ./drivers/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64.o
```
```bash
# This is the checksum of the files retrieved through HTTP

$ find ./drivers -type f -name "*o" | while read FILE
  do
    URL=$(echo ${FILE} | sed -e 's,./drivers,'${DRIVERS_REPO}',')
    echo "$(curl -s http://${URL} | cksum) http://${URL}"
  done
3873827283 843080 localhost:8000/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64.ko
914371530 4980536 localhost:8000/2.0.0+driver/x86_64/falco_debian_5.10.0-14-cloud-amd64.o
```

As you can see, they are accessible and identical.

> These values will be different depending on the version of the kernel and the Falco drivers.


#### Loading the kernel module

Let's start with the kernel module. In this case, the only variable we need to pass is the `DRIVERS_REPO` one, which has been carefully prepared in the previous step.

```shell
$ docker rm -f falco-driver-test
falco-driver-test

$ docker run -it --privileged \
    --name falco-driver-test  \
    -v /dev:/host/dev      \
    -v /etc:/host/etc:ro   \
    -v /proc:/host/proc:ro \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -e DRIVERS_REPO=${DRIVERS_REPO} \
    docker.io/falcosecurity/falco:0.32.2

* Setting up /usr/src links from host
* Running falco-driver-loader for: falco version=0.32.2, driver version=2.0.0+driver
* Running falco-driver-loader with: driver=module, compile=yes, download=yes

================ Cleaning phase ================

* 1. Check if kernel module 'falco' is still loaded:
- OK! There is no 'falco' module loaded.

* 2. Check all versions of kernel module 'falco' in dkms:
- There are some versions of 'falco' module in dkms.

* 3. Removing all the following versions from dkms:
2.0.0+driver

- Removing 2.0.0+driver...

------------------------------
Deleting module version: 2.0.0+driver
completely from the DKMS tree.
------------------------------
Done.

- OK! Removing '2.0.0+driver' succeeded.


[SUCCESS] Cleaning phase correctly terminated.

================ Cleaning phase ================

* Looking for a falco module locally (kernel 5.10.0-14-cloud-amd64)
* Trying to download a prebuilt falco module from 172.17.0.2:8000/2.0.0%2Bdriver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.ko
* Download succeeded
* Success: falco module found and inserted
2022-08-31T12:36:29+0000: Falco version 0.32.2
2022-08-31T12:36:29+0000: Falco initialized with configuration file /etc/falco/falco.yaml
2022-08-31T12:36:29+0000: Loading rules from file /etc/falco/falco_rules.yaml:
2022-08-31T12:36:29+0000: Loading rules from file /etc/falco/falco_rules.local.yaml:
2022-08-31T12:36:29+0000: Starting internal webserver, listening on port 8765
```

It's a similar output as before, but this time we can see:
```
* Trying to download a prebuilt falco module from 172.17.0.2:8000/2.0.0%2Bdriver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.ko
* Download succeeded
* Success: falco module found and inserted
```

The module has been successfully loaded and Falco can start properly.

#### Loading the eBPF Probe

For this, we will make use of another variable, `FALCO_BPF_PROBE`. Like it happened with the `SKIP_DRIVER_LOADER` variable, its value is not as relevant as the fact that the variable had been defined. We also need to keep the `DRIVERS_REPO` variable, since the `falco-driver-loader` script will look for the probe in that URL.

```shell
$ docker rm -f falco-driver-test
falco-driver-test

$ docker run -it --privileged \
    --name falco-driver-test  \
    -v /dev:/host/dev      \
    -v /etc:/host/etc:ro   \
    -v /proc:/host/proc:ro \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -e DRIVERS_REPO=${DRIVERS_REPO}  \
    -e FALCO_BPF_PROBE=""            \
    docker.io/falcosecurity/falco:0.32.2

* Setting up /usr/src links from host
* Running falco-driver-loader for: falco version=0.32.2, driver version=2.0.0+driver
* Running falco-driver-loader with: driver=bpf, compile=yes, download=yes
* Mounting debugfs
* Trying to download a prebuilt eBPF probe from 172.17.0.2:8000/2.0.0%2Bdriver/x86_64/falco_debian_5.10.0-14-cloud-amd64_1.o
* Skipping compilation, eBPF probe is already present in /root/.falco/falco_debian_5.10.0-14-cloud-amd64_1.o
* eBPF probe located in /root/.falco/falco_debian_5.10.0-14-cloud-amd64_1.o
* Success: eBPF probe symlinked to /root/.falco/falco-bpf.o
2022-08-31T12:58:10+0000: Falco version 0.32.2
2022-08-31T12:58:10+0000: Falco initialized with configuration file /etc/falco/falco.yaml
2022-08-31T12:58:10+0000: Loading rules from file /etc/falco/falco_rules.yaml:
2022-08-31T12:58:10+0000: Loading rules from file /etc/falco/falco_rules.local.yaml:
2022-08-31T12:58:10+0000: Starting internal webserver, listening on port 8765
```
This time the output is easier to read: The driver is set to bpf, the URL of the HTTP container points to our local webserver, and it also shows where it downloads the probe before starting Falco.

### Debugging

As a final tip, if you want to start a container based on the regular `falco` image to test the `falco-driver-loader` script, we recommend starting the container with the `--entrypoint /bin/bash` parameter. This will keep the `/docker-entrypoint.sh` script from being executed (that one triggers `/usr/bin/falco-driver-loader`) and you'll have a much more comfortable environment to work with.

```shell
$ docker run -it --privileged \
    --name falco-driver-test  \
    -v /dev:/host/dev         \
    -v /etc:/host/etc:ro      \
    -v /proc:/host/proc:ro    \
    -v /var/run/docker.sock:/host/var/run/docker.sock \
    -e DRIVERS_REPO=${DRIVERS_REPO} \
    --entrypoint /bin/bash \
    docker.io/falcosecurity/falco:0.32.2

root@e0c391e0cee1:/#
```

### Conclusion

Falco requires tapping into the kernel to be able to retrieve useful information from it. For that, it has two methods: loading a kernel module in the traditional way, or using an eBPF probe. Both of them instrumentalize the kernel and provide the functionality to retrieve the relevant data.

Due to the infinite number of combinations of Linux kernels and distributions, it is extremely difficult to offer all possible kernels as downloadable assets. Besides, in some environments, it'll be a requirement to compile the driver of such a critical component. Learning how to use Falco Driverkit will help you to easily deploy Falco in more environments.
