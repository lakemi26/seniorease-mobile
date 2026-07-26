import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/modules/authentication/domain/entities'

let mockApplyDraft: jest.Mock
let mockClearDraft: jest.Mock
let mockSaveDraftAndClear: jest.Mock
let mockPrefs: any = {}

jest.mock('@/contexts/theme-context', () => ({
  useTheme: () => ({
    colors: {
      primary: '#2F7F7A', primaryDark: '#215F5B', primarySoft: '#D9ECE9',
      background: '#F7F4EE', surface: '#FFFFFF', surfaceMuted: '#EFEDE7',
      text: '#202927', textMuted: '#65716E', border: '#CDD7D3',
      danger: '#B85252', dangerLight: '#F5E0E0', success: '#3C7A57',
      successLight: '#E0F0E5', overlay: 'rgba(32, 41, 39, 0.5)',
      disabled: '#9CA3AF', disabledBackground: '#E5E7EB', focus: '#176FC1',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40 },
    fontSize: { caption: 14, label: 15, body: 17, bodyLarge: 19, subtitle: 21, title: 27, display: 32 },
    lineHeight: { caption: 18, label: 20, body: 24, bodyLarge: 26, subtitle: 28, title: 34, display: 40 },
    radius: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },
    shadows: { sm: {}, md: {}, lg: {} },
    fontSizeMultiplier: 1,
    contrast: 'default' as const,
    fontSizePreference: 'normal' as const,
    spacingPreference: 'normal' as const,
    interfaceMode: 'complete' as const,
    reduceMotion: false,
    enhancedFeedback: true,
    confirmCriticalActions: true,
    remindersEnabled: true,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/contexts/preferences-context', () => ({
  usePreferences: () => mockPrefs,
  PreferencesProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/components/ui/app-button', () => ({
  AppButton: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.Pressable
        onPress={props.onPress}
        disabled={props.disabled || props.loading}
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel ?? props.title}
        accessibilityHint={props.accessibilityHint}
        accessibilityState={{ disabled: props.disabled || props.loading, busy: props.loading }}
        testID={`button-${props.title?.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {props.loading ? <RN.ActivityIndicator /> : <RN.Text>{props.title}</RN.Text>}
      </RN.Pressable>
    )
  },
}))

jest.mock('@/components/ui/error-message', () => ({
  ErrorMessage: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.View accessibilityRole="alert" accessibilityLabel={props.message} testID="error-message">
        <RN.Text>{props.message}</RN.Text>
        {props.onRetry ? (
          <RN.Pressable onPress={props.onRetry} testID="error-retry">
            <RN.Text>Tentar novamente</RN.Text>
          </RN.Pressable>
        ) : null}
      </RN.View>
    )
  },
}))

jest.mock('@/components/onboarding/selection-card', () => ({
  SelectionCard: (props: any) => {
    const RN = require('react-native')
    const label = props.label?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') ?? ''
    return (
      <RN.Pressable
        onPress={props.onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected: props.selected }}
        accessibilityLabel={`${props.label}. ${props.description}`}
        accessibilityHint={props.accessibilityHint}
        testID={`card-${label}`}
        data-selected={props.selected}
      >
        <RN.Text>{props.label}</RN.Text>
      </RN.Pressable>
    )
  },
}))

jest.mock('@/components/onboarding/setting-switch-row', () => ({
  SettingSwitchRow: (props: any) => {
    const RN = require('react-native')
    const label = props.label?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') ?? ''
    return (
      <RN.View
        accessibilityRole="switch"
        accessibilityState={{ checked: props.value }}
        accessibilityLabel={`${props.label}. ${props.description}`}
        accessibilityHint={props.accessibilityHint}
        testID={`switch-${label}`}
      >
        <RN.Text>{props.label}</RN.Text>
        <RN.Switch value={props.value} onValueChange={props.onValueChange} />
      </RN.View>
    )
  },
}))

jest.mock('@/screens/settings/settings-action-footer', () => ({
  SettingsActionFooter: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.View testID="settings-footer" data-has-changes={props.hasUnsavedChanges} data-saving={props.saving}>
        <RN.Pressable
          onPress={props.onSave}
          disabled={!props.hasUnsavedChanges || props.saving}
          testID="button-salvar-alteracoes"
        >
          <RN.Text>Salvar alteracoes</RN.Text>
        </RN.Pressable>
        <RN.Pressable
          onPress={props.onDiscard}
          disabled={!props.hasUnsavedChanges || props.saving}
          testID="button-descartar"
        >
          <RN.Text>Descartar</RN.Text>
        </RN.Pressable>
      </RN.View>
    )
  },
}))

jest.mock('@/screens/settings/unsaved-changes-dialog', () => ({
  UnsavedChangesDialog: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.Modal visible={props.visible} transparent>
        <RN.View accessibilityRole="alert" testID="unsaved-dialog">
          <RN.Text>Descartar alteracoes?</RN.Text>
          <RN.Pressable onPress={props.onContinueEditing} testID="dialog-continue">
            <RN.Text>Continuar editando</RN.Text>
          </RN.Pressable>
          <RN.Pressable onPress={props.onDiscard} testID="dialog-discard">
            <RN.Text>Descartar alteracoes</RN.Text>
          </RN.Pressable>
        </RN.View>
      </RN.Modal>
    )
  },
}))

jest.mock('@/screens/settings/restore-dialog', () => ({
  RestoreDialog: (props: any) => {
    const RN = require('react-native')
    return (
      <RN.Modal visible={props.visible} transparent>
        <RN.View accessibilityRole="alert" testID="restore-dialog">
          <RN.Text>Restaurar configuracoes?</RN.Text>
          <RN.Pressable onPress={props.onRestore} testID="dialog-restore">
            <RN.Text>Restaurar</RN.Text>
          </RN.Pressable>
          <RN.Pressable onPress={props.onCancel} testID="dialog-cancel">
            <RN.Text>Cancelar</RN.Text>
          </RN.Pressable>
        </RN.View>
      </RN.Modal>
    )
  },
}))

import ConfiguracoesScreen from '@/app/(private)/configuracoes'

function makePrefs(overrides?: Partial<{
  preferences: UserPreferences
  effectivePreferences: UserPreferences
  isLoading: boolean
  isPreviewing: boolean
  updatePreferences: jest.Mock
  applyDraft: jest.Mock
  clearDraft: jest.Mock
  saveDraftAndClear: jest.Mock
}>) {
  return {
    preferences: DEFAULT_USER_PREFERENCES,
    effectivePreferences: DEFAULT_USER_PREFERENCES,
    isLoading: false,
    isPreviewing: false,
    updatePreferences: jest.fn(),
    applyDraft: mockApplyDraft,
    clearDraft: mockClearDraft,
    saveDraftAndClear: mockSaveDraftAndClear,
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockApplyDraft = jest.fn()
  mockClearDraft = jest.fn()
  mockSaveDraftAndClear = jest.fn().mockResolvedValue(undefined)
  mockPrefs = makePrefs()
})

describe('ConfiguracoesScreen', () => {
  it('renders loading state', async () => {
    mockPrefs = makePrefs({ isLoading: true })
    const { getByText } = await render(<ConfiguracoesScreen />)
    expect(getByText('Carregando configurações...')).toBeTruthy()
  })

  it('renders with preferences from provider', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByText } = await render(<ConfiguracoesScreen />)
    expect(getByText('Configurações')).toBeTruthy()
    expect(getByText('Aparência')).toBeTruthy()
    expect(getByText('Quantidade de informações')).toBeTruthy()
    expect(getByText('Segurança e feedback')).toBeTruthy()
    expect(getByText('Lembretes')).toBeTruthy()
    expect(getByText('Restaurar configurações')).toBeTruthy()
  })

  it('initializes draft on mount when not previewing', async () => {
    await render(<ConfiguracoesScreen />)
    await waitFor(() => {
      expect(mockApplyDraft).toHaveBeenCalledWith(DEFAULT_USER_PREFERENCES)
    })
  })
})

describe('hasUnsavedChanges', () => {
  it('detects changes when draft differs from preferences', async () => {
    mockPrefs = makePrefs({
      isPreviewing: true,
      effectivePreferences: { ...DEFAULT_USER_PREFERENCES, fontSize: 'large' },
    })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    expect(getByTestId('settings-footer').props['data-has-changes']).toBe(true)
  })

  it('no changes when draft equals preferences', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    expect(getByTestId('settings-footer').props['data-has-changes']).toBe(false)
  })

  it('no changes when not in preview mode', async () => {
    mockPrefs = makePrefs({ isPreviewing: false })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    expect(getByTestId('settings-footer').props['data-has-changes']).toBe(false)
  })
})

describe('font size selection', () => {
  it('selects normal font size', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getAllByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getAllByTestId('card-normal')[0])
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, fontSize: 'normal' })
  })

  it('selects large font size', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('card-grande'))
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, fontSize: 'large' })
  })

  it('selects extraLarge font size', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('card-extra-grande'))
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, fontSize: 'extraLarge' })
  })
})

describe('contrast selection', () => {
  it('selects default contrast', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('card-padrao'))
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, contrast: 'default' })
  })

  it('selects high contrast', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('card-alto-contraste'))
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, contrast: 'high' })
  })

  it('selects dark contrast', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('card-escuro'))
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, contrast: 'dark' })
  })
})

describe('spacing selection', () => {
  it('selects expanded spacing', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('card-ampliado'))
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, spacing: 'expanded' })
  })
})

describe('interface mode selection', () => {
  it('selects basic mode', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('card-basico'))
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, interfaceMode: 'basic' })
  })

  it('selects complete mode', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('card-completo'))
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, interfaceMode: 'complete' })
  })
})

describe('switch toggles', () => {
  it('toggles enhancedFeedback', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent(getByTestId('switch-feedback-aprimorado'), 'onValueChange', false)
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, enhancedFeedback: false })
  })

  it('toggles confirmCriticalActions', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent(getByTestId('switch-confirmar-acoes-criticas'), 'onValueChange', false)
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, confirmCriticalActions: false })
  })

  it('toggles reduceMotion', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent(getByTestId('switch-reduzir-movimento'), 'onValueChange', true)
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, reduceMotion: true })
  })

  it('toggles remindersEnabled', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent(getByTestId('switch-lembretes-ativos'), 'onValueChange', false)
    expect(mockApplyDraft).toHaveBeenCalledWith({ ...DEFAULT_USER_PREFERENCES, remindersEnabled: false })
  })
})

describe('save and discard', () => {
  it('calls saveDraftAndClear on save', async () => {
    mockPrefs = makePrefs({
      isPreviewing: true,
      effectivePreferences: { ...DEFAULT_USER_PREFERENCES, fontSize: 'large' },
    })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('button-salvar-alteracoes'))
    expect(mockSaveDraftAndClear).toHaveBeenCalled()
  })

  it('shows error on save failure', async () => {
    mockSaveDraftAndClear = jest.fn().mockRejectedValue(new Error('Falha'))
    mockPrefs = makePrefs({
      isPreviewing: true,
      effectivePreferences: { ...DEFAULT_USER_PREFERENCES, fontSize: 'large' },
      saveDraftAndClear: mockSaveDraftAndClear,
    })
    const { getByTestId, findByText } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('button-salvar-alteracoes'))
    expect(await findByText('Não foi possível salvar suas configurações. Verifique sua conexão e tente novamente.')).toBeTruthy()
  })

  it('calls clearDraft on discard', async () => {
    mockPrefs = makePrefs({
      isPreviewing: true,
      effectivePreferences: { ...DEFAULT_USER_PREFERENCES, fontSize: 'large' },
    })
    const { getByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('button-descartar'))
    expect(mockClearDraft).toHaveBeenCalled()
  })
})

describe('restore', () => {
  it('opens restore dialog and applies defaults', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId, findByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('button-restaurar-preferências-padrão'))
    fireEvent.press(await findByTestId('dialog-restore'))
    expect(mockApplyDraft).toHaveBeenCalledWith(DEFAULT_USER_PREFERENCES)
  })

  it('cancels restore dialog', async () => {
    mockPrefs = makePrefs({ isPreviewing: true })
    const { getByTestId, findByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('button-restaurar-preferências-padrão'))
    fireEvent.press(await findByTestId('dialog-cancel'))
    expect(mockApplyDraft).not.toHaveBeenCalledWith(DEFAULT_USER_PREFERENCES)
  })
})

describe('unsaved changes dialog', () => {
  it('shows dialog when back is pressed with changes', async () => {
    mockPrefs = makePrefs({
      isPreviewing: true,
      effectivePreferences: { ...DEFAULT_USER_PREFERENCES, fontSize: 'large' },
    })
    const { getByTestId, findByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('button-voltar'))
    expect(await findByTestId('unsaved-dialog')).toBeTruthy()
  })

  it('discard in dialog calls clearDraft', async () => {
    mockPrefs = makePrefs({
      isPreviewing: true,
      effectivePreferences: { ...DEFAULT_USER_PREFERENCES, fontSize: 'large' },
    })
    const { getByTestId, findByTestId } = await render(<ConfiguracoesScreen />)
    fireEvent.press(getByTestId('button-voltar'))
    fireEvent.press(await findByTestId('dialog-discard'))
    expect(mockClearDraft).toHaveBeenCalled()
  })
})
