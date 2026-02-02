# Admin 관리 페이지 기능 연결 진행률

## 상태: ✅ 완료

### 공통 컴포넌트 생성
- [x] `SearchFilter` 컴포넌트 — URL searchParams 기반 검색/필터 (재사용 가능)
- [x] `Pagination` 컴포넌트 — URL searchParams 기반 이전/다음 페이지네이션

### 페이지별 구현

#### 강의 관리 (`courses/page.tsx`)
- [x] searchParams로 검색/필터/페이지네이션 연동
- [x] 상태 필터: 공개/초안/보관
- [x] 편집 링크 동작

#### 회원 관리 (`users/page.tsx`)
- [x] searchParams로 검색/필터/페이지네이션 연동
- [x] 역할 필터: 수강생/기관 관리자/관리자
- [x] 이름/이메일 검색
- [x] 상세 링크 연결

#### 주문 관리 (`orders/page.tsx`)
- [x] searchParams로 검색/필터/페이지네이션 연동
- [x] 상태 필터: 대기/확정/취소
- [x] 유형 필터: B2C/B2B (2차 필터)
- [x] 주문번호/고객명 검색
- [x] 상세 링크 연결

#### 기관 관리 (`organizations/page.tsx`)
- [x] searchParams로 검색/페이지네이션 연동
- [x] 기관명 검색
- [x] 통계 카드 실제 데이터 반영
- [x] 상세 링크 연결

#### 청구서 관리 (`invoices/page.tsx`)
- [x] searchParams로 검색/필터/페이지네이션 연동
- [x] 상태 필터: 작성중/발송됨/결제완료/연체
- [x] 청구서번호/기관명 검색
- [x] 항목 필드 실제 데이터 표시 (강의명)
- [x] 상세 링크 연결

### 수정/생성 파일
- `apps/admin/src/components/SearchFilter.tsx` (신규)
- `apps/admin/src/components/Pagination.tsx` (신규)
- `apps/admin/src/app/[locale]/(dashboard)/courses/page.tsx` (수정)
- `apps/admin/src/app/[locale]/(dashboard)/users/page.tsx` (수정)
- `apps/admin/src/app/[locale]/(dashboard)/orders/page.tsx` (수정)
- `apps/admin/src/app/[locale]/(dashboard)/organizations/page.tsx` (수정)
- `apps/admin/src/app/[locale]/(dashboard)/invoices/page.tsx` (수정)
