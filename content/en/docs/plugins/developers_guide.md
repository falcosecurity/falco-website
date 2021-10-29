---
title: Falco Plugins Developers Guide
weight: 1
---

# Introduction

This page is a guide for developers who want to write their own Falco/Falco libs plugins. It starts with an overview of the plugins API and some general best practices for authoring plugins. We then walk through the [Go](https://github.com/falcosecurity/plugin-sdk-go) and [C++](https://github.com/falcosecurity/plugins/tree/master/sdk/cpp) SDKs, which provide the preferred streamlined interface to plugin authors, as well as two reference plugins written in Go and C++. If you prefer to directly use the plugin API functions instead, you can consult the [Plugin API Reference](plugin_api_reference.md) for documentation on each API function.

If you're not interested in writing your own plugin, or modifying one of the existing plugins, you can skip this page.

Although plugins can be written in many languages, the Plugins API uses C functions, so you should be comfortable with C language concepts to understand the API.

Before reading this page, read the main [plugins](../../plugins) page for an overview of what plugins are and how they are used by Falco/Falco libs.

# High Level Overview

Here is a high level overview of how the plugin framework uses API functions to interact with plugins:

* **Verify api compatibility**: the framework calls `plugin_get_required_api_version` to verify that the plugin is compatible with the framework.
* **Call info functions**: the framework calls `plugin_get_xxx` functions to obtain information about the plugin.
* **Get supported fields**: the framework calls `plugin_get_fields` to obtain the list of fields supported by the plugin.
* **Initialize a plugin**: the framework calls `plugin_init()` to initialize a plugin, which returns an opaque `ss_plugin_t` handle. This handle is passed as an argument to later functions.
* **Open a stream of events**: the framework calls `plugin_open()` the open a stream of events, which returns an opaque `ss_instance_t` handle. This handle is passed as an argument to later functions. (source plugins only)
* **Obtain events**: the framework calls `plugin_next()` to obtain events from the plugin. (source plugins only)
* **Extract values**: the framework calls `plugin_extract_fields()` to obtain values for fields for a given event.
* **Close a stream of events**: the framework calls `plugin_close()` to close a stream of events. The `ss_instance_t` handle is considered invalid and will not be used again. (source plugins only)
* **Destroy the plugin**: the framework calls `plugin_destroy()` to destroy a plugin. The `ss_plugin_t` handle is considered invalid and will not be used again.

# General Plugin Development Considerations

## API Versioning

The plugins API is versioned with a [semver](https://semver.org/)-style version string. The plugins framework checks the plugin's required api version by calling the `plugin_get_required_api_version` API function. In order for the framework to load the plugin, the major number of the plugin framework must match the major number in the version returned by `plugin_get_required_api_version`. Otherwise, the plugin is incompatible and will not be loaded.

## Required vs Optional Functions

Some API functions are required, while others are optional. If a function is optional, the plugin can choose to not define the function at all. The framework will note that the function is not defined and use a default behavior. For optional functions, the default behavior is described below.

## Memory Returned Across the API is Owned By the Plugin

Every API function that returns or populates a string or struct pointer must point to memory allocated by the plugin and must remain valid for use by the plugin framework. When using the SDKs, this is generally handled automatically. Keep it in mind if using the plugin API functions directly, however.

## Cgo Pitfalls with Packages

Cgo has a [limitation](https://github.com/golang/go/issues/13467) where generated go types for C types (e.g. `C.ss_plugin_event`) are package-specific and not exported. This means that if you include `plugin_info.h` in your plugin in one package, the go types corresponding to structs/enums/etc in `plugin_info.h` can not be used directly in other packages.

If your plugin needs to use the generated types across packages, you'll have to cast them to an `unsafe.Pointer` across the package boundary. As the generated types all match the same underlying memory layout, this is still safe, as long as the packages were all built from the same plugin API version.

## What Configuration/Internal State Goes Where?

When the framework calls `plugin_open()`, it provides a configuration string which is used to configure the plugin. When the framework calls `plugin_open()`, it provides a parameters string which is used to source a stream of events. The format of both text blocks is defined by the plugin and is passed directly through by the plugin framework.

Within a plugin, it must maintain state in two objects: a `ss_plugin_t` for plugin state, and a `ss_instance_t` for plugin instance state.

For new plugin authors, it may be confusing to determine which state goes in each object and what information should be provided in the configuration string vs the parameters string. Ultimately, that's up to the plugin author, but here are some guidelines to follow:

* The `ss_plugin_t` struct should contain *configuration* that instructs the plugin how to behave. Generally this is sourced from the configuration string.
* The `ss_instance_t` struct should contain *parameters* that instruct the plugin on how to source a stream of events. Generally this is sourced from the parameters string.
* Instance state (e.g. the `ss_instance_t` struct) should include things like file handles, connection objects, current buffer positions, etc.

For example, if a plugin fetches URLs, whether or not to allow self-signed certificates would belong in configuration, and the actual URLs to fetch would belong in parameters.

## What Goes In An Event?

Similarly, it may be confusing to distinguish between state for a plugin (e.g. `ss_plugin_t`/`ss_instance_t`) as compared to the actual data that ends up in an event. This is especially important when thinking about fields and what they represent. A good rule of thumb to follow is that fields should *only* extract data from events, and not internal state. For example, this behavior is encouraged by *not* providing a `ss_instance_t` handle as an argument to `plugin_extract_fields`.

For example, assume some plugin returned a sample of a metric in events, and the internal state also held the maximum value seen so far. It would be a good practice to have a field `plugin.sample` that returned the value in a given event. It would *not* be a good practice to have a field `plugin.max_sample` that returned the maximum value seen, because that information is held in the internal state and not in events. If events *also* saved the current max sample so far, then it would be fine to have a field `plugin.max_sample`, as that can be retrieved directly from a single event.

A question to ask when deciding what to put in an event is "if this were written to a `.scap` capture file and reread, would this plugin return the same values for fields as it did when the events were first generated?".

## Plugin Authoring Lifecycle

Here are some considerations to keep in mind when releasing the initial version of a new plugin and when releasing updated versions of the plugin.

### Initial Version

For source plugins, make sure the event source is distinct, or if the same as existing plugins, that the saved payload is identical. In most cases, each source plugin should define a new event source.

For extractor plugins, if the plugin exports a set of compatible sources, make sure you have tested with capture files generated by each source plugin to ensure that your extractor plugin can read event payloads without errors/crashing. If the plugin does *not* export a set of compatible sources (meaning that it potentially handles every kind of event), your plugin must be very resilient. It will potentially be handed arbitrary binary data from other plugins.

Register this plugin by submitting a PR to [falcosecurity/plugins](https://github.com/falcosecurity/plugins) to update [PLUGINS-REGISTRY.md](https://github.com/falcosecurity/plugins/blob/master/plugins/PLUGINS-REGISTRY.md). This will give an official Plugin ID that can be safely used in capture files, etc., without overlapping with other plugins. It also lets others know that a new plugin is available!

### Updates

Every new release of a plugin should update the plugin's version number. Following semver conventions, the patch number should always be updated, the minor number should be updated when new fields are added, and the major number should be updated whenever any field is modified/removed or the semantics of a given field changes.

With every release, you should check for an updated Plugin API Version and if needed, update the plugin to conform to the new API. Remember that a plugin and framework are considered be compatible if their major versions are the same.

With each new release, make sure the contact information provided by the plugin is up-to-date.

# Go Plugin SDK Walkthrough

# C++ Plugin SDK Walkthrough

The [C++](https://github.com/falcosecurity/plugins/tree/master/sdk/cpp) SDK, in the form of a single header file `falcosecurity_plugin.h`, provides abstract base classes for a plugin and plugin instance. Plugin authors write classes that derive from those base classes and implement methods to provide plugin info, init/destroy plugins, open/close instances, return events, and extract fields from events. All classes, structs, enums, etc are below the `falcosecurity` namespace.

The SDK also declares a preprocessor `#define` to generate C `plugin_xxx` functions for the plugins API, using the derived classes.

This section documents the SDK.

## `falcosecurity::source_plugin`: Base Class for Plugins

The `falcosecurity::source_plugin` class provides the base implementation for a source plugin. An object is created every time the plugin is initialized via `plugin_init()` and the object is deleted on `plugin_destroy()`. A separate static global object is also used to provide the demographic functions `plugin_get_name()`, `plugin_get_description()`, etc.

The abstract interface for plugin authors is in the `falcosecurity::source_plugin_iface` class and has the following methods:

### `virtual void get_info(plugin_info &info) = 0`

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

### `virtual ss_plugin_rc init(const char* config) = 0`

Initialize a plugin. This is *not* the constructor, but is called shortly after the plugin object has been allocated. The config is the config provided in the `plugin_initialize()` function. The plugin can parse this config and save it in the object.

### `virtual void destroy() = 0`

Destroy a plugin. This is *not* the destructor, but is called shortly before the object is deleted. The plugin can use this method to clean up any state that it does not want to clean up in the destructor.

### `virtual plugin_instance *create_instance(source_plugin &plugin) = 0`

Create an object that derives from `falcosecurity::plugin_instance` and return a pointer to the object. This is called during `plugin_open()`. The derived instance's `open()` method will be called by the SDK after receiving the derived instance pointer from this function.

### `virtual std::string event_to_string(const uint8_t *data, uint32_t datalen) = 0`

Return a string representation of an event. The returned string will be held in the base class and passed back in `plugin_event_to_string()`.

The string representation should be on a single line and contain important information about the event. It is not necessary to return all information from the event. Simply return the most important fields/properties of the event that provide a useful default representation.

Here is an example output, from the [cloudtrail](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail) plugin:

```
us-east-1 masters.some-demo.k8s.local s3 GetObject Size=0 URI=s3://some-demo-env/some-demo.k8s.local/backups/etcd/events/control/etcd-cluster-created
```

### `virtual bool extract_str(const ss_plugin_event &evt, const std::string &field, const std::string &arg, std::string &extract_val) = 0`

Extract a single string field from an event. This is called during `plugin_extract_fields` as the base class loops over the provided set of fields. If the event has a meaningful value for the provided field, the derived class should return true and fill in `&extract_val` with the extracted value from the event. If the event does not have a meaningful value, the derived class should return false.

### `virtual bool extract_u64(const ss_plugin_event &evt, const std::string &field, const std::string &arg, uint64_t &extract_val) = 0`

Identical to `extract_str` but for uint64_t values.

## `falcosecurity::plugin_instance`: Base Class for Plugin Instances

The `falcosecurity::plugin_instance` class provides the base implementation for a plugin instance. An object is created (via `source_plugin::create_instance`) via `plugin_open()` and the object is deleted on `plugin_close()`.

The abstract interface for plugin authors is in the `falcosecurity::plugin_instance_iface` class and has the following methods:

### `virtual ss_plugin_rc open(const char* params) = 0`

Create necessary state to open a stream of events. This is called during `plugin_open()` shortly after calling `source_plugin::create_instance`. The provided params are the params provided to `plugin_open()`.

### `virtual void close() = 0`

Tear down any state created in `open()`. The object will be deleted shortly afterward.

### `virtual ss_plugin_rc next(plugin_event &evt) = 0`

Return a single event to the sdk. The sdk will handle managing memory for the events and passing them up to the framework in `plugin_next_batch()`. This method should return one of the following:

* `SS_PLUGIN_SUCCESS`: event ready and returned
* `SS_PLUGIN_FAILURE`: some error, no event returned. framework will close instance.
* `SS_PLUGIN_TIMEOUT`: no event ready. framework will try again later.
* `SS_PLUGIN_EOF`: no more events. framework will close instance.

### `virtual std::string get_progress(uint32_t &progress_pct)`

Return the read progress, as a number between 0 (no data has been read) and 10000 (100% of the data has been read). This encoding allows the engine to print progress decimals without requiring to deal with floating point numbers (which could cause incompatibility problems with some languages).

`progress_pct` should be filled in with the read progress as a number. The returned string should be a string representation of the read progress. This might include the progress percentage along with additional context provided by the plugin.

This method does not have to be overridden--the base implementation simply returns a read progress of zero.

## `#define GEN_SOURCE_PLUGIN_API_HOOKS`: Generate C Plugin API Hooks

After creating derived classes and implementing the above methods, use this preprocessor define to generate C code that implements the plugin API functions. The preprocessor takes two arguments:

* `source_plugin_class_name`: the name of the class that derives from `falcosecurity::source_plugin` that represents a plugin.
* `source_plugin_instance_name`: the name of the class that derives from `falcosecurity::plugin_instance` that represents a plugin instance.

This preprocessor define should be called exactly once per plugin, to avoid generating duplicate symbols.

# Example Plugins Walkthrough

This section walks through the implementation of two plugins: `dummy` and `dummy_c`. They behave identically, returning artificial dummy information. One is written in Go and one is written in C++.

The dummy plugins return events that are just a number value that increases with each call to `next()`. Each increase is 1 plus a random "jitter" value that ranges from [0:jitter]. The jitter value is provided as configuration to the plugin in `plugin_init`. The starting value and maximum number of events is provided as open parameters to the plugin in `plugin_open`.

This will show how the above API functions are actually used in a functional plugin.

## Example Go plugin: `dummy`

The source code for this plugin can be found at [dummy.go](https://github.com/falcosecurity/plugins/blob/master/plugins/dummy/dummy.go).

### Initial header include

```go
package main

// #cgo CFLAGS: -I${SRCDIR}/../../
/*
#include <plugin_info.h>
*/
...
import (
	"github.com/falcosecurity/plugin-sdk-go"
	"github.com/falcosecurity/plugin-sdk-go/state"
	"github.com/falcosecurity/plugin-sdk-go/wrappers"
	"github.com/falcosecurity/plugin-sdk-go/free"	
)
```

Including `plugin_info.h` allows for direct use of generated Go types for C structs/types like `C.ss_plugin_event`, `C.ss_plugin_extract_field`, etc. The plugin-sdk-go module provides utility functions and types that handle some of the conversions between C types and Go types.

`plugin_info.h` is not included with the dummy plugin, but you can retrieve it from [here](https://github.com/falcosecurity/libs/blob/master/userspace/libscap/plugin_info.h). The exact value for CFLAGS will depend on the location of `plugin_info.h` relative to dummy.go. In the plugins repository, `plugin_info.h` is two directories above `dummy.go`, hence the `../../`.

The go module `falcosecurity/plugin-sdk-go` has its own [documentation](https://pkg.go.dev/falcosecurity/plugin-sdk-go) as well.

Note that because `plugin-sdk-go/wrappers` was imported, `plugin-sdk-go/free` was also imported, to define a `plugin_free_mem()` function that frees memory allocated in the wrapper functions.

### Info Functions

This plugin defines const strings/numbers for info properties and uses them in the exported `plugin_get_xxx` functions:

```go
// Plugin consts
const (
	PluginRequiredApiVersion        = "1.0.0"
	PluginID                 uint32 = 3
	PluginName                      = "dummy"
	PluginDescription               = "Reference plugin for educational purposes"
	PluginContact                   = "github.com/falcosecurity/plugins"
	PluginVersion                   = "1.0.0"
	PluginEventSource               = "dummy"
)
...

//export plugin_get_required_api_version
func plugin_get_required_api_version() *C.char {
	log.Printf("[%s] plugin_get_required_api_version\n", PluginName)
	return C.CString(PluginRequiredApiVersion)
}

//export plugin_get_type
func plugin_get_type() uint32 {
	log.Printf("[%s] plugin_get_type\n", PluginName)
	return sdk.TypeSourcePlugin
}

...
```

Note that each exported function must be prefaced with a commented `//export <NAME>` line, with no whitespace between the commented line and function definition.

Note that each go string is converted into an allocated C string by using `C.CString`.

### Defining Fields

This dummy plugin exports 3 fields:

* `dummy.value`: the value in the event, as a uint64
* `dummy.strvalue`: the value in the event, as a string
* `dummy.divisible`: this field takes an argument and returns 1 if the value in the event is divisible by the argument (a numeric divisor). For example, if the value was 12, `dummy.divisible[3]` would return 1 for that event.

Note that fields are represented in Go as `sinsp.FieldEntry` structs, which allows for easy json marshaling. The fields are marshaled to json using the `json` package and an allocated string is returned using `C.CString`.


```go
//export plugin_get_fields
func plugin_get_fields() *C.char {
	log.Printf("[%s] plugin_get_fields\n", PluginName)

	flds := []sdk.FieldEntry{
		{Type: "uint64", Name: "dummy.divisible", ArgRequired: true, Desc: "Return 1 if the value is divisible by the provided divisor, 0 otherwise"},
		{Type: "uint64", Name: "dummy.value", Desc: "The sample value in the event"},
		{Type: "string", Name: "dummy.strvalue", Desc: "The sample value in the event, as a string"},
	}

	b, err := json.Marshal(&flds)
	if err != nil {
		return nil
	}

	return C.CString(string(b))
}
```

### Returning Errors

When the plugin encounters an error, it saves the Error object in `pluginState.lastError`. `plugin_get_last_error` converts that error to a string, returns it, and clears the saved Error object.

Note the use of `state.Context` to obtain the wrapped pluginState struct that was originally added via a call to `state.SetContext()`.

```go
//export plugin_get_last_error
func plugin_get_last_error(pState unsafe.Pointer) *C.char {
	log.Printf("[%s] plugin_get_last_error\n", PluginName)

	ps := (*pluginState)(state.Context(pState))

	if ps.lastError != nil {
		str := C.CString(ps.lastError.Error())
		ps.lastError = nil
		return str
	}
	return nil
}
```

### Initializing/Destroying the Plugin

The plugin-level state is held in a `pluginState` struct. `plugin_init` creates a pluginState struct, parses the config argument, and uses `state.NewStateContainer()/state.SetContext()` to wrap a pointer to the pluginState struct so it can be returned from Cgo.

The wrapping is required as Cgo does not allow passing go pointers directly back to C. These functions behave in a similar way to go 1.17's [Handle](https://pkg.go.dev/runtime/cgo@go1.17#Handle) struct.

`plugin_destroy` frees the wrapped pluginState struct using `sinsp.Free()`:

```go
type pluginState struct {

	// A copy of the config provided to plugin_init()
	config string

	// When a function results in an error, this is set and can be
	// retrieved in plugin_get_last_error().
	lastError error

	// This reflects potential internal state for the plugin. In
	// this case, the plugin is configured with a jitter (e.g. a
	// random amount to add to the sample with each call to Next()
	jitter uint64

	// Will be used to randomize samples
	rand *rand.Rand
}

//export plugin_init
func plugin_init(config *C.char, rc *int32) unsafe.Pointer {
	cfg := C.GoString(config)
	log.Printf("[%s] plugin_init config=%s\n", PluginName, cfg)

	// The format of cfg is a json object with a single param
	// "jitter", e.g. {"jitter": 10}
	var obj map[string]uint64
	err := json.Unmarshal([]byte(cfg), &obj)
	if err != nil {
		*rc = sdk.SSPluginFailure
		return nil
	}
	if _, ok := obj["jitter"]; !ok {
		*rc = sdk.SSPluginFailure
		return nil
	}

	ps := &pluginState{
		config:    cfg,
		lastError: nil,
		jitter:    obj["jitter"],
		rand:      rand.New(rand.NewSource(time.Now().UnixNano())),
	}

	// In order to avoid breaking the Cgo pointer passing rules,
	// we wrap the plugin state in a handle using
	// state.NewStateContainer()
	handle := state.NewStateContainer()
	state.SetContext(handle, unsafe.Pointer(ps))

	// This "wraps" the go-specific simple extraction functions,
	// taking care of the details of type conversion between go
	// types and C types.
	wrappers.RegisterExtractors(extract_str, extract_u64)

	*rc = sdk.SSPluginSuccess

	return handle
}

//export plugin_destroy
func plugin_destroy(pState unsafe.Pointer) {
	log.Printf("[%s] plugin_destroy\n", PluginName)

	// This frees the pluginState struct inside this handle
	state.Free(pState)
}
```

### Opening/Closing a Stream of Events

A plugin instance is represented as an instanceState struct. `plugin_open`/`plugin_close` behave similarly to `plugin_init`/`plugin_destroy`:

* Creating an instanceState struct.
* Parsing open params and populating the instanceState struct.
* Wrapping the instanceState struct so it can be returned by cgo.
* Free()ing the wrapped struct in `plugin_destroy`.

```go
type instanceState struct {

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
...
//export plugin_open
func plugin_open(pState unsafe.Pointer, params *C.char, rc *int32) unsafe.Pointer {
	prms := C.GoString(params)
	log.Printf("[%s] plugin_open, params: %s\n", PluginName, prms)

	ps := (*pluginState)(state.Context(pState))

	// The format of params is a json object with two params:
	// - "start", which denotes the initial value of sample
	// - "maxEvents": which denotes the number of events to return before EOF.
	// Example:
	// {"start": 1, "maxEvents": 1000}
	var obj map[string]uint64
	err := json.Unmarshal([]byte(prms), &obj)
	if err != nil {
		ps.lastError = fmt.Errorf("Params %s could not be parsed: %v", prms, err)
		*rc = sdk.SSPluginFailure
		return nil
	}
	if _, ok := obj["start"]; !ok {
		ps.lastError = fmt.Errorf("Params %s did not contain start property", prms)
		*rc = sdk.SSPluginFailure
		return nil
	}

	if _, ok := obj["maxEvents"]; !ok {
		ps.lastError = fmt.Errorf("Params %s did not contain maxEvents property", prms)
		*rc = sdk.SSPluginFailure
		return nil
	}

	is := &instanceState{
		initParams: prms,
		maxEvents:  obj["maxEvents"],
		counter:    0,
		sample:     obj["start"],
	}

	handle := state.NewStateContainer()
	state.SetContext(handle, unsafe.Pointer(is))

	*rc = sdk.SSPluginSuccess
	return handle
}

//export plugin_close
func plugin_close(pState unsafe.Pointer, iState unsafe.Pointer) {
	log.Printf("[%s] plugin_close\n", PluginName)

	state.Free(iState)
}
```

### Returning Events

The plugin does not populate a `ss_plugin_event` struct directly. Instead, a higher-level function `Next()` populates and returns a `sdk.PluginEvent` struct. `plugin_next` is a small wrapper function that calls `Next()` and uses `wrappers.Events()` to convert the `sdk.PluginEvent` struct to a `C.ss_plugin_event` struct.

Similarly, the plugin's `plugin_next_batch` uses a wrapper function `wrappers.NextBatch()`, which calls Next() as needed to prepare a batch of events, and uses `wrappers.Events()` to convert the batch to an array of `C.ss_plugin_event` structs.

For this plugin, the event payload is simply the sample value as a null-terminated C string.

Notice that although the function returns a `sdk.PluginEvent` struct, it does *not* fill in the Evtnum field. This is because event numbers are assigned by the plugin framework. The event number will be returned in calls to extract_fields, however.

```go
// This higher-level function will be called by both plugin_next and plugin_next_batch
func Next(pState unsafe.Pointer, iState unsafe.Pointer) (*sdk.PluginEvent, int32) {
	log.Printf("[%s] Next\n", PluginName)

	ps := (*pluginState)(state.Context(pState))
	is := (*instanceState)(state.Context(iState))

	is.counter++

	// Return eof if reached maxEvents
	if is.counter >= is.maxEvents {
		return nil, sdk.SSPluginEOF
	}

	// Increment sample by 1, also add a jitter of [0:jitter]
	is.sample += 1 + uint64(ps.rand.Int63n(int64(ps.jitter+1)))

	// The representation of a dummy event is the sample as a string.
	str := strconv.Itoa(int(is.sample))

	// It is not mandatory to set the Timestamp of the event (it
	// would be filled in by the framework if set to uint_max),
	// but it's a good practice.
	//
	// Also note that the Evtnum is not set, as event numbers are
	// assigned by the plugin framework.
	evt := &sdk.PluginEvent{
		Data:      []byte(str),
		Timestamp: uint64(time.Now().Unix()) * 1000000000,
	}

	return evt, sdk.SSPluginSuccess
}

//export plugin_next
func plugin_next(pState unsafe.Pointer, iState unsafe.Pointer, retEvt **C.ss_plugin_event) int32 {
	log.Printf("[%s] plugin_next\n", PluginName)

	evt, res := Next(pState, iState)
	if res == sdk.SSPluginSuccess {
		*retEvt = (*C.ss_plugin_event)(wrappers.Events([]*sdk.PluginEvent{evt}))
	}

	return res
}

// This wraps the simpler Next() function above and takes care of the
// details of assembling multiple events.

//export plugin_next_batch
func plugin_next_batch(pState unsafe.Pointer, iState unsafe.Pointer, nevts *uint32, retEvts **C.ss_plugin_event) int32 {
	evts, res := wrappers.NextBatch(pState, iState, Next)

	if res == sdk.SSPluginSuccess {
		*retEvts = (*C.ss_plugin_event)(wrappers.Events(evts))
		*nevts = (uint32)(len(evts))
	}

	log.Printf("[%s] plugin_next_batch\n", PluginName)

	return res
}
```

### Printing Events As Strings

Since a plugin event is simply a C-style null terminated string containing the current sample value, `plugin_event_to_string` simply returns that value as a json object, converted to a C string using `C.CString`:

```go
//export plugin_event_to_string
func plugin_event_to_string(pState unsafe.Pointer, data *C.uint8_t, datalen uint32) *C.char {

	// This can blindly convert the C.uint8_t to a *C.char, as this
	// plugin always returns a C string as the event buffer.
	evtStr := C.GoStringN((*C.char)(unsafe.Pointer(data)), C.int(datalen))

	log.Printf("[%s] plugin_event_to_string %s\n", PluginName, evtStr)

	// The string representation of an event is a json object with the sample
	s := fmt.Sprintf("{\"sample\": \"%s\"}", evtStr)
	return C.CString(s)
}
```

### Extracting Fields

Similar to Next(), the implementation of field extraction is performed by higher-level go functions `extract_str`/`extract_u64` that work on a single field and are type-specific based on the field value (string vs uint64).

These higher-level go functions are passed to the `plugin-sdk-go/wrappers` module by calling `wrappers.RegisterExtractors()` in `plugin_init`. Importing `plugin-sdk-go/wrappers` defines a `plugin_extract_fields` function that in turn calls these higher-level go functions and additionally takes care of the conversion between Go types and C types as well as iterating over the list of fields.

```go
// This plugin only needs to implement simpler single-field versions
// of extract_str/extract_u64. A utility function will take these
// functions as arguments and handle the work of conversion/iterating
// over fields.
func extract_str(pState unsafe.Pointer, evtnum uint64, data []byte, ts uint64, field string, arg string) (bool, string) {
	log.Printf("[%s] extract_str\n", PluginName)

	ps := (*pluginState)(state.Context(pState))

	switch field {
	case "dummy.strvalue":
		return true, string(data)
	default:
		ps.lastError = fmt.Errorf("No known field %s", field)
		return false, ""
	}
}

func extract_u64(pState unsafe.Pointer, evtnum uint64, data []byte, ts uint64, field string, arg string) (bool, uint64) {
	log.Printf("[%s] extract_str\n", PluginName)

	ps := (*pluginState)(state.Context(pState))

	val, err := strconv.Atoi(string(data))
	if err != nil {
		return false, 0
	}

	switch field {
	case "dummy.value":
		return true, uint64(val)
	case "dummy.divisible":
		// The argument contains the divisor as a string
		divisor, err := strconv.Atoi(arg)
		if err != nil {
			ps.lastError = fmt.Errorf("Argument to dummy.divisible %s could not be converted to number", arg)
			return false, 0
		}
		if val%divisor == 0 {
			return true, 1
		} else {
			return true, 0
		}
	default:
		ps.lastError = fmt.Errorf("No known field %s", field)
		return false, 0
	}
}
```

### Plugin In Action

This plugin can be configured in Falco by adding the following to falco.yaml:

```yaml
plugins:
  - name: dummy
    library_path: /tmp/my-plugins/dummy/libdummy.so
    init_config: '{"jitter": 10}'
    open_params: '{"start": 1, "maxEvents": 20}'

# Optional
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
Wed Sep  1 14:41:53 2021: Falco version 0.20.0-737+849fb98 (driver version new/plugin-system-api-additions)
Wed Sep  1 14:41:53 2021: Falco initialized with configuration file ../falco-files/falco.yaml
Wed Sep  1 14:41:53 2021: Loading plugin (dummy) from file /tmp/my-plugins/dummy/libdummy.so
2021/09/01 14:41:53 [dummy] plugin_get_required_api_version
2021/09/01 14:41:53 [dummy] plugin_get_type
2021/09/01 14:41:53 [dummy] plugin_get_name
2021/09/01 14:41:53 [dummy] plugin_get_description
2021/09/01 14:41:53 [dummy] plugin_get_contact
2021/09/01 14:41:53 [dummy] plugin_get_version
2021/09/01 14:41:53 [dummy] plugin_get_required_api_version
2021/09/01 14:41:53 [dummy] plugin_get_fields
2021/09/01 14:41:53 [dummy] plugin_get_id
2021/09/01 14:41:53 [dummy] plugin_get_event_source
2021/09/01 14:41:53 [dummy] plugin_init config={"jitter": 10}
Wed Sep  1 14:41:53 2021: Loading rules from file ../falco-files/dummy_rules.yaml:
2021/09/01 14:41:53 [dummy] plugin_get_name
2021/09/01 14:41:53 [dummy] plugin_get_id
2021/09/01 14:41:53 [dummy] plugin_open, params: {"start": 1, "maxEvents": 20}
Wed Sep  1 14:41:53 2021: Starting internal webserver, listening on port 8765
2021/09/01 14:41:53 [dummy] Next
2021/09/01 14:41:53 [dummy] Next
2021/09/01 14:41:53 [dummy] Next
2021/09/01 14:41:53 [dummy] Next
2021/09/01 14:41:53 [dummy] Next
2021/09/01 14:41:53 [dummy] plugin_next_batch
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_event_to_string 24
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_event_to_string 24
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_event_to_string 54
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_event_to_string 54
14:41:53.000000000: Notice A dummy event (event={"sample": "24"} sample=24 sample_str=24 num=4)
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] plugin_extract_fields
14:41:53.000000000: Notice A dummy event (event={"sample": "54"} sample=54 sample_str=54 num=7)
2021/09/01 14:41:53 [dummy] extract_str
2021/09/01 14:41:53 [dummy] Next
2021/09/01 14:41:53 [dummy] plugin_next_batch
2021/09/01 14:41:53 [dummy] plugin_close
2021/09/01 14:41:53 [dummy] plugin_close
```

# Example C plugin: `dummy_c`

The source code for this plugin can be found at [dummy.cpp](https://github.com/falcosecurity/plugins/blob/master/plugins/dummy_c/dummy.cpp).

### Initial header include

`falcosecurity_plugin.h` is the C++ sdk, and declares the base classes and preprocessor define to generate plugin API C functions. It also includes `plugin_info.h`, which defines structs/enums like `ss_plugin_t`, `ss_instance_t`, `ss_plugin_event`, etc, as well as function return values like SS_PLUGIN_SUCCESS, SS_PLUGIN_FAILURE, etc. The [json](https://github.com/nlohmann/json) header file provides helpful c++ classes to parse/represent json objects.

```c++
#include <string>
#include <stdio.h>
#include <stdlib.h>

#include "nlohmann/json.hpp"

#include <falcosecurity_plugin.h>

using json = nlohmann::json;
```

### `dummy_plugin` class: plugin object

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

### Returning Plugin Info

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

### Plugin Initialization and Destroy

`dummy_plugin::init` initializes the plugin. It parses the (JSON) config string and extracts a configured jitter value from the config. `dummy_plugin::destroy` is a no-op.

```c++
ss_plugin_rc dummy_plugin::init(const char *config)
{
	m_config = config;

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
		// No need to call set_last_error() here as the plugin
		// struct doesn't exist to the framework yet.
		return SS_PLUGIN_FAILURE;
	}

	auto it = obj.find("jitter");

	if(it == obj.end())
	{
		// No need to call set_last_error() here as the plugin
		// struct doesn't exist to the framework yet.
		return SS_PLUGIN_FAILURE;
	}

	m_jitter = *it;

	return SS_PLUGIN_SUCCESS;
}

void dummy_plugin::destroy()
{
}
```

### Creating Plugin Instances

`dummy_plugin::create_instance` creates a `dummy_instance` object and returns it. Note that in this case, the constructor takes a reference to a `dummy_plugin` object (cast from `falcosecurity::source_plugin`) so instances can have access back to the plugin.

```c++
falcosecurity::plugin_instance *dummy_plugin::create_instance(falcosecurity::source_plugin &plugin)
{
	return new dummy_instance((dummy_plugin &) plugin);

}
```

### Returning String Representations of Events

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

### Extracting Values

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

### `dummy_instance` class: plugin instance object

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

### Opening/Closing Event Streams

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

### Returning Events

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

### Generating Plugin API Functions

The plugin uses `GEN_SOURCE_PLUGIN_API_HOOKS` to generate plugin API functions, using the name of the derived classes `dummy_plugin` and `dummy_instance`:

```c++
GEN_SOURCE_PLUGIN_API_HOOKS(dummy_plugin, dummy_instance)
```

### Plugin In Action

`falco.yaml` is slightly different than for the Go plugin, with a different plugin name/library path and a different value for `load_plugins`. However, the rules file is unchanged, as both plugins use the same event source `dummy`, even though the two plugins have different IDs. This works because both plugins use the same representation for event data payloads (the sample as a string).

```yaml
plugins:
  - name: dummy_c
    library_path: /tmp/my-plugins/dummy_c/libdummy_c.so
    init_config: '{"jitter": 10}'
    open_params: '{"start": 1, "maxEvents": 20}'

# Optional
load_plugins: [dummy_c]
```

```yaml
- rule: My Dummy Rule
  desc: My Desc
  condition: evt.num > 0 and evt.num < 10 and dummy.divisible[3] = 1
  output: A dummy event (event=%evt.plugininfo sample=%dummy.value sample_str=%dummy.strvalue num=%evt.num)
  priority: INFO
  source: dummy
```

```
$ ./falco -r ../falco-files/dummy_rules.yaml -c ../falco-files/falco.yaml
Fri Oct 29 14:18:53 2021: Falco version 0.30.0-29+2d624a2 (driver version b9d2fccebf0feb94729c78bee0368c70d9c24819)
Fri Oct 29 14:18:53 2021: Falco initialized with configuration file ../falco-files/falco.yaml
Fri Oct 29 14:18:53 2021: Loading plugin (dummy_c) from file /mnt/sf_mstemm/Documents/work/src/plugins/plugins/dummy_c/libdummy_c.so
Fri Oct 29 14:18:53 2021: Loading rules from file ../falco-files/dummy_rules.yaml:
Fri Oct 29 14:18:53 2021: Starting internal webserver, listening on port 8765
14:18:53.941207000: Notice A dummy event (event={"sample": 12} sample=12 sample_str=12 num=2)
14:18:53.942443000: Notice A dummy event (event={"sample": 18} sample=18 sample_str=18 num=4)
14:18:53.942498000: Notice A dummy event (event={"sample": 39} sample=39 sample_str=39 num=8)
14:18:53.942526000: Notice A dummy event (event={"sample": 42} sample=42 sample_str=42 num=9)
Events detected: 4
Rule counts by severity:
   INFO: 4
Triggered rules by rule name:
   My Dummy Rule: 4
Syscall event drop monitoring:
   - event drop detected: 0 occurrences
   - num times actions taken: 0
```
