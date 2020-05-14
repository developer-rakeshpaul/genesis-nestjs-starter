FROM mhart/alpine-node:12.16.1 as dist

RUN apk --no-cache --virtual build-dependencies add \
  openssl \
  python \
  make \
  g++ \
  git

WORKDIR /tmp/
COPY .env package.json package-lock.json tsconfig.json tsconfig.build.json ./
COPY src/ src/
COPY templates/ templates/
RUN npm ci
RUN npm install -g @nestjs/cli
RUN npm run build
RUN npm remove -g @nestjs/cli
RUN apk del build-dependencies

FROM mhart/alpine-node:12.16.1 as node_modules
RUN apk --no-cache --virtual build-dependencies add \
  openssl \
  python \
  make \
  g++ \
  git
WORKDIR /tmp/
COPY package.json package-lock.json ./
RUN npm ci --only=production
RUN apk del build-dependencies

FROM mhart/alpine-node:12.16.1

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz
WORKDIR /usr/local/api
COPY --from=node_modules /tmp/package.json ./package.json
COPY --from=node_modules /tmp/node_modules ./node_modules
COPY --from=dist /tmp/dist ./
COPY --from=dist /tmp/.env ./.env

ENV NODE_ENV production
EXPOSE 4000
CMD dockerize -wait tcp://postgres:5432 -wait tcp://redis:6379 -timeout 6m node main.js