# Admin 커리큘럼 CRUD 구현 진행률

## 상태: ✅ 완료

### 구현 목록

#### 섹션 관리
- [x] 섹션 추가 — 모달로 제목 입력, `POST /api/v1/courses/{id}/sections`
- [x] 섹션 편집 — 모달로 제목 수정, `PUT /api/v1/courses/{id}/sections/{sectionId}`
- [x] 섹션 삭제 — 삭제 확인 모달, `DELETE /api/v1/courses/{id}/sections/{sectionId}`

#### 레슨 관리
- [x] 레슨 추가 — 모달 (제목, 유형, 영상 URL, 길이, 무료 여부), `POST .../lectures`
- [x] 레슨 편집 — 모달로 기존 데이터 수정, `PUT .../lectures/{lectureId}`
- [x] 레슨 삭제 — 삭제 확인 모달, `DELETE .../lectures/{lectureId}`

#### UI/UX
- [x] 섹션 추가/편집 모달 (Modal 컴포넌트 활용)
- [x] 레슨 추가/편집 모달 (제목, 유형, URL, 길이, 무료체크)
- [x] 삭제 확인 모달 (섹션 삭제 시 하위 레슨 경고)
- [x] 낙관적 UI 업데이트 (즉시 상태 반영)
- [x] 로딩 상태 표시 (Loader2 스피너)

#### 미구현 (추후 개선)
- [ ] Drag & Drop 순서 변경 (reorder API는 준비됨)

### 수정 파일
- `apps/admin/src/app/[locale]/(dashboard)/courses/[id]/edit/page.tsx` (전면 수정)
