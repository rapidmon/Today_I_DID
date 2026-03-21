import WidgetKit
import SwiftUI
import AppIntents

// MARK: - 타임라인 Provider

struct TetrisProvider: TimelineProvider {
    func placeholder(in context: Context) -> TetrisEntry {
        TetrisEntry(date: Date(), state: TetrisGameEngine.createEmptyState())
    }

    func getSnapshot(in context: Context, completion: @escaping (TetrisEntry) -> Void) {
        let state = TetrisGameEngine.loadState()
        completion(TetrisEntry(date: Date(), state: state))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TetrisEntry>) -> Void) {
        let state = TetrisGameEngine.loadState()
        let entry = TetrisEntry(date: Date(), state: state)
        // 수동 업데이트만 사용 (자동 갱신 없음)
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }
}

// MARK: - 타임라인 엔트리

struct TetrisEntry: TimelineEntry {
    let date: Date
    let state: GameState
}

// MARK: - 위젯 뷰

struct TetrisWidgetView: View {
    let entry: TetrisEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(spacing: 4) {
            // 상단: SCORE + STOCK + [+] + [↻]
            HStack(spacing: 4) {
                Text("SCORE: \(entry.state.score)")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(hex: "#FFDD00"))

                Spacer()

                Text("STOCK: \(entry.state.blockQueue.count)")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(hex: "#00CC00"))

                // [+] 앱 열기 버튼
                if entry.state.gameOver {
                    // GAME OVER 시 비활성화
                    Text("+")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(Color(hex: "#444466"))
                        .frame(width: 24, height: 24)
                        .background(Color(hex: "#222233"))
                        .cornerRadius(4)
                } else {
                    Link(destination: URL(string: "todayidid://add")!) {
                        Text("+")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 24, height: 24)
                            .background(Color(hex: "#0088FF"))
                            .cornerRadius(4)
                    }
                }

                // [↻] 새로고침/리셋 버튼
                Button(intent: RefreshIntent()) {
                    Text("↻")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 24, height: 24)
                        .background(entry.state.gameOver ? Color(hex: "#00CC00") : Color(hex: "#333366"))
                        .cornerRadius(4)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 4)

            // 게임 보드
            TetrisGridView(state: entry.state)

            // 하단: 조작 버튼 4개
            HStack(spacing: 4) {
                Button(intent: MoveLeftIntent()) {
                    Text("◀")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background(Color(hex: "#1A1A2E"))
                        .cornerRadius(6)
                }
                .buttonStyle(.plain)

                Button(intent: RotateIntent()) {
                    Text("↻")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background(Color(hex: "#1A1A2E"))
                        .cornerRadius(6)
                }
                .buttonStyle(.plain)

                Button(intent: MoveRightIntent()) {
                    Text("▶")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background(Color(hex: "#1A1A2E"))
                        .cornerRadius(6)
                }
                .buttonStyle(.plain)

                Button(intent: MoveDownIntent()) {
                    Text("▼")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background(Color(hex: "#0088FF"))
                        .cornerRadius(6)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 4)
        }
        .padding(4)
        .containerBackground(for: .widget) {
            Color(hex: "#0F0F23")
        }
    }
}

// MARK: - 위젯 정의

struct TetrisWidget: Widget {
    let kind: String = "TetrisWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TetrisProvider()) { entry in
            TetrisWidgetView(entry: entry)
        }
        .configurationDisplayName("Today I Did")
        .description("할 일을 완료하고 테트리스를 플레이하세요!")
        .supportedFamilies([.systemLarge])
        .contentMarginsDisabled()
    }
}

// MARK: - 위젯 번들

@main
struct TetrisWidgetBundle: WidgetBundle {
    var body: some Widget {
        TetrisWidget()
    }
}
