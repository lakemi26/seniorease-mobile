import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { getColors, type ColorTokens, type ContrastMode } from '@/shared/theme/colors'
import { getSpacing, type SpacingMode } from '@/shared/theme/spacing'
import { getFontSizeMultiplier, getScaledSizes, type FontSizePreference } from '@/shared/theme/typography'
import { radius } from '@/shared/theme/radius'
import { createShadows } from '@/shared/theme/shadows'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/modules/authentication/domain/entities'
import { usePreferences } from './preferences-context'

export interface Theme {
  colors: ColorTokens
  spacing: ReturnType<typeof getSpacing>
  fontSize: ReturnType<typeof getScaledSizes>['fontSize']
  lineHeight: ReturnType<typeof getScaledSizes>['lineHeight']
  fontSizeMultiplier: number
  radius: typeof radius
  shadows: ReturnType<typeof createShadows>
  fontSizePreference: FontSizePreference
  contrast: ContrastMode
  spacingPreference: SpacingMode
  interfaceMode: 'basic' | 'complete'
  reduceMotion: boolean
  enhancedFeedback: boolean
  confirmCriticalActions: boolean
  remindersEnabled: boolean
}

export function buildTheme(preferences: UserPreferences): Theme {
  const contrast: ContrastMode = preferences.contrast
  const spacingMode: SpacingMode = preferences.spacing
  const fontSizePreference: FontSizePreference = preferences.fontSize

  const multiplier = getFontSizeMultiplier(fontSizePreference)
  const { fontSize, lineHeight } = getScaledSizes(multiplier)

  return {
    colors: getColors(contrast),
    spacing: getSpacing(spacingMode),
    fontSize,
    lineHeight,
    fontSizeMultiplier: multiplier,
    radius,
    shadows: createShadows(multiplier > 1 ? 4 : 2),
    fontSizePreference,
    contrast,
    spacingPreference: spacingMode,
    interfaceMode: preferences.interfaceMode,
    reduceMotion: preferences.reduceMotion,
    enhancedFeedback: preferences.enhancedFeedback,
    confirmCriticalActions: preferences.confirmCriticalActions,
    remindersEnabled: preferences.remindersEnabled,
  }
}

const ThemeContext = createContext<Theme | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  const { effectivePreferences } = usePreferences()

  const theme = useMemo(() => buildTheme(effectivePreferences), [effectivePreferences])

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
