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
    static let neonMagenta = Color(hex: "#FF00E5")
    static let textMuted = Color(hex: "#555577")
    static let textSecondary = Color(hex: "#8888AA")
    static let borderSubtle = Color(hex: "#2A2A50")

    // Press Start 2P 대체 — iOS는 .monospaced 디자인 사용
    static func pixelFont(_ size: CGFloat) -> Font {
        .system(size: size, weight: .bold, design: .monospaced)
    }
}

// MARK: - 삼각형 아이콘 Shape

struct TriangleLeft: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let pad = rect.width * 0.25
        path.move(to: CGPoint(x: pad, y: rect.midY))
        path.addLine(to: CGPoint(x: rect.width - pad, y: pad))
        path.addLine(to: CGPoint(x: rect.width - pad, y: rect.height - pad))
        path.closeSubpath()
        return path
    }
}

struct TriangleRight: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let pad = rect.width * 0.25
        path.move(to: CGPoint(x: rect.width - pad, y: rect.midY))
        path.addLine(to: CGPoint(x: pad, y: pad))
        path.addLine(to: CGPoint(x: pad, y: rect.height - pad))
        path.closeSubpath()
        return path
    }
}

struct TriangleDown: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let pad = rect.height * 0.25
        path.move(to: CGPoint(x: rect.midX, y: rect.height - pad))
        path.addLine(to: CGPoint(x: pad, y: pad))
        path.addLine(to: CGPoint(x: rect.width - pad, y: pad))
        path.closeSubpath()
        return path
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
            // 상단 바
            headerBar

            // 중앙: 게임판 + 사이드패널
            HStack(spacing: 2) {
                // 게임판
                TetrisGridView(state: entry.state)
                    .aspectRatio(CGFloat(TetrisGameEngine.COLS) / CGFloat(TetrisGameEngine.ROWS), contentMode: .fit)

                // 사이드패널
                sidePanel
            }

            // 하단 버튼
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

    // MARK: - 사이드 패널

    private var sidePanel: some View {
        VStack(spacing: 4) {
            // NEXT 박스
            VStack(spacing: 4) {
                Text("NEXT")
                    .font(NeonColors.pixelFont(16))
                    .foregroundColor(NeonColors.neonCyan.opacity(0.5))

                if entry.state.blockQueue.isEmpty {
                    // 얇은 + 아이콘
                    ZStack {
                        Rectangle()
                            .fill(NeonColors.neonCyan.opacity(0.6))
                            .frame(width: 20, height: 1.5)
                        Rectangle()
                            .fill(NeonColors.neonCyan.opacity(0.6))
                            .frame(width: 1.5, height: 20)
                    }
                    .frame(maxWidth: .infinity, minHeight: 40)
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

            // TODO 박스
            todoPanel

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - TODO 패널

    private var todoPanel: some View {
        let tasks = loadPendingTasks()

        return VStack(alignment: .leading, spacing: 0) {
            Text("TODO")
                .font(NeonColors.pixelFont(16))
                .foregroundColor(NeonColors.neonMagenta.opacity(0.5))
                .frame(maxWidth: .infinity)

            ForEach(0..<4, id: \.self) { i in
                if i < tasks.count {
                    HStack(spacing: 4) {
                        Circle()
                            .fill(NeonColors.neonMagenta.opacity(0.6))
                            .frame(width: 4, height: 4)
                        Text(tasks[i])
                            .font(.system(size: 11, weight: .regular))
                            .foregroundColor(NeonColors.textSecondary)
                            .lineLimit(1)
                            .truncationMode(.tail)
                    }
                    .frame(height: 18)
                } else {
                    Spacer().frame(height: 18)
                }
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(NeonColors.bgCard.opacity(0.8))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(NeonColors.neonMagenta.opacity(0.15), lineWidth: 1)
        )
        .cornerRadius(8)
    }

    private func loadPendingTasks() -> [String] {
        guard let defaults = UserDefaults(suiteName: TetrisGameEngine.suiteName),
              let json = defaults.string(forKey: "pendingTasks"),
              let data = json.data(using: .utf8),
              let arr = try? JSONSerialization.jsonObject(with: data) as? [[String: String]] else {
            return []
        }
        return Array(arr.compactMap { $0["content"] }.prefix(4))
    }

    // MARK: - 조작 버튼

    private var controlButtons: some View {
        let isDisabled = entry.state.gameOver
        let iconSize: CGFloat = 14

        return HStack(spacing: 3) {
            Button(intent: MoveLeftIntent()) {
                TriangleLeft()
                    .fill(isDisabled ? NeonColors.textMuted : NeonColors.neonCyan)
                    .frame(width: iconSize, height: iconSize)
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
                TriangleRight()
                    .fill(isDisabled ? NeonColors.textMuted : NeonColors.neonCyan)
                    .frame(width: iconSize, height: iconSize)
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
                TriangleDown()
                    .fill(isDisabled ? NeonColors.textMuted : NeonColors.neonGreen)
                    .frame(width: iconSize, height: iconSize)
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
                // 회전 아이콘 — 원호 + 화살촉
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 14, weight: .bold))
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
        let cells = TetrisGameEngine.getAbsoluteCells(type: type, rotation: 0, pos: Position(x: 0, y: 0))
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
