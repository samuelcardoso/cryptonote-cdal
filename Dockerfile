FROM node:9-alpine

ARG VERSION=master
ENV VERSION=${VERSION}

LABEL maintainer="gleisson.assis@gmail.com"
LABEL source="https://github.com/gleissonassis/cryptonote-cdal.git"
LABEL version="${VERSION}"

ADD entrypoint.sh /

COPY LICENSE package.json /app/
COPY src /app/src

RUN mkdir -p /app/logs \
 && echo http://dl-4.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories \
 && apk add --no-cache mongodb make gcc g++ git python py-pip \
 && pip install supervisor \
 && cd /app \
 && npm install --production \
 && chmod +x /entrypoint.sh

WORKDIR /

ENTRYPOINT ["/entrypoint.sh"]
