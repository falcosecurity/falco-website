---
title: Falco Plugins API Reference
weight: 2
aliases:
    - /docs/plugins/plugin_api_reference/
---

## Introduction

This page documents the functions that make up the Falco plugins API. In most cases, you will not need to implement these functions directly. There are [Go](https://github.com/falcosecurity/plugin-sdk-go) and [C++](https://github.com/falcosecurity/plugin-sdk-cpp) SDKs that provide an easier-to-use interface for plugin authors.

At a high level, the API functions can be grouped into three sections:

* Functions that provide info about the plugin, its events, and its fields.
* Functions that create/destroy plugins and open/close instances of the plugin (e.g. capture sessions).
* Functions that provide events and extract information from events.

Remember that there are two kinds of plugins: source plugins and extractor plugins. We'll go through the API functions for both kinds of plugins.

The C header file [plugin_info.h](https://github.com/falcosecurity/libs/blob/master/userspace/libscap/plugin_info.h) enumerates all the API functions and associated structs/types, as they are used by the plugins framework. It can be included in your source code when writing your own plugin, to take advantage of values like `PLUGIN_API_VERSION_XXX`, `ss_plugin_type`, etc.

Remember, however, that from the perspective of the plugin, each function name has a prefix `plugin_` e.g. `plugin_get_required_api_version()`, `plugin_get_type()`, etc.

### Conventions For All Functions

The following conventions apply for all of the below API functions:

* Every function that returns a `const char* ` must return a null-terminated C string.
* All string values returned across the API are considered owned by the plugin and must remain valid for use by the plugin framework. Specifically, this means:
    * For demographic functions like `plugin_get_name()`, `plugin_get_description()`, the returned strings must remain valid until the plugin is destroyed.
    * When returning events via `plugin_next_batch`, both the array of structs and the data payloads inside each struct must remain valid until the next call to `plugin_next_batch()`.
    * When returning extracted string values via `plugin_extract_fields`, every extracted string must remain valid until the next call to `plugin_extract_fields()`.
* For every function that returns an error, the plugin should save a meaningful error string that the framework can retrieve via a call to `plugin_get_last_error()`.

### Source Plugin API Functions

#### Info Functions

##### `const char* plugin_get_required_api_version() [Required: yes]`

This function returns a string containing a [semver](https://semver.org/) version number e.g. "1.0.0", reflecting the version of the plugin API framework that this plugin requires. This is different than the version of the plugin itself, and should only have to change when the plugin API changes.

This is the first function the framework calls when loading a plugin. If the returned value is not semver-compatible with the version of the plugin API framework, the plugin will not be loaded.

For example, if the code implementing the plugin framework has version 1.1.0, and a plugin's `plugin_get_required_api_version()` function returns 1.0.0, the plugin API is compatible and the plugin will be loaded. If the code implementing the plugin framework has version 2.0.0, and a plugin's `plugin_get_required_api_version()` function returns 1.0.0, the API is not compatible and the plugin will not be loaded.

##### `uint32_t plugin_get_type() [Required: yes]`

This function returns the plugin type. The enum `ss_plugin_type` in `plugin_info.h` defines the possible plugin types:

```C
typedef enum ss_plugin_type
{
	TYPE_SOURCE_PLUGIN = 1,
	TYPE_EXTRACTOR_PLUGIN = 2
}ss_plugin_type;
```

For source plugins, this function should always return the value `TYPE_SOURCE_PLUGIN` e.g. 1.

##### `uint32_t plugin_get_id() [Required: yes]`

This should return the [event ID](../../plugins#plugin-event-ids) allocated to your plugin. During development and before receiving an official event ID, you can use the "Test" value of 999.

##### `const char* plugin_get_{name,description,contact,version} [Required: yes]`

These functions all return an C string, with memory owned by the plugin, that describe the plugin:

* `plugin_get_name`: Return the name of the plugin.
* `plugin_get_description`: Return a short description of the plugin.
* `plugin_get_contact`: Return a contact url/email/twitter account for the plugin authors.
* `plugin_get_version`: Return the version of the plugin itself.

The recommended format for `plugin_get_contact` is a url to a repository that contains the plugin source code (e.g. `github.com/falcosecurity/plugins`) if at all possible.

##### `const char* plugin_get_event_source() [Required: yes]`

This function returns a C string, with memory owned by the plugin, containing the plugin's [event source](../../plugins/#plugin-event-sources-and-interoperability). This event source is used for:

* Associating Falco rules with plugin events--A Falco rule with a `source: gizmo` property will run on all events returned by the gizmo plugin's `next()` function.
* Linking together extractor plugins and source plugins. An extractor plugin can list a given event source like "gizmo" in its `get_extract_event_sources()` function, and the extractor plugin will get an opportunity to extract fields from all events returned by the gizmo plugin.
* Ensuring that only one plugin at a time is loaded for a given source.

When defining a source, make sure it accurately describes the events from your plugin (e.g. use "cloudtrail" for aws cloudtrail events, not "json" or "logs") and doesn't overlap with the source of any other source plugin.

The only time where duplicate sources make sense are when a group of plugins can use a standard data format for a given event. For example, plugins might extract k8s_audit events from multiple cloud sources like gcp, azure, aws, etc. If they all format their events as json objects that have identical formats as one could obtain by using [K8s Audit](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/) hooks, then it would make sense for the plugins to use the same source.

##### `const char* plugin_get_fields() [Required: no]`

This function should return the set of fields supported by the plugin. Remember, a field is a name (e.g. `proc.name`) that can extract a value (e.g. `nginx`) from an event (e.g. a syscall event involving a process). The format is a json string which contains an array of objects. Each object describes one field. Here's an example:

```json
[
   {"type": "string", "name": "gizmo.field1", "argRequired": true, "desc": "Describing field 1"},
   {"type": "uint64", "name": "gizmo.field2", "desc": "Describing field 2", properties: ["hidden"]}
]
```

Although uncommon, this function is not required--a source plugin might inject events but not define any fields that extract values from events. This might be common if the extraction could be performed by extraction plugins.

Each object has the following properties:

* `type`: one of "string", "uint64"
* `name`: a string with a name for the field. By convention, this is a dot-separated path of names. Use a consistent first name e.g. "ct.xxx" to help filter authors associate the field with a given plugin.
* `argRequired`: (optional) If present and set to true, notes that the field requires an argument e.g. `field[arg]`.
* `display`: (optional) If present, a string that will be used to display the field instead of the name. Used in tools like wireshark.
* `desc`: a string with a short description of the field. This will be used in help output so be concise and descriptive.
* `properties`: (optional) If present, an array of additional properties that apply to the field. The value is an array of strings that can be one of the following:
    * `hidden`: Do not display the field when using programs like `falco --list` to list the set of supported fields.
    * `conversation`: This field is applicable for use in [wireshark conversations](https://www.wireshark.org/docs/wsug_html_chunked/ChStatConversations.html), and denotes that the field represents one half of a "conversation" that can be shown in the conversations or endpoints view.
    * `info`: Also applicable for use in wireshark, and denotes that it should be appended to the "info" column in the wireshark event list.

When defining fields, keep the following guidelines in mind:

* Field names should generally have the plugin name/event source as the first component, and usually have one or two additional components. For example, `gizmo.pid` is preferred over `gizmo.process.id.is`. If a plugin has a moderately large set of fields, using components to group fields may make sense (e.g. `cloudtrail.s3.bytes.in` and `cloudtrail.s3.bytes.out`).
* Fields should be idempotent: for a given event, the value for a field should be the same regardless of when/where the event was generated.
* Fields should be neutral: define fields that extract properties of the event (e.g. "source ip address") rather than judgements (e.g. "source ip address is associated with a botnet").

#### Instance/Capture Management Functions

##### `ss_plugin_t* plugin_init(const char* config, int32_t* rc) [Required: yes]`

This function passes plugin-level configuration to the plugin to create its plugin-level state. The plugin then returns a pointer to that state, as a `ss_plugin_t *` handle. The handle is never examined by the plugin framework and is never freed. It is only provided as the argument to later API functions.

When managing plugin-level state, keep the following in mind:

* It is the plugin's responsibility to allocate plugin state (memory, open files, etc) and free that state later in `plugin_destroy`.
* The plugin state should be the *only* location for state (e.g. no globals, no per-thread state). Although unlikely, the framework may choose to call `plugin_init` multiple times for the same plugin, and this should be supported by the plugin.
* The returned rc value should be `SS_PLUGIN_SUCCESS` (0) on success, `SS_PLUGIN_FAILURE` (1) on failure.
* On failure, make sure to return a meaningful error message in the next call to `plugin_get_last_error()`.
* On failure, the plugin framework will *not* call plugin_destroy, so do not return any allocated state.

The format of the config string is entirely determined by the plugin author, and is passed unchanged from Falco/the application using the plugin framework to the plugin. Given that, semi-structured formats like JSON/YAML are preferable to free-form text.

##### `void plugin_destroy(ss_plugin_t *s) [Required: yes]`

This function frees any resources held in the `ss_plugin_t` struct. Afterwards, the handle should be considered destroyed and no further API functions will be called with that handle.

##### `ss_instance_t* plugin_open(ss_plugin_t* s, const char* params, int32_t* rc) [Required: yes]`

This function is called to "open" a stream of events. The interpretation of a stream of events is up to the plugin author, but think of `plugin_init` as initializing the plugin software, and `plugin_open` as configuring the software to return events. Using a streaming audio analogy, `plugin_init` turns on the app, and `plugin_open` starts a streaming audio channel.

The same general guidelines apply for `plugin_open` as do for `plugin_init`:

* All state related to sourcing a stream of events should be in the returned `ss_instance_t` pointer.
* Return 0 on success, 1 on error. Be ready to return an error via `plugin_get_last_error()` on error.
* The plugin should support concurrent open sessions at once. Unlike plugin-level state, it's very likely that the plugin framework might call `plugin_open` multiple times for a given plugin.
* On error, do not return any instance struct, as the plugin framework will not call `plugin_close`.

##### `void plugin_close(ss_plugin_t* s, ss_instance_t* h) [Required: yes]`

This function closes a stream of events previously started via a call to `plugin_open`. Afterwards, the stream should be considered closed and the framework will not call `plugin_next_batch`/`plugin_extract_fields` with the same `ss_instance_t` pointer.

#### Misc Functions

##### `const char* plugin_get_last_error(ss_plugin_t* s)`

This function is called by the framework after a prior call returned an error. The plugin should return a meaningful error string providing more information about the most recent error.

#### Events/Fields Related Functions

##### `int32_t plugin_next_batch(ss_plugin_t* s, ss_instance_t* h, uint32_t *nevts, ss_plugin_event **evts) [Required: yes]`

This function is used to return a set of next events to the plugin framework, given a plugin state and open instance.

`*evts` should be updated to an allocated contiguous array of `ss_plugin_event` structs. The memory for the structs array is owned by the plugin and should be held until the next call to `plugin_next_batch`. `*nevts` should be updated with the number of events returned.

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
* `data`: pointer to a memory buffer pointer allocated by the plugin. The plugin will set it to point to the memory containing the next event. This memory is owned by the plugin and should be freed upon the next call to `plugin_next_batch()`.
* `datalen`: pointer to a 32bit integer. The plugin will set it the size of the buffer pointed by data.
* `ts`: the event timestamp, in nanoseconds since the epoch. Can be (uint64_t)-1, in which case the engine will automatically fill the event time with the current time.

It is not necessary to fill in the evtnum struct member when returning events via plugin_next/plugin_next_batch. Event numbers are assigned by the plugin framework.

This function should return:

* `SS_PLUGIN_SUCCESS` (0) on success
* `SS_PLUGIN_FAILURE` (1) on failure
* `SS_PLUGIN_TIMEOUT` (-1) on non-error but there are no events to return.
* `SS_PLUGIN_EOF` (6) when the stream of events is complete.

If the plugin receives a SS_PLUGIN_FAILURE, it will close the stream of events by calling `plugin_close`.

SS_PLUGIN_TIMEOUT should be returned whenever no events can be returned immediately. This ensures that the plugin framework is not stalled waiting for a response from `plugin_next_batch`. When the framework receives a SS_PLUGIN_TIMEOUT, it will keep the stream of events open and call `plugin_next_batch` again later.

##### `const char* plugin_get_progress(ss_plugin_t* s, ss_instance_t* h, uint32_t* progress_pct) [Required: no]`

This function is optional. If the plugin exports it, the framework will periodically call it after open to return how much of the event stream has been read. If a plugin does not provide a bounded stream of events (for example, events coming from a file or other source that has an ending), it should not export this function.

If not exported, the plugin framework will not print meaningful process indicators while processing event streams.

When called, the progress_pct pointer should be updated with the read progress, as a number between 0 (no data has been read) and 10000 (100% of the data has been read). This encoding allows the engine to print progress decimals without requiring to deal with floating point numbers (which could cause incompatibility problems with some languages).

The return value is an string representation of the read progress, with the memory owned by the plugin. This might include the progress percentage combined with additional context added by the plugin. The plugin can return NULL. In this case, the framework will use the progress_pct value instead.

##### `const char* plugin_event_to_string(ss_plugin_t *s, const uint8_t *data, uint32_t datalen) [Required: yes]`

This function is used to return a printable representation of an event. The memory is owned by the plugin and can be freed on the next call to `plugin_event_to_string`. It is used in filtering/output expressions as the built-in field `evt.plugininfo`.

The string representation should be on a single line and contain important information about the event. It is not necessary to return all information from the event. Simply return the most important fields/properties of the event that provide a useful default representation.

Here is an example output, from the [cloudtrail](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail) plugin:

```
us-east-1 masters.some-demo.k8s.local s3 GetObject Size=0 URI=s3://some-demo-env/some-demo.k8s.local/backups/etcd/events/control/etcd-cluster-created
```

##### `int32_t plugin_extract_fields(ss_plugin_t *s, const ss_plugin_event *evt, uint32_t num_fields, ss_plugin_extract_field *fields) [Required: no]`

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
        uint32_t fields_id;
	const char* field;
	const char* arg;
	uint32_t ftype;      // Has value from ss_plugin_field_type enum

	bool field_present;
	const char* res_str;
	uint64_t res_u64;
} ss_plugin_extract_field;
```

For each struct, the plugin fills in `field_id`/`field`/`arg`/`ftype` with the field. `field_id` is the index into the original list of fields returned by `plugin_get_fields`, and allows for faster mapping to a plugin's set of fields. The plugin should fill in `field_present` and either `res_str`/`res_u64` with the value for the field, depending on the field type `ftype`. If the field type is `FTYPE_STRING`, res_str should be updated to point to an string with the string value, with memory owned by the plugin. The plugin should retain this memory until the next call to `plugin_extract_fields`.

If `field_present` is set to false, the plugin framework assumes that `res_str`/`res_u64` is undefined and will not use it.

### Extractor Plugin API Functions

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

#### `const char* get_extract_event_sources() [Required: no]`

This function allows an extractor plugin to restrict the kinds of events where the plugin's `get_fields()` method will be called. The return value should be a string containing a json array of compatible event sources, with memory owned by the plugin. Here's an example:

```json
["aws_cloudtrail", "gcp_cloudtrail"]
```

This implies that the extractor plugin can potentially extract values from events that have a source `aws_cloudtrail` or `gce_cloudtrail`.

This function is optional. If the plugin does not export this function the framework will assume the extractor plugin can potentially extract values from all events. The extractor plugin's `extract_fields()` function will be called for all events for any field returned by the plugin's `get_fields()` function.
