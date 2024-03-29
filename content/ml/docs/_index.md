---
exclude_search: true
title: ഫാൽകോ പ്രോജക്റ്റ്
description: ക്ലൗഡ് നേറ്റീവ് റൺടൈം സെക്യൂരിറ്റി
weight: 1
---

## What is Falco?

[Sysdig, Inc](https://sysdig.com) നിർമ്മിച്ച ഒരു ഓപ്പൺ സോഴ്‌സ് റൺടൈം സുരക്ഷാ ടൂൾ ആണ്  ഫാൽക്കോ പ്രോജക്റ്റ്. ഫാൽക്കോ [സിഎൻ‌സി‌എഫിന് സംഭാവന നൽകി, ഇപ്പോൾ ഒരു സി‌എൻ‌സി‌എഫ് ഇൻ‌ക്യുബേറ്റിംഗ് പ്രോജക്റ്റാണ്](https://www.cncf.io/blog/2020/01/08/toc-votes-to-move-falco-into-cncf-incubator/).

## ഫാൽക്കോ എന്താണ് ചെയ്യുന്നത്?

സിസ്റ്റം കോളുകൾ ഉപയോഗിച്ചു ഫാൽകോ ഒരു സിസ്റ്റം സുരക്ഷിതമാക്കുകയും നിരീക്ഷിക്കുകയും ചെയ്യുന്നു. അതിനായ്:

 - കേർണലിൽ നിന്ന് റൺടൈമിൽ ലിനക്സ് സിസ്റ്റം കോളുകൾ പാഴ്‌സുചെയ്യുന്നു
 - ശക്തമായ റൂൾസ് എഞ്ചിനു കൈകാര്യം ചെയ്യാനുതകുന്ന സ്ട്രീം അയക്കുന്നു
 - ഒരു നിയമം ലംഘിക്കുമ്പോൾ മുന്നറിയിപ്പ് നൽകുന്നു

 കൂടുതൽ വിവരങ്ങൾക്ക്, ഫാൽക്കോ[Rules](rules) കാണുക.

## ഫാൽകോ എന്തൊക്കെ പരിശോധിക്കുന്നു?

അസാധാരണമായ പെരുമാറ്റങ്ങൾ കണ്ടുപിടിക്കാനായി കേർണൽ പരിശോധിക്കുന്ന ഡീഫോൾട് റൂളുകൾ അടങ്ങിയതാണ് ഫാൽക്കോ. ഉദാഹരണമായി:

 - പ്രിവിലേജ്ഡ് കണ്ടെയ്നറുകൾ ഉപയോഗിച്ച് പ്രിവിലേജ് വർദ്ധിപ്പിക്കൽ
 - `setns` പപോലുള്ള ടൂൾസ് ഉപയോഗിച്ച് നെയിംസ്‌പെയ്‌സ് മാറ്റങ്ങൾ വരുത്തൽ
 - `/ etc`,` / usr / bin`, `/ usr / sbin` മുതലായ പ്രധാന ഡയറക്ടറികൾ വായിക്കുക / എഴുതുക
 - symlinks നിർമ്മിക്കുക
 - ഉടമസ്ഥാവകാശവും മോഡ് മാറ്റങ്ങളും നടക്കുക
 - അപ്രതീക്ഷിത നെറ്റ്‌വർക്ക് കണക്ഷനുകളോ  സോക്കറ്റ് മ്യൂട്ടേഷനുകളോ സംഭവിക്കുക
 - `execve` ഉപയോഗിച്ച് വികസിപ്പിച്ച പ്രക്രിയകൾ
 - `sh`, `bash`, `csh`, `zsh` പോലുള്ള ഷെൽ ബൈനറികൾ എക്സിക്യൂട്ട് ചെയ്യുക
 - `ssh`, `scp`, `sftp` പോലുള്ള SSH ബൈനറികൾ എക്സിക്യൂട്ട് ചെയ്യുക
 - ലിനക്സ്‌ `coreutils` എക്സിക്യൂട്ടബിളുകൾ പരിവർത്തനം ചെയ്യുക
 - ലോഗിൻ ബൈനറികൾ പരിവർത്തനം ചെയ്യുക
 - `shadowutil`, `passwd` എക്സിക്യൂട്ടബിളുകൾ പരിവർത്തനം ചെയ്യുക. അത്തരം എക്സിക്യൂട്ടബിളുകളുടെ ഏതാനും ഉദാഹരണങ്ങൾ ചുവടെ കൊടുത്തിരിക്കുന്നു:
      * `shadowconfig`
      * `pwck`
      * `chpasswd`
      * `getpasswd`
      * `change`
      * `useradd`
      * `etc`


## എന്താണ് ഫാൽക്കോ റൂൾസ്?

ഫാൽക്കോ ഉപയോഗിച്ച് പ്രാമാണീകരിക്കുന്ന ചട്ടക്കൂടുകളാണ് റൂൾസ്. അവ ഫാൽക്കോ കോൺഫിഗറേഷൻ ഫയലിൽ നിർവചിച്ചിരിക്കുന്നു. കൂടാതെ നിങ്ങൾക്ക് സിസ്റ്റത്തിൽ പരിശോധിക്കാൻ കഴിയുന്ന ഇവന്റുകളെയും പ്രതിനിധീകരിക്കുന്നു. ഫാൽക്കോ റൂൾസ് എഴുതുക, മാനേജുചെയ്യുക, വിന്യസിക്കുക എന്നിവയെക്കുറിച്ചുള്ള കൂടുതൽ‌ വിവരങ്ങൾ‌ക്കായി [Rules](rules) കാണുക.

## എന്താണ് ഫാൽകോ അലേർട്ടുകൾ?

`STDOUT` ലേക്ക് ലോഗിൻ ചെയ്യുന്നത് പോലെ ലളിതമോ ഒരു ക്ലയന്റിന് ഒരു gRPC കോൾ കൈമാറുന്നതുപോലുള്ള സങ്കീർണ്ണമോ ആയി ക്രമീകരിക്കാവുന്ന ഡൌൺ സ്ട്രീം പ്രവർത്തനങ്ങളാണ് അലേർട്ടുകൾ. ഫാൽക്കോ അലേർട്ടുകൾ എഴുതുക, മാനേജുചെയ്യുക, വിന്യസിക്കുക എന്നിവയെക്കുറിച്ചുള്ള കൂടുതൽ‌ വിവരങ്ങൾ‌ക്കായി [Falco Alerts](alerts) കാണുക. ഫാൽക്കോയ്ക്ക് അലേർട്ടുകൾ അയയ്ക്കാൻ കഴിയുന്നവ:

- സ്റ്റാൻഡേർഡ് ഔട്ട്പുട്ട്
- ഒരു ഫയൽ
- സിസ് ലോഗ്
- സ്പോൺ ചെയ്യുപ്പെട്ട  പ്രോഗ്രാമുകൾ
- ഒരു HTTP[s]എൻഡ്പോയിന്റ്
- ഒരു gRPC ക്ലയന്റ്


## ഫാൽക്കോയുടെ ഭാഗങ്ങള്‍ എന്തൊക്കെയാണ്?

മൂന്ന് പ്രധാന ഭാഗങ്ങള്‍ അടങ്ങിയതാണ് ഫാൽക്കോ:

 - യൂസർസ്പേസ് പ്രോഗ്രാം. ഫാൽക്കോയുമായി സംവദിക്കാൻ നിങ്ങൾക്ക് ഉപയോഗിക്കാനാകുന്ന `falco` എന്നറിയപ്പെടുന്ന CLI ടൂൾ. ഈ യൂസർസ്പേസ് പ്രോഗ്രാം സിഗ്നലുകൾ കൈകാര്യം ചെയ്യുന്നു, ഒരു ഫാൽകോ ഡ്രൈവറിൽ നിന്നുള്ള വിവരങ്ങൾ പാഴ്‌സുചെയ്യുന്നു, ഒപ്പം അലേർട്ടുകൾ അയയ്ക്കുകയും ചെയ്യുന്നു.

 - കോൺഫിഗറേഷൻ - ഫാൽക്കോ എങ്ങനെ പ്രവർത്തിക്കുന്നു, എന്ത് നിയമങ്ങൾ സ്ഥാപിക്കണം, അലേർട്ടുകൾ എങ്ങനെ നടത്തണം എന്നിവ നിർവചിക്കുന്നു. കൂടുതൽ വിവരങ്ങൾക്ക് [Configuration](configuration)കാണുക.

 - ഡ്രൈവർ - ഫാൽക്കോ ഡ്രൈവർ സവിശേഷതകൾ  പാലിക്കുകയും, സിസ്റ്റം കോൾ വിവരങ്ങളുടെ ഒരു സ്ട്രീം അയയ്ക്കുകയും ചെയ്യുന്ന ഒരു സോഫട് വെയർ ആണ്.  ഒരു ഡ്രൈവർ ഇൻസ്റ്റാൾ ചെയ്യാതെ നിങ്ങൾക്ക് ഫാൽക്കോ പ്രവർത്തിപ്പിക്കാൻ കഴിയില്ല.
നിലവിൽ, ഫാൽകോ ഇനിപ്പറയുന്ന ഡ്രൈവറുകളെ പിന്തുണയ്ക്കുന്നു:

    - (Default) `libscap` and `libsinsp` C++ ലൈബ്രറികളിൽ നിർമ്മിച്ച കേർണൽ മൊഡ്യൂൾ
    - സമാന മൊഡ്യൂളുകളിൽ നിന്ന് നിർമ്മിച്ച BPF പ്രോബ്
    - യൂസർസ്പേസ് ഇൻസ്ട്രുമെന്റേഷൻ

കൂടുതൽ വിവരങ്ങൾക്ക് [Falco Drivers](/docs/event-sources/drivers/) കാണുക.
