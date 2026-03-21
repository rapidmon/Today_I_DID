package com.limheerae.Today_I_did.widget

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface

object WidgetRenderer {
    private const val GRID_COLS = 10
    private const val GRID_ROWS = 12

    fun renderGrid(state: GameState, width: Int, height: Int): Bitmap {
        val cellW = width.toFloat() / GRID_COLS
        val cellH = height.toFloat() / GRID_ROWS
        val cellSize = minOf(cellW, cellH)
        val totalW = (cellSize * GRID_COLS).toInt()
        val totalH = (cellSize * GRID_ROWS).toInt()

        val bitmap = Bitmap.createBitmap(
            maxOf(totalW, 1), maxOf(totalH, 1), Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(bitmap)
        val paint = Paint().apply { isAntiAlias = false }

        // 배경
        canvas.drawColor(Color.parseColor("#0A0A1A"))

        // Game Over: 보드 전체 회색 + GAME OVER 텍스트
        if (state.gameOver) {
            val grayColor = Color.parseColor("#444466")
            for (y in 0 until GRID_ROWS) {
                for (x in 0 until GRID_COLS) {
                    val left = x * cellSize
                    val top = y * cellSize
                    paint.color = grayColor
                    canvas.drawRect(
                        RectF(left + 1, top + 1, left + cellSize - 1, top + cellSize - 1),
                        paint
                    )
                }
            }

            // 그리드 선
            drawGridLines(canvas, paint, cellSize, totalW, totalH)

            // GAME OVER 텍스트
            paint.color = Color.WHITE
            paint.textSize = cellSize * 1.8f
            paint.textAlign = Paint.Align.CENTER
            paint.typeface = Typeface.DEFAULT_BOLD
            paint.isAntiAlias = true

            val centerX = totalW / 2f
            val centerY = totalH / 2f

            // 배경 박스
            val textWidth = paint.measureText("GAME")
            val boxPadding = cellSize * 0.5f
            paint.color = Color.parseColor("#0A0A1A")
            canvas.drawRect(
                RectF(
                    centerX - textWidth / 2 - boxPadding,
                    centerY - cellSize * 2.5f,
                    centerX + textWidth / 2 + boxPadding,
                    centerY + cellSize * 1.5f
                ),
                paint
            )

            // 테두리
            paint.color = Color.parseColor("#FF0000")
            paint.style = Paint.Style.STROKE
            paint.strokeWidth = 3f
            canvas.drawRect(
                RectF(
                    centerX - textWidth / 2 - boxPadding,
                    centerY - cellSize * 2.5f,
                    centerX + textWidth / 2 + boxPadding,
                    centerY + cellSize * 1.5f
                ),
                paint
            )

            // 텍스트
            paint.style = Paint.Style.FILL
            paint.color = Color.parseColor("#FF0000")
            canvas.drawText("GAME", centerX, centerY - cellSize * 0.3f, paint)
            canvas.drawText("OVER", centerX, centerY + cellSize * 1.2f, paint)

            return bitmap
        }

        // 일반 게임 상태: 그리드 셀
        for (y in 0 until GRID_ROWS) {
            for (x in 0 until GRID_COLS) {
                val left = x * cellSize
                val top = y * cellSize
                val rect = RectF(left + 1, top + 1, left + cellSize - 1, top + cellSize - 1)

                val colorValue = state.grid[y][x]

                // 줄 클리어 애니메이션
                if (state.clearingRows.contains(y)) {
                    paint.color = when (state.animationState) {
                        "highlight" -> Color.WHITE
                        "fade" -> Color.parseColor("#444466")
                        else -> getBlockColor(colorValue)
                    }
                    canvas.drawRect(rect, paint)
                    continue
                }

                if (colorValue != 0) {
                    paint.color = getBlockColor(colorValue)
                    canvas.drawRect(rect, paint)

                    // 하이라이트 (블록 윗면)
                    paint.color = Color.argb(40, 255, 255, 255)
                    canvas.drawRect(left + 1, top + 1, left + cellSize - 1, top + cellSize * 0.3f, paint)
                } else {
                    paint.color = Color.parseColor("#1A1A2E")
                    canvas.drawRect(rect, paint)
                }
            }
        }

        // 활성 블록
        state.activePiece?.let { piece ->
            val cells = TetrisGameEngine.getAbsoluteCells(piece.type, piece.rotation, piece.position)
            paint.color = getBlockColor(piece.colorId)
            for ((x, y) in cells) {
                if (x in 0 until GRID_COLS && y in 0 until GRID_ROWS) {
                    val left = x * cellSize
                    val top = y * cellSize
                    canvas.drawRect(
                        RectF(left + 1, top + 1, left + cellSize - 1, top + cellSize - 1),
                        paint
                    )
                    // 하이라이트
                    paint.color = Color.argb(50, 255, 255, 255)
                    canvas.drawRect(left + 1, top + 1, left + cellSize - 1, top + cellSize * 0.3f, paint)
                    paint.color = getBlockColor(piece.colorId)
                }
            }
        }

        // 그리드 선
        drawGridLines(canvas, paint, cellSize, totalW, totalH)

        return bitmap
    }

    private fun drawGridLines(canvas: Canvas, paint: Paint, cellSize: Float, totalW: Int, totalH: Int) {
        paint.color = Color.parseColor("#222244")
        paint.strokeWidth = 1f
        paint.style = Paint.Style.FILL
        for (x in 0..GRID_COLS) {
            canvas.drawLine(x * cellSize, 0f, x * cellSize, totalH.toFloat(), paint)
        }
        for (y in 0..GRID_ROWS) {
            canvas.drawLine(0f, y * cellSize, totalW.toFloat(), y * cellSize, paint)
        }
    }

    private fun getBlockColor(colorId: Int): Int {
        if (colorId <= 0) return Color.parseColor("#1A1A2E")
        if (colorId == 99) return Color.parseColor("#666688") // 페널티 줄
        val hex = TetrisGameEngine.COLOR_PALETTE[(colorId - 1) % TetrisGameEngine.COLOR_PALETTE.size]
        return Color.parseColor(hex)
    }
}
