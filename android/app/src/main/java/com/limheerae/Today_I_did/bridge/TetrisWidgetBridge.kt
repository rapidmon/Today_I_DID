package com.limheerae.Today_I_did.bridge

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.module.annotations.ReactModule
import com.limheerae.Today_I_did.widget.TetrisGameEngine
import com.limheerae.Today_I_did.widget.TetrisWidgetProvider
import org.json.JSONArray
import org.json.JSONObject

@ReactModule(name = TetrisWidgetBridge.NAME)
class TetrisWidgetBridge(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "TetrisWidgetBridge"
    }

    override fun getName(): String = NAME

    // 블록을 큐에 추가 + 기록 매핑 저장 + 자동 스폰 + 위젯 갱신
    @ReactMethod
    fun addBlockToQueue(type: String, colorId: Double, sourceRecordId: String, content: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)

            // 현재 큐 로드
            val queueJson = prefs.getString("blockQueue", "[]") ?: "[]"
            val queueArr = JSONArray(queueJson)

            // 새 블록 추가
            val blockObj = JSONObject().apply {
                put("type", type)
                put("colorId", colorId.toInt())
                put("sourceRecordId", sourceRecordId)
            }
            queueArr.put(blockObj)

            // recordId → {content, blockType} 매핑 저장
            val recordMapJson = prefs.getString("recordMap", "{}") ?: "{}"
            val recordMap = JSONObject(recordMapJson)
            recordMap.put(sourceRecordId, JSONObject().apply {
                put("content", content)
                put("blockType", type)
            })

            prefs.edit()
                .putString("blockQueue", queueArr.toString())
                .putString("recordMap", recordMap.toString())
                .apply()

            // activePiece가 없으면 자동 스폰
            TetrisGameEngine.trySpawnPiece(context)

            // 위젯 업데이트
            refreshWidget(context)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 페널티 줄 수 설정
    @ReactMethod
    fun addPenalties(count: Double, promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)
            prefs.edit().putInt("pendingPenalties", count.toInt()).apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 점수 업데이트
    @ReactMethod
    fun updateScore(score: Double, promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)
            prefs.edit().putInt("score", score.toInt()).apply()

            refreshWidget(context)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 게임 리셋
    @ReactMethod
    fun resetGame(promise: Promise) {
        try {
            val context = reactApplicationContext
            TetrisGameEngine.resetGame(context)

            refreshWidget(context)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 위젯의 현재 점수 조회
    @ReactMethod
    fun getScore(promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)
            promise.resolve(prefs.getInt("score", 0))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 게임 오버 여부 확인
    @ReactMethod
    fun isGameOver(promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)
            promise.resolve(prefs.getBoolean("gameOver", false))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 성취 목록 조회
    @ReactMethod
    fun getAchievements(promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)
            val json = prefs.getString("achievements", "[]") ?: "[]"
            promise.resolve(json)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 할 일 목록을 위젯용 SharedPreferences에 동기화
    @ReactMethod
    fun syncTasks(tasksJson: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("TodayIDid_tasks", Context.MODE_PRIVATE)
            prefs.edit().putString("tasks", tasksJson).apply()
            refreshWidget(context)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 마지막 게임 점수 조회
    @ReactMethod
    fun getLastGameScore(promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)
            val score = prefs.getInt("lastGame_score", 0)
            promise.resolve(score)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 마지막 게임 성취 조회
    @ReactMethod
    fun getLastGameAchievements(promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)
            val json = prefs.getString("lastGame_achievements", "[]") ?: "[]"
            promise.resolve(json)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 마지막 게임 데이터 삭제
    @ReactMethod
    fun clearLastGameData(promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tetris_widget", Context.MODE_PRIVATE)
            prefs.edit()
                .remove("lastGame_score")
                .remove("lastGame_achievements")
                .apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 위젯 강제 갱신
    @ReactMethod
    fun refreshWidget(promise: Promise) {
        try {
            refreshWidget(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    private fun refreshWidget(context: Context) {
        val manager = AppWidgetManager.getInstance(context)
        val component = ComponentName(context, TetrisWidgetProvider::class.java)
        val ids = manager.getAppWidgetIds(component)

        if (ids.isNotEmpty()) {
            val intent = Intent(context, TetrisWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            }
            context.sendBroadcast(intent)
        }
    }
}
