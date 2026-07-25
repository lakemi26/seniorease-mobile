import { render, fireEvent } from '@testing-library/react-native'

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockSignUp = jest.fn()
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

import CadastroScreen from '@/app/(public)/cadastro'

function mockAuth(overrides = {}) {
  mockFn.mockReturnValue({
    user: null,
    profile: null,
    isLoading: false,
    authError: null,
    signIn: jest.fn(),
    signUp: mockSignUp,
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

describe('CadastroScreen', () => {
  it('renders title and subtitle', async () => {
    const { getByText } = await render(<CadastroScreen />)
    expect(getByText('Crie sua conta')).toBeTruthy()
    expect(getByText('Crie sua conta para organizar suas atividades de um jeito mais claro e confortável.')).toBeTruthy()
  })

  it('renders all required fields', async () => {
    const { getByText } = await render(<CadastroScreen />)
    expect(getByText('Nome completo')).toBeTruthy()
    expect(getByText('E-mail')).toBeTruthy()
    expect(getByText('Senha')).toBeTruthy()
    expect(getByText('Confirmar senha')).toBeTruthy()
  })

  it('renders password requirements', async () => {
    const { getByText } = await render(<CadastroScreen />)
    expect(getByText('Pelo menos 8 caracteres')).toBeTruthy()
    expect(getByText('Pelo menos uma letra')).toBeTruthy()
    expect(getByText('Pelo menos um número')).toBeTruthy()
  })

  it('toggles password visibility', async () => {
    const { findAllByLabelText } = await render(<CadastroScreen />)
    const showButtons = await findAllByLabelText('Mostrar senha')
    expect(showButtons.length).toBe(2)
    fireEvent.press(showButtons[0])
    const hideButtons = await findAllByLabelText('Ocultar senha')
    expect(hideButtons.length).toBe(1)
  })

  it('toggles terms checkbox', async () => {
    const { findByLabelText } = await render(<CadastroScreen />)
    expect((await findByLabelText('Aceito os termos de uso e a política de privacidade')).props.accessibilityState.checked).toBe(false)
    fireEvent.press(await findByLabelText('Aceito os termos de uso e a política de privacidade'))
    expect((await findByLabelText('Aceito os termos de uso e a política de privacidade')).props.accessibilityState.checked).toBe(true)
    fireEvent.press(await findByLabelText('Aceito os termos de uso e a política de privacidade'))
    expect((await findByLabelText('Aceito os termos de uso e a política de privacidade')).props.accessibilityState.checked).toBe(false)
  })
})
