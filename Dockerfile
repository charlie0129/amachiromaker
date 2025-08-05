# Build stage
# Use native code when building.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build

RUN apk add --no-cache make curl

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production=false

COPY public/ ./public/
COPY scripts/ ./scripts/

RUN yarn build-static -j4

COPY . .
RUN yarn build
RUN chmod -R 755 ./build

# Final stage

FROM joseluisq/static-web-server:2.38-alpine

COPY --from=build /usr/src/app/build /public

ENTRYPOINT [ "static-web-server", "--page-fallback=/public/index.html", "--port=80", "--compression=true", "--cache-control-headers=true", "--grace-period=2", "--health=true" ]
