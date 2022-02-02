---
title: Falco Plugins Developers Guide
weight: 1
aliases:
    - /docs/plugins/developers_guide/
---

## Introduction

This page is a guide for developers who want to write their own Falco/Falco libs plugins. It starts with an overview of the plugins API and some general best practices for authoring plugins. We then walk through the [Go](https://github.com/falcosecurity/plugin-sdk-go) and [C++](https://github.com/falcosecurity/plugin-sdk-cpp) SDKs, which provide the preferred streamlined interface to plugin authors, as well as two reference plugins written in Go and C++. If you prefer to directly use the plugin API functions instead, you can consult the [Plugin API Reference](plugin-api-reference.md) for documentation on each API function.

If you're not interested in writing your own plugin, or modifying one of the existing plugins, you can skip this page.

Although plugins can be written in many languages, the Plugins API uses C functions, so you should be comfortable with C language concepts to understand the API.

Before reading this page, read the main [plugins](../../plugins) page for an overview of what plugins are and how they are used by Falco/Falco libs.

## High Level Overview

Here is a high level overview of how the plugin framework uses API functions to interact with plugins:

* **Verify api compatibility**: the framework calls `plugin_get_required_api_version` to verify that the plugin is compatible with the framework.
* **Call info functions**: the framework calls `plugin_get_xxx` functions to obtain information about the plugin.
* **Get supported fields**: the framework calls `plugin_get_fields` to obtain the list of fields supported by the plugin.
* **Initialize a plugin**: the framework calls `plugin_init()` to initialize a plugin, which returns an opaque `ss_plugin_t` handle. This handle is passed as an argument to later functions.
* **Open a stream of events**: the framework calls `plugin_open()` the open a stream of events, which returns an opaque `ss_instance_t` handle. This handle is passed as an argument to later functions. (source plugins only)
* **Obtain events**: the framework calls `plugin_next_batch()` to obtain events from the plugin. (source plugins only)
* **Extract values**: the framework calls `plugin_extract_fields()` to obtain values for fields for a given event.
* **Close a stream of events**: the framework calls `plugin_close()` to close a stream of events. The `ss_instance_t` handle is considered invalid and will not be used again. (source plugins only)
* **Destroy the plugin**: the framework calls `plugin_destroy()` to destroy a plugin. The `ss_plugin_t` handle is considered invalid and will not be used again.

## General Plugin Development Considerations

### API Versioning

The plugins API is versioned with a [semver](https://semver.org/)-style version string. The plugins framework checks the plugin's required api version by calling the `plugin_get_required_api_version` API function. In order for the framework to load the plugin, the major number of the plugin framework must match the major number in the version returned by `plugin_get_required_api_version`. Otherwise, the plugin is incompatible and will not be loaded.

### Required vs Optional Functions

Some API functions are required, while others are optional. If a function is optional, the plugin can choose to not define the function at all. The framework will note that the function is not defined and use a default behavior. For optional functions, the default behavior is described below.

### Memory Returned Across the API is Owned By the Plugin

Every API function that returns or populates a string or struct pointer must point to memory allocated by the plugin and must remain valid for use by the plugin framework. When using the SDKs, this is generally handled automatically. Keep it in mind if using the plugin API functions directly, however.

### What Configuration/Internal State Goes Where?

When the framework calls `plugin_open()`, it provides a configuration string which is used to configure the plugin. When the framework calls `plugin_open()`, it provides a parameters string which is used to source a stream of events. The format of both text blocks is defined by the plugin and is passed directly through by the plugin framework.

Within a plugin, it must maintain state in two objects: a `ss_plugin_t` for plugin state, and a `ss_instance_t` for plugin instance state.

For new plugin authors, it may be confusing to determine which state goes in each object and what information should be provided in the configuration string vs the parameters string. Ultimately, that's up to the plugin author, but here are some guidelines to follow:

* The `ss_plugin_t` struct should contain *configuration* that instructs the plugin how to behave. Generally this is sourced from the configuration string.
* The `ss_instance_t` struct should contain *parameters* that instruct the plugin on how to source a stream of events. Generally this is sourced from the parameters string.
* Instance state (e.g. the `ss_instance_t` struct) should include things like file handles, connection objects, current buffer positions, etc.

For example, if a plugin fetches URLs, whether or not to allow self-signed certificates would belong in configuration, and the actual URLs to fetch would belong in parameters.

### What Goes In An Event?

Similarly, it may be confusing to distinguish between state for a plugin (e.g. `ss_plugin_t`/`ss_instance_t`) as compared to the actual data that ends up in an event. This is especially important when thinking about fields and what they represent. A good rule of thumb to follow is that fields should *only* extract data from events, and not internal state. For example, this behavior is encouraged by *not* providing a `ss_instance_t` handle as an argument to `plugin_extract_fields`.

For example, assume some plugin returned a sample of a metric in events, and the internal state also held the maximum value seen so far. It would be a good practice to have a field `plugin.sample` that returned the value in a given event. It would *not* be a good practice to have a field `plugin.max_sample` that returned the maximum value seen, because that information is held in the internal state and not in events. If events *also* saved the current max sample so far, then it would be fine to have a field `plugin.max_sample`, as that can be retrieved directly from a single event.

A question to ask when deciding what to put in an event is "if this were written to a `.scap` capture file and reread, would this plugin return the same values for fields as it did when the events were first generated?".

### Plugin Authoring Lifecycle

Here are some considerations to keep in mind when releasing the initial version of a new plugin and when releasing updated versions of the plugin.

#### Initial Version

For source plugins, make sure the event source is distinct, or if the same as existing plugins, that the saved payload is identical. In most cases, each source plugin should define a new event source.

For extractor plugins, if the plugin exports a set of compatible sources, make sure you have tested it with each compatible source plugin to ensure that your extractor plugin can read event payloads without errors/crashing. If the plugin does *not* export a set of compatible sources (meaning that it potentially handles every kind of event), your plugin must be very resilient. It will potentially be handed arbitrary binary data from other plugins.

Register this plugin by submitting a PR to [falcosecurity/plugins](https://github.com/falcosecurity/plugins) to update the [plugin registry](https://github.com/falcosecurity/plugins/blob/master/registry.yaml). This will give an official Plugin ID that can be safely used in capture files, etc., without overlapping with other plugins. It also lets others know that a new plugin is available!

#### Updates

Every new release of a plugin should update the plugin's version number. Following semver conventions, the patch number should always be updated, the minor number should be updated when new fields are added, and the major number should be updated whenever any field is modified/removed or the semantics of a given field changes.

With every release, you should check for an updated Plugin API Version and if needed, update the plugin to conform to the new API. Remember that a plugin and framework are considered be compatible if their major versions are the same.

With each new release, make sure the contact information provided by the plugin is up-to-date.

## Go Plugin SDK Walkthrough
The [Go SDK](https://github.com/falcosecurity/plugin-sdk-go) provides prebuilt constructs and definitions that help developing plugins by abstracting all the complexities related to the bridging between the C and the Go runtimes. The Go SDK takes care of satisfying all the plugin framework requirements without having to deal with the low-level details, by also optimizing the most critical code paths.

The SDK allows developers to choose either from a low-level set of abstractions, or from a more high-level set of packages designed for simplicy and ease of use. The best way to approach the Go SDK is to start by importing few high-level packages, which is enough to satisfy the majority of use cases.

This section documents the Go SDK at a high-level, please refer to the [official Go SDK documentation](https://github.com/falcosecurity/plugin-sdk-go) for deeper details.

### Architecture of the Go SDK

Since Falcosecurity plugins run in a C runtime, the Go SDK has been designed to abstract most of the complexity related to writing C-compliant	 code acceptable by the plugin framework, so that developers can focus on writing Go code only. 

![plugin_sdk_go_architecture](/docs/images/plugin_sdk_go_architecture.png)

At a high level, the SDK is on top of three fundamendal package with different levels of abstractions:

1. Package `sdk` is a container for all the basic types, definitions, and helpers that are reused across all the SDK parts. 

2. Package `sdk/symbols` contains prebuilt implementations for all the C symbols that plugins must export to be accepted by the framework. The prebuilt C symbols are divided in many subpackages, so that each of them can be imported individually to opt-in/opt-out each symbol. 

3. Package `sdk/plugins` provide high-level definition and base types for writing extractor plugins and source plugins. This uses `sdk/symbols` internally and takes care of importing all the prebuilt C symbols required by extractor and source plugins respectively. This is the main entrypoint for developers to write plugins in Go.

Two additional packages `ptr` and `cgo` are used internally to simplify and optimize the state management and the usage of C-allocated memory pointers.

For some use cases, developers can consider using the SDK layers selectively. This is meaningful only if developers wish to manually write part of the low-level C details of the framework in their plugins, but still want to use some parts of the SDK. However, this is discouraged if not for advanced use cases only. Developers are encouraged to use the `sdk/plugins` to build Falcosecurity plugins, which is easier to use and will have less frequent breaking changes.

Further details can be found in the documentation of each package: [`sdk`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go/pkg/sdk), [`sdk/symbols`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go/pkg/sdk/symbols), and [`sdk/plugins`](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go/pkg/sdk/plugins).

### Getting Started
The SDK is built on top a set of minimal composable interfaces describing the behavior of plugins and plugin instances. As such, developing plugins is as easy as defining a struct type representing the plugin itself, ensuring that the mandatory interface methods are defined on it, and then registering it to the SDK.

To use the Go SDK, all you need to import are the `sdk` and `sdk/plugins` packages. The first contains all the core types and definitions used across the rest of the SDK packages, whereas the latter contains built-in constructs to develop plugins. The subpackages `sdk/plugins/source` and `sdk/plugins/extractor` contain specialized definitions for source and extraction functionalities respectively.

Extractor plugins just need to import `sdk/plugins/extractor`. Generally, source plugins should import both `sdk/plugins/source` and `sdk/plugins/extractor`, as they both generate new events and extract fields from them. If needed, the SDK also allows writing source-only plugins without the extraction features, in which case only the `sdk/plugins/source` package would need to be imported.

The `dummy` Go plugin, documented in the [next sections](#example-go-plugin-dummy), is a simple example that helps understanding how to start writing Go plugins with this SDK.

#### Defining Extractor Plugin Functionalities
In the Go SDK, an extractor Plugin is a type implementing the following interface:
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

`Init()` method is called to initialize a plugin when the framework allocates it. A user-defined configuration string is passed by the framework. This is were the plugin can initialize its internal state and acquire all the resource it needs.

`Fields()` returns an array of `sdk.FieldEntry` representing all the fields supported by a plugin for extraction. The order of the fields is relevant, as their index is used as an identifier during extraction.

`Extract()` extracts the value of one of the supported fields from a given event passed in by the framework. The `sdk.ExtractRequest` argument should be used to set the extracted value.

#### Defining Source Plugin Functionalities
In the Go SDK, a source Plugin must specify two types, one of the plugin itself and one for the plugin instances, implementing the following interfaces respectively:
```go
// sdk/plugins/source
type Plugin interface {
	...
	Info() *sdk.Info
	Init(config string) error
	Open(params string) (Instance, error)
	String(in io.ReadSeeker) (string, error)
}

// sdk/plugins/source
type Instance interface {
	...
	NextBatch(pState PluginState, evts EventWriters) (int, error)
}
```
The `source.Plugin` interface has many functions in common with `extractor.Plugin`. 

`Open()` creates a new plugin instance to open a new stream of events. The framework provides the user-defined open parameters to customize the event source. The return value must implement the `source.Instance` interface, and its lifecycle ends when the event stream is closed.

`String()` returns a string representation of an event created by the plugin. The string representation should be on a single line and contain important information about the event. 

The `source.Instance` interface represents plugin instances for an opened event stream, and has one mandatory method and few optional ones.

`NextBatch` creates a new batch of events to be pushed in the event stream. The SDK provides a pre-allocated batch to write events into, in order to manage the used memory optimally.

#### Optional Interfaces

On top of the mandatory plugin interface requirements, source and extraction plugins can also implement some additional interface method to enable optional functionalities. All the following interfaces are defined in the `sdk` package.

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
```

Source and extrator plugins can optionally implement the `sdk.Destroyer` interface. In that case, `Destroy()` will be called when the plugin gets destroyed and can be used to release any allocated resource.

Source and extrator plugins can also optionally implement the `sdk.InitSchema` interface. In that case, `InitSchema()` will be used to to return a schema describing the data expected to be passed as a configuration during the plugin initialization. This follows the semantics documented for [`get_init_schema`](../plugin-api-reference/#const-char-plugin-get-init-schema-ss-plugin-schema-type-schema-type-required-no). Currently, the schema must follow the [JSON Schema specific](https://json-schema.org/), which in Go can also be easily auto-generated with external packages (e.g. [alecthomas/jsonschema](https:/github.com/alecthomas/jsonschema)).

Source plugins can optionally implement the `sdk.OpenParams` interface. In that case, `OpenParams()` will be called before opening the event stream to obtains some suggested values that would valid parameters for `Open()`. For more details, see the documentation of [`list_open_params`](../plugin-api-reference/#const-char-plugin-list-open-params-ss-plugin-t-s-ss-plugin-rc-rc-required-no).

Source plugin instances can optionally implement the `sdk.Closer` and `sdk.Progresser` interface. If `sdk.Closer` is implemented, the `Close()` method is called while closing the event stream and can be used to release the resources used by the plugin instance. If `sdk.Progresser` is implemented, the 
`Progress()` method is called by the SDK when the framework requests progress data about the event stream of the plugin instance. `Progress()` must return a `float64` with value between 0 and 1 representing the current progress percentage, and a string representation of the same progress value.

#### Registering a Plugin in the SDK

After defining proper types for the plugin, the only thing remaining is to register it in the SDK so that it can be used in the plugin framework.
```go
// sdk/plugins/extractor
func Register(p extractor.Plugin)

// sdk/plugins/source
func Register(p source.Plugin)
```
The newly created plugin type need to be registered to the SDK in a Go `init` function. The `source.Register()` and `extractor.Register()` functions register plugins for source and extraction functionalities respectively. Extractor plugin should be registered with `extractor.Register()` only. Source plugins need to be registered with both `source.Register()` and `extractor.Register()`, and the order with which the two functions are called is not relevant. If a call to `extractor.Register()` is omitted, source plugins will be interpreted as source-only, with the extraction features disabled.

The defined types are expected to implement a given set of methods. Compilation will fail at the `Register()` functions if any of the required methods is not defined. Developers are encouraged to compose their structs with `plugins.BasePlugin`, and `source.BaseInstance`, which provide prebuilt boilerplate for many of those methods. In this way, developers just need to focus on implementing the few plugin-specific methods remaining.

Besides the interface requirements, the defined types can contain arbitrary fields and methods. State variable that must be maintained during the plugin lifecycle (or in the lifecycle of an opened event stream) must be contained in the defined types. In this way, the SDK can guarantee that the state variables are not disposed by the garbage collector.

#### Interacting with Events

Generating new events, and extracting field values from them, are the hottest path in the plugin framework and can happen at a very high rate. For this reason the Go SDK optimizes the memory usage as much as possible, avoiding reallocations and copies wherever possible. Internally, this sometimes means reading and writing on C-allocated memory from Go code directly, which is efficient but also very unsafe and can lead to unstable code.

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
Event data can either be read or written through the standard `io.SeekReader` and `io.Writer` interfaces, returned by the `Reader()` and `Writer()` methods respectively. The SDK hides behind these interface all the safety and optimzation mechanisms.

For source plugins, a reusable batch of `sdk.EventWriter`s is automatically allocated in each source plugin instance after the `Open()` method returns. This slab-allocator creates reusable event data by using the deafault `sdk.DefaultBatchSize` and `sdk.DefaultEvtSize` constants. Developers can override the automatic allocation to define batches of arbitrary sizes in the `Open()` method, by calling the `SetEvents()` method on the newly opened plugin instance before returning it. The reusable event batch can be created with the `sdk.NewEventWriters` function, that takes the event data size and batch size as arguments.
```go
func NewEventWriters(size, dataSize int64) (EventWriters, error)
```
Note that the size of the reusable event batch defines the maximum size of each event batch created by the source plugin in `NextBatch`.

#### Compiling Plugins
After successfully writing a plugin, all you need is to compile it. Go allows compiling binaries as a C-compliant shared library with the `-buildmode=c-shared` flag. The build command will be something looking like:
```
go build -buildmode=c-shared -o <outname>.so *.go
```
The SDK takes care of generating all the required C exported functions that the plugin framework needs to load the plugin. Once built, your plugin is ready to be used in the Falcosecurity plugin system.

## C++ Plugin SDK Walkthrough

The [C++](https://github.com/falcosecurity/plugin-sdk-cpp) SDK, in the form of a single header file `falcosecurity_plugin.h`, provides abstract base classes for a plugin and plugin instance. Plugin authors write classes that derive from those base classes and implement methods to provide plugin info, init/destroy plugins, open/close instances, return events, and extract fields from events. All classes, structs, enums, etc are below the `falcosecurity` namespace.

The SDK also declares a preprocessor `#define` to generate C `plugin_xxx` functions for the plugins API, using the derived classes.

This section documents the SDK.

### `falcosecurity::source_plugin`: Base Class for Plugins

The `falcosecurity::source_plugin` class provides the base implementation for a source plugin. An object is created every time the plugin is initialized via `plugin_init()` and the object is deleted on `plugin_destroy()`. A separate static global object is also used to provide the demographic functions `plugin_get_name()`, `plugin_get_description()`, etc.

The abstract interface for plugin authors is in the `falcosecurity::source_plugin_iface` class and has the following methods:

#### `virtual void get_info(plugin_info &info) = 0`

Return info about the plugin. The `falcosecurity::plugin_info` struct should be filled in by the plugin author, and is the following:

```C++
typedef struct plugin_field {
	ss_plugin_field_type ftype;
	std::string name;
	bool arg_required;
	std::string description;
} plugin_field;

typedef struct plugin_info {
	uint32_t id;
	std::string name;
	std::string description;
	std::string contact;
	std::string version;
	std::string event_source;
	std::list<plugin_field> fields;
} plugin_info;
```

#### `virtual ss_plugin_rc init(const char* config) = 0`

Initialize a plugin. This is *not* the constructor, but is called shortly after the plugin object has been allocated. The config is the config provided in the `plugin_initialize()` function. The plugin can parse this config and save it in the object. This method should return SS_PLUGIN_SUCCESS on success, SS_PLUGIN_FAILURE on failure. In case of failure, an error string can be set via set_last_error().

#### `virtual void destroy() = 0`

Destroy a plugin. This is *not* the destructor, but is called shortly before the object is deleted. The plugin can use this method to clean up any state that it does not want to clean up in the destructor.

#### `virtual plugin_instance *create_instance(source_plugin &plugin) = 0`

Create an object that derives from `falcosecurity::plugin_instance` and return a pointer to the object. This is called during `plugin_open()`. The derived instance's `open()` method will be called by the SDK after receiving the derived instance pointer from this function.

#### `virtual std::string event_to_string(const uint8_t *data, uint32_t datalen) = 0`

Return a string representation of an event. The returned string will be held in the base class and passed back in `plugin_event_to_string()`.

The string representation should be on a single line and contain important information about the event. It is not necessary to return all information from the event. Simply return the most important fields/properties of the event that provide a useful default representation.

Here is an example output, from the [cloudtrail](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail) plugin:

```
us-east-1 masters.some-demo.k8s.local s3 GetObject Size=0 URI=s3://some-demo-env/some-demo.k8s.local/backups/etcd/events/control/etcd-cluster-created
```

#### `virtual bool extract_str(const ss_plugin_event &evt, const std::string &field, const std::string &arg, std::string &extract_val) = 0`

Extract a single string field from an event. This is called during `plugin_extract_fields` as the base class loops over the provided set of fields. If the event has a meaningful value for the provided field, the derived class should return true and fill in `&extract_val` with the extracted value from the event. If the event does not have a meaningful value, the derived class should return false.

#### `virtual bool extract_u64(const ss_plugin_event &evt, const std::string &field, const std::string &arg, uint64_t &extract_val) = 0`

Identical to `extract_str` but for uint64_t values.

#### `virtual std::string list_open_params(ss_plugin_rc *rc)`

Return a list of suggested open parameters supported by this plugin, encoded as a JSON array. Any of the values in the returned list are valid parameters for `open()`.

This method is optional, the default implementation simply returns an empty list.

#### `virtual std::string get_init_schema(ss_plugin_schema_type* schema_type)`

Return a string representation of a schema describing the data expected to be passed as a configuration during the plugin initialization.

This method is optional, the default implementation simply returns no schema.

### `falcosecurity::plugin_instance`: Base Class for Plugin Instances

The `falcosecurity::plugin_instance` class provides the base implementation for a plugin instance. An object is created (via `source_plugin::create_instance`) via `plugin_open()` and the object is deleted on `plugin_close()`.

The abstract interface for plugin authors is in the `falcosecurity::plugin_instance_iface` class and has the following methods:

#### `virtual ss_plugin_rc open(const char* params) = 0`

Create necessary state to open a stream of events. This is called during `plugin_open()` shortly after calling `source_plugin::create_instance`. The provided params are the params provided to `plugin_open()`.

#### `virtual void close() = 0`

Tear down any state created in `open()`. The object will be deleted shortly afterward.

#### `virtual ss_plugin_rc next(plugin_event &evt) = 0`

Return a single event to the sdk. The sdk will handle managing memory for the events and passing them up to the framework in `plugin_next_batch()`. This method should return one of the following:

* `SS_PLUGIN_SUCCESS`: event ready and returned
* `SS_PLUGIN_FAILURE`: some error, no event returned. framework will close instance.
* `SS_PLUGIN_TIMEOUT`: no event ready. framework will try again later.
* `SS_PLUGIN_EOF`: no more events. framework will close instance.

#### `virtual std::string get_progress(uint32_t &progress_pct)`

Return the read progress, as a number between 0 (no data has been read) and 10000 (100% of the data has been read). This encoding allows the engine to print progress decimals without requiring to deal with floating point numbers (which could cause incompatibility problems with some languages).

`progress_pct` should be filled in with the read progress as a number. The returned string should be a string representation of the read progress. This might include the progress percentage along with additional context provided by the plugin.

This method does not have to be overridden--the base implementation simply returns a read progress of zero.

### `#define GEN_SOURCE_PLUGIN_API_HOOKS`: Generate C Plugin API Hooks

After creating derived classes and implementing the above methods, use this preprocessor define to generate C code that implements the plugin API functions. The preprocessor takes two arguments:

* `source_plugin_class_name`: the name of the class that derives from `falcosecurity::source_plugin` that represents a plugin.
* `source_plugin_instance_name`: the name of the class that derives from `falcosecurity::plugin_instance` that represents a plugin instance.

This preprocessor define should be called exactly once per plugin, to avoid generating duplicate symbols.

## Example Plugins Walkthrough

This section walks through the implementation of two plugins: `dummy` and `dummy_c`. They behave identically, returning artificial dummy information. One is written in Go and one is written in C++.

The dummy plugins return events that are just a number value that increases with each call to `next()`. Each increase is 1 plus a random "jitter" value that ranges from [0:jitter]. The jitter value is provided as configuration to the plugin in `plugin_init`. The starting value and maximum number of events is provided as open parameters to the plugin in `plugin_open`.

This will show how the above API functions are actually used in a functional plugin.

### Example Go Plugin: `dummy`

The source code for this plugin can be found at [dummy.go](https://github.com/falcosecurity/plugins/blob/master/plugins/dummy/dummy.go).

#### Initial Imports

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

The `sdk/plugins/source` and `sdk/plugins/extractor` packages are required to register the functionalities of source and extractor plugins. `dummy` requires on both of them, as it is an example of source plugin.

The Go module `falcosecurity/plugin-sdk-go` has its own [documentation](https://pkg.go.dev/github.com/falcosecurity/plugin-sdk-go), which gives deeper insights about the internal architecture of the SDK.

#### Defining the Plugin

In the Go SDK plugins are defined by a set of composable tiny interfaces. To define a new plugin, the first step is to define a new `struct` type representing the plugin itself, and then register it to the SDK. Source plugins, like `dummy`, must define an additional type representing the an opened instance of the plugin event stream.

```go
type MyPluginConfig struct {
	// This reflects potential internal state for the plugin. In
	// this case, the plugin is configured with a jitter.
	Jitter uint64 `json:"jitter" jsonschema:"description=A random amount added to the sample of each event (Default: 10)"`
}

type MyPlugin struct {
	plugins.BasePlugin
	// Will be used to randomize samples
	rand *rand.Rand
	// Contains the init configuration values
	config MyPluginConfig
}

type MyInstance struct {
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
	p := &MyPlugin{}
	source.Register(p)
	extractor.Register(p)
}
```

#### Plugin Info

An `Info()` method is needed to return a data struct containing all the plugin info. `Info()` is a required method for the defined plugin struct type. This plugin defined its info as a set of constants for simplicity, but it's not a requirement.

```go
const (
	PluginRequiredApiVersion        = "0.3.0"
	PluginID                 uint32 = 3
	PluginName                      = "dummy"
	PluginDescription               = "Reference plugin for educational purposes"
	PluginContact                   = "github.com/falcosecurity/plugins"
	PluginVersion                   = "0.2.1"
	PluginEventSource               = "dummy"
)

...

func (m *MyPlugin) Info() *plugins.Info {
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

#### Initializing/Destroying the Plugin

The mandatory `Init()` method serves as an initialization entrypoint for plugins. This is where the user-defined configuration string is passed in by the framework. The internal state of the plugin should be initialized at this level. An error can be returned to abort the plugin initialization.

Defining the `Destroy()` method is optional, but can be useful if some resource needs to be released before the plugin gets destroyed. The `InitSchema()` methos is optional too, but it allows the framework to automatically parse the init config, thus avoiding the need of doing it manually inside `Init()`.

```go
// Set the config default values.
func (p *MyPluginConfig) setDefault() {
	p.Jitter = 10
}

// This returns a schema representing the configuration expected by the
// plugin to be passed to the Init() method. Defining InitSchema() allows
// the framework to automatically validate the configuration, so that the
// plugin can assume that it to be always be well-formed when passed to Init().
func (p *MyPlugin) InitSchema() *sdk.SchemaInfo {
	// We leverage the jsonschema package to autogenerate the
	// JSON Schema definition using reflection from our config struct.
	reflector := jsonschema.Reflector{
		// all properties are optional by default
		RequiredFromJSONSchemaTags: true,
		// unrecognized properties don't cause a parsing failures
		AllowAdditionalProperties:  true,
	}
	if schema, err := reflector.Reflect(&MyPluginConfig{}).MarshalJSON(); err == nil {
		return &sdk.SchemaInfo{
			Schema: string(schema),
		}
	}
	return nil
}

// Since this plugin defines the InitSchema() method, we can assume
// that the configuration is pre-validated by the framework and
// always well-formed according to the provided schema.
func (m *MyPlugin) Init(cfg string) error {
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

func (m *MyPlugin) Destroy() {
	// nothing to do here
}
```

#### Opening/Closing a Stream of Events

A plugin instance is created when the plugin event stream is opened, which can happen more than once during the plugin lifecycle. Source plugins are required to define an `Open()` method that creates a returns a new plugin instance. This is where the framework passes in the user-defined open parameters string.

The plugin instance type returned form `Open()` can define an optional `Close()` method bundling any additional deinitialization logic to run while closing the event stream.

```go
func (m *MyPlugin) Open(prms string) (source.Instance, error) {
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

	return &MyInstance{
		initParams: prms,
		maxEvents:  obj["maxEvents"],
		counter:    0,
		sample:     obj["start"],
	}, nil
}

func (m *MyInstance) Close() {
	// nothing to do here
}
```

#### Returning new Events

New events are generated in batch by the `NextBatch` function. The function is mandatory for source plugins and must be defined as a method of the plugin instance struct type. The `pState` argument is the plugin struct type initialized in `Init()`, passed in by the framework for ease of access. The plugin state is passed as an instance of the `sdk.PluginState` interface, so a manual cast is required to access the internal state variables defined in the struct type.

The `evts` parameter is a sdk-managed batch of events to be used for creating new events. For that, the SDK uses a slab allocator and reuses the same event batch at every iteration to improve performance. The lenght of the `evts` list represents the maximum size of each event batch.
Each element of the batch is an instance of `sdk.EventWriter` that provides handy methods to write the event info and data. Event data can be written with the Go `io.Writer` interface.

If an error is returned, the SDK returns a failure to the framework and invalidates the current batch. The special errors `sdk.ErrTimeout` and `sdk.ErrEOF` have a special meaning, and are used to either advise the framework that no new events are currently available, or that the event stream is terminated.

```go
func (m *MyInstance) NextBatch(pState sdk.PluginState, evts sdk.EventWriters) (int, error) {
	// Return EOF if reached maxEvents
	if m.counter >= m.maxEvents {
		return 0, sdk.ErrEOF
	}

	var n int
	var evt sdk.EventWriter
	myPlugin := pState.(*MyPlugin)
	for n = 0; m.counter < m.maxEvents && n < evts.Len(); n++ {
		evt = evts.Get(n)
		m.counter++

		// Increment sample by 1, also add a jitter of [0:jitter]
		m.sample += 1 + uint64(myPlugin.rand.Int63n(int64(myPlugin.config.Jitter+1)))

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

#### Printing Events As Strings

Source plugins must define a `String()` method to format the contents of events created with a previous call to `NextBatch()`. The event data is readable through an instance of `io.ReadSeeker` provided by the SDK. Internally, this allows a safe memory access and an optimal reusage of the same buffer to maximize the performance of hot framework paths.

```go
func (m *MyPlugin) String(in io.ReadSeeker) (string, error) {
	evtBytes, err := ioutil.ReadAll(in)
	if err != nil {
		return "", err
	}
	evtStr := string(evtBytes)

	// The string representation of an event is a json object with the sample
	return fmt.Sprintf("{\"sample\": \"%s\"}", evtStr), nil
}
```

#### Defining Fields

This dummy plugin exports 3 fields:

* `dummy.value`: the value in the event, as a uint64
* `dummy.strvalue`: the value in the event, as a string
* `dummy.divisible`: this field takes an argument and returns 1 if the value in the event is divisible by the argument (a numeric divisor). For example, if the value was 12, `dummy.divisible[3]` would return 1 for that event.

The `Fields()` method returns a slice of `sdk.FieldEntry` representing all the supported fields.

```go
func (m *MyPlugin) Fields() []sdk.FieldEntry {
	return []sdk.FieldEntry{
		{Type: "uint64", Name: "dummy.divisible", ArgRequired: true, Desc: "Return 1 if the value is divisible by the provided divisor, 0 otherwise"},
		{Type: "uint64", Name: "dummy.value", Desc: "The sample value in the event"},
		{Type: "string", Name: "dummy.strvalue", Desc: "The sample value in the event, as a string"},
	}
}
```

#### Extracting Fields

The `Extractor` method extracts any of the supported fields. The `req` parameter allows accessing all the info regarding the field request, such as the field id or name, and the optional user-passed argument. The `evt` parameter is an interface that halps reading the event info and data.

The extracted field value must be set through the `SetValue` method of `sdk.ExtractRequest`. Returning from `Extract` without calling `SetValue` will signal the SDK that the requested field is not present in the given event.

```go
func (m *MyPlugin) Extract(req sdk.ExtractRequest, evt sdk.EventReader) error {
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
		arg := req.Arg()
		divisor, err := strconv.Atoi(arg)
		if err != nil {
			return fmt.Errorf("argument to dummy.divisible %s could not be converted to number", arg)
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

#### Plugin In Action

This plugin can be configured in Falco by adding the following to falco.yaml:

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
  output: A dummy event (event=%evt.plugininfo sample=%dummy.value sample_str=%dummy.strvalue num=%evt.num)
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

### Example C plugin: `dummy_c`

The source code for this plugin can be found at [dummy.cpp](https://github.com/falcosecurity/plugins/blob/master/plugins/dummy_c/dummy.cpp).

#### Initial header include

`falcosecurity_plugin.h` is the C++ sdk, and declares the base classes and preprocessor define to generate plugin API C functions. It also includes `plugin_info.h`, which defines structs/enums like `ss_plugin_t`, `ss_instance_t`, `ss_plugin_event`, etc, as well as function return values like SS_PLUGIN_SUCCESS, SS_PLUGIN_FAILURE, etc. The [json](https://github.com/nlohmann/json) header file provides helpful c++ classes to parse/represent json objects.

```c++
#include <string>
#include <stdio.h>
#include <stdlib.h>

#include "nlohmann/json.hpp"

#include <falcosecurity_plugin.h>

using json = nlohmann::json;
```

#### `dummy_plugin` class: plugin object

The `dummy_plugin` class derives from `falcosecurity::source_plugin` and implements the abstract methods from the `falcosecurity::source_plugin_iface` class. It also saves a copy of the config provided to `init()` in `m_config` and the configured jitter in `m_jitter`:

```c++
class dummy_plugin : public falcosecurity::source_plugin {
public:
	dummy_plugin();
	virtual ~dummy_plugin();

	// All of these are from falcosecurity::source_plugin_iface.
	void get_info(falcosecurity::plugin_info &info) override;
	ss_plugin_rc init(const char *config) override;
	void destroy() override;
	falcosecurity::plugin_instance *create_instance(falcosecurity::source_plugin &plugin) override;
	std::string event_to_string(const uint8_t *data, uint32_t datalen) override;
	bool extract_str(const ss_plugin_event &evt, const std::string &field, const std::string &arg, std::string &extract_val) override;
	bool extract_u64(const ss_plugin_event &evt, const std::string &field, const std::string &arg, uint64_t &extract_val) override;

	// Return the configured jitter.
	uint64_t jitter();

private:
	// A copy of the config provided to init()
	std::string m_config;

	// This reflects potential internal state for the plugin. In
	// this case, the plugin is configured with a jitter (e.g. a
	// random amount to add to the sample with each call to next().
	uint64_t m_jitter;
};
```

#### Returning Plugin Info

`dummy_plugin::get_info` returns info about the plugin.

This dummy plugin exports 3 fields:

* `dummy.value`: the value in the event, as a uint64
* `dummy.strvalue`: the value in the event, as a string
* `dummy.divisible`: this field takes an argument and returns 1 if the value in the event is divisible by the argument (a numeric divisor). For example, if the value was 12, `dummy.divisible[3]` would return 1 for that event.

```c++
void dummy_plugin::get_info(falcosecurity::plugin_info &info)
{
	info.name = "dummy_c";
	info.description = "Reference plugin for educational purposes";
	info.contact = "github.com/falcosecurity/plugins";
	info.version = "0.1.0";
	info.event_source = "dummy";
	info.fields = {
		{FTYPE_UINT64, "dummy.divisible", true, "Return 1 if the value is divisible by the provided divisor, 0 otherwise"},
		{FTYPE_UINT64, "dummy.value", false, "The sample value in the event"},
		{FTYPE_STRING, "dummy.strvalue", false, "The sample value in the event, as a string"}
	};
}
```

#### Plugin Initialization and Destroy

`dummy_plugin::init` initializes the plugin. It parses the (JSON) config string and extracts a configured jitter value from the config. `dummy_plugin::destroy` is a no-op.

```c++
ss_plugin_rc dummy_plugin::init(const char *config)
{
	m_config = config != NULL ? config : "";

	// Config is optional. In this case defaults are used.
	if(m_config == "" || m_config == "{}")
	{
		return SS_PLUGIN_SUCCESS;
	}

	json obj;

	try {
		obj = json::parse(m_config);
	}
	catch (std::exception &e)
	{
		set_last_error(e.what());
		return SS_PLUGIN_FAILURE;
	}

	auto it = obj.find("jitter");

	if(it == obj.end())
	{
		set_last_error("jitter not defined");
		return SS_PLUGIN_FAILURE;
	}

	m_jitter = *it;

	return SS_PLUGIN_SUCCESS;
}

void dummy_plugin::destroy()
{
}
```

#### Creating Plugin Instances

`dummy_plugin::create_instance` creates a `dummy_instance` object and returns it. Note that in this case, the constructor takes a reference to a `dummy_plugin` object (cast from `falcosecurity::source_plugin`) so instances can have access back to the plugin.

```c++
falcosecurity::plugin_instance *dummy_plugin::create_instance(falcosecurity::source_plugin &plugin)
{
	return new dummy_instance((dummy_plugin &) plugin);

}
```

#### Returning String Representations of Events

`dummy_plugin::event_to_string` returns a string representation of an event. The exact form of the string representation is up to the plugin author. In this case, the string representation of an event is a json object containing the current sample.

```c++
std::string dummy_plugin::event_to_string(const uint8_t *data, uint32_t datalen)
{
	// The string representation of an event is a json object with the sample
	std::string rep = "{\"sample\": ";
	rep.append((char *) data, datalen);
	rep += "}";

	return rep;
}

```

#### Extracting Values

`dummy_plugin::extract_str` and `dummy_plugin::extract_u64` extract fields from events. Note that the methods return true only when the field is one of the supported fields.

```c++
bool dummy_plugin::extract_str(const ss_plugin_event &evt, const std::string &field, const std::string &arg, std::string &extract_val)
{
	if (field == "dummy.strvalue")
	{
		extract_val.assign((char *) evt.data, evt.datalen);
		return true;
	}

	return false;
}

bool dummy_plugin::extract_u64(const ss_plugin_event &evt, const std::string &field, const std::string &arg, uint64_t &extract_val)
{
	std::string sample((char *) evt.data, evt.datalen);
	uint64_t isample = std::stoi(sample);

	if(field == "dummy.divisible")
	{
		uint64_t divisor = std::stoi(arg);
		if ((isample % divisor) == 0)
		{
			extract_val = 1;
		}
		else
		{
			extract_val = 0;
		}

		return true;
	}
	else if (field == "dummy.value")
	{
		extract_val = isample;

		return true;
	}

	return false;
}
```

#### `dummy_instance` class: plugin instance object

The `dummy_instance` class derives from `falcosecurity::plugin_instance` and implements the abstract methods from the `falcosecurity::plugin_instance_iface` class. It saves the parameters provided to `plugin_open()` and holds the current sample, which is modified with each call to `next()`:

```c++
class dummy_instance : public falcosecurity::plugin_instance {
public:
	dummy_instance(dummy_plugin &plugin);
	virtual ~dummy_instance();

	// All of these are from falcosecurity::plugin_instance_iface.
	ss_plugin_rc open(const char *params) override;
	void close() override;
	ss_plugin_rc next(falcosecurity::plugin_event &evt) override;

private:
	// The plugin that created this instance
	dummy_plugin &m_plugin;

	// All of these reflect potential internal state for the
	// instance.

	// Copy of the init params from plugin_open()
	std::string m_params;

	// The number of events to return before EOF
	uint64_t m_max_events;

	// A count of events returned. Used to count against m_max_events
	uint64_t m_counter;

	// A semi-random numeric value, derived from this value and
	// jitter. This is put in every event as the data property.
	uint64_t m_sample;
};
```

#### Opening/Closing Event Streams

`dummy_instance::open()` opens an event stream. It parses the json configuration in params and extracts `start`/`maxEvents` properties which control the number of events to return before EOF and the initial sample value.

Note that on error, the instance uses `m_plugin::set_last_error` to set an error string if the params string is not json or did not contain the expected values.

`dummy_instance::close()` closes the event stream, and is a no-op.

```c++
ss_plugin_rc dummy_instance::open(const char *params)
{
	m_params = params;

	// Params are optional. In this case defaults are used.
	if(m_params == "" || m_params == "{}")
	{
		return SS_PLUGIN_SUCCESS;
	}

	json obj;

	try {
		obj = json::parse(m_params);
	}
	catch (std::exception &e)
	{
		std::string errstr = std::string("Params ") + m_params + " could not be parsed: " + e.what();
		m_plugin.set_last_error(errstr);
		return SS_PLUGIN_FAILURE;
	}

	auto start_it = obj.find("start");
	if(start_it == obj.end())
	{
		std::string errstr = std::string("Params ") + m_params + " did not contain start property";
		m_plugin.set_last_error(errstr);
		return SS_PLUGIN_FAILURE;
	}

	auto max_events_it = obj.find("maxEvents");
	if(max_events_it == obj.end())
	{
		std::string errstr = std::string("Params ") + m_params + " did not contain maxEvents property";
		m_plugin.set_last_error(errstr);
		return SS_PLUGIN_FAILURE;
	}

	m_counter = 0;
	m_max_events = *max_events_it;
	m_sample = *start_it;

	return SS_PLUGIN_SUCCESS;
}

void dummy_instance::close()
{
}
```

#### Returning Events

`dummy_instance::next` fills in the provided event reference with the next event. It increments the counter and sample, including a random jitter.

The event data representation is just the sample as a string, using `std::to_string()`.

Notice that it does *not* fill in the evtnum struct member. This is because event numbers are assigned by the plugin framework.

```c++
ss_plugin_rc dummy_instance::next(falcosecurity::plugin_event &evt)
{
	m_counter++;

	if(m_counter > m_max_events)
	{
		return SS_PLUGIN_EOF;
	}

	// Increment sample by 1, also add a jitter of [0:jitter]
	m_sample = m_sample + 1 + (random() % (m_plugin.jitter() + 1));

	// The event payload is simply the sample, as a string
	std::string payload = std::to_string(m_sample);

	// Note that evtnum is not set, as event numbers are
	// assigned by the plugin framework.
	evt.data.assign(payload.begin(), payload.end());

	// Let the plugin framework assign timestamps
	evt.ts = (uint64_t) -1;

	return SS_PLUGIN_SUCCESS;
}
```

#### Generating Plugin API Functions

The plugin uses `GEN_SOURCE_PLUGIN_API_HOOKS` to generate plugin API functions, using the name of the derived classes `dummy_plugin` and `dummy_instance`:

```c++
GEN_SOURCE_PLUGIN_API_HOOKS(dummy_plugin, dummy_instance)
```

#### Plugin In Action

`falco.yaml` is slightly different than for the Go plugin, with a different plugin name/library path and a different value for `load_plugins`. However, the rules file is unchanged, as both plugins use the same event source `dummy`, even though the two plugins have different IDs. This works because both plugins use the same representation for event data payloads (the sample as a string).

```yaml
plugins:
  - name: dummy_c
    library_path: /tmp/my-plugins/dummy_c/libdummy_c.so
    init_config: '{"jitter": 10}'
    open_params: '{"start": 1, "maxEvents": 20}'

## Optional
load_plugins: [dummy_c]
```

```yaml
- rule: My Dummy Rule
  desc: My Desc
  condition: evt.num > 0 and evt.num < 10 and dummy.divisible[3] = 1
  output: A dummy event (event=%evt.plugininfo sample=%dummy.value sample_str=%dummy.strvalue num=%evt.num)
  priority: INFO
  source: dummy_c
```

```
$ ./falco -r ../falco-files/dummy_rules.yaml -c ../falco-files/falco.yaml
Wed Feb  2 16:38:06 2022: Falco version 0.31.0 (driver version 319368f1ad778691164d33d59945e00c5752cd27)
Wed Feb  2 16:38:06 2022: Falco initialized with configuration file ../falco-files/falco.yaml
Wed Feb  2 16:38:06 2022: Loading plugin (dummy_c) from file /tmp/my-plugins/dummy_c/libdummy_c.so
Wed Feb  2 16:38:06 2022: Loading rules from file ../falco-files/dummy_rules.yaml:
Wed Feb  2 16:38:06 2022: Starting internal webserver, listening on port 8765
16:38:06.070072000: Notice A dummy event (event={"sample": 9} sample=9 sample_str=9 num=1)
16:38:06.071105000: Notice A dummy event (event={"sample": 24} sample=24 sample_str=24 num=4)
16:38:06.071147000: Notice A dummy event (event={"sample": 39} sample=39 sample_str=39 num=7)
16:38:06.071170000: Notice A dummy event (event={"sample": 48} sample=48 sample_str=48 num=9)
Events detected: 4
Rule counts by severity:
   INFO: 4
Triggered rules by rule name:
   My Dummy Rule: 4
Syscall event drop monitoring:
   - event drop detected: 0 occurrences
   - num times actions taken: 0
```
