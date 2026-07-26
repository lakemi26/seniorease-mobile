import { render } from '@testing-library/react-native'

jest.mock('@/contexts/theme-context', () => {
  const colors = jest.requireActual('@/shared/theme/colors')
  const typography = jest.requireActual('@/shared/theme/typography')
  const spacing = jest.requireActual('@/shared/theme/spacing')
  const r = jest.requireActual('@/shared/theme/radius')
  const shadows = jest.requireActual('@/shared/theme/shadows')
  return {
    useTheme: () => ({
      colors: colors.lightColors,
      spacing: spacing.spacingNormal,
      fontSize: typography.fontSizeBase,
      lineHeight: typography.lineHeightBase,
      fontSizeMultiplier: 1,
      radius: r.radius,
      shadows: shadows.createShadows(2),
      fontSizePreference: 'normal' as const,
      contrast: 'default' as const,
      spacingPreference: 'normal' as const,
      interfaceMode: 'complete' as const,
      reduceMotion: false,
      enhancedFeedback: true,
      confirmCriticalActions: true,
      remindersEnabled: true,
    }),
    ThemeProvider: ({ children }: any) => children,
    buildTheme: jest.fn(),
  }
})

import { UserAvatar } from '@/screens/profile/user-avatar'

describe('UserAvatar', () => {
  it('renders two initials for two words', async () => {
    const { getByText } = await render(<UserAvatar name="Larissa Akemi" />)
    expect(getByText('LA')).toBeTruthy()
  })

  it('renders one initial for single word', async () => {
    const { getByText } = await render(<UserAvatar name="Larissa" />)
    expect(getByText('L')).toBeTruthy()
  })

  it('renders first and last initials for more than two words', async () => {
    const { getByText } = await render(<UserAvatar name="Maria Jose Silva" />)
    expect(getByText('MS')).toBeTruthy()
  })

  it('handles extra spaces', async () => {
    const { getByText } = await render(<UserAvatar name="  Larissa   Akemi  " />)
    expect(getByText('LA')).toBeTruthy()
  })

  it('falls back to ? for empty name', async () => {
    const { getByText } = await render(<UserAvatar name="" />)
    expect(getByText('?')).toBeTruthy()
  })

  it('falls back to ? for whitespace name', async () => {
    const { getByText } = await render(<UserAvatar name="   " />)
    expect(getByText('?')).toBeTruthy()
  })

  it('handles accented characters', async () => {
    const { getByText } = await render(<UserAvatar name="João Paulo" />)
    expect(getByText('JP')).toBeTruthy()
  })

  it('renders with custom size', async () => {
    const { getByLabelText, getByText } = await render(<UserAvatar name="Test User" size={72} />)
    expect(getByLabelText('Avatar de Test User')).toBeTruthy()
    expect(getByText('TU')).toBeTruthy()
  })

  it('sets accessibilityLabel', async () => {
    const { getByLabelText } = await render(<UserAvatar name="Ana Clara" />)
    expect(getByLabelText('Avatar de Ana Clara')).toBeTruthy()
  })

  it('allows custom accessibilityLabel', async () => {
    const { getByLabelText } = await render(
      <UserAvatar name="Ana Clara" accessibilityLabel="Meu avatar" />,
    )
    expect(getByLabelText('Meu avatar')).toBeTruthy()
  })
})
