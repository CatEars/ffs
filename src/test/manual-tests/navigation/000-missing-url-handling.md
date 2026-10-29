# Manual Test: Missing URL Handling

## Prerequisites

- None

## Steps

**Navigation**

Open https://localhost:8080/does-not-exist

You are redirected to `/`

Open https://localhost:8080/api/does-not-exist

Open https://localhost:8080/static/css/does-not-exist.css

Both result in HTTP status 404
