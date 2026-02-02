# CLAUDE.md - 바야다홈헬스케어 통합 플랫폼 프로젝트

## 프로젝트 개요

바야다홈헬스케어의 디지털 전환을 위한 통합 플랫폼 개발 프로젝트입니다.
- **고객확보 웹사이트**: 서비스 소개, 상담 신청, 블로그, FAQ, 채용
- **강의 플랫폼**: 인프런 스타일 헬스케어 교육 플랫폼
- **시니어 플랫폼**: 서비스 예약, 건강기록, 복약관리, 커뮤니티, 가족연결
- **관리자 시스템**: 모든 플랫폼의 통합 관리

## 기술 스택

- **프론트엔드**: Next.js 15 (App Router)
- **백엔드**: NestJS 10
- **DB**: PostgreSQL 16 + Prisma ORM
- **인증**: JWT (Access + Refresh Token)
- **파일 저장**: AWS S3 + CloudFront
- **결제**: 토스페이먼츠
- **알림**: FCM (푸시), 알리고 (SMS), AWS SES (이메일)

## 기능명세서 동기화 규칙

### 문서 위치
- `docs/client-spec/` - 고객 미팅용 기능명세서
- `docs/functional-spec/` - 개발용 기능명세서

### 코드-문서 매핑표

| 코드 영역 | 관련 문서 (functional-spec) |
|-----------|--------------------------|
| `prisma/schema.prisma` | 01-시스템-개요.md (ERD), 각 도메인 명세서의 데이터 모델 섹션 |
| `src/modules/auth/` | 03-인증-시스템.md |
| `src/modules/consultations/` | 04-고객확보-웹사이트.md (상담 신청) |
| `src/modules/posts/` | 04-고객확보-웹사이트.md (블로그) |
| `src/modules/faqs/` | 04-고객확보-웹사이트.md (FAQ) |
| `src/modules/reviews/` | 04-고객확보-웹사이트.md (고객 후기) |
| `src/modules/recruitments/` | 04-고객확보-웹사이트.md (채용) |
| `src/modules/courses/` | 05-강의-플랫폼.md |
| `src/modules/enrollments/` | 05-강의-플랫폼.md (수강) |
| `src/modules/payments/` | 05-강의-플랫폼.md (결제) |
| `src/modules/patients/` | 06-시니어-플랫폼.md (환자 관리) |
| `src/modules/services/` | 06-시니어-플랫폼.md (서비스 예약) |
| `src/modules/health-records/` | 06-시니어-플랫폼.md (건강 기록) |
| `src/modules/medications/` | 06-시니어-플랫폼.md (복약 관리) |
| `src/modules/admin/` | 07-관리자-시스템.md |
| `src/modules/notifications/` | 08-공통-모듈.md (알림) |
| `src/modules/files/` | 08-공통-모듈.md (파일 업로드) |
| `src/common/guards/` | 02-역할별-권한.md |

### 동기화 규칙

1. **DB 스키마 변경 시**: 해당 도메인 명세서의 "데이터 모델" 섹션과 `01-시스템-개요.md`의 ERD 업데이트
2. **API 엔드포인트 추가/변경 시**: 해당 도메인 명세서의 API 섹션 업데이트
3. **역할/권한 변경 시**: `02-역할별-권한.md`의 권한 매트릭스 업데이트
4. **새 도메인 모듈 추가 시**: 해당 기능명세서 파일 추가 + `00-목차.md` 업데이트
5. **비즈니스 로직 변경 시**: 해당 API의 "비즈니스 로직" 섹션 업데이트
6. **고객 미팅용 문서**: 주요 기능 추가/변경 시 `docs/client-spec/` 관련 문서도 함께 업데이트

## 코딩 컨벤션

### API 설계
- RESTful 컨벤션: kebab-case URL, 복수형 명사
- 버전: `/api/v1/`
- 페이지네이션: `{ data, meta: { total, page, limit, totalPages } }`
- 에러 응답: `{ statusCode, message, errors? }`

### 네이밍
- DB 테이블: PascalCase (Prisma 모델)
- DB 컬럼: camelCase
- API URL: kebab-case
- TypeScript: camelCase (변수/함수), PascalCase (클래스/인터페이스/Enum)

## 기업 정보 자료

`search/` 디렉토리에 바야다홈헬스케어 기업 분석 자료 39개 파일이 있습니다.
콘텐츠 작성이나 서비스 로직 참고 시 활용할 수 있습니다.
