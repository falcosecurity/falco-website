---
title: Falco Plugins API Reference
linktitle: API Reference
description: Learn how the Plugins API works
weight: 20
aliases:
- ../../plugins/plugin-api-reference
---

## Introduction

This page documents the functions that make up the Falco plugins API. In most cases, you will not need to implement these functions directly. There are [Go](https://github.com/falcosecurity/plugin-sdk-go) and [C++](https://github.com/falcosecurity/plugin-sdk-cpp) SDKs that provide an easier-to-use interface for plugin authors.

At a high level, the API functions are grouped as follows:

* Functions that are commons to all plugins
* Functions that implement one specific capability

The C header files [plugin_api.h](https://github.com/falcosecurity/libs/blob/0.17.2/userspace/plugin/plugin_types.h) numerate all the API functions and associated structs/types as they are used by the plugins framework. The whole plugin API and the loader used in Falco are implemented in C in a standalone module located inside [falcosecurity/libs/userspace/plugin](https://github.com/falcosecurity/libs/tree/master/userspace/plugin), and can be imported and reused in other projects using the falcosecurity plugin system (e.g. we have a [plugin loader written in Go](https://github.com/falcosecurity/plugin-sdk-go/tree/main/pkg/loader) developed on top of the C one).

Remember, however, that from the perspective of the plugin, each function name has a prefix `plugin_` e.g. `plugin_get_required_api_version`, `plugin_get_name`, etc.

Since [Falco v0.33.0](/blog/falco-0-33-0), some function symbols of **the plugin API started supporting concurrent invocations** from multiple threads. If not explicitly specified in each symbol's API reference, the plugin API assumes that functions are invoked always from the same thread with no concurrency.

### Plugin API Versioning

**The current version of the plugin API is `3.6.0`**.

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

An example of functionality provided in the form of inversion of control is the access to [state tables](#state-tables-api). The C++ example below shows how a plugin can interact with its owner during the execution of its `init` function. In this case, the plugin iterates over the list of state tables registered in the framework and catches errors arising during the invocations of the owner's callbacks:

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

### Logging

Another functionality that makes use of inversion of control is **logging**.

The framework provides a log function during the plugin initialization, which the plugin can use to invoke the framework-provided logger at any time during the plugin life-cycle.

The following C++ example shows how a plugin can retain the owner's handle and the log function to invert control and invoke the framework logger:

```CPP
struct my_plugin
{
    ss_plugin_owner_t* owner;
    ss_plugin_log_fn_t log;
};

extern "C" ss_plugin_t* plugin_init(const ss_plugin_init_input* in, ss_plugin_rc* rc)
{
    *rc = SS_PLUGIN_SUCCESS;
    my_plugin *ret = new my_plugin();

    ret->log = in->log_fn;
    ret->owner = in->owner;

    ret->log(ret->owner, NULL, "initializing plugin...", SS_PLUGIN_LOG_SEV_INFO);
    
    return ret;
}

extern "C" void plugin_destroy(ss_plugin_t* s)
{
    my_plugin *ps = (my_plugin *) s;
    ps->log(ps->owner, NULL, "destroying plugin...", SS_PLUGIN_LOG_SEV_INFO);

    delete ((my_plugin *) s);
}
```
The signature of the log function is: 

```
void log(ss_plugin_owner_t* owner, const char* component, const char* msg, ss_plugin_log_severity sev);
```
where `owner` is the handle of the owner, `component` is a string representing the plugin's component name that is invoking the logger (falls back to the plugin name when `NULL`), `msg` is the log message and `sev` is the log [severity](https://github.com/falcosecurity/libs/blob/0.17.2/userspace/plugin/plugin_types.h#L285-L296) as defined in API.

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

This should return the [event ID](/docs/plugins#plugin-event-ids) allocated to your plugin. During development and before receiving an official event ID, you can use the "Test" value of 999.

This function is required if `get_event_source` is defined and returns a non-empty string, otherwise it is considered optional. Returning zero is equivalent to not implementing the function. If the plugin has a non-zero ID and a non-empty event source, then its `next_batch` function is allowed to only return events of plugin type (code 322) with its own plugin ID and event source.

### get_event_source()

```
const char* plugin_get_event_source()   [Required: varies]
```

This function returns a C string, with memory owned by the plugin, containing the plugin's [event source](/docs/plugins/#plugin-event-sources-and-interoperability). This event source is used for:

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

An event is represented by a `ss_plugin_event` struct, which observes the same format of the [libscap event block specification](#libscap-event-block-specification).

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

Libscap, the Falcosecurity libs component responsible of event captures and control, proposes and supports a specification that regulates the way system, kernel, and plugin events are encoded. The same specification also defines the encoding of SCAP capture files, that can be used by the Falcosecurity libs to record and replay event streams. In the specification, events are defined as a specific block type of the [pcap-ng file format](https://pcapng.com/). All the event types and the associated parameters supported by libscap are defined by [the libscap's event table](https://github.com/falcosecurity/libs/blob/0.11.0/driver/event_table.c). The plugin API fully shares and observes the libscap's event definitions, and uses them for both reading and writing events from/to the framework.

As for the libscap specific, an event is represented as a contiguous region of memory composed by a header and a list of parameters appended to it, in the form of:

```CPP
// | evt header | len param 1 (2B/4B) | ... | len param N (2B/4B) | data param 1 | ... | data param N |
typedef struct ss_plugin_event {
    uint64_t ts;        /* timestamp, in nanoseconds from epoch */
    uint64_t tid;       /* the tid of the thread that generated this event */
    uint32_t len;       /* the event len, including the header */
    uint16_t type;      /* the event type */
    uint32_t nparams;   /* the number of parameters of the event */
} ss_plugin_event;
```

The event header is composed of:
- `ts`: the event timestamp, in nanoseconds since the epoch. Can be (uint64_t)-1, in which case the framework will automatically fill the event time with the current time.
- `tid`: the tid of the thread that generated this event. Can be (uint64_t)-1 in case no thread is specified, such as when generating a plugin event (type code 322).
- `len`: the event len, including the header
- `type`: the code of the event, as per the ones supported by the [libscap specific](#libscap-event-block-specification). This dictates the number and kind of parameters, and whether the lenght is encoded as a 2 bytes or 4 bytes integer.
- `nparams`: the number of parameters of the event

*Further and more formal documentation will be available in the future...*

## State Tables API

In the plugin framework, **state tables** are simple key-value mappings representing a piece of state owned by a component of the Falcosecurity libs or defined by a plugin. The plugin API declares formal abstract definitions for state tables and provides means for plugins to access the state owned by other components of the framework, define and own their own state, and make it accessible externally. In this context, a component of the framework is an abstract entity that could represent a given piece of machinery within the Falco libraries or any other plugin loaded at runtime.

### Basic Concepts

A state table is a key-value map that can be used for storing pieces of state within the plugin framework. State tables are an abstract concept, and the plugin API does not enforce any specific implementation. Instead, the API specifies interface boundaries in the form of C virtual tables of methods representing the behavior of state tables. This allows the plugin API to remain flexible, abstract, and multi-language by nature. The model by which state tables work is defined by the notions of ownership, registration, and discovery.

Every state table must have an owner, which is responsible of managing the table's memory and of implementing all the functions of the state tables API. Owners can either plugins or any of the other actors that are part of the Falcosecurity libraries. For example, libsinsp is the ower of the `threads` table, which is a key-value store where the key is a thread ID of a Linux machine and the value is a set of information describing a Linux thread. Plugins can access the `threads` table of libsinsp for retrieving thread information given a thread ID, reading and writing the info fields, extending the info with additional metadata, and do much more. However, plugins are never responsible of managing the memory and the implementation of the `threads` table, as it is owned by libsinsp only. Instead, plugins can do the same by defining their own stateful components and implementing the required interface functions to register them as "state tables". Stateful components must be registered in the framework in order to be considered "state tables". Libsinsp, which is owns the plugins loaded at runtime, also holds a "table registry" that is the source of thruth for all the state tables known at runtime. Once a state table is registered in the table registry, it is discoverable by all the actors and plugins running in the context of the same Falcosecurity libs instance.

The way plugins can interact with state tables is through discovery and the usage of accessors. At initialization time (in the `init` function), plugins are provided interface functions that allow them to list all the state tables available at runtime and obtaining "accessors" for later usage. An *accessor* is an opaque pointers obtained at initialization time and that can be used later (e.g. when parsing an event or when extracting a field) for accessing a given table or the fields of its entries. Considering the example of the `threads` table, in its `init` function a given plugin could obtain an accessor to the table and to some of the fields of each thread info (such as the `pid` or the `comm`) and store them in its plugin state. Later, when extracting a field, the same plugin would be available to query the `threads` table for a given thread ID (perhaps obtained by reading the event payload of a syscall) by using the table accessor, and then reading the `pid` of the obtained thread by using the field accessor.

Inherently, the plugin API also enable plugins to define their own state tables and register them in the table registry. Once that's done, the registered state table will be visible to all other plugins just like the `threads` table, without knowing nor caring about which actor is owning it. The state table owned by the plugin will be discoverable through the table registry by the plugin iself too. However, plugins owning a given table are not forced to go through the state tables interface in order to operate on it (conversely, this could also be the less efficient choice). Plugins can implement their own state as they prefer, whereas the purpose of the state tables interface is solely to make that state available to other actors in the framework. Coherently, stable owners can also decide "how much" of a table they want the other components to have visibility of. For example, libsinsp can access more info and functionalities on the `threads` table than what it makes available through the state table interface, which is also natural considering that its implementation is hidden and can be arbitrary.

The set of state tables made available by a given plugin or Falcosecurity libs actor, and the set of fields and operations available for each of those table, **take part of the semantic versioned UX contract of that plugin or actor**. For example, removing a given table or table field from libsinsp can be considered a breaking change that must reflected by the version number of the Falcosecurity libs. The same applies for the version of each plugin and the state tables declared by them.

### Access and Consistency

State tables are dynamic structures. Each table is defined by a given key type, which can be any of the types supported by the `ss_plugin_state_type` enumeration. Then, the each key-value mappings contained in the table are referred to as *table entries*. Each entry has a specific set of information fields, which is shared across all the entries of the same table. Each field is named and has a specific type. The set of fields for the entries of a given table is defined dynamically at runtime and can be extended by different actors. For example, libsinsp populates the `threads` table with a given set of information fields for each table's entry (representing a given thread info), and plugins can read and write the value of those fields by obtaining accessors for those. However, plugins also have the opportunity of defining new fields inside the `threads` table, with a new unique name and a specific type, and libsinsp will be responsible of hosting that new piece of information for each thread and make it available to all actors in the framework. The same can happen for tables defined by any plugin.

Given that state tables can get modified by different actors at runtime, there has to be a deterministic disambiguation about consistency of table edits and visibility of those changes. The plugin API implements this by guaranteeting a deterministic and non-changing total ordering of all the actors in the system. Considering a given ordering, an actor will have visibility only over the changes applied by actors coming before it in the given ordering. In the Falcosecurity libs and the plugin framework, the guaranteed order is the one by which plugins are loaded at runtime. The first actor in the order is always libsinsp itself, which means that all plugins will always see all the table modifications authored by libsinsp at a given point in time. Then, plugins are ordered by following their loading order at runtime. This means that if Plugin B is loaded in Falco after Plugin A, then Plugin B will see all the table changes performed by Plugin A at runtime, but not the countrary (however, they'll both have visibility over the changes performed by libsinsp). As such [the plugins loading order in Falco](/docs/plugins/usage/#loading-plugins-in-falco) can be functionally relevant.

### Obtaining Accessors

Before performing any operation over state tables, plugins must first obtain accessors for each of them. This can happen only at initialization time through a vtable that is passed only to the `init` plugin function. The vtable allows plugins to discover all the tables registered in the framework, get accessors for them, and [register their own tables](#registering-state-tables). Once an accessor is obtained, plugins must maintain it up until they are destroyed, and use it during functions related to specific capabilities (e.g. field extraction, event parsing). The vtable passed to `init` is reported below.

```CPP
// Vtable for controlling and the fields for the entries of a state table.
// This allows discovering the fields available in the table, defining new ones,
// and obtaining accessors usable at runtime for reading and writing the fields'
// data from each entry of a given state table.
typedef struct
{
	// Returns a pointer to an array containing info about all the fields
	// available in the entries of the table. nfields will be filled with the number
	// of elements of the returned array. The array's memory is owned by the
	// tables's owner. Returns NULL in case of error.
	ss_plugin_table_fieldinfo* (*list_table_fields)(ss_plugin_table_t* t, uint32_t* nfields);
	//
	// Returns an opaque pointer representing an accessor to a data field
	// present in all entries of the table, given its name and type.
	// This can later be used for read and write operations for all entries of
	// the table. The pointer is owned by the table's owner.
	// Returns NULL in case of issues (including when the field is not defined
	// or it has a type different than the specified one).
	ss_plugin_table_field_t* (*get_table_field)(ss_plugin_table_t* t, const char* name, ss_plugin_state_type data_type);
	//
	// Defines a new field in the table given its name and data type,
	// which will then be available in all entries contained in the table.
	// Returns an opaque pointer representing an accessor to the newly-defined
	// field. This can later be used for read and write operations for all entries of
	// the table. The pointer is owned by the table's owner.
	// Returns NULL in case of issues (including when a field is defined multiple
	// times with different data types).
	ss_plugin_table_field_t* (*add_table_field)(ss_plugin_table_t* t, const char* name, ss_plugin_state_type data_type);
} ss_plugin_table_fields_vtable;

typedef struct
{
	// Returns a pointer to an array containing info about all the tables
	// registered in the plugin's owner. ntables will be filled with the number
	// of elements of the returned array. The array's memory is owned by the
	// plugin's owner. Returns NULL in case of error.
	ss_plugin_table_info* (*list_tables)(ss_plugin_owner_t* o, uint32_t* ntables);
	//
	// Returns an opaque accessor to a state table registered in the plugin's
	// owner, given its name and key type. Returns NULL if an case of error.
	ss_plugin_table_t* (*get_table)(ss_plugin_owner_t* o, const char* name, ss_plugin_state_type key_type);
	//
	// Registers a new state table in the plugin's owner. Returns
	// SS_PLUGIN_SUCCESS in case of success, and SS_PLUGIN_FAILURE otherwise.
	// The state table is owned by the plugin itself, and the input will be used
	// by other actors of the plugin's owner to interact with the state table.
	ss_plugin_rc (*add_table)(ss_plugin_owner_t* o, const ss_plugin_table_input* in);
	//
	// Vtable for controlling operations related to fields on the state tables
	// registeted in the plugin's owner.
	ss_plugin_table_fields_vtable fields;
} ss_plugin_init_tables_input;
```

### Accessing Tables

After obtaining accessors for all the tables and fields a given plugin is interested into, they can be used for performong operations over tables at runtime. Table operations are splitted in the two "reading" and "writing" categories, each having their own vtable and set of functions. The "reader" and the "writer" vtables are passed to the interested plugin functions for different capabilities, depending on their scope. For example, the `extract_fields` function of the field extraction capability gets passed the state tables reader vtable, whereas the `parse_event` function of the event parsing capability has access to both the reader and writer vtables. This enforces users to only apply state tables modifications at event parsing time, leaving field extraction a "stateless" code path. The reader and writer vtables and their respective functions are reported below.

```CPP
// Vtable for controlling a state table for read operations.
typedef struct
{
	// Returns the table's name, or NULL in case of error.
	// The returned pointer is owned by the table's owner.
	const char*	(*get_table_name)(ss_plugin_table_t* t);
	//
	// Returns the number of entries in the table, or ((uint64_t) -1) in
	// case of error.
	uint64_t (*get_table_size)(ss_plugin_table_t* t);
	//
	// Returns an opaque pointer to an entry present in the table at the given
	// key, or NULL in case of issues (including if no entry is found at the
	// given key). The returned pointer is owned by the table's owner.
	ss_plugin_table_entry_t* (*get_table_entry)(ss_plugin_table_t* t, const ss_plugin_state_data* key);
	//
	// Reads the value of an entry field from a table's entry.
	// The field accessor must be obtainied during plugin_init().
	// The read value is stored in the "out" parameter.
	// Returns SS_PLUGIN_SUCCESS if successful, and SS_PLUGIN_FAILURE otherwise.
	ss_plugin_rc (*read_entry_field)(ss_plugin_table_t* t, ss_plugin_table_entry_t* e, const ss_plugin_table_field_t* f, ss_plugin_state_data* out);
} ss_plugin_table_reader_vtable;

// Vtable for controlling a state table for write operations.
typedef struct
{
	// Erases all the entries of the table.
	// Returns SS_PLUGIN_SUCCESS if successful, and SS_PLUGIN_FAILURE otherwise.
	ss_plugin_rc (*clear_table)(ss_plugin_table_t* t);
	//
	// Erases an entry from a table at the given key.
	// Returns SS_PLUGIN_SUCCESS if successful, and SS_PLUGIN_FAILURE otherwise.
	ss_plugin_rc (*erase_table_entry)(ss_plugin_table_t* t, const ss_plugin_state_data* key);
	//
	// Creates a new entry that can later be added to the same table it was
	// created from. The entry is represented as an opaque pointer owned
	// by the plugin. Once obtained, the plugin can either add the entry
	// to the table through add_table_entry(), or destroy it throgh
	// destroy_table_entry(). Returns an opaque pointer to the newly-created
	// entry, or NULL in case of error.
	ss_plugin_table_entry_t* (*create_table_entry)(ss_plugin_table_t* t);
	//
	// Destroys a table entry obtained by from previous invocation of create_table_entry().
	void (*destroy_table_entry)(ss_plugin_table_t* t, ss_plugin_table_entry_t* e);
	//
	// Adds a new entry to a table obtained by from previous invocation of
	// create_table_entry() on the same table. The entry is inserted in the table
	// with the given key. If another entry is already present with the same key,
	// it gets replaced. After insertion, table will be come the owner of the
	// entry's pointer. Returns an opaque pointer to the newly-added table's entry,
	// or NULL in case of error.
	ss_plugin_table_entry_t* (*add_table_entry)(ss_plugin_table_t* t, const ss_plugin_state_data* key, ss_plugin_table_entry_t* entry);
	//
	// Updates a table's entry by writing a value for one of its fields.
	// The field accessor must be obtainied during plugin_init().
	// The written value is read from the "in" parameter.
	// Returns SS_PLUGIN_SUCCESS if successful, and SS_PLUGIN_FAILURE otherwise.
	ss_plugin_rc (*write_entry_field)(ss_plugin_table_t* t, ss_plugin_table_entry_t* e, const ss_plugin_table_field_t* f, const ss_plugin_state_data* in);
} ss_plugin_table_writer_vtable;
```

### Registering State Tables

On top of accessing tables owned by the framework or other plugins, each plugin can also make part (or all) of its state available to other actors in the framework in the form of state tables. In this case, the plugin is responsible of providing all the necessary vtables and their respective functions, just like the Falcosecurity libraries do for the tables owned by them (e.g. the `threads` table). Plugins have total freedom towards how the table is actually implemented, as long as they respect the API functions in the vtables and they own all the memory related to the table and its entries. Plugins also have the freedom of not supporting some of the functions of the vtables, however they are not allowed to pass NULL-pointing function references. The struct by which plugins register their state table and the related vtable functions is reported below.

```CPP
// Plugin-provided input passed to the add_table() callback of
// ss_plugin_init_tables_input, that can be used by the plugin to inform its
// owner about one of the state tables owned by the plugin. The plugin
// is responsible of owning all the memory pointed by this struct and
// of implementing all the API functions. These will be used by other
// plugins loaded by the falcosecurity libraries to interact with the state
// of a given plugin to implement cross-plugin state access.
typedef struct
{
	// The name of the state table.
	const char* name;
	//
	// The type of the sta table's key.
	ss_plugin_state_type key_type;
	//
	// A non-NULL opaque pointer to the state table.
	// This will be passed as parameters to all the callbacks defined below.
	ss_plugin_table_t* table;
	//
	// Vtable for controlling read operations on the state table.
	ss_plugin_table_reader_vtable reader;
	//
	// Vtable for controlling write operations on the state table.
	ss_plugin_table_writer_vtable writer;
	//
	// Vtable for controlling operations related to fields on the state table.
	ss_plugin_table_fields_vtable fields;
} ss_plugin_table_input;
```

### Thread-safety and Reproducibility

State access is not thread-safe. Operations related to either discovery, reading, or writing, must all be executed in the synchronous context and within the thread in which the framework invokes the given plugin function that is capable of accessing tables. For example, plugins are only allowed to read from a table during the exection of `extract_fields` or `parse_event`, but they are not allowed to launch an asynchronous thread that reuses the same accessors to read from a table after any of those functions have returned.

Also, the previous sections imply that state tables can be operated on during the execution of varios plugin functions, but that however only the `parse_event` function of the event parsing capability can perform write operations. This is by purpose and design due to the architecture of the Falcosecurity libraries themselves.

There may be use cases when the state update results of some asynchronous job and computation. For example, the Falcosecurity libraries implement the container metadata enrichment support by connecting to one or more container runtime sockets and fetching information asynchronously using a separate thread of the main event processing loop. In those cases, state updates must still happen synchronously. The [async events capability](/docs/reference/plugins/plugin-api-reference/#async-events-capability-api) is the strategy provided by the plugin framework. With that, plugins are provided with a thread-safe callback that they can use to inject asynchronous events in the currently-open event stream, and the framework will guarantee those events to be later received by functions such as `parse_event` or `extract_fields` just like any other events. Plugins can only safely utilize asynchronously-obtained information for state updates and field extraction through this messaging-like communication mode.

An additional effect of injecting asynchronous events in an event stream is that they can so be recorded in SCAP capture files, thus being reproducible when reading events later from that capture files. By having the asynchronous information recorded in the event stream, the event parsing and field extraction plugin functions will be able to work just like in live capture mode by also making all the state transitions reproducible and deterministic.
