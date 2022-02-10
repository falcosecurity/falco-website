---
Title: "Extend Falco inputs by creating a Plugin: the basics"
Date: 2022-02-20
Author: Thomas Labarussias
slug: extend-falco-inputs-with-a-plugin-the-basics
---

> This post is the first of a serie about `How to develop Falco plugins`. It's adressed to anybody who would like to understand how plugins are written and want to contribute

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
- [Conclusion](#conclusion)

# What are Plugins?

Before starting, you should take look at these posts to know more about what Plugins are, what they can do and what concept are behind:
* [Falco Plugins Early Access](https://falco.org/blog/falco-plugins-early-access/)
* [Falco 0.31.0 a.k.a. "the Gyrfalcon"](https://falco.org/blog/falco-0-31-0/)
* [Announcing Plugins and Cloud Security with Falco](https://falco.org/blog/falco-announcing-plugins/)

# Developers Guide

This post has not for purpose to replace the official documentation, it's a step by step example to get you know minimal requirements for having a running plugin. For details, please read the [developers guide](https://deploy-preview-493--falcosecurity.netlify.app/docs/plugins/developers_guide).

# Our plugin

For this example, we'll create a plugin for [`docker events`](https://docs.docker.com/engine/reference/commandline/events/) from a locale `docker daemon`, this a basic example of an `event stream` with a basic format and without specific authentication.

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

For reducing the complixity to communicate with `docker daemon`, we'll use the official [`docker sdk`](https://pkg.go.dev/github.com/docker/docker).

## Requirements

For this post and following ones, we'll develop in `Go`, because it's the most common language for that purpose, a lot of member of the `Falco` Community and tools for `Falco` are already using it. We'll also use the [Go Plugin SDK](https://github.com/falcosecurity/plugin-sdk-go/) the maintainer provide for enhancing the experience with plugins.

The only requirements for this examples are:
* a `docker daemon` running in your locale system
* `falco 0.31` installed in your locale system
* `go` >= 1.17

## Pieces of code

### The imports

Despite basic `Go` modules, we'll have to import the different modules from [`plugin-sdk-go`](https://github.com/falcosecurity/plugin-sdk-go/pkg/sdk) and for retrieving `docker events`:

```go
import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/signal"
	"syscall"
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

In almost everybody plugins we'll write, these different component of `plugin-sdk-go` we'll be imported, they're really convenient and provide a much easier way to deal with `Falco plugin framework`.

### The structures

2 structures are mandatory and must respect `interfaces` of the `sdk`:

```go
// DockerPlugin represents our plugin
type DockerPlugin struct {
	plugins.BasePlugin
	FlushInterval uint64 `json:"flush_interval" jsonschema:"description=Flush Interval in seconds (Default: 2)"`
}

// DockerInstance represents a opened stream based on our Plugin
type DockerInstance struct {
	source.BaseInstance
}
```

* `DockerPlugin` represents our plugin that will be loaded by the framework. Embedding `plugins.BasePlugin` allows to respect the [`Plugin interface`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go@v0.1.0/pkg/sdk/plugins#Plugin) of the `sdk`
* `DockerInstance` represents a stream of events opened by the framework with the plugin. Embedding `source.BaseInstance` allows to respect the [`Instance interface`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go@v0.1.0/pkg/sdk/plugins/source#Instance) of the `sdk`.


For both `structs` we can extra attributes for any purpose we need, like for configuration. In this example we have `FlushInterval` which represents the frequency events will be sent to the `instance` by the `docker` client we'll create. This attribute will have a default value that can be overridden by `init_config` in `plugins` section, see []().

### The functions and methods

#### `main()`

The `main()` funcion is mandatoy as for any `go` program but because we'll build the `plugin` as a library for the `Falco plugin framework` which is written in `C`, we can let it empty.

```go
// main is mandatory but empty, because the plugin will be used as C library by Falco plugin framework
func main() {}
```

#### `init()`

The `init()` function is used for regestering our plugin to the `Falco plugin framework`, as a [`source`](https://falco.org/docs/plugins/#source-plugin) and and [`extractor`](https://falco.org/docs/plugins/#extractor-plugin).

```go
// init function is used for referencing our plugin to the Falco plugin framework
func init() {
	p := &DockerPlugin{}
	extractor.Register(p)
	source.Register(p)
}
```

#### `Info()`

This method is mandatory, all plugins must respect, it allows the `Falco plugin framework` to have all intels about the plugin itself:

```go
// Info displays information of the plugin to Falco plugin framework
func (dockerPlugin *DockerPlugin) Info() *plugins.Info {
	return &plugins.Info{
		ID:                 6,
		Name:               "docker",
		Description:        "Docker Events",
		Contact:            "github.com/falcosecurity/plugins/",
		Version:            "0.1.0",
		RequiredAPIVersion: "0.3.0",
		EventSource:        "docker",
	}
}
```

Here some details:
* `ID`: must be unique among all plugins, it's used by the framework in captures to know which `plugin` is the `source` of events. It's also important for avoiding collisions if you want to share your plugin in the [registry](https://github.com/falcosecurity/plugins). See [documentation](https://falco.org/docs/plugins/#plugin-event-ids) for more details.
* `Name`: the name of our plugin, will be used in `plugins` section of  `falco.yaml`
* `EventSource`: this represents the value we'll set in `Falco` rules for mapping, in our case, all rules we'll set will have `source: docker`

#### `Init()`

This method (:warning: different from the function `init()`) will be the first one called by the `Falco plugin framework`, we use it for setting default values for `DockerPlugin` attributes. In our case, these default values are overridden by the value of `init_config:` from `falco.yaml` config file, see []().
 
```go
// Init is called by the Falco plugin framework as first entry
// we use it for setting default configuration values and mapping
// values from `init_config` (json format for this plugin)
func (dockerPlugin *DockerPlugin) Init(config string) error {
	dockerPlugin.FlushInterval = 2
	json.Unmarshal([]byte(config), &dockerPlugin)
	return nil
}
```

The string argument `config` of the method is the content of `init_config`, we use JSON syntax in this example for leveraging the `Go` capacity to map JSON fields with a structure attribute with tags. A simple string may also work, as long your code parses it and set correctly the attributes.

#### `Fields()`

This method declares all to the `Falco plugin framework` all `fields` that will be available for the rules, with their names and their types.

```go
// Fields exposes to Falco plugin framework all availables fields for this plugin
func (dockerPlugin *DockerPlugin) Fields() []sdk.FieldEntry {
	return []sdk.FieldEntry{
		{Type: "string", Name: "docker.status", Desc: "Status"},
		{Type: "string", Name: "docker.id", Desc: "ID"},
		{Type: "string", Name: "docker.from", Desc: "From"},
		{Type: "string", Name: "docker.type", Desc: "Type"},
		{Type: "string", Name: "docker.action", Desc: "Action"},
		{Type: "string", Name: "docker.actor.id", Desc: "Actor ID"},
		{Type: "string", Name: "docker.attributes.container", Desc: "Attribute Container"},
		{Type: "string", Name: "docker.attributes.image", Desc: "Attribute Image"},
		{Type: "string", Name: "docker.attributes.name", Desc: "Attribute Name"},
		{Type: "string", Name: "docker.attributes.type", Desc: "Attribute Type"},
		{Type: "string", Name: "docker.attributes.exitcode", Desc: "Attribute Exit Code"},
		{Type: "string", Name: "docker.scope", Desc: "Scope"},
	}
}
```

#### `String()`

Even if this method is mandatorty, it's not used by `Falco` for now, for must be set up for future usages. It simply retrieve the events as string, it can be JSON or any format as long it contains the whole content of the source event.

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

This method is called by the `Falco plugin framework` for setting the values of `fields`:

```go
// Extracts allows Falco plugin framework to get values for all available fields
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

> :warning: try to not overlap the `fields` created by other plugins, for eg, in this example we can use `docker.` prefix because `Falco` libs use `container.` fields which are more generic, so we've not conflict.

For this plugin, we use the modules provided by `docker sdk`, all retrieved events will be Unmarshaled into the [`events.Message`](https://pkg.go.dev/github.com/docker/docker@v20.10.12+incompatible/api/types/events#Message) struct which simplifies the mapping.

#### `Open()`

This methods is used by the `Falco plugin framework` for opening a new `stream` of events, what is called an `instance`. The current implementation creates only one `instance` per plugin but it's possible in future that same `plugin` allows to open several streams, and so several `instances` at once.

```go
// Open is called by Falco plugin framework for opening a stream of events, we call that an instance
func (dockerPlugin *DockerPlugin) Open(params string) (source.Instance, error) {
	return &DockerInstance{}, nil
}
```

#### `NextBatch()`

The `Falco plugin framework` will call this method to get a batch of events collected by our `plugin`.

> :warning: this blog post concerns the creation of a plugin, we'll not describe the logic to get the events from the `docker daemon` with the `docker sdk`.

```go
// NextBatch is called by Falco plugin framework to get a batch of events from the instance
func (dockerInstance *DockerInstance) NextBatch(pState sdk.PluginState, evts sdk.EventWriters) (int, error) {
	dclient, err := docker.NewClientWithOpts()
	if err != nil {
		panic(err)
	}

	ctx := context.Background()
	defer ctx.Done()

	msg, _ := dclient.Events(ctx, dockerTypes.EventsOptions{})

	e := [][]byte{}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	dockerPlugin := pState.(*DockerPlugin)

L:
	for {
		expire := time.After(time.Duration(dockerPlugin.FlushInterval) * time.Second)
		select {
		case m := <-msg:
			s, _ := json.Marshal(m)
			e = append(e, s)
			if len(e) >= evts.Len() {
				break L
			}
		case <-expire:
			if len(e) != 0 {
				break L
			}
		case <-c:
			return 0, sdk.ErrEOF
		}
	}

	if len(e) == 0 {
		return 0, nil
	}

	for n, i := range e {
		evt := evts.Get(n)
		_, err := evt.Writer().Write(i)
		if err != nil {
			return 0, err
		}
	}

	return len(e), nil
}
```

* this methods returns the number of events in the batch and an error
* the **max size** for a batch is `evts.len()`
* the plugin configuration can be retrieved with `pState.(*DockerPlugin)`
* for each "slot" of the batch, we have to get it `evt := evts.Get(n)` and then set its value `evt.Writer().Write(i)`

## Complete plugin

```go
/*
Copyright (C) 2022 The Falco Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/extractor"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/source"

	dockerTypes "github.com/docker/docker/api/types"
	dockerEvents "github.com/docker/docker/api/types/events"
	docker "github.com/moby/docker/client"
)

// DockerPluginConfig represents the configuration of our plugin, we use json format in this example
type DockerPluginConfig struct {
	FlushInterval uint64 `json:"flush_interval" jsonschema:"description=Flush Interval in seconds (Default: 2)"`
}

// DockerPlugin represents our plugin
type DockerPlugin struct {
	plugins.BasePlugin
	config DockerPluginConfig
}

// DockerInstance represents a opened stream based on our Plugin
type DockerInstance struct {
	source.BaseInstance
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
		ID:                 6,
		Name:               "docker",
		Description:        "Docker Events",
		Contact:            "github.com/falcosecurity/plugins/",
		Version:            "0.1.0",
		RequiredAPIVersion: "0.3.0",
		EventSource:        "docker",
	}
}

// Init is called by the Falco plugin framework as first entry
// we use it for setting default configuration values and mapping
// values from `init_config` (json format for this plugin)
func (dockerPlugin *DockerPlugin) Init(config string) error {
	dockerPlugin.config.FlushInterval = 2
	json.Unmarshal([]byte(config), &dockerPlugin.config)
	return nil
}

// Fields exposes to Falco plugin framework all availables fields for this plugin
func (dockerPlugin *DockerPlugin) Fields() []sdk.FieldEntry {
	return []sdk.FieldEntry{
		{Type: "string", Name: "docker.status", Desc: "Status"},
		{Type: "string", Name: "docker.id", Desc: "ID"},
		{Type: "string", Name: "docker.from", Desc: "From"},
		{Type: "string", Name: "docker.type", Desc: "Type"},
		{Type: "string", Name: "docker.action", Desc: "Action"},
		{Type: "string", Name: "docker.actor.id", Desc: "Actor ID"},
		{Type: "string", Name: "docker.attributes.container", Desc: "Attribute Container"},
		{Type: "string", Name: "docker.attributes.image", Desc: "Attribute Image"},
		{Type: "string", Name: "docker.attributes.name", Desc: "Attribute Name"},
		{Type: "string", Name: "docker.attributes.type", Desc: "Attribute Type"},
		{Type: "string", Name: "docker.attributes.exitcode", Desc: "Attribute Exit Code"},
		{Type: "string", Name: "docker.scope", Desc: "Scope"},
	}
}

// Extracts allows Falco plugin framework to get values for all available fields
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
	return &DockerInstance{}, nil
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
	dclient, err := docker.NewClientWithOpts()
	if err != nil {
		panic(err)
	}

	ctx := context.Background()
	defer ctx.Done()

	msg, _ := dclient.Events(ctx, dockerTypes.EventsOptions{})

	e := [][]byte{}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	dockerPlugin := pState.(*DockerPlugin)

L:
	for {
		expire := time.After(time.Duration(dockerPlugin.config.FlushInterval) * time.Second)
		select {
		case m := <-msg:
			s, _ := json.Marshal(m)
			e = append(e, s)
			if len(e) >= evts.Len() {
				break L
			}
		case <-expire:
			if len(e) != 0 {
				break L
			}
		case <-c:
			return 0, sdk.ErrEOF
		}
	}

	if len(e) == 0 {
		return 0, nil
	}

	for n, i := range e {
		evt := evts.Get(n)
		_, err := evt.Writer().Write(i)
		if err != nil {
			return 0, err
		}
	}

	return len(e), nil
}

// main is mandatory but empty, because the plugin will be used as C library by Falco plugin framework
func main() {}
```

## Build

The plugin is built as `c-shared` library, to get a `.so`:
```shell
go build -buildmode=c-shared -o /etc/falco/docker/libdocker.so
```

# Configuration

Now we have our plugin, we must declare it to `Falco` in `falco.yaml`:

```yaml
plugins:
  - name: docker
    library_path: /etc/falco/docker/libdocker.so
    init_config: '{"flush_interval": 1}'

load_plugins: [docker]

stdout_output:
  enabled: true
```

For more details about this configuration, the documentation is [here](https://falco.org/docs/plugins/#loading-plugins-in-falco).

# Rules

We create a simple rule, for checking that `fields` and `source` work as expected:

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

# Conclusion

With this first post, you should have now all basics for creating your own plugin. The following posts will describe more advanced use-cases with events from Cloud Services. Stay tuned :wink:.

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
