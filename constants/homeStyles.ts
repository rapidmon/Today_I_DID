import { StyleSheet } from 'react-native'

// Neon Arcade 디자인 시스템 색상
const COLORS = {
  bgPrimary: '#0A0A1A',
  bgSecondary: '#12122A',
  bgCard: '#1A1A35',
  bgElevated: '#222245',
  neonCyan: '#00F0FF',
  neonYellow: '#FFE500',
  neonGreen: '#00FF88',
  neonRed: '#FF3355',
  neonMagenta: '#FF00E5',
  textPrimary: '#E8E8FF',
  textSecondary: '#8888AA',
  textMuted: '#555577',
  borderSubtle: '#2A2A50',
}

export { COLORS }

export const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // 헤더 미니 블록 아이콘
  headerBlockIcon: { flexDirection: 'row', gap: 2 },
  headerBlock: {
    width: 10, height: 10,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.55)', borderLeftColor: 'rgba(255,255,255,0.45)',
    borderBottomWidth: 2, borderRightWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.55)', borderRightColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontFamily: 'PressStart2P', fontSize: 11, color: '#FFFFFF', letterSpacing: 2,
    textShadowColor: '#00F0FF', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  headerRight: { flexDirection: 'row' as const, gap: 8, alignItems: 'center' as const },
  scoreBadge: {
    backgroundColor: 'rgba(255, 229, 0, 0.1)',
    borderWidth: 1, borderColor: 'rgba(255, 229, 0, 0.3)',
    borderRadius: 8, paddingHorizontal: 12,
    paddingTop: 8, paddingBottom: 5,
  },
  scoreText: {
    fontFamily: 'PressStart2P', color: '#FFFFFF', fontSize: 8, letterSpacing: 1,
    textAlignVertical: 'center' as const,
    textShadowColor: '#FFE500', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  gameOverBadge: {
    backgroundColor: 'rgba(255, 51, 85, 0.1)',
    borderWidth: 1, borderColor: 'rgba(255, 51, 85, 0.3)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  gameOverText: {
    fontFamily: 'PressStart2P', color: COLORS.neonRed, fontSize: 7, letterSpacing: 1,
    textShadowColor: 'rgba(255, 51, 85, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // 모드 토글
  modeRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4,
  },
  modeButton: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgCard,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 12,
  },
  modeText: {
    fontFamily: 'InterBold', color: COLORS.textMuted, fontSize: 12, letterSpacing: 1,
  },
  modeTextActive: { color: COLORS.neonCyan },

  // 입력
  inputRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  input: {
    flex: 1, backgroundColor: COLORS.bgSecondary, fontFamily: 'Inter',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    color: COLORS.textPrimary, fontSize: 14,
  },
  addButton: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderRadius: 12, paddingHorizontal: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 12,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.borderSubtle,
    shadowOpacity: 0,
  },
  addButtonText: {
    fontFamily: 'InterBold', color: COLORS.neonCyan, fontSize: 13, letterSpacing: 2,
  },

  // 요일 선택
  dayRow: {
    flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16,
    paddingTop: 8, marginBottom: 8,
  },
  dayButton: {
    alignItems: 'center' as const, justifyContent: 'center' as const,
    paddingVertical: 4, paddingHorizontal: 4,
  },
  dayButtonActive: {},
  dayText: { fontFamily: 'InterSemiBold', color: COLORS.textMuted, fontSize: 13 },
  dayTextActive: {
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // 날짜 선택기
  datePickerRow: {
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
    paddingHorizontal: 16, marginBottom: 8, paddingTop: 4,
  },
  datePickerGroup: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4,
  },
  datePickerBlock: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderSubtle,
    borderRadius: 8, overflow: 'hidden' as const,
  },
  datePickerArrow: {
    width: 20, height: 28, alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  datePickerArrowLeft: {
    borderRightWidth: 1, borderRightColor: COLORS.borderSubtle,
  },
  datePickerArrowRight: {
    borderLeftWidth: 1, borderLeftColor: COLORS.borderSubtle,
  },
  datePickerValue: {
    paddingHorizontal: 14, height: 28,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    minWidth: 36,
  },
  datePickerValueText: {
    fontFamily: 'PressStart2P', color: COLORS.neonCyan, fontSize: 11,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  datePickerLabel: {
    fontFamily: 'InterBold', color: COLORS.textSecondary, fontSize: 13,
  },
  datePickerTodayButton: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4,
    height: 28, paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)',
    borderRadius: 8,
  },
  datePickerTodayText: {
    fontFamily: 'PressStart2P', color: COLORS.neonCyan, fontSize: 7,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // 수정 모드
  editContainer: {
    marginHorizontal: 12, marginVertical: 8, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 12,
  },
  editLabel: {
    fontFamily: 'PressStart2P', color: COLORS.neonYellow, fontSize: 9,
    letterSpacing: 2, marginBottom: 8,
    textShadowColor: 'rgba(255, 229, 0, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  editInput: {
    backgroundColor: COLORS.bgSecondary, fontFamily: 'Inter',
    borderWidth: 1, borderColor: '#4444AA',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    color: COLORS.textPrimary, fontSize: 14, marginBottom: 10,
  },
  editDateRow: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'space-evenly' as const, marginBottom: 12,
  },
  editDateGroup: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4,
  },
  editButtonRow: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8,
  },
  editSaveButton: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)',
    alignItems: 'center' as const,
  },
  editSaveText: {
    fontFamily: 'InterBold', color: COLORS.neonCyan, fontSize: 12,
  },
  editCancelButton: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.15)',
    alignItems: 'center' as const,
  },
  editCancelText: {
    fontFamily: 'InterBold', color: 'rgba(0, 240, 255, 0.7)', fontSize: 12,
  },
  editDeleteButton: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255, 51, 85, 0.1)',
    borderWidth: 1, borderColor: 'rgba(255, 51, 85, 0.3)',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },

  // 루틴 수정 모드
  routineEditContainer: {
    width: '100%' as unknown as number, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 12, marginBottom: 4,
  },
  routineEditName: {
    fontFamily: 'InterBold', color: COLORS.textPrimary, fontSize: 13, marginBottom: 6,
  },

  // 루틴
  routineSection: { paddingHorizontal: 16, marginBottom: 8 },
  sectionLabel: {
    fontFamily: 'PressStart2P', color: COLORS.textMuted, fontSize: 9,
    letterSpacing: 3, marginBottom: 6,
  },
  routineList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  routineChip: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderSubtle,
    borderRadius: 20, paddingLeft: 12, paddingRight: 4, paddingVertical: 6,
  },
  routineChipText: { fontFamily: 'Inter', color: COLORS.textSecondary, fontSize: 12 },
  routineDeleteButton: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  routineDeleteText: { color: COLORS.neonRed, fontSize: 11, fontWeight: 'bold' as const },

  // 섹션 라벨 (TODAY / UPCOMING / PAST)
  timeSectionLabel: {
    fontFamily: 'PressStart2P', fontSize: 11, letterSpacing: 2,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2,
  },
  sectionLabelToday: {
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sectionLabelUpcoming: {
    color: COLORS.neonYellow,
    textShadowColor: 'rgba(255, 229, 0, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sectionLabelPast: {
    color: '#8B5CF6',
    textShadowColor: 'rgba(139, 92, 246, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // TODAY 섹션 래퍼 (시안 네온 보더)
  sectionTodayWrapper: {
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.25)',
    borderRadius: 14, marginHorizontal: 12, marginBottom: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.02)',
    shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05, shadowRadius: 16,
  },

  // UPCOMING 섹션 래퍼
  sectionUpcomingWrapper: {
    marginHorizontal: 12, marginBottom: 12, paddingVertical: 4,
    opacity: 0.85,
  },

  // PAST 토글 버튼
  pastToggle: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginHorizontal: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  pastToggleLeft: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10,
  },
  pastCount: {
    fontFamily: 'Inter', color: COLORS.textMuted, fontSize: 12,
  },
  pastContent: {
    marginHorizontal: 12, opacity: 0.6,
  },
  pastLabelInline: {
    paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0,
  },
  todayEmptyWrapper: {
    paddingVertical: 20, alignItems: 'center' as const,
  },
  dateHeaderInner: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6,
  },
  pastDateText: {
    fontFamily: 'PressStart2P', color: 'rgba(139, 92, 246, 0.6)', fontSize: 10,
    textShadowColor: 'rgba(139, 92, 246, 0.4)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // 리스트
  listContent: { paddingBottom: 160 },
  recordItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(42, 42, 80, 0.5)',
  },
  numberText: {
    fontFamily: 'InterBold', color: COLORS.neonCyan, fontSize: 16,
    marginRight: 14, minWidth: 24, textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  numberTextCompleted: {
    color: COLORS.textMuted, textShadowColor: 'transparent',
  },
  recordContent: { flex: 1 },
  recordTextRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 },
  recordText: {
    fontFamily: 'InterMedium', color: COLORS.textPrimary, fontSize: 16, flexShrink: 1,
  },
  recordTextCompleted: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  routineIcon: { fontSize: 12, color: COLORS.neonGreen },

  // 스와이프 액션
  swipeActionsRow: {
    flexDirection: 'row' as const,
  },
  swipeEditAction: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    justifyContent: 'center' as const, alignItems: 'center' as const,
    width: 56,
  },
  swipeEditText: {
    fontFamily: 'PressStart2P', color: COLORS.neonCyan, fontSize: 7,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  swipeDeleteAction: {
    backgroundColor: 'rgba(255, 51, 85, 0.15)',
    justifyContent: 'center' as const, alignItems: 'center' as const,
    width: 56,
  },

  // 날짜 헤더
  dateHeader: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    paddingHorizontal: 16, paddingVertical: 10, gap: 10,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dateText: {
    fontFamily: 'PressStart2P', color: 'rgba(0, 240, 255, 0.6)', fontSize: 10,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  dateTodayLabel: {
    fontFamily: 'InterBold', color: 'rgba(0, 240, 255, 0.6)', fontSize: 11,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  recordDate: { fontFamily: 'Inter', color: COLORS.textMuted, fontSize: 11, marginTop: 2 },

  // 블록 뱃지 & 체크박스
  blockBadge: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  blockText: { fontSize: 14, fontWeight: 'bold' },
  pendingCheckbox: {
    width: 32, height: 32, borderWidth: 2, borderColor: '#00F0FF',
    borderRadius: 8, backgroundColor: 'transparent', marginLeft: 12,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  pendingCheckboxDisabled: {
    borderColor: COLORS.textMuted, opacity: 0.4,
  },
  checkOverlay: { fontSize: 20, fontWeight: 'bold' as const, color: COLORS.neonGreen },

  // 빈 상태
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontFamily: 'InterBold', color: COLORS.textSecondary, fontSize: 16 },
  emptySubText: { fontFamily: 'Inter', color: COLORS.textMuted, fontSize: 13, marginTop: 4 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 16,
    backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)',
    elevation: 0,
  },
  fabText: {
    fontFamily: 'PressStart2P', fontSize: 16, color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // 모달 (공통)
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalOverlayTouchable: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  modalEmpty: { alignItems: 'center', paddingVertical: 40 },
  emptyTextScroll: { fontFamily: 'InterBold', color: COLORS.textSecondary, fontSize: 16 },
  emptySubTextScroll: { fontFamily: 'Inter', color: COLORS.textMuted, fontSize: 13, marginTop: 4 },

  // CRT 모니터 스타일 모달
  crtHousing: {
    backgroundColor: '#2A2A3A', borderRadius: 12, width: '85%', maxHeight: '75%',
    padding: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 32, elevation: 10,
  },
  crtHeader: {
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  crtHeaderLeft: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6,
  },
  crtLed: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF88',
  },
  crtBrand: {
    fontFamily: 'InterBold', color: COLORS.textMuted, fontSize: 10,
  },
  crtCloseButton: {
    width: 24, height: 24, borderRadius: 4, backgroundColor: '#3A3A4A',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  crtCloseText: {
    color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold' as const, marginTop: -1,
  },
  crtScreen: {
    backgroundColor: '#0D0D22', borderRadius: 6, borderWidth: 2, borderColor: '#2A2A50',
    padding: 14, overflow: 'hidden' as const, position: 'relative' as const,
  },
  crtScreenTitle: {
    fontFamily: 'PressStart2P', fontSize: 9, color: COLORS.neonCyan, letterSpacing: 2,
    textAlign: 'center' as const, marginBottom: 12,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  crtLineCard: {
    backgroundColor: 'rgba(26, 26, 53, 0.6)', borderRadius: 8,
    borderWidth: 1, marginBottom: 8, padding: 10,
  },
  crtLineHeader: {
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
  },
  crtLineLeft: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8,
  },
  crtLineNumber: {
    fontFamily: 'PressStart2P', fontSize: 14, color: 'rgba(0, 240, 255, 0.5)',
    textShadowColor: 'rgba(0, 240, 255, 0.4)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  crtLineLabel: {
    fontFamily: 'InterBold', color: COLORS.textPrimary, fontSize: 12,
  },
  crtLineMulti: {
    fontFamily: 'InterBold', fontSize: 8, color: COLORS.neonMagenta,
    backgroundColor: 'rgba(255, 0, 229, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  crtLineMeta: {
    fontFamily: 'Inter', color: COLORS.textMuted, fontSize: 10, marginTop: 2,
  },
  crtLineScore: {
    fontFamily: 'PressStart2P', fontSize: 10, color: COLORS.neonYellow,
    textShadowColor: 'rgba(255, 229, 0, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  crtLineBody: {
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255, 0, 229, 0.1)',
  },
  crtScoreBar: {
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-around' as const,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  crtScoreStat: { alignItems: 'center' as const },
  crtScoreValue: {
    fontFamily: 'PressStart2P', fontSize: 12,
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
  },
  crtScoreLabel: {
    fontFamily: 'InterBold', color: COLORS.textMuted, fontSize: 8, letterSpacing: 1,
  },
  crtScoreDivider: {
    width: 1, height: 20, backgroundColor: 'rgba(42, 42, 80, 0.5)',
  },

  // 성취 아이템 (공통 재활용)
  achievementBody: {
    marginTop: 10, paddingLeft: 12,
    borderLeftWidth: 2, borderLeftColor: 'rgba(0, 240, 255, 0.2)', marginLeft: 2,
  },
  achievementRecordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingLeft: 8 },
  blockTypeBadge: {
    width: 28, height: 22, borderRadius: 4, backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  blockTypeText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: 'bold' },
  blockColorDot: {
    width: 14, height: 14, marginRight: 8, borderRadius: 2,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.55)', borderLeftColor: 'rgba(255,255,255,0.45)',
    borderBottomWidth: 2, borderRightWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.55)', borderRightColor: 'rgba(0,0,0,0.5)',
  },
  achievementRecord: { fontFamily: 'Inter', color: COLORS.textSecondary, fontSize: 13, flex: 1 },
})
