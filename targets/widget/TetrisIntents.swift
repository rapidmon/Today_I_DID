import AppIntents
import WidgetKit

// MARK: - 게임 조작 인텐트

struct MoveLeftIntent: AppIntent {
    static var title: LocalizedStringResource = "왼쪽 이동"
    static var description: IntentDescription = "블록을 왼쪽으로 이동"

    func perform() async throws -> some IntentResult {
        var state = TetrisGameEngine.loadState()
        state = TetrisGameEngine.processAction(state: state, action: "move_left")
        TetrisGameEngine.saveState(state)
        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")
        return .result()
    }
}

struct MoveRightIntent: AppIntent {
    static var title: LocalizedStringResource = "오른쪽 이동"
    static var description: IntentDescription = "블록을 오른쪽으로 이동"

    func perform() async throws -> some IntentResult {
        var state = TetrisGameEngine.loadState()
        state = TetrisGameEngine.processAction(state: state, action: "move_right")
        TetrisGameEngine.saveState(state)
        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")
        return .result()
    }
}

struct RotateIntent: AppIntent {
    static var title: LocalizedStringResource = "회전"
    static var description: IntentDescription = "블록을 회전"

    func perform() async throws -> some IntentResult {
        var state = TetrisGameEngine.loadState()
        state = TetrisGameEngine.processAction(state: state, action: "rotate")
        TetrisGameEngine.saveState(state)
        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")
        return .result()
    }
}

struct MoveDownIntent: AppIntent {
    static var title: LocalizedStringResource = "아래 이동"
    static var description: IntentDescription = "블록을 아래로 이동"

    func perform() async throws -> some IntentResult {
        var state = TetrisGameEngine.loadState()
        state = TetrisGameEngine.processAction(state: state, action: "move_down")
        TetrisGameEngine.saveState(state)

        // 줄 클리어 애니메이션 처리
        if state.animationState == "highlight" {
            // highlight → fade
            state = TetrisGameEngine.advanceAnimation(state: state)
            TetrisGameEngine.saveState(state)
            WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")

            // 약간의 지연 후 fade → clear + spawn
            try? await Task.sleep(nanoseconds: 300_000_000) // 300ms
            state = TetrisGameEngine.loadState()
            state = TetrisGameEngine.advanceAnimation(state: state)
            TetrisGameEngine.saveState(state)
        }

        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")
        return .result()
    }
}

// MARK: - 새로고침 / 리셋

struct RefreshIntent: AppIntent {
    static var title: LocalizedStringResource = "새로고침"
    static var description: IntentDescription = "위젯 동기화 또는 게임 리셋"

    func perform() async throws -> some IntentResult {
        let state = TetrisGameEngine.loadState()

        if state.gameOver {
            // GAME OVER → 리셋
            TetrisGameEngine.resetGame()
        } else {
            // 페널티 적용
            let defaults = UserDefaults(suiteName: TetrisGameEngine.suiteName)
            let pending = defaults?.integer(forKey: "pendingPenalties") ?? 0
            if pending > 0 {
                var s = TetrisGameEngine.loadState()
                s = TetrisGameEngine.applyPenalties(state: s, count: pending)
                TetrisGameEngine.saveState(s)
                defaults?.set(0, forKey: "pendingPenalties")
            }
        }

        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")
        return .result()
    }
}
