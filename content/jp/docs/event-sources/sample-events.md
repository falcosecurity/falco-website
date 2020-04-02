---
title: サンプルイベントの生成
weight: 4
---

Falcoが正常に動作しているかどうかを確認したい場合は、syscallとk8sの監査関連ルール両方ののアクティビティを実行できるサンプルプログラムがあります。

## システムコールアクティビティ

現在のFalcoルールセットによって検出されるさまざまな疑わしいアクションを実行するテストプログラム[`event_generator`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/event_generator.cpp) を作成しました。

テストプログラムの使用ブロックは次のとおりです：

```shell
Usage event_generator [options]

Options:
     -h/--help: show this help
     -a/--action: actions to perform. Can be one of the following:
          write_binary_dir                           Write to files below /bin
          write_etc                                  Write to files below /etc
          read_sensitive_file                        Read a sensitive file
          read_sensitive_file_after_startup          As a trusted program, wait a while,
                                                     then read a sensitive file
          write_rpm_database                         Write to files below /var/lib/rpm
          spawn_shell                                Run a shell (bash)
          db_program_spawn_process                   As a database program, try to spawn
                                                     another program
          modify_binary_dirs                         Modify a file below /bin
          mkdir_binary_dirs                          Create a directory below /bin
          change_thread_namespace                    Change namespace
          system_user_interactive                    Change to a system user and try to
                                                     run an interactive command
          network_activity                           Open network connections
                                                     (used by system_procs_network_activity below)
          system_procs_network_activity              Open network connections as a program
                                                     that should not perform network actions
          non_sudo_setuid                            Setuid as a non-root user
          create_files_below_dev                     Create files below /dev
          exec_ls                                    execve() the program ls
                                                     (used by user_mgmt_binaries below)
          user_mgmt_binaries                         Become the program "vipw", which triggers
                                                     rules related to user management programs
          exfiltration                               Read /etc/shadow and send it via udp to a
                                                     specific address and port
          all                                        All of the above
       The action can also be specified via the environment variable EVENT_GENERATOR_ACTIONS
           as a colon-separated list
       if specified, -a/--action overrides any environment variables
     -i/--interval: Number of seconds between actions
     -o/--once: Perform actions once and exit
```

> **注意** — Docker内でプログラムを実行することを強くお勧めします。falco-event-generatorは、/bin、/etc、/devなどの下のファイルとディレクトリを変更するためです。

## K8s監査アクティビティ

シェルスクリプト[`k8s_event_generator.sh`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/k8_event_generator.sh)を作成し、k8s監査イベントルールセットに一致するアクティビティを生成するk8sオブジェクトファイルをサポートしました。

自己完結型を維持するために、すべてのオブジェクトは `falco-eg-sandbox` namespaceに作成されます。 namespaceは、イベントジェネレータを実行する前に作成する必要があります。これは、クラスターロール/クラスターロールバインディングに関連する一部のアクティビティが実行されないことを意味します。

スクリプトに特定のルール名を指定できます。指定した場合、そのルールに関連するオブジェクトのみがトリガーされます。 デフォルトは"all"です。つまり、すべてのオブジェクトが作成されます。

スクリプトは永久にループし、反復のたびに falco-eg-sandbox` namespaceのリソースを削除します。

## Dockerイメージ

上記のプログラムは、[Docker Hub](https://hub.docker.com)の[Dockerイメージ](https://hub.docker.com/r/falcosecurity/falco-event-generator/)としても入手できます。イメージを実行するには：

```bash
docker pull falcosecurity/falco-event-generator
docker run -it --rm falcosecurity/falco-event-generator event_generator [syscall|k8s_audit (<rule name>|all)|bash]
```

* syscall: システムコールルールのアクティビティを生成する
* k8s_audit: k8s監査ルールのアクティビティを生成する
* bash: シェルを生成する

デフォルトは、レガシーなビヘイビアを維持するための"syscall" です。

イメージにはkubectlバイナリが含まれていますが、ほとんどの場合、クラスターへのアクセスを許可するkube configファイル/ディレクトリを提供する必要があります。 次のようなコマンドが機能します：

```
docker run -v $HOME/.kube:/root/.kube -it falcosecurity/falco-event-generator k8s_audit
```

## K8sでのイベントジェネレーターの実行

また、K8sクラスターでのイベントジェネレーターの実行を容易にするK8sリソースオブジェクトファイルも提供しています：

* [`event-generator-syscall-daemonset.yaml`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/event-generator-syscall-daemonset.yaml)はK8sを作成します `syscall`引数でイベントジェネレータを実行するDaemonSet。マスター以外のすべてのノードで実行されます。
* [`event-generator-role-rolebinding-serviceaccount.yaml`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/event-generator-role-rolebinding-serviceaccount.yaml)は、サービスアカウント、クラスターロール、およびサービスアカウント `falco-event-generator`がnamespace`falco-eg-sandbox`にオブジェクトを作成できるようにするロールを作成します。
* [`event-generator-k8saudit-deployment.yaml`](https://github.com/falcosecurity/falco/blob/master/docker/event-generator/event-generator-syscall-daemonset.yaml)引数`k8s_audit`でイベントジェネレーターを実行する `falco-event-generator`namespaceで実行されるデプロイメントを作成します。

次のコマンドを実行して、必要なnamespacesとオブジェクトを作成できます：

```
kubectl create namespace falco-event-generator && \
  kubectl create namespace falco-eg-sandbox && \
  kubectl apply -f event-generator-role-rolebinding-serviceaccount.yaml && \
  kubectl apply -f event-generator-k8saudit-deployment.yaml && \
  kubectl apply -f event-generator-syscall-daemonset.yaml
```

