# Today I Did

할 일을 완료하면 위젯에서 테트리스를 즐길 수 있는 앱.

## 핵심 컨셉

- **기록 → 테트리스 블록 변환**: 할 일을 완료하면 테트리스 블록(O, I, T, L, J, S, Z)이 생성됨
- **턴제 테트리스 위젯**: 블록을 버튼(◀▶↻▼)으로 조작하는 턴제 방식 (자동 낙하 없음)
- **성취 시스템**: 줄 클리어 시 해당 줄의 기록들이 성취 카드로 저장
- **페널티**: 전날 미완료한 할 일은 페널티 줄로 추가

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | React Native + Expo (~55.0.8) |
| 라우팅 | Expo Router |
| 상태관리 | Zustand + AsyncStorage (영속) |
| 스타일링 | NativeWind (Tailwind CSS for RN) |
| 언어 | TypeScript (strict) |
| Android 위젯 | Kotlin + AppWidgetProvider |
| iOS 위젯 | Swift + WidgetKit |

## 프로젝트 구조

```
app/                    # Expo Router 페이지
├── _layout.tsx         # 루트 레이아웃 (SafeAreaProvider)
└── (tabs)/
    ├── _layout.tsx     # 탭 네비게이션 (RANKING / HOME / HISTORY)
    ├── index.tsx       # 홈 (할 일 추가/수정/날짜 선택/루틴/성취 모달)
    ├── ranking.tsx     # 랭킹 (개인 최고 기록)
    └── history.tsx     # 히스토리 (과거 게임 판 기록)

components/ui/          # UI 컴포넌트
├── MiniBlock.tsx       # 미니 테트리스 블록 렌더러
└── Icons.tsx           # SVG 아이콘 (Trophy, Home, Chart, ChevronLeft/Right 등)

stores/
├── gameStore.ts        # 게임 상태 (Zustand)
├── taskStore.ts        # 할 일/루틴 영속 저장 (Zustand + AsyncStorage)
└── historyStore.ts     # 히스토리 영속 저장 (Zustand + AsyncStorage)

lib/
├── tetrisEngine.ts     # 테트리스 게임 로직 (페널티, 일일 보너스 포함)
├── widgetBridge.ts     # 네이티브 모듈 브릿지
└── colorMapper.ts      # 색상 유틸

constants/
├── tetris.ts           # 블록 모양, 색상, 점수 테이블 (10x12 그리드)
└── homeStyles.ts       # 홈 화면 스타일 (Neon Arcade + CRT 모달)

types/
├── game.ts             # 게임/히스토리 타입 정의
└── record.ts           # 할 일/루틴/DayOfWeek 타입 정의

android/                # Android 네이티브
├── .../widget/         # 테트리스 위젯 (Provider, Engine, Renderer)
└── .../bridge/         # React Native 브릿지

ios/                    # iOS 네이티브
├── TetrisWidget/       # WidgetKit Extension
└── TetrisWidgetBridge/ # React Native 브릿지

design-preview.html     # 디자인 프리뷰 (전체 UI 모아보기)
```

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# Android
npm run android

# iOS
npm run ios

# 웹
npm run web
```

## 빌드 (EAS Build)

```bash
# EAS CLI 설치 및 로그인
npm install -g eas-cli
eas login

# Android APK (테스트)
eas build --platform android --profile preview

# 프로덕션
eas build --platform android --profile production
```

## 위젯 기능

- 10x12 그리드 턴제 테트리스
- 레트로 픽셀아트 스타일 버튼 (3D 베벨)
- 반투명 배경 (0%~80% 투명도 조절)
- NEXT 블록 미리보기
- 글로시 블록 렌더링 (하이라이트 + 그림자)
- GAME OVER 시 픽셀아트 표시 + 리셋 버튼 활성화 + NEXT 비활성화
- TODO 영역: 오늘 날짜 할 일만 표시 (TODAY 필터)
- ALL DONE 표시: pending 할 일 0개 시 "ALL DONE!" 텍스트
- GAME OVER 시 TODO에 "T_T" 표시 (magenta, 픽셀 폰트)

## 점수 시스템

| 동시 클리어 | 점수 | 라벨 |
|------------|------|------|
| 1줄 | 100점 | SINGLE |
| 2줄 | 300점 | DOUBLE |
| 3줄 | 500점 | TRIPLE |
| 4줄 | 700점 | TETRIS |

- 매일 할 일 1개 이상 완료 시 +100점 일일 보너스 (하루 1회)

## 주요 기능

### 할 일 관리
- **할 일 추가**: 텍스트 입력 후 ADD 버튼 (오늘 또는 미래 날짜 지정)
- **날짜 선택**: 월/일 좌우 화살표로 미래 날짜에 할 일 예약 (TODAY 버튼으로 복귀)
- **할 일 수정**: long press → 인라인 편집 (텍스트/날짜 변경, 삭제)
- **미래 할 일 제한**: 오늘 날짜 할 일만 완료 가능

### 루틴 시스템
- **루틴 등록**: 요일별 반복 할 일 설정 (일~토)
- **루틴 수정**: 루틴 칩 long press → 요일 변경/삭제

### 페널티 시스템
- 전날 미완료 할 일 → 페널티 줄(회색 9칸 + 빈칸 1칸)
- spawnPiece 시 자동 적용

### 성취 모달 (CRT 스타일)
- CRT 모니터 디자인 (하우징 + LED + 스캔라인 효과)
- SINGLE/DOUBLE/TRIPLE/TETRIS 라벨
- 줄 수별 보더 색상 차등 (1줄=cyan, 2줄+=magenta)

### 탭 네비게이션
- **RANKING**: 개인 최고 기록 랭킹
- **HOME**: 할 일 관리 + 성취 모달
- **HISTORY**: 과거 게임 판 기록
