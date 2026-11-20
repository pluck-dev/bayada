# 바야다코리아 브랜치 미리보기

- `main` 운영: https://korea.54-116-157-4.sslip.io/
- `feat/renewal` 시안: https://renewal.korea.54-116-157-4.sslip.io/

현재 방식은 **커밋을 지정해 배포하는 브랜치 고정 URL**이다. Git push 자동 배포나 Vercel 연동은 설정하지 않았다.

## 배포

커밋의 Git archive를 `/srv/bayada/releases/<별도 릴리스>/app`에 풀고, 해당 경로의 `deploy/ec2/deploy-korea-preview.py`를 실행한다. `--commit`은 그 archive의 전체 커밋, `--expected-active`는 현재 `/srv/bayada/platform-deployment.json`의 운영 커밋이다.

```sh
python3 deploy/ec2/deploy-korea-preview.py \
  --branch feat/renewal --commit <전체커밋> \
  --host renewal.korea.54-116-157-4.sslip.io \
  --expected-active <현재운영커밋> --phase prepare
# 준비 결과와 후보 상태를 확인한 후 같은 인자로 --phase activate
```

다른 브랜치는 별도 host를 지정한다. 대상 브랜치 코드에도 `KOREA_PREVIEW_BRANCH` 표시/접수 차단 코드가 있어야 하며, 후보 검사에서 이를 확인한다. 브랜치 이름이 같으면 URL·읽기 전용 DB를 유지하고 새 컨테이너로 갱신한다. 후보는 실제 커밋 archive에서 빌드해야 한다.

## 데이터와 운영 분리

- 브랜치 해시별 별도 DB와 SELECT 전용 계정. 운영 DB의 Page SELECT 권한도 검사한다.
- Git에 포함된 공개 게시글만 초기 자료로 사용한다. 운영 회원·접수·결제·설정·SMTP 자격증명은 복제하지 않는다.
- 상담 API는 앱과 프록시에서 차단한다. 조회수도 쓰지 않는다. 관리자 편집 기능은 제공하지 않는다.
- 승인된 공개 정적 에셋만 읽기 전용 마운트한다. 운영 업로드·비공개 파일은 마운트하지 않는다.
- 기존 서버 안에 미리보기 컨테이너를 추가한다. 컨테이너당 메모리 384MB, CPU 0.75 제한이며 브랜치 수에 따라 기존 서버 자원을 사용한다.
- 준비 후 운영 커밋·기존 라우팅이 달라지면 전환을 중단한다. 운영 앱 컨테이너와 배포 매니페스트는 교체하지 않는다.
- `/srv/bayada/previews/<브랜치해시>/runtime.json`은 0600 비밀 파일이다. 저장소·보고서·로그로 내보내지 않는다.

## 복구

릴리스에 저장된 `Caddyfile.preview.previous`와 Caddy 컨테이너의 `/tmp/preview-<브랜치해시>-<커밋8자>-previous`가 전환 직전 설정이다. 그 **명시 경로**를 validate/reload하고 호스트 시작 설정에도 복구한다. 마운트된 `/etc/caddy/Caddyfile`은 오래된 inode일 수 있으므로 직접 reload하지 않는다. 이후 미리보기 컨테이너를 중지한다. DB·정적 파일은 삭제할 필요가 없다.
