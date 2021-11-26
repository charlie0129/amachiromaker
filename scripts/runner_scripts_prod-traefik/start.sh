#!/bin/bash

if [ "${DETACH}" = true ]; then
    docker-compose \
        --file docker-compose.traefik.yml \
        up --detach || exit 1
else
    docker-compose \
        --file docker-compose.traefik.yml \
        up || exit 1
fi
