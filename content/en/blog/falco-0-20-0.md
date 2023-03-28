---
title: Falco 0.20.0 is released
date: 2020-02-24
author: Lorenzo Fontana
slug: falco-0-20-0
tags: ["Falco","Release"]
---

We're pleased to announce the release of Falco 0.20.0, our second release of 2020! Falco 0.20.0 consists of **a major bug fix**, a new feature, two minor bug fixes, and **seven** rules changes.

A total of **eight** people contributed to this release with a total of **thirteen** Pull Requests merged in!

Everyone is encouraged to **update Falco now**, especially if you are running Falco **0.18.0** or Falco **0.19.0** and are using [Kubernete Audit Events](https://kubernetes.io/docs/tasks/debug-application-cluster/falco/).


The full changelog can be found [here](https://github.com/falcosecurity/falco/releases/tag/0.20.0).

## Major themes

### Memory leaks in Kubernetes Audit Events

Upgrading is particularly important because the versions above are subject to a **memory leak** that has been reported by many users both [on GitHub](https://github.com/falcosecurity/falco/issues/1040) and Slack.

In particular, the reports had situations like this one:

![Memory leak OOM](/img/0200-leak-1.png)

You can see how Falco was OOM killed by the cluster after increased memory usage due to this bug.

After some analysis, we noticed the leak was due to some misconfiguration in how we handled a parameter in the JSON events filters.

The analysis was done by analyzing the Valgrind Massif tool and using massif-visualizer it was immediately clear that a leak was going on.

![Memory Leak Massif Output](/img/0200-leak-2.png)

For those interested, you can check this yourself by executing Falco with `massif`, in this way:


```bash
sudo valgrind --tool=massif --threshold=0.1 ./build/userspace/falco/falco   -c falco.yaml -r rules/falco_rules.yaml -r rules/k8s_audit_rules.yaml -r rules/falco_rules.local.yaml -M 100 
```


### Version API

Many users requested to be able to check the Falco version while using the [Outputs API](https://falco.org/docs/grpc/outputs/).

In Falco 0.20.0 there's a new API called Version API that you can use to gather various information about the version of the running Falco.

When using the [Falco Go Client](https://github.com/falcosecurity/client-go/) you can retrieve the version in this way:

```go
	// Set up a connection to the server.
	c, err := client.NewForConfig(&client.Config{
		Hostname:   "localhost",
		Port:       5060,
		CertFile:   "/tmp/client.crt",
		KeyFile:    "/tmp/client.key",
		CARootFile: "/tmp/ca.crt",
	})
	if err != nil {
		log.Fatalf("unable to create a Falco client: %v", err)
	}
	defer c.Close()
	versionClient, err := c.Version()
	if err != nil {
		log.Fatalf("unable to obtain a version client: %v", err)
	}

	ctx := context.Background()
	// Retrieve the version
	res, err := versionClient.Version(ctx, &version.Request{})
```

Here there's a full [example](https://github.com/falcosecurity/client-go/blob/master/examples/version/main.go) you can checkout and run.

## Minor themes

### Bug Fixes

* fix: the base64 output format (-b) now works with both json and normal output. [[#1033](https://github.com/falcosecurity/falco/pull/1033)]
* fix: version follows semver 2 bnf [[#872](https://github.com/falcosecurity/falco/pull/872)]

### Rule Changes

* rule(write below etc): add "dsc_host" as a ms oms program [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(write below etc): let mcafee write to /etc/cma.d  [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(write below etc): let avinetworks supervisor write some ssh cfg [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(write below etc): alow writes to /etc/pki from openshift secrets dir [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(write below root): let runc write to /exec.fifo [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(change thread namespace): let cilium-cni change namespaces [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(run shell untrusted): let puma reactor spawn shells [[#1028](https://github.com/falcosecurity/falco/pull/1028)]


