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

describe('CadastroScreen validation', () => {
  it('shows validation errors on empty submit', async () => {
    const { getByText, findByText } = await render(<CadastroScreen />)
    fireEvent.press(getByText('Criar minha conta'))
    expect(await findByText('O nome é obrigatório.')).toBeTruthy()
  })

  it('validates email format', async () => {
    const { getByText, findByPlaceholderText, findByText } = await render(<CadastroScreen />)
    fireEvent.changeText(await findByPlaceholderText('Digite seu nome'), 'Teste')
    fireEvent.changeText(await findByPlaceholderText('Digite seu e-mail'), 'invalido')
    fireEvent.changeText(await findByPlaceholderText('Crie uma senha'), 'Senha123')
    fireEvent.changeText(await findByPlaceholderText('Repita a senha'), 'Senha123')

    fireEvent.press(getByText('Criar minha conta'))
    expect(await findByText('Digite um endereço de e-mail válido.')).toBeTruthy()
  })
})
