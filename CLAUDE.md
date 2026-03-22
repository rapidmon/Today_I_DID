# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Today I Did** — 일일 활동/성과 기록 앱. React Native + Expo 기반 크로스플랫폼 앱 (iOS, Android, Web).

### 핵심 컨셉 (2026-03-20 확정)

- **기록 → 테트리스 블록 변환**: 사용자가 기록한 활동을 글자 수에 따라 테트리스 블록(O, I, T, L, J, S, Z)으로 변환
- **턴제 테트리스 위젯**: 블록을 버튼(←→↻▼)으로 조작하는 턴제 게임방식 (자동 낙하 X)
- **날짜별 색상**: 같은 날 기록 = 같은 색상 (요일별 7색 순환)
- **성취 시스템**: 줄 클리어 시 해당 줄의 기록들이 성취 카드로 저장됨
- 모든 구현은 [plan.md](./plan.md) 기준으로 진행

---

## 기술 스택

| 항목 | 선택 | 버전 |
|------|------|------|
| 런타임 | Expo | ~55.0.8 |
| UI Framework | React Native | 0.83.2 |
| 라우팅 | Expo Router | ~55.0.7 |
| 클라이언트 상태 | Zustand | ^5.0.12 |
| 서버 상태 | TanStack React Query | ^5.91.3 |
| 스타일링 | NativeWind + Tailwind CSS | 4.2.3, 3.4.19 |
| 언어 | TypeScript (strict mode) | ~5.9.2 |
| 패키지 매니저 | npm | - |

---

## 개발 환경 설정

### 초기 세팅 (처음 한 번만)

```bash
# 의존성 설치
npm install

# Expo 개발 서버 시작
npm start
```

### 개발 명령어

| 명령어 | 용도 |
|--------|------|
| `npm start` | Expo 개발 서버 시작 (모든 플랫폼 선택 가능) |
| `npm run android` | Android 에뮬레이터/기기에서 앱 실행 |
| `npm run ios` | iOS 시뮬레이터/기기에서 앱 실행 |
| `npm run web` | 웹 브라우저에서 앱 실행 |

---

## 프로젝트 구조

```
app/                    # Expo Router 페이지 (파일 기반 라우팅)
├── _layout.tsx         # 루트 레이아웃
└── index.tsx           # 홈 페이지

components/             # UI 컴포넌트
├── ui/                 # 순수 UI 컴포넌트 (버튼, 카드 등)
└── layout/             # 레이아웃 컴포넌트 (헤더, 네비게이션 등)

hooks/                  # 커스텀 훅

lib/                    # 유틸리티 함수

stores/                 # Zustand 상태 관리

types/                  # TypeScript 타입 정의

constants/              # 상수 (색상, 블록 종류 등)

assets/                 # 아이콘, 스플래시 이미지, 폰트 등

android/                # Android 네이티브 코드 (기기 위젯, 네이티브 기능 용)
ios/                    # iOS 네이티브 코드 (위젯 Extension, WidgetKit 용)
```

### 페이지 추가하기 (Expo Router)

Expo Router는 파일 기반 라우팅을 사용합니다. `app/` 폴더 구조가 곧 라우트입니다.

```bash
# app/records/index.tsx 생성 → /records 라우트
# app/records/[id].tsx 생성 → /records/:id 라우트 (동적)
```

---

## 아키텍처 개요

### 상태 관리

**클라이언트 상태 (Zustand)**: 테마, 사용자 설정, UI 상태
```tsx
// stores/useAppStore.ts
import { create } from 'zustand'

export const useAppStore = create((set) => ({
  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}))
```

**서버 상태 (TanStack Query)**: 기록, 성취, API 데이터
```tsx
// API 호출 및 캐싱
const { data, isLoading, error } = useQuery({
  queryKey: ['records'],
  queryFn: async () => { /* API 호출 */ },
})
```

### 스타일링 (NativeWind)

NativeWind는 Tailwind CSS 문법을 React Native로 변환합니다. 클래스명으로 스타일 지정:
```tsx
<View className="bg-slate-900 rounded-lg p-4">
  <Text className="text-white font-bold text-lg">Today I Did</Text>
</View>
```

**주의**: React Native에서는 웹의 모든 CSS가 작동하지 않습니다. `margin`, `padding`, `flexbox` 등 레이아웃 관련 속성만 사용 가능.

---

## 주요 개발 작업

### 기록(Record) 컴포넌트 추가

```tsx
// components/ui/RecordCard.tsx
import { View, Text } from 'react-native'

interface RecordProps {
  text: string
  date: Date
  color: string
}

export const RecordCard = ({ text, date, color }: RecordProps) => {
  return (
    <View className={`bg-${color}-500 rounded-lg p-4`}>
      <Text className="text-white">{text}</Text>
    </View>
  )
}
```

### 테트리스 블록 변환 로직

`lib/blockConverter.ts`에서 글자 수 → 블록 종류 변환:
```tsx
export function convertToBlock(text: string) {
  const length = text.length
  if (length <= 3) return 'O'      // 1x1 정사각형
  if (length >= 19) return 'I'     // 4x1 직선
  // 기타 블록...
}
```

### 성취 시스템 구현

줄 클리어 시 해당 줄의 기록들을 성취 카드로 저장:
```tsx
// stores/useAchievementStore.ts
const addAchievement = (records: Record[]) => {
  set((state) => ({
    achievements: [...state.achievements, { records, date: new Date() }]
  }))
}
```

---

## 네이티브 위젯 개발 (Android/iOS)

### 사전 준비

```bash
# 네이티브 폴더 생성 (처음 한 번만)
npx expo prebuild
```

이후 `android/`, `ios/` 폴더가 생성됩니다.

### Android 위젯

1. **Android Studio**에서 `android/` 폴더 오픈
2. `AppWidgetProvider` 클래스 생성
3. `res/layout/`에 위젯 레이아웃 XML 작성
4. `AndroidManifest.xml`에 위젯 등록
5. 앱 데이터와 공유: SharedPreferences 또는 ContentProvider 사용

### iOS 위젯 (WidgetKit)

1. **Xcode**에서 `ios/` 폴더 오픈
2. File → New → Target → Widget Extension
3. SwiftUI로 위젯 UI 작성
4. App Group으로 앱-위젯 간 데이터 공유 (`UserDefaults(suiteName:)`)

**주의**: `npx expo prebuild`로 기존 네이티브 코드를 덮어쓰지 말 것.

---

## Git 규칙

**⚠️ IMPORTANT: `git push` 절대 금지. 커밋까지만 하고 push는 사용자가 직접 수행.**

커밋 형식:
```
<type>(<scope>): <subject>
```

예:
```
feat(tetris): 블록 변환 로직 구현
fix(ui): 레이아웃 오버플로우 수정
```

---

## 일반적인 문제 해결

### 모듈을 찾을 수 없음 (`Cannot find module`)

**원인**: TypeScript path alias가 제대로 작동하지 않음 또는 파일이 존재하지 않음.
**해결**: `tsconfig.json`의 `paths`를 확인하고, 파일명(대소문자)을 정확하게 확인.

### NativeWind 클래스가 작동하지 않음

**원인**: 캐시 미청소.
**해결**:
```bash
npx expo start --clear
```

### Android 빌드 실패

**원인**: Gradle 캐시, JDK 버전 불일치.
**해결**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

## 참고 문서

- [Expo 공식 문서](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
- [NativeWind](https://nativewind.dev)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query/latest)

---

## Latest Session
- Date: 2026-03-23
- Summary: .claude/context/session-2026-03-23.md
- Status: EAS Build 설정 완료, Android 위젯 git 복원 완료, SafeArea 하단 겹침 수정, iOS 위젯 Xcode 설정 미완료, 미커밋 변경사항 있음
