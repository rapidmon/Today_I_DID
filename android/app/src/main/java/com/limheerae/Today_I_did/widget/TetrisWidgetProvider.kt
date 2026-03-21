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

        private const val BOARD_WIDTH = 240
        private const val BOARD_HEIGHT = 288
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
                // processAction이 저장된 상태를 반환 → 재로드 불필요
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

    // 상태를 직접 받아서 재로드 없이 렌더링 (오버로드)
    private fun updateWidget(context: Context, state: GameState) {
        renderAndPush(context, state)
    }

    // 상태 없이 호출 시 로드 (리프레시/초기화 등)
    private fun updateWidget(context: Context) {
        val state = TetrisGameEngine.loadState(context)
        renderAndPush(context, state)
    }

    private fun renderAndPush(context: Context, state: GameState) {
        val views = RemoteViews(context.packageName, R.layout.widget_tetris)

        val bitmap = WidgetRenderer.renderGrid(state, BOARD_WIDTH, BOARD_HEIGHT)
        views.setImageViewBitmap(R.id.game_board, bitmap)

        views.setTextViewText(R.id.score_text, "SCORE: ${state.score}")
        views.setTextViewText(R.id.stock_text, "STOCK: ${state.blockQueue.size}")

        // GAME OVER 상태에 따른 버튼 색상 변경
        if (state.gameOver) {
            views.setInt(R.id.btn_refresh, "setBackgroundColor", Color.parseColor("#00CC00"))
            views.setInt(R.id.btn_add, "setBackgroundColor", Color.parseColor("#222233"))
            views.setTextColor(R.id.btn_add, Color.parseColor("#444466"))
            views.setOnClickPendingIntent(R.id.btn_add, createPendingIntent(context, "NOOP"))
        } else {
            views.setInt(R.id.btn_refresh, "setBackgroundColor", Color.parseColor("#333366"))
            views.setInt(R.id.btn_add, "setBackgroundColor", Color.parseColor("#0088FF"))
            views.setTextColor(R.id.btn_add, Color.parseColor("#FFFFFF"))
            views.setOnClickPendingIntent(R.id.btn_add, createOpenAppPendingIntent(context))
        }

        views.setOnClickPendingIntent(R.id.btn_left, createPendingIntent(context, ACTION_MOVE_LEFT))
        views.setOnClickPendingIntent(R.id.btn_right, createPendingIntent(context, ACTION_MOVE_RIGHT))
        views.setOnClickPendingIntent(R.id.btn_rotate, createPendingIntent(context, ACTION_ROTATE))
        views.setOnClickPendingIntent(R.id.btn_down, createPendingIntent(context, ACTION_MOVE_DOWN))
        views.setOnClickPendingIntent(R.id.btn_refresh, createPendingIntent(context, ACTION_REFRESH))

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
