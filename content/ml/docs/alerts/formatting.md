---
title: കണ്ടെയ്നറുകൾക്കും ഓർക്കസ്ട്രേഷനുമായി അലേർട്ട്സ് രൂപകൽപ്പന ചെയ്യുന്നു
---

സിസ്ഡിഗ് പോലെ, കണ്ടെയ്നറുകൾക്കും ഓർക്കസ്ട്രേഷൻ പരിതസ്ഥിതികൾക്കുമുള്ള നേറ്റീവ് പിന്തുണ ഫാൽക്കോക്കും ഉണ്ട്. `-k` ഉപയോഗിച്ച്, ഇവൻറുമായി ബന്ധപ്പെട്ട Kubernetes pod/namespace/deployment തുടങ്ങിയവ ഉപയോഗിച്ച് ഇവൻറുകൾ ഡെക്കറേറ്റ് ചെയ്യാൻ, നൽകിയിട്ടുള്ള Kubernetes API സർവറുമായി ഫാൽക്കോ ആശയവിനിമയം നടത്തുന്നു. `-m` ഉപയോഗിച്ച്, ഫാൽക്കോ ഇതേ കാര്യം ചെയ്യാനായി മാരത്തൺ സർവറുമായി ആശയവിനിമയം നടത്തുന്നു.

സിസ്ഡിഗ് പോലെ, k8s-സൌഹൃദ/മെസോസ്-സൌഹൃദ/കണ്ടെയ്നർ-സൌഹൃദ/പൊതു രൂപകൽപ്പനയിലേക്ക്, രൂപകൽപ്പന ചെയ്ത ഔട്ട്പുട്ടിനെ മാറ്റുന്ന `-pk/-pm/-pc/-p` ആർഗ്യുമെൻറുകൾ ഉപയോഗിച്ച് ഫാൽക്കോയും റൺ ചെയ്യാൻ കഴിയും.എന്നിരുന്നാലും, സിസ്ഡിഗിൽ നിന്നും വ്യത്യസ്തമായി, രൂപകൽപ്പന ചെയ്ത ഔട്ട്പുട്ടിൻറെ ഉറവിടം നിയമങ്ങളുടെ ഗണത്തിലാണ്, കമാൻഡ് ലൈനിലല്ല. എങ്ങനെയാണ് `-pk/-pm/-pc/-p`, നിയമങ്ങളുടെ `output` ആട്രിബ്യൂട്ടിലെ രൂപകൽപ്പനാ സ്ട്രിങ്ങുകളുമായി സമ്പർക്കം പുലർത്തുന്നത് എന്നതിനെ കുറിച്ച് ഈ പേജ് കൂടുതൽ വിവരങ്ങൾ നൽകുന്നു.

k8s/മെസോസ്/കണ്ടെയ്നർ എന്നതിൽ നിന്നുമുള്ള വിവരങ്ങൾ കമാൻഡ് ലൈൻ ഓപ്ഷനുകളുമായി സംയോജിച്ച് ഉപയോഗിക്കുന്നത് ഈ വിധങ്ങളിൽ ആണ്:

- നിയമ ഔട്ട്പുട്ടുകളിൽ, രൂപകൽപ്പനാ സ്ട്രിങ്ങ് `%container.info` എന്നത് ഉൾക്കൊള്ളുന്നുവെങ്കിൽ, അവയിലേതെങ്കിലും ഓപ്ഷനുകൾ നൽകിയിട്ടുണ്ടെങ്കിൽ,അത് `-pk/-pm/-pc` എന്നതിൽ നിന്നുമുള്ള മൂല്യത്താൽ പുനഃസ്ഥാപിക്കപ്പെടുന്നു. ഒരു ഓപ്ഷനും നൽകിയിട്ടില്ലെങ്കിൽ,അതിന് പകരം `%container.info` ഒരു ജനറിക് ആയ `%container.name (id=%container.id)` ഉപയോഗിച്ച് പുനഃസ്ഥാപിക്കപ്പെടുന്നു.

- രൂപകൽപ്പനാ സ്ട്രിങ്ങ് `%container.info` എന്നത് ഉൾക്കൊള്ളുന്നില്ലെങ്കിൽ,കൂടാതെ `-pk/-pm/-pc` എന്നതിൽ ഒരെണ്ണം നൽകിയിട്ടുണ്ടെങ്കിൽ,അത് രൂപകൽപ്പന ചെയ്യുന്ന സ്ട്രിങ്ങിൻറെ അവസാനം ചേർക്കപ്പെടുന്നു.
- `-p` ഒരു പൊതുമൂല്യം ഉപയോഗിച്ച് വ്യക്തമാക്കപ്പെട്ടിട്ടുണ്ടെങ്കിൽ (അതായത്, `-pk/-pm/-pc` എന്നിവയല്ലാത്തത്), മൂല്യം ലളിതമായി അവസാനത്തിലേക്ക് ചേർക്കപ്പെടുകയും, `%container.info` ഏതൊന്നും ജനറിക് മൂല്യം ഉപയോഗിച്ച് പുനഃസ്ഥാപിക്കപ്പെടുകയും ചെയ്യുന്നു.



## **ഉദാഹരണങ്ങൾ**

ഫാൽക്കോ കമാൻഡ് ലൈനുകളുടെയും,നിയമങ്ങളിലെ ഔട്ട്പുട്ട് സ്ട്രിങ്ങുകളുടെയും, ഫലമായുണ്ടാകുന്ന ഔട്ട്പുട്ടുകളുടെയും ചില ഉദാഹരണങ്ങൾ ഇതാ:

### **`%container.info` ഉൾക്കൊള്ളുന്ന ഔട്ട്പുട്ട്**

`output: "Namespace change (setns) by unexpected program (user=%user.name command=%proc.cmdline parent=%proc.pname %container.info)"`

`$ falco`
`15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s-kubelet (id=4a4021c50439))`

`$ falco -pk -k <k8s api server url>`
`15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s.pod=jclient-3160134038-qqaaz container=4a4021c50439)`

`$ falco -p "This is Some Extra" -k <k8s api server url>`
`15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s-kubelet (id=4a4021c50439)) This is Some Extra`



### **`%container.info` ഉൾക്കൊള്ളുന്നില്ലാത്ത ഔട്ട്പുട്ട്**

`output: "File below a known binary directory opened for writing (user=%user.name command=%proc.cmdline file=%fd.name)"`

`$ falco`
`15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) k8s-kubelet (id=4a4021c50439)`

`$ falco -pk -k <k8s api server url>`
`15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) k8s.pod=jclient-3160134038-qqaaz container=4a4021c50439`

`$ falco -p "This is Some Extra" -k <k8s api server url>`
`15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) This is Some Extra`
