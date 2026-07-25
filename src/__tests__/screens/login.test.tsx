import { render, fireEvent, waitFor } from '@testing-library/react-native'

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockSignIn = jest.fn()
const mockClearError = jest.fn()
const mockFn = jest.fn()

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockFn(),
  AuthProvider: ({ children }: any) => children,
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
}))

jest.mock('@/contexts/theme-context', () => {
  const colors = jest.requireActual('@/shared/theme/colors')
  const spacing = jest.requireActual('@/shared/theme/spacing')
  const typography = jest.requireActual('@/shared/theme/typography')
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
      interfaceMode: 'basic' as const,
      reduceMotion: false,
      enhancedFeedback: true,
      confirmCriticalActions: true,
      remindersEnabled: true,
    }),
    ThemeProvider: ({ children }: any) => children,
    buildTheme: jest.fn(),
  }
})

import LoginScreen from '@/app/(public)/login'

function mockAuth(overrides = {}) {
  mockFn.mockReturnValue({
    user: null,
    profile: null,
    isLoading: false,
    authError: null,
    signIn: mockSignIn,
    signUp: jest.fn(),
    signOut: jest.fn(),
    sendPasswordReset: jest.fn(),
    clearError: mockClearError,
    refreshProfile: jest.fn(),
    ...overrides,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth()
})

describe('LoginScreen basic', () => {
  it('renders title and subtitle', async () => {
    const { getByText } = await render(<LoginScreen />)
    expect(getByText('Entre no SeniorEase')).toBeTruthy()
    expect(getByText('Acesse suas atividades e continue de onde parou.')).toBeTruthy()
  })

  it('renders BrandMark', async () => {
    const { getByText } = await render(<LoginScreen />)
    expect(getByText('SeniorEase')).toBeTruthy()
  })

  it('renders email and password fields', async () => {
    const { getByText } = await render(<LoginScreen />)
    expect(getByText('E-mail')).toBeTruthy()
    expect(getByText('Senha')).toBeTruthy()
  })

  it('toggles password visibility', async () => {
    const { findByLabelText } = await render(<LoginScreen />)
    const toggle = await findByLabelText('Mostrar senha')
    expect(toggle).toBeTruthy()
    fireEvent.press(toggle)
    expect(await findByLabelText('Ocultar senha')).toBeTruthy()
    fireEvent.press(await findByLabelText('Ocultar senha'))
    expect(await findByLabelText('Mostrar senha')).toBeTruthy()
  })
})
