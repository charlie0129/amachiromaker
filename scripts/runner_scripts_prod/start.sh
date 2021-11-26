#!/bin/bash

if [ "${DETACH}" = true ]; then
    docker-compose \
        up --detach || exit 1
else
    docker-compose \
        up || exit 1
fi
