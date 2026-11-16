# WordPress 수강 이력 보충 이관

대상 브랜치: `feat/academy-v2`. 관리자 `회원 · 수강 → 회원 상세`에서
수강 현황·수료증·레슨 학습 이력·시험 응시 이력을 확인한다.
조회 권한은 기존 `member.read`를 사용한다.

기존 전체 이관(`import:wp`)은 회원·강의 수정과 시험 기록 삭제가 포함돼 있다.
운영 중 학습 이력 보충에는 `scripts/import-wp-history.ts`를 사용한다.
이 명령은 이미 이관된 회원·강의의 `legacyWpId`로 연결하며 회원·권한·강의·영상·수료증을 변경하지 않는다.
삭제된 회원을 새 계정으로 복원하지 않고 누락 건수로 보고한다.

## 실행

저장소 루트에서 관리자와 같은 환경 파일로 실행한다. 환경 파일을 출력하거나 커밋하지 않는다.

```powershell
# DB 접속 없이 SQL 파싱·원본 건수 확인
pnpm --filter @bayada/db exec tsx scripts/import-wp-history.ts --source=D:/dev/clients/bayada/bestcareacademy-restore/db/dump.sql --source-only

# $sourceOffset에는 원본 DB 세션 시간대를 확인한 값을 지정한다(예: +09:00 또는 +00:00).
# 원본 dump에는 시간대 선언이 없으므로 임의로 결정하지 않는다.
node --env-file=apps/admin/.env.local --import=./packages/db/node_modules/tsx/dist/loader.mjs packages/db/scripts/import-wp-history.ts --source=D:/dev/clients/bayada/bestcareacademy-restore/db/dump.sql "--source-offset=$sourceOffset"

# 위 결과의 대상 DB와 누락·변경 건수를 검토하고 대상 PostgreSQL의 pg_dump 백업을 확보한 뒤 반영
node --env-file=apps/admin/.env.local --import=./packages/db/node_modules/tsx/dist/loader.mjs packages/db/scripts/import-wp-history.ts --source=D:/dev/clients/bayada/bestcareacademy-restore/db/dump.sql "--source-offset=$sourceOffset" --apply
```

기본 실행은 조회만 한다. `--apply`일 때만 하나의 Serializable 트랜잭션으로 반영한다.
동시 변경 충돌 시 전체 롤백되며 다시 조회 후 실행한다. 반영 후 같은 명령을 조회 모드로
다시 실행해 create/update가 모두 0인지 확인한다.

- 수강 진도는 기존 값보다 내리지 않고 기존 수료일을 유지한다.
- 레슨은 원본 완료 시각이 있는 기록만 완료 처리한다. 시청 시간을 만들지 않는다.
- 시험은 이전 이관 데이터와 건별 대응하고 원본 응시 ID 기반 ID로 재실행 중복을 막는다.
  원본 시각이 없는 시험은 고정 기준일로 저장하고 관리자는 `원본 시각 없음`으로 표시한다.
- 기존 시험 기록은 삭제하지 않는다. 이전 이관이 잘못 만든 날짜·완료 상태는 자동 수정하지 않는다.
- 개별 답안 원문은 이 명령의 이관 대상이 아니다. 점수·합격 여부·응시 이력만 연결한다.
- 신규 수료증은 발급하지 않는다. 기존 전체 이관에서 발급된 수료증을 그대로 표시한다.

## 확인된 원본과 서버 대조

2026-10-26 백업 `dump.sql` SHA-256:
`4632ac5ad00244fd5f6362bb47e6a53fb844cd2e95a1e3a2945ca660172ffe28`.
수강 2,237건, 레슨 4,794건, 시험 응시 4,449건을 파싱했다.
2026-11-17 로컬 Docker/WSL은 응답하지 않았으나 실제 EC2 관리자와 DB는 정상 운영 중이었다.
실서버 DB를 읽어 대조한 결과, 연결 가능한 원본 수강 1,476건·레슨 2,324건·시험 응시 2,072건이
모두 이미 이관되어 있었다. 원본 대비 누락 수강·레슨·시험과 낮아진 진도는 각각 0건이다.
삭제 회원 및 현재 강의/레슨 정의에 연결할 수 없는 기록은 이 비교 대상에서 제외했다.
실서버 전체 기록은 수강 1,477건·레슨 2,326건·시험 응시 2,074건·수료증 1,229건이다.
따라서 보충 이관 `--apply`는 실행하지 않았다. 서버 운영 데이터는 조회만 했다.

관리자 코드 배포 대상은 `42a766b`. 전체 앱 배포 표식 `DEPLOYED_COMMIT`은 기존 값을 유지하고
관리자만 배포한 버전은 `/srv/bayada/app/ADMIN_DEPLOYED_COMMIT`에 기록한다.
롤백용 이미지 태그는 `bayada-admin:before-history-42a766b`다.
EC2 관리자 이미지 빌드와 재생성을 완료했고 `ADMIN_DEPLOYED_COMMIT=42a766b`를 확인했다.
Oinzi 바야다 프로필의 로그인된 실제 관리자에서 회원 상세를 열어 수강 46행·레슨 94행·시험 175행·
수료증 46행이 표시됨을 확인했다. 레슨 화면은 캡처로도 확인했고 서버 로그에 요청 오류는 없었다.
별도 로컬 이관 실행을 기다릴 필요 없이 서버 관리자에서 기존 이관 이력을 조회할 수 있다.

롤백: 관리자 조회 코드는 해당 커밋을 revert한다. 데이터 반영 후에는 변경 전 DB 백업을
격리된 DB에 복원해 차이를 확인하고 해당 변경만 복구한다. 운영 중 새 학습 기록이 생긴 DB를
과거 백업으로 통째로 덮어쓰지 않는다.
