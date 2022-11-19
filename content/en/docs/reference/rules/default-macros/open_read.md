```yaml
- macro: open_read
  condition: (evt.type=open or evt.type=openat) and evt.is_open_read=true and fd.typechar='f' and fd.num>=0
```