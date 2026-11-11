# Manual Test: Redirection on stale credentials

## Prerequisites

- Log on
- Restart the app with a new instance secret

```bash
FFS_INSTANCE_SECRET=AnotherValue goscript -dev-main
```

## Steps

**Refresh the page on a logged on view**

You should be redirected to log on again.
