let mockUseAuth: jest.Mock
let listenerCallback: ((data: any) => void) | null = null
let listenerUnsub: () => void

const mockCreateRepo = jest.fn()

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('@/modules/authentication/infrastructure/firebase-auth.repository', () => ({
  createFirebaseAuthRepository: () => mockCreateRepo(),
}))

import type { UserPreferences } from '@/modules/authentication/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/modules/authentication/domain/entities'
import { cleanup, waitFor } from '@testing-library/react-native/pure'
import { render } from '@testing-library/react-native/pure'
import React from 'react'
import { PreferencesProvider, usePreferences } from '@/contexts/preferences-context'

let savedPrefs: UserPreferences = DEFAULT_USER_PREFERENCES
let savedIsPreviewing = false
let savedIsLoading = true
let savedEffective: UserPreferences = DEFAULT_USER_PREFERENCES
let savedApplyDraft: ((draft: UserPreferences) => void) | null = null
let savedClearDraft: (() => void) | null = null

function TestConsumer() {
  const ctx = usePreferences()
  savedPrefs = ctx.preferences
  savedIsPreviewing = ctx.isPreviewing
  savedIsLoading = ctx.isLoading
  savedEffective = ctx.effectivePreferences
  savedApplyDraft = ctx.applyDraft
  savedClearDraft = ctx.clearDraft
  return null
}

async function renderApp() {
  await React.act(async () => {
    await render(<PreferencesProvider><TestConsumer /></PreferencesProvider>)
  })
}

beforeEach(() => {
  mockUseAuth = jest.fn()
  mockUseAuth.mockReturnValue({ user: null, isLoading: false })
  listenerCallback = null
  listenerUnsub = jest.fn()
  mockCreateRepo.mockReturnValue({
    getUserPreferences: jest.fn().mockResolvedValue(null),
    saveUserPreferences: jest.fn().mockResolvedValue(undefined),
    subscribeToUserPreferences: jest.fn((_uid: string, onData: any, _onError: any) => {
      listenerCallback = onData
      return listenerUnsub
    }),
  })
})

afterEach(async () => {
  await cleanup()
})

describe('PreferencesContext', () => {
  it('provides defaults when user is null', async () => {
    await renderApp()
    expect(savedPrefs).toEqual(DEFAULT_USER_PREFERENCES)
    expect(savedIsLoading).toBe(false)
  })

  it('loads and merges preferences from Firestore listener', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, isLoading: false })
    await renderApp()

    listenerCallback?.({ fontSize: 'large', contrast: 'dark' })

    await waitFor(() => {
      expect(savedPrefs.fontSize).toBe('large')
    })
    expect(savedPrefs.contrast).toBe('dark')
    expect(savedPrefs.spacing).toBe('normal')
    expect(savedPrefs.enhancedFeedback).toBe(true)
  })

  it('uses defaults when document does not exist', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, isLoading: false })
    await renderApp()

    listenerCallback?.(null)

    expect(savedPrefs).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('preview mode applies draft and clears', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, isLoading: false })
    await renderApp()

    listenerCallback?.(DEFAULT_USER_PREFERENCES)

    const draft: UserPreferences = { ...DEFAULT_USER_PREFERENCES, contrast: 'high' }

    savedApplyDraft?.(draft)

    await waitFor(() => {
      expect(savedIsPreviewing).toBe(true)
    })
    expect(savedEffective.contrast).toBe('high')

    savedClearDraft?.()

    await waitFor(() => {
      expect(savedIsPreviewing).toBe(false)
    })
    expect(savedEffective.contrast).toBe('default')
  })

  it('cleans up listener on unmount', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, isLoading: false })
    await renderApp()
    await cleanup()
    expect(listenerUnsub).toHaveBeenCalled()
  })
})
