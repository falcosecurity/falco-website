---
title: Learning Environments
description: Learn how to use Falco in a learning environment
weight: 90
---

## minikube

The easiest way to use Falco on Kubernetes in a local environment is on [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/).

When running `minikube` with one of the following drivers `virtualbox, qemu, kvm2`, it creates a VM that runs the various Kubernetes services and a container framework to run Pods, etc. Generally, it's not possible to build the Falco kernel module directly on the `minikube` VM, as the VM doesn't include the kernel headers for the running kernel.

To address this, starting with Falco 0.33.0 prebuilt `kernel modules` and `bpf probes` for the last 3 `minikube` major versions, including minor versions, are available at https://download.falco.org/?prefix=driver/. This allows the download fallback step to succeed with a loadable driver. New versions of `minikube` are automatically discovered by the [kernel-crawler](https://github.com/falcosecurity/kernel-crawler) and periodically built by [test-infra](https://github.com/falcosecurity/test-infra). The supported versions can be found at https://falcosecurity.github.io/kernel-crawler/?target=Minikube&arch=x86_64. Falco currently retains previously-built kernel modules for download and continues to provide limited historical support as well.

You can follow the official [Get Started!](https://minikube.sigs.k8s.io/docs/start/) guide to install.

<a class="btn btn-primary" href="https://minikube.sigs.k8s.io/docs/start/" role="button" aria-label="View minikube Get Started! Guide">View minikube Get Started! Guide</a>

**Note**: Ensure that you have [installed kubectl](/docs/getting-started/third-party/install-tools/#kubectl).

### Falco with syscall source only

In order to install Falco with the `kernel module` or the `bpf probe`:

1. Create the cluster with Minikube using a VM driver, in this case, Virtualbox:

    ```shell
    minikube start --driver=virtualbox
    ```

2. Check that all pods are running:

    ```shell
    kubectl get pods --all-namespaces
    ```

3. Add the Falco Helm repository and update the local Helm repository cache:

   ```shell
    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update
    ```

4. Install Falco using Helm:

    ```shell
    helm install falco \
         --set driver.kind=modern_ebpf \
         --set tty=true \
         falcosecurity/falco
    ```

    The output is similar to:

    ```bash
    NAME: falco
    LAST DEPLOYED: Wed Apr 17 08:19:53 2024
    NAMESPACE: default
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    NOTES:
    Falco agents are spinning up on each node in your cluster. After a few
    seconds, they are going to start monitoring your containers looking for
    security issues.

    No further action should be required.

    Tip:
    You can easily forward Falco events to Slack, Kafka, AWS Lambda and more with falcosidekick.
    Full list of outputs: https://github.com/falcosecurity/charts/tree/master/charts/falcosidekick.
    You can enable its deployment with `--set falcosidekick.enabled=true` or in your values.yaml.
    See: https://github.com/falcosecurity/charts/blob/master/charts/falcosidekick/values.yaml for configuration values.
    ```

5. Check the logs to ensure that Falco is running:

    ```shell
    kubectl logs -l app.kubernetes.io/name=falco --all-containers
    ```

    The output is similar to:

    ```bash
    {"level":"INFO","msg":"Resolving dependencies ...","timestamp":"2024-04-17 06:19:49"}
    {"level":"INFO","msg":"Installing artifacts","refs":["ghcr.io/falcosecurity/rules/falco-rules:3"],"timestamp":"2024-04-17 06:19:51"}
    {"level":"INFO","msg":"Preparing to pull artifact","ref":"ghcr.io/falcosecurity/rules/falco-rules:3","timestamp":"2024-04-17 06:19:51"}
    {"level":"INFO","msg":"Pulling layer 1e72f9c4d8fe","timestamp":"2024-04-17 06:19:52"}
    {"level":"INFO","msg":"Pulling layer 2e91799fee49","timestamp":"2024-04-17 06:19:52"}
    {"level":"INFO","msg":"Pulling layer d4c03e000273","timestamp":"2024-04-17 06:19:52"}
    {"digest":"ghcr.io/falcosecurity/rules/falco-rules@sha256:d4c03e000273a0168ee3d9b3dfb2174e667b93c9bfedf399b298ed70f37d623b","level":"INFO","msg":"Verifying signature for artifact","timestamp":"2024-04-17 06:19:52"}
    {"level":"INFO","msg":"Signature successfully verified!","timestamp":"2024-04-17 06:19:53"}
    {"file":"falco_rules.yaml.tar.gz","level":"INFO","msg":"Extracting and installing artifact","timestamp":"2024-04-17 06:19:53","type":"rulesfile"}
    {"digest":"sha256:d4c03e000273a0168ee3d9b3dfb2174e667b93c9bfedf399b298ed70f37d623b","directory":"/rulesfiles","level":"INFO","msg":"Artifact successfully installed","name":"ghcr.io/falcosecurity/rules/falco-rules:3","timestamp":"2024-04-17 06:19:53","type":"rulesfile"}
    Wed Apr 17 06:19:54 2024: Falco initialized with configuration file: /etc/falco/falco.yaml
    Wed Apr 17 06:19:54 2024: System info: Linux version 5.10.57 (jenkins@ubuntu-iso) (x86_64-minikube-linux-gnu-gcc.br_real (Buildroot 2021.02.12-1-gb75713b-dirty) 9.4.0, GNU ld (GNU Binutils) 2.35.2) #1 SMP Tue Nov 7 06:51:54 UTC 2023
    Wed Apr 17 06:19:54 2024: Loading rules from file /etc/falco/falco_rules.yaml
    Wed Apr 17 06:19:54 2024: Hostname value has been overridden via environment variable to: minikube
    Wed Apr 17 06:19:54 2024: The chosen syscall buffer dimension is: 8388608 bytes (8 MBs)
    Wed Apr 17 06:19:54 2024: Starting health webserver with threadiness 4, listening on 0.0.0.0:8765
    Wed Apr 17 06:19:54 2024: Loaded event sources: syscall
    Wed Apr 17 06:19:54 2024: Enabled event sources: syscall
    Wed Apr 17 06:19:54 2024: Opening 'syscall' source with modern BPF probe.
    Wed Apr 17 06:19:54 2024: One ring buffer every '2' CPUs.
    ```

### Falco with multiple sources

Here we run Falco in a `minikube` cluster with multiple sources: `syscall` and `k8s_audit`. The next steps show how to start a `minikube` cluster with the [audit logs](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/) enabled and deploy Falco with the `kernel module` and the `k8saudit plugin`:

1. First, we need to create a new folder under the configuration folder of `minikube`:

    ```bash
    mkdir -p ~/.minikube/files/etc/ssl/certs
    ```

    We are assuming that the `minikube` configuration folder lives in your home folder; otherwise, adjust the command according to your environment.

2. Let's create the needed configuration files to enable the `audit logs`. We are going to create a new file under `~/.minikube/files/etc/ssl/certs` named `audit-policy.yaml` and copy the required config into it. Copy the following snippet into your terminal shell:

    ```yaml
    cat << EOF > ~/.minikube/files/etc/ssl/certs/audit-policy.yaml
    apiVersion: audit.k8s.io/v1 # This is required.
    kind: Policy
    # Don't generate audit events for all requests in RequestReceived stage.
    omitStages:
      - "RequestReceived"
    rules:
      # Log pod changes at RequestResponse level
      - level: RequestResponse
        resources:
        - group: ""
          # Resource "pods" doesn't match requests to any subresource of pods,
          # which is consistent with the RBAC policy.
          resources: ["pods", "deployments"]

      - level: RequestResponse
        resources:
        - group: "rbac.authorization.k8s.io"
          # Resource "pods" doesn't match requests to any subresource of pods,
          # which is consistent with the RBAC policy.
          resources: ["clusterroles", "clusterrolebindings"]

      # Log "pods/log", "pods/status" at Metadata level
      - level: Metadata
        resources:
        - group: ""
          resources: ["pods/log", "pods/status"]

      # Don't log requests to a configmap called "controller-leader"
      - level: None
        resources:
        - group: ""
          resources: ["configmaps"]
          resourceNames: ["controller-leader"]

      # Don't log watch requests by the "system:kube-proxy" on endpoints or services
      - level: None
        users: ["system:kube-proxy"]
        verbs: ["watch"]
        resources:
        - group: "" # core API group
          resources: ["endpoints", "services"]

      # Don't log authenticated requests to certain non-resource URL paths.
      - level: None
        userGroups: ["system:authenticated"]
        nonResourceURLs:
        - "/api*" # Wildcard matching.
        - "/version"

      # Log the request body of configmap changes in kube-system.
      - level: Request
        resources:
        - group: "" # core API group
          resources: ["configmaps"]
        # This rule only applies to resources in the "kube-system" namespace.
        # The empty string "" can be used to select non-namespaced resources.
        namespaces: ["kube-system"]

      # Log configmap changes in all other namespaces at the RequestResponse level.
      - level: RequestResponse
        resources:
        - group: "" # core API group
          resources: ["configmaps"]

      # Log secret changes in all other namespaces at the Metadata level.
      - level: Metadata
        resources:
        - group: "" # core API group
          resources: ["secrets"]

      # Log all other resources in core and extensions at the Request level.
      - level: Request
        resources:
        - group: "" # core API group
        - group: "extensions" # Version of group should NOT be included.

      # A catch-all rule to log all other requests at the Metadata level.
      - level: Metadata
        # Long-running requests like watches that fall under this rule will not
        # generate an audit event in RequestReceived.
        omitStages:
          - "RequestReceived"
      EOF
    ```

    Create the file `webhook-config.yaml` and save the required configuration needed by the `k8s api-server` to send the audit logs to Falco:

    ```yaml
    cat << EOF > ~/.minikube/files/etc/ssl/certs/webhook-config.yaml
    apiVersion: v1
    kind: Config
    clusters:
    - name: falco
      cluster:
        # certificate-authority: /path/to/ca.crt # for https
        server: http://localhost:30007/k8s-audit
    contexts:
    - context:
        cluster: falco
        user: ""
      name: default-context
    current-context: default-context
    preferences: {}
    users: []
    EOF
    ```

3. Once the configuration files are in place we are ready to start the `minikube` cluster:

    ```bash
    minikube start \
        --extra-config=apiserver.audit-policy-file=/etc/ssl/certs/audit-policy.yaml \
        --extra-config=apiserver.audit-log-path=- \
        --extra-config=apiserver.audit-webhook-config-file=/etc/ssl/certs/webhook-config.yaml \
        --extra-config=apiserver.audit-webhook-batch-max-size=10 \
        --extra-config=apiserver.audit-webhook-batch-max-wait=5s \
        --cpus=4 \
        --driver=virtualbox
    ```

    {{% pageinfo color="warning" %}}
     We need at least 4 CPUs for the VM to deploy Falco with multiple sources!
    {{% /pageinfo %}}

4. Add the Falco Helm repository and update the local Helm repository cache:

    ```shell
    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update
    ```

5. Install Falco using the pre-set values file:

    ```bash
    helm install falco \
        --set driver.kind=modern_ebpf \
        --set tty=true \
        --values=https://raw.githubusercontent.com/falcosecurity/charts/master/charts/falco/values-syscall-k8saudit.yaml \
        falcosecurity/falco
    ```

6. Check that the Falco pod is up and running:

   ```bash
   kubectl get pods -l app.kubernetes.io/name=falco
   ```

7. Execute the following command and keep the terminal open:

   ```bash
   kubectl logs -l app.kubernetes.io/name=falco -f
   ```

   The command will follow the log stream of the Falco pod by printing the logs as soon as Falco emits them. And make sure that the following lines are present:

   ```bash
   Mon Oct 24 15:24:06 2022: Opening capture with plugin 'k8saudit'
   Mon Oct 24 15:24:06 2022: Opening 'syscall' source with modern BPF probe
   ```

   It means that Falco is running with the configured sources.

8. Trigger some rules to check that Falco works as expected. Open a new terminal and make sure that your `kubeconfig` 
points to the minikube cluster. Then run:

    1. Trigger a `k8saudit` rule:

        ```bash
        kubectl create cm  myconfigmap --from-literal=username=admin --from-literal=password=123456
        ```

        In the terminal that we opened in step 8 we should see a log line like this:

        ```bash
        15:30:07.927586000: Warning K8s configmap with private credential (user=minikube-user verb=create resource=configmaps configmap=myconfigmap config={"password":"123456","username":"admin"})
        ```

    2. Trigger a Falco rule:

        ```bash
        kubectl exec $(kubectl get pods -l app.kubernetes.io/name=falco -o name) -- touch /bin/test-bin
        ```

        Check that a log similar to this one has been printed:

        ```bash
        15:32:04.318689836: Error File below a known binary directory opened for writing (user=<NA> user_loginuid=-1 command=touch /bin/test-bin pid=20954 file=/bin/test-bin parent=<NA> pcmdline=<NA> gparent=<NA> container_id=38e44b926166 image=falcosecurity/falco-no-driver) k8s.ns=default k8s.pod=falco-bggd7 container=38e44b926166
        ```

## kind

[`kind`](https://kind.sigs.k8s.io/docs/) lets you run Kubernetes on your local computer. This tool requires that you have [Docker](https://docs.docker.com/get-docker/) installed and configured. Currently not working directly on Mac with Linuxkit, but these directions work on Linux guest OS running `kind`.

The kind [Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/) page shows you what you need to do to get up and running with kind.

<a class="btn btn-primary" href="https://kind.sigs.k8s.io/docs/user/quick-start/" role="button" aria-label="View kind Quick Start Guide">View kind Quick Start Guide</a>

To run Falco on a `kind` cluster is as follows:

1. Create a configuration file. For example: `kind-config.yaml`

2. Add the following to the file:

    ```yaml
    kind: Cluster
    apiVersion: kind.x-k8s.io/v1alpha4
    nodes:
    - role: control-plane
      extraMounts:
        # allow Falco to use devices provided by the kernel module
      - hostPath: /dev
        containerPath: /dev
        # allow Falco to use the Docker unix socket
      - hostPath: /var/run/docker.sock
        containerPath: /var/run/docker.sock
    ```

3. Create the cluster by specifying the configuration file:

    ```shell
    kind create cluster --config=./kind-config.yaml
    ```

4. [Deploy Falco with Helm](/docs/getting-started/falco-kubernetes-quickstart/#deploy-falco).

## MicroK8s

MicroK8s is the smallest, fastest multi-node Kubernetes. Single-package fully conformant lightweight Kubernetes that works on Linux, Windows, and Mac. Perfect for: Developer workstations, IoT, Edge, CI/CD.

You can follow the official [Getting Started](https://microk8s.io/docs) guide to install.

<a class="btn btn-primary" href="

https://microk8s.io/docs" role="button" aria-label="View MicroK8s Getting Started Guide">View MicroK8s Getting Started Guide</a>

Once the MicroK8s cluster is up and running, you can [deploy Falco with Helm](/docs/getting-started/falco-kubernetes-quickstart/#deploy-falco).