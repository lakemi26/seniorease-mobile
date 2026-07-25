import { render, fireEvent, waitFor } from '@testing-library/react-native'

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

describe('CadastroScreen submit', () => {
  it('calls signUp on valid submit', async () => {
    mockSignUp.mockResolvedValueOnce(undefined)
    const { getByText, findByPlaceholderText, findByLabelText } = await render(<CadastroScreen />)
    fireEvent.changeText(await findByPlaceholderText('Digite seu nome'), 'Maria')
    fireEvent.changeText(await findByPlaceholderText('Digite seu e-mail'), 'maria@email.com')
    fireEvent.changeText(await findByPlaceholderText('Crie uma senha'), 'Senha123')
    fireEvent.changeText(await findByPlaceholderText('Repita a senha'), 'Senha123')
    fireEvent.press(await findByLabelText('Aceito os termos de uso e a política de privacidade'))
    fireEvent.press(getByText('Criar minha conta'))
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('maria@email.com', 'Senha123', 'Maria')
    })
  })
})
