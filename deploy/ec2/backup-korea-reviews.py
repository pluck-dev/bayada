"""Daily private backups for review stores; never copy operational site data."""
import datetime
from pathlib import Path
import re
import subprocess
import time

ROOT=Path('/srv/bayada/backups/reviews')
def main():
 ROOT.mkdir(mode=0o700,parents=True,exist_ok=True)
 raw=subprocess.check_output(['docker','exec','bayada-db-1','psql','-U','postgres','-d','postgres','-Atc','SELECT datname FROM pg_database'],text=True)
 for database in raw.splitlines():
  if not re.fullmatch(r'bayada_korea_reviews|bayada_preview_[a-f0-9]{12}',database):continue
  exists=subprocess.check_output(['docker','exec','bayada-db-1','psql','-U','postgres','-d',database,'-Atc',"SELECT to_regclass('public.\"ReviewFeedback\"') IS NOT NULL"],text=True).strip()
  if exists!='t':continue
  stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ');target=ROOT/(database+'-'+stamp+'.dump');partial=target.with_suffix('.partial')
  with partial.open('xb') as handle:
   partial.chmod(0o600);subprocess.run(['docker','exec','bayada-db-1','pg_dump','-U','postgres','-Fc',database],stdout=handle,check=True)
  with partial.open('rb') as handle:subprocess.run(['docker','exec','-i','bayada-db-1','pg_restore','--list'],stdin=handle,stdout=subprocess.DEVNULL,check=True)
  partial.replace(target)
 for old in ROOT.glob('*.dump'):
  if not old.is_symlink() and old.resolve().parent==ROOT.resolve() and re.fullmatch(r'bayada_(?:korea_reviews|preview_[a-f0-9]{12})-\d{8}T\d{6}Z.dump',old.name) and old.stat().st_mtime<time.time()-14*86400:old.unlink()
 print('Review database backups verified')
if __name__=='__main__':main()
