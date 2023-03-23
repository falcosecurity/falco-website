# How to add new logo
Please follow these steps to add your logo to [Falco ecosystem page](https://falco.org/about/ecosystem/):
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Add your logo to
   the [static/img/adopters](https://github.com/falcosecurity/falco-website/blob/master/static/img/adopters)
   folder. Use png, preferably horizontal format
3. Add file with logo name to the [logos folder](https://github.com/falcosecurity/falco-website/blob/master/data/adopters/vendors)  e.g., logo.yaml
4. Copy template below to the created file and replace next fields with your data
```
src: your_logo_name.png
alt: alt tag decription
url: https://your_url.com/
```
5. Create pull request to the Falco repository with your changes
