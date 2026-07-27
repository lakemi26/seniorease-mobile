import { renderHook, act } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import type { Activity } from '@/modules/activities/domain/entities'

const mockFn = jest.fn()
const mockUsePreferences = jest.fn()
const mockCreateActivity = jest.fn()
const mockUpdateActivity = jest.fn()

jest.mock('@/contexts/auth-context', () => ({
  get useAuth() { return () => mockFn() },
  AuthProvider: ({ children }: any) => children,
}))

jest.mock('@/contexts/preferences-context', () => ({
  get usePreferences() { return () => mockUsePreferences() },
}))

jest.mock('@/modules/activities/application/use-cases', () => ({
  createActivityUseCases: () => ({
    getActivity: jest.fn(),
    deleteActivity: jest.fn(),
    get createActivity() { return mockCreateActivity },
    get updateActivity() { return mockUpdateActivity },
    subscribeByUser: jest.fn(),
  }),
}))

jest.mock('@/modules/activities/infrastructure/repositories/firebase-activity.repository', () => ({
  createFirebaseActivityRepository: () => ({}),
}))

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}))

import { useActivityForm } from '@/screens/activities/hook/use-activity-form'

function makeActivity(id: string, overrides: Partial<Activity> = {}): Activity {
  return {
    id,
    userId: 'user-1',
    title: 'Atividade existente',
    description: null,
    category: 'health',
    scheduledAt: new Date(Date.now() + 86400000),
    hasTime: false,
    priority: 'medium',
    status: 'pending',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function mockAuth(overrides = {}) {
  mockFn.mockReturnValue({
    user: { uid: 'test-uid' },
    ...overrides,
  })
}

function mockPreferences(overrides = {}) {
  mockUsePreferences.mockReturnValue({
    preferences: { remindersEnabled: true, ...overrides },
  })
}

describe('useActivityForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFn.mockReset()
    mockUsePreferences.mockReset()
    mockCreateActivity.mockReset()
    mockUpdateActivity.mockReset()
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
    ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, status: 'granted' })
    ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, status: 'granted' })
    ;(Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('native-1')
    mockAuth()
    mockPreferences()
  })

  it('returns form control and default values', async () => {
    const { result } = await renderHook(() => useActivityForm())
    expect(result.current.control).toBeDefined()
    expect(result.current.isEditing).toBe(false)
    expect(result.current.isSaving).toBe(false)
    expect(result.current.saveError).toBeNull()
    expect(result.current.showPastDateDialog).toBe(false)
  })

  it('returns editing mode when existing activity provided', async () => {
    const activity = makeActivity('act-1')
    const { result } = await renderHook(() => useActivityForm(activity))
    expect(result.current.isEditing).toBe(true)
  })

  it('save returns null when user is not authenticated', async () => {
    mockFn.mockReturnValue({ user: null })
    const { result } = await renderHook(() => useActivityForm())

    const data = {
      title: 'Nova atividade',
      description: '',
      category: 'health' as const,
      date: '2025-12-01',
      hasTime: false,
      time: '',
      priority: 'medium' as const,
      steps: [],
      reminderOption: 'none' as const,
      reminderDate: '',
      reminderTime: '',
      confirmPastDate: false,
    }

    let saved: any
    await act(async () => { saved = await result.current.save(data) })
    expect(saved).toBeNull()
    expect(result.current.saveError).toBe('Usuário não autenticado.')
  })

  it('calls createActivity on save for new activity', async () => {
    const newActivity = makeActivity('new-1')
    mockCreateActivity.mockResolvedValue(newActivity)

    const { result } = await renderHook(() => useActivityForm())

    const data = {
      title: 'Nova atividade',
      description: '',
      category: 'health' as const,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      hasTime: false,
      time: '',
      priority: 'medium' as const,
      steps: [],
      reminderOption: 'none' as const,
      reminderDate: '',
      reminderTime: '',
      confirmPastDate: false,
    }

    let saved: any
    await act(async () => { saved = await result.current.save(data) })
    expect(saved).toEqual(newActivity)
    expect(mockCreateActivity).toHaveBeenCalledTimes(1)
  })

  it('calls updateActivity on save for existing activity', async () => {
    const existing = makeActivity('act-1')
    const updated = { ...existing, title: 'Título atualizado' }
    mockUpdateActivity.mockResolvedValue(updated)

    const { result } = await renderHook(() => useActivityForm(existing))

    const data = {
      title: 'Título atualizado',
      description: '',
      category: 'health' as const,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      hasTime: false,
      time: '',
      priority: 'medium' as const,
      steps: [],
      reminderOption: 'none' as const,
      reminderDate: '',
      reminderTime: '',
      confirmPastDate: false,
    }

    await act(async () => { await result.current.save(data) })
    expect(mockUpdateActivity).toHaveBeenCalledWith('act-1', expect.anything())
  })

  it('schedules local notification after creating an activity with reminder', async () => {
    mockCreateActivity.mockResolvedValue(makeActivity('new-1', {
      hasTime: true,
      scheduledAt: new Date(Date.now() + 86400000),
      reminder: { enabled: true, remindAt: new Date(Date.now() + 3600000), readAt: null, dismissedAt: null },
    }))
    const { result } = await renderHook(() => useActivityForm())

    await act(async () => {
      await result.current.save({
        title: 'Nova atividade',
        description: '',
        category: 'health' as const,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        hasTime: true,
        time: '14:00',
        priority: 'medium' as const,
        steps: [],
        reminderOption: 'atTime' as const,
        reminderDate: '',
        reminderTime: '',
        confirmPastDate: false,
      })
    })

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled()
  })

  it('shows contextual permission dialog when a reminder is activated with undetermined permission', async () => {
    ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, status: 'undetermined' })
    const { result } = await renderHook(() => useActivityForm())

    await act(async () => { await result.current.handleReminderOptionChange('atTime') })

    expect(result.current.showNotificationPermissionDialog).toBe(true)
  })

  it('requests notification permission from the dialog', async () => {
    const { result } = await renderHook(() => useActivityForm())

    await act(async () => { await result.current.requestNotificationPermission() })

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled()
    expect(result.current.showNotificationPermissionDialog).toBe(false)
  })

  it('does not request permission when remindersEnabled is false', async () => {
    mockPreferences({ remindersEnabled: false })
    const { result } = await renderHook(() => useActivityForm())

    await act(async () => { await result.current.handleReminderOptionChange('atTime') })

    expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled()
    expect(result.current.notificationMessage).toContain('desativados')
  })

  it('shows past date dialog when date is in the past', async () => {
    const { result } = await renderHook(() => useActivityForm())

    const data = {
      title: 'Atividade passada',
      description: '',
      category: 'health' as const,
      date: '2020-01-01',
      hasTime: false,
      time: '',
      priority: 'medium' as const,
      steps: [],
      reminderOption: 'none' as const,
      reminderDate: '',
      reminderTime: '',
      confirmPastDate: false,
    }

    let saved: any
    await act(async () => { saved = await result.current.save(data) })
    expect(saved).toBeNull()
    expect(result.current.showPastDateDialog).toBe(true)
  })

  it('dismissPastDateDialog hides the dialog', async () => {
    const { result } = await renderHook(() => useActivityForm())

    await act(async () => { result.current.dismissPastDateDialog() })
    expect(result.current.showPastDateDialog).toBe(false)
  })

  it('sets saveError when save fails', async () => {
    mockCreateActivity.mockRejectedValue(new Error('Firebase error'))

    const { result } = await renderHook(() => useActivityForm())

    const data = {
      title: 'Nova atividade',
      description: '',
      category: 'health' as const,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      hasTime: false,
      time: '',
      priority: 'medium' as const,
      steps: [],
      reminderOption: 'none' as const,
      reminderDate: '',
      reminderTime: '',
      confirmPastDate: false,
    }

    await act(async () => { await result.current.save(data) })
    expect(result.current.saveError).toBeTruthy()
    expect(result.current.isSaving).toBe(false)
  })
})
