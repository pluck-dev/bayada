#!/bin/sh
# 매일 DB 덤프 (cron: 0 4 * * * /srv/bayada/app/deploy/ec2/backup.sh), 14일 보관
set -e
cd /srv/bayada/app
F=/srv/bayada/backups/bayada-$(date +%Y%m%d-%H%M).sql.gz
docker compose -f deploy/ec2/docker-compose.yml --env-file deploy/ec2/.env exec -T db pg_dump -U postgres bayada | gzip > "$F"
find /srv/bayada/backups -name 'bayada-*.sql.gz' -mtime +14 -delete
