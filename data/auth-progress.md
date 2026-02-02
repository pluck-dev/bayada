# Academy 인증 시스템 구현 진행률

## 상태: ✅ 완료

### 인프라 현황 (기존)
- [x] Prisma User 모델 (email, password bcrypt, role ENUM)
- [x] `@bayada/shared/auth` - `createAuthConfig` 팩토리 함수 (NextAuth v5)
- [x] Academy `src/lib/auth.ts` - NextAuth 설정 (역할 제한 없음)
- [x] Academy `api/auth/[...nextauth]/route.ts` - NextAuth API Route
- [x] Academy `src/lib/api-utils.ts` - `getSession()`, `requireSession()`
- [x] Admin 인증 참고용 완성 구현 존재

### 구현 목록

#### Phase 1: 백엔드 기반
- [x] `UserService.create()` 메서드 추가 (bcryptjs 해싱, 이메일 중복 체크)
- [x] `POST /api/auth/register` API Route 생성
- [x] 시드 데이터에 테스트 유저 추가 (admin + student)

#### Phase 2: 프론트엔드 연동
- [x] 로그인 페이지 - NextAuth `signIn("credentials")` 연동
- [x] 회원가입 페이지 - Register API 호출 + 자동 로그인 연동
- [x] 로그인/회원가입 에러 메시지 UI 추가

#### Phase 3: 인증 보호
- [x] `(protected)` route group으로 dashboard/orders/cart 인증 가드
- [x] `AuthProvider` (SessionProvider) 래퍼 컴포넌트 추가
- [x] Header 컴포넌트 로그인 상태 반영 (유저명 표시, 로그아웃 버튼)
- [x] 모바일 메뉴에도 로그인/로그아웃 분기 적용

---

## 수정된 파일 목록

### 새로 생성
| 파일 | 설명 |
|------|------|
| `apps/academy/src/app/api/auth/register/route.ts` | 회원가입 API (POST) |
| `apps/academy/src/app/[locale]/(protected)/layout.tsx` | 인증 가드 레이아웃 |
| `apps/academy/src/components/AuthProvider.tsx` | NextAuth SessionProvider 래퍼 |

### 수정
| 파일 | 변경 내용 |
|------|-----------|
| `packages/services/src/user/index.ts` | `create()` 메서드 추가 (bcrypt 해싱 + 이메일 중복 체크) |
| `packages/services/package.json` | `bcryptjs` 의존성 추가 |
| `packages/db/package.json` | `bcryptjs` 의존성 추가 (시드용) |
| `packages/db/prisma/seed.ts` | 테스트 유저 2명 추가 |
| `apps/academy/src/lib/services.ts` | `UserService` import + export 추가 |
| `apps/academy/src/app/[locale]/layout.tsx` | `AuthProvider` 래핑 추가 |
| `apps/academy/src/app/[locale]/auth/login/page.tsx` | TODO 제거 → signIn 연동 + 에러 UI |
| `apps/academy/src/app/[locale]/auth/register/page.tsx` | TODO 제거 → API 호출 + 자동 로그인 + 에러 UI |
| `apps/academy/src/components/Header.tsx` | useSession으로 로그인 상태 분기 (유저명/로그아웃) |

### 파일 이동 (URL 변경 없음)
| 이전 | 이후 |
|------|------|
| `[locale]/dashboard/` | `[locale]/(protected)/dashboard/` |
| `[locale]/orders/` | `[locale]/(protected)/orders/` |
| `[locale]/cart/` | `[locale]/(protected)/cart/` |

---

## 테스트 계정
| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| admin@bayada.com | password123 | ADMIN |
| student@bayada.com | password123 | STUDENT |

## 기술 스택
- NextAuth v5 (beta 30) / JWT 전략 / Credentials Provider
- bcryptjs (비밀번호 해싱, salt rounds: 12)
- SessionProvider → useSession (클라이언트 세션 관리)
- Route Group `(protected)` → 서버 사이드 인증 가드

## 이어서 구현할 것 (다음 단계)
1. 비밀번호 찾기 / 재설정 기능
2. 프로필 수정 페이지
3. API Route 인증 보호 강화 (주문/수강 API에 requireSession 적용)
4. 소셜 로그인 (Google, Kakao 등)
