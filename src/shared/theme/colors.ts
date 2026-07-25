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
  primary: '#76C3BC',
  primaryDark: '#4FA59E',
  primarySoft: '#204542',
  primaryVerySoft: '#16302E',
  accentWarm: '#D99A82',
  accentWarmSoft: '#3D2820',
  accentGold: '#D4AE5E',
  accentGoldSoft: '#3D3020',
  background: '#101817',
  surface: '#172220',
  surfaceMuted: '#20302D',
  text: '#F4F7F6',
  textMuted: '#B7C3C0',
  border: '#40514D',
  success: '#5DB07A',
  warning: '#D4A34A',
  danger: '#E87A7A',
  info: '#8AACC4',
  disabled: '#6B7B78',
  disabledBackground: '#2A3A37',
  overlay: 'rgba(0, 0, 0, 0.6)',
  dangerLight: '#3D1C1C',
  successLight: '#1C3D28',
  warningLight: '#3D2E1C',
  focus: '#7FC5FF',
}

export const highContrastColors: ColorTokens = {
  primary: '#7FE7DF',
  primaryDark: '#4FD0C7',
  primarySoft: '#1A3D3B',
  primaryVerySoft: '#0D2A28',
  accentWarm: '#FFB8A0',
  accentWarmSoft: '#3D0000',
  accentGold: '#FFD60A',
  accentGoldSoft: '#3D2E00',
  background: '#000000',
  surface: '#000000',
  surfaceMuted: '#1A1A1A',
  text: '#FFFFFF',
  textMuted: '#FFFFFF',
  border: '#FFFFFF',
  success: '#6FCF97',
  warning: '#FFD60A',
  danger: '#FF7979',
  info: '#FFFFFF',
  disabled: '#666666',
  disabledBackground: '#1A1A1A',
  overlay: 'rgba(0, 0, 0, 0.75)',
  dangerLight: '#3D0000',
  successLight: '#002D15',
  warningLight: '#3D2E00',
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
