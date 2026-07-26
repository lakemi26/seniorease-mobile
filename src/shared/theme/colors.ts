export interface ColorTokens {
  primary: string
  primaryDark: string
  primarySoft: string
  primaryVerySoft: string
  accentWarm: string
  accentWarmSoft: string
  accentGold: string
  accentGoldSoft: string
  background: string
  surface: string
  surfaceMuted: string
  text: string
  textMuted: string
  border: string
  success: string
  warning: string
  danger: string
  info: string
  disabled: string
  disabledBackground: string
  overlay: string
  dangerLight: string
  successLight: string
  warningLight: string
  focus: string
}

export const lightColors: ColorTokens = {
  primary: '#2F7F7A',
  primaryDark: '#215F5B',
  primarySoft: '#D9ECE9',
  primaryVerySoft: '#EDF6F4',
  accentWarm: '#C9785D',
  accentWarmSoft: '#F4DDD5',
  accentGold: '#B98A3D',
  accentGoldSoft: '#F3E9D3',
  background: '#F7F4EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEDE7',
  text: '#202927',
  textMuted: '#65716E',
  border: '#CDD7D3',
  success: '#3C7A57',
  warning: '#A86F1B',
  danger: '#B85252',
  info: '#4E7188',
  disabled: '#9CA3AF',
  disabledBackground: '#E5E7EB',
  overlay: 'rgba(32, 41, 39, 0.5)',
  dangerLight: '#F5E0E0',
  successLight: '#E0F0E5',
  warningLight: '#F5EDE0',
  focus: '#176FC1',
}

export const darkColors: ColorTokens = {
  primary: '#58A6FF',
  primaryDark: '#1F6FEB',
  primarySoft: '#13233A',
  primaryVerySoft: '#182E4A',
  accentWarm: '#D99A82',
  accentWarmSoft: '#3D2820',
  accentGold: '#D4AE5E',
  accentGoldSoft: '#3D3020',
  background: '#0D1117',
  surface: '#161B22',
  surfaceMuted: '#1C232D',
  text: '#E6EDF3',
  textMuted: '#B0B8C4',
  border: '#30363D',
  success: '#3FB950',
  warning: '#D29922',
  danger: '#F85149',
  info: '#58A6FF',
  disabled: '#656D76',
  disabledBackground: '#212A35',
  overlay: 'rgba(1, 4, 9, 0.72)',
  dangerLight: '#3D1F1F',
  successLight: '#1A2E24',
  warningLight: '#332A16',
  focus: '#58A6FF',
}

export const highContrastColors: ColorTokens = {
  primary: '#006B68',
  primaryDark: '#004F4D',
  primarySoft: '#E8F7F5',
  primaryVerySoft: '#F2FCFA',
  accentWarm: '#B85C3A',
  accentWarmSoft: '#FDEDE5',
  accentGold: '#8B6B00',
  accentGoldSoft: '#FFF2CC',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F5',
  text: '#000000',
  textMuted: '#1A1A1A',
  border: '#000000',
  success: '#006B2D',
  warning: '#7A4B00',
  danger: '#A00000',
  info: '#004080',
  disabled: '#666666',
  disabledBackground: '#F0F0F0',
  overlay: 'rgba(0, 0, 0, 0.5)',
  dangerLight: '#FFE5E5',
  successLight: '#E5F7E5',
  warningLight: '#FFF2CC',
  focus: '#FFD60A',
}

export type ContrastMode = 'default' | 'high' | 'dark'

export function getColors(mode: ContrastMode): ColorTokens {
  switch (mode) {
    case 'dark':
      return darkColors
    case 'high':
      return highContrastColors
    default:
      return lightColors
  }
}

export const colors: ColorTokens = lightColors
