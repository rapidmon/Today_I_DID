---
name: 루틴 칩 오버플로우 해결안 3종
description: 홈 화면 루틴 섹션이 많아질 때의 UI 해결 패턴 3가지와 각각의 적용 맥락
type: project
---

홈 화면 루틴 모드의 ROUTINES 섹션이 `flex flex-wrap gap-2`로만 구현되어 루틴이 10개 이상일 때 상단을 점유하고 TODAY 리스트를 밀어내는 문제가 있었음. `design-preview.html`에 3가지 해결안을 phone-frame으로 목업.

**Why:** 턴제 테트리스 기반 기록 앱에서 오늘 해야 할 일에 집중하는 철학이 핵심. 루틴 섹션이 화면을 점령하면 앱의 본질인 "오늘 기록"이 약화됨.

**How to apply:**
- 해결안 #01 TODAY FOCUS: 오늘 요일에 해당하는 루틴만 기본 노출 + "ALL (N)" 토글. 루틴이 이미 요일별로 등록되는 이 앱의 데이터 구조와 가장 잘 맞음. 기본 권장안.
- 해결안 #02 HORIZONTAL RUSH: 1줄 가로 스크롤 + 우측 네온 시안 페이드 그라데이션. 네온 아케이드 톤과 시각적 궁합이 좋고 세로 공간 절약. 단점: 가로 스크롤 접근성 주의.
- 해결안 #03 FOLD & EXPAND: 2줄 노출 + "+N MORE" 마젠타 네온 칩 → Bottom Sheet 전체 관리. 기존 PAST 섹션의 접이식 UX 일관성 있음. 루틴 관리가 편함.

각 목업은 홈 화면 루틴 모드 레이아웃을 공유하고 루틴 섹션만 차이를 보여줌. 각 phone-frame 최상단에 `#SOLUTION 01/02/03` 네온 라벨 + 핵심 아이디어 한 줄.

삽입 위치: `design-preview.html`의 첫 번째 HOME 화면(라인 117~408) 직후, "HOME 화면 (할 일 모드 — 날짜 선택)" 섹션 바로 앞.

레퍼런스: Todoist 프로젝트 필터, Habitify 일일 뷰, Instagram Stories 가로 스크롤, YouTube 필터 칩, Gmail 라벨 +N more, Material Design Bottom Sheet.

**후속 (2026-04-18):** Solution 02 채택 후 "칩 자체 가독성이 떨어진다" 피드백. 원인: text-secondary(#8888AA)×bg-card(#1A1A35) 대비 간신히 AA, 12px 스캔 어려움, 상태 구분 불가, X 버튼 노이즈. `design-preview.html`에 3가지 개선안(v.A/v.B/v.C) 추가해 Solution 03 직전에 삽입.
- **v.A STATUS-CODED**: Material Design 3 Filter Chip 패턴. DONE(그린+체크+취소선)/TODAY(시안 네온 글로우+펄스 점)/OTHER(머트 회색) 3상태. 범례는 상단에 DONE N / TODAY N 표시. 앱 컨셉(오늘 집중)과 가장 잘 맞음 — **최종 추천**.
- **v.B HIGH-CONTRAST BOLD**: 배경 #0A0A1A + text-primary(#E8E8FF) 14px semibold = AAA 15.8:1. X 버튼 제거(롱프레스로 편집). 가장 단순/정통적이나 정보 밀도 낮음.
- **v.C TETRIS-CELL GLOW**: 좌측 이모지 아이콘 + 테트리스 3D 베벨 보더. 완료 시 내부에 미니 테트리스 2x2 블록 표시(앱 세계관 연결). 시각적으로 가장 화려하나 이모지 의존성으로 OS별 렌더링 편차 리스크.

핵심 교훈: 다크 네온 테마에서 칩 가독성은 ① 텍스트 대비 7:1 지향(AAA) ② 상태별 색상+아이콘 이중 코딩 ③ 12px → 13~14px 상향 ④ 부가 UI(X버튼)는 노이즈로 간주하고 롱프레스/스와이프로 이관 — 이 4가지가 핵심.
