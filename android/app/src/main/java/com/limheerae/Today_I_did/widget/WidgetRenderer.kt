package com.limheerae.Today_I_did.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Path
import android.graphics.Typeface
import androidx.core.content.res.ResourcesCompat
import com.limheerae.Today_I_did.R

object WidgetRenderer {
    private const val GRID_COLS = 10
    private const val GRID_ROWS = 12
    private var cachedTypeface: Typeface? = null

    private fun getTypeface(context: Context): Typeface {
        return cachedTypeface ?: ResourcesCompat.getFont(context, R.font.press_start_2p)?.also {
            cachedTypeface = it
        } ?: Typeface.MONOSPACE
    }

    // 픽셀 폰트로 텍스트를 Bitmap으로 렌더링
    fun renderText(
        context: Context,
        text: String,
        textSizePx: Float,
        textColor: Int,
        align: Paint.Align = Paint.Align.CENTER
    ): Bitmap {
        val typeface = getTypeface(context)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.typeface = typeface
            this.textSize = textSizePx
            this.color = textColor
            this.textAlign = align
        }
        val bounds = Rect()
        paint.getTextBounds(text, 0, text.length, bounds)
        val w = bounds.width() + 6
        val h = bounds.height() + 6
        if (w <= 0 || h <= 0) return Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)

        val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val x = if (align == Paint.Align.CENTER) w / 2f else 3f
        val y = -bounds.top.toFloat() + 3
        canvas.drawText(text, x, y, paint)
        return bitmap
    }

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

        // Game Over: 실제 블록을 흐리게 + 반투명 오버레이 + GAME OVER 텍스트
        if (state.gameOver) {
            // 실제 블록들 렌더링 (흐리게)
            for (y in 0 until GRID_ROWS) {
                for (x in 0 until GRID_COLS) {
                    val left = x * cellSize
                    val top = y * cellSize
                    val rect = RectF(left + 1, top + 1, left + cellSize - 1, top + cellSize - 1)
                    val colorValue = state.grid[y][x]
                    if (colorValue != 0) {
                        drawGlossyBlock(canvas, paint, left, top, cellSize, getBlockColor(colorValue))
                    } else {
                        paint.color = Color.argb(minOf(bgAlpha, 100), 26, 26, 46)
                        canvas.drawRect(rect, paint)
                    }
                }
            }

            drawGridLines(canvas, paint, cellSize, totalW, totalH)

            // 반투명 어두운 오버레이 (블록이 흐리게 보이도록)
            paint.color = Color.argb(140, 0, 0, 0)
            paint.style = Paint.Style.FILL
            canvas.drawRect(RectF(0f, 0f, totalW.toFloat(), totalH.toFloat()), paint)

            // GAME OVER 텍스트 (PressStart2P 폰트)
            paint.typeface = cachedTypeface ?: Typeface.MONOSPACE
            paint.textSize = cellSize * 1.6f
            paint.color = Color.parseColor("#FF3355")
            paint.textAlign = Paint.Align.CENTER
            paint.style = Paint.Style.FILL
            canvas.drawText("GAME OVER", totalW / 2f, totalH / 2f + cellSize * 0.4f, paint)

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
            // 블록 없으면 얇은 + 아이콘
            val cx = size / 2f
            val cy = size / 2f
            val lineLen = size * 0.3f
            paint.color = Color.parseColor("#00F0FF")
            paint.style = Paint.Style.STROKE
            paint.strokeWidth = size * 0.04f
            paint.strokeCap = Paint.Cap.ROUND
            // 가로선
            canvas.drawLine(cx - lineLen, cy, cx + lineLen, cy, paint)
            // 세로선
            canvas.drawLine(cx, cy - lineLen, cx, cy + lineLen, paint)
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

        val cellSize = size.toFloat() / maxOf(cols, rows, 4) * 0.95f
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

    // GAME OVER 시 빈 NEXT 블록 (- 표시)
    fun renderEmptyNextBlock(size: Int, bgAlpha: Int = 204): Bitmap {
        val bitmap = Bitmap.createBitmap(maxOf(size, 1), maxOf(size, 1), Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint().apply { isAntiAlias = false }
        canvas.drawColor(Color.argb(minOf(bgAlpha, 80), 26, 26, 46))
        val cx = size / 2f
        val cy = size / 2f
        val lineLen = size * 0.2f
        paint.color = Color.argb(50, 85, 85, 119)
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = size * 0.03f
        paint.strokeCap = Paint.Cap.ROUND
        canvas.drawLine(cx - lineLen, cy, cx + lineLen, cy, paint)
        return bitmap
    }

    // 고전 테트리스 3D 베벨 블록 (글로시 없음, 뚜렷한 베벨)
    private fun drawGlossyBlock(canvas: Canvas, paint: Paint, left: Float, top: Float, cellSize: Float, color: Int) {
        val inset = 0.5f
        val l = left + inset
        val t = top + inset
        val r = left + cellSize - inset
        val b = top + cellSize - inset
        val bevelW = 2f

        paint.shader = null
        paint.style = Paint.Style.FILL

        // 베이스 색상
        paint.color = color
        canvas.drawRect(RectF(l, t, r, b), paint)

        // 상단 밝은 베벨 (55% 흰색)
        paint.color = Color.argb(140, 255, 255, 255)
        canvas.drawRect(RectF(l, t, r, t + bevelW), paint)

        // 좌측 밝은 베벨 (45% 흰색)
        paint.color = Color.argb(115, 255, 255, 255)
        canvas.drawRect(RectF(l, t, l + bevelW, b), paint)

        // 하단 어두운 베벨 (55% 검정)
        paint.color = Color.argb(140, 0, 0, 0)
        canvas.drawRect(RectF(l, b - bevelW, r, b), paint)

        // 우측 어두운 베벨 (50% 검정)
        paint.color = Color.argb(128, 0, 0, 0)
        canvas.drawRect(RectF(r - bevelW, t, r, b), paint)
    }

    private fun drawGridLines(canvas: Canvas, paint: Paint, cellSize: Float, totalW: Int, totalH: Int) {
        paint.color = Color.argb(60, 0, 240, 255)
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

    // TODO 항목용 텍스트 렌더링 (Inter 폰트, 좌측 정렬, 말줄임)
    fun renderTodoText(
        context: Context,
        text: String,
        textSizePx: Float,
        textColor: Int,
        maxWidthPx: Int
    ): Bitmap {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            typeface = Typeface.create("sans-serif", Typeface.NORMAL)
            this.textSize = textSizePx
            this.color = textColor
            this.textAlign = Paint.Align.LEFT
        }

        // 말줄임 처리
        var displayText = text
        val ellipsis = "..."
        if (paint.measureText(text) > maxWidthPx) {
            var end = text.length
            while (end > 0 && paint.measureText(text.substring(0, end) + ellipsis) > maxWidthPx) {
                end--
            }
            displayText = text.substring(0, end) + ellipsis
        }

        // 고정 높이: fontMetrics 기반으로 모든 텍스트가 동일 크기 비트맵 생성
        val fm = paint.fontMetrics
        val fixedH = (-fm.top + fm.bottom + 4).toInt()
        val w = maxOf(maxWidthPx, 1)

        val bitmap = Bitmap.createBitmap(w, fixedH, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawText(displayText, 2f, -fm.top + 2, paint)
        return bitmap
    }

    // 삼각형 버튼 아이콘 렌더링
    fun renderTriangleIcon(size: Int, color: Int, direction: String): Bitmap {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.color = color
            style = Paint.Style.FILL
        }

        val pad = size * 0.25f
        val path = Path()

        when (direction) {
            "left" -> {
                path.moveTo(pad, size / 2f)
                path.lineTo(size - pad, pad)
                path.lineTo(size - pad, size - pad)
                path.close()
            }
            "right" -> {
                path.moveTo(size - pad, size / 2f)
                path.lineTo(pad, pad)
                path.lineTo(pad, size - pad)
                path.close()
            }
            "down" -> {
                path.moveTo(size / 2f, size - pad)
                path.lineTo(pad, pad)
                path.lineTo(size - pad, pad)
                path.close()
            }
        }

        canvas.drawPath(path, paint)
        return bitmap
    }

    // 회전 아이콘 렌더링 (원호 + 화살촉)
    fun renderRotateIcon(size: Int, color: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.color = color
            style = Paint.Style.STROKE
            strokeWidth = size * 0.12f
            strokeCap = Paint.Cap.ROUND
        }

        val pad = size * 0.22f
        val rect = RectF(pad, pad, size - pad, size - pad)
        // 270도 원호 (위쪽이 열림)
        canvas.drawArc(rect, -60f, 280f, false, paint)

        // 화살촉
        paint.style = Paint.Style.FILL
        val arrowPath = Path()
        val cx = size / 2f + (size / 2f - pad) * Math.cos(Math.toRadians(-60.0)).toFloat()
        val cy = size / 2f + (size / 2f - pad) * Math.sin(Math.toRadians(-60.0)).toFloat()
        val arrowSize = size * 0.18f
        arrowPath.moveTo(cx + arrowSize, cy - arrowSize * 0.3f)
        arrowPath.lineTo(cx - arrowSize * 0.2f, cy - arrowSize * 1.2f)
        arrowPath.lineTo(cx - arrowSize * 0.2f, cy + arrowSize * 0.6f)
        arrowPath.close()
        canvas.drawPath(arrowPath, paint)

        return bitmap
    }

    fun getBlockColor(colorId: Int): Int {
        if (colorId <= 0) return Color.parseColor("#1A1A2E")
        if (colorId == 99) return Color.parseColor("#666688")
        val hex = TetrisGameEngine.COLOR_PALETTE[(colorId - 1) % TetrisGameEngine.COLOR_PALETTE.size]
        return Color.parseColor(hex)
    }
}
