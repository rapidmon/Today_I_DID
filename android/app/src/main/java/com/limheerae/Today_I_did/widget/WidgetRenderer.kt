package com.limheerae.Today_I_did.widget

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface

object WidgetRenderer {
    private const val GRID_COLS = 10
    private const val GRID_ROWS = 12

    fun renderGrid(state: GameState, width: Int, height: Int, bgAlpha: Int = 204): Bitmap {
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

        // 반투명 배경
        canvas.drawColor(Color.argb(bgAlpha, 10, 10, 26))

        // Game Over: 보드 전체 회색 + 픽셀아트 GAME OVER 이미지
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

            drawGridLines(canvas, paint, cellSize, totalW, totalH)
            drawPixelGameOver(canvas, paint, totalW, totalH, cellSize)

            return bitmap
        }

        // 일반 게임 상태: 그리드 셀
        for (y in 0 until GRID_ROWS) {
            for (x in 0 until GRID_COLS) {
                val left = x * cellSize
                val top = y * cellSize
                val rect = RectF(left + 1, top + 1, left + cellSize - 1, top + cellSize - 1)

                val colorValue = state.grid[y][x]

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
                    drawGlossyBlock(canvas, paint, left, top, cellSize, getBlockColor(colorValue))
                } else {
                    // 빈 셀
                    paint.color = Color.argb(minOf(bgAlpha, 100), 26, 26, 46)
                    canvas.drawRect(rect, paint)
                }
            }
        }

        // 활성 블록
        state.activePiece?.let { piece ->
            val cells = TetrisGameEngine.getAbsoluteCells(piece.type, piece.rotation, piece.position)
            val blockColor = getBlockColor(piece.colorId)
            for ((x, y) in cells) {
                if (x in 0 until GRID_COLS && y in 0 until GRID_ROWS) {
                    val left = x * cellSize
                    val top = y * cellSize
                    drawGlossyBlock(canvas, paint, left, top, cellSize, blockColor)
                }
            }
        }

        drawGridLines(canvas, paint, cellSize, totalW, totalH)

        return bitmap
    }

    // NEXT 블록 미리보기 렌더링
    fun renderNextBlock(blockType: String?, colorId: Int, size: Int, bgAlpha: Int = 204): Bitmap {
        val bitmap = Bitmap.createBitmap(maxOf(size, 1), maxOf(size, 1), Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint().apply { isAntiAlias = false }

        // 반투명 배경
        canvas.drawColor(Color.argb(minOf(bgAlpha, 80), 26, 26, 46))

        if (blockType == null) {
            // 블록 없으면 픽셀아트 + 아이콘 표시
            val pxSize = size / 9f
            val cx = size / 2f
            val cy = size / 2f
            paint.color = Color.parseColor("#0088FF")
            paint.style = Paint.Style.FILL
            // 가로줄 (5칸)
            for (i in -2..2) {
                canvas.drawRect(
                    cx + i * pxSize - pxSize / 2, cy - pxSize / 2,
                    cx + i * pxSize + pxSize / 2, cy + pxSize / 2, paint)
            }
            // 세로줄 (5칸, 중앙 제외 4칸)
            for (i in -2..2) {
                if (i == 0) continue
                canvas.drawRect(
                    cx - pxSize / 2, cy + i * pxSize - pxSize / 2,
                    cx + pxSize / 2, cy + i * pxSize + pxSize / 2, paint)
            }
            return bitmap
        }

        val shape = TetrisGameEngine.getAbsoluteCells(blockType, 0, Position(0, 0))
        if (shape.isEmpty()) return bitmap

        // 바운딩 박스 계산
        val minX = shape.minOf { it.x }
        val maxX = shape.maxOf { it.x }
        val minY = shape.minOf { it.y }
        val maxY = shape.maxOf { it.y }
        val cols = maxX - minX + 1
        val rows = maxY - minY + 1

        val cellSize = size.toFloat() / maxOf(cols, rows, 4) * 0.8f
        val offsetX = (size - cols * cellSize) / 2f
        val offsetY = (size - rows * cellSize) / 2f

        val color = getBlockColor(colorId)
        for (cell in shape) {
            val left = offsetX + (cell.x - minX) * cellSize
            val top = offsetY + (cell.y - minY) * cellSize
            drawGlossyBlock(canvas, paint, left, top, cellSize, color)
        }

        return bitmap
    }

    private fun drawGlossyBlock(canvas: Canvas, paint: Paint, left: Float, top: Float, cellSize: Float, color: Int) {
        val inset = 1f
        val l = left + inset
        val t = top + inset
        val r = left + cellSize - inset
        val b = top + cellSize - inset
        val bevelW = cellSize * 0.15f

        paint.shader = null
        paint.style = Paint.Style.FILL
        paint.color = color
        canvas.drawRect(RectF(l, t, r, b), paint)

        // 윗면 + 왼쪽 밝은 베벨
        paint.color = Color.argb(100, 255, 255, 255)
        canvas.drawRect(RectF(l, t, r, t + bevelW), paint)
        canvas.drawRect(RectF(l, t, l + bevelW, b), paint)

        // 아랫면 + 오른쪽 어두운 베벨
        paint.color = Color.argb(120, 0, 0, 0)
        canvas.drawRect(RectF(l, b - bevelW, r, b), paint)
        canvas.drawRect(RectF(r - bevelW, t, r, b), paint)

        // 중앙 글로시 반사
        paint.shader = LinearGradient(
            l, t, l, t + cellSize * 0.5f,
            Color.argb(70, 255, 255, 255),
            Color.argb(0, 255, 255, 255),
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(RectF(l + bevelW, t + bevelW, r - bevelW, t + cellSize * 0.5f), paint)
        paint.shader = null
    }

    private fun drawGridLines(canvas: Canvas, paint: Paint, cellSize: Float, totalW: Int, totalH: Int) {
        paint.color = Color.argb(140, 34, 34, 68)
        paint.strokeWidth = 1f
        paint.style = Paint.Style.FILL
        for (x in 0..GRID_COLS) {
            canvas.drawLine(x * cellSize, 0f, x * cellSize, totalH.toFloat(), paint)
        }
        for (y in 0..GRID_ROWS) {
            canvas.drawLine(0f, y * cellSize, totalW.toFloat(), y * cellSize, paint)
        }
    }

    // 투명도 레벨 바 렌더링 (사운드바 스타일, 4칸)
    fun renderOpacityBar(level: Int, width: Int, height: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(maxOf(width, 1), maxOf(height, 1), Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint().apply { isAntiAlias = true }

        val totalBars = 4
        val gap = 3f
        val barWidth = (width.toFloat() - gap * (totalBars + 1)) / totalBars
        val barMaxHeight = height * 0.7f
        val barMinHeight = height * 0.25f
        val bottomY = height * 0.85f

        for (i in 0 until totalBars) {
            val barH = barMinHeight + (barMaxHeight - barMinHeight) * (i.toFloat() / (totalBars - 1))
            val left = gap + i * (barWidth + gap)
            val top = bottomY - barH
            val right = left + barWidth
            val bottom = bottomY
            val rect = RectF(left, top, right, bottom)

            if (i < level) {
                // 채워진 칸 — 밝은 노란색
                paint.color = Color.parseColor("#FFDD00")
                canvas.drawRoundRect(rect, 2f, 2f, paint)
            } else {
                // 빈 칸 — 어두운 회색
                paint.color = Color.parseColor("#333366")
                canvas.drawRoundRect(rect, 2f, 2f, paint)
            }
        }

        return bitmap
    }

    // 픽셀아트 GAME OVER (업로드된 이미지 기반 — 빨간색)
    private fun drawPixelGameOver(canvas: Canvas, paint: Paint, totalW: Int, totalH: Int, cellSize: Float) {
        // 각 글자를 5x7 픽셀 그리드로 정의 (1=채움, 0=빈칸)
        val G = arrayOf(
            intArrayOf(0,1,1,1,0),
            intArrayOf(1,0,0,0,0),
            intArrayOf(1,0,0,0,0),
            intArrayOf(1,0,1,1,0),
            intArrayOf(1,0,0,1,0),
            intArrayOf(1,0,0,1,0),
            intArrayOf(0,1,1,1,0),
        )
        val A = arrayOf(
            intArrayOf(0,1,1,1,0),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,1,1,1,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
        )
        val M = arrayOf(
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,1,0,1,1),
            intArrayOf(1,0,1,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
        )
        val E = arrayOf(
            intArrayOf(1,1,1,1,1),
            intArrayOf(1,0,0,0,0),
            intArrayOf(1,0,0,0,0),
            intArrayOf(1,1,1,1,0),
            intArrayOf(1,0,0,0,0),
            intArrayOf(1,0,0,0,0),
            intArrayOf(1,1,1,1,1),
        )
        val O = arrayOf(
            intArrayOf(0,1,1,1,0),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(0,1,1,1,0),
        )
        val V = arrayOf(
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(0,1,0,1,0),
            intArrayOf(0,1,0,1,0),
            intArrayOf(0,0,1,0,0),
        )
        val R = arrayOf(
            intArrayOf(1,1,1,1,0),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,0,0,0,1),
            intArrayOf(1,1,1,1,0),
            intArrayOf(1,0,1,0,0),
            intArrayOf(1,0,0,1,0),
            intArrayOf(1,0,0,0,1),
        )

        val line1 = arrayOf(G, A, M, E)
        val line2 = arrayOf(O, V, E, R)

        val charW = 5
        val charH = 7
        val gap = 1
        val totalCharsW = charW * 4 + gap * 3 // 23 pixels wide
        val totalCharsH = charH * 2 + 2 // 16 pixels tall (2 lines + gap)

        val pixelSize = minOf(totalW.toFloat() / (totalCharsW + 4), totalH.toFloat() / (totalCharsH + 4))
        val startX = (totalW - totalCharsW * pixelSize) / 2f
        val startY = (totalH - totalCharsH * pixelSize) / 2f

        // 배경 박스
        val pad = pixelSize * 1.5f
        paint.color = Color.argb(230, 10, 10, 26)
        paint.style = Paint.Style.FILL
        canvas.drawRect(
            RectF(startX - pad, startY - pad,
                startX + totalCharsW * pixelSize + pad,
                startY + totalCharsH * pixelSize + pad),
            paint
        )

        // 글자 그리기 (빨간색)
        paint.color = Color.parseColor("#FF0000")
        fun drawLine(letters: Array<Array<IntArray>>, offsetY: Float) {
            for ((li, letter) in letters.withIndex()) {
                val ox = startX + li * (charW + gap) * pixelSize
                for (row in 0 until charH) {
                    for (col in 0 until charW) {
                        if (letter[row][col] == 1) {
                            val px = ox + col * pixelSize
                            val py = offsetY + row * pixelSize
                            canvas.drawRect(RectF(px, py, px + pixelSize, py + pixelSize), paint)
                        }
                    }
                }
            }
        }

        drawLine(line1, startY)
        drawLine(line2, startY + (charH + 2) * pixelSize)
    }

    fun getBlockColor(colorId: Int): Int {
        if (colorId <= 0) return Color.parseColor("#1A1A2E")
        if (colorId == 99) return Color.parseColor("#666688")
        val hex = TetrisGameEngine.COLOR_PALETTE[(colorId - 1) % TetrisGameEngine.COLOR_PALETTE.size]
        return Color.parseColor(hex)
    }
}
