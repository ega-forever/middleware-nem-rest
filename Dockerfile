FROM keymetrics/pm2:latest-alpine
ARG CONF_TYPE_ARG
ENV CONF_TYPE=$CONF_TYPE_ARG
ENV NPM_CONFIG_LOGLEVEL warn

RUN apk update && \
    apk add python make g++ git && \
    mkdir /app
COPY . /app
WORKDIR /app
RUN  npm cache verify && npm install
EXPOSE 8080

#CMD pm2-docker start /mnt/config/${NETWORK_TYPE}/ecosystem.config.js

ENTRYPOINT ["./start.sh"]
