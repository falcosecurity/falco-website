---
title: ഡൌൺലോഡ്
description: ഔദ്യോഗികമായി പിന്തുണയ്ക്കുന്ന ഫാൽക്കോ ആർട്ടിഫാക്ടസ്
weight: 2
---

ഫാൽകോ ഡൗൺലോഡ് ചെയ്യുന്നതിനും പ്രവർത്തിപ്പിക്കുന്നതിനുമുള്ള രണ്ട് രീതികളാണ്  ഫാൽകോ പ്രോജക്റ്റ് കമ്മ്യൂണിറ്റി ഔദ്യോഗികമായി പിന്തുണയ്ക്കുന്നത്:

-  ഒരു ലിനക്സ് ഹോസ്റ്റിൽ ഫാൽക്കോ [ഡൌൺലോഡ്](/docs/getting-started/download) ചെയ്ത് പ്രവർത്തിപ്പിക്കുക. അല്ലെങ്കിൽ ഡ്രൈവർ ഇൻസ്റ്റാൾ ചെയ്തിട്ടുള്ള അടിസ്ഥാന ഹോസ്റ്റിൽ പ്രവർത്തിക്കുന്ന ഒരു കണ്ടെയ്നറിൽ ഫാൽകോ യൂസർസ്പേസ് പ്രോഗ്രാം പ്രവർത്തിപ്പിക്കുക.

-  ഉറവിടത്തിൽ നിന്ന് നിർമ്മിച്ച് [Building](/docs/getting-started/source) ഫാൽകോ ഒരു ലിനക്സ് ഹോസ്റ്റിലോ കണ്ടെയ്നറിലോ പ്രവർത്തിപ്പിക്കുക.

ഫാൽക്കോ ആർട്ടിഫാക്ടസ് ലഭിക്കാനുള്ള മാർഗങ്ങൾ ചുവടെ നൽകിയിരിക്കുന്നു:


### ലിനക്സിനായി ഡൗൺലോഡ് ചെയ്യുക {#packages}

|        | development                                                                                                                 | stable                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| rpm    | [![rpm-dev](https://img.shields.io/bintray/v/falcosecurity/rpm-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][1] | [![rpm](https://img.shields.io/bintray/v/falcosecurity/rpm/falco?label=Falco&color=%23005763&style=flat-square)][2] |
| deb    | [![deb-dev](https://img.shields.io/bintray/v/falcosecurity/deb-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][3] | [![deb](https://img.shields.io/bintray/v/falcosecurity/deb/falco?label=Falco&color=%23005763&style=flat-square)][4] |
| binary | [![bin-dev](https://img.shields.io/bintray/v/falcosecurity/bin-dev/falco?label=Falco&color=%2300aec7&style=flat-square)][5] | [![bin](https://img.shields.io/bintray/v/falcosecurity/bin/falco?label=Falco&color=%23005763&style=flat-square)][6] |

ലഭ്യമായ എല്ലാ ഫാൽക്കോ ആർട്ടിഫാക്ടുകളുടെയും [പട്ടിക](https://bintray.com/falcosecurity).

---

### കണ്ടെയ്നർ ഇമേജുകൾ ഡൺലോഡ് ചെയ്യുക {#images}

{{% pageinfo color="primary" %}}
പ്രവർത്തിക്കുന്ന സിസ്റ്റം കോളുകളെക്കുറിച്ചുള്ള വിവരങ്ങൾ ഫാൽകോയ്ക്ക്  ലഭിക്കുന്നതിന് ഹോസ്റ്റ് സിസ്റ്റത്തിൽ ഇൻസ്റ്റാൾ ചെയ്ത ഡ്രൈവറിനെ ആശ്രയിച്ചിരിക്കുന്നു.

മുകളിൽ നിർവചിച്ചിരിക്കുന്ന നേറ്റീവ് ആർട്ടിഫാക്റ്റുകൾ ഉപയോഗിച്ച് ഡ്രൈവർ ഇൻസ്റ്റാൾ ചെയ്യുക എന്ന ഇൻസ്റ്റാളേഷൻ രീതിക്കാണ് മുൻ‌ഗണന. അല്ലെങ്കിൽ, താൽക്കാലികമായി  
 `falcosecurity/falco-driver-loader` ഇമേജ് പ്രത്യേകാവകാശമായി പ്രവർത്തിപ്പിക്കുക. തുടർന്ന് `falcosecurity/falco-no-driver` ഉപയോഗിക്കുക.


കൂടുതൽ വിവരങ്ങൾക്ക്, [താൽക്കാലികമായഡോക്കറിനുള്ളിൽ പ്രവർത്തിപ്പിക്കുന്ന വിധം](/docs/getting-started/running#docker) കാണുക.

{{% /pageinfo %}}

|tag | pull command | description |
|----|----------|-----------------|
|[latest](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:latest` | ഏറ്റവും പുതിയ പതിപ്പ് |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-no-driver/tags)| `docker pull falcosecurity/falco-no-driver:<version>` | `{{< latest >}}` പോലുള്ള ഫാൽക്കോയുടെ ഒരു പ്രത്യേക പതിപ്പ് |
|[latest](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:latest` | നിർമ്മാണ  ടൂൾചെയിനൊപ്പമുള്ള  `falco-driver-loader'-ന്റെ ഏറ്റവും പുതിയ പതിപ്പ് |
|[*version*](https://hub.docker.com/r/falcosecurity/falco-driver-loader/tags)| `docker pull falcosecurity/falco-driver-loader:<version>` | `{{< latest >}}` പോലുള്ള `falco-driver-loader'-ന്റെ നിർമ്മാണ ടൂൾചെയിനോട്കൂടിയുള്ള ഒരു പ്രത്യേക പതിപ്പ് |
|[latest](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:latest` | `falco-driver-loader` ഉൾപ്പെടുത്തിയിട്ടുള്ള ഫാൽക്കോയുടെ ഏറ്റവും പുതിയ പതിപ്പ് |
|[*version*](https://hub.docker.com/r/falcosecurity/falco/tags)| `docker pull falcosecurity/falco:<version>` | `falco-driver-loader' ഉൾപ്പെടുത്തിയിട്ടുള്ള  `{{< latest >}}` പോലുള്ള ഫാൽക്കോയുടെ ഒരു പ്രത്യേക പതിപ്പ് |

ലഭ്യമായ എല്ലാ ഇമേജുകളുടെയും [പട്ടിക](https://github.com/falcosecurity/falco/tree/master/docker) കാണുക.

[1]: https://dl.bintray.com/falcosecurity/rpm-dev
[2]: https://dl.bintray.com/falcosecurity/rpm
[3]: https://dl.bintray.com/falcosecurity/deb-dev/stable
[4]: https://dl.bintray.com/falcosecurity/deb/stable
[5]: https://dl.bintray.com/falcosecurity/bin-dev/x86_64
[6]: https://dl.bintray.com/falcosecurity/bin/x86_64
