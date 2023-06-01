---
title: Falco Plugins API Reference
linktitle: API Reference
description: Learn how the Plugins API works
weight: 60
aliases:
    - /docs/plugins/plugin_api_reference/
---

## Introduction

This page documents the functions that make up the Falco plugins API. In most cases, you will not need to implement these functions directly. There are [Go](https://github.com/falcosecurity/plugin-sdk-go) and [C++](https://github.com/falcosecurity/plugin-sdk-cpp) SDKs that provide an easier-to-use interface for plugin authors.

At a high level, the API functions are grouped as follows:

* Functions that are commons to all plugins
* Functions that implement one specific capability

The C header files [plugin_api.h](hhttps://github.com/falcosecurity/libs/blob/0.11.0/userspace/plugin/plugin_api.h) and [plugin_types.h](https://github.com/falcosecurity/libs/blob/0.11.0/userspace/plugin/plugin_types.h) numerate all the API functions and associated structs/types as they are used by the plugins framework. The whole plugin API and the loader used in Falco are implemented in C in a standaline module located inside [falcosecurity/libs/userspace/plugin](https://github.com/falcosecurity/libs/tree/master/userspace/plugin), and can be imported and reused in other projects using the falcosecurity plugin system (e.g. we have a [plugin loader written in Go](https://github.com/falcosecurity/plugin-sdk-go/tree/main/pkg/loader) developed on top of the C one).

Remember, however, that from the perspective of the plugin, each function name has a prefix `plugin_` e.g. `plugin_get_required_api_version`, `plugin_get_name`, etc.

Since [Falco v0.33.0](../../../blog/falco-0-33-0), some function symbols of **the plugin API started supporting concurrent invocations** from multiple threads. If not explicitly specified in each symbol's API reference, the plugin API assumes that functions are invoked always from the same thread with no concurrency.

### Plugin API Versioning

**The current version of the plugin API is `3.0.0`**.

The plugin API is a formal contract between the framework and the plugins, and it is versioned using [semantic versioning](https://semver.org/). The framework exposes the plugin API version it supports, and each plugin expresses a required plugin API version. If the version required by a plugin does not pass the semantic check with the one supported by the framework, then the plugin cannot be loaded. See the section about [`plugin_get_required_api_version`](#get-required-api-version) for more details.

### Conventions

The following conventions apply for all of the below API functions:

* Every function that returns a `const char* ` must return a null-terminated C string.
* All string values returned across the API are considered owned by the plugin and must remain valid for use by the plugin framework. Specifically, this means:
    * For demographic functions like `plugin_get_name`, `plugin_get_description`, the returned strings must remain valid until the plugin is destroyed.
    * When returning events via `plugin_next_batch`, both the array of structs and the data payloads inside each struct must remain valid until the next call to `plugin_next_batch`.
    * When returning extracted string values via `plugin_extract_fields`, every extracted string must remain valid until the next call to `plugin_extract_fields`.
* For every function that returns an error, the plugin should save a meaningful error string that the framework can retrieve via a call to `plugin_get_last_error`.

## Inversion of Control and Callbacks to the Plugin's Owner

All functions from the plugin API define functionalities that the plugin offers to the framework. In the default execution path, the plugin is always the "passive" actor, with the framework being the orchestrator determining when and how often a given plugin function gets invoked.

The plugin API also supports an occasional inversion of control in which plugins can actively invoke functions exposed by the framework that owns it. For those cases, the execution flow generally proceeds as follows. First, the framework invokes a function exported by the plugin according its supported version of the plugin API. As one of the function arguments the framework passes to the plugin a vtable struct allocated and owned by the framework itself, containing one or more function pointers referring to code functions of the framework that the plugin is allowed to invoke. Permissions about retaining such function pointers inside the plugin's state after the execution of the plugin API symbol may vary depending on the API symbol itself and its related capabilities. Alongside the function pointers, the framework also provides the plugin with a `ss_plugin_owner_t*` opaque handle, which the plugin must pass to the framework's functions. The opaque handle represents an instance of the plugin's *owner*, which is an abstract component that the framework allocates for managing the plugin's requests. If the framework passes one of the function pointers defined in the vtable structs as `NULL`, then the plugin must assume that the related piece of functionality is not supported by the framework in that context. Plugins must always check whether the function pointers passed by the framework are `NULL` or not.

An example of functionality provided in the form of inversion of control is the access to [state tables](#get-required-api-version). The C++ example below shows how a plugin can interact with its owner during the execution of its `init` function. In this case, the plugin iterates over the list of state tables registered in the framework and catches errors arising during the invocations of the owner's callbacks:

```CPP
extern "C" ss_plugin_t* plugin_init(const ss_plugin_init_input* in, ss_plugin_rc* rc)
{
    *rc = SS_PLUGIN_SUCCESS;
    my_plugin *ret = new my_plugin();

    if (!in || !in->tables)
    {
        *rc = SS_PLUGIN_FAILURE;
        ret->lasterr = "access to the state tables is not supported by the owner";
        return ret;
    }  

    uint32_t ntables = 0;
    auto tables = in->tables->list_tables(in->owner, &ntables);
    if (!tables)
    {
        *rc = SS_PLUGIN_FAILURE;
        ret->lasterr = "can't list state tables: " + std::string(in->get_owner_last_error(in->owner));
        return ret;
    }

    for (uint32_t i = 0; i < ntables; i++)
    {
        auto& ti = tables[i];
        printf("table='%s', key_type=%d\n", ti.name, ti.key_type);
    }
    
    return ret;
}
```

## Common Plugin API

### get_required_api_version

```
const char* plugin_get_required_api_version()   [Required: yes]
```

This function returns a string containing a [semver](https://semver.org/) version number e.g. "3.0.0", reflecting the version of the plugin API framework that this plugin requires. This is different than the version of the plugin itself, and should only have to change when the plugin API changes.

This is the first function the framework calls when loading a plugin. If the returned value is not semver-compatible with the version of the plugin API framework, the plugin will not be loaded.

For example, if the code implementing the plugin framework has version 1.1.0, and a plugin's `plugin_get_required_api_version` function returns 1.0.0, the plugin API is compatible and the plugin will be loaded. If the code implementing the plugin framework has version 3.0.0, and a plugin's `plugin_get_required_api_version` function returns 1.0.0, the API is not compatible and the plugin will not be loaded.

### get_{name,description,contact,version}

```
const char* plugin_get_name()           [Required: yes]
const char* plugin_get_description()    [Required: yes]
const char* plugin_get_contact()        [Required: yes]
const char* plugin_get_version()        [Required: yes]
```

These functions all return an C string, with memory owned by the plugin, that describe the plugin:

* `plugin_get_name`: Return the name of the plugin.
* `plugin_get_description`: Return a short description of the plugin.
* `plugin_get_contact`: Return a contact url/email/twitter account for the plugin authors.
* `plugin_get_version`: Return the version of the plugin itself.

For `get_version`, note that increasing the major version signals breaking changes in the plugin implementation but must not change the serialization format of the event data. For example, events written in pre-existing capture files must always be readable by newer versions of the plugin.

### init

```
ss_plugin_t* plugin_init(const ss_plugin_init_input *input, ss_plugin_rc *rc)   [Required: yes]
```

This function passes plugin-level configuration to the plugin to create its plugin-level state. The plugin then returns a pointer to that state, as a `ss_plugin_t *` handle. The handle is never examined by the plugin framework and is never freed. It is only provided as the argument to later API functions.

When managing plugin-level state, keep the following in mind:

* It is the plugin's responsibility to allocate plugin state (memory, open files, etc) and free that state later in `plugin_destroy`.
* The plugin state should be the *only* location for state (e.g. no globals, no per-thread state). Although unlikely, the framework may choose to call `plugin_init` multiple times for the same plugin, and this should be supported by the plugin.
* The returned rc value should be `SS_PLUGIN_SUCCESS` (0) on success, `SS_PLUGIN_FAILURE` (1) on failure.
* On failure, make sure to return a meaningful error message in the next call to `plugin_get_last_error`.
* On failure, plugins can decide whether to return an allocated state or not. In the first case, the plugin framework will use the allocated state to retrieve the failure error with `plugin_get_last_error`, and will then free the state with `plugin_destroy`. In the second case, `plugin_destroy` will not be called and the plugin framework will return a generic error.

The format of the config string is entirely determined by the plugin author, and by default is passed unchanged from Falco/the application using the plugin framework to the plugin. However, semi-structured formats like JSON/YAML are preferable to free-form text. In those cases, the plugin author can provide a schema describing the config string contents by implementing the optional `get_init_schema` function. If so, the `init` function can assume the passed-in configuration string to always be well-formed, and can avoid performing any error handling. The plugin framework will take care of automatically parsing it against the provided schema and generating ad-hoc errors accordingly. Please refer to the documentation of `get_init_schema` for more details.

If a non-NULL ss_plugin_t* state is returned, then subsequent invocations of `init` must not return the same `ss_plugin_t *` value again, unless it has been disposed with `destroy` first.

### destroy

```
void plugin_destroy(ss_plugin_t *s) [Required: yes]
```

This function frees any resources held in the `ss_plugin_t` struct. Afterwards, the handle should be considered destroyed and no further API functions will be called with that handle.

### get_last_error

```
const char* plugin_get_last_error(ss_plugin_t* s)   [Required: yes]
```

This function is called by the framework after a prior call returned an error. The plugin should return a meaningful error string providing more information about the most recent error.

### get_init_schema

```
const char* plugin_get_init_schema(ss_plugin_schema_type* schema_type)  [Required: no]
```

This function returns a schema that describes the configuration to be passed to `init` during plugin initialization. The return value is a C string, with memory owned by the plugin, representing the configuration schema. The type of schema returned is compliant with the `ss_plugin_schema_type` enumeration, and is written inside the `schema_type` output argument.

Although this function is non-required, it is common to implement it due to the benefits it brings. If `get_init_schema` is correctly implemented, the `init` function can assume the passed-in configuration string to always be well-formed. The plugin framework will take care of automatically parsing it against the provided schema and generating ad-hoc errors accordingly. This also serves as a piece of documentation for users about how the plugin needs to be configured.

Currently, the plugin framework only supports the [JSON Schema format](https://json-schema.org/), which is represented by the `SS_PLUGIN_SCHEMA_JSON` enum value. If a plugin defines a JSON Schema, the framework will require the init configuration string to be a valid json-formatted string.

Writing the dummy enum value `SS_PLUGIN_SCHEMA_NONE` inside `schema_type` is equivalent to avoiding implementing the `get_init_schema` function itself, which ends up with the framework treating the init configuration as an opaque string with no additional checks.

## Event Sourcing Capability API

### get_id

```
uint32_t plugin_get_id()    [Required: varies]
```

This should return the [event ID](../../plugins#plugin-event-ids) allocated to your plugin. During development and before receiving an official event ID, you can use the "Test" value of 999.

This function is required if `get_event_source` is defined and returns a non-empty string, otherwise it is considered optional. Returning zero is equivalent to not implementing the function. If the plugin has a non-zero ID and a non-empty event source, then its `next_batch` function is allowed to only return events of plugin type (code 322) with its own plugin ID and event source.

### get_event_source()

```
const char* plugin_get_event_source()   [Required: varies]
```

This function returns a C string, with memory owned by the plugin, containing the plugin's [event source](../../plugins/#plugin-event-sources-and-interoperability). This event source is used for:

* Associating Falco rules with plugin events--A Falco rule with a `source: gizmo` property will run on all events returned by the gizmo plugin's `next_batch` function.
* Linking together plugins with field extraction capability and plugins with event sourcing capability. The first can list a given event source like `gizmo` in its `get_extract_event_sources` function, and they will get an opportunity to extract fields from all events returned by the "gizmo" plugin.
* Ensuring that only one plugin at a time is loaded for a given source.

When defining a source, make sure it accurately describes the events from your plugin (e.g. use `aws_cloudtrail` for AWS CloudTrail events, not `json` or `logs`) and doesn't overlap with the source of any other plugin with event sourcing capability.

The only time where duplicate sources make sense are when a group of plugins can use a standard data format for a given event. For example, plugins might extract `k8s_audit` events from multiple cloud sources like gcp, azure, aws, etc. If they all format their events as json objects that have identical formats as one could obtain by using [K8s Audit](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/) hooks, then it would make sense for the plugins to use the same source.

This function is required if `get_id` is defined and returns a non-zero ID, otherwise it is considered optional. Returning an empty string is equivalent to not implementing the function. If the plugin has a non-zero ID and a non-empty event source, then its `next_batch`
function is allowed to only return events of plugin type (code 322) with its own plugin ID and event source.

### open

```
ss_instance_t* plugin_open(ss_plugin_t* s, const char* params, int32_t* rc) [Required: yes]
```

This function is called to "open" a stream of events. The interpretation of a stream of events is up to the plugin author, but think of `plugin_init` as initializing the plugin software, and `plugin_open` as configuring the software to return events. Using a streaming audio analogy, `plugin_init` turns on the app, and `plugin_open` starts a streaming audio channel.

The same general guidelines apply for `plugin_open` as do for `plugin_init`:

* All state related to sourcing a stream of events should be in the returned `ss_instance_t` pointer.
* Return 0 on success, 1 on error. Be ready to return an error via `plugin_get_last_error` on error.
* The plugin should support concurrent open sessions at once. Unlike plugin-level state, it's very likely that the plugin framework might call `plugin_open` multiple times for a given plugin.
* On error, do not return any instance struct, as the plugin framework will not call `plugin_close`.

If a non-NULL `ss_instance_t*` instance is returned, then subsequent invocations of `open` must not return the same `ss_instance_t*` value again, unless it has been disposed with `close` first.

### close

```
void plugin_close(ss_plugin_t* s, ss_instance_t* h) [Required: yes]
```

This function closes a stream of events previously started via a call to `plugin_open`. Afterwards, the stream should be considered closed and the framework will not call `plugin_next_batch`/`plugin_extract_fields` with the same `ss_instance_t` pointer.

### next_batch

```
int32_t plugin_next_batch(ss_plugin_t* s, ss_instance_t* h, uint32_t *nevts, ss_plugin_event ***evts)   [Required: yes]
```

This function is used to return a set of next events to the plugin framework, given a plugin state and open instance.

`*evts` should be updated to an allocated contiguous array of `ss_plugin_event` pointers. The memory for the structs array is owned by the plugin and should be held until the next call to `plugin_next_batch`. `*nevts` should be updated with the number of events returned.

An event is represented by a `ss_plugin_event` struct, which observes the same format of the [libscap event block specification](#libscap-event-block-specification):

```CPP
typedef struct ss_plugin_event {
    uint64_t ts;        /* timestamp, in nanoseconds from epoch */
    uint64_t tid;       /* the tid of the thread that generated this event */
    uint32_t len;       /* the event len, including the header */
    uint16_t type;      /* the event type */
    uint32_t nparams;   /* the number of parameters of the event */
} ss_plugin_event;
```

An event is represented as a contiguous region of memory composed by a header struct and a list of parameters appended, in the form of:

```
| evt header | len param 1 (2B/4B) | ... | len param N (2B/4B) | data param 1 | ... | data param N |
```

The event header is composed of:
- `ts`: the event timestamp, in nanoseconds since the epoch. Can be (uint64_t)-1, in which case the framework will automatically fill the event time with the current time.
- `tid`: the tid of the thread that generated this event. Can be (uint64_t)-1 in case no thread is specified, such as when generating a plugin event (type code 322).
- `len`: the event len, including the header
- `type`: the code of the event, as per the ones supported by the [libscap specific](#libscap-event-block-specification). This dictates the number and kind of parameters, and whether the lenght is encoded as a 2 bytes or 4 bytes integer.
- `nparams`: the number of parameters of the event

This function should return:

* `SS_PLUGIN_SUCCESS` (0) on success
* `SS_PLUGIN_FAILURE` (1) on failure
* `SS_PLUGIN_TIMEOUT` (-1) on non-error but there are no events to return.
* `SS_PLUGIN_EOF` (6) when the stream of events is complete.

If the plugin receives a `SS_PLUGIN_FAILURE`, it will close the stream of events by calling `plugin_close`.

If a plugin implements a specific event source (`get_id` is non-zero and `get_event_source` is non-empty), then, it is only allowed to produce events of type plugin (code 322) containing its own plugin ID (as returned by `get_id`). In such a case, when an event contains a zero plugin ID, the framework automatically sets the plugin ID of the event to the one of the plugin. If a plugin does not implement a specific event source, it is allowed to produce events of any of the types supported by the [libscap specific](#libscap-event-block-specification).

`SS_PLUGIN_TIMEOUT` should be returned whenever no events can be returned immediately. This ensures that the plugin framework is not stalled waiting for a response from `plugin_next_batch`. When the framework receives a `SS_PLUGIN_TIMEOUT`, it will keep the stream of events open and call `plugin_next_batch` again later.

This function can be invoked concurrently by multiple threads, each with distinct and unique parameter values. The value of the `ss_plugin_event***` output parameter must be uniquely attached to the ss_instance_t* parameter value. The pointer must not be shared across multiple distinct `ss_instance_t*` values.

### get_progress

```
const char* plugin_get_progress(ss_plugin_t* s, ss_instance_t* h, uint32_t* progress_pct)   [Required: no]
```

If the plugin exports this function, the framework will periodically call it after open to return how much of the event stream has been read. If a plugin does not provide a bounded stream of events (for example, events coming from a file or other source that has an ending), it should not export this function.

If not exported, the plugin framework will not print meaningful process indicators while processing event streams.

When called, the `progress_pct` pointer should be updated with the read progress, as a number between 0 (no data has been read) and 10000 (100% of the data has been read). This encoding allows the engine to print progress decimals without requiring to deal with floating point numbers (which could cause incompatibility problems with some languages).

The return value is an string representation of the read progress, with the memory owned by the plugin. This might include the progress percentage combined with additional context added by the plugin. The plugin can return `NULL`. In this case, the framework will use the `progress_pct` value instead.

This function can be invoked concurrently by multiple threads, each with distinct and unique parameter values. If the returned pointer is non-NULL, then it must be uniquely attached to the `ss_instance_t*` parameter value. The pointer must not be shared across multiple distinct `ss_instance_t*` values.

### event_to_string

```
const char* plugin_event_to_string(ss_plugin_t *s, const ss_plugin_event_input *evt)    [Required: no]
```

This function is used to return a printable representation of an event. The memory is owned by the plugin and can be freed on the next call to `plugin_event_to_string`. It is used in filtering/output expressions as the built-in field `evt.plugininfo`. Even if implemented, this function is ignored if a plugin does not implement a specific event source (`get_id` is undefined or returns zero, and `get_event_source` is undefined or returns an empty string).

The string representation should be on a single line and contain important information about the event. It is not necessary to return all information from the event. Simply return the most important fields/properties of the event that provide a useful default representation.

Here is an example output, from the [cloudtrail](https://github.com/falcosecurity/plugins/blob/master/plugins/cloudtrail) plugin:

```
us-east-1 masters.some-demo.k8s.local s3 GetObject Size=0 URI=s3://some-demo-env/some-demo.k8s.local/backups/etcd/events/control/etcd-cluster-created
```

This function can be invoked concurrently by multiple threads, each with distinct and unique parameter values. If the returned pointer is non-NULL, then it must be uniquely attached to the `ss_plugin_t*` parameter value. The pointer must not be shared across multiple distinct `ss_plugin_t*` values.

### list_open_params

```
const char* plugin_list_open_params(ss_plugin_t* s, ss_plugin_rc* rc)   [Required: no]
```

This function returns a list of suggested values that are valid parameters for the `open` plugin function.
Although non-required, this function is useful to instruct users about potential valid parameters for opening a stream of events. Implementing this function also brings additional usage documentation for the plugin, and allows makes it more usable with automated tools.

The returned value is a json string, with memory owned by the plugin, which contains an array of objects. Each object describes one suggested value for the `open` function. Here's an example:

```json
[
    {"value": "resource1", "desc": "An example of openable resource"},
    {"value": "resource2", "desc": "Another example of openable resource"}
    {
        "value": "res1;res2;res3",
        "desc": "Some names",
        "separator": ";"
    }
]
```

Each object has the following properties:
* `value`: a string usable as a parameter for `open`
* `desc`: (optional) a string with that describes the meaning of `value`.
* `separator`: (optional) a string representing a separator string in case `value` represents a list of concatenated values. This can be used by plugins to specify an open param that represents more than one source, in which case they can be separated by the separator substring. It's a plugin responsibility to specify the separator string.

## Field Extraction Capability API

### get_fields

```
const char* plugin_get_fields() [Required: yes]
```

This function should return the set of fields supported by the plugin. Remember, a field is a name (e.g. `proc.name`) that can extract a value (e.g. `nginx`) from an event (e.g. a syscall event involving a process). The return value is a string whose memory is owned by the plugin. The string is json formatted and contains an array of objects. Each object describes one field. Here's an example:

```json
[
    {"type": "string", "name": "gizmo.field1", "arg": {"isRequired": true, "isKey": true}, "desc": "Describing field 1"},
    {"type": "uint64", "name": "gizmo.field2", "desc": "Describing field 2", properties: ["hidden"]}
]
```

Each object has the following properties:

* `type`: one of "string", "uint64", "bool", "reltime", "abstime", "ipaddr", "ipnet"
* `name`: a string with a name for the field. By convention, this is a dot-separated path of names. Use a consistent first name e.g. "ct.xxx" to help filter authors associate the field with a given plugin.
* `isList`: (optional) If present and set to true, notes that the field extracts a list of values. Fields of this kind can only be used with the `in` and `intersects` filtering operators. For list fields, extracting single values means extracting lists of length equal to 1.
* `arg`: (optional) if present, notes that the field can accept an argument e.g. field[arg]. More precisely, the following flags could be specified:
    * `isRequired`: if true, the argument is required.
    * `isIndex`: if true, the field is numeric.
    * `isKey`: if true, the field is a string. If `isRequired` is true, one between `isIndex` and `isKey` must be true, to specify the argument type. If `isRequired` is false, but one between `isIndex` and `isKey` is true, the argument is allowed but not required.
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

### extract_fields

```
int32_t plugin_extract_fields(ss_plugin_t *s, const ss_plugin_event_input *evt, const ss_plugin_field_extract_input* in)    [Required: yes]
```

This function is used to return the value for one or more field names that were returned in `plugin_get_fields`. The framework provides an event and an input containing an array of `ss_plugin_extract_field` structs. Each struct has one field name/type, and the plugin fills in each struct with the corresponding value for that field.

The format of the `ss_plugin_extract_field` struct is the following:

```CPP
// The noncontiguous numbers are to maintain equality with underlying
// falcosecurity/libs types.
typedef enum ss_plugin_field_type
{
    // A 64bit unsigned integer.
    FTYPE_UINT64      = 8,
    // A printable buffer of bytes, NULL terminated
    FTYPE_STRING      = 9,
    // A relative time. Seconds * 10^9  + nanoseconds. 64bit.
    FTYPE_RELTIME     = 20,
    // An absolute time interval. Seconds from epoch * 10^9  + nanoseconds. 64bit.
    FTYPE_ABSTIME     = 21,
    // A boolean value, 4 bytes.
    FTYPE_BOOL        = 25,
    // Either an IPv4 or IPv6 address. The length indicates which one it is.
    FTYPE_IPADDR      = 40,
    // Either an IPv4 or IPv6 network. The length indicates which one it is.
    // The field encodes only the IP address, so this differs from FTYPE_IPADDR,
    // from the way the framework perform runtime checks and comparisons.
    FTYPE_IPNET       = 41,
}ss_plugin_field_type;

typedef struct ss_plugin_extract_field
{
    union {
        const char** str;
        uint64_t* u64;
        uint32_t* u32;
        ss_plugin_bool* boolean;
        ss_plugin_byte_buffer* buf;
    } res;
    uint64_t res_len;

    uint32_t field_id;
    const char* field;
    const char* arg_key;
    uint64_t arg_index;
    bool arg_present;
    uint32_t ftype;
    bool flist;
} ss_plugin_extract_field;
```

For each struct, the plugin fills in `field_id`/`field`/`arg`/`ftype` with the field. `field_id` is the index into the original list of fields returned by `plugin_get_fields`, and allows for faster mapping to a plugin's set of fields. The plugin should fill in `res_len` and `res` with a pointer to an array of values of appropriate type for the field, depending on the field type `ftype`. If the field type is `FTYPE_STRING`, res should be updated to point to an string with the string value, with memory owned by the plugin. The plugin should retain this memory until the next call to `plugin_extract_fields`.

If `res_len` is set to zero, the plugin framework assumes that `res` is undefined and will not use it. Setting a `res_len` value grater than 1 is allowed only for fields for which `isList` is defined as true.

This function can be invoked concurrently by multiple threads, each with distinct and unique parameter values. The value of the `ss_plugin_extract_field*` output parameter must be uniquely attached to the `ss_plugin_t*` parameter value. The pointer must not be shared across multiple distinct `ss_plugin_t*` values.

### get_extract_event_sources

```
const char* get_extract_event_sources() [Required: no]
```

This function allows the plugin to restrict the kinds of events where the plugin's `extract_fields` method will be called. Valid event source names are the ones returned by the `get_event_source` function of plugins with event sourcing capabilitiy, or `syscall` for indicating support to non-plugin events. The return value should be a string containing a json array of compatible event sources, with memory owned by the plugin. Here's an example:

```json
["aws_cloudtrail", "gcp_cloudtrail"]
```

This implies that the plugin can potentially extract values from events that have a source `aws_cloudtrail` or `gcp_cloudtrail`.

This function is optional. If the plugin does not export this function or if it returns an empty array (or `NULL`), then if the plugin has sourcing capability, and implements a specific event source, it will only receive events matching its event source, otherwise the framework will assume the plugin can receive events from all event sources.

### get_extract_event_types

```
uint16_t* get_extract_event_types(uint32_t* numtypes)   [Required: no]
```

This function allows the plugin to restrict the kinds of events where the plugin's `extract_fields` method will be called. The return value is an array of integers representing the event types that the plugin is capable of processing for field extraction. Events with types that are not present in the returned list will not be received by the plugin. The event types follow the enumeration from the [libscap specific](#libscap-event-block-specification).

This function is optional. If the plugin does not export this function or if it returns an empty array (or `NULL`), the plugin will receive every event type if the result of `get_extract_event_sources` (either default or custom) is compatible with the `syscall` event source, otherwise the plugin will only receive events of plugin type (code 322).

## Event Parsing Capability API

### parse_event

```
ss_plugin_rc parse_event(ss_plugin_t *s, const ss_plugin_event_input *evt, const ss_plugin_event_parse_input* in)   [Required: yes]
```

Receives an event from the current capture and parses its content. The plugin is guaranteed to receive an event at most once, after any operation related the event sourcing capability, and before any other operation related to the field extraction capability. The returned rc value should be `SS_PLUGIN_SUCCESS` (0) on success, `SS_PLUGIN_FAILURE` (1) on failure.

The framework provides an event and an input. The event pointer is allocated and owner by the framework, and it is not guaranteed that to refer to the same memory or data returned by the last `next_batch` call (in case the same plugin also supports the event sourcing capability). The input is a vtable containing callbacks towards the plugin's owner that can be used by the plugin for performing read/write operations on state tables not owned by itelf, for which it obtained accessors at initialization time. The plugin does not need to go through this vtable in order to read and write from a table it owns.

This function can be invoked concurrently by multiple threads, each with distinct and unique parameter values. The value of the ss_plugin_event_parse_input* output parameter must be uniquely attached to the ss_plugin_t* parameter value. The pointer must not be shared across multiple distinct ss_plugin_t* values.

### get_parse_event_sources

```
const char* get_parse_event_sources()   [Required: no]
```

This function allows the plugin to restrict the kinds of events where the plugin's `parse_event` method will be called. Valid event source names are the ones returned by the `get_event_source` function of plugins with event sourcing capabilitiy, or `syscall` for indicating support to non-plugin events. The return value should be a string containing a json array of compatible event sources, with memory owned by the plugin.

This function is optional. If the plugin does not export this function or if it returns an empty array (or `NULL`), then if the plugin has sourcing capability, and implements a specific event source, it will only receive events matching its event source, otherwise the framework will assume the plugin can receive events from all event sources.

### get_parse_event_types

```
uint16_t* get_parse_event_types(uint32_t* numtypes) [Required: no]
```

This function allows the plugin to restrict the kinds of events where the plugin's `parse_event` method will be called. The return value is an array of integers representing the event types that the plugin is capable of processing for field extraction. Events with types that are not present in the returned list will not be received by the plugin. The event types follow the enumeration from the [libscap specific](#libscap-event-block-specification).

This function is optional. If the plugin does not export this function or if it returns an empty array (or `NULL`), the plugin will receive every event type if the result of `get_parse_event_sources` (either default or custom) is compatible with the `syscall` event source, otherwise the plugin will only receive events of plugin type (code 322).

## Async Events Capability API

### get_async_event_sources

```
const char* get_async_event_sources()   [Required: no]
```

The return value should be a string containing a json array of compatible event sources, with memory owned by the plugin. The list describes the event sources for which this plugin is capable of injecting async events in the event stream of a capture.

This function is optional. If the plugin does not export this function or if it returns an empty array (or `NULL`), then the async
events produced by a plugin will be injected in the event stream of any source.

### get_async_events

```
const char* get_async_events()   [Required: yes]
```

Return a string describing the name list of all asynchronous events that this plugin is capable of pushing into a live event stream. The framework can reject async events produced by a plugin if their name is not on the name list returned by this function. The return value should be a string containing a json array of compatible event sources, with memory owned by the plugin.

### set_async_event_handler

```
ss_plugin_rc set_async_event_handler(ss_plugin_t* s, ss_plugin_owner_t* owner, const ss_plugin_async_event_handler_t handler)    [Required: yes]
```

Sets a function handler that allows the plugin to send events asynchronously to its owner during a live event capture. The handler is a thread-safe function that can be invoked concurrently by multiple threads. The asynchronous events must be encoded as an async event type (code 402) as for the [libscap specific](#libscap-event-block-specification). The returned rc value should be `SS_PLUGIN_SUCCESS` (0) on success, `SS_PLUGIN_FAILURE` (1) on failure.

The memory of events sent to the async event handler function must be owned by the plugin and is not retained by the owner after the event handler returns. The async event handler function is defined as follows:
```CPP
// Function handler used by plugin for sending asynchronous events to the
// Falcosecurity libs during a live event capture. The asynchronous events
// must be encoded as an async event type (code 402) as for the libscap specific.
// The function returns SS_PLUGIN_SUCCESS in case of success, or
// SS_PLUGIN_FAILURE otherwise. If a non-NULL char pointer is passed for
// the "err" argument, it will be filled with an error message string
// in case the handler function returns SS_PLUGIN_FAILURE. The error string
// has a max length of PLUGIN_MAX_ERRLEN (termination char included) and its
// memory must be allocated and owned by the plugin.
typedef ss_plugin_rc (*ss_plugin_async_event_handler_t)(ss_plugin_owner_t* o, const ss_plugin_event *evt, char* err);
```

The plugin can start sending async events through the passed-in handler right from the moment this function is invoked. `set_async_event_handler` can be invoked multiple times during the lifetime of a plugin. In that case, the registered function handler remains valid up until the next invocation of `set_async_event_handler` on the same plugin, after which the new handler set must replace any already-set one. If the handler is set to a `NULL` function pointer, the plugin is instructed about disabling or stopping the production of async events. If a `NULL` handler is set, and an asynchronous job has been started by the plugin before, the plugin should stop the job and wait for it to be finished before returning from this function. Although the event handler is thread-safe and can be invoked concurrently, this function is still invoked by the framework sequentially from the same thread.

The C++ example below shows how an async event handler can be correctly used from an asynchronous thread with proper start and stop conditions:

```CPP
typedef struct my_plugin
{
    std::thread async_thread;
    std::atomic<bool> async_thread_run;
} my_plugin;

extern "C" ss_plugin_t* plugin_init(const ss_plugin_init_input* in, ss_plugin_rc* rc)
{
    my_plugin *ret = new my_plugin();
    ret->async_thread_run = false;
    *rc = SS_PLUGIN_SUCCESS;
    return ret;
}

extern "C" void plugin_destroy(ss_plugin_t* s)
{
    // stop the async thread if it's running
    my_plugin *ps = (my_plugin *) s;
    if (ps->async_thread_run)
    {
        ps->async_thread_run = false;
        if (ps->async_thread.joinable())
        {
            ps->async_thread.join();
        }
    }
    delete ps;
}

...

extern "C" ss_plugin_rc plugin_set_async_event_handler(ss_plugin_t* s, ss_plugin_owner_t* owner, const ss_plugin_async_event_handler_t handler)
{
    my_plugin *ps = (my_plugin *) s;

    // stop the async thread if it's running
    if (ps->async_thread_run)
    {
        ps->async_thread_run = false;
        if (ps->async_thread.joinable())
        {
            ps->async_thread.join();
        }
    }

    // if an handler is provided, launch an async worker
    if (handler)
    {
        ps->async_thread_run = true;
        ps->async_thread = std::thread([ps, owner, handler]()
        {
            char err[PLUGIN_MAX_ERRLEN];
            while (ps->async_thread_run;)
            {
                ss_plugin_event* evt = ps->do_some_work();
                if (handler(owner, evt, err) != SS_PLUGIN_SUCCESS)
                {
                    // report the error somehow
                }
            }
        });
    }

    return SS_PLUGIN_SUCCESS;
}
```

Async events encode a plugin ID that defines its event source. However, this value is set by the framework when the async event is received, and is set to the ID associated to the plugin-defined event source currently open during a live capture, or zero in case of the `syscall` event source. The event source assigned by the framework to the async event can only be among the ones compatible with the list returned by `get_async_event_sources`.

Async events encode a string representing their event name, which is used for runtime matching and define the encoded data payload. Plugins are allowed to only send async events with one of the names expressed in the list returned by `get_async_events`. The name of an async event acts as a contract on the encoding of the data payload of all async events with the same name.

## Libscap Event Block Specification

The event codes and their associated parameters supported by libscap are regulated by [the libscap's event table](https://github.com/falcosecurity/libs/blob/0.11.0/driver/event_table.c).

*Coming soon...*

<!-- todo(jasondellaluce): document libscap specification for event definitions -->

## State Tables API

*Coming soon...*

<!-- todo(jasondellaluce): document state access API -->
