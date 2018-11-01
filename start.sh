#!/bin/sh

pm2-runtime start ecosystem.config.js --env $(echo $CONF_TYPE)

#pm2-docker start /mnt/config/${CONF_TYPE}/ecosystem.config.js
