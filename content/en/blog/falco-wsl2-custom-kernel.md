---
title: Falco on WSL2 with a custom kernel
description: How to enable Falco kernel module on WSL2
date: 2021-01-05
author: Nuno do Carmo
slug: falco-wsl2-custom-kernel
---

# Falco on WSL2

You love Falco, just read the awesome blog [Falco in 2020 - The Falco Project](https://falco.org/blog/falco-2020/), and want to be part of this growing and wonderful community. "But" you are on Windows 10 and wonder how to run it?

Well, the wait is over! Follow the Corsair on his WSL2 boat.



# Prerequisites

In this blog post, the following technologies will be used:

- Windows 10 Insiders (Dev channel)

  - The version 21277 is the one used

- WSL2 feature enabled and default distribution installed

  - In this version, this has been done with the command: 
    ```powershell
    wsl --install --distribution ubuntu
    ```

  - However, in this blog post, the [Ubuntu Community Preview]([Announcing Ubuntu on Windows Community Preview - WSL2 - Ubuntu Community Hub](https://discourse.ubuntu.com/t/announcing-ubuntu-on-windows-community-preview/19789)) distro will be the one used

- [Linux kernel version 5.10.4](https://www.kernel.org/) (latest stable)

  - The default WSL2 kernel is now: 5.4.72-microsoft-standard-WSL2
  
    - If you still have a WSL2 kernel 4.x, then you can update it with the command
  
      ```powershell
      wsl --update
      ```
  
    > **Attention**: by compiling a new WSL2 kernel, the Microsoft custom module "DXGKRNL" will not be available

- [Optional]: [Windows Terminal](https://github.com/microsoft/terminal)



# A (custom) Kernel for WSL2

First thing first, I won't be explain in details how to compile a kernel for WSL2. Simply because I already [did that](https://wsl.dev/wsl2-kernel-zfs/) for the ZFS module.

This also means, I will have the pleasure to provide you with the juicy bits directly.



> *Note: to ensure the best performances, all the work of compilation will be done from **within** the WSL2 filesystem.*

Let's launch the terminal with the WSL2 distro:

```bash
# Move to your WSL2 home directory
cd

# Install the needed packages
# Source: https://github.com/microsoft/WSL2-Linux-Kernel/blob/7015d6023d60b29c3be4c6a398bed923b48b4341/README-Microsoft.WSL2
sudo apt install -y build-essential flex bison libssl-dev libelf-dev

# Get the latest stable Linux Kernel, but only the latest version of each file and only the specific branch we want
# git needs to be installed
git clone --depth 1 --branch linux-rolling-stable https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git

# Ensure the "stable" branch is the active one
cd linux
git checkout linux-rolling-stable

# Get a kernel config optimized for WSL2 
# Source: https://github.com/microsoft/WSL2-Linux-Kernel/pull/176
wget https://raw.githubusercontent.com/microsoft/WSL2-Linux-Kernel/7015d6023d60b29c3be4c6a398bed923b48b4341/Microsoft/config-wsl -O .config

# Change the LOCALVERSION value
sed -i 's/microsoft-standard-WSL2/generic/' ./.config

# [Optional] before we start the compilation, let's "update" the config file to include the newest Kernel options
make prepare

## The only option I didn't choose the default value was:
*
* Preload BPF file system with kernel specific program and map iterators
*
Preload BPF file system with kernel specific program and map iterators (BPF_PRELOAD) [N/y/?] (NEW) y

# Now that everything is ready, let's compile the kernel
make -j $(nproc)

# Once the compilation is done, we can install the "optional" modules
sudo make modules_install

# Copy the kernel into a directory in the Windows filesystem 
# I recommend creating a wslkernel directory
mkdir /mnt/c/wslkernel
cp arch/x86/boot/bzImage /mnt/c/wslkernel/kernelfalco

# Last step, the kernel needs to be referenced in the file .wslconfig 
# I'm using vi but feel free to use your preferred text editor
vi /mnt/c/Users/<your username>/.wslconfig

## The content of the file should look like this
## Source: https://docs.microsoft.com/en-us/windows/wsl/wsl-config#wsl-2-settings
[wsl2]
kernel = c:\\wslkernel\\kernelfalco
swap = 0
localhostForwarding = true
```



With all these steps done, WSL2 can now be "rebooted" by running the following command in Powershell:

```powershell
wsl --shutdown
```



Launch again a terminal with your WSL2 distro and confirm the new kernel is now being the one used:

```bash
uname -a
```



And here you have, the latest stable Linux kernel being installed/used by WSL2. The (big) upside of WSL2 is that all the distros are using the same kernel, without any further compilation needed. The (potential) downside is that all share the same configuration.



# Looking for SystemD on WSL2

By default, WSL2 does not run SystemD due to the customized `init` process. However, a very smart community member, [Daniel Llewellyn](https://twitter.com/diddledan), made it possible.

Several iterations and alternatives are now available, however in this blog post, I'm using his "one script" as it does not require any additional package to be installed (=less intrusive).



> *Note: while the kernel is applied to **all** WSL2 distros, the SystemD install will need to be done for every distro*



Let's jump again into the terminal:

```bash
# Get the SystemD script and put it into /etc/profile.d
sudo wget https://raw.githubusercontent.com/diddlesnaps/one-script-wsl2-systemd/master/src/00-wsl2-systemd.sh -O /etc/profile.d/00-wsl2-systemd.sh

# [Optional] The script calls itself with sudo if the user is not root, so in order to avoid typing your password at every first WSL2 boot (after a shutdown only), you might want to add the following file to sudoers.d directory
sudo wget https://raw.githubusercontent.com/diddlesnaps/one-script-wsl2-systemd/build-21286%2B/src/sudoers -O /etc/sudoers.d/wsl2-systemd
```



And that's it, WSL2 can now be "rebooted" by running the following command in Powershell:

```powershell
wsl --shutdown
```



Launch again a terminal with your WSL2 distro, this time you should see a small delay while `systemd` is starting.

Once the shell is ready, confirm SystemD is running:

```bash
ps -aux
```



# My name is Falco, Kernel module Falco

With everything prepared, the next steps are to follow the [Falco documentation](https://falco.org/docs/getting-started/installation/), like someone with a "normal" Linux would do. Please remember I'm using Ubuntu and will follow the related section.

However there will be a need for a "detour" related to the Kernel (and not WSL2). Instead of installing the headers from the repo (which did not exist at the time of writing this blog post), we will download them from the [Ubuntu kernel website](https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/). For any other distro, please check on their respective site.



> *Note: you can ignore the following errors when installing the Kernel headers packages*
>
>
> *W: mkconf: MD subsystem is not loaded, thus I cannot scan for arrays.*
> *W: mdadm: failed to auto-generate temporary mdadm.conf file.*



Let's jump again into the terminal:

```bash
# Move to your WSL2 home directory
cd

# Run the step 1 of the Falco documentation: add the repo
curl -s https://falco.org/repo/falcosecurity-3672BA8F.asc | sudo apt-key add -
echo "deb https://download.falco.org/packages/deb stable main" | sudo tee -a /etc/apt/sources.list.d/falcosecurity.list
sudo apt update

# As stated above, for the step 2, let's download the Kernel headers packages
# In my case, I will take the "amd64" ones to match my CPU model. If you're on ARM, download the matching ones
wget https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/amd64/linux-headers-5.10.4-051004_5.10.4-051004.202012301142_all.deb
wget https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/amd64/linux-headers-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb
wget https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/amd64/linux-image-unsigned-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb
wget https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.10.4/amd64/linux-modules-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb

# Install the packages in this exact order, as the headers "generic" is depending on the headers "all"
sudo dpkg -i linux-headers-5.10.4-051004_5.10.4-051004.202012301142_all.deb
sudo dpkg -i linux-headers-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb
sudo dpkg -i linux-image-unsigned-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb
sudo dpkg -i linux-modules-5.10.4-051004-generic_5.10.4-051004.202012301142_amd64.deb

# Install Falco from the repository
sudo apt install -y falco
```



With Falco now installed, there's still some steps needed to "enable and test it". Once again, the [Falco documentation is ready](https://falco.org/docs/getting-started/running/) and I will follow it here.



One last time (for this blog at least), let's jump into the terminal:

```bash
# Check the kernel loaded modules
# Falco should not appear
lsmod

# Enable the Falco service and start it
sudo systemctl enable falco
sudo systemctl start falco

# Check again the kernel loaded modules
# Falco should appear now
lsmod

# View the Falco logs
journalctl -fu falco
```



**CONGRATULATIONS!!!** You have now Falco up and running in WSL2 and ready to be used with your preferred Kubernetes distro (cf. the Falco documentation).



# Conclusion

I hope this blog helped you getting Falco into WSL2 and you can now not only test it, but also provide feedback to this wonderful team.

If you have any questions or feedback on Falco, do not hesitate to create an issue on [Falco GitHub repo](https://github.com/falcosecurity/falco) and for WSL2 more specifically, you can reach me on Twitter ([@nunixtech](https://twitter.com/nunixtech))



See you in the Cloud Native seas.

The WSL Corsair
