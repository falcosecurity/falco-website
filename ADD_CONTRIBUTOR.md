# How to add new contributor
Please follow these steps to add new contributor to [contributors page](https://falco.org//community/contributors/):
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Add new contributor image to
   the [static/img/community/contributors](https://github.com/falcosecurity/falco-website/blob/master/static/img/community/contributors)
   folder. Use svg, preferably rounded images
3. Add new contributor information to [contributors data file](https://github.com/falcosecurity/falco-website/blob/master/data/contributors.yaml) at the beginning of the file before the first element using template below
```
- date: January and February, 2022
  names:
    - Name FamilyName
    links:
      - https://github.com/name
    images:
      - /img/community/contributors/name.svg
    descriptions:
      - Couple of sentences about the contribution
```
4. If you need to add more than one contributor use template below
```
- date: February, 2023
  names:
    - Name FamilyName1
    - Name FamilyName2
  links:
    - https://github.com/name1
    - https://github.com/name2
  images:
    - /img/community/contributors/name1.svg
    - /img/community/contributors/name2.svg
  descriptions:
    - Couple of sentences about the contribution
    - Couple of sentences about the contribution
```
5. Create pull request to the Falco repository with your changes
