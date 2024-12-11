# falco-website

[![Falco Core Repository](https://github.com/falcosecurity/evolution/blob/main/repos/badges/falco-core-blue.svg)](https://github.com/falcosecurity/evolution/blob/main/REPOSITORIES.md#core-scope) [![Stable](https://img.shields.io/badge/status-stable-brightgreen?style=for-the-badge)](https://github.com/falcosecurity/evolution/blob/main/REPOSITORIES.md#stable) [![License](https://img.shields.io/github/license/falcosecurity/falco-website?style=for-the-badge)](./LICENSE)

This is the source code for the official Falco website: https://falco.org .

## Contributing logos

In order to contribute a logo you must meet one of the following adopter types.

 - End-user, with a contribution to [ADOPTERS.md](https://github.com/falcosecurity/falco/blob/master/ADOPTERS.md)
 - Vendor, with a contribution to [ADOPTERS.md](https://github.com/falcosecurity/falco/blob/master/ADOPTERS.md)
 - Integration, with a contribution to the [Falco contrib](https://github.com/falcosecurity/contrib) repository. This must be documentation at the very least that describes how to use Falco with your project or tool.

Then open a pull request to this repository that contains:

 - A `.png` or `.svg` file in [clients](https://github.com/falcosecurity/falco-website/tree/main/static/img/adopters)
 - A change to [params.toml](https://github.com/falcosecurity/falco-website/blob/master/config/_default/params.toml) that includes your logo alphabetically. Detailed instructions to add new adopters or training providers are included into the specified Hugo config file.
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

It has been decided by the community to drop out all translations. It requires too much work to maintain them, and most of them were outdated. We want to thank a lot all the community members who contributed over years, you did an amazing job.
