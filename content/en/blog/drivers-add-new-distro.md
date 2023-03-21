---
title: Add prebuilt drivers for new distro
date: 2023-03-21
author: Federico Di Pierro
slug: falco-prebuilt-drivers-new-distro
---

Hi everyone!  
Today we are going to learn how to add support for a new distro prebuilt drivers.  
There are multiple repositories involved with it, and while most of the time it should be a pretty simple job,  
other times it can become really cumbersome.  
That's why we are writing this guide of course!  

The involved repositories will be:
* [Kernel-crawler](https://github.com/falcosecurity/kernel-crawler)
* [Driverkit](https://github.com/falcosecurity/driverkit)
* [Test-infra](https://github.com/falcosecurity/test-infra)
* [Falco](https://github.com/falcosecurity/falco)

## Kernel-crawler

> **NOTE**: this step is only needed if kernel-crawler does not already support the distro.

Kernel-crawler is a python project that is capable of fetching all existing kernels by scraping multiple distros repositories.  
It is ran weekly on Monday, by a [github action](https://github.com/falcosecurity/kernel-crawler/blob/main/.github/workflows/update-kernels.yml), to update the jsons for all supported architectures (at the moment of writing `x86_64` and `aarch64`) by opening a PR on same kernel-crawler against the `kernels` branch.  
The `kernels` branch is also used as a source for the [github pages](https://falcosecurity.github.io/kernel-crawler/).  
In the end, the project code lives in the `main` branch, while the jsons and the github page live under the `kernels` branch.

First of all, you want to add a scraper for the new distro to kernel-crawler.  
Let's see for example the archlinux one:
```python
from bs4 import BeautifulSoup
import re

from kernel_crawler.utils.download import get_url
from . import repo

class ArchLinuxRepository(repo.Repository):

    _linux_headers_pattern = 'linux.*headers-'
    _package_suffix_pattern = '.pkg.tar.*'

    def __init__(self, base_url, arch):
        self.base_url = base_url
        self.arch = arch

    def __str__(self):
        return self.base_url

    def parse_kernel_release(self, kernel_package):

        # trim off 'linux*headers'
        trimmed = re.sub(self._linux_headers_pattern, '', kernel_package)
        # trim off the '.pkg.tar.*'
        version_with_arch = re.sub(self._package_suffix_pattern, '', trimmed)

        # trim off the architecture
        version = re.sub(f'-{self.arch}', '', version_with_arch)

        return version

    def get_package_tree(self, filter=''):
        packages = {}

        soup = BeautifulSoup(get_url(self.base_url), features='lxml')
        for a in soup.find_all('a', href=True):
            package = a['href']
            # skip .sig and .. links
            if not package.endswith('.sig') and package != '../':
                parsed_kernel_release = self.parse_kernel_release(package)

                packages.setdefault(parsed_kernel_release, set()).add(self.base_url + package)

        return packages


class ArchLinuxMirror(repo.Distro):

    _base_urls = []

    def __init__(self, arch):

        if arch == 'x86_64':
            self._base_urls.append('https://archive.archlinux.org/packages/l/linux-headers/')                 # stable
            self._base_urls.append('https://archive.archlinux.org/packages/l/linux-hardened-headers/')        # hardened
            self._base_urls.append('https://archive.archlinux.org/packages/l/linux-lts-headers/')             # lts
            self._base_urls.append('https://archive.archlinux.org/packages/l/linux-zen-headers/')             # zen
        elif arch == 'aarch64':
            self._base_urls.append('http://tardis.tiny-vps.com/aarm/packages/l/linux-aarch64-headers/')       # arm 64-bit
        else:  # can be implemented later
            self._base_urls.append('http://tardis.tiny-vps.com/aarm/packages/l/linux-armv5-headers/')         # arm v5
            self._base_urls.append('http://tardis.tiny-vps.com/aarm/packages/l/linux-armv7-headers/')         # arm v7
            self._base_urls.append('http://tardis.tiny-vps.com/aarm/packages/l/linux-raspberrypi4-headers/')  # rpi4
            self._base_urls.append('http://tardis.tiny-vps.com/aarm/packages/l/linux-raspberrypi-headers/')   # other rpi

        super(ArchLinuxMirror, self).__init__(self._base_urls, arch)


    def list_repos(self):
        mirrors = []

        for mirror in self._base_urls:
            mirrors.append(ArchLinuxRepository(mirror, self.arch))

        return mirrors


    def to_driverkit_config(self, release, deps):
        for dep in deps:
            return repo.DriverKitConfig(release, "arch", dep)
```

As you can see, the `ArchlinuxMirror` extends `repo.Distro` and implements the `list_repos` and `to_driverkit_config` methods.  
The former is called by `get_package_tree` while discovering the list of supported kernels to fetch all the available repos, while the latter is an adapter used to output the json in a [driverkit](https://github.com/falcosecurity/driverkit)-like format, that is the format spoken by test-infra [dbg scripts](https://github.com/falcosecurity/test-infra/tree/master/driverkit) (aka Driverkit Build Grid).
`ArchlinuxRepository` class implements the repository scraping logic: basically, for each repository, its package tree is fetched and kernel versions are filtered.  

Then, the `to_driverkit_config` method should return a list of `repo.DriverKitConfig`.  
It is important that the second parameter to `DriverKitConfig` is the distro target name as extracted by:
```bash
grep ID /etc/os-release | head -n1
```
When using `/etc/os-release` is not possible (eg: for the minikube scraper it wasn't), you'll probably need to update the logic in falco-driver-loader script too; we will see that later in the [falco-driver-loader step](https://hackmd.io/yXOpAKKwQZSa_trbU9-7dQ#Falco-driver-loader).  

Finally, you need to register the new distro together with its mirror in the `kernel_crawler/crawler.py` source file, following what is being done for other entries:
```python
DISTROS = {
    ... // other entries
    'ArchLinux': ArchLinuxMirror,
    ... // other entries
}
```

Time to test the changes! From the repository root, issue:
```bash
python -m kernel_crawler.main crawl --distro ArchLinux
```

If everything is fine, you can now open a PR against the kernel-crawler main branch.  
Once the PR is merged, and a new release tagged, you can expect next crawler run to fetch kernel lists for your new distro!  

## Driverkit

> **NOTE**: this step is only needed if driverkit does not already support the distro.

Driverkit is the falcosecurity solution to build Falco drivers (both kmod and eBPF probe) against any kernel release.  
It internally uses docker or kubernetes runners to fetch the kernel headers and then builds drivers against them.  

Driverkit is also capable of finding correct headers to be used given a `target` distro and a `kernelrelease`.  
Unfortunately, this internal logic is in no way as smart as the kernel-crawler one (given that it does not really crawl anything, but just builds up expected headers urls using custom logic for each supported distro), therefore the preferred method is to always enforce the `kernelurls` parameter to pass required urls, and that logic should be treated as a fallback instead. This is what test-infra does,  by thew way.  

Each driverkit [builder](https://github.com/falcosecurity/driverkit/tree/master/pkg/driverbuilder/builder) is composed of a GO source file plus a small bash script template.
The template gets filled with data during the run, and will be the exact bash script that gets ran in the container to build the drivers.

To add a new builder, there is a comprehensive documentation in the driverkit repo itself: https://github.com/falcosecurity/driverkit/blob/master/docs/builder.md.

Make sure to follow the guide and then test that you are able to build drivers for the new distro, before opening the PR!

Once the PR is merged, and a new Driverkit release is tagged, you can go on to test-infra repo.

## Test-infra

// TODO: bump driverkit version if needed
// TODO: add job
// TODO: explain dbg and push to s3

## Falco

> **NOTE**: this step is only needed if `falco-driver-loader::get_target_id` needs tricks to pick up the correct target id (see eg: "flatcar" or "minikube" cases)

Falco ships a not-so-tiny bash script, under `scripts/falco-driver-loader`, that is used at runtime to either:
* download a prebuilt driver from download.falco.org
* try to build a driver

It supports both eBPF and kmod of course; to download the prebuilt driver, the script must be able to re-create the name used to push the artifact on the [s3 bucket](https://download.falco.org/?prefix=driver/).  
The most important function, for this, is the [`get_target_id`](https://github.com/falcosecurity/falco/blob/master/scripts/falco-driver-loader#L103) one, that basically fetches the `target` distro that we are running.  
Ideally, no change will be needed in falco-driver-loader script, given that `get_target_id` fallbacks at parsing `OS_ID` from `/etc/os-release` file.  
Other times, like for example "amazonlinux", "minikube" or "flatcar", there is need to compute the correct parameters to match the ones used by pushed artifacts.  
In these cases, a change is needed. Unfortunately, as of today, the `falco-driver-loader` is bundled within each Falco release, therefore each change will be reflected after a new Falco release, making the process a bit slow.  
We can still manage to make an ad-hoc patch release though; feel free to ask maintainers to do so during a [community call](https://github.com/falcosecurity/community#community-calls) or on [slack channel](https://github.com/falcosecurity/community#slack-channel).

## Conclusion

It seems like a ton of work, uh?  
Indeed, the whole procedure can take a bit of time. But fear not!  
Falcosecurity maintainers will be there to help you and guide you through all of the process! :rocket:

We hope to have clarified the procedure a bit, and we are looking forward for your next contributions! 
Bye!
