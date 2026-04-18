---
name: Today I Did 앱의 비-자명한 동작 사실
description: 코드를 다시 읽지 않아도 빠르게 참고할 수 있는 위젯/태스크/루틴 동작 사실 모음
type: reference
---

이 앱 구현에 관한 비-자명한 동작 사실. UI/UX 자료에 정확히 반영해야 할 항목들이며, 코드가 바뀌면 이 메모리도 업데이트할 것.

**위젯 (Android, `android/.../widget/TetrisWidgetProvider.kt`)**
- 그리드 크기: 10 cols × 12 rows (`COLS=10`, `ROWS=12` in `constants/tetris.ts`)
- 컨트롤 4종: ◀ ▶ ↻ ▼ — 모두 한 칸 단위 동작. ▼는 하드드롭이 아니라 한 칸 낙하.
- 회전: O 블록은 회전 무시.
- 투명도: 5단계 순환 (0% → 20% → 40% → 60% → 80% → 0%). `OPACITY_LEVELS = [255, 204, 153, 102, 51]`.
- NEW 버튼: 평소엔 회색 NOOP. 게임 오버 상태에서만 시안색 활성 → 리셋 트리거.
- 사이드 패널: NEXT(다음 블록) / SCORE / TODO(오늘 미완료 최대 4개, 게임 오버 시 T_T, 모두 완료 시 ALL DONE).

**태스크 (`app/(tabs)/index.tsx`)**
- 입력 모드 토글: 할 일 / 루틴.
- 할 일 모드: 월/일 피커, 과거 날짜 선택 불가.
- 루틴 모드: 7요일 다중 토글. 모든 요일 선택 시 칩에 "매일", 일부만 선택 시 "월·수·금" 형식.
- 완료 동작: 우측 동그라미 탭 → 1초간 초록 ✓ → 미니블록 뱃지로 전환. 동시에 위젯 NEXT 큐로 전송.
- 점수표: SINGLE 100 / DOUBLE 300 / TRIPLE 500 / TETRIS 700 (`SCORE_TABLE`).

**스와이프 / 수정 / 삭제**
- 일반 태스크 스와이프 → [EDIT][🗑] 두 액션.
- 루틴 자동 생성 태스크 스와이프 → [🗑]만. EDIT 미노출 (`!task.isRoutine` 조건).
- 완료된 태스크는 스와이프 자체가 비활성 (`canSwipe = pending && ...`).
- 실패(failed) 태스크 EDIT 불가 (`startEditing`의 가드).
- 루틴 편집은 텍스트 영역 탭으로 진입 (스와이프 X), 우측 ✕는 삭제.
- 루틴 편집 폼은 **요일만 변경 가능** (텍스트 변경 미지원).

**페널티 / GAME OVER / 리셋**
- 자정 후 어제 pending → failed로 변경되며 페널티 누적 (`addPenalties`).
- 게임 오버 시 위젯에서 자동으로 히스토리 저장 (앱이 포그라운드 진입 시 동기화). status는 completed → archived.
- 앱 내 리셋 버튼 없음 — 위젯 NEW 버튼이 유일.

**탭 네비게이션**
- 3탭: RANKING / HOME / HISTORY (`app/(tabs)/_layout.tsx`).
