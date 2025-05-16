```yaml
- rule: create_files_below_dev
  desc: creating any files below /dev other than known programs that manage devices. Some rootkits hide files in /dev.
  condition: (evt.type = creat or evt.arg.flags contains O_CREAT) and proc.name != blkid and fd.directory = /dev and fd.name != /dev/null
  output: "File created below /dev by untrusted program | user=%user.name command=%proc.cmdline file=%fd.name"
  priority: WARNING
```