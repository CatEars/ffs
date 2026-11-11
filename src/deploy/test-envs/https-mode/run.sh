#!/bin/bash

docker compose -f ./src/deploy/test-envs/https-mode/docker-compose.yml down
docker compose -f ./src/deploy/test-envs/https-mode/docker-compose.yml up
