import { StyleSheet } from 'react-native'
import { COLORS } from './constants'

export const sharedStyles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  headline: {
    fontFamily: 'InterBold',
    fontSize: 22,
    color: COLORS.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  sub: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 6,
  },
  accentCyan: {
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  accentYellow: {
    color: COLORS.neonYellow,
    textShadowColor: 'rgba(255, 229, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  accentPurple: {
    color: '#A78BFA',
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  accentRed: {
    color: COLORS.neonRed,
    textShadowColor: 'rgba(255, 51, 85, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  hintText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  caption: {
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 4,
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'stretch',
  },
})
