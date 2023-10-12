---
exclude_search: true
title: Falco 0.20.0 is released
date: 2020-02-24
author: Lorenzo Fontana
slug: falco-0-20-0
---

我们很高兴地宣布发布 Falco 0.20.0，这是我们 2020 年的第二个版本！ Falco 0.20.0 包括一个主要错误修复、一个新功能、两个小错误修复和七个规则更改。

共有 8 人为此版本做出了贡献，总共合并了13个拉取请求！

鼓励每个人现在更新 Falco，尤其是如果您正在运行 Falco 0.18.0 或 Falco 0.19.0 并且正在使用 Kubernetes 审计事件。


完整的变更日志可以在这里找到。(https://github.com/falcosecurity/falco/releases/tag/0.20.0).

## 主要主题

### Kubernetes 审计事件中的内存泄漏

升级尤为重要，因为上述版本存在内存泄漏问题，GitHub 和 Slack 上的许多用户都报告了该问题。(https://github.com/falcosecurity/falco/issues/1040)

特别是，报告中有这样的情况：

内存泄漏OOM

你可以看到 Falco 在由于这个 bug 增加了内存使用后是如何被集群杀死的。

经过一些分析，我们注意到泄漏是由于我们在处理 JSON 事件过滤器中的参数时配置错误造成的。

分析是通过分析 Valgrind Massif 工具完成的，并且使用 massif-visualizer 可以立即清楚地知道发生了泄漏。

内存泄漏地块输出

对于那些感兴趣的人，您可以通过使用massif执行Falco来自己检查这一点，方式如下：


```bash
sudo valgrind --tool=massif --threshold=0.1 ./build/userspace/falco/falco   -c falco.yaml -r rules/falco_rules.yaml -r rules/k8s_audit_rules.yaml -r rules/falco_rules.local.yaml -M 100 
```


###API版本

许多用户要求能够在使用输出 API 时检查 Falco 版本。(https://falco.org/docs/grpc/outputs/).

在Falco 0.20.0中有一个名为VersionAPI的新 API，您可以使用它来收集有关正在运行的Falco版本的各种信息。

使用Falco Go客户端时，您可以通过以下方式检索版本：

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

这里有一个完整的示例，您可以查看并运行。(https://github.com/falcosecurity/client-go/blob/master/examples/version/main.go)

## 次要主题

### Bug修复

* fix: base64 输出格式 (-b) 现在适用于 json 和普通输出。[[#1033](https://github.com/falcosecurity/falco/pull/1033)]
* fix: 版本遵循 semver 2 bnf。[[#872](https://github.com/falcosecurity/falco/pull/872)]

### Rule Changes

* rule(write below etc): 将“dsc_host”添加为 ms oms 程序 [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(write below etc): 让mcafee 写入/etc/cma.d  [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(write below etc): 让avinetworks主管写一些ssh cfg [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(write below etc): 允许从openshift secrets目录写入/etc/pki [#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(write below root): 让runc写入/exec.fifo [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(change thread namespace): 让cilium-cni改变命名空间 [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
* rule(run shell untrusted): 内存泄漏地块输出 [[#1028](https://github.com/falcosecurity/falco/pull/1028)]
