import { renderHook, waitFor, act } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import type { Activity } from '@/modules/activities/domain/entities'

const mockGetActivity = jest.fn()
const mockDeleteActivity = jest.fn()

jest.mock('@/modules/activities/application/use-cases', () => ({
  createActivityUseCases: () => ({
    get getActivity() { return mockGetActivity },
    get deleteActivity() { return mockDeleteActivity },
    createActivity: jest.fn(),
    updateActivity: jest.fn(),
    subscribeByUser: jest.fn(),
  }),
}))

jest.mock('@/modules/activities/infrastructure/repositories/firebase-activity.repository', () => ({
  createFirebaseActivityRepository: () => ({}),
}))

import { useActivityDetails } from '@/screens/activities/hook/use-activity-details'

function makeActivity(id: string): Activity {
  return {
    id,
    userId: 'user-1',
    title: 'Teste',
    description: null,
    category: 'health',
    scheduledAt: new Date(),
    hasTime: false,
    priority: 'medium',
    status: 'pending',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

describe('useActivityDetails', () => {
  beforeEach(() => {
    mockGetActivity.mockReset()
    mockDeleteActivity.mockReset()
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
    mockGetActivity.mockReturnValue(undefined)
    mockDeleteActivity.mockReturnValue(undefined)
  })

  it('returns loading state initially', async () => {
    mockGetActivity.mockReturnValue(new Promise(() => {}))
    const { result } = await renderHook(() => useActivityDetails('act-1'))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.activity).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('fetches and returns activity on mount', async () => {
    const activity = makeActivity('act-1')
    mockGetActivity.mockResolvedValue(activity)

    const { result } = await renderHook(() => useActivityDetails('act-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.activity).toEqual(activity)
    expect(result.current.error).toBeNull()
    expect(mockGetActivity).toHaveBeenCalledWith('act-1')
  })

  it('sets error when fetch fails', async () => {
    mockGetActivity.mockRejectedValue(new Error('Erro ao carregar atividade.'))

    const { result } = await renderHook(() => useActivityDetails('act-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.activity).toBeNull()
    expect(result.current.error).toBeTruthy()
  })

  it('sets error when id is undefined', async () => {
    const { result } = await renderHook(() => useActivityDetails(undefined))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.activity).toBeNull()
    expect(result.current.error).toBe('Atividade não encontrada.')
  })

  it('remove returns true on success', async () => {
    mockGetActivity.mockResolvedValue(makeActivity('act-1'))
    mockDeleteActivity.mockResolvedValue(undefined)
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
      'act-1': { identifier: 'native-1', remindAt: 'x', scheduledAt: 'y', title: 'z' },
    }))

    const { result } = await renderHook(() => useActivityDetails('act-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let removed: boolean | undefined
    await act(async () => {
      removed = await result.current.remove()
    })

    expect(removed).toBe(true)
    expect(mockDeleteActivity).toHaveBeenCalledWith('act-1')
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('native-1')
  })

  it('remove returns false on failure', async () => {
    mockGetActivity.mockResolvedValue(makeActivity('act-1'))
    mockDeleteActivity.mockRejectedValue(new Error('fail'))

    const { result } = await renderHook(() => useActivityDetails('act-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let removed: boolean | undefined
    await act(async () => {
      removed = await result.current.remove()
    })

    expect(removed).toBe(false)
  })
})
