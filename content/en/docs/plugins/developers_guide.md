---
title: Falco Plugins Developers Guide
weight: 1
---

# Introduction

This page is a guide for developers who want to write their own Falco/Falco libs plugins. It provides full details on the plugins API, walks through the source code of two example plugins to show how the API is used, and presents some best practices on how to use the API.

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

## Every String or Struct Must Be Allocated

Every API function that returns or populates a string or struct pointer must point to memory allocated by the plugin (typically `malloc()`). The plugin framework will free the allocated memory with calls to `plugin_free_mem()`. In the typical case where memory was allocated via `malloc()`, the implementation of `plugin_free_mem(void *ptr)` should just call `free(ptr)`.

For plugins written in Go, the [plugin-sdk-go](https://github.com/falcosecurity/plugin-sdk-go) module provides utility functions that handle the conversion between Go types (e.g. `string`) and C types (e.g. `char *`), as well as a package `plugin-sdk-go/free` that defines a version of `plugin_free_mem()` that calls `free()`.

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

Similarly, it may be confusing to distinguish between state for a plugin (e.g. `ss_plugin_t`/`ss_instance_t`) as compared to the actual data that ends up in an event. This is especially important when thinking about fields and what they represent. A good rule of thumb to follow is that fields should *only* extract data from events, and not internal state. This behavior is encouraged by *not* providing a `ss_instance_t` handle as an argument to `plugin_extract_fields` (see below).

For example, assume some plugin returned a sample of a metric in events, and the internal state also held the maximum value seen so far. It would be fine to have a field `plugin.sample` that returned the value in a given event. It would *not* be fine to have a field `plugin.max_sample` that returned the maximum value seen, because that information is held in the internal state and not in events. If events *also* saved the current max sample so far, then it would be fine to have a field `plugin.max_sample`, as that can be retrieved directly from a single event.

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

# Plugin API Functions

Here is the full list of plugin API functions. At a high level, they can be grouped into three sections:

* Functions that provide info about the plugin, its events, and its fields.
* Functions that create/destroy instances of the plugin and capture sessions.
* Functions that provide events and extract information from events.

Remember that there are two kinds of plugins: source plugins and extractor plugins. We'll go through the API functions for both kinds of plugins.

The C header file [plugin_info.h](https://github.com/falcosecurity/libs/blob/new/plugin-system-api-additions/userspace/libscap/plugin_info.h) enumerates all the API functions and associated structs/types, as they are used by the plugins framework. It can be included in your source code when writing your own plugin, to take advantage of values like `PLUGIN_API_VERSION_XXX`, `ss_plugin_type`, etc.

Remember, however, that from the perspective of the plugin, each function name has a prefix `plugin_` e.g. `plugin_get_required_api_version()`, `plugin_get_type()`, etc.

## Conventions For All Functions

The following conventions apply for all of the below API functions:

* Every function that returns or populates a `char *` must return a null-terminated C string.
* Every function that returns or populates a `char *` or a struct pointer must allocate the memory for the string/struct (typically `malloc()`). The plugin framework will free the allocated memory using `plugin_free_mem()`.
* For every function that returns an error, if the function returns an error, the plugin framework will assume that no strings/structs were allocated and will not call `plugin_free_mem()` on any values.

## Source Plugin API Functions

### Info Functions

#### `char* plugin_get_required_api_version() [Required: yes]`

This function returns a string containing a [semver](https://semver.org/) version number e.g. "1.0.0", reflecting the version of the plugin API framework that this plugin requires. This is different than the version of the plugin itself, and should only have to change when the plugin API changes.

This is the first function the framework calls when loading a plugin. If the returned value is not semver-compatible with the version of the plugin API framework, the plugin will not be loaded.

For example, if the code implementing the plugin framework has version 1.1.0, and a plugin's `plugin_get_required_api_version()` function returns 1.0.0, the plugin API is compatible and the plugin will be loaded. If the code implementing the plugin framework has version 2.0.0, and a plugin's `plugin_get_required_api_version()` function returns 1.0.0, the API is not compatible and the plugin will not be loaded.

#### `uint32_t plugin_get_type() [Required: yes]`

This function returns the plugin type. The enum `ss_plugin_type` in `plugin_info.h` defines the possible plugin types:

```C
typedef enum ss_plugin_type
{
	TYPE_SOURCE_PLUGIN = 1,
	TYPE_EXTRACTOR_PLUGIN = 2
}ss_plugin_type;
```

For source plugins, this function should always return the value `TYPE_SOURCE_PLUGIN` e.g. 1.

#### `uint32_t plugin_get_id() [Required: yes]`

This should return the [event ID](../../plugins#plugin-event-ids) allocated to your plugin. During development and before receiving an official event ID, you can use the "Test" value of 999.

#### `char * plugin_get_{name,description,contact,version} [Required: yes]`

These functions all return an allocated C string that describe the plugin:

* `plugin_get_name`: Return the name of the plugin.
* `plugin_get_description`: Return a short description of the plugin.
* `plugin_get_contact`: Return a contact url/email/twitter account for the plugin authors.
* `plugin_get_version`: Return the version of the plugin itself.

The recommended format for `plugin_get_contact` is a url to a repository that contains the plugin source code (e.g. `github.com/falcosecurity/plugins`) if at all possible.

#### `char * plugin_get_event_source() [Required: yes]`

This function returns an allocated C string containing the plugin's [event source](../../plugins/#plugin-event-sources-and-interoperability). This event source is used for:

* Associating Falco rules with plugin events--A Falco rule with a `source: gizmo` property will run on all events returned by the gizmo plugin's `next()` function.
* Linking together extractor plugins and source plugins. An extractor plugin can list a given event source like "gizmo" in its `get_extract_event_sources()` function, and the extractor plugin will get an opportunity to extract fields from all events returned by the gizmo plugin.
* Ensuring that only one plugin at a time is loaded for a given source.

When defining a source, make sure it accurately describes the events from your plugin (e.g. use "cloudtrail" for aws cloudtrail events, not "json" or "logs") and doesn't overlap with the source of any other source plugin.

The only time where duplicate sources make sense are when a group of plugins can use a standard data format for a given event. For example, plugins might extract k8s_audit events from multiple cloud sources like gcp, azure, aws, etc. If they all format their events as json objects that have identical formats as one could obtain by using [K8s Audit](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/) hooks, then it would make sense for the plugins to use the same source.

#### `char *plugin_get_fields() [Required: no]`

This function should return the set of fields supported by the plugin. Remember, a field is a name (e.g. `proc.name`) that can extract a value (e.g. `nginx`) from an event (e.g. a syscall event involving a process). The format is a json string which contains an array of objects. Each object describes one field. Here's an example:

```json
[
   {"type": "string", "name": "gizmo.field1", "argRequired": true, "desc": "Describing field 1"},
   {"type": "uint64", "name": "gizmo.field2", "desc": "Describing field 2"}
]
```

Although uncommon, this function is not required--a source plugin might inject events but not define any fields that extract values from events. This might be common if the extraction could be performed by extraction plugins.

Each object has the following properties:

* `type`: one of "string", "uint64"
* `name`: a string with a name for the field. By convention, this is a dot-separated path of names. Use a consistent first name e.g. "ct.xxx" to help filter authors associate the field with a given plugin.
* `argRequired`: (optional) If present and set to true, notes that the field requires an argument e.g. `field[arg]`.
* `display`: (optional) If present, a string that will be used to display the field instead of the name. Used in tools like wireshark.
* `desc`: a string with a short description of the field. This will be used in help output so be concise and descriptive.

When defining fields, keep the following guidelines in mind:

* Field names should generally have the plugin name/event source as the first component, and usually have one or two additional components. For example, `gizmo.pid` is preferred over `gizmo.process.id.is`. If a plugin has a moderately large set of fields, using components to group fields may make sense (e.g. `cloudtrail.s3.bytes.in` and `cloudtrail.s3.bytes.out`).
* Fields should be idempotent: for a given event, the value for a field should be the same regardless of when/where the event was generated.
* Fields should be neutral: define fields that extract properties of the event (e.g. "source ip address") rather than judgements (e.g. "source ip address is associated with a botnet").

### Instance/Capture Management Functions

#### `ss_plugin_t* plugin_init(char *config, int32_t* rc) [Required: yes]`

This function passes plugin-level configuration to the plugin to create its plugin-level state. The plugin then returns a pointer to that state, as a `ss_plugin_t *` handle. The handle is never examined by the plugin framework and is never freed. It is only provided as the argument to later API functions.

When managing plugin-level state, keep the following in mind:

* It is the plugin's responsibility to allocate plugin state (memory, open files, etc) and free that state later in `plugin_destroy`.
* The plugin state should be the *only* location for state (e.g. no globals, no per-thread state). Although unlikely, the framework may choose to call `plugin_init` multiple times for the same plugin, and this should be supported by the plugin.
* The returned rc value should be `SS_PLUGIN_SUCCESS` (0) on success, `SS_PLUGIN_FAILURE` (1) on failure.
* On failure, make sure to return a meaningful error message in the next call to `plugin_get_last_error()`.
* On failure, the plugin framework will *not* call plugin_destroy, so do not return any allocated state.

The format of the config string is entirely determined by the plugin author, and is passed unchanged from Falco/the application using the plugin framework to the plugin. Given that, semi-structured formats like JSON/YAML are preferable to free-form text.

#### `void plugin_destroy(ss_plugin_t *s) [Required: yes]`

This function frees any resources held in the `ss_plugin_t` struct. Afterwards, the handle should be considered destroyed and no further API functions will be called with that handle.

#### `ss_instance_t* plugin_open(ss_plugin_t* s, char* params, int32_t* rc) [Required: yes]`

This function is called to "open" a stream of events. The interpretation of a stream of events is up to the plugin author, but think of `plugin_init` as initializing the plugin software, and `plugin_open` as configuring the software to return events. Using a streaming audio analogy, `plugin_init` turns on the app, and `plugin_open` starts a streaming audio channel.

The same general guidelines apply for `plugin_open` as do for `plugin_init`:

* All state related to sourcing a stream of events should be in the returned `ss_instance_t` pointer.
* Return 0 on success, 1 on error. Be ready to return an error via `plugin_get_last_error()` on error.
* The plugin should support concurrent open sessions at once. Unlike plugin-level state, it's very likely that the plugin framework might call `plugin_open` multiple times for a given plugin.
* On error, do not return any state, as the plugin framework will not call `plugin_close`.

#### `void plugin_close(ss_plugin_t* s, ss_instance_t* h) [Required: yes]`

This function closes a stream of events previously started via a call to `plugin_open`. Afterwards, the stream should be considered closed and the framework will not call `plugin_next`/`plugin_extract_fields` with the same `ss_instance_t` pointer.

### Misc Functions

#### `void plugin_get_last_error(ss_plugin_t* s)`

This function is called by the framework after a prior call returned an error. The plugin should return a meaningful error string providing more information about the most recent error.

#### `void plugin_free_mem(void *ptr)`

This function is called by the framework to free any allocated memory (string, structs, event payloads) passed from the plugin to the framework.

### Events/Fields Related Functions

#### `int32_t plugin_next(ss_plugin_t* s, ss_instance_t* h, ss_plugin_event **evt) [Required: yes]`

This function is used to return the next event to the plugin framework, given a plugin state and open instance.

An event is represented by a `ss_plugin_event` struct, which is the following:

```C
typedef struct ss_plugin_event
{
	uint64_t evtnum;
	uint8_t *data;
	uint32_t datalen;
	uint64_t ts;
} ss_plugin_event;
````

The struct has the following members:

* `evtnum`: incremented for each event returned. Might not be contiguous.
* `data`: pointer to a memory buffer pointer allocated by the plugin. The plugin will set it to point to the memory containing the next event. Once returned, the memory is owned by the plugin framework and will be freed via a call to `plugin_free_mem()`.
* `datalen`: pointer to a 32bit integer. The plugin will set it the size of the buffer pointed by data.
* `ts`: the event timestamp, in nanoseconds since the epoch. Can be (uint64_t)-1, in which case the engine will automatically fill the event time with the current time.

Remember that *both* the event data in `data` as well as the surrounding struct in `evt` must be allocated by the plugin and will be freed by the plugin framework.

It is not necessary to fill in the evtnum struct member when returning events via plugin_next/plugin_next_batch. Event numbers are allocated by the plugin framework.

This function should return:

* `SS_PLUGIN_SUCCESS` (0) on success
* `SS_PLUGIN_FAILURE` (1) on failure
* `SS_PLUGIN_TIMEOUT` (-1) on non-error but there are no events to return.
* `SS_PLUGIN_EOF` (6) when the stream of events is complete.

If the plugin receives a SS_PLUGIN_FAILURE, it will close the stream of events by calling `plugin_close`.

SS_PLUGIN_TIMEOUT should be returned whenever an event can not be returned immediately. This ensures that the plugin framework is not stalled waiting for a response from `plugin_next`. When the framework receives a SS_PLUGIN_TIMEOUT, it will keep the stream of events open and call `plugin_next` again later.

#### `int32_t plugin_next_batch(ss_plugin_t* s, ss_instance_t* h, uint32_t *nevts, ss_plugin_event **evts) [Required: no]`

This function is the batched version of `plugin_next` and allows the plugin to return multiple events at once. The behavior and return values are the same as `plugin_next`. In this case, the array is a contiguous block of `ss_plugin_event` structs that should be allocated by the plugin.

This function is optional. If not defined the plugin framework will only call `plugin_next()` to retrieve events.

If your plugin is written in Go, the [plugin-sdk-go](https://github.com/falcosecurity/plugin-sdk-go) module provides a utility function `sinsp.NextBatch` that can wrap a plugin's `next()` function and take care of the conversion/allocation from Go types to C types. That package is described in more detail below.

#### `char* plugin_get_progress(ss_plugin_t* s, ss_instance_t* h, uint32_t* progress_pct) [Required: no]`

This function is optional. If the plugin exports it, the framework will periodically call it after open to return how much of the event stream has been read. If a plugin does not provide a bounded stream of events (for example, events coming from a file or other source that has an ending), it should not export this function.

If not exported, the plugin framework will not print meaningful process indicators while processing event streams.

When called, the progress_pct pointer should be updated with the read progress, as a number between 0 (no data has been read) and 10000 (100% of the data has been read). This encoding allows the engine to print progress decimals without requiring to deal with floating point numbers (which could cause incompatibility problems with some languages).

The return value is an allocated string representation of the read progress. This might include the progress percentage combined with additional context added by the plugin. The plugin can return NULL. In this case, the framework will use the progress_pct value instead.

#### `char * plugin_event_to_string(ss_plugin_t *s, const uint8_t *data, uint32_t datalen) [Required: yes]`

This function is used to return a printable representation of an event. It is used in filtering/output expressions as the built-in field `evt.plugininfo`.

The string representation should be on a single line and contain important information about the event. It is not necessary to return all information from the event. Simply return the most important fields/properties of the event that provide a useful default representation.

Here is an example output, from the [cloudtrail](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail) plugin:

```
us-east-1 masters.some-demo.k8s.local s3 GetObject Size=0 URI=s3://some-demo-env/some-demo.k8s.local/backups/etcd/events/control/etcd-cluster-created
```

#### `int32_t plugin_extract_fields(ss_plugin_t *s, const ss_plugin_event *evt, uint32_t num_fields, ss_plugin_extract_field *fields) [Required: no]`

This function is used to return the value for one or more field names that were returned in `plugin_get_fields()`. The framework provides an event and an array of `ss_plugin_extract_field` structs. Each struct has one field name/type, and the plugin fills in each struct with the corresponding value for that field.

This function is required if `plugin_get_fields` is defined. If not defined, the plugin framework will not extract any values for events from this plugin.

The format of the `ss_plugin_extract_field` struct is the following:

```C
// The noncontiguous numbers are to maintain equality with underlying
// falcosecurity libs types.
typedef enum ss_plugin_field_type
{
	FTYPE_UINT64 = 8,
	FTYPE_STRING = 9
}ss_plugin_field_type;

typedef struct ss_plugin_extract_field
{
	const char *field;
	const char *arg;
	uint32_t ftype;      // Has value from ss_plugin_field_type enum

	bool field_present;
	char *res_str;
	uint64_t res_u64;
} ss_plugin_extract_field;
```

For each struct, the plugin fills in `field`/`arg`/`ftype` with the field. The plugin should fill in `field_present` and either `res_str`/`res_u64` with the value for the field, depending on the field type `ftype`. If the field type is `FTYPE_STRING`, res_str should be updated to point to an allocated string with the string value. The plugin framework will free the string value afterwards via a call to `plugin_free_mem()`.

If `field_present` is set to false, the plugin framework assumes that `res_str`/`res_u64` is undefined and will not use or free it.

Similar to `next_batch()`, the [plugin-sdk-go](https://github.com/falcosecurity/plugin-sdk-go) module provides a utility function `sinsp.WrapExtractFuncs` that can wrap simpler functions that extract individual values and handle the type conversion/iteration over fields. That package is described in more detail below.

## Extractor Plugin API Functions

With the exception of `plugin_get_extract_event_sources`, almost all functions used by the Extractor Plugin API interface are identical to those in the Source Plugin API. See above for the definition and use of:

* `plugin_get_required_api_version`
* `plugin_get_type`: for extractor plugins, this should return `TYPE_EXTRACTOR_PLUGIN` e.g. 1.
* `plugin_init`
* `plugin_destroy`
* `plugin_get_last_error`
* `plugin_free_mem`
* `plugin_get_name`
* `plugin_get_description`
* `plugin_get_contact`
* `plugin_get_version`
* `plugin_get_fields`
* `plugin_extract_fields`

The only difference is that for Extractor plugins, `plugin_get_fields`/`plugin_extract_fields` are both required.

### `char* get_extract_event_sources() [Required: no]`

This function allows an extractor plugin to restrict the kinds of events where the plugin's `get_fields()` method will be called. The return value should be an allocated string containing a json array of compatible event sources. Here's an example:

```json
["aws_cloudtrail", "gcp_cloudtrail"]
```

This implies that the extractor plugin can potentially extract values from events that have a source `aws_cloudtrail` or `gce_cloudtrail`.

This function is optional. If the plugin does not export this function the framework will assume the extractor plugin can potentially extract values from all events. The extractor plugin's `extract_fields()` function will be called for all events for any field returned by the plugin's `get_fields()` function.

# Example Plugins Walkthrough

This section walks through the implementation of two plugins: `dummy` and `dummy_c`. They behave identically, returning artificial dummy information. One is written in Go and one is written in C++.

The dummy plugins return events that are just a number value that increases with each call to `plugin_next`. Each increase is 1 plus a random "jitter" value that ranges from [0:jitter]. The jitter value is provided as configuration to the plugin in `plugin_init`. The starting value and maximum number of events is provided as open parameters to the plugin in `plugin_open`.

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

`plugin_info.h` defines structs/enums like `ss_plugin_t`, `ss_instance_t`, `ss_plugin_event`, etc, as well as function return values like SS_PLUGIN_SUCCESS, SS_PLUGIN_FAILURE, etc. The [json](https://github.com/nlohmann/json) header file provides helpful c++ classes to parse/represent json objects.

```c++
#include <string>
#include <stdio.h>
#include <stdlib.h>

#include <nlohmann/json.hpp>

#include <plugin_info.h>

using json = nlohmann::json;
```

### Info Functions

This plugin defines const strings/values for info properties and uses them in the `plugin_get_xxx` functions. Note that since this plugin was written in C++, all of the `plugin_xxx` functions must be declared with `extern "C"`:

```c++
static const char *pl_required_api_version = "1.0.0";
static uint32_t    pl_type                 = TYPE_SOURCE_PLUGIN;
static uint32_t    pl_id                   = 4;
static const char *pl_name                 = "dummy_c";
static const char *pl_desc                 = "Reference plugin for educational purposes";
static const char *pl_contact              = "github.com/falcosecurity/plugins";
static const char *pl_version              = "1.0.0";
static const char *pl_event_source         = "dummy";
...
extern "C"
char* plugin_get_required_api_version()
{
	printf("[%s] plugin_get_required_api_version\n", pl_name);
	return strdup(pl_required_api_version);
}
...
```

### Defining Fields

This dummy plugin exports 3 fields:

* `dummy.value`: the value in the event, as a uint64
* `dummy.strvalue`: the value in the event, as a string
* `dummy.divisible`: this field takes an argument and returns 1 if the value in the event is divisible by the argument (a numeric divisor). For example, if the value was 12, `dummy.divisible[3]` would return 1 for that event.

A json string representing these fields is a static const string, and a copy is returned in `plugin_get_fields()`:

```c++
static const char *pl_fields               = R"(
[{"type": "uint64", "name": "dummy.divisible", "argRequired": true, "desc": "Return 1 if the value is divisible by the provided divisor, 0 otherwise"},
{"type": "uint64", "name": "dummy.value", "desc": "The sample value in the event"},
{"type": "string", "name": "dummy.strvalue", "desc": "The sample value in the event, as a string"}])";
...
extern "C"
char* plugin_get_fields()
{
	printf("[%s] plugin_get_fields\n", pl_name);
	return strdup(pl_fields);
}
```

### Returning Errors

When the plugin encounters an error, it saves the error string to plugin_state.last_error. `plugin_get_last_error` returns a copy of that string and clears the string.

```c++
extern "C"
char* plugin_get_last_error(ss_plugin_t* s)
{
	printf("[%s] plugin_get_last_error\n", pl_name);

	plugin_state *state = (plugin_state *) s;

	if(!state->last_error.empty())
	{
		char *ret = strdup(state->last_error.c_str());
		state->last_error = "";
		return ret;
	}

	return NULL;
}
```

### Freeing Memory

The dummy plugin allocates strings/structs passed to the framework using `malloc()`. In turn, the framework calls `plugin_free_mem()` to free any allocated memory:

```c++
extern "C"
void plugin_free_mem(void *ptr)
{
    free(ptr);
}
```

### Initializing/Destroying the Plugin

The plugin-level state is held in a `plugin_state` struct. `plugin_init` allocates a struct, parses the config argument, and returns a pointer to the allocated struct.

Note that the plugin uses `new()` to allocate the struct. This is allowed because the struct pointer is opaque and not modified/freed by the plugin framework.

`plugin_destroy` uses `delete()` to free the struct.

```c++
extern "C"
ss_plugin_t* plugin_init(char* config, int32_t* rc)
{
	printf("[%s] plugin_init config=%s\n", pl_name, config);

	json obj;

	try {
		obj = json::parse(config);
	}
	catch (std::exception &e)
	{
		return NULL;
	}

	auto it = obj.find("jitter");

	if(it == obj.end())
	{
		return NULL;
	}

	// Note: Using new/delete is okay, as long as the plugin
	// framework is not deleting the memory.
	plugin_state *ret = new plugin_state();
	ret->config = config;
	ret->last_error = "";
	ret->jitter = *it;

	*rc = SS_PLUGIN_SUCCESS;

	return ret;
}

extern "C"
void plugin_destroy(ss_plugin_t* s)
{
	printf("[%s] plugin_destroy\n", pl_name);

	plugin_state *ps = (plugin_state *) s;

	delete(ps);
}
```

### Opening/Closing a Stream of Events

A plugin instance is held in a `plugin_instance` struct. `plugin_open`/`plugin_close` behave similarly to `plugin_init`/`plugin_destroy`:

* Allocating a `plugin_instance` struct using `new()`.
* Parsing open params and populating the instance struct.
* Freeing the `plugin_instance` struct using `delete()` in `plugin_close`.

```c++
extern "C"
ss_instance_t* plugin_open(ss_plugin_t* s, char* params, int32_t* rc)
{
	printf("[%s] plugin_open params=%s\n", pl_name, params);

	plugin_state *ps = (plugin_state *) s;

	json obj;

	try {
		obj = json::parse(params);
	}
	catch (std::exception &e)
	{
		ps->last_error = std::string("Params ") + params + " could not be parsed: " + e.what();
		*rc = SS_PLUGIN_FAILURE;
		return NULL;
	}

	auto start_it = obj.find("start");
	if(start_it == obj.end())
	{
		ps->last_error = std::string("Params ") + params + " did not contain start property";
		*rc = SS_PLUGIN_FAILURE;
		return NULL;
	}

	auto max_events_it = obj.find("maxEvents");
	if(max_events_it == obj.end())
	{
		ps->last_error = std::string("Params ") + params + " did not contain maxEvents property";
		*rc = SS_PLUGIN_FAILURE;
		return NULL;
	}

	// Note: Using new/delete is okay, as long as the plugin
	// framework is not deleting the memory.
	instance_state *ret = new instance_state();
	ret->params = params;
	ret->counter = 0;
	ret->max_events = *max_events_it;
	ret->sample = *start_it;

	*rc = SS_PLUGIN_SUCCESS;

	return ret;
}

extern "C"
void plugin_close(ss_plugin_t* s, ss_instance_t* i)
{
	printf("[%s] plugin_close\n", pl_name);

	instance_state *istate = (instance_state *) i;

	delete(istate);
}
```

### Returning Events

`plugin_next` allocates and returns a `ss_plugin_event` struct. It increments the counter and sample, including a random jitter.

The event data representation is just the sample as a string. The plugin uses `std::to_string()`, `.c_str()`, and `strdup` to return an allocated data buffer in the `ss_plugin_event` struct.

Notice that although the function allocates and returns a `ss_plugin_event` struct, it does *not* fill in the evtnum struct member. This is because event numbers are assigned by the plugin framework. The event number will be returned in calls to extract_fields, however.

```c++
extern "C"
int32_t plugin_next(ss_plugin_t* s, ss_instance_t* i, ss_plugin_event **evt)
{
	printf("[%s] plugin_next\n", pl_name);

	plugin_state *state = (plugin_state *) s;
	instance_state *istate = (instance_state *) i;

	istate->counter++;

	if(istate->counter > istate->max_events)
	{
		return SS_PLUGIN_EOF;
	}

	// Increment sample by 1, also add a jitter of [0:jitter]
	istate->sample = istate->sample + 1 + (random() % (state->jitter + 1));

	// The event payload is simply the sample, as a string
	std::string payload = std::to_string(istate->sample);

	struct ss_plugin_event *ret = (struct ss_plugin_event *) malloc(sizeof(ss_plugin_event));

	ret->data = (uint8_t *) strdup(payload.c_str());
	ret->datalen = payload.size();

	// Let the plugin framework assign timestamps
	ret->ts = (uint64_t) -1;

	*evt = ret;

	return SS_PLUGIN_SUCCESS;
}
```

### Printing Events As Strings

Since a plugin event is simply a C-style null terminated string containing the sample value, `plugin_event_to_string` simply returns that value as a json object:

```c++
extern "C"
char *plugin_event_to_string(ss_plugin_t *s, const uint8_t *data, uint32_t datalen)
{
	printf("[%s] plugin_event_to_string\n", pl_name);

	plugin_state *state = (plugin_state *) s;

	// The string representation of an event is a json object with the sample
	std::string rep = "{\"sample\": ";
	rep.append((char *) data, datalen);
	rep += "}";

	return strdup(rep.c_str());
}
```

### Extracting Fields

Field extraction is handled in `plugin_extract_fields()`. Unlike the Go plugin, there is no higher-level function and this function handles all the details of iterating over the `ss_plugin_extract_fields *fields` array, finding the field/argument/type in each array element, and filling in the `field_present` and `res_u64`/`res_str` member of each element with the extracted value:

```
extern "C"
int32_t plugin_extract_fields(ss_plugin_t *s, const ss_plugin_event *evt, uint32_t num_fields, ss_plugin_extract_field *fields)
{
	printf("[%s] plugin_extract_fields\n", pl_name);

	std::string sample((char *) evt->data, evt->datalen);
	uint64_t isample = std::stoi(sample);

	for(uint32_t i=0; i < num_fields; i++)
	{
		ss_plugin_extract_field *field = &(fields[i]);

		if(strcmp(field->field, "dummy.divisible") == 0)
		{
			field->field_present = 1;

			uint64_t divisor = std::stoi(std::string(field->arg));
			if ((isample % divisor) == 0)
			{
				field->res_u64 = 1;
			}
			else
			{
				field->res_u64 = 0;
			}
		}
		else if (strcmp(field->field, "dummy.value") == 0)
		{
			field->field_present = 1;
			field->res_u64 = isample;
		}
		else if (strcmp(field->field, "dummy.strvalue") == 0)
		{
			field->field_present = 1;
			field->res_str = strdup(sample.c_str());
		}
		else
		{
			field->field_present = 0;
		}
	}

	return SS_PLUGIN_SUCCESS;
}
```

### Not Included: Batched Events

Note that unlike the Go plugin, this plugin does not implement `plugin_next_batch`. This is allowed--the plugin framework will simply use `plugin_next` to fetch individual events.

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
Wed Sep  1 19:19:35 2021: Falco version 0.20.0-737+849fb98 (driver version new/plugin-system-api-additions)
Wed Sep  1 19:19:35 2021: Falco initialized with configuration file ../falco-files/falco.yaml
Wed Sep  1 19:19:35 2021: Loading plugin (dummy_c) from file /tmp/my-plugins/dummy_c/libdummy_c.so
[dummy_c] plugin_get_required_api_version
[dummy_c] plugin_get_type
[dummy_c] plugin_get_name
[dummy_c] plugin_get_description
[dummy_c] plugin_get_contact
[dummy_c] plugin_get_version
[dummy_c] plugin_get_required_api_version
[dummy_c] plugin_get_fields
[dummy_c] plugin_get_id
[dummy_c] plugin_get_event_source
[dummy_c] plugin_init config={"jitter": 10}
Wed Sep  1 19:19:35 2021: Loading rules from file ../falco-files/dummy_rules.yaml:
[dummy_c] plugin_get_name
[dummy_c] plugin_get_id
[dummy_c] plugin_open params={"start": 1, "maxEvents": 20}
Wed Sep  1 19:19:35 2021: Starting internal webserver, listening on port 8765
[dummy_c] plugin_next
[dummy_c] plugin_extract_fields
[dummy_c] plugin_event_to_string
[dummy_c] plugin_extract_fields
[dummy_c] plugin_extract_fields
[dummy_c] plugin_event_to_string
[dummy_c] plugin_extract_fields
[dummy_c] plugin_extract_fields
[dummy_c] plugin_next
[dummy_c] plugin_extract_fields
[dummy_c] plugin_next
[dummy_c] plugin_extract_fields
[dummy_c] plugin_next
[dummy_c] plugin_extract_fields
[dummy_c] plugin_event_to_string
[dummy_c] plugin_extract_fields
[dummy_c] plugin_extract_fields
[dummy_c] plugin_event_to_string
[dummy_c] plugin_extract_fields
[dummy_c] plugin_extract_fields
[dummy_c] plugin_next
[dummy_c] plugin_extract_fields
[dummy_c] plugin_next
[dummy_c] plugin_extract_fields
[dummy_c] plugin_next
19:19:35.899897000: Notice A dummy event (event={"sample": 12} sample=12 sample_str=12 num=1)
[dummy_c] plugin_extract_fields
[dummy_c] plugin_event_to_string
[dummy_c] plugin_extract_fields
[dummy_c] plugin_extract_fields
[dummy_c] plugin_event_to_string
[dummy_c] plugin_extract_fields
[dummy_c] plugin_extract_fields
[dummy_c] plugin_next
[dummy_c] plugin_extract_fields
[dummy_c] plugin_next
[dummy_c] plugin_next
[dummy_c] plugin_next
[dummy_c] plugin_close
19:19:35.900068000: Notice A dummy event (event={"sample": 24} sample=24 sample_str=24 num=4)
19:19:35.900135000: Notice A dummy event (event={"sample": 48} sample=48 sample_str=48 num=7)
[dummy_c] plugin_close
```
