#!/bin/bash

# NOTE: This should match the run command in the README.md file
docker run --rm --volume ./:/files --env 'FFS_STORE_ROOT=/files' --publish 8080:8080 catears/ffs

