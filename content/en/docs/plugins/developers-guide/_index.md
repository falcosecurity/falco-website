---
title: Falco Plugins Developers Guide
linktitle: Developers Guide
description: Start writing your own Falco plugins
weight: 10
aliases:
    - /docs/plugins/developers_guide/
---

## Introduction

This page is a guide for developers who want to write their own Falco/Falco libs plugins, providing some general best practices for authoring plugins.

If you're not interested in writing your own plugin, or modifying one of the existing plugins, you can skip this page.

Although plugins can be written in many languages, the Plugins API uses C functions, so you should be comfortable with C language concepts to understand the API.

Before reading this page, read the main [plugins](../../plugins) page for an overview of what plugins are and how they are used by Falco/Falco libs.

## High Level Overview

Here is a high level overview of how the plugin framework uses API functions to interact with plugins:

* **Initialization**
	* **Checking API Compatibility** — The framework calls `plugin_get_required_api_version` to verify that the plugin is compatible with the framework
	* **Collecting Plugin Info** — The framework calls `plugin_get_xxx` functions to obtain information about the plugin
	* **Checking Capabilities** — The framework checks which capabilities a plugin implements by verifying that the required functions are exported
		* **Getting Supported Event source** — If the plugin has the event sourcing capability, the framework calls `plugin_get_id` and  `plugin_get_event_source` to obtain the plugin ID and its event source
		* **Getting Supported Extractable Fields** — If the plugin has the field extraction capability, the framework calls `plugin_get_fields` to obtain the list of fields supported by the plugin
	* **Initializing the Plugin** — The framework calls `plugin_init` to initialize a plugin, which returns an opaque `ss_plugin_t` handle. This handle is passed as an argument to later functions
* **Opening Streams of Events (*event sourcing capability only*)**
	* **Opening a Stream** —  The framework calls `plugin_open` the open a stream of events, which returns an opaque `ss_instance_t` handle. This handle is passed as an argument to later functions
	* **Collecting Events** — The framework calls `plugin_next_batch` to obtain events from the plugin
	* **Closeing the Stream** — The framework calls `plugin_close` to close a stream of events. The `ss_instance_t` handle is considered invalid and will not be used again
* **Extracting Fields from Events (*field extraction capability only*)**
	* **Extracting Values** — The framework calls `plugin_extract_fields` to obtain values for fields for a given event
* **Deinitialization**
	* **Destroying the Plugin** — The framework calls `plugin_destroy` to destroy a plugin. The `ss_plugin_t` handle is considered invalid and will not be used again.

## General Plugin Development Considerations

### Plugin SDKs

In order to abstract the complexity related with the low-level details of plugin development, the Falcosecurity organization provides a maintains SDKs to make the life of developers easier. Using an SDK is not mandatory but highly encouraged, and should be the way to go for almost all use cases.

So far, only the [SDK for the Go language](https://github.com/falcosecurity/plugin-sdk-go) is production-ready. Please check the [Go SDK walkthrough section](/docs/reference/plugins/go-sdk-walkthrough) for in-depth details.
### API Versioning

The plugins API is versioned with a [semver](https://semver.org/)-style version string. The plugins framework checks the plugin's required api version by calling the `plugin_get_required_api_version` API function. In order for the framework to load the plugin, the major number of the plugin framework must match the major number in the version returned by `plugin_get_required_api_version`. Otherwise, the plugin is incompatible and will not be loaded.

### Required vs Optional Functions

Some API functions are required, while others are optional. If a function is optional, the plugin can choose to not define the function at all. The framework will note that the function is not defined and will use default behavior. For optional functions, the default behavior is described below.

### Memory Returned Across the API is Owned By the Plugin

Every API function that returns or populates a string or struct pointer must point to memory allocated by the plugin and must remain valid for use by the plugin framework. When using the SDKs, this is generally handled automatically. Keep it in mind if using the plugin API functions directly, however.

### What Configuration/Internal State Goes Where?

When the framework calls `plugin_open`, it provides a configuration string which is used to configure the plugin. When the framework calls `plugin_open`, it provides a parameters string which is used to source a stream of events. The format of both text blocks is defined by the plugin and is passed directly through by the plugin framework.

Within a plugin, it must maintain state in two objects: a `ss_plugin_t` for plugin state, and a `ss_instance_t` for plugin instance state.

For new plugin authors, it may be confusing to determine which state goes in each object and what information should be provided in the configuration string vs the parameters string. Ultimately, that's up to the plugin author, but here are some guidelines to follow:

* The `ss_plugin_t` struct should contain *configuration* that instructs the plugin how to behave. Generally, this is sourced from the configuration string.
* The `ss_instance_t` struct should contain *parameters* that instruct the plugin on how to source a stream of events. Generally, this is sourced from the parameters string.
* Instance state (e.g. the `ss_instance_t` struct) should include things like file handles, connection objects, current buffer positions, etc.

For example, if a plugin fetches URLs, whether or not to allow self-signed certificates would belong in configuration, and the actual URLs to fetch would belong in parameters.

### What Goes In An Event?

Similarly, it may be confusing to distinguish between state for a plugin (e.g. `ss_plugin_t`/`ss_instance_t`) as compared to the actual data that ends up in an event. This is especially important when thinking about fields and what they represent. A good rule of thumb to follow is that fields should *only* extract data from events, and not internal state. For example, this behavior is encouraged by *not* providing a `ss_instance_t` handle as an argument to `plugin_extract_fields`.

For example, assume some plugin returned a sample of a metric in events, and the internal state also held the maximum value seen so far. It would be a good practice to have a field `plugin.sample` that returned the value in a given event. It would *not* be a good practice to have a field `plugin.max_sample` that returned the maximum value seen, because that information is held in the internal state and not in events. If events *also* saved the current max sample so far, then it would be fine to have a field `plugin.max_sample`, as that can be retrieved directly from a single event.

A question to ask when deciding what to put in an event is "if this were written to a `.scap` capture file and replayed, would this plugin return the same values for fields as it did when the events were first generated?".

Alternatively, the plugin can leverage access to [state tables](/docs/reference/plugins/plugin-api-reference/#state-tables-api) for extracting pieces of information not contained in an event. In such a case, the best practice is for the plugin to implement the [event parsing capability](/docs/reference/plugins/plugin-api-reference/#event-parsing-capability-api) and update its internal state when parsing the events of a given data stream. The functional internal state must not be updated when extracting fields unless they are simple cache updates oriented to performance optimizations. Then, at the extraction, the plugin can read information from the event's payload and the state it has access to, either owned by itself or from another component registered in the framework.

However, the fundamental question when handling the plugin's state updates is always whether that state must be reproducible or not in case the event stream is replayed through a capture file. Given that in most cases that is a requirement, the plugin must consider also implementing the [async events capability](/docs/reference/plugins/plugin-api-reference/#async-events-capability-api) for being able to inject an async synthetic event in a live data stream, to record that and make it available for file capture. The plugin needs to be capable of parsing those async events in its event parsing functions to potentially replay them and reproduce the corresponding state changes.

### Plugin Authoring Lifecycle

Here are some considerations to keep in mind when releasing the initial version of a new plugin and when releasing updated versions of the plugin.

#### Initial Version

For plugins with event sourcing capability, make sure the event source is distinct, or if the same as existing plugins, that the saved payload is identical. In most cases, each plugin should define a new event source.

For plugins with field extraction capability, if the plugin exports a set of compatible sources, make sure you have tested it with each compatible plugin with event sourcing capability to ensure that your plugin can read event payloads without errors/crashing. If the plugin does *not* export a set of compatible sources (meaning that it potentially handles every kind of event), your plugin must be very resilient. It will potentially be handed arbitrary binary data from other plugins.

Register this plugin by submitting a PR to [falcosecurity/plugins](https://github.com/falcosecurity/plugins) to update the [plugin registry](https://github.com/falcosecurity/plugins/blob/master/registry.yaml). This will give an official Plugin ID that can be safely used in capture files, etc., without overlapping with other plugins. It also lets others know that a new plugin is available!

#### Updates

Every new release of a plugin should update the plugin's version number. Following semver conventions, the patch number should always be updated, the minor number should be updated when new fields are added, and the major number should be updated whenever any field is modified/removed or the semantics of a given field changes.

With every release, you should check for an updated Plugin API Version and if needed, update the plugin to conform to the new API. Remember that a plugin and framework are considered be compatible if their major versions are the same.

With each new release, make sure the contact information provided by the plugin is up-to-date.

