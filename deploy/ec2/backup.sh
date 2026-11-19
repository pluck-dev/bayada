#!/bin/sh
# 매일 DB 덤프 (cron: 0 4 * * * /srv/bayada/app/deploy/ec2/backup.sh), 14일 보관
set -e
umask 077
cd /srv/bayada/app
STAMP=$(date +%Y%m%d-%H%M)
F=/srv/bayada/backups/bayada-$STAMP.sql.gz
MEDIA=/srv/bayada/backups/korea-media-$STAMP.tar.gz
RAW=$(mktemp /srv/bayada/backups/.bayada-sql.XXXXXX)
trap 'rm -f "$RAW" "$F.partial" "$MEDIA.partial"' EXIT HUP INT TERM
# A failed pg_dump must not be hidden by a successful gzip process.
docker compose -f deploy/ec2/docker-compose.yml --env-file deploy/ec2/.env exec -T db pg_dump -U postgres bayada > "$RAW"
gzip -c "$RAW" > "$F.partial"
gzip -t "$F.partial"
mv "$F.partial" "$F"
# Uploaded Korea CMS files are mutable; the static imported asset bundle is kept per release.
if [ -d /srv/bayada/korea-media ]; then
  tar -C /srv/bayada -czf "$MEDIA.partial" korea-media
  tar -tzf "$MEDIA.partial" > /dev/null
  mv "$MEDIA.partial" "$MEDIA"
fi
find /srv/bayada/backups -name 'bayada-*.sql.gz' -mtime +14 -delete
find /srv/bayada/backups -type f -name 'korea-media-*.tar.gz' -mtime +14 -delete
