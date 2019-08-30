# falco-website

## Prerequisites

To build this website you need :

* [hugo](https://gohugo.io/getting-started/installing/)
* [nodejs](https://nodejs.org/en/download/)
* [yarn](https://yarnpkg.com/lang/en/docs/install/#windows-stable)

### Test & Build

#### Clone repository

```bash
git clone git@github.com:falcosecurity/falco-website.git
```

#### Install theme

```bash
cd ./falco-website/themes/falco-fresh
yarn install
```

#### Test in local

```bash
make server
```
You can access your local website on http://localhost:1313

#### Build

```bash
make production-build
```

## Translation

There is currently scaffolding in place for a Chinese translation of the site. To develop the translation, run `make serve`. This will start the Hugo server running locally. Navigate to `http://localhost:1313/zh` to see the current Chinese translation.

To translate docs into Chinese, create Chinese-language Markdown files in the `content/zh/docs` directory.

To translate other parts of the site:

1. See the `languages.zh` block in the site's [`config.yaml`](./config.yaml) configuration file and translate those items from the current English.
1. See [`i18n/zh.yaml`](./i18n/zh.yaml) for a handful of language snippets that need to be translated from the current English. Translate the `other` block of each term.
