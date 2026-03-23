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
import android.widget.RemoteViews
import com.limheerae.Today_I_did.MainActivity
import com.limheerae.Today_I_did.R

class TetrisWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_MOVE_LEFT = "com.limheerae.Today_I_did.MOVE_LEFT"
        const val ACTION_MOVE_RIGHT = "com.limheerae.Today_I_did.MOVE_RIGHT"
        const val ACTION_ROTATE = "com.limheerae.Today_I_did.ROTATE"
        const val ACTION_MOVE_DOWN = "com.limheerae.Today_I_did.MOVE_DOWN"
        const val ACTION_REFRESH = "com.limheerae.Today_I_did.REFRESH"
        const val ACTION_OPEN_APP = "com.limheerae.Today_I_did.OPEN_APP"
        const val ACTION_TOGGLE_OPACITY = "com.limheerae.Today_I_did.TOGGLE_OPACITY"

        private const val BOARD_WIDTH = 240
        private const val BOARD_HEIGHT = 288
        private const val NEXT_BLOCK_SIZE = 80
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

    private fun renderAndPush(context: Context, state: GameState) {
        val views = RemoteViews(context.packageName, R.layout.widget_tetris)
        val bgAlpha = getOpacityLevel(context)

        // 위젯 루트 배경 투명도 반영
        val rootBgColor = Color.argb(bgAlpha, 15, 15, 35)
        views.setInt(R.id.widget_root, "setBackgroundColor", rootBgColor)

        // 투명도 % 텍스트 표시
        val opacityIdx = OPACITY_LEVELS.indexOf(bgAlpha).let { if (it < 0) 0 else it }
        views.setTextViewText(R.id.btn_opacity, OPACITY_LABELS[opacityIdx])

        // 게임 보드 렌더링
        val bitmap = WidgetRenderer.renderGrid(state, BOARD_WIDTH, BOARD_HEIGHT, bgAlpha)
        views.setImageViewBitmap(R.id.game_board, bitmap)

        // NEXT 블록 렌더링 (블록 없으면 + 아이콘 표시)
        val nextBlock = if (state.blockQueue.isNotEmpty()) state.blockQueue[0] else null
        val nextBitmap = WidgetRenderer.renderNextBlock(
            nextBlock?.type, nextBlock?.colorId ?: 0, NEXT_BLOCK_SIZE, bgAlpha
        )
        views.setImageViewBitmap(R.id.next_block, nextBitmap)

        // NEXT 박스 탭 → 항상 앱 열기
        views.setOnClickPendingIntent(R.id.next_block, createOpenAppPendingIntent(context))

        // 점수
        views.setTextViewText(R.id.score_text, "${state.score}")

        // 새로고침 버튼: 비활성화(회색) / GAME OVER 시 활성화(녹색)
        if (state.gameOver) {
            views.setImageViewResource(R.id.btn_refresh, R.drawable.ic_refresh_pixel_active)
            views.setOnClickPendingIntent(R.id.btn_refresh, createPendingIntent(context, ACTION_REFRESH))
        } else {
            views.setImageViewResource(R.id.btn_refresh, R.drawable.ic_refresh_pixel)
            // 비활성화: 아무 동작 안 함
            views.setOnClickPendingIntent(R.id.btn_refresh, createPendingIntent(context, "NOOP"))
        }

        // 버튼 바인딩
        views.setOnClickPendingIntent(R.id.btn_left, createPendingIntent(context, ACTION_MOVE_LEFT))
        views.setOnClickPendingIntent(R.id.btn_right, createPendingIntent(context, ACTION_MOVE_RIGHT))
        views.setOnClickPendingIntent(R.id.btn_rotate, createPendingIntent(context, ACTION_ROTATE))
        views.setOnClickPendingIntent(R.id.btn_down, createPendingIntent(context, ACTION_MOVE_DOWN))
        views.setOnClickPendingIntent(R.id.btn_opacity, createPendingIntent(context, ACTION_TOGGLE_OPACITY))

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
