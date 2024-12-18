---
title: How to distribute a plugin
linktitle: How to distribute a plugin
description: How to distribute a plugin
weight: 20
---

## Introduction

In this article, we'll focus on the steps to build the OCI artifacts containing the plugin and its rules and how to distribute them on Github Packages.

{{% pageinfo color="info" %}}
To get more familiar with the OCI artifacts, you can read our blog posts about [falcoctl](/blog/falcoctl-install-manage-rules-plugins) and [GitOps for rules](/blog/gitops-your-falco-rules)
{{% /pageinfo %}}

In the next sections we'll describe how to:
* set up a Github Actions workflow to:
  * create a release with `GoReleaser` when a tag is pushed
  * build the OCI artifacts of the plugin and its rules
* create the `index.yaml` used by `falcoctl`

## Requirements

This tutorial is based on a Github repo, with the possibility to run workflows in Github Actions and store OCI artifacts in Github Packages. If you use a different system or even just private repositories, you'll need to adapt the examples to your context.

{{% pageinfo color="warning" %}}
To make it work, you must have the code organization proposed in [how to develop a plugin](/docs/plugins/developers-guide/how-to-develop) page.
{{% /pageinfo %}}


## GoReleaser

`GoReleaser` is a famous tool to build and create releases for projects on Github or else. We'll use it to build and archive the binaries at each release.

At the root of your repo, create a `.goreleaser.yaml` file with the following content:

```yaml
builds:
  - env:
      - GODEBUG=cgocheck=0
    main: ./plugin
    binary: lib{PLUGIN_NAME}.so
    goos:
      - linux
    goarch:
      - amd64
    flags: -buildmode=c-shared
checksum:
  name_template: "checksums.txt"
```

With `PLUGIN_NAME` as the name of your plugin.

## Makefile

`Makefiles` are a convenient way to script actions. We'll use it to pass all the required flags to create the final `.so` library files used by the `Falco` plugin framework:

```makefile
SHELL=/bin/bash -o pipefail
GO ?= go

NAME := {PLUGIN_NAME}
OUTPUT := lib$(NAME).so

ifeq ($(DEBUG), 1)
    GODEBUGFLAGS= GODEBUG=cgocheck=2
else
    GODEBUGFLAGS= GODEBUG=cgocheck=0
endif

all: build

clean:
	@rm -f lib$(NAME).so

build: clean
	@$(GODEBUGFLAGS) $(GO) build -buildmode=c-shared -buildvcs=false -o $(OUTPUT) ./plugin
```

With `PLUGIN_NAME` as the name of your plugin.

You can test it by running `make build` and see the `lib{PLUGIN_NAME}.so` appearing at the root of your folder.

## Github Actions Workflow

The first step is to create the `.github/workflows` folder and the `release.yaml` file describing our workflow.

### Headers

Each workflow starts with, at least, a `name` and a `on`:

```yaml
name: Release Plugins

on:
  push:
    tags:
      - '[0-9]+\.[0-9]+\.[0-9]+'

env:
  OCI_REGISTRY: ghcr.io
  PLUGIN_NAME: {PLUGIN_NAME}

permissions:
  contents: write
  packages: write
```

The workflow will be triggered each time a tag following semantic versioning (`major.minor.patch`) is created.

Once again `PLUGIN_NAME` is the name of your plugin, it will be set as env var to be reused all over the file. It's the only thing to adapt to your context. We also set the registry (Github Packages) URL with `OCI_REGISTRY`.

{{% pageinfo color="warning" %}}
The permissions are required to allow Github Actions to read the content of your repo, create the release and push the artifacts into Github Packages.
{{% /pageinfo %}}

### The jobs

Once we have set the "headers" of the workflow file, it's time to set the actions that will be run. We'll split them into 2:
* Publish the OCI artifacts
* Create the release

#### Publish the OCI artifacts

To publish the artifacts, we'll use [`falcoctl`](https://github.com/falcosecurity/falcoctl), the official CLI to manage Falco artifacts.

The steps to publishing the artifacts will be, in this order:

* Get the falcoctl sources
* Prepare the Go env
* Build falcoctl (guarantees the latest version)
* Get the plugin sources
* Build the plugin (`.so` file)
* Get the repo name in lower case
* Push the artifacts with all their tags:
  * push the plugin
  * push the rules with a dependency to the plugin

```yaml
jobs:
  publish-oci-artifacts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Falcoctl Repo
        uses: actions/checkout@v3
        with:
          repository: falcosecurity/falcoctl
          ref: main
          path: tools/falcoctl
      - name: Setup Golang
        uses: actions/setup-go@v4
        with:
          go-version: '^1.20'
          cache-dependency-path: tools/falcoctl/go.sum
      - name: Build falcoctl
        run: make
        working-directory: tools/falcoctl
      - name: Checkout
        uses: actions/checkout@v3
        with:
          path: plugin
      - name: Build the plugin
        run: make build
        working-directory: plugin
      - id: StringRepoName
        uses: ASzc/change-string-case-action@v5
        with:
          string: ${{ github.repository }}
      - name: Upload OCI artifacts to GitHub packages
        run: |
              MAJOR=$(echo ${{ github.ref_name }} | cut -f1 -d".")
              MINOR=$(echo ${{ github.ref_name }} | cut -f1,2 -d".")
              DIR=$(pwd)

              cd plugin/
              $DIR/tools/falcoctl/falcoctl registry push \
              ${{ env.OCI_REGISTRY }}/${{ steps.StringRepoName.outputs.lowercase }}/plugin/${{ env.PLUGIN_NAME }}:${{ github.ref_name }} \
              --config /dev/null \
              --type plugin \
              --version "${{ github.ref_name }}" \
              --tag latest --tag $MAJOR --tag $MINOR \
              --platform linux/amd64 \
              --requires plugin_api_version:2.0.0 \
              --depends-on ${{ env.PLUGIN_NAME }}-rules:${{ github.ref_name }} \
              --name ${{ env.PLUGIN_NAME }} \
              lib${{ env.PLUGIN_NAME }}.so

              cd rules/
              $DIR/tools/falcoctl/falcoctl registry push \
              ${{ env.OCI_REGISTRY }}/${{ steps.StringRepoName.outputs.lowercase }}/ruleset/${{ env.PLUGIN_NAME }}:${{ github.ref_name }} \
              --config /dev/null \
              --type rulesfile \
              --version "${{ github.ref_name }}" \
              --tag latest --tag $MAJOR --tag $MINOR \
              --depends-on ${{ env.PLUGIN_NAME }}:${{ github.ref_name }} \
              --name ${{ env.PLUGIN_NAME }}-rules \
              ${{ env.PLUGIN_NAME }}_rules.yaml
        env:
          FALCOCTL_REGISTRY_AUTH_BASIC: ${{ env.OCI_REGISTRY }},${{ github.repository_owner }},${{ secrets.GITHUB_TOKEN }}
```

#### Create the release

`GoReleaser` can automatically generate a Changelog at the same time we publish the new artifacts. This step isn't imperative to generate the OCI artifacts but it's a good practice among Go developers. To achieve that, make sure to have a correct `.goreleaser.yml` file as explained [here](/blog/extend-falco-inputs-with-a-plugin-distribute#goreleaser).

```yaml
  release:
    runs-on: ubuntu-latest[0-9]+\.[0-9]+\.[0-9]+
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Setup Golang
        uses: actions/setup-go@v3
        with:
          go-version: '1.19'
      - name: Run GoReleaser
        uses: goreleaser/goreleaser-action@v4
        with:
          version: latest
          args: release --clean --timeout 120m
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          LDFLAGS: "-buildmode=c-shared"
          GOPATH: /home/runner/go
```

### Final result

```yaml
name: Release Plugins

on:
  push:
    tags:
      - '[0-9]+\.[0-9]+\.[0-9]+'

env:
  OCI_REGISTRY: ghcr.io
  PLUGIN_NAME: {PLUGIN_NAME}

permissions:
  contents: write
  packages: write

jobs:
  publish-oci-artifacts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Falcoctl Repo
        uses: actions/checkout@v3
        with:
          repository: falcosecurity/falcoctl
          ref: 0.5.0 # adapt to the latest version
          path: tools/falcoctl
      - name: Setup Golang
        uses: actions/setup-go@v4
        with:
          go-version: '^1.20'
          cache-dependency-path: tools/falcoctl/go.sum
      - name: Build falcoctl
        run: make
        working-directory: tools/falcoctl
      - name: Checkout
        uses: actions/checkout@v3
        with:
          path: plugin
      - name: Build the plugin
        run: make build
        working-directory: plugin
      - id: StringRepoName
        uses: ASzc/change-string-case-action@v5
        with:
          string: ${{ github.repository }}
      - name: Upload OCI artifacts to GitHub packages
        run: |
              MAJOR=$(echo ${{ github.ref_name }} | cut -f1 -d".")
              MINOR=$(echo ${{ github.ref_name }} | cut -f1,2 -d".")
              DIR=$(pwd)

              cd plugin/
              $DIR/tools/falcoctl/falcoctl registry push \
              ${{ env.OCI_REGISTRY }}/${{ steps.StringRepoName.outputs.lowercase }}/plugin/${{ env.PLUGIN_NAME }}:${{ github.ref_name }} \
              --config /dev/null \
              --type plugin \
              --version "${{ github.ref_name }}" \
              --tag latest --tag $MAJOR --tag $MINOR \
              --platform linux/amd64 \
              --requires plugin_api_version:2.0.0 \
              --depends-on ${{ env.PLUGIN_NAME }}-rules:${{ github.ref_name }} \
              --name ${{ env.PLUGIN_NAME }} \
              lib${{ env.PLUGIN_NAME }}.so

              cd rules/
              $DIR/tools/falcoctl/falcoctl registry push \
              ${{ env.OCI_REGISTRY }}/${{ steps.StringRepoName.outputs.lowercase }}/ruleset/${{ env.PLUGIN_NAME }}:${{ github.ref_name }} \
              --config /dev/null \
              --type rulesfile \
              --version "${{ github.ref_name }}" \
              --tag latest --tag $MAJOR --tag $MINOR \
              --depends-on ${{ env.PLUGIN_NAME }}:${{ github.ref_name }} \
              --name ${{ env.PLUGIN_NAME }}-rules \
              ${{ env.PLUGIN_NAME }}_rules.yaml
        env:
          FALCOCTL_REGISTRY_AUTH_BASIC: ${{ env.OCI_REGISTRY }},${{ github.repository_owner }},${{ secrets.GITHUB_TOKEN }}

  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Setup Golang
        uses: actions/setup-go@v3
        with:
          go-version: '1.19'
      - name: Run GoReleaser
        uses: goreleaser/goreleaser-action@v4
        with:
          version: latest
          args: release --clean --timeout 120m
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          LDFLAGS: "-buildmode=c-shared"
          GOPATH: /home/runner/go
```

Replace `PLUGIN_NAME` with the name of your plugin.

## The index.yaml file for falcoctl

This file is used by `falcoctl` to know where to download your plugin and rules. Please read this [blog post](/blog/falcoctl-install-manage-rules-plugins#index) to understand better how it works.

We'll create our own file to allow like the following:

```yaml
- name: {PLUGIN_NAME}
  type: plugin
  registry: ghcr.io
  repository: {OWNER_NAME}/{REPO_NAME}/plugin/{PLUGIN_NAME}
  description: {DESCRIPTION}
  home: https://github.com/{OWNER_NAME}/{PLUGIN_NAME}
  keywords:
    - {PLUGIN_NAME}
  license: Apache-2.0
  maintainers:
    - email: {OWNER_EMAIL}
      name: {OWNER_REAL_NAME}
  sources:
    - https://github.com/{OWNER_NAME}/{PLUGIN_NAME}
- name: {PLUGIN_NAME}-rules
  type: rulesfile
  registry: ghcr.io
  repository: {OWNER_NAME}/{REPO_NAME}/ruleset/docker
  description: Rules for the {PLUGIN_NAME} plugin
  home: https://github.com/{OWNER_NAME}/{REPO_NAME}/tree/main/rules
  keywords:
    - {PLUGIN_NAME}
  license: Apache-2.0
  maintainers:
    - email: {OWNER_EMAIL}
      name: {OWNER_REAL_NAME}
  sources:
    - https://github.com/{OWNER_NAME}/{REPO_NAME}/tree/main/rules/{PLUGIN_NAME}_rules.yaml
```

With:
* `PLUGIN_NAME`: the name of you plugin
* `OWNER_NAME`: your nickname on Github
* `REPO_NAME`: the name of your repo for your plugin on Github
* `OWNER_EMAIL`: an email for contact
* `OWNER_REAL_NAME`: your real name or not
* `DESCRIPTION`: description of your plugin

`falcoctl` uses the keywords field to perform a search among your plugins. Leverage this functionality by adding relevant terms to your plugin.

The repository structure should look like the following:

```shell
├── .github
│   └── workflows
│       └── release.yaml
├── .gitignore
├── go.mod
├── .goreleaser.yml
├── go.sum
├── index.yaml
├── LICENSE
├── Makefile
├── README.md
├── pkg
│   └── {PLUGIN_NAME}.go
├── plugin
│   └── main.go
└── rules
    └── {PLUGIN_NAME}_rules.yaml
```

There are 2 ways to expose the `index.yaml` file:
* exposing the raw file: `https://raw.githubusercontent.com/{OWNER_NAME}/{REPO_NAME}/main/index.yaml`
* exposing the file through Github Page: `https://{OWNER_NAME}.github.io/{REPO_NAME}/index.yaml` (make sure to [enable the Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-from-a-branch))

## Create our first version

Everything is now ready to publish a first version of our plugin.

In the `main` branch, run:

```shell
git tag 0.1.0 -m "0.1.0" && git push origin 0.1.0
```

Few seconds after, your workflow should be started and you will have your first published version with associated artifacts.

## Installation of your plugin and rules

The process is now the same as the one described [here](/blog/falcoctl-install-manage-rules-plugins), except we'll use your specific `index.yaml` to register a new index:

```shell
sudo falcoctl index add {PLUGIN_NAME} https://{OWNER_NAME}.github.io/{REPO_NAME}/index.yaml
sudo falcoctl artifact install {PLUGIN_NAME}
sudo falcoctl artifact install {PLUGIN_NAME}-rules
```

For the `docker` plugin, for example:

```shell
❯ sudo falcoctl index add docker  http://issif.github.io/docker-plugin/index.yaml

❯ sudo falcoctl artifact search docker
INDEX 	ARTIFACT    	TYPE     	REGISTRY	REPOSITORY                   
docker	docker      	plugin   	ghcr.io 	issif/docker-plugin/plugin/docker
docker	docker-rules	rulesfile	ghcr.io 	issif/docker-plugin/ruleset/docker

❯ sudo falcoctl artifact install docker-rules
 INFO  Reading all configured index files from "/root/.config/falcoctl/indexes.yaml"
 INFO  Resolving dependencies ...
 INFO  Installing the following artifacts: [docker:0.3.3 ghcr.io/issif/docker-plugin/ruleset/docker:latest]
 INFO  Preparing to pull "ghcr.io/issif/docker-plugin/plugin/docker:0.3.3"
 INFO  Pulling 9145239be00e: ############################################# 100%
 INFO  Pulling 2073e106ba07: ############################################# 100%
 INFO  Pulling 01ecf22a3821: ############################################# 100%
 INFO  Artifact successfully installed in "/usr/share/falco/plugins"                                                                                                                                          
 INFO  Preparing to pull "ghcr.io/issif/docker-plugin/ruleset/docker:latest"
 INFO  Pulling 3482c7ca931f: ############################################# 100%
 INFO  Pulling 433ad24cb056: ############################################# 100%
 INFO  Pulling e449b880035d: ############################################# 100%
 INFO  Artifact successfully installed in "/etc/falco"
```
