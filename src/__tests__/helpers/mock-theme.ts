import type { Theme } from '@/contexts/theme-context'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/modules/authentication/domain/entities'
import { darkColors, highContrastColors, lightColors } from '@/shared/theme/colors'
import { radius } from '@/shared/theme/radius'
import { createShadows } from '@/shared/theme/shadows'
import { spacingExpanded, spacingNormal } from '@/shared/theme/spacing'
import { getFontSizeMultiplier, getScaledSizes } from '@/shared/theme/typography'

export const mockDefaultColors = lightColors
export const mockDarkColors = darkColors
export const mockHighContrastColors = highContrastColors

export function createMockPreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  const definedOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined),
  ) as Partial<UserPreferences>

  return {
    ...DEFAULT_USER_PREFERENCES,
    ...definedOverrides,
  }
}

export function createMockTheme(overrides: Partial<Theme> = {}): Theme {
  const preferences = createMockPreferences({
    fontSize: overrides.fontSizePreference,
    contrast: overrides.contrast,
    spacing: overrides.spacingPreference,
    interfaceMode: overrides.interfaceMode,
    reduceMotion: overrides.reduceMotion,
    enhancedFeedback: overrides.enhancedFeedback,
    confirmCriticalActions: overrides.confirmCriticalActions,
    remindersEnabled: overrides.remindersEnabled,
  })
  const fontSizeMultiplier = overrides.fontSizeMultiplier ?? getFontSizeMultiplier(preferences.fontSize)
  const scaledSizes = getScaledSizes(fontSizeMultiplier)

  return {
    colors: overrides.colors ?? mockDefaultColors,
    spacing: overrides.spacing ?? (preferences.spacing === 'expanded' ? spacingExpanded : spacingNormal),
    fontSize: overrides.fontSize ?? scaledSizes.fontSize,
    lineHeight: overrides.lineHeight ?? scaledSizes.lineHeight,
    fontSizeMultiplier,
    radius: overrides.radius ?? radius,
    shadows: overrides.shadows ?? createShadows(fontSizeMultiplier > 1 ? 4 : 2),
    fontSizePreference: overrides.fontSizePreference ?? preferences.fontSize,
    contrast: overrides.contrast ?? preferences.contrast,
    spacingPreference: overrides.spacingPreference ?? preferences.spacing,
    interfaceMode: overrides.interfaceMode ?? preferences.interfaceMode,
    reduceMotion: overrides.reduceMotion ?? preferences.reduceMotion,
    enhancedFeedback: overrides.enhancedFeedback ?? preferences.enhancedFeedback,
    confirmCriticalActions: overrides.confirmCriticalActions ?? preferences.confirmCriticalActions,
    remindersEnabled: overrides.remindersEnabled ?? preferences.remindersEnabled,
  }
}

export const mockTheme = createMockTheme()
