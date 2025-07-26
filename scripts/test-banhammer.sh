#!/bin/sh

BOMBARDIER=./scripts/vendor/bin/bombardier

$BOMBARDIER \
  --method=POST \
  --body='{"username":"admin2","password":"7a79b792-30fe-11f0-96e9-733fee3c6e42"}' \
  --header='Content-Type: application/json' \
  --duration=2m \
  localhost:8080/api/logon