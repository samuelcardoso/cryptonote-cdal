#!/bin/sh -em

# file configuration of supervisord
SUPERVISORD_CONF=/etc/supervisord.conf

# file configuration of mongodb
MONGODB_CONF=/etc/mongod.conf

# create base directory of mongodb
[ ! -d /data ] && mkdir /data
[ ! -d /data/configdb ] && mkdir /data/configdb
[ ! -d /data/db ] && mkdir /data/db

# create base config file of mongodb
if [ ! -f $MONGODB_CONF ]; then
  echo "# mongod.conf" > $MONGODB_CONF
  echo "dbpath=/data/db" >> $MONGODB_CONF
  echo "logpath=/data/mongod.log" >> $MONGODB_CONF
  echo "logappend=true" >> $MONGODB_CONF
  echo "bind_ip=127.0.0.1" >> $MONGODB_CONF
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

[eventlistener:dependentstartup]
command=/usr/bin/supervisord-dependent-startup
autostart=true
events=PROCESS_STATE

[program:mongod]
command=/usr/bin/mongod --config /etc/mongod.conf
user=mongodb
directory=/data
autostart=false
autorestart=true
startsecs=10
dependent_startup=true

[program:node]
command=/usr/local/bin/node /app/src/server.js
directory=/app
autostart=false
autorestart=true
startretries=20
stderr_logfile=/app/log/errors.log
stdout_logfile=/app/log/output.log
dependent_startup=true
dependent_startup_wait_for=mongod:running
EOF

# start supervisord
if [ ! -z "$1" ]; then
  /usr/bin/supervisord --configuration $SUPERVISORD_CONF
  exec "$@"
else
  /usr/bin/supervisord --nodaemon --configuration $SUPERVISORD_CONF
fi
