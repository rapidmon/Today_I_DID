import Foundation
import WidgetKit

// React Native 네이티브 모듈 — UserDefaults를 통해 위젯과 데이터 공유
@objc(TetrisWidgetBridge)
class TetrisWidgetBridge: NSObject {

    private let suiteName = "group.com.limheerae.TodayIdid"

    private var defaults: UserDefaults? {
        UserDefaults(suiteName: suiteName)
    }

    // 블록을 큐에 추가 + recordMap 저장 + 자동 스폰 + 위젯 갱신
    @objc func addBlockToQueue(
        _ type: String,
        colorId: Double,
        sourceRecordId: String,
        content: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let defaults = defaults else {
            reject("ERROR", "UserDefaults 초기화 실패", nil)
            return
        }

        // 현재 큐 로드
        var queue: [[String: Any]] = []
        if let json = defaults.string(forKey: "blockQueue"),
           let data = json.data(using: .utf8),
           let arr = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
            queue = arr
        }

        // 새 블록 추가
        queue.append([
            "type": type,
            "colorId": Int(colorId),
            "sourceRecordId": sourceRecordId
        ])

        if let data = try? JSONSerialization.data(withJSONObject: queue) {
            defaults.set(String(data: data, encoding: .utf8), forKey: "blockQueue")
        }

        // recordMap에 content 저장
        var recordMap: [String: [String: String]] = [:]
        if let json = defaults.string(forKey: "recordMap"),
           let data = json.data(using: .utf8),
           let dict = try? JSONSerialization.jsonObject(with: data) as? [String: [String: String]] {
            recordMap = dict
        }
        recordMap[sourceRecordId] = ["content": content, "blockType": type]

        if let data = try? JSONSerialization.data(withJSONObject: recordMap) {
            defaults.set(String(data: data, encoding: .utf8), forKey: "recordMap")
        }

        // 자동 스폰
        TetrisGameEngine.trySpawnPiece()

        // 위젯 갱신
        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")

        resolve(true)
    }

    // 페널티 줄 수 설정
    @objc func addPenalties(
        _ count: Double,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        defaults?.set(Int(count), forKey: "pendingPenalties")
        resolve(true)
    }

    // 점수 업데이트
    @objc func updateScore(
        _ score: Double,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        defaults?.set(Int(score), forKey: "score")
        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")
        resolve(true)
    }

    // 게임 리셋
    @objc func resetGame(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        TetrisGameEngine.resetGame()
        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")
        resolve(true)
    }

    // 위젯 갱신
    @objc func refreshWidget(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        WidgetCenter.shared.reloadTimelines(ofKind: "TetrisWidget")
        resolve(true)
    }

    // 게임 오버 여부
    @objc func isGameOver(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let gameOver = defaults?.bool(forKey: "gameOver") ?? false
        resolve(gameOver)
    }

    // 성취 목록 조회
    @objc func getAchievements(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let json = defaults?.string(forKey: "achievements") ?? "[]"
        resolve(json)
    }

    // React Native 모듈 설정
    @objc static func requiresMainQueueSetup() -> Bool { false }
}
