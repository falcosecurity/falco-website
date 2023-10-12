---
exclude_search: true
title: Falcoを使ったKubernetesセキュリティの入門
description: Falcoを使ったKubernetesセキュリティ監視の簡単な紹介
date: 2021-01-07
author: Frederick Fernando
canonical_url: https://www.infracloud.io/blogs/introduction-kubernetes-security-falco/
slug: intro-k8s-security-monitoring
---

## Kubernetesのセキュリティの話をしよう
Kubernetesの採用が拡大し続ける中で、どのようにセキュリティを確保するかが重要になっています。Kubernetesのようなダイナミックなインフラストラクチャープラットフォームでは、脅威を検知して対処することは重要ですが、同時に困難なことでもあります。

オープンソースのクラウドネイティブランタイムセキュリティプロジェクトであるFalcoは、Kubernetesの脅威検知エンジンの代表的なものの1つです。Falcoは2016年にSysdigによって作成され、CNCFにインキュベーションレベルのプロジェクトとして初めて参加したランタイムセキュリティプロジェクトです。Falcoは予期せぬアプリケーションの挙動を検知し、ランタイムで脅威をアラートします。

## なぜ難しいのか？
[この分析](https://thenewstack.io/top-challenges-kubernetes-users-face-deployment/)によると、セキュリティはKubernetesを実行する上で最も困難な課題の1つです。難しい理由は、クラウドネイティブスタックには複数の動くレイヤーがあるため、運用者は初期の段階ではセキュリティに焦点を当てていない可能性があるからです。もう一つの要因は、運用者が想定していることに反して、Kubernetesのいくつかのディストリビューションはデフォルトでは安全ではないかもしれないということです。

## 予防と検知
情報セキュリティは、その過程で段階的に構築され、強化されていくプロセスである。セキュリティは旅であり、目的地ではありません。情報セキュリティのプロセスには複数の戦略と活動がありますが、それらはすべて、予防、検出、対応の3つのフェーズに分けて考えることができます。

### 予防対策
予防策としては、適切なアクセス制御、認証、認可を行うことが挙げられます。システムがどの程度の保護レベルを持っていても、動機やスキルのレベルが高いほど、危険な状態に陥ることになります。絶対確実な「銀の弾丸」のようなセキュリティソリューションは存在しません。各レイヤーが故障したときに、既知の状態に安全に故障してアラームを鳴らすように、防御をより深くする戦略を展開する必要があります。この戦略の最も重要な要素は、漏洩をタイムリーに検知し、通知することです。

### 検知対策
検知対策の例としては、ホストベースの侵入検知システム(HIDS)やネットワーク侵入検知システム(NIDS)のようなセキュリティやネットワークデバイスからSIEMにログを送信し、不審なアクティビティを見たときにアラートを出すルールを構築することなどが挙げられます。防御深層アプローチによると、クラウドの監査ログ（Cloudtrailのようなもの）、Kubernetesクラスター、コンテナ、アプリケーションコード、ホストOS、カーネルを見ることから、技術スタックの複数のレイヤーに監査を行い、検出トリガーを配置する必要があります。
今回のブログでは、これらの脅威への対応にさらに役立つ検知対策を見ていきたいと思います。

![複数レイヤーの確保](https://falco.org/img/falco-securing-the-layers.jpg)

Image credit: [@leodido](https://speakerdeck.com/leodido/falco-runtime-security-analysis-through-syscalls-f14e1a38-b460-410e-9eb8-73ab0262d654)

## Kubernetes上でのFalcoの設定
Falcoを実行する最も安全な方法は、Falcoをホストシステムに直接インストールして、危殆化した場合にFalcoがKubernetesから隔離されるようにすることです。そうすれば、Falcoのアラートは、Kubernetesで実行されている読み取り専用のエージェントを介して消費することができます。分離を気にしない場合は、FalcoをKubernetesで直接実行することもできます。
このチュートリアルではHelmを使用してFalcoを設定しますが、選択する方法の長所と短所を知っておく必要があります。

### ステップ
前提条件：このためには動作するKubernetesのセットアップが必要です。AWS/GCPから提供されているクラウドのKubernetesを使用するか、[minikube](https://minikube.sigs.k8s.io/docs/start/)を使用してローカルにKubernetesを設定してください。また、クライアントマシンにkubectlと[Helm](https://helm.sh/)をインストールする必要があります。

まずはFalcoのインストールから始めてみましょう。
1. Helmにfalcosecurity repoを追加します。

   ```
   $ helm repo add falcosecurity https://falcosecurity.github.io/charts
 
   $ helm repo update
   Hang tight while we grab the latest from your chart repositories...
   ...Successfully got an update from the "falcosecurity" chart repository
   ...Successfully got an update from the "stable" chart repository
   Update Complete. ⎈Happy Helming!⎈
   ```

2. チャートのインストール
   
   ```
   $ helm install falco falcosecurity/falco
   NAME: falco
   LAST DEPLOYED: Mon Nov 9 22:09:28 2020
   NAMESPACE: default
   STATUS: deployed
   REVISION: 1
   TEST SUITE: None
   NOTES:
   Falco agents are spinning up on each node in your cluster. After a few
   seconds, they are going to start monitoring your containers looking for
   security issues.
   No further action should be required.
   ```

3. 数秒後にはFalcoが起動しているはずなので、確認するために、すぐに作成したポッドを見ることができます。

   ```
   $ helm ls
   
   $ kubectl get pods
   ```

## 環境の設定
攻撃をエミュレートして検知する環境が必要です 設定してみましょう ここではHelmを使用します。

Helmのstableリポジトリを追加し、そこから `mysql-db` のチャートをインストールしてみましょう。

```
$ helm repo add stable https://charts.helm.sh/stable

$ helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "falcosecurity" chart repository
...Successfully got an update from the "stable" chart repository
Update Complete. ⎈Happy Helming!⎈
```

```
$ helm install mysql-db stable/mysql
NAME: mysql-db
LAST DEPLOYED: Mon Nov 9 22:11:07 2020
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
MySQL can be accessed via port 3306 on the following DNS name from within your cluster:
mysql-db.default.svc.cluster.local

…
```


それではFalcoのログを監視してみましょう：
```
$ kubectl get pods
NAME                      READY  STATUS   RESTARTS  AGE
falco-6rr9r               1/1    Running  0         49m
mysql-db-d5dc6b85d-77hrm  1/1    Running  0         47m
ubuntu                    1/1    Running  0         43m

$ kubectl logs -f falco-6rr9r # Replace with your Falco pod name here
```

## Falcoのログを分析する
攻撃者がKubernetesクラスターへのアクセスを得た後に行う最初のステップは、利用可能なネットワークホストを列挙することです。攻撃者は、一見新しい環境の中で自分たちの方法を見つけようとします。彼らはクラスターからより多くの洞察を得るために、安全/ノイズの少ないコマンドを使用しようとすることができます。
攻撃者が行う可能性のあるステップと、Falcoからの対応する検出シグナルを見てみましょう。私たちはFalcoに付属しているデフォルトのルールセットを使用しますが、これらのルールはあなたの環境のニーズに合わせて調整することができます。Falcoのデフォルトルールはここで見つけることができます: https://github.com/falcosecurity/falco/tree/master/rules

### コンテナ内のターミナルシェル
説明： ターミナルシェルがポッドでスポーンされていることを検出します。シナリオを再現するために、実行中のポッドでターミナルシェルを開きます。

```
$ kubectl exec -it mysql-db-d5dc6b85d-77hrm -- bash -il # Replace with the mysql pod name you have
```

**検出:**

```
18:08:40.584075795: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=default k8s.pod=mysql-db-d5dc6b85d-77hrm container=3fc8155f9d1a shell=bash parent=runc cmdline=bash -il terminal=34816 container_id=3fc8155f9d1a image=mysql) k8s.ns=default k8s.pod=mysql-db-d5dc6b85d-77hrm container=3fc8155f9d1a
```

### コンテナからKubernetes API Serverにコンタクトする
説明： Kubernetes環境で初期偵察を行うツールであるkube-reconを実行しています。このルールはコンテナからKubernetes API Serverにコンタクトしようとする試みを検知します。

```
$ kubectl run kuberecon --tty -i --image octarinesec/kube-recon
/ # ./kube-recon
2020/11/09 18:21:22 Testing K8S API permissions
2020/11/09 18:21:23 Your K8S API Server is configured properly
2020/11/09 18:21:23 Running Nmap on the discovered IPs
2020/11/09 18:21:23 Getting local ip address and subnet
2020/11/09 18:21:23 Trying to download EICAR file
2020/11/09 18:21:23 Downloaded EICAR successfully. No malware protection is in place
```

**検出:**
```
18:20:45.927730981: Notice A shell was spawned in a container with an attached terminal (user=root user_loginuid=-1 k8s.ns=<NA> k8s.pod=<NA> container=4f63870599d0 shell=sh parent=<NA> cmdline=sh terminal=34816 container_id=4f63870599d0 image=octarinesec/kube-recon) k8s.ns=<NA> k8s.pod=<NA> container=4f63870599d0
18:21:22.657590195: Warning Docker or kubernetes client executed in container (user=root user_loginuid=-1 k8s.ns=default k8s.pod=kuberecon container=4f63870599d0 parent=kube-recon cmdline=kubectl get pods image=octarinesec/kube-recon:latest) k8s.ns=default k8s.pod=kuberecon container=4f63870599d0
18:21:22.723707794: Notice Unexpected connection to K8s API Server from container (command=kubectl get pods k8s.ns=default k8s.pod=kuberecon container=4f63870599d0 image=octarinesec/kube-recon:latest connection=172.17.0.5:56972->10.96.0.1:443) k8s.ns=default k8s.pod=kuberecon container=4f63870599d0
```

### シェルがコンテナ環境かどうかの確認(スレッドネームスペースの変更)
説明: amicontained は、シェルがコンテナ化された環境であるかどうかをチェックするツールです。このルールはプログラムやスレッドのネームスペースを変更しようとする試みを検出します。

```
$ cd /tmp; curl -L -o amicontained https://github.com/genuinetools/amicontained/releases/download/v0.4.7/amicontained-linux-amd64; chmod 555 amicontained; ./amicontained

Output: 
Container Runtime: docker
Has Namespaces:
  pid: true
  user: false
AppArmor Profile: kernel
Capabilities:
  BOUNDING -> chown dac_override fowner fsetid kill setgid setuid setpcap net_bind_service net_raw sys_chroot mknod audit_write setfcap
Seccomp: disabled    
Blocked Syscalls (19):
  MSGRCV SYSLOG SETSID VHANGUP PIVOT_ROOT ACCT SETTIMEOFDAY UMOUNT2 SWAPON SWAPOFF REBOOT SETHOSTNAME SETDOMAINNAME INIT_MODULE DELETE_MODULE LOOKUP_DCOOKIE KEXEC_LOAD OPEN_BY_HANDLE_AT FINIT_MODULE
```

**検出:**
```
18:43:37.288344192: Notice Namespace change (setns) by unexpected program (user=root user_loginuid=-1 command=amicontained parent=bash k8s.ns=default k8s.pod=kuberecon container=c6112967b4f2 container_id=c6112967b4f2 image=octarinesec/kube-recon:latest) k8s.ns=default k8s.pod=kuberecon container=c6112967b4f2
Mon Nov 9 18:43:37 2020: Falco internal: syscall event drop. 9 system calls dropped in last second.
18:43:37.970973376: Critical Falco internal: syscall event drop. 9 system calls dropped in last secon
```

## まとめ
このチュートリアルでは、Kubernetesのセキュリティ監視の基本と、Falcoを使用してどのようにルールを使用してセキュリティ問題の検出を実現するかを見ました。Falcoのデフォルトの検知ルールセットで十分ですが、デフォルトのルールセットの上に構築する必要があるでしょう。
ご意見やご提案があれば、Twitter [@securetty_](https://twitter.com/securetty_)までお気軽にお寄せください。

この投稿は、2020年12月16日に [InfraCloudのブログ](https://www.infracloud.io/blogs/introduction-kubernetes-security-falco/) に最初に公開されました。
