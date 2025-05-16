# How to add keywords
Please follow these steps to add keywords to any page on [Falco](https://falco.org/):
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Choose any markdown file in [content folder](https://github.com/falcosecurity/falco-website/tree/main/content), e.g. https://github.com/falcosecurity/falco-website/blob/master/content/en/blog/falco-0-34-0/index.md
3. In the header of the Markdown file (the front matter), set a field called `keywords` with your keywords separated by comma, e.g.
```
---
title: Falco 0.34.0 a.k.a. "The Honeybee 🍯"
date: 2023-02-07
...
keywords: keyword1, keyword2, keyword3
---
```
4. Create pull request to the Falco repository with your changes
