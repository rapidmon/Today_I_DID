import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Neon Arcade 디자인 색상

struct NeonColors {
    static let bgPrimary = Color(hex: "#0A0A1A")
    static let bgCard = Color(hex: "#1A1A35")
    static let neonCyan = Color(hex: "#00F0FF")
    static let neonYellow = Color(hex: "#FFE500")
    static let neonGreen = Color(hex: "#00FF88")
    static let neonRed = Color(hex: "#FF3355")
    static let textMuted = Color(hex: "#555577")
    static let borderSubtle = Color(hex: "#2A2A50")

    // Press Start 2P 대체 — iOS는 .monospaced 디자인 사용
    static func pixelFont(_ size: CGFloat) -> Font {
        .system(size: size, weight: .bold, design: .monospaced)
    }
}

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
        VStack(spacing: 2) {
            // 상단 바 (패딩 축소)
            headerBar

            // 중앙: 게임판 + 사이드패널
            HStack(spacing: 2) {
                // 게임판 — 높이에 맞춰 자동 크기
                TetrisGridView(state: entry.state)
                    .aspectRatio(CGFloat(TetrisGameEngine.COLS) / CGFloat(TetrisGameEngine.ROWS), contentMode: .fit)

                // 사이드패널 — 남은 공간 채움
                sidePanel
            }

            // 하단 버튼 (패딩 축소)
            controlButtons
        }
        .padding(4)
        .containerBackground(for: .widget) {
            NeonColors.bgPrimary
        }
    }

    // MARK: - 상단 바

    private var headerBar: some View {
        HStack(spacing: 4) {
            // NEW 버튼
            if entry.state.gameOver {
                Button(intent: RefreshIntent()) {
                    Text("NEW")
                        .font(NeonColors.pixelFont(16))
                        .foregroundColor(NeonColors.neonCyan)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(NeonColors.neonCyan.opacity(0.15))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(NeonColors.neonCyan.opacity(0.3), lineWidth: 1)
                        )
                        .cornerRadius(8)
                }
                .buttonStyle(.plain)
            } else {
                Text("NEW")
                    .font(NeonColors.pixelFont(16))
                    .foregroundColor(NeonColors.textMuted)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(NeonColors.borderSubtle.opacity(0.5))
                    .cornerRadius(8)
            }

            Spacer()

            Text("TODAY I DID")
                .font(NeonColors.pixelFont(12))
                .foregroundColor(NeonColors.neonCyan.opacity(0.4))

            Spacer()

            // 투명도
            Text("0%")
                .font(NeonColors.pixelFont(16))
                .foregroundColor(NeonColors.neonYellow)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(NeonColors.neonYellow.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(NeonColors.neonYellow.opacity(0.2), lineWidth: 1)
                )
                .cornerRadius(8)
        }
        .padding(.horizontal, 2)
    }

    // MARK: - 사이드 패널 (남은 공간 채움)

    private var sidePanel: some View {
        VStack(spacing: 4) {
            // NEXT 박스
            VStack(spacing: 4) {
                Text("NEXT")
                    .font(NeonColors.pixelFont(16))
                    .foregroundColor(NeonColors.neonCyan.opacity(0.5))

                if entry.state.blockQueue.isEmpty {
                    Link(destination: URL(string: "todayidid://add")!) {
                        Text("+")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(NeonColors.neonCyan.opacity(0.5))
                            .frame(maxWidth: .infinity, minHeight: 40)
                    }
                } else {
                    let nextBlock = entry.state.blockQueue.first!
                    NextBlockView(type: nextBlock.type, colorId: nextBlock.colorId)
                        .frame(maxWidth: .infinity, minHeight: 40)
                }
            }
            .padding(6)
            .frame(maxWidth: .infinity)
            .background(NeonColors.bgCard.opacity(0.8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(NeonColors.neonCyan.opacity(0.1), lineWidth: 1)
            )
            .cornerRadius(8)

            // SCORE 박스
            VStack(spacing: 2) {
                Text("SCORE")
                    .font(NeonColors.pixelFont(16))
                    .foregroundColor(NeonColors.neonYellow.opacity(0.5))
                Text("\(entry.state.score)")
                    .font(NeonColors.pixelFont(16))
                    .foregroundColor(NeonColors.neonYellow)
            }
            .padding(6)
            .frame(maxWidth: .infinity)
            .background(NeonColors.bgCard.opacity(0.8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(NeonColors.neonYellow.opacity(0.1), lineWidth: 1)
            )
            .cornerRadius(8)

            // LINES 박스
            VStack(spacing: 2) {
                Text("LINES")
                    .font(NeonColors.pixelFont(16))
                    .foregroundColor(NeonColors.neonGreen.opacity(0.5))
                Text("\(entry.state.totalLineClears)")
                    .font(NeonColors.pixelFont(16))
                    .foregroundColor(NeonColors.neonGreen)
            }
            .padding(6)
            .frame(maxWidth: .infinity)
            .background(NeonColors.bgCard.opacity(0.8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(NeonColors.neonGreen.opacity(0.1), lineWidth: 1)
            )
            .cornerRadius(8)

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - 조작 버튼 ◀ ▶ | ▼ | ↻

    private var controlButtons: some View {
        let isDisabled = entry.state.gameOver

        return HStack(spacing: 3) {
            Button(intent: MoveLeftIntent()) {
                Text("◀")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(isDisabled ? NeonColors.textMuted : NeonColors.neonCyan)
                    .frame(maxWidth: .infinity, minHeight: 34)
                    .background(isDisabled ? NeonColors.borderSubtle.opacity(0.3) : NeonColors.neonCyan.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(isDisabled ? NeonColors.textMuted.opacity(0.2) : NeonColors.neonCyan.opacity(0.2), lineWidth: 1)
                    )
                    .cornerRadius(10)
            }
            .buttonStyle(.plain)
            .disabled(isDisabled)

            Button(intent: MoveRightIntent()) {
                Text("▶")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(isDisabled ? NeonColors.textMuted : NeonColors.neonCyan)
                    .frame(maxWidth: .infinity, minHeight: 34)
                    .background(isDisabled ? NeonColors.borderSubtle.opacity(0.3) : NeonColors.neonCyan.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(isDisabled ? NeonColors.textMuted.opacity(0.2) : NeonColors.neonCyan.opacity(0.2), lineWidth: 1)
                    )
                    .cornerRadius(10)
            }
            .buttonStyle(.plain)
            .disabled(isDisabled)

            Spacer().frame(width: 4)

            Button(intent: MoveDownIntent()) {
                Text("▼")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(isDisabled ? NeonColors.textMuted : NeonColors.neonGreen)
                    .frame(maxWidth: .infinity, minHeight: 34)
                    .background(isDisabled ? NeonColors.borderSubtle.opacity(0.3) : NeonColors.neonGreen.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(isDisabled ? NeonColors.textMuted.opacity(0.2) : NeonColors.neonGreen.opacity(0.2), lineWidth: 1)
                    )
                    .cornerRadius(10)
            }
            .buttonStyle(.plain)
            .disabled(isDisabled)

            Spacer().frame(width: 4)

            Button(intent: RotateIntent()) {
                Text("↻")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(isDisabled ? NeonColors.textMuted : NeonColors.neonYellow)
                    .frame(maxWidth: .infinity, minHeight: 34)
                    .background(isDisabled ? NeonColors.borderSubtle.opacity(0.3) : NeonColors.neonYellow.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(isDisabled ? NeonColors.textMuted.opacity(0.2) : NeonColors.neonYellow.opacity(0.2), lineWidth: 1)
                    )
                    .cornerRadius(10)
            }
            .buttonStyle(.plain)
            .disabled(isDisabled)
        }
        .padding(.horizontal, 2)
    }
}

// MARK: - NEXT 블록 미리보기

struct NextBlockView: View {
    let type: String
    let colorId: Int

    var body: some View {
        let cells = TetrisGameEngine.getAbsoluteCells(type: type, rotation: 0, pos: (0, 0))
        let minX = cells.map(\.x).min() ?? 0
        let minY = cells.map(\.y).min() ?? 0
        let maxX = cells.map(\.x).max() ?? 0
        let maxY = cells.map(\.y).max() ?? 0
        let color = BlockColors.blockColor(for: colorId)

        GeometryReader { geo in
            let cols = maxX - minX + 1
            let rows = maxY - minY + 1
            let cellSize = min(geo.size.width / CGFloat(max(cols, 4)), geo.size.height / CGFloat(max(rows, 2))) * 0.95
            let totalW = cellSize * CGFloat(cols)
            let totalH = cellSize * CGFloat(rows)
            let offsetX = (geo.size.width - totalW) / 2
            let offsetY = (geo.size.height - totalH) / 2

            Canvas { context, _ in
                for cell in cells {
                    let rect = CGRect(
                        x: offsetX + CGFloat(cell.x - minX) * cellSize + 0.5,
                        y: offsetY + CGFloat(cell.y - minY) * cellSize + 0.5,
                        width: cellSize - 1,
                        height: cellSize - 1
                    )
                    context.fill(Path(rect), with: .color(color))
                    // 고전 테트리스 3D 베벨
                    let hlRect = CGRect(x: rect.minX, y: rect.minY, width: rect.width, height: 2)
                    context.fill(Path(hlRect), with: .color(.white.opacity(0.4)))
                    let leftRect = CGRect(x: rect.minX, y: rect.minY, width: 2, height: rect.height)
                    context.fill(Path(leftRect), with: .color(.white.opacity(0.3)))
                    let btmRect = CGRect(x: rect.minX, y: rect.maxY - 2, width: rect.width, height: 2)
                    context.fill(Path(btmRect), with: .color(.black.opacity(0.4)))
                    let rightRect = CGRect(x: rect.maxX - 2, y: rect.minY, width: 2, height: rect.height)
                    context.fill(Path(rightRect), with: .color(.black.opacity(0.35)))
                }
            }
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
