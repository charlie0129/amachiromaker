#!/bin/bash

docker-compose \
    --file docker-compose.traefik.yml \
    build || exit 1