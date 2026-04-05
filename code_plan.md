# Today I Did — 코드 작업 계획서

> plan.md의 구현 단계(Phase 1~8)를 실제 코딩 작업 단위로 세분화한 문서.
> 각 Step은 하나의 작업 세션에서 완료할 수 있는 단위로 나눔.

---

## Step 1: Expo 프로젝트 초기화

### 작업 내용
```bash
npx create-expo-app@latest . --template blank-typescript
```

### 체크리스트
- [ ] 현재 디렉토리(`.`)에 Expo 프로젝트 생성
- [ ] TypeScript strict 모드 확인 (`tsconfig.json`)
- [ ] 보일러플레이트 정리 (기본 App.tsx 비우기)
- [ ] `npx expo start`로 정상 실행 확인
- [ ] `.gitignore` 확인 (node_modules, .expo 등 포함)

### 산출물
- 빈 Expo 프로젝트가 실행되는 상태

---

## Step 2: NativeWind + Expo Router 설정

### 작업 내용
```bash
npx expo install nativewind tailwindcss
npx expo install expo-router expo-linking expo-constants
```

### 체크리스트
- [ ] NativeWind v4 설치 및 `tailwind.config.js` 생성
- [ ] `babel.config.js`에 NativeWind 프리셋 추가
- [ ] Expo Router 설치 및 `app/` 디렉토리 기반 라우팅 설정
- [ ] `app/_layout.tsx` 루트 레이아웃 생성
- [ ] 탭 네비게이션 구성 (4개 탭)
  - `app/(tabs)/index.tsx` — 홈 (기록 입력)
  - `app/(tabs)/history.tsx` — 기록 히스토리
  - `app/(tabs)/achievements.tsx` — 성취 갤러리
  - `app/(tabs)/stats.tsx` — 게임 통계
- [ ] NativeWind className 적용 테스트
- [ ] `npx expo start --clear`로 캐시 초기화 후 정상 실행 확인

### 산출물
- 4개 탭이 동작하는 빈 앱 (NativeWind 스타일링 적용)

---

## Step 3: TypeScript 타입 정의

### 작업 내용
`types/` 디렉토리에 핵심 타입 선언

### 파일별 내용

**types/game.ts**
```typescript
// 블록 7종
type BlockType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

// 블록 회전 상태 (0, 90, 180, 270도)
type Rotation = 0 | 1 | 2 | 3

// 블록 모양 정의 (4x4 매트릭스 내 좌표)
type BlockShape = { x: number; y: number }[]

// 현재 활성 블록
interface ActivePiece {
  type: BlockType
  rotation: Rotation
  position: { x: number; y: number }
  colorId: number              // 날짜 기반 색상 ID
  sourceRecordId: string       // 원본 기록 ID
}

// 블록 큐 아이템
interface QueuedBlock {
  type: BlockType
  colorId: number
  sourceRecordId: string
}

// 게임 상태
interface GameState {
  grid: number[][]             // 10x20 (0=빈칸, 1~7=색상ID)
  gridRecordIds: (string | null)[][] // 10x20 (각 셀의 원본 기록 ID)
  score: number
  activePiece: ActivePiece | null
  blockQueue: QueuedBlock[]    // 대기 중인 블록 큐
  gameOver: boolean
  totalLineClears: number
  animationState: 'none' | 'highlight' | 'fade' | 'done'
  clearingRows: number[]       // 현재 클리어 중인 줄 인덱스
}

// 게임 액션 (위젯 버튼)
type GameAction = 'move_left' | 'move_right' | 'move_down' | 'rotate'
```

**types/record.ts** (현재 구현)
```typescript
type TaskStatus = 'pending' | 'completed' | 'failed' | 'archived'

interface Task {
  id: string
  content: string
  date: string                 // "2026-03-20"
  status: TaskStatus
  isRoutine: boolean
  routineId: string | null
  blockType: BlockType | null
  colorId: number | null
  createdAt: number
  completedAt: number | null
}

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface Routine {
  id: string
  content: string
  active: boolean
  days: DayOfWeek[]
  createdAt: number
}
```

**types/achievement.ts**
```typescript
interface Achievement {
  id: string
  type: 'line_clear'
  recordIds: string[]
  records: { content: string; blockType: BlockType }[]  // 비정규화
  score: number
  dateRange: { from: string; to: string }
  clearedAt: Timestamp
}
```

**types/user.ts**
```typescript
interface User {
  uid: string
  displayName: string
  email: string
  createdAt: Timestamp
}

interface GameStats {
  highScore: number
  totalLineClears: number
  totalRecords: number
  totalBlocksUsed: number
  longestStreak: number
  currentStreak: number
}
```

### 산출물
- 프로젝트 전체에서 사용할 타입 정의 완료

---

## Step 4: 테트리스 엔진 구현 (핵심)

### 작업 내용
`lib/tetrisEngine.ts` — 순수 함수 기반 테트리스 로직

### 구현 순서

**4-1. 상수 및 블록 정의** (`constants/tetris.ts`)
- 그리드 크기: `COLS = 10`, `ROWS = 20`
- 7종 블록의 4가지 회전 상태별 좌표 배열
- 점수 테이블: 1줄=100, 2줄=300, 3줄=500, 4줄=800
- 색상 팔레트 (7색)
- 블록 초기 스폰 위치: x=3~4, y=0

**4-2. 핵심 함수들** (`lib/tetrisEngine.ts`)
```
createEmptyGrid()        → 빈 10x20 그리드 생성
getAbsoluteCells(type, rotation, position) → 블록의 절대 좌표 배열 반환
canPlace(grid, cells)    → 해당 위치에 블록 배치 가능한지 충돌 감지
moveLeft(state)          → 블록 좌로 1칸 (불가능하면 무시)
moveRight(state)         → 블록 우로 1칸 (불가능하면 무시)
moveDown(state)          → 블록 아래로 1칸 (불가능하면 배치 확정)
rotate(state)            → 블록 90도 회전 (벽킥 간소화 버전)
lockPiece(state)         → 현재 블록을 그리드에 고정
checkLines(grid)         → 완성된 줄 인덱스 배열 반환
clearLines(state)        → 줄 제거 + 윗줄 내림 + 점수 계산
spawnPiece(state)        → 큐에서 다음 블록 꺼내 스폰 (게임 오버 판정 포함)
processAction(state, action) → 액션 받아서 새 GameState 반환 (메인 디스패처)
advanceAnimation(state)  → 애니메이션 상태 전진 (위젯에서 300ms 간격 호출)
```

> 상세 코드 스니펫은 `code_snippets.md` 참고

**4-3. 배치 확정 → 줄 체크 → 클리어 흐름**
```
moveDown() 시 아래로 못 내리면:
  1. lockPiece() → 그리드에 블록 고정
  2. checkLines() → 완성된 줄 확인
  3. 완성된 줄 있으면 → animationState = 'highlight', clearingRows = [줄 번호들]
  4. 없으면 → spawnPiece()로 다음 블록
```

**4-4. 줄 클리어 애니메이션 상태 머신**
```
animationState 흐름:
  'none' → (줄 완성 감지) → 'highlight'
  'highlight' → (300ms 후) → 'fade'
  'fade' → (300ms 후) → 'done'
  'done' → clearLines() 실행 + spawnPiece() → 'none'
```

### 산출물
- 순수 함수 기반 테트리스 엔진 (UI 독립적)
- `processAction(state, action) → newState` 패턴

---

## Step 5: 날짜 → 색상 매퍼

### 작업 내용
`lib/colorMapper.ts`

```typescript
// 요일별 7색 팔레트
const DATE_COLORS = ['#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#0ABDE3', '#C39BD3', '#FF9FF3']

function getColorIdForDate(dateString: string): number {
  // 요일(0~6) 기반 색상 ID 반환
}

function getColorHex(colorId: number): string {
  return DATE_COLORS[colorId]
}
```

### 산출물
- 날짜 → 색상 변환 유틸리티

---

## Step 6: Firebase 연동

### 작업 내용
```bash
npx expo install firebase
```

### 체크리스트
- [ ] Firebase 프로젝트 생성 (콘솔에서)
- [ ] `lib/firebase.ts` — Firebase 초기화
- [ ] Firebase Auth 설정 (Google, Apple 로그인)
- [ ] Firestore 보안 규칙 작성
- [ ] `hooks/useAuth.ts` — 로그인/로그아웃/상태 관리
- [ ] `app/login.tsx` — 로그인 화면 UI
- [ ] `.env.local`에 Firebase 설정값 저장
- [ ] 환경변수 타입 정의 (`types/env.d.ts`)

### 산출물
- Firebase Auth 로그인 동작하는 상태

---

## Step 7: 기록 기능 구현

### 작업 내용

**7-1. hooks/useRecords.ts**
- TanStack Query 기반 기록 CRUD
- `useCreateRecord(content)` → Firestore 저장 + 랜덤 블록 생성 + 큐 추가
- `useRecords(date?)` → 날짜별 기록 조회
- `useDeleteRecord(id)` → 기록 삭제

**7-2. components/record/RecordInput.tsx**
- 텍스트 입력 필드 + 저장 버튼
- 저장 시 블록 생성 피드백 (어떤 블록이 생성되었는지 표시)

**7-3. components/record/RecordList.tsx** (듀오링고 리그 랭킹 스타일)
- 기록이 위에서부터 쌓이는 리스트 UI
- 각 행: 번호 | 한 일 이름 | 날짜(MM.DD) | 블록 종류 아이콘
- 행 사이 구분선, 깔끔한 카드형 레이아웃
- FlatList/ScrollView로 스크롤 가능

**7-4. components/record/RecordItem.tsx**
- 리스트 개별 행 컴포넌트
- 좌측: 번호 (원형 배지)
- 중앙: 한 일 이름 + 날짜
- 우측: 블록 종류 아이콘 (I, O, T, S, Z, J, L)

**7-5. components/achievement/CompletedLinesPopup.tsx**
- 완성된 라인 목록 바텀시트/모달
- 각 라인: 구성 기록 목록 + 날짜 범위 + 점수
- 추후 디자인 요소 추가 예정

**7-6. app/(tabs)/index.tsx**
- RecordInput + RecordList 조합
- 상단에 블록 재고 수 표시 (BlockStockBadge)
- 우하단 🏆 플로팅 버튼 → CompletedLinesPopup 열기

**7-7. app/(tabs)/history.tsx**
- 캘린더 뷰 또는 날짜 리스트로 과거 기록 탐색

### 산출물
- 기록 작성/조회/삭제 동작 + 블록 큐 적재
- 듀오링고 스타일 리스트 UI + 완성 라인 플로팅 버튼/팝업

---

## Step 8: Zustand 게임 스토어

### 작업 내용
`stores/gameStore.ts`

```typescript
interface GameStore {
  gameState: GameState
  dispatch: (action: GameAction) => void
  advanceAnimation: () => void    // 애니메이션 상태 전진
  addBlock: (block: QueuedBlock) => void
  resetGame: () => void
  loadState: () => void           // 로컬 저장소에서 복원
  saveState: () => void           // 로컬 저장소에 저장
}
```

- `dispatch()`가 `processAction()` 호출 후 상태 업데이트
- 상태 변경 시 자동 로컬 저장 (위젯과 공유할 데이터)

### 산출물
- 게임 상태 중앙 관리 스토어

---

## Step 9: 앱 내 테트리스 보드 (디버깅용)

### 작업 내용
`components/game/TetrisBoard.tsx`

- 10x20 그리드를 앱 화면에 렌더링
- 색상별 셀 표시
- 현재 활성 블록 표시
- 하단에 ← ↻ → ▼ 버튼 4개
- 버튼 탭 시 gameStore.dispatch() 호출

### 용도
- 위젯 구현 전에 **앱 내에서 테트리스 엔진을 테스트**
- 게임 로직이 정상 동작하는지 시각적으로 확인
- 이후 위젯 포팅 시 참고용

### 산출물
- 앱에서 플레이 가능한 테트리스 (위젯 전 단계 검증)

---

## Step 10: 성취 시스템 구현

### 작업 내용

**10-1. 줄 클리어 → 성취 생성 로직**
- 테트리스 엔진에서 줄 클리어 시 `gridRecordIds`에서 해당 줄의 기록 ID 추출
- Achievement 문서 생성 → Firestore 저장

**10-2. hooks/useAchievements.ts**
- TanStack Query 기반 성취 조회
- 최신순 정렬

**10-3. components/achievement/**
- `AchievementCard.tsx` — 성취 카드 UI (기록 목록, 날짜 범위, 점수)
- `AchievementList.tsx` — 성취 갤러리

**10-4. app/(tabs)/achievements.tsx**
- 성취 갤러리 페이지

**10-5. app/(tabs)/stats.tsx**
- 게임 통계 (하이스코어, 총 클리어 수, 연속 기록 일수 등)

### 산출물
- 성취 기록 생성/조회 + 갤러리 UI + 통계

---

## Step 11: 앱-위젯 데이터 브릿지

### 작업 내용
`lib/widgetBridge.ts`

- 네이티브 모듈 래퍼 (SharedPreferences / UserDefaults 접근)
- 게임 상태를 JSON 직렬화 → 로컬 저장소에 저장
- 블록 큐 변경 시 위젯 강제 업데이트 트리거
- 위젯에서 변경된 게임 상태를 앱으로 동기화

### 필요 패키지
```bash
npx expo install expo-shared-preferences  # 또는 커스텀 네이티브 모듈
```

### 산출물
- 앱 ↔ 위젯 간 데이터 양방향 동기화

---

## Step 12: Android 위젯 구현 (Kotlin)

### 사전 작업
```bash
npx expo prebuild
```

### 작업 내용 (android/ 폴더)

**12-1. 위젯 레이아웃** (`res/layout/widget_tetris.xml`)
- ImageView (게임 보드 비트맵)
- Button 4개 (←, ↻, →, ▼)
- 🔄 새로고침 버튼 (앱에서 추가한 블록 큐를 최신으로 동기화)
- 점수/블록 수 TextView

**12-2. 위젯 메타데이터** (`res/xml/tetris_widget_info.xml`)
- 위젯 크기: 4x4 셀 (최소 250dp x 250dp)
- 업데이트 주기: 수동 (버튼 탭 시만)
- 리사이즈 허용

**12-3. TetrisGameEngine.kt**
- TypeScript 엔진을 Kotlin으로 1:1 포팅
- 동일한 함수 시그니처 유지

**12-4. WidgetRenderer.kt**
- Canvas + Paint로 10x20 그리드 비트맵 생성
- 셀별 색상 채우기
- 활성 블록 오버레이
- 줄 클리어 상태별 렌더링 (하이라이트/페이드)

**12-5. LineClearAnimator.kt**
- Handler.postDelayed()로 300ms 간격 위젯 업데이트 3회
- highlight → fade → done 순서

**12-6. TetrisWidgetProvider.kt**
- AppWidgetProvider 상속
- onUpdate(): 초기 렌더링
- onReceive(): 버튼 PendingIntent 처리
- 버튼별 액션: ACTION_MOVE_LEFT, ACTION_MOVE_RIGHT, ACTION_ROTATE, ACTION_MOVE_DOWN, ACTION_REFRESH
- SharedPreferences에서 게임 상태 로드/저장

**12-7. AndroidManifest.xml**
- 위젯 provider 등록
- 인텐트 필터 등록

### 산출물
- Android 홈화면에서 동작하는 테트리스 위젯

---

## Step 13: iOS 위젯 구현 (Swift)

### 사전 작업
- Xcode에서 `ios/` 폴더 오픈
- File → New → Target → Widget Extension 추가 (TetrisWidget)
- App Group 설정

### 작업 내용 (ios/TetrisWidget/)

**13-1. TetrisGameEngine.swift**
- TypeScript 엔진을 Swift로 1:1 포팅

**13-2. TetrisWidgetRenderer.swift**
- SwiftUI로 10x20 그리드 렌더링
- 셀별 색상, 활성 블록, 줄 클리어 상태 표현

**13-3. TetrisIntents.swift**
- AppIntent 5개 정의 (MoveLeft, MoveRight, Rotate, MoveDown, Refresh)
- 각 Intent에서 게임 상태 로드 → 액션 실행 → 저장 → 위젯 리로드
- Refresh Intent: 로컬 저장소에서 최신 블록 큐 다시 로드

**13-4. LineClearTimeline.swift**
- 줄 클리어 시 300ms 간격 타임라인 엔트리 3개 스케줄링

**13-5. TetrisWidget.swift**
- 위젯 진입점
- Large 위젯 사이즈
- 인터랙티브 버튼 5개 배치 (iOS 17+) — ←, ↻, →, ▼, 🔄

### 산출물
- iOS 홈화면에서 동작하는 테트리스 위젯

---

## Step 14: 통합 테스트

### 테스트 시나리오

| # | 시나리오 | 확인 사항 |
|---|---------|----------|
| 1 | 기록 작성 → 블록 생성 | 앱에서 기록 저장 시 랜덤 블록이 큐에 추가되는지 |
| 2 | 블록 큐 → 위젯 반영 | 위젯에 새 블록이 나타나는지 |
| 3 | 위젯 조작 | ← → ↻ ▼ 버튼이 정상 동작하는지 |
| 4 | 블록 배치 | 바닥/기존 블록 위에 정확히 고정되는지 |
| 5 | 줄 클리어 | 10칸 꽉 차면 클리어되는지 |
| 6 | 클리어 애니메이션 | 반짝 → 희미 → 제거 3단계가 보이는지 |
| 7 | 성취 기록 | 클리어 시 성취 카드가 생성되는지 |
| 8 | 게임 오버 | 블록이 천장까지 쌓이면 게임 오버 처리되는지 |
| 9 | 블록 재고 0 | 재고 없을 때 "기록하세요" 메시지가 표시되는지 |
| 10 | 오프라인 | 네트워크 없이 위젯 게임이 동작하는지 |
| 11 | 앱↔위젯 동기화 | 위젯에서 변경된 상태가 앱에 반영되는지 |
| 12 | 앱 종료 후 재시작 | 게임 상태가 유지되는지 |

---

## Step 15: UI/UX 마무리

### 작업 내용
- reference/ 폴더 이미지 확인 후 디자인 적용
- 탭바 아이콘 + 스타일링
- 기록 입력 화면 UX 개선 (키보드 대응, 유효성 검사)
- 성취 카드 디자인 다듬기
- 다크모드 지원
- 로딩 상태/에러 상태 처리
- UI/UX 체크리스트 검증 (텍스트 오버플로우, 명도 대비, 클릭 영역, 모바일 레이아웃)
- 접근성 체크리스트 검증

---

## 작업 순서 요약

```
Step 1  → Expo 초기화
Step 2  → NativeWind + Router
Step 3  → 타입 정의
Step 4  → 테트리스 엔진 ⭐ (핵심)
Step 5  → 색상 매퍼
Step 6  → Firebase
Step 7  → 기록 기능
Step 8  → Zustand 스토어
Step 9  → 앱 내 테트리스 보드 (엔진 검증)
Step 10 → 성취 시스템
Step 11 → 앱-위젯 브릿지
Step 12 → Android 위젯 ⭐ (핵심)
Step 13 → iOS 위젯 ⭐ (핵심)
Step 14 → 통합 테스트
Step 15 → UI/UX 마무리
```

핵심 마일스톤:
- **Step 9 완료 시**: 앱에서 테트리스 플레이 가능 (엔진 검증 완료)
- **Step 12 완료 시**: Android 위젯에서 테트리스 플레이 가능
- **Step 13 완료 시**: iOS 위젯에서 테트리스 플레이 가능

---

## Step 16: 할 일 날짜 선택 기능 ✅ (2026-04-05 완료)

### 작업 내용
할 일 모드에서 특정 날짜에 할 일을 미리 등록할 수 있는 날짜 선택기 구현.

### 체크리스트
- [x] 월/일 좌우 화살표 버튼으로 날짜 선택 UI
- [x] TODAY 버튼으로 오늘 날짜 복귀
- [x] 오늘 이전 날짜 선택 불가 (버튼 disabled + opacity 0.2)
- [x] 연도는 현재 년도 고정
- [x] 일 변경 시 월 자동 넘김 (1월 31일 +1 → 2월 1일)
- [x] 월 변경 시 1일로 초기화 (오늘 월이면 오늘 일자로)
- [x] 앱 복귀 시 날짜 선택기 오늘로 리셋
- [x] `ChevronLeftIcon`, `ChevronRightIcon` 아이콘 추가

### 수정 파일
- `app/(tabs)/index.tsx` — `selectedMonth`, `selectedDay`, `changeMonth()`, `changeDay()`, `resetToToday()`
- `components/ui/Icons.tsx` — `ChevronLeftIcon`, `ChevronRightIcon`

---

## Step 17: 할 일 수정 기능 ✅ (2026-04-05 완료)

### 작업 내용
등록된 할 일을 long press로 인라인 수정/삭제.

### 체크리스트
- [x] long press (0.5초) → 인라인 수정 모드 진입
- [x] 텍스트(할 일 내용) 수정
- [x] 날짜(월/일) 수정 (오늘 이전 불가)
- [x] 삭제 기능 (DELETE 버튼)
- [x] `completed`/`failed` 상태는 수정 불가
- [x] 10초 간격 자정 체크 → 날짜 변경 시 수정 모드 자동 종료

### 수정 파일
- `app/(tabs)/index.tsx` — `editingTaskId`, `editText`, `editMonth`, `editDay`
- `stores/taskStore.ts` — `updateTask()`, `deleteTask()`

---

## Step 18: 루틴 수정 기능 ✅ (2026-04-05 완료)

### 작업 내용
루틴 칩 long press로 요일 수정/삭제.

### 체크리스트
- [x] 루틴 칩 long press → 요일 수정 모드 진입
- [x] 요일 버튼 7개 토글
- [x] SAVE 버튼: `taskStore.updateRoutine(routineId, { days })`
- [x] CANCEL 버튼: 수정 취소
- [x] DELETE 버튼: `taskStore.removeRoutine(routineId)` (확인 Alert 후)

### 수정 파일
- `app/(tabs)/index.tsx` — `editingRoutineId`, `editRoutineDays`
- `stores/taskStore.ts` — `updateRoutine()`, `removeRoutine()`

---

## Step 19: 미래 날짜 완료 제한 + 위젯 TODAY 필터 ✅ (2026-04-05 완료)

### 작업 내용
- 오늘 날짜 할 일만 완료 가능 (미래 날짜는 해당 날짜까지 대기)
- 위젯에는 오늘 날짜 할 일만 표시

### 수정 파일
- `app/(tabs)/index.tsx` — 완료 조건에 `task.date === todayStr` 체크 추가
- `stores/taskStore.ts` — subscribe에서 `t.date === todayStr` 필터

---

## Step 20: 위젯 ALL DONE + GAME OVER 개선 ✅ (2026-04-05 완료)

### 작업 내용
- pending 할 일 0개 → TODO 영역에 "ALL DONE!" 표시
- GAME OVER 시 → NEXT 클릭 비활성화, TODO에 "T_T" 표시 (magenta)

### 수정 파일
- `android/.../widget/TetrisWidgetProvider.kt`
- `android/.../widget/WidgetRenderer.kt`
- `ios/TetrisWidget/TetrisWidget.swift`

---

## Step 21: COMPLETED LINES CRT 리디자인 ✅ (2026-04-05 완료)

### 작업 내용
성취 모달을 CRT 모니터 스타일로 전면 교체.

### 체크리스트
- [x] CRT 하우징 + LED + 스크린 + 스캔라인 효과
- [x] 라인 카드에 SINGLE/DOUBLE/TRIPLE/TETRIS 라벨
- [x] 하단 스코어 바 (LINES/SCORE/TASKS)
- [x] 줄 수별 보더 색상 차등 (1줄=cyan, 2줄+=magenta)

### 수정 파일
- `app/(tabs)/index.tsx` — 모달 렌더링 로직
- `constants/homeStyles.ts` — CRT 관련 스타일 추가

---

## 작업 순서 요약 (업데이트)

```
Step 1~15  → 기존 핵심 구현 완료
Step 16 ✅ → 할 일 날짜 선택
Step 17 ✅ → 할 일 수정 (long press)
Step 18 ✅ → 루틴 수정 (long press)
Step 19 ✅ → 미래 날짜 완료 제한 + 위젯 TODAY 필터
Step 20 ✅ → 위젯 ALL DONE + GAME OVER 개선
Step 21 ✅ → COMPLETED LINES CRT 리디자인
```
