Key | Required | Description | Default
:---|:--------:|:------------|:------:
`rule` | yes | A short, unique name for the rule. |
`condition` | yes | A filtering expression that is applied against events to check whether they match the rule. |
`desc` | yes | A longer description of what the rule detects. |
`output` | yes | Specifies the message that should be output if a matching event occurs. See [output](#output). |
`priority` | yes | A case-insensitive representation of the severity of the event. Should be one of the following: `emergency`, `alert`, `critical`, `error`, `warning`, `notice`, `informational`, `debug`. |
`exceptions` | no | A set of [exceptions](/docs/rules/exceptions) that cause the rule to not generate an alert. |
`enabled` | no | If set to `false`, a rule is neither loaded nor matched against any events. | `true`
`tags` | no | A list of tags applied to the rule (more on this [below](#tags)). |
`warn_evttypes` | no | If set to `false`, Falco suppresses warnings related to a rule not having an event type (more on this [below](#rule-condition-best-practices)). | `true`
`skip-if-unknown-filter` | no | If set to `true`, if a rule conditions contains a filtercheck, e.g. `fd.some_new_field`, that is not known to this version of Falco, Falco silently accepts the rule but does not execute it; if set to `false`, Falco repots an error and exists when finding an unknown filtercheck. | `false`
`source` | no | The event source for which this rule should be evaluated. Typical values are `syscall`, `k8s_audit`, or the source advertised by a source [plugin](../plugins). | `syscall`
