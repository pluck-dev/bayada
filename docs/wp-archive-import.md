# 기존 아카데미의 남은 운영 자료 이관

2026-11-17, `feat/academy-v2`. 관리자 `/ko/legacy`의 **이전 사이트 자료**에서 조회한다.
게시판별·자료별·상태별 필터, 제목·본문·수료증 코드 검색, 페이지 이동, 상세 조회와 첨부 다운로드를 제공한다.
회원 상세에서는 문항별 답안·기존 수료증 코드로 이동하고 현재 수료증에 연결되는 기존 코드도 함께 표시한다.
후기 관리 화면에도 기존 사이트 후기 링크가 있다. 원래 승인 대기인 후기를 자동 공개하지 않는다.

## 반영 결과

| 자료 | 보존 건수 |
|---|---:|
| 공지사항·학습자료·문의게시판·뉴스룸 | 59 (정상 44, 휴지통 15) |
| 게시판 첨부·이미지 | 53 (첨부 25, 이미지 28) |
| 기존 수료증 코드 | 736 |
| 문항별 시험 답안 | 4,404 |
| 승인 대기 후기 | 2 |
| 기존 소식 / 댓글 / 시험 시간 | 8 / 29 / 28 |
| 원본 수강·레슨·시험 이력 | 11,480 |
| 합계 | 16,799 |

원본 백업 SHA-256: `4632ac5ad00244fd5f6362bb47e6a53fb844cd2e95a1e3a2945ca660172ffe28`.
모든 첨부·이미지 53개를 찾고 SHA-256을 검증했다. 백업 기준일은 2026-10-26이며 이후의 원본 사이트 변경은 포함하지 않는다.
회원·강의 정의에 연결되지 않는 기록도 보존한다. 삭제 계정이나 삭제 강의를 재생성하지 않는다.
기존 코드 646건은 현재 Certificate.legacyCode에 연결했고 나머지 90건은 원본 자료로 보존했다.
현재 수료증 검증 번호(BA-)를 바꾸거나 추가 수료증을 발급하지 않았다.

기존 운영 데이터 건수는 수강 1,477·진도 2,326·시험 응시 2,074·수료증 1,229로 유지됐다.
회원 상태도 승인 54·대기 8·거절 28로 유지됐다. 반영 후 재조회는 create=0, codeUpdates=0,
unchanged=16,799로 확인했다. 원본 인증정보·게시판 비밀번호 해시는 이관 자료에 넣지 않는다.

## 권한·첨부 보관

새 권한 `legacy.read`로 목록·상세·첨부를 모두 보호한다. 기본 접근은 Super Admin만 가능하다.
필요한 운영 역할에는 기존 역할·권한 화면에서 명시적으로 부여한다. 콘텐츠 운영자나 파트너에게 자동 부여하지 않는다.
파일은 `/srv/bayada/legacy-private/files`에 체크섬 기반 파일명으로 보관하고 관리자 컨테이너에만 읽기 전용 마운트한다.
공개 미디어 경로에 복사하지 않는다. `/api/v1/legacy/files/[id]`가 인증·권한·경로를 검사하고
attachment/no-store/nosniff로 제공하며 다운로드를 감사 로그에 남긴다.
게시글은 원본 HTML을 보존하되 화면에는 텍스트로 표시해 원본 스크립트를 실행하지 않는다.
이관 자료의 게시·비공개 상태는 원본 상태이며 학습자 사이트에 자동 게시되는 의미가 아니다.

## 재실행 절차

먼저 외부 위치에 준비한다. 출력 bundle에는 개인정보·답안이 있으므로 Git에 넣지 않는다.

```powershell
pnpm --filter @bayada/db exec tsx scripts/prepare-wp-archive.ts --source=D:/dev/clients/bayada/bestcareacademy-restore/db/dump.sql --uploads=D:/dev/clients/bayada/bestcareacademy-restore/wp-content/uploads --output=D:/bayada-wp-archive
```

준비 명령은 누락 파일·업로드 밖 경로를 허용하지 않는다. 서버로 bundle.json과 files를 옮기고
DB 백업을 만든 뒤 `prisma/legacy-records.sql`을 PostgreSQL 단일 트랜잭션으로 적용한다.
운영에서 적용 전 확보하고 pg_restore --list로 검증한 백업:
`/srv/bayada/backups/pre-wp-archive-20261117.dump`.

관리자 이미지를 새 스키마로 빌드하고 실행한 후 아래 명령을 사용한다.

```sh
docker cp /srv/bayada/app/packages/db/scripts/apply-wp-archive.cjs bayada-admin-1:/app/apply-wp-archive.cjs
docker exec bayada-admin-1 node /app/apply-wp-archive.cjs /legacy-private/bundle.json
docker exec bayada-admin-1 node /app/apply-wp-archive.cjs /legacy-private/bundle.json --apply
docker exec bayada-admin-1 node /app/apply-wp-archive.cjs /legacy-private/bundle.json
```

기본 명령은 조회만 한다. bundle·파일 체크섬, 고유 ID와 기존 코드 충돌을 검사한 뒤
--apply일 때만 하나의 Serializable 트랜잭션으로 보존 자료를 만들고 빈 legacyCode를 채운다.
이미 보존한 원본이 바뀌었으면 덮어쓰지 않고 실패한다. 신규 백업의 변경분은 별도로 대조한다.

## 검증·롤백

테스트 8개, 관리자·이관 도구 타입 검사, 실제 EC2 관리자 이미지 빌드가 통과했다.
실제 로그인된 Oinzi 바야다 프로필에서 게시판 목록·상세·문항별 답안·후기 2건의 승인 대기 상태를 확인했다.
기존 코드가 연결된 회원 상세에서 45개 코드가 표시됨을 확인했다.
PDF 다운로드는 HTTP 200, 1,343,562바이트, SHA-256
`dd98e4867be4541f33303df913f3e6c992daf191b01f8de08636737bfb1707c5`로 원본과 일치했다.
익명 다운로드는 401, 익명 자료 페이지는 로그인으로 이동했다.

롤백 이미지: `bayada-admin:before-full-wp-archive`. 이전 이미지를 다시 실행해도 추가 테이블과
nullable 열은 기존 앱 동작을 바꾸지 않는다. 보존 기록과 연결 코드를 지우지 않고 남겨도 된다.
데이터를 되돌려야 하면 위 백업을 격리 DB에 복원해 차이를 대조한다. 이후 학습 기록이 있는
운영 DB를 과거 백업으로 통째로 덮지 않는다. 공개 파일로 전환하거나 기존 회원 상태를 변경하는
작업은 이 이관에 포함되지 않는다.
