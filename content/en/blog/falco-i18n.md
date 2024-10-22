---
title: "Internationalize Falco Website"
date: 2021-06-11
author: Radhika Puthiyetath
slug: i18n-falco-website
---

Diversity and inclusion are the core values of the CNCF ecosystem. As its incubation project, Falco aligns and functions in the fullest expression of these principles. As we recognize internationalization as a powerful tool to facilitate openness and participation by breaking language barriers, Falco encourages and stands for internationalization (i18n) efforts. With three i18n projects nearing completion and one underway, Falco is leading the way.

The goal of i18n is to make Falco easier to use for as many people as possible. To facilitate a smoother initialization into the Falco i18n workflow, we have put together this page. It gives you a broad overview of the i18n process followed by the Falco Community while internationalizing the Falco website.

## Initialize New Language Contributions

Before you start, make sure that nobody else is proceeding with your language translation. If there are, please join them. If you are the first one to start the project, review the general [Contribution Guidelines](https://github.com/falcosecurity/.github/blob/master/CONTRIBUTING.md).

### Identify Locale Codes

As the first step, identify the locale code associated with your language of choice. You can manually assign the language labels in the pull request (PR) comments.

For example, when left as a comment on an issue or PR, the command `/kind translation` assigns the label `kind/translation`.

### Locate Files and Directories

The files and directories associated with the Falco localization are:

* The [i18n](https://github.com/falcosecurity/falco-website/tree/main/i18n) directory: It contains the translated homepage of the Falco website. Each locale will have a file corresponding to the homepage. You should create one corresponding to your language.
* The [content](https://github.com/falcosecurity/falco-website/tree/main/content) directory:  The translated content for blog, documentation, community, and videos resides in the [content](https://github.com/falcosecurity/falco-website/tree/main/content) directory.
* The [configuration file](https://github.com/falcosecurity/falco-website/blob/master/config.toml): It is located in the root directory. The TOML file contains the configuration of the static website generator, hugo. It contains settings for the languages, formatting, caches, and so on. Make sure that you create a language sub-section corresponding to your language.
* OWNERS file: There is an [OWNERS](https://github.com/falcosecurity/falco-website/blob/master/OWNERS) file for the Falco website, listing the reviewers and approvers of the project. Similarly, create an OWNERS file for your language project. See the [OWNERS](https://github.com/falcosecurity/falco-website/blob/master/content/ml/OWNERS) file for Malayalam for reference.

### Choose i18n Tools

Choose your favorite language keyboard. Make sure that it works with the markup editor. If not simply use a google doc and its language option, then copy the content to the markup editor.

## Contribute to Falco i18n

This section helps you start an i18n effort for Falco from scratch.


1. Fork the [Falco Website](https://github.com/falcosecurity/falco-website) repository.

2. Create a branch for your translation project.
    For example: `git checkout -b new/language-<lang code>`

    Replace `language-<lang code>` with your language of choice and locale code.

3. Create the `<lang code>.yaml` file in the [i18n](https://github.com/falcosecurity/falco-website/tree/main/i18n) directory.
    In this file, you mainly include the translated content of the home page.


4. Add another `[language]` sub-section in the [config.toml](https://github.com/falcosecurity/falco-website/blob/master/config.toml) file.

   For example, for Korean:

    ```[languages.ko]
    title = "Falco"
    description = "런타임 보안"
    languageName = "한국어 Korean"
    weight = 3
    contentDir = "content/ko"
    languagedirection = "ltr"

    [languages.ko.params]
    time_format_blog = "2006.01.02"
    language_alternatives = ["en"]

    ```

5. Create a directory, named  `<lang code>`, corresponding to your language in the [content](https://github.com/falcosecurity/falco-website/tree/main/content) directory.

   For example,  `content/ml` is the directory corresponding to the language, Malayalam.  

6. Navigate to the language directory that you have just created.

   `cd content/<lang code>`

   Replace `<lang code>` with your locale ID.

7. Create a ` _index.md` file in the directory.

   For example, see the [_index.md](https://github.com/falcosecurity/falco-website/blob/master/content/en/_index.md) file corresponding to English.

8. Translate the content to your language.

9. Create a `content/<lang code>/docs` directory and a corresponding `_index.md` file in it.

   Likewise, ensure that you create an`_index.md`  file for each directory and sub-directory in the `content/<lang code>` directory.

10. Start with the Getting Started section. Replicate the `getting-started` directory and its file structure.

11. Translate the content in the Getting Started directory to your language.

    For example, see the [English](https://github.com/falcosecurity/falco-website/tree/main/content/en/docs/getting-started) version of the Getting Started directory.

12. Ensure that you sign your commit with `git commit -s -m "message”`.

13. Once ready create the PR against the master. Make sure you split the effort in smaller units.


## Become a Maintainer

Falco i18n members can review and approve their own PRs. For example, review and approval permissions for English are found in the [OWNERS](https://github.com/falcosecurity/falco-website/blob/master/OWNERS) file at the root of the [falco-website](https://github.com/falcosecurity/falco-website) repository. See [GOVERNANCE](https://github.com/falcosecurity/.github/blob/master/GOVERNANCE.md) for more information. 

As a contributor, make sure that you create an OWNERS file inside the `content/<lang code>` directory in order to become a maintainer for that localization.
