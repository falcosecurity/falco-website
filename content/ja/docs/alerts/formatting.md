---
title: コンテナとオーケストレーションにおけるアラートのフォーマット
---

Sysdigと同様に、Falcoはコンテナおよびオーケストレーション環境をネイティブでサポートしています。Falcoは`-k`を使用して、提供されたK8s APIサーバーと通信し、K8s pod/namespace/deployment/etcでイベントを装飾します。イベントに関連付けられています。`-m`を指定すると、Falcoはマラソンサーバーと通信して同じことを行います。

Sysdigと同様に、Falcoは`-pk`/`-pc`/`-p`引数で実行でき、フォーマットされた出力をk8s-friendly/mesos-friendly/container-friendly/generalフォーマットに変更します。ただし、sysdigとは異なり、フォーマットされた出力のソースは、コマンドラインではなく一連のルール内にあります。このページでは、`-pk`/`-pc`/`-p` がルールの`output`属性のフォーマット文字列とどのように相互作用するかについて詳しく説明します。

k8s/containersからの情報は、次の方法でコマンドラインオプションと組み合わせて使用されます：

* ルール出力で、フォーマット文字列に`%container.info`が含まれている場合、これらのオプションのいずれかが指定されていれば、それは`-pk`/`-pc`の値に置き換えられます。オプションが指定されていない場合、代わりに`%container.info`が汎用の`%container.name (id=%container.id)`に置き換えられます。

* フォーマット文字列に`%container.info`が含まれておらず、`-pk`/`-pc`のいずれかが指定されている場合、フォーマット文字列の最後に追加されます。

* `-p`が一般的な値で指定された場合（つまり、`-pk`/`-pc`ではない場合）、値は単に末尾に追加され、すべての `%container.info`は 一般的な値。


## 例

以下は、Falcoコマンドライン、ルールの出力文字列、および結果の出力の例です：

### 出力には`%container.info`が含まれます
```
output: "Namespace change (setns) by unexpected program (user=%user.name command=%proc.cmdline parent=%proc.pname %container.info)"

$ falco
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s-kubelet (id=4a4021c50439))

$ falco -pk -k <k8s api server url>
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s.pod=jclient-3160134038-qqaaz container=4a4021c50439)

$ falco -p "This is Some Extra" -k <k8s api server url>
15:42:35.347416068: Warning Namespace change (setns) by unexpected program (user=root command=test_program parent=hyperkube k8s-kubelet (id=4a4021c50439)) This is Some Extra
```

### 出力に`%container.info`が含まれていません

```
output: "File below a known binary directory opened for writing (user=%user.name command=%proc.cmdline file=%fd.name)"

$ falco
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) k8s-kubelet (id=4a4021c50439)

$ falco -pk -k <k8s api server url>
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) k8s.pod=jclient-3160134038-qqaaz container=4a4021c50439

$ falco -p "This is Some Extra" -k <k8s api server url>
15:50:18.866559081: Warning File below a known binary directory opened for writing (user=root command=touch /bin/hack file=/bin/hack) This is Some Extra
```
