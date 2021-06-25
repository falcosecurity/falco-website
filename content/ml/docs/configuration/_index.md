|  ശീർഷകം  |           വിവരണം            | വെയ്റ്റ് | notoc |
| :------: | :-------------------------: | :---: | :---: |
| ക്രമീകരണം | ഫാൽക്കോ ഡെയ്മണിനായുള്ള ക്രമീകരണം |   4   | true  |

{{% pageinfo color="primary" %}} ഇത് ഫാൽക്കോ ഡെയ്മൺ ക്രമീകരണ ഓപ്ഷനുകൾക്കായുള്ളതാണ്.

ആ ഓപ്ഷനുകൾക്കായി ദയവായി  [rules](https://github.com/falcosecurity/falco-website/blob/master/content/en/docs/rules) അല്ലെങ്കിൽ [alerts](https://github.com/falcosecurity/falco-website/blob/master/content/en/docs/alerts) സന്ദർശിക്കുക.

{{% /pageinfo %}}

ഫാൽക്കോയുടെ ക്രമീകരണ ഫയൽ   `key: value` അല്ലെങ്കിൽ`key: [value list]` ജോഡികളുടെ ഒരു ശേഖരമടങ്ങിയ ഒരു [YAML](http://www.yaml.org/start.html) ഫയൽ ആണ്.

 `-o/--option key=value` ഫ്ലാഗ് വഴി ഏതൊരു ക്രമീകരണഓപ്ഷനും കമാൻഡ് ലൈനിൽ ഓവർറൈഡ് ചെയ്യാനാകും.  `key: [value list]` ഓപ്ഷനുകൾക്ക്,  `--option key.subkey=value` എന്നത് ഉപയോഗിച്ച് നിങ്ങൾക്ക് വ്യക്തിഗത ലിസ്റ്റ് ഇനങ്ങൾ വ്യക്തമാക്കാവുന്നതാണ്.

## നിലവിലെ ക്രമീകരണഓപ്ഷനുകൾ

{{< config >}}