# Add prebuilt drivers for a kernel release

## Requirements

- Ensure the Linux distribution that distributes the Linux kernel version is supported by [driverkit](https://github.com/falcosecurity/driverkit/blob/master/docs/driverkit.md).
- Ensure the driver is not already available for the specific Linux kernel version, by checking it at [download.falco.org/driver/site](https://download.falco.org/driver/site/index.html).

## Generate the configuration

You can generate and contribute configurations for your OS, as follows.

Let's start by [forking](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the [test-infra](https://github.com/falcosecurity/test-infra) repository.

For example using the [GitHub CLI](https://cli.github.com/), run:

```shell
gh repo fork falcosecurity/test-infra
```

From the directory of the local repository directory, create a dedicated Git branch:

```shell
cd test-infra
git checkout -b new/driver-build-config
```

and run:

```shell
make -C driverkit generate -e TARGET_DISTRO=arch -e TARGET_KERNEL_RELEASE=<release name> -e TARGET_KERNEL_VERSION=<build version>
```

filling it with:
* `TARGET_DISTRO`: the Linux distribution of the target host.
* `TARGET_KERNEL_RELEASE`: the Linux kernel release name of the target host. You can fill it with the output of the command `"$(uname -r)"`, running it on a shell on the target host.
* `TARGET_KERNEL_VERSION`: the Linux kernel build version of the target host. You can fill it with output of the command: `"$(uname -v | sed 's/#\([[:digit:]]\+\).*/\1/')"`, running it on a shell on the target host.

for example:

```shell
make -C driverkit generate -e TARGET_DISTRO=arch -e TARGET_KERNEL_RELEASE=6.3.4-arch1-1 -e TARGET_KERNEL_VERSION=1
```

> Available values for `$TARGET_DISTRO` can be found [here](https://github.com/falcosecurity/driverkit/blob/master/docs/driverkit.md).

### Advanced settings

> Besides `$TARGET_DISTRO`, `$TARGET_KERNEL_RELEASE` and `TARGET_KERNEL_VERSION`, you can find all the supported filters [here](https://github.com/falcosecurity/test-infra/blob/master/driverkit/README.md#available-make-targets), that help you to target specific kernel releases.

## Propose the configuration

Now you're ready to propose the configuation, by sending a pull request to the [test-infra](https://github.com/falcosecurity/test-infra) upstream repository, with the changes:

```shell
git add driverkit/config
git commit --signoff --message 'new(driverkit/config): add build config for 6.3.4-arch1-1_1'
git push origin new/driver-build-config
```

and open a pull request on the upstream repository:

```shell
gh pr create --fill --repo falcosecurity/test-infra
```

When accepted, the configurations will be then consumed by [Driverkit](https://github.com/falcosecurity/driverkit) in the [CI pipeline](https://github.com/falcosecurity/test-infra/tree/master/config/jobs/build-drivers), through the [Driverkit Build Grid](https://github.com/falcosecurity/test-infra/tree/master/driverkit#driverkit-build-grid).

## Examples

You can find examples of configurations in the repository at the paths structured as follows:

  `driverkit/config/<DRIVER_VERSION>/<ARCHITECTURE>/<LINUX_DISTRO>_<KERNEL_RELEASE_NAME>_<KERNEL_BUILD_VERSION>.yaml`.

This is a configuration for the Arch Linux kernel specified above, release `6.3.0-4-generic`, which would be located at `driverkit/config/5.0.1+driver/x86_64/arch_6.3.4-arch1-1_1.yaml`:

```yml
kernelversion: 1
kernelrelease: 6.3.4-arch1-1
target: arch
architecture: amd64
output:
  module: output/5.0.1+driver/x86_64/falco_arch_6.3.4-arch1-1_1.ko
  probe: output/5.0.1+driver/x86_64/falco_arch_6.3.4-arch1-1_1.o
```

You can find other example configurations [here](https://github.com/falcosecurity/driverkit/blob/master/Example_configs.md).
Please refer to the [Driverkit](https://github.com/falcosecurity/driverkit) documentation for the [configuration reference](https://github.com/falcosecurity/driverkit#build-using-a-configuration-file).

## Validate the configuration

You validate the configurations you generate by running, from the `driverkit` directory:

```shell
make -C driverkit validate -e TARGET_DISTRO=arch -e TARGET_KERNEL_RELEASE=6.3.4-arch1-1 -e TARGET_KERNEL_VERSION=1
```

You can filter the configurations you want to validate using the same [filters supported](https://github.com/falcosecurity/test-infra/blob/master/driverkit/README.md#available-make-targets) the `generate` _Make target_ supports.

## More on the Driverkit configuration

### Specify the kernel headers location

As Driverkit downloads the specified kernel release headers, the location of the related packages depends on the specific Linux distribution.

Nevertheless, you can specify a different URL of the kernel headers package in the Driverkit configuration, with the `kernelurls` field. For example:

```yml
kernelversion: 4
kernelrelease: 6.3.0-4-generic
target: ubuntu-generic
architecture: amd64
output:
  module: output/5.0.1+driver/x86_64/falco_ubuntu-generic_6.3.0-4-generic_4.ko
  probe: output/5.0.1+driver/x86_64/falco_ubuntu-generic_6.3.0-4-generic_4.o
kernelurls: ["http://security.ubuntu.com/ubuntu/pool/main/l/linux/linux-headers-6.3.0-4-generic_6.3.0-4.4_amd64.deb","http://mirrors.edge.kernel.org/ubuntu/pool/main/l/linux/linux-headers-6.3.0-4-generic_6.3.0-4.4_amd64.deb","http://mirrors.edge.kernel.org/ubuntu/pool/main/l/linux/linux-headers-6.3.0-4_6.3.0-4.4_all.deb","http://security.ubuntu.com/ubuntu/pool/main/l/linux/linux-headers-6.3.0-4_6.3.0-4.4_all.deb"]
```

You can read more about this in the Driverkit [documentation](https://github.com/falcosecurity/driverkit#headers).

### Add support for a new Linux distribution

To introduce support for a new distribution, the logic to retrieve the kernel headers needs to be implemented.

Driverkit already provides a plumbing to easy with the development. You can follow [this guide](https://github.com/falcosecurity/driverkit/blob/master/docs/builder.md#support-a-new-distro) to develop a new Driverkit builder target.

## More on the Driverkit Build Grid

Driverkit Build Grid configurations are [weekly](https://github.com/falcosecurity/test-infra/blob/master/config/jobs/update-dbg/update-dbg) fed by a [kernel crawler](https://github.com/falcosecurity/kernel-crawler), and kept only for the last result, as the crawler represents the uniqe source of truth. Therefore, added configurations will be dropped on Driverkit Build Grid updates but the driver artifacts will be still available at the repository [download.falco.org](https://download.falco.org).

You can find more info about the Driverkit Build Grid toolkit [here](https://github.com/falcosecurity/test-infra/blob/master/driverkit/README.md#driverkit-build-grid).
