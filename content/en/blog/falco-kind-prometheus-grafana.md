---
title: Falco on Kind with Prometheus and Grafana
date: 2020-03-19
author: Leonardo Grasso
slug: falco-kind-prometheus-grafana
---

Kind is a tool for running local Kubernetes clusters using Docker container "nodes", that may be used for local development or CI. It also offers a convenient and easy way to install Falco in a Kubernetes cluster and play with it locally. We will use Kind to show how to export Falco metrics to Prometheus and Grafana.

## Create a Kind cluster
Running Falco in a Kind cluster is easy, as explained in the [documentation](https://falco.org/docs/getting-started/running/#running-falco-in-a-kind-cluster). 

If you want to use the kernel module, basically, you only have to mount `/dev`.

Note that it's not mandatory to mount the entire `/dev` path. Falco just needs access to some devices created by the kernel module:

```
$ ls -l /dev/falco*
cr-------- 1 root root 238, 0 Mar 12 16:04 /dev/falco0
cr-------- 1 root root 238, 1 Mar 12 16:04 /dev/falco1
cr-------- 1 root root 238, 2 Mar 12 16:04 /dev/falco2
cr-------- 1 root root 238, 3 Mar 12 16:04 /dev/falco3
cr-------- 1 root root 238, 4 Mar 12 16:04 /dev/falco4
cr-------- 1 root root 238, 5 Mar 12 16:04 /dev/falco5
cr-------- 1 root root 238, 6 Mar 12 16:04 /dev/falco6
cr-------- 1 root root 238, 7 Mar 12 16:04 /dev/falco7
```
As you can see, the kernel module is creating one device per CPU (8 in my case). These paths are all Falco needs.

## Certificates
To export metrics to Prometheus, we will use [falco-expoter](https://github.com/falcosecurity/falco-exporter) which connects to the [Falco gRPC output](https://falco.org/docs/grpc/). The Falco gRPC server works only with mutual TLS by design. Therefore, you also need valid certificate files to configure Falco and falco-exporter properly.

You can quickly generate cert materials using [falcoctl](https://github.com/falcosecurity/falcoctl): 
```
FALCOCTL_NAME=falco-grpc.default.svc.cluster.local FALCOCTL_PATH=/tmp/certs falcoctl install tls 
```
Otherwise you can manually generate them as explained [here](https://falco.org/docs/grpc/grpc-config/#certificates).

Note that in both cases, you have to make sure to set the correct CommonName. In this example, we are using the default hostname used by the Helm chart.

## Install Falco
The official [Falco Helm Chart](https://github.com/falcosecurity/charts/tree/master/charts/falco) is a straightforward way to deploy Falco. The chart adds Falco to all nodes in your cluster using a DaemonSet.

Enable the Falco charts repository:

```
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
```

Be sure to include TLS cert material and enable the gRPC output:
```
helm install falco falcosecurity/falco \
    --set-file certs.server.key=/tmp/certs/server.key,certs.server.crt=/tmp/certs/server.crt,certs.ca.crt=/tmp/certs/ca.crt \
    --set falco.grpc.enabled=true,falco.grpcOutput.enabled=true
```

## Install falco-exporter
[falco-exporter](https://github.com/falcosecurity/falco-exporter) is the Prometheus metrics exporter for Falco output events. Again here, using [the provided Helm chart](https://github.com/falcosecurity/charts/tree/master/charts/falco-exporter) is the easiest way to deploy it.

So you only have to run the helm install command:

```
helm install falco-exporter \ 
    --set-file certs.ca.crt=/tmp/certs/ca.crt,certs.client.key=/tmp/certs/client.key,certs.client.crt=/tmp/certs/client.crt \
    falcosecurity/falco-exporter 
```

## Install Prometheus

Once Falco and the exporter are up and running, we can proceed by installing Prometheus:
```
helm install prom stable/prometheus
```

Then we have to wait for Prometheus to set up and run:
```
export POD_NAME=$(kubectl get pods --namespace default -l "app=prometheus,component=server" -o jsonpath="{.items[0].metadata.name}")
kubectl --namespace default port-forward $POD_NAME 9090
```
So we can open [http://localhost:9090/targets](http://localhost:9090/targets) and check that falco-exporter has been discovered by Prometheus.


## Install Grafana and the Falco dashboard

To deploy Grafana, just run:
```
helm install grafana stable/grafana
```
Then get your 'admin' user password by running:
```
kubectl get secret --namespace default grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```
When Grafana is up and running, port forward the Grafana service:
```
kubectl port-forward service/grafana 3000:80
```
To log in to Grafana, open [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login) and use the 'admin' user password you got above.

Now you can add the Prometheus endpoint (`http://prom-prometheus-server.default.svc.cluster.local`) to the Grafana data sources and finally go to [http://127.0.0.1:3000/dashboard/import](http://127.0.0.1:3000/dashboard/import) and import the Falco dashboard  by copy-paste the following dashboard URL:
```
https://grafana.com/grafana/dashboards/11914
```
Otherwise, you can use the provided [dashboard.json](https://github.com/falcosecurity/falco-exporter/blob/master/grafana/dashboard.json).

![Falco dashboard](https://github.com/falcosecurity/falco-exporter/raw/master/grafana/preview.png)

Now we can generate events to see the system in action!

## Generate events 

There are many ways to demonstrate a Falco rule has been violated, and if you have loaded the default Falco ruleset here are some fun things to try.

A simple one line example is to create an alert is to `touch` a file in a well known executable directory. Also, you can `cat` or `touch` files in other potentially vulnerable directories as well.

### Common one-liners

```bash
touch /usr/local/bin/example-violation
touch /usr/bin/example-violation
cat /etc/shadow
touch /etc/example-violation
```

You can find the default ruleset [here](https://github.com/falcosecurity/rules/blob/master/rules/falco_rules.yaml). 

## Fun with privileged mode 

You can see the demo that [Kris Nóva gave at FOSDEM](https://www.youtube.com/watch?v=VrtkKgfJ3RI) and find the function `shell()` that she used defined below.


```bash
function shell () {
  kubectl run shell --restart=Never -it --image krisnova/hack:latest \
  --rm --attach \
  --overrides \
        '{
          "spec":{
            "hostPID": true,
            "containers":[{
              "name":"scary",
              "image": "krisnova/hack:latest",
	      "imagePullPolicy": "Always",
              "stdin": true,
              "tty": true,
              "command":["/bin/bash"],
	      "nodeSelector":{
		"dedicated":"master" 
	      },
              "securityContext":{
                "privileged":true
              }
            }]
          }
        }'
}
```

You can paste this into a new file `shell.sh` and source the file.

```bash
source shell.sh
```

Then you can type the following to demonstrate a privilege escalation in Kubernetes.

```
[user@user]$ shell
If you don't see a command prompt, try pressing enter.
root@shell:/# nsenter -t 1 -m -u -i -n bash
root@ip-1-2-3-4:/# 
```

Doing this takes advantage of a well known security exploit in Kubernetes, and you can find the Falco alerts rendered in Prometheus/Grafana. 


## Falco events generator 

You can find more information on generating sample events in [the official documentation](https://falco.org/docs/event-sources/sample-events/)

For a quick example, you can run the following command to begin generating events

```bash
docker run -it --rm falcosecurity/event-generator run syscall --loop
```
