---
title: Discover how GitLab uses Falco to detect abnormal behaviour in code dependencies
linktitle: "Package Hunter: Detect software supply chain attacks using Falco"
description: GitLab leverages Falco to detect software supply chain attacks with Package Hunter
date: 2021-12-09
author: Nate Magee, Vicente J. Jiménez Miras
slug: gitlab-falco-package-hunter
---

[GitLab](https://about.gitlab.com/) covers the entire software development lifecycle in a single application: From managing, coding, deploying and securing, without forgetting collaboration. However, achieving velocity with confidence, security without sacrifice, and visibility in such a dynamic environment is not always an easy task.

It is [GitLab's mission](https://about.gitlab.com/company/mission/) to make it so that **everyone can contribute**. One key aspect to achieve this was to protect the integrity of its own software supply chain. To secure the GitLab DevOps platform, [Dennis Appelt](https://www.linkedin.com/in/dennis-appelt-74ba10115), Staff Security Engineer at GitLab, came up with an incredibly elegant and straight-forward solution based on the open source project Falco: [GitLab's Package Hunter](https://about.gitlab.com/blog/2021/07/23/announcing-package-hunter/).

Before making it open source, GitLab had been testing Package Hunter internally since November 2020. They chose Falco, for its performance as well as for its reliability and reputation in the runtime security field.


### How Package Hunter works

In the DevOps world, software is mainly developed by using third party components. It is practically impossible to manually test and verify every single line of external code, and automated code scanning tools can only look for known malicious patterns.

![Software Dependencies Supply Chain](/img/package-hunter/supply-chain.png)

Here it is when GitLab came with the idea of performing dependency analysis by inspecting the behaviour of the code at runtime in a controlled isolated environment, to see if there was any odd activity.

Adding this step to a continuous integration (CI) pipeline can give the confidence that the building blocks of the software will remain uncorrupted with every new artifact build.

![Falco Rules used to feed the Inline Scanner](/img/package-hunter/falco-inline-dependency-scanning.png)

### What role plays Falco in Package Hunter

There are plenty of tools to search for known vulnerabilities that could be used to analyse code and binary objects. Unfortunately, new vulnerabilities come up every day or they could have been hidden for years. Falco approaches the issue from a different angle by inspecting what your code actually does in runtime, where processes and libraries interact with the operating system.

Now, for Falco to report on unfamiliar behaviour, the code needs to run along with Falco. Package Hunter is in charge of creating a dedicated containerised environment to test the dependencies and lets Falco do its magic in the background. Package Hunter uses Falco results to report back to the user, who can react accordingly.

![Package Hunter interacts with Falco through gRPC](/img/package-hunter/package-hunter-falco-grpc.png)

By using [Falco rules](https://falco.org/docs/rules/), plus some customised [ones](https://gitlab.com/gitlab-org/security-products/package-hunter/-/blob/8b84f9daacc4afbad0f780605ae3b7b9ce946c51/falco/falco_rules.local.yaml) to fulfil GitLab's requirements, and a collection of malicious indicators that engineers saw in the wild, it can quickly see potentially harmful activity, such as unexpected outbound network connections, undesired writing attempts, and many others.

Package Hunter also enables GitLab to simulate attacks, similar to what it sees in the wild by using some of the most high-profile events. The simulations enable the company to quickly identify issues before they become real problems, giving GitLab engineers the highest degree of confidence about the code they are running.


### First steps with Package Hunter

Let's take a look at how this process works, by deploying Package Hunter and performing a quick test.

At the moment, Package Hunter requires a dedicated server where the application offers an API to send the dependencies under test to.

We can [deploy](https://gitlab.com/gitlab-org/security-products/package-hunter/-/blob/main/README.md) Package Hunter either to a dedicated server or, even better, a disposable Vagrant environment set up following these steps::

```
$ git clone https://gitlab.com/gitlab-org/security-products/package-hunter.git
$ cd package-hunter
$ vagrant up
```

The Vagrantfile provided within the repository contains instructions to provision the Package Hunter server until a first stage. However, to start the application we need to execute one or two more commands inside the virtual machine.

Pay attention, we will execute `npm ci` from the `/vagrant` folder inside the virtual machine, that is mapped to the `package-hunter` git repository in our host machine.

```
$ vagrant ssh
$ cd /vagrant
$ npm ci
```

The `npm ci` command will set up our Package Hunter server with the latest version of packages and dependencies.

To actually start the application execute:

```
$ NODE_ENV=development DEBUG=pkgs* node src/server.js
```

Package Hunter is now running.

Since we haven't created any kind of external access to the machine and to keep our workstation clean, we will do our first test from inside the Vagrant machine itself.

For that, we will use the contents of the directory `falco-test` from the repository, which are conveniently mounted under `/vagrant`.

_Warning, we want to start a second session in the virtual machine, so don't interrupt the server running in the previous one._

```
$ vagrant ssh
$ tar -C /vagrant/falco-test -czf /home/vagrant/falco-test.tgz .
$ curl -v -H 'Content-Type: application/octet-stream' --data-binary @falco-test.tgz http://localhost:3000/monitor/project/npm
   Trying ::1…
 TCP_NODELAY set
 Connected to localhost (::1) port 3000 (#0)
> POST /monitor/project/npm HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.58.0
> Accept: /
> Content-Type: application/octet-stream
> Content-Length: 2868
> Expect: 100-continue
> 
< HTTP/1.1 100 Continue
 We are completely uploaded and fine
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Content-Type: application/json; charset=utf-8
< Content-Length: 59
< ETag: W/"3b-i8XJXwHQknoVSzLQsCo9FYtlE6Y"
< Date: Fri, 19 Nov 2021 16:35:15 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
< 
* Connection #0 to host localhost left intact
{"status":"ok","id":"633414e2-24f2-412a-811f-c37131ff2c61"}
```

Package Hunter has acknowledged our request, confirmed that the `falco-test.tgz` file has been received and it will start to asynchronously scan in the background.

Using the `id` returned from the `curl` connection, we can poll the server as often as we want. \
Once the status field becomes `finished` we can retrieve the results of the scan:

```
$ curl http://localhost:3000/?id=633414e2-24f2-412a-811f-c37131ff2c61 | json_pp
{
   "id" : "633414e2-24f2-412a-811f-c37131ff2c61",
   "status" : "finished",
   "result" : [
      …
      {
         "output" : "16:35:16.457772674: Notice Disallowed outbound
connection destination (command=wget -qO-
https://gitlab.com/snippets/1890615/raw connection=172.17.0.2:54865->172.65.251.78:
         "time" : {
            "seconds" : "1637339716",
            "nanos" : 457772674
         },
         "source" : "SYSCALL",
         "hostname" : "vagrant",
         "output_fields" : {
            "container.id" : "c62400ffae4a",
            "user.name" : "root",
            "proc.cmdline" : "wget -qO- https://gitlab.com/snippets/1890615/raw",
            "fd.name" : "172.17.0.2:54865->172.65.251.78:0",
            "container.image.repository" : "maldep",
            "container.name" : "some-container-633414e2-24f2-412a-811f-c37131ff2c61.tgz",
            "evt.time" : "16:35:16.457772674"
         },
         "priority" : "NOTICE",
         "rule" : "Unexpected outbound connection destination"
      },
      {
         "hostname" : "vagrant",
         "priority" : "NOTICE",
         "rule" : "Unexpected outbound connection destination",
         "output_fields" : {
            "evt.time" : "16:35:16.490784795",
            "container.image.repository" : "maldep",
            "proc.cmdline" : "wget -qO-
https://gitlab.com/snippets/1890615/raw",
            "container.name" :
"Some-container-633414e2-24f2-412a-811f-c37131ff2c61.tgz",
            "fd.name" : "172.17.0.2:48644->172.65.251.78:443",
            "container.id" : "c62400ffae4a",
            "user.name" : "root"
         },
         "output" : "16:35:16.490784795: Notice Disallowed outbound
connection destination (command=wget -qO- https://gitlab.com/snippets/1890615/raw
connection=172.17.0.2:48644->172.65.251.78:
         "source" : "SYSCALL",
         "time" : {
            "seconds" : "1637339716",
            "nanos" : 490784795
         }
      },
      …
   ]
}
```


As you saw, the output from the previous command recalls the logs generated by Falco. These are retrieved from the Falco service by the Package Hunter application using the [Falco gRPC API](https://falco.org/docs/grpc/).
As an example, from this snippet we can obtain interesting information like: 
- Which rule was triggered: `Unexpected outbound connection destination` 
- What command generated it: `wget ...` 
- To which host it tries to connect: `172.65.251.78:443` 
and many other different items, always depending on the triggered rule.

The Falco rules that were triggered during our test are completely customisable. Every time new rules are added to Falco, they also extend the range of issues recognised by Package Hunter.


### Using Falco to secure all the development cycle

Package Hunter is one open source project that uses Falco, but it is not the only project in GitLab that uses it. 

GitLab also incorporated Falco into some of the core product capabilities of the GitLab Ultimate tier, the most comprehensive level of service offered by GitLab.

For instance, GitLab's Security Orchestration capabilities incorporate Falco. Led by [Sam White](https://www.linkedin.com/in/samuelowhite/), Senior Product Manager – Protect Stage, the solution provides a unified security policy editor and an alert dashboard to manage security scanning and monitoring from development all the way through deployment and production. Security Orchestration offers users the ability to write policies to improve security posture, enforce policies, and generate alerts when potentially malicious activity occurs.

The strategy behind the alerts is very simple: Monitor activity to watch for signs of unusual behavior. If there is something bad, block it; and push to manual review those events that you're not confident about. The key is to have the right rules in place, so GitLab isn't overloading manual reviewers and getting in the way of the business.

GitLab is also doing some heavy lifting with runtime protection in production. Though security and development teams use the same platform, Security Orchestration enables duties to be separated. Security teams can require scans, and developers have visibility into those scans directly —without modifying or disabling them— thus supporting better compliance. Falco enables users to manage their own rules within GitLab and enforce them within the production cluster.


### Conclusion

Falco runs throughout the security DNA at GitLab – but why? Sam White explained it with two words: "Cloud Native". It's the predominant reason for the choice, and when paired with Kubernetes blocking and enforcement capabilities, users can monitor system logs, new network connetions and file integrity, do application allow listing, and manage those rules easily. Plus, users have a clear history of who changed what policies and can even implement a two-step approval process for all changes.

To learn more about Package Hunter: 
* Meet [Package Hunter](https://about.gitlab.com/blog/2021/07/23/announcing-package-hunter/) 
* Check out the [Package Hunter project in GitLab](https://gitlab.com/gitlab-org/security-products/package-hunter)
* Take the first steps with [Package Hunter](https://gitlab.com/gitlab-org/security-products/package-hunter/-/blob/main/README.md#installation)
* Visit [https://about.gitlab.com](https://about.gitlab.com/)

If you would like to find out more about Falco:

* Get started in [Falco.org](http://falco.org/)
* Check out the [Falco project in GitHub](https://github.com/falcosecurity/falco).
* Get involved with the [Falco community](https://falco.org/community/)
* Meet the maintainers on the [Falco Slack](https://kubernetes.slack.com/?redir=%252Farchives%252FCMWH3EH32)
* Follow [@falco_org on Twitter](https://twitter.com/falco_org)
