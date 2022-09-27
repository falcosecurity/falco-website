---
Title: "Extend Falco inputs by creating a Plugin: the basics"
Date: 2022-02-15
Author: Thomas Labarussias
slug: extend-falco-inputs-with-a-plugin-the-basics
---

> This post is is part of a series of articles about `How to develop Falco plugins`. It's adressed to anybody who would like to understand how plugins are written and want to contribute.
> See other articles:
> * [Extend Falco inputs by creating a Plugin: Register the plugin]({{< ref "/blog/extend-falco-inputs-with-a-plugin-register" >}})
> * [Extend Falco inputs by creating a Plugin: Set a cache]({{< ref "/blog/extend-falco-inputs-with-a-plugin-set-a-cache" >}})


> 2022/07/08 - Updates to reflect last features of the Go SDK

- [What are Plugins?](#what-are-plugins)
- [Developers Guide](#developers-guide)
- [The plugin](#the-plugin)
	- [Go SDK](#go-sdk)
	- [Requirements](#requirements)
	- [Code Organization](#code-organization)
	- [The plugin codebase](#the-plugin-codebase)
		- [plugin/main.go](#pluginmaingo)
			- [The imports](#the-imports)
			- [The const](#the-const)
			- [The functions](#the-functions)
				- [`main()`](#main)
				- [`init()`](#init)
		- [pkg/docker.go](#pkgdockergo)
			- [The imports](#the-imports-1)
			- [The global variables](#the-global-variables)
			- [The structures](#the-structures)
			- [The functions and methods](#the-functions-and-methods)
				- [`SetInfo()`](#setinfo)
				- [`Info()`](#info)
				- [`Init()`](#init-1)
				- [`InitSchema()`](#initschema)
				- [`Fields()`](#fields)
				- [`String()`](#string)
				- [`Extract()`](#extract)
				- [`Open()`](#open)
	- [The repository](#the-repository)
- [Build](#build)
- [Installation](#installation)
- [Configuration](#configuration)
- [Rules](#rules)
- [Test and Results](#test-and-results)
- [Sources](#sources)
- [To Go further](#to-go-further)
- [Conclusion](#conclusion)

# What are Plugins?

Before starting, you should take a look at these posts to know more about what Plugins are, what they can do and what concepts are behind them:

* [Falco Plugins Early Access](https://falco.org/blog/falco-plugins-early-access/)
* [Falco 0.31.0 a.k.a. "the Gyrfalcon"](https://falco.org/blog/falco-0-31-0/)
* [Announcing Plugins and Cloud Security with Falco](https://falco.org/blog/falco-announcing-plugins/)

# Developers Guide

This post has not for purpose to replace the official documentation, it's a step-by-step example to get you to know minimal requirements for having a running plugin. For details, please read the [developers guide](https://falco.org/docs/plugins/developers-guide/).

# The plugin

For this example, we'll create a plugin for [`docker events`](https://docs.docker.com/engine/reference/commandline/events/) from a local `docker daemon`. It is a basic example of an `event stream` with a basic format and without specific authentication.

See an example of events we'll be able to gather and apply `Falco` rules over:
```
2022-02-08T10:58:56.370816183+01:00 container create e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (image=alpine, name=confident_kirch)
2022-02-08T10:58:56.371818906+01:00 container attach e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (image=alpine, name=confident_kirch)
2022-02-08T10:58:56.482094215+01:00 network connect 5864a44bccca4e0963dfe9c3087919bf8f8e5c3aa7db33dd6d9ae7138c5ee3f3 (container=e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6, name=bridge, type=bridge)
2022-02-08T10:58:56.804166856+01:00 container start e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (image=alpine, name=confident_kirch)
2022-02-08T10:58:56.831912702+01:00 container die e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (exitCode=0, image=alpine, name=confident_kirch)
2022-02-08T10:58:57.072125878+01:00 network disconnect 5864a44bccca4e0963dfe9c3087919bf8f8e5c3aa7db33dd6d9ae7138c5ee3f3 (container=e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6, name=bridge, type=bridge)
2022-02-08T10:58:57.132390363+01:00 container destroy e327f1fa52a90d79421e416aed60e6de6872231f31101a1cc63401e90cef4bd6 (image=alpine, name=confident_kirch)
```

## Go SDK

For reducing the complixity to communicate with the `docker daemon`, we'll use the official [`docker sdk`](https://pkg.go.dev/github.com/docker/docker).

## Requirements

For this post and following ones, we'll develop in `Go`, because it's the most common language for that purpose, a lot of member of the `Falco` Community and tools for `Falco` are already using it. We'll also use the [Go Plugin SDK](https://github.com/falcosecurity/plugin-sdk-go/) the maintainers provide for enhancing the experience with plugins.

The only requirements for this examples are:
* a `docker daemon` running in your local system
* `falco 0.32` installed in your local system
* `go` >= 1.17

## Code Organization

To simplify contributions and keep a consistency between plugins, we propose a specific organization for the repositories of plugins:

```shell
.
├── LICENSE
├── Makefile
├── README.md
├── falco.yaml
├── go.mod
├── go.sum
├── pkg
│   └── docker.go
├── plugin
│   └── main.go
└── rules
    └── docker_rules.yaml
```

The directories:
* `pkg`: contains all modules for our plugin, we use a `pkg` folder because they might be imported and used by other plugins
* `plugin`: contains the `main.go` of our plugin
* `rules`: contains one or more `.yaml` files with default rules for the plugin 

The files:
* `LICENSE`: the license file, most of the plugins are under Apache License 2.0
* `README`: the README, see in the [repository](https://github.com/Issif/docker-plugin) for an example
* `Makefile`: allows to easily build and install the plugin, see in the [repository](https://github.com/Issif/docker-plugin/blob/main/Makefile) for an example
* `falco.yaml`: (optionnal) an example file with the minimal configuration to use the plugin
* `go.mod`, `go.sum`: classic go module files

## The plugin codebase

### plugin/main.go

This is the entrypoint of our plugin.

```go
package main

import (
	docker "github.com/Issif/docker-plugin/pkg"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/extractor"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/source"
)

const (
	PluginID          uint32 = 5
	PluginName               = "docker"
	PluginDescription        = "Docker Events"
	PluginContact            = "github.com/falcosecurity/plugins/"
	PluginVersion            = "0.2.0"
	PluginEventSource        = "docker"
)

func init() {
	plugins.SetFactory(func() plugins.Plugin {
		p := &docker.Plugin{}
		p.SetInfo(
			PluginID,
			PluginName,
			PluginDescription,
			PluginContact,
			PluginVersion,
			PluginEventSource,
		)
		extractor.Register(p)
		source.Register(p)
		return p
	})
}

func main() {}
```

#### The imports

Despite basic `Go` modules, we'll have to import the different [`plugin-sdk-go`](https://github.com/falcosecurity/plugin-sdk-go/pkg/sdk) modules (>= 0.5.0) and other modules we need for our plugin:

```go
import (
	docker "github.com/Issif/docker-plugin/pkg"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/extractor"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/source"
)
```

We'll import these different components of `plugin-sdk-go` in almost every plugin we'll write. They're really convenient and provide a much easier way to deal with the *Falco plugin framework*.

#### The const

```go
const (
	ID          uint32 = 5
	Name               = "docker"
	Description        = "Docker Events"
	Contact            = "github.com/Issif/docker-plugin"
	Version            = "0.2.0"
	EventSource        = "docker"
)
```

The `const` are used to declare all mandatory informations of our plugin through the `docker.SetInfo()` method:
* `ID`:  must be unique among all plugins, it's used by the framework in captures to know which `plugin` is the `source` of events. It's also important for avoiding collisions if you want to share your plugin in the [registry](https://github.com/falcosecurity/plugins), see [the main repository](https://github.com/falcosecurity/plugins#registering-a-new-plugin) for more details
* `Name`: the name of our plugin, will be used in `plugins` section of  `falco.yaml`
* `Description`: the description of our plugin
* `Contact`: a contact link, often a link to the repository
* `Version`: all plugins must be versionned for compatibility with Falco
* `EventSource`: this represents the value we'll set in `Falco` rules for mapping, in our case, all rules we'll set will have `source: docker`

#### The functions

##### `main()`

The `main()` function is mandatory for any `go` program, but because we'll build the `plugin` as a library for the *Falco plugin framework* which is written in `C`, we can let it empty.

```go
// main is mandatory but empty, because the plugin will be used as C library by Falco plugin framework
func main() {}
```

##### `init()`

The `init()` function is used for registering our plugin to the *Falco plugin framework*, as a [`source`](https://falco.org/docs/plugins/#source-plugin) and an [`extractor`](https://falco.org/docs/plugins/#extractor-plugin). We also use it to set the info of the plugin:

```go
func init() {
	plugins.SetFactory(func() plugins.Plugin {
		p := &docker.Plugin{}
		p.SetInfo(
			ID,
			Name,
			Description,
			Contact,
			Version,
			EventSource,
		)
		extractor.Register(p)
		source.Register(p)
		return p
	})
}
```

The `init()` contains also some specific functions and methods:
* `plugins.SetFactory()` is a method to register our plugin to the framework
* `SetInfo()` is a method to set the details of our plugin before it's registered to the *Falco plugin framework*
* `source.Register()` allows to declare our plugin as a source to the framework, ie, a plugin to collect events from a source
* `extractor.Register()` allows to declare our plugin as an extractor to the framework, ie, a plugin to extract fields from an event

### pkg/docker.go

The module used by our `main.go`, it can also be imported by other plugins, expecially when it's an [extractor](https://falco.org/docs/plugins/#field-extraction-capability).

```go
package docker

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"

	"github.com/alecthomas/jsonschema"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/source"

	dockerTypes "github.com/docker/docker/api/types"
	dockerEvents "github.com/docker/docker/api/types/events"
	docker "github.com/moby/docker/client"
)

var (
	ID          uint32
	Name        string
	Description string
	Contact     string
	Version     string
	EventSource string
)

type PluginConfig struct {
	FlushInterval uint64 `json:"flushInterval" jsonschema:"description=Flush Interval in ms (Default: 30)"`
}

// Plugin represents our plugin
type Plugin struct {
	plugins.BasePlugin
	Config                 PluginConfig
	lastDockerEventMessage dockerEvents.Message
	lastDockerEventNum     uint64
}

// setDefault is used to set default values before mapping with InitSchema()
func (p *PluginConfig) setDefault() {
	p.FlushInterval = 30
}

// SetInfo is used to set the Info of the plugin
func (p *Plugin) SetInfo(id uint32, name, description, contact, version, eventSource string) {
	ID = id
	Name = name
	Contact = contact
	Version = version
	EventSource = eventSource
}

// Info displays information of the plugin to Falco plugin framework
func (p *Plugin) Info() *plugins.Info {
	return &plugins.Info{
		ID:          ID,
		Name:        Name,
		Description: Description,
		Contact:     Contact,
		Version:     Version,
		EventSource: EventSource,
	}
}

// InitSchema map the configuration values with Plugin structure through JSONSchema tags
func (p *Plugin) InitSchema() *sdk.SchemaInfo {
	reflector := jsonschema.Reflector{
		RequiredFromJSONSchemaTags: true, // all properties are optional by default
		AllowAdditionalProperties:  true, // unrecognized properties don't cause a parsing failures
	}
	if schema, err := reflector.Reflect(&PluginConfig{}).MarshalJSON(); err == nil {
		return &sdk.SchemaInfo{
			Schema: string(schema),
		}
	}
	return nil
}

// Init is called by the Falco plugin framework as first entry,
// we use it for setting default configuration values and mapping
// values from `init_config` (json format for this plugin)
func (p *Plugin) Init(config string) error {
	p.Config.setDefault()
	return json.Unmarshal([]byte(config), &p.Config)
}

// Fields exposes to Falco plugin framework all availables fields for this plugin
func (p *Plugin) Fields() []sdk.FieldEntry {
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
func (p *Plugin) Extract(req sdk.ExtractRequest, evt sdk.EventReader) error {
	msg := p.lastDockerEventMessage

	// For avoiding to Unmarshal the same message for each field to extract
	// we store it with its EventNum. When it's a new event with a new message, we
	// update the Plugin struct.
	if evt.EventNum() != p.lastDockerEventNum {
		rawData, err := ioutil.ReadAll(evt.Reader())
		if err != nil {
			fmt.Println(err.Error())
			return err
		}

		err = json.Unmarshal(rawData, &msg)
		if err != nil {
			return err
		}

		p.lastDockerEventMessage = msg
		p.lastDockerEventNum = evt.EventNum()
	}

	switch req.Field() {
	case "docker.status":
		req.SetValue(msg.Status)
	case "docker.id":
		req.SetValue(msg.ID)
	case "docker.from":
		req.SetValue(msg.From)
	case "docker.type":
		req.SetValue(msg.Type)
	case "docker.action":
		req.SetValue(msg.Action)
	case "docker.scope":
		req.SetValue(msg.Scope)
	case "docker.actor.id":
		req.SetValue(msg.Actor.ID)
	case "docker.stack.namespace":
		req.SetValue(msg.Actor.Attributes["com.docker.stack.namespace"])
	case "docker.swarm.task":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.task"])
	case "docker.swarm.taskid":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.task.id"])
	case "docker.swarm.taskname":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.task.name"])
	case "docker.swarm.servicename":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.service.name"])
	case "docker.node.id":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.node.id"])
	case "docker.node.statenew":
		req.SetValue(msg.Actor.Attributes["state.new"])
	case "docker.node.stateold":
		req.SetValue(msg.Actor.Attributes["state.old"])
	case "docker.attributes.container":
		req.SetValue(msg.Actor.Attributes["container"])
	case "docker.attributes.image":
		req.SetValue(msg.Actor.Attributes["image"])
	case "docker.attributes.name":
		req.SetValue(msg.Actor.Attributes["name"])
	case "docker.attributes.type":
		req.SetValue(msg.Actor.Attributes["type"])
	default:
		return fmt.Errorf("no known field: %s", req.Field())
	}

	return nil
}

// Open is called by Falco plugin framework for opening a stream of events, we call that an instance
func (Plugin *Plugin) Open(params string) (source.Instance, error) {
	dclient, err := docker.NewClientWithOpts()
	if err != nil {
		return nil, err
	}

	eventC := make(chan source.PushEvent)
	ctx, cancel := context.WithCancel(context.Background())
	// launch an async worker that listens for Docker events and pushes them
	// to the event channel
	go func() {
		defer close(eventC)
		msgC, errC := dclient.Events(ctx, dockerTypes.EventsOptions{})
		var msg dockerEvents.Message
		var err error
		for {
			select {
			case msg = <-msgC:
				bytes, err := json.Marshal(msg)
				if err != nil {
					eventC <- source.PushEvent{Err: err}
					// errors are blocking, so we can stop here
					return
				}
				eventC <- source.PushEvent{Data: bytes}
			case err = <-errC:
				if err == io.EOF {
					// map EOF to sdk.ErrEOF, which is recognized by the Go SDK
					err = sdk.ErrEOF
				}
				eventC <- source.PushEvent{Err: err}
				// errors are blocking, so we can stop here
				return
			}
		}
	}()
	return source.NewPushInstance(eventC, source.WithInstanceClose(cancel))
}

// String represents the raw value of on event
// (not currently used by Falco plugin framework, only there for future usage)
func (Plugin *Plugin) String(in io.ReadSeeker) (string, error) {
	evtBytes, err := ioutil.ReadAll(in)
	if err != nil {
		return "", err
	}
	evtStr := string(evtBytes)
	return fmt.Sprintf("%v", evtStr), nil
}
```

#### The imports

Despite basic Go modules, we'll have to import the different modules from `plugin-sdk-go` and from `Docker SDK` to docker events:

```go
import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"

	"github.com/alecthomas/jsonschema"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/source"

	dockerTypes "github.com/docker/docker/api/types"
	dockerEvents "github.com/docker/docker/api/types/events"
	docker "github.com/moby/docker/client"
)
```

#### The global variables

Global variables are declared and filled with the `SetInfo()` method called by the `init()` of the `main.go`. These variables are then used to declare the details of the plugin to Falco:

```go
var (
	ID          uint32
	Name        string
	Description string
	Contact     string
	Version     string
	EventSource string
)
```

#### The structures

The structure to declare the plugin is mandatory and must respect the `interface` declared in the SDK:

```go
type PluginConfig struct {
	FlushInterval uint64 `json:"flushInterval" jsonschema:"description=Flush Interval in ms (Default: 30)"`
}

// Plugin represents our plugin
type Plugin struct {
	plugins.BasePlugin
	Config                 PluginConfig
	lastDockerEventMessage dockerEvents.Message
	lastDockerEventNum     uint64
}
```

`Plugin` represents our plugin that will be loaded by the framework. It contains some fields: 
* `plugins.BasePlugin`: allows to respect the [`Plugin interface`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go@v0.1.0/pkg/sdk/plugins#Plugin) of the SDK
* `Config`: contains the configuration of our plugin, represented by the `PluginConfig` structure
* `lastDockerEventMessage`: contains the result of the last unmarshalled event
* `lastDockerEventNum`: contains the number of the unmarshalled event, by comparing it, we avoid to unmarshal the same event several times

`PluginConfig` represents the configuration of our plugin, we'll use the module `alecthomas/jsonschema` to map the content of `init_config` from the plugin section of `falco.yaml` and check its validity:

```yaml
plugins:
  - name: docker
    library_path: /etc/falco/audit/libdocker.so
    init_config: '{"flushinterval": 10}'
    open_params: ''
```

#### The functions and methods

##### `SetInfo()`

It's used to set the global variables which represent the details of our plugin, this method is called by the `init()` of the `main.go`:

```go
// SetInfo is used to set the Info of the plugin
func (p *Plugin) SetInfo(id uint32, name, description, contact, version, eventSource string) {
	ID = id
	Name = name
	Contact = contact
	Version = version
	EventSource = eventSource
}
```

##### `Info()`

This method is mandatory and all plugins must respect that. It allows the *Falco plugin framework* to have all intels about the plugin itself, we use the global variables and the `SetInfo()` method to set the values:

```go
// Info displays information of the plugin to Falco plugin framework
func (p *Plugin) Info() *plugins.Info {
	return &plugins.Info{
		ID:          ID,
		Name:        Name,
		Description: Description,
		Contact:     Contact,
		Version:     Version,
		EventSource: EventSource,
	}
}
```

##### `Init()`

This method (:warning: different from the function `init()`) will be the first one called by the *Falco plugin framework*, we use `setDefault()` to set the default values of the config. In our case, these default values are overridden by the values from `init_config:`.
 
```go
// Init is called by the Falco plugin framework as first entry,
// we use it for setting default configuration values and mapping
// values from `init_config` (json format for this plugin)
func (p *Plugin) Init(config string) error {
	p.Config.setDefault()
	return json.Unmarshal([]byte(config), &p.Config)
}
```

##### `InitSchema()`

`InitSchema()` and the `jsonschema` tags from the fields of `PluginConfig` struct are used to check the validity of the content of `init_config` from `falco.yaml`.

```go
// InitSchema map the configuration values with Plugin structure through JSONSchema tags
func (p *Plugin) InitSchema() *sdk.SchemaInfo {
	reflector := jsonschema.Reflector{
		RequiredFromJSONSchemaTags: true, // all properties are optional by default
		AllowAdditionalProperties:  true, // unrecognized properties don't cause a parsing failures
	}
	if schema, err := reflector.Reflect(&PluginConfig{}).MarshalJSON(); err == nil {
		return &sdk.SchemaInfo{
			Schema: string(schema),
		}
	}
	return nil
}
```

It uses a json schema reflector, see [jsonschema](https://github.com/invopop/jsonschema) for more details about how it works.

##### `Fields()`

This method declares to the *Falco plugin framework* all `fields` that will be available for the rules, with their names and their types.

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

##### `String()`

Even if this method is mandatory, it's not used by `Falco` for now but must be set up for future usage. It simply retrieves the events, it can be in JSON or any format as long it contains the whole content of the source event.

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

##### `Extract()`

This method is called by the *Falco plugin framework* for getting the values of `fields`:

```go
// Extract allows Falco plugin framework to get values for all available fields
func (p *Plugin) Extract(req sdk.ExtractRequest, evt sdk.EventReader) error {
	msg := p.lastDockerEventMessage

	// For avoiding to Unmarshal the same message for each field to extract
	// we store it with its EventNum. When it's a new event with a new message, we
	// update the Plugin struct.
	if evt.EventNum() != p.lastDockerEventNum {
		rawData, err := ioutil.ReadAll(evt.Reader())
		if err != nil {
			fmt.Println(err.Error())
			return err
		}

		err = json.Unmarshal(rawData, &msg)
		if err != nil {
			return err
		}

		p.lastDockerEventMessage = msg
		p.lastDockerEventNum = evt.EventNum()
	}

	switch req.Field() {
	case "docker.status":
		req.SetValue(msg.Status)
	case "docker.id":
		req.SetValue(msg.ID)
	case "docker.from":
		req.SetValue(msg.From)
	case "docker.type":
		req.SetValue(msg.Type)
	case "docker.action":
		req.SetValue(msg.Action)
	case "docker.scope":
		req.SetValue(msg.Scope)
	case "docker.actor.id":
		req.SetValue(msg.Actor.ID)
	case "docker.stack.namespace":
		req.SetValue(msg.Actor.Attributes["com.docker.stack.namespace"])
	case "docker.swarm.task":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.task"])
	case "docker.swarm.taskid":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.task.id"])
	case "docker.swarm.taskname":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.task.name"])
	case "docker.swarm.servicename":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.service.name"])
	case "docker.node.id":
		req.SetValue(msg.Actor.Attributes["com.docker.swarm.node.id"])
	case "docker.node.statenew":
		req.SetValue(msg.Actor.Attributes["state.new"])
	case "docker.node.stateold":
		req.SetValue(msg.Actor.Attributes["state.old"])
	case "docker.attributes.container":
		req.SetValue(msg.Actor.Attributes["container"])
	case "docker.attributes.image":
		req.SetValue(msg.Actor.Attributes["image"])
	case "docker.attributes.name":
		req.SetValue(msg.Actor.Attributes["name"])
	case "docker.attributes.type":
		req.SetValue(msg.Actor.Attributes["type"])
	default:
		return fmt.Errorf("no known field: %s", req.Field())
	}

	return nil
}
```

> :warning: try to not overlap the `fields` created by other plugins, for eg, in this example we can use `docker.` prefix because `Falco` libs use `container.` fields which are more generic, so we've not a conflict.

For this plugin, we use the modules provided by the `Docker SDK`, all retrieved events will be unmarshaled into the [`events.Message`](https://pkg.go.dev/github.com/docker/docker@v20.10.12+incompatible/api/types/events#Message) struct which simplifies the mapping and the extraction of fields.

To avoid to unmarshall for each field extraction the same message and impact the performances, we store the number (=~ID) and the result of the last unmarshalled message. When the number change, it means it's not the same event and we can unmarshall its message and store it with its number.

```go
	msg := p.lastDockerEventMessage

	// For avoiding to Unmarshal the same message for each field to extract
	// we store it with its EventNum. When it's a new event with a new message, we
	// update the Plugin struct.
	if evt.EventNum() != p.lastDockerEventNum {
		rawData, err := ioutil.ReadAll(evt.Reader())
		if err != nil {
			fmt.Println(err.Error())
			return err
		}

		err = json.Unmarshal(rawData, &msg)
		if err != nil {
			return err
		}

		p.lastDockerEventMessage = msg
		p.lastDockerEventNum = evt.EventNum()
	}
```

##### `Open()`

This methods is used by the *Falco plugin framework* for opening a new `stream` of events, what is called an `instance` (`source.Instance`). The current implementation creates only one `instance` per plugin but it's possible in future that same `plugin` allows to open several streams, and so several `instances` at once.

To simplify the creation of this `source.Instance`, the Go SDK provides two easy functions, see the [docs](https://falco.org/docs/plugins/go-sdk-walkthrough/#best-practices-and-go-sdk-prebuilts-for-source-instances):
* `source.NewPullInstance`: for when the event source can be implemented sequentially and the time required to generate a sequence of event is deterministic, eg: periodic calls to an external API
* `souce.NewPushInstance`: for when the event source can be suspensive and there is no time guarantee reguarding when an event gets produced, eg: we wait a webhook from an external service

For collecting events from `docker`, we'll use `souce.NewPushInstance` as the `docker SDK` creates a channel and sends the events into when they happened.

```go
// Open is called by Falco plugin framework for opening a stream of events, we call that an instance
func (Plugin *Plugin) Open(params string) (source.Instance, error) {
	dclient, err := docker.NewClientWithOpts()
	if err != nil {
		return nil, err
	}

	eventC := make(chan source.PushEvent)
	ctx, cancel := context.WithCancel(context.Background())
	// launch an async worker that listens for Docker events and pushes them
	// to the event channel
	go func() {
		defer close(eventC)
		msgC, errC := dclient.Events(ctx, dockerTypes.EventsOptions{})
		var msg dockerEvents.Message
		var err error
		for {
			select {
			case msg = <-msgC:
				bytes, err := json.Marshal(msg)
				if err != nil {
					eventC <- source.PushEvent{Err: err}
					// errors are blocking, so we can stop here
					return
				}
				eventC <- source.PushEvent{Data: bytes}
			case err = <-errC:
				if err == io.EOF {
					// map EOF to sdk.ErrEOF, which is recognized by the Go SDK
					err = sdk.ErrEOF
				}
				eventC <- source.PushEvent{Err: err}
				// errors are blocking, so we can stop here
				return
			}
		}
	}()
	return source.NewPushInstance(eventC, source.WithInstanceClose(cancel))
}
```

We'll not describe with details the docker relative part, see the [documentation](https://pkg.go.dev/github.com/docker/docker/client) of the `Docker SDK` for more info. You just have to know it creates a channel to receive the events from the engine and we use same context than the whole plugin.

Here's the most important things to notice:

* `eventC := make(chan source.PushEvent)`: we create a channel, it will be used by the `instance` to listen incoming events, we'll push into it the events from the `docker client`
* `ctx, cancel := context.WithCancel(context.Background())`: we create a `context`, and more important, a `Done channel` for this context
* `eventC <- source.PushEvent{Data: bytes}`: this is how to push an event to the `instance`
* `return source.NewPushInstance(eventC, source.WithInstanceClose(cancel))`: the `Open()` method must return a `source.Instance`, and `source.NewPushInstance()` requires a channel where the events will pushed and may have optionnal settings, in our case, we pass also the `Done channel` of the `context` with the `source.WithInstanceClose()` function

Passing to the `instance` the same `Done channel` than the `docker client` uses, allows to correctly stop the plugin when we ask Falco to stop (CTRL+C or `systemctl stop falco`).

## The repository

You can find the complete plugin with all details in its [repository](https://github.com/Issif/docker-plugin). Feel free to create issues or PR.

# Build

The plugin is built as a `c-shared` library, it means a `.so`:
```shell
go build -buildmode=c-shared -o libdocker.so
```

If you use `make` from the repository:
```shell
make build
```

# Installation

The plugins are commonly installed in `/usr/share/falco/plugins`, just move the `libdocker.so` you built or run `make install`. 

# Configuration

Now we have our plugin, we must declare it to `Falco` in `falco.yaml`:

```yaml
plugins:
  - name: docker
    library_path: /usr/share/falco/plugins/libdocker.so
    init_config: '{"flushinterval": 1}'

load_plugins: [docker]

stdout_output:
  enabled: true
```

For more details about this configuration, the documentation is [here](https://falco.org/docs/plugins/#loading-plugins-in-falco).

# Rules

We create a simple rule, for checking that the `fields` and `source` work as expected:

```yaml
- rule: Container status changed
  desc: Container status changed
  condition: docker.status in (create,start,die)
  output: status=%docker.status from=%docker.from type=%docker.type action=%docker.action name=%docker.attributes.name 
  priority: DEBUG
  source: docker
  tags: [docker]
```

# Test and Results

Let's run `Falco` with our configuration and rules files:

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

# Sources

All files of this post can be found on [this repo](https://github.com/Issif/docker-plugin).

# To Go further

Once your plugin is done, you can share it with the community, by registrating it. The next post [Extend Falco inputs by creating a Plugin: Register the plugin]({{< ref "/blog/extend-falco-inputs-with-a-plugin-register" >}}) will guide you through the process.

# Conclusion

With this first post, you should have now all basics for creating your own plugin. The following posts will describe more advanced use-cases like collecting events from Cloud Services. Stay tuned :wink:.

---

You can find us in the [Falco community](https://github.com/falcosecurity/community). Please feel free to reach out to us for any questions, suggestions, or even for a friendly chat!

If you would like to find out more about Falco:

* Get started in [Falco.org](http://falco.org/)
* [Plugin Documentation](https://falco.org/docs/plugins/)
* [Plugin Developer Guide](https://falco.org/docs/plugins/developers-guide/)
* [Plugin registry](https://github.com/falcosecurity/plugins) 
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco)
* Get involved in the [Falco community](https://falco.org/community/)
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/messages/falco)
* Follow [@falco_org on Twitter](https://twitter.com/falco_org)