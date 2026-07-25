export const spacingNormal = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
}

export const spacingExpanded: typeof spacingNormal = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 30,
  xxl: 40,
  xxxl: 52,
}

export const touchSize = {
  min: 48,
}

export type SpacingMode = 'normal' | 'expanded'

let _currentSpacing = spacingNormal

export function getSpacing(mode: SpacingMode): typeof spacingNormal {
  _currentSpacing = mode === 'expanded' ? spacingExpanded : spacingNormal
  return _currentSpacing
}

export const spacing = spacingNormal
