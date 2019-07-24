# falco-website

## Translation

There is currently scaffolding in place for a Chinese translation of the site. To develop the translation, run `make serve`. This will start the Hugo server running locally. Navigate to `http://localhost:1313/zh` to see the current Chinese translation.

To translate docs into Chinese, create Chinese-language Markdown files in the `content/zh/docs` directory.

To translate other parts of the site:

1. See the `languages.zh` block in the site's [`config.yaml`](./config.yaml) configuration file and translate those items from the current English.
1. See [`i18n/zh.yaml`](./i18n/zh.yaml) for a handful of language snippets that need to be translated from the current English. Translate the `other` block of each term.
