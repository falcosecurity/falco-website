```yaml
- macro: open_write
  condition: >
    (evt.type=open or evt.type=openat) and
    fd.typechar='f' and
    (evt.arg.flags contains O_WRONLY or
    evt.arg.flags contains O_RDWR or
    evt.arg.flags contains O_CREAT or
    evt.arg.flags contains O_TRUNC)

- macro: package_mgmt_binaries
  condition: proc.name in (dpkg, dpkg-preconfigu, rpm, rpmkey, yum)

- macro: bin_dir
  condition: fd.directory in (/bin, /sbin, /usr/bin, /usr/sbin)

- rule: write_binary_dir
  desc: an attempt to write to any file below a set of binary directories
  condition: evt.dir = < and open_write and not package_mgmt_binaries and bin_dir
  output: "File below a known binary directory opened for writing | user=%user.name command=%proc.cmdline file=%fd.name"
  priority: WARNING
```