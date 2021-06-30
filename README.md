# falco-website

## Contributing logos

In order to contribute a logo you must meet one of the following adopter types.

 - End-user, with a contribution to [ADOPTERS.md](https://github.com/falcosecurity/falco/blob/master/ADOPTERS.md)
 - Vendor, with a contribution to [ADOPTERS.md](https://github.com/falcosecurity/falco/blob/master/ADOPTERS.md)
 - Integration, with a contribution to the [Falco contrib](https://github.com/falcosecurity/contrib) repository. This must be documentation at the very least that describes how to use Falco with your project or tool.

Then open a pull request to this repository that contains:

 - A `.png` or `.svg` file in [clients](https://github.com/falcosecurity/falco-website/tree/master/themes/falco-fresh/static/images/logos/clients)
 - A change to [config.toml](https://github.com/falcosecurity/falco-website/blob/master/config.toml) that includes your logo alphabetically
 - Links and references to demonstrate you meet the criteria above.

We try not to duplicate logos, and would prefer more encompassing logos over granular logos. For instance we prefer AWS over AWS EC2.

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

1. See the `languages.zh` block in the site's [`config.toml`](./config.toml) configuration file and translate those items from the current English.
1. See [`i18n/zh.yaml`](./i18n/zh.yaml) for a handful of language snippets that need to be translated from the current English. Translate the `other` block of each term.

### Japanese

There is currently scaffolding in place for a Japanese translation of the site.

To translate docs into Japanese, create Japanese-language Markdown files in the `content/ja/docs` directory.

To translate other parts of the site:

1. See the `languages.ja` block in the site's [`config.toml`](./config.toml) configuration file and translate those items from the current English.
1. See [`i18n/ja.yaml`](./i18n/ja.yaml) for a handful of language snippets that need to be translated from the current English. Translate the `other` block of each term.

### Korean

There is currently scaffolding in place for a Korean translation of the site.

To translate docs into Korean, create Korean Markdown file(s) in the `content/ko/docs` directory.

To translate other parts of the site:

1. See the `languages.ko` block in the site's [`config.toml`](./config.toml) configuration file and translate those items from the current English.
1. See [`i18n/ko.yaml`](./i18n/ko.yaml) for a handful of language snippets that need to be translated from the current English. Translate the `other` block of each term.

### Malayalam

There is currently scaffolding in place for a Malayalam translation of the site.

To translate docs into Malayalam, create Malayalam Markdown file(s) in the `content/ml/docs` directory.

To translate other parts of the site:

1. See the `languages.ml` block in the site's [`config.toml`](./config.toml) configuration file and translate those items from the current English.
1. See [`i18n/ml.yaml`](./i18n/ml.yaml) for a handful of language snippets that need to be translated from the current English. Translate the `other` block of each term.

