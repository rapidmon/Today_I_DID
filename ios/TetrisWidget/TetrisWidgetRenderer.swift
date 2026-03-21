import SwiftUI
import WidgetKit

// MARK: - 색상 헬퍼

struct BlockColors {
    static let palette: [String] = [
        "#FF0000", "#FF8800", "#FFDD00", "#00CC00", "#0088FF", "#CC00FF", "#FF00AA"
    ]

    static let background = Color(hex: "#0A0A1A")
    static let emptyCell = Color(hex: "#1A1A2E")
    static let gridLine = Color(hex: "#222244")
    static let penaltyColor = Color(hex: "#666688")

    static func blockColor(for colorId: Int) -> Color {
        if colorId <= 0 { return emptyCell }
        if colorId == 99 { return penaltyColor }
        let hex = palette[(colorId - 1) % palette.count]
        return Color(hex: hex)
    }
}

// MARK: - 그리드 뷰

struct TetrisGridView: View {
    let state: GameState

    var body: some View {
        GeometryReader { geo in
            let cellW = geo.size.width / CGFloat(TetrisGameEngine.COLS)
            let cellH = geo.size.height / CGFloat(TetrisGameEngine.ROWS)
            let cellSize = min(cellW, cellH)
            let totalW = cellSize * CGFloat(TetrisGameEngine.COLS)
            let totalH = cellSize * CGFloat(TetrisGameEngine.ROWS)
            let offsetX = (geo.size.width - totalW) / 2
            let offsetY = (geo.size.height - totalH) / 2

            ZStack(alignment: .topLeading) {
                // 배경
                BlockColors.background

                // 그리드 셀
                Canvas { context, size in
                    // 빈 셀 + 배치된 블록
                    for y in 0..<TetrisGameEngine.ROWS {
                        for x in 0..<TetrisGameEngine.COLS {
                            let rect = CGRect(
                                x: offsetX + CGFloat(x) * cellSize + 0.5,
                                y: offsetY + CGFloat(y) * cellSize + 0.5,
                                width: cellSize - 1,
                                height: cellSize - 1
                            )

                            let colorValue = state.grid[y][x]

                            // 줄 클리어 애니메이션
                            if state.clearingRows.contains(y) {
                                let color: Color = state.animationState == "highlight"
                                    ? .white
                                    : state.animationState == "fade"
                                        ? Color(hex: "#444466")
                                        : BlockColors.blockColor(for: colorValue)
                                context.fill(Path(rect), with: .color(color))
                                continue
                            }

                            if colorValue != 0 {
                                context.fill(Path(rect), with: .color(BlockColors.blockColor(for: colorValue)))
                                // 하이라이트 (상단)
                                let highlightRect = CGRect(
                                    x: rect.minX, y: rect.minY,
                                    width: rect.width, height: cellSize * 0.3
                                )
                                context.fill(Path(highlightRect), with: .color(.white.opacity(0.15)))
                            } else {
                                context.fill(Path(rect), with: .color(BlockColors.emptyCell))
                            }
                        }
                    }

                    // 활성 블록
                    if let piece = state.activePiece {
                        let cells = TetrisGameEngine.getAbsoluteCells(
                            type: piece.type, rotation: piece.rotation, pos: piece.position
                        )
                        let color = BlockColors.blockColor(for: piece.colorId)
                        for pos in cells {
                            if pos.x >= 0 && pos.x < TetrisGameEngine.COLS &&
                               pos.y >= 0 && pos.y < TetrisGameEngine.ROWS {
                                let rect = CGRect(
                                    x: offsetX + CGFloat(pos.x) * cellSize + 0.5,
                                    y: offsetY + CGFloat(pos.y) * cellSize + 0.5,
                                    width: cellSize - 1,
                                    height: cellSize - 1
                                )
                                context.fill(Path(rect), with: .color(color))
                                // 하이라이트
                                let hlRect = CGRect(x: rect.minX, y: rect.minY, width: rect.width, height: cellSize * 0.3)
                                context.fill(Path(hlRect), with: .color(.white.opacity(0.2)))
                            }
                        }
                    }

                    // 그리드 선
                    let lineColor = BlockColors.gridLine
                    for x in 0...TetrisGameEngine.COLS {
                        let xPos = offsetX + CGFloat(x) * cellSize
                        var path = Path()
                        path.move(to: CGPoint(x: xPos, y: offsetY))
                        path.addLine(to: CGPoint(x: xPos, y: offsetY + totalH))
                        context.stroke(path, with: .color(lineColor), lineWidth: 0.5)
                    }
                    for y in 0...TetrisGameEngine.ROWS {
                        let yPos = offsetY + CGFloat(y) * cellSize
                        var path = Path()
                        path.move(to: CGPoint(x: offsetX, y: yPos))
                        path.addLine(to: CGPoint(x: offsetX + totalW, y: yPos))
                        context.stroke(path, with: .color(lineColor), lineWidth: 0.5)
                    }
                }

                // GAME OVER 오버레이
                if state.gameOver {
                    ZStack {
                        BlockColors.background.opacity(0.7)

                        VStack(spacing: 2) {
                            Text("GAME")
                                .font(.system(size: cellSize * 1.5, weight: .bold, design: .monospaced))
                                .foregroundColor(.red)
                            Text("OVER")
                                .font(.system(size: cellSize * 1.5, weight: .bold, design: .monospaced))
                                .foregroundColor(.red)
                        }
                        .padding(8)
                        .background(BlockColors.background)
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .stroke(Color.red, lineWidth: 2)
                        )
                    }
                    .frame(width: totalW, height: totalH)
                    .offset(x: offsetX, y: offsetY)
                }
            }
        }
    }
}

// MARK: - Color hex 확장

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8) & 0xFF) / 255.0
        let b = Double(int & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
