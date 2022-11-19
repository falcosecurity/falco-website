```yaml
- macro: remove
  condition: evt.type in (rmdir, unlink, unlinkat)
```