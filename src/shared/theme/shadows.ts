import type { ViewStyle } from 'react-native'

interface ShadowTokens {
  sm: ViewStyle
  md: ViewStyle
  lg: ViewStyle
}

export function createShadows(elevation: number): ShadowTokens {
  return {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: Math.min(elevation, 2),
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: Math.min(elevation, 4),
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: Math.min(elevation, 6),
    },
  }
}

export const defaultShadows: ShadowTokens = createShadows(2)
