Please follow these steps to add your blog to [Falco blog folder](https://falco.org/blog/):
1. Fork the [Falco](https://github.com/falcosecurity/falco-website) repository.
2. Clone the repository locally or work directly on GitHub.
3. In the path [`falco-website/content/en/blog/`](https://github.com/falcosecurity/falco-website/tree/master/content/en/blog) create a directory to contain your [Markdown](https://www.markdownguide.org/cheat-sheet/) `index.md` file and a subdirectory called `images/`.
    - The directory name should **not** contain any space. For better readability, _kebab-case_ is recommended (lowercase words separated by dashes). 
    - It is recommended to match the directory name to the [slug](https://en.wikipedia.org/wiki/Clean_URL#Slug) of the blog post.
    - Keep it short but informative.
    - [Example on GitHub](https://github.com/falcosecurity/falco-website/tree/master/content/en/blog/gitops-your-falco-rules):
      ```
      falco-website/content/en/blog/gitops-your-falco-rules/
      falco-website/content/en/blog/gitops-your-falco-rules/index.md
      falco-website/content/en/blog/gitops-your-falco-rules/images/
      ```
4. Add related images to the images directory.
   The recommended naming convention is to name them using the _slug_ plus a sequence number.
    ```
    gitops-your-falco-rules/images/
    gitops-your-falco-rules/images/gitops-your-falco-rules-01.png
    gitops-your-falco-rules/images/gitops-your-falco-rules-02.png
    gitops-your-falco-rules/images/gitops-your-falco-rules-03.png
    gitops-your-falco-rules/images/gitops-your-falco-rules-04.png
    ```
5. In case of addding a featured image, name it using the **`-featured`** suffix before the file extension. This setting will display the image at the top of the article substituting the default featured image.
    ```
    gitops-your-falco-rules/images/
    ....
    gitops-your-falco-rules/images/gitops-your-falco-rules-featured.png
    ```
6. Add file called `index.md` with the content of the article, like in this [example](https://github.com/falcosecurity/falco-website/blob/master/content/en/blog/gitops-your-falco-rules/index.md).
7. Copy the following template at the top of the newly created `index.md` file and replace these fields with your data. The list of available tags can be found [here](https://github.com/falcosecurity/falco-website/blob/master/data/en/blog_tags.yaml).
    ```
    ---
    title: Article name
    date: 2023-01-01
    author: FirstName FirstLastName, SecondName SecondLastName, ...
    slug: aricle-name-with-dashes
    tags: ["Falco", "Rules", ...]
    ---
   Content of the article ...
    ```
8. Set the date of the blog post to the day it should be published. This field sets the order in which the posts are shown on the blog landing page.
    - If it got merged before the date, it will not be displayed.
    - It will be displayed in the _preview_ render despite having a date in the future. 
9. In the header of the `index.md` file (the [front matter](https://gohugo.io/content-management/front-matter/)), set the web featured image. It will be displayed when sharing the blog post on social networks.
    - Use the URL path (without the domain name). If the _slug_ does't match the directory name, use use the former.
    - The recommended size of the featured image is 1200 x 628 pixels.
    - Add only one featured image to this list that will be displayed as cover. Make sure that the file name contains the word `featured`.
    - Example:
      ```
      ---
      title: GitOps your Falco Rules
      ...
      slug: gitops-your-falco-rules
      images:
        - /blog/gitops-your-falco-rules/images/gitops-your-falco-rules-featured.png
      ---
      ```
10. Create a pull request to the Falco repository with your changes.
    - Uncomment the `/kind content` and `/area blog` lines to set the right labels.
    - Add any relevant information to the PR message.
