#!/bin/sh -em

# file configuration of supervisord
SUPERVISORD_CONF=/etc/supervisord.conf

# file configuration of mongodb
MONGODB_CONF=/data/config/mongod.conf

# create base directory of mongodb
[ ! -d /data ] && mkdir /data
[ ! -d /data/config ] && mkdir /data/config
[ ! -d /data/db ] && mkdir /data/db
[ ! -d /data/logs ] && mkdir /data/logs

# create base config file of mongodb
if [ ! -f $MONGODB_CONF ]; then
  echo "# mongod.conf" > $MONGODB_CONF
  echo "dbpath=/data/db" >> $MONGODB_CONF
  echo "logpath=/data/logs/mongod.log" >> $MONGODB_CONF
  echo "logappend=true" >> $MONGODB_CONF
  echo "bind_ip = 127.0.0.1" >> $MONGODB_CONF
fi

# define owner of data
chown -R mongodb.mongodb /data

# create directory log for supervisord
mkdir /var/log/supervisord

# create default configuration for supervisord
cat <<EOF >> $SUPERVISORD_CONF
[unix_http_server]
file=/tmp/supervisor.sock

[supervisord]
logfile=/var/log/supervisord/supervisord.log
logfile_maxbytes=50MB
logfile_backups=10
loglevel=error
pidfile=/var/run/supervisord.pid
minfds=1024
minprocs=200
user=root
childlogdir=/var/log/supervisord/

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock

[program:mongod]
command=/usr/bin/mongod --config /data/config/mongod.conf
user=mongodb
directory=/data
autostart=true
autorestart=true
priority=100

[program:node]
command=/usr/local/bin/node /app/src/server.js
directory=/app
autostart=true
autorestart=true
startretries=20
stderr_logfile=/app/logs/errors.log
stdout_logfile=/app/logs/output.log
priority=200
EOF

# start supervisord
if [ ! -z "$1" ]; then
  /usr/bin/supervisord --configuration $SUPERVISORD_CONF
  exec "$@"
else
  /usr/bin/supervisord --nodaemon --configuration $SUPERVISORD_CONF
fi
