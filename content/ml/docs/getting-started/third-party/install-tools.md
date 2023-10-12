---
exclude_search: true
---
| ശീർഷകം              | വിവരണം                                                       | വെയ്റ്റ് |
| ------------------- | ------------------------------------------------------------ | ----- |
| ഇൻസ്റ്റാളേഷൻ ഉപകരണങ്ങൾ | ഫാൽക്കോ കോറിൽ നിർമ്മിച്ച സംയോജനങ്ങൾക്ക് ആവശ്യമായ ഇൻസ്റ്റാളേഷൻ ഉപകരണങ്ങൾ | 1     |



## **സ്ക്രിപ്റ്റ് ചെയ്ത ഇൻസ്റ്റാൾ** **{#scripted}**

ലിനക്സിൽ ഫാൽക്കോ ഇൻസ്റ്റാൾ ചെയ്യുന്നതിന്, ആവശ്യമായ ഘട്ടങ്ങൾ ശ്രദ്ധിക്കുന്ന ഒരു ഷെൽ സ്ക്രിപ്റ്റ് നിങ്ങൾക്ക് ഡൌൺലോഡ് ചെയ്യാൻ കഴിയും:

```shell
curl -o install_falco -s https://falco.org/script/install
```

എന്നിട്ട്, sha256sum ഉപയോഗിച്ച് (അല്ലെങ്കിൽ സമാനമായ എന്തെങ്കിലും) സ്ക്രിപ്റ്റിൻറെ [SHA256](https://en.wikipedia.org/wiki/SHA-2) ചെക്ക് സം പരിശോധിക്കുക:

```shell
sha256sum install_falco
```

അത് `{{< sha256sum >}}` ആയിരിക്കണം.

എന്നിട്ട് സ്ക്രിപ്റ്റ് റൂട്ട് ആയോ സൂഡോ ഉപയോഗിച്ചോ റൺ ചെയ്യുക:

```shell
sudo bash install_falco
```

## Helm

Helm ഉപയോഗിച്ച് നിങ്ങൾക്ക് Kubernetes ൽ ഫാൽക്കോ ഇൻസ്റ്റാൾ ചെയ്യാൻ കഴിയും. അത് എങ്ങനെ ഉപയോഗിക്കാമെന്നതിനെ കുറിച്ചുള്ള ഫാൽക്കോ കമ്മ്യൂണിറ്റി പിന്തുണക്കുന്ന ഒരു Helm ചാർട്ടും ഡോക്യുമെൻറേഷനും [ഇവിടെ കാണാവുന്നതാണ്](https://github.com/falcosecurity/charts/tree/master/charts/falco).

Helm എങ്ങനെ ഡൌൺലോഡ് ചെയ്യാമെന്നതിനെയും ഇൻസ്റ്റാൾ ചെയ്യാമെന്നതിനെയും കുറിച്ചുള്ള കൂടുതൽ വിവരങ്ങൾക്കായി [Installing Helm](https://helm.sh/docs/intro/install/) കാണുക.

<a class="btn btn-primary" href="https://helm.sh/docs/intro/install/" role="button" aria-label="View Installing Helm Guide">View Installing Helm Guide</a>

## kubectl

`kubectl` എന്ന Kubernetes കമാൻഡ് ലൈൻ ഉപകരണം, Kubernetes ക്ലസ്റ്ററുകൾക്കെതിരെ കമാൻഡുകൾ റൺ ചെയ്യാൻ നിങ്ങളെ അനുവദിക്കുന്നു. ആപ്ലിക്കേഷൻസ് വിന്യസിക്കാനും, ക്ലസ്റ്റർ ഉറവിടങ്ങൾ പരിശോധിക്കാനും നിയന്ത്രിക്കാനും, ലോഗുകൾ കാണാനും നിങ്ങൾക്ക് `kubectl` ഉപയോഗിക്കാവുന്നതാണ്.
`kubectl` എങ്ങനെ ഡൌൺലോഡ് ചെയ്യാം, ഇൻസ്റ്റാൾ ചെയ്യാം, നിങ്ങളുടെ ക്ലസ്റ്റർ ലഭ്യമാക്കാനായി എങ്ങനെ സജ്ജമാക്കാം എന്നിവയെ കുറിച്ചുള്ള കൂടുതൽ വിവരങ്ങൾക്കായി [Install and Set Up kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) കാണുക.

<a class="btn btn-primary" href="https://kubernetes.io/docs/tasks/tools/install-kubectl/" role="button" aria-label="View kubectl Install and Set Up Guide">View kubectl Install and Set Up Guide</a>
