# Falco Website Release Process


The release process of the [falco.org](https://falco.org) is automated by using [netlify](https://www.netlify.com/). Each commit merged into the `master` branch will be automatically deployed to [falco.org](https://falco.org).

> You can find the last deploy status by clicking on this [![Netlify Status](https://api.netlify.com/api/v1/badges/3ff1ba0c-68c8-4f94-b8fa-6260c6ae1925/deploy-status)](https://app.netlify.com/sites/falcosecurity/deploys) badge.

However, the above workflow only applies to the latest version of the website that refers to the latest released version of Falco. Starting from version Falco v0.27.0, we introduced a versioning mechanism for our website. Please follow the below instruction when switching to a *new minor version* (according to the [semantic versioning](https://semver.org/) definition).

## Documentation versioning

We archive a snapshot of the whole website every time a new **Falco minor version** comes out.

Each snapshot will be published to a *falco.org* subdomain named by the Falco version without the *patch* number (e.g., Falco version `v0-26.falco.org` refers to the latest available *patch* version of Falco series `v0.26.x`).

> You can find the first-ever archived snapshot at [v0-26.falco.org](https://v0-26.falco.org/). It refers to Falco v0.26.2.

Finally, once a snapshot for the previous version has been created, you need to configure the main website to point to the newest Falco minor version.

### Create a new website snapshot

The following instructions assume **`v0.x.y` is the version to be archived**.

1. Configure [the branch deploy control on Netlify](https://docs.netlify.com/site-deploys/overview/#branch-deploy-controls) by adding the newly created branch `v0.x`.
2. Create the new `v0.x` branch from the current `master` branch.
3. Within the `v0.x` branch, edit the [config.toml](config.toml) file:
    - set `archived_version` to `true`,
    - make sure `version` is equal to `v0.x.y`,
    - finally, commit and push to `v0.x`.
4. Once the Netlify branch build is done, add a new [branch subdomain on Netilify](https://docs.netlify.com/domains-https/custom-domains/multiple-domains/#branch-subdomains) by selecting the branch deploy configured in the previous step.
5. Open a [PR in falcosecurity/test-infra](https://github.com/falcosecurity/test-infra/edit/master/config/config.yaml) to add `v0.x` as protected branch to the `prow/config.yaml`, for example:

    ```yaml
            falco-website:
              branches:
                master:
                  protect: true
                v0.26:
                  protect: true
                ...
                v0.x:
                  protect: true
    ```

### Bump the version on the current website

> **N.B.** Do not update the minor version until a snapshot for the previous one has been created!
>
The following instructions assume **`v0.X.Y` is the new version** and **v0.x.y** is the previous already-archived version.

1. Open a [PR in falcosecurity/falco-website](https://github.com/falcosecurity/falco-website/edit/update/master/config.toml) to modifiy the [config.toml](config.toml) file on the `master` branch:
    - make sure `version` is set to `v0.X.Y` (i.e., *the new version*),
    - append the following config for *the new version* to the end of the file:
    ```toml
    [[params.versions]]
    fullversion = "v0.X.Y"
    version = "vX.Y"
    githubbranch = "master"
    docsbranch = "master"
    url = "https://falco.org"
    ```
    - change the `[[params.versions]]` block refering to `v0.x.y` (i.e., *the previous version*) as following:
    ```toml
    [[params.versions]]
    fullversion = "v0.x.y"
    version = "v0.x"
    githubbranch = "0.x.y"
    docsbranch = "v0.x"
    url = "https://v0-x.falco.org"
    ```
2. Once the PR gets approved and merged, the website will be updated shortly, and no other actions are needed.
