---
title: Kernel testing framework
date: 2023-09-14
author: Federico Di Pierro, Aldo Lacuku
slug: kernel-testing-framework
---

Historically, in the Falcosecurity organization, we faced a significant challenge: there was no established method to ensure that with each iteration of our drivers, supported kernels remained unaffected. This essential process is commonly referred to as regression testing. To elaborate, we lacked a means to guarantee that a new driver release could:

* Successfully compile on multiple kernel versions.
* Pass the eBPF verifier when executed on various kernel versions.
* Operate as expected, such as retrieving kernel events, across multiple kernel versions.

To address this issue, we started a major intervention. Initially, a [proposal](https://github.com/falcosecurity/libs/blob/master/proposals/20230530-driver-kernel-testing-framework.md) was discussed and incorporated into the libs repository.

Since this was a pretty novel area, there were no pre-existing tools available to tackle it. Consequently, we embarked on the development of a new completely framework.  
Allow us to introduce you to the `kernel testing framework`.

### Overview

Considering the inherent characteristics of the challenge, we need to set up a complete virtual machine for each distinct kernel version.  
These tests should be executed automatically each time new code is integrated into our drivers, serving as a means to promptly identify any issue or flaw in the tested kernel versions.  
With these objectives in mind, our approach should fulfill the following requirements:

* Rapid and cost-effective VM creation: The process of creating these virtual machines should be efficient and budget-friendly.
* Effortless distribution of VM images: We should ensure easy sharing and deployment of the virtual machine images.
* Parallel execution of tests on multiple VMs: Tests should run concurrently on each virtual machine to expedite the process.
* Reproducibility in local environments for debugging purposes: Developers should be able to replicate the test environment locally to investigate and troubleshoot issues.
* Straightforward and user-friendly presentation of test results: The test results should be presented in a simple and intuitive manner to immediately spot failures.

#### Ignite a Firecracker microVM

[Weave Ignite](https://https://github.com/weaveworks/ignite) is used to provision the [firecracker](https://github.com/firecracker-microvm/firecracker) microVMs. Weave Ignite is an open-source tool designed for lightweight and fast virtual machine management. It enables users to effortlessly create and manage virtual machines (VMs) for various purposes, such as development, testing, and experimentation. 
One of the main reasons why we chose to use this tool was its capability to create firecracker microVMs from kernels and rootfs packed as OCI images.
Currently, we are using a patched version located at [a forked repository](https://github.com/therealbobo/ignite). These patches were essential to enable the booting of kernels that necessitated the use of an initrd (initial ramdisk).

#### Kernel & Rootfs OCI images

Virtual machines consist of two essential layers: the kernel and the rootfs. These layers are packaged and distributed as OCI (Open Container Initiative) images. The kernel image encompasses the kernel that the virtual machine relies on, in contrast the rootfs image serves as the fundamental building block of a virtual machine, offering the essential filesystem necessary for booting the VM. Typically, these rootfs images incorporate a Linux distribution. 
For more info on how we build them please check the available [images documentation](https://github.com/falcosecurity/kernel-testing/tree/main/images).

#### Ansible Playbooks

Automation is accomplished through the utilization of [Ansible](https://docs.ansible.com/ansible/latest/index.html). A collection of [playbooks](https://github.com/falcosecurity/kernel-testing/tree/main/ansible-playbooks) is responsible for:

* Orchestrating the provisioning of microVMs.
* Configuring the machines.
* Retrieving the code to be tested.
* Eliminating the microVMs once the testing process is completed.

#### Results Presentation

We wanted the test data to be publicly and easily accessible by anyone, thus we had to find a way to represent the test output.  
Since there are 3 possible ways of instrumenting the kernel, that is using a kernel module or one of the available eBPF probes, the playbooks perform up to 3 tests. Taking into account that the modern eBPF probe is built in the Falco libraries, only 2 drivers need to be compiled.
We have 3 possible results for each of them:
* success, when the test goes fine
* error, when the test fails
* skipped, when the test is not runnable for the kernel (for example, skipping modern eBPF tests where it is unsupported)

The natural way of dealing with all of this was to develop a [small tool](https://github.com/falcosecurity/kernel-testing/tree/main/matrix_gen) that, given as input the output root folder, would generate a markdown matrix with the results.  

While scrutinizing the first version of the markdown matrix, we understood that it would have been even better if errors were also attached to the markdown, allowing for a more streamlined visualization of the results.  

### How we use it

We implemented a new Github action workflow in the libs repository that triggers on pushes to master.  
Since this was a hot topic for Falco graduation, we asked the CNCF for nodes: https://github.com/cncf/cluster/issues/240, and they promptly gave us access to an amd64 and an arm64 node.  

The [workflow](https://github.com/falcosecurity/libs/blob/master/.github/workflows/kernel_tests.yaml) itself is very simple since it runs the testing framework on self-hosted nodes just like you would run it locally:
```yaml=
jobs:
  test-kernels:
    strategy:
      fail-fast: false
      matrix:
        architecture: [X64, ARM64]
    runs-on: [ "self-hosted", "linux", "${{matrix.architecture}}" ]    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          repository: falcosecurity/kernel-testing
          ref: v0.2.3
        
      - name: Generate vars yaml
        working-directory: ./ansible-playbooks
        run: |
          LIBS_V=${{ github.event.inputs.libsversion }}
          LIBS_VERSION=${LIBS_V:-${{ github.ref_name }}}
          cat > vars.yml <<EOF
          run_id: "id-${{ github.run_id }}"
          output_dir: "~/ansible_output_${{ github.run_id }}"
          repos:
            libs: {name: "falcosecurity-libs", repo: "https://github.com/falcosecurity/libs.git", version: "$LIBS_VERSION"}
          EOF
    
      - name: Bootstrap VMs
        working-directory: ./ansible-playbooks
        run: |
          ansible-playbook bootstrap.yml --extra-vars "@vars.yml"
      
      - name: Common setup
        working-directory: ./ansible-playbooks
        run: |
          ansible-playbook common.yml --extra-vars "@vars.yml"

      - name: Prepare github repos
        working-directory: ./ansible-playbooks
        run: |
          ansible-playbook git-repos.yml --extra-vars "@vars.yml"
      
      - name: Run scap-open tests
        working-directory: ./ansible-playbooks
        run: |
          ansible-playbook scap-open.yml --extra-vars "@vars.yml" || :
          
      - name: Tar output files
        run: |
          tar -cvf ansible_output.tar ~/ansible_output_${{ github.run_id }}

      - uses: actions/upload-artifact@v3
        with:
          name: ansible_output_${{matrix.architecture}}
          path: ansible_output.tar
    
      - name: Build matrix_gen
        working-directory: ./matrix_gen
        env:
          GOPATH: /root/go
          GOCACHE: /root/.cache/go-build
        run: |
          go build .
        
      - name: Generate new matrix
        working-directory: ./matrix_gen
        run: |
          ./matrix_gen --root-folder ~/ansible_output_${{ github.run_id }} --output-file matrix_${{matrix.architecture}}.md
        
      - uses: actions/upload-artifact@v3
        with:
          name: matrix_${{matrix.architecture}}
          path: ./matrix_gen/matrix_${{matrix.architecture}}.md
          
      - name: Cleanup
        if: always()
        working-directory: ./ansible-playbooks
        run: |
          ansible-playbook clean-up.yml --extra-vars "@vars.yml" || :
```

In the `Generate new matrix` step, the kernel matrix gets generated and then uploaded.  
Once this workflow runs successfully for both architectures, another [workflow](https://github.com/falcosecurity/libs/blob/master/.github/workflows/pages.yml) gets triggered,  
that is responsible for generating and pushing updated Github pages.  
The end result can be seen at https://falcosecurity.github.io/libs/matrix/.

Moreover, the kernel-testing workflow gets also triggered on each driver's tag; then a [supplementary workflow](https://github.com/falcosecurity/libs/blob/master/.github/workflows/release-body.yml) takes care of attaching matrixes to the release body;  
here is an example: https://github.com/falcosecurity/libs/releases/tag/6.0.0%2Bdriver.

Pretty nice, uh?

### Future improvements

There are quite a few gaps that still need to be addressed by our framework. First of all, the images being used by Ignite to spawn FireCracker VMs are still under a development Docker repository and need to be moved under Falcosecurity.  
Moreover, we need to implement a CI to automatically build and push those images.  

As previously said, the kernel tests are currently running `scap-open` binary to check whether any event gets received. It would be great to use `drivers_test` binary instead, to fully test the expected behavior of the drivers.  

Finally, a utopian idea: imagine if we were able to run [`kernel-crawler`](https://github.com/falcosecurity/kernel-crawler) to fetch kernel images, and then **automatically** build new kernel testing matrix entries for newly discovered images.  
This would mean that our kernel testing matrix coverage increases steadily week after week, giving users even more guarantees about the stability of the Falco drivers!

Here is the libs tracking issue: https://github.com/falcosecurity/libs/issues/1224.
Feel free to drop your ideas over there!  
