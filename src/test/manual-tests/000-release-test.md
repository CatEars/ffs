# Manual Test: Auto Install

## Prerequisites

- A release candidate docker build to test

## Steps

**Automated Tests**

Run

```bash
goscript -run-all-tests
```

and make sure all tests pass

**Manual Tests**

// TODO: Create easy way to build and run release candidate

Run a container from the release candidate with same configuration as during development, but without dev mode enabled.

Run through all manual tests and record a test run in `test/test-runs`.
