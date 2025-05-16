---
title: Falco Plugins Go SDK Walkthrough
linktitle: Go SDK Walkthrough
description: High-level documentation of the Go SDK
weight: 30
aliases:
- ../../plugins/go-sdk-walkthrough
---

## Introduction

The [Go SDK](https://github.com/falcosecurity/plugin-sdk-go) provides prebuilt constructs and definitions that help developing plugins by abstracting all the complexities related to the bridging between the C and the Go runtimes. The Go SDK takes care of satisfying all the plugin framework requirements without having to deal with the low-level details, by also optimizing the most critical code paths.

The SDK allows developers to choose either from a low-level set of abstractions, or from a more high-level set of packages designed for simplicity and ease of use. The best way to approach the Go SDK is to start by importing a few high-level packages, which is enough to satisfy the majority of use cases.

This section documents the Go SDK at a high-level, please refer to the [official Go SDK documentation](https://github.com/falcosecurity/plugin-sdk-go) for deeper details.

### Architecture of the Go SDK

Since Falcosecurity plugins run in a C runtime, the Go SDK has been designed to abstract most of the complexity related to writing C-compliant code acceptable by the plugin framework, so that developers can focus on writing Go code only. 

![plugin_sdk_go_architecture](/docs/images/plugin_sdk_go_architecture.png)

At a high level, the SDK is on top of three fundamental packages with different levels of abstractions:

1. Package `sdk` is a container for all the basic types, definitions, and helpers that are reused across all the SDK parts. 

2. Package `sdk/symbols` contains prebuilt implementations for all the C symbols that plugins must export to be accepted by the framework. The prebuilt C symbols are divided in many subpackages, so that each of them can be imported individually to opt-in/opt-out each symbol. 

3. Package `sdk/plugins` provide high-level definition and base types for implementing plugin capabilities. This uses `sdk/symbols` internally and takes care of importing all the prebuilt C symbols required each plugin capability respectively. This is the main entrypoint for developers to write plugins in Go.

Two additional packages `ptr` and `cgo` are used internally to simplify and optimize the state management and the usage of C-allocated memory pointers.

For some use cases, developers can consider using the SDK layers selectively. This is meaningful only if developers wish to manually write part of the low-level C details of the framework in their plugins, but still want to use some parts of the SDK. However, this is discouraged if not for advanced use cases only. Developers are encouraged to use the `sdk/plugins` to build Falcosecurity plugins, which is easier to use and will have less frequent breaking changes.

Further details can be found in the documentation of each package: [`sdk`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go/pkg/sdk), [`sdk/symbols`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go/pkg/sdk/symbols), and [`sdk/plugins`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins).

### Getting Started

The SDK is built on top of a set of minimal composable interfaces describing the behavior of plugins and plugin instances. As such, developing plugins is as easy as defining a struct type representing the plugin itself, ensuring that the mandatory interface methods are defined on it, and then registering it to the SDK.

To use the Go SDK, all you need to import are the `sdk` and `sdk/plugins` packages. The first contains all the core types and definitions used across the rest of the SDK packages, whereas the latter contains built-in constructs to develop plugins. The subpackages `sdk/plugins/source` and `sdk/plugins/extractor` contain specialized definitions for the event sourcing and the field extraction capabilities respectively.

The `dummy` plugin, documented in the [next sections](#example-go-plugin-dummy), is a simple example that helps understand how to start writing Go plugins with this SDK. The SDK also provides a set of [base examples](https://github.com/falcosecurity/plugin-sdk-go/tree/main/examples) to get you started with plugin development.

### Defining a Plugin with Field Extraction Capability

In the Go SDK, a plugin with field extraction capability is a type implementing the following interface:
```go
// sdk/plugins/extractor
type Plugin interface {
	...
	Info() *sdk.Info
	Init(config string) error
	Fields() []sdk.FieldEntry
	Extract(req sdk.ExtractRequest, evt sdk.EventReader) error
}
```

`Info()` returns all the info about the plugin. The returned `plugins.Info` struct should be filled in by the plugin author and contains fields such as the plugin ID, name, description, etc.

`Init()` method is called to initialize a plugin when the framework allocates it. A user-defined configuration string is passed by the framework. This is where the plugin can initialize its internal state and acquire all the resources it needs.

`Fields()` returns an array of `sdk.FieldEntry` representing all the fields supported by a plugin for extraction. The order of the fields is relevant, as their index is used as an identifier during extraction.

`Extract()` extracts the value of one of the supported fields from a given event passed in by the framework. The `sdk.ExtractRequest` argument should be used to set the extracted value.

#### Optional Interfaces

```go
type Destroyer interface {
	Destroy()
}

type InitSchema interface {
	InitSchema() *SchemaInfo
}
```

Plugins with field extraction capability can optionally implement the `sdk.Destroyer` interface. In that case, `Destroy()` will be called when the plugin gets destroyed and can be used to release any allocated resource. they can also also optionally implement the `sdk.InitSchema` interface. In that case, `InitSchema()` will be used to to return a schema describing the data expected to be passed as a configuration during the plugin initialization. This follows the semantics documented for [`get_init_schema`](/docs/reference/plugins/plugin-api-reference/#get-init-schema). Currently, the schema must follow the [JSON Schema specific](https://json-schema.org/), which in Go can also be easily auto-generated with external packages (e.g. [alecthomas/jsonschema](https:/github.com/alecthomas/jsonschema)).

### Defining a Plugin with Event Sourcing Capability

In the Go SDK, a plugin with event sourcing capability must specify two types, one of the plugin itself and one for the plugin instances, implementing the following interfaces respectively:

```go
// sdk/plugins/source
type Plugin interface {
	...
	Info() *sdk.Info
	Init(config string) error
	Open(params string) (Instance, error)
}

// sdk/plugins/source
type Instance interface {
	...
	NextBatch(pState PluginState, evts EventWriters) (int, error)
}
```
The `source.Plugin` interface has many functions in common with `extractor.Plugin`. 

`Open()` creates a new plugin instance to open a new stream of events. The framework provides the user-defined open parameters to customize the event source. The return value must implement the `source.Instance` interface, and its lifecycle ends when the event stream is closed.

The `source.Instance` interface represents plugin instances for an opened event stream, and has one mandatory method and a few optional ones.

`NextBatch` creates a new batch of events to be pushed in the event stream. The SDK provides a pre-allocated batch to write events into, in order to manage the used memory optimally.

#### Optional Interfaces

```go
type Destroyer interface {
	Destroy()
}

type Closer interface {
	Close()
}

type InitSchema interface {
	InitSchema() *SchemaInfo
}

type OpenParams interface {
	OpenParams() ([]OpenParam, error)
}

type Progresser interface {
	Progress(pState sdk.PluginState) (float64, string)
}

type Stringer interface {
	String(evt sdk.EventReader) (string, error)
}
```

Plugins with event sourcing capabilities can optionally implement the `sdk.Destroyer` and `sdk.InitSchema` interfaces, just like mentioned in the section above.

Additionally, they can also implement the `sdk.OpenParams` interface. If requested by the application, the framework may call `OpenParams()` before opening the event stream to obtains some suggested values that would valid parameters for `Open()`. For more details, see the documentation of [`list_open_params`](/docs/reference/plugins/plugin-api-reference/#list-open-params).

Plugin instances can optionally implement the `sdk.Closer`, `sdk.Progresser`, and `sdk.Stringer` interfaces. If `sdk.Closer` is implemented, the `Close()` method is called while closing the event stream and can be used to release the resources used by the plugin instance. If `sdk.Progresser` is implemented, the `Progress()` method is called by the SDK when the framework requests progress data about the event stream of the plugin instance. `Progress()` must return a `float64` with a value between 0 and 1 representing the current progress percentage, and a string representation of the same progress value. If `sdk.Stringer` is implemented, the `String()` method must return a string representation of an event created by the plugin, which is used by the framework as an extraction value of the `evt.plugininfo` field. The string representation should be on a single line and contain important information about the event.

#### Best Practices and Go SDK Prebuilts for Source Instances

Although the Go SDK gives developers high control and flexibility, in the general case implementing the `sdk.NextBatcher` interface is not trivial. Custom definitions of `source.Instance` require developers to be mindful of the following while implementing the `NextBatch()` function:

- It should return as fast as possible and should try to fill-up event batch up to its maximum capacity
- Listen for a timeout of few milliseconds and return the batch in its current state once the timeout is expired
- Conceive the case in which `Close()` is called before `NextBatch()` has returned. This can potentially happen if the plugin framework receives signals such as SIGINT or SIGTERM
- Minimize the number of memory allocations
- Keep returning `sdk.ErrEOF` after returning it the first time

Considering the above, the SDK provides prebuilt implementations of `source.Instance` that satisfy a broad range of use cases, so that developers need to define their own type only if they have advanced or custom requirements.

```go
// sdk/plugins/source

func NewPullInstance(pull source.PullFunc, options ...func(*<unexported-type>)) (source.Instance, error)

func NewPushInstance(evtC <-chan source.PushEvent, options ...func(*<unexported-type>)) (source.Instance, error)
```

`source.NewPullInstance` and `source.NewPushInstance` are two constructors for SDK-provided `source.Instance` implementations that cover the following use cases:

- **Pull Model**: for when the event source can be implemented sequentially and the time required to generate a sequence of event is deterministic. This is implemented with a functional design, where the passed-in callback is expected to be non-suspensive and to return quickly
- **Push Model**: for when the event source can be suspensive and there is no time guarantee reguarding when an event gets produced. For instance, this applies for all event sources that generate events from webhook events. Given the event-driven nature of this use case, this is implemented by passing event data in the form of byte slices through a channel

The prebuilt `source.Instance`s can be configured in the function constructors by using the Go *options pattern*. The SDK provides options for configuring and overriding all the default values:

```go
// sdk/plugins/source

func WithInstanceContext(ctx context.Context) func(*<unexported-type>)

func WithInstanceTimeout(timeout time.Duration) func(*<unexported-type>)

func WithInstanceClose(close func()) func(*<unexported-type>)

func WithInstanceBatchSize(size uint32) func(*<unexported-type>)

func WithInstanceEventSize(size uint32) func(*<unexported-type>)

func WithInstanceProgress(progress func() (float64, string)) func(*<unexported-type>)
```

Here's an example of how the *Pull Model* prebuilt can be used to implement an event source:

```go
func (m *MyPlugin) Open(params string) (source.Instance, error) {
	counter := uint64(0)
	pull := func(ctx context.Context, evt sdk.EventWriter) error {
		counter++
		if err := gob.NewEncoder(evt.Writer()).Encode(counter); err != nil {
			return err
		}
		evt.SetTimestamp(uint64(time.Now().UnixNano()))
		return nil
	}
	return source.NewPullInstance(pull)
}
```

### Registering a Plugin in the SDK

After defining proper types for the plugin, the only thing remaining is to register it in the SDK so that it can be used in the plugin framework.
```go
// sdk/plugins
type FactoryFunc func() plugins.Plugin

// sdk/plugins
func SetFactory(plugins.FactoryFunc)

// sdk/plugins/extractor
func Register(extractor.Plugin)

// sdk/plugins/source
func Register(source.Plugin)
```

The newly created plugin type need to be registered to the SDK in a Go `init` function and through the `plugins.SetFactory()` function. `plugins.FactoryFunc` is a function type that is used by the SDK to create plugins when requested by the plugin framework. Then, the `source.Register()` and `extractor.Register()` functions should be invoked inside the body of `plugins.FactoryFunc` functions to implement the event sourcing and the field extraction capabilities respectively.

The defined plugin types are expected to implement a given set of methods. Compilation will fail at the `Register()` functions if any of the required methods is not defined. Developers are encouraged to compose their structs with `plugins.BasePlugin`, and `source.BaseInstance`, which provide prebuilt boilerplate for many of those methods. In this way, developers just need to focus on implementing the few plugin-specific methods remaining.

Besides the interface requirements, the defined types can contain arbitrary fields and methods. State variable that must be maintained during the plugin lifecycle (or in the lifecycle of an opened event stream) must be contained in the defined types. In this way, the SDK can guarantee that the state variables are not disposed by the garbage collector.

### Interacting with Events

Generating new events, and extracting field values from them, are the hottest path in the plugin framework and can happen at a very high rate. For this reason, the Go SDK optimizes the memory usage as much as possible, avoiding reallocations and copies wherever possible. Internally, this sometimes means reading and writing on C-allocated memory from Go code directly, which is efficient but also very unsafe and can lead to unstable code.

As such, the SDK provides the two `sdk.EventReader` and `sdk.EventWriter` interfaces, which enable developers to safely read and write from events while still fully leveraging the underlying memory optimizations. `sdk.EventReader` gives a read-only view of an event, with accessor methods for all the internal fields, and `sdk.EventWriter` does the same in read-only mode. 

```go
type EventReader interface {
	EventNum() uint64
	Timestamp() uint64
	Reader() io.ReadSeeker
}

type EventWriter interface {
	SetTimestamp(value uint64)
	Writer() io.Writer
}
```

Event data can either be read or written through the standard `io.SeekReader` and `io.Writer` interfaces, returned by the `Reader()` and `Writer()` methods respectively. The SDK hides behind these interfaces all the safety and optimization mechanisms.

For plugins with event sourcing capability, a reusable batch of `sdk.EventWriter`s is automatically allocated in each plugin source instance after the `Open()` method returns. This slab-allocator creates reusable event data by using the default `sdk.DefaultBatchSize` and `sdk.DefaultEvtSize` constants. Developers can override the automatic allocation to define batches of arbitrary sizes in the `Open()` method, by calling the `SetEvents()` method on the newly opened plugin instance before returning it. The reusable event batch can be created with the `sdk.NewEventWriters` function, that takes the event data size and batch size as arguments.

```go
func NewEventWriters(size, dataSize int64) (EventWriters, error)
```

Note that the size of the reusable event batch defines the maximum size of each event batch created by the plugin in `NextBatch`.

### Compiling Plugins

After successfully writing a plugin, all you need is to compile it. Go allows compiling binaries as a C-compliant shared library with the `-buildmode=c-shared` flag. The build command will be something looking like:
```
go build -buildmode=c-shared -o <outname>.so *.go
```
The SDK takes care of generating all the required C exported functions that the plugin framework needs to load the plugin. Once built, your plugin is ready to be used in the Falcosecurity plugin system.

## Example Go Plugin: `dummy`

This section walks through the implementation of the `dummy`. This plugin returns events that are just a number value that increases with each event generated. Each increase is 1 plus a random "jitter" value that ranges from [0:jitter]. The jitter value is provided as configuration to the plugin in `plugin_init`. The starting value and the maximum number of events are provided as open parameters to the plugin in `plugin_open`.

This will show how the above API functions are actually used in a functional plugin. The source code for this plugin can be found at [dummy.go](https://github.com/falcosecurity/plugins/blob/master/plugins/dummy/plugin/dummy.go).

### Initial Imports

```go
package main

import (
	...

	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/extractor"
	"github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins/source"
)
```

Importing the `sdk` and `sdk/plugins` packages is the first step for developing a Falcosecurity plugin in Go. The `sdk` package contains all the core types and definitions used across the other packages of the SDK. The `sdk/plugins` package contains prebuilt constructs for defining new plugins.

The `sdk/plugins/source` and `sdk/plugins/extractor` packages are required to register the event sourcing and field extraction capabilities. `dummy` implements both of them.

The Go module `falcosecurity/plugin-sdk-go` has its own [documentation](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go), which gives deeper insights about the internal architecture of the SDK.

### Defining the Plugin

In the Go SDK, plugins are defined by a set of composable tiny interfaces. To define a new plugin, the first step is to define a new `struct` type representing the plugin itself, and then register it to the SDK. Plugins with event sourcing capability, like `dummy`, must define an additional type representing the opened instance of the plugin event stream.

```go
type PluginConfig struct {
	// This reflects potential internal state for the plugin. In
	// this case, the plugin is configured with a jitter.
	Jitter uint64 `json:"jitter" jsonschema:"description=A random amount added to the sample of each event (Default: 10)"`
}

type Plugin struct {
	plugins.BasePlugin
	// Will be used to randomize samples
	rand *rand.Rand
	// Contains the init configuration values
	config PluginConfig
}

type PluginInstance struct {
	source.BaseInstance
	// Copy of the init params from plugin_open()
	initParams string
	// The number of events to return before EOF
	maxEvents uint64
	// A count of events returned. Used to count against maxEvents.
	counter uint64
	// A semi-random numeric value, derived from this value and
	// jitter. This is put in every event as the data property.
	sample uint64
}

func init() {
	plugins.SetFactory(func() plugins.Plugin {
		p := &Plugin{}
		source.Register(p)
		extractor.Register(p)
		return p
	})
}
```

### Plugin Info

An `Info()` method is needed to return a data struct containing all the plugin info. `Info()` is a required method for the defined plugin struct type. This plugin defined its info as a set of constants for simplicity, but it's not a requirement.

```go
const (
	PluginID          uint32 = 3
	PluginName               = "dummy"
	PluginDescription        = "Reference plugin for educational purposes"
	PluginContact            = "github.com/falcosecurity/plugins"
	PluginVersion            = "0.4.0"
	PluginEventSource        = "dummy"
)

...

func (m *Plugin) Info() *plugins.Info {
	return &plugins.Info{
		ID:                 PluginID,
		Name:               PluginName,
		Description:        PluginDescription,
		Contact:            PluginContact,
		Version:            PluginVersion,
		RequiredAPIVersion: PluginRequiredApiVersion,
		EventSource:        PluginEventSource,
	}
}

...
```

### Initializing/Destroying the Plugin

The mandatory `Init()` method serves as an initialization entrypoint for plugins. This is where the user-defined configuration string is passed in by the framework. The internal state of the plugin should be initialized at this level. An error can be returned to abort the plugin initialization.

Defining the `Destroy()` method is optional but can be useful if some resource needs to be released before the plugin gets destroyed. The `InitSchema()` method is optional too, but it allows the framework to parse the init config automatically, thus avoiding the need of doing it manually inside `Init()`.

```go
// Set the config default values.
func (p *PluginConfig) setDefault() {
	p.Jitter = 10
}

// This returns a schema representing the configuration expected by the
// plugin to be passed to the Init() method. Defining InitSchema() allows
// the framework to automatically validate the configuration, so that the
// plugin can assume that it to be always be well-formed when passed to Init().
func (p *Plugin) InitSchema() *sdk.SchemaInfo {
	// We leverage the jsonschema package to autogenerate the
	// JSON Schema definition using reflection from our config struct.
	reflector := jsonschema.Reflector{
		// all properties are optional by default
		RequiredFromJSONSchemaTags: true,
		// unrecognized properties don't cause a parsing failures
		AllowAdditionalProperties:  true,
	}
	if schema, err := reflector.Reflect(&PluginConfig{}).MarshalJSON(); err == nil {
		return &sdk.SchemaInfo{
			Schema: string(schema),
		}
	}
	return nil
}

// Since this plugin defines the InitSchema() method, we can assume
// that the configuration is pre-validated by the framework and
// always well-formed according to the provided schema.
func (m *Plugin) Init(cfg string) error {
	// initialize state
	m.rand = rand.New(rand.NewSource(time.Now().UnixNano()))
	// The format of cfg is a json object with a single param
	// "jitter", e.g. {"jitter": 10}
	// Empty configs are allowed, in which case the default is used.
	// Since we provide a schema through InitSchema(), the framework
	// guarantees that the config is always well-formed json.
	m.config.setDefault()
	json.Unmarshal([]byte(cfg), &m.config)
	return nil
}

func (m *Plugin) Destroy() {
	// nothing to do here
}
```

### Opening/Closing a Stream of Events

A plugin instance is created when the plugin event stream is opened, which can happen more than once during the plugin lifecycle. Plugins with event sourcing capability are required to define an `Open()` method that creates a returns a new plugin instance. This is where the framework passes in the user-defined open parameters string.

The plugin instance type returned by `Open()` can define an optional `Close()` method bundling any additional deinitialization logic to run while closing the event stream.

```go
func (m *Plugin) Open(prms string) (source.Instance, error) {
	// The format of params is a json object with two params:
	// - "start", which denotes the initial value of sample
	// - "maxEvents": which denotes the number of events to return before EOF.
	// Example:
	// {"start": 1, "maxEvents": 1000}
	var obj map[string]uint64
	err := json.Unmarshal([]byte(prms), &obj)
	if err != nil {
		return nil, fmt.Errorf("params %s could not be parsed: %v", prms, err)
	}
	if _, ok := obj["start"]; !ok {
		return nil, fmt.Errorf("params %s did not contain start property", prms)
	}

	if _, ok := obj["maxEvents"]; !ok {
		return nil, fmt.Errorf("params %s did not contain maxEvents property", prms)
	}

	return &PluginInstance{
		initParams: prms,
		maxEvents:  obj["maxEvents"],
		counter:    0,
		sample:     obj["start"],
	}, nil
}

func (m *PluginInstance) Close() {
	// nothing to do here
}
```

### Returning new Events

New events are generated in batch by the `NextBatch` function. The function is mandatory for plugins with event sourcing capability and must be defined as a method of the plugin instance struct type. The `pState` argument is the plugin struct type initialized in `Init()`, passed in by the framework for ease of access. The plugin state is passed as an instance of the `sdk.PluginState` interface, so a manual cast is required to access the internal state variables defined in the struct type.

The `evts` parameter is a sdk-managed batch of events to be used for creating new events. For that, the SDK uses a slab allocator and reuses the same event batch at every iteration to improve performance. The length of the `evts` list represents the maximum size of each event batch.
Each element of the batch is an instance of `sdk.EventWriter` that provides handy methods to write the event info and data. Event data can be written with the Go `io.Writer` interface.

If an error is returned, the SDK returns a failure to the framework and invalidates the current batch. The special errors `sdk.ErrTimeout` and `sdk.ErrEOF` have a special meaning, and are used to either advise the framework that no new events are currently available, or that the event stream is terminated.

```go
func (m *PluginInstance) NextBatch(pState sdk.PluginState, evts sdk.EventWriters) (int, error) {
	// Return EOF if reached maxEvents
	if m.counter >= m.maxEvents {
		return 0, sdk.ErrEOF
	}

	// access the plugin state
	plugin := pState.(*Plugin)

	var n int
	var evt sdk.EventWriter
	for n = 0; m.counter < m.maxEvents && n < evts.Len(); n++ {
		evt = evts.Get(n)
		m.counter++

		// Increment sample by 1, also add a jitter of [0:jitter]
		m.sample += 1 + uint64(plugin.rand.Int63n(int64(plugin.config.Jitter+1)))

		// The representation of a dummy event is the sample as a string.
		str := strconv.Itoa(int(m.sample))

		// It is not mandatory to set the Timestamp of the event (it
		// would be filled in by the framework if set to uint_max),
		// but it's a good practice.
		evt.SetTimestamp(uint64(time.Now().UnixNano()))

		_, err := evt.Writer().Write([]byte(str))
		if err != nil {
			return 0, err
		}
	}
	return n, nil
}
```

### Printing Events As Strings

Plugins with event sourcing capability can optionally have a `String()` method to format the contents of events created with a previous call to `NextBatch()`. The event data is readable through an instance of `sdk.EventReader` provided by the SDK. Internally, this allows safe memory access and an optimal reusage of the same buffer to maximize the performance of hot framework paths.

```go
func (m *Plugin) String(evt sdk.EventReader) (string, error) {
	evtBytes, err := ioutil.ReadAll(evt.Reader())
	if err != nil {
		return "", err
	}
	evtStr := string(evtBytes)

	// The string representation of an event is a json object with the sample
	return fmt.Sprintf("{\"sample\": \"%s\"}", evtStr), nil
}
```

### Defining Fields

This dummy plugin has field extraction capability and exports 3 fields:

* `dummy.value`: the value in the event, as a uint64
* `dummy.strvalue`: the value in the event, as a string
* `dummy.divisible`: this field takes an argument and returns 1 if the value in the event is divisible by the argument (a numeric divisor). For example, if the value was 12, `dummy.divisible[3]` would return 1 for that event.

The `Fields()` method returns a slice of `sdk.FieldEntry` representing all the supported fields.

```go
func (m *Plugin) Fields() []sdk.FieldEntry {
	return []sdk.FieldEntry{
		{
			Type: "uint64",
			Name: "dummy.divisible",
			Desc: "Return 1 if the value is divisible by the provided divisor, 0 otherwise",
			Arg:  sdk.FieldEntryArg{IsRequired: true, IsKey: true},
		},
		{
			Type: "uint64",
			Name: "dummy.value",
			Desc: "The sample value in the event",
		},
		{
			Type: "string",
			Name: "dummy.strvalue",
			Desc: "The sample value in the event, as a string",
		},
	}
}
```

### Extracting Fields

The `Extract` method extracts all of the supported fields. The `req` parameter allows accessing all the info regarding the field request, such as the field id or name, and the optional user-passed argument. The `evt` parameter is an interface that helps reading the event info and data.

The extracted field value must be set through the `SetValue` method of `sdk.ExtractRequest`. Returning from `Extract` without calling `SetValue` will signal the SDK that the requested field is not present in the given event.

```go
func (m *Plugin) Extract(req sdk.ExtractRequest, evt sdk.EventReader) error {
	evtBytes, err := ioutil.ReadAll(evt.Reader())
	if err != nil {
		return err
	}
	evtStr := string(evtBytes)
	evtVal, err := strconv.Atoi(evtStr)
	if err != nil {
		return err
	}
	switch req.FieldID() {
	case 0: // dummy.divisible
		divisor, err := strconv.Atoi(req.ArgKey())
		if err != nil {
			return fmt.Errorf("argument to dummy.divisible %s could not be converted to number", req.ArgKey())
		}
		if evtVal%divisor == 0 {
			req.SetValue(uint64(1))
		} else {
			req.SetValue(uint64(0))
		}
	case 1: // dummy.value
		req.SetValue(uint64(evtVal))
	case 2: // dummy.strvalue
		req.SetValue(evtStr)
	default:
		return fmt.Errorf("no known field: %s", req.Field())
	}
	return nil
}
```

### Running the Plugin

This plugin can be configured in Falco by adding the following to `falco.yaml` file:

```yaml
plugins:
  - name: dummy
    library_path: /tmp/my-plugins/dummy/libdummy.so
    init_config:
      jitter: 10
    open_params: '{"start": 1, "maxEvents": 20}'

## Optional
load_plugins: [dummy]
```

This simple rule prints a Falco alert any time the event number is between 0 and 10, and the sample value is divisible by 3:

```yaml
- rule: My Dummy Rule
  desc: My Desc
  condition: evt.num > 0 and evt.num < 10 and dummy.divisible[3] = 1
  output: A dummy event | event=%evt.plugininfo sample=%dummy.value sample_str=%dummy.strvalue num=%evt.num
  priority: INFO
  source: dummy
```

Here's what it looks like when run:

```
$ ./falco -r ../falco-files/dummy_rules.yaml -c ../falco-files/falco.yaml
Wed Feb  2 16:26:35 2022: Falco version 0.31.0 (driver version 319368f1ad778691164d33d59945e00c5752cd27)
Wed Feb  2 16:26:35 2022: Falco initialized with configuration file ../falco-files/falco.yaml
Wed Feb  2 16:26:35 2022: Loading plugin (dummy) from file /tmp/my-plugins/dummy/libdummy.so
Wed Feb  2 16:26:35 2022: Loading rules from file ../rules/dummy_rules.yaml:
Wed Feb  2 16:26:35 2022: Starting internal webserver, listening on port 8765
16:26:35.527827816: Notice A dummy event (event={"sample": "6"} sample=6 sample_str=6 num=1)
16:26:35.527829658: Notice A dummy event (event={"sample": "18"} sample=18 sample_str=18 num=3)
16:26:35.527831048: Notice A dummy event (event={"sample": "33"} sample=33 sample_str=33 num=8)
Events detected: 3
Rule counts by severity:
   INFO: 3
Triggered rules by rule name:
   My Dummy Rule: 3
Syscall event drop monitoring:
   - event drop detected: 0 occurrences
   - num times actions taken: 0
```
