# falco-website

## Prerequisites

To build this website you need:

* [Hugo](https://gohugo.io/getting-started/installing/)
* [Nodejs](https://nodejs.org/en/download/)
* [Yarn](https://yarnpkg.com/lang/en/docs/install/#windows-stable)

### Test locally

#### Clone repository

```bash
git clone git@github.com:falcosecurity/falco-website.git
```

#### Run hugo server

```bash
make serve
```

You can access your local website on http://localhost:1313

## Translations

### Chinese

There is currently scaffolding in place for a Chinese translation of the site.

To translate docs into Chinese, create Chinese-language Markdown files in the `content/zh/docs` directory.

To translate other parts of the site:

1. See the `languages.zh` block in the site's [`config.yaml`](./config.yaml) configuration file and translate those items from the current English.
1. See [`i18n/zh.yaml`](./i18n/zh.yaml) for a handful of language snippets that need to be translated from the current English. Translate the `other` block of each term.

### Japanese

There is currently scaffolding in place for a Japnese translation of the site.

To translate docs into Japanese, create Japanese-language Markdown files in the `content/jp/docs` directory.

To translate other parts of the site:

1. See the `languages.jp` block in the site's [`config.yaml`](./config.yaml) configuration file and translate those items from the current English.
1. See [`i18n/jp.yaml`](./i18n/jp.yaml) for a handful of language snippets that need to be translated from the current English. Translate the `other` block of each term.