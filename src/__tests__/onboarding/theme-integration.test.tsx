jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((_auth: any, cb: any) => { cb(null); return jest.fn() }),
  getAuth: jest.fn(() => ({})),
}))

jest.mock('@/infrastructure/firebase/firebase.auth', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}))

jest.mock('@/infrastructure/firebase/firebase.firestore', () => ({
  getFirebaseFirestore: jest.fn(() => ({})),
}))

jest.mock('@/modules/authentication/infrastructure/firebase-auth.repository', () => ({
  createFirebaseAuthRepository: jest.fn(() => ({
    getUserPreferences: jest.fn(async () => null),
    saveUserPreferences: jest.fn(),
    subscribeToUserPreferences: jest.fn(() => jest.fn()),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    sendPasswordReset: jest.fn(),
    getCurrentUser: jest.fn(() => null),
    onAuthStateChanged: jest.fn((_cb: any) => { _cb(null); return jest.fn() }),
    getUserProfile: jest.fn(() => Promise.resolve(null)),
    subscribeToUserProfile: jest.fn(() => jest.fn()),
    createUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    updateUserName: jest.fn(),
    resetUserPreferences: jest.fn(),
    deleteUserAccount: jest.fn(),
  })),
}))

jest.mock('@/modules/authentication/application/use-cases', () => ({
  createAuthUseCases: jest.fn((_repo: any) => ({
    signInUser: jest.fn(),
    signUpUser: jest.fn(),
    signOutUser: jest.fn(),
    sendPasswordReset: jest.fn(),
    getAuthenticatedUser: jest.fn(() => null),
    getUserProfile: jest.fn(() => Promise.resolve(null)),
    subscribeToUserProfile: jest.fn(() => jest.fn()),
    updateUserName: jest.fn(),
    createUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    getUserPreferences: jest.fn(async () => null),
    saveUserPreferences: jest.fn(),
    subscribeToUserPreferences: jest.fn(() => jest.fn()),
    resetUserPreferences: jest.fn(),
    deleteUserAccount: jest.fn(),
  })),
}))

import { buildTheme } from '@/contexts/theme-context'
import type { UserPreferences } from '@/modules/authentication/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/modules/authentication/domain/entities'

const defaultPrefs: UserPreferences = { ...DEFAULT_USER_PREFERENCES }

describe('buildTheme', () => {
  it('returns default theme with default preferences', () => {
    const theme = buildTheme(defaultPrefs)
    expect(theme.fontSizePreference).toBe('normal')
    expect(theme.contrast).toBe('default')
    expect(theme.spacingPreference).toBe('normal')
    expect(theme.interfaceMode).toBe('complete')
    expect(theme.reduceMotion).toBe(false)
    expect(theme.enhancedFeedback).toBe(true)
  })

  it('fontSize extraLarge scales font sizes', () => {
    const theme = buildTheme({ ...defaultPrefs, fontSize: 'extraLarge' })
    expect(theme.fontSizePreference).toBe('extraLarge')
    expect(theme.fontSize.body).toBeGreaterThan(17)
    expect(theme.fontSizeMultiplier).toBe(1.3)
  })

  it('fontSize large applies 1.15 multiplier', () => {
    const theme = buildTheme({ ...defaultPrefs, fontSize: 'large' })
    expect(theme.fontSizeMultiplier).toBe(1.15)
    expect(theme.fontSize.body).toBe(Math.round(17 * 1.15))
  })

  it('contrast high returns high contrast colors with light background', () => {
    const theme = buildTheme({ ...defaultPrefs, contrast: 'high' })
    expect(theme.contrast).toBe('high')
    expect(theme.colors.background).toBe('#FFFFFF')
    expect(theme.colors.text).toBe('#000000')
    expect(theme.colors.border).toBe('#000000')
    expect(theme.colors.primary).toBe('#006B68')
  })

  it('contrast dark returns dark background', () => {
    const theme = buildTheme({ ...defaultPrefs, contrast: 'dark' })
    expect(theme.contrast).toBe('dark')
    expect(theme.colors.background).toBe('#101817')
    expect(theme.colors.text).toBe('#F4F7F6')
    expect(theme.colors.border).toBe('#40514D')
  })

  it('spacing expanded increases spacing values', () => {
    const theme = buildTheme({ ...defaultPrefs, spacing: 'expanded' })
    expect(theme.spacingPreference).toBe('expanded')
    expect(theme.spacing.md).toBe(16)
    expect(theme.spacing.xl).toBe(30)
  })

  it('all boolean preferences are reflected', () => {
    const theme = buildTheme({
      ...defaultPrefs,
      enhancedFeedback: false,
      confirmCriticalActions: false,
      reduceMotion: true,
      remindersEnabled: false,
    })
    expect(theme.enhancedFeedback).toBe(false)
    expect(theme.confirmCriticalActions).toBe(false)
    expect(theme.reduceMotion).toBe(true)
    expect(theme.remindersEnabled).toBe(false)
  })

  it('interfaceMode basic is set', () => {
    const theme = buildTheme({ ...defaultPrefs, interfaceMode: 'basic' })
    expect(theme.interfaceMode).toBe('basic')
  })
})
