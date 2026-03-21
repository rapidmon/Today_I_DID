# iOS 위젯 설정 가이드

Mac에서 아래 순서대로 진행.

## 1. iOS 네이티브 폴더 생성

```bash
npx expo prebuild --platform ios
```

## 2. Xcode에서 프로젝트 열기

```bash
cd ios
open Today_I_did.xcworkspace
```

## 3. Widget Extension 타겟 추가

1. Xcode → File → New → Target
2. "Widget Extension" 선택
3. Product Name: `TetrisWidget`
4. **Include Configuration App Intent** 체크 해제
5. Finish

## 4. 미리 작성한 Swift 파일 연결

생성된 `TetrisWidget/` 폴더의 기본 파일들을 삭제하고, 아래 파일들로 교체:

- `ios/TetrisWidget/TetrisWidget.swift` → 위젯 진입점
- `ios/TetrisWidget/TetrisGameEngine.swift` → 게임 엔진
- `ios/TetrisWidget/TetrisWidgetRenderer.swift` → SwiftUI 렌더링
- `ios/TetrisWidget/TetrisIntents.swift` → AppIntent 버튼 액션

Xcode에서 TetrisWidget 타겟에 파일 추가: 각 파일을 드래그하거나 File → Add Files to "Today_I_did"

## 5. App Groups 설정

앱 타겟과 위젯 타겟 모두에 App Group을 추가해야 앱↔위젯 데이터 공유 가능.

1. Xcode → 앱 타겟 (Today_I_did) 선택
2. Signing & Capabilities → + Capability → App Groups
3. `group.com.limheerae.TodayIdid` 추가

4. 위젯 타겟 (TetrisWidget) 선택
5. 동일하게 App Groups → `group.com.limheerae.TodayIdid` 추가

## 6. 브릿지 모듈 연결

React Native ↔ UserDefaults 브릿지 파일을 앱 타겟에 추가:

- `ios/TetrisWidgetBridge/TetrisWidgetBridge.swift`
- `ios/TetrisWidgetBridge/TetrisWidgetBridge.m`

앱 타겟(Today_I_did)에 추가 (위젯 타겟 아님).
Bridging Header가 자동 생성 안 되면 수동 생성:

```
// Today_I_did-Bridging-Header.h
#import <React/RCTBridgeModule.h>
```

## 7. iOS 배포 타겟

위젯 타겟의 Deployment Target을 **iOS 17.0** 이상으로 설정.

## 8. Pod Install

```bash
cd ios
pod install
```

## 9. 빌드 & 실행

```bash
npx expo run:ios
```

또는 Xcode에서 직접 빌드 (실기기 연결).

## 10. 위젯 추가

iPhone 홈 화면 길게 누르기 → + 버튼 → "Today I Did" 검색 → 위젯 추가

## 주의사항

- App Group ID는 반드시 `group.com.limheerae.TodayIdid`로 통일
- 위젯과 앱 타겟 모두에 같은 App Group 설정 필수
- TetrisGameEngine.swift는 **양쪽 타겟 모두에 추가** (앱 + 위젯)
- 브릿지 파일은 **앱 타겟에만 추가** (위젯 타겟 아님)
