---
Title: "Extend Falco inputs by creating a Plugin: the basics"
Date: 2022-02-15
Author: Thomas Labarussias
slug: extend-falco-inputs-with-a-plugin-the-basics
---

> 这篇文章是关于“如何开发 Falco 插件”系列文章的一部分。 它面向任何想了解插件是如何编写并希望做出贡献的人。
> See other articles:
> * [Extend Falco inputs by creating a Plugin: Register the plugin]({{< ref "/blog/extend-falco-inputs-with-a-plugin-register" >}})

- [What are Plugins?](#what-are-plugins)
- [Developers Guide](#developers-guide)
- [Our plugin](#our-plugin)
	- [Requirements](#requirements)
	- [Pieces of code](#pieces-of-code)
		- [The imports](#the-imports)
		- [The structures](#the-structures)
		- [The functions and methods](#the-functions-and-methods)
			- [`main()`](#main)
			- [`init()`](#init)
			- [`Info()`](#info)
			- [`Init()`](#init-1)
			- [`Fields()`](#fields)
			- [`String()`](#string)
			- [`Extract()`](#extract)
			- [`Open()`](#open)
			- [`NextBatch()`](#nextbatch)
	- [Complete plugin](#complete-plugin)
	- [Build](#build)
- [Configuration](#configuration)
- [Rules](#rules)
- [Test and Results](#test-and-results)
- [Sources](#sources)
- [To Go further](#to-go-further)
- [Conclusion](#conclusion)

# 什么是插件？

在开始之前，您应该查看这些帖子以了解更多关于插件是什么、它们可以做什么以及它们背后的概念的信息：

* [Falco Plugins Early Access](https://falco.org/blog/falco-plugins-early-access/)
* [Falco 0.31.0 a.k.a. "the Gyrfalcon"](https://falco.org/blog/falco-0-31-0/)
* [Announcing Plugins and Cloud Security with Falco](https://falco.org/blog/falco-announcing-plugins/)

# 开发者指南

这篇文章的目的不是取代官方文档，它是一个循序渐进的示例，让您了解运行插件的最低要求。 有关详细信息， 请阅读 [developers guide](https://falco.org/docs/plugins/developers-guide/).

# 我们的插件

对于这个例子，我们将创建一个插件 [`docker events`](https://docs.docker.com/engine/reference/commandline/events/) 来自本地的“docker daemon”。 它是具有基本格式且没有特定身份验证的“事件流”的基本示例。

查看我们将能够收集并应用“Falco”规则的事件示例：
```
2022-02-08T10:58:56.370816183+01:00 container create e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (image=alpine, name=confident_kirch)
2022-02-08T10:58:56.371818906+01:00 container attach e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (image=alpine, name=confident_kirch)
2022-02-08T10:58:56.482094215+01:00 network connect 5864a44bccca4e0963dfe9c3087919bf8f8e5c3aa7db33dd6d9ae7138c5ee3f3 (container=e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6, name=bridge, type=bridge)
2022-02-08T10:58:56.804166856+01:00 container start e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (image=alpine, name=confident_kirch)
2022-02-08T10:58:56.831912702+01:00 container die e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (exitCode=0, image=alpine, name=confident_kirch)
2022-02-08T10:58:57.072125878+01:00 network disconnect 5864a44bccca4e0963dfe9c3087919bf8f8e5c3aa7db33dd6d9ae7138c5ee3f3 (container=e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6, name=bridge, type=bridge)
2022-02-08T10:58:57.132390363+01:00 container destroy e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (image=alpine, name=confident_kirch)
```

为了减少与 `docker daemon` 通信的复杂性， 我们将使用官方 [`docker sdk`](https://pkg.go.dev/github.com/docker/docker).

## 要求

对于这篇文章和后续文章，我们将使用“Go”进行开发，因为它是最常用的语言，“Falco”社区的许多成员和“Falco”工具已经在使用它。 我们还将使用维护者提供的[Go Plugin SDK](https://github.com/falcosecurity/plugin-sdk-go/) 来增强插件体验。

此示例的唯一要求是：
* a `docker daemon` running in your local system
* `falco 0.31` installed in your local system
* `go` >= 1.17

## 代码片段

### 进口

尽管有基本的 `Go` 模块，但我们必须从[`plugin-sdk-go`](https://github.com/falcosecurity/plugin-sdk-go/pkg/sdk) 导入不同的模块并检索`docker events`:

```go
import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"time"

	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/extractor"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/source"

	dockerTypes "github.com/docker/docker/api/types"
	dockerEvents "github.com/docker/docker/api/types/events"
	docker "github.com/moby/docker/client"
)
```

我们将在我们要编写的几乎每个插件中导入 `plugin-sdk-go` 的这些不同组件。 它们非常方便，并且提供了一种更简单的方法来处理 *Falco 插件框架*。

### 结构

两个结构是强制性的，并且必须尊重 SDK 的“接口”：

```go
// DockerPlugin represents our plugin
type DockerPlugin struct {
	plugins.BasePlugin
	FlushInterval uint64 `json:"flushinterval" jsonschema:"description=Flush Interval in ms (Default: 30)"`
}

// DockerInstance represents a opened stream based on our Plugin
type DockerInstance struct {
	source.BaseInstance
	dclient *docker.Client
	msgC    <-chan dockerEvents.Message
	errC    <-chan error
	ctx     context.Context
}
```

* `DockerPlugin` 代表我们将被框架加载的插件。 嵌入 `plugins.BasePlugin` 允许尊守 [`Plugin interface`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go@v0.1.0/pkg/sdk/plugins#Plugin) SDK的。
* `DockerInstance` 表示框架使用插件打开的事件流。 嵌入`source.BaseInstance`允许尊重 [`Instance interface`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go@v0.1.0/pkg/sdk/plugins/source#Instance)的SDK。


我们可以为我们需要的任何目的为这两个 structs 添加额外的属性，比如配置。 在这个例子中，我们有 `FlushInterval`，它表示我们将创建的 `docker` 客户端发送到 `instance` 的事件频率。 这个属性将有一个默认值，可以被 `plugins` 部分中的 `init_config` 覆盖。

### 功能和方法

#### `main()`

`main()` 函数对于任何 `go` 程序都是必需的，但是因为我们将构建 `plugin` 作为 *Falco 插件框架* 的库，它是用 `C` 编写的，所以我们可以让它为空。

```go
// main is mandatory but empty, because the plugin will be used as C library by Falco plugin framework
func main() {}
```

#### `init()`

`init()` 函数用于将我们的插件注册到 `Falco 插件框架`，作为[`source`](https://falco.org/docs/plugins/#source-plugin) and [`extractor`](https://falco.org/docs/plugins/#extractor-plugin).

```go
// init function is used for referencing our plugin to the Falco plugin framework
func init() {
	p := &DockerPlugin{}
	extractor.Register(p)
	source.Register(p)
}
```

#### `Info()`

此方法是强制性的，所有插件都必须尊守这一点。 它允许“Falco 插件框架”拥有关于插件本身的所有信息：

```go
// Info displays information of the plugin to Falco plugin framework
func (dockerPlugin *DockerPlugin) Info() *plugins.Info {
	return &plugins.Info{
		ID:                 5,
		Name:               "docker",
		Description:        "Docker Events",
		Contact:            "github.com/falcosecurity/plugins/",
		Version:            "0.1.0",
		RequiredAPIVersion: "0.3.0",
		EventSource:        "docker",
	}
}
```

这里有一些细节：
* `ID`：在所有插件中必须是唯一的，框架在捕获中使用它来知道哪个`插件`是事件的`源`。 如果您想在 [registry](https://github.com/falcosecurity/plugins). 中共享您的插件，避免冲突也很重要。 有关详细信息，请参阅[documentation](https://falco.org/docs/plugins/#plugin-event-ids)
* `Name`：我们插件的名称，将在`falco.yaml`的`plugins`部分使用
* `EventSource`：这表示我们将在 `Falco` 映射规则中设置的值，在我们的例子中，我们将设置的所有规则都将具有 `source: docker`

#### `Init()`

这个方法（:warning: 不同于函数`init()`）将是*Falco插件框架*调用的第一个方法，我们用它来设置`DockerPlugin`属性的默认值。 在我们的例子中，这些默认值被 `falco.yaml` 配置文件中的 `init_config:` 的值覆盖，参见 []()。
 
```go
// Init is called by the Falco plugin framework as first entry
// we use it for setting default configuration values and mapping
// values from `init_config` (json format for this plugin)
func (dockerPlugin *DockerPlugin) Init(config string) error {
	dockerPlugin.FlushInterval = 2
	return json.Unmarshal([]byte(config), &dockerPlugin)
}
```

该方法的字符串参数`config`是`init_config`的内容，我们在这个例子中使用JSON语法来利用`Go`的能力来映射带有标签的结构属性的JSON字段。 只要您的代码解析它并正确设置属性，一个简单的字符串也可以工作。

#### `Fields()`

此方法向 *Falco 插件框架* 声明所有可用于规则的“字段”，以及它们的名称和类型。

```go
// Fields exposes to Falco plugin framework all availables fields for this plugin
func (dockerPlugin *DockerPlugin) Fields() []sdk.FieldEntry {
	return []sdk.FieldEntry{
		{Type: "string", Name: "docker.status", Desc: "Status"},
		{Type: "string", Name: "docker.id", Desc: "ID"},
		{Type: "string", Name: "docker.from", Desc: "From"},
		{Type: "string", Name: "docker.type", Desc: "Type"},
		{Type: "string", Name: "docker.action", Desc: "Action"},
		{Type: "string", Name: "docker.stack.namespace", Desc: "Stack Namespace"},
		{Type: "string", Name: "docker.node.id", Desc: "Swarm Node ID"},
		{Type: "string", Name: "docker.swarm.task", Desc: "Swarm Task"},
		{Type: "string", Name: "docker.swarm.taskid", Desc: "Swarm Task ID"},
		{Type: "string", Name: "docker.swarm.taskname", Desc: "Swarm Task Name"},
		{Type: "string", Name: "docker.swarm.servicename", Desc: "Swarm Service Name"},
		{Type: "string", Name: "docker.node.statenew", Desc: "Node New State"},
		{Type: "string", Name: "docker.node.stateold", Desc: "Node Old State"},
		{Type: "string", Name: "docker.attributes.container", Desc: "Attribute Container"},
		{Type: "string", Name: "docker.attributes.image", Desc: "Attribute Image"},
		{Type: "string", Name: "docker.attributes.name", Desc: "Attribute Name"},
		{Type: "string", Name: "docker.attributes.type", Desc: "Attribute Type"},
		{Type: "string", Name: "docker.attributes.exitcode", Desc: "Attribute Exit Code"},
		{Type: "string", Name: "docker.attributes.signal", Desc: "Attribute Signal"},
		{Type: "string", Name: "docker.scope", Desc: "Scope"},
	}
}
```

#### `String()`

即使此方法是强制性的，`Falco` 目前也不会使用它，但必须设置以供将来使用。 它只是检索事件，它可以是 JSON 或任何格式，只要它包含源事件的全部内容即可。

```go
// String represents the raw value of on event
// (not currently used by Falco plugin framework, only there for future usage)
func (dockerPlugin *DockerPlugin) String(in io.ReadSeeker) (string, error) {
	evtBytes, err := ioutil.ReadAll(in)
	if err != nil {
		return "", err
	}
	evtStr := string(evtBytes)

	return fmt.Sprintf("%v", evtStr), nil
}
```

#### `Extract()`

*Falco 插件框架* 调用此方法来获取 `fields` 的值：

```go
// Extract allows Falco plugin framework to get values for all available fields
func (dockerPlugin *DockerPlugin) Extract(req sdk.ExtractRequest, evt sdk.EventReader) error {
	var data dockerEvents.Message

	rawData, err := ioutil.ReadAll(evt.Reader())
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	err = json.Unmarshal(rawData, &data)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	switch req.Field() {
	case "docker.status":
		req.SetValue(data.Status)
	case "docker.id":
		req.SetValue(data.ID)
	case "docker.from":
		req.SetValue(data.From)
	case "docker.type":
		req.SetValue(data.Type)
	case "docker.action":
		req.SetValue(data.Action)
	case "docker.scope":
		req.SetValue(data.Scope)
	case "docker.actor.id":
		req.SetValue(data.Actor.ID)
	case "docker.stack.namespace":
		req.SetValue(data.Actor.Attributes["com.docker.stack.namespace"])
	case "docker.swarm.task":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.task"])
	case "docker.swarm.taskid":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.task.id"])
	case "docker.swarm.taskname":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.task.name"])
	case "docker.swarm.servicename":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.service.name"])
	case "docker.node.id":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.node.id"])
	case "docker.node.statenew":
		req.SetValue(data.Actor.Attributes["state.new"])
	case "docker.node.stateold":
		req.SetValue(data.Actor.Attributes["state.old"])
	case "docker.attributes.container":
		req.SetValue(data.Actor.Attributes["container"])
	case "docker.attributes.image":
		req.SetValue(data.Actor.Attributes["image"])
	case "docker.attributes.name":
		req.SetValue(data.Actor.Attributes["name"])
	case "docker.attributes.type":
		req.SetValue(data.Actor.Attributes["type"])
	default:
		return fmt.Errorf("no known field: %s", req.Field())
	}

	return nil
}
```

> :warning: 尽量不要与其他插件创建的 `fields` 重叠，例如，在这个例子中，我们可以使用 `docker.` 前缀，因为 `Falco` 库使用 `container.` 更通用的字段，所以我们已经 不要冲突。

对于这个插件，我们使用“docker sdk”提供的模块，所有检索到的事件都将被解组到 [`events.Message`](https://pkg.go.dev/github.com/docker/docker@v20.10.12+incompatible/api/types/events#Message) 结构，简化了映射。

#### `Open()`

*Falco 插件框架* 使用此方法打开一个新的事件“流”，即所谓的“实例”。 当前的实现为每个插件只创建一个“实例”，但未来可能同一个“插件”允许打开多个流，因此一次可以打开多个“实例”。

```go
// Open is called by Falco plugin framework for opening a stream of events, we call that an instance
func (dockerPlugin *DockerPlugin) Open(params string) (source.Instance, error) {
	dclient, err := docker.NewClientWithOpts()
	if err != nil {
		return nil, err
	}

	ctx := context.Background()
	msgC, errC := dclient.Events(ctx, dockerTypes.EventsOptions{})
	return &DockerInstance{
		dclient: dclient,
		msgC:    msgC,
		errC:    errC,
		ctx:     ctx,
	}, nil
}
```

#### `NextBatch()`

*Falco 插件框架* 将调用此方法来获取我们的 `plugin` 收集的一批事件。

> :warning: 这篇博文涉及插件的创建，我们不会描述使用 `docker sdk` 从 `docker daemon` 获取事件的逻辑。

```go
// NextBatch is called by Falco plugin framework to get a batch of events from the instance
func (dockerInstance *DockerInstance) NextBatch(pState sdk.PluginState, evts sdk.EventWriters) (int, error) {

	dockerPlugin := pState.(*DockerPlugin)

	i := 0
	expire := time.After(time.Duration(dockerPlugin.FlushInterval) * time.Millisecond)
	for i < evts.Len() {
		select {
		case m := <-dockerInstance.msgC:
			s, _ := json.Marshal(m)
			evt := evts.Get(i)
			if _, err := evt.Writer().Write(s); err != nil {
				return i, err
			}
			i++
		case <-expire:
			// Timeout occurred, flush a partial batch
			return i, sdk.ErrTimeout
		case err := <-dockerInstance.errC:
			// todo: this will cause the program to exit. May we want to ignore some kind of error?
			return i, err
		}
	}

	// The batch is full
	return i, nil
}
```

* this methods returns the number of events in the batch and an error
* the **max size** for a batch is `evts.Len()`
* the plugin configuration can be retrieved with `pState.(*DockerPlugin)`
* for each "slot" of the batch, we have to get it `evt := evts.Get(n)` and then set its value `evt.Writer().Write(s)`

## 完整的插件

```go
/*
Copyright (C) 2022 The Falco Authors.

根据 Apache 许可证 2.0 版（“许可证”）获得许可；
除非遵守许可，否则您不得使用此文件。
您可以在以下网址获取许可证的副本

    http://www.apache.org/licenses/LICENSE-2.0

除非适用法律要求或书面同意，否则软件
根据许可分发是在“原样”基础上分发的，
没有任何明示或暗示的保证或条件。
请参阅许可证以了解特定语言的管理权限和
许可证下的限制。
*/

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"time"

	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/extractor"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/source"

	dockerTypes "github.com/docker/docker/api/types"
	dockerEvents "github.com/docker/docker/api/types/events"
	docker "github.com/moby/docker/client"
)

// DockerPlugin represents our plugin
type DockerPlugin struct {
	plugins.BasePlugin
	FlushInterval uint64 `json:"flushInterval" jsonschema:"description=Flush Interval in ms (Default: 30)"`
}

// DockerInstance represents a opened stream based on our Plugin
type DockerInstance struct {
	source.BaseInstance
	dclient *docker.Client
	msgC    <-chan dockerEvents.Message
	errC    <-chan error
	ctx     context.Context
}

// init function is used for referencing our plugin to the Falco plugin framework
func init() {
	p := &DockerPlugin{}
	extractor.Register(p)
	source.Register(p)
}

// Info displays information of the plugin to Falco plugin framework
func (dockerPlugin *DockerPlugin) Info() *plugins.Info {
	return &plugins.Info{
		ID:                 5,
		Name:               "docker",
		Description:        "Docker Events",
		Contact:            "github.com/falcosecurity/plugins/",
		Version:            "0.1.0",
		RequiredAPIVersion: "0.3.0",
		EventSource:        "docker",
	}
}

// Init is called by the Falco plugin framework as first entry,
// we use it for setting default configuration values and mapping
// values from `init_config` (json format for this plugin)
func (dockerPlugin *DockerPlugin) Init(config string) error {
	dockerPlugin.FlushInterval = 30
	return json.Unmarshal([]byte(config), &dockerPlugin)
}

// Fields exposes to Falco plugin framework all availables fields for this plugin
func (dockerPlugin *DockerPlugin) Fields() []sdk.FieldEntry {
	return []sdk.FieldEntry{
		{Type: "string", Name: "docker.status", Desc: "Status of the event"},
		{Type: "string", Name: "docker.id", Desc: "ID of the event"},
		{Type: "string", Name: "docker.from", Desc: "From of the event (deprecated)"},
		{Type: "string", Name: "docker.type", Desc: "Type of the event"},
		{Type: "string", Name: "docker.action", Desc: "Action of the event"},
		{Type: "string", Name: "docker.stack.namespace", Desc: "Stack Namespace"},
		{Type: "string", Name: "docker.node.id", Desc: "Swarm Node ID"},
		{Type: "string", Name: "docker.swarm.task", Desc: "Swarm Task"},
		{Type: "string", Name: "docker.swarm.taskid", Desc: "Swarm Task ID"},
		{Type: "string", Name: "docker.swarm.taskname", Desc: "Swarm Task Name"},
		{Type: "string", Name: "docker.swarm.servicename", Desc: "Swarm Service Name"},
		{Type: "string", Name: "docker.node.statenew", Desc: "Node New State"},
		{Type: "string", Name: "docker.node.stateold", Desc: "Node Old State"},
		{Type: "string", Name: "docker.attributes.container", Desc: "Attribute Container"},
		{Type: "string", Name: "docker.attributes.image", Desc: "Attribute Image"},
		{Type: "string", Name: "docker.attributes.name", Desc: "Attribute Name"},
		{Type: "string", Name: "docker.attributes.type", Desc: "Attribute Type"},
		{Type: "string", Name: "docker.attributes.exitcode", Desc: "Attribute Exit Code"},
		{Type: "string", Name: "docker.attributes.signal", Desc: "Attribute Signal"},
		{Type: "string", Name: "docker.scope", Desc: "Scope"},
	}
}

// Extract allows Falco plugin framework to get values for all available fields
func (dockerPlugin *DockerPlugin) Extract(req sdk.ExtractRequest, evt sdk.EventReader) error {
	var data dockerEvents.Message

	rawData, err := ioutil.ReadAll(evt.Reader())
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	err = json.Unmarshal(rawData, &data)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	switch req.Field() {
	case "docker.status":
		req.SetValue(data.Status)
	case "docker.id":
		req.SetValue(data.ID)
	case "docker.from":
		req.SetValue(data.From)
	case "docker.type":
		req.SetValue(data.Type)
	case "docker.action":
		req.SetValue(data.Action)
	case "docker.scope":
		req.SetValue(data.Scope)
	case "docker.actor.id":
		req.SetValue(data.Actor.ID)
	case "docker.stack.namespace":
		req.SetValue(data.Actor.Attributes["com.docker.stack.namespace"])
	case "docker.swarm.task":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.task"])
	case "docker.swarm.taskid":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.task.id"])
	case "docker.swarm.taskname":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.task.name"])
	case "docker.swarm.servicename":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.service.name"])
	case "docker.node.id":
		req.SetValue(data.Actor.Attributes["com.docker.swarm.node.id"])
	case "docker.node.statenew":
		req.SetValue(data.Actor.Attributes["state.new"])
	case "docker.node.stateold":
		req.SetValue(data.Actor.Attributes["state.old"])
	case "docker.attributes.container":
		req.SetValue(data.Actor.Attributes["container"])
	case "docker.attributes.image":
		req.SetValue(data.Actor.Attributes["image"])
	case "docker.attributes.name":
		req.SetValue(data.Actor.Attributes["name"])
	case "docker.attributes.type":
		req.SetValue(data.Actor.Attributes["type"])
	default:
		return fmt.Errorf("no known field: %s", req.Field())
	}

	return nil
}

// Open is called by Falco plugin framework for opening a stream of events, we call that an instance
func (dockerPlugin *DockerPlugin) Open(params string) (source.Instance, error) {
	dclient, err := docker.NewClientWithOpts()
	if err != nil {
		return nil, err
	}

	ctx := context.Background()
	msgC, errC := dclient.Events(ctx, dockerTypes.EventsOptions{})
	return &DockerInstance{
		dclient: dclient,
		msgC:    msgC,
		errC:    errC,
		ctx:     ctx,
	}, nil
}

// String represents the raw value of on event
// (not currently used by Falco plugin framework, only there for future usage)
func (dockerPlugin *DockerPlugin) String(in io.ReadSeeker) (string, error) {
	evtBytes, err := ioutil.ReadAll(in)
	if err != nil {
		return "", err
	}
	evtStr := string(evtBytes)

	return fmt.Sprintf("%v", evtStr), nil
}

// NextBatch is called by Falco plugin framework to get a batch of events from the instance
func (dockerInstance *DockerInstance) NextBatch(pState sdk.PluginState, evts sdk.EventWriters) (int, error) {

	dockerPlugin := pState.(*DockerPlugin)

	i := 0
	expire := time.After(time.Duration(dockerPlugin.FlushInterval) * time.Millisecond)
	for i < evts.Len() {
		select {
		case m := <-dockerInstance.msgC:
			s, _ := json.Marshal(m)
			evt := evts.Get(i)
			if _, err := evt.Writer().Write(s); err != nil {
				return i, err
			}
			i++
		case <-expire:
			// Timeout occurred, flush a partial batch
			return i, sdk.ErrTimeout
		case err := <-dockerInstance.errC:
			// todo: this will cause the program to exit. May we want to ignore some kind of error?
			return i, err
		}
	}

	// The batch is full
	return i, nil
}

func (dockerInstance *DockerInstance) Close() {
	dockerInstance.ctx.Done()
}

// main is mandatory but empty, because the plugin will be used as C library by Falco plugin framework
func main() {}
```

## 构建

该插件被构建为 `c-shared` 库，以获取 `.so`：
```shell
go build -buildmode=c-shared -o /usr/share/falco/plugins/libdocker.so
```

# 配置

现在我们有了插件，我们必须在 `falco.yaml` 中将其声明为 `Falco`：

```yaml
plugins:
  - name: docker
    library_path: /usr/share/falco/plugins/libdocker.so
    init_config: '{"flushinterval": 1}'

load_plugins: [docker]

stdout_output:
  enabled: true
```

有关此配置的更多详细信息，文档是 [here](https://falco.org/docs/plugins/#loading-plugins-in-falco).

# 规则

我们创建了一个简单的规则，用于检查 `fields` 和 `source` 是否按预期工作：

```yaml
- rule: Container status changed
  desc: Container status changed
  condition: docker.status in (create,start,die)
  output: status=%docker.status from=%docker.from type=%docker.type action=%docker.action name=%docker.attributes.name 
  priority: DEBUG
  source: docker
  tags: [docker]
```

# 测试和结果

让我们使用我们的配置和规则文件运行“Falco”：

```shell
falco -c falco.yaml -r docker_rules.yaml
```
```shell
17:17:24.008405000: Debug status=create from=alpine type=container action=create name=bold_keller
17:17:24.008953000: Debug status=start from=alpine type=container action=start name=bold_keller
17:17:24.009076000: Debug status=die from=alpine type=container action=die name=bold_keller

Events detected: 3
Rule counts by severity:
   DEBUG: 3
Triggered rules by rule name:
   Container status changed: 3
Syscall event drop monitoring:
   - event drop detected: 0 occurrences
   - num times actions taken: 0
```
:tada: It works!

# 来源

这篇文章的所有文件都可以在 [this repo](https://github.com/Issif/docker-plugin).

# 更进一步

插件完成后，您可以通过注册与社区共享它。 下一篇文章 [Extend Falco inputs by creating a Plugin: Register the plugin]({{< ref "/blog/extend-falco-inputs-with-a-plugin-register" >}}) 将指导整个过程。

# 结论

有了这篇文章，您现在应该已经掌握了创建自己插件的所有基础知识。下面的帖子将描述更高级的用例，比如从云服务收集事件。敬请关注。

---

您可以在 [Falco community](https://github.com/falcosecurity/community). 中找到我们。 如有任何问题、建议，甚至是友好的交谈，请随时与我们联系！

If you would like to find out more about Falco:

* Get started in [Falco.org](http://falco.org/)
* [Plugin Documentation](https://falco.org/docs/plugins/)
* [Plugin Developer Guide](https://falco.org/docs/plugins/developers-guide/)
* [Plugin registry](https://github.com/falcosecurity/plugins) 
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco)
* Get involved in the [Falco community](https://falco.org/community/)
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/messages/falco)
* Follow [@falco_org on Twitter](https://twitter.com/falco_org)
