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
└── index.tsx           # 홈 화면 (할 일 기록 + 성취 팝업)

components/ui/          # UI 컴포넌트
└── MiniBlock.tsx       # 미니 테트리스 블록 렌더러

stores/
├── gameStore.ts        # 게임 상태 (Zustand)
└── taskStore.ts        # 할 일/루틴 영속 저장 (Zustand + AsyncStorage)

lib/
├── tetrisEngine.ts     # 테트리스 게임 로직
├── widgetBridge.ts     # 네이티브 모듈 브릿지
└── colorMapper.ts      # 색상 유틸

constants/
├── tetris.ts           # 블록 모양, 색상, 점수 테이블
└── homeStyles.ts       # 홈 화면 스타일

types/
├── game.ts             # 게임 타입 정의
└── record.ts           # 할 일/루틴 타입 정의

android/                # Android 네이티브
├── .../widget/         # 테트리스 위젯 (Provider, Engine, Renderer)
└── .../bridge/         # React Native 브릿지

ios/                    # iOS 네이티브
├── TetrisWidget/       # WidgetKit Extension
└── TetrisWidgetBridge/ # React Native 브릿지
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
- GAME OVER 시 픽셀아트 표시 + 리셋 버튼 활성화

## 점수 시스템

| 동시 클리어 | 점수 |
|------------|------|
| 1줄 | 1점 |
| 2줄 | 3점 |
| 3줄 | 5점 |
| 4줄 | 7점 |

- 매일 할 일 1개 이상 완료 시 +1점 보너스
