import { render, fireEvent } from '@testing-library/react-native'

const mockPush = jest.fn()

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

jest.mock('@/screens/profile/profile-action-row', () => ({
  ProfileActionRow: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.View testID={'row-' + props.label.toLowerCase().replace(/\s+/g, '-')}>
        <RN.Text>{props.label}</RN.Text>
        {props.value ? <RN.Text testID="row-value">{props.value}</RN.Text> : null}
      </RN.View>
    )
  },
}))

jest.mock('@/components/ui/app-button', () => ({
  AppButton: (props: any) => {
    const RN = require('react-native')
    const tid = 'btn-' + props.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
    return (
      <RN.Pressable
        testID={tid}
        onPress={props.onPress}
      >
        <RN.Text>{props.title}</RN.Text>
      </RN.Pressable>
    )
  },
}))

import { PreferencesSummary } from '@/screens/profile/preferences-summary'

const makePrefs = (overrides = {}) => ({
  fontSize: 'normal',
  contrast: 'default',
  spacing: 'normal',
  interfaceMode: 'complete',
  enhancedFeedback: true,
  confirmCriticalActions: true,
  reduceMotion: false,
  remindersEnabled: true,
  updatedAt: '',
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  mockPrefs = {
    preferences: makePrefs(),
    effectivePreferences: makePrefs(),
    isLoading: false,
    isPreviewing: false,
    updatePreferences: jest.fn(),
    applyDraft: jest.fn(),
    saveDraftAndClear: jest.fn(),
    clearDraft: jest.fn(),
  }
})

describe('PreferencesSummary', () => {
  it('shows translated default values', async () => {
    const { getAllByText } = await render(<PreferencesSummary />)
    expect(getAllByText('Normal').length).toBe(2)
    expect(getAllByText(/Padr[ãa]o/).length).toBe(1)
    expect(getAllByText('Modo completo').length).toBe(1)
  })

  it('shows Grande for large font', async () => {
    mockPrefs.effectivePreferences = makePrefs({ fontSize: 'large' })
    const { getByText } = await render(<PreferencesSummary />)
    expect(getByText('Grande')).toBeTruthy()
  })

  it('shows Extra grande for extraLarge font', async () => {
    mockPrefs.effectivePreferences = makePrefs({ fontSize: 'extraLarge' })
    const { getByText } = await render(<PreferencesSummary />)
    expect(getByText('Extra grande')).toBeTruthy()
  })

  it('shows Alto contraste for high contrast', async () => {
    mockPrefs.effectivePreferences = makePrefs({ contrast: 'high' })
    const { getByText } = await render(<PreferencesSummary />)
    expect(getByText('Alto contraste')).toBeTruthy()
  })

  it('shows Escuro for dark contrast', async () => {
    mockPrefs.effectivePreferences = makePrefs({ contrast: 'dark' })
    const { getByText } = await render(<PreferencesSummary />)
    expect(getByText('Escuro')).toBeTruthy()
  })

  it('shows Ampliado for expanded spacing', async () => {
    mockPrefs.effectivePreferences = makePrefs({ spacing: 'expanded' })
    const { getByText } = await render(<PreferencesSummary />)
    expect(getByText('Ampliado')).toBeTruthy()
  })

  it('shows Modo basico for basic mode', async () => {
    mockPrefs.effectivePreferences = makePrefs({ interfaceMode: 'basic' })
    const { getByText } = await render(<PreferencesSummary />)
    expect(getByText(/Modo b[áa]sico/)).toBeTruthy()
  })

  it('shows extra details in complete mode', async () => {
    mockPrefs.effectivePreferences = makePrefs({ interfaceMode: 'complete' })
    const { getByText } = await render(<PreferencesSummary />)
    expect(getByText(/Feedback/)).toBeTruthy()
    expect(getByText(/Lembretes/)).toBeTruthy()
  })

  it('navigates to configuracoes', async () => {
    const { getByText } = await render(<PreferencesSummary />)
    fireEvent.press(getByText(/Abrir configura/))
    expect(mockPush).toHaveBeenCalledWith('/configuracoes')
  })

  it('returns null when loading', async () => {
    mockPrefs.isLoading = true
    const { queryByText } = await render(<PreferencesSummary />)
    expect(queryByText('Tamanho do texto')).toBeNull()
  })
})
