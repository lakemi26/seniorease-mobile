import { Platform } from 'react-native'

export const fontFamily = Platform.select({
  ios: { regular: 'System', medium: 'System', semibold: 'System', bold: 'System' },
  android: { regular: 'Roboto', medium: 'Roboto', semibold: 'Roboto', bold: 'Roboto' },
  default: { regular: 'System', medium: 'System', semibold: 'System', bold: 'System' },
})

export const fontSizeBase = {
  caption: 14,
  label: 15,
  body: 17,
  bodyLarge: 19,
  subtitle: 21,
  title: 27,
  display: 32,
}

export const lineHeightBase: Record<keyof typeof fontSizeBase, number> = {
  caption: 18,
  label: 20,
  body: 24,
  bodyLarge: 26,
  subtitle: 28,
  title: 34,
  display: 40,
}

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

export type FontSizeKey = keyof typeof fontSizeBase
export type FontSizePreference = 'normal' | 'large' | 'extraLarge'

export function getFontSizeMultiplier(preference: FontSizePreference): number {
  switch (preference) {
    case 'large':
      return 1.15
    case 'extraLarge':
      return 1.3
    default:
      return 1
  }
}

export function getScaledSizes(multiplier: number): {
  fontSize: Record<FontSizeKey, number>
  lineHeight: Record<FontSizeKey, number>
} {
  const fontSize = {} as Record<FontSizeKey, number>
  const lineHeight = {} as Record<FontSizeKey, number>

  for (const key of Object.keys(fontSizeBase) as FontSizeKey[]) {
    fontSize[key] = Math.round(fontSizeBase[key] * multiplier)
    lineHeight[key] = Math.round(lineHeightBase[key] * multiplier)
  }

  return { fontSize, lineHeight }
}
