---
title: Falco Weekly 50 - 2023
date: 2023-12-15
author: Aldo Lacuku, Andrea Terzolo, Federico Di Pierro
slug: falco-w-50-2023-weekly-recap
aliases:
  - falco-w-50-2023
tags: ["Falco"]
---

## What happened in Falco this week?

Let's go through the major changes that happened in various repositories under the falcosecurity organization.  

### [Libs](https://github.com/falcosecurity/libs)

The anticipated 0.14.0 libs tag (and its driver counterpart) are going to be tagged soon, by the end of next week.  
A xmas present for you all! :christmas_tree:

Mostly fixes were merged during this week:
* Populate labels field for pod sandbox containers: https://github.com/falcosecurity/libs/pull/1564
* Improved libscap modern bpf tests and CI checks: https://github.com/falcosecurity/libs/pull/1568
* Avoid a double free when an exception is thrown during sinsp initialization: https://github.com/falcosecurity/libs/pull/1569
* Made our pkg-config files paths-relative: https://github.com/falcosecurity/libs/pull/1570
* Fixed some paths handling in `fs.path`: https://github.com/falcosecurity/libs/pull/1571
* Do not include NULL terminator in enter event strings: https://github.com/falcosecurity/libs/pull/1574
* Started a dedicated container engines test suite: https://github.com/falcosecurity/libs/pull/1544
* Rewritten scary `concatenate_paths` function leveraging modern c++17 `std::filesystem`: https://github.com/falcosecurity/libs/pull/1533
* Use a smart pointer for `m_resolver` in `sinsp_dns_manager` to avoid leaks: https://github.com/falcosecurity/libs/pull/1558

Also, thanks to actuated.dev for offering us arm64 github action runners, CI has been fully ported to github actions, except for a single CircleCI job! https://github.com/falcosecurity/libs/pull/1555


Rumors have it coming next:
* Drivers build fix against linux 6.7-rc4+: https://github.com/falcosecurity/libs/pull/1566
* Add `k8s.pod.uid`, `k8s.pod.sandbox_id` and mark `k8s.pod.id` as legacy: https://github.com/falcosecurity/libs/pull/1575

### [Falco](https://github.com/falcosecurity/falco)

Falco has seen some big new features this week!
* Env variables expansion was extended to all scalar values in Falco configuration file! https://github.com/falcosecurity/falco/pull/2918, https://github.com/falcosecurity/falco/pull/2972
* Leveraging the above, `engine.ebpf.probe` path now defaults to `${HOME}/.falco/falco-bpf.o`: https://github.com/falcosecurity/falco/pull/2971
* CI has been ported to use actuated.dev github action arm64 runners! https://github.com/falcosecurity/falco/pull/2945, https://github.com/falcosecurity/falco/pull/2967
* Monitor more types of events for Falco hot reload feature: https://github.com/falcosecurity/falco/pull/2965
* libs and driver were bumped to latest master: https://github.com/falcosecurity/falco/pull/2970

Finally, the new `falcoctl` based driver-loader was finally merged in Falco: https://github.com/falcosecurity/falco/pull/2905.  
If you can, please make sure to give it a spin and let us know any feedback, it is very valuable for us!  
To try it out:
```bash
docker pull falcosecurity/falco-driver-loader:master
docker run --rm -i -t \
    --privileged \
    -v /root/.falco:/root/.falco \
    -v /proc:/host/proc:ro \
    -v /boot:/host/boot:ro \
    -v /lib/modules:/host/lib/modules \
    -v /usr:/host/usr:ro \
    -v /etc:/host/etc:ro \
    falcosecurity/falco-driver-loader:master
```

### [Falcoctl](https://github.com/falcosecurity/falcoctl)

Some fixes on top of the new driver-loader happened:
* Cleanup eBPF probe symlink in `Cleanup` method: https://github.com/falcosecurity/falcoctl/pull/371
* Do not call `FixupKernel` when building drivers: https://github.com/falcosecurity/falcoctl/pull/373

Moreover, we finally merged the new `asset` artifact type PR! https://github.com/falcosecurity/falcoctl/pull/309

Falcoctl is quite ready for [v0.7.0](https://github.com/falcosecurity/falcoctl/milestone/7) release; we only need more driver-loader testing!

### [Driverkit](https://github.com/falcosecurity/driverkit)

Driverkit has seen a small bug fix release this week: https://github.com/falcosecurity/driverkit/releases/tag/v0.16.2.  
It contains a fix to docker go package multiplexed output support: https://github.com/falcosecurity/driverkit/pull/310.

Moreover, we merged a PR  that opens up the possibility for Driverkit to directly use `cmake` to configure and then build our drivers: https://github.com/falcosecurity/driverkit/pull/309.  

What's next?  
The `cmake` PR is opened and works super good; build times are as good as before, so no penalty! https://github.com/falcosecurity/driverkit/pull/302.  
Moreover, we are going to make use of actuated.dev arm64 runners in driverkit too, porting its CI to github actions: https://github.com/falcosecurity/driverkit/pull/311.

## Join relevant discussions!

* Breaking changes in Falco 0.37.0: https://github.com/falcosecurity/falco/issues/2763
* Breaking changes in Falco 0.38.0: https://github.com/falcosecurity/falco/issues/2840


## Let's meet 🤝

We meet every week in our [community calls](https://github.com/falcosecurity/community),
if you want to know the latest and the greatest you should join us there!

If you have any questions

* Join the [#falco channel](https://kubernetes.slack.com/messages/falco) on the [Kubernetes Slack](https://slack.k8s.io)
* Join the [Falco mailing list](https://lists.cncf.io/g/cncf-falco-dev)

Thanks to all the amazing contributors!

Cheers 🎊

Aldo, Andrea, Federico
