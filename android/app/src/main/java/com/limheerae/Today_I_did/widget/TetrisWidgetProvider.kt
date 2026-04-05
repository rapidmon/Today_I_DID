package com.limheerae.Today_I_did.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.RemoteViews
import com.limheerae.Today_I_did.MainActivity
import com.limheerae.Today_I_did.R
import org.json.JSONArray
import org.json.JSONObject

class TetrisWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_MOVE_LEFT = "com.limheerae.Today_I_did.MOVE_LEFT"
        const val ACTION_MOVE_RIGHT = "com.limheerae.Today_I_did.MOVE_RIGHT"
        const val ACTION_ROTATE = "com.limheerae.Today_I_did.ROTATE"
        const val ACTION_MOVE_DOWN = "com.limheerae.Today_I_did.MOVE_DOWN"
        const val ACTION_REFRESH = "com.limheerae.Today_I_did.REFRESH"
        const val ACTION_OPEN_APP = "com.limheerae.Today_I_did.OPEN_APP"
        const val ACTION_TOGGLE_OPACITY = "com.limheerae.Today_I_did.TOGGLE_OPACITY"

        private const val BOARD_WIDTH = 320
        private const val BOARD_HEIGHT = 384
        private const val NEXT_BLOCK_SIZE = 120
        private const val PREFS_NAME = "tetris_widget"

        // 투명도 단계: 0%(255) → 20%(204) → 40%(153) → 60%(102) → 80%(51)
        private val OPACITY_LEVELS = intArrayOf(255, 204, 153, 102, 51)
        private val OPACITY_LABELS = arrayOf("0%", "20%", "40%", "60%", "80%")
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (widgetId in appWidgetIds) {
            updateWidget(context)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        when (intent.action) {
            ACTION_OPEN_APP -> {
                val launchIntent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(launchIntent)
                return
            }
            ACTION_TOGGLE_OPACITY -> {
                cycleOpacity(context)
                updateWidget(context)
                return
            }
            ACTION_REFRESH -> {
                val currentState = TetrisGameEngine.loadState(context)
                if (currentState.gameOver) {
                    TetrisGameEngine.resetGame(context)
                } else {
                    TetrisGameEngine.applyPenalties(context)
                }
                updateWidget(context)
                return
            }
            ACTION_MOVE_LEFT -> {
                val state = TetrisGameEngine.processAction(context, "move_left")
                updateWidget(context, state)
                return
            }
            ACTION_MOVE_RIGHT -> {
                val state = TetrisGameEngine.processAction(context, "move_right")
                updateWidget(context, state)
                return
            }
            ACTION_ROTATE -> {
                val state = TetrisGameEngine.processAction(context, "rotate")
                updateWidget(context, state)
                return
            }
            ACTION_MOVE_DOWN -> {
                val state = TetrisGameEngine.processAction(context, "move_down")
                if (state.animationState == "highlight") {
                    updateWidget(context, state)
                    startLineClearAnimation(context)
                } else {
                    updateWidget(context, state)
                }
                return
            }
            else -> return
        }
    }

    private fun updateWidget(context: Context, state: GameState) {
        renderAndPush(context, state)
    }

    private fun updateWidget(context: Context) {
        val state = TetrisGameEngine.loadState(context)
        renderAndPush(context, state)
    }

    private fun getOpacityLevel(context: Context): Int {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getInt("bgAlpha", OPACITY_LEVELS[0])
    }

    private fun cycleOpacity(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val current = prefs.getInt("bgAlpha", OPACITY_LEVELS[0])
        val currentIdx = OPACITY_LEVELS.indexOf(current)
        val nextIdx = if (currentIdx < 0) 1 else (currentIdx + 1) % OPACITY_LEVELS.size
        prefs.edit().putInt("bgAlpha", OPACITY_LEVELS[nextIdx]).apply()
    }

    private fun dpToPx(context: Context, dp: Float): Float {
        return dp * context.resources.displayMetrics.density
    }

    private fun renderAndPush(context: Context, state: GameState) {
        val views = RemoteViews(context.packageName, R.layout.widget_tetris)
        val bgAlpha = getOpacityLevel(context)
        val textSize = dpToPx(context, 16f)
        val titleSize = dpToPx(context, 12f)

        // 위젯 루트 배경 투명도 반영
        val rootBgColor = Color.argb(bgAlpha, 0, 0, 0)
        views.setInt(R.id.widget_root, "setBackgroundColor", rootBgColor)

        // 빈 영역 탭 시 앱 열리지 않도록 NOOP 클릭 설정
        views.setOnClickPendingIntent(R.id.widget_root, createPendingIntent(context, "NOOP"))

        // === 헤더 텍스트 (Bitmap 렌더링) ===
        // NEW 버튼
        val newColor = if (state.gameOver) 0xFF00F0FF.toInt() else 0xFF555577.toInt()
        views.setImageViewBitmap(R.id.btn_refresh, WidgetRenderer.renderText(context, "NEW", textSize, newColor))
        if (state.gameOver) {
            views.setOnClickPendingIntent(R.id.btn_refresh, createPendingIntent(context, ACTION_REFRESH))
        } else {
            views.setOnClickPendingIntent(R.id.btn_refresh, createPendingIntent(context, "NOOP"))
        }

        // TODAY I DID 타이틀
        views.setImageViewBitmap(R.id.title_image, WidgetRenderer.renderText(context, "TODAY I DID", titleSize, 0x6600F0FF))

        // 투명도 %
        val opacityIdx = OPACITY_LEVELS.indexOf(bgAlpha).let { if (it < 0) 0 else it }
        views.setImageViewBitmap(R.id.btn_opacity, WidgetRenderer.renderText(context, OPACITY_LABELS[opacityIdx], textSize, 0xFFFFE500.toInt()))
        views.setOnClickPendingIntent(R.id.btn_opacity, createPendingIntent(context, ACTION_TOGGLE_OPACITY))

        // === 게임 보드 ===
        val bitmap = WidgetRenderer.renderGrid(state, BOARD_WIDTH, BOARD_HEIGHT, bgAlpha)
        views.setImageViewBitmap(R.id.game_board, bitmap)

        // === 사이드패널 라벨+값 (Bitmap 렌더링) ===
        views.setImageViewBitmap(R.id.next_label, WidgetRenderer.renderText(context, "NEXT", textSize, 0x7700F0FF))
        views.setImageViewBitmap(R.id.score_label, WidgetRenderer.renderText(context, "SCORE", textSize, 0x77FFE500))
        views.setImageViewBitmap(R.id.score_text, WidgetRenderer.renderText(context, "${state.score}", textSize, 0xFFFFE500.toInt()))

        // === TODO 영역 ===
        views.setImageViewBitmap(R.id.todo_label, WidgetRenderer.renderText(context, "TODO", textSize, 0x77FF00E5))
        renderTodoItems(context, views, state.gameOver)

        // NEXT 블록 렌더링
        if (state.gameOver) {
            // GAME OVER: NEXT에 - 표시 + 클릭 비활성
            val emptyBitmap = WidgetRenderer.renderEmptyNextBlock(NEXT_BLOCK_SIZE, bgAlpha)
            views.setImageViewBitmap(R.id.next_block, emptyBitmap)
            views.setOnClickPendingIntent(R.id.next_block, createPendingIntent(context, "NOOP"))
        } else {
            val nextBlock = if (state.blockQueue.isNotEmpty()) state.blockQueue[0] else null
            val nextBitmap = WidgetRenderer.renderNextBlock(
                nextBlock?.type, nextBlock?.colorId ?: 0, NEXT_BLOCK_SIZE, bgAlpha
            )
            views.setImageViewBitmap(R.id.next_block, nextBitmap)
            views.setOnClickPendingIntent(R.id.next_block, createOpenAppPendingIntent(context))
        }

        // === 조작 버튼 (삼각형 아이콘) ===
        val iconSize = dpToPx(context, 18f).toInt()
        if (state.gameOver) {
            val mutedColor = 0xFF333355.toInt()
            views.setImageViewBitmap(R.id.btn_left, WidgetRenderer.renderTriangleIcon(iconSize, mutedColor, "left"))
            views.setImageViewBitmap(R.id.btn_right, WidgetRenderer.renderTriangleIcon(iconSize, mutedColor, "right"))
            views.setImageViewBitmap(R.id.btn_down, WidgetRenderer.renderTriangleIcon(iconSize, mutedColor, "down"))
            views.setImageViewBitmap(R.id.btn_rotate, WidgetRenderer.renderRotateIcon(iconSize, mutedColor))
            views.setOnClickPendingIntent(R.id.btn_left, createPendingIntent(context, "NOOP"))
            views.setOnClickPendingIntent(R.id.btn_right, createPendingIntent(context, "NOOP"))
            views.setOnClickPendingIntent(R.id.btn_rotate, createPendingIntent(context, "NOOP"))
            views.setOnClickPendingIntent(R.id.btn_down, createPendingIntent(context, "NOOP"))
        } else {
            val cyanColor = 0xFF00F0FF.toInt()
            val greenColor = 0xFF00FF88.toInt()
            val yellowColor = 0xFFFFE500.toInt()
            views.setImageViewBitmap(R.id.btn_left, WidgetRenderer.renderTriangleIcon(iconSize, cyanColor, "left"))
            views.setImageViewBitmap(R.id.btn_right, WidgetRenderer.renderTriangleIcon(iconSize, cyanColor, "right"))
            views.setImageViewBitmap(R.id.btn_down, WidgetRenderer.renderTriangleIcon(iconSize, greenColor, "down"))
            views.setImageViewBitmap(R.id.btn_rotate, WidgetRenderer.renderRotateIcon(iconSize, yellowColor))
            views.setOnClickPendingIntent(R.id.btn_left, createPendingIntent(context, ACTION_MOVE_LEFT))
            views.setOnClickPendingIntent(R.id.btn_right, createPendingIntent(context, ACTION_MOVE_RIGHT))
            views.setOnClickPendingIntent(R.id.btn_rotate, createPendingIntent(context, ACTION_ROTATE))
            views.setOnClickPendingIntent(R.id.btn_down, createPendingIntent(context, ACTION_MOVE_DOWN))
        }

        val manager = AppWidgetManager.getInstance(context)
        val component = ComponentName(context, TetrisWidgetProvider::class.java)
        manager.updateAppWidget(component, views)
    }

    private fun startLineClearAnimation(context: Context) {
        val handler = Handler(Looper.getMainLooper())

        handler.postDelayed({
            TetrisGameEngine.advanceAnimation(context)
            updateWidget(context)

            handler.postDelayed({
                TetrisGameEngine.advanceAnimation(context)
                updateWidget(context)
            }, 300)
        }, 300)
    }

    private fun renderTodoItems(context: Context, views: RemoteViews, isGameOver: Boolean = false) {
        val todoTextSize = dpToPx(context, 14f)
        val todoColor = 0xE6888899.toInt()
        val maxWidth = dpToPx(context, 55f).toInt()

        val todoRowIds = intArrayOf(R.id.todo_row_1, R.id.todo_row_2, R.id.todo_row_3, R.id.todo_row_4)
        val todoTextIds = intArrayOf(R.id.todo_text_1, R.id.todo_text_2, R.id.todo_text_3, R.id.todo_text_4)

        val pendingTasks = getPendingTasks(context)

        if (isGameOver) {
            // GAME OVER: T_T — 정중앙 (todo_center_text 사용)
            for (id in todoRowIds) views.setViewVisibility(id, View.GONE)
            views.setViewVisibility(R.id.todo_center_text, View.VISIBLE)
            views.setImageViewBitmap(
                R.id.todo_center_text,
                WidgetRenderer.renderText(context, "T_T", dpToPx(context, 14f), 0x4DFF00E5)
            )
            return
        }

        if (pendingTasks.isEmpty()) {
            // ALL DONE — 정중앙
            for (id in todoRowIds) views.setViewVisibility(id, View.GONE)
            views.setViewVisibility(R.id.todo_center_text, View.VISIBLE)
            views.setImageViewBitmap(
                R.id.todo_center_text,
                WidgetRenderer.renderText(context, "ALL DONE!", dpToPx(context, 11f), 0x66555577)
            )
            return
        }

        // 할 일이 있으면 중앙 텍스트 숨김
        views.setViewVisibility(R.id.todo_center_text, View.GONE)

        for (i in todoRowIds.indices) {
            if (i < pendingTasks.size) {
                views.setViewVisibility(todoRowIds[i], View.VISIBLE)
                views.setImageViewBitmap(
                    todoTextIds[i],
                    WidgetRenderer.renderTodoText(context, pendingTasks[i], todoTextSize, todoColor, maxWidth)
                )
            } else {
                views.setViewVisibility(todoRowIds[i], View.GONE)
            }
        }
    }

    private fun getPendingTasks(context: Context): List<String> {
        val prefs = context.getSharedPreferences("TodayIDid_tasks", Context.MODE_PRIVATE)
        val tasksJson = prefs.getString("tasks", "[]") ?: "[]"
        val tasks = mutableListOf<String>()
        try {
            val arr = JSONArray(tasksJson)
            for (i in 0 until arr.length()) {
                val task = arr.getJSONObject(i)
                if (task.optString("status") == "pending") {
                    tasks.add(task.optString("content", ""))
                    if (tasks.size >= 4) break
                }
            }
        } catch (_: Exception) {}
        return tasks
    }

    private fun createPendingIntent(context: Context, action: String): PendingIntent {
        val intent = Intent(context, TetrisWidgetProvider::class.java).apply {
            this.action = action
        }
        return PendingIntent.getBroadcast(
            context,
            action.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun createOpenAppPendingIntent(context: Context): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        return PendingIntent.getActivity(
            context,
            ACTION_OPEN_APP.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
