# Today I Did — 프로젝트 계획서

## 1. 프로젝트 개요

**"Today I Did"** — 할 일을 완료하면 위젯에서 테트리스를 즐길 수 있는 앱.

### 핵심 컨셉
- 앱에서 **할 일을 미리 등록** (당일 예약 또는 매일 반복 루틴)
- 할 일을 **완료하면 테트리스 블록 1개 지급** (7종 중 랜덤)
- **미완료 시 페널티** — 당일 자정까지 완료하지 못한 할 일 1개당 테트리스 보드에 회색 페널티 줄 추가
- 같은 **날짜의 완료 기록 → 같은 색상** 블록으로 시각적 구분
- 위젯에서 턴제 테트리스 플레이 (자동 낙하 없음, 버튼 4개로 조작)
- 줄 클리어 시 **반짝 → 희미 → 제거 애니메이션** (연속 이미지 교체 방식)
- 클리어된 줄은 **성취 기록으로 저장** (어떤 기록들이 한 줄을 완성했는지)
- "기록할수록 더 많이 플레이" → 기록 동기부여

---

## 2. 기술 스택

| 항목 | 기술 | 이유 |
|------|------|------|
| 앱 프레임워크 | React Native (Expo) | 크로스 플랫폼, TypeScript 지원 |
| 위젯 (Android) | Kotlin + AppWidgetProvider | 네이티브 위젯 필수 |
| 위젯 (iOS) | Swift + WidgetKit | 네이티브 위젯 필수 |
| DB | AsyncStorage (로컬) | 단순, 빠름, 서버 불필요 |
| 상태관리 | Zustand | 게임 상태, 블록 재고 관리 |
| 서버 상태 | 없음 (로컬 전용) | AsyncStorage로 충분 |
| CSS | NativeWind | Tailwind 문법으로 React Native 스타일링 |

---

## 3. 핵심 기능 상세

### 3-1. 할 일 관리 시스템 (앱)

할 일은 **사전 등록 → 완료 시 블록 지급** 구조.

#### 할 일 종류

| 종류 | 설명 | 생성 방식 |
|------|------|----------|
| **당일 예약** | 특정 날짜에 할 일을 미리 등록 | 사용자가 직접 추가 |
| **루틴** | 매일 자동으로 생성되는 반복 할 일 | 한 번 등록하면 매일 자동 생성 |

#### 할 일 상태 흐름
```
[등록] → [대기 중 (오늘 리스트에 표시)] → [완료 ✅] → 블록 1개 지급
                                      → [미완료 ❌] → 자정 넘기면 페널티
```

#### 날짜 선택 기능 (2026-04-05 추가)
- 할 일 모드에서 **월/일 좌우 화살표** 버튼으로 특정 날짜에 할 일 추가 가능
- **TODAY** 버튼으로 오늘 날짜로 즉시 복귀
- **오늘 이전 날짜 선택 불가** (과거 날짜 화살표 비활성화 + opacity 0.2)
- 연도는 현재 년도 고정
- 일 변경 시 **월 자동 넘김** (1월 31일 +1 → 2월 1일)
- 앱 복귀 시 날짜 선택기를 오늘로 리셋

#### 할 일 수정 기능 (2026-04-05 추가)
- 할 일 항목 **long press** → 인라인 수정 모드 진입
- 텍스트(할 일 내용), 날짜(월/일) 변경 가능
- 삭제 가능 (DELETE 버튼)
- `completed`/`failed` 상태는 **수정 불가**
- 수정 시 날짜는 **오늘 이전 불가**
- **10초 간격 자정 체크**로 날짜 변경 시 수정 모드 자동 종료

#### 미래 날짜 완료 제한 (2026-04-05 추가)
- 오늘 날짜의 할 일만 **완료 처리 가능**
- 미래 날짜 할 일은 해당 날짜가 되어야 완료 가능

#### 루틴 시스템
- 사용자가 루틴 등록 (예: "운동 30분", "영어 공부")
- **요일별 반복 설정**: 루틴마다 특정 요일을 지정 (일~토)
- 해당 요일에 자동으로 할 일 리스트에 추가
- 루틴은 수정/삭제 가능

#### 루틴 수정 기능 (2026-04-05 추가)
- 루틴 칩 **long press** → 요일 수정 모드 진입
- 요일 버튼 7개 토글 + **SAVE/CANCEL/DELETE** 버튼
- 루틴에서 생성된 할 일도 일반 할 일과 동일하게 완료/미완료 처리

#### 할 일 리스트 UI (듀오링고 리그 랭킹 스타일)
오늘의 할 일이 위에서부터 쌓이는 리스트 형태. 각 항목 구성:

```
┌─────────────────────────────────────────┐
│  1  ⬜ 알고리즘 3문제    03.21    [대기] │  ← 미완료 (탭하면 완료)
├─────────────────────────────────────────┤
│  2  ✅ 영어 단어 암기    03.21  [T]     │  ← 완료됨 (블록 지급됨)
├─────────────────────────────────────────┤
│  3  🔄 운동 30분        03.21    [대기] │  ← 루틴에서 생성됨
├─────────────────────────────────────────┤
│  4  ✅ 팀 프로젝트 회의  03.21  [S]     │  ← 완료됨
└─────────────────────────────────────────┘
                                    [🏆]  ← 플로팅 버튼
```

- 번호: 순서
- 체크 상태: ⬜ 대기 / ✅ 완료 / 🔄 루틴 표시
- 할 일 이름
- 날짜 (MM.DD)
- 블록: 완료 시 생성된 블록 종류 / 미완료 시 [대기]

#### 완성 라인 팝업
- 화면 우하단 🏆 플로팅 버튼
- 탭하면 완성된 라인 목록을 모달/바텀시트로 표시
- 각 라인: 구성 기록 목록 + 날짜 범위 + 점수

### 3-2. 블록 생성 규칙

- **할 일 완료 시** → 7종 블록(I, O, T, S, Z, J, L) 중 **랜덤 1개** 지급
- 블록은 큐에 쌓이며, 위젯에서 순서대로 사용
- 할 일을 등록만 하고 완료하지 않으면 블록 미지급

### 3-3. 미완료 페널티 시스템

당일 자정(00:00)까지 완료하지 못한 할 일에 대해 테트리스 보드에 페널티 적용:

```
페널티 줄 구조 (10칸 중 9칸이 회색, 1칸이 빈칸):
██ ██ ██ ██ ██ ·· ██ ██ ██ ██
                ↑ 랜덤 위치에 1칸 빈칸
```

- 미완료 할 일 **1개당 페널티 줄 1줄** 추가
- 페널티 줄은 **보드 맨 아래에서 올라옴** (기존 블록들을 위로 밀어올림)
- 페널티 줄 색상: **회색 (#666688)** — 일반 블록과 구분
- 빈 칸 위치: 랜덤 (1~10칸 중 하나)
- 페널티 줄의 빈 칸을 채우면 줄 클리어 가능 (구제 가능)
- 페널티로 블록이 천장까지 밀려나면 게임 오버

#### 페널티 체크 타이밍
- 앱 실행 시 전날 미완료 할 일 체크
- 미완료 개수만큼 페널티 줄을 SharedPreferences의 pendingPenalties에 저장
- 위젯 새로고침(🔄) 시 pendingPenalties를 보드에 적용

### 3-4. 블록 색상

- 블록 생성 시 7색 팔레트 중 **랜덤 1색** 배정
- 색상 팔레트: 🔴 🟠 🟡 🟢 🔵 🟣 🩷
- 보드에 다양한 색상이 섞여 시각적으로 풍부

### 3-5. 턴제 테트리스 위젯

#### 게임 규칙
- 표준 테트리스 규칙 기반 (10칸 x 20칸 그리드)
- **블록이 자동 낙하하지 않음** — 플레이어가 ▼ 버튼으로 한 칸씩 내림
- ← → 이동, ↻ 회전은 **무제한**
- ▼ 버튼을 눌러 한 칸씩 내리면서 원하는 위치에 배치
- 블록이 더 이상 내려갈 수 없으면 (바닥 또는 다른 블록 위) → 배치 확정
- 줄이 완성되면 클리어 애니메이션 후 제거 + 점수 획득
- 블록 재고가 0이면 → "할 일을 기록하세요!" 메시지 표시
- 게임 오버: 블록이 천장까지 쌓이면 종료 → 점수 기록 후 리셋

#### 위젯 UI 구성 (v2 — 2026-03-23 리디자인)
```
┌────────────────────────────────┐
│  [🔃새로고침]      [🔅투명도]   │
│                               │
│  ┌──────────┐  ┌──────┐       │
│  │          │  │ NEXT │       │
│  │  테트리스  │  │ ┌──┐ │       │
│  │   게임판   │  │ │■■│ │       │
│  │  (10x12)  │  │ │■ │ │       │
│  │  왼쪽정렬  │  │ └──┘ │       │
│  │          │  ├──────┤       │
│  │          │  │SCORE │       │
│  │          │  │1,240 │       │
│  │          │  ├──────┤       │
│  │          │  │ [+]  │       │
│  └──────────┘  └──────┘       │
│                               │
│    [◀] [▶]    [↻]    [▼]     │
│    좌우이동    회전   아래로     │
└────────────────────────────────┘
```

**레이아웃 구성:**
- **상단 좌**: 🔃 새로고침 버튼 (회전과 구분되는 아이콘)
- **상단 우**: 🔅 투명도 조절 버튼 (탭할 때마다 0%→30%→50%→70% 순환)
- **중앙 좌**: 10x12 게임 그리드 (왼쪽 정렬)
- **중앙 우 패널**:
  - NEXT: 다음 블록 미리보기 (4x4 크기)
  - SCORE: 현재 점수 표시
  - [+]: 앱 열기 버튼
- **하단**: 조작 버튼 — [◀][▶] 좌우이동 / [↻] 회전 / [▼] 아래로

**반투명 배경:**
- 위젯 배경을 반투명으로 설정하여 기기 배경화면이 비침
- 투명도 단계: 불투명(0%) → 30% → 50% → 70% (4단계 순환)
- 투명도 설정은 SharedPreferences에 저장하여 유지
- 블록/텍스트 가독성을 위해 그리드 영역은 별도의 반투명 오버레이 적용

**아이콘 구분:**
- 새로고침: 🔃 (양방향 화살표) — 데이터 동기화 용도
- 회전: ↻ (단방향 회전 화살표) — 블록 회전 용도

#### 새로고침 버튼 (🔄)
- 앱에서 기록 후 위젯에 블록이 반영 안 될 경우를 대비
- 탭하면 SharedPreferences/UserDefaults에서 최신 블록 큐를 다시 로드
- 위젯 전체 상태를 최신으로 동기화

#### 위젯 동작 원리
1. 버튼 탭 → PendingIntent(Android) / AppIntent(iOS) 발동
2. 백그라운드에서 게임 상태 계산 (이동/회전/한 칸 낙하)
3. 새로운 게임 상태를 비트맵 이미지로 렌더링
4. 위젯 이미지 업데이트
5. 게임 상태는 로컬 저장소(SharedPreferences/UserDefaults)에 저장

#### 줄 클리어 애니메이션 (연속 이미지 교체)
줄이 완성되면 위젯 이미지를 빠르게 연속 교체하여 애니메이션 효과:

```
상태 1 (즉시): 완성된 줄을 밝은 흰색으로 하이라이트
    ↓ (300ms 후 자동 업데이트 — Handler.postDelayed / Timeline)
상태 2: 해당 줄을 흐린 회색으로 페이드
    ↓ (300ms 후 자동 업데이트)
상태 3: 줄 제거 완료 + 윗줄이 한 칸 아래로 내려온 결과
```

- Android: `Handler.postDelayed()`로 300ms 간격 위젯 이미지 교체
- iOS: 타임라인 엔트리를 짧은 간격으로 스케줄링
- 사용자 눈에는 "반짝 → 사라짐 → 내려옴"으로 보임

### 3-6. 점수 시스템

#### 줄 클리어 점수 (NES 테트리스 기반)
동시에 없애는 줄 수에 따라 점수 차등 부여:

| 동시 클리어 줄 수 | 점수 | 라벨 |
|-----------------|------|------|
| 1줄 | 40점 | SINGLE |
| 2줄 | 100점 | DOUBLE |
| 3줄 | 300점 | TRIPLE |
| 4줄 (최대) | 1,200점 | TETRIS |

#### 콤보 보너스
- 연속 줄 클리어 시 **+50점** 추가

#### 일일 활동 보너스
- 매일 하나 이상의 할 일을 완료하면 **+100점** 추가 (하루 1회)
- `applyDailyBonus()` 함수, `dailyBonusDate` 상태로 중복 방지

#### Game Over
- 새 블록이 내려올 공간이 없으면 Game Over
- **보드 전체가 회색으로 변환** + 중앙에 **"GAME OVER"** 텍스트 표시
- 점수 **초기화** (0점으로 리셋)
- **다음 날** 다시 시작 가능 (새 빈 보드로 시작)

#### Game Over 위젯 표시
```
┌─────────────────────┐
│  SCORE: 23     [🔄] │
│  STOCK: 2 블록      │
│                     │
│  ████████████████████ │
│  ████████████████████ │
│  ████ GAME ████████ │
│  ████ OVER ████████ │
│  ████████████████████ │
│  ████████████████████ │
│                     │
│  [←] [↻] [→] [▼]   │
│                     │
└─────────────────────┘
```

### 3-7. 성취 기록 시스템

줄이 클리어되면 해당 줄을 구성했던 기록들이 **성취 카드**로 저장:

```
🏆 라인 클리어 #7
┌──────────────────────────────┐
│  2026.03.19 ~ 2026.03.20    │
│                              │
│  📝 알고리즘 3문제 풀었다 (I블록) │
│  📝 영어 단어 50개 암기 (L블록)  │
│  📝 팀 프로젝트 회의 (T블록)    │
│  📝 운동 30분 (S블록)          │
│  📝 했음 (O블록)               │
│                              │
│  이 기록들이 한 줄을 완성했습니다 │
│  점수: +1                     │
└──────────────────────────────┘
```

- 어떤 기록(블록)들이 모여서 줄을 완성했는지 족보가 남음
- 성취 갤러리에서 과거 클리어 히스토리 전체 확인 가능
- "내 노력들이 합쳐져서 한 줄을 완성했다" → 성취감

### 3-8. 점수 랭킹 (예정)

> 이 기능은 추후 구현 예정

- **Firebase**로 점수 데이터 관리
- Game Over 시 최종 점수를 Firebase에 업로드
- 글로벌/친구 랭킹 보드
- 앱 내 랭킹 화면 추가 예정
- 랭킹 항목: 닉네임, 최종 점수, 총 클리어 줄 수, 달성 날짜

---

## 4. 앱-위젯 간 데이터 통신

### 공유 데이터
```typescript
interface GameState {
  grid: number[][]              // 10x20 그리드 (0: 빈칸, 1~7: 블록 색상ID)
  score: number
  currentPiece: TetrisPiece | null
  currentPosition: { x: number; y: number }
  currentRotation: number
  blockStock: number            // 남은 블록 수
  nextBlockType: BlockType | null
  gameOver: boolean
  lineClears: number            // 총 클리어 줄 수
}

interface TetrisPiece {
  type: BlockType               // I, O, T, S, Z, J, L
  colorId: number               // 날짜 기반 색상 ID
  sourceRecordId: string        // 원본 기록 ID (성취 추적용)
}
```

### 통신 방식
| 플랫폼 | 방법 |
|--------|------|
| Android | SharedPreferences (App Group) — 앱과 위젯이 같은 저장소 접근 |
| iOS | UserDefaults (App Group) — 앱과 위젯이 같은 저장소 접근 |

### 데이터 흐름

#### 할 일 완료 → 블록 생성
```
[앱에서 할 일 완료 탭]
    ↓
[Firestore에 완료 상태 저장]
    ↓
[랜덤 블록 생성 + blockStock += 1]
    ↓
[블록 정보를 SharedPreferences/UserDefaults에 저장]
    ↓
[위젯 강제 업데이트 트리거]
    ↓
[위젯이 새 블록 반영하여 UI 갱신]
```

#### 미완료 → 페널티 줄 추가
```
[자정 경과 또는 앱 실행 시]
    ↓
[전날 미완료 할 일 개수 체크]
    ↓
[미완료 1개당 → pendingPenalties += 1 → SharedPreferences/UserDefaults에 저장]
    ↓
[위젯 새로고침(🔄) 시 pendingPenalties 소비]
    ↓
[페널티 줄(회색 9칸 + 빈칸 1칸)을 보드 하단에 추가 + 기존 블록 위로 밀어올림]
```

---

## 5. 데이터 모델 (Firestore)

### users 컬렉션
```typescript
interface User {
  uid: string
  displayName: string
  email: string
  createdAt: Timestamp
}
```

### tasks 컬렉션 (users/{uid}/tasks)
```typescript
interface Task {
  id: string
  content: string              // 할 일 내용
  date: string                 // 예정 날짜 "2026-03-21"
  status: 'pending' | 'completed' | 'failed'
  isRoutine: boolean           // 루틴에서 생성된 할 일인지
  routineId: string | null     // 원본 루틴 ID (루틴에서 생성된 경우)
  blockType: BlockType | null  // 완료 시 생성된 블록 (미완료면 null)
  createdAt: Timestamp
  completedAt: Timestamp | null
}
```

### routines 컬렉션 (users/{uid}/routines)
```typescript
interface Routine {
  id: string
  content: string              // 루틴 내용 (예: "운동 30분")
  active: boolean              // 활성 상태 (일시정지 가능)
  createdAt: Timestamp
}
```

### achievements 컬렉션 (users/{uid}/achievements)
```typescript
interface Achievement {
  id: string
  type: 'line_clear'
  recordIds: string[]          // 이 줄을 구성한 기록 ID 목록
  score: number                // 획득 점수
  dateRange: {                 // 기록 날짜 범위
    from: string
    to: string
  }
  clearedAt: Timestamp
}
```

### gameStats 문서 (users/{uid}/gameStats/current)
```typescript
interface GameStats {
  highScore: number
  totalLineClears: number
  totalRecords: number
  totalBlocksUsed: number
  longestStreak: number        // 연속 기록 일수
  currentStreak: number
}
```

---

## 6. 디렉토리 구조

```
app/                          # Expo Router 페이지
├── (tabs)/
│   ├── _layout.tsx           # 탭 네비게이션 (RANKING/HOME/HISTORY)
│   ├── index.tsx             # 홈 — 할 일 추가/수정/날짜 선택/루틴 관리/성취 모달
│   ├── ranking.tsx           # 랭킹 화면 (개인 최고 기록)
│   └── history.tsx           # 히스토리 화면 (과거 게임 판 기록)
├── _layout.tsx               # 루트 레이아웃

components/
├── ui/
│   ├── MiniBlock.tsx         # 미니 테트리스 블록 렌더러
│   └── Icons.tsx             # SVG 아이콘 컴포넌트 (Trophy, Home, Chart, Refresh, Star, Skull, ChevronLeft, ChevronRight, Clipboard)
└── layout/

hooks/

lib/
├── tetrisEngine.ts           # 테트리스 게임 로직 (핵심 엔진)
├── colorMapper.ts            # 색상 변환 (랜덤 + 날짜 기반)
└── widgetBridge.ts           # 앱 ↔ 위젯 데이터 통신

types/
├── record.ts                 # Task, Routine, DayOfWeek 타입
└── game.ts                   # GameState, GameHistory, GameHistoryAchievement 타입

stores/
├── gameStore.ts              # Zustand — 게임 상태 (dispatch, addBlock, addPenalties 등)
├── taskStore.ts              # Zustand — 할 일/루틴 (addTask, updateTask, deleteTask, addRoutine, updateRoutine, removeRoutine)
└── historyStore.ts           # Zustand — 히스토리 (addHistory, persist)

constants/
├── tetris.ts                 # 테트리스 상수 (블록 모양, 그리드 10x12, 색상 팔레트 등)
└── homeStyles.ts             # 홈 화면 스타일 (Neon Arcade 디자인 시스템, CRT 모달 등)

android/                      # prebuild 후 생성
├── app/src/main/java/.../
│   ├── widget/
│   │   ├── TetrisWidgetProvider.kt    # 테트리스 위젯 Provider
│   │   ├── TetrisGameEngine.kt       # 테트리스 게임 로직 (Kotlin 포팅)
│   │   └── WidgetRenderer.kt         # 비트맵 렌더링 (Canvas, 글로시 블록)
│   └── bridge/               # React Native 브릿지
└── app/src/main/res/
    ├── layout/widget_tetris.xml   # 위젯 레이아웃
    └── xml/tetris_widget_info.xml # 위젯 메타데이터

ios/                          # prebuild 후 생성
├── TetrisWidget/
│   ├── TetrisWidget.swift         # 위젯 진입점 (WidgetKit)
│   ├── TetrisGameEngine.swift     # 테트리스 게임 로직 (Swift 포팅)
│   └── TetrisIntents.swift        # AppIntent (버튼 액션)
└── TetrisWidgetBridge/       # React Native 브릿지

design-preview.html           # 디자인 프리뷰 (전체 UI 모아보기)
```

---

## 7. 구현 단계

### Phase 1: 프로젝트 초기화 및 기본 앱 구조
1. Expo 프로젝트 초기화 (TypeScript, blank template)
2. NativeWind 설정
3. Firebase 연동 (Auth + Firestore)
4. Expo Router 탭 네비게이션 구성
5. 기본 로그인 화면 구현

### Phase 2: 기록 기능 구현
1. TypeScript 타입 정의 (Record, User, GameState, Achievement)
2. 기록 입력 UI 구현
3. 기록 CRUD (Firestore 연동)
4. 기록 히스토리 화면 구현
5. 기록 저장 시 blockStock 증가 + 랜덤 블록 큐에 추가

### Phase 3: 테트리스 엔진 구현 (TypeScript)
1. 그리드 관리 (10x20 2차원 배열)
2. 블록 정의 (7종: I, O, T, S, Z, J, L — 각 회전 상태)
3. 블록 이동 로직 (좌, 우, 하)
4. 블록 회전 로직 (SRS 회전 시스템 간소화 버전)
5. 충돌 감지 (벽, 바닥, 기존 블록)
6. 블록 배치 확정 (더 이상 아래로 못 내릴 때)
7. 줄 완성 감지
8. 줄 제거 + 윗줄 내림
9. 줄 클리어 시 성취 기록 생성 (해당 줄의 블록 → 원본 기록 매핑)
10. 점수 계산 (1줄=100, 2줄=300, 3줄=500, 4줄=800)
11. 게임 오버 판정
12. 앱 내 미리보기 컴포넌트 (디버깅/테스트용)

### Phase 4: 성취 시스템 구현
1. 줄 클리어 시 Achievement 문서 생성 (Firestore)
2. 성취 갤러리 UI (카드 형태로 클리어 히스토리 표시)
3. 각 성취 카드에 원본 기록 목록 + 날짜 범위 + 점수 표시
4. 게임 통계 화면 (하이스코어, 총 클리어 수, 연속 기록 일수 등)

### Phase 5: 앱-위젯 데이터 브릿지
1. 네이티브 모듈로 SharedPreferences/UserDefaults 접근
2. 앱 → 위젯: blockStock, 블록 큐 변경 시 로컬 저장소에 저장
3. 위젯 → 앱: 게임 상태 변경 시 로컬 저장소에 저장
4. 위젯 강제 업데이트 트리거 구현
5. 줄 클리어 시 성취 데이터 앱으로 전달

### Phase 6: Android 위젯 구현 (Kotlin)
1. `npx expo prebuild`로 android/ 폴더 생성
2. 위젯 레이아웃 작성 (ImageView + Button 4개)
3. AppWidgetProvider 등록 + AndroidManifest 설정
4. 테트리스 게임 엔진 포팅 (TypeScript → Kotlin)
5. 비트맵 렌더링 (Canvas로 10x20 그리드 + 블록 + 색상 그리기)
6. 버튼별 PendingIntent 연결 (←, ↻, →, ▼)
7. SharedPreferences로 게임 상태 저장/로드
8. 줄 클리어 애니메이션 구현
   - Handler.postDelayed()로 300ms 간격 위젯 이미지 3회 교체
   - 상태 1: 흰색 하이라이트 → 상태 2: 회색 페이드 → 상태 3: 제거 완료

### Phase 7: iOS 위젯 구현 (Swift)
1. Xcode에서 Widget Extension 추가
2. WidgetKit + AppIntent 기반 인터랙티브 위젯 (iOS 17+)
3. 테트리스 게임 엔진 포팅 (TypeScript → Swift)
4. SwiftUI로 그리드 렌더링
5. 버튼별 AppIntent 연결 (←, ↻, →, ▼)
6. UserDefaults(App Group)로 게임 상태 저장/로드
7. 줄 클리어 애니메이션 구현
   - 타임라인 엔트리를 300ms 간격으로 스케줄링
8. App Group 설정 (앱-위젯 데이터 공유)

### Phase 8: 통합 테스트 및 마무리
1. 기록 작성 → 블록 생성 → 위젯 반영 플로우 테스트
2. 위젯 게임 플레이 → 상태 유지 테스트
3. 줄 클리어 → 성취 기록 생성 테스트
4. 줄 클리어 애니메이션 타이밍 테스트
5. 게임 오버 → 리셋 플로우 테스트
6. 오프라인 플레이 테스트
7. UI/UX 다듬기
8. 성능 최적화 (위젯 렌더링 속도)

---

## 8. 주요 기술적 고려사항

### 위젯 렌더링 성능
- 위젯 업데이트마다 비트맵을 새로 그리므로 렌더링을 최대한 가볍게 유지
- Android: Canvas 직접 사용, 불필요한 레이어 최소화
- iOS: SwiftUI의 가벼운 뷰 구성

### 게임 엔진 3벌 구현
- 게임 로직을 TypeScript(앱), Kotlin(Android 위젯), Swift(iOS 위젯) 3벌 작성
- **전략**: TypeScript로 로직을 먼저 완성 + 단위 테스트 → 같은 테스트 케이스로 Kotlin/Swift 포팅 검증
- 핵심 로직: 그리드 조작, 충돌 감지, 회전, 줄 완성 판정

### 위젯 크기
- Android: 4x4 셀 크기 위젯 (약 250dp x 250dp)
- iOS: Large 위젯 (364pt x 382pt) 권장
- 버튼 터치 영역 최소 44px 확보 필수

### 줄 클리어 애니메이션 안정성
- 300ms 간격 3회 업데이트는 시스템 부하가 매우 적음
- Android: Handler는 위젯 업데이트에 안정적
- iOS: 타임라인 엔트리는 시스템이 throttle할 수 있으므로 테스트 필수
- 폴백: 애니메이션이 스킵되어도 최종 상태(줄 제거)는 반드시 반영

### 오프라인 지원
- 게임 상태는 로컬 저장소에 저장 → 오프라인에서도 위젯 게임 플레이 가능
- 기록 작성은 Firestore 오프라인 캐시 활용 → 오프라인 기록 후 온라인 시 동기화
- 성취 기록도 로컬 저장 후 온라인 시 동기화

### 블록-기록 매핑 추적
- 각 블록이 어떤 기록에서 생성되었는지 ID로 추적
- 줄 클리어 시 해당 줄의 블록들 → 원본 기록 ID 목록 → 성취 카드 생성
- 기록 삭제 시 이미 사용된 블록/성취는 유지 (데이터 무결성)

---

## 9. 위젯 개선 계획 (2026-03-21)

### 9-1. GAME OVER 시 완전 초기화

**현재 문제**: GAME OVER 후 위젯 새로고침(↻)을 눌러도 SCORE가 0으로 리셋되지 않음

**원인**: `resetGame()`이 SharedPreferences를 clear하지만, 위젯 SCORE 표시가 즉시 갱신되지 않거나, 앱 쪽 Zustand score가 독립적으로 남아있음

**수정 계획**:
1. `resetGame()` 호출 후 `loadState()`에서 score=0 반환 확인
2. 앱 쪽에서도 위젯 리셋 감지 시 Zustand gameState.score도 0으로 동기화
3. 위젯 GAME OVER 화면에서 SCORE: 0, STOCK: 0으로 즉시 표시
4. achievements(성취 기록)는 리셋하지 않고 보존

### 9-2. 위젯 버튼 기능 분리

**현재 문제**: 새로고침 버튼(↻)이 두 가지 역할을 겸함
- 일반 상태: 앱에서 추가한 블록을 위젯에 반영 (동기화)
- GAME OVER 상태: 게임 리셋

사용자 입장에서 같은 버튼이 상황에 따라 다르게 동작하면 혼란 발생

**수정 계획**:

위젯 상단 버튼을 **3개**로 분리:

```
┌──────────────────────────────┐
│ SCORE: 0  STOCK: 3  [+] [↻] │
│                              │
│        (게임 보드)            │
│                              │
│     [◀] [↻] [▶] [▼]        │
└──────────────────────────────┘
```

| 버튼 | 위치 | 기능 |
|------|------|------|
| **[+]** (추가) | 상단 오른쪽 | 탭하면 앱의 할 일 추가 화면으로 이동 |
| **[↻]** (새로고침) | 상단 오른쪽 끝 | 앱에서 추가한 블록을 위젯에 동기화 + 페널티 적용 |

GAME OVER 시에는 **새로고침 버튼 색상이 변경**되어 리셋 버튼임을 시각적으로 알려줌:
```
┌──────────────────────────────┐
│ SCORE: 0  STOCK: 0  [+] [🔴] │  ← ↻ 버튼이 빨간색으로 변경
│                              │
│      ██ GAME OVER ██         │
│                              │
│     [◀] [↻] [▶] [▼]        │
└──────────────────────────────┘
```
- **[↻] 새로고침 버튼**:
  - 일반 상태: 회색 배경 (`#333366`) — 블록 동기화 + 페널티 적용
  - GAME OVER: **초록 배경 (`#00CC00`)** — 게임 리셋 (보드 초기화, SCORE: 0, STOCK: 0)
  - 색상 변화로 "이건 리셋이야"라는 걸 직관적으로 전달
- **[+] 추가 버튼**: 평상시 활성화 (앱 열기) → GAME OVER 시 **비활성화**
- 리셋 후 STOCK에 남아있던 블록도 초기화 → 새로운 게임 시작

### 9-3. 위젯 → 앱 열기 버튼

**목적**: 위젯에서 바로 앱의 할 일 추가 화면을 열 수 있게 함

**구현 계획**:

#### Android 구현
1. **위젯 레이아웃** (`widget_tetris.xml`): 상단에 [+] 버튼 추가
2. **새로운 Action**: `ACTION_OPEN_APP = "com.limheerae.Today_I_did.OPEN_APP"`
3. **AndroidManifest.xml**: OPEN_APP 액션 등록
4. **TetrisWidgetProvider**: `ACTION_OPEN_APP` 수신 시 앱의 MainActivity로 Intent 발생
   ```kotlin
   ACTION_OPEN_APP -> {
       val launchIntent = Intent(context, MainActivity::class.java).apply {
           flags = Intent.FLAG_ACTIVITY_NEW_TASK
       }
       context.startActivity(launchIntent)
   }
   ```
5. **PendingIntent**: `PendingIntent.getActivity()`로 앱 실행 (기존 버튼들은 `PendingIntent.getBroadcast()`)

#### 딥링크 (선택)
- `todayidid://add-task` 스킴으로 앱의 특정 화면 열기
- Expo Router의 딥링크 처리로 할 일 입력에 포커스

### 9-4. 구현 순서

| 순서 | 작업 | 파일 |
|------|------|------|
| 1 | GAME OVER 시 SCORE/STOCK 0 리셋 확인 및 수정 | `TetrisGameEngine.kt`, `TetrisWidgetProvider.kt` |
| 2 | 앱 쪽 score 동기화 | `stores/gameStore.ts`, `app/index.tsx` |
| 3 | 위젯 [+] 버튼 추가 (레이아웃) | `widget_tetris.xml` |
| 4 | OPEN_APP 액션 구현 (앱 열기) | `TetrisWidgetProvider.kt`, `AndroidManifest.xml` |
| 5 | 새로고침/리셋 기능 정리 | `TetrisWidgetProvider.kt` |
| 6 | 테스트: 할 일 추가 → 블록 반영 → 줄 클리어 → GAME OVER → 리셋 전체 플로우 |

---

## 10. 이전 판 블록 보관 (History Tab)

### 10-1. 개요
- 게임이 GAME OVER로 리셋될 때, 해당 판에서 사용한 블록(기록)들을 **히스토리**로 보관
- 앱 내 별도 탭/화면에서 과거 판들을 조회 가능
- 각 판의 최종 점수, 줄 클리어 수, 사용된 블록 목록, 날짜 등 표시

### 10-2. 데이터 구조
```typescript
interface CompletedTask {
  content: string           // 할 일 내용
  blockType: string         // 변환된 블록 종류
  colorId: string           // 블록 색상
  completedAt: number       // 완료 시각
}

interface GameHistory {
  id: string
  endedAt: number           // 게임 종료 시각
  finalScore: number        // 최종 점수
  totalLineClears: number   // 총 줄 클리어 수
  completedTasks: CompletedTask[] // 해당 판에서 완료한 할 일 목록
  achievements: Achievement[] // 해당 판의 성취 기록 (줄 클리어 내역)
  duration: string          // 플레이 기간 (시작일~종료일)
}
```

### 10-3. 동작 흐름
1. GAME OVER → 새로고침(리셋) 버튼 탭
2. 리셋 전 현재 게임 상태를 `gameHistories` 배열에 push
3. AsyncStorage에 영속 저장 (Zustand persist)
4. 보드 초기화 후 새 게임 시작

### 10-4. UI — HISTORY 탭 (`app/(tabs)/history.tsx`)
- 하단 탭 네비게이션의 **HISTORY** 탭 (📊)
- 과거 판 목록 표시 (최신순, FlatList)
- 각 항목 카드:
  - 상단: `GAME #N` + 종료 날짜
  - 중단: 최종 점수 (큰 폰트) + 줄 클리어 수 + 사용 블록 수
  - 펼치면 해당 판의 성취 기록(줄 클리어 내역) 확인 가능
- 히스토리가 없을 때: 빈 상태 안내 메시지

### 10-5. 수정/생성 대상 파일
| 파일 | 작업 |
|------|------|
| `types/game.ts` | `GameHistory` 타입 추가 |
| `stores/historyStore.ts` | **신규** — Zustand + AsyncStorage persist, 히스토리 CRUD |
| `app/(tabs)/history.tsx` | 히스토리 목록 UI (현재 플레이스홀더 → 실제 구현) |
| `lib/widgetBridge.ts` | 리셋 시 히스토리 데이터 수집 (`getGameHistory()`) |
| `app/(tabs)/index.tsx` | 위젯 리셋 감지 시 `historyStore.addHistory()` 호출 |
| `constants/historyStyles.ts` | **신규** — 히스토리 탭 전용 스타일 |

### 10-6. 히스토리 저장 트리거
- **위젯에서 새로고침(리셋) 버튼** 탭 시:
  1. 앱이 포그라운드로 돌아오면 `widgetBridge.isGameOver()` → false 감지 (이전에 true였음)
  2. 리셋 전 게임 상태를 `widgetBridge`에서 수집
  3. `historyStore.addHistory(gameHistory)` 호출
  4. 앱 쪽 `gameStore.resetGame()` 실행

---

## 11. 랭킹 모드

### 11-1. 개요
- 과거 판들의 점수를 기반으로 **개인 랭킹** 표시
- 자기 자신의 역대 최고 기록을 경쟁하는 방식
- 향후 온라인 랭킹(Firebase Leaderboard 등)으로 확장 가능

### 11-2. 랭킹 데이터
- `historyStore`의 `histories` 배열을 점수순 정렬하여 랭킹 산출
- 별도 `RankEntry` 타입 불필요 — `GameHistory[]`를 `finalScore` 기준 정렬로 충분

### 11-3. UI — RANKING 탭 (`app/(tabs)/ranking.tsx`)
- 하단 탭 네비게이션의 **RANKING** 탭 (🏆)
- 상단: 현재 진행 중인 게임 점수 + 예상 순위 표시 (예: "현재 3위 페이스!")
- 랭킹 리스트:
  - 1위~10위까지 점수순 정렬
  - 1위: 🥇, 2위: 🥈, 3위: 🥉 아이콘
  - 각 항목: 순위 + 점수 + 줄 클리어 수 + 날짜
- 랭킹이 없을 때: 빈 상태 안내 메시지

### 11-4. 수정/생성 대상 파일
| 파일 | 작업 |
|------|------|
| `app/(tabs)/ranking.tsx` | 랭킹 목록 UI (현재 플레이스홀더 → 실제 구현) |
| `stores/historyStore.ts` | `getRanking()` 셀렉터 추가 (점수순 정렬) |
| `constants/rankingStyles.ts` | **신규** — 랭킹 탭 전용 스타일 |

### 11-5. 구현 순서 (히스토리 + 랭킹 통합)
| 순서 | 작업 |
|------|------|
| 1 | `types/game.ts`에 `GameHistory` 타입 추가 |
| 2 | `stores/historyStore.ts` 생성 (Zustand + persist) |
| 3 | `lib/widgetBridge.ts`에 히스토리 데이터 수집 함수 추가 |
| 4 | `app/(tabs)/index.tsx`에서 리셋 감지 → 히스토리 저장 로직 |
| 5 | `app/(tabs)/history.tsx` UI 구현 |
| 6 | `app/(tabs)/ranking.tsx` UI 구현 |
| 7 | (선택) Firebase Leaderboard 연동 |

---

## 12. 성취 모달 개선 — 아이콘 + 이름 체계

### 12-1. 플로팅 버튼 아이콘 대안

현재 🏆 트로피 아이콘은 "줄 클리어 기록 보기" 기능과 직관적으로 연결되지 않음.

**대안 후보:**

| 아이콘 | 의미 | 적합도 | 레퍼런스 |
|--------|------|--------|----------|
| 📜 두루마리 | 기록/로그 열람 | ★★★★ | RPG 게임의 퀘스트 로그 |
| ⭐ 별 | 달성/성취 | ★★★★ | 모바일 게임 성취 시스템 (Clash Royale, Cookie Run) |
| 📖 책 | 기록 모음 | ★★★ | 동물의 숲 박물관 도감, 포켓몬 도감 |
| 🎖️ 훈장 | 업적 | ★★★ | Xbox Achievement, Steam Badge |
| 💎 보석 | 보상/수집 | ★★★ | 퍼즐 게임 수집 요소 |
| 📋 클립보드 | 기록 확인 | ★★ | 실용적이지만 게임 느낌 약함 |

**추천: ⭐ 또는 📜** — 게임 느낌을 유지하면서 "모아둔 기록"을 직관적으로 표현

### 12-2. LINE 이름 — 창의적 이름 체계

현재 "LINE #1", "LINE #2"는 단조로움. 다양한 레퍼런스에서 영감을 받은 이름 방식:

#### 방식 A: 명언/책 문구 연동
- 사용자가 좋아하는 책을 설정하면, 줄 클리어마다 해당 책의 문구가 라인 이름이 됨
- 예: 어린왕자 → "사막이 아름다운 건...", "눈에 보이지 않는 게..."
- **구현**: 앱 설정에서 책 선택 → 문구 DB에서 순서대로 할당
- **레퍼런스**: Kindle 하이라이트, 밀리의 서재 명언 카드

#### 방식 C: 날씨/계절 테마
- 클리어한 날짜/시간대에 따라 이름 자동 생성
- 예: 아침 클리어 → "새벽의 한 줄", 비오는 날 → "빗속의 정리"
- **레퍼런스**: 날씨 앱 감성 문구, Forest 앱 나무 이름

---

## 13. 할 일 날짜 선택 기능 (2026-04-05 구현 완료)

### 13-1. 개요
할 일 모드(`task`)에서 특정 날짜에 할 일을 미리 등록할 수 있는 기능.

### 13-2. UI
- 입력란 위에 **월/일 선택기** 표시 (좌우 화살표 + 현재 날짜)
- `[◀] 4월 [▶]  [◀] 5일 [▶]` 형태
- **TODAY** 버튼으로 오늘 날짜로 즉시 복귀
- 오늘이 아닌 날짜 선택 시 TODAY 버튼이 하이라이트(노란색)

### 13-3. 제약사항
- **오늘 이전 날짜 선택 불가** (과거 날짜로 이동 시 버튼 disabled + opacity 0.2)
- **연도는 현재 년도 고정** (`currentYear`)
- 일 변경 시 **월 자동 넘김**: 1월 31일에서 +1 → 2월 1일 / 2월 1일에서 -1 → 1월 31일
- 월 변경 시 **1일로 초기화** (해당 월이 오늘 월이면 오늘 일자로)
- **앱 복귀 시** (AppState: background → active) 날짜 선택기를 오늘로 리셋

### 13-4. 구현 파일
- `app/(tabs)/index.tsx` — `selectedMonth`, `selectedDay` 상태 + `changeMonth()`, `changeDay()`, `resetToToday()`
- `components/ui/Icons.tsx` — `ChevronLeftIcon`, `ChevronRightIcon` 추가

---

## 14. 할 일 수정 기능 (2026-04-05 구현 완료)

### 14-1. 개요
등록된 할 일을 인라인으로 수정/삭제할 수 있는 기능.

### 14-2. 진입 방식
- 할 일 항목을 **long press** (0.5초) → 인라인 수정 모드 진입

### 14-3. 수정 가능 항목
| 항목 | 수정 가능 조건 |
|------|--------------|
| 텍스트 (할 일 내용) | `pending` 상태만 |
| 날짜 (월/일) | `pending` 상태만, 오늘 이전 불가 |
| 삭제 | `pending` 상태만 |

### 14-4. 수정 불가 조건
- `completed` (완료됨) 상태 → 수정 불가
- `failed` (실패) 상태 → 수정 불가

### 14-5. 자정 체크
- **10초 간격**으로 자정 체크 (setInterval)
- 날짜가 변경되면 수정 모드 자동 종료 (수정 중 자정 넘길 경우 대비)

### 14-6. 구현
- `editingTaskId`, `editText`, `editMonth`, `editDay` 상태
- `taskStore.updateTask()`, `taskStore.deleteTask()` 사용

---

## 15. 루틴 수정 기능 (2026-04-05 구현 완료)

### 15-1. 개요
등록된 루틴의 요일을 수정하거나 삭제할 수 있는 기능.

### 15-2. 진입 방식
- 루틴 칩을 **long press** → 요일 수정 모드 진입

### 15-3. 수정 UI
- 요일 버튼 7개 (일~토) 토글 방식
- **SAVE** 버튼: 변경된 요일 저장 (`taskStore.updateRoutine()`)
- **CANCEL** 버튼: 수정 취소
- **DELETE** 버튼: 루틴 삭제 (확인 Alert 후 `taskStore.removeRoutine()`)

### 15-4. 구현
- `editingRoutineId`, `editRoutineDays` 상태
- `taskStore.updateRoutine(routineId, { days })`, `taskStore.removeRoutine(routineId)` 사용

---

## 16. 미래 날짜 할 일 완료 제한 (2026-04-05 구현 완료)

- 오늘 날짜의 할 일만 **완료 처리 가능**
- 미래 날짜 (`task.date > todayStr`)에 등록된 할 일은 해당 날짜가 되어야 완료 가능
- 미래 날짜 할 일 탭 시 "해당 날짜에 완료할 수 있습니다" 안내 메시지

---

## 17. 위젯 TODAY 필터 (2026-04-05 구현 완료)

- 위젯의 TODO 영역에는 **오늘 날짜 할 일만 표시**
- `taskStore.subscribe()`에서 `t.date === todayStr`로 필터 적용
- 미래 날짜 할 일은 위젯에 표시하지 않음

---

## 18. 위젯 ALL DONE 표시 (2026-04-05 구현 완료)

- pending 할 일이 0개일 때 TODO 영역에 **"ALL DONE!"** 텍스트 표시
- Android (`TetrisWidgetProvider.kt`) + iOS (`TetrisWidget.swift`) 모두 적용

---

## 19. 위젯 GAME OVER 개선 (2026-04-05 구현 완료)

- GAME OVER 시 **NEXT 블록 클릭 비활성화** (스폰 방지)
- TODO 영역에 **"T_T"** 표시 (픽셀 폰트 스타일, magenta 색상)
- 기존 GAME OVER 그리드 표시 유지

---

## 20. COMPLETED LINES CRT 리디자인 (2026-04-05 구현 완료)

### 20-1. 개요
성취 모달(완성된 라인 팝업)을 **CRT 모니터 스타일**로 전면 리디자인.

### 20-2. 구성 요소
- **CRT 하우징**: 둥근 모서리의 외곽 프레임 (bgElevated 색상)
- **LED 표시등**: 모니터 상단에 녹색/빨간색 LED 인디케이터
- **스크린 영역**: 내부 디스플레이 (스캔라인 효과 오버레이)
- **스캔라인**: 반투명 수평 줄 무늬로 CRT 감성 표현

### 20-3. 라인 카드
- 줄 클리어 수에 따라 **라벨** 차등 표시:
  - 1줄 = `SINGLE`
  - 2줄 = `DOUBLE`
  - 3줄 = `TRIPLE`
  - 4줄 = `TETRIS`
- 줄 수별 **보더 색상** 차등:
  - 1줄 = cyan (`#00F0FF`)
  - 2줄+ = magenta (`#FF00E5`)

### 20-4. 하단 스코어 바
- **LINES**: 총 클리어 줄 수
- **SCORE**: 총 점수
- **TASKS**: 해당 줄에 포함된 할 일 수

### 20-5. 구현 파일
- `constants/homeStyles.ts` — CRT 관련 스타일 추가

---

## 21. 실제 테트리스 점수 시스템 (이전 세션 구현 완료)

### 점수 테이블 (NES 테트리스 기반)
| 동시 클리어 줄 수 | 점수 |
|-----------------|------|
| 1줄 | 40 |
| 2줄 | 100 |
| 3줄 | 300 |
| 4줄 (TETRIS) | 1200 |

- **콤보 보너스**: 연속 클리어 시 +50점
- **일일 활동 보너스**: 매일 할 일 1개 이상 완료 시 +100점 (하루 1회)

### 구현
- `constants/tetris.ts`의 `SCORE_TABLE` 업데이트
- `lib/tetrisEngine.ts`의 `clearLines()` + `applyDailyBonus()` 함수

---

## 22. 페널티 자동 적용 (이전 세션 구현 완료)

- `spawnPiece()` 호출 시 `pendingPenalties > 0`이면 **자동으로 페널티 적용**
- 별도 NEW 버튼이나 새로고침 불필요
- 미완료 할 일 1개당 회색 페널티 줄 1줄 (9칸 회색 + 1칸 빈칸)
- 페널티로 블록이 최상단까지 밀려나면 게임 오버

---

## 23. 디자인 프리뷰 (2026-04-05 업데이트)

`design-preview.html`에 다음 프리뷰 추가:
- 할 일 모드 (날짜 선택기 UI)
- 할 일 수정 UI (인라인 편집)
- 루틴 수정 UI (요일 토글 + SAVE/CANCEL/DELETE)
- CRT 성취 모달
- 위젯 통합 프리뷰 (PLAYING / GAME OVER / ALL DONE)
- GAME OVER TODO "T_T" 표시