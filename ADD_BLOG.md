# How to add new blog
Please follow these steps to add your blog to [Falco blog folder](https://falco.org/blog/):
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Add new folder to the blog with the same name as your article name, .e.g. [https://github.com/falcosecurity/falco-website/blob/master/content/en/blog/falco-0-34-0](https://github.com/falcosecurity/falco-website/blob/master/content/en/blog/falco-0-34-0)
3. Add folder called images there, e.g. [https://github.com/falcosecurity/falco-website/blob/master/content/en/blog/falco-0-34-0/images](https://github.com/falcosecurity/falco-website/tree/master/content/en/blog/falco-0-34-0/images)
4. Add related images to the images folder. In the header of the Markdown file (the front matter), set a featured image. The recommended size of the featured image is 1200 x 628 pixels
5. Add file called index.md with content of the article, e.g. [https://github.com/falcosecurity/falco-website/blob/master/content/en/blog/falco-0-34-0/index.md](https://github.com/falcosecurity/falco-website/blob/master/content/en/blog/falco-0-34-0/index.md)
6. Copy template below to the created file and replace next fields with your data
```
---
title: Article name
date: 2023-01-01
author: FirstName FirstLastName, SecondName SecondLastName, ...
slug: same name as your folder name, e.g. falco-0-34-0
images:
- /blog/article-folder/images/this-is-the-featured-image.png
tags: ["Falco", "Integration", ...] List of all tags is available in https://github.com/falcosecurity/falco-website/blob/master/data/en/blog_tags.yaml
---
Content of the article...
```
7. Create pull request to the Falco repository with your changes
