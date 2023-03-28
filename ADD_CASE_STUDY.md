# How to add new case study
Please follow these steps to add your case-study to [Falco endusers](https://falco.org/about/ecosystem/):
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Add your case-study image to
   the [static/img](https://github.com/falcosecurity/falco-website/blob/master/static/img)
   folder. Use svg, preferably horizontal format, e.g. your_case_study.svg
3. Add your author image to
   the [static/img](https://github.com/falcosecurity/falco-website/blob/master/static/img)
   folder. Use svg, preferably rounded image, e.g. author_name.svg
4. Add an entry at the end of [quotes file](https://github.com/falcosecurity/falco-website/blob/master/data/en/quotes.yaml) after the previous ones using the template below and replace next fields with your data
```
---
- text: description
  logoUrl: /img/your_case_study.svg
  authorImgUrl: /img/author_name.svg
  authorName: Author Name
  authorPosition: Author Position
```
5. Create pull request to the Falco repository with your changes
