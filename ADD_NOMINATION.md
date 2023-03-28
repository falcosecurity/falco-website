# How to add nomination of the month
Please follow these steps to add nomination to [contributors page](https://falco.org/community/contributors/#nominate-the-next-contributor-of-the-month):
1. Fork [Falco](https://github.com/falcosecurity/falco-website) repository
2. Add new information to [nominations file](https://github.com/falcosecurity/falco-website/blob/master/data/nominations.yaml) at the bottom of the file after the last element using template below
```
- month: May
  link: https://github.com/falcosecurity/community/issues/166
  open: May 15, 2023
  close: May 24, 2023
  period: May 25, 2023 — May 27, 2023
  announcement: May 28, 2023
```
3. Note: only 3 last month nominations will be shown. Others will be hidden automatically
4. Create pull request to the Falco repository with your changes
