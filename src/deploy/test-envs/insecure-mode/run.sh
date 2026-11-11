#!/bin/bash

docker compose -f ./src/deploy/test-envs/insecure-mode/docker-compose.yml down
docker compose -f ./src/deploy/test-envs/insecure-mode/docker-compose.yml up
