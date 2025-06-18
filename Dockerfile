FROM node:22-alpine AS build
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

FROM nginx:1.25-alpine3.18
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80

STOPSIGNAL SIGQUIT
