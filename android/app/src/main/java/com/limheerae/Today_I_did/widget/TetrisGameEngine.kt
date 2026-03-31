package com.limheerae.Today_I_did.widget

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class Position(val x: Int, val y: Int)

data class ActivePiece(
    val type: String,
    val rotation: Int,
    val position: Position,
    val colorId: Int,
    val sourceRecordId: String
)

data class QueuedBlock(
    val type: String,
    val colorId: Int,
    val sourceRecordId: String
)

data class GameState(
    val grid: Array<IntArray>,
    val gridRecordIds: Array<Array<String?>>,
    val score: Int,
    val activePiece: ActivePiece?,
    val blockQueue: MutableList<QueuedBlock>,
    val gameOver: Boolean,
    val totalLineClears: Int,
    val animationState: String,
    val clearingRows: List<Int>,
    val combo: Int = 0
)

object TetrisGameEngine {
    const val COLS = 10
    const val ROWS = 12
    private const val PREFS_NAME = "tetris_widget"

    // 실제 테트리스 기본 점수 (레벨 1 기준: ×1)
    private val SCORE_TABLE = mapOf(1 to 40, 2 to 100, 3 to 300, 4 to 1200)
    private const val COMBO_BONUS = 50

    val COLOR_PALETTE = arrayOf(
        "#FF0000", "#FF8800", "#FFDD00", "#00CC00", "#0088FF", "#CC00FF", "#FF00AA"
    )

    private val BLOCK_SHAPES: Map<String, List<List<Position>>> = mapOf(
        "I" to listOf(
            listOf(Position(0,1), Position(1,1), Position(2,1), Position(3,1)),
            listOf(Position(2,0), Position(2,1), Position(2,2), Position(2,3)),
            listOf(Position(0,2), Position(1,2), Position(2,2), Position(3,2)),
            listOf(Position(1,0), Position(1,1), Position(1,2), Position(1,3))
        ),
        "O" to listOf(
            listOf(Position(0,0), Position(1,0), Position(0,1), Position(1,1)),
            listOf(Position(0,0), Position(1,0), Position(0,1), Position(1,1)),
            listOf(Position(0,0), Position(1,0), Position(0,1), Position(1,1)),
            listOf(Position(0,0), Position(1,0), Position(0,1), Position(1,1))
        ),
        "T" to listOf(
            listOf(Position(1,0), Position(0,1), Position(1,1), Position(2,1)),
            listOf(Position(1,0), Position(1,1), Position(2,1), Position(1,2)),
            listOf(Position(0,1), Position(1,1), Position(2,1), Position(1,2)),
            listOf(Position(1,0), Position(0,1), Position(1,1), Position(1,2))
        ),
        "S" to listOf(
            listOf(Position(1,0), Position(2,0), Position(0,1), Position(1,1)),
            listOf(Position(1,0), Position(1,1), Position(2,1), Position(2,2)),
            listOf(Position(1,1), Position(2,1), Position(0,2), Position(1,2)),
            listOf(Position(0,0), Position(0,1), Position(1,1), Position(1,2))
        ),
        "Z" to listOf(
            listOf(Position(0,0), Position(1,0), Position(1,1), Position(2,1)),
            listOf(Position(2,0), Position(1,1), Position(2,1), Position(1,2)),
            listOf(Position(0,1), Position(1,1), Position(1,2), Position(2,2)),
            listOf(Position(1,0), Position(0,1), Position(1,1), Position(0,2))
        ),
        "J" to listOf(
            listOf(Position(0,0), Position(0,1), Position(1,1), Position(2,1)),
            listOf(Position(1,0), Position(2,0), Position(1,1), Position(1,2)),
            listOf(Position(0,1), Position(1,1), Position(2,1), Position(2,2)),
            listOf(Position(1,0), Position(1,1), Position(0,2), Position(1,2))
        ),
        "L" to listOf(
            listOf(Position(2,0), Position(0,1), Position(1,1), Position(2,1)),
            listOf(Position(1,0), Position(1,1), Position(1,2), Position(2,2)),
            listOf(Position(0,1), Position(1,1), Position(2,1), Position(0,2)),
            listOf(Position(0,0), Position(1,0), Position(1,1), Position(1,2))
        )
    )

    fun getAbsoluteCells(type: String, rotation: Int, pos: Position): List<Position> {
        val shape = BLOCK_SHAPES[type] ?: return emptyList()
        return shape[rotation % 4].map { Position(it.x + pos.x, it.y + pos.y) }
    }

    private fun canPlace(grid: Array<IntArray>, cells: List<Position>): Boolean {
        return cells.all { (x, y) ->
            x in 0 until COLS && y in 0 until ROWS && grid[y][x] == 0
        }
    }

    // 상태를 반환하여 호출부에서 재로드 불필요
    fun processAction(context: Context, action: String): GameState {
        val state = loadState(context)
        val newState = when (action) {
            "move_left" -> moveLeft(state)
            "move_right" -> moveRight(state)
            "move_down" -> moveDown(state, context)
            "rotate" -> rotate(state)
            else -> state
        }
        saveState(context, newState)
        return newState
    }

    fun advanceAnimation(context: Context): GameState {
        val state = loadState(context)
        val newState = when (state.animationState) {
            "highlight" -> state.copy(animationState = "fade")
            "fade" -> {
                val cleared = clearLines(state, context)
                spawnPiece(cleared, context)
            }
            "done" -> {
                val cleared = clearLines(state, context)
                spawnPiece(cleared, context)
            }
            else -> state
        }
        saveState(context, newState)
        return newState
    }

    private fun moveLeft(state: GameState): GameState {
        if (state.gameOver || state.animationState != "none") return state
        val piece = state.activePiece ?: return state
        val newPos = Position(piece.position.x - 1, piece.position.y)
        val cells = getAbsoluteCells(piece.type, piece.rotation, newPos)
        if (!canPlace(state.grid, cells)) return state
        return state.copy(activePiece = piece.copy(position = newPos))
    }

    private fun moveRight(state: GameState): GameState {
        if (state.gameOver || state.animationState != "none") return state
        val piece = state.activePiece ?: return state
        val newPos = Position(piece.position.x + 1, piece.position.y)
        val cells = getAbsoluteCells(piece.type, piece.rotation, newPos)
        if (!canPlace(state.grid, cells)) return state
        return state.copy(activePiece = piece.copy(position = newPos))
    }

    private fun moveDown(state: GameState, context: Context): GameState {
        if (state.gameOver || state.animationState != "none") return state
        val piece = state.activePiece ?: return state
        val newPos = Position(piece.position.x, piece.position.y + 1)
        val cells = getAbsoluteCells(piece.type, piece.rotation, newPos)

        if (canPlace(state.grid, cells)) {
            return state.copy(activePiece = piece.copy(position = newPos))
        }

        val locked = lockPiece(state)
        val completedRows = checkLines(locked.grid)

        if (completedRows.isNotEmpty()) {
            return locked.copy(animationState = "highlight", clearingRows = completedRows)
        }

        // 줄 클리어 없으면 콤보 리셋
        return spawnPiece(locked.copy(combo = 0), context)
    }

    private fun rotate(state: GameState): GameState {
        if (state.gameOver || state.animationState != "none") return state
        val piece = state.activePiece ?: return state
        if (piece.type == "O") return state

        val newRotation = (piece.rotation + 1) % 4
        val cells = getAbsoluteCells(piece.type, newRotation, piece.position)

        if (canPlace(state.grid, cells)) {
            return state.copy(activePiece = piece.copy(rotation = newRotation))
        }

        for (offset in listOf(Position(-1, 0), Position(1, 0), Position(0, -1))) {
            val kickPos = Position(piece.position.x + offset.x, piece.position.y + offset.y)
            val kickCells = getAbsoluteCells(piece.type, newRotation, kickPos)
            if (canPlace(state.grid, kickCells)) {
                return state.copy(activePiece = piece.copy(rotation = newRotation, position = kickPos))
            }
        }

        return state
    }

    private fun lockPiece(state: GameState): GameState {
        val piece = state.activePiece ?: return state
        val newGrid = state.grid.map { it.copyOf() }.toTypedArray()
        val newRecordIds = state.gridRecordIds.map { it.copyOf() }.toTypedArray()
        val cells = getAbsoluteCells(piece.type, piece.rotation, piece.position)

        for ((x, y) in cells) {
            if (y in 0 until ROWS && x in 0 until COLS) {
                newGrid[y][x] = if (piece.colorId > 0) piece.colorId else 1
                newRecordIds[y][x] = piece.sourceRecordId
            }
        }

        return state.copy(grid = newGrid, gridRecordIds = newRecordIds, activePiece = null)
    }

    private fun checkLines(grid: Array<IntArray>): List<Int> {
        return grid.indices.filter { y -> grid[y].all { it != 0 } }
    }

    private fun clearLines(state: GameState, context: Context): GameState {
        val rows = state.clearingRows
        if (rows.isEmpty()) return state

        // 클리어되는 줄의 recordIds 수집 → 성취로 저장
        val clearedRecordIds = mutableListOf<String>()
        for (rowIdx in rows) {
            for (x in 0 until COLS) {
                val rid = state.gridRecordIds[rowIdx][x]
                if (rid != null && rid != "penalty" && rid.isNotEmpty()) {
                    clearedRecordIds.add(rid)
                }
            }
        }
        if (clearedRecordIds.isNotEmpty()) {
            saveAchievement(context, clearedRecordIds, rows.size)
        }

        val newGrid = state.grid.filterIndexed { i, _ -> i !in rows }.toMutableList()
        val newRecordIds = state.gridRecordIds.filterIndexed { i, _ -> i !in rows }.toMutableList()

        while (newGrid.size < ROWS) {
            newGrid.add(0, IntArray(COLS))
            newRecordIds.add(0, arrayOfNulls(COLS))
        }

        val baseScore = SCORE_TABLE[rows.size] ?: 0
        val comboBonus = if (state.combo > 0) COMBO_BONUS * state.combo else 0
        val totalBonus = baseScore + comboBonus

        return state.copy(
            grid = newGrid.toTypedArray(),
            gridRecordIds = newRecordIds.toTypedArray(),
            score = state.score + totalBonus,
            totalLineClears = state.totalLineClears + rows.size,
            clearingRows = emptyList(),
            animationState = "none",
            combo = state.combo + 1
        )
    }

    private fun spawnPiece(state: GameState, context: Context? = null): GameState {
        // 스폰 전 페널티 자동 적용
        var current = state
        if (context != null) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val pending = prefs.getInt("pendingPenalties", 0)
            if (pending > 0) {
                val newGrid = current.grid.toMutableList().map { it.copyOf() }.toMutableList()
                val newRecordIds = current.gridRecordIds.toMutableList().map { it.copyOf() }.toMutableList()
                for (p in 0 until pending) {
                    if (newGrid[0].any { it != 0 }) {
                        prefs.edit().putInt("pendingPenalties", 0).apply()
                        return current.copy(
                            grid = newGrid.toTypedArray(),
                            gridRecordIds = newRecordIds.toTypedArray(),
                            gameOver = true,
                            activePiece = null
                        )
                    }
                    newGrid.removeAt(0)
                    newRecordIds.removeAt(0)
                    val emptyCol = kotlin.random.Random.nextInt(COLS)
                    newGrid.add(IntArray(COLS) { if (it == emptyCol) 0 else 99 })
                    newRecordIds.add(Array(COLS) { if (it == emptyCol) null else "penalty" })
                }
                current = current.copy(grid = newGrid.toTypedArray(), gridRecordIds = newRecordIds.toTypedArray())
                prefs.edit().putInt("pendingPenalties", 0).apply()
            }
        }

        if (current.blockQueue.isEmpty()) {
            return current.copy(activePiece = null)
        }

        val next = current.blockQueue.removeAt(0)
        val newPiece = ActivePiece(
            type = next.type,
            rotation = 0,
            position = Position(3, 0),
            colorId = next.colorId,
            sourceRecordId = next.sourceRecordId
        )

        val cells = getAbsoluteCells(newPiece.type, 0, newPiece.position)
        if (!canPlace(current.grid, cells)) {
            return current.copy(gameOver = true, activePiece = null)
        }

        return current.copy(activePiece = newPiece)
    }

    // 페널티 줄 적용
    fun applyPenalties(context: Context) {
        val state = loadState(context)
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val pendingPenalties = prefs.getInt("pendingPenalties", 0)

        if (pendingPenalties <= 0) return

        val newGrid = state.grid.toMutableList().map { it.copyOf() }.toMutableList()
        val newRecordIds = state.gridRecordIds.toMutableList().map { it.copyOf() }.toMutableList()

        for (p in 0 until pendingPenalties) {
            newGrid.removeAt(0)
            newRecordIds.removeAt(0)

            val emptyCol = kotlin.random.Random.nextInt(COLS)
            val penaltyRow = IntArray(COLS) { if (it == emptyCol) 0 else 99 }
            val penaltyRecordRow: Array<String?> = Array(COLS) { if (it == emptyCol) null else "penalty" }
            newGrid.add(penaltyRow)
            newRecordIds.add(penaltyRecordRow)
        }

        val topRowHasBlocks = newGrid[0].any { it != 0 }
        val newState = state.copy(
            grid = newGrid.toTypedArray(),
            gridRecordIds = newRecordIds.toTypedArray(),
            gameOver = if (topRowHasBlocks) true else state.gameOver
        )

        saveState(context, newState)
        prefs.edit().putInt("pendingPenalties", 0).apply()
    }

    // 브릿지용 블록 스폰
    fun trySpawnPiece(context: Context) {
        val state = loadState(context)
        if (state.activePiece == null && !state.gameOver && state.blockQueue.isNotEmpty()) {
            val newState = spawnPiece(state, context)
            saveState(context, newState)
        }
    }

    // 게임 리셋 (GAME OVER 후 호출) — 성취 기록과 recordMap은 보존
    fun resetGame(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val achievements = prefs.getString("achievements", "[]")
        val recordMap = prefs.getString("recordMap", "{}")

        prefs.edit().clear().apply()

        // 성취 기록과 recordMap 복원
        prefs.edit()
            .putString("achievements", achievements)
            .putString("recordMap", recordMap)
            .apply()
    }

    // === 성취 저장 ===

    private fun saveAchievement(context: Context, recordIds: List<String>, lineCount: Int) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val existingJson = prefs.getString("achievements", "[]") ?: "[]"
        val arr = JSONArray(existingJson)

        // recordMap에서 각 recordId의 content, blockType 조회
        val recordMapJson = prefs.getString("recordMap", "{}") ?: "{}"
        val recordMap = JSONObject(recordMapJson)

        val records = JSONArray()
        val uniqueIds = recordIds.distinct()
        for (rid in uniqueIds) {
            val info = recordMap.optJSONObject(rid)
            records.put(JSONObject().apply {
                put("id", rid)
                put("content", info?.optString("content", "") ?: "")
                put("blockType", info?.optString("blockType", "") ?: "")
            })
        }

        val achievement = JSONObject().apply {
            put("id", "ach_${System.currentTimeMillis()}")
            put("recordIds", JSONArray(uniqueIds))
            put("records", records)
            put("lineCount", lineCount)
            put("score", SCORE_TABLE[lineCount] ?: 0)
            put("clearedAt", System.currentTimeMillis())
        }
        arr.put(achievement)

        prefs.edit().putString("achievements", arr.toString()).apply()
    }

    // === 상태 저장/로드 ===

    fun loadState(context: Context): GameState {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val gridJson = prefs.getString("grid", null)
        val needsReset = if (gridJson != null) {
            val arr = JSONArray(gridJson)
            arr.length() != ROWS || (arr.length() > 0 && arr.optJSONArray(0)?.length() != COLS)
        } else false

        if (needsReset) {
            prefs.edit().clear().apply()
        }

        val validGridJson = if (needsReset) null else gridJson
        val grid = if (validGridJson != null) {
            val arr = JSONArray(validGridJson)
            Array(ROWS) { y ->
                val row = arr.optJSONArray(y)
                IntArray(COLS) { x -> row?.optInt(x, 0) ?: 0 }
            }
        } else {
            Array(ROWS) { IntArray(COLS) }
        }

        // gridRecordIds 로드
        val recordIdsJson = if (needsReset) null else prefs.getString("gridRecordIds", null)
        val gridRecordIds = if (recordIdsJson != null) {
            val arr = JSONArray(recordIdsJson)
            Array(ROWS) { y ->
                val row = arr.optJSONArray(y)
                Array<String?>(COLS) { x -> row?.optString(x, null)?.let { if (it == "null") null else it } }
            }
        } else {
            Array(ROWS) { arrayOfNulls<String>(COLS) }
        }

        val pieceJson = prefs.getString("activePiece", null)
        val activePiece = if (pieceJson != null && !needsReset) {
            val obj = JSONObject(pieceJson)
            ActivePiece(
                type = obj.getString("type"),
                rotation = obj.getInt("rotation"),
                position = Position(obj.getInt("posX"), obj.getInt("posY")),
                colorId = obj.getInt("colorId"),
                sourceRecordId = obj.optString("sourceRecordId", "")
            )
        } else null

        val queueJson = if (needsReset) "[]" else prefs.getString("blockQueue", "[]")
        val queueArr = JSONArray(queueJson)
        val blockQueue = mutableListOf<QueuedBlock>()
        for (i in 0 until queueArr.length()) {
            val obj = queueArr.getJSONObject(i)
            blockQueue.add(QueuedBlock(
                type = obj.getString("type"),
                colorId = obj.getInt("colorId"),
                sourceRecordId = obj.optString("sourceRecordId", "")
            ))
        }

        return GameState(
            grid = grid,
            gridRecordIds = gridRecordIds,
            score = if (needsReset) 0 else prefs.getInt("score", 0),
            activePiece = activePiece,
            blockQueue = blockQueue,
            gameOver = if (needsReset) false else prefs.getBoolean("gameOver", false),
            totalLineClears = if (needsReset) 0 else prefs.getInt("totalLineClears", 0),
            animationState = if (needsReset) "none" else (prefs.getString("animationState", "none") ?: "none"),
            clearingRows = if (needsReset) emptyList() else (prefs.getString("clearingRows", "")
                ?.split(",")
                ?.filter { it.isNotEmpty() }
                ?.map { it.toInt() }
                ?: emptyList()),
            combo = if (needsReset) 0 else prefs.getInt("combo", 0)
        )
    }

    fun saveState(context: Context, state: GameState) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val editor = prefs.edit()

        val gridArr = JSONArray()
        for (row in state.grid) {
            val rowArr = JSONArray()
            for (cell in row) rowArr.put(cell)
            gridArr.put(rowArr)
        }
        editor.putString("grid", gridArr.toString())

        // gridRecordIds 저장
        val recordIdsArr = JSONArray()
        for (row in state.gridRecordIds) {
            val rowArr = JSONArray()
            for (cell in row) rowArr.put(cell ?: "null")
            recordIdsArr.put(rowArr)
        }
        editor.putString("gridRecordIds", recordIdsArr.toString())

        if (state.activePiece != null) {
            val obj = JSONObject()
            obj.put("type", state.activePiece.type)
            obj.put("rotation", state.activePiece.rotation)
            obj.put("posX", state.activePiece.position.x)
            obj.put("posY", state.activePiece.position.y)
            obj.put("colorId", state.activePiece.colorId)
            obj.put("sourceRecordId", state.activePiece.sourceRecordId)
            editor.putString("activePiece", obj.toString())
        } else {
            editor.remove("activePiece")
        }

        val queueArr = JSONArray()
        for (block in state.blockQueue) {
            val obj = JSONObject()
            obj.put("type", block.type)
            obj.put("colorId", block.colorId)
            obj.put("sourceRecordId", block.sourceRecordId)
            queueArr.put(obj)
        }
        editor.putString("blockQueue", queueArr.toString())

        editor.putInt("score", state.score)
        editor.putBoolean("gameOver", state.gameOver)
        editor.putInt("totalLineClears", state.totalLineClears)
        editor.putString("animationState", state.animationState)
        editor.putString("clearingRows", state.clearingRows.joinToString(","))
        editor.putInt("combo", state.combo)

        editor.apply()
    }
}
