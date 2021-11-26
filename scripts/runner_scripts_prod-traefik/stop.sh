#!/bin/bash

docker-compose \
    --file docker-compose.traefik.yml \
    rm -s -f || exit 1
