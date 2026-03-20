# Today I Did — 프로젝트 계획서

## 1. 프로젝트 개요

**"Today I Did"** — 오늘 한 일을 기록하면 위젯에서 테트리스를 즐길 수 있는 앱.

### 핵심 컨셉
- 앱에서 오늘 한 일을 기록하면 **테트리스 블록 1개 지급** (7종 중 랜덤)
- 같은 **날짜의 기록 → 같은 색상** 블록으로 시각적 구분
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
| DB | Firebase Firestore | MVP 단계, 빠른 개발, 실시간 동기화 |
| 인증 | Firebase Auth | 간편 로그인 (Google, Apple) |
| 상태관리 | Zustand | 게임 상태, 블록 재고 관리 |
| 서버 상태 | TanStack Query | 기록 데이터 캐싱/동기화 |
| CSS | NativeWind | Tailwind 문법으로 React Native 스타일링 |

---

## 3. 핵심 기능 상세

### 3-1. 오늘 한 일 기록 (앱)

- 텍스트 입력으로 오늘 한 일 작성
- 기록 1개 저장 시 → 테트리스 블록 1개 지급
- 기록 목록 확인 (날짜별)
- 기록 수정/삭제 (삭제 시 이미 지급된 블록은 회수하지 않음)

#### 기록 리스트 UI (듀오링고 리그 랭킹 스타일)
기록이 위에서부터 쌓이는 리스트 형태. 각 항목 구성:

```
┌──────────────────────────────────┐
│  1   알고리즘 3문제    03.20  [I] │
├──────────────────────────────────┤
│  2   영어 단어 암기    03.20  [T] │
├──────────────────────────────────┤
│  3   팀 프로젝트 회의  03.19  [S] │
├──────────────────────────────────┤
│  4   운동 30분        03.19  [O] │
└──────────────────────────────────┘
                              [🏆]  ← 플로팅 버튼
```

- 번호: 기록 순서
- 한 일 이름: 기록 내용
- 날짜: 기록 날짜 (MM.DD)
- 블록: 생성된 블록 종류 아이콘 (I, O, T, S, Z, J, L)

#### 완성 라인 팝업
- 화면 우하단 🏆 플로팅 버튼
- 탭하면 완성된 라인 목록을 모달/바텀시트로 표시
- 각 라인: 구성 기록 목록 + 날짜 범위 + 점수

### 3-2. 블록 생성 규칙

- 기록 1개 저장 시 → 7종 블록(I, O, T, S, Z, J, L) 중 **랜덤 1개** 지급
- 블록은 큐에 쌓이며, 위젯에서 순서대로 사용

### 3-3. 날짜 → 색상 매핑

- 같은 날 기록한 블록은 같은 색상
- 날짜별로 색상이 순환 (7색 팔레트)
- 보드를 보면 "파란 블록은 월요일에 쌓은 것, 초록은 화요일..." 자연스럽게 구분
- 색상 팔레트 예시: 🔴 🟠 🟡 🟢 🔵 🟣 🩷 (요일별)

### 3-4. 턴제 테트리스 위젯

#### 게임 규칙
- 표준 테트리스 규칙 기반 (10칸 x 20칸 그리드)
- **블록이 자동 낙하하지 않음** — 플레이어가 ▼ 버튼으로 한 칸씩 내림
- ← → 이동, ↻ 회전은 **무제한**
- ▼ 버튼을 눌러 한 칸씩 내리면서 원하는 위치에 배치
- 블록이 더 이상 내려갈 수 없으면 (바닥 또는 다른 블록 위) → 배치 확정
- 줄이 완성되면 클리어 애니메이션 후 제거 + 점수 획득
- 블록 재고가 0이면 → "할 일을 기록하세요!" 메시지 표시
- 게임 오버: 블록이 천장까지 쌓이면 종료 → 점수 기록 후 리셋

#### 위젯 UI 구성
```
┌─────────────────────┐
│  SCORE: 1,240  [🔄] │
│  STOCK: 3 블록      │
│                     │
│     ■               │
│     ■ ■ ← 현재 블록  │
│     ■   (J블록)      │
│                     │
│  ██████████████████  │
│  ██  ████  ████  ██  │
│  ████████████████████ │
│                     │
│  [←] [↻] [→] [▼]   │
│                     │
└─────────────────────┘
```

- 상단: 점수 + 남은 블록 수 + 🔄 새로고침 버튼
- 중앙: 10x20 게임 그리드 (비트맵 이미지로 렌더링)
- 하단: 조작 버튼 4개 (좌, 회전, 우, 아래)

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

### 3-5. 성취 기록 시스템

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
│  점수: +100                   │
└──────────────────────────────┘
```

- 어떤 기록(블록)들이 모여서 줄을 완성했는지 족보가 남음
- 성취 갤러리에서 과거 클리어 히스토리 전체 확인 가능
- "내 노력들이 합쳐져서 한 줄을 완성했다" → 성취감

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
```
[앱에서 기록 작성]
    ↓
[Firestore에 기록 저장]
    ↓
[랜덤 블록 생성 + blockStock += 1]
    ↓
[블록 정보를 SharedPreferences/UserDefaults에 저장]
    ↓
[위젯 강제 업데이트 트리거]
    ↓
[위젯이 새 블록 반영하여 UI 갱신]
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

### records 컬렉션 (users/{uid}/records)
```typescript
interface Record {
  id: string
  content: string              // 오늘 한 일 내용
  blockType: BlockType         // 랜덤 생성된 블록 종류
  createdAt: Timestamp
  date: string                 // "2026-03-20" 형식
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
│   ├── index.tsx             # 홈 — 오늘 한 일 기록
│   ├── history.tsx           # 기록 히스토리
│   ├── achievements.tsx      # 성취 갤러리 (클리어 기록)
│   └── stats.tsx             # 게임 통계
├── _layout.tsx               # 루트 레이아웃
└── login.tsx                 # 로그인 페이지

components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Modal.tsx
├── layout/
│   └── TabBar.tsx
├── record/
│   ├── RecordInput.tsx       # 기록 입력 컴포넌트
│   ├── RecordList.tsx        # 기록 목록 컴포넌트
│   └── BlockStockBadge.tsx    # 남은 블록 수 표시
├── game/
│   └── TetrisBoard.tsx       # 앱 내 테트리스 보드 미리보기
└── achievement/
    ├── AchievementCard.tsx   # 성취 카드 컴포넌트
    └── AchievementList.tsx   # 성취 갤러리 목록

hooks/
├── useRecords.ts             # 기록 CRUD
├── useGameState.ts           # 게임 상태 관리
├── useAchievements.ts        # 성취 기록 조회
└── useAuth.ts                # 인증

lib/
├── firebase.ts               # Firebase 초기화
├── tetrisEngine.ts           # 테트리스 게임 로직 (핵심 엔진)
├── colorMapper.ts            # 날짜 → 색상 변환
└── widgetBridge.ts           # 앱 ↔ 위젯 데이터 통신

types/
├── record.ts
├── game.ts
├── achievement.ts
└── user.ts

stores/
├── gameStore.ts              # Zustand — 게임 상태
└── authStore.ts              # Zustand — 인증 상태

constants/
└── tetris.ts                 # 테트리스 상수 (블록 모양, 그리드 크기, 색상 팔레트 등)

android/                      # prebuild 후 생성
├── app/src/main/java/.../
│   ├── TetrisWidgetProvider.kt    # 테트리스 위젯 Provider
│   ├── TetrisGameEngine.kt       # 테트리스 게임 로직 (Kotlin 포팅)
│   ├── WidgetRenderer.kt         # 비트맵 렌더링 (Canvas)
│   └── LineClearAnimator.kt      # 줄 클리어 애니메이션 (Handler 기반)
└── app/src/main/res/
    ├── layout/widget_tetris.xml   # 위젯 레이아웃 (ImageView + 버튼 4개)
    └── xml/tetris_widget_info.xml # 위젯 메타데이터

ios/                          # prebuild 후 생성
└── TetrisWidget/
    ├── TetrisWidget.swift         # 위젯 진입점 (WidgetKit)
    ├── TetrisGameEngine.swift     # 테트리스 게임 로직 (Swift 포팅)
    ├── TetrisWidgetRenderer.swift # SwiftUI 렌더링
    ├── TetrisIntents.swift        # AppIntent (버튼 액션)
    └── LineClearTimeline.swift    # 줄 클리어 타임라인 스케줄링
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
