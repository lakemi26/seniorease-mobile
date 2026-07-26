import { render, fireEvent, waitFor, cleanup, act } from '@testing-library/react-native'

type PressableElement = Parameters<typeof fireEvent.press>[0]

const mockPush = jest.fn()
const mockSignOut = jest.fn()
const mockSendPasswordReset = jest.fn()
const mockRefreshProfile = jest.fn()
const mockUpdateUserName = jest.fn()
const mockFn = jest.fn()

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockFn(),
  AuthProvider: ({ children }: any) => children,
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
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

let mockPrefs: any

jest.mock('@/contexts/preferences-context', () => ({
  usePreferences: () => mockPrefs,
  PreferencesProvider: ({ children }: any) => children,
}))

jest.mock('@/modules/authentication/application/use-cases', () => ({
  createAuthUseCases: () => ({
    updateUserName: mockUpdateUserName,
  }),
}))

jest.mock('@/modules/authentication/infrastructure/firebase-auth.repository', () => ({
  createFirebaseAuthRepository: () => ({}),
}))

jest.mock('@/screens/profile/user-avatar', () => ({
  UserAvatar: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.View testID="user-avatar" accessibilityLabel={props.accessibilityLabel}>
        <RN.Text>{props.name}</RN.Text>
      </RN.View>
    )
  },
}))

jest.mock('@/screens/profile/profile-section', () => ({
  ProfileSection: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.View testID={'section-' + props.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}>
        <RN.Text>{props.title}</RN.Text>
        {props.children}
      </RN.View>
    )
  },
}))

jest.mock('@/screens/profile/profile-action-row', () => ({
  ProfileActionRow: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.Pressable
        testID={'action-' + props.label.toLowerCase().replace(/\s+/g, '-')}
        onPress={props.onPress}
      >
        <RN.Text>{props.label}</RN.Text>
        {props.value ? <RN.Text>{props.value}</RN.Text> : null}
      </RN.Pressable>
    )
  },
}))

jest.mock('@/screens/profile/preferences-summary', () => ({
  PreferencesSummary: () => {
    const RN = require('react-native')
    return <RN.View testID="preferences-summary" />
  },
}))

jest.mock('@/screens/profile/confirmation-dialog', () => ({
  ConfirmationDialog: (props: any) => {
    const RN = require('react-native')
    if (!props.visible) return null
    return (
      <RN.View testID={'dialog-' + props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}>
        <RN.Text>{props.title}</RN.Text>
        <RN.Pressable testID="dialog-confirm" onPress={props.onConfirm}>
          <RN.Text>{props.confirmLabel}</RN.Text>
        </RN.Pressable>
        <RN.Pressable testID="dialog-cancel" onPress={props.onCancel}>
          <RN.Text>{props.cancelLabel}</RN.Text>
        </RN.Pressable>
      </RN.View>
    )
  },
}))

jest.mock('@/components/ui/app-button', () => ({
  AppButton: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.Pressable
        testID={'button-' + props.title.toLowerCase().replace(/\s+/g, '-')}
        onPress={props.onPress}
        disabled={props.disabled}
        accessibilityLabel={props.accessibilityLabel}
      >
        <RN.Text>{props.title}</RN.Text>
        {props.loading ? <RN.ActivityIndicator /> : null}
      </RN.Pressable>
    )
  },
}))

jest.mock('@/components/ui/error-message', () => ({
  ErrorMessage: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.View testID="error-message">
        <RN.Text>{props.message}</RN.Text>
      </RN.View>
    )
  },
}))

jest.mock('@/components/ui/loading-screen', () => ({
  LoadingScreen: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.View testID="loading-screen">
        <RN.Text>{props.message}</RN.Text>
      </RN.View>
    )
  },
}))

import PerfilScreen from '@/app/(private)/(tabs)/perfil'

const defaultProfile = {
  id: 'uid-123',
  name: 'Larissa Akemi',
  email: 'larissa@email.com',
  firstAccessCompleted: true,
  onboardingStep: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function mockAuth(overrides = {}) {
  mockFn.mockReturnValue({
    user: { uid: 'uid-123', email: 'larissa@email.com' },
    profile: defaultProfile,
    isLoading: false,
    authError: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: mockSignOut,
    sendPasswordReset: mockSendPasswordReset,
    clearError: jest.fn(),
    refreshProfile: mockRefreshProfile,
    ...overrides,
  })
}

async function pressAsync(element: PressableElement) {
  await act(async () => {
    fireEvent.press(element)
    await Promise.resolve()
    await Promise.resolve()
  })
}

beforeEach(() => {
  jest.useRealTimers()
  jest.clearAllMocks()
  mockUpdateUserName.mockReset()
  mockFn.mockReset()
  mockPrefs = {
    preferences: {
      fontSize: 'normal', contrast: 'default', spacing: 'normal',
      interfaceMode: 'complete', enhancedFeedback: true,
      confirmCriticalActions: true, reduceMotion: false,
      remindersEnabled: true, updatedAt: '',
    },
    effectivePreferences: {
      fontSize: 'normal', contrast: 'default', spacing: 'normal',
      interfaceMode: 'complete', enhancedFeedback: true,
      confirmCriticalActions: true, reduceMotion: false,
      remindersEnabled: true, updatedAt: '',
    },
    isLoading: false,
    isPreviewing: false,
    updatePreferences: jest.fn(),
    applyDraft: jest.fn(),
    saveDraftAndClear: jest.fn(),
    clearDraft: jest.fn(),
  }
  mockAuth()
})

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('PerfilScreen', () => {
  describe('loading', () => {
    it('shows loading screen while loading', async () => {
      mockAuth({ isLoading: true })
      const { getByTestId } = await render(<PerfilScreen />)
      expect(getByTestId('loading-screen')).toBeTruthy()
    })
  })

  describe('error state', () => {
    it('shows error when profile is null', async () => {
      mockAuth({ profile: null })
      const { findByText } = await render(<PerfilScreen />)
      expect(await findByText(/carregar seu perfil/)).toBeTruthy()
    })

    it('retry calls refreshProfile', async () => {
      mockAuth({ profile: null })
      const { getByLabelText } = await render(<PerfilScreen />)
      fireEvent.press(getByLabelText('Tentar carregar perfil novamente'))
      expect(mockRefreshProfile).toHaveBeenCalled()
    })
  })

  describe('content', () => {
    it('renders user name and email', async () => {
      const { getAllByText } = await render(<PerfilScreen />)
      expect(getAllByText('Larissa Akemi').length).toBeGreaterThanOrEqual(1)
      expect(getAllByText('larissa@email.com').length).toBeGreaterThanOrEqual(1)
    })

    it('renders all section titles', async () => {
      const { getByText } = await render(<PerfilScreen />)
      expect(getByText('Conta')).toBeTruthy()
      expect(getByText('Ajuda')).toBeTruthy()
    })

    it('renders edit button', async () => {
      const { getByText } = await render(<PerfilScreen />)
      expect(getByText('Editar perfil')).toBeTruthy()
    })
  })

  describe('fallback', () => {
    it('shows fallback name when profile name is empty', async () => {
      mockAuth({ profile: { ...defaultProfile, name: '' } })
      const { getAllByText } = await render(<PerfilScreen />)
      expect(getAllByText(/Usu[a\u00e1]rio SeniorEase/).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('editing', () => {
    it('opens edit mode on edit button press', async () => {
      const { findByText, getByText } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Editar perfil'))
      expect(await findByText('Salvar')).toBeTruthy()
      expect(await findByText('Cancelar')).toBeTruthy()
    })

    it('pre-fills name input with current name', async () => {
      const { getByText, findByDisplayValue } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Editar perfil'))
      expect(await findByDisplayValue('Larissa Akemi')).toBeTruthy()
    })

    it('save button disabled when name unchanged', async () => {
      const { getByText, findByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Editar perfil'))
      const btn = await findByTestId('button-salvar')
      expect(btn.props.accessibilityState.disabled).toBe(true)
    })

    it('save button enabled when name changes', async () => {
      const { getByText, findByDisplayValue, findByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Editar perfil'))
      fireEvent.changeText(await findByDisplayValue('Larissa Akemi'), 'Larissa S. Akemi')
      const btn = await findByTestId('button-salvar')
      expect(btn.props.accessibilityState.disabled).toBe(false)
    })

    it('calls updateUserName on save', async () => {
      mockUpdateUserName.mockResolvedValue(undefined)
      const { getByText, findByDisplayValue, findByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Editar perfil'))
      fireEvent.changeText(await findByDisplayValue('Larissa Akemi'), 'Larissa Silva')
      await pressAsync(await findByTestId('button-salvar'))
      await waitFor(() => {
        expect(mockUpdateUserName).toHaveBeenCalledWith('uid-123', 'Larissa Silva')
      })
    })

    it('shows success feedback after save', async () => {
      mockUpdateUserName.mockResolvedValue(undefined)
      const { getByText, findByDisplayValue, findByTestId, findByText } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Editar perfil'))
      fireEvent.changeText(await findByDisplayValue('Larissa Akemi'), 'Larissa Silva')
      await pressAsync(await findByTestId('button-salvar'))
      expect(await findByText('Perfil atualizado.')).toBeTruthy()
    })

    it('shows error on save failure', async () => {
      mockUpdateUserName.mockRejectedValue(new Error('fail'))
      const { getByText, findByDisplayValue, findByTestId, findByText } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Editar perfil'))
      fireEvent.changeText(await findByDisplayValue('Larissa Akemi'), 'Larissa Silva')
      await pressAsync(await findByTestId('button-salvar'))
      expect(await findByText(/N\u00e3o foi poss\u00edvel atualizar/)).toBeTruthy()
    })

    it('closes edit mode when cancel is pressed', async () => {
      const { getByText, findByTestId, queryByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Editar perfil'))
      fireEvent.press(await findByTestId('button-cancelar'))
      await waitFor(() => {
        expect(queryByTestId('button-salvar')).toBeNull()
      })
    })
  })

  describe('password reset', () => {
    it('shows password dialog', async () => {
      const { getByText, findByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Alterar senha'))
      expect(await findByTestId('dialog-alterar-senha')).toBeTruthy()
    })

    it('cancels password reset', async () => {
      const { getByText, findByTestId, queryByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Alterar senha'))
      fireEvent.press(await findByTestId('dialog-cancel'))
      await waitFor(() => {
        expect(queryByTestId('dialog-alterar-senha')).toBeNull()
      })
    })

    it('sends password reset on confirm', async () => {
      mockSendPasswordReset.mockResolvedValue(undefined)
      const { getByText, findByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Alterar senha'))
      await pressAsync(await findByTestId('dialog-confirm'))
      await waitFor(() => {
        expect(mockSendPasswordReset).toHaveBeenCalledWith('larissa@email.com')
      })
    })

    it('shows success after password reset', async () => {
      mockSendPasswordReset.mockResolvedValue(undefined)
      const { getByText, findByTestId, findByText } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Alterar senha'))
      await pressAsync(await findByTestId('dialog-confirm'))
      expect(await findByText(/instru\u00e7\u00f5es/)).toBeTruthy()
    })

    it('shows error on password reset failure', async () => {
      mockSendPasswordReset.mockRejectedValue(new Error('fail'))
      const { getByText, findByTestId, findByText } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Alterar senha'))
      await pressAsync(await findByTestId('dialog-confirm'))
      expect(await findByText(/N\u00e3o foi poss\u00edvel enviar/)).toBeTruthy()
    })
  })

  describe('logout', () => {
    it('shows logout dialog', async () => {
      const { getByText, findByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Sair da conta'))
      expect(await findByTestId('dialog-sair-da-conta')).toBeTruthy()
    })

    it('cancels logout', async () => {
      const { getByText, findByTestId, queryByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Sair da conta'))
      fireEvent.press(await findByTestId('dialog-cancel'))
      await waitFor(() => {
        expect(queryByTestId('dialog-sair-da-conta')).toBeNull()
      })
    })

    it('calls signOut on logout confirm', async () => {
      mockSignOut.mockResolvedValue(undefined)
      const { getByText, findByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Sair da conta'))
      await pressAsync(await findByTestId('dialog-confirm'))
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })
    })

    it('shows error on logout failure', async () => {
      mockSignOut.mockRejectedValue(new Error('fail'))
      const { getByText, findByTestId, findByText } = await render(<PerfilScreen />)
      fireEvent.press(getByText('Sair da conta'))
      await pressAsync(await findByTestId('dialog-confirm'))
      expect(await findByText(/N\u00e3o foi poss\u00edvel sair/)).toBeTruthy()
    })
  })

  describe('navigation', () => {
    it('navigates to ajuda on help press', async () => {
      const { getByTestId } = await render(<PerfilScreen />)
      fireEvent.press(getByTestId('action-central-de-ajuda'))
      expect(mockPush).toHaveBeenCalledWith('/ajuda')
    })
  })

  describe('accessibility', () => {
    it('edit button has accessibilityLabel', async () => {
      const { getByLabelText } = await render(<PerfilScreen />)
      expect(getByLabelText('Editar nome do perfil')).toBeTruthy()
    })
  })
})
