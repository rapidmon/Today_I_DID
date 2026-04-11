import Foundation

// MARK: - 데이터 모델

struct Position: Codable, Equatable {
    let x: Int
    let y: Int
}

struct ActivePiece: Codable {
    let type: String
    let rotation: Int
    let position: Position
    let colorId: Int
    let sourceRecordId: String
}

struct QueuedBlock: Codable {
    let type: String
    let colorId: Int
    let sourceRecordId: String
}

struct GameState {
    var grid: [[Int]]
    var gridRecordIds: [[String?]]
    var score: Int
    var activePiece: ActivePiece?
    var blockQueue: [QueuedBlock]
    var gameOver: Bool
    var totalLineClears: Int
    var animationState: String  // "none", "highlight", "fade", "done"
    var clearingRows: [Int]
    var combo: Int = 0
}

// MARK: - 게임 엔진

class TetrisGameEngine {
    static let COLS = 10
    static let ROWS = 12
    static let suiteName = "group.com.limheerae.TodayIdid"

    // 실제 테트리스 기본 점수
    static let SCORE_TABLE: [Int: Int] = [1: 40, 2: 100, 3: 300, 4: 1200]
    static let COMBO_BONUS = 50

    static let COLOR_PALETTE = [
        "#FF0000", "#FF8800", "#FFDD00", "#00CC00", "#0088FF", "#CC00FF", "#FF00AA"
    ]

    // 블록 모양 (type → rotation → 좌표 리스트)
    static let BLOCK_SHAPES: [String: [[Position]]] = [
        "I": [
            [Position(x:0,y:1), Position(x:1,y:1), Position(x:2,y:1), Position(x:3,y:1)],
            [Position(x:2,y:0), Position(x:2,y:1), Position(x:2,y:2), Position(x:2,y:3)],
            [Position(x:0,y:2), Position(x:1,y:2), Position(x:2,y:2), Position(x:3,y:2)],
            [Position(x:1,y:0), Position(x:1,y:1), Position(x:1,y:2), Position(x:1,y:3)]
        ],
        "O": [
            [Position(x:0,y:0), Position(x:1,y:0), Position(x:0,y:1), Position(x:1,y:1)],
            [Position(x:0,y:0), Position(x:1,y:0), Position(x:0,y:1), Position(x:1,y:1)],
            [Position(x:0,y:0), Position(x:1,y:0), Position(x:0,y:1), Position(x:1,y:1)],
            [Position(x:0,y:0), Position(x:1,y:0), Position(x:0,y:1), Position(x:1,y:1)]
        ],
        "T": [
            [Position(x:1,y:0), Position(x:0,y:1), Position(x:1,y:1), Position(x:2,y:1)],
            [Position(x:1,y:0), Position(x:1,y:1), Position(x:2,y:1), Position(x:1,y:2)],
            [Position(x:0,y:1), Position(x:1,y:1), Position(x:2,y:1), Position(x:1,y:2)],
            [Position(x:1,y:0), Position(x:0,y:1), Position(x:1,y:1), Position(x:1,y:2)]
        ],
        "S": [
            [Position(x:1,y:0), Position(x:2,y:0), Position(x:0,y:1), Position(x:1,y:1)],
            [Position(x:1,y:0), Position(x:1,y:1), Position(x:2,y:1), Position(x:2,y:2)],
            [Position(x:1,y:1), Position(x:2,y:1), Position(x:0,y:2), Position(x:1,y:2)],
            [Position(x:0,y:0), Position(x:0,y:1), Position(x:1,y:1), Position(x:1,y:2)]
        ],
        "Z": [
            [Position(x:0,y:0), Position(x:1,y:0), Position(x:1,y:1), Position(x:2,y:1)],
            [Position(x:2,y:0), Position(x:1,y:1), Position(x:2,y:1), Position(x:1,y:2)],
            [Position(x:0,y:1), Position(x:1,y:1), Position(x:1,y:2), Position(x:2,y:2)],
            [Position(x:1,y:0), Position(x:0,y:1), Position(x:1,y:1), Position(x:0,y:2)]
        ],
        "J": [
            [Position(x:0,y:0), Position(x:0,y:1), Position(x:1,y:1), Position(x:2,y:1)],
            [Position(x:1,y:0), Position(x:2,y:0), Position(x:1,y:1), Position(x:1,y:2)],
            [Position(x:0,y:1), Position(x:1,y:1), Position(x:2,y:1), Position(x:2,y:2)],
            [Position(x:1,y:0), Position(x:1,y:1), Position(x:0,y:2), Position(x:1,y:2)]
        ],
        "L": [
            [Position(x:2,y:0), Position(x:0,y:1), Position(x:1,y:1), Position(x:2,y:1)],
            [Position(x:1,y:0), Position(x:1,y:1), Position(x:1,y:2), Position(x:2,y:2)],
            [Position(x:0,y:1), Position(x:1,y:1), Position(x:2,y:1), Position(x:0,y:2)],
            [Position(x:0,y:0), Position(x:1,y:0), Position(x:1,y:1), Position(x:1,y:2)]
        ]
    ]

    // MARK: - 좌표 계산

    static func getAbsoluteCells(type: String, rotation: Int, pos: Position) -> [Position] {
        guard let shape = BLOCK_SHAPES[type] else { return [] }
        return shape[rotation % 4].map { Position(x: $0.x + pos.x, y: $0.y + pos.y) }
    }

    static func canPlace(grid: [[Int]], cells: [Position]) -> Bool {
        cells.allSatisfy { pos in
            pos.x >= 0 && pos.x < COLS && pos.y >= 0 && pos.y < ROWS && grid[pos.y][pos.x] == 0
        }
    }

    // MARK: - 게임 액션

    static func processAction(state: GameState, action: String) -> GameState {
        switch action {
        case "move_left": return moveLeft(state: state)
        case "move_right": return moveRight(state: state)
        case "move_down": return moveDown(state: state)
        case "rotate": return rotate(state: state)
        default: return state
        }
    }

    static func moveLeft(state: GameState) -> GameState {
        guard !state.gameOver, state.animationState == "none",
              let piece = state.activePiece else { return state }
        let newPos = Position(x: piece.position.x - 1, y: piece.position.y)
        let cells = getAbsoluteCells(type: piece.type, rotation: piece.rotation, pos: newPos)
        guard canPlace(grid: state.grid, cells: cells) else { return state }
        var s = state
        s.activePiece = ActivePiece(type: piece.type, rotation: piece.rotation, position: newPos, colorId: piece.colorId, sourceRecordId: piece.sourceRecordId)
        return s
    }

    static func moveRight(state: GameState) -> GameState {
        guard !state.gameOver, state.animationState == "none",
              let piece = state.activePiece else { return state }
        let newPos = Position(x: piece.position.x + 1, y: piece.position.y)
        let cells = getAbsoluteCells(type: piece.type, rotation: piece.rotation, pos: newPos)
        guard canPlace(grid: state.grid, cells: cells) else { return state }
        var s = state
        s.activePiece = ActivePiece(type: piece.type, rotation: piece.rotation, position: newPos, colorId: piece.colorId, sourceRecordId: piece.sourceRecordId)
        return s
    }

    static func moveDown(state: GameState) -> GameState {
        guard !state.gameOver, state.animationState == "none",
              let piece = state.activePiece else { return state }
        let newPos = Position(x: piece.position.x, y: piece.position.y + 1)
        let cells = getAbsoluteCells(type: piece.type, rotation: piece.rotation, pos: newPos)

        if canPlace(grid: state.grid, cells: cells) {
            var s = state
            s.activePiece = ActivePiece(type: piece.type, rotation: piece.rotation, position: newPos, colorId: piece.colorId, sourceRecordId: piece.sourceRecordId)
            return s
        }

        // 배치 확정
        let locked = lockPiece(state: state)
        let completedRows = checkLines(grid: locked.grid)

        if !completedRows.isEmpty {
            var s = locked
            s.animationState = "highlight"
            s.clearingRows = completedRows
            return s
        }

        // 줄 클리어 없으면 콤보 리셋
        var noCombo = locked
        noCombo.combo = 0
        return spawnPiece(state: noCombo)
    }

    static func rotate(state: GameState) -> GameState {
        guard !state.gameOver, state.animationState == "none",
              let piece = state.activePiece, piece.type != "O" else { return state }

        let newRotation = (piece.rotation + 1) % 4
        let cells = getAbsoluteCells(type: piece.type, rotation: newRotation, pos: piece.position)

        if canPlace(grid: state.grid, cells: cells) {
            var s = state
            s.activePiece = ActivePiece(type: piece.type, rotation: newRotation, position: piece.position, colorId: piece.colorId, sourceRecordId: piece.sourceRecordId)
            return s
        }

        // 벽킥
        let offsets = [Position(x: -1, y: 0), Position(x: 1, y: 0), Position(x: 0, y: -1)]
        for offset in offsets {
            let kickPos = Position(x: piece.position.x + offset.x, y: piece.position.y + offset.y)
            let kickCells = getAbsoluteCells(type: piece.type, rotation: newRotation, pos: kickPos)
            if canPlace(grid: state.grid, cells: kickCells) {
                var s = state
                s.activePiece = ActivePiece(type: piece.type, rotation: newRotation, position: kickPos, colorId: piece.colorId, sourceRecordId: piece.sourceRecordId)
                return s
            }
        }

        return state
    }

    // MARK: - 블록 배치 / 줄 클리어

    static func lockPiece(state: GameState) -> GameState {
        guard let piece = state.activePiece else { return state }
        var s = state
        let cells = getAbsoluteCells(type: piece.type, rotation: piece.rotation, pos: piece.position)

        for pos in cells {
            if pos.y >= 0 && pos.y < ROWS && pos.x >= 0 && pos.x < COLS {
                s.grid[pos.y][pos.x] = piece.colorId > 0 ? piece.colorId : 1
                s.gridRecordIds[pos.y][pos.x] = piece.sourceRecordId
            }
        }
        s.activePiece = nil
        return s
    }

    static func checkLines(grid: [[Int]]) -> [Int] {
        grid.indices.filter { y in grid[y].allSatisfy { $0 != 0 } }
    }

    static func clearLines(state: GameState) -> GameState {
        let rows = state.clearingRows
        guard !rows.isEmpty else { return state }

        // 클리어되는 줄의 recordIds 수집 → 성취로 저장
        var clearedRecordIds: [String] = []
        for rowIdx in rows {
            for x in 0..<COLS {
                if let rid = state.gridRecordIds[rowIdx][x], rid != "penalty", !rid.isEmpty {
                    clearedRecordIds.append(rid)
                }
            }
        }
        if !clearedRecordIds.isEmpty {
            saveAchievement(recordIds: clearedRecordIds, lineCount: rows.count)
        }

        var newGrid = state.grid.enumerated().filter { !rows.contains($0.offset) }.map { $0.element }
        var newRecordIds = state.gridRecordIds.enumerated().filter { !rows.contains($0.offset) }.map { $0.element }

        while newGrid.count < ROWS {
            newGrid.insert(Array(repeating: 0, count: COLS), at: 0)
            newRecordIds.insert(Array(repeating: nil, count: COLS), at: 0)
        }

        let baseScore = SCORE_TABLE[rows.count] ?? 0
        let comboBonus = state.combo > 0 ? COMBO_BONUS * state.combo : 0
        let totalBonus = baseScore + comboBonus

        var s = state
        s.grid = newGrid
        s.gridRecordIds = newRecordIds
        s.score = state.score + totalBonus
        s.totalLineClears = state.totalLineClears + rows.count
        s.clearingRows = []
        s.animationState = "none"
        s.combo = state.combo + 1
        return s
    }

    // MARK: - 블록 스폰

    static func spawnPiece(state: GameState) -> GameState {
        // 스폰 전 페널티 자동 적용
        var current = state
        if let defaults = UserDefaults(suiteName: suiteName) {
            let pending = defaults.integer(forKey: "pendingPenalties")
            if pending > 0 {
                for _ in 0..<pending {
                    if current.grid[0].contains(where: { $0 != 0 }) {
                        defaults.set(0, forKey: "pendingPenalties")
                        current.gameOver = true
                        current.activePiece = nil
                        return current
                    }
                    current.grid.removeFirst()
                    current.gridRecordIds.removeFirst()
                    let emptyCol = Int.random(in: 0..<COLS)
                    var penaltyRow = Array(repeating: 99, count: COLS)
                    penaltyRow[emptyCol] = 0
                    var penaltyRecordRow: [String?] = Array(repeating: "penalty", count: COLS)
                    penaltyRecordRow[emptyCol] = nil
                    current.grid.append(penaltyRow)
                    current.gridRecordIds.append(penaltyRecordRow)
                }
                defaults.set(0, forKey: "pendingPenalties")
            }
        }

        guard !current.blockQueue.isEmpty else {
            var s = current
            s.activePiece = nil
            return s
        }

        var s = current
        let next = s.blockQueue.removeFirst()
        let newPiece = ActivePiece(
            type: next.type,
            rotation: 0,
            position: Position(x: 3, y: 0),
            colorId: next.colorId,
            sourceRecordId: next.sourceRecordId
        )

        let cells = getAbsoluteCells(type: newPiece.type, rotation: 0, pos: newPiece.position)
        if !canPlace(grid: s.grid, cells: cells) {
            s.gameOver = true
            s.activePiece = nil
            return s
        }

        s.activePiece = newPiece
        return s
    }

    // MARK: - 애니메이션

    static func advanceAnimation(state: GameState) -> GameState {
        switch state.animationState {
        case "highlight":
            var s = state
            s.animationState = "fade"
            return s
        case "fade":
            let cleared = clearLines(state: state)
            return spawnPiece(state: cleared)
        case "done":
            let cleared = clearLines(state: state)
            return spawnPiece(state: cleared)
        default:
            return state
        }
    }

    // MARK: - 페널티

    static func applyPenalties(state: GameState, count: Int) -> GameState {
        guard count > 0 else { return state }
        var s = state

        for _ in 0..<count {
            s.grid.removeFirst()
            s.gridRecordIds.removeFirst()

            let emptyCol = Int.random(in: 0..<COLS)
            var penaltyRow = Array(repeating: 99, count: COLS)
            penaltyRow[emptyCol] = 0
            var penaltyRecordRow: [String?] = Array(repeating: "penalty", count: COLS)
            penaltyRecordRow[emptyCol] = nil

            s.grid.append(penaltyRow)
            s.gridRecordIds.append(penaltyRecordRow)
        }

        if s.grid[0].contains(where: { $0 != 0 }) {
            s.gameOver = true
        }

        return s
    }

    // MARK: - 성취 저장

    private static func saveAchievement(recordIds: [String], lineCount: Int) {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return }

        var achievements = loadAchievements()
        let recordMap = loadRecordMap()

        let uniqueIds = Array(Set(recordIds))
        var records: [[String: String]] = []
        for rid in uniqueIds {
            let info = recordMap[rid]
            records.append([
                "id": rid,
                "content": info?["content"] ?? "",
                "blockType": info?["blockType"] ?? ""
            ])
        }

        let achievement: [String: Any] = [
            "id": "ach_\(Int(Date().timeIntervalSince1970 * 1000))",
            "recordIds": uniqueIds,
            "records": records,
            "lineCount": lineCount,
            "score": SCORE_TABLE[lineCount] ?? 0,
            "clearedAt": Int(Date().timeIntervalSince1970 * 1000)
        ]
        achievements.append(achievement)

        if let data = try? JSONSerialization.data(withJSONObject: achievements) {
            defaults.set(String(data: data, encoding: .utf8), forKey: "achievements")
        }
    }

    static func loadAchievements() -> [[String: Any]] {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let json = defaults.string(forKey: "achievements"),
              let data = json.data(using: .utf8),
              let arr = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
            return []
        }
        return arr
    }

    static func loadRecordMap() -> [String: [String: String]] {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let json = defaults.string(forKey: "recordMap"),
              let data = json.data(using: .utf8),
              let dict = try? JSONSerialization.jsonObject(with: data) as? [String: [String: String]] else {
            return [:]
        }
        return dict
    }

    // MARK: - 상태 저장/로드

    static func loadState() -> GameState {
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            return createEmptyState()
        }

        // 그리드 크기 검증
        if let gridJson = defaults.string(forKey: "grid"),
           let data = gridJson.data(using: .utf8),
           let arr = try? JSONSerialization.jsonObject(with: data) as? [[Int]] {
            if arr.count != ROWS || (arr.first?.count ?? 0) != COLS {
                resetGame()
                return createEmptyState()
            }
        }

        let grid = loadGrid(defaults: defaults)
        let gridRecordIds = loadGridRecordIds(defaults: defaults)
        let activePiece = loadActivePiece(defaults: defaults)
        let blockQueue = loadBlockQueue(defaults: defaults)

        return GameState(
            grid: grid,
            gridRecordIds: gridRecordIds,
            score: defaults.integer(forKey: "score"),
            activePiece: activePiece,
            blockQueue: blockQueue,
            gameOver: defaults.bool(forKey: "gameOver"),
            totalLineClears: defaults.integer(forKey: "totalLineClears"),
            animationState: defaults.string(forKey: "animationState") ?? "none",
            clearingRows: parseClearingRows(defaults.string(forKey: "clearingRows") ?? ""),
            combo: defaults.integer(forKey: "combo")
        )
    }

    static func saveState(_ state: GameState) {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return }

        // grid
        if let data = try? JSONSerialization.data(withJSONObject: state.grid) {
            defaults.set(String(data: data, encoding: .utf8), forKey: "grid")
        }

        // gridRecordIds
        let recordIds = state.gridRecordIds.map { row in row.map { $0 ?? "null" } }
        if let data = try? JSONSerialization.data(withJSONObject: recordIds) {
            defaults.set(String(data: data, encoding: .utf8), forKey: "gridRecordIds")
        }

        // activePiece
        if let piece = state.activePiece {
            let obj: [String: Any] = [
                "type": piece.type,
                "rotation": piece.rotation,
                "posX": piece.position.x,
                "posY": piece.position.y,
                "colorId": piece.colorId,
                "sourceRecordId": piece.sourceRecordId
            ]
            if let data = try? JSONSerialization.data(withJSONObject: obj) {
                defaults.set(String(data: data, encoding: .utf8), forKey: "activePiece")
            }
        } else {
            defaults.removeObject(forKey: "activePiece")
        }

        // blockQueue
        let queue = state.blockQueue.map { block -> [String: Any] in
            ["type": block.type, "colorId": block.colorId, "sourceRecordId": block.sourceRecordId]
        }
        if let data = try? JSONSerialization.data(withJSONObject: queue) {
            defaults.set(String(data: data, encoding: .utf8), forKey: "blockQueue")
        }

        defaults.set(state.score, forKey: "score")
        defaults.set(state.gameOver, forKey: "gameOver")
        defaults.set(state.totalLineClears, forKey: "totalLineClears")
        defaults.set(state.animationState, forKey: "animationState")
        defaults.set(state.clearingRows.map(String.init).joined(separator: ","), forKey: "clearingRows")
        defaults.set(state.combo, forKey: "combo")
    }

    // MARK: - 리셋

    static func resetGame() {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return }
        let achievements = defaults.string(forKey: "achievements") ?? "[]"
        let recordMap = defaults.string(forKey: "recordMap")
        let score = defaults.integer(forKey: "score")

        // 마지막 게임 데이터 보존 (앱에서 히스토리 저장용)
        defaults.set(score, forKey: "lastGame_score")
        defaults.set(achievements, forKey: "lastGame_achievements")

        let keys = ["grid", "gridRecordIds", "activePiece", "blockQueue", "score",
                     "gameOver", "totalLineClears", "animationState", "clearingRows",
                     "pendingPenalties", "achievements"]
        for key in keys { defaults.removeObject(forKey: key) }

        // recordMap만 복원 (achievements는 초기화)
        if let rm = recordMap { defaults.set(rm, forKey: "recordMap") }
    }

    static func trySpawnPiece() {
        var state = loadState()
        // 애니메이션 진행 중에는 스폰 금지 (줄 클리어 도중 큐가 두 번 소모되는 버그 방지)
        if state.activePiece == nil && !state.gameOver && !state.blockQueue.isEmpty
           && state.animationState == "none" {
            state = spawnPiece(state: state)
            saveState(state)
        }
    }

    // MARK: - 헬퍼

    static func createEmptyState() -> GameState {
        GameState(
            grid: Array(repeating: Array(repeating: 0, count: COLS), count: ROWS),
            gridRecordIds: Array(repeating: Array(repeating: nil, count: COLS), count: ROWS),
            score: 0,
            activePiece: nil,
            blockQueue: [],
            gameOver: false,
            totalLineClears: 0,
            animationState: "none",
            clearingRows: [],
            combo: 0
        )
    }

    private static func loadGrid(defaults: UserDefaults) -> [[Int]] {
        guard let json = defaults.string(forKey: "grid"),
              let data = json.data(using: .utf8),
              let arr = try? JSONSerialization.jsonObject(with: data) as? [[Int]] else {
            return Array(repeating: Array(repeating: 0, count: COLS), count: ROWS)
        }
        return arr
    }

    private static func loadGridRecordIds(defaults: UserDefaults) -> [[String?]] {
        guard let json = defaults.string(forKey: "gridRecordIds"),
              let data = json.data(using: .utf8),
              let arr = try? JSONSerialization.jsonObject(with: data) as? [[String]] else {
            return Array(repeating: Array(repeating: nil, count: COLS), count: ROWS)
        }
        return arr.map { row in row.map { $0 == "null" ? nil : $0 } }
    }

    private static func loadActivePiece(defaults: UserDefaults) -> ActivePiece? {
        guard let json = defaults.string(forKey: "activePiece"),
              let data = json.data(using: .utf8),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = obj["type"] as? String,
              let rotation = obj["rotation"] as? Int,
              let posX = obj["posX"] as? Int,
              let posY = obj["posY"] as? Int,
              let colorId = obj["colorId"] as? Int else { return nil }
        return ActivePiece(
            type: type, rotation: rotation,
            position: Position(x: posX, y: posY),
            colorId: colorId,
            sourceRecordId: obj["sourceRecordId"] as? String ?? ""
        )
    }

    private static func loadBlockQueue(defaults: UserDefaults) -> [QueuedBlock] {
        guard let json = defaults.string(forKey: "blockQueue"),
              let data = json.data(using: .utf8),
              let arr = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else { return [] }
        return arr.compactMap { obj in
            guard let type = obj["type"] as? String,
                  let colorId = obj["colorId"] as? Int else { return nil }
            return QueuedBlock(type: type, colorId: colorId, sourceRecordId: obj["sourceRecordId"] as? String ?? "")
        }
    }

    private static func parseClearingRows(_ str: String) -> [Int] {
        str.split(separator: ",").compactMap { Int($0) }
    }
}
