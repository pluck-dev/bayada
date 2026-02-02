# 영상 플레이어 + 학습 진행도 추적 구현 진행률

## 상태: ✅ 완료

### 구현 목록

#### Phase 1: 진행도 백엔드 확인 및 연동
- [x] Progress API 확인 (`/api/v1/progress/[lectureId]`) — PUT으로 `completed`, `watchedSec` upsert
- [x] EnrollmentService 진행도 조회 확인 — `updateProgress()` 메서드 정상 동작

#### Phase 2: 강의 시청 페이지 개선
- [x] 영상 플레이어 컴포넌트 (`VideoPlayer.tsx`) — HTML5 video, 플레이스홀더, 5초마다 시청시간 콜백
- [x] 진행도 추적: 강의 완료 버튼 (`LectureActions.tsx`) — PUT API 호출 + 상태 변경
- [x] 사이드바 완료 상태 표시 (`LectureSidebar.tsx`) — CheckCircle 아이콘, 진행률 계산
- [x] 진행률 바 실제 데이터 연동 — `prisma.progress.findMany`로 서버에서 조회

#### Phase 3: 대시보드 연동
- [x] 대시보드 진행도가 실제 데이터 반영 확인 — Dashboard API가 이미 EnrollmentService 사용 중

### 생성/수정 파일
- `apps/academy/src/components/VideoPlayer.tsx` (신규)
- `apps/academy/src/components/LectureSidebar.tsx` (신규)
- `apps/academy/src/components/LectureActions.tsx` (신규)
- `apps/academy/src/app/[locale]/courses/[slug]/lectures/[lectureId]/page.tsx` (전면 수정)
