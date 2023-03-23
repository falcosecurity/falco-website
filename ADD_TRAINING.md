# How to add new training
Please follow these steps to add your training to [Falco trainings](https://falco.org/training/):
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Add your training image to
   the [static/images/training/offerings](https://github.com/falcosecurity/falco-website/blob/master/static/images/training/offerings)
   folder. Use svg, preferably horizontal format, e.g. your_training_name.svg
3. Add file with training name to [training/offerings folder](https://github.com/falcosecurity/falco-website/blob/master/data/training/offerings), e.g., training_name.yaml
4. Copy template below to the created file and replace next fields with your data
```
---
name: Training name
type: course
link: https://your_training_url.com/
description: Your training description
thumbnail: falco-plugins.svg
duration: 0 hr 00 min
provider: your_training_name.svg
  name: sysdig
  order: 4
...
```
5. Create pull request to the Falco repository with your changes
